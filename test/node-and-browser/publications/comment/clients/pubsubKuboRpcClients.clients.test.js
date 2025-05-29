import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import {
    generateMockPost,
    mockRemotePlebbit,
    getRemotePlebbitConfigs,
    publishWithExpectedResult,
    generatePostToAnswerMathQuestion,
    mockPlebbitV2
} from "../../../../../dist/node/test/test-util.js";
import { createMockPubsubClient } from "../../../../../dist/node/test/mock-ipfs-client.js";

const subplebbitAddress = signers[0].address;
const mathCliSubplebbitAddress = signers[1].address;

const clientsFieldName = {
    "remote-libp2pjs": "libp2pJsClients",
    "remote-kubo-rpc": "pubsubKuboRpcClients"
};

getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-kubo-rpc", "remote-libp2pjs"] }).map((config) => {
    const clientFieldName = clientsFieldName[config.testConfigCode];
    describe(`comment.clients.${clientFieldName} - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });
        after(async () => {
            await plebbit.destroy();
        });

        it(`comment.clients.${clientFieldName}[url].state is stopped by default`, async () => {
            const mockPost = await generateMockPost(subplebbitAddress, plebbit);
            for (const client of Object.values(mockPost.clients[clientFieldName])) expect(client.state).to.equal("stopped");
        });

        it(`correct order of ${clientFieldName} state when publishing a comment with a sub that skips challenge`, async () => {
            const mockPost = await generateMockPost(signers[0].address, plebbit);

            const pubsubUrls = Object.keys(plebbit.clients[clientFieldName]);
            // Only first pubsub url is used for subscription. For publishing we use all providers

            const expectedStates = Object.assign(
                {},
                ...pubsubUrls.map((url) => ({
                    [url]: []
                }))
            );
            expectedStates[pubsubUrls[0]] = ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"];

            const actualStates = Object.assign(
                {},
                ...pubsubUrls.map((url) => ({
                    [url]: []
                }))
            );

            for (const pubsubUrl of Object.keys(expectedStates))
                mockPost.clients[clientFieldName][pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

            const subplebbit = await plebbit.getSubplebbit(signers[0].address);
            mockPost._getSubplebbitCache = () => subplebbit.raw.subplebbitIpfs; // so libp2pjs client state won't include fetching subplebbit states
            await publishWithExpectedResult(mockPost, true);

            expect(actualStates).to.deep.equal(expectedStates);
        });

        it(`correct order of ${clientFieldName} state when publishing a comment with a sub that requires challenge`, async () => {
            const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: mathCliSubplebbitAddress }, plebbit);

            const pubsubUrls = Object.keys(mockPost.clients[clientFieldName]);
            // Only first pubsub url is used for subscription. For publishing we use all providers

            const expectedStates = Object.assign(
                {},
                ...pubsubUrls.map((url) => ({
                    [url]: []
                }))
            );
            expectedStates[pubsubUrls[0]] = [
                ...(config.testConfigCode === "remote-libp2pjs" ? ["fetching-subplebbit-ipns", "fetching-subplebbit-ipfs", "stopped"] : []),
                "subscribing-pubsub",
                "publishing-challenge-request",
                "waiting-challenge",
                "waiting-challenge-answers",
                "publishing-challenge-answer",
                "waiting-challenge-verification",
                "stopped"
            ];

            const actualStates = Object.assign(
                {},
                ...pubsubUrls.map((url) => ({
                    [url]: []
                }))
            );

            for (const pubsubUrl of Object.keys(expectedStates))
                mockPost.clients[clientFieldName][pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

            await publishWithExpectedResult(mockPost, true);

            expect(actualStates).to.deep.equal(expectedStates);
        });

        if (config.testConfigCode === "remote-kubo-rpc")
            it(`correct order of ${clientFieldName} state when failing to publish a comment and the error is from the pubsub provider`, async () => {
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

        if (config.testConfigCode === "remote-kubo-rpc")
            it(`Correct order of ${clientFieldName} state when failing to publish a comment on one pubsub provider and moving on to the other one`, async () => {
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
                    mockPost.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) =>
                        actualStates[pubsubUrl].push(newState)
                    );

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });

        if (config.testConfigCode === "remote-kubo-rpc")
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
                    mockPost.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) =>
                        actualStates[pubsubUrl].push(newState)
                    );

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });

        if (config.testConfigCode === "remote-kubo-rpc")
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
                    mockPost.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) =>
                        actualStates[pubsubUrl].push(newState)
                    );

                await publishWithExpectedResult(mockPost, true);

                expect(actualStates).to.deep.equal(expectedStates);
            });
    });
});
