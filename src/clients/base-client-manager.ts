import { Plebbit } from "../plebbit";
import assert from "assert";
import { delay, throwWithErrorCode, timestamp } from "../util";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { MessageHandlerFn } from "ipfs-http-client/types/src/pubsub/subscription-tracker";
import Hash from "ipfs-only-hash";
import { nativeFunctions } from "../runtime/node/util";
import pLimit from "p-limit";
import { PlebbitError } from "../plebbit-error";
import Logger from "@plebbit/plebbit-logger";

const DOWNLOAD_LIMIT_BYTES = 1000000; // 1mb

export type LoadType = "subplebbit" | "comment-update" | "comment" | "generic-ipfs";

export class BaseClientsManager {
    // Class that has all function but without clients field for maximum interopability

    protected _plebbit: Plebbit;
    _defaultPubsubProviderUrl: string; // The URL of the pubsub that is used by default for pubsub
    _defaultIpfsProviderUrl: string | undefined; // The URL of the ipfs node that is used by default for IPFS ipfs/ipns retrieval

    constructor(plebbit: Plebbit) {
        this._plebbit = plebbit;
        this._defaultPubsubProviderUrl = <string>Object.values(plebbit.clients.pubsubClients)[0]._clientOptions.url; // TODO Should be the gateway with the best score
        if (plebbit.clients.ipfsClients)
            this._defaultIpfsProviderUrl = <string>Object.values(plebbit.clients.ipfsClients)[0]._clientOptions.url;
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

    async pubsubSubscribe(pubsubTopic: string, handler: MessageHandlerFn) {
        try {
            await this.getDefaultPubsub()._client.pubsub.subscribe(pubsubTopic, handler);
        } catch (e) {
            throwWithErrorCode("ERR_PUBSUB_FAILED_TO_SUBSCRIBE", { pubsubTopic, pubsubNode: this._defaultPubsubProviderUrl, error: e });
        }
    }

    async pubsubUnsubscribe(pubsubTopic: string, handler?: MessageHandlerFn) {
        try {
            await this.getDefaultPubsub()._client.pubsub.unsubscribe(pubsubTopic, handler);
        } catch (error) {
            throwWithErrorCode("ERR_PUBSUB_FAILED_TO_UNSUBSCRIBE", { pubsubTopic, pubsubNode: this._defaultPubsubProviderUrl, error });
        }
    }

    protected prePubsubPublishProvider(pubsubTopic: string, pubsubProvider: string) {}

    protected postPubsubPublishProviderSuccess(pubsubTopic: string, pubsubProvider: string) {}

    protected postPubsubPublishProviderFailure(pubsubTopic: string, pubsubProvider: string) {}

    protected async _publishToPubsubProvider(pubsubTopic: string, data: Uint8Array, pubsubProvider: string) {
        const log = Logger("plebbit-js:plebbit:pubsubPublish");
        this.prePubsubPublishProvider(pubsubTopic, pubsubProvider);
        const timeBefore = Date.now();
        try {
            await this._plebbit.clients.pubsubClients[pubsubProvider]._client.pubsub.publish(pubsubTopic, data);
            this._plebbit.stats.recordGatewaySuccess(pubsubProvider, "pubsub-publish", Date.now() - timeBefore); // Awaiting this statement will bug out tests
            this.postPubsubPublishProviderSuccess(pubsubTopic, pubsubProvider);
        } catch (error) {
            await this._plebbit.stats.recordGatewayFailure(pubsubProvider, "pubsub-publish");
            this.postPubsubPublishProviderFailure(pubsubTopic, pubsubProvider);
            throwWithErrorCode("ERR_PUBSUB_FAILED_TO_PUBLISH", { pubsubTopic, pubsubProvider, error });
        }
    }

    async pubsubPublish(pubsubTopic: string, data: string) {
        const log = Logger("plebbit-js:plebbit:client-manager:pubsubPublish");
        const dataBinary = uint8ArrayFromString(data);

        const _firstResolve = (promises: Promise<void>[]) => {
            return new Promise<number>((resolve) => promises.forEach((promise) => promise.then(() => resolve(1))));
        };

        const timeouts = [0, 0, 100, 1000];

        let lastError: PlebbitError;
        const concurrencyLimit = 3;
        const queueLimit = pLimit(concurrencyLimit);

        for (let i = 0; i < timeouts.length; i++) {
            if (timeouts[i] !== 0) await delay(timeouts[i]);
            try {
                // Only sort if we have more than 3 pubsub providers
                const providersSorted =
                    Object.keys(this._plebbit.clients.pubsubClients).length <= concurrencyLimit
                        ? Object.keys(this._plebbit.clients.pubsubClients)
                        : await this._plebbit.stats.sortGatewaysAccordingToScore("pubsub-publish");

                const providerPromises = providersSorted.map((pubsubProviderUrl) =>
                    queueLimit(() => this._publishToPubsubProvider(pubsubTopic, dataBinary, pubsubProviderUrl))
                );

                const res = await Promise.race([_firstResolve(providerPromises), Promise.allSettled(providerPromises)]);

                if (res === 1) {
                    queueLimit.clearQueue();
                    return res;
                } else throw res[0].value.error;
            } catch (e) {
                log.error(`Failed to publish to pubsub topic (${pubsubTopic}) for the ${i}th time due to error: `, e);
                lastError = e;
            }
        }

        this.emitError(lastError);
        throw lastError;
    }

    // Gateway methods

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

    postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType) {}

