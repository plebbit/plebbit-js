import Publication from "../publications/publication.js";
import { Plebbit } from "../plebbit.js";
import { Comment } from "../publications/comment/comment.js";
import { getPostUpdateTimestampRange, isIpfsCid, isIpfsPath, throwWithErrorCode, timestamp } from "../util.js";
import assert from "assert";
import type { ChainTicker } from "../types.js";
import { verifySubplebbit } from "../signer/index.js";
import * as remeda from "remeda";
import { FailedToFetchCommentUpdateFromGatewaysError, FailedToFetchSubplebbitFromGatewaysError, PlebbitError } from "../plebbit-error.js";
import { CommentIpfsClient, GenericIpfsClient, PublicationIpfsClient, SubplebbitIpfsClient } from "./ipfs-client.js";
import { GenericPubsubClient, PublicationPubsubClient, SubplebbitPubsubClient } from "./pubsub-client.js";
import { GenericChainProviderClient } from "./chain-provider-client.js";
import {
    CommentIpfsGatewayClient,
    GenericIpfsGatewayClient,
    PublicationIpfsGatewayClient,
    SubplebbitIpfsGatewayClient
} from "./ipfs-gateway-client.js";

import { BaseClientsManager, LoadType } from "./base-client-manager.js";
import { commentPostUpdatesParentsPathConfig, postTimestampConfig, subplebbitForPublishingCache } from "../constants.js";
import {
    CommentPlebbitRpcStateClient,
    GenericPlebbitRpcStateClient,
    PublicationPlebbitRpcStateClient,
    SubplebbitPlebbitRpcStateClient
} from "./plebbit-rpc-state-client.js";
import { SubplebbitIpfsType } from "../subplebbit/types.js";
import Logger from "@plebbit/plebbit-logger";
import pLimit from "p-limit";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import type { CommentIpfsType, CommentIpfsWithCidDefined, CommentUpdate } from "../publications/comment/types.js";
import { CommentIpfsSchema, CommentUpdateSchema } from "../publications/comment/schema.js";
import type { PageIpfs } from "../pages/types.js";
import {
    parseCommentIpfsSchemaWithPlebbitErrorIfItFails,
    parseCommentUpdateSchemaWithPlebbitErrorIfItFails,
    parseJsonWithPlebbitErrorIfFails,
    parseSubplebbitIpfsSchemaWithPlebbitErrorIfItFails
} from "../schema/schema-util.js";
import { verifyCommentUpdate } from "../signer/signatures.js";

