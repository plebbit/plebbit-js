import Plebbit from "../../../../dist/node/index.js";
import signers from "../../../fixtures/signers.js";
import {
    generateMockPost,
    mockRemotePlebbit,
    publishWithExpectedResult,
    mockGatewayPlebbit,
    generatePostToAnswerMathQuestion,
    describeSkipIfRpc
} from "../../../../dist/node/test/test-util.js";
import { messages } from "../../../../dist/node/errors.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { createMockPubsubClient } from "../../../../dist/node/test/mock-ipfs-client.js";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;
const mathCliSubplebbitAddress = signers[1].address;

describeSkipIfRpc(`comment.clients.pubsubClients`, async () => {
    let plebbit, gatewayPlebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        gatewayPlebbit = await mockGatewayPlebbit();
    });
    it(`comment.clients.pubsubClients[url].state is stopped by default`, async () => {
        const mockPost = await generateMockPost(subplebbitAddress, plebbit);
        expect(Object.keys(mockPost.clients.pubsubClients).length).to.equal(3);
        expect(Object.values(mockPost.clients.pubsubClients)[0].state).to.equal("stopped");
    });

    it(`correct order of pubsubClients state when publishing a comment with a sub that skips challenge`, async () => {
        const mockPost = await generateMockPost(signers[0].address, plebbit);

        const pubsubUrls = Object.keys(plebbit.clients.pubsubClients);
        // Only first pubsub url is used for subscription. For publishing we use all providers
        const expectedStates = {
            [pubsubUrls[0]]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"],
            [pubsubUrls[1]]: [],
            [pubsubUrls[2]]: []
        };

        const actualStates = { [pubsubUrls[0]]: [], [pubsubUrls[1]]: [], [pubsubUrls[2]]: [] };

        for (const pubsubUrl of Object.keys(expectedStates))
            mockPost.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`correct order of pubsubClients state when publishing a comment with a sub that requires challenge`, async () => {
        const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);

        const pubsubUrls = Object.keys(mockPost.clients.pubsubClients);
        // Only first pubsub url is used for subscription. For publishing we use all providers
        const expectedStates = {
            [pubsubUrls[0]]: [
                "subscribing-pubsub",
                "publishing-challenge-request",
                "waiting-challenge",
                "waiting-challenge-answers",
                "publishing-challenge-answer",
                "waiting-challenge-verification",
                "stopped"
            ],
            [pubsubUrls[1]]: [],
            [pubsubUrls[2]]: []
        };

        const actualStates = { [pubsubUrls[0]]: [], [pubsubUrls[1]]: [], [pubsubUrls[2]]: [] };

        for (const pubsubUrl of Object.keys(expectedStates))
            mockPost.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`correct order of pubsubClients state when failing to publish a comment and the error is from the pubsub provider`, async () => {
        const offlinePubsubUrl = "http://localhost:13173"; // Should be down
        const offlinePubsubPlebbit = await mockRemotePlebbit({
            kuboRpcClientsOptions: plebbit.kuboRpcClientsOptions,
            pubsubHttpClientsOptions: [offlinePubsubUrl]
        });

        const mockPost = await generateMockPost(signers[1].address, offlinePubsubPlebbit);

        const expectedStates = ["subscribing-pubsub", "stopped", "subscribing-pubsub", "stopped"];

        const actualStates = [];

        mockPost.clients.pubsubClients[offlinePubsubUrl].on("statechange", (newState) => actualStates.push(newState));

        await assert.isRejected(mockPost.publish(), messages.ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of pubsubClients state when failing to publish a comment on one pubsub provider and moving on to the other one`, async () => {
        const offlinePubsubUrl = "http://localhost:13173"; // Should be down
        const upPubsubUrl = "http://localhost:15002/api/v0";
        const plebbit = await mockRemotePlebbit({
            pubsubHttpClientsOptions: [offlinePubsubUrl, upPubsubUrl]
        });

        plebbit.clients.pubsubClients[upPubsubUrl]._client = createMockPubsubClient(); // Use mock pubsub to be on the same pubsub as the sub

        const mockPost = await generateMockPost(signers[0].address, plebbit);

        const expectedStates = {
            [offlinePubsubUrl]: ["subscribing-pubsub", "stopped"],
            [upPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"]
        };

        const actualStates = { [offlinePubsubUrl]: [], [upPubsubUrl]: [] };

        for (const pubsubUrl of Object.keys(expectedStates))
            mockPost.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of pubsubClients state when provider 1 is not responding and moving on to the other one`, async () => {
        const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Should take msgs but not respond, never throws errors
        const upPubsubUrl = "http://localhost:15002/api/v0";
        const plebbit = await mockRemotePlebbit({
            pubsubHttpClientsOptions: [notRespondingPubsubUrl, upPubsubUrl]
        });

        plebbit.clients.pubsubClients[upPubsubUrl]._client = createMockPubsubClient(); // Use mock pubsub to be on the same pubsub as the sub

        const mockPost = await generateMockPost(signers[0].address, plebbit);
        mockPost._publishToDifferentProviderThresholdSeconds = 5;

        const expectedStates = {
            [notRespondingPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"],
            [upPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"]
        };

        const actualStates = { [notRespondingPubsubUrl]: [], [upPubsubUrl]: [] };

        for (const pubsubUrl of Object.keys(expectedStates))
            mockPost.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`correct order of pubsubClients state when publishing a comment with a sub that requires challenge (pubsub provider 0 fail to receive a response in alotted time)`, async () => {
        const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Should take pubsub msgs but not respond, never throws errors
        const upPubsubUrl = "http://localhost:15002/api/v0";
        const plebbit = await mockRemotePlebbit({
            pubsubHttpClientsOptions: [notRespondingPubsubUrl, upPubsubUrl]
        });

        plebbit.clients.pubsubClients[upPubsubUrl]._client = createMockPubsubClient(); // Use mock pubsub to be on the same pubsub as the sub

        const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);
        mockPost._publishToDifferentProviderThresholdSeconds = 5;

        const expectedStates = {
            [notRespondingPubsubUrl]: [
                "subscribing-pubsub",
                "publishing-challenge-request",
                "waiting-challenge",
                "waiting-challenge-answers",
                "waiting-challenge-verification",
                "stopped"
            ],
            [upPubsubUrl]: [
                "subscribing-pubsub",
                "publishing-challenge-request",
                "waiting-challenge",
                "waiting-challenge-answers",
                "publishing-challenge-answer",
                "waiting-challenge-verification",
                "stopped"
            ]
        };

        const actualStates = { [notRespondingPubsubUrl]: [], [upPubsubUrl]: [] };

        for (const pubsubUrl of Object.keys(expectedStates))
            mockPost.clients.pubsubClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });
});
