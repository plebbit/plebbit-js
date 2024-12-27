import Publication from "../publications/publication.js";
import { Plebbit } from "../plebbit/plebbit.js";
import { Comment } from "../publications/comment/comment.js";
import type { ChainTicker } from "../types.js";
import { PlebbitError } from "../plebbit-error.js";
import { CommentIpfsClient, GenericIpfsClient, PublicationIpfsClient, SubplebbitIpfsClient } from "./ipfs-client.js";
import { GenericPubsubClient, PublicationPubsubClient, SubplebbitPubsubClient } from "./pubsub-client.js";
import { GenericChainProviderClient } from "./chain-provider-client.js";
import { CommentIpfsGatewayClient, GenericIpfsGatewayClient, PublicationIpfsGatewayClient, SubplebbitIpfsGatewayClient } from "./ipfs-gateway-client.js";
import { BaseClientsManager, CachedResolve, OptionsToLoadFromGateway } from "./base-client-manager.js";
import { CommentPlebbitRpcStateClient, PublicationPlebbitRpcStateClient, SubplebbitPlebbitRpcStateClient } from "./rpc-client/plebbit-rpc-state-client.js";
import type { SubplebbitIpfsType } from "../subplebbit/types.js";
import type { CommentIpfsType, CommentUpdateType } from "../publications/comment/types.js";
type ResultOfFetchingSubplebbit = {
    subplebbit: SubplebbitIpfsType;
    cid: string;
};
export declare class ClientsManager extends BaseClientsManager {
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
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
    };
    constructor(plebbit: Plebbit);
    protected _initIpfsGateways(): void;
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected _initChainProviders(): void;
    preFetchGateway(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewayFailure(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewaySuccess(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewayAborted(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedResolve): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedResolve): void;
    postResolveTextRecordFailure(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, error: Error, staleCache?: CachedResolve): void;
    updatePubsubState(newState: GenericPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateIpfsState(newState: GenericIpfsClient["state"]): void;
    updateGatewayState(newState: GenericIpfsGatewayClient["state"], gateway: string): void;
    updateChainProviderState(newState: GenericChainProviderClient["state"], chainTicker: ChainTicker, chainProviderUrl: string): void;
    fetchCid(cid: string): Promise<string>;
    private _findErrorInSubplebbitRecord;
    fetchSubplebbit(subAddress: string): Promise<ResultOfFetchingSubplebbit>;
    private _fetchSubplebbitIpnsP2PAndVerify;
    private _fetchSubplebbitIpns;
    private _fetchSubplebbitFromGateways;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
    protected _getSubplebbitAddressFromInstance(): string;
    protected postFetchSubplebbitInvalidRecord(subRawJson: string, subError: PlebbitError): void;
    protected preFetchSubplebbitIpns(subIpnsName: string): void;
    protected preResolveSubplebbitIpnsP2P(subIpnsName: string): void;
    protected postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string): void;
    protected postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError): void;
    protected postFetchSubplebbitStringJsonP2PSuccess(): void;
    protected postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError): void;
    protected postFetchSubplebbitIpfsSuccess(subRes: ResultOfFetchingSubplebbit): void;
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
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: Record<string, PublicationPlebbitRpcStateClient>;
    };
    _publication: Publication;
    constructor(publication: Publication);
    protected _initIpfsClients(): void;
    protected _initPubsubClients(): void;
    protected _initPlebbitRpcClients(): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedResolve): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedResolve): void;
    emitError(e: PlebbitError): void;
    updateIpfsState(newState: PublicationIpfsClient["state"] | CommentIpfsClient["state"]): void;
    updatePubsubState(newState: PublicationPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateGatewayState(newState: PublicationIpfsGatewayClient["state"], gateway: string): void;
    protected _getSubplebbitAddressFromInstance(): string;
    protected preFetchSubplebbitIpns(subIpnsName: string): void;
    protected preResolveSubplebbitIpnsP2P(subIpnsName: string): void;
    protected postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string): void;
    protected postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError): void;
    protected postFetchSubplebbitStringJsonP2PSuccess(): void;
    protected postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError): void;
    protected postFetchSubplebbitIpfsSuccess(subJson: ResultOfFetchingSubplebbit): void;
    protected postFetchSubplebbitInvalidRecord(subJson: string, subError: PlebbitError): void;
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
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: Record<string, CommentPlebbitRpcStateClient>;
    };
    private _comment;
    constructor(comment: Comment);
    protected _initIpfsClients(): void;
    protected _initPlebbitRpcClients(): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedResolve): void;
    _findCommentInSubplebbitPosts(subIpns: SubplebbitIpfsType, commentCidToLookFor: string): {
        comment: CommentIpfsType;
        commentUpdate: CommentUpdateType;
    } | undefined;
    _fetchParentCommentForCommentUpdate(parentCid: string): Promise<{
        comment: CommentIpfsType;
        commentUpdate: Pick<CommentUpdateType, "cid">;
    }>;
    _getParentsPath(subIpns: SubplebbitIpfsType): Promise<string>;
    private _calculatePathForCommentUpdate;
    private _fetchCommentUpdateIpfsP2P;
    _shouldWeFetchCommentUpdateFromNextTimestamp(err: PlebbitError): boolean;
    private _throwIfCommentUpdateHasInvalidSignature;
    private _fetchCommentUpdateFromGateways;
    fetchCommentUpdate(): Promise<CommentUpdateType>;
    private _fetchRawCommentCidIpfsP2P;
    private _fetchCommentIpfsFromGateways;
    private _throwIfCommentIpfsIsInvalid;
    fetchAndVerifyCommentCid(cid: string): Promise<CommentIpfsType>;
    updateIpfsState(newState: CommentIpfsClient["state"]): void;
    protected _isPublishing(): boolean;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedResolve): void;
    protected preFetchSubplebbitIpns(subIpnsName: string): void;
    protected preResolveSubplebbitIpnsP2P(subIpnsName: string): void;
    protected postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string): void;
    protected postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError): void;
    protected postFetchSubplebbitStringJsonP2PSuccess(): void;
    protected postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError): void;
    protected postFetchSubplebbitIpfsSuccess(subJson: ResultOfFetchingSubplebbit): void;
    protected postFetchSubplebbitInvalidRecord(subJson: string, subError: PlebbitError): void;
    postFetchGatewaySuccess(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
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
        chainProviders: Record<ChainTicker, {
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
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedResolve): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedResolve): void;
    protected _getSubplebbitAddressFromInstance(): string;
    protected preFetchSubplebbitIpns(subIpnsName: string): void;
    protected preResolveSubplebbitIpnsP2P(subIpnsName: string): void;
    protected postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string): void;
    protected postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError): void;
    protected postFetchSubplebbitStringJsonP2PSuccess(): void;
    protected postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError): void;
    protected postFetchSubplebbitIpfsSuccess(subJson: ResultOfFetchingSubplebbit): void;
    protected postFetchSubplebbitInvalidRecord(subJson: string, subError: PlebbitError): void;
}
export {};
