import {chunks, round, TIMEFRAMES_TO_SECONDS, timestamp} from "./Util.js";

export const SORTED_COMMENTS_TYPES = Object.freeze({
    HOT: "hot",
    NEW: "new",
    TOP_HOUR: "topHour",
    TOP_DAY: "topDay",
    TOP_WEEK: "topWeek",
    TOP_MONTH: "topMonth",
    TOP_YEAR: "topYear",
    TOP_ALL: "topAll",
    CONTROVERSIAL_HOUR: "controversialHour",
    CONTROVERSIAL_DAY: "controversialDay",
    CONTROVERSIAL_WEEK: "controversialWeek",
    CONTROVERSIAL_MONTH: "controversialMonth",
    CONTROVERSIAL_YEAR: "controversialYear",
    CONTROVERSIAL_ALL: "controversialAll"
});

export const SORTED_POSTS_PAGE_SIZE = 2;

export class SortedComments {
    constructor(props) {
        this.nextSortedCommentsCid = props["nextSortedCommentsCid"] || null;
        this.comments = props["comments"] || [];
        this.type = props["type"];
        this.pageCid = props["pageCid"];
    }

    setPageCid(newPageCid) {
        this.pageCid = newPageCid;
    }
}

export class SortHandler {
    constructor(subplebbit) {
        this.subplebbit = subplebbit;
    }

