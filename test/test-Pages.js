import {TIMEFRAMES_TO_SECONDS, timestamp, unsubscribeAllPubsubTopics} from "../src/Util.js";
import {generateMockPostWithRandomTimestamp, generateMockVote, loadAllPagesThroughSortedComments} from "./MockUtil.js";
import {Plebbit} from "../src/index.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL, TEST_PAGES_SUBPLEBBIT_ADDRESS} from "../secrets.js";
import {SORTED_COMMENTS_TYPES} from "../src/SortHandler.js";
import assert from "assert";

const plebbit = await Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});
const subplebbit = await plebbit.createSubplebbit({
    "subplebbitAddress":
    TEST_PAGES_SUBPLEBBIT_ADDRESS
});
const startTime = timestamp();

describe("Test Pages API (for sorting)", async () => {

    before(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));
    before(async () => await subplebbit.startPublishing());
    // Stop publishing once we're done with tests
    after(async () => await subplebbit.stopPublishing());

    it("Top pages are sorted correctly", async () => {
        let posts = [];
        for (let i = 0; i < 1; i++)
            posts.push(await generateMockPostWithRandomTimestamp(subplebbit));

        posts = await Promise.all(posts.map(async post => {
            const publishedPost = (await subplebbit._addPublicationToDb(post)).publication;
            return plebbit.getPostOrComment(publishedPost.commentCid);
        }));
        let votes = [];
        for (let i = 0; i < posts.length; i++)
            for (let j = 0; j < 5; j++)
                votes.push(await generateMockVote(posts[i], Math.random() > 0.5 ? 1 : -1, subplebbit));
        await Promise.all(votes.map(async vote => subplebbit._addPublicationToDb(vote)));


        await subplebbit.update();

        const sortTopTypes = Object.values(SORTED_COMMENTS_TYPES).filter(type => type.includes("top"));

        for (let i = 0; i < sortTopTypes.length; i++) {
            const sortType = sortTopTypes[i];
            const alreadySortedPosts = await loadAllPagesThroughSortedComments(subplebbit.sortedPostsCids[sortType], plebbit);
            const sortStart = subplebbit.updatedAt - Object.values(TIMEFRAMES_TO_SECONDS)[i];
            for (let j = 0; j < alreadySortedPosts.length - 1; j++) {
                // Check if timestamp is within [subplebbit.updatedAt - timeframe, subplebbit.updatedAt]
                if (alreadySortedPosts[j].timestamp < sortStart || alreadySortedPosts[j].timestamp > subplebbit.updatedAt)
                    assert.fail("Top sort includes posts from different timeframes");
                if (alreadySortedPosts[j + 1].timestamp < sortStart || alreadySortedPosts[j + 1].timestamp > subplebbit.updatedAt)
                    assert.fail("Top sort includes posts from different timeframes");

                const scoreA = alreadySortedPosts[j].upvoteCount - alreadySortedPosts[j].downvoteCount;
                const scoreB = alreadySortedPosts[j + 1].upvoteCount - alreadySortedPosts[j + 1].downvoteCount;
                if (scoreB > scoreA)
                    assert.fail("Comments are not sorted by top score");
            }

        }


    });

});