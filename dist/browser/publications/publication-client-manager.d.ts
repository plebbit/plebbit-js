import { GenericChainProviderClient } from "../clients/chain-provider-client.js";
import { PlebbitClientsManager } from "../plebbit/plebbit-client-manager.js";
import { PlebbitError } from "../plebbit-error.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import type { ChainTicker } from "../types.js";
import Publication from "./publication.js";
import { PublicationIpfsGatewayClient, PublicationKuboPubsubClient, PublicationKuboRpcClient, PublicationLibp2pJsClient, PublicationPlebbitRpcStateClient } from "./publication-clients.js";
import { CommentIpfsGatewayClient, CommentKuboRpcClient } from "./comment/comment-clients.js";
import type { SubplebbitEvents } from "../subplebbit/types.js";
export declare class PublicationClientsManager extends PlebbitClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: PublicationIpfsGatewayClient | CommentIpfsGatewayClient;
        };
        kuboRpcClients: {
            [kuboRpcUrl: string]: PublicationKuboRpcClient | CommentKuboRpcClient;
        };
        pubsubKuboRpcClients: {
            [kuboRpcUrl: string]: PublicationKuboPubsubClient;
        };
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: Record<string, PublicationPlebbitRpcStateClient>;
        libp2pJsClients: {
            [libp2pJsUrl: string]: PublicationLibp2pJsClient;
        };
    };
    _publication: Publication;
    _subplebbitForUpdating?: {
        subplebbit: RemoteSubplebbit;
        ipfsGatewayListeners?: Record<string, Parameters<RemoteSubplebbit["clients"]["ipfsGateways"][string]["on"]>[1]>;
        kuboRpcListeners?: Record<string, Parameters<RemoteSubplebbit["clients"]["kuboRpcClients"][string]["on"]>[1]>;
        libp2pJsListeners?: Record<string, Parameters<RemoteSubplebbit["clients"]["libp2pJsClients"][string]["on"]>[1]>;
        chainProviderListeners?: Record<ChainTicker, Record<string, Parameters<RemoteSubplebbit["clients"]["chainProviders"][ChainTicker][string]["on"]>[1]>>;
    } & Pick<SubplebbitEvents, "updatingstatechange" | "update" | "error">;
    constructor(publication: Publication);
    protected _initKuboRpcClients(): void;
    protected _initPubsubKuboRpcClients(): void;
    protected _initPlebbitRpcClients(): void;
    emitError(e: PlebbitError): void;
    updateKuboRpcState(newState: PublicationKuboRpcClient["state"] | CommentKuboRpcClient["state"], kuboRpcClientUrl: string): void;
    updateKuboRpcPubsubState(newState: PublicationKuboPubsubClient["state"], pubsubProvider: string): void;
    updateGatewayState(newState: PublicationIpfsGatewayClient["state"] | CommentIpfsGatewayClient["state"], gateway: string): void;
    _translateSubUpdatingStateToPublishingState(newUpdatingState: RemoteSubplebbit["updatingState"]): void;
    handleUpdatingStateChangeEventFromSub(newUpdatingState: RemoteSubplebbit["updatingState"]): void;
    handleUpdateEventFromSub(sub: RemoteSubplebbit): void;
    handleErrorEventFromSub(err: PlebbitError | Error): void;
    handleIpfsGatewaySubplebbitState(subplebbitNewGatewayState: RemoteSubplebbit["clients"]["ipfsGateways"][string]["state"], gatewayUrl: string): void;
    handleChainProviderSubplebbitState(subplebbitNewChainState: RemoteSubplebbit["clients"]["chainProviders"][ChainTicker][string]["state"], chainTicker: ChainTicker, providerUrl: string): void;
    handleKuboRpcSubplebbitState(subplebbitNewKuboRpcState: RemoteSubplebbit["clients"]["kuboRpcClients"][string]["state"], kuboRpcUrl: string): void;
    handleLibp2pJsClientSubplebbitState(subplebbitNewLibp2pJsState: RemoteSubplebbit["clients"]["libp2pJsClients"][string]["state"], libp2pJsClientKey: string): void;
    _createSubInstanceWithStateTranslation(): Promise<{
        subplebbit: RemoteSubplebbit;
        ipfsGatewayListeners?: Record<string, Parameters<RemoteSubplebbit["clients"]["ipfsGateways"][string]["on"]>[1]>;
        kuboRpcListeners?: Record<string, Parameters<RemoteSubplebbit["clients"]["kuboRpcClients"][string]["on"]>[1]>;
        libp2pJsListeners?: Record<string, Parameters<RemoteSubplebbit["clients"]["libp2pJsClients"][string]["on"]>[1]>;
        chainProviderListeners?: Record<ChainTicker, Record<string, Parameters<RemoteSubplebbit["clients"]["chainProviders"][ChainTicker][string]["on"]>[1]>>;
    } & Pick<SubplebbitEvents, "error" | "update" | "updatingstatechange">>;
    cleanUpUpdatingSubInstance(): Promise<void>;
    fetchSubplebbitForPublishingWithCacheGuard(): Promise<NonNullable<Publication["_subplebbit"]>>;
    private _loadSubplebbitForPublishingFromNetwork;
}
