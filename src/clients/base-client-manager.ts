import { Plebbit } from "../plebbit/plebbit.js";
import assert from "assert";
import { delay, hideClassPrivateProps, isIpns, isStringDomain, throwWithErrorCode, timestamp } from "../util.js";
import { nativeFunctions } from "../runtime/node/util.js";
import pLimit from "p-limit";
import {
    FailedToFetchCommentIpfsFromGatewaysError,
    FailedToFetchCommentUpdateFromGatewaysError,
    FailedToFetchGenericIpfsFromGatewaysError,
    FailedToFetchPageIpfsFromGatewaysError,
    FailedToFetchSubplebbitFromGatewaysError,
    PlebbitError
} from "../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import type { PubsubMessage } from "../pubsub-messages/types";
import type { ChainTicker, PubsubSubscriptionHandler } from "../types.js";
import * as cborg from "cborg";
import { domainResolverPromiseCache, gatewayFetchPromiseCache, p2pCidPromiseCache } from "../constants.js";
import { sha256 } from "js-sha256";
import last from "it-last";
import { concat as uint8ArrayConcat } from "uint8arrays/concat";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import all from "it-all";
import * as remeda from "remeda";
import { resolveTxtRecord } from "../resolver.js";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { CidPathSchema } from "../schema/schema.js";
import { CID } from "kubo-rpc-client";
import { convertBase58IpnsNameToBase36Cid } from "../signer/util.js";

const DOWNLOAD_LIMIT_BYTES = 1000000; // 1mb

export type LoadType = "subplebbit" | "comment-update" | "comment" | "page-ipfs" | "generic-ipfs";

type GenericGatewayFetch = {
    [gatewayUrl: string]: {
        abortController: AbortController;
        promise: Promise<any>;
        response?: string;
        error?: Error;
        timeoutId: any;
    };
};

export type CachedTextRecordResolve = { timestampSeconds: number; valueOfTextRecord: string };

export type OptionsToLoadFromGateway = {
    recordIpfsType: "ipfs" | "ipns";
    root: string;
    path?: string;
    recordPlebbitType: LoadType;
    abortController: AbortController;
    shouldAbortRequestFunc?: (res: Response) => Promise<PlebbitError | undefined>; // this is called before consuming the body of the gateway response. Can be used to abort and stop the consumption. Should provide an abort error
    validateGatewayResponseFunc: (resObj: { resText: string | undefined; res: Response }) => Promise<void>; // can throw here to trigger a failure in response
    log: Logger;
};

const createUrlFromPathResolution = (gateway: string, opts: OptionsToLoadFromGateway): string => {
    const root = opts.recordIpfsType === "ipfs" ? CID.parse(opts.root).toV1().toString() : convertBase58IpnsNameToBase36Cid(opts.root);
    return `${gateway}/${opts.recordIpfsType}/${root}${opts.path ? "/" + opts.path : ""}`;
};

const createUrlFromSubdomainResolution = (gateway: string, opts: OptionsToLoadFromGateway): string => {
    const gatewayUrl = new URL(gateway);
    const root =
        opts.recordIpfsType === "ipfs"
            ? CID.parse(opts.root).toV1().toString()
            : opts.recordIpfsType === "ipns"
              ? convertBase58IpnsNameToBase36Cid(opts.root)
              : opts.root;

    return `${gatewayUrl.protocol}//${root}.${opts.recordIpfsType}.${gatewayUrl.host}${opts.path ? "/" + opts.path : ""}`;
};

const GATEWAYS_THAT_SUPPORT_SUBDOMAIN_RESOLUTION: Record<string, boolean> = {};

export class BaseClientsManager {
    // Class that has all function but without clients field for maximum interopability

    protected _plebbit: Plebbit;
    _defaultPubsubProviderUrl: string; // The URL of the pubsub that is used by default for pubsub
    _defaultIpfsProviderUrl: string | undefined; // The URL of the ipfs node that is used by default for IPFS ipfs/ipns retrieval
    providerSubscriptions: Record<string, string[]> = {}; // To keep track of subscriptions of each provider

