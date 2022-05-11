import {
    controversialScore,
    hotScore, newScore, oldScore,
    TIMEFRAMES_TO_SECONDS,
    topScore,
    unsubscribeAllPubsubTopics
} from "../src/Util.js";
import {
    generateMockComment,
    generateMockPostWithRandomTimestamp,
    generateMockVote,
    loadAllPagesThroughSortedComments
} from "./MockUtil.js";
import Plebbit from "../src/index.js";
import {IPFS_CLIENT_CONFIGS, TEST_PAGES_SUBPLEBBIT_ADDRESS} from "../secrets.js";
import assert from "assert";
import Debug from "debug";
import {POSTS_SORT_TYPES, REPLIES_SORT_TYPES} from "../src/SortHandler.js";

const debug = Debug("plebbit-js:test-Pages");


const serverPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[0]});
const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});
const subplebbit = await serverPlebbit.createSubplebbit({
    "address":
    TEST_PAGES_SUBPLEBBIT_ADDRESS
});
await subplebbit.update();

const testSorting = async (sort, parentComment) => {
    return new Promise(async (resolve, reject) => {

        let comments = [];
        for (let i = 0; i < 1; i++)
            comments.push(parentComment ? await generateMockComment(parentComment, clientPlebbit) : await generateMockPostWithRandomTimestamp(subplebbit.address, clientPlebbit));


        comments = await Promise.all(comments.map(async (comment, i) => {
            const publishedComment = (await subplebbit._addPublicationToDb(comment)).publication;
            debug(`Comment ${i} has been published`);
            return clientPlebbit.getComment(publishedComment.cid);
        }));
        let votes = [];
        for (let i = 0; i < comments.length; i++)
            for (let j = 0; j < 5; j++)
                votes.push(await generateMockVote(comments[i], Math.random() > 0.5 ? 1 : -1, clientPlebbit));
        await Promise.all(votes.map(async (vote, i) => {
            await subplebbit._addPublicationToDb(vote);
            debug(`Vote #${i} of ${vote.vote} has been published under comment ${vote.commentCid}`);
        }));

        debug(`For sort ${sort.type}, added ${comments.length} comments and ${votes.length} random votes for each comment`);

        const sortTypes = Object.values(parentComment ? REPLIES_SORT_TYPES : POSTS_SORT_TYPES).filter(sortType => sortType.type.includes(sort.type));


        subplebbit.once("update", async (updatedSubplebbit) => {
            if (parentComment) {
                await parentComment.update();
                parentComment.stop();
                debug(`Updated parent comment`);
                assert.equal(Boolean(parentComment.replies), true, `Parent comment should at least have ${comments.length} replies`);
            }
            for (let i = 0; i < sortTypes.length; i++) {
                const sortType = sortTypes[i];
                debug(`Testing sort ${sortType.type}`);
                const pages = parentComment ? parentComment.replies : updatedSubplebbit.posts;
                const alreadySortedComments = await loadAllPagesThroughSortedComments(pages.pageCids[sortType.type], pages);
                if (alreadySortedComments.length < comments.length)
                    assert.fail(`Failed to load comments from pages`);
                // TODO load all posts from linkedlist and make sure both linkedlist and alreadySortedComments contain same comments
                debug(`There are ${alreadySortedComments.length} comments under ${sortType.type}. Will test them`);

                for (let j = 0; j < alreadySortedComments.length - 1; j++) {
                    // Check if timestamp is within [subplebbit.updatedAt - timeframe, subplebbit.updatedAt]
                    if (sortTypes.length > 1) {
                        // If sort types are more than 1 that means this particular sort type has timeframes
                        const sortStart = updatedSubplebbit.updatedAt - Object.values(TIMEFRAMES_TO_SECONDS)[i];
                        if (alreadySortedComments[j].timestamp < sortStart || alreadySortedComments[j].timestamp > updatedSubplebbit.updatedAt)
                            assert.fail(`${sortType.type} sort includes posts from different timeframes`);
                        if (alreadySortedComments[j + 1].timestamp < sortStart || alreadySortedComments[j + 1].timestamp > updatedSubplebbit.updatedAt)
                            assert.fail(`${sortType.type} sort includes posts from different timeframes`);
                    }

                    const scoreA = sort.scoreFunction(alreadySortedComments[j]);
                    const scoreB = sort.scoreFunction(alreadySortedComments[j + 1]);
                    if (scoreB > scoreA)
                        assert.fail(`Comments are not sorted by ${sort.type} score`);
                }
                debug(`Passed tests for sort ${sortType.type}`);
            }
            debug(`Passed tests for sort ${sort.type}`);
            resolve();

        });
    });

}

const testSortingComments = async (sort) => {
    const post = await clientPlebbit.getComment(subplebbit.latestPostCid);
    await testSorting(sort, post);
}

const postSortObjects = [
    {"type": "new", "scoreFunction": newScore},
    {
        "type": "top", "scoreFunction": topScore,
    }, {
        "type": "controversial", "scoreFunction": controversialScore
    }, {
        "type": "hot", "scoreFunction": hotScore
    },];

const repliesSortObjects = [...postSortObjects, {"type": "old", "scoreFunction": oldScore}];

describe("Test Pages API (for sorting)", async () => {

    before(async () => await unsubscribeAllPubsubTopics([clientPlebbit.ipfsClient, serverPlebbit.ipfsClient]));
    before(async () => await subplebbit.start());
    // Stop publishing once we're done with tests
    after(async () => await subplebbit.stopPublishing());

    postSortObjects.map(sort => it(`${sort.type} pages are sorted correctly`, async () => await testSorting(sort)));
    repliesSortObjects.map(sort => it(`${sort.type} pages under a comment are sorted correctly`, async () => await testSortingComments(sort)));

});