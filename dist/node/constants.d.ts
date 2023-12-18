import LRUCache from "lru-cache";
import { LRUStorageConstructor } from "./types";
import { SubplebbitIpfsType } from "./subplebbit/types";
export declare enum STORAGE_KEYS {
    INTERNAL_SUBPLEBBIT = 0,
    PERSISTENT_DELETED_SUBPLEBBITS = 1
}
export declare const postTimestampConfig: Omit<LRUStorageConstructor, "plebbit">;
export declare const commentPostUpdatesParentsPathConfig: Omit<LRUStorageConstructor, "plebbit">;
export declare const subplebbitForPublishingCache: LRUCache<string, Pick<SubplebbitIpfsType, "encryption" | "pubsubTopic" | "address">>;
export declare const pageCidToSortTypesCache: LRUCache<string, string[]>;
export declare const ensResolverPromiseCache: LRUCache<string, Promise<string>>;
export declare const gatewayFetchPromiseCache: LRUCache<string, Promise<string>>;
export declare const p2pIpnsPromiseCache: LRUCache<string, Promise<string>>;
export declare const p2pCidPromiseCache: LRUCache<string, Promise<string>>;
export declare const subplebbitVerificationCache: LRUCache<string, boolean>;
export declare const pageVerificationCache: LRUCache<string, boolean>;
export declare const commentUpdateVerificationCache: LRUCache<string, boolean>;
