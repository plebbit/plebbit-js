import { expect } from "chai";
import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    processAllCommentsRecursively,
    mockGatewayPlebbit,
    generateMockVote,
    generateMockComment,
    publishCommentToModQueue,
    publishRandomPost,
    publishToModQueueWithDepth
} from "../../../../dist/node/test/test-util.js";

// TODO test skeletons
// comments with approved: false should not be in pageCids.pendingApproval, and should only be in PostUpdates till they're expired
// comment.pendingApproval should not appear in postUpdates
// comment.approved = true is treated like a regular comment, should be pinned to IPFS node as well
// need to test if comments with approved=false appear in any flattened pages, comment.replies, post.replies, subplebbit.posts

const depthsToTest = [0, 1, 2, 3, 4];

for (const pendingCommentDepth of depthsToTest) {
    describe(`Comment moderation rejection of pending comment with depth ` + pendingCommentDepth, async () => {
        let plebbit;
        let remotePlebbit;
        let commentToBeRejected;
        let modSigner;
        const reasonForRejection = "Rejection of comment with depth " + pendingCommentDepth + " Because of reason" + Math.random();
        let subplebbit;

        before(async () => {
            plebbit = await mockPlebbit();
            remotePlebbit = await mockGatewayPlebbit();
            subplebbit = await plebbit.createSubplebbit();
            await subplebbit.start();
            modSigner = await plebbit.createSigner();
            await subplebbit.edit({
                roles: {
                    [modSigner.address]: { role: "moderator" }
                }
            });

            await subplebbit.edit({ settings: { challenges: [{ ...subplebbit.settings.challenges[0], pendingApproval: true }] } });

            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt);

            const pending = await publishToModQueueWithDepth({
                subplebbit,
                plebbit: remotePlebbit,
                depth: pendingCommentDepth,
                modCommentProps: { signer: modSigner }
            });
            commentToBeRejected = pending.comment;

            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.moderation.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
        });

        after(async () => {
            await subplebbit.delete();
            await plebbit.destroy();
            await remotePlebbit.destroy();
        });

        it(`Can reject post with approved: false`, async () => {
            const commentModeration = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                signer: modSigner,
                commentModeration: { approved: false, reason: reasonForRejection },
                commentCid: commentToBeRejected.cid
            });

            await publishWithExpectedResult(commentModeration, true);
        });

        it(`Rejecting a pending post will purge it from modQueue`, async () => {
            await resolveWhenConditionIsTrue(subplebbit, () => !subplebbit.moderation.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
            expect(subplebbit.moderation.pageCids.pendingApproval).to.be.undefined;
        });

        it(`Rejecting a pending comment will not remove it from database of subplebbit`, async () => {
            const queryRes = subplebbit._dbHandler.queryComment(commentToBeRejected.cid);
            expect(queryRes).to.be.exist;
        });

        it(`A rejected comment will not show up in subplebbit.posts`, async () => {
            if (!subplebbit.posts.pages.hot) return;
            let foundInPosts = false;
            processAllCommentsRecursively(subplebbit.posts.pages.hot.comments, (comment) => {
                if (comment.cid === commentToBeRejected.cid) {
                    foundInPosts = true;
                    return;
                }
            });
            expect(foundInPosts).to.be.false;
        });

        if (pendingCommentDepth === 0)
            it(`Rejecting a pending post will still keep it in subplebbit.postUpdates`, async () => {
                expect(subplebbit.postUpdates).to.exist;
                const localMfsPath = `/${subplebbit.address}/postUpdates/86400/${commentToBeRejected.cid}/update`;
                const kuboRpc = Object.values(plebbit.clients.kuboRpcClients)[0]._client;

                const res = await kuboRpc.files.stat(localMfsPath); // this call needs to pass because file should exist

                expect(res.size).to.be.greaterThan(0);
            });

        it(`A different mod can publish CommentModeration on top of approved:false, and its props would be picked up`);

        if (pendingCommentDepth === 0)
            // TODO remove this later when we implement a fix for updating a reply with approved=false
            it(`Can update a rejected comment and retrieve its update`, async () => {
                const newComment = await remotePlebbit.createComment(commentToBeRejected);

                await newComment.update();
                await resolveWhenConditionIsTrue(newComment, () => newComment.updatedAt);

                expect(newComment.approved).to.be.false;
                expect(newComment.reason).to.equal(reasonForRejection);
                expect(newComment.updatedAt).to.be.a("number"); // updatedAt should be published along approved: false
                expect(newComment.upvoteCount).to.equal(0);
                expect(newComment.replyCount).to.equal(0);
                expect(newComment.childCount).to.equal(0);
                // `Publishing approved:false adds removed:true automatically to comment update
                expect(newComment.removed).to.be.true;

                expect(newComment.raw.commentUpdate.approved).to.be.false;
                expect(newComment.raw.commentUpdate.reason).to.equal(reasonForRejection);
                expect(newComment.raw.commentUpdate.updatedAt).to.be.a("number"); // updatedAt should be published along approved: false
                expect(newComment.raw.commentUpdate.upvoteCount).to.equal(0);
                expect(newComment.raw.commentUpdate.replyCount).to.equal(0);
                expect(newComment.raw.commentUpdate.childCount).to.equal(0);

                expect(newComment.raw.commentUpdate.removed).to.be.true;

                await newComment.stop();
            });

        it(`A rejected post will expire and get removed from postUpdates and DB`);
    });
}

describe(`Rejection of post`, async () => {});

describe(`Rejection of replies`, async () => {
    let plebbit;
    let remotePlebbit;
    let replyToBeRejected;
    let modSigner;
    let publishedPostByMod;
    const reasonForRejection = "Rejecting reply Because of reason" + Math.random();
    let subplebbit;

    before(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockGatewayPlebbit();
        subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
        modSigner = await plebbit.createSigner();
        await subplebbit.edit({
            roles: {
                [modSigner.address]: { role: "moderator" }
            }
        });

        await subplebbit.edit({ settings: { challenges: [{ ...subplebbit.settings.challenges[0], pendingApproval: true }] } });

        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt);
        publishedPostByMod = await publishRandomPost(subplebbit.address, plebbit, { signer: modSigner, content: "Post by mod" });

        const pendingReply = await publishCommentToModQueue({ parentComment: publishedPostByMod, subplebbit, plebbit: remotePlebbit });

        replyToBeRejected = pendingReply.comment;

        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.moderation.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it(`A rejected reply will not show up in its parent's pages`);
});
