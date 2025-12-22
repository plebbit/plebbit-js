import io from "socket.io-client";
import { v4 as uuidV4 } from "uuid";
import { Buffer } from "buffer";
import { hideClassPrivateProps } from "../util.js";
const DEFAULT_PORT = 25963;
const defaultServerUrl = `ws://localhost:${DEFAULT_PORT}`;
const sharedConnectionStates = new Map();
const cleanupPendingConnectionWait = (state) => {
    if (state.pendingConnectionHandlers && state.ioClient) {
        state.ioClient.off("connect", state.pendingConnectionHandlers.onConnect);
        state.ioClient.off("connect_error", state.pendingConnectionHandlers.onError);
    }
    state.pendingConnectionHandlers = undefined;
    state.pendingConnectionWait = undefined;
};
const waitForSocketConnection = async (state) => {
    if (!state.ioClient)
        throw new Error("MockPubsubHttpClient has been destroyed");
    if (state.ioClient.connected)
        return;
    if (!state.pendingConnectionWait) {
        state.pendingConnectionWait = new Promise((resolve, reject) => {
            const onConnect = () => {
                cleanupPendingConnectionWait(state);
                resolve();
            };
            const onError = (error) => {
                cleanupPendingConnectionWait(state);
                reject(error ?? new Error("Failed to connect to mock pubsub server"));
            };
            state.pendingConnectionHandlers = { onConnect, onError };
            state.ioClient.once("connect", onConnect);
            state.ioClient.once("connect_error", onError);
        });
    }
    await state.pendingConnectionWait;
};
const ensurePubsubActive = async (state) => {
    if (!state.ioClient)
        throw new Error("MockPubsubHttpClient has been destroyed");
    if (!state.ioClient.active)
        throw new Error("IOClient in MockPubsubHttpClient is not active");
    if (!state.ioClient.connected)
        await waitForSocketConnection(state);
};
class MockPubsubHttpClient {
    constructor(connectionState, dropRate) {
        // dropRate should be between 0 and 1
        this._connectionState = connectionState;
        this.dropRate = dropRate;
        this._subscriptions = [];
        this._recentlyPublishedMessages = new Set();
        this._topicListeners = new Map();
        this.pubsub = {
            publish: async (topic, message) => {
                await ensurePubsubActive(this._connectionState);
                const ioClient = this.getIoClient();
                const messageKey = Buffer.from(message).toString("base64");
                this._recentlyPublishedMessages.add(messageKey);
                setTimeout(() => this._recentlyPublishedMessages.delete(messageKey), 30 * 1000);
                if (typeof this.dropRate === "number") {
                    if (Math.random() > this.dropRate)
                        ioClient.emit(topic, message);
                }
                else
                    ioClient.emit(topic, message);
            },
            subscribe: async (topic, rawCallback) => {
                await ensurePubsubActive(this._connectionState);
                this._ensureTopicListener(topic);
                const uniqueSubId = uuidV4();
                this._subscriptions.push({ topic, rawCallback, subscriptionId: uniqueSubId });
            },
            unsubscribe: async (topic, rawCallback) => {
                await ensurePubsubActive(this._connectionState);
                if (!rawCallback) {
                    const subscriptionsWithTopic = this._subscriptions.filter((sub) => sub.topic === topic);
                    if (subscriptionsWithTopic.length === 0)
                        return;
                    this._subscriptions = this._subscriptions.filter((sub) => !subscriptionsWithTopic.map((sub) => sub.subscriptionId).includes(sub.subscriptionId));
                }
                else {
                    const toUnsubscribe = this._subscriptions.find((sub) => sub.topic === topic && sub.rawCallback === rawCallback);
                    if (!toUnsubscribe)
                        return;
                    this._subscriptions = this._subscriptions.filter((sub) => sub.subscriptionId !== toUnsubscribe.subscriptionId);
                }
                this._cleanupTopicListenerIfUnused(topic);
            },
            ls: async () => {
                await ensurePubsubActive(this._connectionState);
                return this._subscriptions.map((sub) => sub.topic);
            },
            peers: async () => {
                await ensurePubsubActive(this._connectionState);
                return [];
            }
        };
        hideClassPrivateProps(this);
    }
    _ensureTopicListener(topic) {
        if (this._topicListeners.has(topic))
            return;
        const callback = (msg) => {
            const messageKey = msg.toString("base64");
            if (this._recentlyPublishedMessages.has(messageKey)) {
                this._recentlyPublishedMessages.delete(messageKey);
                return;
            }
            const subscriptionsWithTopic = this._subscriptions.filter((sub) => sub.topic === topic);
            if (subscriptionsWithTopic.length === 0)
                return;
            const data = new Uint8Array(msg);
            //@ts-expect-error
            subscriptionsWithTopic.forEach((sub) => sub.rawCallback({ from: undefined, seqno: undefined, topicIDs: undefined, data }));
        };
        this._topicListeners.set(topic, { callback });
        this.getIoClient().on(topic, callback);
    }
    _cleanupTopicListenerIfUnused(topic) {
        if (this._subscriptions.some((sub) => sub.topic === topic))
            return;
        const listener = this._topicListeners.get(topic);
        if (!listener)
            return;
        this._connectionState.ioClient?.off(topic, listener.callback);
        this._topicListeners.delete(topic);
    }
    async destroy() {
        if (this._connectionState.users > 0)
            this._connectionState.users--;
        if (this._connectionState.users === 0) {
            if (this._connectionState.pendingConnectionHandlers) {
                this._connectionState.pendingConnectionHandlers.onError(new Error("MockPubsubHttpClient destroyed before the socket connected"));
            }
            else {
                cleanupPendingConnectionWait(this._connectionState);
            }
            await this._connectionState.ioClient?.disconnect();
            this._connectionState.ioClient = undefined;
            const globalWindow = globalThis.window;
            if (this._connectionState.shouldCleanupWindowIo && globalWindow?.io) {
                delete globalWindow.io;
            }
            this._connectionState.shouldCleanupWindowIo = false;
        }
    }
    getIoClient() {
        const ioClient = this._connectionState.ioClient;
        if (!ioClient)
            throw new Error("MockPubsubHttpClient has been destroyed");
        return ioClient;
    }
}
const createIoClient = (serverUrl) => io(serverUrl);
const createConnectionState = (serverUrl, shouldCleanupWindowIo = false) => ({
    ioClient: createIoClient(serverUrl),
    pendingConnectionWait: undefined,
    pendingConnectionHandlers: undefined,
    users: 0,
    shouldCleanupWindowIo
});
const getOrCreateSharedConnectionState = (serverUrl) => {
    const existingState = sharedConnectionStates.get(serverUrl);
    if (existingState?.ioClient)
        return existingState;
    let createdWindowIo = false;
    let ioClient;
    const globalWindow = globalThis.window;
    if (globalWindow && serverUrl === defaultServerUrl) {
        if (!globalWindow.io) {
            globalWindow.io = createIoClient(serverUrl);
            createdWindowIo = true;
        }
        ioClient = globalWindow.io;
    }
    else {
        ioClient = createIoClient(serverUrl);
    }
    const newState = existingState || {
        pendingConnectionWait: undefined,
        pendingConnectionHandlers: undefined,
        users: 0,
        shouldCleanupWindowIo: createdWindowIo
    };
    newState.ioClient = ioClient;
    newState.shouldCleanupWindowIo = createdWindowIo;
    sharedConnectionStates.set(serverUrl, newState);
    return newState;
};
export const createMockPubsubClient = ({ dropRate, forceNewIoClient, serverUrl } = {}) => {
    const resolvedServerUrl = serverUrl ?? defaultServerUrl;
    if (forceNewIoClient) {
        const dedicatedConnectionState = createConnectionState(resolvedServerUrl);
        dedicatedConnectionState.users++;
        return new MockPubsubHttpClient(dedicatedConnectionState, dropRate);
    }
    const sharedConnectionState = getOrCreateSharedConnectionState(resolvedServerUrl);
    sharedConnectionState.users++;
    return new MockPubsubHttpClient(sharedConnectionState, dropRate);
};
export const waitForMockPubsubConnection = async (serverUrl = defaultServerUrl) => {
    const connectionState = sharedConnectionStates.get(serverUrl);
    if (!connectionState?.ioClient)
        throw new Error("MockPubsubHttpClient has not been instantiated");
    await waitForSocketConnection(connectionState);
};
//# sourceMappingURL=mock-ipfs-client.js.map