import LRUCache from "lru-cache";
import { SubplebbitIpfsType } from "./subplebbit/types";
export enum STORAGE_KEYS {
    INTERNAL_SUBPLEBBIT, // InternalSubplebbitType
    PERSISTENT_DELETED_SUBPLEBBITS // These are basically sub db files that we're unable to remove for some reason on windows
}

// Memory caches
export const subplebbitForPublishingCache = new LRUCache<string, Pick<SubplebbitIpfsType, "address" | "encryption" | "pubsubTopic">>({
    max: 100,
    ttl: 600000
}); // Cache for only 10 mins, should probably be moved to LRU+storage
export const pageCidToSortTypesCache = new LRUCache<string, string[]>({ max: 500 });

// should be moved to LRU+storage
export const commentPostUpdatesParentsPathCache = new LRUCache<string, string>({ max: 500 }); // cid -> nestedReplyCid/replyCid/postCid
export const postTimestampCache = new LRUCache<string, number>({ max: 500 }); // postCid => timestamp
