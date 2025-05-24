import type {
    PageIpfs,
    PagesTypeIpfs,
    PagesTypeJson,
    PostSort,
    ReplySort,
    Timeframe,
    PageTypeJson,
    ReplySortName,
    PostSortName
} from "./types.js";
import { Comment } from "../publications/comment/comment.js";
import assert from "assert";
import { BasePages } from "./pages.js";

import * as remeda from "remeda";
import type { CommentWithinPageJson } from "../publications/comment/types.js";
import { shortifyAddress, shortifyCid } from "../util.js";
import { OriginalCommentFieldsBeforeCommentUpdateSchema } from "../publications/comment/schema.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";

export const TIMEFRAMES_TO_SECONDS: Record<Timeframe, number> = Object.freeze({
    HOUR: 3600, // 60 * 60
    DAY: 86400, // 60 * 60 * 24
    WEEK: 604800, // 60 * 60 * 24 * 7
    MONTH: 2629746, // Average seconds in a month (60 * 60 * 24 * 30.436875)
    YEAR: 31557600, // Seconds in a year including leap years (60 * 60 * 24 * 365.25)
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
    topAll: { timeframe: "ALL", score: (...args) => topScore(...args) }
};

export const POST_REPLIES_SORT_TYPES: ReplySort = {
    ...remeda.pick(POSTS_SORT_TYPES, ["new"]),
    best: { score: (...args) => bestScore(...args) },
    old: { score: (...args) => oldScore(...args) },
    newFlat: { ...POSTS_SORT_TYPES["new"], flat: true },
    oldFlat: { score: (...args) => oldScore(...args), flat: true }
};

export const REPLY_REPLIES_SORT_TYPES: ReplySort = {
    ...remeda.pick(POSTS_SORT_TYPES, ["new"]),
    best: { score: (...args) => bestScore(...args) },
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

export function bestScore(comment: CommentToSort) {
    assert(typeof comment.commentUpdate.downvoteCount === "number" && typeof comment.commentUpdate.upvoteCount === "number");

    const originalUpvoteCount = comment.commentUpdate.upvoteCount; // can be 0
    const upvoteCount = comment.commentUpdate.upvoteCount + 1; // reddit initial upvotes is 1, plebbit is 0
    const downvoteCount = comment.commentUpdate.downvoteCount;

    // n is the total number of ratings
    const n = originalUpvoteCount + downvoteCount;
    if (n === 0) {
        return 0;
    }

    // zα/2 is the (1-α/2) quantile of the standard normal distribution
    const z = 1.281551565545;

    // p is the observed fraction of positive ratings
    const p = upvoteCount / n;

    const left = p + (1 / (2 * n)) * z * z;
    const right = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
    const under = 1 + (1 / n) * z * z;
    return (left - right) / under;
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

export function mapPageIpfsCommentToPageJsonComment(pageComment: PageIpfs["comments"][0]): CommentWithinPageJson {
    const parsedPages = pageComment.commentUpdate.replies ? parsePagesIpfs(pageComment.commentUpdate.replies) : undefined;
    const postCid = pageComment.comment.postCid ?? (pageComment.comment.depth === 0 ? pageComment.commentUpdate.cid : undefined);
    if (!postCid) throw Error("Failed to infer postCid from pageIpfs.comments.comment");

    const spoiler =
        typeof pageComment.commentUpdate.spoiler === "boolean"
            ? pageComment.commentUpdate.spoiler
            : typeof pageComment.commentUpdate.edit?.spoiler === "boolean"
              ? pageComment.commentUpdate.edit?.spoiler
              : pageComment.comment.spoiler;

    const nsfw =
        typeof pageComment.commentUpdate.nsfw === "boolean"
            ? pageComment.commentUpdate.nsfw
            : typeof pageComment.commentUpdate.edit?.nsfw === "boolean"
              ? pageComment.commentUpdate.edit?.nsfw
              : pageComment.comment.nsfw;

    return {
        ...pageComment.comment,
        ...pageComment.commentUpdate,
        signature: pageComment.comment.signature,
        author: {
            ...pageComment.comment.author,
            ...pageComment.commentUpdate.author,
            shortAddress: shortifyAddress(pageComment.comment.author.address),
            flair:
                pageComment.commentUpdate?.author?.subplebbit?.flair ||
                pageComment.commentUpdate?.edit?.author?.flair ||
                pageComment.comment.author.flair
        },
        shortCid: shortifyCid(pageComment.commentUpdate.cid),
        shortSubplebbitAddress: shortifyAddress(pageComment.comment.subplebbitAddress),
        original: OriginalCommentFieldsBeforeCommentUpdateSchema.parse(pageComment.comment),
        deleted: pageComment.commentUpdate.edit?.deleted,
        replies: parsedPages,
        content: pageComment.commentUpdate.edit?.content || pageComment.comment.content,
        reason: pageComment.commentUpdate.reason,
        spoiler,
        nsfw,
        flair: pageComment.comment.flair || pageComment.commentUpdate.edit?.flair,
        postCid,
        raw: {
            comment: pageComment.comment,
            commentUpdate: pageComment.commentUpdate
        }
    };
}

export function parsePageIpfs(pageIpfs: PageIpfs): PageTypeJson {
    const finalComments = pageIpfs.comments.map(mapPageIpfsCommentToPageJsonComment);

    return { comments: finalComments, ...remeda.pick(pageIpfs, ["nextCid"]) };
}

export function parsePagesIpfs(pagesRaw: PagesTypeIpfs): Omit<PagesTypeJson, "clients"> {
    const keys = remeda.keys.strict(pagesRaw.pages);
    const parsedPages = Object.values(pagesRaw.pages).map((pageIpfs) => parsePageIpfs(pageIpfs));
    const pagesType = remeda.fromEntries.strict(keys.map((key, i) => [key, parsedPages[i]]));
    return { pages: pagesType, pageCids: pagesRaw.pageCids || {} };
}

export function processAllCommentsRecursively(comments: PageIpfs["comments"], processor: (comment: PageIpfs["comments"][0]) => void): void {
    if (!comments || comments.length === 0) return;

    comments.forEach((comment) => processor(comment));

    for (const comment of comments)
        if (comment.commentUpdate.replies?.pages?.best?.comments)
            processAllCommentsRecursively(comment.commentUpdate.replies.pages.best.comments, processor);
}

// To use for both subplebbit.posts and comment.replies

export function parseRawPages(
    pages: PagesTypeIpfs | Omit<PagesTypeJson, "clients"> | BasePages | undefined,
    pageCreationTimestamp: number // to use to calculate sort pages client-side
): Pick<BasePages, "pages"> {
    if (!pages)
        return {
            pages: {}
        };

    const isIpfs = typeof Object.values(pages.pages)[0]?.comments[0]?.["commentUpdate"]?.["cid"] === "string";

    if (isIpfs) {
        const pagesIpfs = <PagesTypeIpfs>pages;
        // pages is a PagesTypeIpfs
        const parsedPages = parsePagesIpfs(pagesIpfs);
        return { pages: parsedPages.pages };
    } else if (pages instanceof BasePages)
        return { pages: pages.pages }; // already parsed
    else {
        pages = pages as PagesTypeJson;

        return {
            pages: pages.pages
        };
    }
}

// finding comments within pages

export function findCommentInPageInstance(
    pageInstance: RemoteSubplebbit["posts"] | Comment["replies"],
    targetCommentCid: string
): PageIpfs["comments"][0] | undefined {
    if (!pageInstance) throw Error("should define page ipfs");
    if (!targetCommentCid) throw Error("should define target comment cid");

    const commentInLoadedUniqueComment = pageInstance._loadedUniqueCommentFromGetPage[targetCommentCid];
    if (commentInLoadedUniqueComment) return commentInLoadedUniqueComment;

    for (const page of Object.values(pageInstance.pages))
        if (page) for (const pageComment of page.comments) if (pageComment.cid === targetCommentCid) return pageComment.raw;

    return undefined;
}

export function findCommentInParsedPages(pageJson: PageTypeJson, targetCommentCid: string): PageTypeJson["comments"][0] | undefined {
    if (!pageJson) throw Error("should define page json");
    if (!targetCommentCid) throw Error("should define target comment cid");

    return remeda.find(pageJson.comments, (comment) => comment.cid === targetCommentCid);
}

export function findCommentInHierarchicalPageIpfsRecursively(page: PageIpfs, targetCid: string): PageIpfs["comments"][0] | undefined {
    if (!page) throw Error("should define page ipfs");
    if (!targetCid) throw Error("should define target comment cid");

    for (const pageComment of page.comments) {
        if (pageComment.commentUpdate.cid === targetCid) return pageComment;
        if (pageComment.commentUpdate.replies?.pages) {
            for (const preloadedPage of Object.values(pageComment.commentUpdate.replies.pages)) {
                const result = findCommentInHierarchicalPageIpfsRecursively(preloadedPage, targetCid);
                if (result) return result;
            }
        }
    }
    return undefined;
}

export function findCommentInPageInstanceRecursively(
    pageInstance: RemoteSubplebbit["posts"] | Comment["replies"],
    targetCid: string
): PageIpfs["comments"][0] | undefined {
    if (!pageInstance) throw Error("should define page instance");
    if (!targetCid) throw Error("should define target comment cid");

    const commentInLoadedUniqueComment = pageInstance._loadedUniqueCommentFromGetPage[targetCid];
    if (commentInLoadedUniqueComment) return commentInLoadedUniqueComment;
    for (const preloadedPage of Object.values(pageInstance.pages)) {
        if (!preloadedPage) continue;

        const pageIpfs = <PageIpfs>{ comments: preloadedPage.comments.map((page) => page.raw), nextCid: preloadedPage.nextCid };
        const foundComment = findCommentInHierarchicalPageIpfsRecursively(pageIpfs, targetCid);
        if (foundComment) return foundComment;
    }

    return undefined;
}
