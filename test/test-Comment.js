import {Plebbit} from "../src/index.js"
import {IPFS_CLIENT_CONFIGS, TEST_COMMENT_POST_CID} from "../secrets.js";
import assert from 'assert';
import {loadIpfsFileAsJson, timestamp, unsubscribeAllPubsubTopics} from "../src/Util.js";
import {SORTED_COMMENTS_TYPES} from "../src/SortHandler.js";
import {generateMockComment} from "./MockUtil.js";

const clientPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[1]});

const post = await clientPlebbit.getPostOrComment(TEST_COMMENT_POST_CID);

const serverPlebbit = await Plebbit({ipfsHttpClientOptions: IPFS_CLIENT_CONFIGS[0]});
const subplebbit = await serverPlebbit.createSubplebbit({"subplebbitAddress": post.subplebbitAddress});


const mockComments = [];
describe("Test Post and Comment", async function () {
    before(async () => await unsubscribeAllPubsubTopics([serverPlebbit.ipfsClient, clientPlebbit.ipfsClient]));
    before(async () => {
        subplebbit.setProvideCaptchaCallback((challengeWithMsg) => [null, null]);
        await subplebbit.startPublishing();
    });
    after(async () => await post.subplebbit.stopPublishing());
    after(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));


    it("Can publish new comment under post", async function () {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(post, clientPlebbit);
            await post.update();
            const originalReplyCount = post.replyCount;

            await mockComment.publish();
            post.once("update", async updatedPost => {
                const loadedComment = await clientPlebbit.getPostOrComment(mockComment.commentCid);
                loadedComment.once("update", async updatedMockComment => {
                    assert.equal(updatedMockComment.depth, 1, "Depth of comment under post should be 1");


                    const latestCommentCid = (await loadIpfsFileAsJson(updatedPost.sortedRepliesCids[SORTED_COMMENTS_TYPES.NEW], clientPlebbit.ipfsClient)).comments[0].commentCid;
                    assert.equal(latestCommentCid, updatedMockComment.commentCid);
                    assert.equal(post.replyCount, originalReplyCount + 1, "Failed to update reply count");
                    mockComments.push(mockComment);
                    resolve();

                });
                loadedComment.update();

            });
        });
    });

    it("Can edit a comment", async function () {
        return new Promise(async (resolve, reject) => {
            const editedText = "edit test";
            await mockComments[0].update();
            const commentEdit = await clientPlebbit.createCommentEdit({
                ...mockComments[0].toJSON(),
                "editedContent": editedText
            });
            await commentEdit.publish();
            commentEdit.once("challengeverification", async ([challengeVerificationMessage, updatedCommentEdit]) => {
                mockComments[0].once("update", async updatedComment => {
                    const loadedPost = await clientPlebbit.getPostOrComment(mockComments[0].commentCid);
                    await loadedPost.update();
                    assert.equal(updatedComment.editedContent, editedText, "Comment has not been edited");
                    resolve();
                });


            });
        });
    });


    it("Can publish new comments under comment", async () => {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(mockComments[0], clientPlebbit);
            await mockComments[0].update();
            const originalReplyCount = mockComments[0].replyCount;
            await mockComment.publish();
            mockComments[0].once("update", async updatedParentComment => {
                assert.equal(mockComment.parentCid, updatedParentComment.commentCid);
                assert.equal(mockComment.depth, 2, "Depth of comment under a comment should be 2");
                const parentLatestCommentCid = (await loadIpfsFileAsJson(updatedParentComment.sortedRepliesCids[SORTED_COMMENTS_TYPES.NEW], clientPlebbit.ipfsClient)).comments[0].commentCid;
                assert.equal(parentLatestCommentCid, mockComment.commentCid);
                assert.equal(updatedParentComment.replyCount, originalReplyCount + 1);
                mockComments.push(mockComment);
                resolve();
            });
        });
    });
});