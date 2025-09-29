import { expect } from "chai";
import {
    mockPlebbit,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    processAllCommentsRecursively,
    forceSubplebbitToGenerateAllRepliesPages,
    mockGatewayPlebbit,
    forceSubplebbitToGenerateAllPostsPages,
    publishToModQueueWithDepth,
    loadAllPages
} from "../../../../dist/node/test/test-util.js";

const depthsToTest = [0, 1, 2, 3, 4];

for (const pendingCommentDepth of depthsToTest) {
    describe(`Approved comments after pending approval, with depth ` + pendingCommentDepth, async () => {
        let plebbit, subplebbit, approvedComment, modSigner, remotePlebbit;

        before(async () => {
            plebbit = await mockPlebbit();
            remotePlebbit = await mockGatewayPlebbit();
            subplebbit = await plebbit.createSubplebbit();
            await subplebbit.start();
            modSigner = await plebbit.createSigner();
            await subplebbit.edit({
                roles: {
                    [modSigner.address]: { role: "moderator" }
                },
                settings: { challenges: [{ ...subplebbit.settings.challenges[0], pendingApproval: true }] }
            });

            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt);

            expect(Object.keys(subplebbit.moderation.pageCids)).to.deep.equal([]); // should be empty

            const pending = await publishToModQueueWithDepth({
                subplebbit,
                plebbit: remotePlebbit,
                depth: pendingCommentDepth,
                modCommentProps: { signer: modSigner }
            });
            approvedComment = pending.comment;

            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.moderation.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
            await approvedComment.update();
        });

        after(async () => {
            await subplebbit.delete();
            await plebbit.destroy();
        });

        it("Should approve comment using createCommentModeration with approved: true", async () => {
            const commentModeration = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                signer: modSigner,
                commentModeration: { approved: true },
                commentCid: pendingComment.cid
            });

            await publishWithExpectedResult(commentModeration, true);
        });
        it(`Approved comment is pinned to IPFS node`);

        it(`pending comment after approval will receive updates now`, async () => {
            await resolveWhenConditionIsTrue(approvedComment, () => approvedComment.updatedAt);
            expect(pendingComment.updatedAt).to.be.a("number");
            expect(pendingComment.pendingApproval).to.be.false;
        });

        it(`Approved comment now appears in subplebbit.posts`, async () => {
            expect(subplebbit.posts.pages.hot.comments[0].cid).to.equal(pendingComment.cid); // should be included in pages now

            // TODO should include checks for pageCids
        });

        if (pendingCommentDepth > 0) {
            it(`Approved reply now shows up in parentComment.replies`);
            it(`Approved reply now shows up in its post's flat pages`);
            it(`Approved reply does now show up in parentComment.las`);
        }

        if (pendingCommentDepth === 0)
            it(`Approved post is now reflected in lastPostCid`, async () => {
                expect(subplebbit.lastPostCid).to.equal(pendingComment.cid);
            });

        it(`Approved comment now appears in subplebbit.lastCommentCid`, async () => {
            expect(subplebbit.lastCommentCid).to.equal(pendingComment.cid);
        });

        it(`Approved comment does not appear in modQueue.pageCids`, async () => {
            expect(subplebbit.moderation.pageCids.pendingApproval).to.be.undefined;
        });
        it(`Approved comment shows up in subplebbit.postUpdates`, async () => {
            expect(Object.keys(subplebbit.postUpdates)).to.deep.equal(["86400"]); // should have postUpdates now that we approved hte comment
        });
    });
}
