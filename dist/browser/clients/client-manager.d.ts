import Publication from "../publication.js";
import { Plebbit } from "../plebbit.js";
import { Comment } from "../comment.js";
import { Chain, CommentIpfsType, CommentIpfsWithCid, CommentUpdate } from "../types.js";
import { PlebbitError } from "../plebbit-error.js";
import { CommentIpfsClient, GenericIpfsClient, PublicationIpfsClient, SubplebbitIpfsClient } from "./ipfs-client.js";
import { GenericPubsubClient, PublicationPubsubClient, SubplebbitPubsubClient } from "./pubsub-client.js";
import { GenericChainProviderClient } from "./chain-provider-client.js";
import { CommentIpfsGatewayClient, GenericIpfsGatewayClient, PublicationIpfsGatewayClient, SubplebbitIpfsGatewayClient } from "./ipfs-gateway-client.js";
import { BaseClientsManager, LoadType } from "./base-client-manager.js";
import { CommentPlebbitRpcStateClient, GenericPlebbitRpcStateClient, PublicationPlebbitRpcStateClient, SubplebbitPlebbitRpcStateClient } from "./plebbit-rpc-state-client.js";
import { SubplebbitIpfsType } from "../subplebbit/types.js";
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
    private _findErrorInSubplebbitRecord;
    fetchSubplebbit(subAddress: string): Promise<SubplebbitIpfsType>;
    private _fetchSubplebbitIpns;
    private _fetchSubplebbitFromGateways;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
    protected _getSubplebbitAddressFromInstance(): string;
    protected postFetchSubplebbitInvalidRecord(subJson: SubplebbitIpfsType, subError: PlebbitError): void;
    protected preResolveSubplebbitIpns(subIpnsName: string): void;
    protected preResolveSubplebbitIpnsP2P(subIpnsName: string): void;
    protected postResolveSubplebbitIpnsP2P(subIpnsName: string, subplebbitCid: string): void;
    protected postFetchSubplebbitJsonP2P(subJson: SubplebbitIpfsType): void;
    protected postFetchSubplebbitJsonSuccess(subJson: SubplebbitIpfsType): void;
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
    constructor(publication: Publication);
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected _initPlebbitRpcClients(): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: string): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: string, chainProviderUrl: string): void;
    emitError(e: PlebbitError): void;
    updateIpfsState(newState: PublicationIpfsClient["state"] | CommentIpfsClient["state"]): void;
    updatePubsubState(newState: PublicationPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateGatewayState(newState: PublicationIpfsGatewayClient["state"], gateway: string): void;
    protected _getSubplebbitAddressFromInstance(): string;
    protected postFetchSubplebbitInvalidRecord(subJson: SubplebbitIpfsType, subError: PlebbitError): void;
    protected preResolveSubplebbitIpns(subIpnsName: string): void;
    protected preResolveSubplebbitIpnsP2P(subIpnsName: string): void;
    protected postResolveSubplebbitIpnsP2P(subIpnsName: string, subplebbitCid: string): void;
    protected postFetchSubplebbitJsonP2P(subJson: SubplebbitIpfsType): void;
    protected postFetchSubplebbitJsonSuccess(subJson: SubplebbitIpfsType): void;
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
    _findCommentInSubplebbitPosts(subIpns: SubplebbitIpfsType, cid: string): CommentIpfsWithCid;
    _fetchParentCommentForCommentUpdate(parentCid: string): Promise<CommentIpfsWithCid>;
    _getParentsPath(subIpns: SubplebbitIpfsType): Promise<string>;
    fetchCommentUpdate(): Promise<CommentUpdate>;
    fetchCommentCid(cid: string): Promise<CommentIpfsType>;
    updateIpfsState(newState: CommentIpfsClient["state"]): void;
    protected _isPublishing(): boolean;
    protected postFetchSubplebbitInvalidRecord(subJson: SubplebbitIpfsType, subError: PlebbitError): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: string, chainProviderUrl: string): void;
    protected preResolveSubplebbitIpns(subIpnsName: string): void;
    protected preResolveSubplebbitIpnsP2P(subIpnsName: string): void;
    protected postResolveSubplebbitIpnsP2P(subIpnsName: string, subplebbitCid: string): void;
    protected postFetchSubplebbitJsonP2P(subJson: SubplebbitIpfsType): void;
    protected postFetchSubplebbitJsonSuccess(subJson: SubplebbitIpfsType): void;
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
    constructor(subplebbit: SubplebbitClientsManager["_subplebbit"]);
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected _initPlebbitRpcClients(): void;
    updateIpfsState(newState: SubplebbitIpfsClient["state"]): void;
    updatePubsubState(newState: SubplebbitPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateGatewayState(newState: CommentIpfsGatewayClient["state"], gateway: string): void;
    emitError(e: PlebbitError): void;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
    protected postFetchSubplebbitInvalidRecord(subJson: SubplebbitIpfsType, subError: PlebbitError): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: string, chainProviderUrl: string): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: string, chainProviderUrl: string): void;
    protected _getSubplebbitAddressFromInstance(): string;
    protected preResolveSubplebbitIpns(subIpnsName: string): void;
    protected preResolveSubplebbitIpnsP2P(subIpnsName: string): void;
    protected postResolveSubplebbitIpnsP2P(subIpnsName: string, subplebbitCid: string): void;
    protected postFetchSubplebbitJsonP2P(subJson: SubplebbitIpfsType): void;
    protected postFetchSubplebbitJsonSuccess(subJson: SubplebbitIpfsType): void;
}
