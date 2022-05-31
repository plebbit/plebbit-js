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
exports.SortHandler = exports.SORTED_POSTS_PAGE_SIZE = exports.REPLIES_SORT_TYPES = exports.POSTS_SORT_TYPES = void 0;
var util_1 = require("./util");
var pages_1 = require("./pages");
var assert_1 = __importDefault(require("assert"));
var debugs = (0, util_1.getDebugLevels)("sort-handler");
exports.POSTS_SORT_TYPES = Object.freeze({
    HOT: { type: "hot", score: util_1.hotScore },
    NEW: { type: "new" },
    TOP_HOUR: { type: "topHour" },
    TOP_DAY: { type: "topDay" },
    TOP_WEEK: { type: "topWeek" },
    TOP_MONTH: { type: "topMonth" },
    TOP_YEAR: { type: "topYear" },
    TOP_ALL: { type: "topAll" },
    CONTROVERSIAL_HOUR: { type: "controversialHour", score: util_1.controversialScore },
    CONTROVERSIAL_DAY: { type: "controversialDay", score: util_1.controversialScore },
    CONTROVERSIAL_WEEK: { type: "controversialWeek", score: util_1.controversialScore },
    CONTROVERSIAL_MONTH: { type: "controversialMonth", score: util_1.controversialScore },
    CONTROVERSIAL_YEAR: { type: "controversialYear", score: util_1.controversialScore },
    CONTROVERSIAL_ALL: { type: "controversialAll", score: util_1.controversialScore }
});
exports.REPLIES_SORT_TYPES = __assign(__assign({}, (0, util_1.keepKeys)(exports.POSTS_SORT_TYPES, ["TOP_ALL", "NEW", "CONTROVERSIAL_ALL"])), { OLD: { type: "old" } });
exports.SORTED_POSTS_PAGE_SIZE = 50;
var SortHandler = /** @class */ (function () {
    function SortHandler(subplebbit) {
        this.subplebbit = subplebbit;
    }
    SortHandler.prototype.chunksToListOfPage = function (chunks) {
        return __awaiter(this, void 0, void 0, function () {
            var listOfPage, cids, chunksWithReplies, i, page, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (chunks.length === 0)
                            return [2 /*return*/, [[undefined], [undefined]]];
                        listOfPage = new Array(chunks.length);
                        cids = new Array(chunks.length);
                        return [4 /*yield*/, Promise.all(chunks.map(function (chunk) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.all(chunk.map(function (comment) { return __awaiter(_this, void 0, void 0, function () {
                                                var cachedComment, _a, sortedReplies, sortedRepliesCids;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0:
                                                            if (comment.replyCount === 0)
                                                                return [2 /*return*/, comment];
                                                            return [4 /*yield*/, this.subplebbit._keyv.has(comment.cid)];
                                                        case 1:
                                                            if (!_b.sent()) return [3 /*break*/, 3];
                                                            return [4 /*yield*/, this.subplebbit._keyv.get(comment.cid)];
                                                        case 2:
                                                            cachedComment = _b.sent();
                                                            comment.setReplies(cachedComment.sortedReplies, cachedComment.sortedRepliesCids);
                                                            return [3 /*break*/, 6];
                                                        case 3: return [4 /*yield*/, this.generatePagesUnderComment(comment, undefined)];
                                                        case 4:
                                                            _a = _b.sent(), sortedReplies = _a[0], sortedRepliesCids = _a[1];
                                                            assert_1.default.ok(sortedReplies);
                                                            return [4 /*yield*/, this.subplebbit._keyv.set(comment.cid, { sortedReplies: sortedReplies, sortedRepliesCids: sortedRepliesCids })];
                                                        case 5:
                                                            _b.sent();
                                                            comment.setReplies(sortedReplies, sortedRepliesCids);
                                                            _b.label = 6;
                                                        case 6: return [2 /*return*/, comment];
                                                    }
                                                });
                                            }); }))];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }))];
                    case 1:
                        chunksWithReplies = _c.sent();
                        i = chunksWithReplies.length - 1;
                        _c.label = 2;
                    case 2:
                        if (!(i >= 0)) return [3 /*break*/, 5];
                        page = new pages_1.Page({
                            nextCid: cids[i + 1],
                            comments: chunksWithReplies[i]
                        });
                        _a = cids;
                        _b = i;
                        return [4 /*yield*/, this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(page))];
                    case 3:
                        _a[_b] = (_c.sent()).path;
                        listOfPage[i] = page;
                        _c.label = 4;
                    case 4:
                        i--;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, [listOfPage, cids]];
                }
            });
        });
    };
    // Resolves to sortedComments
    SortHandler.prototype.sortComments = function (comments, sortType, limit) {
        if (limit === void 0) { limit = exports.SORTED_POSTS_PAGE_SIZE; }
        return __awaiter(this, void 0, void 0, function () {
            var commentsSorted, commentsChunks, _a, listOfPage, cids;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!sortType.score)
                            commentsSorted = comments;
                        // If sort type has no score function, that means it already has been sorted by DB
                        else
                            commentsSorted = comments
                                .map(function (comment) { return ({
                                comment: comment,
                                score: sortType.score(comment)
                            }); })
                                .sort(function (postA, postB) {
                                return postB.score - postA.score;
                            })
                                .map(function (comment) { return comment.comment; });
                        commentsChunks = (0, util_1.chunks)(commentsSorted, limit);
                        return [4 /*yield*/, this.chunksToListOfPage(commentsChunks, sortType)];
                    case 1:
                        _a = _c.sent(), listOfPage = _a[0], cids = _a[1];
                        return [2 /*return*/, [(_b = {}, _b[sortType.type] = listOfPage[0], _b), cids[0]]];
                }
            });
        });
    };
    SortHandler.prototype.sortCommentsByHot = function (parentCid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsUnderComment(parentCid, trx)];
                    case 1:
                        comments = _a.sent();
                        return [4 /*yield*/, this.sortComments(comments, exports.POSTS_SORT_TYPES.HOT)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SortHandler.prototype.sortCommentsByTop = function (parentCid, timeframe, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var sortType, comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sortType = exports.POSTS_SORT_TYPES["TOP_".concat(timeframe)];
                        return [4 /*yield*/, this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(parentCid, (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[timeframe], (0, util_1.timestamp)(), trx)];
                    case 1:
                        comments = _a.sent();
                        return [4 /*yield*/, this.sortComments(comments, sortType)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SortHandler.prototype.sortCommentsByControversial = function (parentCid, timeframe, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var sortType, comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sortType = exports.POSTS_SORT_TYPES["CONTROVERSIAL_".concat(timeframe)];
                        return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsBetweenTimestampRange(parentCid, (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[timeframe], (0, util_1.timestamp)(), trx)];
                    case 1:
                        comments = _a.sent();
                        return [4 /*yield*/, this.sortComments(comments, sortType)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SortHandler.prototype.sortCommentsByNew = function (parentCid, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(parentCid, "desc", trx)];
                    case 1:
                        comments = _a.sent();
                        return [4 /*yield*/, this.sortComments(comments, exports.POSTS_SORT_TYPES.NEW)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SortHandler.prototype.getSortPromises = function (comment, trx) {
        var _this = this;
        if (!comment) {
            // Sorting posts on a subplebbit level
            var sortPromises = [this.sortCommentsByHot.bind(this)(null, trx), this.sortCommentsByNew.bind(this)(null, trx)];
            for (var _i = 0, _a = Object.keys(util_1.TIMEFRAMES_TO_SECONDS); _i < _a.length; _i++) {
                var timeframe = _a[_i];
                sortPromises.push(this.sortCommentsByTop.bind(this)(null, timeframe, trx));
                sortPromises.push(this.sortCommentsByControversial.bind(this)(null, timeframe, trx));
            }
            return sortPromises;
        }
        else {
            return Object.values(exports.REPLIES_SORT_TYPES).map(function (sortType) { return __awaiter(_this, void 0, void 0, function () {
                var comments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(sortType.type === exports.REPLIES_SORT_TYPES.TOP_ALL.type)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(comment.cid, 0, (0, util_1.timestamp)(), trx)];
                        case 1:
                            comments = _a.sent();
                            return [3 /*break*/, 6];
                        case 2:
                            if (!(sortType.type === exports.REPLIES_SORT_TYPES.OLD.type)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(comment.cid, "asc", trx)];
                        case 3:
                            comments = _a.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsUnderComment(comment.cid, trx)];
                        case 5:
                            comments = _a.sent();
                            _a.label = 6;
                        case 6: return [2 /*return*/, this.sortComments(comments, sortType)];
                    }
                });
            }); });
        }
    };
    SortHandler.prototype.generatePagesUnderComment = function (comment, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var res, _a, pages, pageCids, _i, res_1, _b, page, pageCid;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        // Create "pages" and "pageCids"
                        if ((comment === null || comment === void 0 ? void 0 : comment.replyCount) === 0)
                            return [2 /*return*/, [undefined, undefined]];
                        return [4 /*yield*/, Promise.all(this.getSortPromises(comment, trx))];
                    case 1:
                        res = _e.sent();
                        _a = [{}, {}], pages = _a[0], pageCids = _a[1];
                        for (_i = 0, res_1 = res; _i < res_1.length; _i++) {
                            _b = res_1[_i], page = _b[0], pageCid = _b[1];
                            pages = __assign(__assign({}, pages), page);
                            pageCids[Object.keys(page)[0]] = pageCid;
                        }
                        _c = [(0, util_1.removeKeysWithUndefinedValues)(pages), (0, util_1.removeKeysWithUndefinedValues)(pageCids)], pages = _c[0], pageCids = _c[1];
                        if (JSON.stringify(pages) === "{}")
                            _d = [undefined, undefined], pages = _d[0], pageCids = _d[1];
                        return [2 /*return*/, [pages, pageCids]];
                }
            });
        });
    };
    return SortHandler;
}());
exports.SortHandler = SortHandler;
