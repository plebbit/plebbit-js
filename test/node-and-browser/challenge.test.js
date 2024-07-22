import { expect } from "chai";
import signers from "../fixtures/signers.js";
import {
    generateMockPost,
    publishWithExpectedResult,
    publishRandomPost,
    generatePostToAnswerMathQuestion,
    mockRemotePlebbit,
    mockPlebbit
} from "../../dist/node/test/test-util.js";

import { stringify as deterministicStringify } from "safe-stable-stringify";

const mathCliSubplebbitAddress = signers[1].address;

describe.skip(`Stress test challenge exchange`, async () => {
    const num = 50;
    let plebbit, subplebbit;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);
    });

    it(`Initiate ${num} challenge exchange in parallel`, async () => {
        const promises = new Array(num).fill(null).map(() => publishRandomPost(subplebbit.address, plebbit, {}, false));
        await Promise.all(promises);
    });
});

describe("math-cli", async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit({ pubsubHttpClientsOptions: [`http://localhost:15002/api/v0`] }, true); // Singular pubsub provider to avoid multiple challenge request/answers collision
    });
    it("can post after answering correctly", async function () {
        const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);
        await publishWithExpectedResult(mockPost, true);
    });
    it("Throws an error when user fails to solve mathcli captcha", async function () {
        const mockPost = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[0] });
        mockPost.removeAllListeners();
        mockPost.once("challenge", (challengeMessage) => {
            mockPost.publishChallengeAnswers(["3"]); // wrong answer
        });
        await publishWithExpectedResult(mockPost, false);
    });
});

