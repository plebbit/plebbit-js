import {
    chunks,
    controversialScore,
    getDebugLevels,
    hotScore,
    removeKeysWithUndefinedValues,
    TIMEFRAMES_TO_SECONDS,
    timestamp
} from "./util";
import { Page, Pages } from "./pages";
import { Subplebbit } from "./subplebbit";
import assert from "assert";
import { Knex } from "knex";
import { Comment } from "./comment";
import Transaction = Knex.Transaction;
import { PostSort, PostSortName, ReplySort, ReplySortName, SortProps, Timeframe } from "./types";

const debugs = getDebugLevels("sort-handler");

export const POSTS_SORT_TYPES: PostSort = {
    hot: { score: hotScore },
    new: {},
    topHour: { timeframe: "HOUR" },
    topDay: { timeframe: "DAY" },
    topWeek: { timeframe: "WEEK" },
    topMonth: { timeframe: "MONTH" },
    topYear: { timeframe: "YEAR" },
    topAll: { timeframe: "ALL" },
    controversialHour: { score: controversialScore, timeframe: "HOUR" },
    controversialDay: { timeframe: "DAY", score: controversialScore },
    controversialWeek: { timeframe: "WEEK", score: controversialScore },
    controversialMonth: { timeframe: "MONTH", score: controversialScore },
    controversialYear: { timeframe: "YEAR", score: controversialScore },
    controversialAll: { timeframe: "ALL", score: controversialScore }
};

export const REPLIES_SORT_TYPES: ReplySort = {
    topAll: { timeframe: "ALL" },
    new: {},
    controversialAll: { timeframe: "ALL", score: controversialScore },
    old: {}
};

export const SORTED_POSTS_PAGE_SIZE = 50;

export class SortHandler {
    subplebbit: Subplebbit;

    constructor(subplebbit: Subplebbit) {
        this.subplebbit = subplebbit;
    }

