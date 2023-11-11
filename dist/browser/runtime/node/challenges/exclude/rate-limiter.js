"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRateLimit = exports.addToRateLimiter = void 0;
var quick_lru_1 = __importDefault(require("quick-lru"));
var limiter_1 = require("limiter");
var utils_1 = require("./utils");
// each author could have 20+ rate limiters each if the sub has
// several rate limit rules so keep a large cache
var rateLimiters = new quick_lru_1.default({ maxSize: 50000 });
var getRateLimiterName = function (exclude, publication, publicationType, challengeSuccess) { return "".concat(publication.author.address, "-").concat(exclude.rateLimit, "-").concat(publicationType, "-").concat(challengeSuccess); };
var getOrCreateRateLimiter = function (exclude, publication, publicationType, challengeSuccess) {
    var rateLimiterName = getRateLimiterName(exclude, publication, publicationType, challengeSuccess);
    var rateLimiter = rateLimiters.get(rateLimiterName);
    if (!rateLimiter) {
        rateLimiter = new limiter_1.RateLimiter({ tokensPerInterval: exclude.rateLimit, interval: "hour", fireImmediately: true });
        //@ts-expect-error
        rateLimiter.name = rateLimiterName; // add name for debugging
        rateLimiters.set(rateLimiterName, rateLimiter);
    }
    return rateLimiter;
};
var addFilteredRateLimiter = function (exclude, publication, publicationType, challengeSuccess, filteredRateLimiters) {
    filteredRateLimiters[getRateLimiterName(exclude, publication, publicationType, challengeSuccess)] = getOrCreateRateLimiter(exclude, publication, publicationType, challengeSuccess);
};
var getRateLimitersToTest = function (exclude, publication, challengeSuccess) {
    // get all rate limiters associated with the exclude (publication type and challengeSuccess true/false)
    var filteredRateLimiters = {};
    if ((0, utils_1.testPost)(exclude.post, publication) && ![exclude.reply, exclude.vote].includes(true)) {
        addFilteredRateLimiter(exclude, publication, 'post', challengeSuccess, filteredRateLimiters);
    }
    if ((0, utils_1.testReply)(exclude.reply, publication) && ![exclude.post, exclude.vote].includes(true)) {
        addFilteredRateLimiter(exclude, publication, 'reply', challengeSuccess, filteredRateLimiters);
    }
    if ((0, utils_1.testVote)(exclude.vote, publication) && ![exclude.post, exclude.reply].includes(true)) {
        addFilteredRateLimiter(exclude, publication, 'vote', challengeSuccess, filteredRateLimiters);
    }
    return filteredRateLimiters;
};
var testRateLimit = function (exclude, publication) {
    if ((exclude === null || exclude === void 0 ? void 0 : exclude.rateLimit) === undefined ||
        (exclude.post === true && !(0, utils_1.isPost)(publication)) ||
        (exclude.reply === true && !(0, utils_1.isReply)(publication)) ||
        (exclude.vote === true && !(0, utils_1.isVote)(publication)) ||
        (exclude.post === false && (0, utils_1.isPost)(publication)) ||
        (exclude.reply === false && (0, utils_1.isReply)(publication)) ||
        (exclude.vote === false && (0, utils_1.isVote)(publication))) {
        // early exit based on exclude type and publication type
        return true;
    }
    // if rateLimitChallengeSuccess is undefined or true, only use {challengeSuccess: true} rate limiters
    var challengeSuccess = true;
    if (exclude.rateLimitChallengeSuccess === false) {
        challengeSuccess = false;
    }
    // check all the rate limiters that match the exclude and publication type
    var rateLimiters = getRateLimitersToTest(exclude, publication, challengeSuccess);
    // if any of the matching rate limiter is out of tokens, test failed
    for (var _i = 0, _a = Object.values(rateLimiters); _i < _a.length; _i++) {
        var rateLimiter = _a[_i];
        var tokensRemaining = rateLimiter.getTokensRemaining();
        // token per action is 1, so any value below 1 is invalid
        if (tokensRemaining < 1) {
            return false;
        }
    }
    return true;
};
exports.testRateLimit = testRateLimit;
var getRateLimitersToAddTo = function (excludeArray, publication, challengeSuccess) {
    // get all rate limiters associated with the exclude (publication type and challengeSuccess true/false)
    var filteredRateLimiters = {};
    for (var _i = 0, excludeArray_1 = excludeArray; _i < excludeArray_1.length; _i++) {
        var exclude = excludeArray_1[_i];
        if ((exclude === null || exclude === void 0 ? void 0 : exclude.rateLimit) === undefined) {
            continue;
        }
        if ((0, utils_1.isPost)(publication)) {
            addFilteredRateLimiter(exclude, publication, 'post', challengeSuccess, filteredRateLimiters);
        }
        if ((0, utils_1.isReply)(publication)) {
            addFilteredRateLimiter(exclude, publication, 'reply', challengeSuccess, filteredRateLimiters);
        }
        if ((0, utils_1.isVote)(publication)) {
            addFilteredRateLimiter(exclude, publication, 'vote', challengeSuccess, filteredRateLimiters);
        }
    }
    return filteredRateLimiters;
};
var addToRateLimiter = function (subplebbitChallenges, publication, challengeSuccess) {
    var _a;
    if (!subplebbitChallenges) {
        // subplebbit has no challenges, no need to rate limit
        return;
    }
    if (!Array.isArray(subplebbitChallenges)) {
        throw Error("addToRateLimiter invalid argument subplebbitChallenges '".concat(subplebbitChallenges, "' not an array"));
    }
    if (typeof ((_a = publication === null || publication === void 0 ? void 0 : publication.author) === null || _a === void 0 ? void 0 : _a.address) !== 'string') {
        throw Error("addToRateLimiter invalid argument publication '".concat(publication, "'"));
    }
    if (typeof challengeSuccess !== 'boolean') {
        throw Error("addToRateLimiter invalid argument challengeSuccess '".concat(challengeSuccess, "' not a boolean"));
    }
    // get all exclude items from all subplebbit challenges
    var excludeArray = [];
    for (var _i = 0, subplebbitChallenges_1 = subplebbitChallenges; _i < subplebbitChallenges_1.length; _i++) {
        var subplebbitChallenge = subplebbitChallenges_1[_i];
        for (var _b = 0, _c = (subplebbitChallenge === null || subplebbitChallenge === void 0 ? void 0 : subplebbitChallenge.exclude) || []; _b < _c.length; _b++) {
            var exclude = _c[_b];
            excludeArray.push(exclude);
        }
    }
    if (!excludeArray.length) {
        // no need to add to rate limiter if the subplebbit has no exclude rules in any challenges
        return;
    }
    var rateLimiters = getRateLimitersToAddTo(excludeArray, publication, challengeSuccess);
    for (var _d = 0, _e = Object.values(rateLimiters); _d < _e.length; _d++) {
        var rateLimiter = _e[_d];
        rateLimiter.tryRemoveTokens(1);
    }
};
exports.addToRateLimiter = addToRateLimiter;
//# sourceMappingURL=rate-limiter.js.map