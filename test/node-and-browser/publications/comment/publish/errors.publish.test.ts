import signers from "../../../../fixtures/signers.js";
import { it } from "vitest";
import {
    generateMockPost,
    publishWithExpectedResult,
    mockRemotePlebbit,
    mockGatewayPlebbit,
    describeSkipIfRpc,
    mockPlebbitV2,
    resolveWhenConditionIsTrue
} from "../../../../../dist/node/test/test-util.js";
import { messages } from "../../../../../dist/node/errors.js";
import type { Plebbit } from "../../../../../dist/node/plebbit/plebbit.js";
import type { PlebbitError } from "../../../../../dist/node/plebbit-error.js";

// Helper type for accessing private properties on Comment
type CommentWithInternals = {
    _publishToDifferentProviderThresholdSeconds: number;
    _setProviderFailureThresholdSeconds: number;
};

const subplebbitAddress = signers[0].address;

describeSkipIfRpc.concurrent(`Publishing resilience and errors of gateways and pubsub providers`, async () => {
    it(`comment.publish() can be caught if one of the gateways threw 429 status code and other not responding`, async () => {
        // move
        const error429Gateway = `http://localhost:13416`; // this gateway always returns 429 status code
        const normalIpfsGateway = `http://localhost:18080`;
        const gatewayPlebbit = await mockGatewayPlebbit({ plebbitOptions: { ipfsGatewayUrls: [error429Gateway, normalIpfsGateway] } });
        const randomSigner = await gatewayPlebbit.createSigner();
        const offlineSubAddress = randomSigner.address; // offline sub

        const post = await generateMockPost(offlineSubAddress, gatewayPlebbit);

        gatewayPlebbit._timeouts["subplebbit-ipns"] = 5000; // reduce timeout or otherwise it's gonna keep retrying for 5 minutes

        try {
            await post.publish();
            expect.fail("should not resolve");
        } catch (e) {
            expect(e.code, messages.ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS);
            expect(e.details.gatewayToError[error429Gateway].details.status).to.equal(
                429,
                "expected gateway error details" + JSON.stringify(e.details.gatewayToError[error429Gateway].details)
            );
            expect(e.details.gatewayToError[normalIpfsGateway].code).to.equal("ERR_GATEWAY_TIMED_OUT_OR_ABORTED");
        } finally {
            await gatewayPlebbit.destroy();
        }
    });
    it(`Can publish a comment when all ipfs gateways are down except one`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit({
            plebbitOptions: {
                ipfsGatewayUrls: [
                    "http://127.0.0.1:28080", // Not working
                    "http://127.0.0.1:28081", // Not working
                    "http://127.0.0.1:18083", // Working but does not have the ipns
                    "http://127.0.0.1:18080" // Working, it has the IPNS
                ]
            }
        });

        expect(Object.keys(gatewayPlebbit.clients.ipfsGateways)).to.deep.equal([
            "http://127.0.0.1:28080",
            "http://127.0.0.1:28081",
            "http://127.0.0.1:18083",
            "http://127.0.0.1:18080"
        ]);
        const post = await generateMockPost(subplebbitAddress, gatewayPlebbit);
        await publishWithExpectedResult(post, true);
        await gatewayPlebbit.destroy();
    });
    it(`Can publish a comment when all pubsub providers are down except one`, async () => {
        const tempPlebbit = await mockRemotePlebbit();
        // We're gonna modify this plebbit instance to throw errors when pubsub publish/subscribe is called for two of its pubsub providers (it uses three)
        const pubsubProviders = Object.keys(tempPlebbit.clients.pubsubKuboRpcClients);
        expect(pubsubProviders.length).to.equal(3);

        tempPlebbit.clients.pubsubKuboRpcClients[pubsubProviders[0]]._client.pubsub.publish = () => {
            throw Error("Can't publish");
        };
        tempPlebbit.clients.pubsubKuboRpcClients[pubsubProviders[0]]._client.pubsub.subscribe = () => {
            throw Error("Can't subscribe");
        };

        tempPlebbit.clients.pubsubKuboRpcClients[pubsubProviders[1]]._client.pubsub.publish = () => {
            throw Error("Can't publish");
        };
        tempPlebbit.clients.pubsubKuboRpcClients[pubsubProviders[1]]._client.pubsub.subscribe = () => {
            throw Error("Can't subscribe");
        };
        // Only pubsubProviders [2] is able to publish/subscribe

        const post = await generateMockPost(subplebbitAddress, tempPlebbit);
        await publishWithExpectedResult(post, true);
        await tempPlebbit.destroy();
    });
    it(`comment.publish succeeds if provider 1 is not responding and 2 is responding`, async () => {
        const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Should take msgs but not respond, never throws errors
        const upPubsubUrl = "http://localhost:15002/api/v0";
        const plebbit = await mockPlebbitV2({
            plebbitOptions: { pubsubKuboRpcClientsOptions: [notRespondingPubsubUrl, upPubsubUrl] },
            forceMockPubsub: true,
            remotePlebbit: true
        });

        // make the pubsub provider unresponsive
        plebbit.clients.pubsubKuboRpcClients[notRespondingPubsubUrl]._client.pubsub.publish = async () => {};
        plebbit.clients.pubsubKuboRpcClients[notRespondingPubsubUrl]._client.pubsub.subscribe = async () => {};

        const mockPost = await generateMockPost(signers[0].address, plebbit);

        const expectedStates = {
            [notRespondingPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"],
            [upPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"]
        };

        const actualStates = { [notRespondingPubsubUrl]: [], [upPubsubUrl]: [] };

        for (const pubsubUrl of Object.keys(expectedStates))
            mockPost.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        try {
            await publishWithExpectedResult(mockPost, true);
            expect(mockPost.publishingState).to.equal("succeeded");
            expect(actualStates).to.deep.equal(expectedStates);
        } finally {
            await mockPost.stop();
            await plebbit.destroy();
        }
    });
    it(`comment emits and throws errors if all providers fail to publish`, async () => {
        const offlinePubsubUrls = ["http://localhost:23425", "http://localhost:23426"];
        const offlinePubsubPlebbit = await mockRemotePlebbit({
            plebbitOptions: { pubsubKuboRpcClientsOptions: offlinePubsubUrls }
        });
        const mockPost = await generateMockPost(signers[1].address, offlinePubsubPlebbit);

        const errorPromise = new Promise<Error | PlebbitError>((resolve) => mockPost.once("error", resolve));

        try {
            await mockPost.publish();
            expect.fail("Should have thrown");
        } catch (e) {
            expect((e as PlebbitError).code).to.equal("ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS");
        } finally {
            await offlinePubsubPlebbit.destroy();
        }
        const emittedError = await errorPromise;
        expect((emittedError as PlebbitError).code).to.equal("ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS");

        expect(mockPost.publishingState).to.equal("failed");
        expect(mockPost.clients.pubsubKuboRpcClients[offlinePubsubUrls[0]].state).to.equal("stopped");
        expect(mockPost.clients.pubsubKuboRpcClients[offlinePubsubUrls[1]].state).to.equal("stopped");
    });
    it(`comment emits error when provider 1 is not responding and provider 2 throws an error`, async () => {
        // First provider waits, second provider fails to subscribe
        // second provider should update its state to be stopped, but it should not emit an error until the first provider is done with waiting

        const notRespondingPubsubUrl = "http://localhost:15005/api/v0"; // Should take msgs but not respond, never throws errors
        const offlinePubsubUrl = "http://localhost:23425"; // Will throw errors; can't subscribe or publish
        const offlinePubsubPlebbit = await mockRemotePlebbit({
            plebbitOptions: { pubsubKuboRpcClientsOptions: [notRespondingPubsubUrl, offlinePubsubUrl] }
        });
        const mockPost = await generateMockPost(signers[1].address, offlinePubsubPlebbit);
        (mockPost as unknown as CommentWithInternals)._publishToDifferentProviderThresholdSeconds = 2;
        (mockPost as unknown as CommentWithInternals)._setProviderFailureThresholdSeconds = 5;

        const errors = [];
        mockPost.on("error", (err) => {
            errors.push(err);
        });

        const expectedStates = {
            [notRespondingPubsubUrl]: ["subscribing-pubsub", "publishing-challenge-request", "waiting-challenge", "stopped"],
            [offlinePubsubUrl]: ["subscribing-pubsub", "stopped"]
        };

        const actualStates = { [notRespondingPubsubUrl]: [], [offlinePubsubUrl]: [] };

        for (const pubsubUrl of Object.keys(expectedStates))
            mockPost.clients.pubsubKuboRpcClients[pubsubUrl].on("statechange", (newState) => actualStates[pubsubUrl].push(newState));

        const timeBeforePublish = Date.now();
        await mockPost.publish();

        await resolveWhenConditionIsTrue({ toUpdate: mockPost, predicate: async () => errors.length >= 1, eventName: "error" });
        const timeItTookToEmitError = Date.now() - timeBeforePublish;
        expect(timeItTookToEmitError).to.be.greaterThan((mockPost as unknown as CommentWithInternals)._setProviderFailureThresholdSeconds * 1000);

        expect(errors.length).to.equal(1);
        expect(errors[0].code).to.equal("ERR_ALL_PUBSUB_PROVIDERS_THROW_ERRORS");

        expect(mockPost.publishingState).to.equal("failed");
        expect(actualStates).to.deep.equal(expectedStates);
        await mockPost.stop();
        await offlinePubsubPlebbit.destroy();
    });
});
