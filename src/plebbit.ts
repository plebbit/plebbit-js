import {
    BlockchainProvider,
    CommentType,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreateSignerOptions,
    CreateSubplebbitOptions,
    CreateVoteOptions,
    NativeFunctions,
    PlebbitOptions,
    PostType,
    VoteType
} from "./types";
import plebbitUtil, { isRuntimeNode, mkdir, nativeFunctions, setNativeFunctions as utilSetNativeFunctions } from "./runtime/node/util";
import { Comment } from "./comment";
import Post from "./post";
import { Subplebbit } from "./subplebbit";
import { getProtocolVersion, loadIpfsFileAsJson, loadIpnsAsJson, timestamp } from "./util";
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

export const pendingSubplebbitCreations: Record<string, boolean> = {};

export const setNativeFunctions = utilSetNativeFunctions;

export class Plebbit extends EventEmitter implements PlebbitOptions {
    ipfsClient?: ReturnType<NativeFunctions["createIpfsClient"]>;
    pubsubIpfsClient: ReturnType<NativeFunctions["createIpfsClient"]>;
    resolver: Resolver;
    _memCache: TinyCache;
    ipfsGatewayUrl: string;
    ipfsHttpClientOptions?: Parameters<NativeFunctions["createIpfsClient"]>[0];
    pubsubHttpClientOptions?: Parameters<NativeFunctions["createIpfsClient"]>[0];
    dataPath?: string;
    blockchainProviders?: { [chainTicker: string]: BlockchainProvider };
    resolveAuthorAddresses?: boolean;

    constructor(options: PlebbitOptions = {}) {
        super();
        this.ipfsHttpClientOptions = options.ipfsHttpClientOptions; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        this.ipfsClient = this.ipfsHttpClientOptions ? nativeFunctions.createIpfsClient(this.ipfsHttpClientOptions) : undefined;
        this.pubsubHttpClientOptions = options.pubsubHttpClientOptions || { url: "https://pubsubprovider.xyz/api/v0" };
        this.pubsubIpfsClient = options.pubsubHttpClientOptions
            ? nativeFunctions.createIpfsClient(options.pubsubHttpClientOptions)
            : this.ipfsClient
            ? this.ipfsClient
            : nativeFunctions.createIpfsClient(this.pubsubHttpClientOptions);
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
    }

    async _init(options: PlebbitOptions) {
        const log = Logger("plebbit-js:plebbit:_init");

        this.dataPath = options.dataPath || plebbitUtil.getDefaultDataPath();
        if (isRuntimeNode && this.dataPath) await mkdir(this.dataPath, { recursive: true });
        if (options["ipfsGatewayUrl"]) this.ipfsGatewayUrl = options["ipfsGatewayUrl"];
        else {
            try {
                let gatewayFromNode = await this.ipfsClient.getConfig("Addresses.Gateway");
                if (Array.isArray(gatewayFromNode)) gatewayFromNode = gatewayFromNode[0];

                const splits = gatewayFromNode.toString().split("/");
                this.ipfsGatewayUrl = `http://${splits[2]}:${splits[4]}`;
                log.trace(`plebbit.ipfsGatewayUrl retrieved from IPFS node: ${this.ipfsGatewayUrl}`);
            } catch (e) {
                this.ipfsGatewayUrl = "https://cloudflare-ipfs.com";
                log(`${e.msg}: Failed to retrieve gateway url from ipfs node, will default to ${this.ipfsGatewayUrl}`);
            }
        }
    }

    async getSubplebbit(subplebbitAddress: string): Promise<Subplebbit> {
        if (!this.resolver.isDomain(subplebbitAddress) && !isIPFS.cid(subplebbitAddress))
            throw errcode(Error(messages.ERR_INVALID_SUBPLEBBIT_ADDRESS), codes.ERR_INVALID_SUBPLEBBIT_ADDRESS, {
                details: `getSubplebbit: subplebbitAddress (${subplebbitAddress}) can't be used to get a subplebbit`
            });
        const resolvedSubplebbitAddress = await this.resolver.resolveSubplebbitAddressIfNeeded(subplebbitAddress);
        const subplebbitJson = await loadIpnsAsJson(resolvedSubplebbitAddress, this);
        return new Subplebbit(subplebbitJson, this);
    }

