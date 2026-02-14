import { Socket } from "socket.io-client";
import type { PubsubClient } from "../types.js";
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
declare class MockPubsubHttpClient {
    pubsub: PubsubClient["_client"]["pubsub"];
    private _subscriptions;
    private _topicListeners;
    private _recentlyPublishedMessages;
    private readonly _connectionState;
    private readonly dropRate?;
    constructor(connectionState: ConnectionState, dropRate?: number);
    private _ensureTopicListener;
    private _cleanupTopicListenerIfUnused;
    destroy(): Promise<void>;
    private getIoClient;
}
type CreateMockPubsubClientOptions = {
    dropRate?: number;
    forceNewIoClient?: boolean;
    serverUrl?: string;
};
export declare const createMockPubsubClient: ({ dropRate, forceNewIoClient, serverUrl }?: CreateMockPubsubClientOptions) => MockPubsubHttpClient;
export declare const waitForMockPubsubConnection: (serverUrl?: string) => Promise<void>;
export {};
