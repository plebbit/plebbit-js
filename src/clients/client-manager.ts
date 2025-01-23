import { Plebbit } from "../plebbit/plebbit.js";
import { hideClassPrivateProps, isIpfsCid, isIpfsPath, throwWithErrorCode, timestamp } from "../util.js";
import assert from "assert";
import type { ChainTicker } from "../types.js";
import { verifySubplebbit } from "../signer/index.js";
import * as remeda from "remeda";
import { FailedToFetchSubplebbitFromGatewaysError, PlebbitError } from "../plebbit-error.js";
import { GenericIpfsClient } from "./ipfs-client.js";
import { GenericPubsubClient } from "./pubsub-client.js";
import { GenericChainProviderClient } from "./chain-provider-client.js";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import { GenericIpfsGatewayClient } from "./ipfs-gateway-client.js";

import { BaseClientsManager, CachedTextRecordResolve, OptionsToLoadFromGateway } from "./base-client-manager.js";
import { subplebbitForPublishingCache } from "../constants.js";

import type { SubplebbitIpfsType, SubplebbitJson } from "../subplebbit/types.js";
import Logger from "@plebbit/plebbit-logger";
import pLimit from "p-limit";
import { parseJsonWithPlebbitErrorIfFails, parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails } from "../schema/schema-util.js";

export type ResultOfFetchingSubplebbit =
    | { subplebbit: SubplebbitIpfsType; cid: string } // when we fetch a new subplebbit only
    | undefined; // undefined is when we resolve an IPNS and it's equal to subplebbit.updateCid. So no need to fetch IPFS

