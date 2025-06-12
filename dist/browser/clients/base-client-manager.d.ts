import { Plebbit } from "../plebbit/plebbit.js";
import { PlebbitError } from "../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import type { PubsubMessage } from "../pubsub-messages/types";
import type { ChainTicker, PubsubSubscriptionHandler } from "../types.js";
export type LoadType = "subplebbit" | "comment-update" | "comment" | "page-ipfs" | "generic-ipfs";
export type CachedTextRecordResolve = {
    timestampSeconds: number;
    valueOfTextRecord: string;
};
export type OptionsToLoadFromGateway = {
    recordIpfsType: "ipfs" | "ipns";
    maxFileSizeBytes: number;
    requestHeaders?: Record<string, string>;
    root: string;
    path?: string;
    recordPlebbitType: LoadType;
    abortController: AbortController;
    timeoutMs: number;
    abortRequestErrorBeforeLoadingBodyFunc?: (res: Response) => Promise<PlebbitError | undefined>;
    validateGatewayResponseFunc: (resObj: {
        resText: string | undefined;
        res: Response;
    }) => Promise<void>;
    log: Logger;
};
export declare class BaseClientsManager {
    _plebbit: Plebbit;
    pubsubProviderSubscriptions: Record<string, string[]>;
    constructor(plebbit: Plebbit);
    toJSON(): undefined;
    getDefaultPubsubKuboRpcClientOrHelia(): import("../types.js").PubsubClient | import("../helia/libp2pjsClient.js").Libp2pJsClient;
    getDefaultKuboRpcClientOrHelia(): Plebbit["clients"]["kuboRpcClients"][string] | Plebbit["clients"]["libp2pJsClients"][string];
    getDefaultKuboRpcClient(): import("../types.js").KuboRpcClient;
    getDefaultKuboPubsubClient(): import("../types.js").PubsubClient;
    getIpfsClientWithKuboRpcClientFunctions(): import("../helia/types.js").HeliaWithKuboRpcClientFunctions;
    pubsubSubscribeOnProvider(pubsubTopic: string, handler: PubsubSubscriptionHandler, kuboPubsubRpcUrlOrLibp2pJsKey: string): Promise<void>;
    pubsubSubscribe(pubsubTopic: string, handler: PubsubSubscriptionHandler): Promise<void>;
    pubsubUnsubscribeOnProvider(pubsubTopic: string, kuboPubsubRpcUrlOrLibp2pJsKey: string, handler?: PubsubSubscriptionHandler): Promise<void>;
    pubsubUnsubscribe(pubsubTopic: string, handler?: PubsubSubscriptionHandler): Promise<void>;
    pubsubPublishOnProvider(pubsubTopic: string, data: PubsubMessage, kuboPubsubRpcUrlOrLibp2pJsKey: string): Promise<void>;
    pubsubPublish(pubsubTopic: string, data: PubsubMessage): Promise<void>;
    _fetchWithLimit(url: string, options: {
        cache: RequestCache;
        signal: AbortSignal;
    } & Pick<OptionsToLoadFromGateway, "abortRequestErrorBeforeLoadingBodyFunc" | "maxFileSizeBytes" | "requestHeaders">): Promise<{
        resText: string | undefined;
        res: Response;
        abortError?: PlebbitError;
    }>;
    preFetchGateway(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewaySuccess(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    postFetchGatewayFailure(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway, error: PlebbitError): void;
    postFetchGatewayAborted(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void;
    _fetchFromGatewayAndVerifyIfBodyCorrespondsToProvidedCid(url: string, loadOpts: Omit<OptionsToLoadFromGateway, "validateGatewayResponses">): Promise<{
        resText: string | undefined;
        res: Response;
        abortError?: PlebbitError;
    }>;
    private _handleIfGatewayRedirectsToSubdomainResolution;
    protected _fetchWithGateway(gateway: string, loadOpts: OptionsToLoadFromGateway): Promise<{
        res: Response;
        resText: string | undefined;
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
    fetchFromMultipleGateways(loadOpts: Omit<OptionsToLoadFromGateway, "abortController">): Promise<{
        resText: string;
        res: Response;
    }>;
    resolveIpnsToCidP2P(ipnsName: string, loadOpts: {
        timeoutMs: number;
    }): Promise<string>;
    _fetchCidP2P(cidV0: string, loadOpts: {
        maxFileSizeBytes: number;
        timeoutMs: number;
    }): Promise<string>;
    private _verifyGatewayResponseMatchesCid;
    _getKeyOfCachedDomainTextRecord(domainAddress: string, txtRecord: string): string;
    private _getCachedTextRecord;
    private _resolveTextRecordWithCache;
    preResolveTextRecord(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedTextRecordResolve): void;
    postResolveTextRecordSuccess(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string | null, chain: ChainTicker, chainProviderUrl: string, staleCache?: CachedTextRecordResolve): void;
    postResolveTextRecordFailure(address: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", chain: ChainTicker, chainProviderUrl: string, error: Error, staleCache?: CachedTextRecordResolve): void;
    private _resolveTextRecordSingleChainProvider;
    private _resolveTextRecordConcurrently;
    resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string | null>;
    clearDomainCache(domainAddress: string, txtRecordName: "subplebbit-address" | "plebbit-author-address"): Promise<void>;
    resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string | null>;
    emitError(e: PlebbitError): void;
    calculateIpfsCid(content: string): Promise<string>;
}
