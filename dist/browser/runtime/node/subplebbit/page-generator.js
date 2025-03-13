import { hideClassPrivateProps, timestamp } from "../../../util.js";
import assert from "assert";
import * as remeda from "remeda";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { POSTS_SORT_TYPES, REPLIES_SORT_TYPES, TIMEFRAMES_TO_SECONDS } from "../../../pages/util.js";
export class PageGenerator {
    constructor(subplebbit) {
        this._subplebbit = subplebbit;
        hideClassPrivateProps(this);
    }
    async commentChunksToPages(chunks, sortName) {
        assert(chunks.length > 0);
        const listOfPage = new Array(chunks.length);
        const cids = new Array(chunks.length);
        for (let i = chunks.length - 1; i >= 0; i--) {
            const pageIpfs = { nextCid: cids[i + 1], comments: chunks[i] };
            if (!pageIpfs.nextCid)
                delete pageIpfs.nextCid; // we don't to include undefined anywhere in the protocol
            cids[i] = (await this._subplebbit._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(pageIpfs))).path; // JSON.stringify will remove undefined values for us
            listOfPage[i] = pageIpfs;
        }
        return { [sortName]: { pages: listOfPage, cids } };
    }
    _chunkComments(comments, isPreloadedSort) {
        const FIRST_PAGE_SIZE = isPreloadedSort ? 512 * 1024 : 1024 * 1024; // 0.5MB for preloaded sorts, 1MB for others
        // Calculate overhead with and without nextCid
        const OBJECT_WRAPPER_WITH_CID = Buffer.byteLength(JSON.stringify({
            comments: [],
            nextCid: "QmXsYKgNH7XoZXdLko5uDvtWSRNE2AXuQ4u8KxVpCacrZx" // random cid as a place holder
        }), "utf8") - 2; // Subtract 2 for empty array "[]"
        const OBJECT_WRAPPER_WITHOUT_CID = Buffer.byteLength(JSON.stringify({
            comments: []
        }), "utf8") - 2; // Subtract 2 for empty array "[]"
        // Quick check for small arrays - if everything fits in one page, no nextCid needed
        const totalSizeWithoutCid = Buffer.byteLength(JSON.stringify({ comments }), "utf8");
        if (totalSizeWithoutCid <= FIRST_PAGE_SIZE) {
            return [comments]; // Single page, no chunking needed
        }
        const chunks = [];
        let currentChunk = [];
        let chunkIndex = 0;
        let accumulatedSize = OBJECT_WRAPPER_WITH_CID; // Start with the overhead size (including nextCid)
        // Pre-calculate sizes to avoid repeated stringification
        const commentSizes = new Map();
        function getCommentSize(index) {
            if (!commentSizes.has(index)) {
                const size = Buffer.byteLength(JSON.stringify(comments[index]), "utf8");
                commentSizes.set(index, size);
            }
            return commentSizes.get(index);
        }
        function getCurrentMaxSize(index) {
            if (index === 0) {
                return FIRST_PAGE_SIZE; // First page is 0.5MB for preloaded, 1MB for others
            }
            else {
                // For preloaded: 0.5MB, 1MB, 2MB, 4MB, etc.
                // For non-preloaded: 1MB, 2MB, 4MB, 8MB, etc.
                return FIRST_PAGE_SIZE * Math.pow(2, index);
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
                    }
                    else {
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
            }
            else {
                // If we only have one chunk, it shouldn't have nextCid
                // But this case should be caught by our initial check
                chunks.push(currentChunk);
            }
        }
        return chunks;
    }
    // Resolves to sortedComments
    async sortComments(comments, sortName, options) {
        if (comments.length === 0)
            throw Error("Should not provide empty array of comments to sort");
        const sortProps = options.parentCid
            ? REPLIES_SORT_TYPES[sortName]
            : POSTS_SORT_TYPES[sortName];
        if (typeof sortProps.score !== "function")
            throw Error(`SortProps[${sortName}] score function is not defined`);
        let activeScores;
        if (sortName === "active") {
            activeScores = {};
            for (const comment of comments)
                activeScores[comment.commentUpdate.cid] = await this._subplebbit._dbHandler.queryActiveScore({
                    cid: comment.commentUpdate.cid,
                    timestamp: comment.comment.timestamp
                });
        }
        const scoreSort = (obj1, obj2) => {
            if (activeScores) {
                // Make exception for active sorting because it has a different mechanism for sorting
                return activeScores[obj2.commentUpdate.cid] - activeScores[obj1.commentUpdate.cid];
            }
            const score1 = sortProps.score(obj1);
            const score2 = sortProps.score(obj2);
            return score2 - score1;
        };
        const pinnedComments = comments.filter((obj) => obj.commentUpdate.pinned === true).sort(scoreSort);
        let unpinnedComments = comments.filter((obj) => !obj.commentUpdate.pinned).sort(scoreSort);
        if (sortProps.timeframe) {
            const timestampLower = timestamp() - TIMEFRAMES_TO_SECONDS[sortProps.timeframe];
            unpinnedComments = unpinnedComments.filter((obj) => obj.comment.timestamp >= timestampLower);
        }
        const commentsSorted = pinnedComments.concat(unpinnedComments);
        if (commentsSorted.length === 0)
            return undefined;
        const isPreloadedSort = options.preloadedPages?.includes(sortName) || false;
        const commentsChunks = this._chunkComments(commentsSorted, isPreloadedSort);
        const res = await this.commentChunksToPages(commentsChunks, sortName);
        return res;
    }
    _generationResToPages(res) {
        const filteredGeneratedPages = res.filter(Boolean); // Take out undefined values
        if (filteredGeneratedPages.length === 0)
            return undefined;
        const mergedObject = Object.assign({}, ...filteredGeneratedPages);
        return {
            pages: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages.pages[0] }))),
            pageCids: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages.cids[0] })))
        };
    }
    async generateSubplebbitPosts(preloadedPages) {
        const pageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: true,
            excludeRemovedComments: true,
            parentCid: null,
            preloadedPages
        };
        // Sorting posts on a subplebbit level
        const rawPosts = await this._subplebbit._dbHandler.queryPageComments(pageOptions);
        if (rawPosts.length === 0)
            return undefined;
        const sortResults = [];
        for (const sortName of remeda.keys.strict(POSTS_SORT_TYPES))
            sortResults.push(await this.sortComments(rawPosts, sortName, pageOptions));
        return this._generationResToPages(sortResults);
    }
    async generateRepliesPages(comment, preloadedPages) {
        const pageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: false,
            excludeRemovedComments: false,
            parentCid: comment.cid,
            preloadedPages
        };
        const sortResults = [];
        const hierarchalSorts = remeda.keys.strict(REPLIES_SORT_TYPES).filter((replySortName) => !REPLIES_SORT_TYPES[replySortName].flat);
        if (hierarchalSorts.length > 0) {
            const hierarchalReplies = await this._subplebbit._dbHandler.queryPageComments(pageOptions);
            if (hierarchalReplies.length === 0)
                return undefined;
            for (const hierarchalSortName of hierarchalSorts)
                sortResults.push(await this.sortComments(hierarchalReplies, hierarchalSortName, pageOptions));
        }
        const flatSorts = remeda.keys.strict(REPLIES_SORT_TYPES).filter((replySortName) => REPLIES_SORT_TYPES[replySortName].flat);
        if (flatSorts.length > 0 && comment.depth === 0) {
            const flattenedReplies = await this._subplebbit._dbHandler.queryFlattenedPageReplies({
                ...pageOptions,
                commentUpdateFieldsToExclude: ["replies"]
            });
            for (const flatSortName of flatSorts)
                sortResults.push(await this.sortComments(flattenedReplies, flatSortName, pageOptions));
        }
        return this._generationResToPages(sortResults);
    }
    toJSON() {
        return undefined;
    }
}
//# sourceMappingURL=page-generator.js.map