const Plebbit = require("../../../dist/node");
const {
    verifyChallengeRequest,
    verifyChallengeAnswer,
    signChallengeAnswer,
    verifyChallengeMessage,
    verifyChallengeVerification,
    signChallengeRequest,
    verifyComment
} = require("../../../dist/node/signer/signatures");
const {
    generateMockPost,
    mockPlebbit,
    publishRandomPost,
    publishWithExpectedResult,
    isRpcFlagOn
} = require("../../../dist/node/test/test-util");
const signers = require("../../fixtures/signers");
const { expect, assert } = require("chai");
const { messages } = require("../../../dist/node/errors");
const { ChallengeAnswerMessage } = require("../../../dist/node/challenge");
const lodash = require("lodash");
const version = require("../../../dist/node/version");
const { encode, decode } = require("cborg");
const { getBufferedPlebbitAddressFromPublicKey } = require("../../../dist/node/signer/util");
const { encryptEd25519AesGcm } = require("../../../dist/node/signer/index");
const { timestamp } = require("../../../dist/node/util");

const mathCliSubplebbitAddress = signers[1].address;

const parseMsgJson = (json) => {
    // Convert stringified pubsub msg with buffers to regular pubsub msg with uint8Array for buffers
    const isBuffer = (obj) => Object.keys(obj).every((key) => /\d/.test(key));
    const parsed = {};
    for (const key of Object.keys(json)) {
        if (lodash.isPlainObject(json[key]) && isBuffer(json[key])) parsed[key] = Uint8Array.from(Object.values(json[key]));
        else if (lodash.isPlainObject(json[key])) parsed[key] = parseMsgJson(json[key]);
        else parsed[key] = json[key];
    }
    return parsed;
};

