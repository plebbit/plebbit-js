import { IpfsClient } from "../types.js";
declare class IpfsHttpClient {
    pubsub: IpfsClient["_client"]["pubsub"];
    private subscriptions;
    constructor(dropRate?: number);
}
export declare const createMockIpfsClient: (dropRate?: number) => IpfsHttpClient;
export declare const destroyMockIpfsClient: () => void;
export {};
