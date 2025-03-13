import type { KuboRpcClient } from "../types.js";
declare class MockPubsubHttpClient {
    pubsub: KuboRpcClient["_client"]["pubsub"];
    private subscriptions;
    constructor(dropRate?: number);
}
export declare const createMockPubsubClient: (dropRate?: number) => MockPubsubHttpClient;
export declare const destroyMockPubsubClient: () => void;
export {};
