import signers from "../../../fixtures/signers.js";
import {
    generateMockVote,
    publishRandomPost,
    publishRandomReply,
    publishWithExpectedResult,
    mockRemotePlebbit,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import * as remeda from "remeda";

import chai from "chai";
import { expect, assert } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

const subplebbitAddress = signers[0].address;

const previousVotes = [];
describe(`Test Downvote`, async () => {
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

    it("Can downvote a post", async () => {
        const originalDownvote = remeda.clone(postToVote.downvoteCount);
        const vote = await generateMockVote(postToVote, -1, plebbit);
        await publishWithExpectedResult(vote, true);

        await resolveWhenConditionIsTrue(postToVote, () => postToVote.downvoteCount === originalDownvote + 1);

        expect(postToVote.downvoteCount).to.equal(originalDownvote + 1);
        expect(postToVote.upvoteCount).to.equal(0);
        expect(postToVote.author.subplebbit.replyScore).to.equal(0);
        expect(postToVote.author.subplebbit.postScore).to.equal(-1);
        expect(postToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);
        previousVotes.push(vote);
    });

    it(`Can downvote a reply`, async () => {
        const originalDownvote = remeda.clone(replyToVote.downvoteCount);
        const vote = await generateMockVote(replyToVote, -1, plebbit);
        await publishWithExpectedResult(vote, true);

        await resolveWhenConditionIsTrue(replyToVote, () => replyToVote.downvoteCount === originalDownvote + 1);

        expect(replyToVote.downvoteCount).to.equal(originalDownvote + 1);
        expect(replyToVote.upvoteCount).to.equal(0);
        expect(replyToVote.author.subplebbit.replyScore).to.equal(-1);
        expect(replyToVote.author.subplebbit.postScore).to.equal(-1);
        expect(replyToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);

        previousVotes.push(vote);
    });

    it("Can change post downvote to upvote", async () => {
        const originalUpvote = remeda.clone(postToVote.upvoteCount);
        const originalDownvote = remeda.clone(postToVote.downvoteCount);
        const vote = await plebbit.createVote({
            ...remeda.pick(previousVotes[0], ["commentCid", "author", "signer", "subplebbitAddress"]),
            vote: 1
        });
        await publishWithExpectedResult(vote, true);

        await resolveWhenConditionIsTrue(postToVote, () => postToVote.upvoteCount === originalUpvote + 1);

        expect(postToVote.upvoteCount).to.equal(originalUpvote + 1);
        expect(postToVote.downvoteCount).to.equal(originalDownvote - 1);
        expect(postToVote.author.subplebbit.postScore).to.equal(1);
        expect(postToVote.author.subplebbit.replyScore).to.equal(-1);
        expect(postToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);
    });

    it("Can change reply downvote to upvote", async () => {
        const originalUpvote = remeda.clone(replyToVote.upvoteCount);
        const originalDownvote = remeda.clone(replyToVote.downvoteCount);
        const vote = await plebbit.createVote({
            ...remeda.pick(previousVotes[1], ["commentCid", "author", "signer", "subplebbitAddress"]),
            vote: 1
        });
        await publishWithExpectedResult(vote, true);

        await resolveWhenConditionIsTrue(replyToVote, () => replyToVote.upvoteCount === originalUpvote + 1);

        expect(replyToVote.upvoteCount).to.equal(originalUpvote + 1);
        expect(replyToVote.downvoteCount).to.equal(originalDownvote - 1);
        expect(replyToVote.author.subplebbit.postScore).to.equal(1);
        expect(replyToVote.author.subplebbit.replyScore).to.equal(1);
        expect(replyToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);
    });

    it("plebbit.createVote fails when commentCid is invalid ", async () => {
        await assert.isRejected(
            plebbit.createVote({
                ...remeda.pick(previousVotes[1], ["vote", "author", "signer", "subplebbitAddress"]),
                commentCid: "gibbrish"
            }),
            messages.ERR_CID_IS_INVALID
        );
    });

    it(`Subplebbits rejects votes with invalid commentCid`);
});