    async getComment(cid: string): Promise<Comment | Post> {
        if (!isIPFS.cid(cid))
            throw errcode(Error(messages.ERR_CID_IS_INVALID), codes.ERR_CID_IS_INVALID, {
                details: `getComment: cid (${cid}) is invalid as a CID`
            });
        const commentJson = await loadIpfsFileAsJson(cid, this);
        const subplebbit = await this.getSubplebbit(commentJson.subplebbitAddress);
        const publication = commentJson["title"]
            ? new Post(
                  {
                      ...commentJson,
                      postCid: cid,
                      cid: cid
                  },
                  subplebbit
              )
            : new Comment({ ...commentJson, cid: cid }, subplebbit);
        const [signatureIsVerified, failedVerificationReason] = await verifyPublication(publication, this, "comment");
        if (!signatureIsVerified)
            throw errcode(Error(messages.ERR_FAILED_TO_VERIFY_SIGNATURE), codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
                details: `getComment: Failed verification reason: ${failedVerificationReason}, ${publication.getType()}: ${JSON.stringify(
                    publication
                )}`
            });
        return publication;
    }

    async createComment(options: CreateCommentOptions | CommentType): Promise<Comment | Post> {
        const log = Logger("plebbit-js:plebbit:createComment");

        const commentSubplebbit = { plebbit: this, address: options.subplebbitAddress };
        if (!options.signer)
            return options.title ? new Post(<PostType>options, commentSubplebbit) : new Comment(<CommentType>options, commentSubplebbit);
        if (!options.timestamp) {
            options.timestamp = timestamp();
            log.trace(`User hasn't provided a timestamp in createCommentOptions, defaulting to (${options.timestamp})`);
        }
        if (!options?.author?.address) {
            options.author = { ...options.author, address: options.signer.address };
            log.trace(`CreateCommentOptions did not provide author.address, will define it to signer.address (${options.signer.address})`);
        }

        const commentSignature = await signPublication(options, options.signer, this, "comment");

        const finalProps: CommentType | PostType = {
            ...(<CommentType>options), // TODO Take out cast later
            signature: commentSignature,
            protocolVersion: getProtocolVersion()
        };
        return finalProps.title ? new Post(finalProps, commentSubplebbit) : new Comment(finalProps, commentSubplebbit);
    }

    async createSubplebbit(options: CreateSubplebbitOptions = {}): Promise<Subplebbit> {
        const log = Logger("plebbit-js:plebbit:createSubplebbit");

        const newSub = async () => {
            assert(isRuntimeNode, "Runtime need to include node APIs to create a publishing subplebbit");
            const subplebbit = new Subplebbit(options, this);
            const key = subplebbit.address || subplebbit.signer.address;
            assert(typeof key === "string", "To create a subplebbit you need to either defined signer or address");
            assert(!pendingSubplebbitCreations[key], "Can't recreate a pending subplebbit that is waiting to be created");
            pendingSubplebbitCreations[key] = true;
            await subplebbit.prePublish();
            pendingSubplebbitCreations[key] = false;
            return subplebbit;
        };

        const remoteSub = async () => {
            return new Subplebbit(options, this);
        };

        if (options.address && !options.signer) {
            if (!isRuntimeNode) return remoteSub();
            else {
                const localSubs = await this.listSubplebbits();
                if (localSubs.includes(options.address)) return newSub();
                else return remoteSub();
            }
        } else if (!options.address && !options.signer) {
            if (!isRuntimeNode) throw new Error(`Can't instantenate a publishing subplebbit without node API`);
            else {
                options.signer = await this.createSigner();
                log(`Did not provide CreateSubplebbitOptions.signer, generated random signer with address (${options.signer.address})`);
                return newSub();
            }
        } else if (!options.address && options.signer) {
            if (!isRuntimeNode) throw new Error(`Can't instantenate a publishing subplebbit without node API`);

            const localSubs = await this.listSubplebbits();
            const derivedAddress = options.signer.address || (await getPlebbitAddressFromPrivateKeyPem(options.signer.privateKey));
            if (localSubs.includes(derivedAddress)) options.address = derivedAddress;
            return newSub();
        } else if (!isRuntimeNode) return remoteSub();
        else return newSub();
    }

    async createVote(options: CreateVoteOptions | VoteType): Promise<Vote> {
        const log = Logger("plebbit-js:plebbit:createVote");

        const subplebbit = { plebbit: this, address: options.subplebbitAddress };
        if (!options.signer) return new Vote(<VoteType>options, subplebbit);
        if (!options.timestamp) {
            options.timestamp = timestamp();
            log.trace(`User hasn't provided a timestamp in createVote, defaulting to (${options.timestamp})`);
        }
        if (!options?.author?.address) {
            options.author = { ...options.author, address: options.signer.address };
            log.trace(`CreateVoteOptions did not provide author.address, will define it to signer.address (${options.signer.address})`);
        }
        const voteSignature = await signPublication(options, options.signer, this, "vote");
        const voteProps: VoteType = <VoteType>{ ...options, signature: voteSignature, protocolVersion: getProtocolVersion() }; // TODO remove cast here
        return new Vote(voteProps, subplebbit);
    }

    async createCommentEdit(options: CreateCommentEditOptions): Promise<CommentEdit> {
        const log = Logger("plebbit-js:plebbit:createCommentEdit");

        const subplebbitObj = { plebbit: this, address: options.subplebbitAddress };
        if (!options.signer) return new CommentEdit(options, subplebbitObj); // User just wants to instantiate a CommentEdit object, not publish
        if (!options.timestamp) {
            options.timestamp = timestamp();
            log.trace(`User hasn't provided editTimestamp in createCommentEdit, defaulted to (${options.timestamp})`);
        }

        if (!options?.author?.address) {
            options.author = { ...options.author, address: options.signer.address };
            log.trace(
                `CreateCommentEditOptions did not provide author.address, will define it to signer.address (${options.signer.address})`
            );
        }
        const commentEditProps = {
            ...options,
            signature: await signPublication(options, options.signer, this, "commentedit"),
            protocolVersion: getProtocolVersion()
        };
        return new CommentEdit(commentEditProps, subplebbitObj);
    }

    createSigner(createSignerOptions?: CreateSignerOptions): Promise<Signer> {
        return createSigner(createSignerOptions);
    }

    async listSubplebbits(): Promise<string[]> {
        return nativeFunctions.listSubplebbits(this.dataPath);
    }
}
