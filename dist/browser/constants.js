import { LRUCache } from "lru-cache";
export var STORAGE_KEYS;
(function (STORAGE_KEYS) {
    STORAGE_KEYS[STORAGE_KEYS["INTERNAL_SUBPLEBBIT"] = 0] = "INTERNAL_SUBPLEBBIT";
    STORAGE_KEYS[STORAGE_KEYS["PERSISTENT_DELETED_SUBPLEBBITS"] = 1] = "PERSISTENT_DELETED_SUBPLEBBITS"; // These are basically sub db files that we're unable to remove for some reason on windows
})(STORAGE_KEYS || (STORAGE_KEYS = {}));
// Configs for LRU storage
export const postTimestampConfig = { cacheName: "plebbitjs_lrustorage_postTimestamp", maxItems: 500 };
export const commentPostUpdatesParentsPathConfig = {
    cacheName: "plebbitjs_lrustorage_commentPostUpdatesParentsPath",
    maxItems: 500
};
// Memory caches
export const subplebbitForPublishingCache = new LRUCache({
    max: 100,
    ttl: 600000
}); // Cache for only 10 mins
export const pageCidToSortTypesCache = new LRUCache({ max: 500 });
// Below will be the caches for promises of fetching or resolving
export const ensResolverPromiseCache = new LRUCache({ ttl: 60 * 1000, max: 50 }); // cache key will be (address + txtRecordName + chain + chainproviderUrl) and value will be the promise of resolving through viem or ethers
export const gatewayFetchPromiseCache = new LRUCache({ max: 200 }); // cache key will be url and value will be text of the response. The reason for low ttl is because we ipns is published regularly
export const p2pIpnsPromiseCache = new LRUCache({ max: 200 }); // cache key will be ipnsName and the result will be a promise of cid
export const p2pCidPromiseCache = new LRUCache({ max: 50, ttl: 60 * 1000 }); // cache key will be cid and the result will be a promise of content of cid
// Caches for signature validation
export const subplebbitVerificationCache = new LRUCache({ max: 100, ttl: 5 * 60 * 100 });
export const pageVerificationCache = new LRUCache({ max: 300 });
export const commentUpdateVerificationCache = new LRUCache({ max: 300 });
//# sourceMappingURL=constants.js.map