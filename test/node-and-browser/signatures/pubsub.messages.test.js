const Plebbit = require("../../../dist/node");
const {
    verifyChallengeRequest,
    verifyChallengeAnswer,
    signChallengeAnswer,
    verifyChallengeMessage,
    verifyChallengeVerification
} = require("../../../dist/node/signer/signatures");
const { generateMockPost, mockPlebbit } = require("../../../dist/node/test/test-util");
const { toString } = require("uint8arrays/to-string");
const { fromString } = require("uint8arrays/from-string");
const signers = require("../../fixtures/signers");
const { expect } = require("chai");
const { messages } = require("../../../dist/node/errors");
const { ChallengeAnswerMessage } = require("../../../dist/node/challenge");
const lodash = require("lodash");
const version = require("../../../dist/node/version");

const mathCliSubplebbitAddress = signers[1].address;

describe("challengerequest", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`valid challengerequest fixture from previous version can be validated`, async () => {
        const request = lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_request.json"));
        const verificaiton = await verifyChallengeRequest(request);
        expect(verificaiton).to.deep.equal({ valid: true });
    });
    it(`Valid live ChallengeRequest gets validated correctly`, async () => {
        const comment = await generateMockPost(signers[0].address, plebbit, false, { signer: signers[5] });
        await comment.publish();
        // comment._challengeRequest (ChallengeRequest) should be defined now
        expect(comment._challengeRequest).to.be.a("object");
        const verificaiton = await verifyChallengeRequest(comment._challengeRequest);
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it(`Subplebbit responds to a challenge request with invalid signature if signature of challenge request is invalid`, async () => {
        const comment = await generateMockPost(signers[0].address, plebbit, false, { signer: signers[6] });

        await Promise.all([new Promise((resolve) => comment.once("challengeverification", resolve)), comment.publish()]);

        // comment._challengeRequest (ChallengeRequest) should be defined now
        expect(comment._challengeRequest).to.be.a("object");
        const invalidSignature = lodash.clone(comment._challengeRequest);
        invalidSignature.acceptedChallengeTypes.push("test"); // Signature should be invalid after
        const verificaiton = await verifyChallengeRequest(invalidSignature);
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });

        await plebbit._clientsManager.pubsubPublish(comment.subplebbit.pubsubTopic, JSON.stringify(invalidSignature));

        await new Promise(async (resolve) => {
            const subMethod = (pubsubMsg) => {
                const msgParsed = JSON.parse(toString(pubsubMsg["data"]));
                if (msgParsed.type === "CHALLENGEVERIFICATION" && msgParsed.challengeRequestId === invalidSignature.challengeRequestId) {
                    expect(msgParsed.challengeSuccess).to.be.false;
                    expect(msgParsed.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
                    expect(msgParsed.publication).to.be.undefined;
                    expect(msgParsed.encryptedPublication).to.be.undefined;
                    plebbit._clientsManager.pubsubUnsubscribe(comment.subplebbit.pubsubTopic, subMethod);
                    resolve();
                }
            };
            await plebbit._clientsManager.pubsubSubscribe(comment.subplebbit.pubsubTopic, subMethod);
        });
    });
});

describe(`challengemessage`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`valid challengemessage fixture from previous version can be validated`, async () => {
        const challenge = lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_message.json"));
        const verificaiton = await verifyChallengeMessage(challenge);
        expect(verificaiton).to.deep.equal({ valid: true });
    });
    it(`Valid live challengemessage gets validated correctly`, async () => {
        const comment = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[6] });
        comment.removeAllListeners();

        await comment.publish();

        await new Promise(async (resolve) => {
            comment.once("challenge", async (challengeMessage) => {
                const verification = await verifyChallengeMessage(challengeMessage);
                expect(verification).to.deep.equal({ valid: true });
                resolve();
            });
        });
    });
    it(`Invalid ChallengeMessage gets invalidated correctly`, async () => {
        const challenge = lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_message.json"));
        challenge.challengeRequestId += "1234"; // Should invalidate signature
        const verificaiton = await verifyChallengeMessage(challenge);
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });
});

