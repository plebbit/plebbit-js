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
import { loadIpfsFileAsJson, loadIpnsAsJson, timestamp } from "./util";
import Vote from "./vote";
import assert from "assert";
import { createSigner, Signer, signPublication, verifyPublication } from "./signer";
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
        this.resolver = new Resolver({ plebbit: this, blockchainProviders: this.blockchainProviders });
        this.resolveAuthorAddresses = options.hasOwnProperty("resolveAuthorAddresses") ? options.resolveAuthorAddresses : true;
        this._memCache = new TinyCache();
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
                log(`${e}: Failed to retrieve gateway url from ipfs node, will default to ${this.ipfsGatewayUrl}`);
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
        const [signatureIsVerified, failedVerificationReason] = await verifyPublication(subplebbitJson, this, "subplebbit");
        if (!signatureIsVerified)
            throw errcode(Error(messages.ERR_FAILED_TO_VERIFY_SIGNATURE), codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
                details: `getSubplebbit: Failed verification reason: ${failedVerificationReason}`
            });

        return new Subplebbit(subplebbitJson, this);
    }

    async getComment(cid: string): Promise<Comment | Post> {
        if (!isIPFS.cid(cid))
            throw errcode(Error(messages.ERR_CID_IS_INVALID), codes.ERR_CID_IS_INVALID, {
                details: `getComment: cid (${cid}) is invalid as a CID`
            });
        const commentJson: CommentIpfsType = await loadIpfsFileAsJson(cid, this);
        const [signatureIsVerified, failedVerificationReason] = await verifyPublication(commentJson, this, "comment");
        if (!signatureIsVerified)
            throw errcode(Error(messages.ERR_FAILED_TO_VERIFY_SIGNATURE), codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
                details: `getComment: Failed verification reason: ${failedVerificationReason}, ${
                    commentJson.depth === 0 ? "post" : "comment"
                }: ${JSON.stringify(commentJson)}`
            });

        const title = commentJson.title;
        return typeof title === "string"
            ? new Post({ ...commentJson, cid, title, postCid: cid }, this)
            : new Comment({ ...commentJson, cid }, this);
    }

    async createComment(options: CreateCommentOptions | CommentType | PostType): Promise<Comment | Post> {
        const log = Logger("plebbit-js:plebbit:createComment");

        if (!options.signer)
            return typeof options.title === "string" ? new Post(<PostType>options, this) : new Comment(<CommentType>options, this);
        if (!options.timestamp) {
            options.timestamp = timestamp();
            log.trace(`User hasn't provided a timestamp in createCommentOptions, defaulting to (${options.timestamp})`);
        }
        if (!options?.author?.address) {
            options.author = { ...options.author, address: options.signer.address };
            log.trace(`CreateCommentOptions did not provide author.address, will define it to signer.address (${options.signer.address})`);
        }

        const commentSignature = await signPublication(<CreateCommentOptions>options, options.signer, this, "comment");

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
            assert(canRunSub, "missing nativeFunctions required to create a subplebbit");
            if (canRunSub && !this.dataPath)
                throw errcode(Error(messages.ERR_DATA_PATH_IS_NOT_DEFINED), codes.ERR_DATA_PATH_IS_NOT_DEFINED, {
                    details: `createSubplebbit: canRunSub=${canRunSub}, plebbitOptions.dataPath=${this.dataPath}`
                });
            const subplebbit = new Subplebbit(options, this);
            const key = subplebbit.address || subplebbit.signer.address;
            assert(typeof key === "string", "To create a subplebbit you need to either defined signer or address");
            assert(!pendingSubplebbitCreations[key], "Can't recreate a pending subplebbit that is waiting to be created");
            pendingSubplebbitCreations[key] = true;
            await subplebbit.prePublish();
            pendingSubplebbitCreations[key] = false;
            log(`Created subplebbit (${subplebbit.address}) with options (${JSON.stringify(subplebbit.toJSON())})`);
            return subplebbit;
        };

        const remoteSub = async () => {
            return new Subplebbit(options, this);
        };

        if (options.address && !options.signer) {
            if (!canRunSub) return remoteSub();
            else {
                const localSubs = await this.listSubplebbits();
                if (localSubs.includes(options.address)) return newSub();
                else return remoteSub();
            }
        } else if (!options.address && !options.signer) {
            if (!canRunSub) throw Error(`missing nativeFunctions required to create a subplebbit`);
            else {
                options.signer = await this.createSigner();
                log(`Did not provide CreateSubplebbitOptions.signer, generated random signer with address (${options.signer.address})`);
                return newSub();
            }
        } else if (!options.address && options.signer) {
            if (!canRunSub) throw Error(`missing nativeFunctions required to create a subplebbit`);

            const localSubs = await this.listSubplebbits();
            const derivedAddress = options.signer.address || (await getPlebbitAddressFromPrivateKeyPem(options.signer.privateKey));
            if (localSubs.includes(derivedAddress)) options.address = derivedAddress;
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
        const voteSignature = await signPublication(<CreateVoteOptions>options, options.signer, this, "vote");
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
            assert(options.signer.address, "Signer has to have an address");

            options.author = { ...options.author, address: options.signer.address };
            log.trace(
                `CreateCommentEditOptions did not provide author.address, will define it to signer.address (${options.signer.address})`
            );
        }
        const commentEditProps = {
            ...options,
            signature: await signPublication(<CreateCommentEditOptions>options, options.signer, this, "commentedit"),
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
}
