import { PlebbitOptions, CreateSignerOptions } from "./types";
import { Comment, CommentEdit } from "./comment";
import { Subplebbit } from "./subplebbit";
import Vote from "./vote";
import { IPFSHTTPClient } from "ipfs-http-client";
import { Signer } from "./signer";
export declare class Plebbit {
    ipfsHttpClientOptions: string | any;
    ipfsGatewayUrl: string;
    pubsubHttpClientOptions: string | any;
    ipfsClient: IPFSHTTPClient;
    pubsubIpfsClient: IPFSHTTPClient;
    dataPath: string | undefined;
    constructor(options?: PlebbitOptions);
    getSubplebbit(subplebbitAddress: any): Promise<Subplebbit>;
    getComment(cid: any): Promise<Comment>;
    signPublication(createPublicationOptions: any): Promise<any>;
    defaultTimestampIfNeeded(createPublicationOptions: any): any;
    createComment(createCommentOptions: any): Promise<Comment>;
    createSubplebbit(createSubplebbitOptions: any): Promise<Subplebbit>;
    createVote(createVoteOptions: any): Promise<Vote>;
    createCommentEdit(createCommentEditOptions: any): Promise<CommentEdit>;
    createSigner(createSignerOptions?: CreateSignerOptions): Promise<Signer>;
}
