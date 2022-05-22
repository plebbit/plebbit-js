const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const signers = require("../fixtures/signers");
const { timestamp, waitTillCommentsUpdate } = require("../../dist/node/util");
const { signPublication, verifyPublication } = require("../../dist/node/signer");
const { generateMockPost, generateMockComment } = require("../../dist/node/test-util");
const { REPLIES_SORT_TYPES } = require("../../dist/node/sort-handler");

let plebbit;
const subplebbitAddress = signers[0].address;
const mockComments = [];

before(async () => {
    plebbit = await Plebbit({
        ipfsHttpClientOptions: "http://localhost:5001/api/v0",
        pubsubHttpClientOptions: `http://localhost:5002/api/v0`
    });
});

describe("comment (node and browser)", async () => {
    describe("createComment", async () => {
        it("Can sign and verify a comment with randomly generated key", async () => {
            const signer = await plebbit.createSigner();
            const comment = {
                subplebbitAddress: subplebbitAddress,
                author: { address: signer.address },
                timestamp: timestamp(),
                title: "Test post signature",
                content: "some content..."
            };
            const signature = await signPublication(comment, signer);
            const signedComment = { signature: signature.toJSON(), ...comment };
            const [isVerified, failedVerificationReason] = await verifyPublication(signedComment);
            expect(isVerified).to.be.true;
        });

        it("Verification fails when signature is corrupted", async () => {
            const signer = await plebbit.createSigner();
            const comment = {
                subplebbitAddress: subplebbitAddress,
                author: { address: signer.address },
                timestamp: timestamp(),
                title: "Test post signature",
                content: "some content..."
            };
            const signature = await signPublication(comment, signer);
            signature.signature = signature.signature.slice(1); // Corrupt signature by deleting one character
            const signedComment = { signature: signature.toJSON(), ...comment };
            const [isVerified, failedVerificationReason] = await verifyPublication(signedComment);
            expect(isVerified).to.be.false;
        });

        it("Can sign and verify a comment with an imported key", async () => {
            const signer = await plebbit.createSigner({ privateKey: signers[1].privateKey, type: "rsa" });
            const comment = {
                subplebbitAddress: subplebbitAddress,
                author: { address: signer.address },
                timestamp: timestamp(),
                title: "Test post signature",
                content: "some content..."
            };
            const signature = await signPublication(comment, signer);
            const signedComment = { signature: signature.toJSON(), ...comment };
            const [isVerified, failedVerificationReason] = await verifyPublication(signedComment);
            expect(isVerified).to.be.true;
            expect(signedComment.signature.publicKey).to.be.equal(
                signers[1].publicKey,
                "Generated public key should be same as provided"
            );
        });
    });

    describe("publishing", async () => {
        it("Publishing a comment with invalid signature fails", async () => {
            return new Promise(async (resolve, reject) => {
                const mockComment = await generateMockPost(subplebbitAddress, plebbit);
                mockComment.signature.signature = mockComment.signature.signature.slice(1); // Corrupts signature by deleting one key
                await mockComment.publish();
                mockComment.once("challengeverification", async ([challengeVerificationMessage, updatedComment]) => {
                    expect(challengeVerificationMessage.challengePassed).to.be.false;
                    expect(challengeVerificationMessage.reason).to.have.lengthOf.above(
                        0,
                        "There should be an error message that tells the user that comment's signature is invalid"
                    );
                    resolve();
                });
            });
        });

        it("Can publish a post", async function () {
            return new Promise(async (resolve, reject) => {
                const mockPost = await generateMockPost(subplebbitAddress, plebbit);
                const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                await subplebbit.update(1000);
                const originalLatestPostCid = subplebbit.latestPostCid;
                await mockPost.publish();
                mockPost.once("challengeverification", ([challengeVerificationMessage, mockPostWithUpdates]) => {
                    expect(mockPostWithUpdates.previousCid).to.equal(originalLatestPostCid);
                    subplebbit.once("update", async (updatedSubplebbit) => {
                        expect(mockPost.cid).to.equal(updatedSubplebbit.latestPostCid);
                        mockComments.push(mockPost);
                        await subplebbit.stop();
                        resolve();
                    });
                });
            });
        });

        it("Throws an error when publishing a duplicate post", async function () {
            return new Promise(async (resolve, reject) => {
                await mockComments[0].publish();
                mockComments[0].once("challengeverification", ([challengeVerificationMessage, newComment]) => {
                    expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                    expect(challengeVerificationMessage.reason).to.be.a("string");
                    resolve();
                });
            });
        });

        [1, 2, 3, 4, 5, 6].map((depth) =>
            it(`Can publish comment with depth = ${depth}`, async () => {
                return new Promise(async (resolve, reject) => {
                    // await sleep(100000); // Wait for IPNS changes to populate
                    const parentComment = mockComments[depth - 1];
                    const mockComment = await generateMockComment(parentComment, plebbit);
                    await waitTillCommentsUpdate([parentComment]);
                    await parentComment.update(5000);
                    expect(parentComment.updatedAt).to.be.a("number");
                    const originalReplyCount = parentComment.replyCount;
                    expect(originalReplyCount).to.be.equal(0);
                    await mockComment.publish();
                    parentComment.once("update", async (updatedParentComment) => {
                        expect(mockComment.parentCid).to.be.equal(updatedParentComment.cid);
                        expect(mockComment.depth).to.be.equal(depth);
                        expect(updatedParentComment.replyCount).to.equal(originalReplyCount + 1);
                        const parentLatestCommentCid = (
                            await updatedParentComment.replies.getPage(
                                updatedParentComment.replies.pageCids[REPLIES_SORT_TYPES.NEW.type]
                            )
                        ).comments[0].cid;
                        expect(parentLatestCommentCid).to.equal(mockComment.cid);
                        mockComments.push(mockComment);
                        await parentComment.stop();
                        resolve();
                    });
                });
            })
        );
    });

    describe("Editing", async () => {
        it("Fails to edit a comment if not authorized", async function () {
            return new Promise(async (resolve, reject) => {
                const editedText = "This should fail";
                const editReason = "To test whether editing a comment fails";
                const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                await subplebbit.update();
                const commentToBeEdited = await plebbit.getComment(subplebbit.latestPostCid);
                commentToBeEdited.removeAllListeners();
                await commentToBeEdited.update();
                const commentEdit = await plebbit.createCommentEdit({
                    subplebbitAddress: commentToBeEdited.subplebbitAddress,
                    commentCid: commentToBeEdited.cid,
                    editReason: editReason,
                    content: editedText,
                    signer: await plebbit.createSigner() // Create a new signer, different than the signer of the original comment
                });
                await commentEdit.publish();
                commentEdit.once(
                    "challengeverification",
                    async ([challengeVerificationMessage, updatedCommentEdit]) => {
                        // Challenge verification should fail if signer is different than original signer
                        expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                        expect(challengeVerificationMessage.reason).to.be.a(
                            "string",
                            `Should include a reason for refusing publication of a comment edit`
                        );
                        await commentToBeEdited.stop();
                        await subplebbit.stop();
                        resolve();
                    }
                );
            });
        });

        it("Can edit a comment", async function () {
            return new Promise(async (resolve, reject) => {
                const editedText = "edit test";
                const editReason = "To test editing a comment";
                const commentToBeEdited = mockComments[0];
                await commentToBeEdited.update(10000);

                const subplebbit = await plebbit.getSubplebbit(subplebbitAddress);
                await subplebbit.update();
                const originalContent = commentToBeEdited.content;
                const commentEdit = await plebbit.createCommentEdit({
                    subplebbitAddress: commentToBeEdited.subplebbitAddress,
                    commentCid: commentToBeEdited.cid,
                    editReason: editReason,
                    content: editedText,
                    signer: commentToBeEdited.signer
                });
                await commentEdit.publish();
                commentToBeEdited.on("update", async (updatedCommentToBeEdited) => {
                    if (!updatedCommentToBeEdited.originalContent) return; // Wait until comment is updated with new content
                    expect(updatedCommentToBeEdited.content).to.equal(editedText, "Comment has not been edited");
                    expect(updatedCommentToBeEdited.originalContent).to.equal(
                        originalContent,
                        "Original content should be preserved"
                    );
                    expect(updatedCommentToBeEdited.editReason).to.equal(
                        editReason,
                        "Edit reason has not been updated"
                    );
                    await subplebbit.stop();
                    await commentToBeEdited.stop();
                    resolve();
                });
            });
        });

        it(`Can edit an edited comment`, async () => {
            return new Promise(async (resolve, reject) => {
                const editedText = "Double edit test";
                const editReason = "To test double editing a comment";
                const commentToBeEdited = mockComments[0];
                commentToBeEdited.removeAllListeners();
                await commentToBeEdited.update(10000);
                const originalContent = commentToBeEdited.originalContent;
                const commentEdit = await plebbit.createCommentEdit({
                    subplebbitAddress: commentToBeEdited.subplebbitAddress,
                    commentCid: commentToBeEdited.cid,
                    editReason: editReason,
                    content: editedText,
                    signer: commentToBeEdited.signer
                });
                await commentEdit.publish();
                commentToBeEdited.on("update", async (updatedCommentToBeEdited) => {
                    expect(updatedCommentToBeEdited.content).to.equal(editedText, "Comment has not been edited");
                    expect(updatedCommentToBeEdited.originalContent).to.equal(
                        originalContent,
                        "Original content should be preserved"
                    );
                    expect(updatedCommentToBeEdited.editReason).to.equal(
                        editReason,
                        "Edit reason has not been updated"
                    );
                    await commentToBeEdited.stop();
                    resolve();
                });
            });
        });
    });
});
