import { Plebbit } from "../plebbit.js";
import assert from "assert";
import { delay, firstResolve, throwWithErrorCode, timestamp } from "../util.js";
import Hash from "ipfs-only-hash";
import { nativeFunctions } from "../runtime/node/util.js";
import pLimit from "p-limit";
import { PlebbitError } from "../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import { Chain, PubsubMessage, PubsubSubscriptionHandler } from "../types.js";
import * as cborg from "cborg";
import { ensResolverPromiseCache, gatewayFetchPromiseCache, p2pCidPromiseCache, p2pIpnsPromiseCache } from "../constants.js";
import { sha256 } from "js-sha256";
import { createLibp2pNode } from "../runtime/node/browser-libp2p-pubsub.js";
import last from "it-last";
import { concat as uint8ArrayConcat } from "uint8arrays/concat";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import all from "it-all";
import lodash from "lodash";

const DOWNLOAD_LIMIT_BYTES = 1000000; // 1mb

export type LoadType = "subplebbit" | "comment-update" | "comment" | "generic-ipfs";

type GenericGatewayFetch = {
    [gatewayUrl: string]: {
        abortController: AbortController;
        promise: Promise<any>;
        response?: string;
        error?: Error;
        timeoutId: any;
    };
};

export class BaseClientsManager {
    // Class that has all function but without clients field for maximum interopability

    protected _plebbit: Plebbit;
    _defaultPubsubProviderUrl: string; // The URL of the pubsub that is used by default for pubsub
    _defaultIpfsProviderUrl: string | undefined; // The URL of the ipfs node that is used by default for IPFS ipfs/ipns retrieval
    providerSubscriptions: Record<string, string[]>; // To keep track of subscriptions of each provider

    constructor(plebbit: Plebbit) {
        this._plebbit = plebbit;
        if (plebbit.clients.ipfsClients)
            this._defaultIpfsProviderUrl = <string>Object.values(plebbit.clients.ipfsClients)[0]?._clientOptions?.url;
        this._defaultPubsubProviderUrl = Object.keys(plebbit.clients.pubsubClients)[0]; // TODO Should be the gateway with the best score
        if (this._defaultPubsubProviderUrl) {
            this.providerSubscriptions = {};
            for (const provider of Object.keys(plebbit.clients.pubsubClients)) this.providerSubscriptions[provider] = [];
        }
    }

    toJSON() {
        return undefined;
    }

    getDefaultPubsub() {
        return this._plebbit.clients.pubsubClients[this._defaultPubsubProviderUrl];
    }

    getDefaultIpfs() {
        assert(this._defaultIpfsProviderUrl);
        assert(this._plebbit.clients.ipfsClients[this._defaultIpfsProviderUrl]);
        
        return this._plebbit.clients.ipfsClients[this._defaultIpfsProviderUrl];
    }

    // Pubsub methods

    async _initializeLibp2pClientIfNeeded() {
        if (this._defaultPubsubProviderUrl !== "browser-libp2p-pubsub")
            throw Error("Default pubsub should be browser-libp2p-pubsub on browser");
        if (!this._plebbit.clients.pubsubClients[this._defaultPubsubProviderUrl]?._client)
            this._plebbit.clients.pubsubClients[this._defaultPubsubProviderUrl] = await createLibp2pNode();
    }

    async pubsubSubscribeOnProvider(pubsubTopic: string, handler: PubsubSubscriptionHandler, pubsubProviderUrl: string) {
        const log = Logger("plebbit-js:plebbit:client-manager:pubsubSubscribeOnProvider");
        if (this._plebbit.browserLibp2pJsPublish) await this._initializeLibp2pClientIfNeeded();

        const timeBefore = Date.now();
        try {
            await this._plebbit.clients.pubsubClients[pubsubProviderUrl]._client.pubsub.subscribe(pubsubTopic, handler);
            await this._plebbit.stats.recordGatewaySuccess(pubsubProviderUrl, "pubsub-subscribe", Date.now() - timeBefore);
            this.providerSubscriptions[pubsubProviderUrl].push(pubsubTopic);
            return;
        } catch (e) {
            await this._plebbit.stats.recordGatewayFailure(pubsubProviderUrl, "pubsub-subscribe");
            log.error(`Failed to subscribe to pubsub topic (${pubsubTopic}) to (${pubsubProviderUrl})`);
            throw new PlebbitError("ERR_PUBSUB_FAILED_TO_SUBSCRIBE", { pubsubTopic, pubsubProviderUrl, error: e });
        }
    }

