import { controversialScore, hotScore, TIMEFRAMES_TO_SECONDS, timestamp } from "./util";
import { Page, Pages } from "./pages";
import { Subplebbit } from "./subplebbit";
import assert from "assert";
import { Comment } from "./comment";
import { CommentType, PageType, PostSort, PostSortName, ReplySort, ReplySortName, SortProps, Timeframe } from "./types";
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

export type PageOptions = {
    excludeRemovedComments: boolean;
    excludeDeletedComments: boolean;
    excludeCommentsWithDifferentSubAddress: boolean;
    ensurePinnedCommentsAreOnTop: boolean;
    pageSize: number;
};

type PageGenerationRes = Record<Partial<PostSortName | ReplySortName>, { pages: Page[]; cids: string[] }>;

export class SortHandler {
    subplebbit: Pick<Subplebbit, "dbHandler" | "plebbit" | "address">;

    constructor(subplebbit: SortHandler["subplebbit"]) {
        this.subplebbit = subplebbit;
    }

    private async commentChunksToPages(chunks: CommentType[][], sortName: PostSortName | ReplySortName): Promise<PageGenerationRes> {
        assert(chunks.length > 0);

        const listOfPage: Page[] = new Array(chunks.length);
        const cids: string[] = new Array(chunks.length);
        const chunksWithReplies: Comment[][] = await Promise.all(
            chunks.map(async (chunk) => {
                return await Promise.all(
                    chunk.map(async (commentProps: CommentType) => {
                        const comment = await this.subplebbit.plebbit.createComment(commentProps);
                        const repliesPages = await this.generateRepliesPages(comment, undefined);
                        comment.setReplies(repliesPages);
                        return comment;
                    })
                );
            })
        );
        for (let i = chunksWithReplies.length - 1; i >= 0; i--) {
            const pageComments = chunksWithReplies[i].map((c) => c.toJSONPages());
            const page = new Page({
                nextCid: cids[i + 1],
                comments: pageComments
            });
            cids[i] = (await this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(page))).path;
            listOfPage[i] = page;
        }

