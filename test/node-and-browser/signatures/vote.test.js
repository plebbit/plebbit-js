import signers from "../../fixtures/signers.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import { messages } from "../../../dist/node/errors.js";
import { verifyVote, signVote } from "../../../dist/node/signer/signatures.js";
import { mockRemotePlebbit, isRpcFlagOn } from "../../../dist/node/test/test-util.js";
import lodash from "lodash";
import { timestamp } from "../../../dist/node/util.js";
import validVoteFixture from "../../fixtures/valid_vote.json" assert { type: "json" };

describe("Sign Vote", async () => {
    let plebbit, subplebbit, voteProps, voteSignature;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);

        voteProps = {
            author: { address: signers[7].address },
            subplebbitAddress: subplebbit.address,
            commentCid: subplebbit.lastPostCid,
            timestamp: timestamp(),
            vote: 1,
            signer: signers[7]
        };
        voteSignature = await signVote(voteProps, signers[7], plebbit);
    });
    it(`Can sign and validate Vote correctly`, async () => {
        const verification = await verifyVote(
            { ...voteProps, signature: voteSignature },
            plebbit.resolveAuthorAddresses,
            plebbit._clientsManager,
            false
        );
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`signVote throws with author.address not being an IPNS or domain`, async () => {
        const cloneVote = lodash.cloneDeep(voteProps);
        cloneVote.author.address = "gibbreish";
        assert.isRejected(signVote(cloneVote, signers[7], plebbit), messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58);
    });
    it(`signVote throws with author.address=undefined`, async () => {
        const cloneVote = lodash.cloneDeep(voteProps);
        cloneVote.author.address = undefined;
        assert.isRejected(signVote(cloneVote, signers[7], plebbit), messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58);
    });
});

// prettier-ignore
if (!isRpcFlagOn()) // Clients of RPC will trust the response of RPC and won't validate
describe("Verify vote", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });
    it(`Valid vote signature fixture is validated correctly`, async () => {
        const vote = lodash.cloneDeep(validVoteFixture);
        const verification = await verifyVote(vote, plebbit.resolveAuthorAddresses, plebbit._clientsManager, false);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`Invalid vote signature gets invalidated correctly`, async () => {
        const vote = lodash.cloneDeep(validVoteFixture);
        vote.commentCid += "1234"; // Should invalidate signature
        const verification = await verifyVote(vote, plebbit.resolveAuthorAddresses, plebbit._clientsManager, false);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`verifyVote invalidates a vote with author.address not a domain or IPNS`, async () => {
        const vote = lodash.cloneDeep(validVoteFixture);
        vote.author.address = "gibbresish"; // Not a domain or IPNS
        const verification = await verifyVote(vote, plebbit.resolveAuthorAddresses, plebbit._clientsManager, false);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58 });
    });
    it("verifyVote invalidates a vote with author.address = undefined", async () => {
        const vote = lodash.cloneDeep(validVoteFixture);
        vote.author.address = undefined; // Not a domain or IPNS
        const verification = await verifyVote(vote, plebbit.resolveAuthorAddresses, plebbit._clientsManager, false);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_ADDRESS_UNDEFINED });
    });
});
