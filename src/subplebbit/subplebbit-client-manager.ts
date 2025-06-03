import retry, { RetryOperation } from "retry";
import { CachedTextRecordResolve, OptionsToLoadFromGateway } from "../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../clients/chain-provider-client.js";
import { PlebbitClientsManager } from "../plebbit/plebbit-client-manager.js";
import { FailedToFetchSubplebbitFromGatewaysError, PlebbitError } from "../plebbit-error.js";
import { ChainTicker } from "../types.js";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
import * as remeda from "remeda";
import type { SubplebbitIpfsType, SubplebbitJson } from "./types.js";
import Logger from "@plebbit/plebbit-logger";

import { hideClassPrivateProps, timestamp } from "../util.js";
import pLimit from "p-limit";
import { parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails, parseJsonWithPlebbitErrorIfFails } from "../schema/schema-util.js";
import { verifySubplebbit } from "../signer/index.js";
import { LimitedSet } from "../general-util/limited-set.js";
import {
    SubplebbitIpfsGatewayClient,
    SubplebbitKuboPubsubClient,
    SubplebbitKuboRpcClient,
    SubplebbitLibp2pJsClient,
    SubplebbitPlebbitRpcStateClient
} from "./subplebbit-clients.js";

type SubplebbitGatewayFetch = {
    [gatewayUrl: string]: {
        abortController: AbortController;
        promise: Promise<any>;
        cid?: SubplebbitJson["updateCid"];
        subplebbitRecord?: SubplebbitIpfsType;
        error?: PlebbitError;
        timeoutId: any;
        ttl?: number; // ttl in seconds of IPNS record
    };
};

type ResultOfFetchingSubplebbit =
    | { subplebbit: SubplebbitIpfsType; cid: string } // when we fetch a new subplebbit only
    | undefined; // undefined is when we resolve an IPNS and it's equal to subplebbit.updateCid. So no need to fetch IPFS

export const MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS = 1024 * 1024; // 1mb

