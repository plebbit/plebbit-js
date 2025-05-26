import { expect } from "chai";
import signers from "../../fixtures/signers.js";
import {
    generateMockPost,
    publishWithExpectedResult,
    publishRandomPost,
    generatePostToAnswerMathQuestion,
    mockRemotePlebbit,
    getRemotePlebbitConfigs,
    mockPlebbitV2
} from "../../../dist/node/test/test-util.js";

const mathCliSubplebbitAddress = signers[1].address;

describe.skip(`Stress test challenge exchange`, async () => {
    const num = 50;
    let plebbit, subplebbit;

    before(async () => {
        plebbit = await mockRemotePlebbit();
        subplebbit = await plebbit.getSubplebbit(signers[0].address);
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`Initiate ${num} challenge exchange in parallel`, async () => {
        const promises = new Array(num).fill(null).map(() => publishRandomPost(subplebbit.address, plebbit, {}));
        await Promise.all(promises);
    });
});

getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-kubo-rpc"] }).map((config) => {
    describe(`math-cli - ${config.name}`, async () => {
        let plebbit;

        before(async () => {
            plebbit = await mockPlebbitV2({
                // Singular pubsub provider to avoid multiple challenge request/answers collision
                plebbitOptions: { pubsubKuboRpcClientsOptions: [`http://localhost:15002/api/v0`] },
                forceMockPubsub: true,
                remotePlebbit: true
            });
        });

        after(async () => {
            await plebbit.destroy();
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
            let challengeverification;
            mockPost.once("challengeverification", (msg) => {
                challengeverification = msg;
            });
            await publishWithExpectedResult(mockPost, false);
            expect(challengeverification.challengeErrors).to.deep.equal({ 0: "Wrong answer." });
            expect(challengeverification.challengeSuccess).to.be.false;
        });
    });
});
