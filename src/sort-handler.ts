import { controversialScore, hotScore, TIMEFRAMES_TO_SECONDS, timestamp } from "./util";
import { Page, Pages } from "./pages";
import { Subplebbit } from "./subplebbit";
import assert from "assert";
import { Comment } from "./comment";
import { CommentType, PostSort, PostSortName, ReplySort, ReplySortName, SortProps, Timeframe } from "./types";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { CACHE_KEYS } from "./constants";

export const POSTS_SORT_TYPES: PostSort = {
    hot: { score: (...args) => hotScore(...args) },
    new: {},
    topHour: { timeframe: "HOUR" },
    topDay: { timeframe: "DAY" },
    topWeek: { timeframe: "WEEK" },
    topMonth: { timeframe: "MONTH" },
    topYear: { timeframe: "YEAR" },
    topAll: { timeframe: "ALL" },
    controversialHour: { score: (...args) => controversialScore(...args), timeframe: "HOUR" },
    controversialDay: { timeframe: "DAY", score: (...args) => controversialScore(...args) },
    controversialWeek: { timeframe: "WEEK", score: (...args) => controversialScore(...args) },
    controversialMonth: { timeframe: "MONTH", score: (...args) => controversialScore(...args) },
    controversialYear: { timeframe: "YEAR", score: (...args) => controversialScore(...args) },
    controversialAll: { timeframe: "ALL", score: (...args) => controversialScore(...args) }
};

export const REPLIES_SORT_TYPES: ReplySort = {
    topAll: { timeframe: "ALL" },
    new: {},
    controversialAll: { timeframe: "ALL", score: (...args) => controversialScore(...args) },
    old: {}
};

export const SORTED_POSTS_PAGE_SIZE = 50;

export class SortHandler {
    subplebbit: Pick<Subplebbit, "dbHandler" | "plebbit" | "address">;

    constructor(subplebbit: SortHandler["subplebbit"]) {
        this.subplebbit = subplebbit;
    }

