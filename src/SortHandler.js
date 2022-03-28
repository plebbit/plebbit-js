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
        this.nextSortedCommentsCid = props["nextSortedCommentsCid"];
        this.comments = props["comments"];
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
            else {
                const sortedPosts = new Array(chunks.length);
                for (let i = chunks.length - 1; i >= 0; i--) {
                    const sortedPostsPage = new SortedComments({
                        "type": sortType, "comments": chunks[i],
                        "nextSortedCommentsCid": sortedPosts[i + 1]?.pageCid,
                        "pageCid": undefined
                    }, this.subplebbit);
                    const cid = (await this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(sortedPostsPage))).path;
                    sortedPostsPage.setPageCid(cid);
                    sortedPosts[i] = sortedPostsPage;
                }
                resolve(sortedPosts);
            }
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
                commentsSorted = (await Promise.all(comments.map(async comment => ({
                    "comment": comment,
                    "score": await this.#score(comment, sortType)
                }))))
                    .sort((postA, postB) => {
                        return postB.score - postA.score;
                    }).map(comment => comment.comment);

            }
            const commentsChunks = chunks(commentsSorted, limit);
            const sortedComments = await this.#chunksToSortedComments(commentsChunks, sortType);
            if (sortedComments.length === 0 && commentsSorted.length > 0)
                throw `There are ${commentsSorted.length} comments yet sortedComments has no comments`;
            resolve(sortedComments[0]);

        });
    }

    async #sortCommentsByHot(parentCid, limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            const comments = await this.subplebbit.dbHandler.queryCommentsUnderComment(parentCid);
            this.#sortComments(comments, SORTED_COMMENTS_TYPES.HOT, limit).then(resolve).catch(reject);
        });
    }

    async #sortCommentsByTop(parentCid, timeframe, limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            // Timeframe is "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL"
            const sortType = SORTED_COMMENTS_TYPES[`TOP_${timeframe}`];
            const comments = await this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(parentCid, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe], timestamp());
            this.#sortComments(comments, sortType, limit).then(resolve).catch(reject);
        });
    }


    async #sortCommentsByControversial(parentCid, timeframe, limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            const sortType = SORTED_COMMENTS_TYPES[`CONTROVERSIAL_${timeframe}`];
            const comments = await this.subplebbit.dbHandler.queryCommentsBetweenTimestampRange(parentCid, timestamp() - TIMEFRAMES_TO_SECONDS[timeframe], timestamp());
            this.#sortComments(comments, sortType, limit).then(resolve).catch(reject);
        });

    }

    async #sortCommentsByNew(parentCid, limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            const comments = await this.subplebbit.dbHandler.queryCommentsSortedByTimestamp(parentCid);
            this.#sortComments(comments, SORTED_COMMENTS_TYPES.NEW, limit).then(resolve).catch(reject);
        });
    }

    #getSortPromises(comment) {
        if (!comment) {
            // Sorting posts on a subplebbit level
            const sortPromises = [this.#sortCommentsByHot.bind(this)(null), this.#sortCommentsByNew.bind(this)(null)];
            for (const timeframe of Object.keys(TIMEFRAMES_TO_SECONDS)) {
                sortPromises.push(this.#sortCommentsByTop.bind(this)(null, timeframe));
                sortPromises.push(this.#sortCommentsByControversial.bind(this)(null, timeframe));
            }
            return sortPromises;
        } else {
            return [SORTED_COMMENTS_TYPES.HOT, SORTED_COMMENTS_TYPES.NEW, SORTED_COMMENTS_TYPES.TOP_ALL, SORTED_COMMENTS_TYPES.CONTROVERSIAL_ALL].map(async type => {
                const comments = type === SORTED_COMMENTS_TYPES.TOP_ALL ?
                    await this.subplebbit.dbHandler.queryTopCommentsBetweenTimestampRange(comment.commentCid, 0, timestamp())
                    : await this.subplebbit.dbHandler.queryCommentsUnderComment(comment.commentCid);
                return this.#sortComments(comments, type);
            });

        }
    }

    async calculateSortedPosts(comment) {
        return new Promise(async (resolve, reject) => {
            Promise.all(this.#getSortPromises(comment)).then((sortedComments) => {
                const sortedPosts = Object.fromEntries(sortedComments.map(sortedPost => [sortedPost.type, sortedPost]));
                const sortedPostsCids = Object.fromEntries(sortedComments.map(sortedPost => [sortedPost.type, sortedPost?.pageCid]));
                resolve([sortedPosts, sortedPostsCids]);
            }).catch((err) => {
                console.error(err);
                reject(err);
            });


        });
    }
}