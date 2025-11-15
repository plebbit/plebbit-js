import io, { Socket } from "socket.io-client";
import type { PubsubClient, PubsubSubscriptionHandler } from "../types.js";
import { v4 as uuidV4 } from "uuid";
import { Buffer } from "buffer";

const port = 25963;

let usersOfMock = 0;
let ioClient: Socket;
let pendingConnectionWait: Promise<void> | undefined;
let pendingConnectionHandlers:
    | {
          onConnect: () => void;
          onError: (error: Error) => void;
      }
    | undefined;

const cleanupPendingConnectionWait = () => {
    if (pendingConnectionHandlers && ioClient) {
        ioClient.off("connect", pendingConnectionHandlers.onConnect);
        ioClient.off("connect_error", pendingConnectionHandlers.onError);
    }
    pendingConnectionHandlers = undefined;
    pendingConnectionWait = undefined;
};

const waitForSocketConnection = async () => {
    if (!ioClient) throw new Error("MockPubsubHttpClient has been destroyed");
    if (ioClient.connected) return;

    if (!pendingConnectionWait) {
        pendingConnectionWait = new Promise<void>((resolve, reject) => {
            const onConnect = () => {
                cleanupPendingConnectionWait();
                resolve();
            };
            const onError = (error: Error) => {
                cleanupPendingConnectionWait();
                reject(error ?? new Error("Failed to connect to mock pubsub server"));
            };

            pendingConnectionHandlers = { onConnect, onError };
            ioClient.once("connect", onConnect);
            ioClient.once("connect_error", onError);
        });
    }

    await pendingConnectionWait;
};

const ensurePubsubActive = async () => {
    if (!ioClient) throw new Error("MockPubsubHttpClient has been destroyed");
    if (!ioClient.active) throw new Error("IOClient in MockPubsubHttpClient is not active");
    if (!ioClient.connected) await waitForSocketConnection();
};

class MockPubsubHttpClient {
    public pubsub: PubsubClient["_client"]["pubsub"];
    private subscriptions: {
        subscriptionId: string;
        topic: string;
        rawCallback: PubsubSubscriptionHandler;
    }[];
    private topicListeners: Map<
        string,
        {
            callback: (msg: Buffer) => void;
        }
    >;
    private recentlyPublishedMessages: Set<string>;

    constructor(dropRate?: number) {
        // dropRate should be between 0 and 1
        this.subscriptions = [];
        this.recentlyPublishedMessages = new Set();
        this.topicListeners = new Map();

        this.pubsub = {
            publish: async (topic: string, message: Uint8Array) => {
                await ensurePubsubActive();
                const messageKey = Buffer.from(message).toString("base64");
                this.recentlyPublishedMessages.add(messageKey);
                setTimeout(() => this.recentlyPublishedMessages.delete(messageKey), 30 * 1000);
                if (typeof dropRate === "number") {
                    if (Math.random() > dropRate) ioClient.emit(topic, message);
                } else ioClient.emit(topic, message);
            },
            subscribe: async (topic: string, rawCallback: PubsubSubscriptionHandler) => {
                await ensurePubsubActive();
                this._ensureTopicListener(topic);
                const uniqueSubId = uuidV4();
                this.subscriptions.push({ topic, rawCallback, subscriptionId: uniqueSubId });
            },
            unsubscribe: async (topic: string, rawCallback?: PubsubSubscriptionHandler) => {
                await ensurePubsubActive();
                if (!rawCallback) {
                    const subscriptionsWithTopic = this.subscriptions.filter((sub) => sub.topic === topic);

                    if (subscriptionsWithTopic.length === 0) return;

                    this.subscriptions = this.subscriptions.filter(
                        (sub) => !subscriptionsWithTopic.map((sub) => sub.subscriptionId).includes(sub.subscriptionId)
                    );
                } else {
                    const toUnsubscribe = this.subscriptions.find((sub) => sub.topic === topic && sub.rawCallback === rawCallback);
                    if (!toUnsubscribe) return;
                    this.subscriptions = this.subscriptions.filter((sub) => sub.subscriptionId !== toUnsubscribe.subscriptionId);
                }
                this._cleanupTopicListenerIfUnused(topic);
            },
            ls: async () => {
                await ensurePubsubActive();
                return this.subscriptions.map((sub) => sub.topic);
            },
            peers: async () => {
                await ensurePubsubActive();
                return [];
            }
        };
    }

    private _ensureTopicListener(topic: string) {
        if (this.topicListeners.has(topic)) return;
        const callback = (msg: Buffer) => {
            const messageKey = msg.toString("base64");
            if (this.recentlyPublishedMessages.has(messageKey)) {
                this.recentlyPublishedMessages.delete(messageKey);
                return;
            }
            const subscriptionsWithTopic = this.subscriptions.filter((sub) => sub.topic === topic);
            if (subscriptionsWithTopic.length === 0) return;
            const data = new Uint8Array(msg);
            //@ts-expect-error
            subscriptionsWithTopic.forEach((sub) => sub.rawCallback({ from: undefined!, seqno: undefined, topicIDs: undefined, data }));
        };
        this.topicListeners.set(topic, { callback });
        ioClient.on(topic, callback);
    }

    private _cleanupTopicListenerIfUnused(topic: string) {
        if (this.subscriptions.some((sub) => sub.topic === topic)) return;
        const listener = this.topicListeners.get(topic);
        if (!listener) return;
        ioClient.off(topic, listener.callback);
        this.topicListeners.delete(topic);
    }

    async destroy() {
        usersOfMock--;
        if (usersOfMock === 0) {
            if (pendingConnectionHandlers) {
                pendingConnectionHandlers.onError(new Error("MockPubsubHttpClient destroyed before the socket connected"));
            } else {
                cleanupPendingConnectionWait();
            }
            await ioClient?.disconnect();
            //@ts-expect-error
            ioClient = undefined;
            //@ts-expect-error
            if (globalThis["window"] && globalThis["window"]["io"]) {
                //@ts-expect-error
                delete globalThis["window"]["io"];
            }
        }
    }
}

export const waitForMockPubsubConnection = async () => {
    if (!ioClient) throw new Error("MockPubsubHttpClient has not been instantiated");
    await waitForSocketConnection();
};

export const createMockPubsubClient = (dropRate?: number): MockPubsubHttpClient => {
    //@ts-expect-error
    if (globalThis["window"] && !globalThis["window"]["io"]) globalThis["window"]["io"] = io(`ws://localhost:${port}`);
    //@ts-expect-error
    if (!ioClient) ioClient = globalThis["window"]?.["io"] || io(`ws://localhost:${port}`);
    usersOfMock++;
    return new MockPubsubHttpClient(dropRate);
};
