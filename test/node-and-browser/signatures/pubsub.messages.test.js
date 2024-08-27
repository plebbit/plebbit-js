import { generateMockPost, mockPlebbit, publishWithExpectedResult, describeSkipIfRpc } from "../../../dist/node/test/test-util.js";
import {
    verifyChallengeRequest,
    verifyChallengeAnswer,
    signChallengeAnswer,
    verifyChallengeMessage,
    verifyChallengeVerification,
    signChallengeRequest,
    verifyCommentPubsubMessage
} from "../../../dist/node/signer/signatures.js";
import signers from "../../fixtures/signers.js";
import { expect, assert } from "chai";
import { messages } from "../../../dist/node/errors.js";
import * as remeda from "remeda";
import { default as PlebbitJsVersion } from "../../../dist/node/version.js";
import { encode as cborgEncode, decode as cborgDecode } from "cborg";
import { getBufferedPlebbitAddressFromPublicKey } from "../../../dist/node/signer/util.js";
import { encryptEd25519AesGcm } from "../../../dist/node/signer/index.js";
import { timestamp } from "../../../dist/node/util.js";
import validChallengeRequestFixture from "../../fixtures/signatures/challenges/valid_challenge_request.json" assert { type: "json" };
import validChallengeFixture from "../../fixtures/signatures/challenges/valid_challenge_message.json" assert { type: "json" };
import validChallengeAnswerFixture from "../../fixtures/signatures/challenges/valid_challenge_answer.json" assert { type: "json" };
import validChallengeVerificationFixture from "../../fixtures/signatures/challenges/valid_challenge_verification.json" assert { type: "json" };

const mathCliSubplebbitAddress = signers[1].address;

const parsePubsubMsgFixture = (json) => {
    // Convert stringified pubsub msg with buffers to regular pubsub msg with uint8Array for buffers
    const isBuffer = (obj) => Object.keys(obj).every((key) => /\d/.test(key));
    const parsed = {};
    for (const key of Object.keys(json)) {
        if (remeda.isPlainObject(json[key]) && isBuffer(json[key])) parsed[key] = Uint8Array.from(Object.values(json[key]));
        else if (remeda.isPlainObject(json[key])) parsed[key] = parsePubsubMsgFixture(json[key]);
        else parsed[key] = json[key];
    }
    return parsed;
};