    async pubsubSubscribe(pubsubTopic: string, handler: PubsubSubscriptionHandler) {
        if (this._plebbit.browserLibp2pJsPublish) await this._initializeLibp2pClientIfNeeded();
        const providersSorted = await this._plebbit.stats.sortGatewaysAccordingToScore("pubsub-subscribe");
        const providerToError: Record<string, PlebbitError> = {};

        for (let i = 0; i < providersSorted.length; i++) {
            const pubsubProviderUrl = providersSorted[i];
            try {
                return this.pubsubSubscribeOnProvider(pubsubTopic, handler, pubsubProviderUrl);
            } catch (e) {
                providerToError[pubsubProviderUrl] = e;
            }
        }

        const combinedError = new PlebbitError("ERR_PUBSUB_FAILED_TO_SUBSCRIBE", { pubsubTopic, providerToError });

        this.emitError(combinedError);
        throw combinedError;
    }

    async pubsubUnsubscribeOnProvider(pubsubTopic: string, pubsubProvider: string, handler?: PubsubSubscriptionHandler) {
        if (this._plebbit.browserLibp2pJsPublish) await this._initializeLibp2pClientIfNeeded();
        await this._plebbit.clients.pubsubClients[pubsubProvider]._client.pubsub.unsubscribe(pubsubTopic, handler);
        this.providerSubscriptions[pubsubProvider] = this.providerSubscriptions[pubsubProvider].filter(
            (subPubsubTopic) => subPubsubTopic !== pubsubTopic
        );
    }

    async pubsubUnsubscribe(pubsubTopic: string, handler?: PubsubSubscriptionHandler) {
        if (this._plebbit.browserLibp2pJsPublish) await this._initializeLibp2pClientIfNeeded();
        for (let i = 0; i < Object.keys(this._plebbit.clients.pubsubClients).length; i++) {
            const pubsubProviderUrl = Object.keys(this._plebbit.clients.pubsubClients)[i];
            try {
                await this.pubsubUnsubscribeOnProvider(pubsubTopic, pubsubProviderUrl, handler);
            } catch {}
        }
    }

    protected prePubsubPublishProvider(pubsubTopic: string, pubsubProvider: string) {}

    protected postPubsubPublishProviderSuccess(pubsubTopic: string, pubsubProvider: string) {}

    protected postPubsubPublishProviderFailure(pubsubTopic: string, pubsubProvider: string, error: PlebbitError) {}

    async pubsubPublishOnProvider(pubsubTopic: string, data: PubsubMessage, pubsubProvider: string) {
        if (this._plebbit.browserLibp2pJsPublish) await this._initializeLibp2pClientIfNeeded();
        const log = Logger("plebbit-js:plebbit:pubsubPublish");
        const dataBinary = cborg.encode(data);
        this.prePubsubPublishProvider(pubsubTopic, pubsubProvider);
        const timeBefore = Date.now();
        try {
            await this._plebbit.clients.pubsubClients[pubsubProvider]._client.pubsub.publish(pubsubTopic, dataBinary);
            this.postPubsubPublishProviderSuccess(pubsubTopic, pubsubProvider);
            this._plebbit.stats.recordGatewaySuccess(pubsubProvider, "pubsub-publish", Date.now() - timeBefore); // Awaiting this statement will bug out tests
        } catch (error) {
            this.postPubsubPublishProviderFailure(pubsubTopic, pubsubProvider, error);
            await this._plebbit.stats.recordGatewayFailure(pubsubProvider, "pubsub-publish");
            throwWithErrorCode("ERR_PUBSUB_FAILED_TO_PUBLISH", { pubsubTopic, pubsubProvider, error });
        }
    }

