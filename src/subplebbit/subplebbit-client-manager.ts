import retry, { RetryOperation } from "retry";
import { CachedTextRecordResolve, OptionsToLoadFromGateway } from "../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../clients/chain-provider-client.js";
import { ClientsManager, ResultOfFetchingSubplebbit } from "../clients/client-manager.js";
import { CommentIpfsGatewayClient, SubplebbitIpfsGatewayClient } from "../clients/ipfs-gateway-client.js";
import { SubplebbitPlebbitRpcStateClient } from "../clients/rpc-client/plebbit-rpc-state-client.js";
import { FailedToFetchSubplebbitFromGatewaysError, PlebbitError } from "../plebbit-error.js";
import { ChainTicker } from "../types.js";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
import * as remeda from "remeda";
import { SubplebbitIpfsType, SubplebbitJson } from "./types.js";
import Logger from "@plebbit/plebbit-logger";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";

import { timestamp } from "../util.js";
import pLimit from "p-limit";
import { SubplebbitKuboRpcClient } from "../clients/ipfs-client.js";
import { SubplebbitKuboPubsubClient } from "../clients/pubsub-client.js";
import { subplebbitForPublishingCache } from "../constants.js";
import { parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails, parseJsonWithPlebbitErrorIfFails } from "../schema/schema-util.js";
import { verifySubplebbit } from "../signer/index.js";
import { CID } from "kubo-rpc-client";

