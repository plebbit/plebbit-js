const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const signers = require("../fixtures/signers");
const { generateMockPost, publishWithExpectedResult, publishRandomPost } = require("../../dist/node/test/test-util");
const { mockPlebbit } = require("../../dist/node/test/test-util");
const lodash = require("lodash");
const { fromString } = require("uint8arrays/from-string");
const { signChallengeRequest, signChallengeAnswer } = require("../../dist/node/signer/signatures");
const { messages } = require("../../dist/node/errors");
const { encrypt } = require("../../dist/node/signer/index");

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const mathCliSubplebbitAddress = signers[1].address;
const imageCaptchaSubplebbitAddress = signers[2].address;

describe.skip(`Stress test challenge exchange`, async () => {
    const num = 50;
    let plebbit, subplebbit;

    before(async () => {
        plebbit = await mockPlebbit();
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
        plebbit = await mockPlebbit();
    });
    it("can post after answering correctly", async function () {
        const mockPost = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[0] });
        mockPost.removeAllListeners();
        mockPost.once("challenge", (challengeMessage) => {
            mockPost.publishChallengeAnswers(["2"]);
        });
        await publishWithExpectedResult(mockPost, true);
    });
    it("Throws an error when user fails to solve mathcli captcha", async function () {
        const mockPost = await generateMockPost(mathCliSubplebbitAddress, plebbit, false, { signer: signers[0] });
        mockPost.removeAllListeners();
        mockPost.once("challenge", (challengeMessage) => {
            mockPost.publishChallengeAnswers(["3"]);
        });
        await publishWithExpectedResult(mockPost, false);
    });
});

describe("image captcha", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it("can post after answering correctly", async function () {
        const mockPost = await generateMockPost(imageCaptchaSubplebbitAddress, plebbit);
        mockPost.removeAllListeners();

        mockPost.once("challenge", async (challengeMsg) => {
            expect(challengeMsg?.challenges[0]?.challenge).to.be.a("string");
            await mockPost.publishChallengeAnswers(["1234"]); // hardcode answer here
        });

        await publishWithExpectedResult(mockPost, true);
    });

    it("Throws an error if unable to solve image captcha", async function () {
        const mockPost = await generateMockPost(imageCaptchaSubplebbitAddress, plebbit);
        await publishWithExpectedResult(mockPost, false);
    });
});

describe(`Validation of pubsub messages`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`Sub ignores a challengeanswer with unregistered requestId`, async () => {
        const mockPost = await generateMockPost(imageCaptchaSubplebbitAddress, plebbit);
        mockPost.removeAllListeners();

        mockPost.once("challenge", async (challengeMsg) => {
            const oldId = lodash.clone(mockPost._challengeRequest.challengeRequestId);
            mockPost._challengeRequest.challengeRequestId = "1234-1234";
            await mockPost.publishChallengeAnswers([]);
            expect(mockPost._challengeAnswer.challengeRequestId).to.equal("1234-1234");
            mockPost._challengeRequest.challengeRequestId = oldId;
        });

        mockPost.once("challengeverification", (verificationMsg) => expect.fail("Should not receive a response"));

        await mockPost.publish();

        await new Promise((resolve) => setTimeout(resolve, 10000));
    });

    it(`Sub ignores a challengeanswer with a different signer than challengerequest`, async () => {
        const mockPost = await generateMockPost(imageCaptchaSubplebbitAddress, plebbit);
        mockPost.removeAllListeners();

        mockPost.once("challenge", async (challengeMsg) => {
            mockPost.pubsubMessageSigner = await plebbit.createSigner();
            await mockPost.publishChallengeAnswers([]);
        });

        mockPost.once("challengeverification", (verificationMsg) => expect.fail("Should not receive a response"));

        await mockPost.publish();

        await new Promise((resolve) => setTimeout(resolve, 10000));
    });

    it(`Sub responds with error to a ChallengeRequest that can't be decrypted`, async () => {
        const tempPlebbit = await mockPlebbit();
        tempPlebbit._clientsManager.getDefaultPubsub()._client.pubsub.publish = () => undefined;
        const comment = await generateMockPost(signers[0].address, tempPlebbit);
        await comment.publish(); // comment._challengeRequest should be defined now, although it hasn't been published

        comment._challengeRequest.encryptedPublication = await encrypt(
            JSON.stringify(comment.toJSONPubsubMessagePublication()),
            comment.pubsubMessageSigner.privateKey,
            signers[5].publicKey // Use a public key that cannot be decrypted for the sub
        );

        comment._challengeRequest.signature = await signChallengeRequest(comment._challengeRequest, comment.pubsubMessageSigner);

        await plebbit._clientsManager
            .getDefaultPubsub()
            ._client.pubsub.publish(comment.subplebbit.pubsubTopic, fromString(JSON.stringify(comment._challengeRequest)));

        await new Promise((resolve) => {
            comment.once("challengeverification", (verificationMsg) => {
                expect(verificationMsg.challengeSuccess).to.be.false;
                expect(verificationMsg.reason).to.equal(messages.ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG);
                expect(verificationMsg.publication).to.be.undefined;
                resolve();
            });
        });
    });

    it(`Sub responds with error to a ChallengeAnswer that can't be decrypted`, async () => {
        const tempPlebbit = await mockPlebbit(); // Make sure it's a singular pubsub provider
        const comment = await generateMockPost(imageCaptchaSubplebbitAddress, tempPlebbit);
        comment.removeAllListeners("challenge");

        comment.once("challenge", async (challengeMsg) => {
            tempPlebbit._clientsManager.pubsubPublish = () => undefined;

            await comment.publishChallengeAnswers([]);
            // comment._challengeAnswer should be defined now
            comment._challengeAnswer.encryptedChallengeAnswers = await encrypt(
                JSON.stringify([]),
                comment.pubsubMessageSigner.privateKey,
                signers[5].publicKey // Use a public key that cannot be decrypted for the sub
            );
            comment._challengeAnswer.signature = await signChallengeAnswer(comment._challengeAnswer, comment.pubsubMessageSigner);
            await plebbit._clientsManager
                .getDefaultPubsub()
                ._client.pubsub.publish(comment.subplebbit.pubsubTopic, fromString(JSON.stringify(comment._challengeAnswer)));
        });

        await publishWithExpectedResult(comment, false, messages.ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG);
    });
});
