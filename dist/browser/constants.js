"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentUpdateVerificationCache = exports.pageVerificationCache = exports.subplebbitVerificationCache = exports.p2pCidPromiseCache = exports.p2pIpnsPromiseCache = exports.gatewayFetchPromiseCache = exports.ensResolverPromiseCache = exports.pageCidToSortTypesCache = exports.subplebbitForPublishingCache = exports.commentPostUpdatesParentsPathConfig = exports.postTimestampConfig = exports.STORAGE_KEYS = void 0;
var lru_cache_1 = __importDefault(require("lru-cache"));
var STORAGE_KEYS;
(function (STORAGE_KEYS) {
    STORAGE_KEYS[STORAGE_KEYS["INTERNAL_SUBPLEBBIT"] = 0] = "INTERNAL_SUBPLEBBIT";
    STORAGE_KEYS[STORAGE_KEYS["PERSISTENT_DELETED_SUBPLEBBITS"] = 1] = "PERSISTENT_DELETED_SUBPLEBBITS"; // These are basically sub db files that we're unable to remove for some reason on windows
})(STORAGE_KEYS || (exports.STORAGE_KEYS = STORAGE_KEYS = {}));
// Configs for LRU storage
exports.postTimestampConfig = { cacheName: "plebbitjs_lrustorage_postTimestamp", maxItems: 500 };
exports.commentPostUpdatesParentsPathConfig = {
    cacheName: "plebbitjs_lrustorage_commentPostUpdatesParentsPath",
    maxItems: 500
};
// Memory caches
exports.subplebbitForPublishingCache = new lru_cache_1.default({
    max: 100,
    ttl: 600000
}); // Cache for only 10 mins
exports.pageCidToSortTypesCache = new lru_cache_1.default({ max: 500 });
// Below will be the caches for promises of fetching or resolving
exports.ensResolverPromiseCache = new lru_cache_1.default({ ttl: 60 * 1000, max: 50 }); // cache key will be (address + txtRecordName + chain + chainproviderUrl) and value will be the promise of resolving through viem or ethers
exports.gatewayFetchPromiseCache = new lru_cache_1.default({ max: 200 }); // cache key will be url and value will be text of the response. The reason for low ttl is because we ipns is published regularly
exports.p2pIpnsPromiseCache = new lru_cache_1.default({ max: 200 }); // cache key will be ipnsName and the result will be a promise of cid
exports.p2pCidPromiseCache = new lru_cache_1.default({ max: 50, ttl: 60 * 1000 }); // cache key will be cid and the result will be a promise of content of cid
// Caches for signature validation
exports.subplebbitVerificationCache = new lru_cache_1.default({ max: 100, ttl: 5 * 60 * 100 });
exports.pageVerificationCache = new lru_cache_1.default({ max: 300 });
exports.commentUpdateVerificationCache = new lru_cache_1.default({ max: 300 });
//# sourceMappingURL=constants.js.map