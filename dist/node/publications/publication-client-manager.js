import Logger from "@plebbit/plebbit-logger";
import { ClientsManager } from "../clients/client-manager.js";
import { PublicationKuboRpcClient } from "../clients/ipfs-client.js";
import { PublicationKuboPubsubClient } from "../clients/pubsub-client.js";
import { PublicationPlebbitRpcStateClient } from "../clients/rpc-client/plebbit-rpc-state-client.js";
import * as remeda from "remeda";
export class PublicationClientsManager extends ClientsManager {
    constructor(publication) {
        super(publication._plebbit);
        this._subplebbitForUpdating = undefined;
        this._publication = publication;
        this._initPlebbitRpcClients();
        this.handleErrorEventFromSub = this.handleErrorEventFromSub.bind(this);
        this.handleIpfsGatewaySubplebbitState = this.handleIpfsGatewaySubplebbitState.bind(this);
        this.handleUpdateEventFromSub = this.handleUpdateEventFromSub.bind(this);
        this.handleUpdatingStateChangeEventFromSub = this.handleUpdatingStateChangeEventFromSub.bind(this);
    }
    _initKuboRpcClients() {
        if (this._plebbit.clients.kuboRpcClients)
            for (const ipfsUrl of remeda.keys.strict(this._plebbit.clients.kuboRpcClients))
                this.clients.kuboRpcClients = { ...this.clients.kuboRpcClients, [ipfsUrl]: new PublicationKuboRpcClient("stopped") };
    }
    _initPubsubKuboRpcClients() {
        for (const pubsubUrl of remeda.keys.strict(this._plebbit.clients.pubsubKuboRpcClients))
            this.clients.pubsubKuboRpcClients = {
                ...this.clients.pubsubKuboRpcClients,
                [pubsubUrl]: new PublicationKuboPubsubClient("stopped")
            };
    }
    _initPlebbitRpcClients() {
        for (const rpcUrl of remeda.keys.strict(this._plebbit.clients.plebbitRpcClients))
            this.clients.plebbitRpcClients = {
                ...this.clients.plebbitRpcClients,
                [rpcUrl]: new PublicationPlebbitRpcStateClient("stopped")
            };
    }
    emitError(e) {
        this._publication.emit("error", e);
    }
    updateIpfsState(newState) {
        super.updateIpfsState(newState);
    }
    updatePubsubState(newState, pubsubProvider) {
        super.updatePubsubState(newState, pubsubProvider);
    }
    updateGatewayState(newState, gateway) {
        super.updateGatewayState(newState, gateway);
    }
    _translateSubUpdatingStateToPublishingState(newUpdatingState) {
        const mapper = {
            failed: "failed",
            "fetching-ipfs": "fetching-subplebbit-ipfs",
            "fetching-ipns": "fetching-subplebbit-ipns",
            "resolving-address": "resolving-subplebbit-address"
        };
        const translatedState = mapper[newUpdatingState];
        if (translatedState)
            this._publication._updatePublishingState(translatedState);
    }
    _translateSubUpdatingStateToKuboClientState(newUpdatingState) {
        if (!this._defaultIpfsProviderUrl)
            return;
        const mapper = {
            failed: "stopped",
            stopped: "stopped",
            succeeded: "stopped",
            "fetching-ipfs": "fetching-subplebbit-ipfs",
            "fetching-ipns": "fetching-subplebbit-ipns"
        };
        const translatedState = mapper[newUpdatingState];
        if (translatedState)
            this.updateIpfsState(translatedState);
    }
    handleUpdatingStateChangeEventFromSub(newUpdatingState) {
        // will be overridden in comment-client-manager to provide a specific states relevant to comment updating
        // below is for handling translation to publishingState
        this._translateSubUpdatingStateToPublishingState(newUpdatingState);
        this._translateSubUpdatingStateToKuboClientState(newUpdatingState);
    }
    handleUpdateEventFromSub() {
        // a new update has been emitted by sub
        // should be handled in comment-client-manager
    }
    handleErrorEventFromSub(err) {
        // a non retriable error of the sub
        const log = Logger("plebbit-js:publication:publish");
        log.error("Publication received a non retriable error from its subplebbit instance. Will stop publishing", err);
        this._publication._updatePublishingState("failed");
        this._publication.emit("error", err);
    }
    handleIpfsGatewaySubplebbitState(subplebbitNewGatewayState, gatewayUrl) {
        this.updateGatewayState(subplebbitNewGatewayState === "fetching-ipns" ? "fetching-subplebbit-ipns" : subplebbitNewGatewayState, gatewayUrl);
    }
    handleChainProviderSubplebbitState(subplebbitNewChainState, chainTicker, providerUrl) {
        this.updateChainProviderState(subplebbitNewChainState, chainTicker, providerUrl);
    }
    async _createSubInstanceWithStateTranslation() {
        // basically in Publication or comment we need to be fetching the subplebbit record
        // this function will be for translating between the states of the subplebbit and its clients to publication/comment states
        const sub = this._plebbit._updatingSubplebbits[this._publication.subplebbitAddress] ||
            (await this._plebbit.createSubplebbit({ address: this._publication.subplebbitAddress }));
        this._subplebbitForUpdating = {
            subplebbit: sub,
            error: this.handleErrorEventFromSub,
            update: this.handleUpdateEventFromSub,
            updatingstatechange: this.handleUpdatingStateChangeEventFromSub
        };
        if (!this._defaultIpfsProviderUrl) {
            // we're using gateways
            const ipfsGatewayListeners = {};
            for (const gatewayUrl of Object.keys(this._subplebbitForUpdating.subplebbit.clients.ipfsGateways)) {
                const ipfsStateListener = (subplebbitNewIpfsState) => this.handleIpfsGatewaySubplebbitState(subplebbitNewIpfsState, gatewayUrl);
                this._subplebbitForUpdating.subplebbit.clients.ipfsGateways[gatewayUrl].on("statechange", ipfsStateListener);
                ipfsGatewayListeners[gatewayUrl] = ipfsStateListener;
            }
            this._subplebbitForUpdating.ipfsGatewayListeners = ipfsGatewayListeners;
        }
        // Add chain provider state listeners
        const chainProviderListeners = {};
        for (const chainTicker of Object.keys(this._subplebbitForUpdating.subplebbit.clients.chainProviders)) {
            chainProviderListeners[chainTicker] = {};
            for (const providerUrl of Object.keys(this._subplebbitForUpdating.subplebbit.clients.chainProviders[chainTicker])) {
                const chainStateListener = (subplebbitNewChainState) => this.handleChainProviderSubplebbitState(subplebbitNewChainState, chainTicker, providerUrl);
                this._subplebbitForUpdating.subplebbit.clients.chainProviders[chainTicker][providerUrl].on("statechange", chainStateListener);
                chainProviderListeners[chainTicker][providerUrl] = chainStateListener;
            }
        }
        this._subplebbitForUpdating.chainProviderListeners = chainProviderListeners;
        this._subplebbitForUpdating.subplebbit.on("update", this._subplebbitForUpdating.update);
        this._subplebbitForUpdating.subplebbit.on("updatingstatechange", this._subplebbitForUpdating.updatingstatechange);
        this._subplebbitForUpdating.subplebbit.on("error", this._subplebbitForUpdating.error);
        return this._subplebbitForUpdating;
    }
    async cleanUpUpdatingSubInstance() {
        if (!this._subplebbitForUpdating)
            throw Error("Need to define subplebbitForUpdating first");
        this._subplebbitForUpdating.subplebbit.removeListener("updatingstatechange", this._subplebbitForUpdating.updatingstatechange);
        this._subplebbitForUpdating.subplebbit.removeListener("update", this._subplebbitForUpdating.update);
        this._subplebbitForUpdating.subplebbit.removeListener("error", this._subplebbitForUpdating.error);
        if (this._subplebbitForUpdating.ipfsGatewayListeners)
            for (const gatewayUrl of Object.keys(this._subplebbitForUpdating.ipfsGatewayListeners))
                this._subplebbitForUpdating.subplebbit.clients.ipfsGateways[gatewayUrl].removeListener("statechange", this._subplebbitForUpdating.ipfsGatewayListeners[gatewayUrl]);
        // Clean up chain provider listeners
        if (this._subplebbitForUpdating.chainProviderListeners) {
            for (const chainTicker of Object.keys(this._subplebbitForUpdating.chainProviderListeners)) {
                for (const providerUrl of Object.keys(this._subplebbitForUpdating.chainProviderListeners[chainTicker])) {
                    this._subplebbitForUpdating.subplebbit.clients.chainProviders[chainTicker][providerUrl].removeListener("statechange", this._subplebbitForUpdating.chainProviderListeners[chainTicker][providerUrl]);
                }
            }
        }
        if (this._subplebbitForUpdating.subplebbit._updatingSubInstanceWithListeners)
            // should only stop when _subplebbitForUpdating is not plebbit._updatingSubplebbits
            await this._subplebbitForUpdating.subplebbit.stop();
        this._subplebbitForUpdating = undefined;
    }
}
//# sourceMappingURL=publication-client-manager.js.map