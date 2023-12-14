import Publication from "../publication";
import { Plebbit } from "../plebbit";
import { Comment } from "../comment";
import { getPostUpdateTimestampRange, throwWithErrorCode, timestamp } from "../util";
import assert from "assert";
import { Chain, CommentIpfsType, CommentIpfsWithCid, CommentUpdate, PageIpfs } from "../types";
import { Subplebbit } from "../subplebbit/subplebbit";
import { verifySubplebbit } from "../signer";
import lodash from "lodash";
import isIPFS from "is-ipfs";
import { PlebbitError } from "../plebbit-error";
import { CommentIpfsClient, GenericIpfsClient, PublicationIpfsClient, SubplebbitIpfsClient } from "./ipfs-client";
import { GenericPubsubClient, PublicationPubsubClient, SubplebbitPubsubClient } from "./pubsub-client";
import { GenericChainProviderClient } from "./chain-provider-client";
import {
    CommentIpfsGatewayClient,
    GenericIpfsGatewayClient,
    PublicationIpfsGatewayClient,
    SubplebbitIpfsGatewayClient
} from "./ipfs-gateway-client";

import { BaseClientsManager, LoadType } from "./base-client-manager";
import { commentPostUpdatesParentsPathConfig, postTimestampConfig, subplebbitForPublishingCache } from "../constants";
import {
    CommentPlebbitRpcStateClient,
    GenericPlebbitRpcStateClient,
    PublicationPlebbitRpcStateClient,
    SubplebbitPlebbitRpcStateClient
} from "./plebbit-rpc-state-client";
import { SubplebbitIpfsType } from "../subplebbit/types";
import Logger from "@plebbit/plebbit-logger";
import pLimit from "p-limit";

