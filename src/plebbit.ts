import { PlebbitOptions, CreateSignerOptions } from "./types";
import plebbitUtil from "./runtime/node/util";
import { Comment, CommentEdit } from "./comment";
import Post from "./post";
import { Subplebbit } from "./subplebbit";
import { getDebugLevels, loadIpfsFileAsJson, loadIpnsAsJson, timestamp } from "./util";
import Vote from "./vote";
import { create as createIpfsClient, IPFSHTTPClient } from "ipfs-http-client";
import assert from "assert";
import { createSigner, Signer, signPublication, verifyPublication } from "./signer";

const debugs = getDebugLevels("plebbit");

export class Plebbit {
    ipfsHttpClientOptions: string | any;
    ipfsGatewayUrl: string;
    pubsubHttpClientOptions: string | any;
    ipfsClient: IPFSHTTPClient;
    pubsubIpfsClient: IPFSHTTPClient;
    dataPath: string | undefined;

    constructor(options: PlebbitOptions = {}) {
        this.ipfsHttpClientOptions = options["ipfsHttpClientOptions"]; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        this.ipfsGatewayUrl = this.ipfsHttpClientOptions ? undefined : options["ipfsGatewayUrl"] || "https://cloudflare-ipfs.com";
        this.ipfsClient = this.ipfsHttpClientOptions ? createIpfsClient(this.ipfsHttpClientOptions) : undefined;
        this.pubsubHttpClientOptions = options["pubsubHttpClientOptions"] || "https://pubsubprovider.xyz/api/v0";
        this.pubsubIpfsClient = options["pubsubHttpClientOptions"]
            ? createIpfsClient(options["pubsubHttpClientOptions"])
            : this.ipfsClient
            ? this.ipfsClient
            : createIpfsClient(this.pubsubHttpClientOptions);
        this.dataPath = options["dataPath"] || plebbitUtil.getDefaultDataPath();
    }

    async getSubplebbit(subplebbitAddress) {
        assert(typeof subplebbitAddress === "string");
        assert(subplebbitAddress.length > 0);
        const subplebbitJson = await loadIpnsAsJson(subplebbitAddress, this);
        return new Subplebbit(subplebbitJson, this);
    }

    async getComment(cid) {
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
        const [signatureIsVerified, failedVerificationReason] = await verifyPublication(publication);
        assert.equal(signatureIsVerified, true, `Signature of comment/post ${cid} is invalid due to reason=${failedVerificationReason}`);
        return publication;
    }

    async signPublication(createPublicationOptions) {
        if (createPublicationOptions.author && !createPublicationOptions.author.address)
            createPublicationOptions.author.address = createPublicationOptions.signer.address;
        const commentSignature = await signPublication(createPublicationOptions, createPublicationOptions.signer);
        return { ...createPublicationOptions, signature: commentSignature };
    }

    defaultTimestampIfNeeded(createPublicationOptions) {
        if (!createPublicationOptions.timestamp) {
            const defaultTimestamp = timestamp();
            debugs.DEBUG(`User hasn't provided a timestamp in options, defaulting to (${defaultTimestamp})`);
            createPublicationOptions.timestamp = defaultTimestamp;
        }
        return createPublicationOptions;
    }

    async createComment(createCommentOptions): Promise<Comment | Post> {
        const commentSubplebbit = { plebbit: this };
        if (!createCommentOptions.signer)
            return createCommentOptions.title
                ? new Post(createCommentOptions, commentSubplebbit)
                : new Comment(createCommentOptions, commentSubplebbit);
        createCommentOptions = this.defaultTimestampIfNeeded(createCommentOptions);
        const commentProps = await this.signPublication(createCommentOptions);
        return commentProps.title ? new Post(commentProps, commentSubplebbit) : new Comment(commentProps, commentSubplebbit);
    }

    async createSubplebbit(createSubplebbitOptions): Promise<Subplebbit> {
        return new Subplebbit(createSubplebbitOptions, this);
    }

    async createVote(createVoteOptions): Promise<Vote> {
        const subplebbit = { plebbit: this };
        if (!createVoteOptions.signer) return new Vote(createVoteOptions, subplebbit);
        createVoteOptions = this.defaultTimestampIfNeeded(createVoteOptions);
        const voteProps = await this.signPublication(createVoteOptions);
        return new Vote(voteProps, subplebbit);
    }

    async createCommentEdit(createCommentEditOptions): Promise<CommentEdit> {
        const commentSubplebbit = { plebbit: this };

        if (!createCommentEditOptions.signer)
            // User just wants to instantiate a CommentEdit object, not publish
            return new CommentEdit(createCommentEditOptions, commentSubplebbit);
        if (!createCommentEditOptions.editTimestamp) {
            const defaultTimestamp = timestamp();
            debugs.DEBUG(`User hasn't provided any editTimestamp for their CommentEdit, defaulted to (${defaultTimestamp})`);
            createCommentEditOptions.editTimestamp = defaultTimestamp;
        }

        const commentEditProps = {
            ...createCommentEditOptions,
            editSignature: await signPublication(createCommentEditOptions, createCommentEditOptions.signer)
        };
        return new CommentEdit(commentEditProps, commentSubplebbit);
    }

    createSigner(createSignerOptions: CreateSignerOptions = {}): Promise<Signer> {
        return createSigner(createSignerOptions);
    }
}
