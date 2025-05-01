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

import { POSTS_SORT_TYPES, POST_REPLIES_SORT_TYPES, TIMEFRAMES_TO_SECONDS, REPLY_REPLIES_SORT_TYPES } from "../../../pages/util.js";
import type { CommentsTableRow } from "../../../types.js";
import { PlebbitError } from "../../../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";

export type PageOptions = {
    excludeRemovedComments: boolean;
    excludeDeletedComments: boolean;
    excludeCommentsWithDifferentSubAddress: boolean;
    commentUpdateFieldsToExclude?: (keyof CommentUpdateType)[];
    parentCid: string | null;
    preloadedPage: PostSortName | ReplySortName; // a list of sort types that will be preloaded on the subplebbit/comment instance
    baseTimestamp: number;
    firstPageSizeBytes: number;
};

type SinglePreloadedPageRes = Record<PostSortName | ReplySortName, PageIpfs>;

type PageCidUndefinedIfPreloadedPage = [undefined, ...string[]] | string[];

type AddedPreloadedPageChunksToIpfs = Partial<Record<PostSortName | ReplySortName, { pages: PageIpfs[] }>>;

type AddedPageChunksToIpfsRes = Partial<Record<PostSortName | ReplySortName, { pages: PageIpfs[]; cids: PageCidUndefinedIfPreloadedPage }>>;

type PageGenerationRes =
    | AddedPreloadedPageChunksToIpfs
    | AddedPageChunksToIpfsRes // when there are multiple pages
    | SinglePreloadedPageRes; // when there is only one preloaded page

export class PageGenerator {
    private _subplebbit: LocalSubplebbit;

    constructor(subplebbit: PageGenerator["_subplebbit"]) {
        this._subplebbit = subplebbit;
        hideClassPrivateProps(this);
    }

