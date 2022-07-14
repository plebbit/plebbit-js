const {
    controversialScore,
    hotScore,
    newScore,
    oldScore,
    TIMEFRAMES_TO_SECONDS,
    topScore,
    getDebugLevels,
    timestamp
} = require("../../dist/node/util");
const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const debugs = getDebugLevels("pages.test.js");
const { POSTS_SORT_TYPES, REPLIES_SORT_TYPES } = require("../../dist/node/sort-handler");
const signers = require("../fixtures/signers");
const { loadAllPages } = require("../../dist/node/test-util");

let plebbit, subplebbit;
let posts;
const subplebbitAddress = signers[0].address;

const updateInterval = 100;

const mockPlebbit = async () => {
    const plebbit = await Plebbit({
        ipfsHttpClientOptions: "http://localhost:5001/api/v0",
        pubsubHttpClientOptions: `http://localhost:5002/api/v0`
    });
    plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
        if (authorAddress === "plebbit.eth") return signers[6].address;
        else if (authorAddress === "testgibbreish.eth") throw new Error(`Domain (${authorAddress}) has no plebbit-author-address`);
        return authorAddress;
    };
    return plebbit;
};

const testSorting = async (sort, shouldTestCommentReplies) => {
    // if shouldTestCommentReplies = true, we will test comment.replies. Else test subplebbit.posts
    // We use a plebbit for each comment/vote so that when we unsubscribe from a pubsub it doesn't affect other publications

    const testListOfSortedComments = (alreadySortedComments, currentSortName) => {
        debugs.DEBUG(`Testing sort ${currentSortName}. There are ${alreadySortedComments.length} comments under ${currentSortName}`);

        const currentTimeframe = Object.keys(TIMEFRAMES_TO_SECONDS).filter((timeframe) =>
            currentSortName.toLowerCase().includes(timeframe.toLowerCase())
        )[0];
        debugs.DEBUG(`Current sort ${currentSortName} current timeframe = ${currentTimeframe}`);
        for (let j = 0; j < alreadySortedComments.length - 1; j++) {
            // Check if timestamp is within [timestamp() - timeframe, subplebbit.updatedAt]
            if (currentTimeframe) {
                // If sort types are more than 1 that means this particular sort type has timeframes
                const syncIntervalSeconds = 5 * 60;

                const sortStart = subplebbit.updatedAt - TIMEFRAMES_TO_SECONDS[currentTimeframe] - syncIntervalSeconds; // Should probably add extra buffer here
                const errMsg = `${currentSortName} sort includes posts from different timeframes`;
                expect(alreadySortedComments[j].timestamp).to.be.greaterThanOrEqual(sortStart, errMsg);
                expect(alreadySortedComments[j].timestamp).to.be.lessThanOrEqual(subplebbit.updatedAt, errMsg);
                expect(alreadySortedComments[j + 1].timestamp).to.be.greaterThanOrEqual(sortStart, errMsg);
                expect(alreadySortedComments[j + 1].timestamp).to.be.lessThanOrEqual(subplebbit.updatedAt, errMsg);
            }

            const scoreA = sort.scoreFunction(alreadySortedComments[j]);
            const scoreB = sort.scoreFunction(alreadySortedComments[j + 1]);
            expect(scoreA).to.be.greaterThanOrEqual(scoreB);
        }
        debugs.DEBUG(`Passed tests for current sort ${currentSortName}`);
    };

    const sortNames = Object.keys(shouldTestCommentReplies ? REPLIES_SORT_TYPES : POSTS_SORT_TYPES).filter((sortName) =>
        sortName.includes(sort.type)
    );

    await subplebbit.update();
    await subplebbit.stop();

    if (shouldTestCommentReplies) {
        await Promise.all(
            posts.map(async (currentPost) => {
                await currentPost.update();
                await currentPost.stop();
                if (currentPost.replyCount === 0) return undefined;
                await Promise.all(
                    sortNames.map(async (currentSortName) => {
                        const alreadySortedComments = await loadAllPages(
                            currentPost.replies.pageCids[currentSortName],
                            currentPost.replies
                        );
                        if (sortNames.length === 1) expect(currentPost.replyCount).to.equal(alreadySortedComments.length); // If sort with no timeframe then sortedComments should equal post.replyCount
                        return testListOfSortedComments(alreadySortedComments, currentSortName);
                    })
                );
            })
        );
    } else
        await Promise.all(
            sortNames.map(async (currentSortName) => {
                const alreadySortedComments = await loadAllPages(subplebbit.posts.pageCids[currentSortName], subplebbit.posts);
                return testListOfSortedComments(alreadySortedComments, currentSortName);
            })
        );

    debugs.DEBUG(`Passed all tests for sort ${sort.type}`);
};

const postSortObjects = [
    { type: "new", scoreFunction: newScore },
    {
        type: "top",
        scoreFunction: topScore
    },
    {
        type: "controversial",
        scoreFunction: controversialScore
    },
    {
        type: "hot",
        scoreFunction: hotScore
    }
];

const repliesSortObjects = [...postSortObjects, { type: "old", scoreFunction: oldScore }];

describe("Test pages sorting", async () => {
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.getSubplebbit(subplebbitAddress);

        await subplebbit.update(updateInterval);
        await subplebbit.stop();
        posts = await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
    });

    describe("subplebbit.posts", async () => {
        postSortObjects.map((sort) => it(`${sort.type} pages are sorted correctly`, async () => await testSorting(sort, false)));
    });

    describe("comment.replies", async () => {
        after(async () => {
            await subplebbit.stop();
        });
        repliesSortObjects.map((sort) =>
            it(`${sort.type} pages under a comment are sorted correctly`, async () => await testSorting(sort, true))
        );
    });
});