    async pubsubPublish(pubsubTopic: string, data: PubsubMessage): Promise<void> {
        if (this._plebbit.browserLibp2pJsPublish) await this._initializeLibp2pClientIfNeeded();
        const log = Logger("plebbit-js:plebbit:client-manager:pubsubPublish");
        const providersSorted = await this._plebbit.stats.sortGatewaysAccordingToScore("pubsub-publish");
        const providerToError: Record<string, PlebbitError> = {};

        for (let i = 0; i < providersSorted.length; i++) {
            const pubsubProviderUrl = providersSorted[i];
            try {
                return await this.pubsubPublishOnProvider(pubsubTopic, data, pubsubProviderUrl);
            } catch (e) {
                log.error(`Failed to publish to pubsub topic (${pubsubTopic}) to (${pubsubProviderUrl})`);
                providerToError[pubsubProviderUrl] = e;
            }
        }

        const combinedError = new PlebbitError("ERR_PUBSUB_FAILED_TO_PUBLISH", { pubsubTopic, data, providerToError });

        this.emitError(combinedError);
        throw combinedError;
    }

    // Gateway methods

    private async _fetchWithLimit(url: string, cache: RequestCache, signal: AbortSignal): Promise<string> {
        // Node-fetch will take care of size limits through options.size, while browsers will process stream manually
        let res: Response;
        try {
            res = await nativeFunctions.fetch(url, {
                cache,
                signal,
                //@ts-expect-error, this option is for node-fetch
                size: DOWNLOAD_LIMIT_BYTES
            });
            if (res.status !== 200) throw Error("Failed to fetch");
            // If getReader is undefined that means node-fetch is used here. node-fetch processes options.size automatically
            if (res?.body?.getReader === undefined) return await res.text();
        } catch (e) {
            if (e.message.includes("over limit"))
                throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
            const errorCode = url.includes("/ipfs/")
                ? "ERR_FAILED_TO_FETCH_IPFS_VIA_GATEWAY"
                : url.includes("/ipns/")
                  ? "ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY"
                  : "ERR_FAILED_TO_FETCH_GENERIC";
            throwWithErrorCode(errorCode, { url, status: res?.status, statusText: res?.statusText, fetchError: String(e) });

            // If error is not related to size limit, then throw it again
        }

        //@ts-ignore
        if (res?.body?.getReader !== undefined) {
            let totalBytesRead = 0;

            // @ts-ignore
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
            return resText;
        }
    }

    preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType) {}

    postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType) {}

    postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType, error: PlebbitError) {}

    postFetchGatewayAborted(gatewayUrl: string, path: string, loadType: LoadType) {}

    private async _fetchFromGatewayAndVerifyIfNeeded(loadType: LoadType, url: string, abortController: AbortController, log: Logger) {
        log.trace(`Fetching url (${url})`);

        const isCid = loadType === "comment" || loadType === "generic-ipfs"; // If false, then IPNS

        const resText = await this._fetchWithLimit(url, isCid ? "force-cache" : "no-store", abortController.signal);
        if (isCid) await this._verifyContentIsSameAsCid(resText, url.split("/ipfs/")[1]);
        return resText;
    }
    protected async _fetchWithGateway(
        gateway: string,
        path: string,
        loadType: LoadType,
        abortController: AbortController
    ): Promise<string | undefined | { error: PlebbitError }> {
        const log = Logger("plebbit-js:plebbit:fetchWithGateway");
        const url = `${gateway}${path}`;

        const timeBefore = Date.now();
        const isCid = loadType === "comment" || loadType === "generic-ipfs"; // If false, then IPNS

        this.preFetchGateway(gateway, path, loadType);
        const cacheKey = url;
        let isUsingCache = true;
        try {
            let resText: string;
            if (gatewayFetchPromiseCache.has(cacheKey)) resText = await gatewayFetchPromiseCache.get(cacheKey);
            else {
                isUsingCache = false;
                const fetchPromise = this._fetchFromGatewayAndVerifyIfNeeded(loadType, url, abortController, log);
                gatewayFetchPromiseCache.set(cacheKey, fetchPromise);
                resText = await fetchPromise;
                if (loadType === "subplebbit") gatewayFetchPromiseCache.delete(cacheKey); // ipns should not be cached
            }
            this.postFetchGatewaySuccess(gateway, path, loadType);
            if (!isUsingCache)
                await this._plebbit.stats.recordGatewaySuccess(
                    gateway,
                    isCid || loadType === "comment-update" ? "cid" : "ipns",
                    Date.now() - timeBefore
                );
            return resText;
        } catch (e) {
            gatewayFetchPromiseCache.delete(cacheKey);

            if (e?.details?.fetchError?.includes("AbortError")) {
                this.postFetchGatewayAborted(gateway, path, loadType);
                return undefined;
            } else {
                this.postFetchGatewayFailure(gateway, path, loadType, e);
                if (!isUsingCache) await this._plebbit.stats.recordGatewayFailure(gateway, isCid ? "cid" : "ipns");
                return { error: lodash.omit(<PlebbitError>e, "stack") };
            }
        }
    }

    protected _firstResolve(promises: Promise<string | { error: PlebbitError }>[]) {
        if (promises.length === 0) throw Error("No promises to find the first resolve");
        return new Promise<{ res: string; i: number }>((resolve) =>
            promises.forEach((promise, i) =>
                promise.then((res) => {
                    if (typeof res === "string") resolve({ res, i });
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
                : 30 * 1000; // 30s
    }

    async fetchFromMultipleGateways(loadOpts: { cid?: string; ipns?: string }, loadType: LoadType): Promise<string> {
        assert(loadOpts.cid || loadOpts.ipns);

        const path = loadOpts.cid ? `/ipfs/${loadOpts.cid}` : `/ipns/${loadOpts.ipns}`;

        const type = loadOpts.cid ? "cid" : "ipns";

        const timeoutMs = this._plebbit._clientsManager.getGatewayTimeoutMs(loadType);

        const concurrencyLimit = 3;

        const queueLimit = pLimit(concurrencyLimit);

        // Only sort if we have more than 3 gateways
        const gatewaysSorted =
            Object.keys(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit
                ? Object.keys(this._plebbit.clients.ipfsGateways)
                : await this._plebbit.stats.sortGatewaysAccordingToScore(type);

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
                promise: queueLimit(() => this._fetchWithGateway(gateway, path, loadType, abortController)),
                timeoutId: setTimeout(() => abortController.abort(), timeoutMs)
            };
        }

        const gatewayPromises = Object.values(gatewayFetches).map((fetching) => fetching.promise);

        const res = await Promise.race([this._firstResolve(gatewayPromises), Promise.allSettled(gatewayPromises)]);
        if (Array.isArray(res)) {
            cleanUp();
            const gatewayToError: Record<string, PlebbitError> = {};
            for (let i = 0; i < res.length; i++) if (res[i]["value"]) gatewayToError[gatewaysSorted[i]] = res[i]["value"].error;

            const errorCode = Object.values(gatewayToError)[0].code;
            const combinedError = new PlebbitError(errorCode, { loadOpts, gatewayToError });

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
            let cid: string;
            if (p2pIpnsPromiseCache.has(ipnsName)) cid = await p2pIpnsPromiseCache.get(ipnsName);
            else {
                const cidPromise = last(ipfsClient._client.name.resolve(ipnsName));
                p2pIpnsPromiseCache.set(ipnsName, cidPromise);
                cid = await cidPromise;
                p2pIpnsPromiseCache.delete(ipnsName);
            }
            if (typeof cid !== "string") throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipnsName });
            return cid;
        } catch (error) {
            p2pIpnsPromiseCache.delete(ipnsName);
            if (error?.code === "ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS") throw error;
            else throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipnsName, error });
        }
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
                const calculatedCid: string = await Hash.of(fileContent);
                if (calculatedCid !== cid) throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
            }
            return fileContent;
        };

        // TODO the caching of subplebbit ipns should extend to its signature, it's a waste of processing power to verify a subplebbit multiple times
        try {
            if (p2pCidPromiseCache.has(cid)) return await p2pCidPromiseCache.get(cid);
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
        const calculatedCid: string = await Hash.of(content);
        if (content.length === DOWNLOAD_LIMIT_BYTES && calculatedCid !== cid)
            throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
        if (calculatedCid !== cid) throwWithErrorCode("ERR_CALCULATED_CID_DOES_NOT_MATCH", { calculatedCid, cid });
    }

    // Resolver methods here

    private async _getCachedTextRecord(
        address: string,
        txtRecord: "subplebbit-address" | "plebbit-author-address"
    ): Promise<{ stale: boolean; resolveCache: string | null } | undefined> {
        const resolveCache: string | undefined | null = await this._plebbit._storage.getItem(`${address}_${txtRecord}`);
        if (typeof resolveCache === "string") {
            const resolvedTimestamp: number = await this._plebbit._storage.getItem(`${address}_${txtRecord}_timestamp`);
            assert(typeof resolvedTimestamp === "number", `Cache of address (${address}) txt record (${txtRecord}) has no timestamp`);
            const stale = timestamp() - resolvedTimestamp > 3600; // Only resolve again if cache was stored over an hour ago
            return { stale, resolveCache };
        }
        return undefined;
    }

    private async _resolveTextRecordWithCache(address: string, txtRecord: "subplebbit-address" | "plebbit-author-address") {
        const log = Logger("plebbit-js:client-manager:resolveTextRecord");
        const chain = address.endsWith(".eth") ? "eth" : address.endsWith(".sol") ? "sol" : undefined;
        if (!chain) throw Error(`Can't figure out the chain of the address`);
        const cachedTextRecord = await this._getCachedTextRecord(address, txtRecord);
        if (cachedTextRecord) {
            if (cachedTextRecord.stale) this._resolveTextRecordConcurrently(address, txtRecord, chain);
            return cachedTextRecord.resolveCache;
        } else return this._resolveTextRecordConcurrently(address, txtRecord, chain);
    }

    preResolveTextRecord(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: Chain,
        chainProviderUrl: string
    ) {}

    postResolveTextRecordSuccess(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string,
        chain: Chain,
        chainProviderUrl: string
    ) {}

    postResolveTextRecordFailure(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: Chain,
        chainProviderUrl: string,
        error: Error
    ) {}

    private async _resolveTextRecordSingleChainProvider(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: Chain,
        chainproviderUrl: string
    ) {
        this.preResolveTextRecord(address, txtRecordName, chain, chainproviderUrl);
        const timeBefore = Date.now();
        const cacheKey = sha256(address + txtRecordName + chain + chainproviderUrl);
        let isUsingCache = true;
        try {
            let resolvedTextRecord: string | null;
            if (ensResolverPromiseCache.has(cacheKey)) resolvedTextRecord = await ensResolverPromiseCache.get(cacheKey);
            else {
                isUsingCache = false;
                const resolvePromise = this._plebbit.resolver.resolveTxtRecord(address, txtRecordName, chain, chainproviderUrl);
                ensResolverPromiseCache.set(cacheKey, resolvePromise);
                resolvedTextRecord = await resolvePromise;
            }
            this.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainproviderUrl);
            if (!isUsingCache) await this._plebbit.stats.recordGatewaySuccess(chainproviderUrl, chain, Date.now() - timeBefore);
            return resolvedTextRecord;
        } catch (e) {
            ensResolverPromiseCache.delete(cacheKey);
            this.postResolveTextRecordFailure(address, txtRecordName, chain, chainproviderUrl, e);
            if (!isUsingCache) await this._plebbit.stats.recordGatewayFailure(chainproviderUrl, chain);
            return { error: e };
        }
    }
    private async _resolveTextRecordConcurrently(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: Chain
    ): Promise<string | undefined> {
        const log = Logger("plebbit-js:plebbit:client-manager:_resolveEnsTextRecord");
        const timeouts = [0, 0, 100, 1000];

        const _firstResolve = (promises: Promise<string | null | { error: PlebbitError }>[]) => {
            return new Promise<any>((resolve) =>
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
            if (cachedTextRecord && !cachedTextRecord.stale) return cachedTextRecord.resolveCache;
            log.trace(`Retrying to resolve address (${address}) text record (${txtRecordName}) for the ${i}th time`);

            if (!this._plebbit.clients.chainProviders[chain]) {
                log.error(`Plebbit has no chain provider for (${chain}), `, this._plebbit.clients.chainProviders);
            }
            // Only sort if we have more than 3 gateways
            const providersSorted =
                this._plebbit.clients.chainProviders[chain].urls.length <= concurrencyLimit
                    ? this._plebbit.clients.chainProviders[chain].urls
                    : await this._plebbit.stats.sortGatewaysAccordingToScore(chain);

            try {
                const providerPromises = providersSorted.map((providerUrl) =>
                    queueLimit(() => this._resolveTextRecordSingleChainProvider(address, txtRecordName, chain, providerUrl))
                );

                const resolvedTextRecord: string | null | Promise<{ error: PlebbitError }>[] = await Promise.race([
                    _firstResolve(providerPromises),
                    Promise.allSettled(providerPromises)
                ]);
                if (Array.isArray(resolvedTextRecord)) {
                    // It means none of the promises settled with string or null, they all failed
                    const errorsCombined = {};
                    for (let i = 0; i < providersSorted.length; i++)
                        errorsCombined[providersSorted[i]] = resolvedTextRecord[i]["value"]["error"];

                    throwWithErrorCode("ERR_FAILED_TO_RESOLVE_TEXT_RECORD", { errors: errorsCombined, address, txtRecordName, chain });
                } else {
                    queueLimit.clearQueue();
                    if (typeof resolvedTextRecord === "string") {
                        await this._plebbit._storage.setItem(`${address}_${txtRecordName}`, resolvedTextRecord);
                        await this._plebbit._storage.setItem(`${address}_${txtRecordName}_timestamp`, timestamp());
                    }

                    return resolvedTextRecord;
                }
            } catch (e) {
                if (i === timeouts.length - 1) {
                    log.error(`Failed to resolve address (${address}) text record (${txtRecordName}) using providers `, providersSorted, e);
                    this.emitError(e);
                    throw e;
                }
            }
        }
    }

    async resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string | undefined> {
        assert(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
        if (!this._plebbit.resolver.isDomain(subplebbitAddress)) return subplebbitAddress;
        return this._resolveTextRecordWithCache(subplebbitAddress, "subplebbit-address");
    }

    async resolveAuthorAddressIfNeeded(authorAddress: string) {
        assert(typeof authorAddress === "string", "subplebbitAddress needs to be a string to be resolved");
        if (!this._plebbit.resolver.isDomain(authorAddress)) return authorAddress;
        else if (this._plebbit.plebbitRpcClient) return this._plebbit.plebbitRpcClient.resolveAuthorAddress(authorAddress);
        else return this._resolveTextRecordWithCache(authorAddress, "plebbit-author-address");
    }

    // Misc functions
    emitError(e: PlebbitError) {
        this._plebbit.emit("error", e);
    }
}