export class ClientsManager extends BaseClientsManager {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: GenericIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: GenericIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: GenericPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: { [plebbitRpcClientUrl: string]: GenericPlebbitRpcStateClient };
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
        this._initPlebbitRpcClients();
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
        //@ts-expect-error
        this.clients.chainProviders = {};
        for (const [chain, chainProvider] of remeda.entries.strict(this._plebbit.chainProviders)) {
            this.clients.chainProviders[chain] = {};
            for (const chainProviderUrl of chainProvider.urls)
                this.clients.chainProviders[chain][chainProviderUrl] = new GenericChainProviderClient("stopped");
        }
    }

    protected _initPlebbitRpcClients() {
        for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = { ...this.clients.plebbitRpcClients, [rpcUrl]: new GenericPlebbitRpcStateClient("stopped") };
    }

    // Overriding functions from base client manager here

    override preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType): void {
        const gatewayState =
            loadType === "subplebbit"
                ? this._getStatePriorToResolvingSubplebbitIpns()
                : loadType === "comment-update"
                  ? "fetching-update-ipfs"
                  : loadType === "comment" || loadType === "generic-ipfs" || loadType === "page-ipfs"
                    ? "fetching-ipfs"
                    : undefined;
        assert(gatewayState, "unable to compute the new gateway state");
        this.updateGatewayState(gatewayState, gatewayUrl);
    }

    override postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType) {
        this.updateGatewayState("stopped", gatewayUrl);
    }

    override postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType) {
        this.updateGatewayState("stopped", gatewayUrl);
    }

    override postFetchGatewayAborted(gatewayUrl: string, path: string, loadType: LoadType) {
        this.postFetchGatewaySuccess(gatewayUrl, path, loadType);
    }

    override preResolveTextRecord(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: ChainTicker,
        chainProviderUrl: string
    ) {
        const newState = txtRecordName === "subplebbit-address" ? "resolving-subplebbit-address" : "resolving-author-address";
        this.updateChainProviderState(newState, chain, chainProviderUrl);
    }

    override postResolveTextRecordSuccess(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string,
        chain: ChainTicker,
        chainProviderUrl: string
    ): void {
        this.updateChainProviderState("stopped", chain, chainProviderUrl);
    }

    override postResolveTextRecordFailure(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: ChainTicker,
        chainProviderUrl: string
    ) {
        this.updateChainProviderState("stopped", chain, chainProviderUrl);
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

    async fetchCid(cid: string) {
        let finalCid = remeda.clone(cid);
        if (!isIpfsCid(finalCid) && isIpfsPath(finalCid)) finalCid = finalCid.split("/")[2];
        if (!isIpfsCid(finalCid)) throwWithErrorCode("ERR_CID_IS_INVALID", { cid });
        if (this._defaultIpfsProviderUrl) return this._fetchCidP2P(cid);
        else return this.fetchFromMultipleGateways({ cid }, "generic-ipfs", async () => {});
    }

    // fetchSubplebbit should be here

    private async _findErrorInSubplebbitRecord(subJson: SubplebbitIpfsType, ipnsNameOfSub: string): Promise<PlebbitError | undefined> {
        const subInstanceAddress = this._getSubplebbitAddressFromInstance();
        if (subJson.address !== subInstanceAddress) {
            // Did the gateway supply us with a different subplebbit's ipns

            const error = new PlebbitError("ERR_GATEWAY_RESPONDED_WITH_DIFFERENT_SUBPLEBBIT", {
                addressFromSubplebbitInstance: subInstanceAddress,
                ipnsName: ipnsNameOfSub,
                addressFromGateway: subJson.address,
                subplebbitIpnsFromGateway: subJson
            });
            return error;
        }
        const updateValidity = await verifySubplebbit(subJson, this._plebbit.resolveAuthorAddresses, this, true);
        if (!updateValidity.valid) {
            const error = new PlebbitError("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID", {
                signatureValidity: updateValidity,
                actualIpnsName: ipnsNameOfSub,
                subplebbitIpns: subJson
            });
            return error;
        }
    }

    async fetchSubplebbit(subAddress: string): Promise<SubplebbitIpfsType> {
        const ipnsName = await this.resolveSubplebbitAddressIfNeeded(subAddress);
        // if ipnsAddress is undefined then it will be handled in postResolveTextRecordSuccess

        if (!ipnsName) throw Error("Failed to resolve subplebbit address to an IPNS name");

        return this._fetchSubplebbitIpns(ipnsName);
    }

    private async _fetchSubplebbitIpnsP2PAndVerify(ipnsName: string): Promise<SubplebbitIpfsType> {
        this.preResolveSubplebbitIpnsP2P(ipnsName);
        let subplebbitCid: string;
        try {
            subplebbitCid = await this.resolveIpnsToCidP2P(ipnsName); // What if this fails
        } catch (e) {
            this.postResolveSubplebbitIpnsP2PFailure(ipnsName, <PlebbitError>e);
            throw e;
        }
        this.postResolveSubplebbitIpnsP2PSuccess(ipnsName, subplebbitCid);

        let rawSubJsonString: string;
        try {
            rawSubJsonString = await this._fetchCidP2P(subplebbitCid);
        } catch (e) {
            this.postFetchSubplebbitStringJsonP2PFailure(ipnsName, subplebbitCid, <PlebbitError>e);
            throw e;
        }
        this.postFetchSubplebbitStringJsonP2PSuccess();

        try {
            const subIpfs = parseSubplebbitIpfsSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(rawSubJsonString));

            const errInRecord = await this._findErrorInSubplebbitRecord(subIpfs, ipnsName);

            if (errInRecord) throw errInRecord;
            return subIpfs;
        } catch (e) {
            this.postFetchSubplebbitInvalidRecord(rawSubJsonString, <PlebbitError>e); // should throw here
            throw new Error("postFetchSubplebbitInvalidRecord should throw, but it did not");
        }
    }

    private async _fetchSubplebbitIpns(ipnsName: string): Promise<SubplebbitIpfsType> {
        // This function should fetch SubplebbitIpfs, parse it and verify its signature
        // Then return SubplebbitIpfs
        this.preFetchSubplebbitIpns(ipnsName);
        let subJson: SubplebbitIpfsType;
        if (this._defaultIpfsProviderUrl) subJson = await this._fetchSubplebbitIpnsP2PAndVerify(ipnsName);
        else subJson = await this._fetchSubplebbitFromGateways(ipnsName);
        // States of gateways should be updated by fetchFromMultipleGateways
        // Subplebbit records are verified within _fetchSubplebbitFromGateways

        this.postFetchSubplebbitIpfsSuccess(subJson); // We successfully fetched and verified the SubplebbitIpfs

        subplebbitForPublishingCache.set(subJson.address, remeda.pick(subJson, ["encryption", "pubsubTopic", "address"]));

        return subJson;
    }

    private async _fetchSubplebbitFromGateways(ipnsName: string): Promise<SubplebbitIpfsType> {
        const log = Logger("plebbit-js:subplebbit:fetchSubplebbitFromGateways");
        const concurrencyLimit = 3;
        const timeoutMs = this._plebbit._clientsManager.getGatewayTimeoutMs("subplebbit");

        const path = `/ipns/${ipnsName}`;

        const queueLimit = pLimit(concurrencyLimit);

        // Only sort if we have more than 3 gateways
        const gatewaysSorted =
            remeda.keys.strict(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit
                ? remeda.keys.strict(this._plebbit.clients.ipfsGateways)
                : await this._plebbit.stats.sortGatewaysAccordingToScore("ipns");

        const gatewayFetches: SubplebbitGatewayFetch = {};

        for (const gateway of gatewaysSorted) {
            const abortController = new AbortController();
            gatewayFetches[gateway] = {
                abortController,
                promise: queueLimit(() =>
                    this._fetchWithGateway(gateway, path, "subplebbit", abortController, async (gatewayRes) => {
                        const subIpfs = parseSubplebbitIpfsSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(gatewayRes));
                        const errorWithinRecord = await this._findErrorInSubplebbitRecord(subIpfs, ipnsName);
                        if (errorWithinRecord) {
                            delete errorWithinRecord["stack"];
                            throw errorWithinRecord;
                        } else gatewayFetches[gateway].subplebbitRecord = subIpfs;
                    })
                ),
                timeoutId: setTimeout(() => abortController.abort(), timeoutMs)
            };
        }

        const cleanUp = () => {
            queueLimit.clearQueue();
            Object.values(gatewayFetches).map((gateway) => {
                if (!gateway.subplebbitRecord && !gateway.error) gateway.abortController.abort();
                clearTimeout(gateway.timeoutId);
            });
        };

        const _findRecentSubplebbit = () => {
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
                log(
                    `Gateway (${bestGatewayUrl}) was able to find a very recent subplebbit (${ipnsName}) record that's ${bestGatewayRecordAge}s old`
                );
                return gatewayFetches[bestGatewayUrl].subplebbitRecord;
            }

            // We weren't able to find a very recent subplebbit record
            if (gatewaysWithSub.length >= quorm || gatewaysWithError.length + gatewaysWithSub.length === totalGateways) {
                // we find the gateway with the max updatedAt
                return gatewayFetches[bestGatewayUrl].subplebbitRecord;
            } else return undefined;
        };

        const promisesToIterate = <Promise<string | { error: PlebbitError }>[]>(
            Object.values(gatewayFetches).map((gatewayFetch) => gatewayFetch.promise)
        );

        // TODO need to handle verification of signature within subplebbit

        let suitableSubplebbit: SubplebbitIpfsType;
        try {
            suitableSubplebbit = await new Promise<SubplebbitIpfsType>((resolve, reject) =>
                promisesToIterate.map((gatewayPromise, i) =>
                    gatewayPromise
                        .then(async (res) => {
                            if (remeda.isPlainObject(res) && res.error) Object.values(gatewayFetches)[i].error = res.error;
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
    protected postFetchSubplebbitIpfsSuccess(subJson: SubplebbitIpfsType) {
        throw Error("Should be implemented");
    }
}

export class PublicationClientsManager extends ClientsManager {
    override clients!: {
        ipfsGateways: { [ipfsGatewayUrl: string]: PublicationIpfsGatewayClient | CommentIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: PublicationIpfsClient | CommentIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: PublicationPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, PublicationPlebbitRpcStateClient>;
    };
    _publication: Publication;

    constructor(publication: Publication) {
        super(publication._plebbit);
        this._publication = publication;
    }

    protected override _initIpfsClients(): void {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new PublicationIpfsClient("stopped") };
    }

    protected override _initPubsubClients(): void {
        for (const pubsubUrl of remeda.keys.strict(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new PublicationPubsubClient("stopped") };
    }

    protected override _initPlebbitRpcClients() {
        for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = {
                ...this.clients.plebbitRpcClients,
                [rpcUrl]: new PublicationPlebbitRpcStateClient("stopped")
            };
    }

    // Resolver methods here
    override preResolveTextRecord(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: ChainTicker,
        chainProviderUrl: string
    ): void {
        super.preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl);
        const isStartingToPublish = this._publication.publishingState === "stopped" || this._publication.publishingState === "failed";
        if (this._publication.state === "publishing" && txtRecordName === "subplebbit-address" && isStartingToPublish)
            this._publication._updatePublishingState("resolving-subplebbit-address");
    }

    override postResolveTextRecordSuccess(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string,
        chain: ChainTicker,
        chainProviderUrl: string
    ): void {
        // TODO should check for regex of ipns eventually
        super.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl);
        if (!resolvedTextRecord) {
            this._publication._updatePublishingState("failed");
            const error = new PlebbitError("ERR_DOMAIN_TXT_RECORD_NOT_FOUND", {
                subplebbitAddress: address,
                textRecord: txtRecordName
            });
            this._publication.emit("error", error);
            throw error;
        }
    }

    override emitError(e: PlebbitError): void {
        this._publication.emit("error", e);
    }

    override updateIpfsState(newState: PublicationIpfsClient["state"] | CommentIpfsClient["state"]) {
        super.updateIpfsState(newState);
    }

    override updatePubsubState(newState: PublicationPubsubClient["state"], pubsubProvider: string | undefined) {
        super.updatePubsubState(newState, pubsubProvider);
    }

    override updateGatewayState(newState: PublicationIpfsGatewayClient["state"], gateway: string): void {
        super.updateGatewayState(newState, gateway);
    }

    protected override _getSubplebbitAddressFromInstance(): string {
        return this._publication.subplebbitAddress;
    }

    protected override preFetchSubplebbitIpns(subIpnsName: string) {
        this._publication._updatePublishingState("fetching-subplebbit-ipns");
    }

    protected override preResolveSubplebbitIpnsP2P(subIpnsName: string) {
        this.updateIpfsState("fetching-subplebbit-ipns");
    }

    protected override postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string) {
        this.updateIpfsState("fetching-subplebbit-ipfs");
        this._publication._updatePublishingState("fetching-subplebbit-ipfs");
    }

    protected override postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError): void {
        this.updateIpfsState("stopped");
        throw err;
    }

    protected override postFetchSubplebbitStringJsonP2PSuccess() {
        this.updateIpfsState("stopped");
    }

    protected override postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError): void {
        this.updateIpfsState("stopped");
        // No need to update publication.publishingState here because it's gonna be updated in publication.publish()
        throw err;
    }

    protected override postFetchSubplebbitIpfsSuccess(subJson: SubplebbitIpfsType) {}

    protected override postFetchSubplebbitInvalidRecord(subJson: string, subError: PlebbitError): void {
        this._publication._updatePublishingState("failed");
        this._publication.emit("error", subError);
        throw subError;
    }
}

