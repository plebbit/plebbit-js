import { expect } from "chai";
import { describe, it, beforeAll, afterAll } from "vitest";
import { Server } from "socket.io";
import { io as createSocketClient } from "socket.io-client";
import { randomUUID } from "crypto";
import {
    createMockPubsubClient,
    waitForMockPubsubConnection
} from "../../../dist/node/test/mock-ipfs-client.js";

const PORT = 25963;
let ioServer;
let startedLocalServer = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForCondition = async (predicate, timeoutMs = 4000, intervalMs = 10) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (predicate()) return;
        await sleep(intervalMs);
    }
    throw new Error("Condition was not met before timeout");
};

const isServerRunning = async () => {
    return new Promise((resolve) => {
        const probe = createSocketClient(`ws://localhost:${PORT}`, {
            reconnection: false,
            timeout: 500
        });
        const cleanup = (exists) => {
            probe.off("connect", onConnect);
            probe.off("connect_error", onError);
            if (probe.connected) probe.disconnect();
            else probe.close();
            resolve(exists);
        };
        const onConnect = () => cleanup(true);
        const onError = () => cleanup(false);
        probe.once("connect", onConnect);
        probe.once("connect_error", onError);
    });
};

const ensureServerStarted = async () => {
    if (ioServer || (await isServerRunning())) return;
    const peers = new Set();
    ioServer = new Server(PORT, { cors: { origin: "*" } });
    ioServer.on("connection", (socket) => {
        peers.add(socket);
        socket.on("disconnect", () => peers.delete(socket));
        socket.onAny((topic, message) => {
            for (const peer of peers) peer.emit(topic, message);
        });
    });
    await new Promise((resolve) => ioServer.on("listening", resolve));
    startedLocalServer = true;
};