    constructor(plebbit: Plebbit) {
        this._plebbit = plebbit;
        if (plebbit.clients.kuboRpcClients) this._defaultIpfsProviderUrl = remeda.keys.strict(plebbit.clients.kuboRpcClients)[0];
        this._defaultPubsubProviderUrl = remeda.keys.strict(plebbit.clients.pubsubKuboRpcClients)[0]; // TODO Should be the gateway with the best score
        if (this._defaultPubsubProviderUrl) {
            for (const provider of remeda.keys.strict(plebbit.clients.pubsubKuboRpcClients)) this.providerSubscriptions[provider] = [];
        }
        hideClassPrivateProps(this);
    }

    toJSON() {
        return undefined;
    }

    getDefaultPubsub() {
        return this._plebbit.clients.pubsubKuboRpcClients[this._defaultPubsubProviderUrl];
    }

    getDefaultIpfs() {
        assert(this._defaultIpfsProviderUrl);
        assert(this._plebbit.clients.kuboRpcClients[this._defaultIpfsProviderUrl]);
        return this._plebbit.clients.kuboRpcClients[this._defaultIpfsProviderUrl];
    }

    // Pubsub methods

    async pubsubSubscribeOnProvider(pubsubTopic: string, handler: PubsubSubscriptionHandler, pubsubProviderUrl: string) {
        const log = Logger("plebbit-js:plebbit:client-manager:pubsubSubscribeOnProvider");

        const timeBefore = Date.now();
        let error: Error | undefined;
        try {
            // TODO sshould rewrite this to accomodate helia
            await this._plebbit.clients.pubsubKuboRpcClients[pubsubProviderUrl]._client.pubsub.subscribe(pubsubTopic, handler, {
                onError: async (err) => {
                    error = err;
                    log.error(
                        "pubsub callback error, topic",
                        pubsubTopic,
                        "provider url",
                        pubsubProviderUrl,
                        "error",
                        err,
                        "Will unsubscribe and re-attempt to subscribe"
                    );

                    await this._plebbit._stats.recordGatewayFailure(pubsubProviderUrl, "pubsub-subscribe");
                    try {
                        await this.pubsubUnsubscribeOnProvider(pubsubTopic, pubsubProviderUrl, handler);
                    } catch (e) {
                        log.error("Failed to unsubscribe after onError, topic", pubsubTopic, "provider url", pubsubProviderUrl, e);
                    }
                    await this.pubsubSubscribeOnProvider(pubsubTopic, handler, pubsubProviderUrl);
                }
            });
            if (error) throw error;
            await this._plebbit._stats.recordGatewaySuccess(pubsubProviderUrl, "pubsub-subscribe", Date.now() - timeBefore);
            this.providerSubscriptions[pubsubProviderUrl].push(pubsubTopic);
        } catch (e) {
            await this._plebbit._stats.recordGatewayFailure(pubsubProviderUrl, "pubsub-subscribe");
            log.error(`Failed to subscribe to pubsub topic (${pubsubTopic}) to (${pubsubProviderUrl}) due to error`, e);
            throw new PlebbitError("ERR_PUBSUB_FAILED_TO_SUBSCRIBE", { pubsubTopic, pubsubProviderUrl, error: e });
        }
    }

    async pubsubSubscribe(pubsubTopic: string, handler: PubsubSubscriptionHandler) {
        const providersSorted = await this._plebbit._stats.sortGatewaysAccordingToScore("pubsub-subscribe");
        const providerToError: Record<string, PlebbitError> = {};

        for (let i = 0; i < providersSorted.length; i++) {
            const pubsubProviderUrl = providersSorted[i];
            try {
                return this.pubsubSubscribeOnProvider(pubsubTopic, handler, pubsubProviderUrl);
            } catch (e: unknown) {
                providerToError[pubsubProviderUrl] = <PlebbitError>e;
            }
        }

        const combinedError = new PlebbitError("ERR_PUBSUB_FAILED_TO_SUBSCRIBE", { pubsubTopic, providerToError });

        this.emitError(combinedError);
        throw combinedError;
    }

    async pubsubUnsubscribeOnProvider(pubsubTopic: string, pubsubProvider: string, handler?: PubsubSubscriptionHandler) {
        await this._plebbit.clients.pubsubKuboRpcClients[pubsubProvider]._client.pubsub.unsubscribe(pubsubTopic, handler);
        this.providerSubscriptions[pubsubProvider] = this.providerSubscriptions[pubsubProvider].filter(
            (subPubsubTopic) => subPubsubTopic !== pubsubTopic
        );
    }

