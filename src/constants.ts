import LRUCache from "lru-cache";
import { SubplebbitIpfsType } from "./subplebbit/types";
export enum CACHE_KEYS {
    SUBPLEBBIT_IPNS,
    INTERNAL_SUBPLEBBIT,
    PERSISTENT_DELETED_SUBPLEBBITS // These are basically sub db files that we're unable to remove for some reason on windows
}

export const subplebbitForPublishingCache = new LRUCache<string, Pick<SubplebbitIpfsType, "address" | "encryption" | "pubsubTopic">>({
    max: 100,
    ttl: 600000
}); // Cache for only 10 mins
export const pageCidToSortTypesCache = new LRUCache<string, string[]>({ max: 500 });

export const commentValidationCache = new LRUCache<string, true>({ max: 50000 });
export const commentUpdateValidationCache = new LRUCache<string, true>({ max: 10000 });

export const commentPostUpdatesParentsPathCache = new LRUCache<string, string>({ max: 500 }); // cid -> nestedReplyCid/replyCid/postCid
export const postTimestampCache = new LRUCache<string, number>({ max: 500 }); // postCid => timestamp
