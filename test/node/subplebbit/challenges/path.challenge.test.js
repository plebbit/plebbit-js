import { expect } from "chai";
import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    resolveWhenConditionIsTrue,
    describeSkipIfRpc
} from "../../../../dist/node/test/test-util.js";
import path from "path";

describeSkipIfRpc(`subplebbit.settings.challenges with path`, async () => {
    let plebbit, remotePlebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    });

    after(async () => {
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it(`Can use a challenge via path instead of name`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});

        // Use the built question challenge via path instead of name
        const questionChallengePath = path.resolve(
            process.cwd(),
            "dist/node/runtime/node/subplebbit/challenges/plebbit-js-challenges/question.js"
        );
        const challenges = [
            {
                path: questionChallengePath,
                options: { question: "What is 2+2?", answer: "4" }
            }
        ];

        await subplebbit.edit({ settings: { challenges } });
        expect(subplebbit._usingDefaultChallenge).to.be.false;
        expect(subplebbit?.settings?.challenges).to.deep.equal(challenges);

        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");

        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);

        expect(subplebbit.updatedAt).to.equal(remoteSub.updatedAt);
        for (const _subplebbit of [subplebbit, remoteSub]) {
            expect(_subplebbit.challenges[0].challenge).to.equal("What is 2+2?");
            expect(_subplebbit.challenges[0].description).to.equal("Ask a question, like 'What is the password?'");
            expect(_subplebbit.challenges[0].exclude).to.be.undefined;
            expect(_subplebbit.challenges[0].type).to.equal("text/plain");
        }

        // Test with correct answer
        const mockPost = await generateMockPost(subplebbit.address, plebbit, false, {
            challengeRequest: { challengeAnswers: ["4"] }
        });

        expect(mockPost.challengeRequest.challengeAnswers).to.deep.equal(["4"]);

        let receivedChallenge = false;
        mockPost.once("challenge", (msg) => {
            receivedChallenge = true;
        });

        await publishWithExpectedResult(mockPost, true);
        expect(receivedChallenge).to.be.false; // Should not receive challenge since answer is correct

        await subplebbit.delete();
    });

    it(`Challenge via path sends challenge when answer is wrong`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});

        const questionChallengePath = path.resolve(
            process.cwd(),
            "dist/node/runtime/node/subplebbit/challenges/plebbit-js-challenges/question.js"
        );
        const challenges = [
            {
                path: questionChallengePath,
                options: { question: "What is the capital of France?", answer: "Paris" }
            }
        ];

        await subplebbit.edit({ settings: { challenges } });
        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");

        // Test with wrong answer
        const mockPost = await generateMockPost(subplebbit.address, plebbit, false);
        mockPost.removeAllListeners("challenge");

        let challengeReceived = false;
        let challengeData = null;
        mockPost.once("challenge", async (msg) => {
            challengeReceived = true;
            challengeData = msg;
            await mockPost.publishChallengeAnswers(["London"]);
        });

        await publishWithExpectedResult(mockPost, false); // Should fail due to wrong answer
        expect(challengeReceived).to.be.true; // Should receive challenge since answer was provided but wrong

        expect(challengeData.challenges[0].challenge).to.equal("What is the capital of France?");
        expect(challengeData.challenges[0].type).to.equal("text/plain");

        await subplebbit.delete();
    });

    it(`Can use multiple challenges with mix of path and name`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});

        const questionChallengePath = path.resolve(
            process.cwd(),
            "dist/node/runtime/node/subplebbit/challenges/plebbit-js-challenges/question.js"
        );
        const challenges = [
            {
                path: questionChallengePath,
                options: { question: "What is 3+3?", answer: "6" }
            },
            {
                name: "question",
                options: { question: "What is 4+4?", answer: "8" }
            }
        ];

        await subplebbit.edit({ settings: { challenges } });
        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");

        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);

        for (const _subplebbit of [subplebbit, remoteSub]) {
            expect(_subplebbit.challenges).to.have.length(2);
            expect(_subplebbit.challenges[0].challenge).to.equal("What is 3+3?");
            expect(_subplebbit.challenges[1].challenge).to.equal("What is 4+4?");
        }

        // Test with correct answers for both challenges
        const mockPost = await generateMockPost(subplebbit.address, plebbit, false, {
            challengeRequest: { challengeAnswers: ["6", "8"] }
        });

        let receivedChallenge = false;
        mockPost.once("challenge", (msg) => {
            receivedChallenge = true;
        });

        await publishWithExpectedResult(mockPost, true);
        expect(receivedChallenge).to.be.false;

        await subplebbit.delete();
    });

    it(`Throws error for invalid challenge path when we try to edit subplebbit`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});

        const invalidPath = "/path/to/nonexistent/challenge.js";
        const challenges = [
            {
                path: invalidPath,
                options: { question: "What is 2+2?", answer: "4" }
            }
        ];

        try {
            await subplebbit.edit({ settings: { challenges } });
            expect.fail("Should have thrown an error for invalid path");
        } catch (error) {
            expect(error.code).to.include("ERR_MODULE_NOT_FOUND");
        }

        await subplebbit.delete();
    });
});
