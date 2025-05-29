import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import {
    generateMockPost,
    mockRemotePlebbit,
    publishWithExpectedResult,
    generatePostToAnswerMathQuestion,
    describeSkipIfRpc,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    mockPlebbitV2
} from "../../../../../dist/node/test/test-util.js";
import { createMockPubsubClient } from "../../../../../dist/node/test/mock-ipfs-client.js";

const subplebbitAddress = signers[0].address;
const mathCliSubplebbitAddress = signers[1].address;

describeSkipIfRpc(`comment.clients.pubsubKuboRpcClients`, async () => {
    let plebbit;
    beforeEach(async () => {
        plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    });
    afterEach(async () => {
        await plebbit.destroy();
    });

    it(`comment.clients.pubsubKuboRpcClients[url].state is stopped by default`, async () => {
        const mockPost = await generateMockPost(subplebbitAddress, plebbit);
        expect(Object.keys(mockPost.clients.pubsubKuboRpcClients).length).to.equal(3);
        expect(Object.values(mockPost.clients.pubsubKuboRpcClients)[0].state).to.equal("stopped");
    });

    it(`correct order of pubsubKuboRpcClients state when publishing a comment with a sub that skips challenge`, async () => {
        const mockPost = await generateMockPost(signers[0].address, plebbit);

        const pubsubUrls = Object.keys(plebbit.clients.pubsubKuboRpcClients);
        // Only first pubsub url is used for subscription. For publishing we use all providers
        const expectedStates = {
            [pubsubUrls[0]]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"],
            [pubsubUrls[1]]: [],
            [pubsubUrls[2]]: []
        };

        const actualStates = { [pubsubUrls[0]]: [], [pubsubUrls[1]]: [], [pubsubUrls[2]]: [] };

        for (const pubsubUrl of Object.keys(expectedStates))
            mockPost.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`correct order of pubsubKuboRpcClients state when publishing a comment with a sub that requires challenge`, async () => {
        const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);

        const pubsubUrls = Object.keys(mockPost.clients.pubsubKuboRpcClients);
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
            mockPost.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`correct order of pubsubKuboRpcClients state when failing to publish a comment and the error is from the pubsub provider`, async () => {
        const offlinePubsubUrl = "http://localhost:13173"; // Should be down
        const offlinePubsubPlebbit = await mockRemotePlebbit({
            kuboRpcClientsOptions: plebbit.kuboRpcClientsOptions,
            pubsubKuboRpcClientsOptions: [offlinePubsubUrl]
        });

        const mockPost = await generateMockPost(signers[1].address, offlinePubsubPlebbit);

        const expectedStates = ["subscribing-pubsub", "stopped", "subscribing-pubsub", "stopped"];

        const actualStates = [];

        mockPost.clients.pubsubKuboRpcClients[offlinePubsubUrl].on("statechange", (newState) => actualStates.push(newState));

        try {
            await mockPost.publish();
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS");
        }

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of pubsubKuboRpcClients state when failing to publish a comment on one pubsub provider and moving on to the other one`, async () => {
        const offlinePubsubUrl = "http://localhost:13173"; // Should be down
        const upPubsubUrl = "http://localhost:15002/api/v0";
        const plebbit = await mockRemotePlebbit({
            pubsubKuboRpcClientsOptions: [offlinePubsubUrl, upPubsubUrl]
        });

        plebbit.clients.pubsubKuboRpcClients[upPubsubUrl]._client = createMockPubsubClient(); // Use mock pubsub to be on the same pubsub as the sub

        const mockPost = await generateMockPost(signers[0].address, plebbit);

        const expectedStates = {
            [offlinePubsubUrl]: ["subscribing-pubsub", "stopped"],
            [upPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"]
        };

        const actualStates = { [offlinePubsubUrl]: [], [upPubsubUrl]: [] };

        for (const pubsubUrl of Object.keys(expectedStates))
            mockPost.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of pubsubKuboRpcClients state when provider 1 is not responding and moving on to the other one`, async () => {
        const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Should take msgs but not respond, never throws errors
        const upPubsubUrl = "http://localhost:15002/api/v0";
        const plebbit = await mockPlebbitV2({
            plebbitOptions: {
                pubsubKuboRpcClientsOptions: [notRespondingPubsubUrl, upPubsubUrl]
            },
            forceMockPubsub: false,
            remotePlebbit: true
        });

        plebbit.clients.pubsubKuboRpcClients[upPubsubUrl]._client = createMockPubsubClient(); // Use mock pubsub to be on the same pubsub as the sub

        const mockPost = await generateMockPost(signers[0].address, plebbit);
        mockPost._publishToDifferentProviderThresholdSeconds = 5;

        const expectedStates = {
            [notRespondingPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"],
            [upPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"]
        };

        const actualStates = { [notRespondingPubsubUrl]: [], [upPubsubUrl]: [] };

        for (const pubsubUrl of Object.keys(plebbit.clients.pubsubKuboRpcClients))
            mockPost.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`correct order of pubsubKuboRpcClients state when publishing a comment with a sub that requires challenge (pubsub provider 0 fail to receive a response in alotted time)`, async () => {
        const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Should take pubsub msgs but not respond, never throws errors
        const upPubsubUrl = "http://localhost:15002/api/v0";
        const plebbit = await mockRemotePlebbit({
            pubsubKuboRpcClientsOptions: [notRespondingPubsubUrl, upPubsubUrl]
        });

        plebbit.clients.pubsubKuboRpcClients[upPubsubUrl]._client = createMockPubsubClient(); // Use mock pubsub to be on the same pubsub as the sub

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
            mockPost.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        await publishWithExpectedResult(mockPost, true);

        expect(actualStates).to.deep.equal(expectedStates);
    });
});
