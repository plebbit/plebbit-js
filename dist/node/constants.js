"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageCidToSortTypesCache = exports.subplebbitForPublishingCache = exports.commentPostUpdatesParentsPathConfig = exports.postTimestampConfig = exports.STORAGE_KEYS = void 0;
var lru_cache_1 = __importDefault(require("lru-cache"));
var STORAGE_KEYS;
(function (STORAGE_KEYS) {
    STORAGE_KEYS[STORAGE_KEYS["INTERNAL_SUBPLEBBIT"] = 0] = "INTERNAL_SUBPLEBBIT";
    STORAGE_KEYS[STORAGE_KEYS["PERSISTENT_DELETED_SUBPLEBBITS"] = 1] = "PERSISTENT_DELETED_SUBPLEBBITS"; // These are basically sub db files that we're unable to remove for some reason on windows
})(STORAGE_KEYS || (exports.STORAGE_KEYS = STORAGE_KEYS = {}));
// Configs for LRU storage
exports.postTimestampConfig = { cacheName: "postTimestamp", maxItems: 500 };
exports.commentPostUpdatesParentsPathConfig = {
    cacheName: "commentPostUpdatesParentsPath",
    maxItems: 500
};
// Memory caches
exports.subplebbitForPublishingCache = new lru_cache_1.default({
    max: 100,
    ttl: 600000
}); // Cache for only 10 mins, should  be moved to LRU+storage
exports.pageCidToSortTypesCache = new lru_cache_1.default({ max: 500 });
//# sourceMappingURL=constants.js.map