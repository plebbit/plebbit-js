const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const signers = require("../fixtures/signers");
const { generateMockVote, generateMockPost } = require("../../dist/node/test-util");
const { timestamp, waitTillCommentsUpdate, waitTillPublicationsArePublished, randomElement } = require("../../dist/node/util");

const subplebbitAddress = signers[0].address;

let plebbit, postToVote;

const previousVotes = [];
const updateInterval = 100;

describe("Test upvote", async () => {
    before(async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });

        postToVote = await generateMockPost(subplebbitAddress, plebbit, signers[0]);
        await postToVote.publish();
        await waitTillPublicationsArePublished([postToVote]);
        expect(postToVote.cid).to.be.a("string");
        await waitTillCommentsUpdate([postToVote], updateInterval);
        await postToVote.update(updateInterval);
    });

    after(async () => {
        await postToVote.stop();
    });

    it(`(vote: Vote) === plebbit.createVote(JSON.parse(JSON.stringify(vote)))`, async () => {
        const vote = await generateMockVote(postToVote, 1, plebbit, randomElement(signers));
        const voteFromStringifiedVote = await plebbit.createVote(JSON.parse(JSON.stringify(vote)));
        expect(JSON.stringify(vote)).to.equal(JSON.stringify(voteFromStringifiedVote));
    });

    it("Can upvote a comment", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = await generateMockVote(postToVote, 1, plebbit, randomElement(signers));

            const originalUpvote = postToVote.upvoteCount;
            await vote.publish();
            postToVote.once("update", async (updatedPost) => {
                expect(updatedPost.upvoteCount).to.be.equal(originalUpvote + 1);
                previousVotes.push(vote);
                resolve();
            });
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

    it("Can change upvote to downvote", async () => {
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
                resolve();
            });
        });
    });
});