        return <PageGenerationRes>{ [sortName]: { pages: listOfPage, cids } };
    }

    // Resolves to sortedComments
    async sortComments(comments: CommentType[], sortName: PostSortName | ReplySortName, options: PageOptions): Promise<PageGenerationRes> {
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

        if (options.ensurePinnedCommentsAreOnTop)
            commentsSorted.sort((commentA, commentB) => Number(commentB.pinned) - Number(commentA.pinned));

        const commentsChunks = lodash.chunk(commentsSorted, options.pageSize);

        const res = await this.commentChunksToPages(commentsChunks, sortName);

        const listOfPage = Object.values(res)[0].pages;

        const expectedNumOfPages = Math.ceil(comments.length / options.pageSize);
        assert.equal(
            listOfPage.length,
            expectedNumOfPages,
            `Should generate ${expectedNumOfPages} pages for sort ${sortName} while it generated ${listOfPage.length}`
        );

        return res;
    }

    async sortCommentsByHot(parentCid: string | undefined, options: PageOptions, trx?): Promise<PageGenerationRes | undefined> {
        const comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(parentCid, options, trx);
        if (comments.length === 0) return undefined;
        return this.sortComments(comments, "hot", options);
    }

    async sortCommentsByTop(
        parentCid: string | undefined,
        sortName: PostSortName | ReplySortName,
        options: PageOptions,
        trx?
    ): Promise<PageGenerationRes | undefined> {
        const sortProps: SortProps = POSTS_SORT_TYPES[sortName] || REPLIES_SORT_TYPES[sortName];
        assert(sortProps.timeframe, "Need timeframe to sort top");
        const comments = await this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(
            parentCid,
            timestamp() - TIMEFRAMES_TO_SECONDS[sortProps.timeframe],
            Number.MAX_SAFE_INTEGER,
            options,
            trx
        );
        if (comments.length === 0) return undefined;
        return this.sortComments(comments, sortName, options);
    }

    async sortCommentsByControversial(
        parentCid: string | undefined,
        sortName: PostSortName | ReplySortName,
        options: PageOptions,
        trx?
    ): Promise<PageGenerationRes | undefined> {
        const sortProps: SortProps = POSTS_SORT_TYPES[sortName] || REPLIES_SORT_TYPES[sortName];
        assert(sortProps.timeframe, "Need timeframe to sort controversial");
        const comments = await this.subplebbit.dbHandler.queryCommentsBetweenTimestampRange(
            parentCid,
            timestamp() - TIMEFRAMES_TO_SECONDS[sortProps.timeframe],
            Number.MAX_SAFE_INTEGER,
            options,
            trx
        );
        if (comments.length === 0) return undefined;
        return this.sortComments(comments, sortName, options);
    }

    async sortCommentsByNew(parentCid: string | undefined, options: PageOptions, trx?): Promise<PageGenerationRes | undefined> {
        const comments = await this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(parentCid, "desc", options, trx);
        if (comments.length === 0) return undefined;
        return this.sortComments(comments, "new", options);
    }

    private _generationResToPages(res: PageGenerationRes[]): Pages | undefined {
        res = res.filter((res) => Boolean(res));
        if (res.length === 0) return undefined;
        const mergedObject: PageGenerationRes = Object.assign({}, ...res);
        const pages = new Pages({
            pages: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages.pages[0] }))),
            pageCids: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages.cids[0] }))),
            subplebbit: { address: this.subplebbit.address, plebbit: this.subplebbit.plebbit }
        });
        return pages;
    }

    private async _generateSubplebbitPosts(trx, pageOptions: PageOptions): Promise<Pages | undefined> {
        // Sorting posts on a subplebbit level

        const sortPromises: Promise<PageGenerationRes>[] = [
            this.sortCommentsByHot(undefined, pageOptions, trx),
            this.sortCommentsByNew(undefined, pageOptions, trx)
        ];

        sortPromises.push(
            ...Object.keys(POSTS_SORT_TYPES)
                .filter((key) => key.startsWith("controversial"))
                .map((sortName) => this.sortCommentsByControversial.bind(this)(undefined, sortName, pageOptions, trx))
        );

        sortPromises.push(
            ...Object.keys(POSTS_SORT_TYPES)
                .filter((key) => key.startsWith("top"))
                .map((sortName) => this.sortCommentsByTop.bind(this)(undefined, sortName, pageOptions, trx))
        );

        const sorts = await Promise.all(sortPromises);

        return this._generationResToPages(sorts);
    }

    private async _generateCommentReplies(comment: Comment | CommentType, trx?): Promise<Pages | undefined> {
        const pageOptions: PageOptions = {
            ensurePinnedCommentsAreOnTop: true,
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: false,
            excludeRemovedComments: false,
            pageSize: 50
        };
        // Promises have to be in the same order as REPLIES_SORT_TYPES => [topAll, new, controversialAll, old]

        const sorts = await Promise.all([
            this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(comment.cid, 0, Number.MAX_SAFE_INTEGER, pageOptions, trx),
            this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(comment.cid, "desc", pageOptions, trx),
            this.subplebbit.dbHandler.queryCommentsUnderComment(comment.cid, pageOptions, trx), // Controversial will be sorted in-code
            this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(comment.cid, "asc", pageOptions, trx)
        ]);
        const res = await Promise.all(
            sorts.map((sort, i) => this.sortComments(sort, Object.keys(REPLIES_SORT_TYPES)[i] as ReplySortName, pageOptions))
        );

        return this._generationResToPages(res);
    }

    async cacheCommentsPages(trx?) {
        const commentLevels: CommentType[][] = await this.subplebbit.dbHandler.queryCommentsGroupByDepth(trx);
        for (let i = commentLevels.length - 1; i >= 0; i--)
            await Promise.all(commentLevels[i].map((comment) => this.generateRepliesPages(comment, trx)));

        await this.generateSubplebbitPosts(trx);
    }

    async generateRepliesPages(comment: Comment | CommentType, trx?): Promise<Pages | undefined> {
        const log = Logger("plebbit-js:sort-handler:generateRepliesPages");
        if (comment.replyCount === 0) return undefined;
        const cacheKey = CACHE_KEYS[CACHE_KEYS.PREFIX_COMMENT_REPLIES_].concat(comment.cid);
        const cachedReplies: PageType | undefined = await this.subplebbit.dbHandler!.keyvGet(cacheKey);
        if (cachedReplies) return new Pages({ ...cachedReplies, subplebbit: this.subplebbit });

        const pages = await this._generateCommentReplies(comment, trx);
        // TODO assert here

        if (pages) await this.subplebbit.dbHandler!.keyvSet(cacheKey, pages.toJSON());

        return pages;
    }

    async generateSubplebbitPosts(trx?) {
        const pageOptions: PageOptions = {
            ensurePinnedCommentsAreOnTop: true,
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: true,
            excludeRemovedComments: true,
            pageSize: 50
        };
        const subplebbitPostCount = await this.subplebbit.dbHandler!.queryCountOfPosts(pageOptions, trx);
        if (subplebbitPostCount === 0) return undefined;

        const cacheKey = CACHE_KEYS[CACHE_KEYS.POSTS_SUBPLEBBIT];

        const cachedPosts: Pages | undefined = await this.subplebbit.dbHandler?.keyvGet(cacheKey);
        if (cachedPosts) return new Pages({ ...cachedPosts, subplebbit: this.subplebbit });

        const pages = await this._generateSubplebbitPosts(trx, pageOptions);
        if (!pages && subplebbitPostCount > 0)
            throw Error(`Pages are empty even though subplebbit(${this.subplebbit.address}) has ${subplebbitPostCount} posts`);
        if (!pages) return undefined;

        await this.subplebbit.dbHandler?.keyvSet(cacheKey, pages.toJSON());
    }

    async deleteCommentPageCache(dbComment: CommentType) {
        const log = Logger("plebbit-js:sort-handler:deleteCommentPageCache");

        const cacheKey = (cid: string) => CACHE_KEYS[CACHE_KEYS.PREFIX_COMMENT_REPLIES_].concat(cid);

        assert(this.subplebbit.dbHandler && dbComment.cid);
        const cachesToDelete: string[] = [
            cacheKey(dbComment.cid),
            ...(await this.subplebbit.dbHandler.queryParentsOfComment(dbComment, undefined)).map((comment) => cacheKey(comment.cid)),
            CACHE_KEYS[CACHE_KEYS.POSTS_SUBPLEBBIT]
        ];
        log.trace(`Caches to delete: ${cachesToDelete}`);
        await this.subplebbit.dbHandler?.keyvDelete(cachesToDelete);
    }
}
