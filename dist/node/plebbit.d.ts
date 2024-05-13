import { StorageInterface, ChainProvider, CommentIpfsType, CommentPubsubMessage, CreateCommentEditOptions, CreateCommentOptions, CreateVoteOptions, GatewayClient, IpfsClient, PlebbitEvents, PlebbitOptions, PubsubClient, VotePubsubMessage, ParsedPlebbitOptions, LRUStorageInterface, LRUStorageConstructor, CommentEditPubsubMessage, CommentIpfsWithCid, CommentTypeJson, DecryptedChallengeRequestComment, DecryptedChallengeRequestVote, DecryptedChallengeRequestCommentEdit } from "./types.js";
import { Comment } from "./publications/comment/comment.js";
import Vote from "./publications/vote.js";
import { CommentEdit } from "./publications/comment-edit.js";
import { TypedEmitter } from "tiny-typed-emitter";
import { CreateSignerOptions } from "./signer/constants.js";
import Stats from "./stats.js";
import { ClientsManager } from "./clients/client-manager.js";
import PlebbitRpcClient from "./clients/plebbit-rpc-client.js";
import { GenericPlebbitRpcStateClient } from "./clients/plebbit-rpc-state-client.js";
import { CreateNewLocalSubplebbitUserOptions, CreateRemoteSubplebbitOptions, InternalSubplebbitType, RemoteSubplebbitJsonType, SubplebbitIpfsType } from "./subplebbit/types.js";
import { RemoteSubplebbit } from "./subplebbit/remote-subplebbit.js";
import { RpcRemoteSubplebbit } from "./subplebbit/rpc-remote-subplebbit.js";
import { RpcLocalSubplebbit } from "./subplebbit/rpc-local-subplebbit.js";
import { LocalSubplebbit } from "./runtime/node/subplebbit/local-subplebbit.js";
export declare class Plebbit extends TypedEmitter<PlebbitEvents> implements PlebbitOptions {
    plebbitRpcClient?: PlebbitRpcClient;
    ipfsHttpClientsOptions?: ParsedPlebbitOptions["ipfsHttpClientsOptions"];
    pubsubHttpClientsOptions: ParsedPlebbitOptions["pubsubHttpClientsOptions"];
    plebbitRpcClientsOptions?: ParsedPlebbitOptions["plebbitRpcClientsOptions"];
    dataPath?: ParsedPlebbitOptions["dataPath"];
    browserLibp2pJsPublish: ParsedPlebbitOptions["browserLibp2pJsPublish"];
    resolveAuthorAddresses: ParsedPlebbitOptions["resolveAuthorAddresses"];
    chainProviders: ParsedPlebbitOptions["chainProviders"];
    _storage: StorageInterface;
    stats: Stats;
    parsedPlebbitOptions: ParsedPlebbitOptions;
    publishInterval: ParsedPlebbitOptions["publishInterval"];
    updateInterval: ParsedPlebbitOptions["updateInterval"];
    noData: ParsedPlebbitOptions["noData"];
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
    private _pubsubSubscriptions;
    _clientsManager: ClientsManager;
    private _userPlebbitOptions;
    private _storageLRUs;
    constructor(options?: PlebbitOptions);
    private _initIpfsClients;
    private _initPubsubClients;
    private _initRpcClients;
    private _initChainProviders;
    private _initIpfsGateways;
    private _parseUrlToOption;
    _init(options: PlebbitOptions): Promise<void>;
    getSubplebbit(subplebbitAddress: string): Promise<RemoteSubplebbit>;
    getComment(cid: string): Promise<Comment>;
    private _initMissingFieldsOfPublicationBeforeSigning;
    private _createCommentInstanceFromExistingCommentInstance;
    createComment(options: CreateCommentOptions | CommentTypeJson | CommentIpfsType | CommentPubsubMessage | DecryptedChallengeRequestComment | Comment | Pick<CommentIpfsWithCid, "cid"> | Pick<CommentIpfsWithCid, "cid" | "subplebbitAddress">): Promise<Comment>;
    _canCreateNewLocalSub(): boolean;
    private _createSubplebbitRpc;
    private _createRemoteSubplebbitInstance;
    private _createLocalSub;
    createSubplebbit(options?: CreateNewLocalSubplebbitUserOptions | CreateRemoteSubplebbitOptions | RemoteSubplebbitJsonType | SubplebbitIpfsType | InternalSubplebbitType | RemoteSubplebbit | RpcLocalSubplebbit | RpcRemoteSubplebbit | LocalSubplebbit): Promise<RemoteSubplebbit | RpcRemoteSubplebbit | RpcLocalSubplebbit | LocalSubplebbit>;
    createVote(options: CreateVoteOptions | VotePubsubMessage | DecryptedChallengeRequestVote): Promise<Vote>;
    createCommentEdit(options: CreateCommentEditOptions | CommentEditPubsubMessage | DecryptedChallengeRequestCommentEdit): Promise<CommentEdit>;
    createSigner(createSignerOptions?: CreateSignerOptions): Promise<import("./signer/index.js").SignerWithPublicKeyAddress>;
    listSubplebbits(): Promise<string[]>;
    fetchCid(cid: string): Promise<string>;
    pubsubSubscribe(subplebbitAddress: string): Promise<void>;
    pubsubUnsubscribe(subplebbitAddress: string): Promise<void>;
    resolveAuthorAddress(authorAddress: string): Promise<string | null>;
    _createStorageLRU(opts: Omit<LRUStorageConstructor, "plebbit">): Promise<LRUStorageInterface>;
    rpcCall(method: string, params: any[]): Promise<any>;
    destroy(): Promise<void>;
    toJSON(): undefined;
}
