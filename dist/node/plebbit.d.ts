import { StorageInterface, ChainProvider, CommentEditType, CommentIpfsType, CommentPubsubMessage, CommentType, CommentWithCommentUpdate, CreateCommentEditOptions, CreateCommentOptions, CreateVoteOptions, GatewayClient, IpfsClient, PlebbitEvents, PlebbitOptions, PubsubClient, VotePubsubMessage, VoteType, ParsedPlebbitOptions } from "./types";
import { Comment } from "./comment";
import { Subplebbit } from "./subplebbit/subplebbit";
import Vote from "./vote";
import { Signer } from "./signer";
import { Resolver } from "./resolver";
import { CommentEdit } from "./comment-edit";
import { Options as IpfsHttpClientOptions } from "ipfs-http-client";
import { TypedEmitter } from "tiny-typed-emitter";
import { CreateSignerOptions } from "./signer/constants";
import Stats from "./stats";
import { ClientsManager } from "./clients/client-manager";
import PlebbitRpcClient from "./clients/plebbit-rpc-client";
import { GenericPlebbitRpcStateClient } from "./clients/plebbit-rpc-state-client";
import { CreateSubplebbitOptions, InternalSubplebbitType, SubplebbitIpfsType, SubplebbitType } from "./subplebbit/types";
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
    ipfsHttpClientsOptions?: IpfsHttpClientOptions[];
    pubsubHttpClientsOptions: IpfsHttpClientOptions[];
    plebbitRpcClientsOptions?: string[];
    dataPath?: string;
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
    constructor(options?: PlebbitOptions);
    private _initIpfsClients;
    private _initPubsubClients;
    private _initRpcClients;
    private _initResolver;
    private _parseUrlToOption;
    _init(options: PlebbitOptions): Promise<void>;
    getSubplebbit(subplebbitAddress: string): Promise<Subplebbit>;
    getComment(cid: string): Promise<Comment>;
    private _initMissingFields;
    private _createCommentInstance;
    createComment(options: CreateCommentOptions | CommentWithCommentUpdate | CommentIpfsType | CommentPubsubMessage | CommentType | Comment | Pick<CommentWithCommentUpdate, "cid">): Promise<Comment>;
    _canCreateNewLocalSub(): boolean;
    private _createSubplebbitRpc;
    private _createRemoteSubplebbitInstance;
    private _createLocalSub;
    createSubplebbit(options?: CreateSubplebbitOptions | SubplebbitType | SubplebbitIpfsType | InternalSubplebbitType): Promise<Subplebbit>;
    createVote(options: CreateVoteOptions | VoteType | VotePubsubMessage): Promise<Vote>;
    createCommentEdit(options: CreateCommentEditOptions | CommentEditType): Promise<CommentEdit>;
    createSigner(createSignerOptions?: CreateSignerOptions): Promise<Signer>;
    listSubplebbits(): Promise<string[]>;
    fetchCid(cid: string): Promise<string>;
    pubsubSubscribe(subplebbitAddress: string): Promise<void>;
    pubsubUnsubscribe(subplebbitAddress: string): Promise<void>;
    resolveAuthorAddress(authorAddress: string): Promise<string>;
    destroy(): Promise<void>;
    toJSON(): any;
}
