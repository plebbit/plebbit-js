const Plebbit = require("../../../dist/node");
const signers = require("../../fixtures/signers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { messages } = require("../../../dist/node/errors");
const { verifyCommentEdit } = require("../../../dist/node/signer/signatures");

let subplebbit, plebbit;

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

    subplebbit = await plebbit.getSubplebbit(signers[0].address);
});

describe("Sign commentedit", async () => {
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