export class CommentClientsManager extends PublicationClientsManager {
    override clients!: {
        ipfsGateways: { [ipfsGatewayUrl: string]: CommentIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: CommentIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: PublicationPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, CommentPlebbitRpcStateClient>;
    };
    private _comment: Comment;

    constructor(comment: Comment) {
        super(comment);
        this._comment = comment;
    }

    protected override _initIpfsClients(): void {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new CommentIpfsClient("stopped") };
    }

    protected override _initPlebbitRpcClients() {
        for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = { ...this.clients.plebbitRpcClients, [rpcUrl]: new CommentPlebbitRpcStateClient("stopped") };
    }

    // Resolver methods here
    override preResolveTextRecord(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: ChainTicker,
        chainProviderUrl: string
    ): void {
        super.preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl);
        if (this._comment.state === "updating") {
            if (txtRecordName === "subplebbit-address")
                this._comment._setUpdatingState("resolving-subplebbit-address"); // Resolving for Subplebbit
            else if (txtRecordName === "plebbit-author-address") this._comment._setUpdatingState("resolving-author-address"); // Resolving for CommentIpfs
        }
    }

    _findCommentInSubplebbitPosts(subIpns: SubplebbitIpfsType, cid: string) {
        if (!subIpns.posts?.pages?.hot) return undefined; // try to use preloaded pages if possible
        const findInCommentAndChildren = (comment: PageIpfs["comments"][0]): PageIpfs["comments"][0]["comment"] | undefined => {
            if (comment.comment.cid === cid) return comment.comment;
            if (!comment.update.replies?.pages?.topAll) return undefined;
            for (const childComment of comment.update.replies.pages.topAll.comments) {
                const commentInChild = findInCommentAndChildren(childComment);
                if (commentInChild) return commentInChild;
            }
            return undefined;
        };
        for (const post of subIpns.posts.pages.hot.comments) {
            const commentInChild = findInCommentAndChildren(post);
            if (commentInChild) return commentInChild;
        }
        return undefined;
    }

    private async _fetchCommentIpfsFromGateways(parentCid: string): Promise<CommentIpfsType> {
        // We only need to validate once, because with Comment Ipfs the fetchFromMultipleGateways already validates if the response is the same as its cid

        const res = await this.fetchFromMultipleGateways({ cid: parentCid }, "comment", async (_) => {});
        const commentIpfs = parseCommentIpfsSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(res));
        return commentIpfs;
    }

    async _fetchParentCommentForCommentUpdate(parentCid: string): Promise<CommentIpfsWithCidDefined> {
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState("fetching-update-ipfs");
            this._comment._setUpdatingState("fetching-update-ipfs");
            try {
                return {
                    cid: parentCid,
                    ...parseCommentIpfsSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(await this._fetchCidP2P(parentCid)))
                };
            } finally {
                this.updateIpfsState("stopped");
            }
        } else {
            return { cid: parentCid, ...(await this._fetchCommentIpfsFromGateways(parentCid)) };
        }
    }

    async _getParentsPath(subIpns: SubplebbitIpfsType): Promise<string> {
        const parentsPathCache = await this._plebbit._createStorageLRU(commentPostUpdatesParentsPathConfig);
        const commentProps = this._comment.toJSONAfterChallengeVerification();
        const pathCache: string | undefined = await parentsPathCache.getItem(commentProps.cid);
        if (pathCache) return pathCache.split("/").reverse().join("/");

        const postTimestampCache = await this._plebbit._createStorageLRU(postTimestampConfig);
        if (this._comment.depth === 0) await postTimestampCache.setItem(commentProps.cid, this._comment.timestamp);
        let parentCid = this._comment.parentCid;
        let reversedPath = `${this._comment.cid}`; // Path will be reversed here, `nestedReplyCid/replyCid/postCid`
        while (parentCid) {
            // should attempt to fetch cache here
            // Also should we set updatingState everytime we fetch a parent Comment?
            const parentPathCache: string = await parentsPathCache.getItem(parentCid);
            if (parentPathCache) {
                reversedPath += "/" + parentPathCache;
                break;
            } else {
                const parent =
                    this._findCommentInSubplebbitPosts(subIpns, parentCid) || (await this._fetchParentCommentForCommentUpdate(parentCid));

                if (parent.depth === 0) await postTimestampCache.setItem(parent.cid, parent.timestamp);

                reversedPath += `/${parentCid}`;
                parentCid = parent.parentCid;
            }
        }

        await parentsPathCache.setItem(commentProps.cid, reversedPath);

        const finalParentsPath = reversedPath.split("/").reverse().join("/"); // will be postCid/replyCid/nestedReplyCid

        return finalParentsPath;
    }

    private async _fetchCommentUpdateIpfsP2P(
        subIpns: SubplebbitIpfsType,
        timestampRanges: string[],
        parentsPostUpdatePath: string,
        log: Logger
    ): Promise<CommentUpdate> {
        for (const timestampRange of timestampRanges) {
            const folderCid = subIpns.postUpdates![timestampRange];
            const path = `${folderCid}/` + parentsPostUpdatePath + "/update";
            this.updateIpfsState("fetching-ipfs");
            let res: string;
            try {
                res = await this._fetchCidP2P(path);
            } catch (e) {
                log.trace(`Failed to fetch CommentUpdate from path (${path}) with IPFS P2P. Trying the next timestamp range`);
                continue;
            } finally {
                this.updateIpfsState("stopped");
            }
            // TODO should validate signature here I think
            const commentUpdate = parseCommentUpdateSchemaWithPlebbitErrorIfItFails(parseJsonWithPlebbitErrorIfFails(res));
            await this._throwIfCommentUpdateHasInvalidSignature(commentUpdate);
            return commentUpdate;
        }
        throw Error(`CommentUpdate of comment (${this._comment.cid}) does not exist on all timestamp ranges: ${timestampRanges}`);
    }

    private _shouldWeFetchCommentUpdateFromNextTimestamp(err: PlebbitError): boolean {
        if (err.code === "ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID" || err.code === "ERR_INVALID_COMMENT_UPDATE_SCHEMA") return false; // These errors means there's a problem with the record itself, not the loading

        if (err instanceof FailedToFetchCommentUpdateFromGatewaysError) {
            // If all gateway errors are due to the record itself, then we throw an error and don't jump to the next timestamp
            for (const gatewayError of Object.values(err.details.gatewayToError))
                if (this._shouldWeFetchCommentUpdateFromNextTimestamp(gatewayError)) return true; // if there's at least one gateway whose error is not due to the record
            return false; // if all gateways have issues with the record validity itself, then we stop fetching
        }

        return true;
    }

    private async _throwIfCommentUpdateHasInvalidSignature(commentUpdate: CommentUpdate) {
        const signatureValidity = await verifyCommentUpdate(
            commentUpdate,
            this._plebbit.resolveAuthorAddresses,
            this,
            this._comment.subplebbitAddress,
            this._comment.toJSONAfterChallengeVerification(), // we're calling toJSONAfterChallengeVerification because it asserts that cid and signature do exist
            true
        );
        if (!signatureValidity.valid) {
            // TODO need to make sure comment.updatingState is set to failed
            // TODO also need to make sure an error is emitted
            throw new PlebbitError("ERR_COMMENT_UPDATE_SIGNATURE_IS_INVALID", { signatureValidity, commentUpdate });
        }
    }

    private async _fetchCommentUpdateFromGateways(
        subIpns: SubplebbitIpfsType,
        timestampRanges: string[],
        parentsPostUpdatePath: string,
        log: Logger
    ): Promise<CommentUpdate> {
        for (const timestampRange of timestampRanges) {
            // We're validating schema and signature here for every gateway because it's not a regular cid whose content we can verify to match the cid

            const folderCid = subIpns.postUpdates![timestampRange];
            const path = `${folderCid}/` + parentsPostUpdatePath + "/update";
            let commentUpdate: CommentUpdate | undefined;
            try {
                // Validate the Comment Update within the gateway fetching algo
                // fetchFromMultipleGateways will throw if all gateways failed to load the record
                await this.fetchFromMultipleGateways({ cid: path }, "comment-update", async (res) => {
                    const commentUpdateBeforeSignature = parseCommentUpdateSchemaWithPlebbitErrorIfItFails(
                        parseJsonWithPlebbitErrorIfFails(res)
                    );
                    await this._throwIfCommentUpdateHasInvalidSignature(commentUpdateBeforeSignature);
                    commentUpdate = commentUpdateBeforeSignature; // at this point, we know the gateway has provided a valid comment update and we can use it
                });
                if (!commentUpdate) throw Error("Failed to load comment update from gateways. This is a critical logic error");
                return commentUpdate;
            } catch (e) {
                // We need to find out if it's loading error, and if it is we just move on to the next timestamp range
                // If it's a schema or signature error we should stop and throw
                if (this._shouldWeFetchCommentUpdateFromNextTimestamp(<PlebbitError>e)) {
                    log.trace(`Failed to fetch CommentUpdate from path (${path}) from gateways. Trying the next timestamp range`);
                    continue;
                } else throw e;
            }
        }
        throw Error(`CommentUpdate of comment (${this._comment.cid}) does not exist on all timestamp ranges: ${timestampRanges}`);
    }

    async fetchCommentUpdate(): Promise<CommentUpdate> {
        const log = Logger("plebbit-js:comment:update");
        const subIpns = await this.fetchSubplebbit(this._comment.subplebbitAddress);
        const parentsPostUpdatePath = await this._getParentsPath(subIpns);
        const postTimestamp = await (
            await this._plebbit._createStorageLRU(postTimestampConfig)
        ).getItem(this._comment.toJSONAfterChallengeVerification().postCid);
        if (typeof postTimestamp !== "number") throw Error("Failed to fetch cached post timestamp");
        if (!subIpns.postUpdates) throw Error("Subplebbit IPNS record has no postUpdates field");
        const timestampRanges = getPostUpdateTimestampRange(subIpns.postUpdates, postTimestamp);
        if (timestampRanges.length === 0) throw Error("Post has no timestamp range bucket");
        this._comment._setUpdatingState("fetching-update-ipfs");

        if (this._defaultIpfsProviderUrl) return this._fetchCommentUpdateIpfsP2P(subIpns, timestampRanges, parentsPostUpdatePath, log);
        else return this._fetchCommentUpdateFromGateways(subIpns, timestampRanges, parentsPostUpdatePath, log);
    }

    async fetchCommentCid(cid: string): Promise<CommentIpfsType> {
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState("fetching-ipfs");
            const commentContent = CommentIpfsSchema.parse(JSON.parse(await this._fetchCidP2P(cid)));
            this.updateIpfsState("stopped");
            return commentContent;
        } else return this._fetchCommentIpfsFromGateways(cid);
    }

    override updateIpfsState(newState: CommentIpfsClient["state"]) {
        super.updateIpfsState(newState);
    }

    protected _isPublishing() {
        return this._comment.state === "publishing";
    }

    override postResolveTextRecordSuccess(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string,
        chain: ChainTicker,
        chainProviderUrl: string
    ): void {
        super.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl);
        // TODO should check for regex of ipns eventually
        if (!resolvedTextRecord) {
            // need to check if publishing or updating
            if (this._isPublishing()) {
                this._comment._updatePublishingState("failed");
            } else this._comment._setUpdatingState("failed");
            const error = new PlebbitError("ERR_DOMAIN_TXT_RECORD_NOT_FOUND", {
                subplebbitAddress: address,
                textRecord: txtRecordName
            });
            this._comment.emit("error", error);
            throw error;
        }
    }

    protected override preFetchSubplebbitIpns(subIpnsName: string) {
        if (this._isPublishing()) this._comment._updatePublishingState("fetching-subplebbit-ipns");
        else this._comment._setUpdatingState("fetching-subplebbit-ipns");
    }

    protected override preResolveSubplebbitIpnsP2P(subIpnsName: string) {
        this.updateIpfsState("fetching-subplebbit-ipns");
    }

    protected override postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string) {
        this.updateIpfsState("fetching-subplebbit-ipfs");
        if (this._isPublishing()) this._comment._updatePublishingState("fetching-subplebbit-ipfs");
        else this._comment._setUpdatingState("fetching-subplebbit-ipfs");
    }

    protected override postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError): void {
        this.updateIpfsState("stopped");
        if (this._isPublishing()) {
            this._comment._updatePublishingState("failed");
        } else this._comment._setUpdatingState("failed");
        this._comment.emit("error", err);
        throw err;
    }

    protected override postFetchSubplebbitStringJsonP2PSuccess() {
        // if (this._isPublishing()) this.updateIpfsState("stopped");
        this.updateIpfsState("stopped");
    }

    protected override postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError): void {
        return this.postResolveSubplebbitIpnsP2PFailure(subIpnsName, err);
    }

    protected override postFetchSubplebbitIpfsSuccess(subJson: SubplebbitIpfsType) {}

    protected override postFetchSubplebbitInvalidRecord(subJson: string, subError: PlebbitError): void {
        // are we updating or publishing?
        if (this._isPublishing()) {
            // we're publishing
            this._comment._updatePublishingState("failed");
        } else {
            // we're updating
            this._comment._setUpdatingState("failed");
        }
        this._comment.emit("error", subError);
        throw subError;
    }
}

