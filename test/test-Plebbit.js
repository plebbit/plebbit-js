import Plebbit from "../src/index.js";
import {
    IPFS_CLIENT_CONFIGS
} from "../secrets.js";
import assert from 'assert';
import Post from "../src/Post.js";
import {Comment} from "../src/Comment.js";
import {
    loadIpfsFileAsJson,
    loadIpnsAsJson,
    removeKeys,
    removeKeysWithUndefinedValues,
    unsubscribeAllPubsubTopics
} from "../src/Util.js";
import {getLatestSubplebbitAddress} from "./MockUtil.js";

const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});


describe("Test Plebbit", async () => {
    before(async () => await unsubscribeAllPubsubTopics([clientPlebbit.ipfsClient]));

    it("getComment fetches a post correctly", async () => {
        const subplebbit = await clientPlebbit.getSubplebbit(await getLatestSubplebbitAddress());
        await subplebbit.update();
        const expectedPostProps = await loadIpfsFileAsJson(subplebbit.latestPostCid, clientPlebbit);
        const expectedPost = await clientPlebbit.createComment(expectedPostProps);
        const loadedPost = await clientPlebbit.getComment(subplebbit.latestPostCid);
        assert.equal(loadedPost instanceof Post && expectedPost instanceof Post, true, "Post should be instantiated as a post");
        assert.equal(JSON.stringify(removeKeys(removeKeysWithUndefinedValues(loadedPost), ["postCid", "cid"])), JSON.stringify(removeKeys(removeKeysWithUndefinedValues(expectedPost), ["postCid", "cid"])), "Failed to load test post correctly");
    });

    it("getComment fetches a comment correctly", async () => {
        const subplebbit = await clientPlebbit.getSubplebbit(await getLatestSubplebbitAddress());
        await subplebbit.update();
        const commentCid = subplebbit.posts.pages.hot.comments.filter(comment => comment.replyCount > 0)[0].replies.pages.topAll.comments[0].cid;
        const expectedCommentProps = await loadIpfsFileAsJson(commentCid, clientPlebbit);
        const expectedComment = await clientPlebbit.createComment(expectedCommentProps);
        const loadedComment = await clientPlebbit.getComment(commentCid);
        assert.equal(loadedComment instanceof Comment && expectedComment instanceof Comment, true, "")
        assert.equal(JSON.stringify(removeKeys(removeKeysWithUndefinedValues(loadedComment), ["postCid", "cid"])), JSON.stringify(removeKeys(removeKeysWithUndefinedValues(expectedComment), ["postCid", "cid"])), "Failed to load test comment correctly");
    });

    it("getSubplebbit fetches subplebbit correctly", async () => {
        const subplebbitAddress = await getLatestSubplebbitAddress();
        const _subplebbitIpns = await loadIpnsAsJson(subplebbitAddress, clientPlebbit);
        const expectedSubplebbit = await clientPlebbit.createSubplebbit(_subplebbitIpns);
        const loadedSubplebbit = await clientPlebbit.getSubplebbit(subplebbitAddress);
        assert.equal(JSON.stringify(expectedSubplebbit), JSON.stringify(loadedSubplebbit), "Failed to load test subplebbit");
    });

    it("Can load IPFS and IPNS without ipfs client (using ipfsHttpGateway) ", async () => {
        const plebbit = await Plebbit(); // This will initialize a plebbit instance with ipfsHttpGatewayUrl = "https://cloudflare-ipfs.com" and pubsubHttpClientOptions = https://pubsubprovider.xyz
        const subplebbit = await plebbit.getSubplebbit(await getLatestSubplebbitAddress());
        await subplebbit.update();
        const expectedPostProps = await loadIpfsFileAsJson(subplebbit.latestPostCid, plebbit);
        const expectedPost = await plebbit.createComment(expectedPostProps);
        const loadedPost = await plebbit.getComment(subplebbit.latestPostCid);
        assert.equal(JSON.stringify(removeKeys(removeKeysWithUndefinedValues(loadedPost), ["postCid", "cid"])), JSON.stringify(removeKeys(removeKeysWithUndefinedValues(expectedPost), ["postCid", "cid"])), "Failed to load test post correctly");
        const updatedPost = await expectedPost.update();
        if (!updatedPost.updatedAt)
            assert.fail("Failed to load IPNS without IPFS node");
    });

});