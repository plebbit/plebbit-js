import {Plebbit} from "../src/index.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import assert from 'assert';
import {timestamp, unsubscribeAllPubsubTopics} from "../src/Util.js";
import {generateMockVote} from "./MockUtil.js";

const plebbit = await Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});

const post = await plebbit.getPostOrComment("QmSeDvgKzg556Qyv4xueUaDkkjMB69jLwxsUQAuUzR6fqT");
const previousVotes = [];


describe("Test Vote", async () => {
    before(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));

    it("Can upvote a comment", async () => {
        return new Promise(async (resolve, reject) => {
            await post.fetchCommentIpns();

            const originalUpvote = post.commentIpns.upvoteCount;
            post.subplebbit.setProvideCaptchaCallback((challengeRequestMessage) => {
                return [null, "Captcha is skipped for all"];
            });
            const vote = await generateMockVote(post, 1, post.subplebbit);

            await post.subplebbit.startPublishing();
            vote.publish().then(async (challengeVerificationMessage) => {
                await post.fetchCommentIpns();
                assert.equal(post.commentIpns.upvoteCount, originalUpvote + 1);
                previousVotes.push(vote);
                resolve();
            }).catch(reject);
        });

    });

    it("Throws an error when vote is duplicated", async () => {
        return new Promise(async (resolve, reject) => {
            const vote = await plebbit.createVote({
                ...previousVotes[0].toJSON(),
                "timestamp": timestamp(),
                "subplebbitAddress": previousVotes[0].subplebbitAddress
            });
            vote.publish().then(reject).catch(resolve);
        });

    });

    it("Can change upvote to downvote", async () => {
        return new Promise(async (resolve, reject) => {
            await post.fetchCommentIpns();

            const originalUpvote = post.commentIpns.upvoteCount;
            const originalDownvote = post.commentIpns.downvoteCount;
            const vote = await plebbit.createVote({
                ...previousVotes[0].toJSON(),
                "vote": -1,
                "timestamp": timestamp(),
                "subplebbitAddress": previousVotes[0].subplebbitAddress
            },);
            vote.publish().then(async (challengeVerificationMessage) => {
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
            const vote = await plebbit.createVote({
                ...previousVotes[0].toJSON(),
                "vote": 0,
                "timestamp": timestamp(),
                "subplebbitAddress": previousVotes[0].subplebbitAddress
            });
            vote.publish().then(async (challengeVerificationMessage) => {
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
            const vote = await generateMockVote(post, -1, post.subplebbit);
            vote.publish().then(async (challengeVerificationMessage) => {
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
            const vote = await plebbit.createVote({
                ...previousVotes[1].toJSON(),
                "vote": 1,
                "timestamp": timestamp(),
                "subplebbitAddress": previousVotes[1].subplebbitAddress
            });
            vote.publish().then(async (challengeVerificationMessage) => {
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
            const vote = await plebbit.createVote({
                ...previousVotes[1].toJSON(),
                "vote": 0,
                "timestamp": timestamp(),
                "subplebbitAddress": previousVotes[1].subplebbitAddress
            });
            vote.publish().then(async (challengeVerificationMessage) => {
                await post.fetchCommentIpns();
                assert.equal(post.commentIpns.upvoteCount, originalUpvote - 1);
                resolve();
            }).catch(reject);
        });

    });
});