const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const signers = require("../fixtures/signers");
const { generateMockVote, generateMockPost } = require("../../dist/node/test-util");
const { timestamp, waitTillPublicationsArePublished, waitTillCommentsUpdate } = require("../../dist/node/util");

const subplebbitAddress = signers[0].address;

let plebbit, subplebbit, postToVote;

const previousVotes = [];
const updateInterval = 100;
describe("Test Vote", async () => {
    before(async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
        subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
        await subplebbit.update(updateInterval);
        postToVote = await generateMockPost(subplebbitAddress, plebbit, signers[0]);
        await postToVote.publish();
        await waitTillPublicationsArePublished([postToVote]);
        await waitTillCommentsUpdate([postToVote], updateInterval);
        expect(postToVote.cid).to.be.a("string");
    });

    it("Can upvote a comment", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = await generateMockVote(postToVote, 1, plebbit, signers[0]);

            await (await generateMockVote(postToVote, 1, plebbit, signers[1])).publish(); // This vote is added just to start an "update" event and make sure originalUpvoteCount down below is accurate

            await waitTillCommentsUpdate([postToVote], updateInterval);
            await postToVote.update(updateInterval);
            const originalUpvote = postToVote.upvoteCount;
            await vote.publish();
            postToVote.once("update", async (updatedPost) => {
                expect(updatedPost.upvoteCount).to.be.equal(originalUpvote + 1);
                previousVotes.push(vote);
                resolve();
            });
            await subplebbit.stop();
        });
    });

    it("Throws an error when vote is duplicated", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = await plebbit.createVote({
                ...previousVotes[0].toJSON(),
                signer: previousVotes[0].signer,
                timestamp: timestamp()
            });
            await vote.publish();
            vote.once("challengeverification", async (challengeVerificationMsg, updatedVote) => {
                expect(challengeVerificationMsg.challengeSuccess).to.be.false;
                expect(challengeVerificationMsg.reason).to.be.a("string").with.length.at.least(1);
                resolve();
            });
        });
    });

    it("Throws an error when vote's comment does not exist", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = await generateMockVote({ ...postToVote.toJSON(), commentCid: "gibbrish" }, 1, plebbit, signers[0]);
            await vote.publish();
            vote.once("challengeverification", async (challengeVerificationMsg, updatedVote) => {
                expect(challengeVerificationMsg.challengeSuccess).to.be.false;
                expect(challengeVerificationMsg.reason).to.be.a("string").with.length.at.least(1);
                resolve();
            });
        });
    });

    it("Can change upvote to downvote", async () => {
        return new Promise(async (resolve, reject) => {
            await postToVote.update(updateInterval);
            const originalUpvote = postToVote.upvoteCount;
            const originalDownvote = postToVote.downvoteCount;
            const vote = await plebbit.createVote({
                ...previousVotes[0].toJSON(),
                signer: previousVotes[0].signer,
                vote: -1,
                timestamp: timestamp()
            });
            await vote.publish();
            postToVote.once("update", async (updatedPost) => {
                expect(updatedPost.upvoteCount).to.equal(originalUpvote - 1);
                expect(updatedPost.downvoteCount).to.equal(originalDownvote + 1);
                resolve();
            });
        });
    });

    it("Can cancel a comment downvote", async () => {
        return new Promise(async (resolve, reject) => {
            const originalDownvote = postToVote.downvoteCount;
            const vote = await plebbit.createVote({
                ...previousVotes[0].toJSON(),
                signer: previousVotes[0].signer,
                vote: 0,
                timestamp: timestamp()
            });
            await vote.publish();
            postToVote.once("update", async (updatedPost) => {
                expect(updatedPost.downvoteCount).to.equal(originalDownvote - 1);
                resolve();
            });
        });
    });

    it("Can downvote a comment", async () => {
        return new Promise(async (resolve, reject) => {
            const originalDownvote = postToVote.downvoteCount;
            const vote = await generateMockVote(postToVote, -1, plebbit, signers[2]);
            await vote.publish();
            postToVote.once("update", async (updatedPost) => {
                expect(updatedPost.downvoteCount).to.equal(originalDownvote + 1);
                previousVotes.push(vote);
                resolve();
            });
        });
    });

    it("Can change downvote to upvote", async () => {
        return new Promise(async (resolve, reject) => {
            const originalUpvote = postToVote.upvoteCount;
            const originalDownvote = postToVote.downvoteCount;
            const vote = await plebbit.createVote({
                ...previousVotes[1].toJSON(),
                signer: previousVotes[1].signer,
                vote: 1,
                timestamp: timestamp()
            });
            await postToVote.update(updateInterval);
            postToVote.once("update", async (updatedPost) => {
                expect(updatedPost.upvoteCount).to.equal(originalUpvote + 1, "Failed to update upvote count");
                expect(updatedPost.downvoteCount).to.equal(originalDownvote - 1, "Failed to update downvote count");
                resolve();
            });
            await vote.publish();
        });
    });

    it("Can cancel a comment upvote", async () => {
        return new Promise(async (resolve, reject) => {
            const originalUpvote = postToVote.upvoteCount;
            const vote = await plebbit.createVote({
                ...previousVotes[1].toJSON(),
                signer: previousVotes[1].signer,
                vote: 0,
                timestamp: timestamp()
            });
            await vote.publish();
            postToVote.once("update", async (updatedPost) => {
                expect(updatedPost.upvoteCount).to.equal(originalUpvote - 1);
                resolve();
            });
        });
    });
});
