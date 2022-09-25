const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const signers = require("../fixtures/signers");
const { generateMockVote, generateMockPost } = require("../../dist/node/test/test-util");
const { waitTillCommentsUpdate, waitTillPublicationsArePublished, randomElement } = require("../../dist/node/util");
if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const subplebbitAddress = signers[0].address;

let plebbit, postToVote;

const previousVotes = [];
const updateInterval = 100;
describe(`Test Downvote`, async () => {
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

    it("Can downvote a comment", async () => {
        return new Promise(async (resolve, reject) => {
            const originalDownvote = postToVote.downvoteCount;
            const vote = await generateMockVote(postToVote, -1, plebbit, randomElement(signers));
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
                ...previousVotes[0].toJSON(),
                signer: previousVotes[0].signer,
                vote: 1
            });
            await vote.publish();
            postToVote.once("update", async (updatedPost) => {
                expect(updatedPost.upvoteCount).to.equal(originalUpvote + 1, "Failed to update upvote count");
                expect(updatedPost.downvoteCount).to.equal(originalDownvote - 1, "Failed to update downvote count");
                resolve();
            });
        });
    });

    it("Throws an error when vote's comment does not exist", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = await generateMockVote({ ...postToVote.toJSON(), cid: "gibbrish" }, 1, plebbit, signers[0]);
            await vote.publish();
            vote.once("challengeverification", async (challengeVerificationMsg, updatedVote) => {
                expect(challengeVerificationMsg.challengeSuccess).to.be.false;
                expect(challengeVerificationMsg.reason).to.be.a("string").with.length.at.least(1);
                resolve();
            });
        });
    });
});
