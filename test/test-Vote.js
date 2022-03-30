import {Plebbit} from "../src/index.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL, TEST_VOTE_POST_CID, TEST_VOTE_SUBPLEBBIT_ADDRESS} from "../secrets.js";
import assert from 'assert';
import {timestamp, unsubscribeAllPubsubTopics} from "../src/Util.js";
import {generateMockVote} from "./MockUtil.js";

const plebbit = await Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});
const subplebbit = await plebbit.createSubplebbit({
    "subplebbitAddress":
    TEST_VOTE_SUBPLEBBIT_ADDRESS
});
const post = await plebbit.getPostOrComment(TEST_VOTE_POST_CID);
await post.update();
const previousVotes = [];


describe("Test Vote", async () => {
    before(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));
    after(async () => post.stop());
    after(async () => await post.subplebbit.stopPublishing());


    it("Can upvote a comment", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = await generateMockVote(post, 1, post.subplebbit);

            subplebbit.setProvideCaptchaCallback((challengeRequestMessage) => {
                return [null, "Captcha is skipped for all"];
            });
            await post.update();
            const originalUpvote = post.upvoteCount;

            await subplebbit.startPublishing();

            vote.publish().then(async challengePublicationMessage => {
                post.once("update", async (updatedPost) => {
                    assert.equal(updatedPost.upvoteCount, originalUpvote + 1);
                    previousVotes.push(vote);
                    resolve();

                });
            }).catch(reject);


        });

    });

    it("Throws an error when vote is duplicated", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = await plebbit.createVote({
                ...previousVotes[0].toJSON(),
                "timestamp": timestamp(),
            });
            vote.publish().then(reject).catch(resolve);
        });

    });

    it("Can change upvote to downvote", async () => {
        return new Promise(async (resolve, reject) => {
            await post.update();
            const originalUpvote = post.upvoteCount;
            const originalDownvote = post.downvoteCount;
            const vote = await plebbit.createVote({
                ...previousVotes[0].toJSON(),
                "vote": -1,
                "timestamp": timestamp(),
            });
            vote.publish().then(async (challengeVerificationMessage) => {
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
            const vote = await plebbit.createVote({
                ...previousVotes[0].toJSON(),
                "vote": 0,
                "timestamp": timestamp(),
            });
            vote.publish().then(async (challengeVerificationMessage) => {
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
            const vote = await generateMockVote(post, -1, post.subplebbit);
            vote.publish().then(async (challengeVerificationMessage) => {
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
            const vote = await plebbit.createVote({
                ...previousVotes[1].toJSON(),
                "vote": 1,
                "timestamp": timestamp(),
            });
            vote.publish().then(async (challengeVerificationMessage) => {
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
            const vote = await plebbit.createVote({
                ...previousVotes[1].toJSON(),
                "vote": 0,
                "timestamp": timestamp(),
            });
            vote.publish().then(async (challengeVerificationMessage) => {
                post.once("update", async (updatedPost) => {
                    assert.equal(updatedPost.upvoteCount, originalUpvote - 1);
                    resolve();
                });
            }).catch(reject);
        });

    });
});