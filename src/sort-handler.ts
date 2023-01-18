import { controversialScore, hotScore, newScore, oldScore, TIMEFRAMES_TO_SECONDS, timestamp, topScore } from "./util";
import { Page, Pages } from "./pages";
import { Subplebbit } from "./subplebbit";
import assert from "assert";
import { Comment } from "./comment";
import { CommentType, PageType, PostSort, PostSortName, ReplySort, ReplySortName, SortProps, Timeframe } from "./types";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { CACHE_KEYS } from "./constants";

export const POSTS_SORT_TYPES: PostSort = {
    hot: { score: (...args) => hotScore(...args), dbSorted: false },
    new: { score: (...args) => newScore(...args), dbSorted: true },
    topHour: { timeframe: "HOUR", score: (...args) => topScore(...args), dbSorted: true },
    topDay: { timeframe: "DAY", score: (...args) => topScore(...args), dbSorted: true },
    topWeek: { timeframe: "WEEK", score: (...args) => topScore(...args), dbSorted: true },
    topMonth: { timeframe: "MONTH", score: (...args) => topScore(...args), dbSorted: true },
    topYear: { timeframe: "YEAR", score: (...args) => topScore(...args), dbSorted: true },
    topAll: { timeframe: "ALL", score: (...args) => topScore(...args), dbSorted: true },
    controversialHour: { timeframe: "HOUR", score: (...args) => controversialScore(...args), dbSorted: false },
    controversialDay: { timeframe: "DAY", score: (...args) => controversialScore(...args), dbSorted: false },
    controversialWeek: { timeframe: "WEEK", score: (...args) => controversialScore(...args), dbSorted: false },
    controversialMonth: { timeframe: "MONTH", score: (...args) => controversialScore(...args), dbSorted: false },
    controversialYear: { timeframe: "YEAR", score: (...args) => controversialScore(...args), dbSorted: false },
    controversialAll: { timeframe: "ALL", score: (...args) => controversialScore(...args), dbSorted: false }
};

export const REPLIES_SORT_TYPES: ReplySort = {
    ...lodash.pick(POSTS_SORT_TYPES, ["topAll", "new", "controversialAll"]),
    old: {
        score: (...args) => oldScore(...args),
        dbSorted: true
    }
};

export type PageOptions = {
    excludeRemovedComments: boolean;
    excludeDeletedComments: boolean;
    excludeCommentsWithDifferentSubAddress: boolean;
    excludeCommentsWithNoUpdate: boolean;
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
    async sortComments(
        comments: CommentType[],
        sortName: PostSortName | ReplySortName,
        options: PageOptions
    ): Promise<PageGenerationRes | undefined> {
        let commentsSorted: CommentType[];
        const sortProps: SortProps = POSTS_SORT_TYPES[sortName] || REPLIES_SORT_TYPES[sortName];
        if (typeof sortProps.score !== "function") throw Error(`SortProps[${sortName}] is not defined`);

        if (sortProps.dbSorted) commentsSorted = comments; // already sorted
        else
            commentsSorted = comments
                .map((comment: CommentType) => ({
                    comment: comment,
                    score: sortProps.score(comment)
                }))
                .sort((postA, postB) => postB.score - postA.score)
                .map((comment) => comment.comment);

        if (options.ensurePinnedCommentsAreOnTop) {
            const pinnedComments = (await this.subplebbit.dbHandler.queryPinnedComments(comments[0]?.parentCid)).sort(
                (commentA, commentB) => sortProps.score(commentB) - sortProps.score(commentA)
            );

            commentsSorted = pinnedComments.concat(commentsSorted.filter((comment) => !comment.pinned));
        }

        if (commentsSorted.length === 0) return undefined;

        const commentsChunks = lodash.chunk(commentsSorted, options.pageSize);

        const res = await this.commentChunksToPages(commentsChunks, sortName);

        const listOfPage = Object.values(res)[0].pages;

        const expectedNumOfPages = Math.ceil(commentsSorted.length / options.pageSize);
        assert.equal(
            listOfPage.length,
            expectedNumOfPages,
            `Should generate ${expectedNumOfPages} pages for sort ${sortName} while it generated ${listOfPage.length}`
        );

        return res;
    }

    async sortCommentsByHot(parentCid: string | undefined, options: PageOptions, trx?): Promise<PageGenerationRes | undefined> {
        const comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(parentCid, options, trx);
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
        return this.sortComments(comments, sortName, options);
    }

    async sortCommentsByNew(parentCid: string | undefined, options: PageOptions, trx?): Promise<PageGenerationRes | undefined> {
        const comments = await this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(parentCid, "desc", options, trx);
        return this.sortComments(comments, "new", options);
    }

    private _generationResToPages(res: PageGenerationRes[]): Pages | undefined {
        res = res.filter((res) => Boolean(res)); // Take out undefined values
        if (res.length === 0) return undefined;
        const mergedObject: PageGenerationRes = Object.assign({}, ...res);
        const pages = new Pages({
            pages: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages.pages[0] }))),
            pageCids: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages.cids[0] }))),
            subplebbit: lodash.pick(this.subplebbit, ["address", "plebbit"])
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
            excludeCommentsWithNoUpdate: true,
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
            sorts.map(
                (sort, i) => sort.length > 0 && this.sortComments(sort, Object.keys(REPLIES_SORT_TYPES)[i] as ReplySortName, pageOptions)
            )
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
        const cacheKey = CACHE_KEYS[CACHE_KEYS.PREFIX_COMMENT_REPLIES_].concat(comment.cid);
        const cachedReplies: PageType | undefined = await this.subplebbit.dbHandler!.keyvGet(cacheKey);
        if (cachedReplies) return new Pages({ ...cachedReplies, subplebbit: lodash.pick(this.subplebbit, ["address", "plebbit"]) });

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
            excludeCommentsWithNoUpdate: true,
            pageSize: 50
        };
        const subplebbitPostCount = await this.subplebbit.dbHandler!.queryCountOfPosts(pageOptions, trx);
        if (subplebbitPostCount === 0) return undefined;

        const cacheKey = CACHE_KEYS[CACHE_KEYS.POSTS_SUBPLEBBIT];

        const cachedPosts: Pages | undefined = await this.subplebbit.dbHandler?.keyvGet(cacheKey);
        if (cachedPosts) return new Pages({ ...cachedPosts, subplebbit: lodash.pick(this.subplebbit, ["address", "plebbit"]) });

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
