import Post from "./Post.js";
import Comment from "./Comment.js";
import {chunks, round} from "./Util.js";

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
    CONTROVERSIAL_YEAR: "controversialYear"
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

            resolve([sortedPosts[0], sortedPosts[0].pageCid]);
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
                return scores[iA] - scores[iB];
            });

            const postsChunks = chunks(postsSorted, limit);
            const sortedComments = await this.#chunksToSortedComments(postsChunks, SORTED_COMMENTS_TYPES.HOT);

            resolve([sortedComments[0], sortedComments[0]?.pageCid]);
        });
    }

    async calculateSortedPosts() {
        return new Promise(async (resolve ,reject) => {
            const [sortedPostsHot, sortedPostsHotCid] = await this.#sortPostsByHot();
            const [sortedPostsNew, sortedPostsNewCid] = await this.#sortPostsByNew();
            const sortedPosts = {[SORTED_COMMENTS_TYPES.HOT]: sortedPostsHot};
            const sortedPostsCids = {
                [SORTED_COMMENTS_TYPES.HOT]: sortedPostsHotCid,
                [SORTED_COMMENTS_TYPES.NEW]: sortedPostsNewCid
            };
            resolve([sortedPosts, sortedPostsCids]);
        });

    }
}