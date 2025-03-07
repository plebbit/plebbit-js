import { Plebbit } from "../plebbit/plebbit.js";
import { hideClassPrivateProps, isIpfsCid, isIpfsPath, throwWithErrorCode, timestamp } from "../util.js";
import assert from "assert";
import type { ChainTicker } from "../types.js";
import * as remeda from "remeda";
import { GenericKuboRpcClient } from "./ipfs-client.js";
import { GenericKuboPubsubClient } from "./pubsub-client.js";
import { GenericChainProviderClient } from "./chain-provider-client.js";
import { GenericIpfsGatewayClient } from "./ipfs-gateway-client.js";

import { BaseClientsManager, CachedTextRecordResolve, OptionsToLoadFromGateway } from "./base-client-manager.js";

import type { SubplebbitIpfsType, SubplebbitJson } from "../subplebbit/types.js";
import Logger from "@plebbit/plebbit-logger";

export type ResultOfFetchingSubplebbit =
    | { subplebbit: SubplebbitIpfsType; cid: string } // when we fetch a new subplebbit only
    | undefined; // undefined is when we resolve an IPNS and it's equal to subplebbit.updateCid. So no need to fetch IPFS

export class ClientsManager extends BaseClientsManager {
    clients: {
        ipfsGateways: { [ipfsGatewayUrl: string]: GenericIpfsGatewayClient };
        kuboRpcClients: { [kuboRpcClientUrl: string]: GenericKuboRpcClient };
        pubsubKuboRpcClients: { [pubsubKuboClientUrl: string]: GenericKuboPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
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
        hideClassPrivateProps(this);
    }

    protected _initIpfsGateways() {
        for (const gatewayUrl of remeda.keys.strict(this._plebbit.clients.ipfsGateways))
            this.clients.ipfsGateways = { ...this.clients.ipfsGateways, [gatewayUrl]: new GenericIpfsGatewayClient("stopped") };
    }

    protected _initKuboRpcClients() {
        for (const kuboRpcUrl of remeda.keys.strict(this._plebbit.clients.kuboRpcClients))
            this.clients.kuboRpcClients = { ...this.clients.kuboRpcClients, [kuboRpcUrl]: new GenericKuboRpcClient("stopped") };
    }

    protected _initPubsubKuboRpcClients() {
        for (const pubsubUrl of remeda.keys.strict(this._plebbit.clients.pubsubKuboRpcClients))
            this.clients.pubsubKuboRpcClients = {
                ...this.clients.pubsubKuboRpcClients,
                [pubsubUrl]: new GenericKuboPubsubClient("stopped")
            };
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

    updatePubsubState(newState: GenericKuboPubsubClient["state"], pubsubProvider: string | undefined) {
        pubsubProvider = pubsubProvider || this._defaultPubsubProviderUrl;
        assert(typeof pubsubProvider === "string");
        assert(typeof newState === "string", "Can't update pubsub state to undefined");
        if (this.clients.pubsubKuboRpcClients[pubsubProvider].state === newState) return;
        this.clients.pubsubKuboRpcClients[pubsubProvider].state = newState;
        this.clients.pubsubKuboRpcClients[pubsubProvider].emit("statechange", newState);
    }

    updateIpfsState(newState: GenericKuboRpcClient["state"]) {
        assert(this._defaultIpfsProviderUrl);
        assert(typeof newState === "string", "Can't update ipfs state to undefined");
        if (this.clients.kuboRpcClients[this._defaultIpfsProviderUrl].state === newState) return;
        this.clients.kuboRpcClients[this._defaultIpfsProviderUrl].state = newState;
        this.clients.kuboRpcClients[this._defaultIpfsProviderUrl].emit("statechange", newState);
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
        const timeoutMs = this._plebbit._timeouts["generic-ipfs"];
        if (this._defaultIpfsProviderUrl) return this._fetchCidP2P(cid, { maxFileSizeBytes: 1024 * 1024, timeoutMs });
        else {
            const log = Logger("plebbit-js:clients-manager:fetchCid");
            const resObj = await this.fetchFromMultipleGateways({
                root: cid,
                recordIpfsType: "ipfs",
                recordPlebbitType: "generic-ipfs",
                validateGatewayResponseFunc: async () => {}, // no need to validate body against cid here, fetchFromMultipleGateways already does it
                log,
                maxFileSizeBytes: 1024 * 1024
            });
            return resObj.resText;
        }
    }

    // fetchSubplebbit should be here

    protected _getStatePriorToResolvingSubplebbitIpns(): "fetching-subplebbit-ipns" | "fetching-ipns" {
        return "fetching-subplebbit-ipns";
    }
}
