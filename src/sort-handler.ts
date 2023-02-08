import { controversialScore, hotScore, newScore, oldScore, TIMEFRAMES_TO_SECONDS, timestamp, topScore } from "./util";
import { Page, Pages } from "./pages";
import { Subplebbit } from "./subplebbit";
import assert from "assert";
import { Comment } from "./comment";
import {
    CommentIpfsType,
    CommentsTableRow,
    CommentUpdatesRow,
    CommentWithCommentUpdate,
    PageIpfs,
    PagesType,
    PagesTypeIpfs,
    PostSort,
    PostSortName,
    ReplySort,
    ReplySortName,
    SortProps
} from "./types";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { CACHE_KEYS } from "./constants";

export const POSTS_SORT_TYPES: PostSort = {
    hot: { score: (...args) => hotScore(...args) },
    new: { score: (...args) => newScore(...args) },
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
    ...lodash.pick(POSTS_SORT_TYPES, ["topAll", "new", "controversialAll"]),
    old: { score: (...args) => oldScore(...args) }
};

export type PageOptions = {
    excludeRemovedComments: boolean;
    excludeDeletedComments: boolean;
    excludeCommentsWithDifferentSubAddress: boolean;
    parentCid?: string;
    pageSize: number;
};

type PageGenerationRes = Record<Partial<PostSortName | ReplySortName>, { pages: PageIpfs[]; cids: string[] }>;

export class SortHandler {
    subplebbit: Pick<Subplebbit, "dbHandler" | "plebbit" | "address">;

    constructor(subplebbit: SortHandler["subplebbit"]) {
        this.subplebbit = subplebbit;
    }

    private async commentChunksToPages(
        chunks: { comment: CommentsTableRow; commentUpdate: CommentUpdatesRow }[][],
        sortName: PostSortName | ReplySortName
    ): Promise<PageGenerationRes> {
        assert(chunks.length > 0);

        const listOfPage: PageIpfs[] = new Array(chunks.length);
        const cids: string[] = new Array(chunks.length);
        const chunksWithReplies: PageIpfs["comments"][] = await Promise.all(
            chunks.map(async (chunk) => {
                return await Promise.all(
                    chunk.map(async (commentProps) => {
                        const comment = await this.subplebbit.plebbit.createComment(commentProps.comment);
                        const repliesPages = await this.generateRepliesPages(commentProps.comment, undefined);
                        comment.setReplies(repliesPages);
                        return comment.toJSONPagesIpfs(commentProps.commentUpdate);
                    })
                );
            })
        );
        for (let i = chunksWithReplies.length - 1; i >= 0; i--) {
            const pageIpfs: PageIpfs = { nextCid: cids[i + 1], comments: chunksWithReplies[i] };
            cids[i] = (await this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(pageIpfs))).path;
            listOfPage[i] = pageIpfs;
        }

