const {
    controversialScore,
    hotScore,
    newScore,
    oldScore,
    TIMEFRAMES_TO_SECONDS,
    topScore,
    waitTillPublicationsArePublished
} = require("../../dist/node/util");
const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const debug = require("debug")("plebbit-js:pages.test");
const { POSTS_SORT_TYPES, REPLIES_SORT_TYPES } = require("../../dist/node/sort-handler");
const signers = require("../fixtures/signers");
const { generateMockComment, generateMockPostWithRandomTimestamp, generateMockVote, loadAllPages } = require("../../dist/node/test-util");

let plebbit;
const subplebbitAddress = signers[0].address;

const numOfCommentsToPublish = 1;
const votesPerCommentToPublish = 4;
expect(numOfCommentsToPublish * votesPerCommentToPublish).to.be.lessThan(6); // As of now we can only publish 6 publications at once due to limitation in pubsub for browser

const updateInterval = 100;

const testSorting = async (sort, parentComment) => {
    return new Promise(async (resolve, reject) => {
        // We use a plebbit for each comment/vote so that when we unsubscribe from a pubsub it doesn't affect other publications
        const commentPlebbits = await Promise.all(
            new Array(numOfCommentsToPublish).fill(null).map(async () =>
                Plebbit({
                    ipfsHttpClientOptions: "http://localhost:5001/api/v0",
                    pubsubHttpClientOptions: `http://localhost:5002/api/v0`
                })
            )
        );
        let comments = [];
        for (let i = 0; i < numOfCommentsToPublish; i++)
            comments.push(
                parentComment
                    ? await generateMockComment(parentComment, commentPlebbits[i])
                    : await generateMockPostWithRandomTimestamp(subplebbitAddress, commentPlebbits[i])
            );

        const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        await subplebbit.update(updateInterval);

        await Promise.all(comments.map(async (comment) => comment.publish()));
        await waitTillPublicationsArePublished(comments);
        debug(`Published ${comments.length} comments for testing sort ${sort.type}`);
        expect(comments.every((comment) => Boolean(comment.cid))).to.be.true;
        const votes = [];
        const votePlebbits = await Promise.all(
            new Array(numOfCommentsToPublish * votesPerCommentToPublish).fill(null).map(async () => {
                const plebbit = await Plebbit({
                    ipfsHttpClientOptions: "http://localhost:5001/api/v0",
                    pubsubHttpClientOptions: `http://localhost:5002/api/v0`
                });
                plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
                    if (authorAddress === "plebbit.eth") return signers[6].address;
                    else if (authorAddress === "testgibbreish.eth")
                        throw new Error(`Domain (${authorAddress}) has no plebbit-author-address`);
                    return authorAddress;
                };
                return plebbit;
            })
        );
        for (let i = 0; i < comments.length; i++)
            for (let j = 0; j < votesPerCommentToPublish; j++)
                votes.push(await generateMockVote(comments[i], Math.random() > 0.5 ? 1 : -1, votePlebbits[votes.length]));
        await Promise.all(votes.map(async (vote) => vote.publish()));
        await waitTillPublicationsArePublished(votes);

        debug(`For sort ${sort.type}, added ${comments.length} comments and ${votes.length} random votes for each comment`);

        const sortTypes = Object.values(parentComment ? REPLIES_SORT_TYPES : POSTS_SORT_TYPES).filter((sortType) =>
            sortType.type.includes(sort.type)
        );

        subplebbit.once("update", async (updatedSubplebbit) => {
            if (parentComment) {
                await parentComment.update(updateInterval);
                parentComment.stop();
                expect(parentComment.replies).to.be.a("object", `Parent comment should at least have ${comments.length} replies`);
            }
            for (let i = 0; i < sortTypes.length; i++) {
                const sortType = sortTypes[i];
                debug(`Testing sort ${sortType.type}`);
                const pages = parentComment ? parentComment.replies : updatedSubplebbit.posts;
                const alreadySortedComments = await loadAllPages(pages.pageCids[sortType.type], pages);
                expect(alreadySortedComments.length).to.be.greaterThanOrEqual(
                    comments.length,
                    `Pages loaded from ${
                        parentComment ? parentComment.cid : "subplebbit"
                    } should be more or same as comments inserted at the beginning of this test`
                );
                // TODO load all posts from linkedlist and make sure both linkedlist and alreadySortedComments contain same comments
                debug(`There are ${alreadySortedComments.length} comments under ${sortType.type}. Will test them`);

                for (let j = 0; j < alreadySortedComments.length - 1; j++) {
                    // Check if timestamp is within [subplebbit.updatedAt - timeframe, subplebbit.updatedAt]
                    if (sortTypes.length > 1) {
                        // If sort types are more than 1 that means this particular sort type has timeframes
                        const sortStart = updatedSubplebbit.updatedAt - Object.values(TIMEFRAMES_TO_SECONDS)[i];
                        const errMsg = `${sortType.type} sort includes posts from different timeframes`;
                        expect(alreadySortedComments[j].timestamp).to.be.greaterThanOrEqual(sortStart, errMsg);
                        expect(alreadySortedComments[j].timestamp).to.be.lessThanOrEqual(updatedSubplebbit.updatedAt, errMsg);
                        expect(alreadySortedComments[j + 1].timestamp).to.be.greaterThanOrEqual(sortStart, errMsg);
                        expect(alreadySortedComments[j + 1].timestamp).to.be.lessThanOrEqual(updatedSubplebbit.updatedAt, errMsg);
                    }

                    const scoreA = sort.scoreFunction(alreadySortedComments[j]);
                    const scoreB = sort.scoreFunction(alreadySortedComments[j + 1]);
                    expect(scoreA).to.be.greaterThanOrEqual(scoreB);
                }
                debug(`Passed tests for sort ${sortType.type}`);
            }
            debug(`Passed tests for sort ${sort.type}`);
            resolve();
        });
    });
};

const testSortingComments = async (sort) => {
    const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
    await subplebbit.update(updateInterval);
    await subplebbit.stop();
    const post = await plebbit.getComment(subplebbit.latestPostCid);
    await testSorting(sort, post);
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

before(async () => {
    plebbit = await Plebbit({
        ipfsHttpClientOptions: "http://localhost:5001/api/v0",
        pubsubHttpClientOptions: `http://localhost:5002/api/v0`
    });
    plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
        if (authorAddress === "plebbit.eth") return signers[6].address;
        else if (authorAddress === "testgibbreish.eth") throw new Error(`Domain (${authorAddress}) has no plebbit-author-address`);
        return authorAddress;
    };
});

describe("subplebbit.posts", async () => {
    postSortObjects.map((sort) => it(`${sort.type} pages are sorted correctly`, async () => await testSorting(sort)));
});

describe("comment.replies", async () => {
    repliesSortObjects.map((sort) =>
        it(`${sort.type} pages under a comment are sorted correctly`, async () => await testSortingComments(sort))
    );
});
