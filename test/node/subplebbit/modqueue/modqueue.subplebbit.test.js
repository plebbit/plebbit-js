import { expect } from "chai";
import {
    mockPlebbit,
    publishWithExpectedResult,
    generateMockVote,
    publishRandomPost,
    publishToModQueueWithDepth,
    resolveWhenConditionIsTrue,
    createSubWithNoChallenge
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";

// TODO test skeletons
// comment.approved = true is treated like a regular comment

describe(`Pending approval modqueue functionality`, async () => {
    let plebbit, subplebbit, modSigner;
    let regularPublishedComment;

    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();

        regularPublishedComment = await publishRandomPost(subplebbit.address, plebbit);

        modSigner = await plebbit.createSigner();
        await subplebbit.edit({
            roles: {
                [modSigner.address]: { role: "moderator" }
            },
            settings: { challenges: [{ name: "question", options: { question: "1+1=?", answer: "2" }, pendingApproval: true }] }
        });

        expect(Object.keys(subplebbit.moderation.pageCids)).to.deep.equal([]); // should be empty

        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.updatedAt);
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    describe("Challenge with pendingApproval", () => {
        it("Should support pendingApproval field in challenge settings", async () => {
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
        // TODO: Test that pending approval can exclude certain types
        // TODO need to test for publications that should not support pending approval
        // like vote, subplebbitEdit, commentModeration, commentEdit

        it("Should exclude vote type from pending approval", async () => {
            // it should fail because vote is not applicable for pendingApproval AND it published the wrong answers
            const vote = await generateMockVote(regularPublishedComment, 1, plebbit);

            vote.once("challenge", async () => await vote.publishChallengeAnswers(["1234 " + Math.random()])); // wrong answers

            const challengeVerificationPromise = new Promise((resolve) => vote.once("challengeverification", resolve));

            await publishWithExpectedResult(vote, false);

            const challengeVerification = await challengeVerificationPromise;
            expect(challengeVerification.challengeSuccess).to.equal(false);
            expect(challengeVerification.challengeErrors["0"]).to.equal("Wrong answer.");
        });

        it(`should exclude CommentEdit from pending approval`, async () => {
            // it should fail because CommentEdit is not applicable for pendingApproval AND it published the wrong answers
            const edit = await plebbit.createCommentEdit({
                subplebbitAddress: regularPublishedComment.subplebbitAddress,
                commentCid: regularPublishedComment.cid,
                reason: "random reason should fail",
                content: "text to edit on pending comment",
                signer: regularPublishedComment.signer
            });
            edit.once("challenge", async () => await edit.publishChallengeAnswers(["1234 " + Math.random()])); // wrong answers

            const challengeVerificationPromise = new Promise((resolve) => edit.once("challengeverification", resolve));

            await publishWithExpectedResult(edit, false);

            const challengeVerification = await challengeVerificationPromise;
            expect(challengeVerification.challengeSuccess).to.equal(false);
            expect(challengeVerification.challengeErrors["0"]).to.equal("Wrong answer.");
        });
    });
});
