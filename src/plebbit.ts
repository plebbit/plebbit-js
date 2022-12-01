import {
    BlockchainProvider,
    CommentEditType,
    CommentIpfsType,
    CommentType,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreateSignerOptions,
    CreateSubplebbitOptions,
    CreateVoteOptions,
    NativeFunctions,
    PlebbitOptions,
    PostType,
    SubplebbitType,
    VoteType
} from "./types";
import { getDefaultDataPath, mkdir, nativeFunctions } from "./runtime/node/util";
import { Comment } from "./comment";
import Post from "./post";
import { Subplebbit } from "./subplebbit";
import { fetchCid, loadIpfsFileAsJson, loadIpnsAsJson, removeKeysWithUndefinedValues, timestamp } from "./util";
import Vote from "./vote";
import { createSigner, Signer, verifyComment, verifySubplebbit } from "./signer";
import { Resolver } from "./resolver";
import TinyCache from "tinycache";
import { CommentEdit } from "./comment-edit";
import { getPlebbitAddressFromPrivateKeyPem } from "./signer/util";
import EventEmitter from "events";
import isIPFS from "is-ipfs";
import errcode from "err-code";
import { codes, messages } from "./errors";
import Logger from "@plebbit/plebbit-logger";
import env from "./version";
import lodash from "lodash";
import { signComment, signCommentEdit, signVote } from "./signer/signatures";

export const pendingSubplebbitCreations: Record<string, boolean> = {};

export class Plebbit extends EventEmitter implements PlebbitOptions {
    ipfsClient?: ReturnType<NativeFunctions["createIpfsClient"]>;
    pubsubIpfsClient: Pick<ReturnType<NativeFunctions["createIpfsClient"]>, "pubsub">;
    resolver: Resolver;
    _memCache: TinyCache;
    ipfsGatewayUrl: string;
    ipfsHttpClientOptions?: Parameters<NativeFunctions["createIpfsClient"]>[0] | string;
    pubsubHttpClientOptions?: Parameters<NativeFunctions["createIpfsClient"]>[0] | string;
    dataPath?: string;
    blockchainProviders?: { [chainTicker: string]: BlockchainProvider };
    resolveAuthorAddresses?: boolean;

    constructor(options: PlebbitOptions = {}) {
        super();
        this.ipfsHttpClientOptions = options.ipfsHttpClientOptions; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        this.ipfsClient = this.ipfsHttpClientOptions
            ? nativeFunctions.createIpfsClient(<Parameters<NativeFunctions["createIpfsClient"]>[0]>this.ipfsHttpClientOptions)
            : undefined;
        this.pubsubHttpClientOptions = options.pubsubHttpClientOptions || { url: "https://pubsubprovider.xyz/api/v0" };
        this.pubsubIpfsClient = options.pubsubHttpClientOptions
            ? nativeFunctions.createIpfsClient(<Parameters<NativeFunctions["createIpfsClient"]>[0]>options.pubsubHttpClientOptions)
            : this.ipfsClient
            ? this.ipfsClient
            : nativeFunctions.createIpfsClient(<Parameters<NativeFunctions["createIpfsClient"]>[0]>this.pubsubHttpClientOptions);
        this.blockchainProviders = options.blockchainProviders || {
            avax: {
                url: "https://api.avax.network/ext/bc/C/rpc",
                chainId: 43114
            },
            matic: {
                url: "https://polygon-rpc.com",
                chainId: 137
            }
        };
        this.resolveAuthorAddresses = options.hasOwnProperty("resolveAuthorAddresses") ? options.resolveAuthorAddresses : true;
        this._memCache = new TinyCache();
        this.resolver = new Resolver({
            plebbit: { _memCache: this._memCache, resolveAuthorAddresses: this.resolveAuthorAddresses },
            blockchainProviders: this.blockchainProviders
        });
        this.dataPath = options.dataPath || getDefaultDataPath();
    }

    async _init(options: PlebbitOptions) {
        const log = Logger("plebbit-js:plebbit:_init");

        if (this.dataPath) await mkdir(this.dataPath, { recursive: true });
        if (options["ipfsGatewayUrl"]) this.ipfsGatewayUrl = options["ipfsGatewayUrl"];
        else {
            try {
                let gatewayFromNode = await this.ipfsClient.config.get("Addresses.Gateway");
                if (Array.isArray(gatewayFromNode)) gatewayFromNode = gatewayFromNode[0];

                const splits = gatewayFromNode.toString().split("/");
                this.ipfsGatewayUrl = `http://${splits[2]}:${splits[4]}`;
                log.trace(`plebbit.ipfsGatewayUrl retrieved from IPFS node: ${this.ipfsGatewayUrl}`);
            } catch (e) {
                this.ipfsGatewayUrl = "https://cloudflare-ipfs.com";
                log(e, `\nFailed to retrieve gateway url from ipfs node, will default to ${this.ipfsGatewayUrl}`);
            }
        }
    }

