import {IPFS_CLIENT_CONFIGS} from "../secrets.js";
import assert from 'assert';
import Plebbit from "../src/index.js"
import {sleep, unsubscribeAllPubsubTopics, waitTillCommentsArePublished, waitTillCommentsUpdate} from "../src/Util.js";
import * as fs from 'fs/promises';
import readline from "readline";
import {POSTS_SORT_TYPES} from "../src/SortHandler.js";
import {generateMockPost, loadAllPagesThroughSortedComments} from "./MockUtil.js";
import Debug from "debug";

const debug = Debug("plebbit-js:test-Subplebbit");

const startTestTime = Date.now() / 1000;
const serverPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[0]});
const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});
let subplebbit;

const mockPosts = [];
describe("Test Subplebbit functionality", async () => {

    before(async () => {
        await unsubscribeAllPubsubTopics([serverPlebbit.ipfsClient, clientPlebbit.ipfsClient]);
    });
    after(async () => await subplebbit.stopPublishing()); // Stop publishing once we're done with tests


    it("New subplebbits can be published", async function () {
        const signer = await serverPlebbit.createSigner();
        subplebbit = await serverPlebbit.createSubplebbit({
            "signer": signer,
            "title": `Test subplebbit - ${startTestTime}`
        });

        // Should have ipns key now
        const loadedSubplebbit = await clientPlebbit.getSubplebbit(subplebbit.address);
        assert.equal(JSON.stringify(loadedSubplebbit), JSON.stringify(subplebbit), "Failed to publish new subplebbit");
        await subplebbit.start();
    });

    const numOfPosts = 3;
    it(`Sorting ${numOfPosts} posts by new generates a two pages ordered by posts' timestamp`, async function () {
        return new Promise(async (resolve, reject) => {
            subplebbit.setProvideCaptchaCallback(() => [null, "No need for captcha"]);
            const actualPosts = new Array(numOfPosts);
            for (let i = actualPosts.length - 1; i >= 0; i--) {
                actualPosts[i] = await generateMockPost(subplebbit.address, clientPlebbit);
                await sleep(1050);
            }
            debug(`Generated ${actualPosts.length} posts to publish`);
            await subplebbit.update();
            await Promise.all(actualPosts.map(async post => post.publish()));
            await waitTillCommentsArePublished(actualPosts);
            debug(`Posts are published, waiting for subplebbit update`);
            subplebbit.once("update", async (updatedSubplebbit) => {
                debug(`Received update of subplebbit, waiting till comments update`);
                await waitTillCommentsUpdate(actualPosts);
                debug(`Received update of posts, waiting till posts page loading`);
                const loadedPosts = await loadAllPagesThroughSortedComments(updatedSubplebbit.posts.pageCids[POSTS_SORT_TYPES.NEW.type], updatedSubplebbit.posts, clientPlebbit);
                debug(`Loaded posts from page`);
                await Promise.all(loadedPosts.map(post => post.update()));
                assert.equal(JSON.stringify(actualPosts), JSON.stringify(loadedPosts), "Posts have not been loaded in correct order");
                mockPosts.push(actualPosts[0]);
                resolve();
            });
        });

    });

    it("Can post after solving image captcha", async function () {
        return new Promise(async (resolve, reject) => {
            await subplebbit.setProvideCaptchaCallback(null);
            await subplebbit.startPublishing();
            const mockPost = await generateMockPost(subplebbit.address, clientPlebbit);
            mockPost.removeAllListeners();
            const solveCaptchaCallback = async (challenge) => {
                return new Promise(async (resolve) => {
                    // Solve captcha here
                    const path = `.captcha/${challenge.challengeRequestId}.png`;
                    await fs.writeFile(path, Buffer.from(challenge.challenges[0].challenge));
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });

                    // Retrieve answer from user in cli
                    rl.question(`Please provide your answer for captcha under path ${path}\n`, answer => {
                        resolve(answer);
                        rl.close();
                    });
                })
            };
            mockPost.once("challenge", async challengeMsg => {
                const answer = await solveCaptchaCallback(challengeMsg);
                await mockPost.publishChallengeAnswers(answer);
            });

            await mockPost.publish();
            mockPost.once("challengeverification", async ([challengeVerificationMessage, newComment]) => {
                assert.equal(challengeVerificationMessage.challengePassed, true, "Post should be published since challenge has been solved correctly");
                assert.equal(Boolean(challengeVerificationMessage.reason), false, "Reason should be empty since post has been published");
                resolve();
            });

        });


    });

    it("Throws an error if unable to solve image captcha", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost(subplebbit.address, clientPlebbit);
            await mockPost.publish();
            mockPost.once("challengeverification", async ([challengeVerificationMessage, newComment]) => {
                assert.equal(challengeVerificationMessage.challengePassed, false, "Post should not be published since challenge has been solved incorrectly");
                resolve();
            });
        });
    });


    it("Throws an error when publishing a duplicate post", async function () {
        return new Promise(async (resolve, reject) => {
            const post = await clientPlebbit.createComment(mockPosts[0].toJSONSkeleton());
            subplebbit.setProvideCaptchaCallback(() => [null, null]);

            await post.publish(null);
            post.once("challengeverification", ([challengeVerificationMessage, newComment]) => {
                assert.equal(challengeVerificationMessage.challengePassed, false, "Challenge should not succeed if post is a duplicate");
                assert.equal(challengeVerificationMessage.reason, "Failed to insert post due to previous post having same ipns key name (duplicate?)", "There should be an error message that tells the user they posted a duplicate");
                resolve();
            });
        });
    });

});