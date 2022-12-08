const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { generateMockVote, generateMockPost, generateMockComment } = require("../../dist/node/test/test-util");
const { randomElement } = require("../../dist/node/util");
const { messages } = require("../../dist/node/errors");

const chai = require("chai");
const { expect, assert } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { mockPlebbit } = require("../../dist/node/test/test-util");
chai.use(chaiAsPromised);

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const subplebbitAddress = signers.rawSigners[0].address;

const previousVotes = [];
const updateInterval = 100;
describe(`Test Downvote`, async () => {
    let plebbit, postToVote, replyToVote, signer;
    before(async () => {
        plebbit = await mockPlebbit();
        signer = await plebbit.createSigner();
        postToVote = await generateMockPost(subplebbitAddress, plebbit, signer);
        await postToVote.publish();
        await new Promise((resolve) => postToVote.once("challengeverification", resolve));
        expect(postToVote.cid).to.be.a("string");
        replyToVote = await generateMockComment(postToVote, plebbit, signer);
        await replyToVote.publish();
        await new Promise((resolve) => replyToVote.once("challengeverification", resolve));

        postToVote._updateIntervalMs = updateInterval;
        replyToVote._updateIntervalMs = updateInterval;

        await Promise.all([
            new Promise((resolve) => postToVote.once("update", resolve)),
            new Promise((resolve) => replyToVote.once("update", resolve)),
            postToVote.update(),
            replyToVote.update()
        ]);
    });
    after(async () => {
        await postToVote.stop();
        await replyToVote.stop();
    });

    it("Can downvote a post", async () => {
        return new Promise(async (resolve, reject) => {
            const originalDownvote = postToVote.downvoteCount;
            const vote = await generateMockVote(postToVote, -1, plebbit, randomElement(signers));
            await vote.publish();
            postToVote.once("update", async (updatedPost) => {
                expect(updatedPost.downvoteCount).to.equal(originalDownvote + 1);
                expect(updatedPost.author.subplebbit.replyScore).to.equal(0);
                expect(updatedPost.author.subplebbit.postScore).to.equal(-1);
                expect(updatedPost.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);

                previousVotes.push(vote);
                resolve();
            });
        });
    });

    it(`Can downvote a reply`, async () =>
        new Promise(async (resolve) => {
            const originalDownvote = replyToVote.downvoteCount;
            const vote = await generateMockVote(replyToVote, -1, plebbit, randomElement(signers));
            await vote.publish();
            replyToVote.once("update", async (updatedReply) => {
                expect(updatedReply.downvoteCount).to.equal(originalDownvote + 1);
                expect(updatedReply.author.subplebbit.replyScore).to.equal(-1);
                expect(updatedReply.author.subplebbit.postScore).to.equal(-1);
                expect(updatedReply.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);

                previousVotes.push(vote);
                resolve();
            });
        }));

    it("Can change post downvote to upvote", async () => {
        return new Promise(async (resolve, reject) => {
            const originalUpvote = postToVote.upvoteCount;
            const originalDownvote = postToVote.downvoteCount;
            const vote = await plebbit.createVote({
                ...previousVotes[0].toJSON(),
                signer: previousVotes[0].signer,
                vote: 1
            });
            await vote.publish();
            postToVote.once("update", async (updatedPost) => {
                expect(updatedPost.upvoteCount).to.equal(originalUpvote + 1, "Failed to update upvote count");
                expect(updatedPost.downvoteCount).to.equal(originalDownvote - 1, "Failed to update downvote count");
                expect(updatedPost.author.subplebbit.postScore).to.equal(1);
                expect(updatedPost.author.subplebbit.replyScore).to.equal(-1);
                expect(updatedPost.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);

                resolve();
            });
        });
    });

    it("Can change reply downvote to upvote", async () => {
        return new Promise(async (resolve, reject) => {
            const originalUpvote = replyToVote.upvoteCount;
            const originalDownvote = replyToVote.downvoteCount;
            const vote = await plebbit.createVote({
                ...previousVotes[1].toJSON(),
                signer: previousVotes[1].signer,
                vote: 1
            });
            await vote.publish();
            replyToVote.once("update", async (updatedReply) => {
                expect(updatedReply.upvoteCount).to.equal(originalUpvote + 1);
                expect(updatedReply.downvoteCount).to.equal(originalDownvote - 1);
                expect(updatedReply.author.subplebbit.postScore).to.equal(1);
                expect(updatedReply.author.subplebbit.replyScore).to.equal(1);
                expect(updatedReply.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);

                resolve();
            });
        });
    });

    it("Vote.publish fails when Vote.commentCid is invalid ", async () => {
        const vote = await generateMockVote({ ...postToVote.toJSON(), cid: "gibbrish" }, 1, plebbit, signers[0]);
        await assert.isRejected(vote.publish(), messages.ERR_CID_IS_INVALID);
    });

    it(`Subplebbits rejects votes with invalid commentCid`);
});