// prettier-ignore
if (!isRpcFlagOn()) // Clients of RPC will trust the response of RPC and won't validate
describe("challengerequest", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`valid challengerequest fixture from previous version can be validated`, async () => {
        const request = parseMsgJson(lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_request.json")));
        const verificaiton = await verifyChallengeRequest(request, false);
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it(`challenge request with challengeRequestId that is not derived from signer is invalidated`, async () => {
        const request = parseMsgJson(lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_request.json")));
        request.challengeRequestId[0] += 1; // Invalidate challengeRequestId
        const verificaiton = await verifyChallengeRequest(request, false);
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_CHALLENGE_REQUEST_ID_NOT_DERIVED_FROM_SIGNATURE });
    });

    it(`challenge request with outdated timestamp is invalidated`, async () => {
        const comment = await generateMockPost(signers[0].address, plebbit, false, { signer: signers[5] });
        await comment.publish();
        expect(comment._publishedChallengeRequests).to.be.a("array");
        const challengeRequestToEdit = lodash.cloneDeep(comment._publishedChallengeRequests[0]);
        challengeRequestToEdit.timestamp = timestamp() - 6 * 60; // Should be invalidated now
        const signer = Object.values(comment._challengeIdToPubsubSigner)[0];
        challengeRequestToEdit.signature = await signChallengeRequest(challengeRequestToEdit, signer);
        const verificaiton = await verifyChallengeRequest(challengeRequestToEdit, true);
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_PUBSUB_MSG_TIMESTAMP_IS_OUTDATED });
    });

    it(`Valid live ChallengeRequest gets validated correctly`, async () => {
        const comment = await generateMockPost(signers[0].address, plebbit, false, { signer: signers[5] });
        await comment.publish();
        // comment._publishedChallengeRequests (ChallengeRequest[]) should be defined now
        expect(comment._publishedChallengeRequests).to.be.a("array");
        const verificaiton = await verifyChallengeRequest(comment._publishedChallengeRequests[0]);
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it(`Sub responds with error to a challenge request whose publication can't be decrypted`, async () => {
        const comment = await generateMockPost(signers[0].address, plebbit, false, {content: "Test content"});
        const originalPublish = comment._clientsManager.pubsubPublishOnProvider.bind(comment._clientsManager);
        comment._clientsManager.pubsubPublishOnProvider = () => undefined;

        await comment.publish(); // comment._publishedChallengeRequests should be defined now, although it hasn't been published

        const challengeRequestToModify = comment._publishedChallengeRequests[0];
        const pubsubSigner = Object.values(comment._challengeIdToPubsubSigner)[0];
        challengeRequestToModify.encrypted = await encryptEd25519AesGcm(
            JSON.stringify(comment.toJSONPubsubMessage()),
            pubsubSigner.privateKey,
            signers[5].publicKey // Use a public key that cannot be decrypted for the sub
        );


        challengeRequestToModify.signature = await signChallengeRequest(challengeRequestToModify, pubsubSigner);

        await originalPublish(comment.subplebbit.pubsubTopic, challengeRequestToModify, comment._pubsubProviders[0]);

        let verificationMsg;

        await new Promise((resolve) => {
            comment.once("challengeverification", (_verificationMsg) => {
                verificationMsg = _verificationMsg;
                resolve();
            });
        });
        expect(verificationMsg.challengeSuccess).to.be.false;
        expect(verificationMsg.reason).to.equal(messages.ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG);
        expect(verificationMsg.publication).to.be.undefined;

    });

    it(`Sub responds with error to a challenge request with invalid pubsubMessage.encrypted.publication.signature`, async () => {
        const comment = await generateMockPost(signers[0].address, plebbit);
        const originalPublish = comment._clientsManager.pubsubPublishOnProvider.bind(comment._clientsManager);
        comment._clientsManager.pubsubPublishOnProvider = () => undefined;

        try {
            await comment.publish(); // comment._publishedChallengeRequests should be defined now, although it hasn't been published
        } catch {}

        comment._clientsManager.pubsubPublishOnProvider = originalPublish;

        expect(comment._publishedChallengeRequests).to.be.a("array");

        const commentObjToEncrypt = JSON.parse(JSON.stringify(comment.toJSONPubsubMessage()));

        expect(await verifyComment(commentObjToEncrypt.publication, plebbit.resolveAuthorAddresses, comment._clientsManager, true)).to.deep.equal({
            valid: true
        });
        commentObjToEncrypt.publication.timestamp += 1; // Should invalidate signature
        expect(await verifyComment(commentObjToEncrypt.publication, false, comment._clientsManager, false)).to.deep.equal({
            valid: false,
            reason: messages.ERR_SIGNATURE_IS_INVALID
        });

        const challengeRequestToModify = comment._publishedChallengeRequests[0];
        const pubsubSigner = Object.values(comment._challengeIdToPubsubSigner)[0];

        challengeRequestToModify.encrypted = await encryptEd25519AesGcm(
            JSON.stringify(commentObjToEncrypt),
            pubsubSigner.privateKey,
            comment.subplebbit.encryption.publicKey
        );

        challengeRequestToModify.signature = await signChallengeRequest(challengeRequestToModify, pubsubSigner);

        await comment._clientsManager.pubsubPublish(comment.subplebbit.pubsubTopic, challengeRequestToModify);

        await new Promise((resolve) => {
            comment.once("challengeverification", (verificationMsg) => {
                expect(verificationMsg.challengeSuccess).to.be.false;
                expect(verificationMsg.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
                expect(verificationMsg.publication).to.be.undefined;
                expect(verificationMsg.encrypted).to.be.undefined;

                resolve();
            });
        });
    });

    it(`Sub ignores a challenge request with invalid pubsubMessage.signature`, async () => {
        // This test case also includes challengeRequestId not being derived from signer since it's caught by verifyChallengeRequest
        const comment = await generateMockPost(signers[0].address, plebbit, false, { signer: signers[6] });

        await Promise.all([new Promise((resolve) => comment.once("challengeverification", resolve)), comment.publish()]);

        // comment._publishedChallengeRequests (ChallengeRequest) should be defined now
        expect(comment._publishedChallengeRequests).to.be.a("array");
        const requestWithInvalidSignature = lodash.clone(comment._publishedChallengeRequests[0]);
        requestWithInvalidSignature.acceptedChallengeTypes.push("test"); // Signature should be invalid after
        const verificaiton = await verifyChallengeRequest(requestWithInvalidSignature);
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });

        await plebbit._clientsManager.pubsubPublish(comment.subplebbit.pubsubTopic, requestWithInvalidSignature);

        await new Promise(async (resolve) => {
            const subMethod = (pubsubMsg) => {
                const msgParsed = decode(pubsubMsg["data"]);
                if (
                    msgParsed.type === "CHALLENGEVERIFICATION" &&
                    msgParsed.challengeRequestId === requestWithInvalidSignature.challengeRequestId
                ) {
                    assert.fail("Subplebbit should not respond to a challenge request with invalid signature");
                }
            };
            await plebbit._clientsManager.pubsubSubscribe(comment.subplebbit.pubsubTopic, subMethod);
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5s for sub response, if we didn't get a response then the request has been ignored
            resolve();
        });
    });
});

