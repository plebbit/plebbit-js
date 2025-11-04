import io, { Socket } from "socket.io-client";
import type { PubsubClient, PubsubSubscriptionHandler } from "../types.js";
import { v4 as uuidV4 } from "uuid";

const port = 25963;

let usersOfMock = 0;
let ioClient: Socket;
const ensurePubsubActive = () => {
    if (!ioClient) throw new Error("MockPubsubHttpClient has been destroyed");
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
                ensurePubsubActive();
                if (typeof dropRate === "number") {
                    if (Math.random() > dropRate) ioClient.emit(topic, message);
                } else ioClient.emit(topic, message);
            },
            subscribe: async (topic: string, rawCallback: PubsubSubscriptionHandler) => {
                ensurePubsubActive();
                const callback = (msg: Buffer) => {
                    //@ts-expect-error
                    rawCallback({ from: undefined, seqno: undefined, topicIDs: undefined, data: new Uint8Array(msg) });
                };
                ioClient.on(topic, callback);
                const uniqueSubId = uuidV4();
                this.subscriptions.push({ topic, rawCallback, callback, subscriptionId: uniqueSubId });
            },
            unsubscribe: async (topic: string, rawCallback?: PubsubSubscriptionHandler) => {
                ensurePubsubActive();
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
                ensurePubsubActive();
                return this.subscriptions.map((sub) => sub.topic);
            },
            peers: async () => {
                ensurePubsubActive();
                return [];
            }
        };
    }

    async destroy() {
        usersOfMock--;
        if (usersOfMock === 0) {
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

export const createMockPubsubClient = (dropRate?: number): MockPubsubHttpClient => {
    //@ts-expect-error
    if (globalThis["window"] && !globalThis["window"]["io"]) globalThis["window"]["io"] = io(`ws://localhost:${port}`);
    //@ts-expect-error
    if (!ioClient) ioClient = globalThis["window"]?.["io"] || io(`ws://localhost:${port}`);
    usersOfMock++;
    return new MockPubsubHttpClient(dropRate);
};
