import {LRUCache} from "lru-cache";
import { LRUStorageConstructor } from "./types.js";
import { SubplebbitIpfsType } from "./subplebbit/types.js";
export enum STORAGE_KEYS {
    INTERNAL_SUBPLEBBIT, // InternalSubplebbitType
    PERSISTENT_DELETED_SUBPLEBBITS // These are basically sub db files that we're unable to remove for some reason on windows
}

// Configs for LRU storage

export const postTimestampConfig: Omit<LRUStorageConstructor, "plebbit"> = { cacheName: "plebbitjs_lrustorage_postTimestamp", maxItems: 500 };

export const commentPostUpdatesParentsPathConfig: Omit<LRUStorageConstructor, "plebbit"> = {
    cacheName: "plebbitjs_lrustorage_commentPostUpdatesParentsPath",
    maxItems: 500
};

// Memory caches
export const subplebbitForPublishingCache = new LRUCache<string, Pick<SubplebbitIpfsType, "address" | "encryption" | "pubsubTopic">>({
    max: 100,
    ttl: 600000
}); // Cache for only 10 mins

export const pageCidToSortTypesCache = new LRUCache<string, string[]>({ max: 500 });

// Below will be the caches for promises of fetching or resolving
export const ensResolverPromiseCache = new LRUCache<string, Promise<string | null>>({ ttl: 60 * 1000, max: 50 }); // cache key will be (address + txtRecordName + chain + chainproviderUrl) and value will be the promise of resolving through viem or ethers

export const gatewayFetchPromiseCache = new LRUCache<string, Promise<string>>({ max: 200 }); // cache key will be url and value will be text of the response. The reason for low ttl is because we ipns is published regularly

export const p2pIpnsPromiseCache = new LRUCache<string, Promise<string | undefined>>({ max: 200 }); // cache key will be ipnsName and the result will be a promise of cid

export const p2pCidPromiseCache = new LRUCache<string, Promise<string | undefined>>({ max: 50, ttl: 60 * 1000 }); // cache key will be cid and the result will be a promise of content of cid

// Caches for signature validation

export const subplebbitVerificationCache = new LRUCache<string, boolean>({ max: 100, ttl: 5 * 60 * 100 });
export const pageVerificationCache = new LRUCache<string, boolean>({ max: 300 });
export const commentUpdateVerificationCache = new LRUCache<string, boolean>({ max: 300 });
