import { LRUCache } from "lru-cache";
import { LRUStorageConstructor } from "./types.js";
import { SubplebbitIpfsType } from "./subplebbit/types.js";
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
