import {
    controversialScore,
    hotScore,
    newScore,
    oldScore,
    removeNullAndUndefinedValuesRecursively,
    TIMEFRAMES_TO_SECONDS,
    timestamp,
    topScore
} from "./util";
import { Subplebbit } from "./subplebbit";
import assert from "assert";
import {
    CommentsTableRow,
    CommentUpdatesRow,
    CommentWithCommentUpdate,
    PageIpfs,
    PagesTypeIpfs,
    PostSort,
    PostSortName,
    ReplySort,
    ReplySortName,
    SortProps
} from "./types";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";

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
    parentCid: string | null;
    pageSize: number;
};

type PageGenerationRes = Record<Partial<PostSortName | ReplySortName>, { pages: PageIpfs[]; cids: string[] }>;

export class SortHandler {
    subplebbit: Pick<Subplebbit, "dbHandler" | "plebbit" | "address" | "encryption">;

    constructor(subplebbit: SortHandler["subplebbit"]) {
        this.subplebbit = subplebbit;
    }

    private async commentChunksToPages(
        chunks: { comment: CommentsTableRow; update: CommentUpdatesRow }[][],
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
                        if (commentProps.update.replyCount > 0) assert(commentProps.update.replies);
                        return comment.toJSONPagesIpfs(commentProps.update);
                    })
                );
            })
        );
        for (let i = chunksWithReplies.length - 1; i >= 0; i--) {
            const pageIpfs: PageIpfs = removeNullAndUndefinedValuesRecursively({ nextCid: cids[i + 1], comments: chunksWithReplies[i] });
            cids[i] = (await this.subplebbit.plebbit._defaultIpfsClient()._client.add(JSON.stringify(pageIpfs))).path;
            listOfPage[i] = pageIpfs;
        }

        return Object.fromEntries([[sortName, { pages: listOfPage, cids }]]);
    }

    // Resolves to sortedComments
    async sortComments(
        comments: { comment: CommentsTableRow; update: CommentUpdatesRow }[],
        sortName: PostSortName | ReplySortName,
        options: PageOptions
    ): Promise<PageGenerationRes | undefined> {
        if (comments.length === 0) return undefined;
        const sortProps: SortProps = POSTS_SORT_TYPES[sortName] || REPLIES_SORT_TYPES[sortName];
        if (typeof sortProps.score !== "function") throw Error(`SortProps[${sortName}] is not defined`);

        const scoreSort = (
            obj1: { comment: CommentsTableRow; update: CommentUpdatesRow },
            obj2: { comment: CommentsTableRow; update: CommentUpdatesRow }
        ) => {
            const score1 = sortProps.score({
                timestamp: obj1.comment.timestamp,
                upvoteCount: obj1.update.upvoteCount,
                downvoteCount: obj1.update.downvoteCount
            });
            const score2 = sortProps.score({
                timestamp: obj2.comment.timestamp,
                upvoteCount: obj2.update.upvoteCount,
                downvoteCount: obj2.update.downvoteCount
            });
            return score2 - score1;
        };

        const pinnedComments = comments.filter((obj) => obj.update.pinned === true).sort(scoreSort);

        let unpinnedComments = comments.filter((obj) => !obj.update.pinned).sort(scoreSort);
        if (sortProps.timeframe) {
            const timestampLower: number = timestamp() - TIMEFRAMES_TO_SECONDS[sortProps.timeframe];
            unpinnedComments = unpinnedComments.filter((obj) => obj.comment.timestamp >= timestampLower);
        }

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

    private async _generateSubplebbitPosts(pageOptions: PageOptions): Promise<PagesTypeIpfs | undefined> {
        // Sorting posts on a subplebbit level
        const log = Logger("plebbit-js:sort-handler:generateSubplebbitPosts");

        const rawPosts = await this.subplebbit.dbHandler.queryCommentsForPages(pageOptions);

        if (rawPosts.length === 0) return undefined;

        const sortResults = await Promise.all(
            Object.keys(POSTS_SORT_TYPES).map((sortName: PostSortName) => this.sortComments(rawPosts, sortName, pageOptions))
        );

        return this._generationResToPages(sortResults);
    }

    private async _generateCommentReplies(comment: Pick<CommentWithCommentUpdate, "cid">): Promise<PagesTypeIpfs | undefined> {
        const pageOptions: PageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: false,
            excludeRemovedComments: false,
            parentCid: comment.cid,
            pageSize: 50
        };

        const comments = await this.subplebbit.dbHandler.queryCommentsForPages(pageOptions);

        const sortResults = await Promise.all(
            Object.keys(REPLIES_SORT_TYPES).map((sortName: ReplySortName) => this.sortComments(comments, sortName, pageOptions))
        );

        return this._generationResToPages(sortResults);
    }

    async generateRepliesPages(comment: Pick<CommentWithCommentUpdate, "cid">): Promise<PagesTypeIpfs | undefined> {
        const log = Logger("plebbit-js:sort-handler:generateRepliesPages");

        const pages = await this._generateCommentReplies(comment);
        // TODO assert here

        return pages;
    }

    async generateSubplebbitPosts(): Promise<PagesTypeIpfs | undefined> {
        const pageOptions: PageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: true,
            excludeRemovedComments: true,
            parentCid: null,
            pageSize: 50
        };

        return this._generateSubplebbitPosts(pageOptions);
    }
}