    async getSubplebbit(subplebbitAddress: string): Promise<Subplebbit> {
        if (!this.resolver.isDomain(subplebbitAddress) && !isIPFS.cid(subplebbitAddress))
            throw errcode(Error(messages.ERR_INVALID_SUBPLEBBIT_ADDRESS), codes.ERR_INVALID_SUBPLEBBIT_ADDRESS, {
                details: `getSubplebbit: subplebbitAddress (${subplebbitAddress}) can't be used to get a subplebbit`
            });
        const resolvedSubplebbitAddress = await this.resolver.resolveSubplebbitAddressIfNeeded(subplebbitAddress);
        const subplebbitJson: SubplebbitType = await loadIpnsAsJson(resolvedSubplebbitAddress, this);
        const signatureValidity = await verifySubplebbit(subplebbitJson, this);

        if (!signatureValidity.valid)
            throw errcode(Error(messages.ERR_SIGNATURE_IS_INVALID), codes.ERR_SIGNATURE_IS_INVALID, {
                details: `getSubplebbit: Failed verification reason: ${signatureValidity.reason}`
            });

        return new Subplebbit(subplebbitJson, this);
    }

    async getComment(cid: string): Promise<Comment | Post> {
        if (!isIPFS.cid(cid))
            throw errcode(Error(messages.ERR_CID_IS_INVALID), codes.ERR_CID_IS_INVALID, {
                details: `getComment: cid (${cid}) is invalid as a CID`
            });
        const commentJson: CommentIpfsType = await loadIpfsFileAsJson(cid, this);
        const signatureValidity = await verifyComment(commentJson, this, true);
        if (!signatureValidity.valid)
            throw errcode(Error(messages.ERR_SIGNATURE_IS_INVALID), codes.ERR_SIGNATURE_IS_INVALID, {
                details: `getComment: Failed verification reason: ${signatureValidity.reason}, ${
                    commentJson.depth === 0 ? "post" : "comment"
                }: ${JSON.stringify(commentJson)}`
            });

        const title = commentJson.title;
        return typeof title === "string"
            ? new Post({ ...commentJson, cid, title, postCid: cid }, this)
            : new Comment({ ...commentJson, cid }, this);
    }

    async createComment(options: CreateCommentOptions | CommentType | PostType | Comment | Post): Promise<Comment | Post> {
        const log = Logger("plebbit-js:plebbit:createComment");

        if (!options.signer)
            return typeof options.title === "string" ? new Post(<PostType>options, this) : new Comment(<CommentType>options, this);
        if (!options.timestamp) {
            options.timestamp = timestamp();
            log.trace(`User hasn't provided a timestamp in createCommentOptions, defaulting to (${options.timestamp})`);
        }
        if (!options?.author?.address) {
            options.author = { ...options.author, address: options.signer.address };
            log(`CreateCommentOptions did not provide author.address, will define it to signer.address (${options.signer.address})`);
        }

        const commentSignature = await signComment(<CreateCommentOptions>options, options.signer, this);

        const finalProps: CommentType | PostType = {
            ...(<CommentType>options), // TODO Take out cast later
            signature: commentSignature,
            protocolVersion: env.PROTOCOL_VERSION
        };

        const title = finalProps.title;

        return typeof title === "string" ? new Post({ ...finalProps, title }, this) : new Comment(finalProps, this);
    }

    _canRunSub(): boolean {
        try {
            //@ts-ignore
            nativeFunctions.createDbHandler({ address: "", plebbit: this });
            return true;
        } catch {}

        return false;
    }

