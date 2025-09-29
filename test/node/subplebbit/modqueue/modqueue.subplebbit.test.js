import { expect } from "chai";
import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue,
    mockGatewayPlebbit,
    generateMockVote,
    generateMockComment,
    publishPostToModQueue
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";

// TODO test skeletons
// comments with approved: false should not be in pageCids.pendingApproval, and should only be in PostUpdates till they're expired
// comment.approved = true is treated like a regular comment

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

        expect(Object.keys(subplebbit.moderation.pageCids)).to.deep.equal([]); // should be empty
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
    });

    describe("Comment moderation approval of pending comment", () => {
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
            const { comment, challengeVerification } = await publishPostToModQueue({ subplebbit });
            const commentModerationDisapproval = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                signer: modSigner,
                commentModeration: { approved: false },
                commentCid: comment.cid
            });

            await publishWithExpectedResult(commentModerationDisapproval, true);

            const commentModerationDisapprovalSecond = await plebbit.createCommentModeration({
                subplebbitAddress: subplebbit.address,
                signer: modSigner,
                commentModeration: { approved: false },
                commentCid: comment.cid
            });

            await publishWithExpectedResult(
                commentModerationDisapprovalSecond,
                false,
                messages.ERR_PUBLICATION_PARENT_DOES_NOT_EXIST_IN_SUB
            );
        });

        // TODO: Test that pending approval can exclude certain types
        // TODO need to test for publications that should not support pending approval
        // like vote, subplebbitEdit, commentModeration, commentEdit

        it("Should exclude vote type from pending approval", async () => {
            // it should fail because vote is not applicable for pendingApproval AND it published the wrong answers
            const vote = await generateMockVote(pendingComment, 1, plebbit);

            vote.once("challenge", async () => await vote.publishChallengeAnswers(["1234 " + Math.random()])); // wrong answers

            const challengeVerificationPromise = new Promise((resolve) => vote.once("challengeverification", resolve));

            await publishWithExpectedResult(vote, false);

            const challengeVerification = await challengeVerificationPromise;
            expect(challengeVerification.challengeSuccess).to.equal(false);
            expect(challengeVerification.challengeErrors["0"]).to.equal("Wrong captcha.");
        });

        it(`should exclude CommentEdit from pending approval`, async () => {
            // it should fail because CommentEdit is not applicable for pendingApproval AND it published the wrong answers
            const edit = await plebbit.createCommentEdit({
                subplebbitAddress: pendingComment.subplebbitAddress,
                commentCid: pendingComment.cid,
                reason: "random reason should fail",
                content: "text to edit on pending comment",
                signer: pendingComment.signer
            });
            edit.once("challenge", async () => await edit.publishChallengeAnswers(["1234 " + Math.random()])); // wrong answers

            const challengeVerificationPromise = new Promise((resolve) => edit.once("challengeverification", resolve));

            await publishWithExpectedResult(edit, false);

            const challengeVerification = await challengeVerificationPromise;
            expect(challengeVerification.challengeSuccess).to.equal(false);
            expect(challengeVerification.challengeErrors["0"]).to.equal("Wrong captcha.");
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
