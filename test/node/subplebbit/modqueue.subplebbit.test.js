import { expect } from "chai";
import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    itSkipIfRpc,
    createSubWithNoChallenge,
    mockGatewayPlebbit,
    publishRandomPost,
    mockPlebbitNoDataPathWithOnlyKuboClient
} from "../../../dist/node/test/test-util.js";
import { messages } from "../../../dist/node/errors.js";

const publishCommentToModQueue = async (subplebbit) => {
    const remotePlebbit = await mockGatewayPlebbit({ forceMockPubsub: true, remotePlebbit: true }); // this plebbit is not connected to kubo rpc client of subplebbit
    const pendingComment = await generateMockPost(subplebbit.address, remotePlebbit, false, {
        content: "Pending comment" + Math.random()
    });
    pendingComment.removeAllListeners("challenge");

    pendingComment.once("challenge", async () => {
        await pendingComment.publishChallengeAnswers([Math.random() + "12"]); // wrong answer
    });

    const challengeVerificationPromise = new Promise((resolve) => pendingComment.once("challengeverification", resolve));

    await publishWithExpectedResult(pendingComment, true); // a pending approval is technically challengeSucess = true

    return { pendingComment, challengeVerification: await challengeVerificationPromise };
};

// Skeleton tests added for pending approval and modqueue edge cases
// mod queue pages should not have comments with depth 0 and pageIpfs.comments[x].comment.postCid defined
// need to test when we no longer have pending comments, modQueue pageCids should be undefined
// approved in comment moderation field should only be used for pending comments
// commentEdit should be rejected on a pending comment
// we should reject any commentedit/votes/replies under a pending comment
describe(`Pending approval modqueue functionality`, async () => {
    let plebbit, subplebbit, pendingComment, modSigner;

    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
        modSigner = await plebbit.createSigner();
        await subplebbit.edit({
            roles: {
                [modSigner.address]: { role: "moderator" }
            }
        });
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    describe("Challenge with pendingApproval", () => {
        it("Should support pendingApproval field in challenge settings", async () => {
            // TODO: Test that challenges can have pendingApproval: true field
            const newUpdatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
            await subplebbit.edit({ settings: { challenges: [{ ...subplebbit.settings.challenges[0], pendingApproval: true }] } });
            expect(subplebbit.settings.challenges[0].pendingApproval).to.be.true;
            await newUpdatePromise;
        });

        it("Should reflect settings in subplebbit.challenges[x].pendingApproval", async () => {
            expect(subplebbit.challenges[0].pendingApproval).to.be.true;
        });

        it("Should put failed publication in pending approval queue when challenge has pendingApproval: true", async () => {
            // TODO: Test that when a challenge with pendingApproval fails,
            // the publication goes to pending approval instead of being rejected
            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt);

            const pending = await publishCommentToModQueue(subplebbit);
            pendingComment = pending.pendingComment;

            expect(pendingComment.publishingState).to.equal("succeeded");
            expect(pendingComment.cid).to.be.a("string");
            const verification = pending.challengeVerification;
            expect(verification.commentUpdate.pendingApproval).to.be.true;
            expect(Object.keys(verification.commentUpdate).sort()).to.deep.equal([
                "author",
                "cid",
                "pendingApproval",
                "protocolVersion",
                "signature"
            ]);
        });

        it("Should not include pendingApproval in commentIpfs", async () => {
            // TODO: Test that pendingApproval field is not stored in IPFS content
            expect(pendingComment.raw.comment.pendingApproval).to.not.exist;
        });

        // TODO: Test that pending approval can exclude certain types
        // TODO need to test for publications that should not support pending approval
        // like vote, subplebbitEdit, commentModeration, commentEdit
        // (e.g., only posts, not replies)

        it("Should exclude specific publication types from pending approval");
    });

    describe("Pending approval storage", () => {
        it("Should store pending approval comments in subplebbit.moderation.pageCids.pendingApproval", async () => {
            // TODO: Test that pending comments are stored in correct location
            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.modQueue.pageCids?.pendingApproval);
            const page = await subplebbit.modQueue.getPage(subplebbit.modQueue.pageCids?.pendingApproval);
            expect(page.comments.length).to.equal(1);
            const pendingCommentInPage = page.comments[0];
            expect(pendingCommentInPage.cid).to.equal(pendingComment.cid);
            expect(pendingCommentInPage.updatedAt).to.be.undefined;
            expect(pendingCommentInPage.pendingApproval).to.be.true;
        });

        it(`pending post should not have postCid defined at its pages`, async () => {
            const pageRaw = JSON.parse(await plebbit.fetchCid(subplebbit.modQueue.pageCids?.pendingApproval));
            expect(pageRaw.comments[0].comment.postCid).to.be.undefined;
        });

        it(`pending comment should not appear in subplebbit.lastPostCid or subplebbit.lastCommentCid`, async () => {
            expect(subplebbit.lastPostCid).to.not.equal(pendingComment.cid);
            expect(subplebbit.lastCommentCid).to.not.equal(pendingComment.cid);
        });

        it(`pending comment should not appear in subplebbit.postUpdates`, async () => {
            expect(subplebbit.postUpdates).to.be.undefined;
        });

        it(`Pending comment should not be pinned in ipfs node`, async () => {
            const kuboRpc = Object.values(plebbit.clients.kuboRpcClients)[0]._client;
            // Collect all pinned CIDs
            for await (const pin of kuboRpc.pin.ls()) {
                expect(pin.cid.toString()).to.not.equal(pendingComment.cid); // pending comment should not be pinned in kubo
            }

            const pendingCommentFromGatewayRequest = await fetch("http://localhost:18080/ipfs/" + pendingComment.cid);
            expect(pendingCommentFromGatewayRequest.status).to.equal(504); // should fail to load
        });
        it(`pending comment should not appear in any pageCids or preloaded pages`, async () => {
            expect(Object.keys(subplebbit.posts.pages)).to.deep.equal([]);
            expect(Object.keys(subplebbit.posts.pageCids)).to.deep.equal([]);
        });
    });

    describe("Comment moderation approval of pending comment", () => {
        it("Should approve comments using createCommentModeration with approved: true", async () => {
            const commentModeration = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                signer: modSigner,
                commentModeration: { approved: true },
                commentCid: pendingComment.cid
            });

            await publishWithExpectedResult(commentModeration, true);
        });
        it(`pending comment will receive updates now`, async () => {
            await pendingComment.update();
            await resolveWhenConditionIsTrue(pendingComment, () => pendingComment.updatedAt);
            expect(pendingComment.updatedAt).to.be.a("number");
            expect(pendingComment.pendingApproval).to.be.false;
        });

        it(`Approved comment now appears in pages`, async () => {
            expect(subplebbit.posts.pages.hot.comments[0].cid).to.equal(pendingComment.cid); // should be included in pages now
        });
        it(`Approved comment now appears in lastPostCid and lastCommentCid`, async () => {
            expect(subplebbit.lastPostCid).to.equal(pendingComment.cid);
            expect(subplebbit.lastCommentCid).to.equal(pendingComment.cid);
        });
        it(`Approved comment does not appear in modQueue.pageCids`, async () => {
            expect(subplebbit.modQueue.pageCids.pendingApproval).to.be.undefined;
        });
        it(`Approved comment shows up in subplebbit.postUpdates`, async () => {
            expect(Object.keys(subplebbit.postUpdates)).to.deep.equal(["86400"]); // should have postUpdates now that we approved hte comment
        });

        it(`Sub should reject CommentModeration if a mod publishes approval for a comment that already got approved`, async () => {
            const commentModeration = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                signer: modSigner,
                commentModeration: { approved: true },
                commentCid: pendingComment.cid
            });

            await publishWithExpectedResult(
                commentModeration,
                false,
                messages.ERR_MOD_ATTEMPTING_TO_APPROVE_OR_DISAPPROVE_COMMENT_THAT_IS_NOT_PENDING
            );
        });

        it(`Sub should reject CommentModeration if a mod published disapproval for a comment that already got disapproved`, async () => {
            const { pendingComment, challengeVerification } = await publishCommentToModQueue(subplebbit);
            const commentModerationDisapproval = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                signer: modSigner,
                commentModeration: { approved: false },
                commentCid: pendingComment.cid
            });

            await publishWithExpectedResult(commentModerationDisapproval, true);

            const commentModerationDisapprovalSecond = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                signer: modSigner,
                commentModeration: { approved: false },
                commentCid: pendingComment.cid
            });

            await publishWithExpectedResult(
                commentModerationDisapprovalSecond,
                false,
                messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB
            );
        });

        it("Should resolve conflicting moderations to removed when both approved and removed are set", async () => {
            // TODO: If one mod sets approved: true and another sets removed: true,
            // the final state should be removed. The flags {approved: true, removed: true}
            // should behave as a regular removed comment.
        });

        it("Should set removed: true when approved is explicitly set to false", async () => {
            // TODO: Setting approved: false should automatically imply removed: true
            // and reflect in the comment state shown in modqueue
        });
    });

    describe(`Comment moderation rejection of pending comment`, async () => {
        let commentToBeRejected;

        before(async () => {
            const pending = await publishCommentToModQueue(subplebbit);
            commentToBeRejected = pending.pendingComment;

            await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.modQueue.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
        });
        it(`Can reject with approved: false`, async () => {
            const commentModeration = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                signer: modSigner,
                commentModeration: { approved: false },
                commentCid: commentToBeRejected.cid
            });

            await publishWithExpectedResult(commentModeration, true);
        });
        it(`Rejecting a pending comment will purge it from modQueue`, async () => {
            await resolveWhenConditionIsTrue(subplebbit, () => !subplebbit.modQueue.pageCids.pendingApproval); // wait until we publish a new mod queue with this new comment
            expect(subplebbit.modQueue.pageCids.pendingApproval).to.be.undefined;
        });
        it(`Rejecting a pending comment will remove it from database of subplebbit`, async () => {
            const queryRes = subplebbit._dbHandler.queryComment(commentToBeRejected.cid);
            expect(queryRes).to.be.undefined;
        });
    });

    describe(`Modqueue limits`, async () => {
        it("Should limit pending approvals to maxPendingApprovalCount (default 500)", async () => {
            // TODO: Test that pending approval queue respects size limit
            // Should use subplebbit.settings.maxPendingApprovalCount
        });

        it("Should remove oldest pending comments when hitting maxPendingApprovalCount limit", async () => {
            // TODO: Test that when maxPendingApprovalCount is reached,
            // the oldest pending comments are removed to make room for new ones
        });
    });
    describe("Modqueue page validation", () => {
        it("Should fail if a modqueue comment belongs to a different sub", async () => {
            // TODO: Ensure cross-sub comments cannot appear under another sub's modqueue
            // and that the operation fails or rejects with an appropriate error
        });
    });

    describe("Modqueue depths", () => {
        it("Should support modqueue pages with comments of different depths", async () => {
            // TODO: Create a mix of top-level posts and nested replies in pending approval
            // and verify modqueue page rendering/order handles varying depths correctly
        });
    });

    describe("Publication type support", () => {
        it("Should support pending approval for comments and posts", async () => {
            // TODO: Test that both comments and posts can be pending approval
        });

        it("Should not support pending approval for votes", async () => {
            // TODO: Test that votes are not subject to pending approval
        });
    });

    describe("Integration tests", () => {
        it("Should handle full pending approval workflow", async () => {
            // TODO: End-to-end test:
            // 1. Set up subplebbit with pendingApproval challenge
            // 2. Submit publication that fails challenge
            // 3. Verify it goes to pending queue
            // 4. Approve using comment moderation
            // 5. Verify publication is published
        });

        it("Should handle rejection of pending approval", async () => {
            // TODO: Test rejection workflow where moderator rejects pending comment
        });

        it("Should reject pending comment when author publishes an edit", async () => {
            // TODO: Test that when an author publishes an edit for a pending comment,
            // the pending comment should be rejected
        });

        it("Should maintain pending approval state across subplebbit restarts", async () => {
            // TODO: Test persistence of pending approval queue
        });
    });
});