        return Object.fromEntries([[sortName, { pages: listOfPage, cids }]]);
    }

    // Resolves to sortedComments
    async sortComments(
        comments: { comment: CommentsTableRow; commentUpdate: CommentUpdatesRow }[],
        sortName: PostSortName | ReplySortName,
        options: PageOptions
    ): Promise<PageGenerationRes | undefined> {
        const sortProps: SortProps = POSTS_SORT_TYPES[sortName] || REPLIES_SORT_TYPES[sortName];
        if (typeof sortProps.score !== "function") throw Error(`SortProps[${sortName}] is not defined`);

        const scoreSort = (
            obj1: { comment: CommentsTableRow; commentUpdate: CommentUpdatesRow },
            obj2: { comment: CommentsTableRow; commentUpdate: CommentUpdatesRow }
        ) => {
            const score1 = sortProps.score({
                timestamp: obj1.comment.timestamp,
                upvoteCount: obj1.commentUpdate.upvoteCount,
                downvoteCount: obj1.commentUpdate.downvoteCount
            });
            const score2 = sortProps.score({
                timestamp: obj2.comment.timestamp,
                upvoteCount: obj2.commentUpdate.upvoteCount,
                downvoteCount: obj2.commentUpdate.downvoteCount
            });
            return score2 - score1;
        };

        const pinnedComments = comments.filter((obj) => obj.commentUpdate.pinned === true).sort(scoreSort);

        let unpinnedComments = comments;
        if (sortProps.timeframe) {
            const timestampLower = timestamp() - TIMEFRAMES_TO_SECONDS[sortProps.timeframe];
            unpinnedComments = unpinnedComments.filter((obj) => obj.comment.timestamp >= timestampLower);
        }
        unpinnedComments = unpinnedComments.filter((obj) => !obj.commentUpdate.pinned).sort(scoreSort);

        const commentsSorted = pinnedComments.concat(unpinnedComments);

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

    private _generationResToPages(res: PageGenerationRes[]): PagesTypeIpfs | undefined {
        res = res.filter((res) => Boolean(res)); // Take out undefined values
        if (res.length === 0) return undefined;
        const mergedObject: PageGenerationRes = Object.assign({}, ...res);
        return {
            pages: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages.pages[0] }))),
            pageCids: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages.cids[0] })))
        };
    }

    private async _generateSubplebbitPosts(trx, pageOptions: PageOptions): Promise<PagesTypeIpfs | undefined> {
        // Sorting posts on a subplebbit level

        const rawPosts = await this.subplebbit.dbHandler.queryCommentsForPages(pageOptions, trx);

        const sortResults = await Promise.all(
            Object.keys(POSTS_SORT_TYPES).map((sortName: PostSortName) => this.sortComments(rawPosts, sortName, pageOptions))
        );

        return this._generationResToPages(sortResults);
    }

    private async _generateCommentReplies(comment: Pick<CommentWithCommentUpdate, "cid">, trx?): Promise<PagesTypeIpfs | undefined> {
        const pageOptions: PageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: false,
            excludeRemovedComments: false,
            parentCid: comment.cid,
            pageSize: 50
        };

        const comments = await this.subplebbit.dbHandler.queryCommentsForPages(pageOptions, trx);

        const sortResults = await Promise.all(
            Object.keys(REPLIES_SORT_TYPES).map((sortName: ReplySortName) => this.sortComments(comments, sortName, pageOptions))
        );

        return this._generationResToPages(sortResults);
    }

    async cacheCommentsPages(trx?) {
        const commentLevels = await this.subplebbit.dbHandler.queryCommentsGroupByDepth(trx);
        for (let i = commentLevels.length - 1; i >= 0; i--)
            await Promise.all(commentLevels[i].map((comment) => this.generateRepliesPages(comment, trx)));

        await this.generateSubplebbitPosts(trx);
    }

    async generateRepliesPages(comment: Pick<CommentWithCommentUpdate, "cid">, trx?): Promise<PagesTypeIpfs | undefined> {
        const cacheKey = CACHE_KEYS[CACHE_KEYS.PREFIX_COMMENT_REPLIES_].concat(comment.cid);
        const cachedReplies: PagesTypeIpfs | undefined = await this.subplebbit.dbHandler!.keyvGet(cacheKey);
        if (cachedReplies) return cachedReplies;

        const pages = await this._generateCommentReplies(comment, trx);
        // TODO assert here

        if (pages) await this.subplebbit.dbHandler!.keyvSet(cacheKey, pages);

        return pages;
    }

    async generateSubplebbitPosts(trx?): Promise<PagesTypeIpfs | undefined> {
        const pageOptions: PageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: true,
            excludeRemovedComments: true,
            parentCid: undefined,
            pageSize: 50
        };
        const subplebbitPostCount = await this.subplebbit.dbHandler!.queryCountOfPosts(pageOptions, trx);
        if (subplebbitPostCount === 0) return undefined;

        const cacheKey = CACHE_KEYS[CACHE_KEYS.POSTS_SUBPLEBBIT];

        const cachedPosts: PagesTypeIpfs | undefined = await this.subplebbit.dbHandler?.keyvGet(cacheKey);
        if (cachedPosts) return cachedPosts;

        const pages = await this._generateSubplebbitPosts(trx, pageOptions);
        if (!pages && subplebbitPostCount > 0)
            throw Error(`Pages are empty even though subplebbit(${this.subplebbit.address}) has ${subplebbitPostCount} posts`);
        if (!pages) return undefined;

        await this.subplebbit.dbHandler?.keyvSet(cacheKey, pages);

        return pages;
    }

    async deleteCommentPageCache(dbComment: Pick<CommentWithCommentUpdate, "cid" | "parentCid" | "depth">) {
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
