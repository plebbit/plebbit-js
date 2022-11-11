const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const signers = require("../fixtures/signers");
const { generateMockPost } = require("../../dist/node/test/test-util");

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

let plebbit;
const mathCliSubplebbitAddress = signers[1].address;
const imageCaptchaSubplebbitAddress = signers[2].address;

describe("math-cli", async () => {
    before(async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
    });
    it("can post after answering correctly", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost(mathCliSubplebbitAddress, plebbit, signers[0]);
            mockPost.removeAllListeners();
            await mockPost.publish();
            mockPost.once("challenge", (challengeMessage) => {
                mockPost.publishChallengeAnswers(["2"]);
            });
            mockPost.once("challengeverification", async (challengeVerificationMessage, newComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                resolve();
            });
        });
    });
    it("Throws an error when user fails to solve mathcli captcha", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost(mathCliSubplebbitAddress, plebbit, signers[0]);
            mockPost.removeAllListeners();
            mockPost.once("challenge", (challengeMessage) => {
                mockPost.publishChallengeAnswers(["3"]);
            });
            await mockPost.publish();
            mockPost.once("challengeverification", (challengeVerificationMessage, newComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.false;
                resolve();
            });
        });
    });
});

describe("image captcha", async () => {
    before(async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
    });
    it("can post after answering correctly", async function () {
        return new Promise(async (resolve, reject) => {
            const mockPost = await generateMockPost(imageCaptchaSubplebbitAddress, plebbit, signers[0]);
            mockPost.removeAllListeners();

            mockPost.once("challenge", async (challengeMsg) => {
                expect(challengeMsg?.challenges[0]?.challenge).to.be.a("string");
                await mockPost.publishChallengeAnswers(["1234"]); // hardcode answer here
            });

            await mockPost.publish();
            mockPost.once("challengeverification", (challengeVerificationMessage, newComment) => {
                expect(challengeVerificationMessage.challengeSuccess).to.be.true;
                expect(challengeVerificationMessage.reason).to.be.undefined;
                resolve();
            });
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
