import assert from "assert";
import { calculateIpfsCidV0, delay, hideClassPrivateProps, isIpns, isStringDomain, throwWithErrorCode, timestamp } from "../util.js";
import { nativeFunctions } from "../runtime/browser/util.js";
import pLimit from "p-limit";
import { FailedToFetchCommentIpfsFromGatewaysError, FailedToFetchCommentUpdateFromGatewaysError, FailedToFetchGenericIpfsFromGatewaysError, FailedToFetchPageIpfsFromGatewaysError, FailedToFetchSubplebbitFromGatewaysError, PlebbitError } from "../plebbit-error.js";
import Logger from "@plebbit/plebbit-logger";
import * as cborg from "cborg";
import last from "it-last";
import { concat as uint8ArrayConcat } from "uint8arrays/concat";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import all from "it-all";
import * as remeda from "remeda";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { CidPathSchema } from "../schema/schema.js";
import { CID } from "kubo-rpc-client";
import { convertBase58IpnsNameToBase36Cid } from "../signer/util.js";
import pTimeout from "p-timeout";
const createUrlFromPathResolution = (gateway, opts) => {
    const root = opts.recordIpfsType === "ipfs" ? CID.parse(opts.root).toV1().toString() : convertBase58IpnsNameToBase36Cid(opts.root);
    return `${gateway}/${opts.recordIpfsType}/${root}${opts.path ? "/" + opts.path : ""}`;
};
const createUrlFromSubdomainResolution = (gateway, opts) => {
    const gatewayUrl = new URL(gateway);
    const root = opts.recordIpfsType === "ipfs"
        ? CID.parse(opts.root).toV1().toString()
        : opts.recordIpfsType === "ipns"
            ? convertBase58IpnsNameToBase36Cid(opts.root)
            : opts.root;
    return `${gatewayUrl.protocol}//${root}.${opts.recordIpfsType}.${gatewayUrl.host}${opts.path ? "/" + opts.path : ""}`;
};
const GATEWAYS_THAT_SUPPORT_SUBDOMAIN_RESOLUTION = {}; // gateway url -> whether it supports subdomain resolution
export class BaseClientsManager {
    constructor(plebbit) {
        this.providerSubscriptions = {}; // To keep track of subscriptions of each provider
        this._plebbit = plebbit;
        if (plebbit.clients.kuboRpcClients)
            this._defaultIpfsProviderUrl = remeda.keys.strict(plebbit.clients.kuboRpcClients)[0];
        this._defaultPubsubProviderUrl = remeda.keys.strict(plebbit.clients.pubsubKuboRpcClients)[0]; // TODO Should be the gateway with the best score
        if (this._defaultPubsubProviderUrl) {
            for (const provider of remeda.keys.strict(plebbit.clients.pubsubKuboRpcClients))
                this.providerSubscriptions[provider] = [];
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
    async pubsubSubscribeOnProvider(pubsubTopic, handler, pubsubProviderUrl) {
        const log = Logger("plebbit-js:plebbit:client-manager:pubsubSubscribeOnProvider");
        const timeBefore = Date.now();
        let error;
        try {
            // TODO sshould rewrite this to accomodate helia
            await this._plebbit.clients.pubsubKuboRpcClients[pubsubProviderUrl]._client.pubsub.subscribe(pubsubTopic, handler, {
                onError: async (err) => {
                    error = err;
                    log.error("pubsub callback error, topic", pubsubTopic, "provider url", pubsubProviderUrl, "error", err, "Will unsubscribe and re-attempt to subscribe");
                    await this._plebbit._stats.recordGatewayFailure(pubsubProviderUrl, "pubsub-subscribe");
                    try {
                        await this.pubsubUnsubscribeOnProvider(pubsubTopic, pubsubProviderUrl, handler);
                    }
                    catch (e) {
                        log.error("Failed to unsubscribe after onError, topic", pubsubTopic, "provider url", pubsubProviderUrl, e);
                    }
                    await this.pubsubSubscribeOnProvider(pubsubTopic, handler, pubsubProviderUrl);
                }
            });
            if (error)
                throw error;
            await this._plebbit._stats.recordGatewaySuccess(pubsubProviderUrl, "pubsub-subscribe", Date.now() - timeBefore);
            this.providerSubscriptions[pubsubProviderUrl].push(pubsubTopic);
        }
        catch (e) {
            await this._plebbit._stats.recordGatewayFailure(pubsubProviderUrl, "pubsub-subscribe");
            log.error(`Failed to subscribe to pubsub topic (${pubsubTopic}) to (${pubsubProviderUrl}) due to error`, e);
            throw new PlebbitError("ERR_PUBSUB_FAILED_TO_SUBSCRIBE", { pubsubTopic, pubsubProviderUrl, error: e });
        }
    }
    async pubsubSubscribe(pubsubTopic, handler) {
        const providersSorted = await this._plebbit._stats.sortGatewaysAccordingToScore("pubsub-subscribe");
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
        await this._plebbit.clients.pubsubKuboRpcClients[pubsubProvider]._client.pubsub.unsubscribe(pubsubTopic, handler);
        this.providerSubscriptions[pubsubProvider] = this.providerSubscriptions[pubsubProvider].filter((subPubsubTopic) => subPubsubTopic !== pubsubTopic);
    }
    async pubsubUnsubscribe(pubsubTopic, handler) {
        for (const pubsubProviderUrl of remeda.keys.strict(this._plebbit.clients.pubsubKuboRpcClients)) {
            try {
                await this.pubsubUnsubscribeOnProvider(pubsubTopic, pubsubProviderUrl, handler);
            }
            catch (e) {
                await this._plebbit._stats.recordGatewayFailure(pubsubProviderUrl, "pubsub-unsubscribe");
                //@ts-expect-error
                e.details = { ...e.details, pubsubProviderUrl, pubsubTopic };
                this.emitError(e);
            }
        }
    }
    prePubsubPublishProvider(pubsubTopic, pubsubProvider) { }
    postPubsubPublishProviderSuccess(pubsubTopic, pubsubProvider) { }
    postPubsubPublishProviderFailure(pubsubTopic, pubsubProvider, error) { }
    async pubsubPublishOnProvider(pubsubTopic, data, pubsubProvider) {
        const log = Logger("plebbit-js:plebbit:pubsubPublish");
        const dataBinary = cborg.encode(data);
        this.prePubsubPublishProvider(pubsubTopic, pubsubProvider);
        const timeBefore = Date.now();
        try {
            await this._plebbit.clients.pubsubKuboRpcClients[pubsubProvider]._client.pubsub.publish(pubsubTopic, dataBinary);
            this.postPubsubPublishProviderSuccess(pubsubTopic, pubsubProvider);
            this._plebbit._stats.recordGatewaySuccess(pubsubProvider, "pubsub-publish", Date.now() - timeBefore); // Awaiting this statement will bug out tests
        }
        catch (error) {
            this.postPubsubPublishProviderFailure(pubsubTopic, pubsubProvider, error);
            await this._plebbit._stats.recordGatewayFailure(pubsubProvider, "pubsub-publish");
            throwWithErrorCode("ERR_PUBSUB_FAILED_TO_PUBLISH", { pubsubTopic, pubsubProvider, error });
        }
    }
    async pubsubPublish(pubsubTopic, data) {
        const log = Logger("plebbit-js:plebbit:client-manager:pubsubPublish");
        const providersSorted = await this._plebbit._stats.sortGatewaysAccordingToScore("pubsub-publish");
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
    async _fetchWithLimit(url, options) {
        // Node-fetch will take care of size limits through options.size, while browsers will process stream manually
        const handleError = (e) => {
            if (e instanceof PlebbitError)
                throw e;
            else if (e instanceof Error && e.message.includes("over limit"))
                throw new PlebbitError("ERR_OVER_DOWNLOAD_LIMIT", { url, options });
            else if (options.signal?.aborted)
                throw new PlebbitError("ERR_GATEWAY_TIMED_OUT_OR_ABORTED", { url, options });
            else {
                const errorCode = url.includes("/ipfs/") || url.includes(".ipfs.")
                    ? "ERR_FAILED_TO_FETCH_IPFS_VIA_GATEWAY"
                    : url.includes("/ipns/") || url.includes(".ipns.")
                        ? "ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY"
                        : "ERR_FAILED_TO_FETCH_GENERIC";
                throw new PlebbitError(errorCode, {
                    url,
                    status: res?.status,
                    statusText: res?.statusText,
                    fetchError: String(e),
                    options
                });
            }
            // If error is not related to size limit, then throw it again
        };
        let res;
        // should have a callback after calling fetch, but before streaming the body
        try {
            res = await nativeFunctions.fetch(url, {
                cache: options.cache,
                signal: options.signal,
                //@ts-expect-error, this option is for node-fetch
                size: options.maxFileSizeBytes,
                headers: options.requestHeaders
            });
            if (res.status !== 200)
                throw Error(`Failed to fetch due to status code: ${res.status} + ", res.statusText" + (${res.statusText})`);
            if (options.abortRequestErrorBeforeLoadingBodyFunc) {
                const abortError = await options.abortRequestErrorBeforeLoadingBodyFunc(res);
                if (abortError) {
                    return { res, resText: undefined, abortError: abortError };
                }
            }
            const sizeHeader = res.headers.get("Content-Length");
            if (sizeHeader && Number(sizeHeader) > options.maxFileSizeBytes)
                throw new PlebbitError("ERR_OVER_DOWNLOAD_LIMIT", { url, options, res, sizeHeader });
            // If getReader is undefined that means node-fetch is used here. node-fetch processes options.size automatically
            if (res?.body?.getReader === undefined)
                return { resText: await res.text(), res };
        }
        catch (e) {
            handleError(e);
        }
        //@ts-expect-error
        if (res?.body?.getReader !== undefined) {
            let totalBytesRead = 0;
            try {
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
                    if (value.length + totalBytesRead > options.maxFileSizeBytes)
                        throw new PlebbitError("ERR_OVER_DOWNLOAD_LIMIT", { url, options });
                    totalBytesRead += value.length;
                }
                return { resText, res };
            }
            catch (e) {
                handleError(e);
            }
        }
        throw Error("should not reach this block in _fetchWithLimit");
    }
    preFetchGateway(gatewayUrl, loadOpts) { }
    postFetchGatewaySuccess(gatewayUrl, loadOpts) { }
    postFetchGatewayFailure(gatewayUrl, loadOpts, error) { }
    postFetchGatewayAborted(gatewayUrl, loadOpts) { }
    async _fetchFromGatewayAndVerifyIfBodyCorrespondsToProvidedCid(url, loadOpts) {
        loadOpts.log.trace(`Fetching url (${url})`);
        const resObj = await this._fetchWithLimit(url, {
            cache: loadOpts.recordIpfsType === "ipfs" ? "force-cache" : "no-store",
            signal: loadOpts.abortController.signal,
            ...loadOpts
        });
        const shouldVerifyBodyAgainstCid = loadOpts.recordIpfsType === "ipfs" && !loadOpts.path;
        if (shouldVerifyBodyAgainstCid && !resObj.resText)
            throw Error("Can't verify body against cid when there's no body");
        if (shouldVerifyBodyAgainstCid && resObj.resText)
            await this._verifyGatewayResponseMatchesCid(resObj.resText, loadOpts.root, loadOpts);
        return resObj;
    }
    _handleIfGatewayRedirectsToSubdomainResolution(gateway, loadOpts, res, log) {
        if (GATEWAYS_THAT_SUPPORT_SUBDOMAIN_RESOLUTION[gateway])
            return; // already handled, no need to do anything
        if (!res.redirected)
            return; // if it doesn't redirect to subdomain gateway then the gateway doesn't support subdomain resolution
        const resUrl = new URL(res.url);
        if (resUrl.hostname.includes(`.${loadOpts.recordIpfsType}.`)) {
            log(`Gateway`, gateway, "supports subdomain resolution. Switching url formulation to subdomain resolution");
            GATEWAYS_THAT_SUPPORT_SUBDOMAIN_RESOLUTION[gateway] = true;
        }
    }
    async _fetchWithGateway(gateway, loadOpts) {
        const log = Logger("plebbit-js:plebbit:fetchWithGateway");
        const url = GATEWAYS_THAT_SUPPORT_SUBDOMAIN_RESOLUTION[gateway]
            ? createUrlFromSubdomainResolution(gateway, loadOpts)
            : createUrlFromPathResolution(gateway, loadOpts);
        this.preFetchGateway(gateway, loadOpts);
        const timeBefore = Date.now();
        try {
            const resObj = await this._fetchFromGatewayAndVerifyIfBodyCorrespondsToProvidedCid(url, loadOpts);
            if (resObj.abortError) {
                if (!loadOpts.abortController.signal.aborted)
                    loadOpts.abortController.abort(resObj.abortError.message);
                throw resObj.abortError;
            }
            await loadOpts.validateGatewayResponseFunc(resObj); // should throw if there's an issue
            this.postFetchGatewaySuccess(gateway, loadOpts);
            this._plebbit._stats
                .recordGatewaySuccess(gateway, loadOpts.recordIpfsType, Date.now() - timeBefore)
                .catch((err) => log.error("Failed to report gateway success", err));
            this._handleIfGatewayRedirectsToSubdomainResolution(gateway, loadOpts, resObj.res, log);
            return resObj;
        }
        catch (e) {
            //@ts-expect-error
            e.details = { ...e.details, url, loadOpts, wasRequestAborted: loadOpts.abortController.signal.aborted };
            this.postFetchGatewayFailure(gateway, loadOpts, e);
            this._plebbit._stats
                .recordGatewayFailure(gateway, loadOpts.recordIpfsType)
                .catch((err) => log.error("failed to report gateway error", err));
            return { error: e };
        }
    }
    _firstResolve(promises) {
        if (promises.length === 0)
            throw Error("No promises to find the first resolve");
        return new Promise((resolve) => promises.forEach((promise, i) => promise.then((res) => {
            if ("resText" in res)
                resolve({ res, i });
        })));
    }
    async fetchFromMultipleGateways(loadOpts) {
        const timeoutMs = loadOpts.timeoutMs;
        const concurrencyLimit = 3;
        const queueLimit = pLimit(concurrencyLimit);
        // Only sort if we have more than 3 gateways
        const gatewaysSorted = remeda.keys.strict(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit
            ? remeda.keys.strict(this._plebbit.clients.ipfsGateways)
            : await this._plebbit._stats.sortGatewaysAccordingToScore(loadOpts.recordIpfsType);
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
                promise: queueLimit(() => this._fetchWithGateway(gateway, { ...loadOpts, abortController })),
                timeoutId: setTimeout(() => abortController.abort("Gateway request timed out"), timeoutMs)
            };
        }
        const gatewayPromises = Object.values(gatewayFetches).map((fetching) => fetching.promise);
        //@ts-expect-error
        const res = await Promise.race([
            this._firstResolve(gatewayPromises),
            Promise.allSettled(gatewayPromises)
        ]);
        if (Array.isArray(res)) {
            cleanUp();
            const gatewayToError = {};
            for (let i = 0; i < res.length; i++)
                if (res[i]["value"])
                    gatewayToError[gatewaysSorted[i]] = res[i]["value"].error;
            const combinedError = loadOpts.recordPlebbitType === "comment"
                ? new FailedToFetchCommentIpfsFromGatewaysError({ commentCid: loadOpts.root, gatewayToError, loadOpts })
                : loadOpts.recordPlebbitType === "comment-update"
                    ? new FailedToFetchCommentUpdateFromGatewaysError({ gatewayToError, loadOpts })
                    : loadOpts.recordPlebbitType === "page-ipfs"
                        ? new FailedToFetchPageIpfsFromGatewaysError({ pageCid: loadOpts.root, gatewayToError, loadOpts })
                        : loadOpts.recordPlebbitType === "subplebbit"
                            ? new FailedToFetchSubplebbitFromGatewaysError({ ipnsName: loadOpts.root, gatewayToError, loadOpts })
                            : new FailedToFetchGenericIpfsFromGatewaysError({ cid: loadOpts.root, gatewayToError, loadOpts });
            throw combinedError;
        }
        else {
            cleanUp();
            return res.res;
        }
    }
    // IPFS P2P methods
    async resolveIpnsToCidP2P(ipnsName, loadOpts) {
        const ipfsClient = this.getDefaultIpfs();
        const performIpnsResolve = async () => {
            const resolvedCidOfIpns = await last(ipfsClient._client.name.resolve(ipnsName, { nocache: true, recursive: true }));
            if (!resolvedCidOfIpns)
                throw new PlebbitError("ERR_RESOLVED_IPNS_P2P_TO_UNDEFINED", { resolvedCidOfIpns, ipnsName, ipfsClient, loadOpts });
            return CidPathSchema.parse(resolvedCidOfIpns);
        };
        try {
            // Wrap the resolution function with pTimeout because kubo-rpc-client doesn't support timeout for IPNS
            const result = await pTimeout(performIpnsResolve(), {
                milliseconds: loadOpts.timeoutMs,
                message: new PlebbitError("ERR_IPNS_RESOLUTION_P2P_TIMEOUT", { ipnsName, loadOpts, ipfsClient })
            });
            return result;
        }
        catch (error) {
            if (error instanceof PlebbitError)
                throw error;
            else
                throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS_P2P", { ipnsName, error, loadOpts, ipfsClient });
        }
        throw Error("Should not reach this block in resolveIpnsToCidP2P");
    }
    // TODO rename this to _fetchPathP2P
    async _fetchCidP2P(cidV0, loadOpts) {
        const ipfsClient = this.getDefaultIpfs();
        const fetchPromise = async () => {
            const rawData = await all(ipfsClient._client.cat(cidV0, { length: loadOpts.maxFileSizeBytes, timeout: `${loadOpts.timeoutMs}ms` }));
            const data = uint8ArrayConcat(rawData);
            const fileContent = uint8ArrayToString(data);
            if (typeof fileContent !== "string")
                throwWithErrorCode("ERR_FAILED_TO_FETCH_IPFS_CID_VIA_IPFS_P2P", { cid: cidV0, loadOpts, ipfsClient });
            if (data.byteLength === loadOpts.maxFileSizeBytes) {
                const calculatedCid = await calculateIpfsHash(fileContent);
                if (calculatedCid !== cidV0)
                    throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", {
                        cid: cidV0,
                        loadOpts,
                        endedDownloadAtFileContentLength: data.byteLength,
                        ipfsClient: ipfsClient._clientOptions
                    });
            }
            return fileContent;
        };
        try {
            // Wrap the fetch function with pTimeout to ensure it times out properly
            const result = await pTimeout(fetchPromise(), {
                milliseconds: loadOpts.timeoutMs,
                message: new PlebbitError("ERR_FETCH_CID_P2P_TIMEOUT", { cid: cidV0, loadOpts, ipfsClient })
            });
            return result;
        }
        catch (e) {
            if (e instanceof PlebbitError)
                throw e;
            else if (e instanceof Error && e.name === "TimeoutError")
                throw new PlebbitError("ERR_FETCH_CID_P2P_TIMEOUT", { cid: cidV0, error: e, loadOpts, ipfsClient });
            else
                throw new PlebbitError("ERR_FAILED_TO_FETCH_IPFS_CID_VIA_IPFS_P2P", { cid: cidV0, error: e, loadOpts, ipfsClient });
        }
    }
    async _verifyGatewayResponseMatchesCid(gatewayResponseBody, cid, loadOpts) {
        const calculatedCid = await calculateIpfsHash(gatewayResponseBody);
        if (gatewayResponseBody.length === loadOpts.maxFileSizeBytes && calculatedCid !== cid)
            throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, loadOpts, gatewayResponseBody });
        if (calculatedCid !== cid)
            throwWithErrorCode("ERR_CALCULATED_CID_DOES_NOT_MATCH", { calculatedCid, cid, gatewayResponseBody, loadOpts });
    }
    // Resolver methods here
    _getKeyOfCachedDomainTextRecord(domainAddress, txtRecord) {
        return `${domainAddress}_${txtRecord}`;
    }
    async _getCachedTextRecord(address, txtRecord) {
        const cacheKey = this._getKeyOfCachedDomainTextRecord(address, txtRecord);
        const resolveCache = await this._plebbit._storage.getItem(cacheKey);
        if (remeda.isPlainObject(resolveCache)) {
            const stale = timestamp() - resolveCache.timestampSeconds > 3600; // Only resolve again if cache was stored over an hour ago
            return { stale, ...resolveCache };
        }
        return undefined;
    }
    async _resolveTextRecordWithCache(address, txtRecord) {
        const log = Logger("plebbit-js:client-manager:resolveTextRecord");
        const chain = address.endsWith(".eth") ? "eth" : address.endsWith(".sol") ? "sol" : undefined;
        if (!chain)
            throw Error(`Can't figure out the chain of the address (${address}). Are you sure plebbit-js support this chain?`);
        const chainId = this._plebbit.chainProviders[chain]?.chainId;
        const cachedTextRecord = await this._getCachedTextRecord(address, txtRecord);
        if (cachedTextRecord) {
            if (cachedTextRecord.stale)
                this._resolveTextRecordConcurrently(address, txtRecord, chain, chainId)
                    .then((newTextRecordValue) => log.trace(`Updated the stale text-record (${txtRecord}) value of address (${address}) to ${newTextRecordValue}`))
                    .catch((err) => log.error(`Failed to update the stale text record (${txtRecord}) of address (${address})`, err));
            return cachedTextRecord.valueOfTextRecord;
        }
        else
            return this._resolveTextRecordConcurrently(address, txtRecord, chain, chainId);
    }
    preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl, staleCache) { }
    postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl, staleCache) { }
    postResolveTextRecordFailure(address, txtRecordName, chain, chainProviderUrl, error, staleCache) { }
    async _resolveTextRecordSingleChainProvider(address, txtRecordName, chain, chainproviderUrl, chainId, staleCache) {
        this.preResolveTextRecord(address, txtRecordName, chain, chainproviderUrl, staleCache);
        const timeBefore = Date.now();
        try {
            const resolvedTextRecord = await this._plebbit._domainResolver.resolveTxtRecord(address, txtRecordName, chain, chainproviderUrl, chainId);
            const timeAfter = Date.now();
            if (typeof resolvedTextRecord === "string" && !isIpns(resolvedTextRecord))
                throwWithErrorCode("ERR_RESOLVED_TEXT_RECORD_TO_NON_IPNS", {
                    resolvedTextRecord,
                    address,
                    txtRecordName,
                    chain,
                    chainproviderUrl
                });
            this.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainproviderUrl, staleCache);
            await this._plebbit._stats.recordGatewaySuccess(chainproviderUrl, chain, timeAfter - timeBefore);
            return resolvedTextRecord;
        }
        catch (e) {
            //@ts-expect-error
            e.details = { ...e.details, address, txtRecordName, chain, chainproviderUrl, chainId };
            this.postResolveTextRecordFailure(address, txtRecordName, chain, chainproviderUrl, e, staleCache);
            await this._plebbit._stats.recordGatewayFailure(chainproviderUrl, chain);
            return { error: e };
        }
    }
    async _resolveTextRecordConcurrently(address, txtRecordName, chain, chainId) {
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
                return cachedTextRecord.valueOfTextRecord;
            log.trace(`Retrying to resolve address (${address}) text record (${txtRecordName}) for the ${i}th time`);
            if (!this._plebbit.clients.chainProviders[chain]) {
                throw Error(`Plebbit has no chain provider for (${chain})`);
            }
            // Only sort if we have more than 3 gateways
            const providersSorted = this._plebbit.clients.chainProviders[chain].urls.length <= concurrencyLimit
                ? this._plebbit.clients.chainProviders[chain].urls
                : await this._plebbit._stats.sortGatewaysAccordingToScore(chain);
            try {
                const providerPromises = providersSorted.map((providerUrl) => queueLimit(() => this._resolveTextRecordSingleChainProvider(address, txtRecordName, chain, providerUrl, chainId, cachedTextRecord)));
                //@ts-expect-error
                const resolvedTextRecord = await Promise.race([
                    _firstResolve(providerPromises),
                    Promise.allSettled(providerPromises)
                ]);
                if (Array.isArray(resolvedTextRecord)) {
                    // It means none of the promises settled with string or null, they all failed
                    const errorsCombined = {};
                    for (let i = 0; i < providersSorted.length; i++)
                        errorsCombined[providersSorted[i]] = resolvedTextRecord[i].value.error;
                    throwWithErrorCode("ERR_FAILED_TO_RESOLVE_TEXT_RECORD", { errors: errorsCombined, address, txtRecordName, chain });
                }
                else {
                    // result could be either the value of the text record
                    // or null if it doesn't have any value
                    queueLimit.clearQueue();
                    if (typeof resolvedTextRecord === "string") {
                        // Only cache valid text records, not null
                        const resolvedCache = {
                            timestampSeconds: timestamp(),
                            valueOfTextRecord: resolvedTextRecord
                        };
                        const resolvedCacheKey = this._getKeyOfCachedDomainTextRecord(address, txtRecordName);
                        await this._plebbit._storage.setItem(resolvedCacheKey, resolvedCache);
                    }
                    return resolvedTextRecord;
                }
            }
            catch (e) {
                if (i === timeouts.length - 1) {
                    log.error(`Failed to resolve address (${address}) text record (${txtRecordName}) using providers `, providersSorted, e);
                    throw e;
                }
            }
        }
        throw Error("Should not reach this block within _resolveTextRecordConcurrently");
    }
    async resolveSubplebbitAddressIfNeeded(subplebbitAddress) {
        assert(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
        if (!isStringDomain(subplebbitAddress))
            return subplebbitAddress;
        return this._resolveTextRecordWithCache(subplebbitAddress, "subplebbit-address");
    }
    async clearDomainCache(domainAddress, txtRecordName) {
        const cacheKey = this._getKeyOfCachedDomainTextRecord(domainAddress, txtRecordName);
        await this._plebbit._storage.removeItem(cacheKey);
    }
    async resolveAuthorAddressIfNeeded(authorAddress) {
        if (!isStringDomain(authorAddress))
            throw new PlebbitError("ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58", { authorAddress });
        return this._resolveTextRecordWithCache(authorAddress, "plebbit-author-address");
    }
    // Misc functions
    emitError(e) {
        this._plebbit.emit("error", e);
    }
    calculateIpfsCid(content) {
        return calculateIpfsCidV0(content);
    }
}
//# sourceMappingURL=base-client-manager.js.map