"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentUpdateValidationCache = exports.commentValidationCache = exports.pageCidToSortTypesCache = exports.subplebbitForPublishingCache = exports.CACHE_KEYS = void 0;
var lru_cache_1 = __importDefault(require("lru-cache"));
var CACHE_KEYS;
(function (CACHE_KEYS) {
    CACHE_KEYS[CACHE_KEYS["SUBPLEBBIT_IPNS"] = 0] = "SUBPLEBBIT_IPNS";
    CACHE_KEYS[CACHE_KEYS["INTERNAL_SUBPLEBBIT"] = 1] = "INTERNAL_SUBPLEBBIT";
})(CACHE_KEYS = exports.CACHE_KEYS || (exports.CACHE_KEYS = {}));
exports.subplebbitForPublishingCache = new lru_cache_1.default({
    max: 100,
    ttl: 600000
}); // Cache for only 10 mins
exports.pageCidToSortTypesCache = new lru_cache_1.default({ max: 500 });
exports.commentValidationCache = new lru_cache_1.default({ max: 50000 });
exports.commentUpdateValidationCache = new lru_cache_1.default({ max: 10000 });
//# sourceMappingURL=constants.js.map