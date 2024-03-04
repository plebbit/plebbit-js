import { StorageInterface, ChainProvider, CommentEditType, CommentIpfsType, CommentPubsubMessage, CommentType, CommentWithCommentUpdate, CreateCommentEditOptions, CreateCommentOptions, CreateVoteOptions, GatewayClient, IpfsClient, PlebbitEvents, PlebbitOptions, PubsubClient, VotePubsubMessage, VoteType, ParsedPlebbitOptions, LRUStorageInterface, LRUStorageConstructor } from "./types.js";
import { Comment } from "./comment.js";
import Vote from "./vote.js";
import { Signer } from "./signer/index.js";
import { Resolver } from "./resolver.js";
import { CommentEdit } from "./comment-edit.js";
import { TypedEmitter } from "tiny-typed-emitter";
import { CreateSignerOptions } from "./signer/constants.js";
import Stats from "./stats.js";
import { ClientsManager } from "./clients/client-manager.js";
import PlebbitRpcClient from "./clients/plebbit-rpc-client.js";
import { GenericPlebbitRpcStateClient } from "./clients/plebbit-rpc-state-client.js";
import { CreateSubplebbitOptions, InternalSubplebbitType, SubplebbitIpfsType, SubplebbitType } from "./subplebbit/types.js";
import { RemoteSubplebbit } from "./subplebbit/remote-subplebbit.js";
import { RpcRemoteSubplebbit } from "./subplebbit/rpc-remote-subplebbit.js";
import { RpcLocalSubplebbit } from "./subplebbit/rpc-local-subplebbit.js";
import { LocalSubplebbit } from "./runtime/node/subplebbit/local-subplebbit.js";
export declare class Plebbit extends TypedEmitter<PlebbitEvents> implements PlebbitOptions {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: GatewayClient;
        };
        ipfsClients: {
            [ipfsClientUrl: string]: IpfsClient;
        };
        pubsubClients: {
            [pubsubClientUrl: string]: PubsubClient;
        };
        chainProviders: {
            [chainProviderUrl: string]: ChainProvider;
        };
        plebbitRpcClients: {
            [plebbitRpcUrl: string]: GenericPlebbitRpcStateClient;
        };
    };
    resolver: Resolver;
    plebbitRpcClient?: PlebbitRpcClient;
    ipfsHttpClientsOptions?: IpfsClient["_clientOptions"][];
    pubsubHttpClientsOptions: IpfsClient["_clientOptions"][];
    plebbitRpcClientsOptions?: string[];
    dataPath?: string;
    browserLibp2pJsPublish: ParsedPlebbitOptions["browserLibp2pJsPublish"];
    resolveAuthorAddresses?: boolean;
    chainProviders: {
        [chainTicker: string]: ChainProvider;
    };
    _storage: StorageInterface;
    stats: Stats;
    parsedPlebbitOptions: ParsedPlebbitOptions;
    private _pubsubSubscriptions;
    _clientsManager: ClientsManager;
    publishInterval: number;
    updateInterval: number;
    noData: boolean;
    private _userPlebbitOptions;
    private _storageLRUs;
    constructor(options?: PlebbitOptions);
    private _initIpfsClients;
    private _initPubsubClients;
    private _initRpcClients;
    private _initResolver;
    private _parseUrlToOption;
    _init(options: PlebbitOptions): Promise<void>;
    getSubplebbit(subplebbitAddress: string): Promise<LocalSubplebbit | RpcLocalSubplebbit | RpcRemoteSubplebbit | RemoteSubplebbit>;
    getComment(cid: string): Promise<Comment>;
    private _initMissingFields;
    private _createCommentInstance;
    createComment(options: CreateCommentOptions | CommentWithCommentUpdate | CommentIpfsType | CommentPubsubMessage | CommentType | Comment | Pick<CommentWithCommentUpdate, "cid">): Promise<Comment>;
    _canCreateNewLocalSub(): boolean;
    private _createSubplebbitRpc;
    private _createRemoteSubplebbitInstance;
    private _createLocalSub;
    createSubplebbit(options?: CreateSubplebbitOptions | SubplebbitType | SubplebbitIpfsType | InternalSubplebbitType): Promise<RemoteSubplebbit | RpcRemoteSubplebbit | RpcLocalSubplebbit | LocalSubplebbit>;
    createVote(options: CreateVoteOptions | VoteType | VotePubsubMessage): Promise<Vote>;
    createCommentEdit(options: CreateCommentEditOptions | CommentEditType): Promise<CommentEdit>;
    createSigner(createSignerOptions?: CreateSignerOptions): Promise<Signer>;
    listSubplebbits(): Promise<string[]>;
    fetchCid(cid: string): Promise<string>;
    pubsubSubscribe(subplebbitAddress: string): Promise<void>;
    pubsubUnsubscribe(subplebbitAddress: string): Promise<void>;
    resolveAuthorAddress(authorAddress: string): Promise<string>;
    _createStorageLRU(opts: Omit<LRUStorageConstructor, "plebbit">): Promise<LRUStorageInterface>;
    rpcCall(method: string, params: any[]): Promise<any>;
    destroy(): Promise<void>;
    toJSON(): any;
}
