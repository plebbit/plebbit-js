import { Plebbit } from "./plebbit.js";
import type { ChainTicker } from "../types.js";
import { GenericChainProviderClient } from "../clients/chain-provider-client.js";
import { BaseClientsManager, CachedTextRecordResolve, OptionsToLoadFromGateway } from "../clients/base-client-manager.js";
import { PlebbitIpfsGatewayClient, PlebbitKuboRpcClient, PlebbitLibp2pJsClient } from "./plebbit-clients.js";
import { GenericStateClient } from "../generic-state-client.js";
export declare class PlebbitClientsManager extends BaseClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: PlebbitIpfsGatewayClient;
        };
        kuboRpcClients: {
            [kuboRpcClientUrl: string]: PlebbitKuboRpcClient;
        };
        pubsubKuboRpcClients: {
            [pubsubKuboClientUrl: string]: GenericStateClient<string>;
        };
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        libp2pJsClients: {
            [libp2pJsClientKey: string]: PlebbitLibp2pJsClient;
        };
    };
    constructor(plebbit: Plebbit);
    protected _initIpfsGateways(): void;
    protected _initKuboRpcClients(): void;
    protected _initPubsubKuboRpcClients(): void;
    protected _initLibp2pJsClients(): void;
    protected _initChainProviders(): void;
    preFetchGateway(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewayFailure(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewaySuccess(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewayAborted(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedTextRecordResolve): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedTextRecordResolve): void;
    postResolveTextRecordFailure(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, error: Error, staleCache?: CachedTextRecordResolve): void;
    updateKuboRpcPubsubState(newState: PlebbitClientsManager["clients"]["pubsubKuboRpcClients"][string]["state"], pubsubProvider: string): void;
    updateKuboRpcState(newState: PlebbitClientsManager["clients"]["kuboRpcClients"][string]["state"], kuboRpcClientUrl: string): void;
    updateLibp2pJsClientState(newState: PlebbitClientsManager["clients"]["libp2pJsClients"][string]["state"], libp2pJsClientKey: string): void;
    updateGatewayState(newState: PlebbitClientsManager["clients"]["ipfsGateways"][string]["state"], gateway: string): void;
    updateChainProviderState(newState: GenericChainProviderClient["state"], chainTicker: ChainTicker, chainProviderUrl: string): void;
    fetchCid(cid: string): Promise<string>;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
}
