import assert from "assert";
import { BasePages } from "./pages.js";
import * as remeda from "remeda";
import { shortifyAddress, shortifyCid } from "../util.js";
import { OriginalCommentFieldsBeforeCommentUpdateSchema } from "../publications/comment/schema.js";
//This is temp. TODO replace this with accurate mapping
export const TIMEFRAMES_TO_SECONDS = Object.freeze({
    HOUR: 60 * 60,
    DAY: 60 * 60 * 24,
    WEEK: 60 * 60 * 24 * 7,
    MONTH: 60 * 60 * 24 * 7 * 4,
    YEAR: 60 * 60 * 24 * 7 * 4 * 12,
    ALL: Infinity
});
export const POSTS_SORT_TYPES = {
    hot: { score: (...args) => hotScore(...args) },
    new: { score: (...args) => newScore(...args) },
    active: {
        score: (...args) => {
            throw Error("Active sort has no scoring");
        }
    },
    topHour: { timeframe: "HOUR", score: (...args) => topScore(...args) },
    topDay: { timeframe: "DAY", score: (...args) => topScore(...args) },
    topWeek: { timeframe: "WEEK", score: (...args) => topScore(...args) },
    topMonth: { timeframe: "MONTH", score: (...args) => topScore(...args) },
    topYear: { timeframe: "YEAR", score: (...args) => topScore(...args) },
    topAll: { timeframe: "ALL", score: (...args) => topScore(...args) },
    controversialHour: { timeframe: "HOUR", score: (...args) => controversialScore(...args) },
    controversialDay: { timeframe: "DAY", score: (...args) => controversialScore(...args) },
    controversialWeek: { timeframe: "WEEK", score: (...args) => controversialScore(...args) },
    controversialMonth: { timeframe: "MONTH", score: (...args) => controversialScore(...args) },
    controversialYear: { timeframe: "YEAR", score: (...args) => controversialScore(...args) },
    controversialAll: { timeframe: "ALL", score: (...args) => controversialScore(...args) }
};
export const REPLIES_SORT_TYPES = {
    ...remeda.pick(POSTS_SORT_TYPES, ["topAll", "new", "controversialAll"]),
    old: { score: (...args) => oldScore(...args) }
};
export function hotScore(comment) {
    assert(typeof comment.commentUpdate.downvoteCount === "number" &&
        typeof comment.commentUpdate.upvoteCount === "number" &&
        typeof comment.comment.timestamp === "number");
    let score = comment.commentUpdate.upvoteCount - comment.commentUpdate.downvoteCount;
    score++; // reddit initial upvotes is 1, plebbit is 0
    const order = Math.log10(Math.max(Math.abs(score), 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = comment.comment.timestamp - 1134028003;
    return remeda.round(sign * order + seconds / 45000, 7);
}
export function controversialScore(comment) {
    assert(typeof comment.commentUpdate.downvoteCount === "number" && typeof comment.commentUpdate.upvoteCount === "number");
    const upvoteCount = comment.commentUpdate.upvoteCount + 1; // reddit initial upvotes is 1, plebbit is 0
    if (comment.commentUpdate.downvoteCount <= 0 || upvoteCount <= 0)
        return 0;
    const magnitude = upvoteCount + comment.commentUpdate.downvoteCount;
    const balance = upvoteCount > comment.commentUpdate.downvoteCount
        ? comment.commentUpdate.downvoteCount / upvoteCount
        : upvoteCount / comment.commentUpdate.downvoteCount;
    return Math.pow(magnitude, balance);
}
export function topScore(comment) {
    assert(typeof comment.commentUpdate.downvoteCount === "number" && typeof comment.commentUpdate.upvoteCount === "number");
    return comment.commentUpdate.upvoteCount - comment.commentUpdate.downvoteCount;
}
export function newScore(comment) {
    assert(typeof comment.comment.timestamp === "number");
    return comment.comment.timestamp;
}
export function oldScore(comment) {
    assert(typeof comment.comment.timestamp === "number");
    return -comment.comment.timestamp;
}
export function parsePageIpfs(pageIpfs) {
    const finalComments = pageIpfs.comments.map((commentObj) => {
        // This code below is duplicated in comment._initCommentUpdate
        // TODO move it to a shared function
        const parsedPages = commentObj.commentUpdate.replies ? parsePagesIpfs(commentObj.commentUpdate.replies) : undefined;
        const postCid = commentObj.comment.postCid ?? (commentObj.comment.depth === 0 ? commentObj.commentUpdate.cid : undefined);
        if (!postCid)
            throw Error("Failed to infer postCid from pageIpfs.comments.comment");
        const finalJson = {
            ...commentObj.comment,
            ...commentObj.commentUpdate,
            signature: commentObj.comment.signature,
            author: {
                ...commentObj.comment.author,
                ...commentObj.commentUpdate.author,
                shortAddress: shortifyAddress(commentObj.comment.author.address),
                flair: commentObj.commentUpdate?.author?.subplebbit?.flair ||
                    commentObj.commentUpdate?.edit?.author?.flair ||
                    commentObj.comment.author.flair
            },
            shortCid: shortifyCid(commentObj.commentUpdate.cid),
            shortSubplebbitAddress: shortifyAddress(commentObj.comment.subplebbitAddress),
            original: OriginalCommentFieldsBeforeCommentUpdateSchema.parse(commentObj.comment),
            deleted: commentObj.commentUpdate.edit?.deleted,
            replies: parsedPages,
            content: commentObj.commentUpdate.edit?.content || commentObj.comment.content,
            reason: commentObj.commentUpdate.reason,
            spoiler: ("spoiler" in commentObj.commentUpdate && commentObj.commentUpdate.spoiler) ||
                (commentObj.commentUpdate.edit && "spoiler" in commentObj.commentUpdate.edit && commentObj.commentUpdate.edit.spoiler) ||
                commentObj.comment.spoiler,
            flair: commentObj.comment.flair || commentObj.commentUpdate.edit?.flair,
            postCid
        };
        return finalJson;
    });
    return { comments: finalComments, nextCid: pageIpfs.nextCid };
}
export function parsePagesIpfs(pagesRaw) {
    const keys = remeda.keys.strict(pagesRaw.pages);
    const parsedPages = Object.values(pagesRaw.pages).map((pageIpfs) => parsePageIpfs(pageIpfs));
    const pagesType = remeda.fromEntries.strict(keys.map((key, i) => [key, parsedPages[i]]));
    return { pages: pagesType, pageCids: pagesRaw.pageCids };
}
// To use for both subplebbit.posts and comment.replies
export function parseRawPages(pages) {
    if (!pages)
        return {
            pages: {},
            pagesIpfs: undefined
        };
    const isIpfs = typeof Object.values(pages.pages)[0]?.comments[0]?.["commentUpdate"]?.["cid"] === "string";
    if (isIpfs) {
        pages = pages;
        // pages is a PagesTypeIpfs
        const parsedPages = parsePagesIpfs(pages);
        return {
            pages: parsedPages.pages,
            pagesIpfs: pages
        };
    }
    else if (pages instanceof BasePages)
        return { pages: pages.pages, pagesIpfs: pages.toJSONIpfs() }; // already parsed
    else {
        pages = pages;
        return {
            pages: pages.pages,
            pagesIpfs: undefined
        };
    }
}
//# sourceMappingURL=util.js.map