const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { generateMockPost, waitTillNewCommentIsPublished, mockPlebbit } = require("../../dist/node/test/test-util");
const { timestamp } = require("../../dist/node/util");
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

describe("Editing comment.content", async () => {
    let plebbit, commentToBeEdited;

    before(async () => {
        plebbit = await mockPlebbit();

        commentToBeEdited = await waitTillNewCommentIsPublished(subplebbitAddress, plebbit);
        commentToBeEdited._updateIntervalMs = updateInterval;
        await Promise.all([new Promise((resolve) => commentToBeEdited.once("update", resolve)), commentToBeEdited.update()]);
    });

    after(async () => {
        await commentToBeEdited.stop();
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

    it("Fails to edit content if not original author", async function () {
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
        const editedText = "edit test";
        const editReason = "To test editing a comment";

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
            const commentToEdit = await waitTillNewCommentIsPublished(subplebbitAddress, plebbit, { signer: roleTest.signer });
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

describe(`banExpiresAt`, async () => {
    let plebbit, commentToBeBanned, authorBanExpiresAt;

    before(async () => {
        plebbit = await mockPlebbit();
        commentToBeBanned = await waitTillNewCommentIsPublished(subplebbitAddress, plebbit);
        commentToBeBanned._updateIntervalMs = updateInterval;
        await Promise.all([new Promise((resolve) => commentToBeBanned.once("update", resolve)), commentToBeBanned.update()]);
        authorBanExpiresAt = timestamp() + 6; // Ban stays for six seconds
    });

    after(async () => {
        await commentToBeBanned.stop();
    });

    it(`Mod can ban an author for a comment`, async () => {
        const modSigner = roles[2].signer;
        const banCommentEdit = await plebbit.createCommentEdit({
            subplebbitAddress: commentToBeBanned.subplebbitAddress,
            commentCid: commentToBeBanned.cid,
            commentAuthor: { banExpiresAt: authorBanExpiresAt },
            signer: modSigner
        });
        expect(banCommentEdit.commentAuthor.banExpiresAt).to.equal(authorBanExpiresAt);
        await banCommentEdit.publish();
        await new Promise((resolve) => commentToBeBanned.once("update", resolve));
        expect(commentToBeBanned.author.banExpiresAt).to.equals(authorBanExpiresAt);
        const newCommentByBannedAuthor = await generateMockPost(commentToBeBanned.subplebbitAddress, plebbit, commentToBeBanned.signer);
        await newCommentByBannedAuthor.publish();
        await new Promise((resolve) =>
            newCommentByBannedAuthor.once("challengeverification", async (challengeVerificationMessage, updatedCommentEdit) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                expect(challengeVerificationMessage.reason).to.be.equal(messages.ERR_AUTHOR_IS_BANNED);
                resolve();
            })
        );
    });

    it(`Banned author can publish after authorBanExpiresAt ends`, async () => {
        const waitTillAuthorBanExpiresEnds = (resolve) => {
            if (timestamp() > authorBanExpiresAt) resolve();
            else setTimeout(() => waitTillAuthorBanExpiresEnds(resolve), 100);
        };
        await new Promise(waitTillAuthorBanExpiresEnds);
        expect(timestamp()).to.be.greaterThan(authorBanExpiresAt);
        const newCommentByBannedAuthor = await generateMockPost(commentToBeBanned.subplebbitAddress, plebbit, commentToBeBanned.signer);
        await newCommentByBannedAuthor.publish();

        await new Promise((resolve) =>
            newCommentByBannedAuthor.once("challengeverification", async (challengeVerificationMessage, updatedCommentEdit) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                expect(challengeVerificationMessage.reason).to.be.not.a.string;
                resolve();
            })
        );
    });

    it(`Regular author can't ban another author`, async () => {
        const tryToBanComment = await waitTillNewCommentIsPublished(subplebbitAddress, plebbit);

        const banCommentEdit = await plebbit.createCommentEdit({
            subplebbitAddress: tryToBanComment.subplebbitAddress,
            commentCid: tryToBanComment.cid,
            commentAuthor: { banExpiresAt: authorBanExpiresAt + 1000 },
            signer: await plebbit.createSigner()
        });
        await banCommentEdit.publish();

        await new Promise((resolve) =>
            banCommentEdit.once("challengeverification", async (challengeVerificationMessage, updatedCommentEdit) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                expect(challengeVerificationMessage.reason).to.equal(messages.ERR_UNAUTHORIZED_COMMENT_EDIT);
                resolve();
            })
        );
    });
});

describe("Delete comments", async () => {
    it(`Mod can mark a comment as deleted`);
    it(`Deleted comments don't show in pages`);
    it(`Sub rejects votes or comments under deleted comment`);
    it(`Mod can delete their own comment`);
});

describe("Remove comments", async () => {});
