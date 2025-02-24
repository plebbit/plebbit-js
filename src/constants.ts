import { LRUCache } from "lru-cache";
import type { LRUStorageConstructor } from "./types.js";

export enum STORAGE_KEYS {
    INTERNAL_SUBPLEBBIT, // InternalSubplebbitType
    PERSISTENT_DELETED_SUBPLEBBITS, // These are basically sub db files that we're unable to remove for some reason on windows
    COMMENTS_WITH_INVALID_SCHEMA // Comments in DB with invalid Comment Ipfs schema and have been moved away from comments
}

// Configs for LRU storage

export const postTimestampConfig: Omit<LRUStorageConstructor, "plebbit"> = {
    cacheName: "plebbitjs_lrustorage_postTimestamp",
    maxItems: 500
};

export const commentPostUpdatesParentsPathConfig: Omit<LRUStorageConstructor, "plebbit"> = {
    cacheName: "plebbitjs_lrustorage_commentPostUpdatesParentsPath",
    maxItems: 500
};

// Memory caches

export const pageCidToSortTypesCache = new LRUCache<string, string[]>({ max: 500 });

// Below will be the caches for promises of fetching or resolving
export const domainResolverPromiseCache = new LRUCache<string, Promise<string | null>>({ ttl: 60 * 1000, max: 50 }); // cache key will be (address + txtRecordName + chain + chainproviderUrl) and value will be the promise of resolving through viem or ethers

export const p2pCidPromiseCache = new LRUCache<string, Promise<string | undefined>>({ max: 50, ttl: 60 * 1000 }); // cache key will be cid and the result will be a promise of content of cid
