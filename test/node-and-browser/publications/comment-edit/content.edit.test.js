import signers from "../../../fixtures/signers.js";
import {
    findCommentInPage,
    mockRemotePlebbit,
    publishRandomPost,
    publishWithExpectedResult,
    resolveWhenConditionIsTrue
} from "../../../../dist/node/test/test-util.js";
import { expect } from "chai";
import { messages } from "../../../../dist/node/errors.js";
import * as remeda from "remeda";
const subplebbitAddress = signers[0].address;
const roles = [
    { role: "owner", signer: signers[1] },
    { role: "admin", signer: signers[2] },
    { role: "mod", signer: signers[3] }
];

describe("Editing comment.content", async () => {
    let plebbit, commentToBeEdited, originalContent;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        commentToBeEdited = await publishRandomPost(subplebbitAddress, plebbit, { content: "original content" });
        originalContent = remeda.clone(commentToBeEdited.content);
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
        const editReason = "To test editing content" + Date.now();

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

    it(`The new content is reflected correctly in JSON.parse(JSON.stringif(comment)) and toJSONCommentWithinPage`, async () => {
        const recreatedComment = await plebbit.getComment(commentToBeEdited.cid);
        await recreatedComment.update();

        await resolveWhenConditionIsTrue(recreatedComment, () => recreatedComment.updatedAt);
        await recreatedComment.stop();

        for (const commentJson of [JSON.parse(JSON.stringify(commentToBeEdited)), JSON.parse(JSON.stringify(recreatedComment))]) {
            expect(commentJson.content.startsWith("edit test")).to.be.true;
            expect(commentJson.edit.content.startsWith("edit test")).to.be.true;
            expect(commentJson.original.content).to.equal(originalContent);
            expect(commentJson.reason.startsWith("To test editing content")).to.be.true;
        }
    });

    it(`The new content should be reflected in subplebbit.posts`, async () => {
        const subplebbit1 = await plebbit.getSubplebbit(commentToBeEdited.subplebbitAddress);
        const subplebbit2 = await plebbit.createSubplebbit(subplebbit1); // we're testing if posts from subplebbit are parsed correctly
        const subplebbit3 = await plebbit.createSubplebbit(JSON.parse(JSON.stringify(subplebbit1)));
        for (const subplebbit of [subplebbit1, subplebbit2, subplebbit3]) {
            const editedCommentInPage = await findCommentInPage(commentToBeEdited.cid, subplebbit.posts.pageCids.new, subplebbit.posts);
            expect(editedCommentInPage).to.be.a("object");
            // Should reflect the new content, and also have original.content
            expect(editedCommentInPage.content.startsWith("edit test")).to.be.true;
            expect(editedCommentInPage.edit.content.startsWith("edit test")).to.be.true;
            expect(editedCommentInPage.original.content).to.equal(originalContent);
            expect(editedCommentInPage.reason.startsWith("To test editing content")).to.be.true;
        }
    });

    it(`The new content should be reflected in JSON.parse(JSON.stringify(subplebbit)).posts.pages`, async () => {
        const sub1 = await plebbit.getSubplebbit(commentToBeEdited.subplebbitAddress);
        const sub2 = await plebbit.createSubplebbit(sub1); // we're testing if posts from subplebbit are parsed correctly
        const sub3 = await plebbit.createSubplebbit(JSON.parse(JSON.stringify(sub1)));

        for (const sub of [sub1, sub2, sub3]) {
            const subJson = JSON.parse(JSON.stringify(sub));
            const editedCommentInPage = subJson.posts.pages.hot.comments.find((comment) =>
                comment.reason?.startsWith("To test editing content")
            );
            expect(editedCommentInPage).to.be.a("object");
            expect(editedCommentInPage.content.startsWith("edit test")).to.be.true;
            expect(editedCommentInPage.edit.content.startsWith("edit test")).to.be.true;
            expect(editedCommentInPage.original.content.startsWith("original content")).to.be.true;
        }
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
            const originalContent = remeda.clone(commentToEdit.content);
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