export class ClientsManager extends BaseClientsManager {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: GenericIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: GenericIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: GenericPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
    };

    constructor(plebbit: Plebbit) {
        super(plebbit);
        this._plebbit = plebbit;
        //@ts-expect-error
        this.clients = {};
        this._initIpfsGateways();
        this._initIpfsClients();
        this._initPubsubClients();
        this._initChainProviders();
        hideClassPrivateProps(this);
    }

    protected _initIpfsGateways() {
        for (const gatewayUrl of remeda.keys.strict(this._plebbit.clients.ipfsGateways))
            this.clients.ipfsGateways = { ...this.clients.ipfsGateways, [gatewayUrl]: new GenericIpfsGatewayClient("stopped") };
    }

    protected _initIpfsClients() {
        for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.ipfsClients))
            this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new GenericIpfsClient("stopped") };
    }

    protected _initPubsubClients() {
        for (const pubsubUrl of remeda.keys.strict(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new GenericPubsubClient("stopped") };
    }

    protected _initChainProviders() {
        this.clients.chainProviders = {};
        for (const [chain, chainProvider] of remeda.entries.strict(this._plebbit.chainProviders)) {
            this.clients.chainProviders[chain] = {};
            for (const chainProviderUrl of chainProvider.urls)
                this.clients.chainProviders[chain][chainProviderUrl] = new GenericChainProviderClient("stopped");
        }
    }

    // Overriding functions from base client manager here

    override preFetchGateway(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway): void {
        const gatewayState =
            loadOpts.recordPlebbitType === "subplebbit"
                ? this._getStatePriorToResolvingSubplebbitIpns()
                : loadOpts.recordPlebbitType === "comment-update"
                  ? "fetching-update-ipfs"
                  : loadOpts.recordPlebbitType === "comment" ||
                      loadOpts.recordPlebbitType === "generic-ipfs" ||
                      loadOpts.recordPlebbitType === "page-ipfs"
                    ? "fetching-ipfs"
                    : undefined;
        assert(gatewayState, "unable to compute the new gateway state");
        this.updateGatewayState(gatewayState, gatewayUrl);
    }

    override postFetchGatewayFailure(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway) {
        this.updateGatewayState("stopped", gatewayUrl);
    }

    override postFetchGatewaySuccess(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway) {
        this.updateGatewayState("stopped", gatewayUrl);
    }

    override postFetchGatewayAborted(gatewayUrl: string, loadOpts: OptionsToLoadFromGateway) {
        this.postFetchGatewaySuccess(gatewayUrl, loadOpts);
    }

    override preResolveTextRecord(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: ChainTicker,
        chainProviderUrl: string,
        staleCache?: CachedTextRecordResolve
    ) {
        // only update state if there's no cache
        if (!staleCache) {
            const newState = txtRecordName === "subplebbit-address" ? "resolving-subplebbit-address" : "resolving-author-address";
            this.updateChainProviderState(newState, chain, chainProviderUrl);
        }
    }

    override postResolveTextRecordSuccess(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string,
        chain: ChainTicker,
        chainProviderUrl: string,
        staleCache?: CachedTextRecordResolve
    ): void {
        // only update state if there's no cache
        if (!staleCache) {
            this.updateChainProviderState("stopped", chain, chainProviderUrl);
        }
    }

    override postResolveTextRecordFailure(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: ChainTicker,
        chainProviderUrl: string,
        error: Error,
        staleCache?: CachedTextRecordResolve
    ) {
        // only update state if there's no cache
        if (!staleCache) {
            this.updateChainProviderState("stopped", chain, chainProviderUrl);
        }
    }

    // State methods here

    updatePubsubState(newState: GenericPubsubClient["state"], pubsubProvider: string | undefined) {
        pubsubProvider = pubsubProvider || this._defaultPubsubProviderUrl;
        assert(typeof pubsubProvider === "string");
        assert(typeof newState === "string", "Can't update pubsub state to undefined");
        if (this.clients.pubsubClients[pubsubProvider].state === newState) return;
        this.clients.pubsubClients[pubsubProvider].state = newState;
        this.clients.pubsubClients[pubsubProvider].emit("statechange", newState);
    }

    updateIpfsState(newState: GenericIpfsClient["state"]) {
        assert(this._defaultIpfsProviderUrl);
        assert(typeof newState === "string", "Can't update ipfs state to undefined");
        if (this.clients.ipfsClients[this._defaultIpfsProviderUrl].state === newState) return;
        this.clients.ipfsClients[this._defaultIpfsProviderUrl].state = newState;
        this.clients.ipfsClients[this._defaultIpfsProviderUrl].emit("statechange", newState);
    }

    updateGatewayState(newState: GenericIpfsGatewayClient["state"], gateway: string) {
        assert(typeof newState === "string", "Can't update gateway state to undefined");
        if (this.clients.ipfsGateways[gateway].state === newState) return;
        this.clients.ipfsGateways[gateway].state = newState;
        this.clients.ipfsGateways[gateway].emit("statechange", newState);
    }

    updateChainProviderState(newState: GenericChainProviderClient["state"], chainTicker: ChainTicker, chainProviderUrl: string) {
        assert(typeof newState === "string", "Can't update chain provider state to undefined");
        if (this.clients.chainProviders[chainTicker][chainProviderUrl].state === newState) return;
        this.clients.chainProviders[chainTicker][chainProviderUrl].state = newState;
        this.clients.chainProviders[chainTicker][chainProviderUrl].emit("statechange", newState);
    }

    async fetchCid(cid: string): Promise<string> {
        let finalCid = remeda.clone(cid);
        if (!isIpfsCid(finalCid) && isIpfsPath(finalCid)) finalCid = finalCid.split("/")[2];
        if (!isIpfsCid(finalCid)) throwWithErrorCode("ERR_CID_IS_INVALID", { cid });
        if (this._defaultIpfsProviderUrl) return this._fetchCidP2P(cid);
        else {
            const log = Logger("plebbit-js:clients-manager:fetchCid");
            const resObj = await this.fetchFromMultipleGateways({
                root: cid,
                recordIpfsType: "ipfs",
                recordPlebbitType: "generic-ipfs",
                validateGatewayResponse: async () => {}, // no need to validate body against cid here, fetchFromMultipleGateways already does it
                log
            });
            return resObj.resText;
        }
    }

    // fetchSubplebbit should be here

    private async _findErrorInSubplebbitRecord(
        subJson: SubplebbitIpfsType,
        ipnsNameOfSub: string,
        cidOfSubIpns: string
    ): Promise<PlebbitError | undefined> {
        const subInstanceAddress = this._getSubplebbitAddressFromInstance();
        if (subJson.address !== subInstanceAddress) {
            // Did the gateway supply us with a different subplebbit's ipns

            const error = new PlebbitError("ERR_GATEWAY_RESPONDED_WITH_DIFFERENT_SUBPLEBBIT", {
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

    async fetchNewUpdateForSubplebbit(subAddress: SubplebbitIpfsType["address"]) {
        const ipnsName = await this.resolveSubplebbitAddressIfNeeded(subAddress);
        // if ipnsAddress is undefined then it will be handled in postResolveTextRecordSuccess

        if (!ipnsName) throw Error("Failed to resolve subplebbit address to an IPNS name");

        // This function should fetch SubplebbitIpfs, parse it and verify its signature
        // Then return SubplebbitIpfs

        // only exception is if the ipnsRecord.value (ipfs path) is the same as as curSubplebbit.updateCid
        // in that case no need to fetch the subplebbitIpfs, we will return undefined
        this.preFetchSubplebbitIpns(ipnsName);
        let subRes: ResultOfFetchingSubplebbit;
        if (this._defaultIpfsProviderUrl) subRes = await this._fetchSubplebbitIpnsP2PAndVerify(ipnsName);
        else subRes = await this._fetchSubplebbitFromGateways(ipnsName);
        // States of gateways should be updated by fetchFromMultipleGateways
        // Subplebbit records are verified within _fetchSubplebbitFromGateways

        if (subRes?.subplebbit) {
            this.postFetchSubplebbitIpfsSuccess(subRes); // We successfully fetched and verified the SubplebbitIpfs

            subplebbitForPublishingCache.set(
                subRes.subplebbit.address,
                remeda.pick(subRes.subplebbit, ["encryption", "pubsubTopic", "address"])
            );
        }
        return subRes;
    }

    private async _fetchSubplebbitIpnsP2PAndVerify(ipnsName: string): Promise<ResultOfFetchingSubplebbit> {
        const log = Logger("plebbit-js:clients-manager:_fetchSubplebbitIpnsP2PAndVerify");
        this.preResolveSubplebbitIpnsP2P(ipnsName);
        let subplebbitCid: string;
        try {
            subplebbitCid = await this.resolveIpnsToCidP2P(ipnsName); // What if this fails
        } catch (e) {
            this.postResolveSubplebbitIpnsP2PFailure(ipnsName, <PlebbitError>e);
            throw e;
        }
        this.postResolveSubplebbitIpnsP2PSuccess(ipnsName, subplebbitCid);

        const curSubUpdateCid = this._plebbit._updatingSubplebbits[this._getSubplebbitAddressFromInstance()]?.updateCid;
        // need to check if subplebbitCid === sub.updateCid
        if (curSubUpdateCid && subplebbitCid === curSubUpdateCid) {
            log("Resolved subplebbit IPNS", ipnsName, "to the same subplebbit.updateCid. No need to fetch its ipfs");
            return undefined;
        }
        const lastInvalidSubCid = this._plebbit._updatingSubplebbits[this._getSubplebbitAddressFromInstance()]?._lastInvalidSubplebbitCid;
        if (lastInvalidSubCid && subplebbitCid === lastInvalidSubCid) {
            log("Resolved subplebbit IPNS", ipnsName, "to the same subplebbit._lastInvalidSubplebbitCid. No need to fetch its ipfs");
            return undefined;
        }
        let rawSubJsonString: string;
        try {
            rawSubJsonString = await this._fetchCidP2P(subplebbitCid);
        } catch (e) {
            this.postFetchSubplebbitStringJsonP2PFailure(ipnsName, subplebbitCid, <PlebbitError>e);
            throw e;
        }
        this.postFetchSubplebbitStringJsonP2PSuccess();

        try {
            const subIpfs = parseSubplebbitIpfsSchemaPassthroughWithPlebbitErrorIfItFails(
                parseJsonWithPlebbitErrorIfFails(rawSubJsonString)
            );

            const errInRecord = await this._findErrorInSubplebbitRecord(subIpfs, ipnsName, subplebbitCid);

            if (errInRecord) throw errInRecord;
            return { subplebbit: subIpfs, cid: subplebbitCid };
        } catch (e) {
            (<PlebbitError>e).details.cidOfSubIpns = subplebbitCid;
            this.postFetchSubplebbitInvalidRecord(rawSubJsonString, <PlebbitError>e); // should throw here
            throw new Error("postFetchSubplebbitInvalidRecord should throw, but it did not");
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
            const throwIfGatewayRespondsWithInvalidSubplebbit: OptionsToLoadFromGateway["validateGatewayResponse"] = async (gatewayRes) => {
                if (typeof gatewayRes.resText !== "string") throw Error("Gateway response has no body");
                // get ipfs cid of IPNS from header or calculate it
                const subCid = await calculateIpfsHash(gatewayRes.resText);
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

            const checkIpnsCidFromGateway: OptionsToLoadFromGateway["shouldConsumeBodyFn"] = async (res: Response) => {
                const ipnsCidFromGateway = res.headers.get("x-ipfs-roots");
                const curSubUpdateCid = this._plebbit._updatingSubplebbits[this._getSubplebbitAddressFromInstance()]?.updateCid;
                if (curSubUpdateCid && ipnsCidFromGateway === curSubUpdateCid) {
                    // this gateway responded with a subplebbit IPFS we already have
                    // we will abort and stop it from consuming the body
                    gatewayFetches[gatewayUrl].abortController.abort(
                        `Gateway response has the same cid as plebbit._updatingSubplebbits[${this._getSubplebbitAddressFromInstance()}].updateCid. No need to consume body since it's an IPNS record that has been processed already`
                    );
                    return false;
                }

                const lastInvalidSubCid =
                    this._plebbit._updatingSubplebbits[this._getSubplebbitAddressFromInstance()]?._lastInvalidSubplebbitCid;
                if (lastInvalidSubCid && ipnsCidFromGateway === curSubUpdateCid) {
                    // this gateway responded with a subplebbit whose record we know to be invalid
                    gatewayFetches[gatewayUrl].abortController.abort(
                        `Gateway response has the same cid as plebbit._updatingSubplebbits[${this._getSubplebbitAddressFromInstance()}]._lastInvalidSubplebbitCid. No need to consume body since it's an invalid record`
                    );
                    return false;
                }
                return true;
            };
            gatewayFetches[gatewayUrl] = {
                abortController,
                promise: queueLimit(() =>
                    this._fetchWithGateway(gatewayUrl, {
                        recordIpfsType: "ipns",
                        root: ipnsName,
                        recordPlebbitType: "subplebbit",
                        validateGatewayResponse: throwIfGatewayRespondsWithInvalidSubplebbit,
                        shouldConsumeBodyFn: checkIpnsCidFromGateway,
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
                if (!gateway.subplebbitRecord && !gateway.error) gateway.abortController.abort();
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
            const combinedError = new FailedToFetchSubplebbitFromGatewaysError({ ipnsName, gatewayToError });
            delete combinedError.stack;
            throw combinedError;
        }

        // TODO add punishment for gateway that returns old ipns record
        // TODO add punishment for gateway that returns invalid subplebbit
        return suitableSubplebbit;
    }

    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns" {
        return "fetching-subplebbit-ipns";
    }

    protected _getSubplebbitAddressFromInstance(): string {
        throw Error("Should be implemented");
    }

    protected postFetchSubplebbitInvalidRecord(subRawJson: string, subError: PlebbitError): void {
        throw Error("Should be implemented");
    }

    protected preFetchSubplebbitIpns(subIpnsName: string) {
        throw Error("Should be implemented");
    }

    protected preResolveSubplebbitIpnsP2P(subIpnsName: string) {
        throw Error("Should be implemented");
    }

    protected postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string) {
        throw Error("Should be implemented");
    }

    protected postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError) {
        throw Error("Should be implemented");
    }

    // For IPFS P2P only
    protected postFetchSubplebbitStringJsonP2PSuccess() {
        // Prior to verifying, this is right after getting the raw string of SubplebbitIpfs json
        throw Error("Should be implemented");
    }
    // For IPFS P2P only

    protected postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError) {
        // We failed to fetch the cid of the subplebbit
        throw Error("Should be implemented");
    }

    // This is for Gateway and P2P
    protected postFetchSubplebbitIpfsSuccess(subRes: ResultOfFetchingSubplebbit) {
        throw Error("Should be implemented");
    }
}

type SubplebbitGatewayFetch = {
    [gateway: string]: {
        abortController: AbortController;
        promise: Promise<any>;
        cid?: SubplebbitJson["updateCid"];
        subplebbitRecord?: SubplebbitIpfsType;
        error?: PlebbitError;
        timeoutId: any;
    };
};
