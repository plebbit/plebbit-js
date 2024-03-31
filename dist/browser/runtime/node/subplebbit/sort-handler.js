import { POSTS_SORT_TYPES, REPLIES_SORT_TYPES, TIMEFRAMES_TO_SECONDS, timestamp } from "../../../util.js";
import assert from "assert";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { cleanUpBeforePublishing } from "../../../signer/signatures.js";
export class SortHandler {
    constructor(subplebbit) {
        this.subplebbit = subplebbit;
    }
    async commentChunksToPages(chunks, sortName) {
        assert(chunks.length > 0);
        const listOfPage = new Array(chunks.length);
        const cids = new Array(chunks.length);
        const chunksWithReplies = await Promise.all(chunks.map(async (chunk) => {
            return await Promise.all(chunk.map(async (commentProps) => {
                const comment = await this.subplebbit.plebbit.createComment(commentProps.comment);
                return comment.toJSONPagesIpfs(commentProps.update);
            }));
        }));
        for (let i = chunksWithReplies.length - 1; i >= 0; i--) {
            const pageIpfs = cleanUpBeforePublishing({ nextCid: cids[i + 1], comments: chunksWithReplies[i] });
            cids[i] = (await this.subplebbit.clientsManager.getDefaultIpfs()._client.add(JSON.stringify(pageIpfs))).path;
            listOfPage[i] = pageIpfs;
        }
        return { [sortName]: { pages: listOfPage, cids } };
    }
    // Resolves to sortedComments
    async sortComments(comments, sortName, options) {
        if (comments.length === 0)
            return undefined;
        const sortProps = POSTS_SORT_TYPES[sortName] || REPLIES_SORT_TYPES[sortName];
        if (typeof sortProps.score !== "function")
            throw Error(`SortProps[${sortName}] is not defined`);
        let activeScores;
        if (sortName === "active") {
            activeScores = {};
            for (const comment of comments)
                activeScores[comment.comment.cid] = await this.subplebbit.dbHandler.queryActiveScore(comment.comment);
        }
        const scoreSort = (obj1, obj2) => {
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
            const timestampLower = timestamp() - TIMEFRAMES_TO_SECONDS[sortProps.timeframe];
            unpinnedComments = unpinnedComments.filter((obj) => obj.comment.timestamp >= timestampLower);
        }
        const commentsSorted = pinnedComments.concat(unpinnedComments);
        if (commentsSorted.length === 0)
            return undefined;
        const commentsChunks = lodash.chunk(commentsSorted, options.pageSize);
        const res = await this.commentChunksToPages(commentsChunks, sortName);
        const listOfPage = Object.values(res)[0].pages;
        const expectedNumOfPages = Math.ceil(commentsSorted.length / options.pageSize);
        assert.equal(listOfPage.length, expectedNumOfPages, `Should generate ${expectedNumOfPages} pages for sort ${sortName} while it generated ${listOfPage.length}`);
        return res;
    }
    _generationResToPages(res) {
        res = res.filter((res) => Boolean(res)); // Take out undefined values
        if (res.length === 0)
            return undefined;
        const mergedObject = Object.assign({}, ...res);
        return {
            pages: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages.pages[0] }))),
            pageCids: Object.assign({}, ...Object.entries(mergedObject).map(([sortName, pages]) => ({ [sortName]: pages.cids[0] })))
        };
    }
    async _generateSubplebbitPosts(pageOptions) {
        // Sorting posts on a subplebbit level
        const log = Logger("plebbit-js:sort-handler:generateSubplebbitPosts");
        const rawPosts = await this.subplebbit.dbHandler.queryCommentsForPages(pageOptions);
        if (rawPosts.length === 0)
            return undefined;
        const sortResults = await Promise.all(Object.keys(POSTS_SORT_TYPES).map((sortName) => this.sortComments(rawPosts, sortName, pageOptions)));
        return this._generationResToPages(sortResults);
    }
    async _generateCommentReplies(comment) {
        const pageOptions = {
            excludeCommentsWithDifferentSubAddress: true,
            excludeDeletedComments: false,
            excludeRemovedComments: false,
            parentCid: comment.cid,
            pageSize: 50
        };
        const comments = await this.subplebbit.dbHandler.queryCommentsForPages(pageOptions);
        const sortResults = await Promise.all(Object.keys(REPLIES_SORT_TYPES).map((sortName) => this.sortComments(comments, sortName, pageOptions)));
        return this._generationResToPages(sortResults);
    }
    async generateRepliesPages(comment) {
        const log = Logger("plebbit-js:sort-handler:generateRepliesPages");
        const pages = await this._generateCommentReplies(comment);
        // TODO assert here
        return pages;
    }
    async generateSubplebbitPosts() {
        const pageOptions = {
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
//# sourceMappingURL=sort-handler.js.map