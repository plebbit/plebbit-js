import { expect } from "chai";
import signers from "../../../fixtures/signers.js";
import {
    generateMockVote,
    publishRandomPost,
    publishRandomReply,
    publishWithExpectedResult,
    mockRemotePlebbit,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { timestamp } from "../../../../dist/node/util.js";
import lodash from "lodash";

const subplebbitAddress = signers[0].address;

const previousVotes = [];

describe("Test upvote", async () => {
    let plebbit, postToVote, replyToVote, signer;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        signer = await plebbit.createSigner();
        postToVote = await publishRandomPost(subplebbitAddress, plebbit, { signer }, false);
        replyToVote = await publishRandomReply(postToVote, plebbit, { signer }, false);
        await Promise.all([postToVote.update(), replyToVote.update()]);
        await resolveWhenConditionIsTrue(postToVote, () => typeof postToVote.updatedAt === "number");
        await resolveWhenConditionIsTrue(replyToVote, () => typeof replyToVote.updatedAt === "number");
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
        await resolveWhenConditionIsTrue(postToVote, () => postToVote.upvoteCount === originalUpvote + 1);
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
        await resolveWhenConditionIsTrue(replyToVote, () => replyToVote.upvoteCount === originalUpvote + 1);
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
            signature: undefined,
            signer: previousVotes[0].signer,
            vote: -1
        });
        await publishWithExpectedResult(vote, true);
        await resolveWhenConditionIsTrue(postToVote, () => postToVote.upvoteCount === originalUpvote - 1);

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
            signature: undefined,
            signer: previousVotes[1].signer,
            vote: -1
        });
        await publishWithExpectedResult(vote, true);
        await resolveWhenConditionIsTrue(replyToVote, () => replyToVote.upvoteCount === originalUpvote - 1);

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
            signature: undefined,
            timestamp: timestamp()
        });
        await publishWithExpectedResult(vote, true);
    });
});