    async chunksToListOfPage(chunks: CommentType[][]): Promise<[Page[], string[]]> {
        assert(chunks.length > 0);

        const listOfPage: Page[] = new Array(chunks.length);
        const cids = new Array(chunks.length);
        const chunksWithReplies: Comment[][] = await Promise.all(
            chunks.map(async (chunk) => {
                return await Promise.all(
                    chunk.map(async (commentProps: CommentType) => {
                        const comment = await this.subplebbit.plebbit.createComment(commentProps);
                        const repliesPages = await this.generatePagesUnderComment(comment, undefined);
                        comment.setReplies(repliesPages);
                        return comment;
                    })
                );
            })
        );
        assert(this.subplebbit.plebbit.ipfsClient);
        for (let i = chunksWithReplies.length - 1; i >= 0; i--) {
            const pageComments = chunksWithReplies[i].map((c) => c.toJSONPages());
            const page = new Page({
                nextCid: cids[i + 1],
                comments: pageComments
            });
            cids[i] = (await this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(page))).path;
            listOfPage[i] = page;
        }
        return [listOfPage, cids];
    }

    // Resolves to sortedComments
    async sortComments(
        comments: CommentType[],
        sortName: PostSortName | ReplySortName,
        limit = SORTED_POSTS_PAGE_SIZE
    ): Promise<[Partial<Record<PostSortName | ReplySortName, Page>>, string]> {
        let commentsSorted: CommentType[];
        const sortProps: SortProps = POSTS_SORT_TYPES[sortName] || REPLIES_SORT_TYPES[sortName];
        if (sortProps.hasOwnProperty("score") && typeof sortProps.score !== "function")
            throw Error(`SortProps[${sortName}] is not defined`);

        if (!sortProps.score) commentsSorted = comments;
        // If sort type has no score function, that means it already has been sorted by DB
        else
            commentsSorted = comments
                .map((comment: CommentType) => ({
                    comment: comment,
                    score: sortProps.score(comment)
                }))
                .sort((postA, postB) => postB.score - postA.score)
                .map((comment) => comment.comment);

        const commentsChunks = lodash.chunk(commentsSorted, limit);

        const [listOfPage, cids] = await this.chunksToListOfPage(commentsChunks);

        const expectedNumOfPages = Math.ceil(comments.length / limit);
        assert.equal(
            listOfPage.length,
            expectedNumOfPages,
            `Should generate ${expectedNumOfPages} pages for sort ${sortName} while it generated ${listOfPage.length}`
        );

        return [{ [sortName]: listOfPage[0] }, cids[0]];
    }

    async sortCommentsByHot(parentCid?: string, trx?) {
        const comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(parentCid, trx);
        if (comments.length === 0) return [undefined, undefined];
        return this.sortComments(comments, "hot");
    }

    async sortCommentsByTop(parentCid: string | undefined, sortName: PostSortName | ReplySortName, trx?) {
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

    async sortCommentsByControversial(parentCid: string | undefined, sortName: PostSortName | ReplySortName, trx?) {
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

    async sortCommentsByNew(parentCid?: string, trx?) {
        const comments = await this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(parentCid, "desc", trx);
        if (comments.length === 0) return [undefined, undefined];
        return this.sortComments(comments, "new");
    }

    getSortPromises(comment?: Comment | CommentType, trx?) {
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
                let comments: CommentType[];
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
                else comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(comment.cid, trx);
                if (comments.length === 0) return [undefined, undefined];
                assert(comments.every((comment) => typeof comment.upvoteCount === "number" && typeof comment.downvoteCount === "number"));
                return this.sortComments(comments, sortName);
            });
        }
    }

    async cacheCommentsPages(trx?) {
        const commentLevels: CommentType[][] = await this.subplebbit.dbHandler.queryCommentsGroupByDepth(trx);
        for (let i = commentLevels.length - 1; i >= 0; i--)
            await Promise.all(commentLevels[i].map((comment) => this.generatePagesUnderComment(comment, trx)));

        await this.generatePagesUnderComment(undefined, trx);
    }

    async generatePagesUnderComment(comment?: Comment | CommentType, trx?): Promise<Pages | undefined> {
        if (comment?.replyCount === 0) return undefined;
        const key = comment?.cid || CACHE_KEYS[CACHE_KEYS.POSTS_SUBPLEBBIT]; // If comment is undefined then we're generating page for subplebbit
        const cachedPageJson = await this.subplebbit.dbHandler?.keyvGet(key);
        if (!cachedPageJson || JSON.stringify(cachedPageJson) === "{}") {
            await this.subplebbit.dbHandler?.keyvDelete(key);
        } else {
            const cachedPage = new Pages({ ...cachedPageJson, subplebbit: this.subplebbit });
            return cachedPage;
        }
        const subplebbitPostCount =
            key === CACHE_KEYS[CACHE_KEYS.POSTS_SUBPLEBBIT] && (await this.subplebbit.dbHandler?.queryCountOfPosts(trx));

        if (subplebbitPostCount === 0)
            // If subplebbit and has no posts, then return undefined
            return undefined;

        const res = await Promise.all(this.getSortPromises(comment, trx));

        let [pagesRaw, pageCids] = [{}, {}];
        for (const [page, pageCid] of res) {
            pagesRaw = { ...pagesRaw, ...page };
            if (page) pageCids[Object.keys(page)[0]] = pageCid;
        }

        const pages = new Pages({
            pages: pagesRaw,
            pageCids: pageCids,
            subplebbit: { address: this.subplebbit.address, plebbit: this.subplebbit.plebbit }
        });

        await this.subplebbit.dbHandler?.keyvSet(key, pages.toJSON());

        return pages;
    }

    async deleteCommentPageCache(dbComment: CommentType) {
        const log = Logger("plebbit-js:sort-handler:deleteCommentPageCache");

        assert(this.subplebbit.dbHandler && dbComment.cid);
        const cachesToDelete: string[] = [
            dbComment.cid,
            ...(await this.subplebbit.dbHandler.queryParentsOfComment(dbComment, undefined)).map((comment) => <string>comment.cid),
            CACHE_KEYS[CACHE_KEYS.POSTS_SUBPLEBBIT]
        ];
        log.trace(`Caches to delete: ${cachesToDelete}`);
        await this.subplebbit.dbHandler?.keyvDelete(cachesToDelete);
    }
}
