const Plebbit = require("../../../dist/node");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const {
    signComment,
    verifyComment,
    verifyCommentUpdate,
    signCommentUpdate,
    signCommentEdit
} = require("../../../dist/node/signer/signatures");
const { messages } = require("../../../dist/node/errors");
const signers = require("../../fixtures/signers");
const { timestamp } = require("../../../dist/node/util");
const { mockPlebbit } = require("../../../dist/node/test/test-util");
const lodash = require("lodash");

const fixtureComment = require("../../fixtures/publications").comment;

const fixtureSignature = {
    signature: "0ibxT1DhPIWzCUnnxq3GCnq7fsj41D/xvArlRmBPt4Gl0+sSGjwIF7Hl8Z7gLbWAg458Kr8oZ8ZDxWQTxtawCA",
    publicKey: "CFhuD55tmzZjWZ113tZbDw/AsuNDkgSdvCCbPeqiF10",
    type: "ed25519",
    signedPropertyNames: ["subplebbitAddress", "author", "timestamp", "content", "title", "link", "parentCid"]
};

describe("sign comment", async () => {
    let plebbit, signedCommentClone;
    before(async () => {
        plebbit = await mockPlebbit();
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
        const signature = await signComment(comment, signer, plebbit);
        expect(signature.publicKey).to.equal(signer.publicKey);
        const signedComment = { signature: signature, ...comment };
        const verificaiton = await verifyComment(signedComment, plebbit);
        expect(verificaiton).to.deep.equal({ valid: true });
        signedCommentClone = lodash.cloneDeep(signedComment);
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
        const signature = await signComment(comment, signer, plebbit);
        const signedComment = { signature: signature, ...comment };
        expect(signedComment.signature.publicKey).to.be.equal(signers[1].publicKey, "Generated public key should be same as provided");
        const verificaiton = await verifyComment(signedComment, plebbit);
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it("signComment author signature is correct", async () => {
        const authorSignature = await signComment(fixtureComment, signers[1], plebbit);
        expect(authorSignature).to.exist;
        expect(authorSignature.signature).to.equal(fixtureSignature.signature);
        expect(authorSignature.publicKey).to.equal(fixtureSignature.publicKey);
        expect(authorSignature.type).to.equal(fixtureSignature.type);
        expect(authorSignature.signedPropertyNames).to.deep.equal(fixtureSignature.signedPropertyNames);
    });

    it(`signComment throws with invalid author`, async () => {
        const randomSigner = signers[3];
        // Trying to sign a publication with author.address !== randomSigner.address
        // should throw an error
        await assert.isRejected(signComment(fixtureComment, randomSigner, plebbit), messages.ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER);
    });

    it(`signComment throws with author.address not being an IPNS or domain`, async () => {
        const cloneComment = lodash.cloneDeep(signedCommentClone);
        delete cloneComment["signature"];
        cloneComment.author.address = "gibbreish";
        await assert.isRejected(signComment(cloneComment, signers[7], plebbit), messages.ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER);
    });
    it(`signComment throws with author.address=undefined`, async () => {
        const cloneComment = lodash.cloneDeep(signedCommentClone);
        delete cloneComment["signature"];
        cloneComment.author.address = undefined;
        await assert.isRejected(signComment(cloneComment, signers[7], plebbit), messages.ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER);
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
        const signature = await signComment(comment, signers[4], plebbit);
        const res = await verifyComment({ ...comment, signature }, plebbit);
        expect(res).to.deep.equal({ valid: true });
    });
});

describe("verify Comment", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`Reject a comment with author.subplebbit provided by actual author(check if ipfs file)`);
    it(`Valid signature fixture is validated correctly`, async () => {
        const fixtureWithSignature = { ...fixtureComment, signature: fixtureSignature };
        const verification = await verifyComment(fixtureWithSignature, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });

    it("verifyComment failure with wrong signature", async () => {
        const invalidSignature = lodash.cloneDeep(fixtureSignature);
        invalidSignature.signedPropertyNames = invalidSignature.signedPropertyNames.slice(1); // Invalidate signature

        const wronglySignedPublication = { ...fixtureComment, signature: invalidSignature };
        const verification = await verifyComment(wronglySignedPublication, plebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`Valid Comment fixture from previous plebbit-js version is validated correctly`, async () => {
        const comment = lodash.cloneDeep(require("../../fixtures/signatures/comment/commentUpdate/valid_comment.json"));

        const verification = await verifyComment(comment, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`A comment with avatar fixture is validated correctly`, async () => {
        const comment = lodash.cloneDeep(require("../../fixtures/signatures/comment/valid_comment_avatar_fixture.json"));
        const verification = await verifyComment(comment, plebbit, true);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`verifyComment invalidates a comment with author.address not a domain or IPNS`, async () => {
        const comment = lodash.cloneDeep({ ...fixtureComment, signature: fixtureSignature });
        comment.author.address = "gibbresish"; // Not a domain or IPNS
        const verification = await verifyComment(comment, plebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58 });
    });
    it("verifyComment invalidates a comment with author.address = undefined", async () => {
        const comment = lodash.cloneDeep({ ...fixtureComment, signature: fixtureSignature });
        comment.author.address = undefined; // Not a domain or IPNS
        const verification = await verifyComment(comment, plebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_ADDRESS_UNDEFINED });
    });

    // TODO when flairs are implemented
    it(`Can sign and verify a comment with flair`);
    it(`Can verify a comment whose author.flair have been changed`);
    it(`can verify a comment whose flair have been changed by mod`);
});

describe(`Comment with author.address as domain`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`verifyComment corrects author.address(domain) if it resolves to a different author (overrideAuthorAddressIfInvalid=true)`, async () => {
        const tempPlebbit = await mockPlebbit();
        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "testDomain.eth" ? fixtureComment.author.address : authorAddress;
        const commentWithInvalidDomain = lodash.cloneDeep(fixtureComment);
        commentWithInvalidDomain.author.address = "testDomain.eth";
        const signedPublication = {
            ...commentWithInvalidDomain,
            signature: await signComment(commentWithInvalidDomain, signers[1], tempPlebbit)
        };
        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "testDomain.eth" ? signers[6].address : authorAddress; // testDomain.eth no longer points to the same author

        const verificaiton = await verifyComment(signedPublication, tempPlebbit, true);
        expect(verificaiton).to.deep.equal({ valid: true });
        expect(signedPublication.author.address).to.equal(fixtureComment.author.address); // It has been corrected to the original signer even though resolver is resolving to signers[6]
    });
    it(`Comment with CommentUpdate json, with invalid author domain address will be corrected to derived address (overrideAuthorAddressIfInvalid=false)`, async () => {
        const comment = lodash.cloneDeep(require("../../fixtures/signatures/comment/valid_comment_author_address_as_domain.json"));
        const tempPlebbit = await mockPlebbit();
        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "plebbit.eth" ? signers[7].address : authorAddress; // This would invalidate the fixture author address. Should be corrected

        const verification = await verifyComment(comment, tempPlebbit, true);
        expect(verification).to.deep.equal({ valid: true });

        expect(comment.author.address).to.equal(signers[6].address);
    });

    it(`Comment signature will be invalidated if comment.author.address (domain) points to different address (overrideAuthorAddressIfInvalid=true)`, async () => {
        const comment = lodash.cloneDeep(require("../../fixtures/signatures/comment/valid_comment_author_address_as_domain.json"));
        const tempPlebbit = await mockPlebbit();
        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "plebbit.eth" ? signers[7].address : authorAddress; // This would invalidate the fixture author address. Should be corrected

        const verification = await verifyComment(comment, tempPlebbit, false);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE });
    });
});

