import {Plebbit} from "../src/index.js"
import {IPFS_API_URL, IPFS_GATEWAY_URL, TEST_COMMENT_POST_CID} from "../secrets.js";
import assert from 'assert';
import {loadIpfsFileAsJson, sleep, unsubscribeAllPubsubTopics} from "../src/Util.js";
import {SORTED_COMMENTS_TYPES, SortedComments} from "../src/SortHandler.js";
import {generateMockComment} from "./MockUtil.js";

const plebbit = await Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});

const post = await plebbit.getPostOrComment(TEST_COMMENT_POST_CID);

const mockComments = [];
describe("Test Post and Comment", async function () {
    before(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));
    before(async () => {
        post.subplebbit.setProvideCaptchaCallback((challengeWithMsg) => [null, null]);
        await post.subplebbit.startPublishing();
    });
    after(async () => await post.subplebbit.stopPublishing());
    after(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));


    it("Can publish new comment under post", async function () {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(post, post.subplebbit);
            await post.update();
            const originalReplyCount = post.replyCount;
            mockComment.publish().then(async (challengeVerificationMessage) => {
                const loadedComment = await plebbit.getPostOrComment(mockComment.commentCid);
                await loadedComment.update();
                assert.equal(JSON.stringify(loadedComment), JSON.stringify(mockComment));
                assert.equal(loadedComment.depth, 1, "Depth of comment under post should be 1");

                await mockComment.fetchParent();
                await mockComment.parent.update();
                const latestCommentCid = (await loadIpfsFileAsJson(mockComment.parent.sortedRepliesCids[SORTED_COMMENTS_TYPES.NEW], plebbit.ipfsClient)).comments[0].commentCid;
                assert.equal(latestCommentCid, mockComment.commentCid);
                await post.update();
                assert.equal(post.replyCount, originalReplyCount + 1, "Failed to update reply count");
                mockComments.push(mockComment);
                resolve();
            }).catch(reject);
        });
    });

    it("Can edit a comment", async function () {
        return new Promise(async (resolve, reject) => {
            const editedText = "edit test";
            const commentEdit = await plebbit.createCommentEdit({
                ...mockComments[0].toJSON(),
                "editedContent": editedText
            });
            commentEdit.publish(null, null).then(async challengeVerificationMessage => {
                const loadedPost = await plebbit.getPostOrComment(challengeVerificationMessage.publication.commentCid);
                await loadedPost.update();
                assert.equal(loadedPost.editedContent, editedText, "Comment has not been edited");
                resolve();
            }).catch(reject);
        });
    });

    it(`New comments under a post are sorted by their timestamps`, async () => {

        const actualComments = [];
        for (let i = 0; i < 4; i++) {
            actualComments.push(await generateMockComment(post, post.subplebbit));
            await sleep(1000);
        }
        await post.update();
        const originalReplyCount = post.replyCount;
        await Promise.all(actualComments.map(async post => post.publish()));
        mockComments.push(actualComments[0]);
        await sleep(10000);
        await post.update();
        let sortedCommentsPage = new SortedComments(await loadIpfsFileAsJson(post.sortedRepliesCids[SORTED_COMMENTS_TYPES.NEW], plebbit.ipfsClient));
        let sortedComments = sortedCommentsPage.comments;
        while (sortedCommentsPage.nextSortedCommentsCid) {
            sortedCommentsPage = new SortedComments(await loadIpfsFileAsJson(sortedCommentsPage.nextSortedCommentsCid, plebbit.ipfsClient));
            sortedComments = sortedComments.concat(sortedCommentsPage.comments);
        }
        for (let i = 0; i < sortedComments.length - 1; i++)
            if (sortedComments[i].timestamp < sortedComments[i + 1].timestamp)
                assert.fail("New Comments under a post are not sorted according to their timestamp");
        await post.update();
        assert.equal(post.replyCount, originalReplyCount + actualComments.length, "Reply count failed to update");
    });


    it("Can publish new comments under comment", async () => {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(mockComments[0], mockComments[0].subplebbit);
            await mockComments[0].update();
            const originalReplyCount = mockComments[0].replyCount;
            mockComment.publish().then(async challengeVerificationMessage => {
                await mockComment.fetchParent();
                assert.equal(mockComment.parent.commentCid, mockComments[0].commentCid);
                assert.equal(mockComment.parentCid, mockComments[0].commentCid);
                assert.equal(mockComment.depth, 2, "Depth of comment under a comment should be 2");
                await mockComment.parent.update();
                const latestCommentCid = (await loadIpfsFileAsJson(mockComment.parent.sortedRepliesCids[SORTED_COMMENTS_TYPES.NEW], plebbit.ipfsClient)).comments[0].commentCid;
                assert.equal(latestCommentCid, mockComment.commentCid);
                assert.equal(mockComment.parent.replyCount, originalReplyCount + 1);
                mockComments.push(mockComment);
                resolve();
            }).catch(reject);
        });
    });
});