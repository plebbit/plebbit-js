import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import {
    generateMockPost,
    generatePostToAnswerMathQuestion,
    publishWithExpectedResult,
    getAvailablePlebbitConfigsToTestAgainst,
    resolveWhenConditionIsTrue
} from "../../../../../dist/node/test/test-util.js";

const subplebbitWithNoChallenge = signers[0].address;
const subplebbitWithMathCliChallenge = signers[1].address;

const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Takes msgs but doesn't respond
const workingPubsubUrl = "http://localhost:15002/api/v0"; // kubo node with working pubsub

const offlinePubsubUrl = "http://localhost:23425"; // Non-existent URL that will fail

const validateKuboRpcNotListeningToPubsubTopic = async (testPlebbit, pubsubTopic) => {
    expect(pubsubTopic).to.be.a("string");
    for (const pubsubProviderUrl of Object.keys(testPlebbit.clients.pubsubKuboRpcClients)) {
        const pubsubClient = testPlebbit.clients.pubsubKuboRpcClients[pubsubProviderUrl]._client;
        const subscribedTopics = await pubsubClient.pubsub.ls();
        expect(subscribedTopics).to.be.an("array");
        expect(subscribedTopics).to.not.include(pubsubTopic);
    }
};

// Test to reproduce pubsub bugs identified in issue #57
getAvailablePlebbitConfigsToTestAgainst({ includeOnlyTheseTests: ["remote-kubo-rpc"] }).map((config) => {
    describe(`Pubsub timeout and subscription bugs - ${config.name}`, async () => {
        describe("Bug #1: Incomplete Control Flow in _handleNotReceivingResponseToChallengeRequest", async () => {
            it("should properly handle when publication state becomes 'stopped' during timeout", async () => {
                const testPlebbit = await config.plebbitInstancePromise({
                    plebbitOptions: { pubsubKuboRpcClientsOptions: [notRespondingPubsubUrl] },
                    forceMockPubsub: true,
                    remotePlebbit: true
                });

                const mockPost = await generateMockPost(subplebbitWithMathCliChallenge, testPlebbit);
                mockPost._publishToDifferentProviderThresholdSeconds = 2; // Speed up test
                mockPost._setProviderFailureThresholdSeconds = 5; // Speed up test

                const errorsEmitted = [];

                mockPost.on("error", (error) => {
                    errorsEmitted.push(error);
                });

                await mockPost.publish();

                await new Promise((resolve) => setTimeout(resolve, 1000));
                await mockPost.stop();

                // Wait for the timeout handler to run
                await new Promise((resolve) => setTimeout(resolve, 7000)); // Wait longer than failure threshold

                // Bug #1: When state is "stopped" during timeout, it should emit error and clean up properly
                // Currently it just logs an error and returns without cleanup
                expect(mockPost.publishingState).to.equal("stopped");
                expect(mockPost.state).to.equal("stopped");

                expect(errorsEmitted.length).to.equal(0);

                await validateKuboRpcNotListeningToPubsubTopic(testPlebbit, mockPost._pubsubTopicWithfallback());

                await testPlebbit.destroy();
            });
        });

        it(`Should handle a single provider timing out  without recieving challenge or challenge verification using stop() by cleaning up resources`, async () => {
            const testPlebbit = await config.plebbitInstancePromise({
                plebbitOptions: { pubsubKuboRpcClientsOptions: [notRespondingPubsubUrl] },
                remotePlebbit: true
            });

            const mockPost = await generateMockPost(subplebbitWithNoChallenge, testPlebbit);
            mockPost._publishToDifferentProviderThresholdSeconds = 2; // Speed up test
            mockPost._setProviderFailureThresholdSeconds = 5; // Speed up test

            const errorsEmitted = [];

            mockPost.on("error", (error) => {
                errorsEmitted.push(error);
            });

            await mockPost.publish();

            // Wait for the timeout handler to run
            await new Promise((resolve) => setTimeout(resolve, mockPost._setProviderFailureThresholdSeconds * 1000 * 3)); // Wait longer than failure threshold

            // Bug #1: When state is "stopped" during timeout, it should emit error and clean up properly
            // Currently it just logs an error and returns without cleanup
            expect(mockPost.publishingState).to.equal("failed");
            expect(mockPost.state).to.equal("stopped");

            expect(errorsEmitted.length).to.equal(1);
            expect(errorsEmitted[0].details.challengeExchanges[0].timedoutWaitingForChallengeRequestResponse).to.be.true;
            expect(errorsEmitted[0].details.challengeExchanges[1].timedoutWaitingForChallengeRequestResponse).to.be.true;

            await validateKuboRpcNotListeningToPubsubTopic(testPlebbit, mockPost._pubsubTopicWithfallback());

            await testPlebbit.destroy();
        });

        describe("Bug #2: Pubsub Subscription Infinite Loop", async () => {
            it("should not create infinite retry loop when pubsub subscription fails by emitting error in pubsub.subscribe");
        });

        describe("Bug #3: Race Condition in Challenge Exchange Handling", async () => {
            it(`It should emit a single Challenge per challenge request maximum`, async () => {
                // this test should be for both kubo and helia
                const testPlebbit = await config.plebbitInstancePromise({
                    plebbitOptions: {
                        pubsubKuboRpcClientsOptions: [workingPubsubUrl, notRespondingPubsubUrl]
                    },
                    forceMockPubsub: true,
                    remotePlebbit: true
                });

                const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: subplebbitWithMathCliChallenge }, testPlebbit);
                mockPost._publishToDifferentProviderThresholdSeconds = 1; // Very fast timeout

                const challengesReceived = [];

                mockPost.on("challenge", async (challenge) => {
                    challengesReceived.push(challenge);
                    await mockPost.publishChallengeAnswers(["2"]);
                });

                await publishWithExpectedResult(mockPost, true);

                expect(challengesReceived.length).to.equal(1);

                await testPlebbit.destroy();
            });

            it("should handle concurrent timeout and challenge response without race conditions", async () => {
                const testPlebbit = await config.plebbitInstancePromise({
                    plebbitOptions: {
                        pubsubKuboRpcClientsOptions: [workingPubsubUrl, notRespondingPubsubUrl]
                    },
                    forceMockPubsub: true,
                    remotePlebbit: true
                });

                const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: subplebbitWithMathCliChallenge }, testPlebbit);
                mockPost._publishToDifferentProviderThresholdSeconds = 1; // Very fast timeout

                let challengeRequestCount = 0;

                mockPost.on("challengerequest", () => {
                    challengeRequestCount++;
                });

                await publishWithExpectedResult(mockPost, true);

                // Verify no race conditions occurred - should have at most 2 challenge requests
                // (one to non-responding provider, one to working provider)
                expect(challengeRequestCount).to.be.at.most(2);

                // Verify pubsub subscription handlers are cleaned up after successful publication
                const pubsubTopic = mockPost._pubsubTopicWithfallback();
                expect(pubsubTopic).to.be.a("string");

                // Check both providers for subscription cleanup using the correct access pattern
                const providers = [notRespondingPubsubUrl, workingPubsubUrl];
                for (const providerUrl of providers) {
                    const subscribedTopics = await testPlebbit.clients.pubsubKuboRpcClients[providerUrl]._client.pubsub.ls();
                    expect(subscribedTopics).to.deep.equal(
                        [],
                        `Provider ${providerUrl} should have no subscribed topics, but has: ${subscribedTopics.join(", ")}`
                    );
                }

                // Verify no active subscriptions remain in the client manager
                const activeSubscriptions = Object.values(testPlebbit._clientsManager.pubsubProviderSubscriptions).reduce(
                    (total, subs) => total + subs.length,
                    0
                );
                expect(activeSubscriptions).to.equal(0, `${activeSubscriptions} active subscriptions remain after publication should be 0`);

                await testPlebbit.destroy();
            });
        });

        describe("Bug #4: Provider Index Management Issue", async () => {
            it("should handle provider index correctly in finally blocks", async () => {
                const testPlebbit = await config.plebbitInstancePromise({
                    plebbitOptions: {
                        pubsubKuboRpcClientsOptions: [workingPubsubUrl, notRespondingPubsubUrl]
                    },
                    forceMockPubsub: true,
                    remotePlebbit: true
                });

                const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: subplebbitWithMathCliChallenge }, testPlebbit);
                mockPost._publishToDifferentProviderThresholdSeconds = 2;

                const providerAttempts = [];
                const originalPublishOnProvider = testPlebbit._clientsManager.pubsubPublishOnProvider.bind(testPlebbit._clientsManager);

                mockPost._clientsManager.pubsubPublishOnProvider = async (topic, data, providerUrl) => {
                    providerAttempts.push(providerUrl);
                    return originalPublishOnProvider(topic, data, providerUrl);
                };

                await publishWithExpectedResult(mockPost, true);

                // Should not attempt the same provider multiple times unnecessarily
                const uniqueProviders = new Set(providerAttempts);
                expect(uniqueProviders.size).to.equal(1); // only the working pubsub node will be used to publish

                await testPlebbit.destroy();
            });

            it(`Should handle a single provider succeeding to subscribe in first attempt, but failing to publish. It should not throw when it retries`, async () => {
                const testPlebbit = await config.plebbitInstancePromise({
                    plebbitOptions: { pubsubKuboRpcClientsOptions: [workingPubsubUrl] },
                    forceMockPubsub: true,
                    remotePlebbit: true
                });

                const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: subplebbitWithMathCliChallenge }, testPlebbit);

                let publishCount = 0;
                const originalPublishOnProvider = testPlebbit._clientsManager.pubsubPublishOnProvider.bind(testPlebbit._clientsManager);
                mockPost._clientsManager.pubsubPublishOnProvider = async (topic, data, providerUrl) => {
                    publishCount++;
                    if (publishCount === 1) throw new Error("Mock pubsub publish failure");
                    else return originalPublishOnProvider(topic, data, providerUrl);
                };

                const originalSubscribeOnProvider = testPlebbit._clientsManager.pubsubSubscribeOnProvider.bind(testPlebbit._clientsManager);
                let subscribeCount = 0;
                mockPost._clientsManager.pubsubSubscribeOnProvider = async (topic, handler, providerUrl) => {
                    subscribeCount++;
                    return originalSubscribeOnProvider(topic, handler, providerUrl);
                };

                await publishWithExpectedResult(mockPost, true);

                expect(publishCount).to.equal(3); // 1st attempt fails, 2nd attempt succeeds, 3rd attempt is from publishChallengeAnswer

                expect(subscribeCount).to.equal(2); // should re-subscribe with every attempt

                await testPlebbit.destroy();
            });
        });

        describe("Pubsub Resource Leak Detection", async () => {
            it("should properly clean up pubsub subscriptions when it throws on publish((", async () => {
                const testPlebbit = await config.plebbitInstancePromise({
                    plebbitOptions: { pubsubKuboRpcClientsOptions: [offlinePubsubUrl] }
                });

                const mockPost = await generateMockPost(subplebbitWithNoChallenge, testPlebbit);

                // Track subscription state
                const numOfPubsubProvidersBefore = Object.keys(mockPost._clientsManager.pubsubProviderSubscriptions).length;
                expect(numOfPubsubProvidersBefore).to.equal(1);
                expect(mockPost._clientsManager.pubsubProviderSubscriptions[offlinePubsubUrl].length).to.equal(0);

                try {
                    await mockPost.publish();
                } catch (e) {
                    // Expected to fail
                    expect(e.code).to.equal("ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS");
                    expect(e.details.challengeExchanges[0].challengeRequestPublishError.message).to.be.oneOf([
                        "fetch failed", // on node
                        "Failed to fetch", // on browser
                        "NetworkError when attempting to fetch resource." // on firefox
                    ]);
                    expect(e.details.challengeExchanges[1].challengeRequestPublishError.message).to.be.oneOf([
                        "fetch failed", // on node
                        "Failed to fetch", // on browser
                        "NetworkError when attempting to fetch resource." // on firefox
                    ]);

                    expect(mockPost._clientsManager.pubsubProviderSubscriptions[offlinePubsubUrl].length).to.equal(0);
                }

                // Check for subscription leaks
                const numOfPubsubProvidersAfter = Object.keys(testPlebbit._clientsManager.pubsubProviderSubscriptions).length;
                const activeSubscriptions = Object.values(testPlebbit._clientsManager.pubsubProviderSubscriptions).reduce(
                    (total, subs) => total + subs.length,
                    0
                );

                expect(numOfPubsubProvidersAfter).to.equal(numOfPubsubProvidersBefore);
                expect(activeSubscriptions).to.equal(0);

                await testPlebbit.destroy();
            });
        });

        describe("Pubsub edge cases", async () => {
            it("should handle pubsub error callback without infinite recursion", async () => {
                // this pubsub url would throw an error for the first subscribe
                // but if user retries it sends messages normally
                // this mocked pubsub server emits an error onError only once
                // so subscription count should be 2
                const pubsubMockedWithError = "http://localhost:30001/api/v0";
                const testPlebbit = await config.plebbitInstancePromise({
                    plebbitOptions: { pubsubKuboRpcClientsOptions: [pubsubMockedWithError] }
                });

                const mockPost = await generateMockPost(subplebbitWithNoChallenge, testPlebbit);

                const errors = [];

                mockPost.on("error", (error) => {
                    errors.push(error);
                });

                mockPost._publishToDifferentProviderThresholdSeconds = 1; // Speed up test
                mockPost._setProviderFailureThresholdSeconds = 2; // Speed up test

                const originalSubscribeOnProvider = testPlebbit.clients.pubsubKuboRpcClients[
                    pubsubMockedWithError
                ]._client.pubsub.subscribe.bind(testPlebbit._clientsManager);
                let subscribeCount = 0;

                testPlebbit.clients.pubsubKuboRpcClients[pubsubMockedWithError]._client.pubsub.subscribe = async (
                    topic,
                    handler,
                    options
                ) => {
                    subscribeCount++;
                    return originalSubscribeOnProvider(topic, handler, options);
                };

                await mockPost.publish();

                await resolveWhenConditionIsTrue(mockPost, () => errors.length > 0, "error");

                expect(mockPost.publishingState).to.equal("failed");
                expect(mockPost.state).to.equal("stopped");

                await new Promise((resolve) => setTimeout(resolve, 3000)); // need to wait for the unsusbcribe to be called

                // after failing to receive a response, it should clean up by itself

                const ipfsClientTopics = await testPlebbit.clients.pubsubKuboRpcClients[pubsubMockedWithError]._client.pubsub.ls();
                expect(ipfsClientTopics).to.deep.equal([]);

                expect(mockPost._clientsManager.pubsubProviderSubscriptions[pubsubMockedWithError].length).to.equal(0); // no active subscriptions

                expect(subscribeCount).to.be.at.most(3).and.at.least(2);
                await testPlebbit.destroy();
            });
        });
    });
});
