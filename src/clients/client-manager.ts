import Publication from "../publications/publication.js";
import { Plebbit } from "../plebbit.js";
import { Comment } from "../publications/comment/comment.js";
import { getPostUpdateTimestampRange, isIpfsCid, isIpfsPath, throwWithErrorCode, timestamp } from "../util.js";
import assert from "assert";
import { ChainTicker, CommentIpfsType, CommentIpfsWithCid, CommentUpdate, PageIpfs } from "../types.js";
import { verifySubplebbit } from "../signer/index.js";
import * as remeda from "remeda";
import { PlebbitError } from "../plebbit-error.js";
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
                  : loadType === "comment" || loadType === "generic-ipfs"
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
        else return this.fetchFromMultipleGateways({ cid }, "generic-ipfs");
    }

    // fetchSubplebbit should be here

    private async _findErrorInSubplebbitRecord(subJson: SubplebbitIpfsType, ipnsNameOfSub: string) {
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

    async fetchSubplebbit(subAddress: string) {
        const ipnsName = await this.resolveSubplebbitAddressIfNeeded(subAddress);
        // if ipnsAddress is undefined then it will be handled in postResolveTextRecordSuccess

        if (!ipnsName) throw Error("Failed to resolve subplebbit address to an IPNS name");

        return this._fetchSubplebbitIpns(ipnsName);
    }

    private async _fetchSubplebbitIpns(ipnsName: string) {
        // This function should fetch SubplebbitIpfs, parse it and verify its signature
        // Then return SubplebbitIpfs
        this.preResolveSubplebbitIpns(ipnsName);
        let subJson: SubplebbitIpfsType;
        if (this._defaultIpfsProviderUrl) {
            this.preResolveSubplebbitIpnsP2P(ipnsName);
            const subplebbitCid = await this.resolveIpnsToCidP2P(ipnsName);
            this.postResolveSubplebbitIpnsP2P(ipnsName, subplebbitCid);
            subJson = JSON.parse(await this._fetchCidP2P(subplebbitCid)); // zod here
            this.postFetchSubplebbitJsonP2P(subJson); // have not been verified yet
        }
        // States of gateways should be updated by fetchFromMultipleGateways
        else subJson = await this._fetchSubplebbitFromGateways(ipnsName);

        // zod here
        const subError = await this._findErrorInSubplebbitRecord(subJson, ipnsName);
        if (subError) {
            this.postFetchSubplebbitInvalidRecord(subJson, subError); // should throw here
            throw subError; // in case we forgot to throw at postFetchSubplebbitInvalidRecord
        }

        this.postFetchSubplebbitJsonSuccess(subJson); // We successfully fetched the json

        subplebbitForPublishingCache.set(subJson.address, remeda.pick(subJson, ["encryption", "pubsubTopic", "address"]));

        return subJson;
    }

    private async _fetchSubplebbitFromGateways(ipnsName: string) {
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
                promise: queueLimit(() => this._fetchWithGateway(gateway, path, "subplebbit", abortController)),
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

        const promisesToIterate = <Promise<string | undefined | { error: PlebbitError }>[]>(
            Object.values(gatewayFetches).map((gatewayFetch) => gatewayFetch.promise)
        );

        let suitableSubplebbit: SubplebbitIpfsType;
        try {
            suitableSubplebbit = await new Promise<SubplebbitIpfsType>((resolve, reject) =>
                promisesToIterate.map((gatewayPromise, i) =>
                    gatewayPromise.then(async (res) => {
                        if (typeof res === "string")
                            Object.values(gatewayFetches)[i].subplebbitRecord = JSON.parse(res); // did not throw or abort
                        else {
                            // The fetching failed, if res === undefined then it's because it was aborted
                            // else then there's plebbitError
                            Object.values(gatewayFetches)[i].error = res
                                ? res.error
                                : new Error("Fetching from gateway has been aborted/timed out");
                            const gatewaysWithError = remeda.keys
                                .strict(gatewayFetches)
                                .filter((gatewayUrl) => gatewayFetches[gatewayUrl].error);
                            if (gatewaysWithError.length === gatewaysSorted.length)
                                // All gateways failed
                                reject("All gateways failed to fetch subplebbit record " + ipnsName);
                        }
                        const recentSubplebbit = _findRecentSubplebbit();
                        if (recentSubplebbit) {
                            cleanUp();
                            resolve(recentSubplebbit);
                        }
                    })
                )
            );
        } catch {
            cleanUp();
            const gatewayToError = remeda.mapValues(gatewayFetches, (gatewayFetch) => gatewayFetch.error);
            const combinedError = new PlebbitError("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS", { ipnsName, gatewayToError });
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

    protected postFetchSubplebbitInvalidRecord(subJson: SubplebbitIpfsType, subError: PlebbitError): void {
        throw Error("Should be implemented");
    }

    protected preResolveSubplebbitIpns(subIpnsName: string) {
        throw Error("Should be implemented");
    }

    protected preResolveSubplebbitIpnsP2P(subIpnsName: string) {
        throw Error("Should be implemented");
    }

    protected postResolveSubplebbitIpnsP2P(subIpnsName: string, subplebbitCid: string) {
        throw Error("Should be implemented");
    }

    protected postFetchSubplebbitJsonP2P(subJson: SubplebbitIpfsType) {
        throw Error("Should be implemented");
    }

    protected postFetchSubplebbitJsonSuccess(subJson: SubplebbitIpfsType) {
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

    protected override postFetchSubplebbitInvalidRecord(subJson: SubplebbitIpfsType, subError: PlebbitError): void {
        this._publication._updatePublishingState("failed");
        this._publication.emit("error", subError);
        throw subError;
    }

    protected override preResolveSubplebbitIpns(subIpnsName: string) {
        this._publication._updatePublishingState("fetching-subplebbit-ipns");
    }

    protected override preResolveSubplebbitIpnsP2P(subIpnsName: string) {
        this.updateIpfsState("fetching-subplebbit-ipns");
    }

    protected override postResolveSubplebbitIpnsP2P(subIpnsName: string, subplebbitCid: string) {
        this.updateIpfsState("fetching-subplebbit-ipfs");
        this._publication._updatePublishingState("fetching-subplebbit-ipfs");
    }

    protected override postFetchSubplebbitJsonP2P(subJson: SubplebbitIpfsType) {
        this.updateIpfsState("stopped");
    }

    protected override postFetchSubplebbitJsonSuccess(subJson: SubplebbitIpfsType) {}
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

    async _fetchParentCommentForCommentUpdate(parentCid: string) {
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState("fetching-update-ipfs");
            this._comment._setUpdatingState("fetching-update-ipfs");
            const commentContent: CommentIpfsWithCid = { cid: parentCid, ...JSON.parse(await this._fetchCidP2P(parentCid)) };
            this.updateIpfsState("stopped");
            return commentContent;
        } else {
            const commentContent: CommentIpfsWithCid = {
                cid: parentCid,
                ...JSON.parse(await this.fetchFromMultipleGateways({ cid: parentCid }, "comment"))
            };
            return commentContent;
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

        for (const timestampRange of timestampRanges) {
            const folderCid = subIpns.postUpdates[timestampRange];
            const path = `${folderCid}/` + parentsPostUpdatePath + "/update";
            this._comment._setUpdatingState("fetching-update-ipfs");
            if (this._defaultIpfsProviderUrl) {
                this.updateIpfsState("fetching-update-ipfs");
                try {
                    const commentUpdate: CommentUpdate = JSON.parse(await this._fetchCidP2P(path)); // zod here
                    this.updateIpfsState("stopped");
                    return commentUpdate;
                } catch (e) {
                    // if does not exist, try the next timestamp range
                    log.trace(`Failed to fetch CommentUpdate from path (${path}). Trying the next timestamp range`);
                }
            } else {
                // States of gateways should be updated by fetchFromMultipleGateways
                try {
                    const update: CommentUpdate = JSON.parse(await this.fetchFromMultipleGateways({ cid: path }, "comment-update")); // zod here
                    return update;
                } catch (e) {
                    // if does not exist, try the next timestamp range
                    log.trace(`Failed to fetch CommentUpdate from path (${path}). Trying the next timestamp range`);
                }
            }
        }

        throw Error(`CommentUpdate of comment (${this._comment.cid}) does not exist on all timestamp ranges: ${timestampRanges}`);
    }

    async fetchCommentCid(cid: string): Promise<CommentIpfsType> {
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState("fetching-ipfs");
            const commentContent: CommentIpfsType = JSON.parse(await this._fetchCidP2P(cid));
            this.updateIpfsState("stopped");
            return commentContent;
        } else {
            const commentContent: CommentIpfsType = JSON.parse(await this.fetchFromMultipleGateways({ cid }, "comment")); // zod here
            return commentContent;
        }
    }

    override updateIpfsState(newState: CommentIpfsClient["state"]) {
        super.updateIpfsState(newState);
    }

    protected _isPublishing() {
        return this._comment.state === "publishing";
    }

    protected override postFetchSubplebbitInvalidRecord(subJson: SubplebbitIpfsType, subError: PlebbitError): void {
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

    protected override preResolveSubplebbitIpns(subIpnsName: string) {
        if (this._isPublishing()) this._comment._updatePublishingState("fetching-subplebbit-ipns");
        else this._comment._setUpdatingState("fetching-subplebbit-ipns");
    }

    protected override preResolveSubplebbitIpnsP2P(subIpnsName: string) {
        this.updateIpfsState("fetching-subplebbit-ipns");
    }

    protected override postResolveSubplebbitIpnsP2P(subIpnsName: string, subplebbitCid: string) {
        this.updateIpfsState("fetching-subplebbit-ipfs");
        if (this._isPublishing()) this._comment._updatePublishingState("fetching-subplebbit-ipfs");
        else this._comment._setUpdatingState("fetching-subplebbit-ipfs");
    }

    protected override postFetchSubplebbitJsonP2P(subJson: SubplebbitIpfsType) {
        if (this._isPublishing()) this.updateIpfsState("stopped");
    }

    protected override postFetchSubplebbitJsonSuccess(subJson: SubplebbitIpfsType) {}
}

type SubplebbitGatewayFetch = {
    [gateway: string]: {
        abortController: AbortController;
        promise: Promise<any>;
        subplebbitRecord?: SubplebbitIpfsType;
        error?: Error;
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

    protected override postFetchSubplebbitInvalidRecord(subJson: SubplebbitIpfsType, subError: PlebbitError): void {
        this._subplebbit._setUpdatingState("failed");
        this._subplebbit.emit("error", subError);
        throw subError;
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

    protected override preResolveSubplebbitIpns(subIpnsName: string) {
        this._subplebbit._setUpdatingState("fetching-ipns");
    }

    protected override preResolveSubplebbitIpnsP2P(subIpnsName: string) {
        this.updateIpfsState("fetching-ipns");
    }

    protected override postResolveSubplebbitIpnsP2P(subIpnsName: string, subplebbitCid: string) {
        this.updateIpfsState("fetching-ipfs");
        this._subplebbit._setUpdatingState("fetching-ipfs");
    }

    protected override postFetchSubplebbitJsonP2P(subJson: SubplebbitIpfsType) {
        this.updateIpfsState("stopped");
    }
    protected override postFetchSubplebbitJsonSuccess(subJson: SubplebbitIpfsType) {
        this._subplebbit._setUpdatingState("succeeded");
    }
}
