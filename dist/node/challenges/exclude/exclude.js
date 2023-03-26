"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldExcludeChallengeSuccess = exports.shouldExcludePublication = exports.shouldExcludeChallengeCommentCids = void 0;
var tinycache_1 = __importDefault(require("tinycache"));
var quick_lru_1 = __importDefault(require("quick-lru"));
var utils_1 = require("./utils");
var rate_limiter_1 = require("./rate-limiter");
var shouldExcludePublication = function (subplebbitChallenge, publication, subplebbit) {
    var _a, _b, _c, _d, _e;
    if (!subplebbitChallenge) {
        throw Error("shouldExcludePublication invalid subplebbitChallenge argument '".concat(subplebbitChallenge, "'"));
    }
    if (!(publication === null || publication === void 0 ? void 0 : publication.author)) {
        throw Error("shouldExcludePublication invalid publication argument '".concat(publication, "'"));
    }
    var author = publication.author;
    if (!subplebbitChallenge.exclude) {
        return false;
    }
    if (!Array.isArray(subplebbitChallenge.exclude)) {
        throw Error("shouldExcludePublication invalid subplebbitChallenge argument '".concat(subplebbitChallenge, "' subplebbitChallenge.exclude not an array"));
    }
    // if match any of the exclude array, should exclude
    for (var _i = 0, _f = subplebbitChallenge.exclude; _i < _f.length; _i++) {
        var exclude = _f[_i];
        // if doesn't have any author excludes, shouldn't exclude
        if (!exclude.postScore &&
            !exclude.replyScore &&
            !exclude.firstCommentTimestamp &&
            !((_a = exclude.address) === null || _a === void 0 ? void 0 : _a.length) &&
            exclude.post === undefined &&
            exclude.reply === undefined &&
            exclude.vote === undefined &&
            exclude.rateLimit === undefined &&
            !((_b = exclude.role) === null || _b === void 0 ? void 0 : _b.length)) {
            continue;
        }
        // if match all of the exclude item properties, should exclude
        // keep separated for easier debugging
        var shouldExclude = true;
        if (!(0, utils_1.testScore)(exclude.postScore, (_c = author.subplebbit) === null || _c === void 0 ? void 0 : _c.postScore)) {
            shouldExclude = false;
        }
        if (!(0, utils_1.testScore)(exclude.replyScore, (_d = author.subplebbit) === null || _d === void 0 ? void 0 : _d.replyScore)) {
            shouldExclude = false;
        }
        if (!(0, utils_1.testFirstCommentTimestamp)(exclude.firstCommentTimestamp, (_e = author.subplebbit) === null || _e === void 0 ? void 0 : _e.firstCommentTimestamp)) {
            shouldExclude = false;
        }
        if (!(0, utils_1.testPost)(exclude.post, publication)) {
            shouldExclude = false;
        }
        if (!(0, utils_1.testReply)(exclude.reply, publication)) {
            shouldExclude = false;
        }
        if (!(0, utils_1.testVote)(exclude.vote, publication)) {
            shouldExclude = false;
        }
        if (!(0, rate_limiter_1.testRateLimit)(exclude, publication)) {
            shouldExclude = false;
        }
        if (exclude.address && !exclude.address.includes(author.address)) {
            shouldExclude = false;
        }
        if (!(0, utils_1.testRole)(exclude.role, publication.author.address, subplebbit === null || subplebbit === void 0 ? void 0 : subplebbit.roles)) {
            shouldExclude = false;
        }
        // if one of the exclude item is successful, should exclude author
        if (shouldExclude) {
            return true;
        }
    }
    return false;
};
exports.shouldExcludePublication = shouldExcludePublication;
var shouldExcludeChallengeSuccess = function (subplebbitChallenge, challengeResults) {
    var _a, _b, _c;
    if (!subplebbitChallenge) {
        throw Error("shouldExcludeChallengeSuccess invalid subplebbitChallenge argument '".concat(subplebbitChallenge, "'"));
    }
    if (challengeResults && !Array.isArray(challengeResults)) {
        throw Error("shouldExcludeChallengeSuccess invalid challengeResults argument '".concat(challengeResults, "'"));
    }
    // no challenge results or no exclude rules
    if (!(challengeResults === null || challengeResults === void 0 ? void 0 : challengeResults.length) || !((_a = subplebbitChallenge.exclude) === null || _a === void 0 ? void 0 : _a.length)) {
        return false;
    }
    // if match any of the exclude array, should exclude
    for (var _i = 0, _d = subplebbitChallenge.exclude; _i < _d.length; _i++) {
        var excludeItem = _d[_i];
        // has no challenge success exclude rules
        if (!((_b = excludeItem.challenges) === null || _b === void 0 ? void 0 : _b.length)) {
            continue;
        }
        // if any of exclude.challenges failed, don't exclude
        var shouldExclude = true;
        for (var _e = 0, _f = excludeItem.challenges; _e < _f.length; _e++) {
            var challengeIndex = _f[_e];
            if (((_c = challengeResults[challengeIndex]) === null || _c === void 0 ? void 0 : _c.success) !== true) {
                // found a false, should not exclude based on this exclude item,
                // but try again in the next exclude item
                shouldExclude = false;
                break;
            }
        }
        // if all exclude.challenges succeeded, should exclude
        if (shouldExclude) {
            return true;
        }
    }
    return false;
};
exports.shouldExcludeChallengeSuccess = shouldExcludeChallengeSuccess;
// cache for fetching comment cids, never expire
var commentCache = new quick_lru_1.default({ maxSize: 10000 });
var invalidIpnsName = 'i';
// cache for fetching comment updates, expire after 1 day
var commentUpdateCache = new tinycache_1.default();
var commentUpdateCacheTime = 1000 * 60 * 60;
var getCommentPending = {};
var shouldExcludeChallengeCommentCids = function (subplebbitChallenge, challengeRequestMessage, plebbit) { return __awaiter(void 0, void 0, void 0, function () {
    var commentCids, author, _getComment, getComment, validateComment, validateExclude, validateExcludePromises, _i, _a, exclude, e_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!subplebbitChallenge) {
                    throw Error("shouldExcludeChallengeCommentCids invalid subplebbitChallenge argument '".concat(subplebbitChallenge, "'"));
                }
                if (!challengeRequestMessage) {
                    throw Error("shouldExcludeChallengeCommentCids invalid challengeRequestMessage argument '".concat(challengeRequestMessage, "'"));
                }
                if (typeof (plebbit === null || plebbit === void 0 ? void 0 : plebbit.getComment) !== 'function') {
                    throw Error("shouldExcludeChallengeCommentCids invalid plebbit argument '".concat(plebbit, "'"));
                }
                commentCids = challengeRequestMessage.challengeCommentCids;
                author = (_b = challengeRequestMessage.publication) === null || _b === void 0 ? void 0 : _b.author;
                if (commentCids && !Array.isArray(commentCids)) {
                    throw Error("shouldExcludeChallengeCommentCids invalid commentCids argument '".concat(commentCids, "'"));
                }
                if (!(author === null || author === void 0 ? void 0 : author.address) || typeof (author === null || author === void 0 ? void 0 : author.address) !== 'string') {
                    throw Error("shouldExcludeChallengeCommentCids invalid challengeRequestMessage.publication.author.address argument '".concat(author === null || author === void 0 ? void 0 : author.address, "'"));
                }
                _getComment = function (commentCid, addressesSet) { return __awaiter(void 0, void 0, void 0, function () {
                    var cachedComment, comment, author_1, cachedCommentUpdate, commentUpdate_1, commentUpdatePromise;
                    var _a, _b, _c, _d, _e, _f;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                cachedComment = commentCache.get(commentCid);
                                if (!!cachedComment) return [3 /*break*/, 2];
                                return [4 /*yield*/, plebbit.getComment(commentCid)
                                    // only cache useful values
                                ];
                            case 1:
                                comment = _g.sent();
                                author_1 = { address: (_a = comment === null || comment === void 0 ? void 0 : comment.author) === null || _a === void 0 ? void 0 : _a.address };
                                cachedComment = { ipnsName: comment.ipnsName || invalidIpnsName, subplebbitAddress: comment.subplebbitAddress, author: author_1 };
                                commentCache.set(commentCid, cachedComment);
                                _g.label = 2;
                            case 2:
                                // comment has no ipns name
                                if ((cachedComment === null || cachedComment === void 0 ? void 0 : cachedComment.ipnsName) === invalidIpnsName) {
                                    throw Error('comment has invalid ipns name');
                                }
                                // subplebbit address doesn't match filter
                                if (!addressesSet.has(cachedComment.subplebbitAddress)) {
                                    throw Error("comment doesn't have subplebbit address");
                                }
                                // author address doesn't match author
                                if (((_b = cachedComment === null || cachedComment === void 0 ? void 0 : cachedComment.author) === null || _b === void 0 ? void 0 : _b.address) !== author.address) {
                                    throw Error("comment author address doesn't match publication author address");
                                }
                                cachedCommentUpdate = commentUpdateCache.get(cachedComment.ipnsName);
                                if (!!cachedCommentUpdate) return [3 /*break*/, 8];
                                commentUpdate_1 = comment;
                                if (!!commentUpdate_1) return [3 /*break*/, 4];
                                return [4 /*yield*/, plebbit.createComment({ cid: commentCid, ipnsName: commentCache.ipnsName })];
                            case 3:
                                commentUpdate_1 = _g.sent();
                                _g.label = 4;
                            case 4:
                                commentUpdatePromise = new Promise(function (resolve) { return commentUpdate_1.once('update', resolve); });
                                return [4 /*yield*/, commentUpdate_1.update()];
                            case 5:
                                _g.sent();
                                return [4 /*yield*/, commentUpdatePromise];
                            case 6:
                                _g.sent();
                                return [4 /*yield*/, commentUpdate_1.stop()
                                    // only cache useful values
                                ];
                            case 7:
                                _g.sent();
                                // only cache useful values
                                cachedCommentUpdate = {};
                                if ((_c = commentUpdate_1 === null || commentUpdate_1 === void 0 ? void 0 : commentUpdate_1.author) === null || _c === void 0 ? void 0 : _c.subplebbit) {
                                    cachedCommentUpdate.author = { subplebbit: (_d = commentUpdate_1 === null || commentUpdate_1 === void 0 ? void 0 : commentUpdate_1.author) === null || _d === void 0 ? void 0 : _d.subplebbit };
                                }
                                commentUpdateCache.put(cachedComment.ipnsName, cachedCommentUpdate, commentUpdateCacheTime);
                                (_f = (_e = commentUpdateCache._timeouts[cachedComment.ipnsName]).unref) === null || _f === void 0 ? void 0 : _f.call(_e);
                                _g.label = 8;
                            case 8: return [2 /*return*/, __assign(__assign({}, cachedComment), cachedCommentUpdate)];
                        }
                    });
                }); };
                getComment = function (commentCid, addressesSet) { return __awaiter(void 0, void 0, void 0, function () {
                    var sleep, pendingKey, res, e_2;
                    var _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                sleep = function (ms) { return new Promise(function (r) { return setTimeout(r, ms); }); };
                                pendingKey = commentCid + ((_a = plebbit.plebbitOptions) === null || _a === void 0 ? void 0 : _a.ipfsGatewayUrl) + ((_c = (_b = plebbit.plebbitOptions) === null || _b === void 0 ? void 0 : _b.ipfsHttpClientOptions) === null || _c === void 0 ? void 0 : _c.url);
                                _d.label = 1;
                            case 1:
                                if (!(getCommentPending[pendingKey] === true)) return [3 /*break*/, 3];
                                return [4 /*yield*/, sleep(20)];
                            case 2:
                                _d.sent();
                                return [3 /*break*/, 1];
                            case 3:
                                getCommentPending[pendingKey] = true;
                                _d.label = 4;
                            case 4:
                                _d.trys.push([4, 6, 7, 8]);
                                return [4 /*yield*/, _getComment(commentCid, addressesSet)];
                            case 5:
                                res = _d.sent();
                                return [2 /*return*/, res];
                            case 6:
                                e_2 = _d.sent();
                                throw e_2;
                            case 7:
                                getCommentPending[pendingKey] = false;
                                return [7 /*endfinally*/];
                            case 8: return [2 /*return*/];
                        }
                    });
                }); };
                validateComment = function (commentCid, addressesSet, exclude) { return __awaiter(void 0, void 0, void 0, function () {
                    var comment, _a, postScore, replyScore, firstCommentTimestamp;
                    var _b, _c, _d, _e, _f, _g;
                    return __generator(this, function (_h) {
                        switch (_h.label) {
                            case 0: return [4 /*yield*/, getComment(commentCid, addressesSet)];
                            case 1:
                                comment = _h.sent();
                                _a = (exclude === null || exclude === void 0 ? void 0 : exclude.subplebbit) || {}, postScore = _a.postScore, replyScore = _a.replyScore, firstCommentTimestamp = _a.firstCommentTimestamp;
                                if ((0, utils_1.testScore)(postScore, (_c = (_b = comment.author) === null || _b === void 0 ? void 0 : _b.subplebbit) === null || _c === void 0 ? void 0 : _c.postScore) &&
                                    (0, utils_1.testScore)(replyScore, (_e = (_d = comment.author) === null || _d === void 0 ? void 0 : _d.subplebbit) === null || _e === void 0 ? void 0 : _e.replyScore) &&
                                    (0, utils_1.testFirstCommentTimestamp)(firstCommentTimestamp, (_g = (_f = comment.author) === null || _f === void 0 ? void 0 : _f.subplebbit) === null || _g === void 0 ? void 0 : _g.firstCommentTimestamp)) {
                                    // do nothing, comment is valid
                                    return [2 /*return*/];
                                }
                                throw Error("should not exclude comment cid");
                        }
                    });
                }); };
                validateExclude = function (exclude) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, addresses, maxCommentCids, addressesSet, validateCommentPromises, i, commentCid, e_3;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _a = (exclude === null || exclude === void 0 ? void 0 : exclude.subplebbit) || {}, addresses = _a.addresses, maxCommentCids = _a.maxCommentCids;
                                if (!maxCommentCids) {
                                    maxCommentCids = 3;
                                }
                                // no friendly sub addresses
                                if (!(addresses === null || addresses === void 0 ? void 0 : addresses.length)) {
                                    throw Error('no friendly sub addresses');
                                }
                                addressesSet = new Set(addresses);
                                // author didn't provide comment cids
                                if (!(commentCids === null || commentCids === void 0 ? void 0 : commentCids.length)) {
                                    throw Error("author didn't provide comment cids");
                                }
                                validateCommentPromises = [];
                                i = 0;
                                while (i < maxCommentCids) {
                                    commentCid = commentCids[i++];
                                    if (commentCid) {
                                        validateCommentPromises.push(validateComment(commentCid, addressesSet, exclude));
                                    }
                                }
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 3, , 4]);
                                // @ts-ignore
                                return [4 /*yield*/, Promise.any(validateCommentPromises)];
                            case 2:
                                // @ts-ignore
                                _b.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                e_3 = _b.sent();
                                // console.log(validateCommentPromises) // debug all validate comments
                                e_3.message = "should not exclude: ".concat(e_3.message);
                                throw Error(e_3);
                            case 4: return [2 /*return*/];
                        }
                    });
                }); };
                validateExcludePromises = [];
                for (_i = 0, _a = subplebbitChallenge.exclude || []; _i < _a.length; _i++) {
                    exclude = _a[_i];
                    validateExcludePromises.push(validateExclude(exclude));
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                // @ts-ignore
                return [4 /*yield*/, Promise.any(validateExcludePromises)];
            case 2:
                // @ts-ignore
                _c.sent();
                return [2 /*return*/, true];
            case 3:
                e_1 = _c.sent();
                return [3 /*break*/, 4];
            case 4: 
            // if no exclude are valid, should not exclude
            return [2 /*return*/, false];
        }
    });
}); };
exports.shouldExcludeChallengeCommentCids = shouldExcludeChallengeCommentCids;
//# sourceMappingURL=exclude.js.map