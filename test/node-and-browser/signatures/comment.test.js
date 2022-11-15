const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const Plebbit = require("../../../dist/node");
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

const fixtureComment = require("../../fixtures/publications").comment;

const fixtureSignature = {
    signature:
        "IMff4G8CPJPS3O3zRYkqh160BU3dLCd9Is6F348yNkUBzMEstH2u6+PMfyULQeJQzspz+bEU6iq/b7QwRAvQKClV6kHXK0R5Yzfop7cDHD3v0uqTVwxbtbINOm6dbjO1iThOeP7ULSXzLEP0obVyy51v3xBqKfrdG8NMQd/VuU6rtxmRJQwJdPHEhjDFQ3QxtoOUnrGTUVED0eX22gORjxb1uW5vJ+T/63frIJ9gBgCYRA8luCmTt59hZRusmh0n21zIQmxIdRebmdwR15wI7hmrppqcH1e5Fm+MCVRu7JLySsP4r5DJ2PECw9gobq1am6F4SuUXZBbQaxq36QZk9Q",
    publicKey: signers[1].publicKey,
    type: "rsa",
    signedPropertyNames: ["subplebbitAddress", "author", "timestamp", "content", "title", "link", "parentCid"]
};

describe("sign comment", async () => {
    let plebbit;
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
        const signedComment = { signature: signature.toJSON(), ...comment };
        const verificaiton = await verifyComment(signedComment, plebbit);
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it("Can sign a comment with an imported key", async () => {
        const signer = await plebbit.createSigner({ privateKey: signers[1].privateKey, type: "rsa" });
        const comment = {
            subplebbitAddress: signers[0].address,
            author: { address: signer.address },
            timestamp: timestamp(),
            title: "Test post signature",
            content: "some content..."
        };
        const signature = await signComment(comment, signer, plebbit, "comment");
        const signedComment = { signature: signature.toJSON(), ...comment };
        expect(signedComment.signature.publicKey).to.be.equal(signers[1].publicKey, "Generated public key should be same as provided");
        const verificaiton = await verifyComment(signedComment, plebbit);
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it("signComment author signature is correct", async () => {
        const authorSigner = signers[1];

        const authorSignature = await signComment(fixtureComment, authorSigner, plebbit);

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
    it("can sign a comment with author.displayName = undefined", async () => {
        const signer = signers[4];

        const comment = await plebbit.createComment({
            title: "comment title",
            content: "comment content",
            subplebbitAddress: signer.address,
            signer,
            author: { address: signer.address }
        });
        const res = await verifyComment(comment, plebbit);
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
        const invalidSignature = JSON.parse(JSON.stringify(fixtureSignature));
        invalidSignature.signedPropertyNames = invalidSignature.signedPropertyNames.slice(1); // Invalidate signature

        const wronglySignedPublication = { ...fixtureComment, signature: invalidSignature };
        const verification = await verifyComment(wronglySignedPublication, plebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`Valid Comment fixture from previous plebbit-js version is invalidated correctly`, async () => {
        // CID: QmSC6fG7CPfVVif2fsKS1i4zi2DYpSkSrMksyCyZJZW8X8
        //prettier-ignore
        const comment = {"subplebbitAddress":"QmRcyUK7jUhFyPTEvwWyfGZEAaSoDugNJ8PZSC4PWRjUqd","timestamp":1661902265,"signature":{"signature":"js6v39xc7y8yiFlj7DuBVIXiEgdNQcEdD3EXElOjX4ZkQP/b9TbqPulpfQ+EeGLq8UFnhfd2lJXDYvDx25ku8fyKR4fIFTMY9WDId3bHuDiWgbtgfA6+RRTL4eV9Ld2FVNLdsR2DCSxlcAvCc+M2rzzGDEQCZ85GbkCNBZ9jOypOEO1dW626jc41Q/6ddmI8nSV5iFDfw1jyvNE8JElWs5v7S58YcYO3CN0PlHEZgZ9dnfBkO9FihaFp25QDZgZJrXxCmPwQFRiNMe9Wlz7IeEEzop3TZ+PyExpbEG50rcyltkYUJ3LVxJfEQD/ZZ/Im3gTESLadz3aRWfjgfZ/L3A","publicKey":"-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxJS1ZMx9uqCFdiauIH5e\nJho2CtarYP3zAFzqvbPm1pBLm738I4DotkzvVIbgFHRu7a2wgq0+bUjwg4yX3z7N\nFjetiBaT+hEIMFYKyobsv65ebInsqMYIPNVbn380xLzb5zMyPEL6pBuvGdmQZlRD\ngXDuHiCh66IPLizd8KGWJMSQXOcAhLt+NRcdHSSCLkibcQOHs52dKc0qYvGHd25h\nKPs+dE4d/A86aLRSD5w/yGwiJA8Jn+nLFbOLiEf775L6tOO35OF6PHiXo21BTl0o\nS4Eh9DIlPT7fNhEg+HhQFoQ7VHQLq76OVYpXBCnhIRUaPko5EgjNfrqwG6R1lPZF\nkwIDAQAB\n-----END PUBLIC KEY-----","type":"rsa","signedPropertyNames":["subplebbitAddress","author","timestamp","content","title","link","parentCid"]},"author":{"address":"QmXGrdUi1PbSaApyDHbSoPdx2HkGsBAvTGFDTKoFrpuFxq"},"protocolVersion":"1.0.0","content":"Check the title\n","title":"I'll stick to reddit. Thank you very much.","ipnsName":"k2k4r8nz40czmblfjgzo79tmex2wuo4y8zwi51843fac1rrx823g7lk8","depth":0};

        const verification = await verifyComment(comment, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`A comment with authorEdit fixture is validated correctly`, async () => {
        const comment = JSON.parse(JSON.stringify(require("../../fixtures/valid_comment_with_author_edit.json")));
        const verification = await verifyComment(comment, plebbit);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`A comment with authorEdit signed by other than original author is invalidated`, async () => {
        const comment = JSON.parse(JSON.stringify(require("../../fixtures/valid_comment_with_author_edit.json")));
        comment.authorEdit.author.address = signers[7].address;
        comment.authorEdit.signature = await signCommentEdit(comment.authorEdit, signers[7], plebbit);

        const verification = await verifyComment(comment, plebbit);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR });
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
        const tempPlebbit = await Plebbit(plebbit);
        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "testDomain.eth" ? fixtureComment.author.address : authorAddress;
        const commentWithInvalidDomain = JSON.parse(JSON.stringify(fixtureComment));
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
        const comment = JSON.parse(JSON.stringify(require("../../fixtures/valid_comment_author_address_as_domain.json")));
        const tempPlebbit = await Plebbit(plebbit);
        tempPlebbit.resolver.resolveAuthorAddressIfNeeded = (authorAddress) =>
            authorAddress === "plebbit.eth" ? signers[7].address : authorAddress; // This would invalidate the fixture author address. Should be corrected

        const verification = await verifyComment(comment, tempPlebbit, true);
        expect(verification).to.deep.equal({ valid: true });

        expect(comment.author.address).to.equal(signers[6].address);
    });

    it(`Comment signature will be invalidated if comment.author.address (domain) points to different address (overrideAuthorAddressIfInvalid=true)`, async () => {
        const comment = JSON.parse(JSON.stringify(require("../../fixtures/valid_comment_author_address_as_domain.json")));
        const tempPlebbit = await Plebbit(plebbit);
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
        const update = JSON.parse(JSON.stringify(require("../../fixtures/valid_comment_update.json")));
        update.signature = await signCommentUpdate(update, signers[0]); // Same signer as the subplebbit that signed the CommentUpdate
        const verification = await verifyCommentUpdate(update, subplebbit.encryption.publicKey, signers[0].publicKey);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`Can validate live CommentUpdate`, async () => {
        const comment = await plebbit.getComment(subplebbit.lastPostCid);
        await Promise.all([comment.update(), new Promise((resolve) => comment.once("update", resolve))]);
        await comment.stop();
        // If a comment emits "update" that means the commentUpdate have been verified correctly
    });

    it(`CommentUpdate from previous plebbit-js versions can be verified`, async () => {
        const update = JSON.parse(JSON.stringify(require("../../fixtures/valid_comment_update.json")));
        const verification = await verifyCommentUpdate(update, subplebbit.encryption.publicKey, signers[0].publicKey);
        expect(verification).to.deep.equal({ valid: true });
    });

    it(`verifyCommentUpdate invalidate commentUpdate if it was signed by other than subplebbit key`, async () => {
        const update = JSON.parse(JSON.stringify(require("../../fixtures/valid_comment_update.json")));
        update.signature = await signCommentUpdate(update, signers[6]); // A different signer than subplebbit
        const verification = await verifyCommentUpdate(update, subplebbit.encryption.publicKey, signers[0].publicKey);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT });
    });

    it(`A commentUpdate with a authorEdit signed by other than original author will be rejected`, async () => {
        const update = JSON.parse(JSON.stringify(require("../../fixtures/valid_comment_update_with_author_edit.json")));
        expect(
            await verifyCommentUpdate(
                update,
                subplebbit.encryption.publicKey,
                "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv2gh6mwr/rE1b2I/PlRG\nSzJzS++TH8dYCBFg1b54xfjxy/acF7mvkts2ZCOFS9i89HAuUmeUKxzwU5wJMTjh\nx8+NBbLYckhyfrnV4NLqWQhP28tLyEcvK3w96rViWGN7XWJgdA+zRxmvursmoCfo\nGN4NZF8ihb8na7ApI/5NZFpRKfQe6Pd1GtoMsUlLM4H0nC4X+lr2SWsEA/6uVZy9\niFW+zsCrZhsPfeda6/lA4kMOEdYM8RtSdiZNw6EImYc7P6mrd9n52glLhkDYDJoC\niKzoLTDhezI0CM0NvhUtamyuBmkNbYcdXTQ78yCk8k6Ysc/rRPraaJP2dZASu44V\nuQIDAQAB\n-----END PUBLIC KEY-----"
            )
        ).to.deep.equal({ valid: true });
        update.authorEdit.author.address = signers[7].address;
        update.authorEdit.signature = await signCommentEdit(update.authorEdit, signers[7], plebbit);
        const verification = await verifyCommentUpdate(update, subplebbit.encryption.publicKey, signers[0].publicKey);
        expect(verification).to.deep.equal({ valid: false, reason: messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR });
    });
});
