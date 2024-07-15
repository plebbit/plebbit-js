import type {
    PageIpfs,
    PagesInstanceType,
    PagesTypeIpfs,
    PagesTypeJson,
    PageInstanceType,
    PostSort,
    ReplySort,
    Timeframe,
    RepliesPagesTypeIpfs,
    PostsPagesTypeIpfs
} from "./types.js";

import assert from "assert";
import { BasePages } from "./pages.js";

import * as remeda from "remeda";
import { Plebbit } from "../plebbit.js";

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

export async function parsePageIpfs(pageIpfs: PageIpfs, plebbit: Plebbit): Promise<PageInstanceType> {
    const finalComments = await Promise.all(pageIpfs.comments.map((commentObj) => plebbit.createComment(commentObj.comment)));
    await Promise.all(finalComments.map((comment, i) => comment._initCommentUpdate(pageIpfs.comments[i].update)));

    return { comments: finalComments, nextCid: pageIpfs.nextCid };
}

export async function parsePagesIpfs(pagesRaw: PagesTypeIpfs, plebbit: Plebbit): Promise<PagesInstanceType> {
    const keys = remeda.keys.strict(pagesRaw.pages);
    const parsedPages = await Promise.all(Object.values(pagesRaw.pages).map((pageIpfs) => parsePageIpfs(pageIpfs, plebbit)));
    const pagesType = Object.fromEntries(keys.map((key, i) => [key, parsedPages[i]]));
    return { pages: pagesType, pageCids: pagesRaw.pageCids };
}

// To use for both subplebbit.posts and comment.replies

export async function parseRawPages(
    replies: PagesTypeIpfs | PagesTypeJson | BasePages | undefined,
    plebbit: Plebbit
): Promise<Pick<BasePages, "pages"> & { pagesIpfs: RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined }> {
    if (!replies)
        return {
            pages: {},
            pagesIpfs: undefined
        };

    const isIpfs = typeof Object.values(replies.pages)[0]?.comments[0]?.["update"]?.["cid"] === "string";

    if (isIpfs) {
        // replies is a PagesTypeIpfs
        const parsedPages = await parsePagesIpfs(<PagesTypeIpfs>replies, plebbit);
        return {
            pages: parsedPages.pages,
            pagesIpfs: <PagesTypeIpfs>replies
        };
    } else if (replies instanceof BasePages)
        return { pages: replies.pages, pagesIpfs: replies.toJSONIpfs() }; // already parsed
    else {
        replies = replies as PagesTypeJson;
        const pagesWithCommentInstancesEntries = await Promise.all(
            remeda.entries.strict(replies.pages).map(async ([pageKey, pageJson]) => {
                const comments = await Promise.all(
                    pageJson.comments.map((commentJson) => plebbit.createComment.bind(plebbit)(commentJson))
                );
                return remeda.entries.strict({ [pageKey]: { comments, nextCid: pageJson.nextCid } })[0];
            })
        );

        const pagesWithCommentInstances = remeda.fromEntries.strict(pagesWithCommentInstancesEntries);

        return {
            pages: pagesWithCommentInstances,
            pagesIpfs: undefined
        };
    }
}
