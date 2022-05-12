import Plebbit from "../src/index.js";
import {
    IPFS_CLIENT_CONFIGS
} from "../secrets.js";
import assert from 'assert';
import {timestamp, unsubscribeAllPubsubTopics} from "../src/Util.js";
import {generateMockVote, getLatestSubplebbitAddress} from "./MockUtil.js";


const subplebbitAddress = "" || await getLatestSubplebbitAddress();

const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});
const subplebbit = await clientPlebbit.getSubplebbit(subplebbitAddress);
await subplebbit.update();


const post = await clientPlebbit.getComment(subplebbit.latestPostCid);
const previousVotes = [];


describe("Test Vote", async () => {
    before(async () => {
        await unsubscribeAllPubsubTopics([clientPlebbit.ipfsClient]);
    });


    it("Can upvote a comment", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = await generateMockVote(post, 1, clientPlebbit);

            await (await generateMockVote(post, 0, clientPlebbit)).publish(); // This vote is added just to start an "update" event and make sure originalUpvoteCount down below is accurate

            subplebbit.once("update", async (updatedSubplebbit) => {
                await post.update();
                const originalUpvote = post.upvoteCount;
                await vote.publish();
                post.once("update", async (updatedPost) => {
                    assert.equal(updatedPost.upvoteCount, originalUpvote + 1);
                    previousVotes.push(vote);
                    resolve();
                });
            });
        })
    });

    it("Throws an error when vote is duplicated", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = await clientPlebbit.createVote({
                ...previousVotes[0].toJSON(),
                "signer": previousVotes[0].signer,
                "timestamp": timestamp(),
            });
            await vote.publish();
            vote.once("challengeverification", async ([challengeVerificationMsg,]) => {
                assert.equal(challengeVerificationMsg.challengePassed, false, "Should fail to publish since vote is duplicated");
                if (!challengeVerificationMsg.reason)
                    assert.fail(`There should be a reason for failure (duplicate vote)`);
                resolve();
            });
        });

    });

    it("Can change upvote to downvote", async () => {
        return new Promise(async (resolve, reject) => {
            await post.update();
            const originalUpvote = post.upvoteCount;
            const originalDownvote = post.downvoteCount;
            const vote = await clientPlebbit.createVote({
                ...previousVotes[0].toJSON(),
                "signer": previousVotes[0].signer,
                "vote": -1,
                "timestamp": timestamp(),
            });
            vote.publish().then(async () => {
                post.once("update", async (updatedPost) => {
                    assert.equal(updatedPost.upvoteCount, originalUpvote - 1, "Failed to update upvote count");
                    assert.equal(updatedPost.downvoteCount, originalDownvote + 1, "Failed to update downvote count");
                    resolve();

                });
            }).catch(reject);
        });

    });

    it("Can cancel a comment downvote", async () => {
        return new Promise(async (resolve, reject) => {
            await post.update();

            const originalDownvote = post.downvoteCount;
            const vote = await clientPlebbit.createVote({
                ...previousVotes[0].toJSON(),
                "signer": previousVotes[0].signer,
                "vote": 0,
                "timestamp": timestamp(),
            });
            vote.publish().then(async () => {
                post.once("update", async (updatedPost) => {
                    assert.equal(updatedPost.downvoteCount, originalDownvote - 1);
                    resolve();
                });
            }).catch(reject);
        });

    });

    it("Can downvote a comment", async () => {
        return new Promise(async (resolve, reject) => {
            await post.update();
            const originalDownvote = post.downvoteCount;
            const vote = await generateMockVote(post, -1, clientPlebbit);
            vote.publish().then(async () => {
                post.once("update", async (updatedPost) => {
                    assert.equal(updatedPost.downvoteCount, originalDownvote + 1);
                    previousVotes.push(vote);
                    resolve();
                });
            }).catch(reject);
        });

    });

    it("Can change downvote to upvote", async () => {
        return new Promise(async (resolve, reject) => {
            await post.update();

            const originalUpvote = post.upvoteCount;
            const originalDownvote = post.downvoteCount;
            const vote = await clientPlebbit.createVote({
                ...previousVotes[1].toJSON(),
                "signer": previousVotes[1].signer,
                "vote": 1,
                "timestamp": timestamp(),
            });
            vote.publish().then(async () => {
                post.once("update", async (updatedPost) => {
                    assert.equal(updatedPost.upvoteCount, originalUpvote + 1, "Failed to update upvote count");
                    assert.equal(updatedPost.downvoteCount, originalDownvote - 1, "Failed to update downvote count");
                    resolve();
                });
            }).catch(reject);
        });

    });

    it("Can cancel a comment upvote", async () => {
        return new Promise(async (resolve, reject) => {
            await post.update();

            const originalUpvote = post.upvoteCount;
            const vote = await clientPlebbit.createVote({
                ...previousVotes[1].toJSON(),
                "signer": previousVotes[1].signer,
                "vote": 0,
                "timestamp": timestamp(),
            });
            vote.publish().then(async () => {
                post.once("update", async (updatedPost) => {
                    assert.equal(updatedPost.upvoteCount, originalUpvote - 1);
                    resolve();
                });
            }).catch(reject);
        });

    });
});