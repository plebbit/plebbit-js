import { Plebbit } from "../plebbit";
import assert from "assert";
import { delay, firstResolve, throwWithErrorCode, timestamp } from "../util";
import { MessageHandlerFn } from "ipfs-http-client/types/src/pubsub/subscription-tracker";
import Hash from "ipfs-only-hash";
import { nativeFunctions } from "../runtime/node/util";
import pLimit from "p-limit";
import { PlebbitError } from "../plebbit-error";
import Logger from "@plebbit/plebbit-logger";
import { Chain, PubsubMessage } from "../types";
import * as cborg from "cborg";

const DOWNLOAD_LIMIT_BYTES = 1000000; // 1mb

export type LoadType = "subplebbit" | "comment-update" | "comment" | "generic-ipfs";

export const resolvePromises: Record<string, Promise<string | null>> = {};

export class BaseClientsManager {
    // Class that has all function but without clients field for maximum interopability

    protected _plebbit: Plebbit;
    _defaultPubsubProviderUrl: string; // The URL of the pubsub that is used by default for pubsub
    _defaultIpfsProviderUrl: string | undefined; // The URL of the ipfs node that is used by default for IPFS ipfs/ipns retrieval
    providerSubscriptions: Record<string, string[]>; // To keep track of subscriptions of each provider

