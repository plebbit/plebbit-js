import { BlockchainProvider, CommentType, CreateCommentEditOptions, CreateCommentOptions, CreateSignerOptions, CreateSubplebbitOptions, CreateVoteOptions, PlebbitOptions, VoteType } from "./types";
import { Comment } from "./comment";
import Post from "./post";
import { Subplebbit } from "./subplebbit";
import Vote from "./vote";
import { IPFSHTTPClient, Options } from "ipfs-http-client";
import { Signer } from "./signer";
import { Resolver } from "./resolver";
import TinyCache from "tinycache";
import { CommentEdit } from "./comment-edit";
export declare const pendingSubplebbitCreations: Record<string, boolean>;
export declare class Plebbit implements PlebbitOptions {
    ipfsClient?: IPFSHTTPClient;
    pubsubIpfsClient: IPFSHTTPClient;
    resolver: Resolver;
    _memCache: TinyCache;
    ipfsGatewayUrl: string;
    ipfsHttpClientOptions?: Options;
    pubsubHttpClientOptions?: Options;
    dataPath?: string;
    blockchainProviders?: {
        [chainTicker: string]: BlockchainProvider;
    };
    resolveAuthorAddresses?: boolean;
    constructor(options?: PlebbitOptions);
    _init(options: PlebbitOptions): Promise<void>;
    getSubplebbit(subplebbitAddress: string): Promise<Subplebbit>;
    getComment(cid: string): Promise<Comment | Post>;
    createComment(options: CreateCommentOptions | CommentType): Promise<Comment | Post>;
    createSubplebbit(options?: CreateSubplebbitOptions): Promise<Subplebbit>;
    createVote(options: CreateVoteOptions | VoteType): Promise<Vote>;
    createCommentEdit(options: CreateCommentEditOptions): Promise<CommentEdit>;
    createSigner(createSignerOptions?: CreateSignerOptions): Promise<Signer>;
    listSubplebbits(): Promise<string[]>;
}
