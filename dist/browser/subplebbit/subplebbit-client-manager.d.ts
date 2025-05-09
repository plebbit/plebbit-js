import { RetryOperation } from "retry";
import { CachedTextRecordResolve } from "../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../clients/chain-provider-client.js";
import { ClientsManager, ResultOfFetchingSubplebbit } from "../clients/client-manager.js";
import { CommentIpfsGatewayClient, SubplebbitIpfsGatewayClient } from "../clients/ipfs-gateway-client.js";
import { SubplebbitPlebbitRpcStateClient } from "../clients/rpc-client/plebbit-rpc-state-client.js";
import { PlebbitError } from "../plebbit-error.js";
import { ChainTicker } from "../types.js";
import { SubplebbitIpfsType } from "./types.js";
import { SubplebbitKuboRpcClient } from "../clients/ipfs-client.js";
import { SubplebbitKuboPubsubClient } from "../clients/pubsub-client.js";
import { LimitedSet } from "../general-util/limited-set.js";
export declare const MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS: number;
export declare class SubplebbitClientsManager extends ClientsManager {
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
    };
    private _subplebbit;
    _ipnsLoadingOperation?: RetryOperation;
    _updateTimeout?: NodeJS.Timeout;
    _updateCidsAlreadyLoaded: LimitedSet<string>;
    constructor(subplebbit: SubplebbitClientsManager["_subplebbit"]);
    protected _initKuboRpcClients(): void;
    protected _initPubsubKuboRpcClients(): void;
    protected _initPlebbitRpcClients(): void;
    updateIpfsState(newState: SubplebbitKuboRpcClient["state"]): void;
    updatePubsubState(newState: SubplebbitKuboPubsubClient["state"], pubsubProvider: string | undefined): void;
    updateGatewayState(newState: CommentIpfsGatewayClient["state"], gateway: string): void;
    emitError(e: PlebbitError): void;
    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns";
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedTextRecordResolve): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedTextRecordResolve): void;
    protected _getSubplebbitAddressFromInstance(): string;
    private _retryLoadingSubplebbitAddress;
    updateOnce(): Promise<void>;
    startUpdatingLoop(): Promise<void>;
    stopUpdatingLoop(): Promise<void>;
    fetchNewUpdateForSubplebbit(subAddress: SubplebbitIpfsType["address"]): Promise<ResultOfFetchingSubplebbit>;
    private _fetchSubplebbitIpnsP2PAndVerify;
    private _fetchSubplebbitFromGateways;
    private _findErrorInSubplebbitRecord;
}
