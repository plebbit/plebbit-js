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

// Skeleton tests added for pending approval and modqueue edge cases
// mod queue pages should not have comments with depth 0 and pageIpfs.comments[x].comment.postCid defined
// need to test when we no longer have pending comments, modQueue pageCids should be undefined

describe(`Pending approval modqueue functionality`, async () => {
    let plebbit, subplebbit, pendingComment;

    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
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
            const remotePlebbit = await mockGatewayPlebbit({ forceMockPubsub: true, remotePlebbit: true }); // this plebbit is not connected to kubo rpc client of subplebbit
            pendingComment = await generateMockPost(subplebbit.address, remotePlebbit, false, {
                content: "Pending comment" + Math.random()
            });
            pendingComment.removeAllListeners("challenge");

            pendingComment.once("challenge", async () => {
                await pendingComment.publishChallengeAnswers([Math.random() + "12"]); // wrong answer
            });

            const challengeVerificationPromise = new Promise((resolve) => pendingComment.once("challengeverification", resolve));

            await publishWithExpectedResult(pendingComment, true); // a pending approval is technically challengeSucess = true

            expect(pendingComment.publishingState).to.equal("succeeded");
            expect(pendingComment.cid).to.be.a("string");
            const verification = await challengeVerificationPromise;
            // TODO need to test only minimal props are there in verification.commentUpdate
            expect(pendingComment.pendingApproval).to.be.true;
            expect(verification.commentUpdate.pendingApproval).to.be.true;
            expect(Object.keys(verification.commentUpdate).sort()).to.deep.equal([
                "author",
                "cid",
                "pendingApproval",
                "protocolVersion",
                "signature"
            ]);
        });

        it("Should exclude specific publication types from pending approval", async () => {
            // TODO: Test that pending approval can exclude certain types
            // TODO need to test for publications that should not support pending approval
            // like vote, subplebbitEdit, commentModeration, commentEdit
            // (e.g., only posts, not replies)
        });
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
        it(`pending comment should not appear in any pageCids or preloaded pages`);

        it("Should limit pending approvals to maxPendingApprovalCount (default 500)", async () => {
            // TODO: Test that pending approval queue respects size limit
            // Should use subplebbit.settings.maxPendingApprovalCount
        });

        it("Should remove oldest pending comments when hitting maxPendingApprovalCount limit", async () => {
            // TODO: Test that when maxPendingApprovalCount is reached,
            // the oldest pending comments are removed to make room for new ones
        });

        it("Should mark pending comments with commentUpdate.pendingApproval: true", async () => {
            // TODO: Test that pending comments have correct flag set
        });

        it("Should set comment.pendingApproval and commentUpdate.pendingApproval to true", async () => {
            // TODO: Verify both in-memory comment.pendingApproval and
            // corresponding commentUpdate.pendingApproval are true for pending items
        });
    });

    describe("Pending approval notifications", () => {
        it("Should notify author via ChallengeVerificationMessage with pendingApproval: true", async () => {
            // TODO: Test that author receives notification about pending approval status
        });

        it("Should not include pendingApproval in commentIpfs", async () => {
            // TODO: Test that pendingApproval field is not stored in IPFS content
        });

        it("Should trigger a new update when a comment is added to pendingApproval", async () => {
            // TODO: Verify that adding a new pending comment emits an update event
            // and that modqueue pages reflect the new item
        });
    });

    describe("Comment moderation approval process", () => {
        it("Should approve comments using createCommentModeration with approved: true", async () => {
            // TODO: Test approval process using comment moderation API
        });

        it("Should generate ChallengeVerificationMessage.commentUpdate.cid when approving", async () => {
            // TODO: Test that approval generates proper verification message
        });

        it("Should not pin or publish comment updates for pending comments", async () => {
            // TODO: Test resource optimization - no pinning/publishing for pending comments
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
