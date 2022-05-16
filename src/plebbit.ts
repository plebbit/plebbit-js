import { PlebbitOptions, CreateSignerOptions } from "./types";
import plebbitUtil from "./runtime/node/util";
import { Comment, CommentEdit } from "./comment";
import Post from "./post";
import { Subplebbit } from "./subplebbit";
import { loadIpfsFileAsJson, loadIpnsAsJson, timestamp } from "./util";
import Vote from "./vote";
import { create as createIpfsClient, IPFSHTTPClient } from "ipfs-http-client";
import * as crypto from "libp2p-crypto";
import * as jose from "jose";
import assert from "assert";
import Debug from "debug";
import { createSigner, Signer, signPublication, verifyPublication } from "./signer";

const debug = Debug("plebbit-js:plebbit");

export class Plebbit {
    ipfsHttpClientOptions: string | any;
    ipfsGatewayUrl: string;
    pubsubHttpClientOptions: string | any;
    ipfsClient: IPFSHTTPClient;
    dataPath: string | undefined;

    constructor(options: PlebbitOptions = {}) {
        this.ipfsHttpClientOptions = options["ipfsHttpClientOptions"]; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        this.ipfsGatewayUrl = this.ipfsHttpClientOptions
            ? undefined
            : options["ipfsGatewayUrl"] || "https://cloudflare-ipfs.com";
        this.pubsubHttpClientOptions = this.ipfsHttpClientOptions
            ? undefined
            : options["pubsubHttpClientOptions"] || "https://pubsubprovider.xyz/api/v0";
        this.ipfsClient = createIpfsClient(this.ipfsHttpClientOptions || this.pubsubHttpClientOptions);
        this.dataPath = options["dataPath"] || plebbitUtil.getDefaultDataPath();
    }

    async getSubplebbit(subplebbitAddress) {
        assert(subplebbitAddress, "Subplebbit address can't be null");
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
        assert.equal(
            signatureIsVerified,
            true,
            `Signature of comment/post ${cid} is invalid due to reason=${failedVerificationReason}`
        );
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
            debug(`User hasn't provided a timestamp in options, defaulting to (${defaultTimestamp})`);
            createPublicationOptions.timestamp = defaultTimestamp;
        }
        return createPublicationOptions;
    }

    async createComment(createCommentOptions) {
        const commentSubplebbit = { plebbit: this };
        if (!createCommentOptions.signer)
            return createCommentOptions.title
                ? new Post(createCommentOptions, commentSubplebbit)
                : new Comment(createCommentOptions, commentSubplebbit);
        createCommentOptions = this.defaultTimestampIfNeeded(createCommentOptions);
        const commentProps = await this.signPublication(createCommentOptions);
        return commentProps.title
            ? new Post(commentProps, commentSubplebbit)
            : new Comment(commentProps, commentSubplebbit);
    }

    async createSubplebbit(createSubplebbitOptions) {
        return new Subplebbit(createSubplebbitOptions, this);
    }

    async createVote(createVoteOptions) {
        const subplebbit = { plebbit: this };
        if (!createVoteOptions.signer) return new Vote(createVoteOptions, subplebbit);
        createVoteOptions = this.defaultTimestampIfNeeded(createVoteOptions);
        const voteProps = await this.signPublication(createVoteOptions);
        return new Vote(voteProps, subplebbit);
    }

    async createCommentEdit(createCommentEditOptions) {
        const commentSubplebbit = { plebbit: this };

        if (!createCommentEditOptions.signer)
            // User just wants to instantiate a CommentEdit object, not publish
            return new CommentEdit(createCommentEditOptions, commentSubplebbit);
        if (!createCommentEditOptions.editTimestamp) {
            const defaultTimestamp = timestamp();
            debug(`User hasn't provided any editTimestamp for their CommentEdit, defaulted to (${defaultTimestamp})`);
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
