const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { waitTillCommentsUpdate, waitTillPublicationsArePublished } = require("../../dist/node/util");
const { generateMockPost } = require("../../dist/node/test-util");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe("Editing", async () => {
    let plebbit, commentToBeEdited;
    const subplebbitAddress = signers[0].address;
    const updateInterval = 100;

    before(async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
        plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
            if (authorAddress === "plebbit.eth") return signers[6].address;
            else if (authorAddress === "testgibbreish.eth") throw new Error(`Domain (${authorAddress}) has no plebbit-author-address`);
            return authorAddress;
        };

        commentToBeEdited = await generateMockPost(subplebbitAddress, plebbit, signers[0]);
        await commentToBeEdited.publish();
        await waitTillPublicationsArePublished([commentToBeEdited]);
        expect(commentToBeEdited?.cid).to.be.a("string");
        await waitTillCommentsUpdate([commentToBeEdited], updateInterval);
        await commentToBeEdited.update(updateInterval);
    });

    after(async () => {
        await commentToBeEdited.stop();
    });

    it("Fails to edit a comment if not authorized", async function () {
        return new Promise(async (resolve, reject) => {
            const editedText = "This should fail";
            const editReason = "To test whether editing a comment fails";
            const commentEdit = await plebbit.createCommentEdit({
                subplebbitAddress: commentToBeEdited.subplebbitAddress,
                commentCid: commentToBeEdited.cid,
                editReason: editReason,
                content: editedText,
                signer: signers[7] // Create a new signer, different than the signer of the original comment
            });
            await commentEdit.publish();
            commentEdit.once("challengeverification", async (challengeVerificationMessage, updatedCommentEdit) => {
                // Challenge verification should fail if signer is different than original signer
                expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                expect(challengeVerificationMessage.reason).to.be.a(
                    "string",
                    `Should include a reason for refusing publication of a comment edit`
                );
                resolve();
            });
        });
    });

    it("Can edit a comment", async function () {
        return new Promise(async (resolve, reject) => {
            const editedText = "edit test";
            const editReason = "To test editing a comment";

            const originalContent = commentToBeEdited.content;
            const commentEdit = await plebbit.createCommentEdit({
                subplebbitAddress: commentToBeEdited.subplebbitAddress,
                commentCid: commentToBeEdited.cid,
                editReason: editReason,
                content: editedText,
                signer: signers[0] // All posts within tests are signed with signers[0]
            });
            await commentEdit.publish();
            commentToBeEdited.once("update", async (updatedCommentToBeEdited) => {
                expect(updatedCommentToBeEdited.content).to.equal(editedText, "Comment has not been edited");
                expect(updatedCommentToBeEdited.originalContent).to.equal(originalContent, "Original content should be preserved");
                expect(updatedCommentToBeEdited.editReason).to.equal(editReason, "Edit reason has not been updated");
                resolve();
            });
        });
    });

    it(`Can edit an edited comment`, async () => {
        return new Promise(async (resolve, reject) => {
            const editedText = "Double edit test";
            const editReason = "To test double editing a comment";
            const originalContent = commentToBeEdited.originalContent;
            const commentEdit = await plebbit.createCommentEdit({
                subplebbitAddress: commentToBeEdited.subplebbitAddress,
                commentCid: commentToBeEdited.cid,
                editReason: editReason,
                content: editedText,
                signer: signers[0]
            });
            await commentEdit.publish();
            commentToBeEdited.once("update", async (updatedCommentToBeEdited) => {
                expect(updatedCommentToBeEdited.content).to.equal(editedText, "Comment has not been edited");
                expect(updatedCommentToBeEdited.originalContent).to.equal(originalContent, "Original content should be preserved");
                expect(updatedCommentToBeEdited.editReason).to.equal(editReason, "Edit reason has not been updated");
                resolve();
            });
        });
    });

    [
        { role: "owner", signer: signers[1] },
        { role: "admin", signer: signers[2] },
        { role: "mod", signer: signers[3] }
    ].map((roleTest) =>
        it(`${roleTest.role} can edit comment`, async () => {
            const editedText = `${roleTest.role} role testing CommentEdit`;
            const editReason = `For ${roleTest.role} role to test editing a comment`;
            const originalContent = commentToBeEdited.originalContent;
            const commentEdit = await plebbit.createCommentEdit({
                subplebbitAddress: commentToBeEdited.subplebbitAddress,
                commentCid: commentToBeEdited.cid,
                editReason: editReason,
                content: editedText,
                signer: roleTest.signer
            });
            await commentEdit.publish();
            commentToBeEdited.once("update", async (updatedCommentToBeEdited) => {
                expect(updatedCommentToBeEdited.content).to.equal(editedText, "Comment has not been edited");
                expect(updatedCommentToBeEdited.originalContent).to.equal(originalContent, "Original content should be preserved");
                expect(updatedCommentToBeEdited.editReason).to.equal(editReason, "Edit reason has not been updated");
                resolve();
            });
        })
    );
});
