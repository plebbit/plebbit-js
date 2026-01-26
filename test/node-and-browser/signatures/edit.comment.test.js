import { beforeAll, afterAll } from "vitest";
import { expect } from "chai";
import { mockRemotePlebbit, describeSkipIfRpc } from "../../../dist/node/test/test-util.js";
import signers from "../../fixtures/signers.js";
import { timestamp } from "../../../dist/node/util.js";
import * as remeda from "remeda";
import { messages } from "../../../dist/node/errors.js";
import { verifyCommentEdit, signCommentEdit } from "../../../dist/node/signer/signatures.js";
import validCommentEditFixture from "../../fixtures/signatures/commentEdit/valid_comment_edit.json" with { type: "json" };
describe("Sign commentedit", async () => {
    let plebbit, subplebbit, editProps, editSignature;
    beforeAll(async () => {
        plebbit = await mockRemotePlebbit();
        subplebbit = await plebbit.getSubplebbit({ address: signers[0].address });
        editProps = {
            author: { address: signers[7].address },
            subplebbitAddress: subplebbit.address,
            commentCid: subplebbit.lastPostCid,
            reason: "New comment edit",
            content: "Just so",
            signer: signers[7],
            timestamp: timestamp(),
            protocolVersion: "1.0.0"
        };

        editSignature = await signCommentEdit({ edit: editProps, plebbit });
    });

    afterAll(async () => {
        await plebbit.destroy();
    });

    it(`plebbit.createCommentEdit creates a valid CommentEdit`, async () => {
        const commentEdit = await plebbit.createCommentEdit(editProps);
        expect(commentEdit.signature).to.deep.equal(editSignature);

        const verification = await verifyCommentEdit({
            edit: remeda.omit({ ...editProps, signature: editSignature }, ["signer"]),
            resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
            clientsManager: plebbit._clientsManager,
            overrideAuthorAddressIfInvalid: false
        });
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`signCommentEdit throws with author.address not being an IPNS or domain`, async () => {
        const cloneEdit = remeda.clone(editProps);
        cloneEdit.author.address = "gibbreish";
        try {
            await signCommentEdit({ edit: { ...cloneEdit, signer: signers[7] }, plebbit });
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER");
        }
    });
    it(`SignCommentEdit throws with author.address=undefined`, async () => {
        const cloneEdit = remeda.clone(editProps);
        cloneEdit.author.address = undefined;
        try {
            await signCommentEdit({ edit: { ...cloneEdit, signer: signers[7] }, plebbit });
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_AUTHOR_ADDRESS_UNDEFINED");
        }
    });
});

// Clients of RPC will trust the response of RPC and won't validate
describeSkipIfRpc("Verify CommentEdit", async () => {
    let plebbit;
    beforeAll(async () => {
        plebbit = await mockRemotePlebbit();
        await plebbit.createCommentEdit(validCommentEditFixture); // should throw if it has an invalid schema
    });
    it(`Valid CommentEdit signature fixture is validated correctly`, async () => {
        const edit = remeda.clone(validCommentEditFixture);
        const verification = await verifyCommentEdit({ edit, resolveAuthorAddresses: plebbit.resolveAuthorAddresses, clientsManager: plebbit._clientsManager, overrideAuthorAddressIfInvalid: false });
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`Invalid CommentEdit signature gets invalidated correctly`, async () => {
        const edit = remeda.clone(validCommentEditFixture);
        edit.reason += "1234"; // Should invalidate comment edit
        const verification = await verifyCommentEdit({ edit, resolveAuthorAddresses: plebbit.resolveAuthorAddresses, clientsManager: plebbit._clientsManager, overrideAuthorAddressIfInvalid: false });
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`verifyCommentEdit invalidates a commentEdit with author.address not a domain or IPNS`, async () => {
        const edit = remeda.clone(validCommentEditFixture);
        edit.author.address = "gibbresish"; // Not a domain or IPNS
        const verification = await verifyCommentEdit({ edit, resolveAuthorAddresses: plebbit.resolveAuthorAddresses, clientsManager: plebbit._clientsManager, overrideAuthorAddressIfInvalid: false });
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58 });
    });
    it("verifyCommentEdit invalidates a commentEdit with author.address = undefined", async () => {
        const edit = remeda.clone(validCommentEditFixture);
        edit.author.address = undefined; // Not a domain or IPNS
        const verification = await verifyCommentEdit({ edit, resolveAuthorAddresses: plebbit.resolveAuthorAddresses, clientsManager: plebbit._clientsManager, overrideAuthorAddressIfInvalid: false });
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_ADDRESS_UNDEFINED });
    });
});
