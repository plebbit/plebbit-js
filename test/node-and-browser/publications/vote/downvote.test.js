import signers from "../../../fixtures/signers";
import {
    generateMockVote,
    publishRandomPost,
    publishRandomReply,
    publishWithExpectedResult,
    mockRemotePlebbit
} from "../../../../dist/node/test/test-util";
import { messages } from "../../../../dist/node/errors";
import lodash from "lodash";

import chai from "chai";
import { expect, assert } from "chai";
import chaiAsPromised from "chai-as-promised";
import { default as waitUntil } from "async-wait-until";
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
        await waitUntil.default(() => typeof postToVote.updatedAt === "number" && typeof replyToVote.updatedAt === "number", {
            timeout: 200000
        });
    });
    after(async () => {
        await postToVote.stop();
        await replyToVote.stop();
    });

    it("Can downvote a post", async () => {
        const originalDownvote = lodash.clone(postToVote.downvoteCount);
        const vote = await generateMockVote(postToVote, -1, plebbit);
        await publishWithExpectedResult(vote, true);

        await waitUntil.default(() => postToVote.downvoteCount === originalDownvote + 1, { timeout: 200000 });

        expect(postToVote.downvoteCount).to.equal(originalDownvote + 1);
        expect(postToVote.upvoteCount).to.equal(0);
        expect(postToVote.author.subplebbit.replyScore).to.equal(0);
        expect(postToVote.author.subplebbit.postScore).to.equal(-1);
        expect(postToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);
        previousVotes.push(vote);
    });

    it(`Can downvote a reply`, async () => {
        const originalDownvote = lodash.clone(replyToVote.downvoteCount);
        const vote = await generateMockVote(replyToVote, -1, plebbit);
        await publishWithExpectedResult(vote, true);

        await waitUntil.default(() => replyToVote.downvoteCount === originalDownvote + 1, { timeout: 200000 });

        expect(replyToVote.downvoteCount).to.equal(originalDownvote + 1);
        expect(replyToVote.upvoteCount).to.equal(0);
        expect(replyToVote.author.subplebbit.replyScore).to.equal(-1);
        expect(replyToVote.author.subplebbit.postScore).to.equal(-1);
        expect(replyToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);

        previousVotes.push(vote);
    });

    it("Can change post downvote to upvote", async () => {
        const originalUpvote = lodash.clone(postToVote.upvoteCount);
        const originalDownvote = lodash.clone(postToVote.downvoteCount);
        const vote = await plebbit.createVote({
            ...previousVotes[0].toJSON(),
            signature: undefined,
            signer: previousVotes[0].signer,
            vote: 1
        });
        await publishWithExpectedResult(vote, true);

        await waitUntil.default(() => postToVote.upvoteCount === originalUpvote + 1, { timeout: 200000 });

        expect(postToVote.upvoteCount).to.equal(originalUpvote + 1);
        expect(postToVote.downvoteCount).to.equal(originalDownvote - 1);
        expect(postToVote.author.subplebbit.postScore).to.equal(1);
        expect(postToVote.author.subplebbit.replyScore).to.equal(-1);
        expect(postToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);
    });

    it("Can change reply downvote to upvote", async () => {
        const originalUpvote = lodash.clone(replyToVote.upvoteCount);
        const originalDownvote = lodash.clone(replyToVote.downvoteCount);
        const vote = await plebbit.createVote({
            ...previousVotes[1].toJSON(),
            signer: previousVotes[1].signer,
            signature: undefined,
            vote: 1
        });
        await publishWithExpectedResult(vote, true);

        await waitUntil.default(() => replyToVote.upvoteCount === originalUpvote + 1, { timeout: 200000 });

        expect(replyToVote.upvoteCount).to.equal(originalUpvote + 1);
        expect(replyToVote.downvoteCount).to.equal(originalDownvote - 1);
        expect(replyToVote.author.subplebbit.postScore).to.equal(1);
        expect(replyToVote.author.subplebbit.replyScore).to.equal(1);
        expect(replyToVote.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);
    });

    it("Vote.publish fails when Vote.commentCid is invalid ", async () => {
        const vote = await generateMockVote({ ...postToVote.toJSON(), cid: "gibbrish" }, 1, plebbit, signers[0]);
        await assert.isRejected(vote.publish(), messages.ERR_CID_IS_INVALID);
    });

    it(`Subplebbits rejects votes with invalid commentCid`);
});
