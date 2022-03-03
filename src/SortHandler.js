import {chunks, round} from "./Util.js";


const SORTED_COMMENTS_TIMEFRAMES_SECONDS = Object.freeze({
    "HOUR": 60 * 60,
    "DAY": 60 * 60 * 24,
    "WEEK": 60 * 60 * 24 * 7,
    "MONTH": 60 * 60 * 24 * 7 * 30,
    "YEAR": 60 * 60 * 24 * 7 * 30 * 365,
    "ALL": Infinity
});

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
    constructor(props, subplebbit) {
        this.nextSortedCommentsCid = props["nextSortedCommentsCid"];
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
            const sortedPosts = new Array(chunks.length);
            for (let i = chunks.length - 1; i >= 0; i--) {
                const sortedPostsPage = new SortedComments({
                    "type": sortType, "comments": chunks[i],
                    "nextSortedCommentsCid": sortedPosts[i + 1]?.pageCid || null,
                    "pageCid": null
                }, this.subplebbit);
                const cid = (await this.subplebbit.ipfsClient.add(JSON.stringify(sortedPostsPage))).path;
                sortedPostsPage.setPageCid(cid);
                sortedPosts[i] = sortedPostsPage;
            }
            resolve(sortedPosts);
        });


    }


    async #hotScore(comment) {
        return new Promise(async (resolve, reject) => {
            comment.fetchCommentIpns().then(commentIpns => {
                const [ups, downs] = [commentIpns.upvoteCount, commentIpns.downvoteCount];
                const score = ups - downs;
                const order = Math.log10(Math.max(score, 1));
                const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
                const seconds = comment.timestamp - 1134028003;
                const hotScore = round(sign * order + seconds / 45000, 7);
                resolve(hotScore);
            }).catch(reject);
        });

    }

    async #topScore(comment) {
        return new Promise(async (resolve, reject) => {
            comment.fetchCommentIpns().then(commentIpns => {
                const [upvote, downvote] = [commentIpns.upvoteCount, commentIpns.downvoteCount];
                resolve(upvote - downvote);
            }).catch(reject);
        });
    }

    async #controversialScore(comment) {
        return new Promise(async (resolve, reject) => {
            comment.fetchCommentIpns().then(commentIpns => {
                const [upvote, downvote] = [commentIpns.upvoteCount, commentIpns.downvoteCount];
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
        else if (sortType.includes("top"))
            return this.#topScore(comment);
        else if (sortType.includes("controversial"))
            return this.#controversialScore(comment);
    }


    // Resolves to sortedComments
    async #sortComments(comments, sortType, limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            let commentsSorted;
            // No need to sort new comments since they are already sorted by DB
            if (sortType === SORTED_COMMENTS_TYPES.NEW)
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
            const posts = await this.subplebbit.dbHandler.queryPostsBetweenTimestampRange((Date.now() / 1000) - SORTED_COMMENTS_TIMEFRAMES_SECONDS[timeframe], (Date.now() / 1000));
            this.#sortComments(posts, sortType, limit).then(resolve).catch(reject);
        });
    }


    async #sortPostsByControversial(timeframe, limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            const sortType = SORTED_COMMENTS_TYPES[`CONTROVERSIAL_${timeframe}`];
            const posts = await this.subplebbit.dbHandler.queryPostsBetweenTimestampRange((Date.now() / 1000) - SORTED_COMMENTS_TIMEFRAMES_SECONDS[timeframe], Date.now() / 1000);
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
            for (const type of ["TOP", "CONTROVERSIAL"])
                for (const timeframe of Object.keys(SORTED_COMMENTS_TIMEFRAMES_SECONDS)) {
                    if (type === "TOP")
                        sortPromises.push(this.#sortPostsByTop.bind(this)(timeframe));
                    else if (type === "CONTROVERSIAL")
                        sortPromises.push(this.#sortPostsByControversial.bind(this)(timeframe));
                }

            Promise.all(sortPromises).then((sortedComments) => {
                const sortedPosts = Object.fromEntries(sortedComments.map(sortedPost => [sortedPost.type, sortedPost]));
                const sortedPostsCids = Object.fromEntries(sortedComments.map(sortedPost => [sortedPost.type, sortedPost.pageCid]));
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
                const res1 = Object.fromEntries(sortedComments.map(sortedComment => [sortedComment?.type, sortedComment]));
                const res2 = Object.fromEntries(sortedComments.map(sortedComment => [sortedComment?.type, sortedComment?.pageCid]));
                resolve([res1, res2]);
            }).catch(err => {
                console.error(err);
                reject(err);
            });
        });
    }
}