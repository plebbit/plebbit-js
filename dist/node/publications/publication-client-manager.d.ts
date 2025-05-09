import { GenericChainProviderClient } from "../clients/chain-provider-client.js";
import { ClientsManager } from "../clients/client-manager.js";
import { CommentKuboRpcClient, PublicationKuboRpcClient } from "../clients/ipfs-client.js";
import { CommentIpfsGatewayClient, PublicationIpfsGatewayClient } from "../clients/ipfs-gateway-client.js";
import { PublicationKuboPubsubClient } from "../clients/pubsub-client.js";
import { PublicationPlebbitRpcStateClient } from "../clients/rpc-client/plebbit-rpc-state-client.js";
import { PlebbitError } from "../plebbit-error.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import { ChainTicker, SubplebbitEvents } from "../types.js";
import Publication from "./publication.js";
export declare class PublicationClientsManager extends ClientsManager {
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
    };
    _publication: Publication;
    _subplebbitForUpdating?: {
        subplebbit: RemoteSubplebbit;
        ipfsGatewayListeners?: Record<string, Parameters<RemoteSubplebbit["clients"]["ipfsGateways"][string]["on"]>[1]>;
        kuboRpcListeners?: Record<string, Parameters<RemoteSubplebbit["clients"]["kuboRpcClients"][string]["on"]>[1]>;
        chainProviderListeners?: Record<ChainTicker, Record<string, Parameters<RemoteSubplebbit["clients"]["chainProviders"][ChainTicker][string]["on"]>[1]>>;
    } & Pick<SubplebbitEvents, "updatingstatechange" | "update" | "error">;
    constructor(publication: Publication);
    protected _initKuboRpcClients(): void;
    protected _initPubsubKuboRpcClients(): void;
    protected _initPlebbitRpcClients(): void;
    emitError(e: PlebbitError): void;
    updateIpfsState(newState: PublicationKuboRpcClient["state"] | CommentKuboRpcClient["state"]): void;
    updatePubsubState(newState: PublicationKuboPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateGatewayState(newState: PublicationIpfsGatewayClient["state"], gateway: string): void;
    _translateSubUpdatingStateToPublishingState(newUpdatingState: RemoteSubplebbit["updatingState"]): void;
    handleUpdatingStateChangeEventFromSub(newUpdatingState: RemoteSubplebbit["updatingState"]): void;
    handleUpdateEventFromSub(sub: RemoteSubplebbit): void;
    handleErrorEventFromSub(err: PlebbitError | Error): void;
    handleIpfsGatewaySubplebbitState(subplebbitNewGatewayState: RemoteSubplebbit["clients"]["ipfsGateways"][string]["state"], gatewayUrl: string): void;
    handleChainProviderSubplebbitState(subplebbitNewChainState: RemoteSubplebbit["clients"]["chainProviders"][ChainTicker][string]["state"], chainTicker: ChainTicker, providerUrl: string): void;
    handleKuboRpcSubplebbitState(subplebbitNewKuboRpcState: RemoteSubplebbit["clients"]["kuboRpcClients"][string]["state"], kuboRpcUrl: string): void;
    _createSubInstanceWithStateTranslation(): Promise<{
        subplebbit: RemoteSubplebbit;
        ipfsGatewayListeners?: Record<string, Parameters<RemoteSubplebbit["clients"]["ipfsGateways"][string]["on"]>[1]>;
        kuboRpcListeners?: Record<string, Parameters<RemoteSubplebbit["clients"]["kuboRpcClients"][string]["on"]>[1]>;
        chainProviderListeners?: Record<ChainTicker, Record<string, Parameters<RemoteSubplebbit["clients"]["chainProviders"][ChainTicker][string]["on"]>[1]>>;
    } & Pick<SubplebbitEvents, "error" | "updatingstatechange" | "update">>;
    cleanUpUpdatingSubInstance(): Promise<void>;
}
