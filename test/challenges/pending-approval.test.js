import { expect } from "chai";
import {
    getChallengeVerification,
    getSubplebbitChallengeFromSubplebbitChallengeSettings
} from "../../dist/node/runtime/node/subplebbit/challenges/index.js";
import { Plebbit } from "./fixtures/fixtures.js";

const createSubplebbitWithChallenges = async (plebbitInstance, challengeSettings) => {
    const subplebbit = {
        settings: { challenges: challengeSettings },
        _plebbit: plebbitInstance
    };
    subplebbit.challenges = await Promise.all(
        challengeSettings.map((challenge) => getSubplebbitChallengeFromSubplebbitChallengeSettings(challenge))
    );
    return subplebbit;
};

describe("pending approval", () => {
    let plebbit;

    before(async () => {
        plebbit = await Plebbit();
    });

    const wrongAnswers = async (challenges) => challenges.map(() => "wrong");

    it("fails comments when pending-approval challenges are answered incorrectly", async () => {
        const challengeSettings = [
            {
                name: "question",
                options: { question: "Password?", answer: "password-1" },
                pendingApproval: true
            },
            {
                name: "question",
                options: { question: "Second password?", answer: "password-2" },
                pendingApproval: true
            }
        ];
        const subplebbit = await createSubplebbitWithChallenges(plebbit, challengeSettings);
        const challengeRequestMessage = { comment: { author: { address: "author-comment" } } };

        const verification = await getChallengeVerification(challengeRequestMessage, subplebbit, wrongAnswers);

        expect(verification.pendingApproval).to.equal(undefined);
        expect(verification.challengeSuccess).to.equal(false);
        expect(verification.challengeErrors[0]).to.equal("Wrong answer.");
        expect(verification.challengeErrors[1]).to.equal("Wrong answer.");
    });

    it("sends comments with correct challenge answers to pending approval", async () => {
        const challengeSettings = [
            {
                name: "question",
                options: { question: "Password?", answer: "password-1" },
                pendingApproval: true
            },
            {
                name: "question",
                options: { question: "Second password?", answer: "password-2" },
                pendingApproval: true
            }
        ];
        const subplebbit = await createSubplebbitWithChallenges(plebbit, challengeSettings);
        const challengeRequestMessage = { comment: { author: { address: "author-comment" } } };

        const answers = async () => ["password-1", "password-2"];
        const verification = await getChallengeVerification(challengeRequestMessage, subplebbit, answers);

        expect(verification.pendingApproval).to.equal(true);
        expect(verification.challengeSuccess).to.equal(true);
        expect(verification.challengeErrors).to.equal(undefined);
    });

    it("does not send non-comment publications to pending approval", async () => {
        const challengeSettings = [
            {
                name: "question",
                options: { question: "Password?", answer: "password" },
                pendingApproval: true
            }
        ];
        const subplebbit = await createSubplebbitWithChallenges(plebbit, challengeSettings);
        const challengeRequestMessage = { vote: { author: { address: "author-vote" } } };

        const correctAnswers = async () => ["password"];
        const verification = await getChallengeVerification(challengeRequestMessage, subplebbit, correctAnswers);

        expect(verification.pendingApproval).to.equal(undefined);
        expect(verification.challengeSuccess).to.equal(true);
        expect(verification.challengeErrors).to.equal(undefined);
    });

    it("requires every failing challenge to have pendingApproval enabled", async () => {
        const challengeSettings = [
            {
                name: "question",
                options: { question: "Password?", answer: "password-1" },
                pendingApproval: true
            },
            {
                name: "question",
                options: { question: "Second password?", answer: "password-2" }
            }
        ];
        const subplebbit = await createSubplebbitWithChallenges(plebbit, challengeSettings);
        const challengeRequestMessage = { comment: { author: { address: "author-comment" } } };

        const verification = await getChallengeVerification(challengeRequestMessage, subplebbit, wrongAnswers);

        expect(verification.pendingApproval).to.equal(undefined);
        expect(verification.challengeSuccess).to.equal(false);
        expect(verification.challengeErrors[0]).to.equal("Wrong answer.");
        expect(verification.challengeErrors[1]).to.equal("Wrong answer.");
    });

    it("fails mixed success/failure comments even when challenges require pending approval", async () => {
        const challengeSettings = [
            {
                name: "question",
                options: { question: "First?", answer: "first" },
                pendingApproval: true
            },
            {
                name: "question",
                options: { question: "Second?", answer: "second" },
                pendingApproval: true
            },
            {
                name: "question",
                options: { question: "Third?", answer: "third" },
                pendingApproval: true
            }
        ];
        const subplebbit = await createSubplebbitWithChallenges(plebbit, challengeSettings);
        const challengeRequestMessage = { comment: { author: { address: "author-comment" } } };

        const answers = async () => ["first", "wrong", "wrong"];
        const verification = await getChallengeVerification(challengeRequestMessage, subplebbit, answers);

        expect(verification.pendingApproval).to.equal(undefined);
        expect(verification.challengeSuccess).to.equal(false);
        expect(verification.challengeErrors[1]).to.equal("Wrong answer.");
        expect(verification.challengeErrors[2]).to.equal("Wrong answer.");
    });

    it("ignores excluded failing challenges when determining pending approval", async () => {
        const challengeSettings = [
            {
                name: "question",
                options: { question: "First?", answer: "first" }
            },
            {
                name: "question",
                options: { question: "Second?", answer: "second" },
                pendingApproval: true,
                exclude: [{ challenges: [0] }]
            }
        ];
        const subplebbit = await createSubplebbitWithChallenges(plebbit, challengeSettings);
        const challengeRequestMessage = { comment: { author: { address: "author-comment" } } };

        const answers = async () => ["first", "wrong"];
        const verification = await getChallengeVerification(challengeRequestMessage, subplebbit, answers);

        expect(verification.pendingApproval).to.equal(undefined);
        expect(verification.challengeSuccess).to.equal(true);
        expect(verification.challengeErrors).to.equal(undefined);
    });

    it("does not send excluded pending-approval challenges to pending approval", async () => {
        const challengeSettings = [
            {
                name: "question",
                options: { question: "Password?", answer: "password" },
                pendingApproval: true,
                exclude: [{ address: ["author-comment"] }]
            }
        ];
        const subplebbit = await createSubplebbitWithChallenges(plebbit, challengeSettings);
        const challengeRequestMessage = { comment: { author: { address: "author-comment" } } };

        const verification = await getChallengeVerification(challengeRequestMessage, subplebbit, wrongAnswers);

        expect(verification.pendingApproval).to.equal(undefined);
        expect(verification.challengeSuccess).to.equal(true);
        expect(verification.challengeErrors).to.equal(undefined);
    });

    it("keeps failing rate-limited authors that answer pending-approval challenges incorrectly", async () => {
        const challengeSettings = [
            {
                name: "question",
                options: { question: "Rate limited?", answer: "yes" },
                pendingApproval: true,
                exclude: [{ rateLimit: 0, rateLimitChallengeSuccess: false }]
            }
        ];
        const subplebbit = await createSubplebbitWithChallenges(plebbit, challengeSettings);
        const challengeRequestMessage = { comment: { author: { address: "rate-limited-author" } } };

        const wrongAnswer = async () => ["wrong"];
        const first = await getChallengeVerification(challengeRequestMessage, subplebbit, wrongAnswer);
        const second = await getChallengeVerification(challengeRequestMessage, subplebbit, wrongAnswer);

        for (const verification of [first, second]) {
            expect(verification.pendingApproval).to.equal(undefined);
            expect(verification.challengeSuccess).to.equal(false);
            expect(verification.challengeErrors[0]).to.equal("Wrong answer.");
        }
    });

    it("respects pending approval for pre-answered submissions", async () => {
        const challengeSettings = [
            {
                name: "question",
                options: { question: "Password?", answer: "secret" },
                pendingApproval: true
            }
        ];
        const subplebbit = await createSubplebbitWithChallenges(plebbit, challengeSettings);

        const wrongRequest = {
            comment: { author: { address: "author-comment" } },
            challengeAnswers: ["wrong"]
        };
        const wrongVerification = await getChallengeVerification(wrongRequest, subplebbit, async () => ["wrong"]);
        expect(wrongVerification.pendingApproval).to.equal(undefined);
        expect(wrongVerification.challengeSuccess).to.equal(false);
        expect(wrongVerification.challengeErrors[0]).to.equal("Wrong answer.");

        const correctRequest = {
            comment: { author: { address: "author-comment" } },
            challengeAnswers: ["secret"]
        };
        const correctVerification = await getChallengeVerification(correctRequest, subplebbit, async () => ["secret"]);
        expect(correctVerification.pendingApproval).to.equal(true);
        expect(correctVerification.challengeSuccess).to.equal(true);
        expect(correctVerification.challengeErrors).to.equal(undefined);
    });
});