export class SubplebbitClientsManager extends PlebbitClientsManager {
    override clients!: {
        ipfsGateways: { [ipfsGatewayUrl: string]: SubplebbitIpfsGatewayClient };
        kuboRpcClients: { [kuboRpcClientUrl: string]: SubplebbitKuboRpcClient };
        pubsubKuboRpcClients: { [pubsubClientUrl: string]: SubplebbitKuboPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, SubplebbitPlebbitRpcStateClient>;
        libp2pJsClients: { [libp2pJsClientUrl: string]: SubplebbitLibp2pJsClient };
    };
    private _subplebbit: RemoteSubplebbit;
    _ipnsLoadingOperation?: RetryOperation = undefined;
    _updateCidsAlreadyLoaded: LimitedSet<string> = new LimitedSet<string>(30); // we will keep track of the last 50 subplebbit update cids that we loaded

    constructor(subplebbit: SubplebbitClientsManager["_subplebbit"]) {
        super(subplebbit._plebbit);
        this._subplebbit = subplebbit;
        this._initPlebbitRpcClients();
        hideClassPrivateProps(this);
    }

    protected override _initKuboRpcClients(): void {
        if (this._plebbit.clients.kuboRpcClients)
            for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.kuboRpcClients))
                this.clients.kuboRpcClients = { ...this.clients.kuboRpcClients, [ipfsUrl]: new SubplebbitKuboRpcClient("stopped") };
    }

    protected override _initPubsubKuboRpcClients(): void {
        for (const pubsubUrl of remeda.keys.strict(this._plebbit.clients.pubsubKuboRpcClients))
            this.clients.pubsubKuboRpcClients = {
                ...this.clients.pubsubKuboRpcClients,
                [pubsubUrl]: new SubplebbitKuboPubsubClient("stopped")
            };
    }

    protected override _initLibp2pJsClients(): void {
        if (this._plebbit.clients.libp2pJsClients)
            for (const libp2pJsClientUrl of remeda.keys.strict(this._plebbit.clients.libp2pJsClients))
                this.clients.libp2pJsClients = {
                    ...this.clients.libp2pJsClients,
                    [libp2pJsClientUrl]: new SubplebbitLibp2pJsClient("stopped")
                };
    }

    protected _initPlebbitRpcClients() {
        for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = {
                ...this.clients.plebbitRpcClients,
                [rpcUrl]: new SubplebbitPlebbitRpcStateClient("stopped")
            };
    }

    override updateKuboRpcState(newState: SubplebbitKuboRpcClient["state"], kuboRpcClientUrl: string) {
        super.updateKuboRpcState(newState, kuboRpcClientUrl);
    }

    override updateKuboRpcPubsubState(newState: SubplebbitKuboPubsubClient["state"], pubsubProvider: string) {
        super.updateKuboRpcPubsubState(newState, pubsubProvider);
    }

    override updateGatewayState(newState: SubplebbitIpfsGatewayClient["state"], gateway: string): void {
        super.updateGatewayState(newState, gateway);
    }

    override updateLibp2pJsClientState(newState: SubplebbitLibp2pJsClient["state"], libp2pJsClientUrl: string) {
        super.updateLibp2pJsClientState(newState, libp2pJsClientUrl);
    }

    override emitError(e: PlebbitError): void {
        this._subplebbit.emit("error", e);
    }

    protected override _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns" {
        return "fetching-ipns";
    }

    override preResolveTextRecord(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: ChainTicker,
        chainProviderUrl: string,
        staleCache?: CachedTextRecordResolve
    ): void {
        super.preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl, staleCache);
        if (txtRecordName === "subplebbit-address" && !staleCache)
            this._subplebbit._setUpdatingStateWithEventEmissionIfNewState("resolving-address");
    }

    override postResolveTextRecordSuccess(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string,
        chain: ChainTicker,
        chainProviderUrl: string,
        staleCache?: CachedTextRecordResolve
    ): void {
        super.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl, staleCache);
        if (!resolvedTextRecord && this._subplebbit.state === "updating") {
            const error = new PlebbitError("ERR_DOMAIN_TXT_RECORD_NOT_FOUND", {
                subplebbitAddress: address,
                textRecord: txtRecordName
            });
            this._subplebbit._changeStateEmitEventEmitStateChangeEvent({
                event: { name: "error", args: [error] },
                newUpdatingState: "failed"
            });

            throw error;
        }
    }

    protected _getSubplebbitAddressFromInstance(): string {
        return this._subplebbit.address;
    }

    // functions for updatingSubInstance

    private async _retryLoadingSubplebbitAddress(
        subplebbitAddress: SubplebbitIpfsType["address"]
    ): Promise<ResultOfFetchingSubplebbit | { criticalError: Error | PlebbitError }> {
        const log = Logger("plebbit-js:remote-subplebbit:update:_retryLoadingSubplebbitIpns");

        return new Promise((resolve) => {
            this._ipnsLoadingOperation!.attempt(async (curAttempt) => {
                log.trace(`Retrying to load subplebbit ${subplebbitAddress} for the ${curAttempt}th time`);
                try {
                    const update = await this.fetchNewUpdateForSubplebbit(subplebbitAddress);

                    resolve(update);
                } catch (e) {
                    const error = <Error | PlebbitError>e;
                    if (!this._subplebbit._isRetriableErrorWhenLoading(error)) {
                        // critical error that can't be retried
                        if (error instanceof PlebbitError)
                            error.details = { ...error.details, countOfLoadAttempts: curAttempt, retriableError: false };
                        resolve({ criticalError: error });
                    } else {
                        // we encountered a retriable error, could be gateways failing to load
                        // does not include gateways returning an old record
                        if (error instanceof PlebbitError)
                            error.details = { ...error.details, countOfLoadAttempts: curAttempt, retriableError: true };
                        log.trace(
                            `Failed to load Subplebbit ${this._subplebbit.address} record for the ${curAttempt}th attempt. We will retry`,
                            error
                        );

                        this._subplebbit._changeStateEmitEventEmitStateChangeEvent({
                            event: { name: "error", args: [error] },
                            newUpdatingState: "waiting-retry"
                        });

                        this._ipnsLoadingOperation!.retry(<Error>e);
                    }
                }
            });
        });
    }

    async updateOnce() {
        const log = Logger("plebbit-js:remote-subplebbit:update");

        this._ipnsLoadingOperation = retry.operation({ forever: true, factor: 2 });
        const subLoadingRes = await this._retryLoadingSubplebbitAddress(this._subplebbit.address); // will return undefined if no new sub CID is found
        this._ipnsLoadingOperation.stop();

        if (subLoadingRes && "criticalError" in subLoadingRes) {
            log.error(
                `Subplebbit ${this._subplebbit.address} encountered a non retriable error while updating, will emit an error event and mark invalid cid to not be loaded again`,
                subLoadingRes.criticalError
            );
            this._subplebbit._changeStateEmitEventEmitStateChangeEvent({
                event: { name: "error", args: [subLoadingRes.criticalError] },
                newUpdatingState: "failed"
            });
        } else if (
            subLoadingRes?.subplebbit &&
            (this._subplebbit.raw.subplebbitIpfs?.updatedAt || 0) < subLoadingRes.subplebbit.updatedAt
        ) {
            this._subplebbit.initSubplebbitIpfsPropsNoMerge(subLoadingRes.subplebbit);
            this._subplebbit.updateCid = subLoadingRes.cid;
            log(
                `Remote Subplebbit`,
                this._subplebbit.address,
                `received a new update. Will emit an update event with updatedAt`,
                this._subplebbit.updatedAt,
                "that's",
                timestamp() - this._subplebbit.updatedAt!,
                "seconds old"
            );
            this._subplebbit._changeStateEmitEventEmitStateChangeEvent({
                event: { name: "update", args: [this._subplebbit] },
                newUpdatingState: "succeeded"
            });
        } else if (subLoadingRes === undefined) {
            // we loaded a sub record that we already consumed
            // we will retry later
            this._subplebbit._setUpdatingStateWithEventEmissionIfNewState("waiting-retry");
        } else if (subLoadingRes?.subplebbit) {
            this._subplebbit._setUpdatingStateWithEventEmissionIfNewState("succeeded");
        }
    }

    async startUpdatingLoop() {
        const log = Logger("plebbit-js:remote-subplebbit:update");

        const areWeConnectedToKuboOrHelia =
            Object.keys(this._plebbit.clients.kuboRpcClients).length > 0 || Object.keys(this._plebbit.clients.libp2pJsClients).length > 0;
        const updateInterval = areWeConnectedToKuboOrHelia ? 1000 : this._plebbit.updateInterval; // if we're on helia or kubo we should resolve IPNS every second

        while (this._subplebbit.state === "updating") {
            try {
                await this.updateOnce();
            } catch (e) {
                log.error(`Failed to update subplebbit ${this._subplebbit.address} for this iteration, will retry later`, e);
            } finally {
                await new Promise((resolve) => setTimeout(resolve, updateInterval));
            }
        }

        log("Subplebbit", this._subplebbit.address, "is no longer updating");
    }

    async stopUpdatingLoop() {
        this._ipnsLoadingOperation?.stop();
        this._updateCidsAlreadyLoaded.clear();
    }

    // fetching subplebbit ipns here

    async fetchNewUpdateForSubplebbit(subAddress: SubplebbitIpfsType["address"]): Promise<ResultOfFetchingSubplebbit> {
        const ipnsName = await this.resolveSubplebbitAddressIfNeeded(subAddress);
        // if ipnsAddress is undefined then it will be handled in postResolveTextRecordSuccess

        if (!ipnsName) throw Error("Failed to resolve subplebbit address to an IPNS name");
        if (this._subplebbit.updateCid) this._updateCidsAlreadyLoaded.add(this._subplebbit.updateCid);

        // This function should fetch SubplebbitIpfs, parse it and verify its signature
        // Then return SubplebbitIpfs

        // only exception is if the ipnsRecord.value (ipfs path) has already been loaded and stored in this._updateCidsAlreadyLoaded
        // in that case no need to fetch the subplebbitIpfs, we will return undefined
        this._subplebbit._setUpdatingStateWithEventEmissionIfNewState("fetching-ipns");
        let subRes: ResultOfFetchingSubplebbit;
        const areWeConnectedToKuboOrHelia =
            Object.keys(this._plebbit.clients.kuboRpcClients).length > 0 || Object.keys(this._plebbit.clients.libp2pJsClients).length > 0;
        if (areWeConnectedToKuboOrHelia) {
            const kuboRpcOrHelia = this.getDefaultKuboRpcClientOrHelia();
            // we're connected to kubo or helia
            try {
                subRes = await this._fetchSubplebbitIpnsP2PAndVerify(ipnsName);
            } catch (e) {
                throw e;
            } finally {
                if ("helia" in kuboRpcOrHelia) this.updateLibp2pJsClientState("stopped", kuboRpcOrHelia.libp2pJsClientOptions.key);
                else this.updateKuboRpcState("stopped", kuboRpcOrHelia.url);
            }
        } else subRes = await this._fetchSubplebbitFromGateways(ipnsName); // let's use gateways to fetch because we're not connected to kubo or helia
        // States of gateways should be updated by fetchFromMultipleGateways
        // Subplebbit records are verified within _fetchSubplebbitFromGateways

        if (subRes?.subplebbit) {
            // we found a new record that is verified
            this._plebbit._memCaches.subplebbitForPublishing.set(
                subRes.subplebbit.address,
                remeda.pick(subRes.subplebbit, ["encryption", "pubsubTopic", "address"])
            );
        }
        return subRes;
    }

    private async _fetchSubplebbitIpnsP2PAndVerify(ipnsName: string): Promise<ResultOfFetchingSubplebbit> {
        const log = Logger("plebbit-js:clients-manager:_fetchSubplebbitIpnsP2PAndVerify");
        const kuboRpcOrHelia = this.getDefaultKuboRpcClientOrHelia();
        if ("helia" in kuboRpcOrHelia) {
            this.updateLibp2pJsClientState("fetching-ipns", kuboRpcOrHelia.libp2pJsClientOptions.key);
        } else this.updateKuboRpcState("fetching-ipns", kuboRpcOrHelia.url);
        const latestSubplebbitCid = await this.resolveIpnsToCidP2P(ipnsName, { timeoutMs: this._plebbit._timeouts["subplebbit-ipns"] });
        if (this._updateCidsAlreadyLoaded.has(latestSubplebbitCid)) {
            log.trace(
                "Resolved subplebbit IPNS",
                ipnsName,
                "to a cid that we already loaded before. No need to fetch its ipfs",
                latestSubplebbitCid
            );
            return undefined;
        }

        if ("helia" in kuboRpcOrHelia) this.updateLibp2pJsClientState("fetching-ipfs", kuboRpcOrHelia.libp2pJsClientOptions.key);
        else this.updateKuboRpcState("fetching-ipfs", kuboRpcOrHelia.url);
        this._subplebbit._setUpdatingStateWithEventEmissionIfNewState("fetching-ipfs");

        let rawSubJsonString: Awaited<ReturnType<typeof this._fetchCidP2P>>;
        try {
            rawSubJsonString = await this._fetchCidP2P(latestSubplebbitCid, {
                maxFileSizeBytes: MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS,
                timeoutMs: this._plebbit._timeouts["subplebbit-ipfs"]
            });
        } catch (e) {
            //@ts-expect-error
            e.details = {
                //@ts-expect-error
                ...e.details,
                subplebbitIpnsName: ipnsName,
                subplebbitCid: latestSubplebbitCid
            };
            if (e instanceof PlebbitError && e.code === "ERR_OVER_DOWNLOAD_LIMIT") this._updateCidsAlreadyLoaded.add(latestSubplebbitCid);
            throw e;
        }

        this._updateCidsAlreadyLoaded.add(latestSubplebbitCid);
        try {
            const subIpfs = parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(
                parseJsonWithPlebbitErrorIfFails(rawSubJsonString)
            );

            const errInRecord = await this._findErrorInSubplebbitRecord(subIpfs, ipnsName, latestSubplebbitCid);

            if (errInRecord) throw errInRecord;
            return { subplebbit: subIpfs, cid: latestSubplebbitCid };
        } catch (e) {
            // invalid subplebbit record
            (<PlebbitError>e).details.cidOfSubIpns = latestSubplebbitCid;
            throw <PlebbitError>e;
        }
    }

    private async _fetchSubplebbitFromGateways(ipnsName: string): Promise<ResultOfFetchingSubplebbit> {
        const log = Logger("plebbit-js:subplebbit:fetchSubplebbitFromGateways");
        const concurrencyLimit = 3;
        const timeoutMs = this._plebbit._timeouts["subplebbit-ipns"];

        const queueLimit = pLimit(concurrencyLimit);

        // Only sort if we have more than 3 gateways
        const gatewaysSorted =
            remeda.keys.strict(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit
                ? remeda.keys.strict(this._plebbit.clients.ipfsGateways)
                : await this._plebbit._stats.sortGatewaysAccordingToScore("ipns");

        // need to handle
        // if all gateways returned the same subplebbit.updateCid
        const gatewayFetches: SubplebbitGatewayFetch = {};

        for (const gatewayUrl of gatewaysSorted) {
            const abortController = new AbortController();
            const throwIfGatewayRespondsWithInvalidSubplebbit: OptionsToLoadFromGateway["validateGatewayResponseFunc"] = async (
                gatewayRes
            ) => {
                if (typeof gatewayRes.resText !== "string") throw Error("Gateway response has no body");
                // get ipfs cid of IPNS from header or calculate it
                const calculatedSubCidFromBody = await this.calculateIpfsCid(gatewayRes.resText); // cid v0

                if (this._updateCidsAlreadyLoaded.has(calculatedSubCidFromBody))
                    throw new PlebbitError("ERR_GATEWAY_ABORTING_LOADING_SUB_BECAUSE_WE_ALREADY_LOADED_THIS_RECORD", {
                        calculatedSubCidFromBody,
                        ipnsName,
                        gatewayRes,
                        gatewayUrl
                    });

                this._updateCidsAlreadyLoaded.add(calculatedSubCidFromBody);

                let subIpfs: SubplebbitIpfsType;
                try {
                    subIpfs = parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(
                        parseJsonWithPlebbitErrorIfFails(gatewayRes.resText)
                    );
                } catch (e) {
                    (<PlebbitError>e).details.cidOfSubIpns = calculatedSubCidFromBody;
                    throw e;
                }
                const errorWithinRecord = await this._findErrorInSubplebbitRecord(subIpfs, ipnsName, calculatedSubCidFromBody);
                if (errorWithinRecord) {
                    delete errorWithinRecord["stack"];
                    throw errorWithinRecord;
                } else {
                    gatewayFetches[gatewayUrl].subplebbitRecord = subIpfs;
                    gatewayFetches[gatewayUrl].cid = calculatedSubCidFromBody;

                    // Log the TTL from max-age header after successfully setting the subplebbit record
                    const cacheControl = gatewayRes?.res?.headers?.get("cache-control");
                    if (cacheControl) {
                        const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
                        if (maxAgeMatch && maxAgeMatch[1]) {
                            const ttl = parseInt(maxAgeMatch[1]);
                            gatewayFetches[gatewayUrl].ttl = ttl;
                        }
                    }
                }
            };

            const checkResponseHeadersIfOldCid = async (gatewayRes: Response) => {
                const cidOfIpnsFromEtagHeader = gatewayRes?.headers?.get("etag");
                log.trace("cidOfIpnsFromEtagHeader", cidOfIpnsFromEtagHeader, "from gateway", gatewayUrl, "ipns name", ipnsName);
                if (cidOfIpnsFromEtagHeader && this._updateCidsAlreadyLoaded.has(cidOfIpnsFromEtagHeader)) {
                    abortController.abort("Aborting subplebbit IPNS request because we already loaded this record");
                    return new PlebbitError("ERR_GATEWAY_ABORTING_LOADING_SUB_BECAUSE_WE_ALREADY_LOADED_THIS_RECORD", {
                        cidOfIpnsFromEtagHeader,
                        ipnsName,
                        gatewayRes,
                        gatewayUrl
                    });
                }
            };

            const requestHeaders =
                this._updateCidsAlreadyLoaded.size > 0
                    ? { "If-None-Match": '"' + Array.from(this._updateCidsAlreadyLoaded.values()).join(",") + '"' } // tell the gateway we already loaded these records
                    : undefined;
            gatewayFetches[gatewayUrl] = {
                abortController,
                promise: queueLimit(() =>
                    this._fetchWithGateway(gatewayUrl, {
                        recordIpfsType: "ipns",
                        root: ipnsName,
                        recordPlebbitType: "subplebbit",
                        validateGatewayResponseFunc: throwIfGatewayRespondsWithInvalidSubplebbit,
                        abortRequestErrorBeforeLoadingBodyFunc: checkResponseHeadersIfOldCid,
                        abortController,
                        maxFileSizeBytes: MAX_FILE_SIZE_BYTES_FOR_SUBPLEBBIT_IPFS,
                        timeoutMs: this._plebbit._timeouts["subplebbit-ipns"],
                        log,
                        requestHeaders: requestHeaders
                    })
                ),
                timeoutId: setTimeout(
                    () => abortController.abort("Aborting subplebbit IPNS request because it timed out after " + timeoutMs + "ms"),
                    timeoutMs
                )
            };
        }

        const cleanUp = () => {
            queueLimit.clearQueue();
            Object.values(gatewayFetches).forEach((gateway) => {
                if (!gateway.subplebbitRecord && !gateway.error) gateway.abortController.abort("Cleaning up requests for subplebbit");
                clearTimeout(gateway.timeoutId);
            });
        };

        const _findRecentSubplebbit = (): { subplebbit: SubplebbitIpfsType; cid: string } | undefined => {
            // Try to find a very recent subplebbit
            // If not then go with the most recent subplebbit record after fetching from 3 gateways
            const gatewaysWithSub = remeda.keys.strict(gatewayFetches).filter((gatewayUrl) => gatewayFetches[gatewayUrl].subplebbitRecord);
            if (gatewaysWithSub.length === 0) return undefined;

            const currentUpdatedAt = this._subplebbit.raw.subplebbitIpfs?.updatedAt || 0;

            const totalGateways = gatewaysSorted.length;

            const gatewaysWithError = remeda.keys.strict(gatewayFetches).filter((gatewayUrl) => gatewayFetches[gatewayUrl].error);

            const bestGatewayUrl = <string>(
                remeda.maxBy(gatewaysWithSub, (gatewayUrl) => gatewayFetches[gatewayUrl].subplebbitRecord!.updatedAt)
            );
            const bestGatewayRecordAge = timestamp() - gatewayFetches[bestGatewayUrl].subplebbitRecord!.updatedAt; // how old is the record, relative to now, in seconds

            if (gatewayFetches[bestGatewayUrl].subplebbitRecord!.updatedAt > currentUpdatedAt) {
                const bestSubRecord = gatewayFetches[bestGatewayUrl].subplebbitRecord!;
                log(
                    `Gateway (${bestGatewayUrl}) was able to find a very recent subplebbit (${bestSubRecord.address}) whose IPNS is (${ipnsName}).  The record has updatedAt (${bestSubRecord.updatedAt}) that's ${bestGatewayRecordAge}s old with a TTL of ${gatewayFetches[bestGatewayUrl].ttl} seconds`
                );
                return { subplebbit: bestSubRecord, cid: gatewayFetches[bestGatewayUrl].cid! };
            }

            // We weren't able to find any new subplebbit records
            if (gatewaysWithError.length + gatewaysWithSub.length === totalGateways) return undefined;
        };

        const promisesToIterate = <Promise<{ resText: string; res: Response } | { error: PlebbitError }>[]>(
            Object.values(gatewayFetches).map((gatewayFetch) => gatewayFetch.promise)
        );

        let suitableSubplebbit: { subplebbit: SubplebbitIpfsType; cid: string };
        try {
            suitableSubplebbit = await new Promise<typeof suitableSubplebbit>((resolve, reject) =>
                promisesToIterate.map((gatewayPromise, i) =>
                    gatewayPromise
                        .then(async (res) => {
                            if ("error" in res) Object.values(gatewayFetches)[i].error = res.error;
                            const gatewaysWithError = remeda.keys
                                .strict(gatewayFetches)
                                .filter((gatewayUrl) => gatewayFetches[gatewayUrl].error);
                            if (gatewaysWithError.length === gatewaysSorted.length)
                                // All gateways failed
                                reject("All gateways failed to fetch subplebbit record " + ipnsName);

                            const recentSubplebbit = _findRecentSubplebbit();
                            if (recentSubplebbit) {
                                cleanUp();
                                resolve(recentSubplebbit);
                            }
                        })
                        .catch((err) => reject("One of the gateway promise requests thrown an error, should not happens:" + err))
                )
            );
        } catch {
            cleanUp();
            const gatewayToError = remeda.mapValues(gatewayFetches, (gatewayFetch) => gatewayFetch.error!);
            const allGatewaysAborted = Object.keys(gatewayFetches)
                .map((gatewayUrl) => gatewayFetches[gatewayUrl].error!)
                .every(
                    (err) =>
                        err.details?.status === 304 || err.code === "ERR_GATEWAY_ABORTING_LOADING_SUB_BECAUSE_WE_ALREADY_LOADED_THIS_RECORD"
                );
            if (allGatewaysAborted) return undefined; // all gateways returned old update cids we already consumed

            const combinedError = new FailedToFetchSubplebbitFromGatewaysError({
                ipnsName,
                gatewayToError,
                subplebbitAddress: this._subplebbit.address
            });
            delete combinedError.stack;
            throw combinedError;
        }

        // TODO add punishment for gateway that returns old ipns record
        // TODO add punishment for gateway that returns invalid subplebbit
        return suitableSubplebbit;
    }

    private async _findErrorInSubplebbitRecord(
        subJson: SubplebbitIpfsType,
        ipnsNameOfSub: string,
        cidOfSubIpns: string
    ): Promise<PlebbitError | undefined> {
        const subInstanceAddress = this._getSubplebbitAddressFromInstance();
        if (subJson.address !== subInstanceAddress) {
            // Did the gateway supply us with a different subplebbit's ipns

            const error = new PlebbitError("ERR_THE_SUBPLEBBIT_IPNS_RECORD_POINTS_TO_DIFFERENT_ADDRESS_THAN_WE_EXPECTED", {
                addressFromSubplebbitInstance: subInstanceAddress,
                ipnsName: ipnsNameOfSub,
                addressFromGateway: subJson.address,
                subplebbitIpnsFromGateway: subJson,
                cidOfSubIpns
            });
            return error;
        }
        const verificationOpts = {
            subplebbit: subJson,
            subplebbitIpnsName: ipnsNameOfSub,
            resolveAuthorAddresses: this._plebbit.resolveAuthorAddresses,
            clientsManager: this,
            overrideAuthorAddressIfInvalid: true,
            validatePages: this._plebbit.validatePages
        };
        const updateValidity = await verifySubplebbit(verificationOpts);
        if (!updateValidity.valid) {
            const error = new PlebbitError("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID", {
                signatureValidity: updateValidity,
                verificationOpts,
                cidOfSubIpns
            });
            return error;
        }
    }
}
