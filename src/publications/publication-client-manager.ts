import Logger from "@plebbit/plebbit-logger";
import { CachedTextRecordResolve } from "../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../clients/chain-provider-client.js";
import { ClientsManager, ResultOfFetchingSubplebbit } from "../clients/client-manager.js";
import { CommentKuboRpcClient, PublicationKuboRpcClient } from "../clients/ipfs-client.js";
import { CommentIpfsGatewayClient, PublicationIpfsGatewayClient } from "../clients/ipfs-gateway-client.js";
import { PublicationKuboPubsubClient } from "../clients/pubsub-client.js";
import { PublicationPlebbitRpcStateClient } from "../clients/rpc-client/plebbit-rpc-state-client.js";
import { PlebbitError } from "../plebbit-error.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
import { ChainTicker, SubplebbitEvents } from "../types.js";
import Publication from "./publication.js";
import * as remeda from "remeda";

export class PublicationClientsManager extends ClientsManager {
    override clients!: {
        ipfsGateways: { [ipfsGatewayUrl: string]: PublicationIpfsGatewayClient | CommentIpfsGatewayClient };
        kuboRpcClients: { [kuboRpcUrl: string]: PublicationKuboRpcClient | CommentKuboRpcClient };
        pubsubKuboRpcClients: { [kuboRpcUrl: string]: PublicationKuboPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, PublicationPlebbitRpcStateClient>;
    };
    _publication: Publication;
    _subplebbitForUpdating?: {
        subplebbit: RemoteSubplebbit;
        ipfsGatewayListeners?: Record<string, Parameters<RemoteSubplebbit["clients"]["ipfsGateways"][string]["on"]>[1]>;
    } & Pick<SubplebbitEvents, "updatingstatechange" | "update" | "error"> = undefined;

    constructor(publication: Publication) {
        super(publication._plebbit);
        this._publication = publication;
        this._initPlebbitRpcClients();
        this.handleErrorEventFromSub = this.handleErrorEventFromSub.bind(this);
        this.handleIpfsGatewaySubplebbitState = this.handleIpfsGatewaySubplebbitState.bind(this);
        this.handleUpdateEventFromSub = this.handleUpdateEventFromSub.bind(this);
        this.handleUpdatingStateChangeEventFromSub = this.handleUpdatingStateChangeEventFromSub.bind(this);
    }

    protected override _initKuboRpcClients(): void {
        if (this._plebbit.clients.kuboRpcClients)
            for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.kuboRpcClients))
                this.clients.kuboRpcClients = { ...this.clients.kuboRpcClients, [ipfsUrl]: new PublicationKuboRpcClient("stopped") };
    }

    protected override _initPubsubKuboRpcClients(): void {
        for (const pubsubUrl of remeda.keys.strict(this._plebbit.clients.pubsubKuboRpcClients))
            this.clients.pubsubKuboRpcClients = {
                ...this.clients.pubsubKuboRpcClients,
                [pubsubUrl]: new PublicationKuboPubsubClient("stopped")
            };
    }

    protected _initPlebbitRpcClients() {
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
        chainProviderUrl: string,
        staleCache?: CachedTextRecordResolve
    ): void {
        super.preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl, staleCache);
        const isStartingToPublish = this._publication.publishingState === "stopped" || this._publication.publishingState === "failed";
        if (this._publication.state === "publishing" && txtRecordName === "subplebbit-address" && isStartingToPublish && !staleCache)
            this._publication._updatePublishingState("resolving-subplebbit-address");
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

    override updateIpfsState(newState: PublicationKuboRpcClient["state"] | CommentKuboRpcClient["state"]) {
        super.updateIpfsState(newState);
    }

    override updatePubsubState(newState: PublicationKuboPubsubClient["state"], pubsubProvider: string | undefined) {
        super.updatePubsubState(newState, pubsubProvider);
    }

    override updateGatewayState(newState: PublicationIpfsGatewayClient["state"], gateway: string): void {
        super.updateGatewayState(newState, gateway);
    }

    _translateSubUpdatingStateToPublishingState(newUpdatingState: RemoteSubplebbit["updatingState"]) {
        const mapper: Partial<Record<typeof newUpdatingState, Publication["publishingState"]>> = {
            failed: "failed",
            "fetching-ipfs": "fetching-subplebbit-ipfs",
            "fetching-ipns": "fetching-subplebbit-ipns",
            "resolving-address": "resolving-subplebbit-address"
        };
        const translatedState = mapper[newUpdatingState];
        if (translatedState) this._publication._updatePublishingState(translatedState);
    }

    _translateSubUpdatingStateToKuboClientState(newUpdatingState: RemoteSubplebbit["updatingState"]) {
        if (!this._defaultIpfsProviderUrl) return;
        const mapper: Partial<Record<typeof newUpdatingState, Publication["clients"]["kuboRpcClients"][string]["state"]>> = {
            failed: "stopped",
            stopped: "stopped",
            succeeded: "stopped",
            "fetching-ipfs": "fetching-subplebbit-ipfs",
            "fetching-ipns": "fetching-subplebbit-ipns"
        };
        const translatedState = mapper[newUpdatingState];
        if (translatedState) this.updateIpfsState(translatedState);
    }

    handleUpdatingStateChangeEventFromSub(newUpdatingState: RemoteSubplebbit["updatingState"]) {
        // will be overridden in comment-client-manager to provide a specific states relevant to comment updating
        // below is for handling translation to publishingState
        this._translateSubUpdatingStateToPublishingState(newUpdatingState);
        this._translateSubUpdatingStateToKuboClientState(newUpdatingState);
    }
    handleUpdateEventFromSub() {
        // a new update has been emitted by sub
        // should be handled in comment-client-manager
    }

    handleErrorEventFromSub(err: PlebbitError | Error) {
        // a non retriable error of the sub
        const log = Logger("plebbit-js:publication:publish");

        log.error("Publication received a non retriable error from its subplebbit instance. Will stop publishing", err);

        this._publication._updatePublishingState("failed");
        this._publication.emit("error", err);
    }

    handleIpfsGatewaySubplebbitState(
        subplebbitNewGatewayState: RemoteSubplebbit["clients"]["ipfsGateways"][string]["state"],
        gatewayUrl: string
    ) {
        this.updateGatewayState(
            subplebbitNewGatewayState === "fetching-ipns" ? "fetching-subplebbit-ipns" : subplebbitNewGatewayState,
            gatewayUrl
        );
    }

    async _createSubInstanceWithStateTranslation() {
        // basically in Publication or comment we need to be fetching the subplebbit record
        // this function will be for translating between the states of the subplebbit and its clients to publication/comment states
        const sub =
            this._plebbit._updatingSubplebbits[this._publication.subplebbitAddress] ||
            (await this._plebbit.createSubplebbit({ address: this._publication.subplebbitAddress }));

        this._subplebbitForUpdating = {
            subplebbit: sub,
            error: this.handleErrorEventFromSub,
            update: this.handleUpdateEventFromSub,
            updatingstatechange: this.handleUpdatingStateChangeEventFromSub
        };

        if (!this._defaultIpfsProviderUrl) {
            // we're using gateways
            const ipfsGatewayListeners: (typeof this._subplebbitForUpdating)["ipfsGatewayListeners"] = {};

            for (const gatewayUrl of Object.keys(this._subplebbitForUpdating.subplebbit.clients.ipfsGateways)) {
                const ipfsStateListener = (subplebbitNewIpfsState: RemoteSubplebbit["clients"]["ipfsGateways"][string]["state"]) =>
                    this.handleIpfsGatewaySubplebbitState(subplebbitNewIpfsState, gatewayUrl);

                this._subplebbitForUpdating.subplebbit.clients.ipfsGateways[gatewayUrl].on("statechange", ipfsStateListener);
                ipfsGatewayListeners[gatewayUrl] = ipfsStateListener;
            }
            this._subplebbitForUpdating.ipfsGatewayListeners = ipfsGatewayListeners;
        }

        this._subplebbitForUpdating.subplebbit.on("update", this._subplebbitForUpdating.update);

        this._subplebbitForUpdating.subplebbit.on("updatingstatechange", this._subplebbitForUpdating.updatingstatechange);

        this._subplebbitForUpdating.subplebbit.on("error", this._subplebbitForUpdating.error);

        return this._subplebbitForUpdating!;
    }

    async cleanUpUpdatingSubInstance() {
        if (!this._subplebbitForUpdating) throw Error("Need to define subplebbitForUpdating first");

        this._subplebbitForUpdating.subplebbit.removeListener("updatingstatechange", this._subplebbitForUpdating.updatingstatechange);
        this._subplebbitForUpdating.subplebbit.removeListener("update", this._subplebbitForUpdating.update);
        this._subplebbitForUpdating.subplebbit.removeListener("error", this._subplebbitForUpdating.error);

        if (this._subplebbitForUpdating.ipfsGatewayListeners)
            for (const gatewayUrl of Object.keys(this._subplebbitForUpdating.ipfsGatewayListeners))
                this._subplebbitForUpdating.subplebbit.clients.ipfsGateways[gatewayUrl].removeListener(
                    "statechange",
                    this._subplebbitForUpdating.ipfsGatewayListeners[gatewayUrl]
                );

        if (this._subplebbitForUpdating.subplebbit._updatingSubInstanceWithListeners)
            // should only stop when _subplebbitForUpdating is not plebbit._updatingSubplebbits
            await this._subplebbitForUpdating.subplebbit.stop();

        this._subplebbitForUpdating = undefined;
    }
}