type SubplebbitGatewayFetch = {
    [gatewayUrl: string]: {
        abortController: AbortController;
        promise: Promise<any>;
        cid?: SubplebbitJson["updateCid"];
        subplebbitRecord?: SubplebbitIpfsType;
        error?: PlebbitError;
        abortError?: PlebbitError; // why did we decide to abort consuming the body of gateway request? Mostly because it's a cid we already consumed
        timeoutId: any;
    };
};
export class SubplebbitClientsManager extends ClientsManager {
    override clients!: {
        ipfsGateways: { [ipfsGatewayUrl: string]: SubplebbitIpfsGatewayClient };
        kuboRpcClients: { [kuboRpcClientUrl: string]: SubplebbitKuboRpcClient };
        pubsubKuboRpcClients: { [pubsubClientUrl: string]: SubplebbitKuboPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, SubplebbitPlebbitRpcStateClient>;
    };
    private _subplebbit: RemoteSubplebbit;
    _ipnsLoadingOperation?: RetryOperation = undefined;
    _updateTimeout?: NodeJS.Timeout = undefined;

    constructor(subplebbit: SubplebbitClientsManager["_subplebbit"]) {
        super(subplebbit._plebbit);
        this._subplebbit = subplebbit;
        this._initPlebbitRpcClients();
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

    protected _initPlebbitRpcClients() {
        for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = {
                ...this.clients.plebbitRpcClients,
                [rpcUrl]: new SubplebbitPlebbitRpcStateClient("stopped")
            };
    }

    override updateIpfsState(newState: SubplebbitKuboRpcClient["state"]) {
        super.updateIpfsState(newState);
    }

    override updatePubsubState(newState: SubplebbitKuboPubsubClient["state"], pubsubProvider: string | undefined) {
        super.updatePubsubState(newState, pubsubProvider);
    }

    override updateGatewayState(newState: CommentIpfsGatewayClient["state"], gateway: string): void {
        super.updateGatewayState(newState, gateway);
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
        if (
            this._subplebbit.state === "updating" &&
            txtRecordName === "subplebbit-address" &&
            !staleCache &&
            this._subplebbit.updatingState !== "fetching-ipfs" // we don't state to be resolving-address when verifying signature
        )
            this._subplebbit._setUpdatingState("resolving-address");
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
        // TODO should check for regex of ipns eventually
        if (!resolvedTextRecord && this._subplebbit.state === "updating") {
            this._subplebbit._setUpdatingState("failed");
            const error = new PlebbitError("ERR_DOMAIN_TXT_RECORD_NOT_FOUND", {
                subplebbitAddress: address,
                textRecord: txtRecordName
            });
            this._subplebbit.emit("error", error);
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
                    if (e instanceof Error && !this._subplebbit._isRetriableErrorWhenLoading(e)) {
                        // critical error that can't be retried
                        resolve({ criticalError: e });
                    } else {
                        // we encountered a retriable error, could be gateways failing to load
                        // does not include gateways returning an old record
                        if (e instanceof PlebbitError) e.details.countOfLoadAttempts = curAttempt;
                        this._subplebbit._setUpdatingState("waiting-retry");
                        log.trace(`Failed to load Subplebbit ${this._subplebbit.address} record for the ${curAttempt}th attempt`, e);
                        this._subplebbit.emit("waiting-retry", <Error>e);
                        this._ipnsLoadingOperation!.retry(<Error>e);
                    }
                }
            });
        });
    }

    private _findInvalidCidInNonRetriableError(err: PlebbitError): string | undefined {
        const findCidInErr = (err: any) => err.details?.cidOfSubIpns || err.details?.cid;
        if (err.details.gatewayToError)
            for (const gateway of Object.keys(err.details.gatewayToError))
                if (findCidInErr(err.details.gatewayToError[gateway])) return findCidInErr(err.details.gatewayToError[gateway]);
        return findCidInErr(err);
    }

    async updateOnce() {
        const log = Logger("plebbit-js:remote-subplebbit:update");

        this._ipnsLoadingOperation = retry.operation({ forever: true, factor: 2 });
        const subLoadingRes = await this._retryLoadingSubplebbitAddress(this._subplebbit.address); // will return undefined if no new sub CID is found
        this._ipnsLoadingOperation.stop();

        if (subLoadingRes && "criticalError" in subLoadingRes) {
            log.error(
                `Subplebbit ${this._subplebbit.address} encountered a non retriable error while updating, will emit an error event and mark invalid cid to not be loaded again`
            );
            this._subplebbit._setUpdatingState("failed");

            if (subLoadingRes instanceof PlebbitError) {
                const invalidCid = this._findInvalidCidInNonRetriableError(subLoadingRes);
                if (invalidCid) this._subplebbit._lastInvalidSubplebbitCid = invalidCid;
            }
            this._subplebbit.emit("error", <PlebbitError>subLoadingRes.criticalError);
        } else if (subLoadingRes?.subplebbit && (this._subplebbit.updatedAt || 0) < subLoadingRes.subplebbit.updatedAt) {
            await this._subplebbit.initSubplebbitIpfsPropsNoMerge(subLoadingRes.subplebbit);
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
            this._subplebbit.emit("update", this._subplebbit);
        } else if (subLoadingRes === undefined) {
            // we loaded a sub record that we already consumed
            // we will retry later
            this._subplebbit._setUpdatingState("waiting-retry");
            this._subplebbit.emit("waiting-retry", new PlebbitError("ERR_REMOTE_SUBPLEBBIT_RECEIVED_ALREADY_PROCCESSED_RECORD"));
        }
    }

    async startUpdatingLoop() {
        const log = Logger("plebbit-js:remote-subplebbit:update");

        const updateInterval = this._defaultIpfsProviderUrl ? 1000 : this._plebbit.updateInterval; // if we're on helia or kubo we should resolve IPNS every second
        const updateLoop = (async () => {
            if (this._subplebbit.state === "updating")
                this.updateOnce()
                    .catch((e) => log.error(`Failed to update subplebbit ${this._subplebbit.address}`, e))
                    .finally(() => setTimeout(updateLoop, updateInterval));
        }).bind(this);

        this.updateOnce()
            .catch((e) => log.error(`Failed to update subplebbit ${this._subplebbit.address}`, e))
            .finally(() => (this._updateTimeout = setTimeout(updateLoop, updateInterval)));
    }

    async stopUpdatingLoop() {
        this._ipnsLoadingOperation?.stop();
        clearTimeout(this._updateTimeout);
    }

    // fetching subplebbit ipns here

    async fetchNewUpdateForSubplebbit(subAddress: SubplebbitIpfsType["address"]): Promise<ResultOfFetchingSubplebbit> {
        const ipnsName = await this.resolveSubplebbitAddressIfNeeded(subAddress);
        // if ipnsAddress is undefined then it will be handled in postResolveTextRecordSuccess

        if (!ipnsName) throw Error("Failed to resolve subplebbit address to an IPNS name");

        // This function should fetch SubplebbitIpfs, parse it and verify its signature
        // Then return SubplebbitIpfs

        // only exception is if the ipnsRecord.value (ipfs path) is the same as as curSubplebbit.updateCid
        // in that case no need to fetch the subplebbitIpfs, we will return undefined
        this._subplebbit._setUpdatingState("fetching-ipns");
        let subRes: ResultOfFetchingSubplebbit;
        if (this._defaultIpfsProviderUrl) {
            // we're connected to kubo or helia
            try {
                subRes = await this._fetchSubplebbitIpnsP2PAndVerify(ipnsName);
            } catch (e) {
                throw e;
            } finally {
                this.updateIpfsState("stopped");
            }
        } else subRes = await this._fetchSubplebbitFromGateways(ipnsName); // let's use gateways to fetch because we're not connected to kubo or helia
        // States of gateways should be updated by fetchFromMultipleGateways
        // Subplebbit records are verified within _fetchSubplebbitFromGateways

        if (subRes?.subplebbit) {
            // we found a new record that is verified
            this._subplebbit._setUpdatingState("succeeded");

            subplebbitForPublishingCache.set(
                subRes.subplebbit.address,
                remeda.pick(subRes.subplebbit, ["encryption", "pubsubTopic", "address"])
            );
        }
        return subRes;
    }

    private async _fetchSubplebbitIpnsP2PAndVerify(ipnsName: string): Promise<ResultOfFetchingSubplebbit> {
        const log = Logger("plebbit-js:clients-manager:_fetchSubplebbitIpnsP2PAndVerify");
        this.updateIpfsState("fetching-ipns");
        const latestSubplebbitCid = await this.resolveIpnsToCidP2P(ipnsName);

        const curSubUpdateCid = this._plebbit._updatingSubplebbits[this._getSubplebbitAddressFromInstance()]?.updateCid;
        // need to check if subplebbitCid === sub.updateCid
        if (curSubUpdateCid && latestSubplebbitCid === curSubUpdateCid) {
            log.trace("Resolved subplebbit IPNS", ipnsName, "to the same subplebbit.updateCid. No need to fetch its ipfs");
            return undefined;
        }
        const lastInvalidSubCid = this._plebbit._updatingSubplebbits[this._getSubplebbitAddressFromInstance()]?._lastInvalidSubplebbitCid;
        if (lastInvalidSubCid && latestSubplebbitCid === lastInvalidSubCid) {
            log.trace("Resolved subplebbit IPNS", ipnsName, "to the same subplebbit._lastInvalidSubplebbitCid. No need to fetch its ipfs");
            return undefined;
        }

        this.updateIpfsState("fetching-ipfs");
        this._subplebbit._setUpdatingState("fetching-ipfs");

        const rawSubJsonString = await this._fetchCidP2P(latestSubplebbitCid);

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
        const timeoutMs = this._plebbit._clientsManager.getGatewayTimeoutMs("subplebbit");

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
                const subCid = await calculateIpfsHash(gatewayRes.resText); // cid v0
                // TODO need to compare it against updateCid somewhere
                let subIpfs: SubplebbitIpfsType;
                try {
                    subIpfs = parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(
                        parseJsonWithPlebbitErrorIfFails(gatewayRes.resText)
                    );
                } catch (e) {
                    (<PlebbitError>e).details.cidOfSubIpns = subCid;
                    throw e;
                }
                const errorWithinRecord = await this._findErrorInSubplebbitRecord(subIpfs, ipnsName, subCid);
                if (errorWithinRecord) {
                    delete errorWithinRecord["stack"];
                    throw errorWithinRecord;
                } else {
                    gatewayFetches[gatewayUrl].subplebbitRecord = subIpfs;
                    gatewayFetches[gatewayUrl].cid = subCid;
                }
            };

            const checkIpnsCidFromGateway: OptionsToLoadFromGateway["shouldAbortRequestFunc"] = async (res: Response) => {
                const ipnsCidFromGateway = res.headers.get("x-ipfs-roots")
                    ? CID.parse(res.headers.get("x-ipfs-roots")!).toV0().toString()
                    : undefined;
                const curSubUpdateCid = this._plebbit._updatingSubplebbits[this._getSubplebbitAddressFromInstance()]?.updateCid;
                if (curSubUpdateCid && ipnsCidFromGateway === curSubUpdateCid) {
                    // this gateway responded with a subplebbit IPFS we already have
                    // we will abort and stop it from consuming the body
                    const error = new PlebbitError("ERR_GATEWAY_ABORTING_LOADING_SUB_BECAUSE_SAME_UPDATE_CID", {
                        ipnsCidFromGatewayHeaders: ipnsCidFromGateway
                    });
                    gatewayFetches[gatewayUrl].abortError = error;

                    gatewayFetches[gatewayUrl].abortController.abort(error.message);
                    return error;
                }

                const lastInvalidSubCid =
                    this._plebbit._updatingSubplebbits[this._getSubplebbitAddressFromInstance()]?._lastInvalidSubplebbitCid;
                if (lastInvalidSubCid && ipnsCidFromGateway === lastInvalidSubCid) {
                    const error = new PlebbitError("ERR_GATEWAY_ABORTING_LOADING_SUB_BECAUSE_SAME_INVALID_SUBPLEBBIT_RECORD", {
                        ipnsCidFromGatewayHeaders: ipnsCidFromGateway
                    });
                    // this gateway responded with a subplebbit whose record we know to be invalid
                    gatewayFetches[gatewayUrl].abortError = error;
                    gatewayFetches[gatewayUrl].abortController.abort(error.message);
                    return error;
                }
            };
            gatewayFetches[gatewayUrl] = {
                abortController,
                promise: queueLimit(() =>
                    this._fetchWithGateway(gatewayUrl, {
                        recordIpfsType: "ipns",
                        root: ipnsName,
                        recordPlebbitType: "subplebbit",
                        validateGatewayResponseFunc: throwIfGatewayRespondsWithInvalidSubplebbit,
                        shouldAbortRequestFunc: checkIpnsCidFromGateway,
                        abortController,
                        log
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
            Object.values(gatewayFetches).map((gateway) => {
                if (!gateway.subplebbitRecord && !gateway.error && !gateway.abortError) gateway.abortController.abort();
                clearTimeout(gateway.timeoutId);
            });
        };

        const _findRecentSubplebbit = (): { subplebbit: SubplebbitIpfsType; cid: string } | undefined => {
            // Try to find a very recent subplebbit
            // If not then go with the most recent subplebbit record after fetching from 3 gateways
            const gatewaysWithSub = remeda.keys.strict(gatewayFetches).filter((gatewayUrl) => gatewayFetches[gatewayUrl].subplebbitRecord);
            if (gatewaysWithSub.length === 0) return undefined;

            const totalGateways = gatewaysSorted.length;

            const quorm = Math.min(2, totalGateways);

            const freshThreshold = 60 * 60; // if a record is as old as 60 min, then use it immediately

            const gatewaysWithError = remeda.keys.strict(gatewayFetches).filter((gatewayUrl) => gatewayFetches[gatewayUrl].error);

            const bestGatewayUrl = <string>(
                remeda.maxBy(gatewaysWithSub, (gatewayUrl) => gatewayFetches[gatewayUrl].subplebbitRecord!.updatedAt)
            );
            const bestGatewayRecordAge = timestamp() - gatewayFetches[bestGatewayUrl].subplebbitRecord!.updatedAt; // how old is the record, relative to now, in seconds

            if (bestGatewayRecordAge <= freshThreshold) {
                // A very recent subplebbit, a good thing
                // TODO reward this gateway
                const bestSubRecord = gatewayFetches[bestGatewayUrl].subplebbitRecord!;
                log(
                    `Gateway (${bestGatewayUrl}) was able to find a very recent subplebbit (${bestSubRecord.address}) whose IPNS is (${ipnsName}).  The record has updatedAt (${bestSubRecord.updatedAt}) that's ${bestGatewayRecordAge}s old`
                );
                return { subplebbit: bestSubRecord, cid: gatewayFetches[bestGatewayUrl].cid! };
            }

            // We weren't able to find a very recent subplebbit record
            if (gatewaysWithSub.length >= quorm || gatewaysWithError.length + gatewaysWithSub.length === totalGateways) {
                // we find the gateway with the max updatedAt
                return { subplebbit: gatewayFetches[bestGatewayUrl].subplebbitRecord!, cid: gatewayFetches[bestGatewayUrl].cid! };
            } else return undefined;
        };

        const promisesToIterate = <Promise<{ resText: string; res: Response } | { error: PlebbitError }>[]>(
            Object.values(gatewayFetches).map((gatewayFetch) => gatewayFetch.promise)
        );

        // TODO need to handle verification of signature within subplebbit

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
                .map((gatewayUrl) => gatewayFetches[gatewayUrl].abortError)
                .every(Boolean);
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
        const updateValidity = await verifySubplebbit(subJson, this._plebbit.resolveAuthorAddresses, this, true);
        if (!updateValidity.valid) {
            const error = new PlebbitError("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID", {
                signatureValidity: updateValidity,
                actualIpnsName: ipnsNameOfSub,
                subplebbitIpns: subJson,
                cidOfSubIpns
            });
            return error;
        }
    }
}
