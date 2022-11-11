const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { generateMockPost } = require("../../dist/node/test/test-util");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { messages } = require("../../dist/node/errors");

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const subplebbitAddress = signers[0].address;
const updateInterval = 100;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

describe("Editing", async () => {
    let plebbit, commentToBeEdited, signer;

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

        signer = await plebbit.createSigner();
        commentToBeEdited = await generateMockPost(subplebbitAddress, plebbit, signer);
        await commentToBeEdited.publish();
        await new Promise((resolve) => commentToBeEdited.once("challengeverification", resolve));
        expect(commentToBeEdited?.cid).to.be.a("string");
        commentToBeEdited._updateIntervalMs = updateInterval;
        await Promise.all([new Promise((resolve) => commentToBeEdited.once("update", resolve)), commentToBeEdited.update()]);
    });

    after(async () => {
        await commentToBeEdited.stop();
    });

    it("Fails to edit a comment if not original author", async function () {
        return new Promise(async (resolve, reject) => {
            const editedText = "This should fail";
            const editReason = "To test whether editing a comment fails";
            const commentEdit = await plebbit.createCommentEdit({
                subplebbitAddress: commentToBeEdited.subplebbitAddress,
                commentCid: commentToBeEdited.cid,
                reason: editReason,
                content: editedText,
                signer: signers[7] // different than the signer of the original comment
            });
            await commentEdit.publish();
            commentEdit.once("challengeverification", async (challengeVerificationMessage, updatedCommentEdit) => {
                // Challenge verification should fail if signer is different than original signer
                expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                expect(challengeVerificationMessage.reason).to.equal(messages.ERR_UNAUTHORIZED_COMMENT_EDIT);
                resolve();
            });
        });
    });

    it(`(edit: CommentEdit) === plebbit.createCommentEdit(JSON.parse(JSON.stringify(edit)))`, async () => {
        const edit = await plebbit.createCommentEdit({
            subplebbitAddress: commentToBeEdited.subplebbitAddress,
            commentCid: commentToBeEdited.cid,
            reason: "editReason",
            content: "editedText",
            signer: signers[7] // Create a new signer, different than the signer of the original comment
        });
        const editFromStringifiedEdit = await plebbit.createCommentEdit(JSON.parse(JSON.stringify(edit)));
        expect(JSON.stringify(edit)).to.equal(JSON.stringify(editFromStringifiedEdit));
    });

    it("Author can edit comment.content", async function () {
        return new Promise(async (resolve, reject) => {
            const editedText = "edit test";
            const editReason = "To test editing a comment";

            const originalContent = commentToBeEdited.content;
            const commentEdit = await plebbit.createCommentEdit({
                subplebbitAddress: commentToBeEdited.subplebbitAddress,
                commentCid: commentToBeEdited.cid,
                reason: editReason,
                content: editedText,
                signer
            });
            await commentEdit.publish();
            commentToBeEdited.once("update", async (updatedCommentToBeEdited) => {
                expect(updatedCommentToBeEdited.authorEdit.content).to.equal(editedText, "Comment has not been edited");
                expect(updatedCommentToBeEdited.content).to.equal(editedText, "Comment has not been edited");
                expect(updatedCommentToBeEdited.original?.content).to.equal(originalContent, "Original content should be preserved");
                expect(updatedCommentToBeEdited.authorEdit.reason).to.equal(editReason, "Edit reason has not been updated");
                expect(updatedCommentToBeEdited.author.subplebbit.postScore).to.equal(0);
                expect(updatedCommentToBeEdited.author.subplebbit.replyScore).to.equal(0);
                expect(updatedCommentToBeEdited.author.subplebbit.lastCommentCid).to.equal(commentToBeEdited.cid);

                expect(updatedCommentToBeEdited.authorEdit.authorAddress).to.be.undefined;
                expect(updatedCommentToBeEdited.authorEdit.challengeRequestId).to.be.undefined;

                resolve();
            });
        });
    });

    it(`Author can modify comment.content again, while preserving comment.originalContent`, async () => {
        return new Promise(async (resolve, reject) => {
            const editedText = "Double edit test";
            const editReason = "To test double editing a comment";
            const originalContent = commentToBeEdited.original.content;
            const commentEdit = await plebbit.createCommentEdit({
                subplebbitAddress: commentToBeEdited.subplebbitAddress,
                commentCid: commentToBeEdited.cid,
                reason: editReason,
                content: editedText,
                signer
            });
            await commentEdit.publish();
            commentToBeEdited.once("update", async (updatedCommentToBeEdited) => {
                expect(updatedCommentToBeEdited.authorEdit.content).to.equal(editedText, "Comment has not been edited");
                expect(updatedCommentToBeEdited.content).to.equal(editedText, "Comment has not been edited");
                expect(updatedCommentToBeEdited.original?.content).to.equal(originalContent, "Original content should be preserved");
                expect(updatedCommentToBeEdited.authorEdit.reason).to.equal(editReason, "Edit reason has not been updated");
                expect(updatedCommentToBeEdited.author.subplebbit.postScore).to.equal(0);
                expect(updatedCommentToBeEdited.author.subplebbit.replyScore).to.equal(0);
                expect(updatedCommentToBeEdited.author.subplebbit.lastCommentCid).to.equal(commentToBeEdited.cid);

                resolve();
            });
        });
    });

    roles.map((roleTest) =>
        it(`${roleTest.role} can't edit comment.content`, async () => {
            return new Promise(async (resolve) => {
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
                commentEdit.once("challengeverification", async (challengeVerificationMessage, updatedCommentEdit) => {
                    expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                    expect(challengeVerificationMessage.reason).to.be.a(
                        "string",
                        `Should include a reason for refusing publication of a comment edit`
                    );
                    resolve();
                });
            });
        })
    );
});