// Clients of RPC will trust the response of RPC and won't validate
describeSkipIfRpc("challengerequest", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`valid challengerequest fixture from previous version can be validated`, async () => {
        const request = parsePubsubMsgFixture(remeda.clone(validChallengeRequestFixture));
        const verificaiton = await verifyChallengeRequest(request, false);
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it(`challenge request with challengeRequestId that is not derived from signer is invalidated`, async () => {
        const request = parsePubsubMsgFixture(remeda.clone(validChallengeRequestFixture));
        request.challengeRequestId[0] += 1; // Invalidate challengeRequestId
        const verificaiton = await verifyChallengeRequest(request, false);
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_CHALLENGE_REQUEST_ID_NOT_DERIVED_FROM_SIGNATURE });
    });

    it(`challenge request with outdated timestamp is invalidated`, async () => {
        const comment = await generateMockPost(signers[0].address, plebbit, false, { signer: signers[5] });
        await comment.publish();
        expect(comment._publishedChallengeRequests).to.be.a("array");
        const challengeRequestToEdit = remeda.omit(remeda.clone(comment._publishedChallengeRequests[0]), [
            "publication",
            "challengeAnswers",
            "challengeCommentCids"
        ]);
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
        const requestToValidate = remeda.omit(comment._publishedChallengeRequests[0], [
            "publication",
            "challengeAnswers",
            "challengeCommentCids"
        ]);
        const verificaiton = await verifyChallengeRequest(requestToValidate);
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it(`Sub responds with error to a challenge request whose publication can't be decrypted`, async () => {
        const comment = await generateMockPost(signers[0].address, plebbit, false, { content: "Test content" });
        const originalPublish = comment._clientsManager.pubsubPublishOnProvider.bind(comment._clientsManager);
        comment._clientsManager.pubsubPublishOnProvider = () => undefined;

        await comment.publish(); // comment._publishedChallengeRequests should be defined now, although it hasn't been published

        const challengeRequestToModify = remeda.omit(comment._publishedChallengeRequests[0], [
            "publication",
            "challengeCommentCids",
            "challengeAnswers"
        ]);
        const pubsubSigner = Object.values(comment._challengeIdToPubsubSigner)[0];
        challengeRequestToModify.encrypted = await encryptEd25519AesGcm(
            JSON.stringify(comment.toJSONPubsubMessage()),
            pubsubSigner.privateKey,
            signers[5].publicKey // Use a public key that cannot be decrypted for the sub
        );

        challengeRequestToModify.signature = await signChallengeRequest(challengeRequestToModify, pubsubSigner);

        await originalPublish(comment._subplebbit.pubsubTopic, challengeRequestToModify, comment._pubsubProviders[0]);

        const verificationMsg = await new Promise((resolve) => comment.once("challengeverification", resolve));
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

        expect(
            await verifyCommentPubsubMessage(commentObjToEncrypt.publication, plebbit.resolveAuthorAddresses, comment._clientsManager, true)
        ).to.deep.equal({
            valid: true
        });
        commentObjToEncrypt.publication.timestamp += 1; // Should invalidate signature
        expect(await verifyCommentPubsubMessage(commentObjToEncrypt.publication, false, comment._clientsManager, false)).to.deep.equal({
            valid: false,
            reason: messages.ERR_SIGNATURE_IS_INVALID
        });

        const challengeRequestToModify = remeda.omit(comment._publishedChallengeRequests[0], [
            "publication",
            "challengeCommentCids",
            "challengeAnswers"
        ]);
        const pubsubSigner = Object.values(comment._challengeIdToPubsubSigner)[0];

        challengeRequestToModify.encrypted = await encryptEd25519AesGcm(
            JSON.stringify(commentObjToEncrypt),
            pubsubSigner.privateKey,
            comment._subplebbit.encryption.publicKey
        );

        challengeRequestToModify.signature = await signChallengeRequest(challengeRequestToModify, pubsubSigner);

        await comment._clientsManager.pubsubPublish(comment._subplebbit.pubsubTopic, challengeRequestToModify);

        const verificationMsg = await new Promise((resolve) => comment.once("challengeverification", resolve));

        expect(verificationMsg.challengeSuccess).to.be.false;
        expect(verificationMsg.reason).to.equal(messages.ERR_SIGNATURE_IS_INVALID);
        expect(verificationMsg.publication).to.be.undefined;
        expect(verificationMsg.encrypted).to.be.undefined;
    });

    it(`Sub ignores a challenge request with invalid pubsubMessage.signature`, async () => {
        // This test case also includes challengeRequestId not being derived from signer since it's caught by verifyChallengeRequest
        const comment = await generateMockPost(signers[0].address, plebbit, false, { signer: signers[6] });

        await Promise.all([new Promise((resolve) => comment.once("challengeverification", resolve)), comment.publish()]);

        // comment._publishedChallengeRequests (ChallengeRequest) should be defined now
        expect(comment._publishedChallengeRequests).to.be.a("array");
        const requestWithInvalidSignature = remeda.omit(remeda.clone(comment._publishedChallengeRequests[0]), [
            "publication",
            "challengeCommentCids",
            "challengeAnswers"
        ]);
        requestWithInvalidSignature.acceptedChallengeTypes.push("test"); // Signature should be invalid after
        const verificaiton = await verifyChallengeRequest(requestWithInvalidSignature);
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });

        await plebbit._clientsManager.pubsubPublish(comment._subplebbit.pubsubTopic, requestWithInvalidSignature);

        await new Promise(async (resolve) => {
            const subMethod = (pubsubMsg) => {
                const msgParsed = cborgDecode(pubsubMsg["data"]);
                if (
                    msgParsed.type === "CHALLENGEVERIFICATION" &&
                    msgParsed.challengeRequestId === requestWithInvalidSignature.challengeRequestId
                ) {
                    assert.fail("Subplebbit should not respond to a challenge request with invalid signature");
                }
            };
            await plebbit._clientsManager.pubsubSubscribe(comment._subplebbit.pubsubTopic, subMethod);
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5s for sub response, if we didn't get a response then the request has been ignored
            resolve();
        });
    });
});

