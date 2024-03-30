import { POSTS_SORT_TYPES, REPLIES_SORT_TYPES, TIMEFRAMES_TO_SECONDS, timestamp } from "../../../util.js";
import { LocalSubplebbit } from "./local-subplebbit.js";
import assert from "assert";
import {
    CommentsTableRow,
    CommentUpdatesRow,
    CommentWithCommentUpdate,
    PageIpfs,
    PagesTypeIpfs,
    PostSortName,
    ReplySortName,
    SortProps
} from "../../../types.js";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { cleanUpBeforePublishing } from "../../../signer/signatures.js";

export type PageOptions = {
    excludeRemovedComments: boolean;
    excludeDeletedComments: boolean;
    excludeCommentsWithDifferentSubAddress: boolean;
    parentCid: string | null;
    pageSize: number;
};

type PageGenerationRes = Partial<Record<PostSortName | ReplySortName, { pages: PageIpfs[]; cids: string[] }>>;

export class SortHandler {
    subplebbit: LocalSubplebbit;

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
                        return comment.toJSONPagesIpfs(commentProps.update);
                    })
                );
            })
        );
        for (let i = chunksWithReplies.length - 1; i >= 0; i--) {
            const pageIpfs: PageIpfs = cleanUpBeforePublishing({ nextCid: cids[i + 1], comments: chunksWithReplies[i] });
            cids[i] = (await this.subplebbit.clientsManager.getDefaultIpfs()._client.add(JSON.stringify(pageIpfs))).path;
            listOfPage[i] = pageIpfs;
        }
        return { [sortName]: { pages: listOfPage, cids } };
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

        let activeScores: Record<string, number>;

        if (sortName === "active") {
            activeScores = {};
            for (const comment of comments)
                activeScores[comment.comment.cid] = await this.subplebbit.dbHandler.queryActiveScore(comment.comment);
        }

        const scoreSort = (
            obj1: { comment: CommentsTableRow; update: CommentUpdatesRow },
            obj2: { comment: CommentsTableRow; update: CommentUpdatesRow }
        ) => {
            if (activeScores) {
                // Make exception for active sorting because it has a different mechanism for sorting
                return activeScores[obj2.comment.cid] - activeScores[obj1.comment.cid];
            }
            const score1 = sortProps.score(obj1);
            const score2 = sortProps.score(obj2);
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

    toJSON() {
        return undefined;
    }
}
