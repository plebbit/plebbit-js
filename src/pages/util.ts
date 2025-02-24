import type {
    PageIpfs,
    PagesTypeIpfs,
    PagesTypeJson,
    PostSort,
    ReplySort,
    Timeframe,
    RepliesPagesTypeIpfs,
    PostsPagesTypeIpfs,
    PageTypeJson
} from "./types.js";

import assert from "assert";
import { BasePages } from "./pages.js";

import * as remeda from "remeda";
import type { CommentWithinPageJson } from "../publications/comment/types.js";
import { shortifyAddress, shortifyCid } from "../util.js";
import { OriginalCommentFieldsBeforeCommentUpdateSchema } from "../publications/comment/schema.js";

//This is temp. TODO replace this with accurate mapping
export const TIMEFRAMES_TO_SECONDS: Record<Timeframe, number> = Object.freeze({
    HOUR: 60 * 60,
    DAY: 60 * 60 * 24,
    WEEK: 60 * 60 * 24 * 7,
    MONTH: 60 * 60 * 24 * 7 * 4,
    YEAR: 60 * 60 * 24 * 7 * 4 * 12,
    ALL: Infinity
});

export const POSTS_SORT_TYPES: PostSort = {
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

export const REPLIES_SORT_TYPES: ReplySort = {
    ...remeda.pick(POSTS_SORT_TYPES, ["topAll", "new", "controversialAll"]),
    old: { score: (...args) => oldScore(...args) }
};

type CommentToSort = PageIpfs["comments"][0];

export function hotScore(comment: CommentToSort) {
    assert(
        typeof comment.commentUpdate.downvoteCount === "number" &&
            typeof comment.commentUpdate.upvoteCount === "number" &&
            typeof comment.comment.timestamp === "number"
    );

    let score = comment.commentUpdate.upvoteCount - comment.commentUpdate.downvoteCount;
    score++; // reddit initial upvotes is 1, plebbit is 0
    const order = Math.log10(Math.max(Math.abs(score), 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = comment.comment.timestamp - 1134028003;
    return remeda.round(sign * order + seconds / 45000, 7);
}

export function controversialScore(comment: CommentToSort) {
    assert(typeof comment.commentUpdate.downvoteCount === "number" && typeof comment.commentUpdate.upvoteCount === "number");

    const upvoteCount = comment.commentUpdate.upvoteCount + 1; // reddit initial upvotes is 1, plebbit is 0
    if (comment.commentUpdate.downvoteCount <= 0 || upvoteCount <= 0) return 0;
    const magnitude = upvoteCount + comment.commentUpdate.downvoteCount;
    const balance =
        upvoteCount > comment.commentUpdate.downvoteCount
            ? comment.commentUpdate.downvoteCount / upvoteCount
            : upvoteCount / comment.commentUpdate.downvoteCount;
    return Math.pow(magnitude, balance);
}

export function topScore(comment: CommentToSort) {
    assert(typeof comment.commentUpdate.downvoteCount === "number" && typeof comment.commentUpdate.upvoteCount === "number");

    return comment.commentUpdate.upvoteCount - comment.commentUpdate.downvoteCount;
}

export function newScore(comment: CommentToSort) {
    assert(typeof comment.comment.timestamp === "number");
    return comment.comment.timestamp;
}

export function oldScore(comment: CommentToSort) {
    assert(typeof comment.comment.timestamp === "number");

    return -comment.comment.timestamp;
}

export function parsePageIpfs(pageIpfs: PageIpfs): PageTypeJson {
    const finalComments = pageIpfs.comments.map((commentObj) => {
        // This code below is duplicated in comment._initCommentUpdate
        // TODO move it to a shared function
        const parsedPages = commentObj.commentUpdate.replies ? parsePagesIpfs(commentObj.commentUpdate.replies) : undefined;
        const postCid = commentObj.comment.postCid ?? (commentObj.comment.depth === 0 ? commentObj.commentUpdate.cid : undefined);
        if (!postCid) throw Error("Failed to infer postCid from pageIpfs.comments.comment");

        const spoiler =
            typeof commentObj.commentUpdate.spoiler === "boolean"
                ? commentObj.commentUpdate.spoiler
                : typeof commentObj.commentUpdate.edit?.spoiler === "boolean"
                  ? commentObj.commentUpdate.edit?.spoiler
                  : commentObj.comment.spoiler;

        const nsfw =
            typeof commentObj.commentUpdate.nsfw === "boolean"
                ? commentObj.commentUpdate.nsfw
                : typeof commentObj.commentUpdate.edit?.nsfw === "boolean"
                  ? commentObj.commentUpdate.edit?.nsfw
                  : commentObj.comment.nsfw;
        const finalJson: CommentWithinPageJson = {
            ...commentObj.comment,
            ...commentObj.commentUpdate,
            signature: commentObj.comment.signature,
            author: {
                ...commentObj.comment.author,
                ...commentObj.commentUpdate.author,
                shortAddress: shortifyAddress(commentObj.comment.author.address),
                flair:
                    commentObj.commentUpdate?.author?.subplebbit?.flair ||
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
            spoiler,
            nsfw,
            flair: commentObj.comment.flair || commentObj.commentUpdate.edit?.flair,
            postCid
        };
        return finalJson;
    });

    return { comments: finalComments, nextCid: pageIpfs.nextCid };
}

export function parsePagesIpfs(pagesRaw: PagesTypeIpfs): Omit<PagesTypeJson, "clients"> {
    const keys = remeda.keys.strict(pagesRaw.pages);
    const parsedPages = Object.values(pagesRaw.pages).map((pageIpfs) => parsePageIpfs(pageIpfs));
    const pagesType = remeda.fromEntries.strict(keys.map((key, i) => [key, parsedPages[i]]));
    return { pages: pagesType, pageCids: pagesRaw.pageCids };
}

// To use for both subplebbit.posts and comment.replies

export function parseRawPages(
    pages: PagesTypeIpfs | Omit<PagesTypeJson, "clients"> | BasePages | undefined
): Pick<BasePages, "pages"> & { pagesIpfs: RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined } {
    if (!pages)
        return {
            pages: {},
            pagesIpfs: undefined
        };

    const isIpfs = typeof Object.values(pages.pages)[0]?.comments[0]?.["commentUpdate"]?.["cid"] === "string";

    if (isIpfs) {
        pages = <PagesTypeIpfs>pages;
        // pages is a PagesTypeIpfs
        const parsedPages = parsePagesIpfs(pages);
        return {
            pages: parsedPages.pages,
            pagesIpfs: <PagesTypeIpfs>pages
        };
    } else if (pages instanceof BasePages)
        return { pages: pages.pages, pagesIpfs: pages.toJSONIpfs() }; // already parsed
    else {
        pages = pages as PagesTypeJson;

        return {
            pages: pages.pages,
            pagesIpfs: undefined
        };
    }
}

// finding comments within pages

export function findCommentInPages(
    pageIpfs: RepliesPagesTypeIpfs | PostsPagesTypeIpfs,
    targetCommentCid: string
): PageIpfs["comments"][0] | undefined {
    if (!pageIpfs) throw Error("should define page ipfs");
    if (!targetCommentCid) throw Error("should define target comment cid");

    for (const page of Object.values(pageIpfs.pages))
        for (const pageComment of page.comments) if (pageComment.commentUpdate.cid === targetCommentCid) return pageComment;

    return undefined;
}

export function findCommentInPagesRecrusively(
    pages: RepliesPagesTypeIpfs | PostsPagesTypeIpfs,
    targetCid: string,
    targetDepth: number | undefined,
    visited = new Set<string>()
): PageIpfs["comments"][0] | undefined {
    if (!pages) throw Error("should define page ipfs");
    if (!targetCid) throw Error("should define target comment cid");

    // Check all pages in the current level
    for (const [pageCid, page] of Object.entries(pages.pages)) {
        // Skip if we've visited this page
        if (visited.has(pageCid)) continue;

        visited.add(pageCid);

        const currentDepth = page.comments[0].comment.depth;

        if (currentDepth === targetDepth || targetDepth === undefined) {
            for (const pageComment of page.comments) if (pageComment.commentUpdate.cid === targetCid) return pageComment;
        }

        if (targetDepth === undefined || currentDepth < targetDepth) {
            for (const pageComment of page.comments) {
                if (pageComment.commentUpdate.replies?.pages) {
                    const result = findCommentInPagesRecrusively(pageComment.commentUpdate.replies, targetCid, targetDepth, visited);
                    if (result) return result;
                }
            }
        }
    }

    return undefined;
}
