const Plebbit = require("../../../dist/node");
const { expect } = require("chai");
const signers = require("../../fixtures/signers");
const { mockPlebbit } = require("../../../dist/node/test/test-util");

const subplebbitAddress = signers[0].address;
const commentToEditCid = "QmRxNUGsYYg3hxRnhnbvETdYSc16PXqzgF8WP87UXpb9Rs";
describe("CommentEdit", async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`(edit: CommentEdit) === plebbit.createCommentEdit(JSON.parse(JSON.stringify(edit)))`, async () => {
        const props = {
            subplebbitAddress: subplebbitAddress,
            commentCid: commentToEditCid,
            reason: "editReason" + Date.now(),
            content: "editedText" + Date.now(),
            signer: signers[7] // Create a new signer, different than the signer of the original comment
        };
        const edit = await plebbit.createCommentEdit(props);
        const editFromStringifiedEdit = await plebbit.createCommentEdit(JSON.parse(JSON.stringify(edit)));
        for (const curEdit of [edit, editFromStringifiedEdit]) {
            expect(curEdit.subplebbitAddress).to.equal(props.subplebbitAddress);
            expect(curEdit.commentCid).to.equal(props.commentCid);
            expect(curEdit.reason).to.equal(props.reason);
            expect(curEdit.content).to.equal(props.content);
            expect(curEdit.author.address).to.deep.equal(props.signer.address);
        }

        expect(edit.timestamp).to.equal(editFromStringifiedEdit.timestamp);

        expect(JSON.stringify(edit)).to.equal(JSON.stringify(editFromStringifiedEdit));
    });

    it(`(edit: CommentEdit) === await plebbit.createCommentEdit(edit)`, async () => {
        const props = {
            subplebbitAddress: subplebbitAddress,
            commentCid: commentToEditCid,
            reason: "editReason" + Date.now(),
            content: "editedText" + Date.now(),
            signer: signers[7] // Create a new signer, different than the signer of the original comment
        };
        const edit = await plebbit.createCommentEdit(props);
        const editFromEdit = await plebbit.createCommentEdit(edit);
        [edit, editFromEdit].forEach((curEdit) => {
            expect(curEdit.subplebbitAddress).to.equal(props.subplebbitAddress);
            expect(curEdit.commentCid).to.equal(props.commentCid);
            expect(curEdit.reason).to.equal(props.reason);
            expect(curEdit.content).to.equal(props.content);
            expect(curEdit.author.address).to.deep.equal(props.signer.address);
            expect(curEdit.signer).to.deep.equal(props.signer);
        });
        expect(edit.timestamp).to.equal(editFromEdit.timestamp);

        expect(JSON.stringify(edit)).to.equal(JSON.stringify(editFromEdit));
    });
});
