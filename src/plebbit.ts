import {
    BlockchainProvider,
    CommentType,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreateSignerOptions,
    CreateSubplebbitOptions,
    CreateVoteOptions,
    PlebbitOptions,
    PostType,
    VoteType
} from "./types";
import plebbitUtil from "./runtime/node/util";
import { Comment } from "./comment";
import Post from "./post";
import { Subplebbit } from "./subplebbit";
import { getDebugLevels, getProtocolVersion, loadIpfsFileAsJson, loadIpnsAsJson, parseJsonIfString, timestamp } from "./util";
import Vote from "./vote";
import { create as createIpfsClient, IPFSHTTPClient, Options } from "ipfs-http-client";
import assert from "assert";
import { createSigner, Signer, signPublication, verifyPublication } from "./signer";
import { Resolver } from "./resolver";
import TinyCache from "tinycache";
import Author from "./author";
import { CommentEdit } from "./comment-edit";

const debugs = getDebugLevels("plebbit");

export class Plebbit implements PlebbitOptions {
    ipfsClient?: IPFSHTTPClient;
    pubsubIpfsClient: IPFSHTTPClient;
    resolver: Resolver;
    _memCache: TinyCache;
    ipfsGatewayUrl: string;
    ipfsHttpClientOptions?: Options;
    pubsubHttpClientOptions?: Options;
    dataPath?: string;
    blockchainProviders?: { [chainTicker: string]: BlockchainProvider };
    resolveAuthorAddresses?: boolean;

    constructor(options: PlebbitOptions = {}) {
        this.ipfsHttpClientOptions = options["ipfsHttpClientOptions"]; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        this.ipfsClient = this.ipfsHttpClientOptions ? createIpfsClient(this.ipfsHttpClientOptions) : undefined;
        this.pubsubHttpClientOptions = options["pubsubHttpClientOptions"] || { url: "https://pubsubprovider.xyz/api/v0" };
        this.pubsubIpfsClient = options["pubsubHttpClientOptions"]
            ? createIpfsClient(options["pubsubHttpClientOptions"])
            : this.ipfsClient
            ? this.ipfsClient
            : createIpfsClient(this.pubsubHttpClientOptions);
        this.dataPath = options["dataPath"] || plebbitUtil.getDefaultDataPath();
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
        this.resolveAuthorAddresses = options["resolveAuthorAddresses"] || true;
        this._memCache = new TinyCache();
    }

    async _init(options: PlebbitOptions) {
        if (options["ipfsGatewayUrl"]) this.ipfsGatewayUrl = options["ipfsGatewayUrl"];
        else {
            try {
                let gatewayFromNode = await this.ipfsClient.config.get("Addresses.Gateway");
                debugs.TRACE(`Gateway from node: ${JSON.stringify(gatewayFromNode)}`);
                if (Array.isArray(gatewayFromNode)) gatewayFromNode = gatewayFromNode[0];

                const splits = gatewayFromNode.toString().split("/");
                this.ipfsGatewayUrl = `http://${splits[2]}:${splits[4]}`;
                debugs.TRACE(`plebbit.ipfsGatewayUrl retrieved from IPFS node: ${this.ipfsGatewayUrl}`);
            } catch (e) {
                this.ipfsGatewayUrl = "https://cloudflare-ipfs.com";
                debugs.ERROR(`${e.msg}: Failed to retrieve gateway url from ipfs node, will default to ${this.ipfsGatewayUrl}`);
            }
        }
    }

    async getSubplebbit(subplebbitAddress: string): Promise<Subplebbit> {
        assert(typeof subplebbitAddress === "string");
        assert(subplebbitAddress.length > 0);
        const resolvedSubplebbitAddress = await this.resolver.resolveSubplebbitAddressIfNeeded(subplebbitAddress);
        assert(
            typeof resolvedSubplebbitAddress === "string" && resolvedSubplebbitAddress.length > 0,
            "Resolved address of a subplebbit needs to be defined"
        );
        const subplebbitJson = await loadIpnsAsJson(resolvedSubplebbitAddress, this);
        return new Subplebbit(subplebbitJson, this);
    }

    async getComment(cid: string): Promise<Comment | Post> {
        const commentJson = await loadIpfsFileAsJson(cid, this);
        const subplebbit = await this.getSubplebbit(commentJson["subplebbitAddress"]);
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
        assert.equal(signatureIsVerified, true, `Signature of comment/post ${cid} is invalid due to reason=${failedVerificationReason}`);
        return publication;
    }

    async createComment(options: CreateCommentOptions | CommentType): Promise<Comment | Post> {
        const commentSubplebbit = { plebbit: this, address: options.subplebbitAddress };
        if (!options.signer)
            return options.title ? new Post(<PostType>options, commentSubplebbit) : new Comment(<CommentType>options, commentSubplebbit);
        if (!options.timestamp) {
            options.timestamp = timestamp();
            debugs.TRACE(`User hasn't provided a timestamp in createCommentOptions, defaulting to (${options.timestamp})`);
        }
        options.author = parseJsonIfString(options.author);
        if (!options.author) options.author = { address: options.signer.address };

        if (options.author && !options.author.address) {
            options.author.address = options.signer.address;
            debugs.TRACE(
                `createCommentOptions did not provide author.address, will define it to signer.address (${options.signer.address})`
            );
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
        if (!options.signer) {
            options.signer = await this.createSigner();
            debugs.DEBUG(
                `Did not provide CreateSubplebbitOptions.signer, generated random signer with address (${options.signer.address})`
            );
        }
        const subplebbit = new Subplebbit(options, this);
        await subplebbit.start();
        await subplebbit.edit(options);
        await subplebbit.stopPublishing();
        return subplebbit;
    }

    async createVote(options: CreateVoteOptions | VoteType): Promise<Vote> {
        const subplebbit = { plebbit: this, address: options.subplebbitAddress };
        if (!options.signer) return new Vote(<VoteType>options, subplebbit);
        if (!options.timestamp) {
            options.timestamp = timestamp();
            debugs.TRACE(`User hasn't provided a timestamp in createVote, defaulting to (${options.timestamp})`);
        }
        if (!options.author) options.author = { address: options.signer.address };

        if (options.author && !options?.author?.address) {
            options.author.address = options.signer.address;
            debugs.TRACE(`CreateVoteOptions did not provide author.address, will define it to signer.address (${options.signer.address})`);
        }
        const voteSignature = await signPublication(options, options.signer, this, "vote");
        const voteProps: VoteType = <VoteType>{ ...options, signature: voteSignature, protocolVersion: getProtocolVersion() }; // TODO remove cast here
        return new Vote(voteProps, subplebbit);
    }

    async createCommentEdit(options: CreateCommentEditOptions): Promise<CommentEdit> {
        const subplebbitObj = { plebbit: this, address: options.subplebbitAddress };
        if (!options.signer) return new CommentEdit(options, subplebbitObj); // User just wants to instantiate a CommentEdit object, not publish
        if (!options.timestamp) {
            options.timestamp = timestamp();
            debugs.DEBUG(`User hasn't provided editTimestamp in createCommentEdit, defaulted to (${options.timestamp})`);
        }

        const editSignature = await signPublication(options, options.signer, this, "commentedit");

        const commentEditProps = {
            ...options,
            editSignature: editSignature
        };
        return new CommentEdit(commentEditProps, subplebbitObj);
    }

    createSigner(createSignerOptions?: CreateSignerOptions): Promise<Signer> {
        return createSigner(createSignerOptions);
    }

    listSubplebbits(): Promise<string[]> {
        return plebbitUtil.listSubplebbits(this);
    }
}
