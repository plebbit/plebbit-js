import { expect } from "chai";
import {
    plebbitJsChallenges,
    getSubplebbitChallengeFromSubplebbitChallengeSettings,
    getPendingChallengesOrChallengeVerification
} from "../../dist/node/runtime/node/subplebbit/challenges/index.js";
import * as remeda from "remeda";

describe("publication-match challenge", () => {
    // Create a standard challenge request message fixture to reuse
    const createChallengeRequestMessage = (overrides = {}) => {
        const defaultPublication = {
            author: {
                address: "author.eth"
            },
            content: "content",
            timestamp: 1234567890,
            title: "title",
            link: "link",
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

    // Create a standard subplebbit fixture with publication-match challenge
    const createSubplebbit = (options = {}) => {
        const defaultOptions = {
            matches: JSON.stringify([{ propertyName: "author.address", regexp: "\\.eth$" }]),
            error: "Publication author.address must end with .eth",
            matchAll: "true"
        };

        return {
            _plebbit: { getComment: () => {} },
            settings: {
                challenges: [
                    {
                        name: "publication-match",
                        options: {
                            ...defaultOptions,
                            ...options
                        }
                    }
                ]
            }
        };
    };

    // Test that the challenge is properly registered
    it("publication-match challenge is registered", () => {
        expect(plebbitJsChallenges["publication-match"]).to.be.a("function");
    });

    // Test the challenge settings conversion
    it("getSubplebbitChallengeFromSubplebbitChallengeSettings with publication-match", () => {
        const subplebbitChallengeSettings = {
            name: "publication-match",
            options: {
                matches: JSON.stringify([
                    { propertyName: "author.address", regexp: "\\.eth$" },
                    { propertyName: "content", regexp: "badword" }
                ]),
                error: "Custom error message",
                matchAll: "true"
            }
        };
        const subplebbitChallenge = getSubplebbitChallengeFromSubplebbitChallengeSettings(subplebbitChallengeSettings);
        expect(subplebbitChallenge.type).to.equal("text/plain");
        expect(subplebbitChallenge.description).to.equal("Match publication properties against regex patterns.");
    });

    // Test custom description option
    it("getSubplebbitChallengeFromSubplebbitChallengeSettings with custom description", () => {
        const subplebbitChallengeSettings = {
            name: "publication-match",
            options: {
                matches: JSON.stringify([{ propertyName: "author.address", regexp: "\\.eth$" }]),
                description: "Authors must have .eth addresses"
            }
        };
        const subplebbitChallenge = getSubplebbitChallengeFromSubplebbitChallengeSettings(subplebbitChallengeSettings);
        expect(subplebbitChallenge.type).to.equal("text/plain");
        expect(subplebbitChallenge.description).to.equal("Authors must have .eth addresses");
    });

    // Test default description when no custom description provided
    it("getSubplebbitChallengeFromSubplebbitChallengeSettings uses default description when none provided", () => {
        const subplebbitChallengeSettings = {
            name: "publication-match",
            options: {
                matches: JSON.stringify([{ propertyName: "author.address", regexp: "\\.eth$" }])
            }
        };
        const subplebbitChallenge = getSubplebbitChallengeFromSubplebbitChallengeSettings(subplebbitChallengeSettings);
        expect(subplebbitChallenge.type).to.equal("text/plain");
        expect(subplebbitChallenge.description).to.equal("Match publication properties against regex patterns.");
    });

    // Test with matching author address (.eth)
    it("publication-match challenge with matching author address .eth", async () => {
        const subplebbit = createSubplebbit();
        const challengeRequestMessage = createChallengeRequestMessage();

        const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
        expect(result.challengeSuccess).to.be.true;
    });

    // Test with non-matching author address
    it("publication-match challenge with non-matching author address", async () => {
        const subplebbit = createSubplebbit({
            matches: JSON.stringify([{ propertyName: "author.address", regexp: "\\.sol$" }]),
            error: "Author address must end with .sol"
        });

        const challengeRequestMessage = createChallengeRequestMessage();

        const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
        expect(result.challengeSuccess).to.be.false;
        expect(result.challengeErrors[0]).to.equal("Author address must end with .sol");
    });

    // Test with content containing a specific word
    it("publication-match challenge with content containing specific word", async () => {
        const subplebbit = createSubplebbit({
            matches: JSON.stringify([{ propertyName: "content", regexp: "content" }]),
            error: "Content must contain 'content'"
        });

        const challengeRequestMessage = createChallengeRequestMessage();

        const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
        expect(result.challengeSuccess).to.be.true;
    });

    // Test with multiple conditions (matchAll = true)
    it("publication-match challenge with multiple conditions (matchAll = true)", async () => {
        const subplebbit = createSubplebbit({
            matches: JSON.stringify([
                { propertyName: "author.address", regexp: "\\.eth$" },
                { propertyName: "content", regexp: "content" }
            ]),
            error: "Publication does not match all required patterns"
        });

        const challengeRequestMessage = createChallengeRequestMessage();

        const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
        expect(result.challengeSuccess).to.be.true;
    });

    // Test with multiple conditions (matchAll = false, at least one matches)
    it("publication-match challenge with multiple conditions (matchAll = false, at least one matches)", async () => {
        const subplebbit = createSubplebbit({
            matches: JSON.stringify([
                { propertyName: "author.address", regexp: "\\.sol$" }, // This won't match
                { propertyName: "content", regexp: "content" } // This will match
            ]),
            error: "Publication does not match any required pattern",
            matchAll: "false"
        });

        const challengeRequestMessage = createChallengeRequestMessage();

        const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
        expect(result.challengeSuccess).to.be.true;
    });

    // Test with multiple conditions (matchAll = false, none match)
    it("publication-match challenge with multiple conditions (matchAll = false, none match)", async () => {
        const subplebbit = createSubplebbit({
            matches: JSON.stringify([
                { propertyName: "author.address", regexp: "\\.sol$" }, // This won't match
                { propertyName: "content", regexp: "badword" } // This won't match
            ]),
            error: "Publication does not match any required pattern",
            matchAll: "false"
        });

        const challengeRequestMessage = createChallengeRequestMessage();

        const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
        expect(result.challengeSuccess).to.be.false;
        expect(result.challengeErrors[0]).to.equal("Publication does not match any required pattern");
    });

    // Test with invalid JSON in matches option
    it("publication-match challenge with invalid JSON in matches option", async () => {
        const subplebbit = createSubplebbit({
            matches: "invalid json"
        });

        const challengeRequestMessage = createChallengeRequestMessage();

        const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
        expect(result.challengeSuccess).to.be.false;
        expect(result.challengeErrors[0]).to.include("Invalid matches JSON");
    });

    // Test with invalid regex pattern
    it("publication-match challenge with invalid regex pattern", async () => {
        const subplebbit = createSubplebbit({
            matches: JSON.stringify([
                { propertyName: "author.address", regexp: "[" } // Invalid regex
            ])
        });

        const challengeRequestMessage = createChallengeRequestMessage();

        const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
        expect(result.challengeSuccess).to.be.false;
        expect(result.challengeErrors[0]).to.include("Invalid regex pattern");
    });

    // Test with non-existent property
    it("publication-match challenge with non-existent property", async () => {
        const subplebbit = createSubplebbit({
            matches: JSON.stringify([{ propertyName: "nonexistent.property", regexp: ".*" }]),
            error: "Publication does not match required patterns"
        });

        const challengeRequestMessage = createChallengeRequestMessage();

        const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
        expect(result.challengeSuccess).to.be.false;
        expect(result.challengeErrors[0]).to.equal("Publication does not match required patterns");
    });

    // Test with empty matches array (should pass)
    it("publication-match challenge with empty matches array", async () => {
        const subplebbit = createSubplebbit({
            matches: "[]"
        });

        const challengeRequestMessage = createChallengeRequestMessage();

        const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
        expect(result.challengeSuccess).to.be.true;
    });

    // Test with custom publication data
    it("publication-match challenge with custom publication data", async () => {
        const subplebbit = createSubplebbit({
            matches: JSON.stringify([{ propertyName: "author.address", regexp: "custom" }])
        });

        const challengeRequestMessage = createChallengeRequestMessage({
            publication: {
                author: {
                    address: "custom-address"
                }
            }
        });

        const result = await getPendingChallengesOrChallengeVerification(challengeRequestMessage, subplebbit);
        expect(result.challengeSuccess).to.be.true;
    });
});
