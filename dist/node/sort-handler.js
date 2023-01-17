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
exports.SortHandler = exports.REPLIES_SORT_TYPES = exports.POSTS_SORT_TYPES = void 0;
var util_1 = require("./util");
var pages_1 = require("./pages");
var assert_1 = __importDefault(require("assert"));
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var lodash_1 = __importDefault(require("lodash"));
var constants_1 = require("./constants");
exports.POSTS_SORT_TYPES = {
    hot: { score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.hotScore.apply(void 0, args);
        }, dbSorted: false },
    new: { score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.newScore.apply(void 0, args);
        }, dbSorted: true },
    topHour: { timeframe: "HOUR", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.topScore.apply(void 0, args);
        }, dbSorted: true },
    topDay: { timeframe: "DAY", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.topScore.apply(void 0, args);
        }, dbSorted: true },
    topWeek: { timeframe: "WEEK", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.topScore.apply(void 0, args);
        }, dbSorted: true },
    topMonth: { timeframe: "MONTH", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.topScore.apply(void 0, args);
        }, dbSorted: true },
    topYear: { timeframe: "YEAR", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.topScore.apply(void 0, args);
        }, dbSorted: true },
    topAll: { timeframe: "ALL", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.topScore.apply(void 0, args);
        }, dbSorted: true },
    controversialHour: { timeframe: "HOUR", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.controversialScore.apply(void 0, args);
        }, dbSorted: false },
    controversialDay: { timeframe: "DAY", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.controversialScore.apply(void 0, args);
        }, dbSorted: false },
    controversialWeek: { timeframe: "WEEK", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.controversialScore.apply(void 0, args);
        }, dbSorted: false },
    controversialMonth: { timeframe: "MONTH", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.controversialScore.apply(void 0, args);
        }, dbSorted: false },
    controversialYear: { timeframe: "YEAR", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.controversialScore.apply(void 0, args);
        }, dbSorted: false },
    controversialAll: { timeframe: "ALL", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.controversialScore.apply(void 0, args);
        }, dbSorted: false }
};
exports.REPLIES_SORT_TYPES = __assign(__assign({}, lodash_1.default.pick(exports.POSTS_SORT_TYPES, ["topAll", "new", "controversialAll"])), { old: {
        score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.oldScore.apply(void 0, args);
        },
        dbSorted: true
    } });
