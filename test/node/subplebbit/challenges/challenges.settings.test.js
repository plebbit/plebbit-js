import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    mockRemotePlebbitIpfsOnly,
    publishRandomPost,
    resolveWhenConditionIsTrue,
    itSkipIfRpc,
    waitTillPostInSubplebbitPages
} from "../../../../dist/node/test/test-util";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

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
        expect(subplebbit?.settings?.challenges).to.deep.equal([
            { name: "captcha-canvas-v3", exclude: [{ role: ["moderator", "admin", "owner"], post: false, reply: false, vote: false }] }
        ]);

        expect(subplebbit._usingDefaultChallenge).to.be.true;

        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);
        for (const _subplebbit of [subplebbit, remoteSub]) {
            expect(_subplebbit.challenges[0].type).to.equal("image/png");
            expect(_subplebbit.challenges[0].challenge).to.be.undefined;
            expect(_subplebbit.challenges[0].description).to.equal("make custom image captcha");
            expect(_subplebbit.challenges[0].exclude).to.deep.equal([
                { role: ["moderator", "admin", "owner"], post: false, reply: false, vote: false }
            ]);
        }
        // clean up
        await subplebbit.delete();
    });

    it(`settings.challenges=[] means sub won't send a challenge`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        await subplebbit.edit({ settings: { challenges: [] } });
        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
        const post = await publishRandomPost(subplebbit.address, plebbit); // won't get a challenge
        await waitTillPostInSubplebbitPages(post, plebbit);

        await subplebbit.delete();
    });

    itSkipIfRpc(`plebbit-js will upgrade default challenge if there is a new one`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        expect(subplebbit.settings.challenges).to.deep.equal([
            { name: "captcha-canvas-v3", exclude: [{ role: ["moderator", "admin", "owner"], post: false, reply: false, vote: false }] }
        ]);
        expect(subplebbit._usingDefaultChallenge).to.be.true;
        const differentDefaultChallenges = [];
        subplebbit._defaultSubplebbitChallenges = differentDefaultChallenges;
        await subplebbit.start(); // Should check value of default challenge, and upgrade to this one above
        await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(subplebbit.settings.challenges).to.deep.equal([]);
        expect(subplebbit.challenges).to.deep.equal([]);
        expect(subplebbit._usingDefaultChallenge).to.be.true;
        const post = await publishRandomPost(subplebbit.address, plebbit); // won't get a challenge
        await waitTillPostInSubplebbitPages(post, plebbit);
        await subplebbit.delete();
    });

    it(`Can set a basic question challenge system`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        const challenges = [{ name: "question", options: { question: "1+1=?", answer: "2" } }];
        await subplebbit.edit({ settings: { challenges } });
        expect(subplebbit._usingDefaultChallenge).to.be.false;

        expect(subplebbit?.settings?.challenges).to.deep.equal(challenges);

        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");

        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);

        expect(subplebbit.updatedAt).to.equal(remoteSub.updatedAt);
        for (const _subplebbit of [subplebbit, remoteSub]) {
            expect(_subplebbit.challenges[0].challenge).to.equal("1+1=?");
            expect(_subplebbit.challenges[0].description).to.equal("Ask a question, like 'What is the password?'");
            expect(_subplebbit.challenges[0].exclude).to.be.undefined;
            expect(_subplebbit.challenges[0].type).to.equal("text/plain");
        }

        const mockPost = await generateMockPost(subplebbit.address, plebbit, false, { challengeRequest: { challengeAnswers: ["2"] } });

        expect(mockPost.challengeRequest.challengeAnswers).to.deep.equal(["2"]);

        let receivedChallenge = false;
        mockPost.once("challenge", (msg) => {
            receivedChallenge = true;
        });

        await publishWithExpectedResult(mockPost, true);

        expect(receivedChallenge).to.be.false;

        await subplebbit.delete();
    });

    it(`subplebbit.settings.challenges isn't overridden with subplebbit.start() if it was edited before starting the sub`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        await subplebbit.edit({ settings: { challenges: [] } });
        expect(subplebbit.settings.challenges).to.deep.equal([]);
        expect(subplebbit._usingDefaultChallenge).to.be.false;
        expect(subplebbit.challenges).to.deep.equal([]);
        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
        expect(subplebbit.settings.challenges).to.deep.equal([]);
        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);
        for (const _subplebbit of [subplebbit, remoteSub]) expect(_subplebbit.challenges).to.deep.equal([]);

        await subplebbit.delete();
    });
});
