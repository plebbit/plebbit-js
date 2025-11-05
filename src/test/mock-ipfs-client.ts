import io, { Socket } from "socket.io-client";
import type { PubsubClient, PubsubSubscriptionHandler } from "../types.js";
import { v4 as uuidV4 } from "uuid";

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
        callback: (...args: any[]) => any;
    }[];

    constructor(dropRate?: number) {
        // dropRate should be between 0 and 1
        this.subscriptions = [];

        this.pubsub = {
            publish: async (topic: string, message: Uint8Array) => {
                await ensurePubsubActive();
                if (typeof dropRate === "number") {
                    if (Math.random() > dropRate) ioClient.emit(topic, message);
                } else ioClient.emit(topic, message);
            },
            subscribe: async (topic: string, rawCallback: PubsubSubscriptionHandler) => {
                await ensurePubsubActive();
                const callback = (msg: Buffer) => {
                    //@ts-expect-error
                    rawCallback({ from: undefined, seqno: undefined, topicIDs: undefined, data: new Uint8Array(msg) });
                };
                ioClient.on(topic, callback);
                const uniqueSubId = uuidV4();
                this.subscriptions.push({ topic, rawCallback, callback, subscriptionId: uniqueSubId });
            },
            unsubscribe: async (topic: string, rawCallback?: PubsubSubscriptionHandler) => {
                await ensurePubsubActive();
                if (!rawCallback) {
                    const subscriptionsWithTopic = this.subscriptions.filter((sub) => sub.topic === topic);

                    if (subscriptionsWithTopic.length === 0) return;

                    subscriptionsWithTopic.forEach((sub) => {
                        ioClient.off(topic, sub.callback);
                        ioClient.off(topic, sub.rawCallback); // probably not needed but just to be on the safe side
                    });

                    this.subscriptions = this.subscriptions.filter(
                        (sub) => !subscriptionsWithTopic.map((sub) => sub.subscriptionId).includes(sub.subscriptionId)
                    );
                } else {
                    const toUnsubscribe = this.subscriptions.find((sub) => sub.topic === topic && sub.rawCallback === rawCallback);
                    if (!toUnsubscribe) return;
                    ioClient.off(topic, toUnsubscribe.callback);
                    ioClient.off(topic, toUnsubscribe.rawCallback);
                    this.subscriptions = this.subscriptions.filter((sub) => sub.subscriptionId !== toUnsubscribe.subscriptionId);
                }
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
