import { timestamp } from "../../../util.js";
import assert from "assert";
import * as remeda from "remeda";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { POSTS_SORT_TYPES, REPLIES_SORT_TYPES, TIMEFRAMES_TO_SECONDS } from "../../../pages/util.js";
export class SortHandler {
    constructor(subplebbit) {
        this.subplebbit = subplebbit;
    }
    async commentChunksToPages(chunks, sortName) {
        assert(chunks.length > 0);
        const listOfPage = new Array(chunks.length);
        const cids = new Array(chunks.length);
        for (let i = chunks.length - 1; i >= 0; i--) {
            const pageIpfs = { nextCid: cids[i + 1], comments: chunks[i] };
            cids[i] = (await this.subplebbit._clientsManager.getDefaultIpfs()._client.add(deterministicStringify(pageIpfs))).path; // JSON.stringify will remove undefined values for us
            listOfPage[i] = pageIpfs;
        }
        return { [sortName]: { pages: listOfPage, cids } };
    }
    // Resolves to sortedComments
    async sortComments(comments, sortName, options) {
        if (comments.length === 0)
            throw Error("Should not provide empty array of comments to sort");
        const sortProps = options.parentCid
            ? REPLIES_SORT_TYPES[sortName]
            : POSTS_SORT_TYPES[sortName];
        if (typeof sortProps.score !== "function")
            throw Error(`SortProps[${sortName}] is not defined`);
        let activeScores;
        if (sortName === "active") {
            activeScores = {};
            for (const comment of comments)
                activeScores[comment.commentUpdate.cid] = await this.subplebbit._dbHandler.queryActiveScore({
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
        const commentsChunks = remeda.chunk(commentsSorted, options.pageSize);
        const res = await this.commentChunksToPages(commentsChunks, sortName);
        const listOfPage = Object.values(res)[0].pages;
        const expectedNumOfPages = Math.ceil(commentsSorted.length / options.pageSize);
        assert.equal(listOfPage.length, expectedNumOfPages, `Should generate ${expectedNumOfPages} pages for sort ${sortName} while it generated ${listOfPage.length}`);
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
    async generateSubplebbitPosts() {
        const pageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: true,
            excludeRemovedComments: true,
            parentCid: null,
            pageSize: 50
        };
        // Sorting posts on a subplebbit level
        const rawPosts = await this.subplebbit._dbHandler.queryCommentsForPages(pageOptions);
        if (rawPosts.length === 0)
            return undefined;
        const sortResults = [];
        for (const sortName of remeda.keys.strict(POSTS_SORT_TYPES))
            sortResults.push(await this.sortComments(rawPosts, sortName, pageOptions));
        return this._generationResToPages(sortResults);
    }
    async generateRepliesPages(comment) {
        const pageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: false,
            excludeRemovedComments: false,
            parentCid: comment.cid,
            pageSize: 50
        };
        const rawReplies = await this.subplebbit._dbHandler.queryCommentsForPages(pageOptions);
        if (rawReplies.length === 0)
            return undefined;
        const sortResults = [];
        for (const sortName of remeda.keys.strict(REPLIES_SORT_TYPES))
            sortResults.push(await this.sortComments(rawReplies, sortName, pageOptions));
        return this._generationResToPages(sortResults);
    }
    toJSON() {
        return undefined;
    }
}
//# sourceMappingURL=sort-handler.js.map