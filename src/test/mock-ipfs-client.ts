import io, { Socket } from "socket.io-client";
import type { PubsubClient, PubsubSubscriptionHandler } from "../types.js";

const port = 25963;

let usersOfMock = 0;
let ioClient: Socket;

class MockPubsubHttpClient {
    public pubsub: PubsubClient["_client"]["pubsub"];
    private subscriptions: { topic: string; rawCallback: PubsubSubscriptionHandler; callback: (...args: any[]) => any }[];

    constructor(dropRate?: number) {
        // dropRate should be between 0 and 1
        this.subscriptions = [];

        this.pubsub = {
            publish: async (topic: string, message: Uint8Array) => {
                if (typeof dropRate === "number") {
                    if (Math.random() > dropRate) ioClient.emit(topic, message);
                } else ioClient.emit(topic, message);
            },
            subscribe: async (topic: string, rawCallback: PubsubSubscriptionHandler) => {
                const callback = (msg: Buffer) => {
                    //@ts-expect-error
                    rawCallback({ from: undefined, seqno: undefined, topicIDs: undefined, data: new Uint8Array(msg) });
                };
                ioClient.on(topic, callback);
                this.subscriptions.push({ topic, rawCallback, callback });
            },
            unsubscribe: async (topic: string, rawCallback?: PubsubSubscriptionHandler) => {
                if (!rawCallback) {
                    ioClient.off(topic);
                    this.subscriptions = this.subscriptions.filter((sub) => sub.topic !== topic);
                } else {
                    const toUnsubscribeIndex = this.subscriptions.findIndex(
                        (sub) => sub.topic === topic && sub.rawCallback === rawCallback
                    );
                    if (toUnsubscribeIndex === -1) return;
                    ioClient.off(topic, this.subscriptions[toUnsubscribeIndex].callback);
                    this.subscriptions = this.subscriptions.filter((_, i) => i !== toUnsubscribeIndex);
                }
            },
            ls: async () => {
                return this.subscriptions.map((sub) => sub.topic);
            },
            peers: async () => []
        };
    }

    async destroy() {
        usersOfMock--;
        if (usersOfMock === 0) {
            await ioClient?.disconnect();
            //@ts-expect-error
            ioClient = undefined;
        }
    }
}

export const createMockPubsubClient = (dropRate?: number): MockPubsubHttpClient => {
    //@ts-expect-error
    if (globalThis["window"] && !globalThis["window"]["io"]) globalThis["window"]["io"] = io(`ws://localhost:${port}`);
    //@ts-expect-error
    if (!ioClient) ioClient = globalThis["window"]?.["io"] || io(`ws://localhost:${port}`);
    usersOfMock++;
    return new MockPubsubHttpClient(dropRate);
};
