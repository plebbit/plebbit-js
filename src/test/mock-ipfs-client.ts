import io, { Socket } from "socket.io-client";
import { MessageHandlerFn } from "ipfs-http-client/types/src/pubsub/subscription-tracker";
import { IpfsHttpClientPublicAPI } from "../types";
import lodash from "lodash";

const port = 25963;
class IpfsHttpClient {
    public pubsub: IpfsHttpClientPublicAPI["pubsub"];
    private ioClient: Socket;
    private subscriptions: { topic: string; rawCallback: MessageHandlerFn; callback: (...args: any[]) => any }[];

    constructor(isSubplebbit: boolean) {
        this.ioClient = io(`ws://localhost:${port}`, { extraHeaders: { IsSubplebbit: String(isSubplebbit) } });
        this.subscriptions = [];

        this.pubsub = {
            publish: async (topic: string, message: Uint8Array) => {
                this.ioClient.emit(topic, message);
            },
            subscribe: async (topic: string, rawCallback: MessageHandlerFn) => {
                const callback = (msg: Buffer) => {
                    rawCallback({ from: undefined, seqno: undefined, topicIDs: undefined, data: new Uint8Array(msg) });
                };
                this.ioClient.on(topic, callback);
                this.subscriptions.push({ topic, rawCallback, callback });
            },
            unsubscribe: async (topic: string, rawCallback?: MessageHandlerFn) => {
                if (!rawCallback) {
                    this.ioClient.off(topic);
                    this.subscriptions = this.subscriptions.filter((sub) => sub.topic !== topic);
                } else {
                    const toUnsubscribeIndex = this.subscriptions.findIndex(
                        (sub) => sub.topic === topic && sub.rawCallback === rawCallback
                    );
                    if (toUnsubscribeIndex === -1) return;
                    this.ioClient.off(topic, this.subscriptions[toUnsubscribeIndex].callback);
                    this.subscriptions = this.subscriptions.filter((_, i) => i !== toUnsubscribeIndex);
                }
            },
            ls: async () => {
                return this.subscriptions.map((sub) => sub.topic);
            }
        };
    }
}

export const create = (isSubplebbit: boolean) => new IpfsHttpClient(isSubplebbit);