    protected async _fetchWithGateway(gateway: string, path: string, loadType: LoadType): Promise<string | { error: PlebbitError }> {
        const log = Logger("plebbit-js:plebbit:fetchWithGateway");
        const url = `${gateway}${path}`;

        log.trace(`Fetching url (${url})`);

        const timeBefore = Date.now();
        const isCid = path.includes("/ipfs/"); // If false, then IPNS

        this.preFetchGateway(gateway, path, loadType);
        try {
            const resText = await this._fetchWithLimit(url, { cache: isCid ? "force-cache" : "no-store" });
            if (isCid) await this._verifyContentIsSameAsCid(resText, path.split("/ipfs/")[1]);
            this.postFetchGatewaySuccess(gateway, path, loadType);
            const timeElapsedMs = Date.now() - timeBefore;
            await this._plebbit.stats.recordGatewaySuccess(gateway, isCid ? "cid" : "ipns", timeElapsedMs);
            return resText;
        } catch (e) {
            await this._plebbit.stats.recordGatewayFailure(gateway, isCid ? "cid" : "ipns");
            return { error: e };
        }
    }

    async fetchFromMultipleGateways(loadOpts: { cid?: string; ipns?: string }, loadType: LoadType): Promise<string> {
        assert(loadOpts.cid || loadOpts.ipns);

        const path = loadOpts.cid ? `/ipfs/${loadOpts.cid}` : `/ipns/${loadOpts.ipns}`;

        const _firstResolve = (promises: Promise<string | { error: PlebbitError }>[]) => {
            return new Promise<string>((resolve) =>
                promises.forEach((promise) =>
                    promise.then((res) => {
                        if (typeof res === "string") resolve(res);
                    })
                )
            );
        };

        const type = loadOpts.cid ? "cid" : "ipns";

        const concurrencyLimit = 3;

        const queueLimit = pLimit(concurrencyLimit);

        // Only sort if we have more than 3 gateways
        const gatewaysSorted =
            Object.keys(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit
                ? Object.keys(this._plebbit.clients.ipfsGateways)
                : await this._plebbit.stats.sortGatewaysAccordingToScore(type);

        const gatewayPromises = gatewaysSorted.map((gateway) => queueLimit(() => this._fetchWithGateway(gateway, path, loadType)));

        const res = await Promise.race([_firstResolve(gatewayPromises), Promise.allSettled(gatewayPromises)]);
        if (typeof res === "string") {
            queueLimit.clearQueue();
            return res;
        } //@ts-expect-error
        else throw res[0].value.error;
    }

    // IPFS P2P methods
    async resolveIpnsToCidP2P(ipns: string): Promise<string> {
        const ipfsClient = this.getDefaultIpfs();
        try {
            const cid = await ipfsClient._client.name.resolve(ipns);
            if (typeof cid !== "string") throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipns });
            return cid;
        } catch (error) {
            throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipns, error });
        }
    }

    async _fetchCidP2P(cid: string): Promise<string> {
        const ipfsClient = this.getDefaultIpfs();
        const fileContent = await ipfsClient._client.cat(cid, { length: DOWNLOAD_LIMIT_BYTES }); // Limit is 1mb files
        if (typeof fileContent !== "string") throwWithErrorCode("ERR_FAILED_TO_FETCH_IPFS_VIA_IPFS", { cid });
        const calculatedCid: string = await Hash.of(fileContent);
        if (fileContent.length === DOWNLOAD_LIMIT_BYTES && calculatedCid !== cid)
            throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
        return fileContent;
    }

    private async _verifyContentIsSameAsCid(content: string, cid: string) {
        const calculatedCid: string = await Hash.of(content);
        if (content.length === DOWNLOAD_LIMIT_BYTES && calculatedCid !== cid)
            throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
        if (calculatedCid !== cid) throwWithErrorCode("ERR_CALCULATED_CID_DOES_NOT_MATCH", { calculatedCid, cid });
    }

    // Resolver methods here

    private async _getCachedEns(
        ens: string,
        txtRecord: "subplebbit-address" | "plebbit-author-address"
    ): Promise<{ stale: boolean; resolveCache: string | undefined } | undefined> {
        const resolveCache: string | undefined = await this._plebbit._cache.getItem(`${ens}_${txtRecord}`);
        if (typeof resolveCache === "string") {
            const resolvedTimestamp: number = await this._plebbit._cache.getItem(`${ens}_${txtRecord}_timestamp`);
            assert(typeof resolvedTimestamp === "number");
            const stale = timestamp() - resolvedTimestamp > 3600; // Only resolve again if cache was stored over an hour ago
            return { stale, resolveCache };
        }
        return undefined;
    }

    private async _resolveEnsTextRecordWithCache(ens: string, txtRecord: "subplebbit-address" | "plebbit-author-address") {
        if (!ens.endsWith(".eth")) return ens;

        return this._resolveEnsTextRecord(ens, txtRecord);
    }

    preResolveTextRecord(ens: string, txtRecordName: "subplebbit-address" | "plebbit-author-address") {}

    postResolveTextRecordSuccess(ens: string, txtRecordName: "subplebbit-address" | "plebbit-author-address", resolvedTextRecord: string) {}

    postResolveTextRecordFailure(ens: string, txtRecordName: "subplebbit-address" | "plebbit-author-address") {}

    private async _resolveEnsTextRecord(ens: string, txtRecordName: "subplebbit-address" | "plebbit-author-address") {
        const log = Logger("plebbit-js:plebbit:client-manager:_resolveEnsTextRecord");
        const timeouts = [0, 0, 100, 1000];
        for (let i = 0; i < timeouts.length; i++) {
            if (timeouts[i] !== 0) await delay(timeouts[i]);
            const cacheEns = await this._getCachedEns(ens, txtRecordName);
            if (cacheEns && !cacheEns.stale) return cacheEns.resolveCache;
            log.trace(`Retrying to resolve ENS (${ens}) text record (${txtRecordName}) for the ${i}th time`);
            this.preResolveTextRecord(ens, txtRecordName);
            try {
                const resolvedTxtRecord = await this._plebbit.resolver._resolveEnsTxtRecord(ens, txtRecordName);
                this.postResolveTextRecordSuccess(ens, txtRecordName, resolvedTxtRecord);
                return resolvedTxtRecord;
            } catch (e) {
                this.postResolveTextRecordFailure(ens, txtRecordName);

                if (i === timeouts.length - 1) {
                    this.emitError(e);
                    throw e;
                }
            }
        }
    }

    async resolveSubplebbitAddressIfNeeded(subplebbitAddress: string): Promise<string | undefined> {
        assert(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
        return this._resolveEnsTextRecordWithCache(subplebbitAddress, "subplebbit-address");
    }

    async resolveAuthorAddressIfNeeded(authorAddress: string) {
        assert(typeof authorAddress === "string", "subplebbitAddress needs to be a string to be resolved");
        return this._resolveEnsTextRecordWithCache(authorAddress, "plebbit-author-address");
    }

    // Misc functions
    emitError(e: PlebbitError) {
        this._plebbit.emit("error", e);
    }
}
