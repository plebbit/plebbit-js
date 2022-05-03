import {Plebbit} from "../src/index.js";
import {
    IPFS_CLIENT_CONFIGS,
    TEST_COMMENT_POST_CID,
    TEST_PLEBBIT_POST_CID,
    TEST_PLEBBIT_SUBPLEBBIT_ADDRESS
} from "../secrets.js";
import assert from 'assert';
import {generateMockPost} from "./MockUtil.js";
import Post from "../src/Post.js";
import {Comment} from "../src/Comment.js";
import {
    loadIpfsFileAsJson,
    loadIpnsAsJson,
    removeKeys,
    removeKeysWithUndefinedValues,
    unsubscribeAllPubsubTopics
} from "../src/Util.js";

const serverPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[0]});
const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});

const subplebbit = await serverPlebbit.createSubplebbit({subplebbitAddress: TEST_PLEBBIT_SUBPLEBBIT_ADDRESS});

describe("Test Plebbit", async () => {
    before(async () => await unsubscribeAllPubsubTopics([serverPlebbit.ipfsClient, clientPlebbit.ipfsClient]));
    before(async () => {
        subplebbit.setProvideCaptchaCallback((challengeWithMsg) => [null, null]);
        await subplebbit.startPublishing();
    });
    after(async () => await subplebbit.stopPublishing());

    it("getComment fetches a post correctly", async () => {
        const expectedPostProps = await loadIpfsFileAsJson(TEST_PLEBBIT_POST_CID, clientPlebbit);
        const expectedPost = await clientPlebbit.createComment(expectedPostProps);
        const loadedPost = await clientPlebbit.getComment(TEST_PLEBBIT_POST_CID);
        assert.equal(loadedPost instanceof Post && expectedPost instanceof Post, true, "Post should be instantiated as a post");
        assert.equal(JSON.stringify(removeKeys(removeKeysWithUndefinedValues(loadedPost), ["postCid", "cid"])), JSON.stringify(removeKeys(removeKeysWithUndefinedValues(expectedPost), ["postCid", "cid"])), "Failed to load test post correctly");
    });

    it("getComment fetches a comment correctly", async () => {
        const expectedCommentProps = await loadIpfsFileAsJson(TEST_COMMENT_POST_CID, clientPlebbit);
        const expectedComment = await clientPlebbit.createComment(expectedCommentProps);
        const loadedComment = await clientPlebbit.getComment(TEST_COMMENT_POST_CID);
        assert.equal(loadedComment instanceof Comment && expectedComment instanceof Comment, true, "")
        assert.equal(JSON.stringify(removeKeys(removeKeysWithUndefinedValues(loadedComment), ["postCid", "cid"])), JSON.stringify(removeKeys(removeKeysWithUndefinedValues(expectedComment), ["postCid", "cid"])), "Failed to load test comment correctly");
    });

    it("getSubplebbit fetches subplebbit correctly", async () => {
        const _subplebbitIpns = await loadIpnsAsJson(TEST_PLEBBIT_SUBPLEBBIT_ADDRESS, clientPlebbit);
        const expectedSubplebbit = await clientPlebbit.createSubplebbit(_subplebbitIpns);
        const loadedSubplebbit = await clientPlebbit.getSubplebbit(TEST_PLEBBIT_SUBPLEBBIT_ADDRESS);
        assert.equal(JSON.stringify(expectedSubplebbit), JSON.stringify(loadedSubplebbit), "Failed to load test subplebbit");
    });

    it("Can load IPFS and IPNS without ipfs client (using ipfsHttpGateway) ", async () => {
        const plebbit = await Plebbit(); // This will initialize a plebbit instance with ipfsHttpGatewayUrl = "https://cloudflare-ipfs.com" and pubsubHttpClientOptions = https://pubsubprovider.xyz
        const expectedPostProps = await loadIpfsFileAsJson(TEST_PLEBBIT_POST_CID, plebbit);
        const expectedPost = await plebbit.createComment(expectedPostProps);
        const loadedPost = await plebbit.getComment(TEST_PLEBBIT_POST_CID);
        assert.equal(JSON.stringify(removeKeys(removeKeysWithUndefinedValues(loadedPost), ["postCid", "cid"])), JSON.stringify(removeKeys(removeKeysWithUndefinedValues(expectedPost), ["postCid", "cid"])), "Failed to load test post correctly");
        const updatedPost = await expectedPost.update();
        if (!updatedPost.updatedAt)
            assert.fail("Failed to load IPNS without IPFS node");
    });

    it("Can publish post on subplebbit with pubsub provider", async () => {
        return new Promise(async (resolve, reject) => {
            const plebbit = await Plebbit();
            const comment = await generateMockPost(subplebbit.subplebbitAddress, plebbit);

            await comment.publish();

            comment.once("challengeverification", async ([challengeVerificationMessage, updatedComment]) => {
                assert.equal(challengeVerificationMessage.challengePassed, true);

                comment.once("update", async (updatedComment) => {
                    if (!comment.updatedAt)
                        assert.fail("Comment has not been included in subplebbit");
                    resolve();
                });
                await comment.update();

            });
        });

    });
});