    async #chunksToSortedComments(chunks, sortType) {
        return new Promise(async (resolve, reject) => {
            if (chunks.length === 0)
                resolve([new SortedComments({"type": sortType})]);
            const sortedPosts = new Array(chunks.length);
            for (let i = chunks.length - 1; i >= 0; i--) {
                const sortedPostsPage = new SortedComments({
                    "type": sortType, "comments": chunks[i].map(comment => comment.toJSON()),
                    "nextSortedCommentsCid": sortedPosts[i + 1]?.pageCid || null,
                    "pageCid": null
                }, this.subplebbit);
                const cid = (await this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(sortedPostsPage))).path;
                sortedPostsPage.setPageCid(cid);
                sortedPosts[i] = sortedPostsPage;
            }
            resolve(sortedPosts);
        });


    }


    async #hotScore(comment) {
        return new Promise(async (resolve, reject) => {
            this.subplebbit.dbHandler.queryVotesOfComment(comment.commentCid).then(([upvote, downvote]) => {
                const score = upvote - downvote;
                const order = Math.log10(Math.max(score, 1));
                const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
                const seconds = comment.timestamp - 1134028003;
                const hotScore = round(sign * order + seconds / 45000, 7);
                resolve(hotScore);
            }).catch(reject);
        });

    }
    async #controversialScore(comment) {
        return new Promise(async (resolve, reject) => {
            this.subplebbit.dbHandler.queryVotesOfComment(comment.commentCid).then(([upvote, downvote]) => {
                if (downvote <= 0 || upvote <= 0)
                    resolve(0);
                const magnitude = upvote + downvote;
                const balance = upvote > downvote ? (parseFloat(downvote) / upvote) : (parseFloat(upvote) / downvote);
                const score = Math.pow(magnitude, balance);
                resolve(score);
            }).catch(reject);
        });
    }
    async #score(comment, sortType) {
        if (sortType.includes("hot"))
            return this.#hotScore(comment);
        else if (sortType.includes("controversial"))
            return this.#controversialScore(comment);
    }
    // Resolves to sortedComments
    async #sortComments(comments, sortType, limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            let commentsSorted;
            const typesAlreadySorted = [SORTED_COMMENTS_TYPES.NEW, SORTED_COMMENTS_TYPES.TOP_ALL,
                SORTED_COMMENTS_TYPES.TOP_YEAR, SORTED_COMMENTS_TYPES.TOP_MONTH,
                SORTED_COMMENTS_TYPES.TOP_WEEK, SORTED_COMMENTS_TYPES.TOP_DAY, SORTED_COMMENTS_TYPES.TOP_HOUR]
            // No need to sort these comments since they are already sorted by DB
            if (typesAlreadySorted.includes(sortType))
                commentsSorted = comments;
            else {
                const scores = await Promise.all(comments.map(async comment => await this.#score(comment, sortType)));
                commentsSorted = comments.sort((postA, postB) => {
                    const [iA, iB] = [comments.indexOf(postA), comments.indexOf(postB)];
                    return scores[iA] > scores[iB];
                });

            }
            const commentsChunks = chunks(commentsSorted, limit);
            const sortedComments = await this.#chunksToSortedComments(commentsChunks, sortType);
            if (sortedComments.length === 0 && commentsSorted.length > 0)
                throw `There are ${commentsSorted.length} comments yet sortedComments has no comments`;
            resolve(sortedComments[0]);

        });
    }

    async #sortPostsByHot(limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            const posts = await this.subplebbit.dbHandler.queryAllPosts();
            this.#sortComments(posts, SORTED_COMMENTS_TYPES.HOT, limit).then(resolve).catch(reject);
        });
    }

    async #sortPostsByTop(timeframe, limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            // Timeframe is "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL"
            const sortType = SORTED_COMMENTS_TYPES[`TOP_${timeframe}`];
            const posts = await this.subplebbit.dbHandler.queryTopPostsBetweenTimestampRange(timestamp() - TIMEFRAMES_TO_SECONDS[timeframe], timestamp());
            this.#sortComments(posts, sortType, limit).then(resolve).catch(reject);
        });
    }


    async #sortPostsByControversial(timeframe, limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            const sortType = SORTED_COMMENTS_TYPES[`CONTROVERSIAL_${timeframe}`];
            const posts = await this.subplebbit.dbHandler.queryPostsBetweenTimestampRange(timestamp() - TIMEFRAMES_TO_SECONDS[timeframe], timestamp());
            this.#sortComments(posts, sortType, limit).then(resolve).catch(reject);
        });

    }

    async #sortPostsByNew(limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            const posts = await this.subplebbit.dbHandler.queryPostsSortedByTimestamp(limit);
            this.#sortComments(posts, SORTED_COMMENTS_TYPES.NEW, limit).then(resolve).catch(reject);
        });
    }

    async calculateSortedPosts() {
        return new Promise(async (resolve, reject) => {
            const sortPromises = [this.#sortPostsByHot.bind(this)(), this.#sortPostsByNew.bind(this)()];
            for (const timeframe of Object.keys(TIMEFRAMES_TO_SECONDS)) {
                sortPromises.push(this.#sortPostsByTop.bind(this)(timeframe));
                sortPromises.push(this.#sortPostsByControversial.bind(this)(timeframe));
            }

            Promise.all(sortPromises).then((sortedComments) => {
                const sortedPosts = Object.fromEntries(sortedComments.map(sortedPost => [sortedPost.type, sortedPost]));
                const sortedPostsCids = Object.fromEntries(sortedComments.map(sortedPost => [sortedPost.type, sortedPost?.pageCid]));
                resolve([sortedPosts, sortedPostsCids]);
            }).catch((err) => {
                console.error(err);
                reject(err);
            });


        });
    }

    async calculateSortedComments(commentCid) {
        return new Promise(async (resolve, reject) => {
            const sortPromises = [SORTED_COMMENTS_TYPES.HOT, SORTED_COMMENTS_TYPES.NEW, SORTED_COMMENTS_TYPES.TOP_ALL, SORTED_COMMENTS_TYPES.CONTROVERSIAL_ALL].map(async type => {
                const comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(commentCid);
                return this.#sortComments(comments, type);
            });

            Promise.all(sortPromises).then((sortedComments) => {
                const res1 = Object.fromEntries(sortedComments.map(sortedComment => [sortedComment.type, sortedComment]));
                const res2 = Object.fromEntries(sortedComments.map(sortedComment => [sortedComment.type, sortedComment?.pageCid]));
                resolve([res1, res2]);
            }).catch(err => {
                console.error(err);
                reject(err);
            });
        });
    }
}