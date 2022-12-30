const signers = require("../../fixtures/signers");
const { mockPlebbit, publishRandomPost } = require("../../../dist/node/test/test-util");
const { expect } = require("chai");
const { messages } = require("../../../dist/node/errors");

const subplebbitAddress = signers[0].address;
const updateInterval = 300;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

describe("Editing comment.content", async () => {
    let plebbit, commentToBeEdited;

    before(async () => {
        plebbit = await mockPlebbit();

        commentToBeEdited = await publishRandomPost(subplebbitAddress, plebbit);
        await Promise.all([new Promise((resolve) => commentToBeEdited.once("update", resolve)), commentToBeEdited.update()]);
    });

    after(async () => {
        await commentToBeEdited.stop();
    });

    it("Fails to edit content if not original author", async function () {
        const editedText = "This should fail" + Date.now();
        const editReason = "To test whether editing a comment fails" + Date.now();
        const commentEdit = await plebbit.createCommentEdit({
            subplebbitAddress: commentToBeEdited.subplebbitAddress,
            commentCid: commentToBeEdited.cid,
            reason: editReason,
            content: editedText,
            signer: signers[7] // different than the signer of the original comment
        });
        await commentEdit.publish();
        await new Promise((resolve) =>
            commentEdit.once("challengeverification", async (challengeVerificationMessage, updatedCommentEdit) => {
                // Challenge verification should fail if signer is different than original signer
                expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                expect(challengeVerificationMessage.reason).to.equal(messages.ERR_UNAUTHORIZED_COMMENT_EDIT);
                resolve();
            })
        );
    });

    it("Original Author can edit content", async function () {
        const editedText = "edit test" + Date.now();
        const editReason = "To test editing a comment" + Date.now();

        const originalContent = commentToBeEdited.content;
        const commentEdit = await plebbit.createCommentEdit({
            subplebbitAddress: commentToBeEdited.subplebbitAddress,
            commentCid: commentToBeEdited.cid,
            reason: editReason,
            content: editedText,
            signer: commentToBeEdited.signer
        });
        await commentEdit.publish();
        await new Promise((resolve) => commentToBeEdited.once("update", resolve));
        expect(commentToBeEdited.authorEdit.content).to.equal(editedText);
        expect(commentToBeEdited.content).to.equal(editedText);
        expect(commentToBeEdited.original?.content).to.equal(originalContent);
        expect(commentToBeEdited.authorEdit.reason).to.equal(editReason);
        expect(commentToBeEdited.author.subplebbit.postScore).to.equal(0);
        expect(commentToBeEdited.author.subplebbit.replyScore).to.equal(0);
        expect(commentToBeEdited.author.subplebbit.lastCommentCid).to.equal(commentToBeEdited.cid);
        expect(commentToBeEdited.authorEdit.authorAddress).to.be.undefined;
        expect(commentToBeEdited.authorEdit.challengeRequestId).to.be.undefined;
    });

    it(`Author can modify content again, while preserving comment.originalContent`, async () => {
        const editedText = "Double edit test";
        const editReason = "To test double editing a comment";
        const originalContent = commentToBeEdited.original.content;
        const commentEdit = await plebbit.createCommentEdit({
            subplebbitAddress: commentToBeEdited.subplebbitAddress,
            commentCid: commentToBeEdited.cid,
            reason: editReason,
            content: editedText,
            signer: commentToBeEdited.signer
        });
        await commentEdit.publish();
        await new Promise((resolve) => commentToBeEdited.once("update", resolve));
        expect(commentToBeEdited.authorEdit.content).to.equal(editedText);
        expect(commentToBeEdited.content).to.equal(editedText);
        expect(commentToBeEdited.original?.content).to.equal(originalContent);
        expect(commentToBeEdited.authorEdit.reason).to.equal(editReason);
        expect(commentToBeEdited.author.subplebbit.postScore).to.equal(0);
        expect(commentToBeEdited.author.subplebbit.replyScore).to.equal(0);
        expect(commentToBeEdited.author.subplebbit.lastCommentCid).to.equal(commentToBeEdited.cid);
    });

    roles.map((roleTest) =>
        it(`${roleTest.role} Can modify their own comment content`, async () => {
            const commentToEdit = await publishRandomPost(subplebbitAddress, plebbit, { signer: roleTest.signer });
            const originalContent = JSON.parse(JSON.stringify(commentToEdit.content));
            commentToEdit._updateIntervalMs = updateInterval;
            await Promise.all([new Promise((resolve) => commentToEdit.once("update", resolve)), commentToEdit.update()]);
            const editedText = `${roleTest.role} role testing CommentEdit`;
            const editReason = `For ${roleTest.role} role to test editing a comment`;
            const commentEdit = await plebbit.createCommentEdit({
                subplebbitAddress: commentToEdit.subplebbitAddress,
                commentCid: commentToEdit.cid,
                reason: editReason,
                content: editedText,
                signer: roleTest.signer
            });
            await commentEdit.publish();
            await new Promise((resolve) =>
                commentEdit.once("challengeverification", async (challengeVerificationMessage, updatedCommentEdit) => {
                    expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                    resolve();
                })
            );
            await new Promise((resolve) => commentToEdit.once("update", resolve));
            expect(commentToEdit.authorEdit.content).to.equal(editedText);
            expect(commentToEdit.content).to.equal(editedText);
            expect(commentToEdit.original?.content).to.equal(originalContent);
            expect(commentToEdit.authorEdit.reason).to.equal(editReason);
            expect(commentToEdit.author.subplebbit.lastCommentCid).to.equal(commentToEdit.cid);
            await commentToEdit.stop();
        })
    );

    roles.map((roleTest) =>
        it(`${roleTest.role} can't edit another author comment.content`, async () => {
            const editedText = `${roleTest.role} role testing CommentEdit`;
            const editReason = `For ${roleTest.role} role to test editing a comment`;
            const commentEdit = await plebbit.createCommentEdit({
                subplebbitAddress: commentToBeEdited.subplebbitAddress,
                commentCid: commentToBeEdited.cid,
                reason: editReason,
                content: editedText,
                signer: roleTest.signer
            });
            await commentEdit.publish();
            await new Promise((resolve) =>
                commentEdit.once("challengeverification", async (challengeVerificationMessage, updatedCommentEdit) => {
                    expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                    expect(challengeVerificationMessage.reason).to.be.a(
                        "string",
                        `Should include a reason for refusing publication of a comment edit`
                    );
                    resolve();
                })
            );
        })
    );
});
