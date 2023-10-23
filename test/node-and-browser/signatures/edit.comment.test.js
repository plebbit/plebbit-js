const Plebbit = require("../../../dist/node");
const signers = require("../../fixtures/signers");
const { timestamp } = require("../../../dist/node/util");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const lodash = require("lodash");
const { messages } = require("../../../dist/node/errors");
const { verifyCommentEdit, signCommentEdit } = require("../../../dist/node/signer/signatures");
const { mockPlebbit } = require("../../../dist/node/test/test-util");

describe("Sign commentedit", async () => {
    let plebbit, subplebbit, editProps, editSignature;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);
        editProps = {
            author: { address: signers[7].address },
            subplebbitAddress: subplebbit.address,
            commentCid: subplebbit.lastPostCid,
            reason: "New comment edit",
            content: "Just so",
            signer: signers[7],
            timestamp: timestamp()
        };
        editSignature = await signCommentEdit(editProps, signers[7], plebbit);
    });

    it(`plebbit.createCommentEdit creates a valid CommentEdit`, async () => {
        const verification = await verifyCommentEdit(
            { ...editProps, signature: editSignature },
            plebbit.resolveAuthorAddresses,
            plebbit._clientsManager,
            false
        );
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`signCommentEdit throws with author.address not being an IPNS or domain`, async () => {
        const cloneEdit = lodash.cloneDeep(editProps);
        cloneEdit.author.address = "gibbreish";
        assert.isRejected(signCommentEdit(cloneEdit, signers[7], plebbit), messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58);
    });
    it(`SignCommentEdit throws with author.address=undefined`, async () => {
        const cloneEdit = lodash.cloneDeep(editProps);
        cloneEdit.author.address = undefined;
        assert.isRejected(signCommentEdit(cloneEdit, signers[7], plebbit), messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58);
    });
});

// prettier-ignore
if (!process.env["USE_RPC"]) // Clients of RPC will trust the response of RPC and won't validate
describe("Verify CommentEdit", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`Valid CommentEdit signature fixture is validated correctly`, async () => {
        const edit = lodash.cloneDeep(require("../../fixtures/signatures/commentEdit/valid_comment_edit.json"));
        const verification = await verifyCommentEdit(edit, plebbit.resolveAuthorAddresses, plebbit._clientsManager, false);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`Invalid CommentEdit signature gets invalidated correctly`, async () => {
        const edit = lodash.cloneDeep(require("../../fixtures/signatures/commentEdit/valid_comment_edit.json"));
        edit.reason += "1234"; // Should invalidate comment edit
        const verification = await verifyCommentEdit(edit, plebbit.resolveAuthorAddresses, plebbit._clientsManager, false);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`verifyCommentEdit invalidates a commentEdit with author.address not a domain or IPNS`, async () => {
        const edit = lodash.cloneDeep(require("../../fixtures/signatures/commentEdit/valid_comment_edit.json"));
        edit.author.address = "gibbresish"; // Not a domain or IPNS
        const verification = await verifyCommentEdit(edit, plebbit.resolveAuthorAddresses, plebbit._clientsManager, false);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58 });
    });
    it("verifyCommentEdit invalidates a commentEdit with author.address = undefined", async () => {
        const edit = lodash.cloneDeep(require("../../fixtures/signatures/commentEdit/valid_comment_edit.json"));
        edit.author.address = undefined; // Not a domain or IPNS
        const verification = await verifyCommentEdit(edit, plebbit.resolveAuthorAddresses, plebbit._clientsManager, false);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_ADDRESS_UNDEFINED });
    });
});
