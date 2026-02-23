import { RetryOperation } from "retry";
import { CachedTextRecordResolve } from "../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../clients/chain-provider-client.js";
import { PlebbitClientsManager } from "../plebbit/plebbit-client-manager.js";
import { PlebbitError } from "../plebbit-error.js";
import { ChainTicker, ResultOfFetchingSubplebbit } from "../types.js";
import type { SubplebbitIpfsType } from "./types.js";
import { LimitedSet } from "../general-util/limited-set.js";
import { SubplebbitIpfsGatewayClient, SubplebbitKuboPubsubClient, SubplebbitKuboRpcClient, SubplebbitLibp2pJsClient, SubplebbitPlebbitRpcStateClient } from "./subplebbit-clients.js";
export declare const MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS: number;
export declare class SubplebbitClientsManager extends PlebbitClientsManager {
    clients: {
        ipfsGateways: {
            [ipfsGatewayUrl: string]: SubplebbitIpfsGatewayClient;
        };
        kuboRpcClients: {
            [kuboRpcClientUrl: string]: SubplebbitKuboRpcClient;
        };
        pubsubKuboRpcClients: {
            [pubsubClientUrl: string]: SubplebbitKuboPubsubClient;
        };
        chainProviders: Record<ChainTicker, {
            [chainProviderUrl: string]: GenericChainProviderClient;
        }>;
        plebbitRpcClients: Record<string, SubplebbitPlebbitRpcStateClient>;
        libp2pJsClients: {
            [libp2pJsClientUrl: string]: SubplebbitLibp2pJsClient;
        };
    };
    private _subplebbit;
    _ipnsLoadingOperation?: RetryOperation;
    _updateCidsAlreadyLoaded: LimitedSet<string>;
    constructor(subplebbit: SubplebbitClientsManager["_subplebbit"]);
    protected _initKuboRpcClients(): void;
    protected _initPubsubKuboRpcClients(): void;
    protected _initLibp2pJsClients(): void;
    protected _initPlebbitRpcClients(): void;
    updateKuboRpcState(newState: SubplebbitKuboRpcClient["state"], kuboRpcClientUrl: string): void;
    updateKuboRpcPubsubState(newState: SubplebbitKuboPubsubClient["state"], pubsubProvider: string): void;
    updateGatewayState(newState: SubplebbitIpfsGatewayClient["state"], gateway: string): void;
    updateLibp2pJsClientState(newState: SubplebbitLibp2pJsClient["state"], libp2pJsClientUrl: string): void;
    emitError(e: PlebbitError): void;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedTextRecordResolve): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedTextRecordResolve): void;
    protected _getSubplebbitAddressFromInstance(): string;
    private _areEquivalentSubplebbitAddresses;
    private _retryLoadingSubplebbitAddress;
    updateOnce(): Promise<void>;
    startUpdatingLoop(): Promise<void>;
    stopUpdatingLoop(): Promise<void>;
    fetchNewUpdateForSubplebbit(subAddress: SubplebbitIpfsType["address"]): Promise<ResultOfFetchingSubplebbit>;
    private _fetchSubplebbitIpnsP2PAndVerify;
    private _fetchSubplebbitFromGateways;
    private _findErrorInSubplebbitRecord;
}
