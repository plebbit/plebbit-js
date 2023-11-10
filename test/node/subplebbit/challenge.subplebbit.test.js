const Plebbit = require("../../../dist/node");
const {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    mockRemotePlebbitIpfsOnly,
    generatePostToAnswerMathQuestion
} = require("../../../dist/node/test/test-util");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe(`subplebbit.settings.challenges`, async () => {
    let plebbit, remotePlebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockRemotePlebbitIpfsOnly();
    });

    it(`default challenge is captcha-canvas-v3`, async () => {
        // Should be set to default on subplebbit.start()
        const subplebbit = await plebbit.createSubplebbit({});
        // subplebbit?.settings?.challenges should be set to captcha-canvas-v3
        // also subplebbit.challenges should reflect subplebbit.settings.challenges
        expect(subplebbit?.settings.challenges).to.deep.equal([{ name: "captcha-canvas-v3" }]);

        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);
        for (const _subplebbit of [subplebbit, remoteSub]) {
            expect(_subplebbit.challenges[0].type).to.equal("image/png");
            expect(_subplebbit.challenges[0].challenge).to.be.undefined;
            expect(_subplebbit.challenges[0].description).to.equal("make custom image captcha");
            expect(_subplebbit.challenges[0].exclude).to.be.undefined;
        }

        await subplebbit.delete();
    });

    it(`settings.challenges as null or undefined is parsed as []`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        expect(subplebbit?.settings?.challenges).to.not.be.undefined; // Should default to captcha-canvas-v3

        for (const noChallengeValue of [null, undefined, []]) {
            await subplebbit.edit({ settings: { challenges: noChallengeValue } });
            expect(subplebbit?.settings.challenges).to.deep.equal([]);
            expect(subplebbit.challenges).to.deep.equal([]);
        }

        await subplebbit.delete();
    });

    it(`Can set a basic question challenge system`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        const challenges = [{ name: "question", options: { question: "1+1=?", answer: "2" } }];
        await subplebbit.edit({ settings: { challenges } });
        expect(subplebbit?.settings?.challenges).to.deep.equal(challenges);

        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));

        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);

        expect(subplebbit.updatedAt).to.equal(remoteSub.updatedAt);
        for (const _subplebbit of [subplebbit, remoteSub]) {
            expect(_subplebbit.challenges[0].challenge).to.equal("1+1=?");
            expect(_subplebbit.challenges[0].description).to.equal("Ask a question, like 'What is the password?'");
            expect(_subplebbit.challenges[0].exclude).to.be.undefined;
            expect(_subplebbit.challenges[0].type).to.equal("text/plain");
        }

        const mockPost = await generateMockPost(subplebbit.address, plebbit, false, { challengeAnswers: ["2"] });

        mockPost.once("challenge", (msg) => expect.fail("it should not send a challenge since it's there in subplebbit.challenge"));

        await publishWithExpectedResult(mockPost, true);

        await subplebbit.delete();
    });

    it(`subplebbit.settings.challenges isn't overridden with subplebbit.start() if it was edited before starting the sub`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        await subplebbit.edit({ settings: { challenges: undefined } });
        expect(subplebbit.settings.challenges).to.deep.equal([]);
        expect(subplebbit.challenges).to.deep.equal([]);
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(subplebbit.settings.challenges).to.deep.equal([]);
        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);
        for (const _subplebbit of [subplebbit, remoteSub]) expect(_subplebbit.challenges).to.deep.equal([]);

        await subplebbit.delete();
    });
});

describe("Validate props of subplebbit Pubsub messages", async () => {
    let plebbit, subplebbit, commentSigner;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await plebbit.createSubplebbit();
        const challenges = [{ name: "question", options: { question: "1+1=?", answer: "2" } }];
        await subplebbit.edit({ settings: { challenges } });

        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        commentSigner = await plebbit.createSigner(); // We're using the same signer for publishing so that publication.author.subplebbit is defined
    });

    after(async () => {
        await subplebbit.delete();
    });

    it(`Validate props of challengerequest`, async () => {
        const comment = await generateMockPost(subplebbit.address, plebbit, false, { signer: commentSigner });
        await comment.publish();
        const request = await new Promise((resolve) => subplebbit.once("challengerequest", resolve));
        expect(JSON.stringify(request.publication)).to.equal(JSON.stringify(comment.toJSONPubsubMessagePublication()));
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
        const comment = await generateMockPost(subplebbit.address, plebbit, false, { signer: commentSigner });

        await comment.publish();
        const challenge = await new Promise((resolve) => subplebbit.once("challenge", resolve));
        expect(challenge.challengeRequestId.constructor.name).to.equal("Uint8Array");
        expect(challenge.challengeRequestId.length).to.equal(38);
        expect(challenge.type).to.equal("CHALLENGE");
        expect(challenge.challenges).to.be.a("array");
        expect(challenge.challenges[0].challenge).to.be.a("string");
        expect(challenge.challenges[0].index).to.be.a("number");
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
        const comment = await generatePostToAnswerMathQuestion({ subplebbitAddress: subplebbit.address, signer: commentSigner }, plebbit);

        await comment.publish();
        const challengeAnswer = await new Promise((resolve) => subplebbit.once("challengeanswer", resolve));
        await new Promise((resolve) => comment.once("challengeverification", resolve));
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
        const comment = await generatePostToAnswerMathQuestion({ subplebbitAddress: subplebbit.address, signer: commentSigner }, plebbit);

        comment.removeAllListeners();

        comment.once("challenge", async (challengeMsg) => {
            await comment.publishChallengeAnswers(["12345"]); // wrong answer here
        });
        await comment.publish();
        const challengeVerifcation = await new Promise((resolve) => subplebbit.once("challengeverification", resolve));
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
        const comment = await generatePostToAnswerMathQuestion({ subplebbitAddress: subplebbit.address, signer: commentSigner }, plebbit);

        await comment.publish();
        const challengeVerifcation = await new Promise((resolve) => subplebbit.once("challengeverification", resolve));
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
