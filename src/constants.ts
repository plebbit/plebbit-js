import LRUCache from "lru-cache";
import { SubplebbitIpfsType } from "./types";
export enum CACHE_KEYS {
    SUBPLEBBIT_IPNS,
    INTERNAL_SUBPLEBBIT
}

export const subplebbitForPublishingCache = new LRUCache<string, Pick<SubplebbitIpfsType, "address" | "encryption" | "pubsubTopic">>({
    max: 100,
    ttl: 600000
}); // Cache for only 10 mins
export const pageCidToSortTypesCache = new LRUCache<string, string[]>({ max: 500 });
