import io from "socket.io-client";
import type { EventHandler } from "@libp2p/interfaces/events";
import type { Message } from "@libp2p/interface-pubsub";
import { IpfsHttpClientPublicAPI } from "../types";

const port = 25963;
if (globalThis["window"] && !globalThis["window"]["io"]) globalThis["window"]["io"] = io(`ws://localhost:${port}`);

const ioClient = globalThis["window"]?.["io"] || io(`ws://localhost:${port}`);

class IpfsHttpClient {
    public pubsub: IpfsHttpClientPublicAPI["pubsub"];
    private subscriptions: { topic: string; rawCallback: EventHandler<Message>; callback: (...args: any[]) => any }[];

    constructor() {
        this.subscriptions = [];

        this.pubsub = {
            publish: async (topic: string, message: Uint8Array) => {
                ioClient.emit(topic, message);
            },
            subscribe: async (topic: string, rawCallback: EventHandler<Message>) => {
                const callback = (msg: Buffer) => {
                    //@ts-expect-error
                    rawCallback({ from: undefined, seqno: undefined, topicIDs: undefined, data: new Uint8Array(msg) });
                };
                ioClient.on(topic, callback);
                this.subscriptions.push({ topic, rawCallback, callback });
            },
            unsubscribe: async (topic: string, rawCallback?: EventHandler<Message>) => {
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
}

export const create = () => new IpfsHttpClient();
