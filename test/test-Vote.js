import {Plebbit, Vote} from "../src/index.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import assert from 'assert';
import {unsubscribeAllPubsubTopics} from "../src/Util.js";

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});

const post = await plebbit.getPostOrComment("QmeqbvRcRv7L5jvb9hLmD3LGcnjuLAcpLbngsiZRrisT3L");
const comment = await plebbit.getPostOrComment("QmX3tgDHFYEaYZnEb6P2Qci9E6GfDWGTBhDAmZ1qLdxUCk");
const generateMockVote = async (parentPostOrComment, vote) => {
    const voteTime = Date.now();
    const mockAuthorIpns = await plebbit.ipfsClient.key.gen(`Mock User - ${voteTime}`);
    return new Vote({
        "author": {"displayName": `Mock Author - ${voteTime}`, "ipnsName": mockAuthorIpns["id"]},
        "timestamp": voteTime, "commentCid": parentPostOrComment.commentCid || parentPostOrComment.postCid,
        "vote": vote,
    }, parentPostOrComment.subplebbit);
};

describe("Test Vote", async () => {
    before(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));

    it("Can upvote a post", async () => {
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
                resolve();
            }).catch(reject);
        });

    });

    it("Can downvote a post", async () => {
        return new Promise(async (resolve, reject) => {
            await post.fetchCommentIpns();
            const originalDownvote = post.commentIpns.downvoteCount;
            const vote = await generateMockVote(post, -1);
            vote.publish().then(async (challengeWithVote) => {
                await post.fetchCommentIpns();
                assert.equal(post.commentIpns.downvoteCount, originalDownvote + 1);
                resolve();
            }).catch(reject);
        });

    });

    it("Can upvote a comment", async () => {
        return new Promise(async (resolve, reject) => {
            await comment.fetchCommentIpns();
            const originalUpvote = comment.commentIpns.upvoteCount;
            const vote = await generateMockVote(comment, 1);
            vote.subplebbit.setProvideCaptchaCallback((challengeWithMsg) => {
                return [null, null, "Captcha is skipped for all"];
            });
            await vote.subplebbit.startPublishing();
            vote.publish().then(async (challengeWithVote) => {
                await comment.fetchCommentIpns();
                assert.equal(comment.commentIpns.upvoteCount, originalUpvote + 1);
                resolve();
            }).catch(reject);
        });

    });

    it("Can downvote a comment", async () => {
        return new Promise(async (resolve, reject) => {
            await comment.fetchCommentIpns();
            const originalDownvote = comment.commentIpns.downvoteCount;
            const vote = await generateMockVote(comment, -1);
            vote.publish().then(async (challengeWithVote) => {
                await comment.fetchCommentIpns();
                assert.equal(comment.commentIpns.downvoteCount, originalDownvote + 1);
                resolve();
            }).catch(reject);
        });

    });
});