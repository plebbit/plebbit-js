import {Plebbit, Vote} from "../src/index.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import assert from 'assert';
import {unsubscribeAllPubsubTopics} from "../src/Util.js";
import {generateMockVote} from "./MockUtil.js";

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});

const post = await plebbit.getPostOrComment("QmeqbvRcRv7L5jvb9hLmD3LGcnjuLAcpLbngsiZRrisT3L");
const comment = await plebbit.getPostOrComment("QmX3tgDHFYEaYZnEb6P2Qci9E6GfDWGTBhDAmZ1qLdxUCk");
const previousVotes = [];


describe("Test Vote", async () => {
    before(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));

    it("Can upvote a comment", async () => {
        return new Promise(async (resolve, reject) => {
            await post.fetchCommentIpns();

            const originalUpvote = post.commentIpns.upvoteCount;
            const vote = await generateMockVote(post, 1);
            vote.subplebbit.setProvideCaptchaCallback((challengeWithMsg) => {
                return [null, null, "Captcha is skipped for all"];
            })
            await post.subplebbit.startPublishing();
            vote.publish().then(async (challengeWithVote) => {
                await post.fetchCommentIpns();
                assert.equal(post.commentIpns.upvoteCount, originalUpvote + 1);
                previousVotes.push(vote);
                resolve();
            }).catch(reject);
        });

    });

    it("Throws an error when vote is duplicated", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = new Vote({...previousVotes[0].toJSON(), "timestamp": Date.now() / 1000}, previousVotes[0].subplebbit);
            vote.publish().then(reject).catch(resolve);
        });

    });

    it("Can change upvote to downvote", async () => {
        return new Promise(async (resolve, reject) => {
            await post.fetchCommentIpns();

            const originalUpvote = post.commentIpns.upvoteCount;
            const originalDownvote = post.commentIpns.downvoteCount;
            const vote = new Vote({
                ...previousVotes[0].toJSON(),
                "vote": -1,
                "timestamp": Date.now() / 1000
            }, previousVotes[0].subplebbit);
            vote.publish().then(async (challengeWithVote) => {
                await post.fetchCommentIpns();
                assert.equal(post.commentIpns.upvoteCount, originalUpvote - 1, "Failed to update upvote count");
                assert.equal(post.commentIpns.downvoteCount, originalDownvote + 1, "Failed to update downvote count");
                resolve();
            }).catch(reject);
        });

    });

    it("Can cancel a comment downvote", async () => {
        return new Promise(async (resolve, reject) => {
            await post.fetchCommentIpns();

            const originalDownvote = post.commentIpns.downvoteCount;
            const vote = new Vote({
                ...previousVotes[0].toJSON(),
                "vote": 0,
                "timestamp": Date.now() / 1000
            }, previousVotes[0].subplebbit);
            vote.publish().then(async (challengeWithVote) => {
                await post.fetchCommentIpns();
                assert.equal(post.commentIpns.downvoteCount, originalDownvote - 1);
                resolve();
            }).catch(reject);
        });

    });

    it("Can downvote a comment", async () => {
        return new Promise(async (resolve, reject) => {
            await post.fetchCommentIpns();
            const originalDownvote = post.commentIpns.downvoteCount;
            const vote = await generateMockVote(post, -1);
            vote.publish().then(async (challengeWithVote) => {
                await post.fetchCommentIpns();
                assert.equal(post.commentIpns.downvoteCount, originalDownvote + 1);
                previousVotes.push(vote);
                resolve();
            }).catch(reject);
        });

    });

    it("Can change downvote to upvote", async () => {
        return new Promise(async (resolve, reject) => {
            await post.fetchCommentIpns();

            const originalUpvote = post.commentIpns.upvoteCount;
            const originalDownvote = post.commentIpns.downvoteCount;
            const vote = new Vote({
                ...previousVotes[1].toJSON(),
                "vote": 1,
                "timestamp": Date.now() / 1000
            }, previousVotes[1].subplebbit);
            vote.publish().then(async (challengeWithVote) => {
                await post.fetchCommentIpns();
                assert.equal(post.commentIpns.upvoteCount, originalUpvote + 1, "Failed to update upvote count");
                assert.equal(post.commentIpns.downvoteCount, originalDownvote - 1, "Failed to update downvote count");
                resolve();
            }).catch(reject);
        });

    });

    it("Can cancel a comment upvote", async () => {
        return new Promise(async (resolve, reject) => {
            await post.fetchCommentIpns();

            const originalUpvote = post.commentIpns.upvoteCount;
            const vote = new Vote({
                ...previousVotes[1].toJSON(),
                "vote": 0,
                "timestamp": Date.now() / 1000
            }, previousVotes[1].subplebbit);
            vote.publish().then(async (challengeWithVote) => {
                await post.fetchCommentIpns();
                assert.equal(post.commentIpns.upvoteCount, originalUpvote - 1);
                resolve();
            }).catch(reject);
        });

    });
});