    private async addCommentChunksToIpfs(
        chunks: PageIpfs["comments"][],
        sortName: PostSortName | ReplySortName
    ): Promise<AddedPageChunksToIpfsRes> {
        assert(chunks.length > 0);

        const listOfPage: PageIpfs[] = new Array(chunks.length);
        const cids: string[] = new Array(chunks.length);
        let expectedSize = 1024 * 1024 * Math.pow(2, chunks.length - 1); // expected size of last page
        for (let i = chunks.length - 1; i >= 0; i--) {
            const pageIpfs: PageIpfs = { nextCid: cids[i + 1], comments: chunks[i] };
            if (!pageIpfs.nextCid) delete pageIpfs.nextCid; // we don't to include undefined anywhere in the protocol
            const addRes = await this._subplebbit._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(pageIpfs));
            if (addRes.size > expectedSize)
                throw new PlebbitError("ERR_PAGE_GENERATED_IS_OVER_EXPECTED_SIZE", {
                    addRes,
                    pageIpfs,
                    expectedSize,
                    sortName,
                    pageNum: i
                });
            cids[i] = addRes.path;
            listOfPage[i] = pageIpfs;
            expectedSize = expectedSize / 2; // we're going backward now
        }
        return { [sortName]: { pages: listOfPage, cids } };
    }

    private async addPreloadedCommentChunksToIpfs(
        chunks: PageIpfs["comments"][],
        sortName: PostSortName | ReplySortName
    ): Promise<AddedPreloadedPageChunksToIpfs> {
        const listOfPage: PageIpfs[] = new Array(chunks.length);
        const cids: PageCidUndefinedIfPreloadedPage = [undefined]; // pageCids will never have the cid of preloaded page
        for (let i = chunks.length - 1; i >= 1; i--) {
            const pageIpfs: PageIpfs = { nextCid: cids[i + 1], comments: chunks[i] };
            if (!pageIpfs.nextCid) delete pageIpfs.nextCid; // we don't to include undefined anywhere in the protocol
            cids[i] = (await this._subplebbit._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(pageIpfs))).path; // JSON.stringify will remove undefined values for us
            listOfPage[i] = pageIpfs;
        }
        const firstPage = <PageIpfs>{ comments: chunks[0], nextCid: cids[1] };
        if (!firstPage.nextCid) throw Error("First page should have nextCid");
        listOfPage[0] = firstPage;
        return { [sortName]: { pages: listOfPage } };
    }

    _chunkComments({
        comments,
        firstPageSizeBytes
    }: {
        comments: PageIpfs["comments"];
        firstPageSizeBytes: number;
    }): PageIpfs["comments"][] {
        const FIRST_PAGE_SIZE = firstPageSizeBytes; // dynamic page size for preloaded sorts, 1MB for others
        const SAFETY_MARGIN = 1024; // Use 1KiB margin

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
        let accumulatedSize = OBJECT_WRAPPER_WITH_CID;

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

            // Check if adding this comment would exceed the limit MINUS the safety margin
            if (accumulatedSize + commaSize + commentSize > maxSize - SAFETY_MARGIN) {
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk);
                    currentChunk = [];
                    chunkIndex++;

                    if (isLastItem) {
                        accumulatedSize = OBJECT_WRAPPER_WITHOUT_CID;
                    } else {
                        accumulatedSize = OBJECT_WRAPPER_WITH_CID;
                    }
                } else if (commentSize > maxSize - SAFETY_MARGIN) {
                    const log = Logger("plebbit-js:page-generator:_chunkComments");
                    log.trace(
                        `Single comment at index ${i} (size ${commentSize}) is large relative to page size limit (${maxSize}) for page ${chunkIndex}`
                    );
                    accumulatedSize = isLastItem ? OBJECT_WRAPPER_WITHOUT_CID : OBJECT_WRAPPER_WITH_CID;
                }
            }

            currentChunk.push(comments[i]);
            accumulatedSize += commaSize + commentSize;
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
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
            ? POST_REPLIES_SORT_TYPES[<ReplySortName>sortName]
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

        const commentsChunks = this._chunkComments({
            comments: commentsSorted,
            firstPageSizeBytes: options.firstPageSizeBytes
        });

        return commentsChunks;
    }

    // Resolves to sortedComments
    // this is for non preloaded sorts
    async sortChunkAddIpfsNonPreloaded(
        comments: PageIpfs["comments"],
        sortName: PostSortName | ReplySortName,
        options: PageOptions
    ): Promise<AddedPageChunksToIpfsRes | undefined> {
        const commentsChunks = await this.sortAndChunkComments(comments, sortName, options);
        if (commentsChunks.length === 0) return undefined;

        const res = await this.addCommentChunksToIpfs(commentsChunks, sortName);

        return res;
    }

    private _generationResToPages(res: (PageGenerationRes | undefined)[]): PagesTypeIpfs | undefined {
        const filteredGeneratedPages = res.filter(Boolean); // Take out undefined values
        if (filteredGeneratedPages.length === 0) return undefined;
        const mergedObject: PageGenerationRes = Object.assign({}, ...filteredGeneratedPages);
        return {
            pages: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages!.pages[0] }))),
            pageCids: Object.assign(
                {},
                ...Object.entries(mergedObject).map(([sortName, pages]) => (pages.cids ? { [sortName]: pages!.cids[0] } : undefined))
            )
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
            firstPageSizeBytes: preloadedPageSizeBytes
        };
        // Sorting posts on a subplebbit level
        const rawPosts = await this._subplebbit._dbHandler.queryPageComments(pageOptions);
        if (rawPosts.length === 0) return undefined;

        const preloadedChunk = await this.sortAndChunkComments(rawPosts, preloadedPageSortName, pageOptions);
        if (preloadedChunk.length === 1) return { singlePreloadedPage: { [preloadedPageSortName]: { comments: preloadedChunk[0] } } }; // all comments fit in one page

        // we're gonna have pages for each sort type, they don't fit in a single preloaded chunk
        const sortResults: (PageGenerationRes | undefined)[] = [];

        sortResults.push(await this.addPreloadedCommentChunksToIpfs(preloadedChunk, preloadedPageSortName));

        const nonPreloadedSorts = remeda.keys.strict(POSTS_SORT_TYPES).filter((sortName) => sortName !== preloadedPageSortName);
        for (const sortName of nonPreloadedSorts)
            sortResults.push(await this.sortChunkAddIpfsNonPreloaded(rawPosts, sortName, pageOptions));

        return <PostsPagesTypeIpfs>this._generationResToPages(sortResults);
    }

    async generatePostPages(
        comment: Pick<CommentsTableRow, "cid">,
        preloadedReplyPageSortName: keyof typeof POST_REPLIES_SORT_TYPES,
        preloadedPageSizeBytes: number
    ) {
        const pageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: false,
            excludeRemovedComments: false,
            parentCid: comment.cid,
            preloadedPage: preloadedReplyPageSortName,
            baseTimestamp: timestamp()
        };

        const hierarchalReplies = await this._subplebbit._dbHandler.queryPageComments(pageOptions);
        if (hierarchalReplies.length === 0) return undefined;

        const preloadedChunk = await this.sortAndChunkComments(hierarchalReplies, preloadedReplyPageSortName, {
            ...pageOptions,
            firstPageSizeBytes: preloadedPageSizeBytes
        });
        if (preloadedChunk.length === 1) return { singlePreloadedPage: { [preloadedReplyPageSortName]: { comments: preloadedChunk[0] } } }; // all comments fit in one page

        const sortResults: (PageGenerationRes | undefined)[] = [];

        sortResults.push(await this.addPreloadedCommentChunksToIpfs(preloadedChunk, preloadedReplyPageSortName));

        const nonPreloadedSorts = remeda.keys.strict(POST_REPLIES_SORT_TYPES).filter((sortName) => sortName !== preloadedReplyPageSortName);

        const flattenedReplies = await this._subplebbit._dbHandler.queryFlattenedPageReplies({
            ...pageOptions,
            commentUpdateFieldsToExclude: ["replies"]
        });

        for (const sortName of nonPreloadedSorts) {
            const replies = POST_REPLIES_SORT_TYPES[sortName].flat ? flattenedReplies : hierarchalReplies;
            sortResults.push(
                await this.sortChunkAddIpfsNonPreloaded(replies, sortName, { ...pageOptions, firstPageSizeBytes: 1024 * 1024 })
            );
        }

        return <RepliesPagesTypeIpfs>this._generationResToPages(sortResults);
    }

    async generateReplyPages(
        comment: Pick<CommentsTableRow, "cid" | "depth">,
        preloadedReplyPageSortName: keyof typeof REPLY_REPLIES_SORT_TYPES,
        preloadedPageSizeBytes: number
    ): Promise<RepliesPagesTypeIpfs | { singlePreloadedPage: SinglePreloadedPageRes } | undefined> {
        const pageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: false,
            excludeRemovedComments: false,
            parentCid: comment.cid,
            preloadedPage: preloadedReplyPageSortName,
            baseTimestamp: timestamp()
        };

        const hierarchalReplies = await this._subplebbit._dbHandler.queryPageComments(pageOptions);
        if (hierarchalReplies.length === 0) return undefined;

        const preloadedChunk = await this.sortAndChunkComments(hierarchalReplies, preloadedReplyPageSortName, {
            ...pageOptions,
            firstPageSizeBytes: preloadedPageSizeBytes
        });
        if (preloadedChunk.length === 1) return { singlePreloadedPage: { [preloadedReplyPageSortName]: { comments: preloadedChunk[0] } } }; // all comments fit in one page

        const nonPreloadedSorts = remeda.keys
            .strict(REPLY_REPLIES_SORT_TYPES)
            .filter((sortName) => sortName !== preloadedReplyPageSortName);

        const sortResults: (PageGenerationRes | undefined)[] = [];

        sortResults.push(await this.addPreloadedCommentChunksToIpfs(preloadedChunk, preloadedReplyPageSortName));

        for (const hierarchalSortName of nonPreloadedSorts)
            sortResults.push(
                await this.sortChunkAddIpfsNonPreloaded(hierarchalReplies, hierarchalSortName, {
                    ...pageOptions,
                    firstPageSizeBytes: 1024 * 1024
                })
            );

        return <RepliesPagesTypeIpfs>this._generationResToPages(sortResults);
    }

    toJSON() {
        return undefined;
    }
}
