import { expect } from "chai";
import {
    mockPlebbit,
    generateMockPost,
    publishWithExpectedResult,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    publishRandomPost,
    resolveWhenConditionIsTrue,
    itSkipIfRpc,
    waitTillPostInSubplebbitPages
} from "../../../../dist/node/test/test-util.js";
import { describe } from "vitest";

describe.concurrent(`subplebbit.settings.challenges`, async () => {
    let plebbit, remotePlebbit;
    const defaultMatches = JSON.stringify([{ propertyName: "author.address", regexp: "\\.(sol|eth)$" }]);
    const defaultSettingsChallenges = [
        {
            name: "publication-match",
            options: {
                matches: defaultMatches,
                error: "Posting in this community requires a username (author address) that ends with .eth or .sol. Go to the settings to set your username."
            },
            exclude: [
                { role: ["moderator", "admin", "owner"] },
                {
                    firstCommentTimestamp: 60 * 60 * 24 * 30,
                    postScore: 3,
                    rateLimit: 2,
                    replyScore: 0
                },
                { challenges: [1] },
                { challenges: [2] }
            ]
        },
        {
            name: "whitelist",
            options: {
                urls: "https://raw.githubusercontent.com/plebbit/lists/refs/heads/master/whitelist-challenge.json",
                error: "Or posting in this community requires being whitelisted. Go to https://t.me/plebbit and ask to be whitelisted. Or"
            },
            exclude: [{ challenges: [0] }, { challenges: [2] }]
        },
        {
            name: "mintpass",
            options: {
                contractAddress: "0xcb60e1dd6944dfc94920e28a277a51a06e9f20d2",
                chainTicker: "eth",
                rpcUrl: "https://sepolia.base.org"
            },
            exclude: [{ challenges: [0] }, { challenges: [1] }]
        }
    ];
    const defaultChallengeDescriptions = [
        "Match publication properties against regex patterns.",
        "Whitelist author addresses.",
        "Verify that the author owns a MintPass NFT of the required type, with transfer cooldown protection."
    ];
    const defaultChallengeTypes = ["text/plain", "text/plain", "url/iframe"];
    const defaultMintpassChallengeUrl = "https://mintpass.org/request/{authorAddress}?hide-nft=true&hide-address=true";
    const mintpassMissingWalletError = "Author wallet address is not defined. Please set your wallet address in settings.";

    before(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    });

    after(async () => {
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it(`default challenges are configured on new subplebbit`, async () => {
        // Should be set to default on subplebbit.start()
        const subplebbit = await plebbit.createSubplebbit({});
        // subplebbit?.settings?.challenges should be set to defaultSettingsChallenges
        // also subplebbit.challenges should reflect subplebbit.settings.challenges
        expect(subplebbit?.settings?.challenges).to.deep.equal(defaultSettingsChallenges);

        expect(subplebbit._usingDefaultChallenge).to.be.true;

        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });
        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);
        for (const _subplebbit of [subplebbit, remoteSub]) {
            expect(_subplebbit.challenges.length).to.equal(defaultSettingsChallenges.length);
            _subplebbit.challenges.forEach((challenge, index) => {
                expect(challenge.type).to.equal(defaultChallengeTypes[index]);
                expect(challenge.description).to.equal(defaultChallengeDescriptions[index]);
                expect(challenge.exclude).to.deep.equal(defaultSettingsChallenges[index].exclude);
            });
            expect(_subplebbit.challenges[0].challenge).to.be.undefined;
            expect(_subplebbit.challenges[1].challenge).to.be.undefined;
            expect(_subplebbit.challenges[2].challenge).to.equal(defaultMintpassChallengeUrl);
        }
        // clean up
        await subplebbit.delete();
    });

    it(`Default challenges reject authors without an allowed address`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });

        const challengeVerificationPromise = new Promise((resolve) => subplebbit.once("challengeverification", resolve));
        const post = await generateMockPost(subplebbit.address, remotePlebbit);
        await publishWithExpectedResult(post, false);
        const challengeVerification = await challengeVerificationPromise;
        expect(challengeVerification.challengeSuccess).to.equal(false);
        expect(challengeVerification.challengeErrors).to.not.equal(undefined);
        expect(Object.keys(challengeVerification.challengeErrors)).to.have.members(["0", "1", "2"]);
        expect(challengeVerification.challengeErrors?.["0"]).to.equal(defaultSettingsChallenges[0].options.error);
        expect(challengeVerification.challengeErrors?.["1"]).to.equal(defaultSettingsChallenges[1].options.error);
        expect(challengeVerification.challengeErrors?.["2"]).to.equal(mintpassMissingWalletError);
        await subplebbit.delete();
    });

    it(`settings.challenges=[] means sub won't send a challenge`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        await subplebbit.edit({ settings: { challenges: [] } });
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });
        const post = await publishRandomPost(subplebbit.address, plebbit); // won't get a challenge
        await waitTillPostInSubplebbitPages(post, plebbit);

        await subplebbit.delete();
    });

    itSkipIfRpc(`plebbit-js will upgrade default challenge if there is a new one`, async () => {
        const subplebbit = await plebbit.createSubplebbit({});
        expect(subplebbit?.settings?.challenges).to.deep.equal(defaultSettingsChallenges);
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
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });

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
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });
        expect(subplebbit.settings.challenges).to.deep.equal([]);
        const remoteSub = await remotePlebbit.getSubplebbit(subplebbit.address);
        for (const _subplebbit of [subplebbit, remoteSub]) expect(_subplebbit.challenges).to.deep.equal([]);

        await subplebbit.delete();
    });
});