// prettier-ignore
if (!isRpcFlagOn()) // Clients of RPC will trust the response of RPC and won't validate
describe(`challengemessage`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`valid challengemessage fixture from previous version can be validated`, async () => {
        const challenge = parseMsgJson(lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_message.json")));
        const verificaiton = await verifyChallengeMessage(challenge, "12D3KooWANwdyPERMQaCgiMnTT1t3Lr4XLFbK1z4ptFVhW2ozg1z");
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it(`Invalid ChallengeMessage gets invalidated correctly`, async () => {
        const challenge = parseMsgJson(lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_message.json")));
        challenge.timestamp -= 1234; // Should invalidate signature
        const verificaiton = await verifyChallengeMessage(challenge, "12D3KooWANwdyPERMQaCgiMnTT1t3Lr4XLFbK1z4ptFVhW2ozg1z");
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`challenge message signed by other than subplebbit.pubsubTopic is invalidated`, async () => {
        const challenge = parseMsgJson(lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_message.json")));
        const verificaiton = await verifyChallengeMessage(challenge, (await plebbit.createSigner()).address); // Random pubsub topic
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_CHALLENGE_MSG_SIGNER_IS_NOT_SUBPLEBBIT });
    });
    it(`Valid live challengemessage gets validated correctly`, async () => {
        const comment = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[6] });
        comment.removeAllListeners();

        await comment.publish();

        await new Promise(async (resolve) => {
            comment.once("challenge", async (challengeMessage) => {
                const verification = await verifyChallengeMessage(challengeMessage, mathCliSubplebbitAddress);
                expect(verification).to.deep.equal({ valid: true });
                resolve();
            });
        });
    });
});

