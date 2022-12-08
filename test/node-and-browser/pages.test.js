const { controversialScore, hotScore, newScore, oldScore, TIMEFRAMES_TO_SECONDS, topScore } = require("../../dist/node/util");
const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const { POSTS_SORT_TYPES, REPLIES_SORT_TYPES } = require("../../dist/node/sort-handler");
const signers = require("../fixtures/signers");
const { loadAllPages } = require("../../dist/node/test/test-util");
const { mockPlebbit } = require("../../dist/node/test/test-util");

let plebbit, subplebbit;
let posts;
const subplebbitAddress = signers.rawSigners[0].address;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const testCommentFields = (comment) => {
    expect(comment.author.address).to.be.a("string");
    expect(comment.cid).to.be.a("string");
    if (!comment.link) expect(comment.content).to.be.a("string");
    expect(comment.depth).to.be.a("number");

    expect(comment.ipnsName).to.be.a("string");
    if (comment.depth === 0) {
        // A post
        expect(comment.postCid).to.equal(comment.cid);
        expect(comment.title).to.be.a("string");
    }
    if (comment.depth === 1) {
        // Comment (reply)
        expect(comment.postCid).to.equal(comment.parentCid);
        expect(comment.title).to.be.undefined;
    }
    expect(comment.protocolVersion).to.be.a("string");
    expect(comment.replyCount).to.be.a("number");
    if (comment.replyCount > 0) {
        expect(comment.replies.pages.topAll.comments.length).to.equal(comment.replyCount);
        expect(comment.replies.pageCids).to.have.keys(["controversialAll", "new", "old", "topAll"]);
    }

    expect(comment.signature).to.be.a("object");
    expect(comment.subplebbitAddress).to.be.a("string");
    expect(comment.timestamp).to.be.a("number");

    // Verify CommentUpdate fields
    expect(comment.updatedAt).to.be.a("number");
    expect(comment.author.subplebbit).to.be.a("object");
    expect(comment.author.subplebbit.postScore).to.be.a("number");
    expect(comment.author.subplebbit.replyScore).to.be.a("number");
    expect(comment.author.subplebbit.lastCommentCid).to.be.a("string");

    expect(comment.downvoteCount).to.be.a("number");
    expect(comment.upvoteCount).to.be.a("number");
    expect(comment.original.author.address).to.be.a("string");
    if (!comment.link) expect(comment.original.content).to.be.a("string");
    // TODO verify flair here when implemented

    if (comment.authorEdit) {
        expect(comment.author.address).to.equal(comment.author.address);
        expect(comment.authorEdit.authorAddress).to.be.undefined; // Shouldn't be included (extra from db)
        expect(comment.authorEdit.challengeRequestId).to.be.undefined;
        expect(comment.authorEdit.commentCid).to.equal(comment.cid);
        expect(comment.authorEdit.signature).to.be.a("object");
        expect(comment.authorEdit.subplebbitAddress).to.equal(comment.subplebbitAddress);
        expect(comment.timestamp).to.be.a("number");
    }

    // Props that shouldn't be there
    expect(comment.ipnsKeyName).to.be.undefined;
    expect(comment.challengeRequestId).to.be.undefined;
};

const testSorting = async (sort, shouldTestCommentReplies) => {
    // if shouldTestCommentReplies = true, we will test comment.replies. Else test subplebbit.posts
    // We use a plebbit for each comment/vote so that when we unsubscribe from a pubsub it doesn't affect other publications

    const testListOfSortedComments = (alreadySortedComments, currentSortName) => {
        console.log(`Testing sort ${currentSortName}. There are ${alreadySortedComments.length} comments under ${currentSortName}`);

        const currentTimeframe = Object.keys(TIMEFRAMES_TO_SECONDS).filter((timeframe) =>
            currentSortName.toLowerCase().includes(timeframe.toLowerCase())
        )[0];
        console.log(`Current sort ${currentSortName} current timeframe = ${currentTimeframe}`);
        for (let j = 0; j < alreadySortedComments.length - 1; j++) {
            // Check if timestamp is within [timestamp() - timeframe, subplebbit.updatedAt]
            testCommentFields(alreadySortedComments[j]);
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
        console.log(`Passed tests for current sort ${currentSortName}`);
    };

    const sortNames = Object.keys(shouldTestCommentReplies ? REPLIES_SORT_TYPES : POSTS_SORT_TYPES).filter((sortName) =>
        sortName.includes(sort.type)
    );

    if (shouldTestCommentReplies) {
        await Promise.all(
            posts.map(async (currentPost) => {
                if (currentPost.replyCount === 0) return undefined;
                await Promise.all(
                    sortNames.map(async (currentSortName) => {
                        const alreadySortedComments =
                            (currentPost.replies.pageCids[currentSortName] &&
                                (await loadAllPages(currentPost.replies.pageCids[currentSortName], currentPost.replies))) ||
                            [];
                        if (sortNames.length === 1) expect(currentPost.replyCount).to.equal(alreadySortedComments.length); // If sort with no timeframe then sortedComments should equal post.replyCount
                        return testListOfSortedComments(alreadySortedComments, currentSortName);
                    })
                );
            })
        );
    } else
        await Promise.all(
            sortNames.map(async (currentSortName) => {
                const alreadySortedComments =
                    (subplebbit.posts.pageCids[currentSortName] &&
                        (await loadAllPages(subplebbit.posts.pageCids[currentSortName], subplebbit.posts))) ||
                    [];
                return testListOfSortedComments(alreadySortedComments, currentSortName);
            })
        );

    console.log(`Passed all tests for sort ${sort.type}`);
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
        posts = await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
    });

    describe("subplebbit.posts", async () => {
        postSortObjects.map((sort) => it(`${sort.type} pages are sorted correctly`, async () => await testSorting(sort, false)));
    });

    describe("comment.replies", async () => {
        repliesSortObjects.map((sort) =>
            it(`${sort.type} pages under a comment are sorted correctly`, async () => await testSorting(sort, true))
        );
    });
});
