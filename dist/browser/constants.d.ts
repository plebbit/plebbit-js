import LRUCache from "lru-cache";
import { SubplebbitIpfsType } from "./subplebbit/types";
export declare enum CACHE_KEYS {
    SUBPLEBBIT_IPNS = 0,
    INTERNAL_SUBPLEBBIT = 1,
    PERSISTENT_DELETED_SUBPLEBBITS = 2
}
export declare const subplebbitForPublishingCache: LRUCache<string, Pick<SubplebbitIpfsType, "encryption" | "pubsubTopic" | "address">>;
export declare const pageCidToSortTypesCache: LRUCache<string, string[]>;
export declare const commentValidationCache: LRUCache<string, true>;
export declare const commentUpdateValidationCache: LRUCache<string, true>;
