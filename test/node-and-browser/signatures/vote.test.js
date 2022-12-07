const Plebbit = require("../../../dist/node");
const signers = require("../../fixtures/signers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { messages } = require("../../../dist/node/errors");
const { verifyVote, signVote } = require("../../../dist/node/signer/signatures");
const { mockPlebbit } = require("../../../dist/node/test/test-util");

describe("Sign Vote", async () => {
    let plebbit, subplebbit, vote;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);
    });
    it(`Can sign and validate Vote correctly`, async () => {
        vote = await plebbit.createVote({
            subplebbitAddress: subplebbit.address,
            commentCid: subplebbit.lastPostCid,
            vote: 1,
            signer: signers[7]
        });

        const verification = await verifyVote(vote, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`signVote throws with author.address not being an IPNS or domain`, async () => {
        const cloneVote = JSON.parse(JSON.stringify(vote));
        delete cloneVote["signature"];
        cloneVote.author.address = "gibbreish";
        assert.isRejected(signVote(cloneVote, signers[7]), messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_IPNS);
    });
    it(`signVote throws with author.address=undefined`, async () => {
        const cloneVote = JSON.parse(JSON.stringify(vote));
        delete cloneVote["signature"];
        cloneVote.author.address = undefined;
        assert.isRejected(signVote(cloneVote, signers[7]), messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_IPNS);
    });
});

describe("Verify vote", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`Valid vote signature fixture is validated correctly`, async () => {
        const vote = JSON.parse(JSON.stringify(require("../../fixtures/valid_vote.json")));
        const verification = await verifyVote(vote, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`Invalid vote signature gets invalidated correctly`, async () => {
        const vote = JSON.parse(JSON.stringify(require("../../fixtures/valid_vote.json")));
        vote.commentCid += "1234"; // Should invalidate signature
        const verification = await verifyVote(vote, plebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });
});
