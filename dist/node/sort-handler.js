"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortHandler = exports.SORTED_POSTS_PAGE_SIZE = exports.REPLIES_SORT_TYPES = exports.POSTS_SORT_TYPES = void 0;
const util_1 = require("./util");
const pages_1 = require("./pages");
const assert_1 = __importDefault(require("assert"));
const debugs = (0, util_1.getDebugLevels)("sort-handler");
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
exports.REPLIES_SORT_TYPES = Object.assign(Object.assign({}, (0, util_1.keepKeys)(exports.POSTS_SORT_TYPES, ["TOP_ALL", "NEW", "CONTROVERSIAL_ALL"])), { OLD: { type: "old" } });
exports.SORTED_POSTS_PAGE_SIZE = 50;
class SortHandler {
    constructor(subplebbit) {
        this.subplebbit = subplebbit;
    }
    chunksToListOfPage(chunks) {
        return __awaiter(this, void 0, void 0, function* () {
            if (chunks.length === 0)
                return [[undefined], [undefined]];
            const listOfPage = new Array(chunks.length);
            const cids = new Array(chunks.length);
            const chunksWithReplies = yield Promise.all(chunks.map((chunk) => __awaiter(this, void 0, void 0, function* () {
                return yield Promise.all(chunk.map((comment) => __awaiter(this, void 0, void 0, function* () {
                    if (comment.replyCount === 0)
                        return comment;
                    if (yield this.subplebbit._keyv.has(comment.cid)) {
                        const cachedComment = yield this.subplebbit._keyv.get(comment.cid);
                        comment.setReplies(cachedComment.sortedReplies, cachedComment.sortedRepliesCids);
                    }
                    else {
                        const [sortedReplies, sortedRepliesCids] = yield this.generatePagesUnderComment(comment, undefined);
                        assert_1.default.ok(sortedReplies);
                        yield this.subplebbit._keyv.set(comment.cid, { sortedReplies, sortedRepliesCids });
                        comment.setReplies(sortedReplies, sortedRepliesCids);
                    }
                    return comment;
                })));
            })));
            for (let i = chunksWithReplies.length - 1; i >= 0; i--) {
                const page = new pages_1.Page({
                    nextCid: cids[i + 1],
                    comments: chunksWithReplies[i]
                });
                cids[i] = (yield this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(page))).path;
                listOfPage[i] = page;
            }
            return [listOfPage, cids];
        });
    }
    // Resolves to sortedComments
    sortComments(comments, sortType, limit = exports.SORTED_POSTS_PAGE_SIZE) {
        return __awaiter(this, void 0, void 0, function* () {
            let commentsSorted;
            if (!sortType.score)
                commentsSorted = comments;
            // If sort type has no score function, that means it already has been sorted by DB
            else
                commentsSorted = comments
                    .map((comment) => ({
                    comment: comment,
                    score: sortType.score(comment)
                }))
                    .sort((postA, postB) => {
                    return postB.score - postA.score;
                })
                    .map((comment) => comment.comment);
            const commentsChunks = (0, util_1.chunks)(commentsSorted, limit);
            // @ts-ignore
            const [listOfPage, cids] = yield this.chunksToListOfPage(commentsChunks, sortType);
            return [{ [sortType.type]: listOfPage[0] }, cids[0]];
        });
    }
    sortCommentsByHot(parentCid, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = yield this.subplebbit.dbHandler.queryCommentsUnderComment(parentCid, trx);
            return yield this.sortComments(comments, exports.POSTS_SORT_TYPES.HOT);
        });
    }
    sortCommentsByTop(parentCid, timeframe, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            // Timeframe is "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL"
            const sortType = exports.POSTS_SORT_TYPES[`TOP_${timeframe}`];
            const comments = yield this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(parentCid, (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[timeframe], (0, util_1.timestamp)(), trx);
            return yield this.sortComments(comments, sortType);
        });
    }
    sortCommentsByControversial(parentCid, timeframe, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            const sortType = exports.POSTS_SORT_TYPES[`CONTROVERSIAL_${timeframe}`];
            const comments = yield this.subplebbit.dbHandler.queryCommentsBetweenTimestampRange(parentCid, (0, util_1.timestamp)() - util_1.TIMEFRAMES_TO_SECONDS[timeframe], (0, util_1.timestamp)(), trx);
            return yield this.sortComments(comments, sortType);
        });
    }
    sortCommentsByNew(parentCid, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = yield this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(parentCid, "desc", trx);
            return yield this.sortComments(comments, exports.POSTS_SORT_TYPES.NEW);
        });
    }
    getSortPromises(comment, trx) {
        if (!comment) {
            // Sorting posts on a subplebbit level
            const sortPromises = [this.sortCommentsByHot.bind(this)(null, trx), this.sortCommentsByNew.bind(this)(null, trx)];
            for (const timeframe of Object.keys(util_1.TIMEFRAMES_TO_SECONDS)) {
                sortPromises.push(this.sortCommentsByTop.bind(this)(null, timeframe, trx));
                sortPromises.push(this.sortCommentsByControversial.bind(this)(null, timeframe, trx));
            }
            return sortPromises;
        }
        else {
            return Object.values(exports.REPLIES_SORT_TYPES).map((sortType) => __awaiter(this, void 0, void 0, function* () {
                let comments;
                // @ts-ignore
                if (sortType.type === exports.REPLIES_SORT_TYPES.TOP_ALL.type)
                    comments = yield this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(comment.cid, 0, (0, util_1.timestamp)(), trx);
                else if (sortType.type === exports.REPLIES_SORT_TYPES.OLD.type)
                    comments = yield this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(comment.cid, "asc", trx);
                else
                    comments = yield this.subplebbit.dbHandler.queryCommentsUnderComment(comment.cid, trx);
                return this.sortComments(comments, sortType);
            }));
        }
    }
    generatePagesUnderComment(comment, trx) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create "pages" and "pageCids"
            if ((comment === null || comment === void 0 ? void 0 : comment.replyCount) === 0)
                return [undefined, undefined];
            const res = yield Promise.all(this.getSortPromises(comment, trx));
            let [pages, pageCids] = [{}, {}];
            for (const [page, pageCid] of res) {
                pages = Object.assign(Object.assign({}, pages), page);
                pageCids[Object.keys(page)[0]] = pageCid;
            }
            [pages, pageCids] = [(0, util_1.removeKeysWithUndefinedValues)(pages), (0, util_1.removeKeysWithUndefinedValues)(pageCids)];
            if (JSON.stringify(pages) === "{}")
                [pages, pageCids] = [undefined, undefined];
            return [pages, pageCids];
        });
    }
}
exports.SortHandler = SortHandler;
