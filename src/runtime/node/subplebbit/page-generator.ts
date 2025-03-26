import { hideClassPrivateProps, timestamp } from "../../../util.js";
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
import * as remeda from "remeda";
import type { CommentUpdateType } from "../../../publications/comment/types.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";

import { POSTS_SORT_TYPES, REPLIES_SORT_TYPES, TIMEFRAMES_TO_SECONDS } from "../../../pages/util.js";
import type { CommentsTableRow } from "../../../types.js";

export type PageOptions = {
    excludeRemovedComments: boolean;
    excludeDeletedComments: boolean;
    excludeCommentsWithDifferentSubAddress: boolean;
    commentUpdateFieldsToExclude?: (keyof CommentUpdateType)[];
    parentCid: string | null;
    preloadedPage: (PostSortName | ReplySortName) | undefined; // a list of sort types that will be preloaded on the subplebbit/comment instance
    baseTimestamp: number;
    preloadedPageSizeBytes: number;
};

type SinglePreloadedPageRes = Record<PostSortName | ReplySortName, PageIpfs>;

type PageGenerationRes =
    | Partial<Record<PostSortName | ReplySortName, { pages: PageIpfs[]; cids: string[] }>> // when there are multiple pages
    | SinglePreloadedPageRes; // when there is only one preloaded page

export class PageGenerator {
    private _subplebbit: LocalSubplebbit;

    constructor(subplebbit: PageGenerator["_subplebbit"]) {
        this._subplebbit = subplebbit;
        hideClassPrivateProps(this);
    }

