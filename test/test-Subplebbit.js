import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import assert from 'assert';
import Subplebbit from "../src/Subplebbit.js";
import Plebbit from "../src/Plebbit.js";
import Post from "../src/Post.js";

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});
const subplebbit = new Subplebbit({
    "title": `Test subplebbit - ${Date.now()}`
}, plebbit);

const mockPosts = [];

async function generateMockPost() {
    const mockAuthorIpns = await plebbit.ipfsClient.key.gen(`Mock User - ${Date.now()}`);
    return new Post({
        "author": {"displayName": `Mock Author - ${Date.now()}`, "ipnsId": mockAuthorIpns["id"]},
        "title": `Mock Post - ${Date.now()}`, "content": `Mock content - ${Date.now()}`, "timestamp": Date.now(),
    }, plebbit, subplebbit);
}


describe("Test Subplebbit", async () => {

    // Destroy subplebbit once we're done with tests
    after(async () => await subplebbit.destroy());


    it("Can publish new subplebbit to ipfs", async function () {
        await subplebbit.publishAsNewSubplebbit();
        // Should have ipns key now
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.ipnsKeyId);
        assert.equal(JSON.stringify(loadedSubplebbit), JSON.stringify(subplebbit), "Failed to publish new subplebbit");
    });

    it("Can publish new posts", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost();
            subplebbit.once('post', (post) => {
                assert.equal(post.title, mockPost.title, "Failed to publish correct post");
                assert.equal(post.cid, subplebbit.latestPostCid, "Failed to update subplebbit latestPostCid");
                mockPosts.push(post);
                resolve();
            });
            await subplebbit.startPublishing();
            await mockPost.publish();
        });
    });

    it("Sets previousPostCid correctly", async function () {
        return new Promise(async (resolve, reject) => {
            const secondMockPost = await generateMockPost();
            subplebbit.once("post", (post) => {
                assert.equal(JSON.stringify(post.previousPostCid), JSON.stringify(mockPosts[0].cid), "Failed to set previousPostCid");
                mockPosts.push(post);
                resolve();
            });
            await secondMockPost.publish();
        });
    });

    it("Downloaded post is same as written post", async function (){
       const actualPost = mockPosts[1];
       const loadedPost = await plebbit.getPostOrComment(actualPost.cid);
       assert.equal(JSON.stringify(actualPost), JSON.stringify(loadedPost), "Downloaded post is missing info");
    });
});