    constructor(plebbit: Plebbit) {
        this._plebbit = plebbit;
        this._defaultPubsubProviderUrl = <string>Object.values(plebbit.clients.pubsubClients)[0]?._clientOptions?.url; // TODO Should be the gateway with the best score
        if (plebbit.clients.ipfsClients)
            this._defaultIpfsProviderUrl = <string>Object.values(plebbit.clients.ipfsClients)[0]?._clientOptions?.url;
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

    async pubsubSubscribeOnProvider(pubsubTopic: string, handler: MessageHandlerFn, pubsubProviderUrl: string) {
        const log = Logger("plebbit-js:plebbit:client-manager:pubsubSubscribeOnProvider");

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

    async pubsubSubscribe(pubsubTopic: string, handler: MessageHandlerFn) {
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

    async pubsubUnsubscribeOnProvider(pubsubTopic: string, pubsubProvider: string, handler?: MessageHandlerFn) {
        await this._plebbit.clients.pubsubClients[pubsubProvider]._client.pubsub.unsubscribe(pubsubTopic, handler);
        this.providerSubscriptions[pubsubProvider] = this.providerSubscriptions[pubsubProvider].filter(
            (subPubsubTopic) => subPubsubTopic !== pubsubTopic
        );
    }

    async pubsubUnsubscribe(pubsubTopic: string, handler?: MessageHandlerFn) {
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

    // TODO should combine requests under different urls
    private async _fetchWithLimit(url: string, options?): Promise<string> {
        // Node-fetch will take care of size limits through options.size, while browsers will process stream manually
        let res: Response;
        try {
            //@ts-expect-error
            res = await nativeFunctions.fetch(url, { ...options, size: DOWNLOAD_LIMIT_BYTES });
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
            throwWithErrorCode(errorCode, { url, status: res?.status, statusText: res?.statusText, error: e });

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

    protected async _fetchWithGateway(
        gateway: string,
        path: string,
        loadType: LoadType,
        abortController: AbortController
    ): Promise<string | undefined | { error: PlebbitError }> {
        const log = Logger("plebbit-js:plebbit:fetchWithGateway");
        const url = `${gateway}${path}`;

        log.trace(`Fetching url (${url})`);

        const timeBefore = Date.now();
        const isCid = loadType === "comment" || loadType === "generic-ipfs"; // If false, then IPNS

        this.preFetchGateway(gateway, path, loadType);
        try {
            const resText = await this._fetchWithLimit(url, { cache: isCid ? "force-cache" : "no-store", signal: abortController.signal });
            if (isCid) await this._verifyContentIsSameAsCid(resText, path.split("/ipfs/")[1]);
            this.postFetchGatewaySuccess(gateway, path, loadType);
            const timeElapsedMs = Date.now() - timeBefore;
            await this._plebbit.stats.recordGatewaySuccess(gateway, isCid || loadType === "comment-update" ? "cid" : "ipns", timeElapsedMs);
            return resText;
        } catch (e) {
            if (e?.details?.error?.type === "aborted") {
                this.postFetchGatewayAborted(gateway, path, loadType);
                return undefined;
            } else {
                this.postFetchGatewayFailure(gateway, path, loadType, e);
                await this._plebbit.stats.recordGatewayFailure(gateway, isCid ? "cid" : "ipns");
                return { error: e };
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

    async fetchFromMultipleGateways(loadOpts: { cid?: string; ipns?: string }, loadType: LoadType): Promise<string> {
        assert(loadOpts.cid || loadOpts.ipns);

        const path = loadOpts.cid ? `/ipfs/${loadOpts.cid}` : `/ipns/${loadOpts.ipns}`;

        const type = loadOpts.cid ? "cid" : "ipns";

        const concurrencyLimit = 3;

        const queueLimit = pLimit(concurrencyLimit);

        // Only sort if we have more than 3 gateways
        const gatewaysSorted =
            Object.keys(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit
                ? Object.keys(this._plebbit.clients.ipfsGateways)
                : await this._plebbit.stats.sortGatewaysAccordingToScore(type);

        const controllers = new Array(gatewaysSorted.length).fill(null).map((x) => new AbortController());
        const gatewayPromises = gatewaysSorted.map((gateway, i) =>
            queueLimit(() => this._fetchWithGateway(gateway, path, loadType, controllers[i]))
        );

        const res = await Promise.race([this._firstResolve(gatewayPromises), Promise.allSettled(gatewayPromises)]);
        if (Array.isArray(res)) {
            const gatewayToError: Record<string, PlebbitError> = {};
            for (let i = 0; i < res.length; i++) if (res[i]["value"]) gatewayToError[gatewaysSorted[i]] = res[i]["value"].error;

            const errorCode = Object.values(gatewayToError)[0].code;
            const combinedError = new PlebbitError(errorCode, { loadOpts, gatewayToError });

            throw combinedError;
        } else {
            queueLimit.clearQueue();
            controllers.forEach((control) => control.abort());
            return res.res;
        }
    }

    // IPFS P2P methods
    async resolveIpnsToCidP2P(ipns: string): Promise<string> {
        const ipfsClient = this.getDefaultIpfs();
        try {
            const cid = await ipfsClient._client.name.resolve(ipns);
            if (typeof cid !== "string") throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipns });
            return cid;
        } catch (error) {
            if (error?.code === "ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS") throw error;
            else throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipns, error });
        }
    }

    // TODO rename this to _fetchPathP2P
    async _fetchCidP2P(cid: string): Promise<string> {
        const ipfsClient = this.getDefaultIpfs();
        const fileContent = await ipfsClient._client.cat(cid, { length: DOWNLOAD_LIMIT_BYTES }); // Limit is 1mb files
        if (typeof fileContent !== "string") throwWithErrorCode("ERR_FAILED_TO_FETCH_IPFS_VIA_IPFS", { cid });
        if (fileContent.length === DOWNLOAD_LIMIT_BYTES) {
            const calculatedCid: string = await Hash.of(fileContent);
            if (calculatedCid !== cid) throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
        }

        return fileContent;
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
        const chain = address.endsWith(".eth") ? "eth" : undefined;
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
        try {
            let resolvedTextRecord: string | null;
            if (ensResolverPromiseCache.has(cacheKey)) resolvedTextRecord = await ensResolverPromiseCache.get(cacheKey);
            else {
                const resolvePromise = this._plebbit.resolver.resolveTxtRecord(address, txtRecordName, chain, chainproviderUrl);
                ensResolverPromiseCache.set(cacheKey, resolvePromise);
                resolvedTextRecord = await resolvePromise;
            }
            this.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainproviderUrl);
            await this._plebbit.stats.recordGatewaySuccess(chainproviderUrl, chain, Date.now() - timeBefore);
            return resolvedTextRecord;
        } catch (e) {
            ensResolverPromiseCache.delete(cacheKey);
            this.postResolveTextRecordFailure(address, txtRecordName, chain, chainproviderUrl, e);
            await this._plebbit.stats.recordGatewayFailure(chainproviderUrl, chain);
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