// Clients of RPC will trust the response of RPC and won't validate
describeSkipIfRpc(`challengemessage`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`valid challengemessage fixture from previous version can be validated`, async () => {
        const challenge = parsePubsubMsgFixture(remeda.clone(validChallengeFixture));
        const verificaiton = await verifyChallengeMessage(challenge, "12D3KooWANwdyPERMQaCgiMnTT1t3Lr4XLFbK1z4ptFVhW2ozg1z");
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it(`Invalid ChallengeMessage gets invalidated correctly`, async () => {
        const challenge = parsePubsubMsgFixture(remeda.clone(validChallengeFixture));
        challenge.timestamp -= 1234; // Should invalidate signature
        const verificaiton = await verifyChallengeMessage(challenge, "12D3KooWANwdyPERMQaCgiMnTT1t3Lr4XLFbK1z4ptFVhW2ozg1z");
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });

    it(`challenge message signed by other than subplebbit.pubsubTopic is invalidated`, async () => {
        const challenge = parsePubsubMsgFixture(remeda.clone(validChallengeFixture));
        const verificaiton = await verifyChallengeMessage(challenge, (await plebbit.createSigner()).address); // Random pubsub topic
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_CHALLENGE_MSG_SIGNER_IS_NOT_SUBPLEBBIT });
    });
    it(`Valid live challengemessage gets validated correctly`, async () => {
        const comment = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[6] });
        comment.removeAllListeners();

        await comment.publish();

        const challengePubsubMsg = await new Promise((resolve) => comment.once("challenge", resolve));

        const challengePubsubMsgNoExtraProps = remeda.omit(challengePubsubMsg, ["challenges"]);

        const verification = await verifyChallengeMessage(challengePubsubMsgNoExtraProps, mathCliSubplebbitAddress);
        expect(verification).to.deep.equal({ valid: true });
    });
});

// Clients of RPC will trust the response of RPC and won't validate
describeSkipIfRpc("challengeanswer", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`valid challengeanswer fixture from previous version can be validated`, async () => {
        const answer = parsePubsubMsgFixture(remeda.clone(validChallengeAnswerFixture));
        const verificaiton = await verifyChallengeAnswer(answer);
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it(`challenge answer with challengeRequestId that is not derived from signer is invalidated`, async () => {
        const answer = parsePubsubMsgFixture(remeda.clone(validChallengeAnswerFixture));
        answer.challengeRequestId[0] += 1; // Invalidate challenge request id
        const verificaiton = await verifyChallengeAnswer(answer);
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_CHALLENGE_REQUEST_ID_NOT_DERIVED_FROM_SIGNATURE });
    });

    it(`Valid live ChallengeAnswer gets validated correctly`, async () => {
        const comment = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[5] });
        comment.removeAllListeners();
        await comment.publish();

        comment.once("challenge", () => comment.publishChallengeAnswers(["2"]));

        const challengeAnswerPubsubMsg = await new Promise((resolve) => comment.once("challengeanswer", resolve));
        const challengeAnswerPubsubMsgNoExtraProps = remeda.omit(challengeAnswerPubsubMsg, ["challengeAnswers"]);
        const verificaiton = await verifyChallengeAnswer(challengeAnswerPubsubMsgNoExtraProps);
        expect(verificaiton).to.deep.equal({ valid: true });
    });

    it(`Sub ignores a challenge answer with invalid answer.signature`, async () => {
        // Test includes cases where challengeRequestId is not derived from the signer of the message because verifyChallengeAnswer checks for that too
        const comment = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[6] });

        comment.removeAllListeners();
        await comment.publish();

        await new Promise((resolve) => comment.once("challenge", resolve));

        await comment._plebbit._clientsManager.pubsubUnsubscribe(comment._subplebbit.pubsubTopic, comment.handleChallengeExchange);
        const toSignAnswer = {
            type: "CHALLENGEANSWER",
            challengeRequestId: comment._publishedChallengeRequests[0].challengeRequestId,
            encrypted: JSON.stringify([2]),
            userAgent: PlebbitJsVersion.USER_AGENT,
            protocolVersion: PlebbitJsVersion.PROTOCOL_VERSION
        };

        const pubsubSigner = Object.values(comment._challengeIdToPubsubSigner)[0];
        const challengeAnswer = {
            ...toSignAnswer,
            signature: await signChallengeAnswer(toSignAnswer, pubsubSigner)
        };
        expect(await verifyChallengeAnswer(challengeAnswer)).to.deep.equal({ valid: true });

        challengeAnswer.timestamp += "123"; // Invalidate signature
        const verification = await verifyChallengeAnswer(challengeAnswer);
        expect(verification).to.deep.equal({
            valid: false,
            reason: messages.ERR_SIGNATURE_IS_INVALID
        });

        await plebbit._clientsManager.pubsubPublish(comment._subplebbit.pubsubTopic, challengeAnswer);

        const subMethod = (pubsubMsg) => {
            const msgParsed = cborgDecode(pubsubMsg["data"]);
            if (
                msgParsed.type === "CHALLENGEVERIFICATION" &&
                msgParsed.challengeRequestId === comment._publishedChallengeRequests[0].challengeRequestId
            ) {
                assert.fail("Subplebbit should ignore a challenge answer with invalid signature");
            }
        };

        await plebbit._clientsManager.pubsubSubscribe(comment._subplebbit.pubsubTopic, subMethod);
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

            await comment.publishChallengeAnswers(["test hello"]);
            // comment._challengeAnswer should be defined now

            const challengeAnswerToModify = remeda.omit(comment._challengeAnswer, ["challengeAnswers"]);
            challengeAnswerToModify.encrypted = await encryptEd25519AesGcm(
                JSON.stringify({}),
                pubsubSigner.privateKey,
                signers[5].publicKey // Use a public key that cannot be decrypted for the sub
            );
            challengeAnswerToModify.signature = await signChallengeAnswer(challengeAnswerToModify, pubsubSigner);
            await originalPublish(comment._subplebbit.pubsubTopic, challengeAnswerToModify, comment._pubsubProviders[0]);
        });

        await publishWithExpectedResult(comment, false, messages.ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG);
    });

    it(`Sub responds with error to challenge answer whose id not registered (no challenge request with same id)`, async () => {
        const comment = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[6] });

        comment.removeAllListeners();
        await comment.publish();

        await new Promise((resolve) => comment.once("challenge", resolve));

        await comment._plebbit._clientsManager.pubsubUnsubscribe(comment._subplebbit.pubsubTopic, comment.handleChallengeExchange);
        const pubsubSigner = await plebbit.createSigner();
        const differentChallengeRequestId = await getBufferedPlebbitAddressFromPublicKey(pubsubSigner.publicKey);
        const toSignAnswer = {
            type: "CHALLENGEANSWER",
            challengeRequestId: differentChallengeRequestId,
            userAgent: PlebbitJsVersion.USER_AGENT,
            protocolVersion: PlebbitJsVersion.PROTOCOL_VERSION,
            timestamp: Math.round(Date.now() / 1000)
        };
        toSignAnswer.encrypted = await encryptEd25519AesGcm(
            JSON.stringify({ challengeAnswers: ["2"] }),
            pubsubSigner.privateKey,
            comment._subplebbit.encryption.publicKey // Use a public key that cannot be decrypted for the sub
        );
        const challengeAnswer = {
            ...toSignAnswer,
            signature: await signChallengeAnswer(toSignAnswer, pubsubSigner)
        };
        expect(await verifyChallengeAnswer(challengeAnswer)).to.deep.equal({ valid: true });

        await plebbit._clientsManager.pubsubPublish(comment._subplebbit.pubsubTopic, challengeAnswer);

        const challengeVerification = await new Promise((resolve) =>
            plebbit._clientsManager.pubsubSubscribe(comment._subplebbit.pubsubTopic, (pubsubMsg) => {
                const msgParsed = cborgDecode(pubsubMsg["data"]);
                if (
                    msgParsed.type === "CHALLENGEVERIFICATION" &&
                    msgParsed.challengeRequestId.toString() === toSignAnswer.challengeRequestId.toString()
                )
                    resolve(msgParsed);
            })
        );

        expect(challengeVerification.challengeSuccess).to.be.false;
        expect(challengeVerification.reason).to.equal(messages.ERR_CHALLENGE_ANSWER_WITH_NO_CHALLENGE_REQUEST);
        expect(challengeVerification.publication).to.be.undefined;
        expect(challengeVerification.encrypted).to.be.undefined;
        plebbit._clientsManager.pubsubUnsubscribe(comment._subplebbit.pubsubTopic);
    });
});

