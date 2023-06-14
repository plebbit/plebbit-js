import LRUCache from "lru-cache";
import { SubplebbitIpfsType } from "./types";
export declare enum CACHE_KEYS {
    SUBPLEBBIT_IPNS = 0,
    INTERNAL_SUBPLEBBIT = 1
}
export declare const subplebbitForPublishingCache: LRUCache<string, Pick<SubplebbitIpfsType, "address" | "encryption" | "pubsubTopic">>;
export declare const pageCidToSortTypesCache: LRUCache<string, string[]>;
export declare const commentValidationCache: LRUCache<string, true>;
export declare const commentUpdateValidationCache: LRUCache<string, true>;