    async createSubplebbit(options: CreateSubplebbitOptions | SubplebbitType = {}): Promise<Subplebbit> {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");
        const canRunSub = this._canRunSub();

        const newSub = async () => {
            if (!canRunSub) throw Error("missing nativeFunctions required to create a subplebbit");
            if (canRunSub && !this.dataPath)
                throw errcode(Error(messages.ERR_DATA_PATH_IS_NOT_DEFINED), codes.ERR_DATA_PATH_IS_NOT_DEFINED, {
                    details: `createSubplebbit: canRunSub=${canRunSub}, plebbitOptions.dataPath=${this.dataPath}`
                });
            const subplebbit = new Subplebbit(options, this);
            const key = subplebbit.address || <string>subplebbit.signer.address;
            const subHasBeenCreatedBefore = (await this.listSubplebbits()).includes(key);
            if (!subHasBeenCreatedBefore && pendingSubplebbitCreations[key])
                throw Error("Can't recreate a pending subplebbit that is waiting to be created");
            if (!subHasBeenCreatedBefore) pendingSubplebbitCreations[key] = true;
            await subplebbit.prePublish();
            if (!subHasBeenCreatedBefore) pendingSubplebbitCreations[key] = false;
            log(
                `Created subplebbit (${subplebbit.address}) with props:`,
                removeKeysWithUndefinedValues(lodash.omit(subplebbit.toJSON(), ["signer"]))
            );
            return subplebbit;
        };

        const remoteSub = async () => {
            return new Subplebbit(options, this);
        };

        if (
            !options.address &&
            (<CreateSubplebbitOptions>options)?.database?.connection?.filename &&
            (<CreateSubplebbitOptions>options)?.database?.connection?.filename !== ":memory:"
        ) {
            options.address = (<CreateSubplebbitOptions>options).database.connection.filename.split(/[\\\/]/).pop();
            await nativeFunctions.copyDbToDatapathIfNeeded((<CreateSubplebbitOptions>options).database, this.dataPath);
        }
        if (options.address && !options.signer) {
            if (!canRunSub) return remoteSub();
            else {
                const subHasBeenCreatedBefore = (await this.listSubplebbits()).includes(options.address);
                if (subHasBeenCreatedBefore) return newSub();
                else return remoteSub();
            }
        } else if (!options.address && !options.signer) {
            if (!canRunSub) throw Error(`missing nativeFunctions required to create a subplebbit`);
            else {
                options.signer = await this.createSigner();
                options.address = options.signer.address;
                log(`Did not provide CreateSubplebbitOptions.signer, generated random signer with address (${options.signer.address})`);
                return newSub();
            }
        } else if (!options.address && options.signer) {
            if (!canRunSub) throw Error(`missing nativeFunctions required to create a subplebbit`);

            const localSubs = await this.listSubplebbits();
            const derivedAddress = options.signer.address || (await getPlebbitAddressFromPrivateKeyPem(options.signer.privateKey));
            if (localSubs.includes(derivedAddress)) options.address = derivedAddress;
            if (!options.address) options.address = options.signer.address;
            return newSub();
        } else if (!canRunSub) return remoteSub();
        else return newSub();
    }

    async createVote(options: CreateVoteOptions | VoteType): Promise<Vote> {
        const log = Logger("plebbit-js:plebbit:createVote");
        if (!options.signer) return new Vote(<VoteType>options, this);
        if (!options.timestamp) {
            options.timestamp = timestamp();
            log.trace(`User hasn't provided a timestamp in createVote, defaulting to (${options.timestamp})`);
        }
        if (!options?.author?.address) {
            options.author = { ...options.author, address: options.signer.address };
            log.trace(`CreateVoteOptions did not provide author.address, will define it to signer.address (${options.signer.address})`);
        }
        const voteSignature = await signVote(<CreateVoteOptions>options, options.signer, this);
        const voteProps: VoteType = <VoteType>{ ...options, signature: voteSignature, protocolVersion: env.PROTOCOL_VERSION }; // TODO remove cast here
        return new Vote(voteProps, this);
    }

    async createCommentEdit(options: CreateCommentEditOptions | CommentEditType): Promise<CommentEdit> {
        const log = Logger("plebbit-js:plebbit:createCommentEdit");

        if (!options.signer) return new CommentEdit(options, this); // User just wants to instantiate a CommentEdit object, not publish
        if (!options.timestamp) {
            options.timestamp = timestamp();
            log.trace(`User hasn't provided editTimestamp in createCommentEdit, defaulted to (${options.timestamp})`);
        }

        if (!options?.author?.address) {
            if (typeof options.signer.address !== "string") throw Error("createCommentEditOptions.signer.address is not defined");

            options.author = { ...options.author, address: options.signer.address };
            log.trace(
                `CreateCommentEditOptions did not provide author.address, will define it to signer.address (${options.signer.address})`
            );
        }
        const commentEditProps = {
            ...options,
            signature: await signCommentEdit(<CreateCommentEditOptions>options, options.signer, this),
            protocolVersion: env.PROTOCOL_VERSION
        };
        return new CommentEdit(commentEditProps, this);
    }

    createSigner(createSignerOptions?: CreateSignerOptions): Promise<Signer> {
        return createSigner(createSignerOptions);
    }

    async listSubplebbits(): Promise<string[]> {
        const canRunSub = this._canRunSub();
        if (canRunSub && !this.dataPath)
            throw errcode(Error(messages.ERR_DATA_PATH_IS_NOT_DEFINED), codes.ERR_DATA_PATH_IS_NOT_DEFINED, {
                details: `listSubplebbits: canRunSub=${canRunSub}, plebbitOptions.dataPath=${this.dataPath}`
            });
        return nativeFunctions.listSubplebbits(this.dataPath);
    }

    async fetchCid(cid: string) {
        return fetchCid(cid, this);
    }
}
