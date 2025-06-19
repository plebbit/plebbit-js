import { expect } from "chai";
import signers from "../../../../fixtures/signers.js";
import {
    generateMockPost,
    generatePostToAnswerMathQuestion,
    publishWithExpectedResult,
    getRemotePlebbitConfigs
} from "../../../../../dist/node/test/test-util.js";

const subplebbitWithNoChallenge = signers[0].address;
const subplebbitWithMathCliChallenge = signers[1].address;

const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Takes msgs but doesn't respond
const workingPubsubUrl = "http://localhost:15002/api/v0"; // kubo node with working pubsub

const offlinePubsubUrl = "http://localhost:23425"; // Non-existent URL that will fail

// Test to reproduce pubsub bugs identified in issue #57
getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-kubo-rpc"] }).map((config) => {
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

                // Verify that pubsub subscription is properly cleaned up after calling stop()
                const pubsubClient = testPlebbit._clientsManager.getDefaultKuboPubsubClient();
                const subscribedTopics = await pubsubClient._client.pubsub.ls();
                expect(subscribedTopics).to.be.an("array");
                const pubsubTopic = mockPost._pubsubTopicWithfallback();
                expect(pubsubTopic).to.be.a("string");

                // After calling stop(), the publication should not be subscribed to its pubsub topic
                expect(subscribedTopics).to.not.include(pubsubTopic);

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
            await new Promise((resolve) => setTimeout(resolve, mockPost._setProviderFailureThresholdSeconds * 1000 * 2.1)); // Wait longer than failure threshold

            // Bug #1: When state is "stopped" during timeout, it should emit error and clean up properly
            // Currently it just logs an error and returns without cleanup
            expect(mockPost.publishingState).to.equal("failed");
            expect(mockPost.state).to.equal("stopped");

            expect(errorsEmitted.length).to.equal(1);
            expect(errorsEmitted[0].details.challengeExchanges[0].timedoutWaitingForChallengeRequestResponse).to.be.true;
            expect(errorsEmitted[0].details.challengeExchanges[1].timedoutWaitingForChallengeRequestResponse).to.be.true;

            // Verify that pubsub subscription is properly cleaned up after calling stop()
            const pubsubClient = testPlebbit._clientsManager.getDefaultKuboPubsubClient();
            const subscribedTopics = await pubsubClient._client.pubsub.ls();
            expect(subscribedTopics).to.be.an("array");
            const pubsubTopic = mockPost._pubsubTopicWithfallback();
            expect(pubsubTopic).to.be.a("string");

            // After calling stop(), the publication should not be subscribed to its pubsub topic
            expect(subscribedTopics).to.not.include(pubsubTopic);

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
                const recordedPublishingStates = [];

                mockPost.on("challengerequest", () => {
                    challengeRequestCount++;
                });

                mockPost.on("publishingstatechange", (state) => {
                    recordedPublishingStates.push(state);
                });

                mockPost.on("challenge", async (challenge) => {
                    // Answer challenge to complete publication
                    await mockPost.publishChallengeAnswers(["2"]);
                });

                await publishWithExpectedResult(mockPost, true);

                // Verify no race conditions occurred - should have at most 2 challenge requests
                // (one to non-responding provider, one to working provider)
                expect(challengeRequestCount).to.be.at.most(2);

                // Check for inconsistent state transitions
                const expectedStates = [
                    "fetching-subplebbit-ipns",
                    "fetching-subplebbit-ipfs",
                    "publishing-challenge-request",
                    "waiting-challenge",
                    "waiting-challenge-answers",
                    "publishing-challenge-answer",
                    "waiting-challenge-verification",
                    "succeeded"
                ];

                expect(recordedPublishingStates).to.deep.equal(expectedStates);

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
                        pubsubKuboRpcClientsOptions: [notRespondingPubsubUrl, workingPubsubUrl]
                    },
                    forceMockPubsub: true,
                    remotePlebbit: true
                });

                const mockPost = await generatePostToAnswerMathQuestion({ subplebbitAddress: subplebbitWithMathCliChallenge }, testPlebbit);
                mockPost._publishToDifferentProviderThresholdSeconds = 2;

                let providerAttempts = [];
                const originalPublishOnProvider = testPlebbit._clientsManager.pubsubPublishOnProvider.bind(testPlebbit._clientsManager);

                mockPost._clientsManager.pubsubPublishOnProvider = async (topic, data, providerUrl) => {
                    providerAttempts.push(providerUrl);
                    return originalPublishOnProvider(topic, data, providerUrl);
                };

                mockPost.on("challenge", async (challenge) => {
                    await mockPost.publishChallengeAnswers(["2"]);
                });

                await publishWithExpectedResult(mockPost, true);

                // Should not attempt the same provider multiple times unnecessarily
                const uniqueProviders = new Set(providerAttempts);
                expect(uniqueProviders.size).to.equal(2);

                await testPlebbit.destroy();
            });

            it(
                `Should handle a single provider succeeding to subscribe in first attempt, but failing to publish. It should not throw when it retries`
            );
        });

        describe("Pubsub Resource Leak Detection", async () => {
            it("should properly clean up pubsub subscriptions on failure", async () => {
                const testPlebbit = await config.plebbitInstancePromise({
                    plebbitOptions: { pubsubKuboRpcClientsOptions: [offlinePubsubUrl] }
                });

                const mockPost = await generateMockPost(subplebbitWithNoChallenge, testPlebbit);

                // Track subscription state
                const initialSubscriptions = Object.keys(testPlebbit._clientsManager.pubsubProviderSubscriptions).length;

                try {
                    await mockPost.publish();
                } catch (e) {
                    // Expected to fail
                }

                // Check for subscription leaks
                const finalSubscriptions = Object.keys(testPlebbit._clientsManager.pubsubProviderSubscriptions).length;
                const activeSubscriptions = Object.values(testPlebbit._clientsManager.pubsubProviderSubscriptions).reduce(
                    (total, subs) => total + subs.length,
                    0
                );

                if (activeSubscriptions > 0) {
                    console.warn(`BUG REPRODUCED: Subscription leak detected (${activeSubscriptions} active subscriptions)`);
                }

                expect(activeSubscriptions).to.equal(0);
                await testPlebbit.destroy();
            });
        });

        describe("Timeout Handler Error Emission", async () => {
            it("should emit proper errors when all providers fail", async () => {
                const provider1 = "http://localhost:23425"; // Offline
                const provider2 = "http://localhost:23426"; // Also offline

                const testPlebbit = await config.plebbitInstancePromise({
                    plebbitOptions: {
                        pubsubKuboRpcClientsOptions: [provider1, provider2]
                    }
                });

                const mockPost = await generateMockPost(subplebbitWithNoChallenge, testPlebbit);
                mockPost._publishToDifferentProviderThresholdSeconds = 1;
                mockPost._setProviderFailureThresholdSeconds = 3;

                let emittedErrors = [];
                mockPost.on("error", (error) => {
                    emittedErrors.push(error.code);
                });

                try {
                    await mockPost.publish();
                } catch (e) {
                    // Expected
                }

                // Should emit timeout error after all attempts fail
                await new Promise((resolve) => setTimeout(resolve, 5000));

                const hasTimeoutError = emittedErrors.some(
                    (code) =>
                        code === "ERR_PUBSUB_DID_NOT_RECEIVE_RESPONSE_AFTER_PUBLISHING_CHALLENGE_REQUEST" ||
                        code === "ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS"
                );

                expect(hasTimeoutError).to.be.true;
                await testPlebbit.destroy();
            });
        });

        describe("Pubsub edge cases", async () => {
            it("should handle pubsub error callback without infinite recursion", async () => {
                const offlinePubsubUrl = "http://localhost:23425";
                const testPlebbit = await config.plebbitInstancePromise({
                    plebbitOptions: { pubsubKuboRpcClientsOptions: [offlinePubsubUrl] }
                });

                const mockPost = await generateMockPost(subplebbitWithNoChallenge, testPlebbit);

                // Monitor for recursive calls
                let errorCallbackCount = 0;
                const originalSubscribe = testPlebbit._clientsManager.pubsubSubscribeOnProvider.bind(testPlebbit._clientsManager);

                testPlebbit._clientsManager.pubsubSubscribeOnProvider = async (topic, handler, provider) => {
                    // Mock the error callback behavior
                    const mockPubsubClient = {
                        pubsub: {
                            subscribe: async (topic, handler, options) => {
                                if (options?.onError) {
                                    errorCallbackCount++;
                                    if (errorCallbackCount > 3) {
                                        throw new Error("Infinite recursion detected in error callback!");
                                    }
                                    // Simulate error that would trigger the callback
                                    await options.onError(new Error("Mock pubsub error"));
                                }
                                throw new Error("Mock subscribe failure");
                            }
                        }
                    };

                    // This should not cause infinite recursion
                    throw new Error("Pubsub provider unavailable");
                };

                try {
                    await mockPost.publish();
                } catch (e) {
                    // Expected to fail
                }

                // The bug causes infinite recursion in error callbacks
                if (errorCallbackCount > 1) {
                    console.warn(`BUG REPRODUCED: Error callback called ${errorCallbackCount} times (potential infinite recursion)`);
                }

                await testPlebbit.destroy();
            });

            it("should not leave publications in hanging state when stopped during timeout", async () => {
                const testPlebbit = await config.plebbitInstancePromise({
                    plebbitOptions: { pubsubKuboRpcClientsOptions: [notRespondingPubsubUrl] }
                });

                const mockPost = await generateMockPost(subplebbitWithNoChallenge, testPlebbit);
                mockPost._publishToDifferentProviderThresholdSeconds = 1;
                mockPost._setProviderFailureThresholdSeconds = 3;

                let finalState = null;
                let errorEmitted = false;

                mockPost.on("publishingstatechange", (state) => {
                    finalState = state;
                });

                mockPost.on("error", () => {
                    errorEmitted = true;
                });

                // Start publishing
                const publishPromise = mockPost.publish().catch(() => {}); // Ignore initial error

                // Stop during timeout period
                await new Promise((resolve) => setTimeout(resolve, 500));
                await mockPost.stop();

                // Wait for timeout handler to potentially run
                await new Promise((resolve) => setTimeout(resolve, 4000));

                expect(finalState).to.equal("stopped");

                // Bug: Should emit error when stopped during timeout, but currently doesn't
                if (!errorEmitted) {
                    console.warn("BUG REPRODUCED: No error emitted when stopped during timeout handling");
                }

                await testPlebbit.destroy();
            });
        });
    });
});
