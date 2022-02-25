import Post from "./Post.js";
import Comment from "./Comment.js";
import {chunks, round} from "./Util.js";

const SORTED_COMMENTS_TIMEFRAMES = Object.freeze({
    HOUR: "HOUR",
    DAY: "DAY",
    WEEK: "WEEK",
    month: "MONTH",
    year: "YEAR",
    all: "ALL"
});

const SORTED_COMMENTS_TIMEFRAMES_MILLISECONDS = Object.freeze({
    "HOUR": 1000 * 60 * 60,
    "DAY": 1000 * 60 * 60 * 24,
    "WEEK": 1000 * 60 * 60 * 24 * 7,
    "MONTH": 1000 * 60 * 60 * 24 * 7 * 30,
    "YEAR": 1000 * 60 * 60 * 24 * 7 * 30 * 365,
    "ALL": Infinity
})
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
        this.comments = (props["comments"] || []).map(prop => prop.hasOwnProperty("title") ? new Post(prop, subplebbit) : new Comment(prop, subplebbit));
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
        this.sortedPosts = {};
        this.sortedPostsCids = {};
    }

    async #chunksToSortedComments(chunks, type) {
        return new Promise(async (resolve, reject) => {
            const sortedPosts = new Array(chunks.length);
            for (let i = chunks.length - 1; i >= 0; i--) {
                const sortedPostsPage = new SortedComments({
                    "type": type, "comments": chunks[i],
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

    async #sortPostsByNew(limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            const postsPages = chunks(await this.subplebbit.dbHandler.queryPostsSortedByTimestamp(SORTED_POSTS_PAGE_SIZE), limit);
            const sortedPosts = await this.#chunksToSortedComments(postsPages, SORTED_COMMENTS_TYPES.NEW);
            this.sortedPosts[SORTED_COMMENTS_TYPES.NEW] = sortedPosts[0];
            this.sortedPostsCids[SORTED_COMMENTS_TYPES.NEW] = sortedPosts[0].pageCid;
            resolve(sortedPosts);
        });
    }


    async #hotScore(post) {
        return new Promise(async (resolve, reject) => {
            post.fetchCommentIpns().then(commentIpns => {
                const [ups, downs] = [commentIpns.upvoteCount, commentIpns.downvoteCount];
                const score = ups - downs;
                const order = Math.log10(Math.max(score, 1));
                const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
                const seconds = post.timestamp - 1134028003;
                const hotScore = round(sign * order + seconds / 45000, 7);
                resolve(hotScore);
            }).catch(reject);
        });

    }

    async #sortPostsByHot(limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {

            const posts = await this.subplebbit.dbHandler.queryAllPosts();
            const scores = await Promise.all(posts.map(async post => await this.#hotScore(post)));
            const postsSorted = posts.sort((postA, postB) => {
                const [iA, iB] = [posts.indexOf(postA), posts.indexOf(postB)];
                return scores[iA] > scores[iB];
            });

            const postsChunks = chunks(postsSorted, limit);
            const sortedComments = await this.#chunksToSortedComments(postsChunks, SORTED_COMMENTS_TYPES.HOT);
            this.sortedPosts[SORTED_COMMENTS_TYPES.HOT] = sortedComments[0];
            this.sortedPostsCids[SORTED_COMMENTS_TYPES.HOT] = sortedComments[0].pageCid;

            resolve(sortedComments);
        });
    }

    async #sortPostsByTop(timeframe, limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            // Timeframe is "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR" | "ALL"

            const posts = await this.subplebbit.dbHandler.queryPostsBetweenTimestampRange(Date.now() - SORTED_COMMENTS_TIMEFRAMES_MILLISECONDS[timeframe], Date.now());
            const scores = await Promise.all(posts.map(async post => {
                const commentIpns = await post.fetchCommentIpns();
                const [upvote, downvote] = [commentIpns.upvoteCount, commentIpns.downvoteCount];
                return upvote - downvote;
            }));
            const sortedPosts = posts.sort((postA, postB) => {
                const [iA, iB] = [posts.indexOf(postA), posts.indexOf(postB)];
                return scores[iA] > scores[iB];
            });
            const postsChunks = chunks(sortedPosts, limit);
            const typePropertyName = SORTED_COMMENTS_TYPES[`TOP_${timeframe}`];
            const sortedComments = await this.#chunksToSortedComments(postsChunks, typePropertyName);
            this.sortedPosts[typePropertyName] = sortedComments[0];
            this.sortedPostsCids[typePropertyName] = sortedComments[0]?.pageCid;

            resolve(sortedComments);
        });


    }

    async #controversialScore(post) {
        return new Promise(async (resolve, reject) => {
            post.fetchCommentIpns().then(commentIpns => {
                const [upvote, downvote] = [commentIpns.upvoteCount, commentIpns.downvoteCount];
                if (downvote <= 0 || upvote <= 0)
                    resolve(0);
                const magnitude = upvote + downvote;
                const balance = upvote > downvote ? (parseFloat(downvote) / upvote) : (parseFloat(upvote) / downvote);
                const score = Math.pow(magnitude, balance);
                resolve(score);
            }).catch(err => {
                console.error(err);
                reject(err)
            });
        });
    }

    async #sortPostsByControversial(timeframe, limit = SORTED_POSTS_PAGE_SIZE) {
        return new Promise(async (resolve, reject) => {
            const posts = await this.subplebbit.dbHandler.queryPostsBetweenTimestampRange(Date.now() - SORTED_COMMENTS_TIMEFRAMES_MILLISECONDS[timeframe], Date.now());
            const scores = await Promise.all(posts.map(async post => await this.#controversialScore.bind(this)(post)));
            const sortedPosts = posts.sort((postA, postB) => {
                const [iA, iB] = [posts.indexOf(postA), posts.indexOf(postB)];
                return scores[iA] > scores[iB];
            });
            const postsChunks = chunks(sortedPosts, limit);
            const typePropertyName = SORTED_COMMENTS_TYPES[`CONTROVERSIAL_${timeframe}`];
            const sortedComments = await this.#chunksToSortedComments(postsChunks, typePropertyName);
            this.sortedPosts[typePropertyName] = sortedComments[0];
            this.sortedPostsCids[typePropertyName] = sortedComments[0].pageCid;

            resolve(sortedComments);
        });

    }

    async calculateSortedPosts() {
        return new Promise(async (resolve, reject) => {
            const sortPromises = [this.#sortPostsByHot.bind(this)(), this.#sortPostsByNew.bind(this)()];
            for (const type of ["TOP", "CONTROVERSIAL"])
                for (const timeframe of Object.values(SORTED_COMMENTS_TIMEFRAMES)) {
                    if (type === "TOP")
                        sortPromises.push(this.#sortPostsByTop.bind(this)(timeframe));
                    else if (type === "CONTROVERSIAL")
                        sortPromises.push(this.#sortPostsByControversial.bind(this)(timeframe));
                }

            Promise.all(sortPromises).then(() => resolve([this.sortedPosts, this.sortedPostsCids])).catch((err) => {
                console.error(err);
                reject(err);
            });


        });

    }
}