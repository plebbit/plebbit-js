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
var assert_1 = __importDefault(require("assert"));
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var lodash_1 = __importDefault(require("lodash"));
exports.POSTS_SORT_TYPES = {
    hot: { score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.hotScore.apply(void 0, args);
        } },
    new: { score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.newScore.apply(void 0, args);
        } },
    topHour: { timeframe: "HOUR", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.topScore.apply(void 0, args);
        } },
    topDay: { timeframe: "DAY", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.topScore.apply(void 0, args);
        } },
    topWeek: { timeframe: "WEEK", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.topScore.apply(void 0, args);
        } },
    topMonth: { timeframe: "MONTH", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.topScore.apply(void 0, args);
        } },
    topYear: { timeframe: "YEAR", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.topScore.apply(void 0, args);
        } },
    topAll: { timeframe: "ALL", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.topScore.apply(void 0, args);
        } },
    controversialHour: { timeframe: "HOUR", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.controversialScore.apply(void 0, args);
        } },
    controversialDay: { timeframe: "DAY", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.controversialScore.apply(void 0, args);
        } },
    controversialWeek: { timeframe: "WEEK", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.controversialScore.apply(void 0, args);
        } },
    controversialMonth: { timeframe: "MONTH", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.controversialScore.apply(void 0, args);
        } },
    controversialYear: { timeframe: "YEAR", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.controversialScore.apply(void 0, args);
        } },
    controversialAll: { timeframe: "ALL", score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.controversialScore.apply(void 0, args);
        } }
};
exports.REPLIES_SORT_TYPES = __assign(__assign({}, lodash_1.default.pick(exports.POSTS_SORT_TYPES, ["topAll", "new", "controversialAll"])), { old: { score: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return util_1.oldScore.apply(void 0, args);
        } } });