var SortHandler = /** @class */ (function () {
    function SortHandler(subplebbit) {
        this.subplebbit = subplebbit;
    }
    SortHandler.prototype.commentChunksToPages = function (chunks, sortName) {
        return __awaiter(this, void 0, void 0, function () {
            var listOfPage, cids, chunksWithReplies, i, pageComments, page, _a, _b;
            var _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
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
                                                            return [4 /*yield*/, this.generateRepliesPages(comment, undefined)];
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
                        chunksWithReplies = _d.sent();
                        i = chunksWithReplies.length - 1;
                        _d.label = 2;
                    case 2:
                        if (!(i >= 0)) return [3 /*break*/, 5];
                        pageComments = chunksWithReplies[i].map(function (c) { return c.toJSONPages(); });
                        page = new pages_1.Page({
                            nextCid: cids[i + 1],
                            comments: pageComments
                        });
                        _a = cids;
                        _b = i;
                        return [4 /*yield*/, this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(page))];
                    case 3:
                        _a[_b] = (_d.sent()).path;
                        listOfPage[i] = page;
                        _d.label = 4;
                    case 4:
                        i--;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, (_c = {}, _c[sortName] = { pages: listOfPage, cids: cids }, _c)];
                }
            });
        });
    };
    // Resolves to sortedComments
    SortHandler.prototype.sortComments = function (comments, sortName, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var commentsSorted, sortProps, pinnedComments, commentsChunks, res, listOfPage, expectedNumOfPages;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sortProps = exports.POSTS_SORT_TYPES[sortName] || exports.REPLIES_SORT_TYPES[sortName];
                        if (typeof sortProps.score !== "function")
                            throw Error("SortProps[".concat(sortName, "] is not defined"));
                        if (sortProps.dbSorted)
                            commentsSorted = comments; // already sorted
                        else
                            commentsSorted = comments
                                .map(function (comment) { return ({
                                comment: comment,
                                score: sortProps.score(comment)
                            }); })
                                .sort(function (postA, postB) { return postB.score - postA.score; })
                                .map(function (comment) { return comment.comment; });
                        if (!options.ensurePinnedCommentsAreOnTop) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.subplebbit.dbHandler.queryPinnedComments((_a = comments[0]) === null || _a === void 0 ? void 0 : _a.parentCid)];
                    case 1:
                        pinnedComments = (_b.sent()).sort(function (commentA, commentB) { return sortProps.score(commentB) - sortProps.score(commentA); });
                        commentsSorted = pinnedComments.concat(commentsSorted.filter(function (comment) { return !comment.pinned; }));
                        _b.label = 2;
                    case 2:
                        if (commentsSorted.length === 0)
                            return [2 /*return*/, undefined];
                        commentsChunks = lodash_1.default.chunk(commentsSorted, options.pageSize);
                        return [4 /*yield*/, this.commentChunksToPages(commentsChunks, sortName)];
                    case 3:
                        res = _b.sent();
                        listOfPage = Object.values(res)[0].pages;
                        expectedNumOfPages = Math.ceil(commentsSorted.length / options.pageSize);
                        assert_1.default.equal(listOfPage.length, expectedNumOfPages, "Should generate ".concat(expectedNumOfPages, " pages for sort ").concat(sortName, " while it generated ").concat(listOfPage.length));
                        return [2 /*return*/, res];
                }
            });
        });
    };
    SortHandler.prototype.sortCommentsByHot = function (parentCid, options, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsUnderComment(parentCid, options, trx)];
                    case 1:
                        comments = _a.sent();
                        return [2 /*return*/, this.sortComments(comments, "hot", options)];
                }
            });
        });
    };
    SortHandler.prototype.sortCommentsByTop = function (parentCid, sortName, options, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var sortProps, comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sortProps = exports.POSTS_SORT_TYPES[sortName] || exports.REPLIES_SORT_TYPES[sortName];
                        (0, assert_1.default)(sortProps.timeframe, "Need timeframe to sort top");
                        return [4 /*yield*/, this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(parentCid, (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[sortProps.timeframe], Number.MAX_SAFE_INTEGER, options, trx)];
                    case 1:
                        comments = _a.sent();
                        return [2 /*return*/, this.sortComments(comments, sortName, options)];
                }
            });
        });
    };
    SortHandler.prototype.sortCommentsByControversial = function (parentCid, sortName, options, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var sortProps, comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sortProps = exports.POSTS_SORT_TYPES[sortName] || exports.REPLIES_SORT_TYPES[sortName];
                        (0, assert_1.default)(sortProps.timeframe, "Need timeframe to sort controversial");
                        return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsBetweenTimestampRange(parentCid, (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[sortProps.timeframe], Number.MAX_SAFE_INTEGER, options, trx)];
                    case 1:
                        comments = _a.sent();
                        return [2 /*return*/, this.sortComments(comments, sortName, options)];
                }
            });
        });
    };
    SortHandler.prototype.sortCommentsByNew = function (parentCid, options, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var comments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(parentCid, "desc", options, trx)];
                    case 1:
                        comments = _a.sent();
                        return [2 /*return*/, this.sortComments(comments, "new", options)];
                }
            });
        });
    };
    SortHandler.prototype._generationResToPages = function (res) {
        res = res.filter(function (res) { return Boolean(res); }); // Take out undefined values
        if (res.length === 0)
            return undefined;
        var mergedObject = Object.assign.apply(Object, __spreadArray([{}], res, false));
        var pages = new pages_1.Pages({
            pages: Object.assign.apply(Object, __spreadArray([{}], Object.entries(mergedObject).map(function (_a) {
                var _b;
                var sortName = _a[0], pages = _a[1];
                return (_b = {}, _b[sortName] = pages.pages[0], _b);
            }), false)),
            pageCids: Object.assign.apply(Object, __spreadArray([{}], Object.entries(mergedObject).map(function (_a) {
                var _b;
                var sortName = _a[0], pages = _a[1];
                return (_b = {}, _b[sortName] = pages.cids[0], _b);
            }), false)),
            subplebbit: { address: this.subplebbit.address, plebbit: this.subplebbit.plebbit }
        });
        return pages;
    };
    SortHandler.prototype._generateSubplebbitPosts = function (trx, pageOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var sortPromises, sorts;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sortPromises = [
                            this.sortCommentsByHot(undefined, pageOptions, trx),
                            this.sortCommentsByNew(undefined, pageOptions, trx)
                        ];
                        sortPromises.push.apply(sortPromises, Object.keys(exports.POSTS_SORT_TYPES)
                            .filter(function (key) { return key.startsWith("controversial"); })
                            .map(function (sortName) { return _this.sortCommentsByControversial.bind(_this)(undefined, sortName, pageOptions, trx); }));
                        sortPromises.push.apply(sortPromises, Object.keys(exports.POSTS_SORT_TYPES)
                            .filter(function (key) { return key.startsWith("top"); })
                            .map(function (sortName) { return _this.sortCommentsByTop.bind(_this)(undefined, sortName, pageOptions, trx); }));
                        return [4 /*yield*/, Promise.all(sortPromises)];
                    case 1:
                        sorts = _a.sent();
                        return [2 /*return*/, this._generationResToPages(sorts)];
                }
            });
        });
    };
    SortHandler.prototype._generateCommentReplies = function (comment, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var pageOptions, sorts, res;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pageOptions = {
                            ensurePinnedCommentsAreOnTop: true,
                            excludeCommentsWithDifferentSubAddress: true,
                            excludeDeletedComments: false,
                            excludeRemovedComments: false,
                            excludeCommentsWithNoUpdate: true,
                            pageSize: 50
                        };
                        return [4 /*yield*/, Promise.all([
                                this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(comment.cid, 0, Number.MAX_SAFE_INTEGER, pageOptions, trx),
                                this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(comment.cid, "desc", pageOptions, trx),
                                this.subplebbit.dbHandler.queryCommentsUnderComment(comment.cid, pageOptions, trx),
                                this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(comment.cid, "asc", pageOptions, trx)
                            ])];
                    case 1:
                        sorts = _a.sent();
                        return [4 /*yield*/, Promise.all(sorts.map(function (sort, i) { return sort.length > 0 && _this.sortComments(sort, Object.keys(exports.REPLIES_SORT_TYPES)[i], pageOptions); }))];
                    case 2:
                        res = _a.sent();
                        return [2 /*return*/, this._generationResToPages(res)];
                }
            });
        });
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
                        return [4 /*yield*/, Promise.all(commentLevels[i].map(function (comment) { return _this.generateRepliesPages(comment, trx); }))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i--;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this.generateSubplebbitPosts(trx)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SortHandler.prototype.generateRepliesPages = function (comment, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cachedReplies, pages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.PREFIX_COMMENT_REPLIES_].concat(comment.cid);
                        return [4 /*yield*/, this.subplebbit.dbHandler.keyvGet(cacheKey)];
                    case 1:
                        cachedReplies = _a.sent();
                        if (cachedReplies)
                            return [2 /*return*/, new pages_1.Pages(__assign(__assign({}, cachedReplies), { subplebbit: this.subplebbit }))];
                        return [4 /*yield*/, this._generateCommentReplies(comment, trx)];
                    case 2:
                        pages = _a.sent();
                        if (!pages) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.subplebbit.dbHandler.keyvSet(cacheKey, pages.toJSON())];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, pages];
                }
            });
        });
    };
    SortHandler.prototype.generateSubplebbitPosts = function (trx) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var pageOptions, subplebbitPostCount, cacheKey, cachedPosts, pages;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pageOptions = {
                            ensurePinnedCommentsAreOnTop: true,
                            excludeCommentsWithDifferentSubAddress: true,
                            excludeDeletedComments: true,
                            excludeRemovedComments: true,
                            excludeCommentsWithNoUpdate: true,
                            pageSize: 50
                        };
                        return [4 /*yield*/, this.subplebbit.dbHandler.queryCountOfPosts(pageOptions, trx)];
                    case 1:
                        subplebbitPostCount = _c.sent();
                        if (subplebbitPostCount === 0)
                            return [2 /*return*/, undefined];
                        cacheKey = constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.POSTS_SUBPLEBBIT];
                        return [4 /*yield*/, ((_a = this.subplebbit.dbHandler) === null || _a === void 0 ? void 0 : _a.keyvGet(cacheKey))];
                    case 2:
                        cachedPosts = _c.sent();
                        if (cachedPosts)
                            return [2 /*return*/, new pages_1.Pages(__assign(__assign({}, cachedPosts), { subplebbit: this.subplebbit }))];
                        return [4 /*yield*/, this._generateSubplebbitPosts(trx, pageOptions)];
                    case 3:
                        pages = _c.sent();
                        if (!pages && subplebbitPostCount > 0)
                            throw Error("Pages are empty even though subplebbit(".concat(this.subplebbit.address, ") has ").concat(subplebbitPostCount, " posts"));
                        if (!pages)
                            return [2 /*return*/, undefined];
                        return [4 /*yield*/, ((_b = this.subplebbit.dbHandler) === null || _b === void 0 ? void 0 : _b.keyvSet(cacheKey, pages.toJSON()))];
                    case 4:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SortHandler.prototype.deleteCommentPageCache = function (dbComment) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log, cacheKey, cachesToDelete, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:sort-handler:deleteCommentPageCache");
                        cacheKey = function (cid) { return constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.PREFIX_COMMENT_REPLIES_].concat(cid); };
                        (0, assert_1.default)(this.subplebbit.dbHandler && dbComment.cid);
                        _b = [[
                                cacheKey(dbComment.cid)
                            ]];
                        return [4 /*yield*/, this.subplebbit.dbHandler.queryParentsOfComment(dbComment, undefined)];
                    case 1:
                        cachesToDelete = __spreadArray.apply(void 0, [__spreadArray.apply(void 0, _b.concat([(_c.sent()).map(function (comment) { return cacheKey(comment.cid); }), true])), [
                                constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.POSTS_SUBPLEBBIT]
                            ], false]);
                        log.trace("Caches to delete: ".concat(cachesToDelete));
                        return [4 /*yield*/, ((_a = this.subplebbit.dbHandler) === null || _a === void 0 ? void 0 : _a.keyvDelete(cachesToDelete))];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return SortHandler;
}());
exports.SortHandler = SortHandler;
