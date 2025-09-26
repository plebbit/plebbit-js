import { expect } from "chai";
import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    mockGatewayPlebbit,
    generateMockVote,
    generateMockComment,
    publishPostToModQueue,
    publishRandomPost
} from "../../../../dist/node/test/test-util.js";

// TODO test skeletons
// comments with approved: false should not be in pageCids.pendingApproval, and should only be in PostUpdates till they're expired
// comment.pendingApproval should not appear in postUpdates
// comment.approved = true is treated like a regular comment, should be pinned to IPFS node as well

describe(`Comment moderation rejection of pending comment`, async () => {
    let plebbit;
    let remotePlebbit;
    let postToBeRejected;
    let replyToBeRejected;
    let publishedPostByMod;
    const reasonForRejection = "Rejection Because of reason" + Math.random();
    let subplebbit;

    before(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockGatewayPlebbit();
        subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
        const modSigner = await plebbit.createSigner();
        await subplebbit.edit({
            roles: {
                [modSigner.address]: { role: "moderator" }
            }
        });

        await subplebbit.edit({ settings: { challenges: [{ ...subplebbit.settings.challenges[0], pendingApproval: true }] } });

        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt);
        publishedPostByMod = await publishRandomPost(subplebbit.address, plebbit, { signer: modSigner, content: "Post by mod" });
        const pending = await publishPostToModQueue({ subplebbit, plebbit: remotePlebbit });
        postToBeRejected = pending.comment;

        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.moderation.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it(`Can reject with approved: false`, async () => {
        const commentModeration = await plebbit.createCommentModeration({
            subplebbitAddress: subplebbit.address,
            signer: publishedPostByMod.signer,
            commentModeration: { approved: false, reason: reasonForRejection },
            commentCid: postToBeRejected.cid
        });

        await publishWithExpectedResult(commentModeration, true);
    });
    it(`Rejecting a pending comment will purge it from modQueue`, async () => {
        await resolveWhenConditionIsTrue(subplebbit, () => !subplebbit.moderation.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
        expect(subplebbit.moderation.pageCids.pendingApproval).to.be.undefined;
    });

    it(`Rejecting a pending comment will not remove it from database of subplebbit`, async () => {
        const queryRes = subplebbit._dbHandler.queryComment(postToBeRejected.cid);
        expect(queryRes).to.be.exist;
    });

    it(`A rejected post will not show up in subplebbit.posts`, async () => {
        expect(subplebbit.posts.pages.hot.comments.find((comment) => comment.cid === postToBeRejected.cid)).to.be.undefined;
    });

    it(`A rejected reply will not show up in its parent's pages`);

    it(`Rejecting a pending comment will still keep it in subplebbit.postUpdates`, async () => {
        expect(subplebbit.postUpdates).to.exist;
        const localMfsPath = `/${subplebbit.address}/postUpdates/86400/${postToBeRejected.cid}/update`;
        const kuboRpc = Object.values(plebbit.clients.kuboRpcClients)[0]._client;

        const res = await kuboRpc.files.stat(localMfsPath); // this call needs to pass because file should exist

        expect(res.size).to.be.greaterThan(0);
    });

    it(`A different mod can publish CommentModeration on top of approved:false, and its props would be picked up`);

    it(`Can update a rejected post and retrieve its update`, async () => {
        const newComment = await remotePlebbit.createComment(postToBeRejected);

        await newComment.update();
        await resolveWhenConditionIsTrue(newComment, () => newComment.updatedAt);

        expect(newComment.approved).to.be.false;
        expect(newComment.reason).to.equal(reasonForRejection);
        expect(newComment.updatedAt).to.be.a("number"); // updatedAt should be published along approved: false
        expect(newComment.upvoteCount).to.equal(0);
        expect(newComment.replyCount).to.equal(0);
        expect(newComment.childCount).to.equal(0);

        expect(newComment.raw.commentUpdate.approved).to.be.false;
        expect(newComment.raw.commentUpdate.reason).to.equal(reasonForRejection);
        expect(newComment.raw.commentUpdate.updatedAt).to.be.a("number"); // updatedAt should be published along approved: false
        expect(newComment.raw.commentUpdate.upvoteCount).to.equal(0);
        expect(newComment.raw.commentUpdate.replyCount).to.equal(0);
        expect(newComment.raw.commentUpdate.childCount).to.equal(0);

        await newComment.stop();
    });

    it(`Publishing approved:false adds removed:true automatically to comment update`, async () => {
        
    })

    it(`A rejected comment will expire and get removed from postUpdates and DB`);
});
