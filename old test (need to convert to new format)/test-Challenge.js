import {unsubscribeAllPubsubTopics, waitTillCommentsArePublished} from "../src/Util.js";
import {IPFS_CLIENT_CONFIGS, TEST_CHALLENGES_SUBPLEBBIT_ADDRESS} from "../secrets.js";
import Plebbit from "../src/index.js";
import assert from "assert";
import {generateMockPost} from "./MockUtil.js";
import {Challenge, CHALLENGE_TYPES} from "../src/Challenge.js";

const serverPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[0]});
const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});

const subplebbit = await serverPlebbit.createSubplebbit({"address": TEST_CHALLENGES_SUBPLEBBIT_ADDRESS});


describe("Test Challenge functionality", async () => {

    before(async () => await unsubscribeAllPubsubTopics([serverPlebbit.ipfsClient, clientPlebbit.ipfsClient]));
    // Stop publishing once we're done with tests
    after(async () => await subplebbit.stopPublishing());

    it("Captcha can be skipped under certain conditions", async () => {
        return new Promise(async (resolve, reject) => {
            const minimumTimestamp = 1643740217;
            subplebbit.setProvideCaptchaCallback((challengeRequestMessage) => {
                // Expected return is:
                // Challenge[], reason for skipping captcha (if it's skipped by nullifying Challenge[])
                if (challengeRequestMessage.publication.timestamp > minimumTimestamp)
                    // if we return null we are skipping captcha for this particular post/comment
                    return [null, `Captcha was skipped because timestamp exceeded ${minimumTimestamp}`];
                else
                    return [[new Challenge({"challenge": "1+1=?", "type": CHALLENGE_TYPES.TEXT})], null];
            });
            await subplebbit.start();
            const mockPostShouldSkipCaptcha = await generateMockPost(subplebbit.address, clientPlebbit);
            await mockPostShouldSkipCaptcha.publish(null, null);
            await waitTillCommentsArePublished([mockPostShouldSkipCaptcha]);
            assert.equal(Boolean(mockPostShouldSkipCaptcha.cid), true, `Post should be published since its timestamp (${mockPostShouldSkipCaptcha.timestamp}) exceeds minimum (${minimumTimestamp})`)
            const mockPostShouldGetCaptcha = await clientPlebbit.createComment({
                ...mockPostShouldSkipCaptcha.toJSON(),
                "timestamp": minimumTimestamp - 1
            });
            await mockPostShouldGetCaptcha.publish();

            mockPostShouldGetCaptcha.once("challenge", (challengeMessage) => {
                assert.equal(challengeMessage.challenges[0].challenge, "1+1=?", "Challenge should be 1+1=?");
                resolve();
            });
        });

    });

    it("Post is published when mathcli captcha is answered correctly", async function () {
        return new Promise(async (resolve, reject) => {
            subplebbit.setProvideCaptchaCallback((challengeRequestMessage) => {
                return [[new Challenge({"challenge": "1+1=?", "type": CHALLENGE_TYPES.TEXT})], undefined];
            });
            subplebbit.setValidateCaptchaAnswerCallback((challengeAnswerMessage) => {
                const challengePassed = challengeAnswerMessage.challengeAnswers[0] === "2";
                const challengeErrors = challengePassed ? undefined : ["Result of math expression is incorrect"];
                return [challengePassed, challengeErrors];
            });
            const mockPost = await generateMockPost(subplebbit.address, clientPlebbit);
            mockPost.removeAllListeners();
            await mockPost.publish();
            mockPost.once("challenge", (challengeMessage) => {
                mockPost.publishChallengeAnswers(["2"]);
            });
            mockPost.once("challengeverification", async ([challengeVerificationMessage, newComment]) => {
                assert.equal(challengeVerificationMessage.challengePassed, true, "Post did not publish even though challenge has been answered correctly");
                resolve();
            });

        });
    });

    it("Throws an error when user fails to solve mathcli captcha", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost(subplebbit.address, clientPlebbit);
            mockPost.removeAllListeners();

            mockPost.once("challenge", (challengeMessage) => {
                mockPost.publishChallengeAnswers(["3"]);
            });
            await mockPost.publish();
            mockPost.once("challengeverification", ([challengeVerificationMessage, newComment]) => {
                assert.equal(challengeVerificationMessage.challengePassed, false, "Post should not be posted when challenge has been solved incorrectly");
                resolve();
            });
        });

    });
});