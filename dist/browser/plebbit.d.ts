import { BlockchainProvider, CreateCommentEditOptions, CreateCommentOptions, CreateSignerOptions, CreateSubplebbitOptions, CreateVoteOptions, PlebbitOptions } from "./types";
import { Comment, CommentEdit } from "./comment";
import Post from "./post";
import { Subplebbit } from "./subplebbit";
import Vote from "./vote";
import { IPFSHTTPClient, Options } from "ipfs-http-client";
import { Signer } from "./signer";
import { Resolver } from "./resolver";
import TinyCache from "tinycache";
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
    constructor(options: PlebbitOptions);
    _init(options: PlebbitOptions): Promise<void>;
    getSubplebbit(subplebbitAddress: string): Promise<Subplebbit>;
    getComment(cid: string): Promise<Comment | Post>;
    createComment(options: CreateCommentOptions): Promise<Comment | Post>;
    createSubplebbit(options: CreateSubplebbitOptions): Promise<Subplebbit>;
    createVote(options: CreateVoteOptions): Promise<Vote>;
    createCommentEdit(options: CreateCommentEditOptions): Promise<CommentEdit>;
    createSigner(createSignerOptions?: CreateSignerOptions): Promise<Signer>;
    listSubplebbits(): Promise<string[]>;
}
