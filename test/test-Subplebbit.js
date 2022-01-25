import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import assert from 'assert';
import Subplebbit from "../src/Subplebbit.js";
import Plebbit from "../src/Plebbit.js";
import Post from "../src/Post.js";

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});
const subplebbit = new Subplebbit({
    "title": `Test subplebbit - ${new Date().getMilliseconds()}`
}, plebbit);
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

        // Ready subplebbit for post
        await subplebbit.startPublishing();

        const mockAuthorIpns = await plebbit.ipfsClient.key.gen(`Mock User - ${Date.now()}`);
        const mockPost = new Post({
            "author": {"displayName": "Mock Author", "ipnsId": mockAuthorIpns["id"]},
            "title": "Mock Post", "content": "Mock content", "timestamp": Date.now(),
        }, plebbit, subplebbit);

        await mockPost.publishPost();

        return new Promise((resolve, reject) => {
            subplebbit.on('post', (post) => {
                assert.equal(post.title, mockPost.title, "Failed to publish correct post");
                assert.equal(post.cid, subplebbit.latestPostCid, "Failed to update subplebbit latestPostCid");
                resolve();
            });
        });
    });
});