type SubplebbitGatewayFetch = {
    [gateway: string]: {
        abortController: AbortController;
        promise: Promise<any>;
        subplebbitRecord?: SubplebbitIpfsType;
        error?: PlebbitError;
        timeoutId: any;
    };
};

export class SubplebbitClientsManager extends ClientsManager {
    override clients!: {
        ipfsGateways: { [ipfsGatewayUrl: string]: SubplebbitIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: SubplebbitIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: SubplebbitPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, SubplebbitPlebbitRpcStateClient>;
    };
    private _subplebbit: RemoteSubplebbit;

    constructor(subplebbit: SubplebbitClientsManager["_subplebbit"]) {
        super(subplebbit.plebbit);
        this._subplebbit = subplebbit;
    }

    protected override _initIpfsClients(): void {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new SubplebbitIpfsClient("stopped") };
    }

    protected override _initPubsubClients(): void {
        for (const pubsubUrl of remeda.keys.strict(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new SubplebbitPubsubClient("stopped") };
    }

    protected override _initPlebbitRpcClients() {
        for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = {
                ...this.clients.plebbitRpcClients,
                [rpcUrl]: new SubplebbitPlebbitRpcStateClient("stopped")
            };
    }

    override updateIpfsState(newState: SubplebbitIpfsClient["state"]) {
        super.updateIpfsState(newState);
    }

    override updatePubsubState(newState: SubplebbitPubsubClient["state"], pubsubProvider: string | undefined) {
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
        chainProviderUrl: string
    ): void {
        super.preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl);
        if (
            this._subplebbit.state === "updating" &&
            txtRecordName === "subplebbit-address" &&
            this._subplebbit.updatingState !== "fetching-ipfs" // we don't state to be resolving-address when verifying signature
        )
            this._subplebbit._setUpdatingState("resolving-address");
    }