var SortHandler = /** @class */ (function () {
    function SortHandler(subplebbit) {
        this.subplebbit = subplebbit;
    }
    SortHandler.prototype.commentChunksToPages = function (chunks, sortName) {
        return __awaiter(this, void 0, void 0, function () {
            var listOfPage, cids, chunksWithReplies, i, pageIpfs, _a, _b;
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
                                                var comment;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, this.subplebbit.plebbit.createComment(commentProps.comment)];
                                                        case 1:
                                                            comment = _a.sent();
                                                            if (commentProps.commentUpdate.replyCount > 0)
                                                                (0, assert_1.default)(commentProps.commentUpdate.replies);
                                                            return [2 /*return*/, comment.toJSONPagesIpfs(commentProps.commentUpdate)];
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
                        pageIpfs = (0, util_1.removeNullAndUndefinedValuesRecursively)({ nextCid: cids[i + 1], comments: chunksWithReplies[i] });
                        _a = cids;
                        _b = i;
                        return [4 /*yield*/, this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(pageIpfs))];
                    case 3:
                        _a[_b] = (_c.sent()).path;
                        listOfPage[i] = pageIpfs;
                        _c.label = 4;
                    case 4:
                        i--;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, Object.fromEntries([[sortName, { pages: listOfPage, cids: cids }]])];
                }
            });
        });
    };
    // Resolves to sortedComments
    SortHandler.prototype.sortComments = function (comments, sortName, options) {
        return __awaiter(this, void 0, void 0, function () {
            var sortProps, scoreSort, pinnedComments, unpinnedComments, timestampLower_1, commentsSorted, commentsChunks, res, listOfPage, expectedNumOfPages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (comments.length === 0)
                            return [2 /*return*/, undefined];
                        sortProps = exports.POSTS_SORT_TYPES[sortName] || exports.REPLIES_SORT_TYPES[sortName];
                        if (typeof sortProps.score !== "function")
                            throw Error("SortProps[".concat(sortName, "] is not defined"));
                        scoreSort = function (obj1, obj2) {
                            var score1 = sortProps.score({
                                timestamp: obj1.comment.timestamp,
                                upvoteCount: obj1.commentUpdate.upvoteCount,
                                downvoteCount: obj1.commentUpdate.downvoteCount
                            });
                            var score2 = sortProps.score({
                                timestamp: obj2.comment.timestamp,
                                upvoteCount: obj2.commentUpdate.upvoteCount,
                                downvoteCount: obj2.commentUpdate.downvoteCount
                            });
                            return score2 - score1;
                        };
                        pinnedComments = comments.filter(function (obj) { return obj.commentUpdate.pinned === true; }).sort(scoreSort);
                        unpinnedComments = comments.filter(function (obj) { return !obj.commentUpdate.pinned; }).sort(scoreSort);
                        if (sortProps.timeframe) {
                            timestampLower_1 = (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[sortProps.timeframe];
                            unpinnedComments = unpinnedComments.filter(function (obj) { return obj.comment.timestamp >= timestampLower_1; });
                        }
                        commentsSorted = pinnedComments.concat(unpinnedComments);
                        if (commentsSorted.length === 0)
                            return [2 /*return*/, undefined];
                        commentsChunks = lodash_1.default.chunk(commentsSorted, options.pageSize);
                        return [4 /*yield*/, this.commentChunksToPages(commentsChunks, sortName)];
                    case 1:
                        res = _a.sent();
                        listOfPage = Object.values(res)[0].pages;
                        expectedNumOfPages = Math.ceil(commentsSorted.length / options.pageSize);
                        assert_1.default.equal(listOfPage.length, expectedNumOfPages, "Should generate ".concat(expectedNumOfPages, " pages for sort ").concat(sortName, " while it generated ").concat(listOfPage.length));
                        return [2 /*return*/, res];
                }
            });
        });
    };
    SortHandler.prototype._generationResToPages = function (res) {
        res = res.filter(function (res) { return Boolean(res); }); // Take out undefined values
        if (res.length === 0)
            return undefined;
        var mergedObject = Object.assign.apply(Object, __spreadArray([{}], res, false));
        return {
            pages: Object.assign.apply(Object, __spreadArray([{}], Object.entries(mergedObject).map(function (_a) {
                var _b;
                var sortName = _a[0], pages = _a[1];
                return (_b = {}, _b[sortName] = pages.pages[0], _b);
            }), false)),
            pageCids: Object.assign.apply(Object, __spreadArray([{}], Object.entries(mergedObject).map(function (_a) {
                var _b;
                var sortName = _a[0], pages = _a[1];
                return (_b = {}, _b[sortName] = pages.cids[0], _b);
            }), false))
        };
    };
    SortHandler.prototype._generateSubplebbitPosts = function (pageOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var log, rawPosts, sortResults;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:sort-handler:generateSubplebbitPosts");
                        return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsForPages(pageOptions)];
                    case 1:
                        rawPosts = _a.sent();
                        if (rawPosts.length === 0) {
                            log("Subplebbit (".concat(this.subplebbit.address, ") has no posts to generate Pages"));
                            return [2 /*return*/, undefined];
                        }
                        return [4 /*yield*/, Promise.all(Object.keys(exports.POSTS_SORT_TYPES).map(function (sortName) { return _this.sortComments(rawPosts, sortName, pageOptions); }))];
                    case 2:
                        sortResults = _a.sent();
                        return [2 /*return*/, this._generationResToPages(sortResults)];
                }
            });
        });
    };
    SortHandler.prototype._generateCommentReplies = function (comment) {
        return __awaiter(this, void 0, void 0, function () {
            var pageOptions, comments, sortResults;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pageOptions = {
                            excludeCommentsWithDifferentSubAddress: true,
                            excludeDeletedComments: false,
                            excludeRemovedComments: false,
                            parentCid: comment.cid,
                            pageSize: 50
                        };
                        return [4 /*yield*/, this.subplebbit.dbHandler.queryCommentsForPages(pageOptions)];
                    case 1:
                        comments = _a.sent();
                        return [4 /*yield*/, Promise.all(Object.keys(exports.REPLIES_SORT_TYPES).map(function (sortName) { return _this.sortComments(comments, sortName, pageOptions); }))];
                    case 2:
                        sortResults = _a.sent();
                        return [2 /*return*/, this._generationResToPages(sortResults)];
                }
            });
        });
    };
    SortHandler.prototype.generateRepliesPages = function (comment) {
        return __awaiter(this, void 0, void 0, function () {
            var log, pages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:sort-handler:generateRepliesPages");
                        return [4 /*yield*/, this._generateCommentReplies(comment)];
                    case 1:
                        pages = _a.sent();
                        // TODO assert here
                        return [2 /*return*/, pages];
                }
            });
        });
    };
    SortHandler.prototype.generateSubplebbitPosts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pageOptions;
            return __generator(this, function (_a) {
                pageOptions = {
                    excludeCommentsWithDifferentSubAddress: true,
                    excludeDeletedComments: true,
                    excludeRemovedComments: true,
                    parentCid: null,
                    pageSize: 50
                };
                return [2 /*return*/, this._generateSubplebbitPosts(pageOptions)];
            });
        });
    };
    return SortHandler;
}());
exports.SortHandler = SortHandler;