    async pubsubUnsubscribe(pubsubTopic: string, handler?: PubsubSubscriptionHandler) {
        for (const pubsubProviderUrl of remeda.keys.strict(this._plebbit.clients.pubsubKuboRpcClients)) {
            try {
                await this.pubsubUnsubscribeOnProvider(pubsubTopic, pubsubProviderUrl, handler);
            } catch {}
        }
    }

    protected prePubsubPublishProvider(pubsubTopic: string, pubsubProvider: string) {}

    protected postPubsubPublishProviderSuccess(pubsubTopic: string, pubsubProvider: string) {}

    protected postPubsubPublishProviderFailure(pubsubTopic: string, pubsubProvider: string, error: PlebbitError) {}

    async pubsubPublishOnProvider(pubsubTopic: string, data: PubsubMessage, pubsubProvider: string) {
        const log = Logger("plebbit-js:plebbit:pubsubPublish");
        const dataBinary = cborg.encode(data);
        this.prePubsubPublishProvider(pubsubTopic, pubsubProvider);
        const timeBefore = Date.now();
        try {
            await this._plebbit.clients.pubsubKuboRpcClients[pubsubProvider]._client.pubsub.publish(pubsubTopic, dataBinary);
            this.postPubsubPublishProviderSuccess(pubsubTopic, pubsubProvider);
            this._plebbit._stats.recordGatewaySuccess(pubsubProvider, "pubsub-publish", Date.now() - timeBefore); // Awaiting this statement will bug out tests
        } catch (error) {
            this.postPubsubPublishProviderFailure(pubsubTopic, pubsubProvider, <PlebbitError>error);
            await this._plebbit._stats.recordGatewayFailure(pubsubProvider, "pubsub-publish");
            throwWithErrorCode("ERR_PUBSUB_FAILED_TO_PUBLISH", { pubsubTopic, pubsubProvider, error });
        }
    }

    async pubsubPublish(pubsubTopic: string, data: PubsubMessage): Promise<void> {
        const log = Logger("plebbit-js:plebbit:client-manager:pubsubPublish");
        const providersSorted = await this._plebbit._stats.sortGatewaysAccordingToScore("pubsub-publish");
        const providerToError: Record<string, PlebbitError> = {};

        for (let i = 0; i < providersSorted.length; i++) {
            const pubsubProviderUrl = providersSorted[i];
            try {
                return await this.pubsubPublishOnProvider(pubsubTopic, data, pubsubProviderUrl);
            } catch (e) {
                log.error(`Failed to publish to pubsub topic (${pubsubTopic}) to (${pubsubProviderUrl})`);
            providerToError[pubsubProviderUrl] = <PlebbitError>e;
            }
        }

        const combinedError = new PlebbitError("ERR_PUBSUB_FAILED_TO_PUBLISH", { pubsubTopic, data, providerToError });

        this.emitError(combinedError);
        throw combinedError;
    }

    // Gateway methods

