import { expect } from "chai";
import {
    plebbitJsChallenges,
    getPendingChallengesOrChallengeVerification
} from "../../dist/node/runtime/node/subplebbit/challenges/index.js";
import * as remeda from "remeda";
import * as fs from "node:fs";
import * as path from "node:path";
import { tmpdir } from "node:os";

describe.skip("voucher challenge", () => {
    let tempDir;

    beforeEach(() => {
        tempDir = path.join(tmpdir(), "plebbit-test-" + Math.random().toString(36));
    });

    afterEach(async () => {
        if (tempDir && fs.existsSync(tempDir)) {
            await fs.promises.rm(tempDir, { recursive: true });
        }
    });

    // Create a standard challenge request message fixture to reuse
    const createChallengeRequestMessage = (overrides = {}) => {
        const defaultPublication = {
            author: {
                address: "12D3test123"
            },
            content: "test content",
            timestamp: 1234567890,
            subplebbitAddress: "subplebbitAddress"
        };

        return {
            comment: {
                ...defaultPublication,
                ...(overrides.publication || {})
            },
            ...(remeda.omit(overrides, ["publication"]) || {})
        };
    };

    // Create a standard subplebbit fixture with voucher challenge
    const createSubplebbit = (options = {}) => {
        const defaultOptions = {
            question: "What is your voucher code?",
            vouchers: "VOUCHER1,VOUCHER2,VOUCHER3"
        };

        return {
            address: "test-subplebbit-address",
            _plebbit: {
                getComment: () => {},
                dataPath: tempDir
            },
            settings: {
                challenges: [
                    {
                        name: "voucher",
                        options: {
                            ...defaultOptions,
                            ...options
                        }
                    }
                ]
            }
        };
    };

    describe("basic functionality", () => {
        it("voucher challenge exists", () => {
            expect(plebbitJsChallenges.voucher).to.be.a("function");
        });

        it("creates voucher challenge with default options", () => {
            const voucherFactory = plebbitJsChallenges.voucher;
            const challenge = voucherFactory({});
            expect(challenge.getChallenge).to.be.a("function");
            expect(challenge.optionInputs).to.be.an("array");
            expect(challenge.type).to.equal("text/plain");
        });

        it("has correct option inputs", () => {
            const voucherFactory = plebbitJsChallenges.voucher;
            const challenge = voucherFactory({});
            const optionNames = challenge.optionInputs.map((opt) => opt.option);
            expect(optionNames).to.include("question");
            expect(optionNames).to.include("vouchers");
            expect(optionNames).to.include("description");
            expect(optionNames).to.include("invalidVoucherError");
            expect(optionNames).to.include("alreadyRedeemedError");
        });
    });

    describe("challenge verification", () => {
        it("accepts valid voucher codes", async () => {
            const subplebbit = createSubplebbit();
            const challengeRequestMessage = createChallengeRequestMessage();

            const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);

            expect(result.pendingChallenges).to.have.length(1);
            const challenge = result.pendingChallenges[0];

            const verification = await challenge.verify("VOUCHER1");
            expect(verification.success).to.be.true;
        });

        it("rejects invalid voucher codes", async () => {
            const subplebbit = createSubplebbit();
            const challengeRequestMessage = createChallengeRequestMessage();

            const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);

            const challenge = result.pendingChallenges[0];
            const verification = await challenge.verify("INVALID_VOUCHER");

            expect(verification.success).to.be.false;
            expect(verification.error).to.equal("Invalid voucher code.");
        });

        it("allows same author to reuse their voucher", async () => {
            const subplebbit = createSubplebbit();
            const challengeRequestMessage = createChallengeRequestMessage();

            const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);

            const challenge = result.pendingChallenges[0];

            // First use
            const verification1 = await challenge.verify("VOUCHER1");
            expect(verification1.success).to.be.true;

            // Second use by same author
            const verification2 = await challenge.verify("VOUCHER1");
            expect(verification2.success).to.be.true;
        });

        it("rejects voucher already redeemed by different author", async () => {
            const subplebbit = createSubplebbit();

            // First author redeems voucher
            const challengeRequestMessage1 = createChallengeRequestMessage({
                publication: { author: { address: "author1" } }
            });

            const result1 = await getPendingChallengesOrChallengeVerification(challengeRequestMessage1, subplebbit);

            const challenge1 = result1.pendingChallenges[0];
            const verification1 = await challenge1.verify("VOUCHER1");
            expect(verification1.success).to.be.true;

            // Second author tries to use same voucher
            const challengeRequestMessage2 = createChallengeRequestMessage({
                publication: { author: { address: "author2" } }
            });

            const result2 = await getPendingChallengesOrChallengeVerification(challengeRequestMessage2, subplebbit);

            const challenge2 = result2.pendingChallenges[0];
            const verification2 = await challenge2.verify("VOUCHER1");

            expect(verification2.success).to.be.false;
            expect(verification2.error).to.equal("This voucher has already been redeemed by another author.");
        });

        it("handles pre-answered challenges correctly", async () => {
            const subplebbit = createSubplebbit();
            const challengeRequestMessage = createChallengeRequestMessage({
                challengeAnswers: ["VOUCHER1"]
            });

            const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);

            expect(result.challengeSuccess).to.be.true;
        });

        it("rejects pre-answered challenges with invalid voucher", async () => {
            const subplebbit = createSubplebbit();
            const challengeRequestMessage = createChallengeRequestMessage({
                challengeAnswers: ["INVALID_VOUCHER"]
            });

            const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);

            expect(result.challengeSuccess).to.be.false;
            expect(result.challengeErrors).to.be.an("object");
            expect(result.challengeErrors[0]).to.equal("Invalid voucher code.");
        });
    });

    describe("custom error messages", () => {
        it("uses custom invalid voucher error message", async () => {
            const subplebbit = createSubplebbit({
                invalidVoucherError: "Custom invalid code message"
            });
            const challengeRequestMessage = createChallengeRequestMessage();

            const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);

            const challenge = result.pendingChallenges[0];
            const verification = await challenge.verify("INVALID_VOUCHER");

            expect(verification.success).to.be.false;
            expect(verification.error).to.equal("Custom invalid code message");
        });

        it("uses custom already redeemed error message", async () => {
            const subplebbit = createSubplebbit({
                alreadyRedeemedError: "Custom already used message"
            });

            // First author redeems voucher
            const challengeRequestMessage1 = createChallengeRequestMessage({
                publication: { author: { address: "author1" } }
            });

            const result1 = await getPendingChallengesOrChallengeVerification(challengeRequestMessage1, subplebbit);

            await result1.pendingChallenges[0].verify("VOUCHER1");

            // Second author tries same voucher
            const challengeRequestMessage2 = createChallengeRequestMessage({
                publication: { author: { address: "author2" } }
            });

            const result2 = await getPendingChallengesOrChallengeVerification(challengeRequestMessage2, subplebbit);

            const verification = await result2.pendingChallenges[0].verify("VOUCHER1");

            expect(verification.success).to.be.false;
            expect(verification.error).to.equal("Custom already used message");
        });
    });

    describe("file persistence", () => {
        it("persists voucher redemptions to file", async () => {
            const subplebbit = createSubplebbit();
            const challengeRequestMessage = createChallengeRequestMessage();

            const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);

            const challenge = result.pendingChallenges[0];
            await challenge.verify("VOUCHER1");

            // Check that state file was created
            const stateFilePath = path.join(
                tempDir,
                "subplebbits",
                `${subplebbit.address}-challenge-data`,
                "voucher_redemption_states.json"
            );

            expect(fs.existsSync(stateFilePath)).to.be.true;

            const stateData = JSON.parse(fs.readFileSync(stateFilePath, "utf8"));
            expect(stateData).to.have.property("VOUCHER1");
            expect(stateData.VOUCHER1).to.equal("12D3test123");
        });

        it("loads existing redemption state from file", async () => {
            const subplebbit = createSubplebbit();

            // Create state file manually
            const stateDir = path.join(tempDir, "subplebbits", `${subplebbit.address}-challenge-data`);
            const stateFilePath = path.join(stateDir, "voucher_redemption_states.json");

            await fs.promises.mkdir(stateDir, { recursive: true });
            await fs.promises.writeFile(
                stateFilePath,
                JSON.stringify({
                    VOUCHER1: "existing_author"
                })
            );

            // Try to use already redeemed voucher
            const challengeRequestMessage = createChallengeRequestMessage({
                publication: { author: { address: "different_author" } }
            });

            const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);

            const verification = await result.pendingChallenges[0].verify("VOUCHER1");

            expect(verification.success).to.be.false;
            expect(verification.error).to.equal("This voucher has already been redeemed by another author.");
        });
    });

    describe("edge cases", () => {
        it("throws error when no vouchers configured", async () => {
            const subplebbit = createSubplebbit({ vouchers: "" });
            const challengeRequestMessage = createChallengeRequestMessage();

            try {
                await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
                expect.fail("Should have thrown an error");
            } catch (error) {
                // The error gets wrapped by the challenge system
                expect(error.message).to.include("invalid getChallenge response");
            }
        });

        it("handles whitespace in voucher list", async () => {
            const subplebbit = createSubplebbit({
                vouchers: " VOUCHER1 , VOUCHER2 , VOUCHER3 "
            });
            const challengeRequestMessage = createChallengeRequestMessage();

            const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);

            const verification = await result.pendingChallenges[0].verify("VOUCHER2");
            expect(verification.success).to.be.true;
        });

        it("filters out empty voucher codes", async () => {
            const subplebbit = createSubplebbit({
                vouchers: "VOUCHER1,,VOUCHER2,"
            });
            const challengeRequestMessage = createChallengeRequestMessage();

            const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);

            const verification1 = await result.pendingChallenges[0].verify("VOUCHER1");
            expect(verification1.success).to.be.true;

            const verification2 = await result.pendingChallenges[0].verify("VOUCHER2");
            expect(verification2.success).to.be.true;
        });
    });
});