    private async commentChunksToPages(chunks: PageIpfs["comments"][], sortName: PostSortName | ReplySortName): Promise<PageGenerationRes> {
        assert(chunks.length > 0);

        const listOfPage: PageIpfs[] = new Array(chunks.length);
        const cids: string[] = new Array(chunks.length);
        for (let i = chunks.length - 1; i >= 0; i--) {
            const pageIpfs: PageIpfs = { nextCid: cids[i + 1], comments: chunks[i] };
            if (!pageIpfs.nextCid) delete pageIpfs.nextCid; // we don't to include undefined anywhere in the protocol
            cids[i] = (await this._subplebbit._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(pageIpfs))).path; // JSON.stringify will remove undefined values for us
            listOfPage[i] = pageIpfs;
        }
        return { [sortName]: { pages: listOfPage, cids } };
    }

    _chunkComments({
        comments,
        isPreloadedSort,
        preloadedPageSizeBytes
    }: {
        comments: PageIpfs["comments"];
        isPreloadedSort: boolean;
        preloadedPageSizeBytes: number;
    }): PageIpfs["comments"][] {
        const FIRST_PAGE_SIZE = isPreloadedSort ? preloadedPageSizeBytes : 1024 * 1024; // dynamic page size for preloaded sorts, 1MB for others

        // Calculate overhead with and without nextCid
        const OBJECT_WRAPPER_WITH_CID =
            Buffer.byteLength(
                JSON.stringify(<PageIpfs>{
                    comments: [],
                    nextCid: "QmXsYKgNH7XoZXdLko5uDvtWSRNE2AXuQ4u8KxVpCacrZx" // random cid as a place holder
                }),
                "utf8"
            ) - 2; // Subtract 2 for empty array "[]"

        const OBJECT_WRAPPER_WITHOUT_CID =
            Buffer.byteLength(
                JSON.stringify(<PageIpfs>{
                    comments: []
                }),
                "utf8"
            ) - 2; // Subtract 2 for empty array "[]"

        // Quick check for small arrays - if everything fits in one page, no nextCid needed
        const totalSizeWithoutCid = Buffer.byteLength(JSON.stringify(<PageIpfs>{ comments }), "utf8");
        if (totalSizeWithoutCid <= FIRST_PAGE_SIZE) {
            return [comments]; // Single page, no chunking needed
        }

        const chunks: PageIpfs["comments"][] = [];

        let currentChunk: PageIpfs["comments"] = [];
        let chunkIndex = 0;
        let accumulatedSize = OBJECT_WRAPPER_WITH_CID; // Start with the overhead size (including nextCid)

        // Pre-calculate sizes to avoid repeated stringification
        const commentSizes = new Map<number, number>();

        function getCommentSize(index: number): number {
            if (!commentSizes.has(index)) {
                const size = Buffer.byteLength(JSON.stringify(comments[index]), "utf8");
                commentSizes.set(index, size);
            }
            return commentSizes.get(index)!;
        }

        function getCurrentMaxSize(index: number): number {
            if (index === 0) {
                return FIRST_PAGE_SIZE; // First page is dynamic for preloaded
            } else {
                const MB = 1024 * 1024;
                // For preloaded: dynamic page size, 1MB, 2MB, 4MB, etc.
                // For non-preloaded: 1MB, 2MB, 4MB, 8MB, etc.
                return MB * Math.pow(2, index - 1); // index-1 because we want to start with 1MB
            }
        }

        for (let i = 0; i < comments.length; i++) {
            const commentSize = getCommentSize(i);
            const maxSize = getCurrentMaxSize(chunkIndex);
            const isLastItem = i === comments.length - 1;

            // Add comma if needed
            const commaSize = currentChunk.length > 0 ? 1 : 0;

            // Check if adding this comment would exceed the limit
            if (accumulatedSize + commaSize + commentSize > maxSize) {
                if (currentChunk.length > 0) {
                    // Push current chunk and start a new one
                    chunks.push(currentChunk);
                    currentChunk = [];

                    // Reset size calculation for the next chunk
                    // If this will be the last chunk (we're processing the last item and it will be alone),
                    // then use size without nextCid
                    if (isLastItem) {
                        accumulatedSize = OBJECT_WRAPPER_WITHOUT_CID;
                    } else {
                        accumulatedSize = OBJECT_WRAPPER_WITH_CID;
                    }

                    chunkIndex++;
                }
            }

            currentChunk.push(comments[i]);
            accumulatedSize += commaSize + commentSize;
        }

        if (currentChunk.length > 0) {
            // Before pushing the last chunk, adjust its expected size if it's the last page
            // by removing the nextCid overhead
            if (chunks.length > 0) {
                // If we have multiple chunks
                chunks.push(currentChunk);
            } else {
                // If we only have one chunk, it shouldn't have nextCid
                // But this case should be caught by our initial check
                chunks.push(currentChunk);
            }
        }

        return chunks;
    }

    async sortAndChunkComments(
        unsortedComments: PageIpfs["comments"],
        sortName: PostSortName | ReplySortName,
        options: PageOptions
    ): Promise<PageIpfs["comments"][]> {
        if (unsortedComments.length === 0) throw Error("Should not provide empty array of comments to sort");
        const sortProps: SortProps = options.parentCid
            ? REPLIES_SORT_TYPES[<ReplySortName>sortName]
            : POSTS_SORT_TYPES[<PostSortName>sortName];
        if (typeof sortProps.score !== "function") throw Error(`SortProps[${sortName}] score function is not defined`);

        let activeScores: Record<string, number>;

        if (sortName === "active") {
            activeScores = {};
            for (const comment of unsortedComments)
                activeScores[comment.commentUpdate.cid] = await this._subplebbit._dbHandler.queryActiveScore({
                    cid: comment.commentUpdate.cid,
                    timestamp: comment.comment.timestamp
                });
        }

        const scoreSort = (obj1: PageIpfs["comments"][0], obj2: PageIpfs["comments"][0]) => {
            if (activeScores) {
                // Make exception for active sorting because it has a different mechanism for sorting
                return activeScores[obj2.commentUpdate.cid] - activeScores[obj1.commentUpdate.cid];
            }
            const score1 = sortProps.score(obj1);
            const score2 = sortProps.score(obj2);
            return score2 - score1;
        };

        const pinnedComments = unsortedComments.filter((obj) => obj.commentUpdate.pinned === true).sort(scoreSort);

        let unpinnedComments = unsortedComments.filter((obj) => !obj.commentUpdate.pinned).sort(scoreSort);
        if (sortProps.timeframe) {
            const timestampLower: number = options.baseTimestamp - TIMEFRAMES_TO_SECONDS[sortProps.timeframe];
            unpinnedComments = unpinnedComments.filter((obj) => obj.comment.timestamp >= timestampLower);
        }

        const commentsSorted = pinnedComments.concat(unpinnedComments);

        if (commentsSorted.length === 0) return [];

        const isPreloadedSort = options.preloadedPage === sortName;

        const commentsChunks = this._chunkComments({
            comments: commentsSorted,
            isPreloadedSort,
            preloadedPageSizeBytes: options.preloadedPageSizeBytes
        });

        return commentsChunks;
    }

    // Resolves to sortedComments
    async sortChunkAddIpfs(
        comments: PageIpfs["comments"],
        sortName: PostSortName | ReplySortName,
        options: PageOptions
    ): Promise<PageGenerationRes | undefined> {
        const commentsChunks = await this.sortAndChunkComments(comments, sortName, options);
        if (commentsChunks.length === 0) return undefined;
        const res = await this.commentChunksToPages(commentsChunks, sortName);

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

    async generateSubplebbitPosts(
        preloadedPageSortName: PostSortName,
        preloadedPageSizeBytes: number
    ): Promise<PostsPagesTypeIpfs | { singlePreloadedPage: SinglePreloadedPageRes } | undefined> {
        const pageOptions: PageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: true,
            excludeRemovedComments: true,
            parentCid: null,
            preloadedPage: preloadedPageSortName,
            baseTimestamp: timestamp(),
            preloadedPageSizeBytes
        };
        // Sorting posts on a subplebbit level
        const rawPosts = await this._subplebbit._dbHandler.queryPageComments(pageOptions);
        if (rawPosts.length === 0) return undefined;

        const preloadedChunk = await this.sortAndChunkComments(rawPosts, preloadedPageSortName, pageOptions);
        if (preloadedChunk.length === 1) return { singlePreloadedPage: { [preloadedPageSortName]: { comments: preloadedChunk[0] } } }; // all comments fit in one page

        const sortResults: (PageGenerationRes | undefined)[] = [];

        for (const sortName of remeda.keys.strict(POSTS_SORT_TYPES))
            sortResults.push(await this.sortChunkAddIpfs(rawPosts, sortName, pageOptions));

        return <PostsPagesTypeIpfs>this._generationResToPages(sortResults);
    }

    async generateRepliesPages(
        comment: Pick<CommentsTableRow, "cid" | "depth">,
        preloadedReplyPageSortName: ReplySortName,
        preloadedPageSizeBytes: number
    ): Promise<RepliesPagesTypeIpfs | { singlePreloadedPage: SinglePreloadedPageRes } | undefined> {
        const pageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: false,
            excludeRemovedComments: false,
            parentCid: comment.cid,
            preloadedPage: preloadedReplyPageSortName,
            baseTimestamp: timestamp(),
            preloadedPageSizeBytes
        };

        const sortResults: (PageGenerationRes | undefined)[] = [];

        const hierarchalReplies = await this._subplebbit._dbHandler.queryPageComments(pageOptions);
        if (hierarchalReplies.length === 0) return undefined;

        const preloadedChunk = await this.sortAndChunkComments(hierarchalReplies, preloadedReplyPageSortName, pageOptions);
        if (preloadedChunk.length === 1) return { singlePreloadedPage: { [preloadedReplyPageSortName]: { comments: preloadedChunk[0] } } }; // all comments fit in one page

        const hierarchalSorts = remeda.keys.strict(REPLIES_SORT_TYPES).filter((replySortName) => !REPLIES_SORT_TYPES[replySortName].flat);
        if (hierarchalSorts.length > 0) {
            for (const hierarchalSortName of hierarchalSorts)
                sortResults.push(await this.sortChunkAddIpfs(hierarchalReplies, hierarchalSortName, pageOptions));
        }

        const flatSorts = remeda.keys.strict(REPLIES_SORT_TYPES).filter((replySortName) => REPLIES_SORT_TYPES[replySortName].flat);

        if (flatSorts.length > 0 && comment.depth === 0) {
            const flattenedReplies = await this._subplebbit._dbHandler.queryFlattenedPageReplies({
                ...pageOptions,
                commentUpdateFieldsToExclude: ["replies"]
            });

            for (const flatSortName of flatSorts)
                sortResults.push(await this.sortChunkAddIpfs(flattenedReplies, flatSortName, pageOptions));
        }

        return <RepliesPagesTypeIpfs>this._generationResToPages(sortResults);
    }

    toJSON() {
        return undefined;
    }
}
