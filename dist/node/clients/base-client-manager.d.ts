import { Plebbit } from "../plebbit";
import { MessageHandlerFn } from "ipfs-http-client/types/src/pubsub/subscription-tracker";
import { PlebbitError } from "../plebbit-error";
import { Chain, PubsubMessage } from "../types";
export type LoadType = "subplebbit" | "comment-update" | "comment" | "generic-ipfs";
export declare class BaseClientsManager {
    protected _plebbit: Plebbit;
    _defaultPubsubProviderUrl: string;
    _defaultIpfsProviderUrl: string | undefined;
    providerSubscriptions: Record<string, string[]>;
    constructor(plebbit: Plebbit);
    toJSON(): any;
    getDefaultPubsub(): import("../types").PubsubClient;
    getDefaultIpfs(): import("../types").IpfsClient;
    pubsubSubscribeOnProvider(pubsubTopic: string, handler: MessageHandlerFn, pubsubProviderUrl: string): Promise<void>;
    pubsubSubscribe(pubsubTopic: string, handler: MessageHandlerFn): Promise<void>;
    pubsubUnsubscribeOnProvider(pubsubTopic: string, pubsubProvider: string, handler?: MessageHandlerFn): Promise<void>;
    pubsubUnsubscribe(pubsubTopic: string, handler?: MessageHandlerFn): Promise<void>;
    protected prePubsubPublishProvider(pubsubTopic: string, pubsubProvider: string): void;
    protected postPubsubPublishProviderSuccess(pubsubTopic: string, pubsubProvider: string): void;
    protected postPubsubPublishProviderFailure(pubsubTopic: string, pubsubProvider: string, error: PlebbitError): void;
    pubsubPublishOnProvider(pubsubTopic: string, data: PubsubMessage, pubsubProvider: string): Promise<void>;
    pubsubPublish(pubsubTopic: string, data: PubsubMessage): Promise<void>;
    private _fetchWithLimit;
    preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType): void;
    postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType, error: PlebbitError): void;
    postFetchGatewayAborted(gatewayUrl: string, path: string, loadType: LoadType): void;
    private _fetchFromGatewayAndVerifyIfNeeded;
    protected _fetchWithGateway(gateway: string, path: string, loadType: LoadType, abortController: AbortController): Promise<string | undefined | {
        error: PlebbitError;
    }>;
    protected _firstResolve(promises: Promise<string | {
        error: PlebbitError;
    }>[]): Promise<{
        res: string;
        i: number;
    }>;
    getGatewayTimeoutMs(loadType: LoadType): number;
    fetchFromMultipleGateways(loadOpts: {
        cid?: string;
        ipns?: string;
    }, loadType: LoadType): Promise<string>;
    resolveIpnsToCidP2P(ipnsName: string): Promise<string>;
    _fetchCidP2P(cid: string): Promise<string>;
    private _verifyContentIsSameAsCid;
    private _getCachedTextRecord;
    private _resolveTextRecordWithCache;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: Chain, chainProviderUrl: string): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string, chain: Chain, chainProviderUrl: string): void;
    postResolveTextRecordFailure(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: Chain, chainProviderUrl: string, error: Error): void;
    private _resolveTextRecordSingleChainProvider;
    private _resolveTextRecordConcurrently;
    resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string | undefined>;
    resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string>;
    emitError(e: PlebbitError): void;
}
