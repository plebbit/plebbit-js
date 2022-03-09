import {unsubscribeAllPubsubTopics} from "../src/Util.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import {Plebbit} from "../src/index.js";
import assert from "assert";
import {generateMockPost} from "./MockUtil.js";
import {Challenge, CHALLENGE_TYPES} from "../src/Challenge.js";

const plebbit = await Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});
const subplebbit = await plebbit.createSubplebbit({"subplebbitAddress": "k2k4r8mk7p2dremofe77j8myyvqjip1ndwzghkkunm4igkl6b3viunyr"}, plebbit.ipfsClient);


describe("Test Challenge functionality", async () => {

    before(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));
    before(async () => await subplebbit.startPublishing());
    // Stop publishing once we're done with tests
    after(async () => await subplebbit.stopPublishing());

    it("Captcha can be skipped under certain conditions", async () => {
        return new Promise(async (resolve, reject) => {
            subplebbit.setProvideCaptchaCallback((challengeRequestMessage) => {
                // Expected return is:
                // Challenge[], reason for skipping captcha (if it's skipped by nullifying Challenge[])
                if (challengeRequestMessage.publication.timestamp > 1643740217.6)
                    // if we return null we are skipping captcha for this particular post/comment
                    return [null, "Captcha was skipped because timestamp exceeded 1643740217.6"];
                else
                    return [[new Challenge({"challenge": "1+1=?", "type": CHALLENGE_TYPES.TEXT})], null];
            });
            const mockPost = await generateMockPost(subplebbit);

            mockPost.publish(null, null).then(async (challengeVerificationMessage) => {
                const loadedPost = await plebbit.getPostOrComment(challengeVerificationMessage.publication.commentCid);
                assert.equal(JSON.stringify(challengeVerificationMessage.publication), JSON.stringify(loadedPost), "Sent post produces different result when loaded");
                resolve();
            }).catch(reject);
        });

    });

    it("Post is published when mathcli captcha is answered correctly", async function () {
        return new Promise(async (resolve, reject) => {
            subplebbit.setProvideCaptchaCallback((ChallengeRequestMessage) => {
                return [[new Challenge({"challenge": "1+1=?", "type": CHALLENGE_TYPES.TEXT})], null];
            });
            subplebbit.setValidateCaptchaAnswerCallback((ChallengeAnswerMessage) => {
                const challengePassed = ChallengeAnswerMessage.challengeAnswers[0] === "2";
                const challengeErrors = challengePassed ? null : ["Result of math expression is incorrect"];
                return [challengePassed, challengeErrors];
            });
            const mockPost = await generateMockPost(subplebbit);
            mockPost.publish(null, (challengeMessage) => {
                // Solve captcha here
                return ["2"];
            }).then(async (challengeVerificationMessage) => {
                const loadedPost = await plebbit.getPostOrComment(challengeVerificationMessage.publication.postCid);
                assert.equal(JSON.stringify(challengeVerificationMessage.publication), JSON.stringify(loadedPost), "Sent post produces different result when loaded");
                resolve();
            }).catch(reject);

        });
    });

    it("Throws an error when user fails to solve mathcli captcha", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost(subplebbit);
            await subplebbit.startPublishing();
            mockPost.publish(null, (challengeVerificationMessage) => {
                // Give wrong answer intentionally
                return "3";
            }).then(reject).catch(resolve); // Resolve when an error is thrown, and reject when no error is thrown
        });

    });
});