describe("Validate props of publication Pubsub messages", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });

    it(`Validate props of challengerequest`, async () => {
        const comment = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);

        comment.publish();
        const request = await new Promise((resolve) => comment.once("challengerequest", resolve));
        expect(deterministicStringify(request.publication)).to.equal(deterministicStringify(comment.toJSONPubsubMessagePublication()));
        expect(request.challengeRequestId.constructor.name).to.equal("Uint8Array");
        expect(request.challengeRequestId.length).to.equal(38);
        expect(request.type).to.equal("CHALLENGEREQUEST");
        expect(request.acceptedChallengeTypes).to.be.a("array");
        expect(request.encrypted).to.be.a("object");
        expect(request.encrypted.ciphertext.constructor.name).to.equal("Uint8Array");
        expect(request.encrypted.iv.constructor.name).to.equal("Uint8Array");
        expect(request.encrypted.tag.constructor.name).to.equal("Uint8Array");
        expect(request.encrypted.type).to.equal("ed25519-aes-gcm");
        expect(request.protocolVersion).to.be.a("string");
        expect(request.signature).to.be.a("object");
        expect(request.signature.signature.constructor.name).to.equal("Uint8Array");
        expect(request.signature.signature.length).to.equal(64);
        expect(request.signature.publicKey.constructor.name).to.equal("Uint8Array");
        expect(request.signature.publicKey.length).to.equal(32);
        expect(request.signature.signedPropertyNames).to.deep.equal([
            "type",
            "challengeRequestId",
            "encrypted",
            "acceptedChallengeTypes",
            "timestamp"
        ]);
        expect(request.signature.type).to.equal("ed25519");
        expect(request.timestamp).to.be.a("number");
        expect(request.userAgent).to.be.a("string");
    });

    it(`Validate props of challenge`, async () => {
        const comment = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);

        comment.publish();
        const challenge = await new Promise((resolve) => comment.once("challenge", resolve));
        expect(challenge.challengeRequestId.constructor.name).to.equal("Uint8Array");
        expect(challenge.challengeRequestId.length).to.equal(38);
        expect(challenge.type).to.equal("CHALLENGE");
        expect(challenge.challenges).to.be.a("array");
        expect(challenge.challenges[0].challenge).to.be.a("string");
        expect(challenge.challenges[0].index).to.be.undefined; // you can get index from array
        expect(challenge.challenges[0].type).to.equal("text/plain");

        expect(challenge.encrypted).to.be.a("object");
        expect(challenge.encrypted.ciphertext.constructor.name).to.equal("Uint8Array");
        expect(challenge.encrypted.iv.constructor.name).to.equal("Uint8Array");
        expect(challenge.encrypted.tag.constructor.name).to.equal("Uint8Array");
        expect(challenge.encrypted.type).to.equal("ed25519-aes-gcm");
        expect(challenge.protocolVersion).to.be.a("string");
        expect(challenge.signature).to.be.a("object");
        expect(challenge.signature.signature.constructor.name).to.equal("Uint8Array");
        expect(challenge.signature.signature.length).to.equal(64);
        expect(challenge.signature.publicKey.constructor.name).to.equal("Uint8Array");
        expect(challenge.signature.publicKey.length).to.equal(32);
        expect(challenge.signature.signedPropertyNames).to.deep.equal(["type", "challengeRequestId", "encrypted", "timestamp"]);
        expect(challenge.signature.type).to.equal("ed25519");
        expect(challenge.timestamp).to.be.a("number");
        expect(challenge.userAgent).to.be.a("string");
    });

    it(`Validate props of challengeanswer`, async () => {
        const comment = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);

        comment.publish();
        const challengeAnswer = await new Promise((resolve) => comment.once("challengeanswer", resolve));
        expect(challengeAnswer.challengeRequestId.constructor.name).to.equal("Uint8Array");
        expect(challengeAnswer.challengeRequestId.length).to.equal(38);
        expect(challengeAnswer.type).to.equal("CHALLENGEANSWER");
        expect(challengeAnswer.challengeAnswers).to.deep.equal(["2"]);
        expect(challengeAnswer.encrypted).to.be.a("object");
        expect(challengeAnswer.encrypted.ciphertext.constructor.name).to.equal("Uint8Array");
        expect(challengeAnswer.encrypted.iv.constructor.name).to.equal("Uint8Array");
        expect(challengeAnswer.encrypted.tag.constructor.name).to.equal("Uint8Array");
        expect(challengeAnswer.encrypted.type).to.equal("ed25519-aes-gcm");
        expect(challengeAnswer.protocolVersion).to.be.a("string");
        expect(challengeAnswer.signature).to.be.a("object");
        expect(challengeAnswer.signature.signature.constructor.name).to.equal("Uint8Array");
        expect(challengeAnswer.signature.signature.length).to.equal(64);
        expect(challengeAnswer.signature.publicKey.constructor.name).to.equal("Uint8Array");
        expect(challengeAnswer.signature.publicKey.length).to.equal(32);
        expect(challengeAnswer.signature.signedPropertyNames).to.deep.equal(["type", "challengeRequestId", "encrypted", "timestamp"]);
        expect(challengeAnswer.signature.type).to.equal("ed25519");
        expect(challengeAnswer.timestamp).to.be.a("number");
        expect(challengeAnswer.userAgent).to.be.a("string");
    });

    it(`Validate props of challengeverification (challengeSuccess=false)`, async () => {
        const comment = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);

        comment.removeAllListeners();

        comment.once("challenge", async (challengeMsg) => {
            await comment.publishChallengeAnswers(["12345"]); // wrong answer here
        });
        comment.publish();
        const challengeVerifcation = await new Promise((resolve) => comment.once("challengeverification", resolve));
        expect(challengeVerifcation.challengeRequestId.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.challengeRequestId.length).to.equal(38);
        expect(challengeVerifcation.type).to.equal("CHALLENGEVERIFICATION");
        expect(challengeVerifcation.challengeErrors).to.deep.equal(["Wrong answer."]);
        expect(challengeVerifcation.challengeSuccess).to.be.false;
        expect(challengeVerifcation.encrypted).to.be.undefined;
        expect(challengeVerifcation.publication).to.be.undefined;
        expect(challengeVerifcation.reason).to.be.undefined;
        expect(challengeVerifcation.protocolVersion).to.be.a("string");
        expect(challengeVerifcation.signature).to.be.a("object");
        expect(challengeVerifcation.signature.signature.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.signature.signature.length).to.equal(64);
        expect(challengeVerifcation.signature.publicKey.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.signature.publicKey.length).to.equal(32);
        expect(challengeVerifcation.signature.signedPropertyNames).to.deep.equal([
            "reason",
            "type",
            "challengeRequestId",
            "encrypted",
            "challengeSuccess",
            "challengeErrors",
            "timestamp"
        ]);
        expect(challengeVerifcation.signature.type).to.equal("ed25519");
        expect(challengeVerifcation.timestamp).to.be.a("number");
        expect(challengeVerifcation.userAgent).to.be.a("string");
    });

    it(`Validate props of challengeverification (challengeSuccess=true)`, async () => {
        const comment = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);

        comment.publish();
        const challengeVerifcation = await new Promise((resolve) => comment.once("challengeverification", resolve));
        expect(challengeVerifcation.challengeRequestId.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.challengeRequestId.length).to.equal(38);
        expect(challengeVerifcation.type).to.equal("CHALLENGEVERIFICATION");
        expect(challengeVerifcation.challengeErrors).to.be.undefined;
        expect(challengeVerifcation.challengeSuccess).to.be.true;
        expect(challengeVerifcation.encrypted).to.be.a("object");
        expect(challengeVerifcation.encrypted.ciphertext.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.encrypted.iv.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.encrypted.tag.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.encrypted.type).to.equal("ed25519-aes-gcm");
        expect(challengeVerifcation.publication).to.be.a("object");
        expect(challengeVerifcation.publication.author.subplebbit).to.be.a("object");
        expect(challengeVerifcation.reason).to.be.undefined;
        expect(challengeVerifcation.protocolVersion).to.be.a("string");
        expect(challengeVerifcation.signature).to.be.a("object");
        expect(challengeVerifcation.signature.signature.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.signature.signature.length).to.equal(64);
        expect(challengeVerifcation.signature.publicKey.constructor.name).to.equal("Uint8Array");
        expect(challengeVerifcation.signature.publicKey.length).to.equal(32);
        expect(challengeVerifcation.signature.signedPropertyNames).to.deep.equal([
            "reason",
            "type",
            "challengeRequestId",
            "encrypted",
            "challengeSuccess",
            "challengeErrors",
            "timestamp"
        ]);
        expect(challengeVerifcation.signature.type).to.equal("ed25519");
        expect(challengeVerifcation.timestamp).to.be.a("number");
        expect(challengeVerifcation.userAgent).to.be.a("string");
    });
});
