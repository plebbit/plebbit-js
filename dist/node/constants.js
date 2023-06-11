"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageCidToSortTypesCache = exports.subplebbitForPublishingCache = exports.CACHE_KEYS = void 0;
var tiny_lru_1 = __importDefault(require("tiny-lru"));
var CACHE_KEYS;
(function (CACHE_KEYS) {
    CACHE_KEYS[CACHE_KEYS["SUBPLEBBIT_IPNS"] = 0] = "SUBPLEBBIT_IPNS";
    CACHE_KEYS[CACHE_KEYS["INTERNAL_SUBPLEBBIT"] = 1] = "INTERNAL_SUBPLEBBIT";
})(CACHE_KEYS = exports.CACHE_KEYS || (exports.CACHE_KEYS = {}));
exports.subplebbitForPublishingCache = (0, tiny_lru_1.default)(100, 600000); // Cache for only 10 mins
exports.pageCidToSortTypesCache = (0, tiny_lru_1.default)(500, 0);
//# sourceMappingURL=constants.js.map