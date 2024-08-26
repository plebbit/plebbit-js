import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    mockRemotePlebbitIpfsOnly,
    generatePostToAnswerMathQuestion,
    publishRandomPost,
    describeSkipIfRpc,
    resolveWhenConditionIsTrue,
    itSkipIfRpc
} from "../../../../dist/node/test/test-util";
import { stringify as deterministicStringify } from "safe-stable-stringify";

import signers from "../../../fixtures/signers";
import Sinon from "sinon";
import * as util from "../../../../dist/node/constants";
import chai from "chai";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import chaiAsPromised from "chai-as-promised";
import * as chains from "viem/chains"; // This will increase bundle size, should only import needed chains
import { v4 as uuidV4 } from "uuid";

import { createPublicClient, http } from "viem";
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
        await publishRandomPost(subplebbit.address, plebbit, {}, false); // won't get a challenge

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
        await publishRandomPost(subplebbit.address, plebbit, {}, false); // won't get a challenge
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

        const mockPost = await generateMockPost(subplebbit.address, plebbit, false, { challengeAnswers: ["2"] });

        expect(mockPost.challengeAnswers).to.deep.equal(["2"]);

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
