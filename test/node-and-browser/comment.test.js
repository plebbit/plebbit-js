const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const signers = require("../fixtures/signers");
const { timestamp, waitTillCommentsUpdate } = require("../../dist/node/util");
const { signPublication, verifyPublication } = require("../../dist/node/signer");
const { generateMockPost, generateMockComment } = require("../../dist/node/test-util");

let plebbit;
const subplebbitAddress = signers[0].address;
const mockComments = [];
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
});

describe("comment (node and browser)", async () => {
    describe("createComment", async () => {
        it("Can sign and verify a comment with randomly generated key", async () => {
            const comment = {
                subplebbitAddress: subplebbitAddress,
                author: { address: signers[0].address },
                timestamp: timestamp(),
                title: "Test post signature",
                content: "some content..."
            };
            const signature = await signPublication(comment, signers[0], plebbit);
            const signedComment = { signature: signature.toJSON(), ...comment };
            const [isVerified, failedVerificationReason] = await verifyPublication(signedComment, plebbit);
            expect(isVerified).to.be.true;
        });

        it("Verification fails when signature is corrupted", async () => {
            const comment = {
                subplebbitAddress: subplebbitAddress,
                author: { address: signers[0].address },
                timestamp: timestamp(),
                title: "Test post signature",
                content: "some content..."
            };
            const signature = await signPublication(comment, signers[0], plebbit);
            signature.signature = signature.signature.slice(1); // Corrupt signature by deleting one character
            const signedComment = { signature: signature.toJSON(), ...comment };
            const [isVerified, failedVerificationReason] = await verifyPublication(signedComment, plebbit);
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
            const signature = await signPublication(comment, signer, plebbit);
            const signedComment = { signature: signature.toJSON(), ...comment };
            const [isVerified, failedVerificationReason] = await verifyPublication(signedComment, plebbit);
            expect(isVerified).to.be.true;
            expect(signedComment.signature.publicKey).to.be.equal(signers[1].publicKey, "Generated public key should be same as provided");
        });
    });

    describe("publishing", async () => {
        it("Publishing a comment with invalid signature fails", async () => {
            const mockComment = await generateMockPost(subplebbitAddress, plebbit, signers[0]);
            mockComment.signature.signature = mockComment.signature.signature.slice(1); // Corrupts signature by deleting one key
            try {
                await mockComment.publish();
                expect.fail("comment.publish should throw an error");
            } catch {}
        });

        it("Can publish a post", async function () {
            return new Promise(async (resolve, reject) => {
                const mockPost = await generateMockPost(subplebbitAddress, plebbit, signers[0]);
                await mockPost.publish();
                mockPost.once("challengeverification", (challengeVerificationMessage, updatedComment) => {
                    mockComments.push(mockPost);
                    resolve();
                });
            });
        });

        it("Throws an error when publishing a duplicate post", async function () {
            return new Promise(async (resolve, reject) => {
                await mockComments[0].publish();
                mockComments[0].once("challengeverification", (challengeVerificationMessage, updatedComment) => {
                    expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                    expect(challengeVerificationMessage.reason).to.be.a("string");
                    resolve();
                });
            });
        });

        it("Throws an error when a user attempts to publish a comment under a non existent parent", async () => {
            return new Promise(async (resolve) => {
                const comment = await plebbit.createComment({
                    parentCid: "gibberish", // invalid parentCid,
                    author: { displayName: `Mock Author - ${Date.now()}` },
                    signer: signers[0],
                    content: `Mock comment - ${Date.now()}`,
                    postCid: mockComments[0].postCid,
                    subplebbitAddress: mockComments[0].subplebbitAddress
                });
                await comment.publish();
                comment.once("challengeverification", (challengeVerificationMessage, updatedComment) => {
                    expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                    // TODO we should probably document challengeVerificationMessage.reason somewhere
                    expect(challengeVerificationMessage.reason).to.be.a("string");
                    resolve();
                });
            });
        });

        [1, 2, 3, 4, 5, 6].map((depth) =>
            it(`Can publish comment with depth = ${depth}`, async () => {
                return new Promise(async (resolve, reject) => {
                    const parentComment = mockComments[depth - 1];
                    const mockComment = await generateMockComment(parentComment, plebbit, signers[4]);
                    await waitTillCommentsUpdate([parentComment], updateInterval);
                    await parentComment.update(updateInterval);
                    expect(parentComment.updatedAt).to.be.a("number");
                    const originalReplyCount = parentComment.replyCount;
                    expect(originalReplyCount).to.be.equal(0);
                    await mockComment.publish();
                    parentComment.once("update", async (updatedParentComment) => {
                        expect(mockComment.parentCid).to.be.equal(updatedParentComment.cid);
                        expect(mockComment.depth).to.be.equal(depth);
                        expect(updatedParentComment.replyCount).to.equal(originalReplyCount + 1);
                        const parentLatestCommentCid = (
                            await updatedParentComment.replies.getPage(updatedParentComment.replies.pageCids.new)
                        ).comments[0]?.cid;
                        expect(parentLatestCommentCid).to.equal(mockComment.cid, "parentComment.replies.new should include new comment");
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
                await subplebbit.update(updateInterval);
                const commentToBeEdited = await plebbit.getComment(subplebbit.latestPostCid);
                commentToBeEdited.removeAllListeners();
                await commentToBeEdited.update(updateInterval);
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
                    await commentToBeEdited.stop();
                    await subplebbit.stop();
                    resolve();
                });
            });
        });

        it("Can edit a comment", async function () {
            return new Promise(async (resolve, reject) => {
                const editedText = "edit test";
                const editReason = "To test editing a comment";
                const commentToBeEdited = mockComments[0];
                await commentToBeEdited.update(updateInterval);

                const originalContent = commentToBeEdited.content;
                const commentEdit = await plebbit.createCommentEdit({
                    subplebbitAddress: commentToBeEdited.subplebbitAddress,
                    commentCid: commentToBeEdited.cid,
                    editReason: editReason,
                    content: editedText,
                    signer: commentToBeEdited.signer
                });
                await commentEdit.publish();
                commentToBeEdited.once("update", async (updatedCommentToBeEdited) => {
                    expect(updatedCommentToBeEdited.content).to.equal(editedText, "Comment has not been edited");
                    expect(updatedCommentToBeEdited.originalContent).to.equal(originalContent, "Original content should be preserved");
                    expect(updatedCommentToBeEdited.editReason).to.equal(editReason, "Edit reason has not been updated");
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
                await commentToBeEdited.update(updateInterval);
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
                    expect(updatedCommentToBeEdited.originalContent).to.equal(originalContent, "Original content should be preserved");
                    expect(updatedCommentToBeEdited.editReason).to.equal(editReason, "Edit reason has not been updated");
                    await commentToBeEdited.stop();
                    resolve();
                });
            });
        });
    });

    describe("Comments with Authors as domains", async () => {
        it(`post.author.address resolves correctly for author plebbit.eth `, async () => {
            return new Promise(async (resolve) => {
                // I've mocked plebbit.resolver.resolveAuthorAddressIfNeeded to return signers[6] address for plebbit.eth
                const mockPost = await plebbit.createComment({
                    author: { displayName: `Mock Author - ${Date.now()}`, address: "plebbit.eth" },
                    signer: signers[6],
                    content: `Mock post - ${Date.now()}`,
                    title: "Mock post title",
                    subplebbitAddress: subplebbitAddress
                });

                await mockPost.publish();
                expect(mockPost.author.address).to.equal("plebbit.eth");

                mockPost.once("challengeverification", async (challengeVerificationMessage, updatedComment) => {
                    expect(updatedComment.author.address).to.equal("plebbit.eth");
                    expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                    mockComments.push(updatedComment);

                    resolve();
                });
            });
        });

        it(`.publish() throws error when signer points to a different address than plebbit-author-address`, async () => {
            try {
                await plebbit.createComment({
                    author: { displayName: `Mock Author - ${Date.now()}`, address: "plebbit.eth" },
                    signer: signers[7], // plebbit.eth resolves to signers[6], this should give us an error
                    content: `Mock post - ${Date.now()}`,
                    title: "Mock post title",
                    subplebbitAddress: subplebbitAddress
                });
                expect.fail("publish() should throw if domain resolves to a different address than signer");
            } catch {}
        });

        it(`challengeverification fails to pass if plebbit-author-address points to a different address than signer`, async () => {
            return new Promise(async (resolve) => {
                // There are two mocks of resovleAuthorAddressIfNeeded, one return undefined on testgibbreish.eth (server side) and this one returns signers[6]
                // The purpose is to test whether server rejects publications that has different plebbit-author-address and signer address
                plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
                    if (authorAddress === "testgibbreish.eth") return signers[6].address;
                    return authorAddress;
                };
                const mockPost = await plebbit.createComment({
                    author: { displayName: `Mock Author - ${Date.now()}`, address: "testgibbreish.eth" },
                    signer: signers[6],
                    content: `Mock comment - ${Date.now()}`,
                    title: "Mock post Title",
                    subplebbitAddress: subplebbitAddress
                });

                await mockPost.publish();
                expect(mockPost.author.address).to.equal("testgibbreish.eth");

                mockPost.once("challengeverification", async (challengeVerificationMessage, updatedComment) => {
                    expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                    resolve();
                });
            });
        });

        it(`getComment corrects author.address to derived address in case plebbit-author-address points to another address`, async () => {
            plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
                if (authorAddress === "plebbit.eth") return signers[7].address;
                return authorAddress;
            };
            // verifyPublication in getComment should overwrite author.address to derived address
            const post = await plebbit.getComment(mockComments[mockComments.length - 1].cid);
            expect(post.author.address).to.equal(signers[6].address);
        });
    });
});
