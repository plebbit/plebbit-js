import { lru } from "tiny-lru";

export enum CACHE_KEYS {
    SUBPLEBBIT_IPNS,
    INTERNAL_SUBPLEBBIT
}

export const subplebbitForPublishingCache = lru(100, 600000, true); // Cache for only 10 mins
