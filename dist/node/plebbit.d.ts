/// <reference types="node" />
import { BlockchainProvider, CommentType, CreateCommentEditOptions, CreateCommentOptions, CreateSignerOptions, CreateSubplebbitOptions, CreateVoteOptions, NativeFunctions, PlebbitOptions, VoteType } from "./types";
import { Comment } from "./comment";
import Post from "./post";
import { Subplebbit } from "./subplebbit";
import Vote from "./vote";
import { Signer } from "./signer";
import { Resolver } from "./resolver";
import TinyCache from "tinycache";
import { CommentEdit } from "./comment-edit";
import EventEmitter from "events";
export declare const pendingSubplebbitCreations: Record<string, boolean>;
export declare const setNativeFunctions: (pNativeFunctions: NativeFunctions) => void;
export declare class Plebbit extends EventEmitter implements PlebbitOptions {
    ipfsClient?: ReturnType<NativeFunctions["createIpfsClient"]>;
    pubsubIpfsClient: ReturnType<NativeFunctions["createIpfsClient"]>;
    resolver: Resolver;
    _memCache: TinyCache;
    ipfsGatewayUrl: string;
    ipfsHttpClientOptions?: Parameters<NativeFunctions["createIpfsClient"]>[0];
    pubsubHttpClientOptions?: Parameters<NativeFunctions["createIpfsClient"]>[0];
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
