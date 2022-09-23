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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortHandler = exports.SORTED_POSTS_PAGE_SIZE = exports.REPLIES_SORT_TYPES = exports.POSTS_SORT_TYPES = void 0;
var util_1 = require("./util");
var pages_1 = require("./pages");
var assert_1 = __importDefault(require("assert"));
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
exports.POSTS_SORT_TYPES = {
    hot: { score: util_1.hotScore },
    new: {},
    topHour: { timeframe: "HOUR" },
    topDay: { timeframe: "DAY" },
    topWeek: { timeframe: "WEEK" },
    topMonth: { timeframe: "MONTH" },
    topYear: { timeframe: "YEAR" },
    topAll: { timeframe: "ALL" },
    controversialHour: { score: util_1.controversialScore, timeframe: "HOUR" },
    controversialDay: { timeframe: "DAY", score: util_1.controversialScore },
    controversialWeek: { timeframe: "WEEK", score: util_1.controversialScore },
    controversialMonth: { timeframe: "MONTH", score: util_1.controversialScore },
    controversialYear: { timeframe: "YEAR", score: util_1.controversialScore },
    controversialAll: { timeframe: "ALL", score: util_1.controversialScore }
};
exports.REPLIES_SORT_TYPES = {
    topAll: { timeframe: "ALL" },
    new: {},
    controversialAll: { timeframe: "ALL", score: util_1.controversialScore },
    old: {}
};
exports.SORTED_POSTS_PAGE_SIZE = 50;
var SortHandler = /** @class */ (function () {
    function SortHandler(subplebbit) {
        this.subplebbit = subplebbit;
    }
    SortHandler.prototype.chunksToListOfPage = function (chunks) {
        return __awaiter(this, void 0, void 0, function () {
            var listOfPage, cids, chunksWithReplies, i, pageComments, page, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, assert_1.default)(chunks.length > 0);
                        listOfPage = new Array(chunks.length);
                        cids = new Array(chunks.length);
                        return [4 /*yield*/, Promise.all(chunks.map(function (chunk) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.all(chunk.map(function (commentProps) { return __awaiter(_this, void 0, void 0, function () {
                                                var comment, repliesPages;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, this.subplebbit.plebbit.createComment(commentProps)];
                                                        case 1:
                                                            comment = _a.sent();
                                                            return [4 /*yield*/, this.generatePagesUnderComment(comment, undefined)];
                                                        case 2:
                                                            repliesPages = _a.sent();
                                                            comment.setReplies(repliesPages);
                                                            return [2 /*return*/, comment];
                                                    }
                                                });
                                            }); }))];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }))];
                    case 1:
                        chunksWithReplies = _c.sent();
                        (0, assert_1.default)(this.subplebbit.plebbit.ipfsClient);
                        i = chunksWithReplies.length - 1;
                        _c.label = 2;
                    case 2:
                        if (!(i >= 0)) return [3 /*break*/, 5];
                        pageComments = chunksWithReplies[i].map(function (c) { return c.toJSONPages(); });
                        pageComments.forEach(function (c) { return (0, assert_1.default)(typeof c.upvoteCount === "number"); });
                        page = new pages_1.Page({
                            nextCid: cids[i + 1],
                            comments: pageComments
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
    SortHandler.prototype.sortComments = function (comments, sortName, limit) {
        if (limit === void 0) { limit = exports.SORTED_POSTS_PAGE_SIZE; }
        return __awaiter(this, void 0, void 0, function () {
            var commentsSorted, sortProps, commentsChunks, _a, listOfPage, cids, expectedNumOfPages;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, assert_1.default)(comments.length > 0);
                        sortProps = exports.POSTS_SORT_TYPES[sortName] || exports.REPLIES_SORT_TYPES[sortName];
                        (0, assert_1.default)(sortProps);
                        if (!sortProps.score)
                            commentsSorted = comments;
                        // If sort type has no score function, that means it already has been sorted by DB
                        else
                            commentsSorted = comments
                                .map(function (comment) { return ({
                                comment: comment,
                                score: sortProps.score(comment)
                            }); })
                                .sort(function (postA, postB) { return postB.score - postA.score; })
                                .map(function (comment) { return comment.comment; });
                        (0, assert_1.default)(commentsSorted.every(function (comment) { return typeof comment.upvoteCount === "number" && typeof comment.downvoteCount === "number"; }));
                        commentsChunks = (0, util_1.chunks)(commentsSorted, limit);
                        return [4 /*yield*/, this.chunksToListOfPage(commentsChunks)];
                    case 1:
                        _a = _c.sent(), listOfPage = _a[0], cids = _a[1];
                        expectedNumOfPages = Math.ceil(comments.length / limit);
                        assert_1.default.equal(listOfPage.length, expectedNumOfPages, "Should generate ".concat(expectedNumOfPages, " pages for sort ").concat(sortName, " while it generated ").concat(listOfPage.length));
                        return [2 /*return*/, [(_b = {}, _b[sortName] = listOfPage[0], _b), cids[0]]];
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
                        if (comments.length === 0)
                            return [2 /*return*/, [undefined, undefined]];
                        return [2 /*return*/, this.sortComments(comments, "hot")];
                }
            });
        });
    };
    SortHandler.prototype.sortCommentsByTop = function (parentCid, sortName, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var sortProps, comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sortProps = exports.POSTS_SORT_TYPES[sortName] || exports.REPLIES_SORT_TYPES[sortName];
                        (0, assert_1.default)(sortProps.timeframe, "Need timeframe to sort top");
                        return [4 /*yield*/, this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(parentCid, (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[sortProps.timeframe], Number.MAX_SAFE_INTEGER, trx)];
                    case 1:
                        comments = _a.sent();
                        if (comments.length === 0)
                            return [2 /*return*/, [undefined, undefined]];
                        return [2 /*return*/, this.sortComments(comments, sortName)];
                }
            });
        });
    };
    SortHandler.prototype.sortCommentsByControversial = function (parentCid, sortName, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var sortProps, comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sortProps = exports.POSTS_SORT_TYPES[sortName] || exports.REPLIES_SORT_TYPES[sortName];
                        (0, assert_1.default)(sortProps.timeframe, "Need timeframe to sort controversial");
                        return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsBetweenTimestampRange(parentCid, (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[sortProps.timeframe], Number.MAX_SAFE_INTEGER, trx)];
                    case 1:
                        comments = _a.sent();
                        if (comments.length === 0)
                            return [2 /*return*/, [undefined, undefined]];
                        return [2 /*return*/, this.sortComments(comments, sortName)];
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
                        if (comments.length === 0)
                            return [2 /*return*/, [undefined, undefined]];
                        return [2 /*return*/, this.sortComments(comments, "new")];
                }
            });
        });
    };
    SortHandler.prototype.getSortPromises = function (comment, trx) {
        var _this = this;
        if (!comment) {
            // Sorting posts on a subplebbit level
            var sortPromises_1 = [this.sortCommentsByHot(undefined, trx), this.sortCommentsByNew(undefined, trx)];
            Object.keys(exports.POSTS_SORT_TYPES)
                .filter(function (postSort) { return postSort !== "hot" && postSort !== "new"; })
                .forEach(function (postSortName) {
                if (postSortName.includes("controversial"))
                    sortPromises_1.push(_this.sortCommentsByControversial.bind(_this)(undefined, postSortName, trx));
                else if (postSortName.includes("top"))
                    sortPromises_1.push(_this.sortCommentsByTop.bind(_this)(undefined, postSortName, trx));
            });
            return sortPromises_1;
        }
        else {
            return Object.keys(exports.REPLIES_SORT_TYPES).map(function (sortName) { return __awaiter(_this, void 0, void 0, function () {
                var comments;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            (0, assert_1.default)((_a = this.subplebbit) === null || _a === void 0 ? void 0 : _a.dbHandler);
                            if (!(sortName === "topAll")) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(comment.cid, 0, Number.MAX_SAFE_INTEGER, trx)];
                        case 1:
                            comments = _b.sent();
                            return [3 /*break*/, 6];
                        case 2:
                            if (!(sortName === "old")) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(comment.cid, "asc", trx)];
                        case 3:
                            comments = _b.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsUnderComment(comment.cid, trx)];
                        case 5:
                            comments = _b.sent();
                            _b.label = 6;
                        case 6:
                            if (comments.length === 0)
                                return [2 /*return*/, [undefined, undefined]];
                            (0, assert_1.default)(comments.every(function (comment) { return typeof comment.upvoteCount === "number" && typeof comment.downvoteCount === "number"; }));
                            return [2 /*return*/, this.sortComments(comments, sortName)];
                    }
                });
            }); });
        }
    };
    SortHandler.prototype.cacheCommentsPages = function (trx) {
        return __awaiter(this, void 0, void 0, function () {
            var commentLevels, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsGroupByDepth(trx)];
                    case 1:
                        commentLevels = _a.sent();
                        i = commentLevels.length - 1;
                        _a.label = 2;
                    case 2:
                        if (!(i >= 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, Promise.all(commentLevels[i].map(function (comment) { return _this.generatePagesUnderComment(comment, trx); }))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i--;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this.generatePagesUnderComment(undefined, trx)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SortHandler.prototype.generatePagesUnderComment = function (comment, trx) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __awaiter(this, void 0, void 0, function () {
            var key, cachedPageJson, cachedPage, subplebbitPostCount, _o, res, _p, pagesRaw, pageCids, _i, res_1, _q, page, pageCid, pages;
            return __generator(this, function (_r) {
                switch (_r.label) {
                    case 0:
                        if ((comment === null || comment === void 0 ? void 0 : comment.replyCount) === 0)
                            return [2 /*return*/, undefined];
                        if (comment && (comment.replyCount === undefined || comment.replyCount === null))
                            throw new Error("Comment has not defined replyCount (".concat(comment.replyCount, "): ").concat(JSON.stringify(comment)));
                        key = (comment === null || comment === void 0 ? void 0 : comment.cid) || "subplebbit";
                        return [4 /*yield*/, ((_a = this.subplebbit.dbHandler) === null || _a === void 0 ? void 0 : _a.keyvGet(key))];
                    case 1:
                        cachedPageJson = _r.sent();
                        if (!(!cachedPageJson || JSON.stringify(cachedPageJson) === "{}")) return [3 /*break*/, 3];
                        return [4 /*yield*/, ((_b = this.subplebbit.dbHandler) === null || _b === void 0 ? void 0 : _b.keyvDelete(key))];
                    case 2:
                        _r.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        cachedPage = new pages_1.Pages(__assign(__assign({}, cachedPageJson), { subplebbit: this.subplebbit }));
                        (0, assert_1.default)(cachedPage.toJSON && JSON.stringify(cachedPage.toJSON()) !== "{}", "Cache returns empty pages");
                        return [2 /*return*/, cachedPage];
                    case 4:
                        _o = key === "subplebbit";
                        if (!_o) return [3 /*break*/, 6];
                        return [4 /*yield*/, ((_c = this.subplebbit.dbHandler) === null || _c === void 0 ? void 0 : _c.queryCountOfPosts(trx))];
                    case 5:
                        _o = (_r.sent());
                        _r.label = 6;
                    case 6:
                        subplebbitPostCount = _o;
                        if (subplebbitPostCount === 0)
                            // If subplebbit and has no posts, then return undefined
                            return [2 /*return*/, undefined];
                        return [4 /*yield*/, Promise.all(this.getSortPromises(comment, trx))];
                    case 7:
                        res = _r.sent();
                        _p = [{}, {}], pagesRaw = _p[0], pageCids = _p[1];
                        for (_i = 0, res_1 = res; _i < res_1.length; _i++) {
                            _q = res_1[_i], page = _q[0], pageCid = _q[1];
                            pagesRaw = __assign(__assign({}, pagesRaw), page);
                            if (page)
                                pageCids[Object.keys(page)[0]] = pageCid;
                        }
                        // [pagesRaw, pageCids] = [removeKeysWithUndefinedValues(pagesRaw), removeKeysWithUndefinedValues(pageCids)];
                        if (!pagesRaw || !pageCids || JSON.stringify(pagesRaw) === "{}" || JSON.stringify(pageCids) === "{}")
                            throw new Error("Failed to generate pages for ".concat(key, ": pagesRaw: ").concat(pagesRaw, ", pageCids: ").concat(pageCids));
                        pages = new pages_1.Pages({ pages: pagesRaw, pageCids: pageCids, subplebbit: this.subplebbit });
                        if (key === "subplebbit") {
                            // If there is at least one comment in subplebbit, then assert the following
                            [(_d = pages === null || pages === void 0 ? void 0 : pages.pages) === null || _d === void 0 ? void 0 : _d.controversialAll, (_e = pages === null || pages === void 0 ? void 0 : pages.pages) === null || _e === void 0 ? void 0 : _e.hot, (_f = pages === null || pages === void 0 ? void 0 : pages.pages) === null || _f === void 0 ? void 0 : _f.new, (_g = pages === null || pages === void 0 ? void 0 : pages.pages) === null || _g === void 0 ? void 0 : _g.topAll].forEach(function (sortPage) {
                                var _a;
                                (0, assert_1.default)(typeof subplebbitPostCount === "number");
                                if (sortPage && Array.isArray(sortPage === null || sortPage === void 0 ? void 0 : sortPage.comments))
                                    assert_1.default.ok(((_a = sortPage === null || sortPage === void 0 ? void 0 : sortPage.comments) === null || _a === void 0 ? void 0 : _a.length) >= Math.min(subplebbitPostCount, exports.SORTED_POSTS_PAGE_SIZE));
                            });
                        }
                        else {
                            [(_h = pages === null || pages === void 0 ? void 0 : pages.pages) === null || _h === void 0 ? void 0 : _h.controversialAll, (_j = pages === null || pages === void 0 ? void 0 : pages.pages) === null || _j === void 0 ? void 0 : _j.new, (_k = pages === null || pages === void 0 ? void 0 : pages.pages) === null || _k === void 0 ? void 0 : _k.topAll, (_l = pages === null || pages === void 0 ? void 0 : pages.pages) === null || _l === void 0 ? void 0 : _l.old].forEach(function (sortPage) {
                                var _a;
                                (0, assert_1.default)(typeof (comment === null || comment === void 0 ? void 0 : comment.replyCount) === "number");
                                if (sortPage && Array.isArray(sortPage === null || sortPage === void 0 ? void 0 : sortPage.comments))
                                    assert_1.default.ok(((_a = sortPage === null || sortPage === void 0 ? void 0 : sortPage.comments) === null || _a === void 0 ? void 0 : _a.length) >= Math.min(exports.SORTED_POSTS_PAGE_SIZE, comment.replyCount), "Replies page is missing comments");
                            });
                        }
                        Object.values(JSON.parse(JSON.stringify(pages)).pages).forEach(function (sortPage) {
                            (0, assert_1.default)(sortPage.comments.every(function (comment) { return typeof comment.upvoteCount === "number"; }));
                        });
                        return [4 /*yield*/, ((_m = this.subplebbit.dbHandler) === null || _m === void 0 ? void 0 : _m.keyvSet(key, pages.toJSON()))];
                    case 8:
                        _r.sent();
                        return [2 /*return*/, pages];
                }
            });
        });
    };
    SortHandler.prototype.deleteCommentPageCache = function (dbComment) {
        return __awaiter(this, void 0, void 0, function () {
            var log, cachesToDelete, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:sort-handler:deleteCommentPageCache");
                        (0, assert_1.default)(this.subplebbit.dbHandler);
                        _a = [[
                                dbComment.cid
                            ]];
                        return [4 /*yield*/, this.subplebbit.dbHandler.queryParentsOfComment(dbComment, undefined)];
                    case 1:
                        cachesToDelete = __spreadArray.apply(void 0, [__spreadArray.apply(void 0, _a.concat([(_b.sent()).map(function (comment) { return comment.cid; }), true])), [
                                "subplebbit"
                            ], false]);
                        log.trace("Caches to delete: ".concat(cachesToDelete));
                        return [4 /*yield*/, Promise.all(cachesToDelete.map(function (cacheKey) { return __awaiter(_this, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                                return [2 /*return*/, (_a = this.subplebbit.dbHandler) === null || _a === void 0 ? void 0 : _a.keyvDelete(cacheKey)];
                            }); }); }))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return SortHandler;
}());
exports.SortHandler = SortHandler;
