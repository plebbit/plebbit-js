import { expect } from "chai";
import { describe, it, beforeAll, afterAll } from "vitest";
import { Server } from "socket.io";
import { io as createSocketClient } from "socket.io-client";
import { randomUUID } from "crypto";
import { Buffer } from "buffer";

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

const createIsolatedMockPubsubClient = () => {
    const socket = createSocketClient(`ws://localhost:${PORT}`, { forceNew: true, transports: ["websocket"] });
    const topicListeners = new Map();
    const recentlyPublished = new Set();

    const ensureConnected = async () => {
        if (socket.connected) return;
        await new Promise((resolve, reject) => {
            const onConnect = () => {
                socket.off("connect_error", onError);
                resolve(undefined);
            };
            const onError = (err) => {
                socket.off("connect", onConnect);
                reject(err ?? new Error("Failed to connect to mock pubsub server"));
            };
            socket.once("connect", onConnect);
            socket.once("connect_error", onError);
        });
    };

    const publish = async (topic, message) => {
        await ensureConnected();
        const buffer = Buffer.isBuffer(message) ? message : Buffer.from(message);
        const key = `${topic}:${buffer.toString("base64")}`;
        recentlyPublished.add(key);
        setTimeout(() => recentlyPublished.delete(key), 30_000);
        socket.emit(topic, buffer);
    };

    const subscribe = async (topic, handler) => {
        await ensureConnected();
        if (!topicListeners.has(topic)) {
            const callbacks = new Set();
            const listener = (message) => {
                const buffer = Buffer.isBuffer(message) ? message : Buffer.from(message);
                const key = `${topic}:${buffer.toString("base64")}`;
                if (recentlyPublished.has(key)) {
                    recentlyPublished.delete(key);
                    return;
                }
                const data = new Uint8Array(buffer);
                callbacks.forEach((cb) => cb({ data }));
            };
            topicListeners.set(topic, { callbacks, listener });
            socket.on(topic, listener);
        }
        topicListeners.get(topic).callbacks.add(handler);
    };

    const unsubscribe = async (topic, handler) => {
        await ensureConnected();
        const entry = topicListeners.get(topic);
        if (!entry) return;
        if (handler) entry.callbacks.delete(handler);
        else entry.callbacks.clear();
        if (entry.callbacks.size === 0) {
            socket.off(topic, entry.listener);
            topicListeners.delete(topic);
        }
    };

    const destroy = async () => {
        topicListeners.forEach((entry, topic) => socket.off(topic, entry.listener));
        topicListeners.clear();
        if (!socket.connected) {
            socket.disconnect();
            return;
        }
        await new Promise((resolve) => {
            socket.once("disconnect", () => resolve(undefined));
            socket.disconnect();
        });
    };

    return {
        pubsub: {
            publish,
            subscribe,
            unsubscribe,
            ls: async () => {
                await ensureConnected();
                return Array.from(topicListeners.keys());
            },
            peers: async () => {
                await ensureConnected();
                return [];
            }
        },
        destroy
    };
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
        const client = createIsolatedMockPubsubClient();
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
        const publisher = createIsolatedMockPubsubClient();
        const subscriberClient = createIsolatedMockPubsubClient();
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
        const publisher = createIsolatedMockPubsubClient();
        const externalSubscriber = createIsolatedMockPubsubClient();
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

    it("delivers sequential ~30kb publications within the challenge verification deadline", async () => {
        const publisher = createIsolatedMockPubsubClient();
        const subscriber = createIsolatedMockPubsubClient();
        const topic = `deadline-${randomUUID()}`;
        const totalPublications = 400;
        const payloadSize = 30 * 1024;
        const sendTimes = new Map();
        const observedLatencies = [];

        await subscriber.pubsub.subscribe(topic, (msg) => {
            const buffer = Buffer.from(msg.data);
            if (buffer.length !== payloadSize) return;
            const index = buffer.readUInt32BE(0);
            if (sendTimes.has(index)) {
                observedLatencies.push(Date.now() - sendTimes.get(index));
            }
        });

        const publishPromises = [];
        for (let i = 0; i < totalPublications; i += 1) {
            const payloadBuffer = Buffer.alloc(payloadSize, 0x78);
            payloadBuffer.writeUInt32BE(i, 0);
            sendTimes.set(i, Date.now());
            publishPromises.push(publisher.pubsub.publish(topic, payloadBuffer));
        }

        await Promise.all(publishPromises);

        await waitForCondition(() => observedLatencies.length === totalPublications, 5000);
        expect(observedLatencies.length).to.equal(totalPublications);
        const maxLatency = Math.max(...observedLatencies);
        const avgLatency = observedLatencies.reduce((acc, cur) => acc + cur, 0) / observedLatencies.length;

        expect(maxLatency).to.be.lessThan(2000, "mock pubsub server exceeded 10s challenge deadline");
        expect(avgLatency).to.be.lessThan(500);

        await subscriber.pubsub.unsubscribe(topic);
        await subscriber.destroy();
        await publisher.destroy();
    });

    it("delivers identical payloads from different publishers without deduplicating them", async () => {
        const publisherA = createIsolatedMockPubsubClient();
        const publisherB = createIsolatedMockPubsubClient();
        const subscriber = createIsolatedMockPubsubClient();
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
        const client = createIsolatedMockPubsubClient();
        const publisher = createIsolatedMockPubsubClient();
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
        const survivor = createIsolatedMockPubsubClient();
        const doomed = createIsolatedMockPubsubClient();
        const publisher = createIsolatedMockPubsubClient();
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

        const newcomer = createIsolatedMockPubsubClient();
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
