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
        typeof comment.update.downvoteCount === "number" &&
            typeof comment.update.upvoteCount === "number" &&
            typeof comment.comment.timestamp === "number"
    );

    let score = comment.update.upvoteCount - comment.update.downvoteCount;
    score++; // reddit initial upvotes is 1, plebbit is 0
    const order = Math.log10(Math.max(Math.abs(score), 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = comment.comment.timestamp - 1134028003;
    return remeda.round(sign * order + seconds / 45000, 7);
}

export function controversialScore(comment: CommentToSort) {
    assert(typeof comment.update.downvoteCount === "number" && typeof comment.update.upvoteCount === "number");

    const upvoteCount = comment.update.upvoteCount + 1; // reddit initial upvotes is 1, plebbit is 0
    if (comment.update.downvoteCount <= 0 || upvoteCount <= 0) return 0;
    const magnitude = upvoteCount + comment.update.downvoteCount;
    const balance =
        upvoteCount > comment.update.downvoteCount
            ? comment.update.downvoteCount / upvoteCount
            : upvoteCount / comment.update.downvoteCount;
    return Math.pow(magnitude, balance);
}

export function topScore(comment: CommentToSort) {
    assert(typeof comment.update.downvoteCount === "number" && typeof comment.update.upvoteCount === "number");

    return comment.update.upvoteCount - comment.update.downvoteCount;
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
        const parsedPages = commentObj.update.replies ? parsePagesIpfs(commentObj.update.replies) : undefined;
        const finalJson: CommentWithinPageJson = {
            ...commentObj.comment,
            ...commentObj.update,
            signature: commentObj.comment.signature,
            author: {
                ...commentObj.comment.author,
                ...commentObj.update.author,
                shortAddress: shortifyAddress(commentObj.comment.author.address),
                flair:
                    commentObj.update?.author?.subplebbit?.flair ||
                    commentObj.update?.edit?.author?.flair ||
                    commentObj.comment.author.flair
            },
            shortCid: shortifyCid(commentObj.comment.cid),
            shortSubplebbitAddress: shortifyAddress(commentObj.comment.subplebbitAddress),
            original: OriginalCommentFieldsBeforeCommentUpdateSchema.parse(commentObj.comment),
            deleted: commentObj.update.edit?.deleted,
            replies: parsedPages,
            content: commentObj.update.edit?.content || commentObj.comment.content,
            reason: commentObj.update.reason || commentObj.update.edit?.reason,
            spoiler:
                ("spoiler" in commentObj.update && commentObj.update.spoiler) ||
                (commentObj.update.edit && "spoiler" in commentObj.update.edit && commentObj.update.edit.spoiler) ||
                commentObj.comment.spoiler,
            flair: commentObj.comment.flair || commentObj.update.edit?.flair
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

    const isIpfs = typeof Object.values(pages.pages)[0]?.comments[0]?.["update"]?.["cid"] === "string";

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
