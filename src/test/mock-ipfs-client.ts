import io, { Socket } from "socket.io-client";
import type { PubsubClient, PubsubSubscriptionHandler } from "../types.js";
import { v4 as uuidV4 } from "uuid";
import { Buffer } from "buffer";

const port = 25963;

type PendingConnectionHandlers = {
    onConnect: () => void;
    onError: (error: Error) => void;
};

type ConnectionState = {
    ioClient?: Socket;
    pendingConnectionWait?: Promise<void>;
    pendingConnectionHandlers?: PendingConnectionHandlers;
    users: number;
    shouldCleanupWindowIo: boolean;
};

const sharedConnectionState: ConnectionState = {
    users: 0,
    shouldCleanupWindowIo: false
};

const cleanupPendingConnectionWait = (state: ConnectionState) => {
    if (state.pendingConnectionHandlers && state.ioClient) {
        state.ioClient.off("connect", state.pendingConnectionHandlers.onConnect);
        state.ioClient.off("connect_error", state.pendingConnectionHandlers.onError);
    }
    state.pendingConnectionHandlers = undefined;
    state.pendingConnectionWait = undefined;
};

const waitForSocketConnection = async (state: ConnectionState) => {
    if (!state.ioClient) throw new Error("MockPubsubHttpClient has been destroyed");
    if (state.ioClient.connected) return;

    if (!state.pendingConnectionWait) {
        state.pendingConnectionWait = new Promise<void>((resolve, reject) => {
            const onConnect = () => {
                cleanupPendingConnectionWait(state);
                resolve();
            };
            const onError = (error: Error) => {
                cleanupPendingConnectionWait(state);
                reject(error ?? new Error("Failed to connect to mock pubsub server"));
            };

            state.pendingConnectionHandlers = { onConnect, onError };
            state.ioClient!.once("connect", onConnect);
            state.ioClient!.once("connect_error", onError);
        });
    }

    await state.pendingConnectionWait;
};

const ensurePubsubActive = async (state: ConnectionState) => {
    if (!state.ioClient) throw new Error("MockPubsubHttpClient has been destroyed");
    if (!state.ioClient.active) throw new Error("IOClient in MockPubsubHttpClient is not active");
    if (!state.ioClient.connected) await waitForSocketConnection(state);
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
    private readonly connectionState: ConnectionState;
    private readonly dropRate?: number;

    constructor(connectionState: ConnectionState, dropRate?: number) {
        // dropRate should be between 0 and 1
        this.connectionState = connectionState;
        this.dropRate = dropRate;
        this.subscriptions = [];
        this.recentlyPublishedMessages = new Set();
        this.topicListeners = new Map();

        this.pubsub = {
            publish: async (topic: string, message: Uint8Array) => {
                await ensurePubsubActive(this.connectionState);
                const ioClient = this.getIoClient();
                const messageKey = Buffer.from(message).toString("base64");
                this.recentlyPublishedMessages.add(messageKey);
                setTimeout(() => this.recentlyPublishedMessages.delete(messageKey), 30 * 1000);
                if (typeof this.dropRate === "number") {
                    if (Math.random() > this.dropRate) ioClient.emit(topic, message);
                } else ioClient.emit(topic, message);
            },
            subscribe: async (topic: string, rawCallback: PubsubSubscriptionHandler) => {
                await ensurePubsubActive(this.connectionState);
                this._ensureTopicListener(topic);
                const uniqueSubId = uuidV4();
                this.subscriptions.push({ topic, rawCallback, subscriptionId: uniqueSubId });
            },
            unsubscribe: async (topic: string, rawCallback?: PubsubSubscriptionHandler) => {
                await ensurePubsubActive(this.connectionState);
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
                await ensurePubsubActive(this.connectionState);
                return this.subscriptions.map((sub) => sub.topic);
            },
            peers: async () => {
                await ensurePubsubActive(this.connectionState);
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
        this.getIoClient().on(topic, callback);
    }

    private _cleanupTopicListenerIfUnused(topic: string) {
        if (this.subscriptions.some((sub) => sub.topic === topic)) return;
        const listener = this.topicListeners.get(topic);
        if (!listener) return;
        this.connectionState.ioClient?.off(topic, listener.callback);
        this.topicListeners.delete(topic);
    }

    async destroy() {
        if (this.connectionState.users > 0) this.connectionState.users--;
        if (this.connectionState.users === 0) {
            if (this.connectionState.pendingConnectionHandlers) {
                this.connectionState.pendingConnectionHandlers.onError(new Error("MockPubsubHttpClient destroyed before the socket connected"));
            } else {
                cleanupPendingConnectionWait(this.connectionState);
            }
            await this.connectionState.ioClient?.disconnect();
            this.connectionState.ioClient = undefined;
            //@ts-expect-error
            if (this.connectionState.shouldCleanupWindowIo && globalThis["window"] && globalThis["window"]["io"]) {
                //@ts-expect-error
                delete globalThis["window"]["io"];
            }
            this.connectionState.shouldCleanupWindowIo = false;
        }
    }

    private getIoClient(): Socket {
        const ioClient = this.connectionState.ioClient;
        if (!ioClient) throw new Error("MockPubsubHttpClient has been destroyed");
        return ioClient;
    }
}

export const waitForMockPubsubConnection = async () => {
    if (!sharedConnectionState.ioClient) throw new Error("MockPubsubHttpClient has not been instantiated");
    await waitForSocketConnection(sharedConnectionState);
};

type CreateMockPubsubClientOptions = {
    dropRate?: number;
    forceNewIoClient?: boolean;
};

export const createMockPubsubClient = ({ dropRate, forceNewIoClient }: CreateMockPubsubClientOptions = {}): MockPubsubHttpClient => {
    if (forceNewIoClient) {
        const dedicatedConnectionState: ConnectionState = {
            ioClient: io(`ws://localhost:${port}`),
            pendingConnectionWait: undefined,
            pendingConnectionHandlers: undefined,
            users: 0,
            shouldCleanupWindowIo: false
        };
        dedicatedConnectionState.users++;
        return new MockPubsubHttpClient(dedicatedConnectionState, dropRate);
    }

    if (!sharedConnectionState.ioClient) {
        let createdWindowIo = false;
        //@ts-expect-error
        if (globalThis["window"] && !globalThis["window"]["io"]) {
            //@ts-expect-error
            globalThis["window"]["io"] = io(`ws://localhost:${port}`);
            createdWindowIo = true;
        }
        //@ts-expect-error
        sharedConnectionState.ioClient = globalThis["window"]?.["io"] || io(`ws://localhost:${port}`);
        sharedConnectionState.shouldCleanupWindowIo = createdWindowIo;
    }
    sharedConnectionState.users++;

    return new MockPubsubHttpClient(sharedConnectionState, dropRate);
};
