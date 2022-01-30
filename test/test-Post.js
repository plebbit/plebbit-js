import Plebbit from "../src/Plebbit.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import Comment from "../src/Comment.js";
import assert from 'assert';

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});

const post = await plebbit.getPostOrComment("QmaUA9jUp3CH96usYNwYXe58HnaxjeAHKKhthk55XNTU2d");

const mockComments = [];

async function generateMockComment(parentPostOrComment) {
    const mockAuthorIpns = await plebbit.ipfsClient.key.gen(`Mock User - ${Date.now()}`);
    return new Comment({
        "author": {"displayName": `Mock Author - ${Date.now()}`, "ipnsKeyId": mockAuthorIpns["id"]},
        "content": `Mock comment - ${Date.now()}`, "timestamp": Date.now(),
        "postCid": parentPostOrComment.postCid,
        ...(parentPostOrComment.getType() === "comment" && {"parentCommentCid": parentPostOrComment.commentCid})

    }, plebbit, parentPostOrComment.subplebbit);
}

describe("Test Post and Comment", async function () {

    it("Can publish new comment under post", async function () {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(post);
            mockComment.subplebbit.once("comment", async (comment) => {
                const loadedComment = await plebbit.getPostOrComment(comment.commentCid);
                assert.equal(JSON.stringify(loadedComment), JSON.stringify(comment));

                await comment.fetchParent();
                await comment.parent.fetchCommentIpns();
                assert.equal(comment.parent.commentIpns.latestCommentCid, comment.commentCid.toString());
                assert.equal(comment.parent.commentIpns.preloadedComments[0].commentCid, comment.commentCid.toString());
                //
                const loadedParentPost = await plebbit.getPostOrComment(comment.postCid);
                await loadedParentPost.fetchCommentIpns();
                assert.equal(loadedParentPost.commentIpns.latestCommentCid, comment.commentCid.toString(), "Failed to include latest comment in Post");
                mockComments.push(comment);
                resolve();
            });
            await mockComment.subplebbit.startPublishing();
            await mockComment.publish();

        });


    });
    it("Can publish new comments under comments", async () => {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(mockComments[0]);
            mockComment.subplebbit.once("comment", async (comment) => {
                await comment.fetchParent();
                assert.equal(comment.parent.commentCid, mockComments[0].commentCid.toString());
                assert.equal(comment.parentCommentCid, mockComments[0].commentCid.toString());

                await comment.parent.fetchCommentIpns();
                assert.equal(comment.parent.commentIpns.latestCommentCid, comment.commentCid.toString());
                assert.equal(comment.parent.commentIpns.preloadedComments[0].commentCid, comment.commentCid.toString());
                mockComments.push(comment);
                resolve();
            });
            await mockComment.subplebbit.startPublishing();
            await mockComment.publish();
        });
    });

});