describe("mock pubsub client with socket.io server", () => {
    beforeAll(async () => {
        await ensureServerStarted();
    });

    afterAll(async () => {
        if (ioServer && startedLocalServer) {
            await new Promise((resolve) => ioServer.close(resolve));
            ioServer = undefined;
        }
    });

    it("does not emit messages back to the publishing subscription", async () => {
        const client = createMockPubsubClient();
        await waitForMockPubsubConnection();
        const topic = `self-publish-${randomUUID()}`;
        let invocationCount = 0;

        await client.pubsub.subscribe(topic, () => {
            invocationCount += 1;
        });

        await client.pubsub.publish(topic, Buffer.from("hello-world"));
        await sleep(200);

        expect(invocationCount).to.equal(0);
        await client.pubsub.unsubscribe(topic);
        await client.destroy();
    });

    it("delivers every message exactly once to each subscriber", async () => {
        const publisher = createMockPubsubClient();
        const subscriberClient = createMockPubsubClient();
        await waitForMockPubsubConnection();
        const topic = `fanout-${randomUUID()}`;
        const messageCount = 200;
        const firstSubscriberCalls = new Set();
        const secondSubscriberCalls = new Set();

        await subscriberClient.pubsub.subscribe(topic, (msg) => {
            firstSubscriberCalls.add(Buffer.from(msg.data).toString("utf8"));
        });
        await subscriberClient.pubsub.subscribe(topic, (msg) => {
            secondSubscriberCalls.add(Buffer.from(msg.data).toString("utf8"));
        });

        const publishPromises = [];
        for (let i = 0; i < messageCount; i += 1) {
            const payload = Buffer.from(`message-${i}`);
            publishPromises.push(publisher.pubsub.publish(topic, payload));
        }

        const start = Date.now();
        await Promise.all(publishPromises);
        await waitForCondition(() => firstSubscriberCalls.size === messageCount, 4000);
        await waitForCondition(() => secondSubscriberCalls.size === messageCount, 4000);
        const duration = Date.now() - start;

        expect(firstSubscriberCalls.size).to.equal(messageCount);
        expect(secondSubscriberCalls.size).to.equal(messageCount);
        expect(duration).to.be.lessThan(4000);

        await subscriberClient.pubsub.unsubscribe(topic);
        await subscriberClient.destroy();
        await publisher.destroy();
    });

    it("maintains throughput under stress while delivering to external peers", async () => {
        const publisher = createMockPubsubClient();
        const externalSubscriber = createMockPubsubClient();
        await waitForMockPubsubConnection();
        const topic = `stress-${randomUUID()}`;
        const totalMessages = 350;
        let receivedCount = 0;
        const receivedIds = new Set();

        await externalSubscriber.pubsub.subscribe(topic, (msg) => {
            const value = Buffer.from(msg.data).toString("utf8");
            receivedIds.add(value);
            receivedCount += 1;
        });

        const startTime = Date.now();
        for (let i = 0; i < totalMessages; i += 1) {
            const payload = Buffer.from(`stress-message-${i}`);
            await publisher.pubsub.publish(topic, payload);
        }

        await waitForCondition(() => receivedCount === totalMessages, 5000);
        const elapsed = Date.now() - startTime;

        expect(receivedCount).to.equal(totalMessages);
        expect(receivedIds.size).to.equal(totalMessages);
        expect(elapsed).to.be.lessThan(6000);

        await externalSubscriber.pubsub.unsubscribe(topic);
        await externalSubscriber.destroy();
        await publisher.destroy();
    });

    it("delivers identical payloads from different publishers without deduplicating them", async () => {
        const publisherA = createMockPubsubClient();
        const publisherB = createMockPubsubClient();
        const subscriber = createMockPubsubClient();
        await waitForMockPubsubConnection();
        const topic = `identical-${randomUUID()}`;
        const received = [];

        await subscriber.pubsub.subscribe(topic, (msg) => {
            received.push(Buffer.from(msg.data).toString("utf8"));
        });

        const payload = Buffer.from("same-payload");
        await publisherA.pubsub.publish(topic, payload);
        await publisherB.pubsub.publish(topic, payload);

        await waitForCondition(() => received.length === 2);
        expect(received).to.deep.equal(["same-payload", "same-payload"]);

        await subscriber.pubsub.unsubscribe(topic);
        await subscriber.destroy();
        await publisherA.destroy();
        await publisherB.destroy();
    });

    it("cleans up socket listeners when subscribing/unsubscribing repeatedly", async () => {
        const client = createMockPubsubClient();
        const publisher = createMockPubsubClient();
        await waitForMockPubsubConnection();
        const topic = `churn-${randomUUID()}`;
        const payload = Buffer.from("ping");

        for (let i = 0; i < 20; i += 1) {
            let calls = 0;
            const handler = () => {
                calls += 1;
            };
            await client.pubsub.subscribe(topic, handler);
            await publisher.pubsub.publish(topic, payload);
            await waitForCondition(() => calls === 1);
            await client.pubsub.unsubscribe(topic, handler);
            await publisher.pubsub.publish(topic, payload);
            await sleep(50);
            expect(calls).to.equal(1, `subscription iteration ${i} should not receive messages after unsubscribe`);
        }

        await client.destroy();
        await publisher.destroy();
    });

    it("allows other clients to continue after one client destroys itself mid-stream", async () => {
        const survivor = createMockPubsubClient();
        const doomed = createMockPubsubClient();
        const publisher = createMockPubsubClient();
        await waitForMockPubsubConnection();
        const topic = `destroy-${randomUUID()}`;
        let survivorCount = 0;
        let doomedCount = 0;

        await survivor.pubsub.subscribe(topic, () => {
            survivorCount += 1;
        });
        await doomed.pubsub.subscribe(topic, () => {
            doomedCount += 1;
        });

        await publisher.pubsub.publish(topic, Buffer.from("first"));
        await waitForCondition(() => survivorCount === 1 && doomedCount === 1);

        await doomed.pubsub.unsubscribe(topic);
        await doomed.destroy();

        await publisher.pubsub.publish(topic, Buffer.from("second"));
        await waitForCondition(() => survivorCount === 2);
        expect(doomedCount).to.equal(1);

        const newcomer = createMockPubsubClient();
        let newcomerCount = 0;
        await newcomer.pubsub.subscribe(topic, () => {
            newcomerCount += 1;
        });
        await publisher.pubsub.publish(topic, Buffer.from("third"));
        await waitForCondition(() => survivorCount === 3 && newcomerCount === 1);

        await newcomer.pubsub.unsubscribe(topic);
        await newcomer.destroy();
        await survivor.pubsub.unsubscribe(topic);
        await survivor.destroy();
        await publisher.destroy();
    });
});
