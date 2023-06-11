/// <reference types="tiny-lru" />
import { SubplebbitIpfsType } from "./types";
export declare enum CACHE_KEYS {
    SUBPLEBBIT_IPNS = 0,
    INTERNAL_SUBPLEBBIT = 1
}
export declare const subplebbitForPublishingCache: import("tiny-lru").Lru<Pick<SubplebbitIpfsType, "address" | "encryption" | "pubsubTopic">>;
export declare const pageCidToSortTypesCache: import("tiny-lru").Lru<string[]>;
