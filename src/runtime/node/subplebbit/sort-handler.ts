import { timestamp } from "../../../util.js";
import { LocalSubplebbit } from "./local-subplebbit.js";
import assert from "assert";
import type {
    PageIpfs,
    PagesTypeIpfs,
    PostSortName,
    PostsPagesTypeIpfs,
    RepliesPagesTypeIpfs,
    ReplySortName,
    SortProps
} from "../../../pages/types.js";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import type { CommentIpfsWithCidDefined } from "../../../publications/comment/types.js";
import { POSTS_SORT_TYPES, REPLIES_SORT_TYPES, TIMEFRAMES_TO_SECONDS } from "../../../pages/util.js";

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

    private async commentChunksToPages(chunks: PageIpfs["comments"][], sortName: PostSortName | ReplySortName): Promise<PageGenerationRes> {
        assert(chunks.length > 0);

        const listOfPage: PageIpfs[] = new Array(chunks.length);
        const cids: string[] = new Array(chunks.length);
        for (let i = chunks.length - 1; i >= 0; i--) {
            const pageIpfs: PageIpfs = { nextCid: cids[i + 1], comments: chunks[i] };
            cids[i] = (await this.subplebbit._clientsManager.getDefaultIpfs()._client.add(JSON.stringify(pageIpfs))).path; // JSON.stringify will remove undefined values for us
            listOfPage[i] = pageIpfs;
        }
        return { [sortName]: { pages: listOfPage, cids } };
    }

    // Resolves to sortedComments
    async sortComments(
        comments: PageIpfs["comments"],
        sortName: PostSortName | ReplySortName,
        options: PageOptions
    ): Promise<PageGenerationRes | undefined> {
        if (comments.length === 0) throw Error("Should not provide empty array of comments to sort");
        const sortProps: SortProps = options.parentCid
            ? REPLIES_SORT_TYPES[<ReplySortName>sortName]
            : POSTS_SORT_TYPES[<PostSortName>sortName];
        if (typeof sortProps.score !== "function") throw Error(`SortProps[${sortName}] is not defined`);

        let activeScores: Record<string, number>;

        if (sortName === "active") {
            activeScores = {};
            for (const comment of comments)
                activeScores[comment.comment.cid] = await this.subplebbit._dbHandler.queryActiveScore(comment.comment);
        }

        const scoreSort = (obj1: PageIpfs["comments"][0], obj2: PageIpfs["comments"][0]) => {
            if (activeScores) {
                // Make exception for active sorting because it has a different mechanism for sorting
                return activeScores[obj2.comment.cid] - activeScores[obj1.comment.cid];
            }
            const score1 = sortProps.score(obj1);
            const score2 = sortProps.score(obj2);
            return score2 - score1;
        };

        const pinnedComments = comments.filter((obj) => obj.commentUpdate.pinned === true).sort(scoreSort);

        let unpinnedComments = comments.filter((obj) => !obj.commentUpdate.pinned).sort(scoreSort);
        if (sortProps.timeframe) {
            const timestampLower: number = timestamp() - TIMEFRAMES_TO_SECONDS[sortProps.timeframe];
            unpinnedComments = unpinnedComments.filter((obj) => obj.comment.timestamp >= timestampLower);
        }

        const commentsSorted = pinnedComments.concat(unpinnedComments);

        if (commentsSorted.length === 0) return undefined;

        const commentsChunks = remeda.chunk(commentsSorted, options.pageSize);

        const res = await this.commentChunksToPages(commentsChunks, sortName);

        const listOfPage = Object.values(res)[0]!.pages;

        const expectedNumOfPages = Math.ceil(commentsSorted.length / options.pageSize);
        assert.equal(
            listOfPage.length,
            expectedNumOfPages,
            `Should generate ${expectedNumOfPages} pages for sort ${sortName} while it generated ${listOfPage.length}`
        );

        return res;
    }

    private _generationResToPages(res: (PageGenerationRes | undefined)[]): PagesTypeIpfs | undefined {
        const filteredGeneratedPages = res.filter(Boolean); // Take out undefined values
        if (filteredGeneratedPages.length === 0) return undefined;
        const mergedObject: PageGenerationRes = Object.assign({}, ...filteredGeneratedPages);
        return {
            pages: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages!.pages[0] }))),
            pageCids: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages!.cids[0] })))
        };
    }

    async generateSubplebbitPosts(): Promise<PostsPagesTypeIpfs | undefined> {
        const pageOptions: PageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: true,
            excludeRemovedComments: true,
            parentCid: null,
            pageSize: 50
        };
        // Sorting posts on a subplebbit level
        const rawPosts = await this.subplebbit._dbHandler.queryCommentsForPages(pageOptions);

        if (rawPosts.length === 0) return undefined;

        const sortResults: (PageGenerationRes | undefined)[] = [];

        for (const sortName of remeda.keys.strict(POSTS_SORT_TYPES))
            sortResults.push(await this.sortComments(rawPosts, sortName, pageOptions));

        return <PostsPagesTypeIpfs>this._generationResToPages(sortResults);
    }

    async generateRepliesPages(comment: Pick<CommentIpfsWithCidDefined, "cid">): Promise<RepliesPagesTypeIpfs | undefined> {
        const pageOptions: PageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: false,
            excludeRemovedComments: false,
            parentCid: comment.cid,
            pageSize: 50
        };

        const rawReplies = await this.subplebbit._dbHandler.queryCommentsForPages(pageOptions);
        if (rawReplies.length === 0) return undefined;

        const sortResults: (PageGenerationRes | undefined)[] = [];

        for (const sortName of remeda.keys.strict(REPLIES_SORT_TYPES))
            sortResults.push(await this.sortComments(rawReplies, sortName, pageOptions));

        return <RepliesPagesTypeIpfs>this._generationResToPages(sortResults);
    }

    toJSON() {
        return undefined;
    }
}