// prettier-ignore
if (!isRpcFlagOn()) // Clients of RPC will trust the response of RPC and won't validate
describe("challengeanswer", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`valid challengeanswer fixture from previous version can be validated`, async () => {
        const answer = parseMsgJson(lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_answer.json")));
        const verificaiton = await verifyChallengeAnswer(answer);
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it(`challenge answer with challengeRequestId that is not derived from signer is invalidated`, async () => {
        const answer = parseMsgJson(lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_answer.json")));
        answer.challengeRequestId[0] += 1; // Invalidate challenge request id
        const verificaiton = await verifyChallengeAnswer(answer);
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_CHALLENGE_REQUEST_ID_NOT_DERIVED_FROM_SIGNATURE });
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

    it(`Sub ignores a challenge answer with invalid answer.signature`, async () => {
        // Test includes cases where challengeRequestId is not derived from the signer of the message because verifyChallengeAnswer checks for that too
        const comment = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[6] });

        comment.removeAllListeners();
        await comment.publish();

        await new Promise((resolve) => comment.once("challenge",resolve));

        await comment._plebbit._clientsManager.pubsubUnsubscribe(comment.subplebbit.pubsubTopic, comment.handleChallengeExchange);
        const toSignAnswer = {
            type: "CHALLENGEANSWER",
            challengeRequestId: comment._publishedChallengeRequests[0].challengeRequestId,
            encrypted: JSON.stringify([2]),
            userAgent: version.default.USER_AGENT,
            protocolVersion: version.default.PROTOCOL_VERSION
        };

        const pubsubSigner = Object.values(comment._challengeIdToPubsubSigner)[0];
        const challengeAnswer = new ChallengeAnswerMessage({
            ...toSignAnswer,
            signature: await signChallengeAnswer(toSignAnswer, pubsubSigner)
        });
        expect(await verifyChallengeAnswer(challengeAnswer)).to.deep.equal({ valid: true });

        challengeAnswer.timestamp += "123"; // Invalidate signature
        const verification = await verifyChallengeAnswer(challengeAnswer);
        expect(verification).to.deep.equal({
            valid: false,
            reason: messages.ERR_SIGNATURE_IS_INVALID
        });

        await plebbit._clientsManager.pubsubPublish(comment.subplebbit.pubsubTopic, challengeAnswer);

        const subMethod = (pubsubMsg) => {
            const msgParsed = decode(pubsubMsg["data"]);
            if (
                msgParsed.type === "CHALLENGEVERIFICATION" &&
                msgParsed.challengeRequestId === comment._publishedChallengeRequests[0].challengeRequestId
            ) {
                assert.fail("Subplebbit should ignore a challenge answer with invalid signature");
            }
        };

        await plebbit._clientsManager.pubsubSubscribe(comment.subplebbit.pubsubTopic, subMethod);
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5s for sub response, if we didn't get a response then the answer has been ignored

    });

    it(`Sub responds with error to a challenge answer with answers that can't be decrypted`, async () => {
        const tempPlebbit = await mockPlebbit();
        const comment = await generateMockPost(mathCliSubplebbitAddress, tempPlebbit);
        comment.removeAllListeners("challenge");

        const originalPublish = comment._clientsManager.pubsubPublishOnProvider.bind(comment._clientsManager);


        comment.once("challenge", async (challengeMsg) => {
            const pubsubSigner = Object.values(comment._challengeIdToPubsubSigner)[0];
            comment._clientsManager.pubsubPublishOnProvider = () => undefined; // Disable publishing

            await comment.publishChallengeAnswers([]);
            // comment._challengeAnswer should be defined now
            comment._challengeAnswer.encrypted = await encryptEd25519AesGcm(
                JSON.stringify({}),
                pubsubSigner.privateKey,
                signers[5].publicKey // Use a public key that cannot be decrypted for the sub
            );
            comment._challengeAnswer.signature = await signChallengeAnswer(comment._challengeAnswer, pubsubSigner);
            await originalPublish(comment.subplebbit.pubsubTopic, comment._challengeAnswer, comment._pubsubProviders[0]);
        });

        await publishWithExpectedResult(comment, false, messages.ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG);
    });

    it(`Sub responds with error to challenge answer whose id not registered (no challenge request with same id)`, async () => {
        const comment = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[6] });

        comment.removeAllListeners();
        await comment.publish();

        await new Promise(async (resolve) => {
            comment.once("challenge", async () => {
                await comment._plebbit._clientsManager.pubsubUnsubscribe(comment.subplebbit.pubsubTopic, comment.handleChallengeExchange);
                const newSigner = await plebbit.createSigner();
                const challengeRequestId = await getBufferedPlebbitAddressFromPublicKey(newSigner.publicKey);
                const toSignAnswer = {
                    type: "CHALLENGEANSWER",
                    challengeRequestId,
                    encryptedChallengeAnswers: JSON.stringify([2]),
                    userAgent: version.default.USER_AGENT,
                    protocolVersion: version.default.PROTOCOL_VERSION
                };
                const challengeAnswer = new ChallengeAnswerMessage({
                    ...toSignAnswer,
                    signature: await signChallengeAnswer(toSignAnswer, newSigner)
                });
                expect(await verifyChallengeAnswer(challengeAnswer)).to.deep.equal({ valid: true });

                await plebbit._clientsManager.pubsubPublish(comment.subplebbit.pubsubTopic, challengeAnswer);

                const subMethod = (pubsubMsg) => {
                    const msgParsed = decode(pubsubMsg["data"]);
                    if (
                        msgParsed.type === "CHALLENGEVERIFICATION" &&
                        lodash.isEqual(msgParsed.challengeRequestId, toSignAnswer.challengeRequestId)
                    ) {
                        expect(msgParsed.challengeSuccess).to.be.false;
                        expect(msgParsed.reason).to.equal(messages.ERR_CHALLENGE_ANSWER_WITH_NO_CHALLENGE_REQUEST);
                        expect(msgParsed.publication).to.be.undefined;
                        expect(msgParsed.encrypted).to.be.undefined;
                        plebbit._clientsManager.pubsubUnsubscribe(comment.subplebbit.pubsubTopic, subMethod);
                        resolve();
                    }
                };

                await plebbit._clientsManager.pubsubSubscribe(comment.subplebbit.pubsubTopic, subMethod);
                await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5s for sub response, if we didn't get a response then the answer has been ignored
                resolve();
            });
        });
    });
});

// prettier-ignore
if (!isRpcFlagOn()) // Clients of RPC will trust the response of RPC and won't validate
describe("challengeverification", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`valid challengeverification fixture from previous version can be validated`, async () => {
        const challengeVerification = parseMsgJson(
            lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_verification.json"))
        );
        const verificaiton = await verifyChallengeVerification(challengeVerification, signers[0].address);
        expect(verificaiton).to.deep.equal({ valid: true });
    });
    it(`Valid live challengeverification gets validated correctly`, async () => {
        const comment = await generateMockPost(signers[0].address, plebbit, false, { signer: signers[6] });
        await comment.publish();

        await new Promise((resolve) => {
            comment.once("challengeverification", async (challengeVerifcation, _) => {
                const verification = await verifyChallengeVerification(challengeVerifcation, signers[0].address);
                expect(verification).to.deep.equal({ valid: true });
                resolve();
            });
        });
    });
    it(`Invalid challengeverification gets invalidated correctly`, async () => {
        const challengeVerification = parseMsgJson(
            lodash.clone(require("../../fixtures/signatures/challenges/valid_challenge_verification.json"))
        );
        challengeVerification.timestamp -= 1234; // Invalidate signature
        const verificaiton = await verifyChallengeVerification(challengeVerification, signers[0].address);
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });
});
