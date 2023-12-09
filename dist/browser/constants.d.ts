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
