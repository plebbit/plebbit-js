const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const signers = require("../fixtures/signers");
const { generateMockPost, publishWithExpectedResult } = require("../../dist/node/test/test-util");
const { mockPlebbit } = require("../../dist/node/test/test-util");
const lodash = require("lodash");

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const mathCliSubplebbitAddress = signers[1].address;
const imageCaptchaSubplebbitAddress = signers[2].address;

describe("math-cli", async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit();
    });
    it("can post after answering correctly", async function () {
            const mockPost = await generateMockPost(mathCliSubplebbitAddress, plebbit, signers[0]);
            mockPost.removeAllListeners();
            mockPost.once("challenge", (challengeMessage) => {
                mockPost.publishChallengeAnswers(["2"]);
            });
        await publishWithExpectedResult(mockPost, true);
    });
    it("Throws an error when user fails to solve mathcli captcha", async function () {
            const mockPost = await generateMockPost(mathCliSubplebbitAddress, plebbit, signers[0]);
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
            const mockPost = await generateMockPost(imageCaptchaSubplebbitAddress, plebbit, signers[0]);
            mockPost.removeAllListeners();

            mockPost.once("challenge", async (challengeMsg) => {
                expect(challengeMsg?.challenges[0]?.challenge).to.be.a("string");
                await mockPost.publishChallengeAnswers(["1234"]); // hardcode answer here
            });

        await publishWithExpectedResult(mockPost, true);
            });

    it("Throws an error if unable to solve image captcha", async function () {
        const mockPost = await generateMockPost(imageCaptchaSubplebbitAddress, plebbit, signers[0]);
        await publishWithExpectedResult(mockPost, false);
        });
    });

    it("Throws an error if unable to solve image captcha", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost(imageCaptchaSubplebbitAddress, plebbit, signers[0]);
            await mockPost.publish();
            mockPost.once("challengeverification", async (challengeVerificationMessage, newComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                resolve();
            });
        });
    });
});

it(`Sub responds to a challengeanswer with unrelated requestId`);