export class ClientsManager extends BaseClientsManager {
    protected _plebbit: Plebbit;

    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: GenericIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: GenericIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: GenericPubsubClient };
        chainProviders: Record<Chain, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: { [plebbitRpcClientUrl: string]: GenericPlebbitRpcStateClient };
    };

    constructor(plebbit: Plebbit) {
        super(plebbit);
        //@ts-expect-error
        this.clients = {};
        this._initIpfsGateways();
        this._initIpfsClients();
        this._initPubsubClients();
        this._initChainProviders();
        this._initPlebbitRpcClients();
    }

    protected _initIpfsGateways() {
        for (const gatewayUrl of Object.keys(this._plebbit.clients.ipfsGateways))
            this.clients.ipfsGateways = { ...this.clients.ipfsGateways, [gatewayUrl]: new GenericIpfsGatewayClient("stopped") };
    }

    protected _initIpfsClients() {
        for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
            this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new GenericIpfsClient("stopped") };
    }

    protected _initPubsubClients() {
        for (const pubsubUrl of Object.keys(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new GenericPubsubClient("stopped") };
    }

    protected _initChainProviders() {
        //@ts-expect-error
        this.clients.chainProviders = {};
        for (const chain of Object.keys(this._plebbit.chainProviders)) {
            this.clients.chainProviders[chain] = {};
            const chainProvider = this._plebbit.chainProviders[chain];
            for (const chainProviderUrl of chainProvider.urls)
                this.clients.chainProviders[chain][chainProviderUrl] = new GenericChainProviderClient("stopped");
        }
    }

    protected _initPlebbitRpcClients() {
        for (const rpcUrl of Object.keys(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = { ...this.clients.plebbitRpcClients, [rpcUrl]: new GenericPlebbitRpcStateClient("stopped") };
    }

    // Overriding functions from base client manager here

    preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType): void {
        const gatewayState =
            loadType === "subplebbit"
                ? this._getStatePriorToResolvingSubplebbitIpns()
                : loadType === "comment-update"
                ? "fetching-update-ipfs"
                : loadType === "comment" || loadType === "generic-ipfs"
                ? "fetching-ipfs"
                : undefined;
        assert(gatewayState);
        this.updateGatewayState(gatewayState, gatewayUrl);
    }

    postFetchGatewayFailure(gatewayUrl: string, path: string, loadType: LoadType) {
        this.updateGatewayState("stopped", gatewayUrl);
    }

    postFetchGatewaySuccess(gatewayUrl: string, path: string, loadType: LoadType) {
        this.updateGatewayState("stopped", gatewayUrl);
    }

    postFetchGatewayAborted(gatewayUrl: string, path: string, loadType: LoadType) {
        this.postFetchGatewaySuccess(gatewayUrl, path, loadType);
    }

    preResolveTextRecord(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: string,
        chainProviderUrl: string
    ) {
        const newState = txtRecordName === "subplebbit-address" ? "resolving-subplebbit-address" : "resolving-author-address";
        this.updateChainProviderState(newState, chain, chainProviderUrl);
    }

    postResolveTextRecordSuccess(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string,
        chain: string,
        chainProviderUrl: string
    ): void {
        this.updateChainProviderState("stopped", chain, chainProviderUrl);
    }

    postResolveTextRecordFailure(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        chain: string,
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

    updateChainProviderState(newState: GenericChainProviderClient["state"], chainTicker: string, chainProviderUrl: string) {
        assert(typeof newState === "string", "Can't update chain provider state to undefined");
        if (this.clients.chainProviders[chainTicker][chainProviderUrl].state === newState) return;
        this.clients.chainProviders[chainTicker][chainProviderUrl].state = newState;
        this.clients.chainProviders[chainTicker][chainProviderUrl].emit("statechange", newState);
    }

    async fetchCid(cid: string) {
        let finalCid = lodash.clone(cid);
        if (!isIPFS.cid(finalCid) && isIPFS.path(finalCid)) finalCid = finalCid.split("/")[2];
        if (!isIPFS.cid(finalCid)) throwWithErrorCode("ERR_CID_IS_INVALID", { cid });
        if (this._defaultIpfsProviderUrl) return this._fetchCidP2P(cid);
        else return this.fetchFromMultipleGateways({ cid }, "generic-ipfs");
    }

    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns" {
        return "fetching-subplebbit-ipns";
    }

    protected _getStatePriorToResolvingSubplebbitIpfs(): "fetching-subplebbit-ipfs" | "fetching-ipfs" {
        return "fetching-subplebbit-ipfs";
    }
}

export class PublicationClientsManager extends ClientsManager {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: PublicationIpfsGatewayClient | CommentIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: PublicationIpfsClient | CommentIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: PublicationPubsubClient };
        chainProviders: Record<Chain, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, PublicationPlebbitRpcStateClient>;
    };
    _publication: Publication;
    _attemptingToResolve: boolean;

    constructor(publication: Publication) {
        super(publication._plebbit);
        this._publication = publication;
    }

    protected _initIpfsClients(): void {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new PublicationIpfsClient("stopped") };
    }

    protected _initPubsubClients(): void {
        for (const pubsubUrl of Object.keys(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new PublicationPubsubClient("stopped") };
    }

    protected _initPlebbitRpcClients() {
        for (const rpcUrl of Object.keys(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = {
                ...this.clients.plebbitRpcClients,
                [rpcUrl]: new PublicationPlebbitRpcStateClient("stopped")
            };
    }

    // Resolver methods here
    preResolveTextRecord(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string,
        chain: string
    ): void {
        super.preResolveTextRecord(address, txtRecordName, resolvedTextRecord, chain);
        if (this._publication.publishingState === "stopped" && this._attemptingToResolve)
            this._publication._updatePublishingState("resolving-subplebbit-address");
    }

    emitError(e: PlebbitError): void {
        this._publication.emit("error", e);
    }

    async fetchSubplebbitForPublishing(subplebbitAddress: string) {
        if (typeof subplebbitAddress !== "string" || subplebbitAddress.length === 0)
            throwWithErrorCode("ERR_INVALID_SUBPLEBBIT_ADDRESS", { subplebbitAddress });

        this._attemptingToResolve = true;
        const subIpns = await this.resolveSubplebbitAddressIfNeeded(subplebbitAddress);
        this._attemptingToResolve = false;
        if (!subIpns) throw new PlebbitError("ERR_ENS_ADDRESS_HAS_NO_SUBPLEBBIT_ADDRESS_TEXT_RECORD", { ensAddress: subplebbitAddress });

        this._publication._updatePublishingState("fetching-subplebbit-ipns");
        let subJson: SubplebbitIpfsType;
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState("fetching-subplebbit-ipns");
            const subCid = await this.resolveIpnsToCidP2P(subIpns);
            this._publication._updatePublishingState("fetching-subplebbit-ipfs");
            this.updateIpfsState("fetching-subplebbit-ipfs");
            subJson = JSON.parse(await this._fetchCidP2P(subCid));
            this.updateIpfsState("stopped");
        } else subJson = JSON.parse(await this.fetchFromMultipleGateways({ ipns: subIpns }, "subplebbit"));

        const signatureValidity = await verifySubplebbit(subJson, this._plebbit.resolveAuthorAddresses, this, false);

        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity, subplebbitAddress, subJson });

        subplebbitForPublishingCache.set(subJson.address, lodash.pick(subJson, ["encryption", "pubsubTopic", "address"]));

        return subJson;
    }

    updateIpfsState(newState: PublicationIpfsClient["state"] | CommentIpfsClient["state"]) {
        super.updateIpfsState(newState);
    }

    updatePubsubState(newState: PublicationPubsubClient["state"], pubsubProvider: string | undefined) {
        super.updatePubsubState(newState, pubsubProvider);
    }

    updateGatewayState(newState: PublicationIpfsGatewayClient["state"], gateway: string): void {
        super.updateGatewayState(newState, gateway);
    }
}

