import {Plebbit, Comment} from "../src/index.js"
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import assert from 'assert';
import {loadIpfsFileAsJson, unsubscribeAllPubsubTopics} from "../src/Util.js";
import {SORTED_COMMENTS_TYPES, SortedComments} from "../src/SortHandler.js";

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});

const post = await plebbit.getPostOrComment("QmTUUX3f4xNrdsLU3UHUs11nPbVnk5UsqoW8Kbo2Jvusjh");

const mockComments = [];

async function generateMockComment(parentPostOrComment) {
    const commentTime = Date.now();
    const mockAuthorIpns = await plebbit.ipfsClient.key.gen(`Mock User - ${commentTime}`);
    return new Comment({
        "author": {"displayName": `Mock Author - ${commentTime}`, "ipnsName": mockAuthorIpns["id"]},
        "content": `Mock comment - ${commentTime}`,
        "postCid": parentPostOrComment.postCid,
        "parentCommentCid": parentPostOrComment.commentCid
    }, parentPostOrComment.subplebbit);
}

describe("Test Post and Comment", async function () {
    before(async () => await unsubscribeAllPubsubTopics(plebbit.ipfsClient));

    it("Can publish new comment under post", async function () {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(post);
            mockComment.subplebbit.event.once("comment", async (comment) => {
                const loadedComment = await plebbit.getPostOrComment(comment.commentCid);
                assert.equal(JSON.stringify(loadedComment), JSON.stringify(comment));

                await comment.fetchParent();
                await comment.parent.fetchCommentIpns();
                assert.equal(comment.parent.commentIpns.latestCommentCid, comment.commentCid);
                assert.equal(comment.parent.commentIpns.preloadedComments[0].commentCid, comment.commentCid);
                const loadedParentPost = await plebbit.getPostOrComment(comment.postCid);
                await loadedParentPost.fetchCommentIpns();
                assert.equal(loadedParentPost.commentIpns.latestCommentCid, comment.commentCid.toString(), "Failed to include latest comment in Post");
                mockComments.push(comment);
                resolve();
            });
            mockComment.subplebbit.setProvideCaptchaCallback((challengeWithMsg) => [null, null, ""]);
            await mockComment.subplebbit.startPublishing();
            await mockComment.publish();

        });


    });

    it(`New comments under a post are sorted by their timestamps`, async () => {

        const actualComments = [];
        for (let i = 0; i < 4; i++)
            actualComments.push(await generateMockComment(post));
        await Promise.all(actualComments.map(async post => post.publish()));
        mockComments.push(actualComments[0]);
        const commentIpns = await post.fetchCommentIpns();
        let sortedCommentsPage = new SortedComments(await loadIpfsFileAsJson(commentIpns.sortedCommentsCids[SORTED_COMMENTS_TYPES.NEW], plebbit.ipfsClient));
        let sortedComments = sortedCommentsPage.comments;
        while (sortedCommentsPage.nextSortedCommentsCid) {
            sortedCommentsPage = new SortedComments(await loadIpfsFileAsJson(sortedCommentsPage.nextSortedCommentsCid, plebbit.ipfsClient));
            sortedComments = sortedComments.concat(sortedCommentsPage.comments);
        }
        for (let i = 0; i < sortedComments.length - 1; i++)
            if (sortedComments[i].timestamp < sortedComments[i + 1].timestamp)
                assert.fail("New Comments under a post are not sorted according to their timestamp");

    });


    it("Can publish new comments under comment", async () => {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(mockComments[0]);
            mockComment.subplebbit.event.once("comment", async (comment) => {
                await comment.fetchParent();
                assert.equal(comment.parent.commentCid, mockComments[0].commentCid.toString());
                assert.equal(comment.parentCommentCid, mockComments[0].commentCid.toString());

                await comment.parent.fetchCommentIpns();
                assert.equal(comment.parent.commentIpns.latestCommentCid, comment.commentCid);
                assert.equal(comment.parent.commentIpns.preloadedComments[0].commentCid, comment.commentCid);
                mockComments.push(comment);
                resolve();
            });
            mockComment.subplebbit.setProvideCaptchaCallback((challengeWithMsg) => [null, null, ""]);
            await mockComment.subplebbit.startPublishing();
            await mockComment.publish();
        });
    });
});