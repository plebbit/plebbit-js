import { Plebbit } from "../plebbit/plebbit.js";
import type { ChainTicker } from "../types.js";
import { GenericKuboRpcClient } from "./ipfs-client.js";
import { GenericKuboPubsubClient } from "./pubsub-client.js";
import { GenericChainProviderClient } from "./chain-provider-client.js";
import { GenericIpfsGatewayClient } from "./ipfs-gateway-client.js";
import { BaseClientsManager, CachedTextRecordResolve, OptionsToLoadFromGateway } from "./base-client-manager.js";
import type { SubplebbitIpfsType } from "../subplebbit/types.js";
export type ResultOfFetchingSubplebbit = {
    subplebbit: SubplebbitIpfsType;
    cid: string;
} | undefined;
export declare class ClientsManager extends BaseClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: GenericIpfsGatewayClient;
        };
        kuboRpcClients: {
            [kuboRpcClientUrl: string]: GenericKuboRpcClient;
        };
        pubsubKuboRpcClients: {
            [pubsubKuboClientUrl: string]: GenericKuboPubsubClient;
        };
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
    };
    constructor(plebbit: Plebbit);
    protected _initIpfsGateways(): void;
    protected _initKuboRpcClients(): void;
    protected _initPubsubKuboRpcClients(): void;
    protected _initChainProviders(): void;
    preFetchGateway(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewayFailure(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewaySuccess(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewayAborted(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedTextRecordResolve): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedTextRecordResolve): void;
    postResolveTextRecordFailure(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, error: Error, staleCache?: CachedTextRecordResolve): void;
    updatePubsubState(newState: GenericKuboPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateIpfsState(newState: GenericKuboRpcClient["state"]): void;
    updateGatewayState(newState: GenericIpfsGatewayClient["state"], gateway: string): void;
    updateChainProviderState(newState: GenericChainProviderClient["state"], chainTicker: ChainTicker, chainProviderUrl: string): void;
    fetchCid(cid: string): Promise<string>;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
}