describe(`commentupdate`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);
    });
    it(`Fixture CommentUpdate can be signed by subplebbit and validated correctly`, async () => {
        const update = lodash.cloneDeep(require("../../fixtures/signatures/comment/commentUpdate/valid_comment_update.json"));
        const comment = { cid: update.cid, ...require("../../fixtures/signatures/comment/commentUpdate/valid_comment.json") };
        update.signature = await signCommentUpdate(update, signers[0]); // Same signer as the subplebbit that signed the CommentUpdate
        const verification = await verifyCommentUpdate(update, subplebbit, comment, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`Can validate live CommentUpdate`, async () => {
        const comment = await plebbit.getComment(subplebbit.lastPostCid);
        await Promise.all([comment.update(), new Promise((resolve) => comment.once("update", resolve))]);
        await comment.stop();
        // If a comment emits "update" that means the commentUpdate have been verified correctly
    });

    it(`CommentUpdate from previous plebbit-js versions can be verified`, async () => {
        const update = lodash.cloneDeep(require("../../fixtures/signatures/comment/commentUpdate/valid_comment_update.json"));
        const comment = { cid: update.cid, ...require("../../fixtures/signatures/comment/commentUpdate/valid_comment.json") };
        const verification = await verifyCommentUpdate(update, subplebbit, comment, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`verifyCommentUpdate invalidate commentUpdate if it was signed by other than subplebbit key`, async () => {
        const update = lodash.cloneDeep(require("../../fixtures/signatures/comment/commentUpdate/valid_comment_update.json"));
        const comment = { cid: update.cid, ...require("../../fixtures/signatures/comment/commentUpdate/valid_comment.json") };
        update.signature = await signCommentUpdate(update, signers[6]); // A different signer than subplebbit
        const verification = await verifyCommentUpdate(update, subplebbit, comment, plebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT });
    });

    it(`A commentUpdate with an edit signed by other than original author will be rejected`, async () => {
        const update = lodash.cloneDeep(require("../../fixtures/signatures/comment/commentUpdate_authorEdit/valid_commentUpdate.json"));
        const comment = { cid: update.cid, ...require("../../fixtures/signatures/comment/commentUpdate_authorEdit/valid_comment.json") };
        expect(await verifyCommentUpdate(update, subplebbit, comment, plebbit)).to.deep.equal({ valid: true });
        update.edit.author.address = signers[7].address;
        update.edit.signature = await signCommentEdit(update.edit, signers[7], plebbit);
        const verification = await verifyCommentUpdate(update, subplebbit, comment, plebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR });
    });
});
