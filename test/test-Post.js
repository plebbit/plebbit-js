import Plebbit from "../src/Plebbit.js";
import {IPFS_API_URL, IPFS_GATEWAY_URL} from "../secrets.js";
import Comment from "../src/Comment.js";
import assert from 'assert';

const plebbit = new Plebbit({ipfsGatewayUrl: IPFS_GATEWAY_URL, ipfsApiUrl: IPFS_API_URL});

// const subplebbit = await plebbit.getSubplebbit("k2k4r8llrfmbcn1h7byyokfr6xbbsp1kgmxq3xgik73lkjpw4y7w12qd");
const post = await plebbit.getPostOrComment("QmdUAiigiZRyzrpotXpPCiHu69XryGFmGw5aN8xg21Evia");

async function generateMockComment(parentPostOrComment) {
    const mockAuthorIpns = await plebbit.ipfsClient.key.gen(`Mock User - ${Date.now()}`);
    return new Comment({
        "author": {"displayName": `Mock Author - ${Date.now()}`, "ipnsId": mockAuthorIpns["id"]},
        "title": `Mock Comment - ${Date.now()}`, "content": `Mock comment - ${Date.now()}`, "timestamp": Date.now(),

    }, plebbit, parentPostOrComment);
}
describe("Test Post and Comment", async function(){

    it("Can publish new comment under post", async function(){
        return new Promise(async (resolve, reject) => {
            const mockComment = await generateMockComment(post);
            mockComment.subplebbit.once("comment", async (comment) => {
                const loadedComment = await plebbit.getPostOrComment(comment.cid);
                assert.equal(JSON.stringify(loadedComment), JSON.stringify(comment));

                await comment.parentPostOrComment.fetchPostIpns();
                assert.equal(comment.parentPostOrComment.postIpns.latestCommentCid, comment.cid.toString());
                assert.equal(comment.parentPostOrComment.postIpns.preloadedComments[0].cid, comment.cid.toString());
                //
                const loadedParentPost = await plebbit.getPostOrComment(comment.parentPostOrCommentCid);
                await loadedParentPost.fetchPostIpns();
                assert.equal(loadedParentPost.postIpns.latestCommentCid,comment.cid.toString(), "Failed to include latest comment in Post");
                resolve();
            });
            await mockComment.subplebbit.startPublishing();
            await mockComment.publish();

        });


    });

});