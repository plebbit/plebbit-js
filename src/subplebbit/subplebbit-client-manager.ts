import { CachedResolve } from "../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../clients/chain-provider-client.js";
import { ClientsManager, ResultOfFetchingSubplebbit } from "../clients/client-manager.js";
import { SubplebbitIpfsClient } from "../clients/ipfs-client.js";
import { CommentIpfsGatewayClient, SubplebbitIpfsGatewayClient } from "../clients/ipfs-gateway-client.js";
import { SubplebbitPubsubClient } from "../clients/pubsub-client.js";
import { SubplebbitPlebbitRpcStateClient } from "../clients/rpc-client/plebbit-rpc-state-client.js";
import { PlebbitError } from "../plebbit-error.js";
import { ChainTicker } from "../types.js";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
import * as remeda from "remeda";

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
        super(subplebbit._plebbit);
        this._subplebbit = subplebbit;
        this._initPlebbitRpcClients();
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

    protected _initPlebbitRpcClients() {
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
        chainProviderUrl: string,
        staleCache?: CachedResolve
    ): void {
        super.preResolveTextRecord(address, txtRecordName, chain, chainProviderUrl, staleCache);
        if (
            this._subplebbit.state === "updating" &&
            txtRecordName === "subplebbit-address" &&
            !staleCache &&
            this._subplebbit.updatingState !== "fetching-ipfs" // we don't state to be resolving-address when verifying signature
        )
            this._subplebbit._setUpdatingState("resolving-address");
    }

    override postResolveTextRecordSuccess(
        address: string,
        txtRecordName: "subplebbit-address" | "plebbit-author-address",
        resolvedTextRecord: string,
        chain: ChainTicker,
        chainProviderUrl: string,
        staleCache?: CachedResolve
    ): void {
        super.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl, staleCache);
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
    protected override postFetchSubplebbitIpfsSuccess(subJson: ResultOfFetchingSubplebbit) {
        this._subplebbit._setUpdatingState("succeeded");
    }

    // if we're loading a SubplebbitIpfs through RemoteSubplebbit, and the record itself has a problem
    // Could be invalid json or schema or signature
    protected override postFetchSubplebbitInvalidRecord(subJson: string, subError: PlebbitError): void {
        this._subplebbit._setUpdatingState("failed");
        this._subplebbit.emit("error", subError);
        throw subError;
    }
}
