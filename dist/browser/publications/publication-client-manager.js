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
            this._publication._updatePublishingStateWithEmission(translatedState);
    }
    handleUpdatingStateChangeEventFromSub(newUpdatingState) {
        // will be overridden in comment-client-manager to provide a specific states relevant to comment updating
        // below is for handling translation to publishingState
        this._translateSubUpdatingStateToPublishingState(newUpdatingState);
    }
    handleUpdateEventFromSub(sub) {
        // a new update has been emitted by sub
        // should be handled in comment-client-manager
    }
    handleErrorEventFromSub(err) { }
    handleIpfsGatewaySubplebbitState(subplebbitNewGatewayState, gatewayUrl) {
        this.updateGatewayState(subplebbitNewGatewayState === "fetching-ipns" ? "fetching-subplebbit-ipns" : subplebbitNewGatewayState, gatewayUrl);
    }
    handleChainProviderSubplebbitState(subplebbitNewChainState, chainTicker, providerUrl) {
        this.updateChainProviderState(subplebbitNewChainState, chainTicker, providerUrl);
    }
    handleKuboRpcSubplebbitState(subplebbitNewKuboRpcState, kuboRpcUrl) {
        const stateMapper = {
            "fetching-ipns": "fetching-subplebbit-ipns",
            "fetching-ipfs": "fetching-subplebbit-ipfs",
            stopped: "stopped",
            "publishing-ipns": undefined
        };
        const translatedState = stateMapper[subplebbitNewKuboRpcState];
        if (translatedState)
            this.updateIpfsState(translatedState);
    }
    async _createSubInstanceWithStateTranslation() {
        // basically in Publication or comment we need to be fetching the subplebbit record
        // this function will be for translating between the states of the subplebbit and its clients to publication/comment states
        const sub = this._plebbit._updatingSubplebbits[this._publication.subplebbitAddress] ||
            this._plebbit._startedSubplebbits[this._publication.subplebbitAddress] ||
            (await this._plebbit.createSubplebbit({ address: this._publication.subplebbitAddress }));
        this._subplebbitForUpdating = {
            subplebbit: sub,
            error: this.handleErrorEventFromSub.bind(this),
            update: this.handleUpdateEventFromSub.bind(this),
            updatingstatechange: this.handleUpdatingStateChangeEventFromSub.bind(this)
        };
        if (this._subplebbitForUpdating.subplebbit.clients.ipfsGateways &&
            Object.keys(this._subplebbitForUpdating.subplebbit.clients.ipfsGateways).length > 0) {
            // we're using gateways
            const ipfsGatewayListeners = {};
            for (const gatewayUrl of Object.keys(this._subplebbitForUpdating.subplebbit.clients.ipfsGateways)) {
                const ipfsStateListener = (subplebbitNewIpfsState) => this.handleIpfsGatewaySubplebbitState(subplebbitNewIpfsState, gatewayUrl);
                this._subplebbitForUpdating.subplebbit.clients.ipfsGateways[gatewayUrl].on("statechange", ipfsStateListener);
                ipfsGatewayListeners[gatewayUrl] = ipfsStateListener;
            }
            this._subplebbitForUpdating.ipfsGatewayListeners = ipfsGatewayListeners;
        }
        // Add Kubo RPC client state listeners
        if (this._subplebbitForUpdating.subplebbit.clients.kuboRpcClients &&
            Object.keys(this._subplebbitForUpdating.subplebbit.clients.kuboRpcClients).length > 0) {
            const kuboRpcListeners = {};
            for (const kuboRpcUrl of Object.keys(this._subplebbitForUpdating.subplebbit.clients.kuboRpcClients)) {
                const kuboRpcStateListener = (subplebbitNewKuboRpcState) => this.handleKuboRpcSubplebbitState(subplebbitNewKuboRpcState, kuboRpcUrl);
                this._subplebbitForUpdating.subplebbit.clients.kuboRpcClients[kuboRpcUrl].on("statechange", kuboRpcStateListener);
                kuboRpcListeners[kuboRpcUrl] = kuboRpcStateListener;
            }
            this._subplebbitForUpdating.kuboRpcListeners = kuboRpcListeners;
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
        // Clean up IPFS Gateway listeners
        if (this._subplebbitForUpdating.ipfsGatewayListeners) {
            for (const gatewayUrl of Object.keys(this._subplebbitForUpdating.ipfsGatewayListeners)) {
                this._subplebbitForUpdating.subplebbit.clients.ipfsGateways[gatewayUrl].removeListener("statechange", this._subplebbitForUpdating.ipfsGatewayListeners[gatewayUrl]);
                this.updateGatewayState("stopped", gatewayUrl); // need to reset all gateway states
            }
        }
        // Clean up Kubo RPC listeners
        if (this._subplebbitForUpdating.kuboRpcListeners) {
            for (const kuboRpcUrl of Object.keys(this._subplebbitForUpdating.kuboRpcListeners)) {
                this._subplebbitForUpdating.subplebbit.clients.kuboRpcClients[kuboRpcUrl].removeListener("statechange", this._subplebbitForUpdating.kuboRpcListeners[kuboRpcUrl]);
                this.updateIpfsState("stopped"); // need to reset all Kubo RPC states
            }
        }
        // Clean up chain provider listeners
        if (this._subplebbitForUpdating.chainProviderListeners) {
            for (const chainTicker of Object.keys(this._subplebbitForUpdating.chainProviderListeners)) {
                for (const providerUrl of Object.keys(this._subplebbitForUpdating.chainProviderListeners[chainTicker])) {
                    this._subplebbitForUpdating.subplebbit.clients.chainProviders[chainTicker][providerUrl].removeListener("statechange", this._subplebbitForUpdating.chainProviderListeners[chainTicker][providerUrl]);
                    this.updateChainProviderState("stopped", chainTicker, providerUrl); // need to reset all chain provider states
                }
            }
        }
        // Remove update event at the end
        this._subplebbitForUpdating.subplebbit.removeListener("updatingstatechange", this._subplebbitForUpdating.updatingstatechange);
        this._subplebbitForUpdating.subplebbit.removeListener("error", this._subplebbitForUpdating.error);
        this._subplebbitForUpdating.subplebbit.removeListener("update", this._subplebbitForUpdating.update);
        if (this._subplebbitForUpdating.subplebbit._updatingSubInstanceWithListeners)
            // should only stop when _subplebbitForUpdating is not plebbit._updatingSubplebbits
            await this._subplebbitForUpdating.subplebbit.stop();
        this._subplebbitForUpdating = undefined;
    }
}
//# sourceMappingURL=publication-client-manager.js.map