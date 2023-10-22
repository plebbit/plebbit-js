const Plebbit = require("../../../dist/node");
const { mockPlebbit, generateMockComment, generateMockPost, publishWithExpectedResult } = require("../../../dist/node/test/test-util");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe(`subplebbit.settings.challenges`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });

    it(`default challenge is captcha-canvas-v3`, async () => {
        // Should be set to default on subplebbit.start()
        const subplebbit = await plebbit.createSubplebbit({});
        expect(subplebbit?.settings?.challenges).to.be.undefined;
        expect(subplebbit.challenges).to.be.undefined;

        await subplebbit.start();
        // subplebbit?.settings?.challenges should be set to captcha-canvas-v3
        // also subplebbit.challenges should reflect subplebbit.settings.challenges
        await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(subplebbit?.settings.challenges).to.deep.equal([{ name: "captcha-canvas-v3" }]);
        expect(subplebbit.challenges[0].type).to.equal("image/png");
        expect(subplebbit.challenges[0].challenge).to.be.undefined;
        expect(subplebbit.challenges[0].description).to.equal("make custom image captcha");
        expect(subplebbit.challenges[0].exclude).to.be.undefined;

        await subplebbit.delete();
    });

    it(`settings.challenges as null or undefined is parsed as []`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        expect(subplebbit?.settings?.challenges).to.be.undefined;
        expect(subplebbit.challenges).to.be.undefined;

        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(subplebbit?.settings?.challenges).to.not.be.undefined; // Should default to captcha

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
        expect(subplebbit.challenges[0].challenge).to.equal("1+1=?");
        expect(subplebbit.challenges[0].description).to.equal("Ask a question, like 'What is the password?'");
        expect(subplebbit.challenges[0].exclude).to.be.undefined;
        expect(subplebbit.challenges[0].type).to.equal("text/plain");

        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
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
        expect(subplebbit.settings.challenges).to.deep.equal([]);
        expect(subplebbit.challenges).to.deep.equal([]);
        await subplebbit.delete();
    });
});
