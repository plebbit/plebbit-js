import { Plebbit } from "./plebbit.js";
import { hideClassPrivateProps, isIpfsCid, isIpfsPath, throwWithErrorCode } from "../util.js";
import assert from "assert";
import type { ChainTicker } from "../types.js";
import * as remeda from "remeda";
import { GenericChainProviderClient } from "../clients/chain-provider-client.js";

import { BaseClientsManager, CachedTextRecordResolve, OptionsToLoadFromGateway } from "../clients/base-client-manager.js";

import Logger from "@plebbit/plebbit-logger";
import { PlebbitIpfsGatewayClient, PlebbitKuboRpcClient, PlebbitLibp2pJsClient } from "./plebbit-clients.js";
import { GenericStateClient } from "../generic-state-client.js";

export class PlebbitClientsManager extends BaseClientsManager {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: PlebbitIpfsGatewayClient };
        kuboRpcClients: { [kuboRpcClientUrl: string]: PlebbitKuboRpcClient };
        pubsubKuboRpcClients: { [pubsubKuboClientUrl: string]: GenericStateClient<string> }; // plebbit will never use this, but we're keeping it for compatibility
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        libp2pJsClients: { [libp2pJsClientKey: string]: PlebbitLibp2pJsClient };
    };

    constructor(plebbit: Plebbit) {
        super(plebbit);
        this._plebbit = plebbit;
        //@ts-expect-error
        this.clients = {};
        this._initIpfsGateways();
        this._initKuboRpcClients();
        this._initPubsubKuboRpcClients();
        this._initChainProviders();
        this._initLibp2pJsClients();
        hideClassPrivateProps(this);
    }

    protected _initIpfsGateways() {
        for (const gatewayUrl of remeda.keys.strict(this._plebbit.clients.ipfsGateways))
            this.clients.ipfsGateways = { ...this.clients.ipfsGateways, [gatewayUrl]: new PlebbitIpfsGatewayClient("stopped") };
    }

    protected _initKuboRpcClients() {
        for (const kuboRpcUrl of remeda.keys.strict(this._plebbit.clients.kuboRpcClients))
            this.clients.kuboRpcClients = { ...this.clients.kuboRpcClients, [kuboRpcUrl]: new PlebbitKuboRpcClient("stopped") };
    }

    protected _initPubsubKuboRpcClients() {
        for (const pubsubUrl of remeda.keys.strict(this._plebbit.clients.pubsubKuboRpcClients))
            this.clients.pubsubKuboRpcClients = {
                ...this.clients.pubsubKuboRpcClients,
                [pubsubUrl]: new GenericStateClient<string>("stopped")
            };
    }

    protected _initLibp2pJsClients() {
        for (const libp2pJsClientKey of remeda.keys.strict(this._plebbit.clients.libp2pJsClients))
            this.clients.libp2pJsClients = { ...this.clients.libp2pJsClients, [libp2pJsClientKey]: new PlebbitLibp2pJsClient("stopped") };
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

    updateKuboRpcPubsubState(newState: PlebbitClientsManager["clients"]["pubsubKuboRpcClients"][string]["state"], pubsubProvider: string) {
        assert(typeof pubsubProvider === "string", "Can't update pubsub state to undefined");
        assert(typeof newState === "string", "Can't update pubsub state to undefined");
        if (this.clients.pubsubKuboRpcClients[pubsubProvider].state === newState) return;
        this.clients.pubsubKuboRpcClients[pubsubProvider].state = newState;
        this.clients.pubsubKuboRpcClients[pubsubProvider].emit("statechange", newState);
    }

    updateKuboRpcState(newState: PlebbitClientsManager["clients"]["kuboRpcClients"][string]["state"], kuboRpcClientUrl: string) {
        assert(typeof newState === "string", "Can't update ipfs state to undefined");
        assert(typeof kuboRpcClientUrl === "string", "Can't update ipfs state to undefined");
        if (this.clients.kuboRpcClients[kuboRpcClientUrl].state === newState) return;
        this.clients.kuboRpcClients[kuboRpcClientUrl].state = newState;
        this.clients.kuboRpcClients[kuboRpcClientUrl].emit("statechange", newState);
    }

    updateLibp2pJsClientState(newState: PlebbitClientsManager["clients"]["libp2pJsClients"][string]["state"], libp2pJsClientKey: string) {
        assert(typeof newState === "string", "Can't update libp2p js client state to undefined");
        assert(typeof libp2pJsClientKey === "string", "Can't update libp2p js client state to undefined");
        if (this.clients.libp2pJsClients[libp2pJsClientKey].state === newState) return;
        this.clients.libp2pJsClients[libp2pJsClientKey].state = newState;
        this.clients.libp2pJsClients[libp2pJsClientKey].emit("statechange", newState);
    }

    updateGatewayState(newState: PlebbitClientsManager["clients"]["ipfsGateways"][string]["state"], gateway: string) {
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
        const timeoutMs = this._plebbit._timeouts["generic-ipfs"];
        if (Object.keys(this.clients.kuboRpcClients).length > 0 || Object.keys(this.clients.libp2pJsClients).length > 0)
            return this._fetchCidP2P(cid, { maxFileSizeBytes: 1024 * 1024, timeoutMs });
        else {
            const log = Logger("plebbit-js:clients-manager:fetchCid");
            const resObj = await this.fetchFromMultipleGateways({
                root: cid,
                recordIpfsType: "ipfs",
                recordPlebbitType: "generic-ipfs",
                validateGatewayResponseFunc: async () => {}, // no need to validate body against cid here, fetchFromMultipleGateways already does it
                log,
                maxFileSizeBytes: 1024 * 1024,
                timeoutMs
            });
            return resObj.resText;
        }
    }

    // fetchSubplebbit should be here

    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns" {
        return "fetching-subplebbit-ipns";
    }
}
