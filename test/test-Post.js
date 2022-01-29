import Plebbit from "../src/Plebbit.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import Comment from "../src/Comment.js";
import assert from 'assert';

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});

// const subplebbit = await plebbit.getSubplebbit("k2k4r8llrfmbcn1h7byyokfr6xbbsp1kgmxq3xgik73lkjpw4y7w12qd");
const post = await plebbit.getPostOrComment("QmbWfG4w2T8RhM7hBgfWziDYTN7fnnpAMMEA7dkUozc3E1");

async function generateMockComment(parentPostOrComment) {
    const mockAuthorIpns = await plebbit.ipfsClient.key.gen(`Mock User - ${Date.now()}`);
    return new Comment({
        "author": {"displayName": `Mock Author - ${Date.now()}`, "ipnsKeyId": mockAuthorIpns["id"]},
        "content": `Mock comment - ${Date.now()}`, "timestamp": Date.now(),
        "postCid": parentPostOrComment.postCid

    }, plebbit, parentPostOrComment.subplebbit);
}

describe("Test Post and Comment", async function () {

    it("Can publish new comment under post", async function () {
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(post);
            mockComment.subplebbit.once("comment", async (comment) => {
                const loadedComment = await plebbit.getPostOrComment(comment.commentCid);
                assert.equal(JSON.stringify(loadedComment), JSON.stringify(comment));

                await comment.fetchParentPost();
                await comment.parentPost.fetchCommentIpns();
                assert.equal(comment.parentPost.commentIpns.latestCommentCid, comment.commentCid.toString());
                assert.equal(comment.parentPost.commentIpns.preloadedComments[0].commentCid, comment.commentCid.toString());
                //
                const loadedParentPost = await plebbit.getPostOrComment(comment.postCid);
                await loadedParentPost.fetchCommentIpns();
                assert.equal(loadedParentPost.commentIpns.latestCommentCid, comment.commentCid.toString(), "Failed to include latest comment in Post");
                resolve();
            });
            await mockComment.subplebbit.startPublishing();
            await mockComment.publish();

        });


    });

});