import {round, TIMEFRAMES_TO_SECONDS, unsubscribeAllPubsubTopics} from "../src/Util.js";
import {generateMockPostWithRandomTimestamp, generateMockVote, loadAllPagesThroughSortedComments} from "./MockUtil.js";
import {Plebbit} from "../src/index.js";
import {IPFS_CLIENT_CONFIGS, TEST_PAGES_SUBPLEBBIT_ADDRESS} from "../secrets.js";
import {SORTED_COMMENTS_TYPES} from "../src/SortHandler.js";
import assert from "assert";

const serverPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[0]});
const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});
const subplebbit = await serverPlebbit.createSubplebbit({
    "subplebbitAddress":
    TEST_PAGES_SUBPLEBBIT_ADDRESS
});
await subplebbit.update();

const testSorting = async (scoreFunction, sortName) => {
    return new Promise(async (resolve, reject) => {
        let posts = [];
        for (let i = 0; i < 1; i++)
            posts.push(await generateMockPostWithRandomTimestamp(subplebbit.subplebbitAddress, clientPlebbit));

        posts = await Promise.all(posts.map(async post => {
            const publishedPost = (await subplebbit._addPublicationToDb(post)).publication;
            return clientPlebbit.getPostOrComment(publishedPost.commentCid);
        }));
        let votes = [];
        for (let i = 0; i < posts.length; i++)
            for (let j = 0; j < 5; j++)
                votes.push(await generateMockVote(posts[i], Math.random() > 0.5 ? 1 : -1, subplebbit.subplebbitAddress, clientPlebbit));
        await Promise.all(votes.map(async vote => subplebbit._addPublicationToDb(vote)));

        const sortTypes = Object.values(SORTED_COMMENTS_TYPES).filter(type => type.includes(sortName));


        subplebbit.once("update", async (updatedSubplebbit) => {
            for (let i = 0; i < sortTypes.length; i++) {
                const sortType = sortTypes[i];
                const alreadySortedPosts = await loadAllPagesThroughSortedComments(updatedSubplebbit.sortedPostsCids[sortType], clientPlebbit);
                const sortStart = updatedSubplebbit.updatedAt - Object.values(TIMEFRAMES_TO_SECONDS)[i];
                for (let j = 0; j < alreadySortedPosts.length - 1; j++) {
                    // Check if timestamp is within [subplebbit.updatedAt - timeframe, subplebbit.updatedAt]
                    if (alreadySortedPosts[j].timestamp < sortStart || alreadySortedPosts[j].timestamp > updatedSubplebbit.updatedAt)
                        assert.fail(`${sortName} sort includes posts from different timeframes`);
                    if (alreadySortedPosts[j + 1].timestamp < sortStart || alreadySortedPosts[j + 1].timestamp > updatedSubplebbit.updatedAt)
                        assert.fail(`${sortName} sort includes posts from different timeframes`);

                    const scoreA = scoreFunction(alreadySortedPosts[j]);
                    const scoreB = scoreFunction(alreadySortedPosts[j + 1]);
                    if (scoreB > scoreA)
                        assert.fail(`Comments are not sorted by ${sortName} score`);
                }

            }
            resolve();

        });
    });

}

describe("Test Pages API (for sorting)", async () => {

    before(async () => await unsubscribeAllPubsubTopics([clientPlebbit.ipfsClient, serverPlebbit.ipfsClient]));
    before(async () => await subplebbit.startPublishing());
    // Stop publishing once we're done with tests
    after(async () => await subplebbit.stopPublishing());

    it("Top pages are sorted correctly", async () => {
        const topScore = (comment) => comment.upvoteCount - comment.downvoteCount;
        await testSorting(topScore, "top");
    });

    it("Controversial pages are sorted correctly", async () => {

        const controversialScore = (comment) => {
            if (comment.downvoteCount <= 0 || comment.upvoteCount <= 0)
                return 0;
            const magnitude = comment.upvoteCount + comment.downvoteCount;
            const balance = comment.upvoteCount > comment.downvoteCount ? (parseFloat(comment.downvoteCount) / comment.upvoteCount) : (parseFloat(comment.upvoteCount) / comment.downvoteCount);
            return Math.pow(magnitude, balance);

        };
        await testSorting(controversialScore, "controversial");


    });

    it("Hot pages are sorted correctly", async () => {

        const hotScore = (comment) => {
            const score = comment.upvoteCount - comment.downvoteCount;
            const order = Math.log10(Math.max(score, 1));
            const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
            const seconds = comment.timestamp - 1134028003;
            return round(sign * order + seconds / 45000, 7);

        };
        await testSorting(hotScore, "hot");
    });


});