import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import assert from 'assert';
import Subplebbit from "../src/Subplebbit.js";
import Plebbit from "../src/Plebbit.js";
import Post from "../src/Post.js";
import {unsubscribeAllPubsubTopics} from "../src/Util.js";

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});
const subplebbit = new Subplebbit({
    "title": `Test subplebbit - ${Date.now()}`
}, plebbit);

const mockPosts = [];

async function generateMockPost() {
    const mockAuthorIpns = await plebbit.ipfsClient.key.gen(`Mock User - ${Date.now()}`);
    return new Post({
        "author": {"displayName": `Mock Author - ${Date.now()}`, "ipnsKeyId": mockAuthorIpns["id"]},
        "title": `Mock Post - ${Date.now()}`, "content": `Mock content - ${Date.now()}`, "timestamp": Date.now(),
    }, plebbit, subplebbit);
}


describe("Test Subplebbit functionality", async () => {

    before(() => unsubscribeAllPubsubTopics(plebbit));
    // Stop publishing once we're done with tests
    after(async () => await subplebbit.stopPublishing());


    it("New subplebbits can be published", async function () {
        await subplebbit.publishAsNewSubplebbit();
        // Should have ipns key now
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.ipnsKeyId);
        assert.equal(JSON.stringify(loadedSubplebbit), JSON.stringify(subplebbit), "Failed to publish new subplebbit");
    });

    it("Captcha can be skipped under certain conditions", async () => {
        return new Promise(async (resolve, reject) => {
            subplebbit.setProvideCaptchaCallback((challengeWithPost) => {
                // Return question, type
                // Expected return is:
                // captcha, captcha type, reason for skipping captcha (if it's skipped by nullifying captcha)
                if (challengeWithPost.msg.timestamp > 1643740217602)
                    // if we return null we are skipping captcha for this particular post/comment
                    return [null, null, "Captcha was skipped because timestamp exceeded 1643740217602"];
                else
                    return ["1+1=?", "math-cli"];
            });
            const mockPost = await generateMockPost();
            await subplebbit.startPublishing();

            mockPost.publish(null, null).then(resolve).catch(reject);
        });

    });

    it("Post is published when captcha is answered correctly", async function () {
        return new Promise(async (resolve, reject) => {
            subplebbit.setProvideCaptchaCallback((challengeWithPost) => {
                // Return question, type
                return ["1+1=?", "math-cli"];
            });
            subplebbit.setValidateCaptchaAnswerCallback((challengeWithPost) => {
                const answerIsCorrect = challengeWithPost["challenge"].answer === "2";
                const reason = answerIsCorrect ? "Result of math express is correct" : "Result of math expression is incorrect";
                return [answerIsCorrect, reason]
            });
            const mockPost = await generateMockPost();
            await subplebbit.startPublishing();
            mockPost.publish(null, (challenge) => {
                // Solve captcha here
                return "2";
            }).then(resolve).catch(reject);

        });
    });

    it("Throws an error when publishing a duplicate post", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost();
            subplebbit.once('post', async (post) => {
                assert.equal(post.title, mockPost.title, "Failed to publish correct post");
                assert.equal(post.postCid, subplebbit.latestPostCid, "Failed to update subplebbit latestPostCid");
                const loadedPost = await plebbit.getPostOrComment(post.postCid);
                assert.equal(JSON.stringify(loadedPost), JSON.stringify(post), "Downloaded post is missing info");

                mockPosts.push(post);
                resolve();
            });
            await subplebbit.startPublishing();
            await mockPost.publish();
        });
    });

    it("Sets previousCommentCid correctly", async function () {
        return new Promise(async (resolve, reject) => {
            const secondMockPost = await generateMockPost();
            subplebbit.once("post", (post) => {
                assert.equal(JSON.stringify(post.previousCommentCid), JSON.stringify(mockPosts[0].postCid), "Failed to set previousPostCid");
                mockPosts.push(post);
                resolve();
            });
            await secondMockPost.publish();
        });
    });

});