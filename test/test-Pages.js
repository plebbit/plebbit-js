import {
    controversialScore,
    hotScore, newScore,
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
import {Plebbit} from "../src/index.js";
import {IPFS_CLIENT_CONFIGS, TEST_PAGES_SUBPLEBBIT_ADDRESS} from "../secrets.js";
import {SORTED_COMMENTS_TYPES} from "../src/SortHandler.js";
import assert from "assert";
import Debug from "debug";

const debug = Debug("plebbit-js:test-Pages");


const serverPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[0]});
const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});
const subplebbit = await serverPlebbit.createSubplebbit({
    "subplebbitAddress":
    TEST_PAGES_SUBPLEBBIT_ADDRESS
});
await subplebbit.update();

const testSorting = async (sort, comments) => {
    return new Promise(async (resolve, reject) => {
        let parentComment; // This in case we wanted to test sorting under a post/comment
        if (!comments) {
            comments = [];
            for (let i = 0; i < 5; i++)
                comments.push(await generateMockPostWithRandomTimestamp(subplebbit.subplebbitAddress, clientPlebbit));
        } else
            parentComment = await clientPlebbit.getPostOrComment(comments[0].parentCid);


        comments = await Promise.all(comments.map(async (comment, i) => {
            const publishedComment = (await subplebbit._addPublicationToDb(comment)).publication;
            debug(`Comment ${i} has been published`);
            return clientPlebbit.getPostOrComment(publishedComment.commentCid);
        }));
        let votes = [];
        for (let i = 0; i < comments.length; i++)
            for (let j = 0; j < 5; j++)
                votes.push(await generateMockVote(comments[i], Math.random() > 0.5 ? 1 : -1, subplebbit.subplebbitAddress, clientPlebbit));
        await Promise.all(votes.map(async (vote, i) => {
            await subplebbit._addPublicationToDb(vote);
            debug(`Vote #${i} of ${vote.vote} has been published under comment ${vote.commentCid}`);
        }));

        debug(`For sort ${sort.type}, added ${comments.length} comments and ${votes.length} random votes for each comment`);

        const sortTypes = Object.values(SORTED_COMMENTS_TYPES).filter(type => type.includes(sort.type));


        subplebbit.once("update", async (updatedSubplebbit) => {
            if (parentComment) {
                await parentComment.update();
                parentComment.stop();
                debug(`Updated parent comment`);
            }
            for (let i = 0; i < sortTypes.length; i++) {
                const sortType = sortTypes[i];
                debug(`Testing sort ${sortType}`);
                const alreadySortedComments = await loadAllPagesThroughSortedComments(parentComment ? parentComment.sortedRepliesCids[sortType] : updatedSubplebbit.sortedPostsCids[sortType], clientPlebbit);
                // TODO load all posts from linkedlist and make sure both linkedlist and alreadySortedComments contain same comments
                debug(`There are ${alreadySortedComments.length} comments under ${sortType}. Will test them`);

                for (let j = 0; j < alreadySortedComments.length - 1; j++) {
                    // Check if timestamp is within [subplebbit.updatedAt - timeframe, subplebbit.updatedAt]
                    if (sortTypes.length > 1) {
                        // If sort types are more than 1 that means this particular sort type has timeframes
                        const sortStart = updatedSubplebbit.updatedAt - Object.values(TIMEFRAMES_TO_SECONDS)[i];
                        if (alreadySortedComments[j].timestamp < sortStart || alreadySortedComments[j].timestamp > updatedSubplebbit.updatedAt)
                            assert.fail(`${sortType} sort includes posts from different timeframes`);
                        if (alreadySortedComments[j + 1].timestamp < sortStart || alreadySortedComments[j + 1].timestamp > updatedSubplebbit.updatedAt)
                            assert.fail(`${sortType} sort includes posts from different timeframes`);
                    }

                    const scoreA = sort.scoreFunction(alreadySortedComments[j]);
                    const scoreB = sort.scoreFunction(alreadySortedComments[j + 1]);
                    if (scoreB > scoreA)
                        assert.fail(`Comments are not sorted by ${sort.type} score`);
                }
                debug(`Passed tests for sort ${sortType}`);
            }
            debug(`Passed tests for sort ${sort.type}`);
            resolve();

        });
    });

}

const testSortingComments = async (sort) => {
    const post = await clientPlebbit.getPostOrComment(subplebbit.latestPostCid);
    const comments = [];
    for (let i = 0; i < 5; i++)
        comments.push(await generateMockComment(post, subplebbit.subplebbitAddress, clientPlebbit));

    await testSorting(sort, comments);

}

const sortObjects = [
    {"type": "new", "scoreFunction": newScore},
    {
        "type": "top", "scoreFunction": topScore,
    }, {
        "type": "controversial", "scoreFunction": controversialScore
    }, {
        "type": "hot", "scoreFunction": hotScore
    }];

describe("Test Pages API (for sorting)", async () => {

    before(async () => await unsubscribeAllPubsubTopics([clientPlebbit.ipfsClient, serverPlebbit.ipfsClient]));
    before(async () => await subplebbit.startPublishing());
    // Stop publishing once we're done with tests
    after(async () => await subplebbit.stopPublishing());

    sortObjects.map(sort => it(`${sort.type} pages are sorted correctly`, async () => await testSorting(sort)));
    sortObjects.map(sort => it(`${sort.type} pages under a comment are sorted correctly`, async () => await testSortingComments(sort)));


});