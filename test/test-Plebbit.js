import Plebbit from "../src/Plebbit.mjs";
import Post from "../src/Post.js";
import Author from "../src/Author.js";
import Comment from "../src/Comment.js";
import Subplebbit from "../src/Subplebbit.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import assert from 'assert';

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});

describe("Test Plebbit", async () => {
    it("getPost is working as intended", async () => {
        const postCid = "QmUD5rTHdxrekZkb2A462njzupXJnhj9E3RfxWc34GwJ1h";
        const expectedPost = new Post({
            "subplebbitIpnsName": "k51qzi5uqu5dlbi1ixc95ybwek0grhhjx2b80ji52nzeeh8zb9o2p4rw7xo8mg",
            "author": new Author({
                "displayName": "Test - Rinse",
                "ipnsName": "k51qzi5uqu5dleldjynnnta3hogryf3xozu7ywmqiphofua8azy8g0k18t4olx"
            }),
            "title": "Test title",
            "content": "Test content",
            "timestamp": 1642681561,
            "previousPostCid": null,
            "commentsIpnsName": "k51qzi5uqu5dk7p7vykf6e0chdc288nmn0vzpzlyg98xazghvlqixquml80iof",
            "nestedCommentHelper": null
        });
        const loadedPost = await plebbit.getPost(postCid);
        assert.equal(JSON.stringify(loadedPost), JSON.stringify(expectedPost), "Failed to load test post correctly");
    });

    it("getSubplebbit is working as intended", async () => {
        const subplebbitIpns = "k51qzi5uqu5dlbi1ixc95ybwek0grhhjx2b80ji52nzeeh8zb9o2p4rw7xo8mg";
        const expectedSubplebbit = new Subplebbit({
            "title": "Test subplebbit",
            "description": "This is for testing plebbit-js",
            "moderatorsIpnsNames": [],
            "latestPostCid": null,
            "preloadedPosts": [],
            "pubsubTopic": null
        });
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitIpns);
        assert.equal(JSON.stringify(expectedSubplebbit), JSON.stringify(loadedSubplebbit), "Failed to load test subplebbit");
    });
});