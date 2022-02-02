import Plebbit from "../src/Plebbit.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import Vote from "../src/Vote.js";
import assert from 'assert';

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});

const post = await plebbit.getPostOrComment("QmVxihaABYMBFkWGTpbK6hxekPXh9J7WmRQhq3vSZRix7q");

const generateMockVote = async (parentPostOrComment, vote) => {
    const mockAuthorIpns = await plebbit.ipfsClient.key.gen(`Mock User - ${Date.now()}`);

    return new Vote({
        "author": {"displayName": `Mock Author - ${Date.now()}`, "ipnsKeyId": mockAuthorIpns["id"]},
        "timestamp": Date.now(), "commentCid": parentPostOrComment.commentCid || parentPostOrComment.postCid,
        "vote": vote,
    }, plebbit, parentPostOrComment.subplebbit);
};

describe("Test Vote", async () => {
    it("Can upvote a post", async () => {
        return new Promise(async (resolve ,reject) => {
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
});