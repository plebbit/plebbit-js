const Plebbit = require("../../../dist/node");
const signers = require("../../fixtures/signers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { messages } = require("../../../dist/node/errors");
const { verifyCommentEdit } = require("../../../dist/node/signer/signatures");
const { mockPlebbit } = require("../../../dist/node/test/test-util");

describe("Sign commentedit", async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);
    });

    it(`Can sign and validate commentEdit correctly`, async () => {
        const edit = await plebbit.createCommentEdit({
            subplebbitAddress: subplebbit.address,
            commentCid: subplebbit.lastPostCid,
            reason: "New comment edit",
            content: "Just so",
            signer: signers[7]
        });

        const verification = await verifyCommentEdit(edit, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });
});

describe("Verify CommentEdit", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`Valid CommentEdit signature fixture is validated correctly`, async () => {
        const edit = JSON.parse(JSON.stringify(require("../../fixtures/valid_comment_edit.json")));
        const verification = await verifyCommentEdit(edit, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`Invalid CommentEdit signature gets invalidated correctly`, async () => {
        const edit = JSON.parse(JSON.stringify(require("../../fixtures/valid_comment_edit.json")));
        edit.reason += "1234"; // Should invalidate comment edit
        const verification = await verifyCommentEdit(edit, plebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });
});
