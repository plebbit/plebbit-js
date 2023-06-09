import { Plebbit } from "../plebbit";
import { MessageHandlerFn } from "ipfs-http-client/types/src/pubsub/subscription-tracker";
import { PlebbitError } from "../plebbit-error";
import { Chain, PubsubMessage } from "../types";
export declare type LoadType = "subplebbit" | "comment-update" | "comment" | "generic-ipfs";
export declare const resolvePromises: Record<string, () => Promise<string | null>>;
export declare class BaseClientsManager {
    protected _plebbit: Plebbit;
    _defaultPubsubProviderUrl: string;
    _defaultIpfsProviderUrl: string | undefined;
    constructor(plebbit: Plebbit);
    toJSON(): any;
    getDefaultPubsub(): import("../types").PubsubClient;
    getDefaultIpfs(): import("../types").IpfsClient;
    pubsubSubscribe(pubsubTopic: string, handler: MessageHandlerFn): Promise<void>;
    pubsubUnsubscribe(pubsubTopic: string, handler?: MessageHandlerFn): Promise<void>;
    protected prePubsubPublishProvider(pubsubTopic: string, pubsubProvider: string): void;
    protected postPubsubPublishProviderSuccess(pubsubTopic: string, pubsubProvider: string): void;
    protected postPubsubPublishProviderFailure(pubsubTopic: string, pubsubProvider: string): void;
    protected _publishToPubsubProvider(pubsubTopic: string, data: Uint8Array, pubsubProvider: string): Promise<void>;
    pubsubPublish(pubsubTopic: string, data: PubsubMessage): Promise<void>;
    private _fetchWithLimit;
    preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType): void;
    protected _fetchWithGateway(gateway: string, path: string, loadType: LoadType): Promise<string | {
        error: PlebbitError;
    }>;
    fetchFromMultipleGateways(loadOpts: {
        cid?: string;
        ipns?: string;
    }, loadType: LoadType): Promise<string>;
    resolveIpnsToCidP2P(ipns: string): Promise<string>;
    _fetchCidP2P(cid: string): Promise<string>;
    private _verifyContentIsSameAsCid;
    private _getCachedTextRecord;
    private _resolveTextRecordWithCache;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: Chain, chainProviderUrl: string): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: Chain, chainProviderUrl: string): void;
    postResolveTextRecordFailure(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: Chain, chainProviderUrl: string): void;
    private _resolveTextRecordSingleChainProvider;
    private _resolveTextRecordConcurrently;
    resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string | undefined>;
    resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string>;
    emitError(e: PlebbitError): void;
}
