import {IPFS_CLIENT_CONFIGS} from "../secrets.js";
import assert from 'assert';
import {Plebbit} from "../src/index.js"
import {sleep, unsubscribeAllPubsubTopics, waitTillCommentsArePublished, waitTillCommentsUpdate} from "../src/Util.js";
import * as fs from 'fs/promises';
import readline from "readline";
import {SORTED_COMMENTS_TYPES, SORTED_POSTS_PAGE_SIZE, SortedComments} from "../src/SortHandler.js";
import {generateMockPost, loadAllPagesThroughSortedComments} from "./MockUtil.js";

const startTestTime = Date.now() / 1000;
const serverPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[0]});
const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});
const subplebbit = await serverPlebbit.createSubplebbit({});

const mockPosts = [];
describe("Test Subplebbit functionality", async () => {

    before(async () => {
        await unsubscribeAllPubsubTopics(serverPlebbit.ipfsClient);
        await unsubscribeAllPubsubTopics(clientPlebbit.ipfsClient);
    });    // Stop publishing once we're done with tests
    after(async () => await subplebbit.stopPublishing());


    it("New subplebbits can be published", async function () {
        await subplebbit.edit({"title": `Test subplebbit - ${startTestTime}`});
        // Should have ipns key now
        const loadedSubplebbit = await clientPlebbit.getSubplebbit(subplebbit.subplebbitAddress);
        assert.equal(JSON.stringify(loadedSubplebbit), JSON.stringify(subplebbit), "Failed to publish new subplebbit");
    });

    const numOfPosts = SORTED_POSTS_PAGE_SIZE + 2;
    it(`Sorting ${numOfPosts} posts by new generates a two pages ordered by posts' timestamp`, async function () {
        return new Promise(async (resolve, reject) => {
            await subplebbit.setProvideCaptchaCallback(() => [null, "No need for captcha"]);
            await subplebbit.startPublishing();
            const actualPosts = new Array(numOfPosts);
            for (let i = actualPosts.length - 1; i >= 0; i--) {
                actualPosts[i] = await generateMockPost(subplebbit.subplebbitAddress, clientPlebbit);
                await sleep(1050);
            }
            await subplebbit.update();
            await Promise.all(actualPosts.map(async post => post.publish()));
            await waitTillCommentsArePublished(actualPosts);
            subplebbit.once("update", async (updatedSubplebbit) => {
                await waitTillCommentsUpdate(actualPosts);
                const loadedPosts = await loadAllPagesThroughSortedComments(updatedSubplebbit.sortedPostsCids[SORTED_COMMENTS_TYPES.NEW], clientPlebbit);
                assert.equal(JSON.stringify(actualPosts), JSON.stringify(loadedPosts), "Posts have not been loaded in correct order");
                mockPosts.push(actualPosts[0]);
                resolve();
            });
        });

    });

    it("Throws an error if unable to solve image captcha", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost();
            await subplebbit.startPublishing();
            const solveCaptchaCallback = async (challenge) => {
                return new Promise(async (resolve) => resolve("12345"));
            };
            mockPost.publish(null, solveCaptchaCallback).then(reject).catch(resolve);
        });

    });

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
            const mockPost = await generateMockPost();
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




    it("Subplebbit emits an event everytime a post is posted", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost(subplebbit);
            subplebbit.once('post', async (post) => {
                assert.equal(post.title, mockPost.title, "Failed to publish correct post");
                assert.equal(post.postCid, subplebbit.latestPostCid, "Failed to update subplebbit latestPostCid");
                const loadedPost = await plebbit.getPostOrComment(post.postCid);
                await loadedPost.update();
                assert.equal(JSON.stringify(loadedPost), JSON.stringify(post), "Downloaded post is missing info");
                mockPosts.push(loadedPost);
                resolve();
            });
            await subplebbit.setProvideCaptchaCallback(() => [null, null, null]);
            await subplebbit.startPublishing();
            await mockPost.publish(null, null);
        });
    });

    it("Links current post to past posts correctly", async function () {
        return new Promise(async (resolve, reject) => {
            const secondMockPost = await generateMockPost(subplebbit.subplebbitAddress, clientPlebbit);

            const originalLatestPostCid = subplebbit.latestPostCid;
            await secondMockPost.publish(null);
            secondMockPost.once("challengeverification", ([challengeVerificationMessage, newComment]) => {
                subplebbit.once("update", updatedSubplebbit => {
                    assert.equal(challengeVerificationMessage.publication.previousCommentCid, originalLatestPostCid, "Failed to set previousPostCid");
                    assert.equal(challengeVerificationMessage.publication.commentCid, updatedSubplebbit.latestPostCid, "Failed to set subplebbit.latestPostCid");
                    mockPosts.push(challengeVerificationMessage.publication);
                    resolve();

                });

            });


        });
    });

    it("Throws an error when publishing a duplicate post", async function () {
        return new Promise(async (resolve, reject) => {
            const post = await clientPlebbit.createComment(mockPosts[0].toJSONSkeleton());
            subplebbit.setProvideCaptchaCallback(() => [null, null]);

            await subplebbit.startPublishing();
            await post.publish(null);
            post.once("challengeverification", ([challengeVerificationMessage, newComment]) => {
                assert.equal(challengeVerificationMessage.challengePassed, false, "Challenge should not succeed if post is a duplicate");
                assert.equal(challengeVerificationMessage.reason, "Failed to insert post due to previous post having same ipns key name (duplicate?)", "There should be an error message that tells the user they posted a duplicate");
                resolve();
            });
        });
    });

});