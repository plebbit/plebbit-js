import { Plebbit } from "../plebbit/plebbit.js";
import { PlebbitError } from "../plebbit-error.js";
import type { PubsubMessage } from "../pubsub-messages/types";
import type { ChainTicker, PubsubSubscriptionHandler } from "../types.js";
export type LoadType = "subplebbit" | "comment-update" | "comment" | "page-ipfs" | "generic-ipfs";
export type CachedResolve = {
    timestampSeconds: number;
    valueOfTextRecord: string | null;
};
export type OptionsToLoadFromGateway = {
    recordIpfsType: "ipfs" | "ipns";
    root: string;
    path?: string;
    recordPlebbitType: LoadType;
};
export declare class BaseClientsManager {
    protected _plebbit: Plebbit;
    _defaultPubsubProviderUrl: string;
    _defaultIpfsProviderUrl: string | undefined;
    providerSubscriptions: Record<string, string[]>;
    constructor(plebbit: Plebbit);
    toJSON(): undefined;
    getDefaultPubsub(): import("../types.js").PubsubClient;
    getDefaultIpfs(): import("../types.js").IpfsClient;
    _initializeLibp2pClientIfNeeded(): Promise<void>;
    pubsubSubscribeOnProvider(pubsubTopic: string, handler: PubsubSubscriptionHandler, pubsubProviderUrl: string): Promise<void>;
    pubsubSubscribe(pubsubTopic: string, handler: PubsubSubscriptionHandler): Promise<void>;
    pubsubUnsubscribeOnProvider(pubsubTopic: string, pubsubProvider: string, handler?: PubsubSubscriptionHandler): Promise<void>;
    pubsubUnsubscribe(pubsubTopic: string, handler?: PubsubSubscriptionHandler): Promise<void>;
    protected prePubsubPublishProvider(pubsubTopic: string, pubsubProvider: string): void;
    protected postPubsubPublishProviderSuccess(pubsubTopic: string, pubsubProvider: string): void;
    protected postPubsubPublishProviderFailure(pubsubTopic: string, pubsubProvider: string, error: PlebbitError): void;
    pubsubPublishOnProvider(pubsubTopic: string, data: PubsubMessage, pubsubProvider: string): Promise<void>;
    pubsubPublish(pubsubTopic: string, data: PubsubMessage): Promise<void>;
    private _fetchWithLimit;
    preFetchGateway(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewaySuccess(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewayFailure(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway, error: PlebbitError): void;
    postFetchGatewayAborted(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    private _fetchFromGatewayAndVerifyIfNeeded;
    private _handleIfGatewayRedirectsToSubdomainResolution;
    protected _fetchWithGateway(gateway: string, loadOpts: OptionsToLoadFromGateway, abortController: AbortController, validateGatewayResponse: (resObj: {
        resText: string;
        res: Response;
    }) => Promise<void>): Promise<{
        res: Response;
        resText: string;
    } | {
        error: PlebbitError;
    }>;
    protected _firstResolve(promises: Promise<{
        res: Response;
        resText: string;
    } | {
        error: PlebbitError;
    }>[]): Promise<{
        res: {
            res: Response;
            resText: string;
        };
        i: number;
    }>;
    getGatewayTimeoutMs(loadType: LoadType): number;
    fetchFromMultipleGateways(loadOpts: OptionsToLoadFromGateway, valiateGatewayResponse: (resObj: {
        resText: string;
        res: Response;
    }) => Promise<void>): Promise<{
        resText: string;
        res: Response;
    }>;
    resolveIpnsToCidP2P(ipnsName: string): Promise<string>;
    _fetchCidP2P(cid: string): Promise<string>;
    private _verifyContentIsSameAsCid;
    private _getKeyOfCachedDomainTextRecord;
    private _getCachedTextRecord;
    private _resolveTextRecordWithCache;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedResolve): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string | null, chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedResolve): void;
    postResolveTextRecordFailure(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, error: Error, staleCache?: CachedResolve): void;
    private _resolveTextRecordSingleChainProvider;
    private _resolveTextRecordConcurrently;
    resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string | null>;
    clearDomainCache(domainAddress: string, txtRecordName: "subplebbit-address" | "plebbit-author-address"): Promise<void>;
    resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string | null>;
    emitError(e: PlebbitError): void;
}