describe("challengeanswer", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`valid challengeanswer fixture from previous version can be validated`, async () => {
        const answer = lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_answer.json"));
        const verificaiton = await verifyChallengeAnswer(answer);
        expect(verificaiton).to.deep.equal({ valid: true });
    });
    it(`Valid live ChallengeAnswer gets validated correctly`, async () => {
        const comment = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[5] });
        comment.removeAllListeners();
        await comment.publish();

        comment.once("challenge", () => comment.publishChallengeAnswers(["2"]));
        await new Promise((resolve) => {
            comment.once("challengeanswer", async (challengeAnswer) => {
                const verificaiton = await verifyChallengeAnswer(challengeAnswer);
                expect(verificaiton).to.deep.equal({ valid: true });
                resolve();
            });
        });
    });
    it(`Subplebbit rejects challenge answer with invalid signature`, async () => {
        const comment = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[6] });

        comment.removeAllListeners();
        await comment.publish();

        await new Promise(async (resolve) => {
            comment.once("challenge", async () => {
                await comment._plebbit._clientsManager.pubsubUnsubscribe(comment.subplebbit.pubsubTopic, comment.handleChallengeExchange);
                const toSignAnswer = {
                    type: "CHALLENGEANSWER",
                    challengeRequestId: comment._challengeRequest.challengeRequestId,
                    challengeAnswerId: "1234-1234-1234",
                    encryptedChallengeAnswers: JSON.stringify([2]),
                    userAgent: version.default.USER_AGENT,
                    protocolVersion: version.default.PROTOCOL_VERSION
                };
                const challengeAnswer = new ChallengeAnswerMessage({
                    ...toSignAnswer,
                    signature: await signChallengeAnswer(toSignAnswer, comment.pubsubMessageSigner)
                });
                expect(await verifyChallengeAnswer(challengeAnswer)).to.deep.equal({ valid: true });

                challengeAnswer.challengeAnswerId += "123"; // Invalidate signature
                const verification = await verifyChallengeAnswer(challengeAnswer);
                expect(verification).to.deep.equal({
                    valid: false,
                    reason: messages.ERR_SIGNATURE_IS_INVALID
                });

                await plebbit._clientsManager.pubsubPublish(comment.subplebbit.pubsubTopic, JSON.stringify(challengeAnswer));

                const subMethod = (pubsubMsg) => {
                    const msgParsed = JSON.parse(toString(pubsubMsg["data"]));
                    if (
                        msgParsed.type === "CHALLENGEVERIFICATION" &&
                        msgParsed.challengeRequestId === comment._challengeRequest.challengeRequestId
                    ) {
                        expect(msgParsed.challengeSuccess).to.be.false;
                        expect(msgParsed.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
                        expect(msgParsed.publication).to.be.undefined;
                        expect(msgParsed.encryptedPublication).to.be.undefined;
                        plebbit._clientsManager.pubsubUnsubscribe(comment.subplebbit.pubsubTopic, subMethod);
                        resolve();
                    }
                };

                await plebbit._clientsManager.pubsubSubscribe(comment.subplebbit.pubsubTopic, subMethod);
            });
        });
    });
});

describe("challengeverification", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`valid challengeverification fixture from previous version can be validated`, async () => {
        const challengeVerification = lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_verification.json"));
        const verificaiton = await verifyChallengeVerification(challengeVerification);
        expect(verificaiton).to.deep.equal({ valid: true });
    });
    it(`Valid live challengeverification gets validated correctly`, async () => {
        const comment = await generateMockPost(signers[0].address, plebbit, false, { signer: signers[6] });
        await comment.publish();

        await new Promise((resolve) => {
            comment.once("challengeverification", async (challengeVerifcation, _) => {
                const verification = await verifyChallengeVerification(challengeVerifcation);
                expect(verification).to.deep.equal({ valid: true });
                resolve();
            });
        });
    });
    it(`Invalid challengeverification gets invalidated correctly`, async () => {
        const challengeVerification = lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_verification.json"));
        challengeVerification.challengeRequestId += "1234"; // Invalidate signature
        const verificaiton = await verifyChallengeVerification(challengeVerification);
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });
});
