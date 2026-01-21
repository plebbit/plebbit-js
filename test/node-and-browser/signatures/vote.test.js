import { expect } from "chai";
import signers from "../../fixtures/signers.js";
import { describeSkipIfRpc, mockPlebbitNoDataPathWithOnlyKuboClient } from "../../../dist/node/test/test-util.js";
import { messages } from "../../../dist/node/errors.js";
import { verifyVote, signVote } from "../../../dist/node/signer/signatures.js";
import * as remeda from "remeda";
import { timestamp } from "../../../dist/node/util.js";
import validVoteFixture from "../../fixtures/valid_vote.json" with { type: "json" };

describe.concurrent("Sign Vote", async () => {
    let plebbit, subplebbit, voteProps, voteSignature;
    before(async () => {
        plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await plebbit.getSubplebbit({ address: signers[0].address });

        voteProps = {
            author: { address: signers[7].address },
            subplebbitAddress: subplebbit.address,
            commentCid: subplebbit.lastPostCid,
            timestamp: timestamp(),
            vote: 1
        };
        voteSignature = await signVote({ vote: { ...voteProps, signer: signers[7] }, plebbit });
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`Can sign and validate Vote correctly`, async () => {
        const verification = await verifyVote({
            vote: { ...voteProps, signature: voteSignature },
            resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
            clientsManager: plebbit._clientsManager,
            overrideAuthorAddressIfInvalid: false
        });
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`signVote throws with author.address not being an IPNS or domain`, async () => {
        const cloneVote = remeda.clone(voteProps);
        cloneVote.author.address = "gibbreish";
        try {
            await signVote({ vote: { ...cloneVote, signer: signers[7] }, plebbit });
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER");
        }
    });
    it(`signVote throws with author.address=undefined`, async () => {
        const cloneVote = remeda.clone(voteProps);
        cloneVote.author.address = undefined;
        try {
            await signVote({ vote: { ...cloneVote, signer: signers[7] }, plebbit });
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_AUTHOR_ADDRESS_UNDEFINED");
        }
    });
});

// Clients of RPC will trust the response of RPC and won't validate
describeSkipIfRpc.concurrent("Verify vote", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`Valid vote signature fixture is validated correctly`, async () => {
        const vote = remeda.clone(validVoteFixture);
        const verification = await verifyVote({ vote, resolveAuthorAddresses: plebbit.resolveAuthorAddresses, clientsManager: plebbit._clientsManager, overrideAuthorAddressIfInvalid: false });
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`Invalid vote signature gets invalidated correctly`, async () => {
        const vote = remeda.clone(validVoteFixture);
        vote.commentCid += "1234"; // Should invalidate signature
        const verification = await verifyVote({ vote, resolveAuthorAddresses: plebbit.resolveAuthorAddresses, clientsManager: plebbit._clientsManager, overrideAuthorAddressIfInvalid: false });
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`verifyVote invalidates a vote with author.address not a domain or IPNS`, async () => {
        const vote = remeda.clone(validVoteFixture);
        vote.author.address = "gibbresish"; // Not a domain or IPNS
        const verification = await verifyVote({ vote, resolveAuthorAddresses: plebbit.resolveAuthorAddresses, clientsManager: plebbit._clientsManager, overrideAuthorAddressIfInvalid: false });
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58 });
    });
    it("verifyVote invalidates a vote with author.address = undefined", async () => {
        const vote = remeda.clone(validVoteFixture);
        vote.author.address = undefined; // Not a domain or IPNS
        const verification = await verifyVote({ vote, resolveAuthorAddresses: plebbit.resolveAuthorAddresses, clientsManager: plebbit._clientsManager, overrideAuthorAddressIfInvalid: false });
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_ADDRESS_UNDEFINED });
    });
});
