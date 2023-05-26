import Publication from "../publication";
import { Plebbit } from "../plebbit";
import { Comment } from "../comment";
import { throwWithErrorCode } from "../util";
import assert from "assert";
import { CommentIpfsType, CommentUpdate, SubplebbitIpfsType } from "../types";
import { Subplebbit } from "../subplebbit";
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

export class ClientsManager extends BaseClientsManager {
    protected _plebbit: Plebbit;

    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: GenericIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: GenericIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: GenericPubsubClient };
        chainProviders: { [chainProviderUrl: string]: GenericChainProviderClient };
    };

    constructor(plebbit: Plebbit) {
        super(plebbit);
        //@ts-expect-error
        this.clients = {};
        this._initIpfsGateways();
        this._initIpfsClients();
        this._initPubsubClients();
        this._initChainProviders();
    }

    protected _initIpfsGateways() {
        for (const gatewayUrl of Object.keys(this._plebbit.clients.ipfsGateways))
            this.clients.ipfsGateways = { ...this.clients.ipfsGateways, [gatewayUrl]: new GenericIpfsGatewayClient("stopped") };
    }

    protected _initIpfsClients() {
        if (this._plebbit.clients.ipfsClients)
            for (const ipfsUrl of Object.keys(this._plebbit.clients.ipfsClients))
                this.clients.ipfsClients = { ...this.clients.ipfsClients, [ipfsUrl]: new GenericIpfsClient("stopped") };
    }

    protected _initPubsubClients() {
        for (const pubsubUrl of Object.keys(this._plebbit.clients.pubsubClients))
            this.clients.pubsubClients = { ...this.clients.pubsubClients, [pubsubUrl]: new GenericPubsubClient("stopped") };
    }

    protected _initChainProviders() {
        for (const chainProviderUrl of Object.keys(this._plebbit.clients.chainProviders))
            this.clients.chainProviders = { ...this.clients.chainProviders, [chainProviderUrl]: new GenericChainProviderClient("stopped") };
    }

    // Overriding functions from base client manager here

    preFetchGateway(gatewayUrl: string, path: string, loadType: LoadType): void {
        const gatewayState =
            loadType === "subplebbit"
                ? this._getStatePriorToResolvingSubplebbitIpns()
                : loadType === "comment-update"
                ? "fetching-update-ipns"
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

    preResolveTextRecord(ens: string, txtRecordName: "subplebbit-address" | "plebbit-author-address") {
        const newState = txtRecordName === "subplebbit-address" ? "resolving-subplebbit-address" : "resolving-author-address";
        this.updateChainProviderState(newState, "eth");
    }

    postResolveTextRecordSuccess(
        ens: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string
    ): void {
        this.updateChainProviderState("stopped", "eth");
    }

    postResolveTextRecordFailure(ens: string, txtRecordName: "subplebbit-address" | "plebbit-author-address") {
        this.updateChainProviderState("stopped", "eth");
    }

    // State methods here

    updatePubsubState(newState: GenericPubsubClient["state"], pubsubProvider: string | undefined) {
        pubsubProvider = pubsubProvider || this._defaultPubsubProviderUrl;
        assert(typeof pubsubProvider === "string");
        assert(typeof newState === "string", "Can't update pubsub state to undefined");
        this.clients.pubsubClients[pubsubProvider].state = newState;
        this.clients.pubsubClients[pubsubProvider].emit("statechange", newState);
    }

    updateIpfsState(newState: GenericIpfsClient["state"]) {
        assert(this._defaultIpfsProviderUrl);
        assert(typeof newState === "string", "Can't update ipfs state to undefined");
        this.clients.ipfsClients[this._defaultIpfsProviderUrl].state = newState;
        this.clients.ipfsClients[this._defaultIpfsProviderUrl].emit("statechange", newState);
    }

    updateGatewayState(newState: GenericIpfsGatewayClient["state"], gateway: string) {
        assert(typeof newState === "string", "Can't update gateway state to undefined");
        this.clients.ipfsGateways[gateway].state = newState;
        this.clients.ipfsGateways[gateway].emit("statechange", newState);
    }

    updateChainProviderState(newState: GenericChainProviderClient["state"], chainTicker: string) {
        assert(typeof newState === "string", "Can't update chain provider state to undefined");
        this.clients.chainProviders[chainTicker].state = newState;
        this.clients.chainProviders[chainTicker].emit("statechange", newState);
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

    async fetchSubplebbitIpns(ipnsAddress: string): Promise<string> {
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState(this._getStatePriorToResolvingSubplebbitIpns());
            const subCid = await this.resolveIpnsToCidP2P(ipnsAddress);
            this.updateIpfsState(this._getStatePriorToResolvingSubplebbitIpfs());
            const content = await this._fetchCidP2P(subCid);
            this.updateIpfsState("stopped");
            return content;
        } else return this.fetchFromMultipleGateways({ ipns: ipnsAddress }, "subplebbit");
    }
}

