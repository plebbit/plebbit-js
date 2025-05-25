import { expect } from "chai";
import { mockRemotePlebbit, describeSkipIfRpc, resolveWhenConditionIsTrue } from "../../../dist/node/test/test-util.js";
import {
    signComment,
    verifyCommentUpdate,
    signCommentUpdate,
    signCommentEdit,
    verifyCommentPubsubMessage,
    verifyCommentIpfs
} from "../../../dist/node/signer/signatures.js";
import { messages } from "../../../dist/node/errors.js";
import signers from "../../fixtures/signers.js";
import { timestamp } from "../../../dist/node/util.js";
import * as remeda from "remeda";
import validCommentFixture from "../../fixtures/signatures/comment/commentUpdate/valid_comment_ipfs.json" with { type: "json" };
import validCommentAvatarFixture from "../../fixtures/signatures/comment/valid_comment_avatar_fixture.json" with { type: "json" };
import validCommentAuthorAddressDomainFixture from "../../fixtures/signatures/comment/valid_comment_author_address_as_domain.json" with { type: "json" };
import validCommentUpdateFixture from "../../fixtures/signatures/comment/commentUpdate/valid_comment_update.json" with { type: "json" };
import validCommentUpdateWithAuthorEditFixture from "../../fixtures/signatures/comment/commentUpdate_authorEdit/valid_comment_update.json" with { type: "json" };
import validCommentWithAuthorEditFixture from "../../fixtures/signatures/comment/commentUpdate_authorEdit/valid_comment_ipfs.json" with { type: "json" };
import { comment as fixtureComment } from "../../fixtures/publications.js";

const fixtureSignature = {
    signature: "RTBNJ8bEnvEENOAxzk3pqxc9I3a0M9H7qlXsL5yu2frEEbJKqf789eFVnmyccmB99hyBb1Hyw5Soqma+RIxIAw",
    publicKey: "CFhuD55tmzZjWZ113tZbDw/AsuNDkgSdvCCbPeqiF10",
    type: "ed25519",
    signedPropertyNames: Object.keys(fixtureComment).sort()
};

