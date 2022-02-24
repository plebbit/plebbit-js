import Post from "./Post.js";

export const SORTED_COMMENTS_TYPES = Object.freeze({
    HOT: "hot", NEW: "new", TOP_HOUR: "topHour",
    TOP_DAY: "topDay", TOP_WEEK: "topWeek", TOP_MONTH: "topMonth", TOP_YEAR: "topYear", TOP_ALL: "topAll",
});

export const SORTED_POSTS_PAGE_SIZE = 2;

export class SortedComments {
    constructor(props) {
        this.nextSortedCommentsCid = props["nextSortedCommentsCid"];
        this.comments = (props["comments"] || []).map(prop => prop.hasOwnProperty("title") ? new Post(prop) : new Comment(prop));
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

    async #sortPostsByNew() {
        return new Promise(async (resolve, reject) => {
            const postsPages = await this.subplebbit.dbHandler.queryPostsSortedByTimestamp(SORTED_POSTS_PAGE_SIZE);
            const sortedPosts = new Array(postsPages.len);
            for (let i = postsPages.length - 1; i >= 0; i--) {
                const sortedPostsPage = new SortedComments({
                    "type": SORTED_COMMENTS_TYPES.NEW, "comments": postsPages[i],
                    "nextSortedCommentsCid": sortedPosts[i + 1]?.pageCid || null,
                    "pageCid": null
                });
                const cid = (await this.subplebbit.ipfsClient.add(JSON.stringify(sortedPostsPage))).path;
                sortedPostsPage.setPageCid(cid);
                sortedPosts[i] = sortedPostsPage;
            }


            resolve([sortedPosts[0], sortedPosts[0].pageCid]);
        });
    }

    async #sortPostsByHot() {
        return new Promise(async (resolve, reject) => {

            resolve([]);
        });
    }

    async calculateSortedPosts() {
        const [sortedPostsHot, sortedPostsHotCid] = await this.#sortPostsByHot();
        const [sortedPostsNew, sortedPostsNewCid] = await this.#sortPostsByNew();
        const sortedPosts = {[SORTED_COMMENTS_TYPES.HOT]: sortedPostsHot};
        const sortedPostsCids = {
            [SORTED_COMMENTS_TYPES.HOT]: sortedPostsHotCid,
            [SORTED_COMMENTS_TYPES.NEW]: sortedPostsNewCid
        };
        return [sortedPosts, sortedPostsCids];
    }
}