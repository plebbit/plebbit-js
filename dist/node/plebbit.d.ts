/// <reference types="node" />
import { BlockchainProvider, CommentEditType, CommentType, CreateCommentEditOptions, CreateCommentOptions, CreateSignerOptions, CreateSubplebbitOptions, CreateVoteOptions, NativeFunctions, PlebbitOptions, PostType, SubplebbitType, VoteType } from "./types";
import { Comment } from "./comment";
import Post from "./post";
import { Subplebbit } from "./subplebbit";
import Vote from "./vote";
import { Signer } from "./signer";
import { Resolver } from "./resolver";
import TinyCache from "tinycache";
import { CommentEdit } from "./comment-edit";
import EventEmitter from "events";
export declare class Plebbit extends EventEmitter implements PlebbitOptions {
    ipfsClient?: ReturnType<NativeFunctions["createIpfsClient"]>;
    pubsubIpfsClient: Pick<ReturnType<NativeFunctions["createIpfsClient"]>, "pubsub">;
    resolver: Resolver;
    _memCache: TinyCache;
    ipfsGatewayUrl: string;
    ipfsHttpClientOptions?: Parameters<NativeFunctions["createIpfsClient"]>[0] | string;
    pubsubHttpClientOptions?: Parameters<NativeFunctions["createIpfsClient"]>[0] | string;
    dataPath?: string;
    blockchainProviders?: {
        [chainTicker: string]: BlockchainProvider;
    };
    resolveAuthorAddresses?: boolean;
    constructor(options?: PlebbitOptions);
    _init(options: PlebbitOptions): Promise<void>;
    getSubplebbit(subplebbitAddress: string): Promise<Subplebbit>;
    getComment(cid: string): Promise<Comment | Post>;
    private _initMissingFields;
    createComment(options: CreateCommentOptions | CommentType | PostType | Comment | Post): Promise<Comment | Post>;
    _canRunSub(): boolean;
    createSubplebbit(options?: CreateSubplebbitOptions | SubplebbitType): Promise<Subplebbit>;
    createVote(options: CreateVoteOptions | VoteType): Promise<Vote>;
    createCommentEdit(options: CreateCommentEditOptions | CommentEditType): Promise<CommentEdit>;
    createSigner(createSignerOptions?: CreateSignerOptions): Promise<Signer>;
    listSubplebbits(): Promise<string[]>;
    fetchCid(cid: string): Promise<string>;
}
