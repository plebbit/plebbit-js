const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const signers = require("../fixtures/signers");
const { generateMockVote, generateMockPost, generateMockComment } = require("../../dist/node/test/test-util");
const { timestamp, randomElement } = require("../../dist/node/util");
const { mockPlebbit } = require("../../dist/node/test/test-util");

const subplebbitAddress = signers[0].address;
let plebbit, postToVote, replyToVote, signer;

const previousVotes = [];
const updateInterval = 100;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("Test upvote", async () => {
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

    it(`(vote: Vote) === plebbit.createVote(JSON.parse(JSON.stringify(vote)))`, async () => {
        const vote = await generateMockVote(postToVote, 1, plebbit, randomElement(signers));
        const voteFromStringifiedVote = await plebbit.createVote(JSON.parse(JSON.stringify(vote)));
        expect(JSON.stringify(vote)).to.equal(JSON.stringify(voteFromStringifiedVote));
    });

    it("Can upvote a post", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = await generateMockVote(postToVote, 1, plebbit, randomElement(signers));

            const originalUpvote = postToVote.upvoteCount;
            await vote.publish();
            postToVote.once("update", async (updatedPost) => {
                expect(updatedPost.upvoteCount).to.be.equal(originalUpvote + 1);
                expect(updatedPost.author.subplebbit.replyScore).to.equal(0);
                expect(updatedPost.author.subplebbit.postScore).to.equal(1);
                expect(updatedPost.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);

                previousVotes.push(vote);
                resolve();
            });
        });
    });

    it(`Can upvote a reply`, async () =>
        new Promise(async (resolve) => {
            const originalUpvote = replyToVote.downvoteCount;
            const vote = await generateMockVote(replyToVote, 1, plebbit, randomElement(signers));
            await vote.publish();
            replyToVote.once("update", async (updatedReply) => {
                expect(updatedReply.upvoteCount).to.equal(originalUpvote + 1);
                expect(updatedReply.author.subplebbit.replyScore).to.equal(1);
                expect(updatedReply.author.subplebbit.postScore).to.equal(1);
                expect(updatedReply.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);

                previousVotes.push(vote);
                resolve();
            });
        }));

    it("Can change post upvote to downvote", async () => {
        return new Promise(async (resolve, reject) => {
            const originalUpvote = postToVote.upvoteCount;
            const originalDownvote = postToVote.downvoteCount;
            const vote = await plebbit.createVote({
                ...previousVotes[0].toJSON(),
                signer: previousVotes[0].signer,
                vote: -1
            });
            await vote.publish();
            postToVote.once("update", async (updatedPost) => {
                expect(updatedPost.upvoteCount).to.equal(originalUpvote - 1);
                expect(updatedPost.downvoteCount).to.equal(originalDownvote + 1);
                expect(updatedPost.author.subplebbit.postScore).to.equal(-1);
                expect(updatedPost.author.subplebbit.replyScore).to.equal(1);
                expect(updatedPost.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);

                resolve();
            });
        });
    });

    it("Can change reply upvote to downvote", async () => {
        return new Promise(async (resolve, reject) => {
            const originalUpvote = replyToVote.upvoteCount;
            const originalDownvote = replyToVote.downvoteCount;
            const vote = await plebbit.createVote({
                ...previousVotes[1].toJSON(),
                signer: previousVotes[1].signer,
                vote: -1
            });
            await vote.publish();
            replyToVote.once("update", async (updatedReply) => {
                expect(updatedReply.upvoteCount).to.equal(originalUpvote - 1);
                expect(updatedReply.downvoteCount).to.equal(originalDownvote + 1);
                expect(updatedReply.author.subplebbit.postScore).to.equal(-1);
                expect(updatedReply.author.subplebbit.replyScore).to.equal(-1);
                expect(updatedReply.author.subplebbit.lastCommentCid).to.equal(replyToVote.cid);

                resolve();
            });
        });
    });

    it("Does not throw an error when vote is duplicated", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = await plebbit.createVote({
                ...previousVotes[0].toJSON(),
                signer: previousVotes[0].signer,
                timestamp: timestamp()
            });
            await vote.publish();
            vote.once("challengeverification", async (challengeVerificationMsg, updatedVote) => {
                expect(challengeVerificationMsg.challengeSuccess).to.be.true;
                expect(challengeVerificationMsg.reason).to.be.a.string;
                resolve();
            });
        });
    });
});