describe("sign comment", async () => {
    let plebbit, signedCommentClone;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    after(async () => {
        await plebbit.destroy();
    });

    it("Can sign a comment with randomly generated key", async () => {
        const signer = await plebbit.createSigner();

        const comment = {
            subplebbitAddress: signers[0].address,
            author: { address: signer.address },
            timestamp: timestamp(),
            title: "Test post signature",
            content: "some content..."
        };
        const signature = await signComment({ ...comment, signer }, plebbit);
        expect(signature.publicKey).to.equal(signer.publicKey);
        const signedComment = { signature: signature, ...comment };
        const verificaiton = await verifyCommentPubsubMessage(signedComment, plebbit.resolveAuthorAddresses);
        expect(verificaiton).to.deep.equal({ valid: true });
        signedCommentClone = remeda.clone(signedComment);
    });

    it("Can sign a comment with an imported key", async () => {
        const signer = await plebbit.createSigner({ privateKey: signers[1].privateKey, type: "ed25519" });
        const comment = {
            subplebbitAddress: signers[0].address,
            author: { address: signer.address },
            timestamp: timestamp(),
            title: "Test post signature",
            content: "some content..."
        };
        const signature = await signComment({ ...comment, signer }, plebbit);
        const signedComment = { signature: signature, ...comment };
        expect(signedComment.signature.publicKey).to.be.equal(signers[1].publicKey, "Generated public key should be same as provided");
        const verificaiton = await verifyCommentPubsubMessage(signedComment, plebbit.resolveAuthorAddresses);
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it("signComment author signature is correct", async () => {
        const authorSignature = await signComment({ ...fixtureComment, signer: signers[1] }, plebbit);
        expect(authorSignature).to.exist;
        expect(authorSignature.signature).to.equal(fixtureSignature.signature);
        expect(authorSignature.publicKey).to.equal(fixtureSignature.publicKey);
        expect(authorSignature.type).to.equal(fixtureSignature.type);
        expect(authorSignature.signedPropertyNames.sort()).to.deep.equal(fixtureSignature.signedPropertyNames);
    });

    it(`signComment throws with invalid author`, async () => {
        const randomSigner = signers[3];
        // Trying to sign a publication with author.address !== randomSigner.address
        // should throw an error
        try {
            await signComment({ ...fixtureComment, signer: randomSigner }, plebbit);
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER");
        }
    });

    it(`signComment throws with author.address not being an IPNS or domain`, async () => {
        const cloneComment = remeda.clone(signedCommentClone);
        delete cloneComment["signature"];
        cloneComment.author.address = "gibbreish";
        try {
            await signComment({ ...cloneComment, signer: signers[7] }, plebbit);
        } catch (e) {
            expect(e.code).to.equal("ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER");
        }
    });
    it(`signComment throws with author.address=undefined`, async () => {
        const cloneComment = remeda.clone(signedCommentClone);
        delete cloneComment["signature"];
        cloneComment.author.address = undefined;
        try {
            await signComment({ ...cloneComment, signer: signers[7] }, plebbit);
        } catch (e) {
            expect(e.code).to.equal("ERR_AUTHOR_ADDRESS_UNDEFINED");
        }
    });
    it("can sign a comment with author.displayName = undefined", async () => {
        const signer = signers[4];

        const comment = {
            title: "comment title",
            content: "comment content",
            subplebbitAddress: signer.address,
            author: { address: signer.address },
            timestamp: 12345678
        };
        const signature = await signComment({ ...comment, signer: signers[4] }, plebbit);
        const res = await verifyCommentPubsubMessage({ ...comment, signature }, plebbit.resolveAuthorAddresses);
        expect(res).to.deep.equal({ valid: true });
    });
});

// Clients of RPC will trust the response of RPC and won't validate
describeSkipIfRpc("verify Comment", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`Valid signature fixture is validated correctly`, async () => {
        const fixtureWithSignature = { ...fixtureComment, signature: fixtureSignature };
        const verification = await verifyCommentPubsubMessage(fixtureWithSignature, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });

    it("verifyCommentPubsubMessage failure with wrong signature", async () => {
        const invalidSignature = remeda.clone(fixtureSignature);
        invalidSignature.signature += "1";

        const wronglySignedPublication = { ...fixtureComment, signature: invalidSignature };
        const verification = await verifyCommentPubsubMessage(wronglySignedPublication, plebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`Valid Comment fixture from previous plebbit-js version is validated correctly`, async () => {
        const comment = remeda.clone(validCommentFixture);

        const verification = await verifyCommentIpfs({ comment, clientsManager: plebbit._clientsManager });
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`A comment with avatar fixture is validated correctly`, async () => {
        const comment = remeda.clone(validCommentAvatarFixture);
        const verification = await verifyCommentIpfs({ comment, clientsManager: plebbit._clientsManager, resolveAuthorAddresses: true });
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`verifyCommentPubsubMessage invalidates a comment with author.address not a domain or IPNS`, async () => {
        const comment = remeda.clone({ ...fixtureComment, signature: fixtureSignature });
        comment.author.address = "gibbresish"; // Not a domain or IPNS
        const verification = await verifyCommentPubsubMessage(comment, plebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58 });
    });
    it("verifyCommentPubsubMessage invalidates a comment with author.address = undefined", async () => {
        const comment = remeda.clone({ ...fixtureComment, signature: fixtureSignature });
        comment.author.address = undefined; // Not a domain or IPNS
        const verification = await verifyCommentPubsubMessage(comment, plebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_ADDRESS_UNDEFINED });
    });

    // TODO when flairs are implemented
    it(`Can sign and verify a comment with flair`);
    it(`Can verify a comment whose author.flair have been changed`);
    it(`can verify a comment whose flair have been changed by mod`);
});

// Clients of RPC will trust the response of RPC and won't validate
describeSkipIfRpc(`Comment with author.address as domain`, async () => {
    it(`verifyCommentPubsubMessage corrects author.address(domain) if it resolves to a different author (overrideAuthorAddressIfInvalid=true)`, async () => {
        const tempPlebbit = await mockRemotePlebbit();
        tempPlebbit._clientsManager.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "testDomain.eth" ? fixtureComment.author.address : authorAddress;
        const commentWithInvalidDomain = remeda.clone(fixtureComment);
        commentWithInvalidDomain.author.address = "testDomain.eth";
        const signedPublication = {
            ...commentWithInvalidDomain,
            signature: await signComment({ ...commentWithInvalidDomain, signer: signers[1] }, tempPlebbit)
        };
        tempPlebbit._clientsManager.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "testDomain.eth" ? signers[6].address : authorAddress; // testDomain.eth no longer points to the same author

        const verificaiton = await verifyCommentPubsubMessage(
            signedPublication,
            tempPlebbit.resolveAuthorAddresses,
            tempPlebbit._clientsManager,
            true
        );
        expect(verificaiton).to.deep.equal({ valid: true, derivedAddress: signers[1].address });
        expect(signedPublication.author.address).to.equal(fixtureComment.author.address); // It has been corrected to the original signer even though resolver is resolving to signers[6]
        await tempPlebbit.destroy();
    });
    it(`Comment with invalid author domain address will will be invalidated (overrideAuthorAddressIfInvalid=false)`, async () => {
        const comment = remeda.clone(validCommentAuthorAddressDomainFixture);
        const tempPlebbit = await mockRemotePlebbit();
        tempPlebbit._clientsManager.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "plebbit.eth" ? signers[7].address : authorAddress; // This would invalidate the fixture author address. Should be corrected

        const verification = await verifyCommentIpfs({
            comment,
            resolveAuthorAddresses: tempPlebbit.resolveAuthorAddresses,
            clientsManager: tempPlebbit._clientsManager,
            overrideAuthorAddressIfInvalid: false
        });

        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE });

        expect(comment.author.address).to.equal("plebbit.eth"); // should remain the same
        await tempPlebbit.destroy();
    });
});

// Clients of RPC will trust the response of RPC and won't validate
describeSkipIfRpc(`commentupdate`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`Can validate live CommentUpdate`, async () => {
        const comment = await plebbit.getComment(subplebbit.lastPostCid);
        await comment.update();
        await resolveWhenConditionIsTrue(comment, () => typeof comment.updatedAt === "number");
        await comment.stop();
        // If a comment emits "update" that means the commentUpdate have been verified correctly

        const commentUpdateRecord = comment.raw.commentUpdate;
        expect(
            await verifyCommentUpdate({
                update: commentUpdateRecord,
                resolveAuthorAddresses: true,
                clientsManager: comment._clientsManager,
                subplebbit: subplebbit,
                comment: comment,
                overrideAuthorAddressIfInvalid: false,
                validatePages: true
            })
        ).to.deep.equal({ valid: true });
    });

    it(`Fixture CommentUpdate can be signed by subplebbit and validated correctly`, async () => {
        const update = remeda.clone(validCommentUpdateFixture);
        const comment = { cid: update.cid, ...validCommentFixture };
        update.signature = await signCommentUpdate(update, signers[0]); // Same signer as the subplebbit that signed the CommentUpdate
        const verification = await verifyCommentUpdate({
            update: update,
            resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
            clientsManager: subplebbit._clientsManager,
            subplebbit: subplebbit,
            comment: comment,
            overrideAuthorAddressIfInvalid: false,
            validatePages: true,
            validateUpdateSignature: true
        });
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`CommentUpdate from previous plebbit-js versions can be verified`, async () => {
        const update = remeda.clone(validCommentUpdateFixture);
        const comment = { cid: update.cid, ...validCommentFixture };
        const verification = await verifyCommentUpdate({
            update: update,
            resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
            clientsManager: subplebbit._clientsManager,
            subplebbit: subplebbit,
            comment: comment,
            overrideAuthorAddressIfInvalid: false,
            validatePages: true,
            validateUpdateSignature: true
        });
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`verifyCommentUpdate invalidate commentUpdate if it was signed by other than subplebbit key`, async () => {
        const update = remeda.clone(validCommentUpdateFixture);
        const comment = { cid: update.cid, ...validCommentFixture };
        update.signature = await signCommentUpdate(update, signers[6]); // A different signer than subplebbit
        const verification = await verifyCommentUpdate({
            update: update,
            resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
            clientsManager: subplebbit._clientsManager,
            subplebbit: subplebbit,
            comment: comment,
            overrideAuthorAddressIfInvalid: false,
            validatePages: true,
            validateUpdateSignature: true
        });
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT });
    });

    it(`A commentUpdate with an edit signed by other than original author will be rejected`, async () => {
        const update = remeda.clone(validCommentUpdateWithAuthorEditFixture);
        const comment = { cid: update.cid, ...validCommentWithAuthorEditFixture };
        expect(
            await verifyCommentUpdate({
                update: update,
                resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
                clientsManager: subplebbit._clientsManager,
                subplebbit: subplebbit,
                comment: comment,
                overrideAuthorAddressIfInvalid: false,
                validatePages: false,
                validateUpdateSignature: true
            })
        ).to.deep.equal({ valid: true });
        update.edit.author.address = signers[7].address;
        update.edit.signature = await signCommentEdit({ ...update.edit, signer: signers[7] }, plebbit);
        const verification = await verifyCommentUpdate({
            update: update,
            resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
            clientsManager: subplebbit._clientsManager,
            subplebbit: subplebbit,
            comment: comment,
            overrideAuthorAddressIfInvalid: false,
            validatePages: true,
            validateUpdateSignature: true
        });
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`commentUpdate.edit is invalidated if any prop is changed and not signed by original author`, async () => {
        const update = remeda.clone(validCommentUpdateWithAuthorEditFixture);
        const comment = { cid: update.cid, ...validCommentWithAuthorEditFixture };
        expect(
            await verifyCommentUpdate({
                update: update,
                resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
                clientsManager: subplebbit._clientsManager,
                subplebbit: subplebbit,
                comment: comment,
                overrideAuthorAddressIfInvalid: false,
                validatePages: true,
                validateUpdateSignature: true
            })
        ).to.deep.equal({ valid: true });
        update.edit.content += "12345"; // Invalidate signature
        update.signature = await signCommentUpdate(update, signers[6]); // A different signer than subplebbit and author

        const verification = await verifyCommentUpdate({
            update: update,
            resolveAuthorAddresses: plebbit.resolveAuthorAddresses,
            clientsManager: subplebbit._clientsManager,
            subplebbit: subplebbit,
            comment: comment,
            overrideAuthorAddressIfInvalid: false,
            validatePages: true,
            validateUpdateSignature: true
        });
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_COMMENT_UPDATE_EDIT_SIGNATURE_IS_INVALID });
    });
});
