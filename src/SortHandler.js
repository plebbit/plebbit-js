import {
    chunks,
    controversialScore,
    hotScore,
    keepKeys, removeKeysWithUndefinedValues,
    TIMEFRAMES_TO_SECONDS,
    timestamp
} from "./Util.js";
import Debug from "debug";
import {Page} from "./Pages.js";

const debug = Debug("plebbit-js:SortHandler");

export const POSTS_SORT_TYPES = Object.freeze({
    HOT: {type: "hot", "score": hotScore},
    NEW: {type: "new"},
    TOP_HOUR: {type: "topHour"},
    TOP_DAY: {type: "topDay"},
    TOP_WEEK: {type: "topWeek"},
    TOP_MONTH: {type: "topMonth"},
    TOP_YEAR: {type: "topYear"},
    TOP_ALL: {type: "topAll"},
    CONTROVERSIAL_HOUR: {type: "controversialHour", "score": controversialScore},
    CONTROVERSIAL_DAY: {type: "controversialDay", "score": controversialScore},
    CONTROVERSIAL_WEEK: {type: "controversialWeek", "score": controversialScore},
    CONTROVERSIAL_MONTH: {type: "controversialMonth", "score": controversialScore},
    CONTROVERSIAL_YEAR: {type: "controversialYear", "score": controversialScore},
    CONTROVERSIAL_ALL: {type: "controversialAll", "score": controversialScore}
});

export const REPLIES_SORT_TYPES = {
    ...keepKeys(POSTS_SORT_TYPES, ["TOP_ALL", "NEW", "CONTROVERSIAL_ALL"]),
    "OLD": {type: "old"}
};


export const SORTED_POSTS_PAGE_SIZE = 50;


export class SortHandler {
    constructor(subplebbit) {
        this.subplebbit = subplebbit;
    }

    async #chunksToListOfPage(chunks) {
        if (chunks.length === 0)
            return [[undefined], [undefined]];

        const listOfPage = new Array(chunks.length);
        const cids = new Array(chunks.length);
        const chunksWithReplies = await Promise.all(chunks.map(async chunk => {
            return await Promise.all(chunk.map(async comment => {
                const [sortedReplies, sortedRepliesCids] = await this.generatePagesUnderComment(comment);
                comment.setReplies(sortedReplies, sortedRepliesCids);
                return comment;
            }));
        }));
        for (let i = chunksWithReplies.length - 1; i >= 0; i--) {
            const page = new Page({
                "nextCid": cids[i + 1],
                "comments": chunksWithReplies[i]
            });
            cids[i] = (await this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(page))).path;
            listOfPage[i] = page;
        }
        return [listOfPage, cids];
    }


    // Resolves to sortedComments
    async #sortComments(comments, sortType, limit = SORTED_POSTS_PAGE_SIZE) {
        let commentsSorted;
        if (!sortType.score)
            commentsSorted = comments; // If sort type has no score function, that means it already has been sorted by DB
        else
            commentsSorted = comments.map(comment => ({
                "comment": comment,
                "score": sortType.score(comment)
            }))
                .sort((postA, postB) => {
                    return postB.score - postA.score;
                }).map(comment => comment.comment);

        const commentsChunks = chunks(commentsSorted, limit);
        const [listOfPage, cids] = await this.#chunksToListOfPage(commentsChunks, sortType);
        return [{[sortType.type]: listOfPage[0]}, cids[0]];

    }

    async #sortCommentsByHot(parentCid, trx) {
        const comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(parentCid, trx);
        return await this.#sortComments(comments, POSTS_SORT_TYPES.HOT);
    }

    async #sortCommentsByTop(parentCid, timeframe, trx) {
        // Timeframe is "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL"
        const sortType = POSTS_SORT_TYPES[`TOP_${timeframe}`];
        const comments = await this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(parentCid, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe], timestamp(), trx);
        return await this.#sortComments(comments, sortType);
    }


    async #sortCommentsByControversial(parentCid, timeframe, trx) {
        const sortType = POSTS_SORT_TYPES[`CONTROVERSIAL_${timeframe}`];
        const comments = await this.subplebbit.dbHandler.queryCommentsBetweenTimestampRange(parentCid, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe], timestamp(), trx);
        return await this.#sortComments(comments, sortType);

    }

    async #sortCommentsByNew(parentCid, trx) {
        const comments = await this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(parentCid, "desc", trx);
        return await this.#sortComments(comments, POSTS_SORT_TYPES.NEW);
    }

    #getSortPromises(comment, trx) {
        if (!comment) {
            // Sorting posts on a subplebbit level
            const sortPromises = [this.#sortCommentsByHot.bind(this)(null, trx), this.#sortCommentsByNew.bind(this)(null, trx)];
            for (const timeframe of Object.keys(TIMEFRAMES_TO_SECONDS)) {
                sortPromises.push(this.#sortCommentsByTop.bind(this)(null, timeframe, trx));
                sortPromises.push(this.#sortCommentsByControversial.bind(this)(null, timeframe, trx));
            }
            return sortPromises;
        } else {
            return Object.values(REPLIES_SORT_TYPES).map(async sortType => {
                let comments;
                if (sortType.type === REPLIES_SORT_TYPES.TOP_ALL.type)
                    comments = await this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(comment.cid, 0, timestamp(), trx);
                else if (sortType.type === REPLIES_SORT_TYPES.OLD.type)
                    comments = await this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(comment.cid, "asc", trx);
                else
                    comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(comment.cid, trx);
                return this.#sortComments(comments, sortType);
            });
        }
    }

    async generatePagesUnderComment(comment, trx) {

        // Create "pages" and "pageCids"
        const res = await Promise.all(this.#getSortPromises(comment, trx));
        let [pages, pageCids] = [{}, {}];
        for (const [page, pageCid] of res) {
            pages = {...pages, ...page};
            pageCids[Object.keys(page)[0]] = pageCid;
        }
        [pages, pageCids] = [removeKeysWithUndefinedValues(pages), removeKeysWithUndefinedValues(pageCids)];
        if (JSON.stringify(pages) === "{}")
            [pages, pageCids] = [undefined, undefined];
        return [pages, pageCids];


    }
}