"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subplebbitForPublishingCache = exports.CACHE_KEYS = void 0;
var tiny_lru_1 = require("tiny-lru");
var CACHE_KEYS;
(function (CACHE_KEYS) {
    CACHE_KEYS[CACHE_KEYS["SUBPLEBBIT_IPNS"] = 0] = "SUBPLEBBIT_IPNS";
    CACHE_KEYS[CACHE_KEYS["INTERNAL_SUBPLEBBIT"] = 1] = "INTERNAL_SUBPLEBBIT";
})(CACHE_KEYS = exports.CACHE_KEYS || (exports.CACHE_KEYS = {}));
exports.subplebbitForPublishingCache = (0, tiny_lru_1.lru)(100, 600000, true); // Cache for only 10 mins
//# sourceMappingURL=constants.js.map