    private async _fetchWithLimit(
        url: string,
        options: { cache: RequestCache; signal: AbortSignal } & Pick<OptionsToLoadFromGateway, "shouldAbortRequestFunc">
    ): Promise<{ resText: string | undefined; res: Response; abortError?: PlebbitError }> {
        // Node-fetch will take care of size limits through options.size, while browsers will process stream manually

        const handleError = (e: Error | PlebbitError) => {
            if (e instanceof PlebbitError) throw e;
            else if (e instanceof Error && e.message.includes("over limit"))
                throw new PlebbitError("ERR_OVER_DOWNLOAD_LIMIT", { url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
            else if (options.signal?.aborted) throw new PlebbitError("ERR_GATEWAY_TIMED_OUT_OR_ABORTED", { url });
            else {
                const errorCode =
                    url.includes("/ipfs/") || url.includes(".ipfs.")
                        ? "ERR_FAILED_TO_FETCH_IPFS_VIA_GATEWAY"
                        : url.includes("/ipns/") || url.includes(".ipns.")
                          ? "ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY"
                          : "ERR_FAILED_TO_FETCH_GENERIC";
                throw new PlebbitError(errorCode, { url, status: res?.status, statusText: res?.statusText, fetchError: String(e) });
            }

            // If error is not related to size limit, then throw it again
        };

        let res: Response;
        // should have a callback after calling fetch, but before streaming the body
        try {
            res = await nativeFunctions.fetch(url, {
                cache: options.cache,
                signal: options.signal,
                //@ts-expect-error, this option is for node-fetch
                size: DOWNLOAD_LIMIT_BYTES
            });

            if (res.status !== 200)
                throw Error("Failed to fetch due to status code: " + res.status + " And res.statusText" + res.statusText);
            if (options.shouldAbortRequestFunc) {
                const abortError = await options.shouldAbortRequestFunc(res);
                if (abortError) {
                    return { res, resText: undefined, abortError: abortError };
                }
            }

            // If getReader is undefined that means node-fetch is used here. node-fetch processes options.size automatically
            if (res?.body?.getReader === undefined) return { resText: await res.text(), res };
        } catch (e) {
            handleError(<Error>e);
        }

        //@ts-expect-error
        if (res?.body?.getReader !== undefined) {
            let totalBytesRead = 0;

            try {
                const reader = res.body.getReader();
                const decoder = new TextDecoder("utf-8");

                let resText: string = "";

                while (true) {
                    const { done, value } = await reader.read();
                    //@ts-ignore
                    if (value) resText += decoder.decode(value);
                    if (done || !value) break;
                    if (value.length + totalBytesRead > DOWNLOAD_LIMIT_BYTES)
                        throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                    totalBytesRead += value.length;
                }
                return { resText, res };
            } catch (e) {
                handleError(<Error>e);
            }
        }

        throw Error("should not reach this block in _fetchWithLimit");
    }

    preFetchGateway(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway) {}

    postFetchGatewaySuccess(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway) {}

    postFetchGatewayFailure(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway, error: PlebbitError) {}

    postFetchGatewayAborted(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway) {}

    async _fetchFromGatewayAndVerifyIfBodyCorrespondsToProvidedCid(
        url: string,
        loadOpts: Omit<OptionsToLoadFromGateway, "validateGatewayResponses">
    ) {
        loadOpts.log.trace(`Fetching url (${url})`);

        const resObj = await this._fetchWithLimit(url, {
            cache: loadOpts.recordIpfsType === "ipfs" ? "force-cache" : "no-store",
            signal: loadOpts.abortController.signal,
            ...loadOpts
        });
        const shouldVerifyBodyAgainstCid = loadOpts.recordIpfsType === "ipfs" && !loadOpts.path;
        if (shouldVerifyBodyAgainstCid && !resObj.resText) throw Error("Can't verify body against cid when there's no body");
        if (shouldVerifyBodyAgainstCid && resObj.resText) await this._verifyContentIsSameAsCid(resObj.resText, loadOpts.root);
        return resObj;
    }

    private async _handleIfGatewayRedirectsToSubdomainResolution(
        gateway: string,
        loadOpts: OptionsToLoadFromGateway,
        res: Response,
        log: Logger
    ) {
        if (GATEWAYS_THAT_SUPPORT_SUBDOMAIN_RESOLUTION[gateway]) return; // already handled, no need to do anything
        if (!res.redirected) return; // if it doesn't redirect to subdomain gateway then the gateway doesn't support subdomain resolution
        const resUrl = new URL(res.url);
        if (resUrl.hostname.includes(`.${loadOpts.recordIpfsType}.`)) {
            log(`Gateway`, gateway, "supports subdomain resolution. Switching url formulation to subdomain resolution");
            GATEWAYS_THAT_SUPPORT_SUBDOMAIN_RESOLUTION[gateway] = true;
        }
    }
    protected async _fetchWithGateway(
        gateway: string,
        loadOpts: OptionsToLoadFromGateway
    ): Promise<{ res: Response; resText: string | undefined } | { error: PlebbitError }> {
        const log = Logger("plebbit-js:plebbit:fetchWithGateway");

        const url = GATEWAYS_THAT_SUPPORT_SUBDOMAIN_RESOLUTION[gateway]
            ? createUrlFromSubdomainResolution(gateway, loadOpts)
            : createUrlFromPathResolution(gateway, loadOpts);

        const timeBefore = Date.now();

        this.preFetchGateway(gateway, loadOpts);
        const cacheKey = url;
        let isUsingCache = true;
        try {
            let resObj: Awaited<ReturnType<typeof this._fetchFromGatewayAndVerifyIfBodyCorrespondsToProvidedCid>>;
            if (gatewayFetchPromiseCache.has(cacheKey)) resObj = await gatewayFetchPromiseCache.get(cacheKey)!;
            else {
                isUsingCache = false;
                const fetchPromise = this._fetchFromGatewayAndVerifyIfBodyCorrespondsToProvidedCid(url, loadOpts);
                gatewayFetchPromiseCache.set(cacheKey, fetchPromise);
                resObj = await fetchPromise;
                if (loadOpts.recordIpfsType === "ipns") gatewayFetchPromiseCache.delete(cacheKey); // ipns should not be cached
            }
            if (resObj.abortError) throw resObj.abortError;

            await loadOpts.validateGatewayResponseFunc(resObj); // should throw if there's an issue
            this.postFetchGatewaySuccess(gateway, loadOpts);
            if (!isUsingCache) await this._plebbit._stats.recordGatewaySuccess(gateway, loadOpts.recordIpfsType, Date.now() - timeBefore);
            await this._handleIfGatewayRedirectsToSubdomainResolution(gateway, loadOpts, resObj.res, log);
            return resObj;
        } catch (e) {
            gatewayFetchPromiseCache.delete(cacheKey);

            if (e instanceof PlebbitError) e.details = { ...e.details, url };

            this.postFetchGatewayFailure(gateway, loadOpts, <PlebbitError>e);
            if (!isUsingCache) await this._plebbit._stats.recordGatewayFailure(gateway, loadOpts.recordIpfsType);
            delete (<PlebbitError>e)!["stack"];
            return { error: <PlebbitError>e };
        }
    }

    protected _firstResolve(promises: Promise<{ res: Response; resText: string } | { error: PlebbitError }>[]) {
        if (promises.length === 0) throw Error("No promises to find the first resolve");
        return new Promise<{ res: { res: Response; resText: string }; i: number }>((resolve) =>
            promises.forEach((promise, i) =>
                promise.then((res) => {
                    if ("resText" in res) resolve({ res, i });
                })
            )
        );
    }

    getGatewayTimeoutMs(loadType: LoadType) {
        return loadType === "subplebbit"
            ? 5 * 60 * 1000 // 5min
            : loadType === "comment"
              ? 60 * 1000 // 1 min
              : loadType === "comment-update"
                ? 2 * 60 * 1000 // 2min
                : 30 * 1000; // 30s for page ipfs and generic ipfs
    }

    async fetchFromMultipleGateways(
        loadOpts: Omit<OptionsToLoadFromGateway, "abortController">
    ): Promise<{ resText: string; res: Response }> {
        const timeoutMs = this._plebbit._clientsManager.getGatewayTimeoutMs(loadOpts.recordPlebbitType);
        const concurrencyLimit = 3;

        const queueLimit = pLimit(concurrencyLimit);

        // Only sort if we have more than 3 gateways
        const gatewaysSorted =
            remeda.keys.strict(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit
                ? remeda.keys.strict(this._plebbit.clients.ipfsGateways)
                : await this._plebbit._stats.sortGatewaysAccordingToScore(loadOpts.recordIpfsType);

        const gatewayFetches: GenericGatewayFetch = {};

        const cleanUp = () => {
            queueLimit.clearQueue();
            Object.values(gatewayFetches).map((gateway) => {
                if (!gateway.response && !gateway.error) gateway.abortController.abort();
                clearTimeout(gateway.timeoutId);
            });
        };

        for (const gateway of gatewaysSorted) {
            const abortController = new AbortController();
            gatewayFetches[gateway] = {
                abortController,
                promise: queueLimit(() => this._fetchWithGateway(gateway, { ...loadOpts, abortController })),
                timeoutId: setTimeout(() => abortController.abort(), timeoutMs)
            };
        }

        const gatewayPromises = Object.values(gatewayFetches).map((fetching) => fetching.promise);

        //@ts-expect-error
        const res: { res: { resText: string; res: Response }; i: number } | { value: { error: PlebbitError } }[] = await Promise.race([
            this._firstResolve(gatewayPromises),
            Promise.allSettled(gatewayPromises)
        ]);
        if (Array.isArray(res)) {
            cleanUp();
            const gatewayToError: Record<string, PlebbitError> = {};
            for (let i = 0; i < res.length; i++) if (res[i]["value"]) gatewayToError[gatewaysSorted[i]] = res[i]["value"].error;

            const combinedError =
                loadOpts.recordPlebbitType === "comment"
                    ? new FailedToFetchCommentIpfsFromGatewaysError({ commentCid: loadOpts.root, gatewayToError, loadOpts })
                    : loadOpts.recordPlebbitType === "comment-update"
                      ? new FailedToFetchCommentUpdateFromGatewaysError({ gatewayToError, loadOpts })
                      : loadOpts.recordPlebbitType === "page-ipfs"
                        ? new FailedToFetchPageIpfsFromGatewaysError({ pageCid: loadOpts.root, gatewayToError, loadOpts })
                        : loadOpts.recordPlebbitType === "subplebbit"
                          ? new FailedToFetchSubplebbitFromGatewaysError({ ipnsName: loadOpts.root, gatewayToError, loadOpts })
                          : new FailedToFetchGenericIpfsFromGatewaysError({ cid: loadOpts.root, gatewayToError, loadOpts });

            throw combinedError;
        } else {
            cleanUp();
            return res.res;
        }
    }

    // IPFS P2P methods
    async resolveIpnsToCidP2P(ipnsName: string): Promise<string> {
        const ipfsClient = this.getDefaultIpfs();

        try {
            const cid = await last(ipfsClient._client.name.resolve(ipnsName, { nocache: true })).then(CidPathSchema.parse); // make sure we're getting a CID path /ipfs/<cid>, and then parse it to <cid>
            return cid;
        } catch (error) {
            if (error instanceof PlebbitError && error.code === "ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS_P2P") throw error;
            else throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS_P2P", { ipnsName, error });
        }
        throw Error("Should not reach this block in resolveIpnsToCidP2P");
    }

    // TODO rename this to _fetchPathP2P
    async _fetchCidP2P(cid: string): Promise<string> {
        const ipfsClient = this.getDefaultIpfs();

        const fetchPromise = async () => {
            const rawData = await all(ipfsClient._client.cat(cid, { length: DOWNLOAD_LIMIT_BYTES })); // Limit is 1mb files
            const data = uint8ArrayConcat(rawData);
            const fileContent = uint8ArrayToString(data);

            if (typeof fileContent !== "string") throwWithErrorCode("ERR_FAILED_TO_FETCH_IPFS_VIA_IPFS", { cid });
            if (fileContent.length === DOWNLOAD_LIMIT_BYTES) {
                const calculatedCid: string = await calculateIpfsHash(fileContent);
                if (calculatedCid !== cid) throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
            }
            return fileContent;
        };

        // TODO the caching of subplebbit ipns should extend to its signature, it's a waste of processing power to verify a subplebbit multiple times
        try {
            if (p2pCidPromiseCache.has(cid)) return <string>await p2pCidPromiseCache.get(cid);
            else {
                const promise = fetchPromise();
                p2pCidPromiseCache.set(cid, promise);
                return await promise;
            }
        } catch (e) {
            p2pCidPromiseCache.delete(cid);
            throw e;
        }
    }

    private async _verifyContentIsSameAsCid(content: string, cid: string) {
        const calculatedCid: string = await calculateIpfsHash(content);
        if (content.length === DOWNLOAD_LIMIT_BYTES && calculatedCid !== cid)
            throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
        if (calculatedCid !== cid) throwWithErrorCode("ERR_CALCULATED_CID_DOES_NOT_MATCH", { calculatedCid, cid });
    }

    // Resolver methods here

    private _getKeyOfCachedDomainTextRecord(domainAddress: string, txtRecord: string) {
        return `${domainAddress}_${txtRecord}`;
    }

    private async _getCachedTextRecord(address: string, txtRecord: "subplebbit-address" | "plebbit-author-address") {
        const cacheKey = this._getKeyOfCachedDomainTextRecord(address, txtRecord);

        const resolveCache: CachedTextRecordResolve | undefined = await this._plebbit._storage.getItem(cacheKey);
        if (remeda.isPlainObject(resolveCache)) {
            const stale = timestamp() - resolveCache.timestampSeconds > 3600; // Only resolve again if cache was stored over an hour ago
            return { stale, ...resolveCache };
        }
        return undefined;
    }

    private async _resolveTextRecordWithCache(
        address: string,
        txtRecord: "subplebbit-address" | "plebbit-author-address"
    ): Promise<string | null> {
        const log = Logger("plebbit-js:client-manager:resolveTextRecord");
        const chain: ChainTicker | undefined = address.endsWith(".eth") ? "eth" : address.endsWith(".sol") ? "sol" : undefined;
        if (!chain) throw Error(`Can't figure out the chain of the address (${address}). Are you sure plebbit-js support this chain?`);
        const chainId = this._plebbit.chainProviders[chain]?.chainId;
        const cachedTextRecord = await this._getCachedTextRecord(address, txtRecord);
        if (cachedTextRecord) {
            if (cachedTextRecord.stale)
                this._resolveTextRecordConcurrently(address, txtRecord, chain, chainId)
                    .then((newTextRecordValue) =>
                        log.trace(`Updated the stale text-record (${txtRecord}) value of address (${address}) to ${newTextRecordValue}`)
                    )
                    .catch((err) => log.error(`Failed to update the stale text record (${txtRecord}) of address (${address})`, err));
            return cachedTextRecord.valueOfTextRecord;
        } else return this._resolveTextRecordConcurrently(address, txtRecord, chain, chainId);
    }

    preResolveTextRecord(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: ChainTicker,
        chainProviderUrl: string,
        staleCache?: CachedTextRecordResolve
    ) {}

    postResolveTextRecordSuccess(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string | null,
        chain: ChainTicker,
        chainProviderUrl: string,
        staleCache?: CachedTextRecordResolve
    ) {}

    postResolveTextRecordFailure(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: ChainTicker,
        chainProviderUrl: string,
        error: Error,
        staleCache?: CachedTextRecordResolve
    ) {}

    private async _resolveTextRecordSingleChainProvider(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: ChainTicker,
        chainproviderUrl: string,
        chainId: number | undefined,
        staleCache?: CachedTextRecordResolve
    ): Promise<string | null | { error: PlebbitError }> {
        this.preResolveTextRecord(address, txtRecordName, chain, chainproviderUrl, staleCache);
        const timeBefore = Date.now();
        const cacheKey = sha256(address + txtRecordName + chain + chainproviderUrl);
        let isUsingCache = true;
        try {
            let resolvedTextRecord: string | null;
            if (domainResolverPromiseCache.has(cacheKey))
                resolvedTextRecord = <string | null>await domainResolverPromiseCache.get(cacheKey);
            else {
                isUsingCache = false;
                const resolvePromise = resolveTxtRecord(address, txtRecordName, chain, chainproviderUrl, chainId);
                domainResolverPromiseCache.set(cacheKey, resolvePromise);
                resolvedTextRecord = await resolvePromise;
            }
            if (typeof resolvedTextRecord === "string" && !isIpns(resolvedTextRecord))
                throwWithErrorCode("ERR_RESOLVED_TEXT_RECORD_TO_NON_IPNS", {
                    resolvedTextRecord,
                    address,
                    txtRecordName,
                    chain,
                    chainproviderUrl
                });
            this.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainproviderUrl, staleCache);
            if (!isUsingCache) await this._plebbit._stats.recordGatewaySuccess(chainproviderUrl, chain, Date.now() - timeBefore);
            return resolvedTextRecord;
        } catch (e) {
            domainResolverPromiseCache.delete(cacheKey);
            const parsedError =
                e instanceof PlebbitError
                    ? e
                    : new PlebbitError("ERR_FAILED_TO_RESOLVE_TEXT_RECORD", {
                          error: e,
                          address,
                          txtRecordName,
                          chain,
                          chainproviderUrl,
                          chainId
                      });
            this.postResolveTextRecordFailure(address, txtRecordName, chain, chainproviderUrl, parsedError, staleCache);
            if (!isUsingCache) await this._plebbit._stats.recordGatewayFailure(chainproviderUrl, chain);
            return { error: parsedError };
        }
    }
    private async _resolveTextRecordConcurrently(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: ChainTicker,
        chainId?: number
    ): Promise<string | null> {
        const log = Logger("plebbit-js:plebbit:client-manager:_resolveTextRecordConcurrently");
        const timeouts = [0, 0, 100, 1000];

        const _firstResolve = (promises: Promise<string | null | { error: PlebbitError }>[]) => {
            return new Promise<string | null>((resolve) =>
                promises.forEach((promise) =>
                    promise.then((res) => {
                        if (typeof res === "string" || res === null) resolve(res);
                    })
                )
            );
        };

        const concurrencyLimit = 3;
        const queueLimit = pLimit(concurrencyLimit);

        for (let i = 0; i < timeouts.length; i++) {
            if (timeouts[i] !== 0) await delay(timeouts[i]);
            const cachedTextRecord = await this._getCachedTextRecord(address, txtRecordName);
            if (cachedTextRecord && !cachedTextRecord.stale) return cachedTextRecord.valueOfTextRecord;
            log.trace(`Retrying to resolve address (${address}) text record (${txtRecordName}) for the ${i}th time`);

            if (!this._plebbit.clients.chainProviders[chain]) {
                throw Error(`Plebbit has no chain provider for (${chain})`);
            }
            // Only sort if we have more than 3 gateways
            const providersSorted =
                this._plebbit.clients.chainProviders[chain].urls.length <= concurrencyLimit
                    ? this._plebbit.clients.chainProviders[chain].urls
                    : await this._plebbit._stats.sortGatewaysAccordingToScore(chain);

            try {
                const providerPromises = providersSorted.map((providerUrl) =>
                    queueLimit(() =>
                        this._resolveTextRecordSingleChainProvider(address, txtRecordName, chain, providerUrl, chainId, cachedTextRecord)
                    )
                );

                //@ts-expect-error
                const resolvedTextRecord: string | null | { value: { error: PlebbitError } }[] = await Promise.race([
                    _firstResolve(providerPromises),
                    Promise.allSettled(providerPromises)
                ]);
                if (Array.isArray(resolvedTextRecord)) {
                    // It means none of the promises settled with string or null, they all failed
                    const errorsCombined: Record<string, PlebbitError> = {};
                    for (let i = 0; i < providersSorted.length; i++) errorsCombined[providersSorted[i]] = resolvedTextRecord[i].value.error;

                    throwWithErrorCode("ERR_FAILED_TO_RESOLVE_TEXT_RECORD", { errors: errorsCombined, address, txtRecordName, chain });
                } else {
                    // result could be either the value of the text record
                    // or null if it doesn't have any value
                    // TODO abort ongoing resolving
                    queueLimit.clearQueue();
                    if (typeof resolvedTextRecord === "string") {
                        // Only cache valid text records, not null
                        const resolvedCache: CachedTextRecordResolve = {
                            timestampSeconds: timestamp(),
                            valueOfTextRecord: resolvedTextRecord
                        };
                        const resolvedCacheKey = this._getKeyOfCachedDomainTextRecord(address, txtRecordName);
                        await this._plebbit._storage.setItem(resolvedCacheKey, resolvedCache);
                    }

                    return resolvedTextRecord;
                }
            } catch (e) {
                if (i === timeouts.length - 1) {
                    log.error(`Failed to resolve address (${address}) text record (${txtRecordName}) using providers `, providersSorted, e);
                    this.emitError(<PlebbitError>e);
                    throw e;
                }
            }
        }

        throw Error("Should not reach this block within _resolveTextRecordConcurrently");
    }

    async resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string | null> {
        assert(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
        if (!isStringDomain(subplebbitAddress)) return subplebbitAddress;
        return this._resolveTextRecordWithCache(subplebbitAddress, "subplebbit-address");
    }

    async clearDomainCache(domainAddress: string, txtRecordName: "subplebbit-address" | "plebbit-author-address") {
        const cacheKey = this._getKeyOfCachedDomainTextRecord(domainAddress, txtRecordName);
        await this._plebbit._storage.removeItem(cacheKey);
    }

    async resolveAuthorAddressIfNeeded(authorAddress: string): Promise<string | null> {
        if (!isStringDomain(authorAddress)) throw new PlebbitError("ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58", { authorAddress });
        return this._resolveTextRecordWithCache(authorAddress, "plebbit-author-address");
    }

    // Misc functions
    emitError(e: PlebbitError) {
        this._plebbit.emit("error", e);
    }
}
