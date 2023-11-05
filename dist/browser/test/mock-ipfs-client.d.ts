import { IpfsHttpClientPublicAPI } from "../types";
declare class IpfsHttpClient {
    pubsub: IpfsHttpClientPublicAPI["pubsub"];
    private subscriptions;
    constructor(dropRate?: number);
}
export declare const createMockIpfsClient: (dropRate?: number) => IpfsHttpClient;
export declare const destroyMockIpfsClient: () => void;
export {};
