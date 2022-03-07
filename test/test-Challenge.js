import {unsubscribeAllPubsubTopics} from "../src/Util.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import Plebbit, {Post, Subplebbit} from "../src/index.js";
import {CHALLENGE_TYPES} from "../src/ChallengeState.js";
import assert from "assert";
import {generateMockPost} from "./MockUtil.js";

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});
const subplebbit = await plebbit.getSubplebbit("k2k4r8lv3ohaweyc5hwa3q4jnnu92d1uglb3a4c0ut6b92esjyjc7n5s");


describe("Test Challenge functionality", async () => {

    before(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));
    before(async () => await subplebbit.startPublishing());
    // Stop publishing once we're done with tests
    after(async () => await subplebbit.stopPublishing());

    it("Captcha can be skipped under certain conditions", async () => {
        return new Promise(async (resolve, reject) => {
            subplebbit.setProvideCaptchaCallback((challengeWithPost) => {
                // Return question, type
                // Expected return is:
                // captcha, captcha type, reason for skipping captcha (if it's skipped by nullifying captcha)
                if (challengeWithPost.msg.timestamp > 1643740217.6)
                    // if we return null we are skipping captcha for this particular post/comment
                    return [null, null, "Captcha was skipped because timestamp exceeded 1643740217.6"];
                else
                    return ["1+1=?", CHALLENGE_TYPES.TEXT];
            });
            const mockPost = await generateMockPost(subplebbit);
            await subplebbit.startPublishing();

            mockPost.publish(null, null).then(async (challengeWithPost) => {
                const loadedPost = await plebbit.getPostOrComment(challengeWithPost.msg.postCid);
                const actualPost = new Post(challengeWithPost.msg);
                assert.equal(JSON.stringify(actualPost), JSON.stringify(loadedPost), "Sent post produces different result when loaded");
                mockPosts.push(loadedPost);
                resolve();
            }).catch(reject);
        });

    });

    it("Post is published when mathcli captcha is answered correctly", async function () {
        return new Promise(async (resolve, reject) => {
            subplebbit.setProvideCaptchaCallback((challengeWithPost) => {
                // Return question, type
                return ["1+1=?", CHALLENGE_TYPES.TEXT];
            });
            subplebbit.setValidateCaptchaAnswerCallback((challengeWithPost) => {
                const answerIsCorrect = challengeWithPost["challenge"].answer === "2";
                const reason = answerIsCorrect ? "Result of math express is correct" : "Result of math expression is incorrect";
                return [answerIsCorrect, reason];
            });
            const mockPost = await generateMockPost();
            await subplebbit.startPublishing();
            mockPost.publish(null, (challenge) => {
                // Solve captcha here
                return "2";
            }).then(async (challengeWithPost) => {
                const loadedPost = await plebbit.getPostOrComment(challengeWithPost.msg.postCid);
                const actualPost = new Post(challengeWithPost.msg, subplebbit);
                assert.equal(JSON.stringify(actualPost), JSON.stringify(loadedPost), "Sent post produces different result when loaded");
                resolve();
            }).catch(reject);

        });
    });

    it("Throws an error when user fails to solve mathcli captcha", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost();
            await subplebbit.startPublishing();
            mockPost.publish(null, (challenge) => {
                // Give wrong answer intentionally
                return "3";
            }).then(reject).catch(resolve); // Resolve when an error is thrown, and reject when no error is thrown
        });

    });
});