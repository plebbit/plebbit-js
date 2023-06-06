const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const signers = require("../fixtures/signers");
const { generateMockPost, publishWithExpectedResult, publishRandomPost } = require("../../dist/node/test/test-util");
const { mockPlebbit } = require("../../dist/node/test/test-util");

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
        plebbit = await mockPlebbit({ pubsubHttpClientsOptions: [`http://localhost:15002/api/v0`] }); // Singular pubsub provider to avoid multiple challenge request/answers collision
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
