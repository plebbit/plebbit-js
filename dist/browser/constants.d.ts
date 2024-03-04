import { LRUCache } from "lru-cache";
import { LRUStorageConstructor } from "./types.js";
import { SubplebbitIpfsType } from "./subplebbit/types.js";
import { PublicClient as ViemClient } from "viem";
import { Plebbit } from "./plebbit.js";
export declare enum STORAGE_KEYS {
    INTERNAL_SUBPLEBBIT = 0,// InternalSubplebbitType
    PERSISTENT_DELETED_SUBPLEBBITS = 1
}
export declare const postTimestampConfig: Omit<LRUStorageConstructor, "plebbit">;
export declare const commentPostUpdatesParentsPathConfig: Omit<LRUStorageConstructor, "plebbit">;
export declare const subplebbitForPublishingCache: LRUCache<string, Pick<SubplebbitIpfsType, "encryption" | "pubsubTopic" | "address">, unknown>;
export declare const pageCidToSortTypesCache: LRUCache<string, string[], unknown>;
export declare const ensResolverPromiseCache: LRUCache<string, Promise<string>, unknown>;
export declare const gatewayFetchPromiseCache: LRUCache<string, Promise<string>, unknown>;
export declare const p2pIpnsPromiseCache: LRUCache<string, Promise<string>, unknown>;
export declare const p2pCidPromiseCache: LRUCache<string, Promise<string>, unknown>;
export declare const subplebbitVerificationCache: LRUCache<string, boolean, unknown>;
export declare const pageVerificationCache: LRUCache<string, boolean, unknown>;
export declare const commentUpdateVerificationCache: LRUCache<string, boolean, unknown>;
export declare const _viemClients: Record<string, ViemClient>;
export declare const getViemClient: (plebbit: Plebbit, chainTicker: string, chainProviderUrl: string) => Promise<ViemClient>;