export class PublicationClientsManager extends ClientsManager {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: PublicationIpfsGatewayClient | CommentIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: PublicationIpfsClient | CommentIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: PublicationPubsubClient };
        chainProviders: { [chainProviderUrl: string]: GenericChainProviderClient };
    };
    _publication: Publication;

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

    // Pubsub methods here

    protected prePubsubPublishProvider(pubsubTopic: string, pubsubProvider: string) {
        const newState =
            this._publication.publishingState === "publishing-challenge-request"
                ? "publishing-challenge-request"
                : "publishing-challenge-answer";
        this.updatePubsubState(newState, pubsubProvider);
    }

    protected postPubsubPublishProviderSuccess(pubsubTopic: string, pubsubProvider: string) {
        this.updatePubsubState("stopped", pubsubProvider);
    }

    protected postPubsubPublishProviderFailure(pubsubTopic: string, pubsubProvider: string) {
        this.postPubsubPublishProviderSuccess(pubsubTopic, pubsubProvider);
    }

    emitError(e: PlebbitError): void {
        this._publication.emit("error", e);
    }

    async fetchSubplebbitForPublishing(subplebbitAddress: string) {
        if (typeof subplebbitAddress !== "string" || subplebbitAddress.length === 0)
            throwWithErrorCode("ERR_INVALID_SUBPLEBBIT_ADDRESS", { subplebbitAddress });

        const subIpns = await this.resolveSubplebbitAddressIfNeeded(subplebbitAddress); // Temporary. Should be retrying here

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

        const signatureValidity = await verifySubplebbit(subJson, this._plebbit.resolveAuthorAddresses, this);

        if (!signatureValidity.valid) throwWithErrorCode("ERR_SIGNATURE_IS_INVALID", { signatureValidity, subplebbitAddress, subJson });

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
        chainProviders: { [chainProviderUrl: string]: GenericChainProviderClient };
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

    async fetchCommentUpdate(ipnsName: string): Promise<CommentUpdate> {
        this._comment._setUpdatingState("fetching-update-ipns");
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState("fetching-update-ipns");
            const updateCid = await this.resolveIpnsToCidP2P(ipnsName);
            this._comment._setUpdatingState("fetching-update-ipfs");
            this.updateIpfsState("fetching-update-ipfs");
            const commentUpdate: CommentUpdate = JSON.parse(await this._fetchCidP2P(updateCid));
            this.updateIpfsState("stopped");
            return commentUpdate;
        } else {
            // States of gateways should be updated by fetchFromMultipleGateways
            const update: CommentUpdate = JSON.parse(await this.fetchFromMultipleGateways({ ipns: ipnsName }, "comment-update"));
            return update;
        }
    }

    async fetchCommentCid(cid: string): Promise<CommentIpfsType> {
        this._comment._setUpdatingState("fetching-ipfs");
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

export class SubplebbitClientsManager extends ClientsManager {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: SubplebbitIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: SubplebbitIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: SubplebbitPubsubClient };
        chainProviders: { [chainProviderUrl: string]: GenericChainProviderClient };
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

    async fetchSubplebbit(ipnsName: string) {
        this._subplebbit._setUpdatingState("fetching-ipns");
        if (this._defaultIpfsProviderUrl) {
            this.updateIpfsState("fetching-ipns");
            const subplebbitCid = await this.resolveIpnsToCidP2P(ipnsName);
            this._subplebbit._setUpdatingState("fetching-ipfs");
            this.updateIpfsState("fetching-ipfs");
            const subplebbit: SubplebbitIpfsType = JSON.parse(await this._fetchCidP2P(subplebbitCid));
            this.updateIpfsState("stopped");
            return subplebbit;
        } else {
            // States of gateways should be updated by fetchFromMultipleGateways
            const update: SubplebbitIpfsType = JSON.parse(await this.fetchFromMultipleGateways({ ipns: ipnsName }, "subplebbit"));
            return update;
        }
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
