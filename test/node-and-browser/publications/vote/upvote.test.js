const Plebbit = require("../../../../dist/node");
const { expect } = require("chai");
const signers = require("../../../fixtures/signers");
const {
    generateMockVote,
    publishRandomPost,
    publishRandomReply,
    publishWithExpectedResult
} = require("../../../../dist/node/test/test-util");
const { timestamp } = require("../../../../dist/node/util");
const { mockPlebbit } = require("../../../../dist/node/test/test-util");
const lodash = require("lodash");
const { default: waitUntil } = require("async-wait-until");

const subplebbitAddress = signers[0].address;

const previousVotes = [];

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("Test upvote", async () => {
    let plebbit, postToVote, replyToVote, signer;

    before(async () => {
        plebbit = await mockPlebbit();
        signer = await plebbit.createSigner();
        postToVote = await publishRandomPost(subplebbitAddress, plebbit, { signer }, false);
        replyToVote = await publishRandomReply(postToVote, plebbit, { signer }, false);
        await Promise.all([postToVote.update(), replyToVote.update()]);
        await waitUntil(() => typeof postToVote.updatedAt === "number" && typeof replyToVote.updatedAt === "number", {});
    });

    after(async () => {
        await postToVote.stop();
        await replyToVote.stop();
    });

    it(`(vote: Vote) === plebbit.createVote(JSON.parse(JSON.stringify(vote)))`, async () => {
        const vote = await generateMockVote(postToVote, 1, plebbit, lodash.sample(signers));
        const voteFromStringifiedVote = await plebbit.createVote(JSON.parse(JSON.stringify(vote)));
        expect(JSON.stringify(vote)).to.equal(JSON.stringify(voteFromStringifiedVote));
    });

    it("Can upvote a post", async () => {
        const originalUpvote = lodash.clone(postToVote.upvoteCount);
        const vote = await generateMockVote(postToVote, 1, plebbit);
        await publishWithExpectedResult(vote, true);
        await waitUntil(() => postToVote.upvoteCount === originalUpvote + 1, { timeout: 300000 });

        expect(postToVote.upvoteCount).to.be.equal(originalUpvote + 1);
        expect(postToVote.downvoteCount).to.be.equal(0);
        expect(postToVote.author.subplebbit.replyScore).to.equal(0);
        expect(postToVote.author.subplebbit.postScore).to.equal(1);
        expect(postToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);
        previousVotes.push(vote);
    });

    it(`Can upvote a reply`, async () => {
        const originalUpvote = lodash.clone(replyToVote.downvoteCount);
        const vote = await generateMockVote(replyToVote, 1, plebbit);
        await publishWithExpectedResult(vote, true);
        await waitUntil(() => replyToVote.upvoteCount === originalUpvote + 1, { timeout: 200000 });
        expect(replyToVote.upvoteCount).to.equal(originalUpvote + 1);
        expect(replyToVote.downvoteCount).to.equal(0);
        expect(replyToVote.author.subplebbit.replyScore).to.equal(1);
        expect(replyToVote.author.subplebbit.postScore).to.equal(1);
        expect(replyToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);

        previousVotes.push(vote);
    });

    it("Can change post upvote to downvote", async () => {
        const originalUpvote = lodash.clone(postToVote.upvoteCount);
        const originalDownvote = lodash.clone(postToVote.downvoteCount);
        const vote = await plebbit.createVote({
            ...previousVotes[0].toJSON(),
            signer: previousVotes[0].signer,
            vote: -1
        });
        await publishWithExpectedResult(vote, true);
        await waitUntil(() => postToVote.upvoteCount === originalUpvote - 1, { timeout: 300000 });

        expect(postToVote.upvoteCount).to.equal(originalUpvote - 1);
        expect(postToVote.downvoteCount).to.equal(originalDownvote + 1);
        expect(postToVote.author.subplebbit.postScore).to.equal(-1);
        expect(postToVote.author.subplebbit.replyScore).to.equal(1);
        expect(postToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);
    });

    it("Can change reply upvote to downvote", async () => {
        const originalUpvote = lodash.clone(replyToVote.upvoteCount);
        const originalDownvote = lodash.clone(replyToVote.downvoteCount);
        const vote = await plebbit.createVote({
            ...previousVotes[1].toJSON(),
            signer: previousVotes[1].signer,
            vote: -1
        });
        await publishWithExpectedResult(vote, true);
        await waitUntil(() => replyToVote.upvoteCount === originalUpvote - 1, { timeout: 200000 });

        expect(replyToVote.upvoteCount).to.equal(originalUpvote - 1);
        expect(replyToVote.downvoteCount).to.equal(originalDownvote + 1);
        expect(replyToVote.author.subplebbit.postScore).to.equal(-1);
        expect(replyToVote.author.subplebbit.replyScore).to.equal(-1);
        expect(replyToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);
    });

    it("Does not throw an error when vote is duplicated", async () => {
        const vote = await plebbit.createVote({
            ...previousVotes[0].toJSON(),
            signer: previousVotes[0].signer,
            timestamp: timestamp()
        });
        await publishWithExpectedResult(vote, true);
    });
});