export class CommentClientsManager extends PublicationClientsManager {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: CommentIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: CommentIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: PublicationPubsubClient };
        chainProviders: Record<Chain, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, CommentPlebbitRpcStateClient>;
    };
    private _comment: Comment;

    constructor(comment: Comment) {
        super(comment);
        this._comment = comment;
    }

    protected _initIpfsClients(): void {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new CommentIpfsClient("stopped") };
    }

    protected _initPlebbitRpcClients() {
        for (const rpcUrl of Object.keys(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = { ...this.clients.plebbitRpcClients, [rpcUrl]: new CommentPlebbitRpcStateClient("stopped") };
    }

    // Resolver methods here
    preResolveTextRecord(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string,
        chain: string
    ): void {
        super.preResolveTextRecord(address, txtRecordName, resolvedTextRecord, chain);
        if (txtRecordName === "subplebbit-address")
            this._comment._setUpdatingState("resolving-subplebbit-address"); // Resolving for CommentUpdate
        else if (txtRecordName === "plebbit-author-address") this._comment._setUpdatingState("resolving-author-address"); // Resolving for CommentIpfs
    }

    async _fetchSubplebbitForCommentUpdate() {
        const subIpns = await this.resolveSubplebbitAddressIfNeeded(this._comment.subplebbitAddress);
        if (!subIpns)
            throw new PlebbitError("ERR_ENS_ADDRESS_HAS_NO_SUBPLEBBIT_ADDRESS_TEXT_RECORD", {
                ensAddress: this._comment.subplebbitAddress
            });

        this._comment._setUpdatingState("fetching-subplebbit-ipns");
        let subJson: SubplebbitIpfsType;
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState("fetching-subplebbit-ipns");
            const subplebbitCid = await this.resolveIpnsToCidP2P(subIpns);
            this._comment._setUpdatingState("fetching-subplebbit-ipfs");
            this.updateIpfsState("fetching-subplebbit-ipfs");
            subJson = JSON.parse(await this._fetchCidP2P(subplebbitCid));
        } else {
            // States of gateways should be updated by fetchFromMultipleGateways
            subJson = JSON.parse(await this.fetchFromMultipleGateways({ ipns: subIpns }, "subplebbit"));
        }
        subplebbitForPublishingCache.set(subJson.address, lodash.pick(subJson, ["encryption", "pubsubTopic", "address"]));
        return subJson;
    }

    _findCommentInSubplebbitPosts(subIpns: SubplebbitIpfsType, cid: string) {
        if (!subIpns.posts?.pages?.hot) return undefined;
        const findInCommentAndChildren = (comment: PageIpfs["comments"][0]): PageIpfs["comments"][0]["comment"] => {
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
        const parentsPathCache = await this._plebbit.createStorageLRU(commentPostUpdatesParentsPathConfig);
        const pathCache: string = await parentsPathCache.getItem(this._comment.cid);
        if (pathCache) return pathCache.split("/").reverse().join("/");

        const postTimestampCache = await this._plebbit.createStorageLRU(postTimestampConfig);
        if (this._comment.depth === 0) await postTimestampCache.setItem(this._comment.cid, this._comment.timestamp);
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

        await parentsPathCache.setItem(this._comment.cid, reversedPath);

        const finalParentsPath = reversedPath.split("/").reverse().join("/"); // will be postCid/replyCid/nestedReplyCid

        return finalParentsPath;
    }

    async fetchCommentUpdate(): Promise<CommentUpdate> {
        // Caching should eventually be moved to storage instead of in-memory
        const log = Logger("plebbit-js:comment:update");
        const subIpns = await this._fetchSubplebbitForCommentUpdate();
        const parentsPostUpdatePath = await this._getParentsPath(subIpns);
        const postTimestamp = await (await this._plebbit.createStorageLRU(postTimestampConfig)).getItem(this._comment.postCid);
        if (typeof postTimestamp !== "number") throw Error("Failed to fetch post timestamp");
        const timestampRanges = getPostUpdateTimestampRange(subIpns.postUpdates, postTimestamp);
        if (timestampRanges.length === 0) throw Error("Post has no timestamp range bucket");

        for (const timestampRange of timestampRanges) {
            const folderCid = subIpns.postUpdates[timestampRange];
            const path = `${folderCid}/` + parentsPostUpdatePath + "/update";
            this._comment._setUpdatingState("fetching-update-ipfs");
            if (this._defaultIpfsProviderUrl) {
                this.updateIpfsState("fetching-update-ipfs");
                try {
                    const commentUpdate: CommentUpdate = JSON.parse(await this._fetchCidP2P(path));
                    this.updateIpfsState("stopped");
                    return commentUpdate;
                } catch (e) {
                    // if does not exist, try the next timestamp range
                    log.error(e, `Failed to fetch CommentUpdate from path (${path}). Trying the next timestamp range`);
                }
            } else {
                // States of gateways should be updated by fetchFromMultipleGateways
                try {
                    const update: CommentUpdate = JSON.parse(await this.fetchFromMultipleGateways({ cid: path }, "comment-update"));
                    return update;
                } catch (e) {
                    // if does not exist, try the next timestamp range
                    log.error(e, `Failed to fetch CommentUpdate from path (${path}). Trying the next timestamp range`);
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
            const commentContent: CommentIpfsType = JSON.parse(await this.fetchFromMultipleGateways({ cid }, "comment"));
            return commentContent;
        }
    }

    updateIpfsState(newState: CommentIpfsClient["state"]) {
        super.updateIpfsState(newState);
    }
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
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: SubplebbitIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: SubplebbitIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: SubplebbitPubsubClient };
        chainProviders: Record<Chain, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, SubplebbitPlebbitRpcStateClient>;
    };
    private _subplebbit: Subplebbit;

    constructor(subplebbit: Subplebbit) {
        super(subplebbit.plebbit);
        this._subplebbit = subplebbit;
    }

    protected _initIpfsClients(): void {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new SubplebbitIpfsClient("stopped") };
    }

    protected _initPubsubClients(): void {
        for (const pubsubUrl of Object.keys(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new SubplebbitPubsubClient("stopped") };
    }

    protected _initPlebbitRpcClients() {
        for (const rpcUrl of Object.keys(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = {
                ...this.clients.plebbitRpcClients,
                [rpcUrl]: new SubplebbitPlebbitRpcStateClient("stopped")
            };
    }

    private async _verifySignatureOfSubplebbit(subIpfs: SubplebbitIpfsType) {
        const updateValidity = await verifySubplebbit(subIpfs, this._plebbit.resolveAuthorAddresses, this, true);
        if (!updateValidity.valid) {
            this._subplebbit._setUpdatingState("failed");
            const error = new PlebbitError("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID", {
                signatureValidity: updateValidity,
                subplebbitIpns: subIpfs
            });
            this._subplebbit.emit("error", error);
            return updateValidity;
        }
        return undefined; // no problem here
    }

    private async _throwIfSignatureOfSubplebbitIsInvalid(subJson: SubplebbitIpfsType) {
        const subRecordInvalidity = await this._verifySignatureOfSubplebbit(subJson);
        if (subRecordInvalidity)
            throw new PlebbitError("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID", {
                signatureValidity: subRecordInvalidity,
                subplebbitIpns: subJson
            });
    }

    async fetchSubplebbit(ipnsName: string) {
        // This function should fetch SubplebbitIpfs, parse it and verify its signature
        // Then return SubplebbitIpfs
        this._subplebbit._setUpdatingState("fetching-ipns");
        let subJson: SubplebbitIpfsType;
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState("fetching-ipns");
            const subplebbitCid = await this.resolveIpnsToCidP2P(ipnsName);
            this._subplebbit._setUpdatingState("fetching-ipfs");
            this.updateIpfsState("fetching-ipfs");
            subJson = JSON.parse(await this._fetchCidP2P(subplebbitCid));
            this.updateIpfsState("stopped");
        } else {
            // States of gateways should be updated by fetchFromMultipleGateways
            subJson = await this.fetchSubplebbitFromGateways(ipnsName);
        }
        await this._throwIfSignatureOfSubplebbitIsInvalid(subJson);

        subplebbitForPublishingCache.set(subJson.address, lodash.pick(subJson, ["encryption", "pubsubTopic", "address"]));

        return subJson;
    }

    async fetchSubplebbitFromGateways(ipnsName: string) {
        const log = Logger("plebbit-js:subplebbit:fetchSubplebbitFromGateways");
        const concurrencyLimit = 3;
        const timeoutMs = 10 * 1000; // 5s to timeout a gateway

        const path = `/ipns/${ipnsName}`;

        const queueLimit = pLimit(concurrencyLimit);

        // Only sort if we have more than 3 gateways
        const gatewaysSorted =
            Object.keys(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit
                ? Object.keys(this._plebbit.clients.ipfsGateways)
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
            const totalGateways = gatewaysSorted.length;

            const quorm = totalGateways <= 3 ? totalGateways : 3;

            const gatewaysWithError = Object.keys(gatewayFetches).filter((gatewayUrl) => gatewayFetches[gatewayUrl].error);
            const gatewaysWithSub = Object.keys(gatewayFetches).filter((gatewayUrl) => gatewayFetches[gatewayUrl].subplebbitRecord);
            for (const gatewayUrl of gatewaysWithSub) {
                if (timestamp() - gatewayFetches[gatewayUrl].subplebbitRecord.updatedAt <= 120) {
                    // A very recent subplebbit, a good thing
                    // TODO reward this gateway
                    log(`Gateway (${gatewayUrl}) was able to find a very recent subplebbit (${ipnsName}) record `);
                    return gatewayFetches[gatewayUrl].subplebbitRecord;
                }
            }
            // We weren't able to find a very recent subplebbit record
            if (gatewaysWithSub.length === 0) return undefined;
            if (gatewaysWithSub.length >= quorm || gatewaysWithError.length + gatewaysWithSub.length === totalGateways) {
                // we find the gateway with the max updatedAt
                const bestGatewayUrl = lodash.maxBy(gatewaysWithSub, (gatewayUrl) => gatewayFetches[gatewayUrl].subplebbitRecord.updatedAt);
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
                        }
                        const recentSubplebbit = _findRecentSubplebbit();
                        if (recentSubplebbit) {
                            cleanUp();
                            resolve(recentSubplebbit);
                        }
                        const gatewaysWithError = Object.keys(gatewayFetches).filter((gatewayUrl) => gatewayFetches[gatewayUrl].error);
                        if (gatewaysWithError.length === gatewaysSorted.length)
                            // All gateways failed
                            reject("All gateways failed to fetch subplebbit record " + ipnsName);
                    })
                )
            );
        } catch {
            cleanUp();
            const gatewayToError: Record<string, Error> = {};
            for (const gatewayUrl of Object.keys(gatewayFetches))
                if (gatewayFetches[gatewayUrl].error) gatewayToError[gatewayUrl] = gatewayFetches[gatewayUrl].error;
            const combinedError = new PlebbitError("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS", { ipnsName, gatewayToError });

            throw combinedError;
        }

        // TODO add punishment for gateway that returns invalid subplebbit
        return suitableSubplebbit;
    }

    updateIpfsState(newState: SubplebbitIpfsClient["state"]) {
        super.updateIpfsState(newState);
    }

    updatePubsubState(newState: SubplebbitPubsubClient["state"], pubsubProvider: string | undefined) {
        super.updatePubsubState(newState, pubsubProvider);
    }

    updateGatewayState(newState: CommentIpfsGatewayClient["state"], gateway: string): void {
        super.updateGatewayState(newState, gateway);
    }

    emitError(e: PlebbitError): void {
        this._subplebbit.emit("error", e);
    }

    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns" {
        return "fetching-ipns";
    }

    protected _getStatePriorToResolvingSubplebbitIpfs(): "fetching-subplebbit-ipfs" | "fetching-ipfs" {
        return "fetching-ipfs";
    }
}