    async chunksToListOfPage(chunks: Comment[][]): Promise<[Page[], string[]]> {
        assert(chunks.length > 0);

        const listOfPage = new Array(chunks.length);
        const cids = new Array(chunks.length);
        const chunksWithReplies = await Promise.all(
            chunks.map(async (chunk) => {
                return await Promise.all(
                    chunk.map(async (comment: Comment) => {
                        const pages = await this.generatePagesUnderComment(comment, undefined);
                        comment.setReplies(pages);

                        return comment;
                    })
                );
            })
        );
        assert(this.subplebbit.plebbit.ipfsClient);
        for (let i = chunksWithReplies.length - 1; i >= 0; i--) {
            const page = new Page({
                nextCid: cids[i + 1],
                comments: chunksWithReplies[i]
            });
            cids[i] = (await this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(page))).path;
            listOfPage[i] = page;
        }
        return [listOfPage, cids];
    }

    // Resolves to sortedComments
    async sortComments(
        comments: Comment[],
        sortName: PostSortName | ReplySortName,
        limit = SORTED_POSTS_PAGE_SIZE
    ): Promise<[Partial<Record<PostSortName | ReplySortName, Page>>, string]> {
        assert(comments.length > 0);
        let commentsSorted: Comment[];
        const sortProps: SortProps = POSTS_SORT_TYPES[sortName] || REPLIES_SORT_TYPES[sortName];
        assert(sortProps);

        if (!sortProps.score) commentsSorted = comments;
        // If sort type has no score function, that means it already has been sorted by DB
        else
            commentsSorted = comments
                .map((comment: Comment) => ({
                    comment: comment,
                    score: sortProps.score(comment)
                }))
                .sort((postA, postB) => postB.score - postA.score)
                .map((comment) => comment.comment);

        const commentsChunks = chunks(commentsSorted, limit);

        const [listOfPage, cids] = await this.chunksToListOfPage(commentsChunks);

        const expectedNumOfPages = Math.ceil(comments.length / parseFloat(String(limit)));
        assert.equal(
            listOfPage.length,
            expectedNumOfPages,
            `Should generate ${expectedNumOfPages} pages for sort ${sortName} while it generated ${listOfPage.length}`
        );

        return [{ [sortName]: listOfPage[0] }, cids[0]];
    }

    async sortCommentsByHot(parentCid?: string, trx?: Transaction) {
        const comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(parentCid, trx);
        if (comments.length === 0) return [undefined, undefined];
        return this.sortComments(comments, "hot");
    }

    async sortCommentsByTop(parentCid: string | undefined, sortName: PostSortName | ReplySortName, trx?: Transaction) {
        const sortProps: SortProps = POSTS_SORT_TYPES[sortName] || REPLIES_SORT_TYPES[sortName];
        assert(sortProps.timeframe, "Need timeframe to sort top");
        const comments = await this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(
            parentCid,
            timestamp() - TIMEFRAMES_TO_SECONDS[sortProps.timeframe],
            Number.MAX_SAFE_INTEGER,
            trx
        );
        if (comments.length === 0) return [undefined, undefined];
        return this.sortComments(comments, sortName);
    }

    async sortCommentsByControversial(parentCid: string | undefined, sortName: PostSortName | ReplySortName, trx?: Transaction) {
        const sortProps: SortProps = POSTS_SORT_TYPES[sortName] || REPLIES_SORT_TYPES[sortName];
        assert(sortProps.timeframe, "Need timeframe to sort controversial");
        const comments = await this.subplebbit.dbHandler.queryCommentsBetweenTimestampRange(
            parentCid,
            timestamp() - TIMEFRAMES_TO_SECONDS[sortProps.timeframe],
            Number.MAX_SAFE_INTEGER,
            trx
        );
        if (comments.length === 0) return [undefined, undefined];
        return this.sortComments(comments, sortName);
    }

    async sortCommentsByNew(parentCid?: string, trx?: Transaction) {
        const comments = await this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(parentCid, "desc", trx);
        if (comments.length === 0) return [undefined, undefined];
        return this.sortComments(comments, "new");
    }

    getSortPromises(comment?: Comment, trx?: Transaction) {
        if (!comment) {
            // Sorting posts on a subplebbit level
            const sortPromises = [this.sortCommentsByHot(undefined, trx), this.sortCommentsByNew(undefined, trx)];

            (Object.keys(POSTS_SORT_TYPES) as Array<keyof typeof POSTS_SORT_TYPES>)
                .filter((postSort) => postSort !== "hot" && postSort !== "new")
                .forEach((postSortName) => {
                    if (postSortName.includes("controversial"))
                        sortPromises.push(this.sortCommentsByControversial.bind(this)(undefined, postSortName, trx));
                    else if (postSortName.includes("top"))
                        sortPromises.push(this.sortCommentsByTop.bind(this)(undefined, postSortName, trx));
                });

            return sortPromises;
        } else {
            return (Object.keys(REPLIES_SORT_TYPES) as Array<keyof typeof REPLIES_SORT_TYPES>).map(async (sortName: ReplySortName) => {
                let comments: Comment[];
                assert(this.subplebbit?.dbHandler);

                if (sortName === "topAll")
                    comments = await this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(
                        comment.cid,
                        0,
                        Number.MAX_SAFE_INTEGER,
                        trx
                    );
                else if (sortName === "old")
                    comments = await this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(comment.cid, "asc", trx);
                else comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(comment?.cid, trx);
                if (comments.length === 0) return [undefined, undefined];
                return this.sortComments(comments, sortName);
            });
        }
    }

    async cacheCommentsPages(trx?: Transaction) {
        const commentLevels: Comment[][] = await this.subplebbit.dbHandler.queryCommentsGroupByDepth(trx);
        for (let i = commentLevels.length - 1; i >= 0; i--)
            await Promise.all(commentLevels[i].map((comment) => this.generatePagesUnderComment(comment, trx)));

        await this.generatePagesUnderComment(undefined, trx);
    }

    async generatePagesUnderComment(comment?: Comment, trx?: Transaction): Promise<Pages | undefined> {
        if (comment?.replyCount === 0) return undefined;
        if (comment && (comment.replyCount === undefined || comment.replyCount === null))
            throw new Error(`Comment has not defined replyCount (${comment.replyCount}): ${JSON.stringify(comment)}`);
        const key = comment?.cid || "subplebbit"; // If comment is undefined then we're generating page for subplebbit
        if (await this.subplebbit._keyv.has(key)) {
            const cachedPageJson = await this.subplebbit._keyv.get(key);
            if (!cachedPageJson || JSON.stringify(cachedPageJson) === "{}") {
                await this.subplebbit._keyv.delete(key);
            } else {
                const cachedPage = new Pages({ ...cachedPageJson, subplebbit: this.subplebbit });
                assert(JSON.stringify(cachedPage.toJSON()) !== "{}", "Cache returns empty pages");
                return cachedPage;
            }
        }

        const subplebbitPostCount = key === "subplebbit" && (await this.subplebbit.dbHandler?.queryCountOfPosts(trx));

        if (subplebbitPostCount === 0)
            // If subplebbit and has no posts, then return undefined
            return undefined;

        const res = await Promise.all(this.getSortPromises(comment, trx));

        let [pagesRaw, pageCids] = [{}, {}];
        for (const [page, pageCid] of res) {
            pagesRaw = { ...pagesRaw, ...page };
            if (page) pageCids[Object.keys(page)[0]] = pageCid;
        }
        [pagesRaw, pageCids] = [removeKeysWithUndefinedValues(pagesRaw), removeKeysWithUndefinedValues(pageCids)];
        if (!pagesRaw || !pageCids || JSON.stringify(pagesRaw) === "{}" || JSON.stringify(pageCids) === "{}")
            throw new Error(`Failed to generate pages for ${key}: pagesRaw: ${pagesRaw}, pageCids: ${pageCids}`);

        const pages = new Pages({ pages: pagesRaw, pageCids: pageCids, subplebbit: this.subplebbit });

        if (key === "subplebbit") {
            // If there is at least one comment in subplebbit, then assert the following
            [pages?.pages?.controversialAll, pages?.pages?.hot, pages?.pages?.new, pages?.pages?.topAll].forEach((sortPage) => {
                assert.ok(sortPage?.comments?.length >= Math.min(subplebbitPostCount, SORTED_POSTS_PAGE_SIZE));
            });
        } else {
            [pages?.pages?.controversialAll, pages?.pages?.new, pages?.pages?.topAll, pages?.pages?.old].forEach((sortPage) => {
                assert.ok(
                    sortPage?.comments?.length >= Math.min(SORTED_POSTS_PAGE_SIZE, comment.replyCount),
                    "Replies page is missing comments"
                );
            });
        }

        await this.subplebbit._keyv.set(key, pages.toJSON());

        return pages;
    }

    async deleteCommentPageCache(dbComment: Comment) {
        assert(this.subplebbit.dbHandler);
        const cachesToDelete = [
            dbComment.cid,
            ...(await this.subplebbit.dbHandler.queryParentsOfComment(dbComment, undefined)).map((comment) => comment.cid),
            "subplebbit"
        ];
        debugs.DEBUG(`Caches to delete: ${cachesToDelete}`);
        await Promise.all(cachesToDelete.map(async (cacheKey) => this.subplebbit._keyv.delete(cacheKey)));
    }
}
