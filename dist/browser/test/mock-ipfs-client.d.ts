import { IpfsHttpClientPublicAPI } from "../types";
declare class IpfsHttpClient {
    pubsub: IpfsHttpClientPublicAPI["pubsub"];
    private subscriptions;
    constructor();
}
export declare const create: () => IpfsHttpClient;
export {};
