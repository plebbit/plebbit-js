import signers from "../../fixtures/signers";
import {
    mockRemotePlebbit,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util";
import { expect } from "chai";
import { messages } from "../../../dist/node/errors";
import lodash from "lodash";
const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

describe("Editing comment.content", async () => {
    let plebbit, commentToBeEdited;

    before(async () => {
        plebbit = await mockRemotePlebbit();

        commentToBeEdited = await publishRandomPost(subplebbitAddress, plebbit);
        await commentToBeEdited.update();
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
        await publishWithExpectedResult(commentEdit, false, messages.ERR_UNAUTHORIZED_COMMENT_EDIT);
    });

    it("Original Author can edit content", async function () {
        const editedText = "edit test" + Date.now();
        const editReason = "To test editing a comment" + Date.now();

        const originalContent = lodash.clone(commentToBeEdited.content);
        const commentEdit = await plebbit.createCommentEdit({
            subplebbitAddress: commentToBeEdited.subplebbitAddress,
            commentCid: commentToBeEdited.cid,
            reason: editReason,
            content: editedText,
            signer: commentToBeEdited.signer
        });
        await publishWithExpectedResult(commentEdit, true);
        await resolveWhenConditionIsTrue(commentToBeEdited, () => commentToBeEdited.content === editedText);
        expect(commentToBeEdited.edit.content).to.equal(editedText);
        expect(commentToBeEdited._rawCommentUpdate.edit.content).to.equal(editedText);
        expect(commentToBeEdited._rawCommentUpdate.edit.reason).to.equal(editReason);

        expect(commentToBeEdited.content).to.equal(editedText);
        expect(commentToBeEdited.original?.content).to.equal(originalContent);
        expect(commentToBeEdited.edit.reason).to.equal(editReason);
        expect(commentToBeEdited.author.subplebbit.postScore).to.equal(0);
        expect(commentToBeEdited.author.subplebbit.replyScore).to.equal(0);
        expect(commentToBeEdited.author.subplebbit.lastCommentCid).to.equal(commentToBeEdited.cid);
        expect(commentToBeEdited.edit.authorAddress).to.be.undefined;
        expect(commentToBeEdited.edit.challengeRequestId).to.be.undefined;
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
        await publishWithExpectedResult(commentEdit, true);
        await resolveWhenConditionIsTrue(commentToBeEdited, () => commentToBeEdited.content === editedText);
        expect(commentToBeEdited.edit.content).to.equal(editedText);
        expect(commentToBeEdited.content).to.equal(editedText);
        expect(commentToBeEdited.original?.content).to.equal(originalContent);
        expect(commentToBeEdited.edit.reason).to.equal(editReason);
        expect(commentToBeEdited.author.subplebbit.postScore).to.equal(0);
        expect(commentToBeEdited.author.subplebbit.replyScore).to.equal(0);
        expect(commentToBeEdited.author.subplebbit.lastCommentCid).to.equal(commentToBeEdited.cid);
    });

    roles.map((roleTest) =>
        it(`${roleTest.role} Can modify their own comment content`, async () => {
            const commentToEdit = await publishRandomPost(subplebbitAddress, plebbit, { signer: roleTest.signer });
            const originalContent = lodash.clone(commentToEdit.content);
            await commentToEdit.update();
            const editedText = `${roleTest.role} role testing CommentEdit`;
            const editReason = `For ${roleTest.role} role to test editing a comment`;
            const commentEdit = await plebbit.createCommentEdit({
                subplebbitAddress: commentToEdit.subplebbitAddress,
                commentCid: commentToEdit.cid,
                reason: editReason,
                content: editedText,
                signer: roleTest.signer
            });
            await publishWithExpectedResult(commentEdit, true);
            await resolveWhenConditionIsTrue(commentToEdit, () => commentToEdit.edit?.content === editedText);
            expect(commentToEdit.edit.content).to.equal(editedText);
            expect(commentToEdit.content).to.equal(editedText);
            expect(commentToEdit.original?.content).to.equal(originalContent);
            expect(commentToEdit.edit.reason).to.equal(editReason);
            commentToEdit.stop();
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
            await publishWithExpectedResult(commentEdit, false, messages.ERR_SUB_COMMENT_EDIT_UNAUTHORIZED_FIELD);
        })
    );
});