// Clients of RPC will trust the response of RPC and won't validate
describeSkipIfRpc("challengeverification", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`valid challengeverification fixture from previous version can be validated`, async () => {
        const challengeVerification = parsePubsubMsgFixture(remeda.clone(validChallengeVerificationFixture));
        const verificaiton = await verifyChallengeVerification(challengeVerification, signers[0].address);
        expect(verificaiton).to.deep.equal({ valid: true });
    });
    it(`Valid live challengeverification gets validated correctly`, async () => {
        const comment = await generateMockPost(signers[0].address, plebbit, false, { signer: signers[6] });
        await comment.publish();

        const challengeVerification = await new Promise((resolve) => comment.once("challengeverification", resolve));
        const challengeVerificationNoExtraProps = remeda.omit(challengeVerification, ["publication"]);
        const verification = await verifyChallengeVerification(challengeVerificationNoExtraProps, signers[0].address);
        expect(verification).to.deep.equal({ valid: true });
    });
    it(`Invalid challengeverification gets invalidated correctly`, async () => {
        const challengeVerification = parsePubsubMsgFixture(remeda.clone(validChallengeVerificationFixture));
        challengeVerification.timestamp -= 1234; // Invalidate signature
        const verificaiton = await verifyChallengeVerification(challengeVerification, signers[0].address);
        expect(verificaiton).to.deep.equal({ valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID });
    });
});