    override postResolveTextRecordSuccess(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string,
        chain: ChainTicker,
        chainProviderUrl: string
    ): void {
        super.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl);
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

    protected override _getSubplebbitAddressFromInstance(): string {
        return this._subplebbit.address;
    }

    protected override preFetchSubplebbitIpns(subIpnsName: string) {
        this._subplebbit._setUpdatingState("fetching-ipns");
    }

    protected override preResolveSubplebbitIpnsP2P(subIpnsName: string) {
        this.updateIpfsState("fetching-ipns");
    }

    protected override postResolveSubplebbitIpnsP2PSuccess(subIpnsName: string, subplebbitCid: string) {
        this.updateIpfsState("fetching-ipfs");
        this._subplebbit._setUpdatingState("fetching-ipfs");
    }

    protected override postResolveSubplebbitIpnsP2PFailure(subIpnsName: string, err: PlebbitError): void {
        this.updateIpfsState("stopped");
        this._subplebbit._setUpdatingState("failed");
    }

    protected override postFetchSubplebbitStringJsonP2PSuccess() {
        this.updateIpfsState("stopped");
    }
    protected override postFetchSubplebbitStringJsonP2PFailure(subIpnsName: string, subplebbitCid: string, err: PlebbitError): void {
        this.updateIpfsState("stopped");
        this._subplebbit._setUpdatingState("failed");
    }

    // for both gateway and IPFS P2P
    protected override postFetchSubplebbitIpfsSuccess(subJson: SubplebbitIpfsType) {
        this._subplebbit._setUpdatingState("succeeded");
    }

    protected override postFetchSubplebbitInvalidRecord(subJson: string, subError: PlebbitError): void {
        this._subplebbit._setUpdatingState("failed");
        this._subplebbit.emit("error", subError);
        throw subError;
    }
}
