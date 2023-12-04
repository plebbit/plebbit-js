import LRUCache from "lru-cache";
import { LRUStorageConstructor } from "./types";
import { SubplebbitIpfsType } from "./subplebbit/types";
export enum STORAGE_KEYS {
    INTERNAL_SUBPLEBBIT, // InternalSubplebbitType
    PERSISTENT_DELETED_SUBPLEBBITS // These are basically sub db files that we're unable to remove for some reason on windows
}

// Configs for LRU storage

export const postTimestampConfig: Omit<LRUStorageConstructor, "plebbit"> = { cacheName: "postTimestamp", maxItems: 500 };

export const commentPostUpdatesParentsPathConfig: Omit<LRUStorageConstructor, "plebbit"> = {
    cacheName: "commentPostUpdatesParentsPath",
    maxItems: 500
};

// Memory caches
export const subplebbitForPublishingCache = new LRUCache<string, Pick<SubplebbitIpfsType, "address" | "encryption" | "pubsubTopic">>({
    max: 100,
    ttl: 600000
}); // Cache for only 10 mins, should  be moved to LRU+storage

export const pageCidToSortTypesCache = new LRUCache<string, string[]>({ max: 500 });
