import assert from "assert";
import { delay, isIpns, throwWithErrorCode, timestamp } from "../util.js";
import Hash from "ipfs-only-hash";
import { nativeFunctions } from "../runtime/browser/util.js";
import pLimit from "p-limit";
import { PlebbitError } from "../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import * as cborg from "cborg";
import { domainResolverPromiseCache, gatewayFetchPromiseCache, p2pCidPromiseCache, p2pIpnsPromiseCache } from "../constants.js";
import { sha256 } from "js-sha256";
import { createLibp2pNode } from "../runtime/browser/browser-libp2p-pubsub.js";
import last from "it-last";
import { concat as uint8ArrayConcat } from "uint8arrays/concat";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import all from "it-all";
import lodash from "lodash";
const DOWNLOAD_LIMIT_BYTES = 1000000; // 1mb
export class BaseClientsManager {
    constructor(plebbit) {
        this._plebbit = plebbit;
        if (plebbit.clients.ipfsClients)
            this._defaultIpfsProviderUrl = Object.values(plebbit.clients.ipfsClients)[0]?._clientOptions?.url;
        this._defaultPubsubProviderUrl = Object.keys(plebbit.clients.pubsubClients)[0]; // TODO Should be the gateway with the best score
        if (this._defaultPubsubProviderUrl) {
            this.providerSubscriptions = {};
            for (const provider of Object.keys(plebbit.clients.pubsubClients))
                this.providerSubscriptions[provider] = [];
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
    async pubsubSubscribeOnProvider(pubsubTopic, handler, pubsubProviderUrl) {
        const log = Logger("plebbit-js:plebbit:client-manager:pubsubSubscribeOnProvider");
        if (this._plebbit.browserLibp2pJsPublish)
            await this._initializeLibp2pClientIfNeeded();
        const timeBefore = Date.now();
        try {
            await this._plebbit.clients.pubsubClients[pubsubProviderUrl]._client.pubsub.subscribe(pubsubTopic, handler);
            await this._plebbit.stats.recordGatewaySuccess(pubsubProviderUrl, "pubsub-subscribe", Date.now() - timeBefore);
            this.providerSubscriptions[pubsubProviderUrl].push(pubsubTopic);
            return;
        }
        catch (e) {
            await this._plebbit.stats.recordGatewayFailure(pubsubProviderUrl, "pubsub-subscribe");
            log.error(`Failed to subscribe to pubsub topic (${pubsubTopic}) to (${pubsubProviderUrl})`);
            throw new PlebbitError("ERR_PUBSUB_FAILED_TO_SUBSCRIBE", { pubsubTopic, pubsubProviderUrl, error: e });
        }
    }
    async pubsubSubscribe(pubsubTopic, handler) {
        if (this._plebbit.browserLibp2pJsPublish)
            await this._initializeLibp2pClientIfNeeded();
        const providersSorted = await this._plebbit.stats.sortGatewaysAccordingToScore("pubsub-subscribe");
        const providerToError = {};
        for (let i = 0; i < providersSorted.length; i++) {
            const pubsubProviderUrl = providersSorted[i];
            try {
                return this.pubsubSubscribeOnProvider(pubsubTopic, handler, pubsubProviderUrl);
            }
            catch (e) {
                providerToError[pubsubProviderUrl] = e;
            }
        }
        const combinedError = new PlebbitError("ERR_PUBSUB_FAILED_TO_SUBSCRIBE", { pubsubTopic, providerToError });
        this.emitError(combinedError);
        throw combinedError;
    }
    async pubsubUnsubscribeOnProvider(pubsubTopic, pubsubProvider, handler) {
        if (this._plebbit.browserLibp2pJsPublish)
            await this._initializeLibp2pClientIfNeeded();
        await this._plebbit.clients.pubsubClients[pubsubProvider]._client.pubsub.unsubscribe(pubsubTopic, handler);
        this.providerSubscriptions[pubsubProvider] = this.providerSubscriptions[pubsubProvider].filter((subPubsubTopic) => subPubsubTopic !== pubsubTopic);
    }
    async pubsubUnsubscribe(pubsubTopic, handler) {
        if (this._plebbit.browserLibp2pJsPublish)
            await this._initializeLibp2pClientIfNeeded();
        for (let i = 0; i < Object.keys(this._plebbit.clients.pubsubClients).length; i++) {
            const pubsubProviderUrl = Object.keys(this._plebbit.clients.pubsubClients)[i];
            try {
                await this.pubsubUnsubscribeOnProvider(pubsubTopic, pubsubProviderUrl, handler);
            }
            catch { }
        }
    }
    prePubsubPublishProvider(pubsubTopic, pubsubProvider) { }
    postPubsubPublishProviderSuccess(pubsubTopic, pubsubProvider) { }
    postPubsubPublishProviderFailure(pubsubTopic, pubsubProvider, error) { }
    async pubsubPublishOnProvider(pubsubTopic, data, pubsubProvider) {
        if (this._plebbit.browserLibp2pJsPublish)
            await this._initializeLibp2pClientIfNeeded();
        const log = Logger("plebbit-js:plebbit:pubsubPublish");
        const dataBinary = cborg.encode(data);
        this.prePubsubPublishProvider(pubsubTopic, pubsubProvider);
        const timeBefore = Date.now();
        try {
            await this._plebbit.clients.pubsubClients[pubsubProvider]._client.pubsub.publish(pubsubTopic, dataBinary);
            this.postPubsubPublishProviderSuccess(pubsubTopic, pubsubProvider);
            this._plebbit.stats.recordGatewaySuccess(pubsubProvider, "pubsub-publish", Date.now() - timeBefore); // Awaiting this statement will bug out tests
        }
        catch (error) {
            this.postPubsubPublishProviderFailure(pubsubTopic, pubsubProvider, error);
            await this._plebbit.stats.recordGatewayFailure(pubsubProvider, "pubsub-publish");
            throwWithErrorCode("ERR_PUBSUB_FAILED_TO_PUBLISH", { pubsubTopic, pubsubProvider, error });
        }
    }
    async pubsubPublish(pubsubTopic, data) {
        if (this._plebbit.browserLibp2pJsPublish)
            await this._initializeLibp2pClientIfNeeded();
        const log = Logger("plebbit-js:plebbit:client-manager:pubsubPublish");
        const providersSorted = await this._plebbit.stats.sortGatewaysAccordingToScore("pubsub-publish");
        const providerToError = {};
        for (let i = 0; i < providersSorted.length; i++) {
            const pubsubProviderUrl = providersSorted[i];
            try {
                return await this.pubsubPublishOnProvider(pubsubTopic, data, pubsubProviderUrl);
            }
            catch (e) {
                log.error(`Failed to publish to pubsub topic (${pubsubTopic}) to (${pubsubProviderUrl})`);
                providerToError[pubsubProviderUrl] = e;
            }
        }
        const combinedError = new PlebbitError("ERR_PUBSUB_FAILED_TO_PUBLISH", { pubsubTopic, data, providerToError });
        this.emitError(combinedError);
        throw combinedError;
    }
    // Gateway methods
    async _fetchWithLimit(url, cache, signal) {
        // Node-fetch will take care of size limits through options.size, while browsers will process stream manually
        let res;
        try {
            res = await nativeFunctions.fetch(url, {
                cache,
                signal,
                //@ts-expect-error, this option is for node-fetch
                size: DOWNLOAD_LIMIT_BYTES
            });
            if (res.status !== 200)
                throw Error("Failed to fetch");
            // If getReader is undefined that means node-fetch is used here. node-fetch processes options.size automatically
            if (res?.body?.getReader === undefined)
                return await res.text();
        }
        catch (e) {
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
            let resText = "";
            while (true) {
                const { done, value } = await reader.read();
                //@ts-ignore
                if (value)
                    resText += decoder.decode(value);
                if (done || !value)
                    break;
                if (value.length + totalBytesRead > DOWNLOAD_LIMIT_BYTES)
                    throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                totalBytesRead += value.length;
            }
            return resText;
        }
    }
    preFetchGateway(gatewayUrl, path, loadType) { }
    postFetchGatewaySuccess(gatewayUrl, path, loadType) { }
    postFetchGatewayFailure(gatewayUrl, path, loadType, error) { }
    postFetchGatewayAborted(gatewayUrl, path, loadType) { }
    async _fetchFromGatewayAndVerifyIfNeeded(loadType, url, abortController, log) {
        log.trace(`Fetching url (${url})`);
        const isCid = loadType === "comment" || loadType === "generic-ipfs"; // If false, then IPNS
        const resText = await this._fetchWithLimit(url, isCid ? "force-cache" : "no-store", abortController.signal);
        if (isCid)
            await this._verifyContentIsSameAsCid(resText, url.split("/ipfs/")[1]);
        return resText;
    }
    async _fetchWithGateway(gateway, path, loadType, abortController) {
        const log = Logger("plebbit-js:plebbit:fetchWithGateway");
        const url = `${gateway}${path}`;
        const timeBefore = Date.now();
        const isCid = loadType === "comment" || loadType === "generic-ipfs"; // If false, then IPNS
        this.preFetchGateway(gateway, path, loadType);
        const cacheKey = url;
        let isUsingCache = true;
        try {
            let resText;
            if (gatewayFetchPromiseCache.has(cacheKey))
                resText = await gatewayFetchPromiseCache.get(cacheKey);
            else {
                isUsingCache = false;
                const fetchPromise = this._fetchFromGatewayAndVerifyIfNeeded(loadType, url, abortController, log);
                gatewayFetchPromiseCache.set(cacheKey, fetchPromise);
                resText = await fetchPromise;
                if (loadType === "subplebbit")
                    gatewayFetchPromiseCache.delete(cacheKey); // ipns should not be cached
            }
            this.postFetchGatewaySuccess(gateway, path, loadType);
            if (!isUsingCache)
                await this._plebbit.stats.recordGatewaySuccess(gateway, isCid || loadType === "comment-update" ? "cid" : "ipns", Date.now() - timeBefore);
            return resText;
        }
        catch (e) {
            gatewayFetchPromiseCache.delete(cacheKey);
            if (e?.details?.fetchError?.includes("AbortError")) {
                this.postFetchGatewayAborted(gateway, path, loadType);
                return undefined;
            }
            else {
                this.postFetchGatewayFailure(gateway, path, loadType, e);
                if (!isUsingCache)
                    await this._plebbit.stats.recordGatewayFailure(gateway, isCid ? "cid" : "ipns");
                return { error: lodash.omit(e, "stack") };
            }
        }
    }
    _firstResolve(promises) {
        if (promises.length === 0)
            throw Error("No promises to find the first resolve");
        return new Promise((resolve) => promises.forEach((promise, i) => promise.then((res) => {
            if (typeof res === "string")
                resolve({ res, i });
        })));
    }
    getGatewayTimeoutMs(loadType) {
        return loadType === "subplebbit"
            ? 5 * 60 * 1000 // 5min
            : loadType === "comment"
                ? 60 * 1000 // 1 min
                : loadType === "comment-update"
                    ? 2 * 60 * 1000 // 2min
                    : 30 * 1000; // 30s
    }
    async fetchFromMultipleGateways(loadOpts, loadType) {
        assert(loadOpts.cid || loadOpts.ipns);
        const path = loadOpts.cid ? `/ipfs/${loadOpts.cid}` : `/ipns/${loadOpts.ipns}`;
        const type = loadOpts.cid ? "cid" : "ipns";
        const timeoutMs = this._plebbit._clientsManager.getGatewayTimeoutMs(loadType);
        const concurrencyLimit = 3;
        const queueLimit = pLimit(concurrencyLimit);
        // Only sort if we have more than 3 gateways
        const gatewaysSorted = Object.keys(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit
            ? Object.keys(this._plebbit.clients.ipfsGateways)
            : await this._plebbit.stats.sortGatewaysAccordingToScore(type);
        const gatewayFetches = {};
        const cleanUp = () => {
            queueLimit.clearQueue();
            Object.values(gatewayFetches).map((gateway) => {
                if (!gateway.response && !gateway.error)
                    gateway.abortController.abort();
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
            const gatewayToError = {};
            for (let i = 0; i < res.length; i++)
                if (res[i]["value"])
                    gatewayToError[gatewaysSorted[i]] = res[i]["value"].error;
            const errorCode = Object.values(gatewayToError)[0].code;
            const combinedError = new PlebbitError(errorCode, { loadOpts, gatewayToError });
            throw combinedError;
        }
        else {
            cleanUp();
            return res.res;
        }
    }
    // IPFS P2P methods
    async resolveIpnsToCidP2P(ipnsName) {
        const ipfsClient = this.getDefaultIpfs();
        try {
            let cid;
            if (p2pIpnsPromiseCache.has(ipnsName))
                cid = await p2pIpnsPromiseCache.get(ipnsName);
            else {
                const cidPromise = last(ipfsClient._client.name.resolve(ipnsName));
                p2pIpnsPromiseCache.set(ipnsName, cidPromise);
                cid = await cidPromise;
                p2pIpnsPromiseCache.delete(ipnsName);
            }
            if (typeof cid !== "string")
                throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipnsName });
            return cid;
        }
        catch (error) {
            p2pIpnsPromiseCache.delete(ipnsName);
            if (error?.code === "ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS")
                throw error;
            else
                throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipnsName, error });
        }
    }
    // TODO rename this to _fetchPathP2P
    async _fetchCidP2P(cid) {
        const ipfsClient = this.getDefaultIpfs();
        const fetchPromise = async () => {
            const rawData = await all(ipfsClient._client.cat(cid, { length: DOWNLOAD_LIMIT_BYTES })); // Limit is 1mb files
            const data = uint8ArrayConcat(rawData);
            const fileContent = uint8ArrayToString(data);
            if (typeof fileContent !== "string")
                throwWithErrorCode("ERR_FAILED_TO_FETCH_IPFS_VIA_IPFS", { cid });
            if (fileContent.length === DOWNLOAD_LIMIT_BYTES) {
                const calculatedCid = await Hash.of(fileContent);
                if (calculatedCid !== cid)
                    throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
            }
            return fileContent;
        };
        // TODO the caching of subplebbit ipns should extend to its signature, it's a waste of processing power to verify a subplebbit multiple times
        try {
            if (p2pCidPromiseCache.has(cid))
                return await p2pCidPromiseCache.get(cid);
            else {
                const promise = fetchPromise();
                p2pCidPromiseCache.set(cid, promise);
                return await promise;
            }
        }
        catch (e) {
            p2pCidPromiseCache.delete(cid);
            throw e;
        }
    }
    async _verifyContentIsSameAsCid(content, cid) {
        const calculatedCid = await Hash.of(content);
        if (content.length === DOWNLOAD_LIMIT_BYTES && calculatedCid !== cid)
            throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
        if (calculatedCid !== cid)
            throwWithErrorCode("ERR_CALCULATED_CID_DOES_NOT_MATCH", { calculatedCid, cid });
    }
    // Resolver methods here
    _getKeyOfCachedDomainTextRecord(domainAddress, txtRecord) {
        return `${domainAddress}_${txtRecord}`;
    }
    async _getCachedTextRecord(address, txtRecord) {
        const cacheKey = this._getKeyOfCachedDomainTextRecord(address, txtRecord);
        const resolveCache = await this._plebbit._storage.getItem(cacheKey);
        if (lodash.isPlainObject(resolveCache)) {
            const stale = timestamp() - resolveCache.timestampSeconds > 3600; // Only resolve again if cache was stored over an hour ago
            return { stale, resolveCache: resolveCache.valueOfTextRecord };
        }
        return undefined;
    }
    async _resolveTextRecordWithCache(address, txtRecord) {
        const log = Logger("plebbit-js:client-manager:resolveTextRecord");
        const chain = address.endsWith(".eth") ? "eth" : address.endsWith(".sol") ? "sol" : undefined;
        if (!chain)
            throw Error(`Can't figure out the chain of the address`);
        const cachedTextRecord = await this._getCachedTextRecord(address, txtRecord);
        if (cachedTextRecord) {
            if (cachedTextRecord.stale)
                this._resolveTextRecordConcurrently(address, txtRecord, chain);
            return cachedTextRecord.resolveCache;
        }
        else
            return this._resolveTextRecordConcurrently(address, txtRecord, chain);
    }
    preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl) { }
    postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl) { }
    postResolveTextRecordFailure(address, txtRecordName, chain, chainProviderUrl, error) { }
    async _resolveTextRecordSingleChainProvider(address, txtRecordName, chain, chainproviderUrl) {
        this.preResolveTextRecord(address, txtRecordName, chain, chainproviderUrl);
        const timeBefore = Date.now();
        const cacheKey = sha256(address + txtRecordName + chain + chainproviderUrl);
        let isUsingCache = true;
        try {
            let resolvedTextRecord;
            if (domainResolverPromiseCache.has(cacheKey))
                resolvedTextRecord = await domainResolverPromiseCache.get(cacheKey);
            else {
                isUsingCache = false;
                const resolvePromise = this._plebbit.resolver.resolveTxtRecord(address, txtRecordName, chain, chainproviderUrl);
                domainResolverPromiseCache.set(cacheKey, resolvePromise);
                resolvedTextRecord = await resolvePromise;
            }
            if (typeof resolvedTextRecord === "string" && !isIpns(resolvedTextRecord))
                throw Error("Resolved text record to a non IPNS string");
            this.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainproviderUrl);
            if (!isUsingCache)
                await this._plebbit.stats.recordGatewaySuccess(chainproviderUrl, chain, Date.now() - timeBefore);
            return resolvedTextRecord;
        }
        catch (e) {
            domainResolverPromiseCache.delete(cacheKey);
            this.postResolveTextRecordFailure(address, txtRecordName, chain, chainproviderUrl, e);
            if (!isUsingCache)
                await this._plebbit.stats.recordGatewayFailure(chainproviderUrl, chain);
            return { error: e };
        }
    }
    async _resolveTextRecordConcurrently(address, txtRecordName, chain) {
        const log = Logger("plebbit-js:plebbit:client-manager:_resolveTextRecordConcurrently");
        const timeouts = [0, 0, 100, 1000];
        const _firstResolve = (promises) => {
            return new Promise((resolve) => promises.forEach((promise) => promise.then((res) => {
                if (typeof res === "string" || res === null)
                    resolve(res);
            })));
        };
        const concurrencyLimit = 3;
        const queueLimit = pLimit(concurrencyLimit);
        for (let i = 0; i < timeouts.length; i++) {
            if (timeouts[i] !== 0)
                await delay(timeouts[i]);
            const cachedTextRecord = await this._getCachedTextRecord(address, txtRecordName);
            if (cachedTextRecord && !cachedTextRecord.stale)
                return cachedTextRecord.resolveCache;
            log.trace(`Retrying to resolve address (${address}) text record (${txtRecordName}) for the ${i}th time`);
            if (!this._plebbit.clients.chainProviders[chain]) {
                throw Error(`Plebbit has no chain provider for (${chain})`);
            }
            // Only sort if we have more than 3 gateways
            const providersSorted = this._plebbit.clients.chainProviders[chain].urls.length <= concurrencyLimit
                ? this._plebbit.clients.chainProviders[chain].urls
                : await this._plebbit.stats.sortGatewaysAccordingToScore(chain);
            try {
                const providerPromises = providersSorted.map((providerUrl) => queueLimit(() => this._resolveTextRecordSingleChainProvider(address, txtRecordName, chain, providerUrl)));
                const resolvedTextRecord = await Promise.race([
                    _firstResolve(providerPromises),
                    Promise.allSettled(providerPromises)
                ]);
                if (Array.isArray(resolvedTextRecord)) {
                    // It means none of the promises settled with string or null, they all failed
                    const errorsCombined = {};
                    for (let i = 0; i < providersSorted.length; i++)
                        errorsCombined[providersSorted[i]] = resolvedTextRecord[i]["value"]["error"];
                    throwWithErrorCode("ERR_FAILED_TO_RESOLVE_TEXT_RECORD", { errors: errorsCombined, address, txtRecordName, chain });
                }
                else {
                    queueLimit.clearQueue();
                    if (typeof resolvedTextRecord === "string") {
                        // Only cache valid text records, not null
                        const resolvedCache = { timestampSeconds: timestamp(), valueOfTextRecord: resolvedTextRecord };
                        const resolvedCacheKey = this._getKeyOfCachedDomainTextRecord(address, txtRecordName);
                        await this._plebbit._storage.setItem(resolvedCacheKey, resolvedCache);
                    }
                    return resolvedTextRecord;
                }
            }
            catch (e) {
                if (i === timeouts.length - 1) {
                    log.error(`Failed to resolve address (${address}) text record (${txtRecordName}) using providers `, providersSorted, e);
                    this.emitError(e);
                    throw e;
                }
            }
        }
    }
    async resolveSubplebbitAddressIfNeeded(subplebbitAddress) {
        assert(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
        if (!this._plebbit.resolver.isDomain(subplebbitAddress))
            return subplebbitAddress;
        return this._resolveTextRecordWithCache(subplebbitAddress, "subplebbit-address");
    }
    async clearDomainCache(domainAddress, txtRecordName) {
        const cacheKey = this._getKeyOfCachedDomainTextRecord(domainAddress, txtRecordName);
        await this._plebbit._storage.removeItem(cacheKey);
    }
    async resolveAuthorAddressIfNeeded(authorAddress) {
        assert(typeof authorAddress === "string", "subplebbitAddress needs to be a string to be resolved");
        if (!this._plebbit.resolver.isDomain(authorAddress))
            return authorAddress;
        else if (this._plebbit.plebbitRpcClient)
            return this._plebbit.plebbitRpcClient.resolveAuthorAddress(authorAddress);
        else
            return this._resolveTextRecordWithCache(authorAddress, "plebbit-author-address");
    }
    // Misc functions
    emitError(e) {
        this._plebbit.emit("error", e);
    }
}
//# sourceMappingURL=base-client-manager.js.map