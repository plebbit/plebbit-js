import Publication from "../publication";
import { Plebbit } from "../plebbit";
import { Comment } from "../comment";
import { Chain, CommentIpfsType, CommentIpfsWithCid, CommentUpdate } from "../types";
import { Subplebbit } from "../subplebbit/subplebbit";
import { PlebbitError } from "../plebbit-error";
import { CommentIpfsClient, GenericIpfsClient, PublicationIpfsClient, SubplebbitIpfsClient } from "./ipfs-client";
import { GenericPubsubClient, PublicationPubsubClient, SubplebbitPubsubClient } from "./pubsub-client";
import { GenericChainProviderClient } from "./chain-provider-client";
import { CommentIpfsGatewayClient, GenericIpfsGatewayClient, PublicationIpfsGatewayClient, SubplebbitIpfsGatewayClient } from "./ipfs-gateway-client";
import { BaseClientsManager, LoadType } from "./base-client-manager";
import { CommentPlebbitRpcStateClient, GenericPlebbitRpcStateClient, PublicationPlebbitRpcStateClient, SubplebbitPlebbitRpcStateClient } from "./plebbit-rpc-state-client";
import { SubplebbitIpfsType } from "../subplebbit/types";
export declare class ClientsManager extends BaseClientsManager {
    protected _plebbit: Plebbit;
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: GenericIpfsGatewayClient;
        };
        ipfsClients: {
            [ipfsClientUrl: string]: GenericIpfsClient;
        };
        pubsubClients: {
            [pubsubClientUrl: string]: GenericPubsubClient;
        };
        chainProviders: Record<Chain, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: {
            [plebbitRpcClientUrl: string]: GenericPlebbitRpcStateClient;
        };
    };
    constructor(plebbit: Plebbit);
    protected _initIpfsGateways(): void;
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected _initChainProviders(): void;
    protected _initPlebbitRpcClients(): void;
    preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewayAborted(gatewayUrl: string, path: string, loadType: LoadType): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: string, chainProviderUrl: string): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: string, chainProviderUrl: string): void;
    postResolveTextRecordFailure(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: string, chainProviderUrl: string): void;
    updatePubsubState(newState: GenericPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateIpfsState(newState: GenericIpfsClient["state"]): void;
    updateGatewayState(newState: GenericIpfsGatewayClient["state"], gateway: string): void;
    updateChainProviderState(newState: GenericChainProviderClient["state"], chainTicker: string, chainProviderUrl: string): void;
    fetchCid(cid: string): Promise<string>;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
    protected _getStatePriorToResolvingSubplebbitIpfs(): "fetching-subplebbit-ipfs" | "fetching-ipfs";
}
export declare class PublicationClientsManager extends ClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: PublicationIpfsGatewayClient | CommentIpfsGatewayClient;
        };
        ipfsClients: {
            [ipfsClientUrl: string]: PublicationIpfsClient | CommentIpfsClient;
        };
        pubsubClients: {
            [pubsubClientUrl: string]: PublicationPubsubClient;
        };
        chainProviders: Record<Chain, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: Record<string, PublicationPlebbitRpcStateClient>;
    };
    _publication: Publication;
    _attemptingToResolve: boolean;
    constructor(publication: Publication);
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected _initPlebbitRpcClients(): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: string): void;
    emitError(e: PlebbitError): void;
    fetchSubplebbitForPublishing(subplebbitAddress: string): Promise<SubplebbitIpfsType>;
    updateIpfsState(newState: PublicationIpfsClient["state"] | CommentIpfsClient["state"]): void;
    updatePubsubState(newState: PublicationPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateGatewayState(newState: PublicationIpfsGatewayClient["state"], gateway: string): void;
}
export declare class CommentClientsManager extends PublicationClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: CommentIpfsGatewayClient;
        };
        ipfsClients: {
            [ipfsClientUrl: string]: CommentIpfsClient;
        };
        pubsubClients: {
            [pubsubClientUrl: string]: PublicationPubsubClient;
        };
        chainProviders: Record<Chain, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: Record<string, CommentPlebbitRpcStateClient>;
    };
    private _comment;
    constructor(comment: Comment);
    protected _initIpfsClients(): void;
    protected _initPlebbitRpcClients(): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: string): void;
    _fetchSubplebbitForCommentUpdate(): Promise<SubplebbitIpfsType>;
    _findCommentInSubplebbitPosts(subIpns: SubplebbitIpfsType, cid: string): CommentIpfsWithCid;
    _fetchParentCommentForCommentUpdate(parentCid: string): Promise<CommentIpfsWithCid>;
    _getParentsPath(subIpns: SubplebbitIpfsType): Promise<string>;
    fetchCommentUpdate(): Promise<CommentUpdate>;
    fetchCommentCid(cid: string): Promise<CommentIpfsType>;
    updateIpfsState(newState: CommentIpfsClient["state"]): void;
}
export declare class SubplebbitClientsManager extends ClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: SubplebbitIpfsGatewayClient;
        };
        ipfsClients: {
            [ipfsClientUrl: string]: SubplebbitIpfsClient;
        };
        pubsubClients: {
            [pubsubClientUrl: string]: SubplebbitPubsubClient;
        };
        chainProviders: Record<Chain, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: Record<string, SubplebbitPlebbitRpcStateClient>;
    };
    private _subplebbit;
    constructor(subplebbit: Subplebbit);
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected _initPlebbitRpcClients(): void;
    fetchSubplebbit(ipnsName: string): Promise<SubplebbitIpfsType>;
    updateIpfsState(newState: SubplebbitIpfsClient["state"]): void;
    updatePubsubState(newState: SubplebbitPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateGatewayState(newState: CommentIpfsGatewayClient["state"], gateway: string): void;
    emitError(e: PlebbitError): void;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
    protected _getStatePriorToResolvingSubplebbitIpfs(): "fetching-subplebbit-ipfs" | "fetching-ipfs";
}
