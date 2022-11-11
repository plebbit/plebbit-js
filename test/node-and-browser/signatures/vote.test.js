const Plebbit = require("../../../dist/node");
const signers = require("../../fixtures/signers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { messages } = require("../../../dist/node/errors");
const { verifyVote } = require("../../../dist/node/signer/signatures");

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

describe("Sign Vote", async () => {
    it(`Can sign and validate commentEdit correctly`, async () => {
        const vote = await plebbit.createVote({
            subplebbitAddress: subplebbit.address,
            commentCid: subplebbit.lastPostCid,
            vote: 1,
            signer: signers[7]
        });

        const verification = await verifyVote(vote, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });
});

describe("Verify vote", async () => {
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