// describe("Mod function", async () => {
//     let plebbit, commentToBeBanned, authorBanExpiresAt;

//     before(async () => {
//         plebbit = await Plebbit({
//             ipfsHttpClientOptions: "http://localhost:5001/api/v0",
//             pubsubHttpClientOptions: `http://localhost:5002/api/v0`
//         });
//         plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
//             if (authorAddress === "plebbit.eth") return signers[6].address;
//             else if (authorAddress === "testgibbreish.eth") throw new Error(`Domain (${authorAddress}) has no plebbit-author-address`);
//             return authorAddress;
//         };

//         commentToBeBanned = await generateMockPost(subplebbitAddress, plebbit, await plebbit.createSigner());
//         await commentToBeBanned.publish();
//         await waitTillPublicationsArePublished([commentToBeBanned]);
//         expect(commentToBeBanned?.cid).to.be.a("string");
//         await waitTillCommentsUpdate([commentToBeBanned], updateInterval);
//
//         await commentToBeBanned.update(updateInterval);
//         authorBanExpiresAt = timestamp() + 4; // Ban stays for four seconds
//     });

//     after(async () => {
//         await commentToBeBanned.stop();
//     });

//     it(`Mod can ban an author for a comment`, async () =>
//         new Promise(async (resolve) => {
//             const modSigner = roles[2].signer;
//             const banCommentEdit = await plebbit.createCommentEdit({
//                 subplebbitAddress: commentToBeBanned.subplebbitAddress,
//                 commentCid: commentToBeBanned.cid,
//                 authorBanExpiresAt: authorBanExpiresAt,
//                 signer: modSigner
//             });
//             await banCommentEdit.publish();
//             commentToBeBanned.once("update", async (updatedComment) => {
//                 expect(updatedComment.authorBanExpiresAt).to.equals(authorBanExpiresAt, "Author ban expires is not included");
//                 const newCommentByBannedAuthor = await generateMockPost(
//                     commentToBeBanned.subplebbitAddress,
//                     plebbit,
//                     commentToBeBanned.signer
//                 );
//                 await newCommentByBannedAuthor.publish();
//                 newCommentByBannedAuthor.once("challengeverification", async (challengeVerificationMessage, updatedCommentEdit) => {
//                     expect(challengeVerificationMessage.challengeSuccess).to.be.false;
//                     expect(challengeVerificationMessage.reason).to.be.a(
//                         "string",
//                         `Should include a reason for refusing publication of a comment edit`
//                     );
//                     resolve();
//                 });
//             });
//         }));

//     it(`Banned author can publish after authorBanExpiresAt ends`, async () =>
//         new Promise(async (resolve) => {
//             const waitTillAuthorBanExpiresEnds = (resolve) => {
//                 if (timestamp() > authorBanExpiresAt) resolve();
//                 else setTimeout((_) => waitTillAuthorBanExpiresEnds(resolve), 100);
//             };
//             await new Promise(waitTillAuthorBanExpiresEnds);
//             assert(timestamp() > authorBanExpiresAt);
//             const newCommentByBannedAuthor = await generateMockPost(commentToBeBanned.subplebbitAddress, plebbit, commentToBeBanned.signer);
//             await newCommentByBannedAuthor.publish();
//             newCommentByBannedAuthor.once("challengeverification", async (challengeVerificationMessage, updatedCommentEdit) => {
//                 expect(challengeVerificationMessage.challengeSuccess).to.be.true;
//                 expect(challengeVerificationMessage.reason).to.be.not.a.string;
//                 resolve();
//             });
//         }));

//     async(`Mod editing their own comment`);
// });
