import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import assert from 'assert';
import {Plebbit, Post} from "../src/index.js"
import {loadIpfsFileAsJson, unsubscribeAllPubsubTopics} from "../src/Util.js";
import * as fs from 'fs/promises';
import readline from "readline";
import {SORTED_COMMENTS_TYPES, SORTED_POSTS_PAGE_SIZE, SortedComments} from "../src/SortHandler.js";
import {generateMockPost} from "./MockUtil.js";

const startTestTime = Date.now() / 1000;
const plebbit = await Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});
const subplebbit = await plebbit.createSubplebbit({}, plebbit.ipfsClient);

const mockPosts = [];
describe("Test Subplebbit functionality", async () => {

    before(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));
    // Stop publishing once we're done with tests
    after(async () => await subplebbit.stopPublishing());


    it("New subplebbits can be published", async function () {
        await subplebbit.update({"title": `Test subplebbit - ${startTestTime}`});
        // Should have ipns key now
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.subplebbitAddress);
        assert.equal(JSON.stringify(loadedSubplebbit), JSON.stringify(subplebbit), "Failed to publish new subplebbit");
    });

    const numOfPosts = SORTED_POSTS_PAGE_SIZE + 2;
    it(`Sorting ${numOfPosts} posts by new generates a two pages ordered by posts' timestamp`, async function () {
        await subplebbit.setProvideCaptchaCallback(() => [null, "No need for captcha"]);
        await subplebbit.startPublishing();
        const actualPosts = new Array(numOfPosts);
        for (let i = actualPosts.length - 1; i >= 0; i--)
            actualPosts[i] = await generateMockPost(subplebbit);

        await Promise.all(actualPosts.map(async post => post.publish()));
        const sortedPostsFirstPage = new SortedComments(await loadIpfsFileAsJson(subplebbit.sortedPostsCids[SORTED_COMMENTS_TYPES.NEW], plebbit.ipfsClient));
        assert(sortedPostsFirstPage.nextSortedCommentsCid, "There should be two pages");
        const sortedPostsSecondPage = new SortedComments(await loadIpfsFileAsJson(sortedPostsFirstPage.nextSortedCommentsCid, plebbit.ipfsClient));

        const combinedPosts = sortedPostsFirstPage.comments.concat(sortedPostsSecondPage.comments);

        assert.equal(JSON.stringify(actualPosts), JSON.stringify(combinedPosts), "Posts have not been loaded in correct order");

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
            subplebbit.event.once('post', async (post) => {
                assert.equal(post.title, mockPost.title, "Failed to publish correct post");
                assert.equal(post.postCid, subplebbit.latestPostCid, "Failed to update subplebbit latestPostCid");
                const loadedPost = await plebbit.getPostOrComment(post.postCid);
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
            const lastPost = mockPosts[mockPosts.length - 1];
            const secondMockPost = await generateMockPost(subplebbit);
            await subplebbit.startPublishing();
            secondMockPost.publish(null, null).then((challengeVerificationMessage) => {
                assert.equal(challengeVerificationMessage.publication.previousCommentCid, lastPost.postCid, "Failed to set previousPostCid");
                mockPosts.push(challengeVerificationMessage.publication);
                resolve();
            }).catch(reject);
        });
    });

    it("Throws an error when publishing a duplicate post", async function () {
        return new Promise(async (resolve, reject) => {
            const post = new Post(mockPosts[0].toJSONSkeleton(), subplebbit);
            subplebbit.setProvideCaptchaCallback(() => [null, null]);

            await subplebbit.startPublishing();
            post.publish(null, null).then(reject).catch(resolve);
        });
    });

});