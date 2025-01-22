import { CachedResolve } from "../clients/base-client-manager.js";
import { GenericChainProviderClient } from "../clients/chain-provider-client.js";
import { ClientsManager, ResultOfFetchingSubplebbit } from "../clients/client-manager.js";
import { CommentIpfsClient, PublicationIpfsClient } from "../clients/ipfs-client.js";
import { CommentIpfsGatewayClient, PublicationIpfsGatewayClient } from "../clients/ipfs-gateway-client.js";
import { PublicationPubsubClient } from "../clients/pubsub-client.js";
import { PublicationPlebbitRpcStateClient } from "../clients/rpc-client/plebbit-rpc-state-client.js";
import { PlebbitError } from "../plebbit-error.js";
import { ChainTicker } from "../types.js";
import Publication from "./publication.js";
import * as remeda from "remeda";

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
        this._initPlebbitRpcClients();
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
        staleCache?: CachedResolve
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
        staleCache?: CachedResolve
    ): void {
        // TODO should check for regex of ipns eventually
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

    protected override postFetchSubplebbitIpfsSuccess(subJson: ResultOfFetchingSubplebbit) {}

    protected override postFetchSubplebbitInvalidRecord(subJson: string, subError: PlebbitError): void {
        this._publication._updatePublishingState("failed");
        this._publication.emit("error", subError);
        throw subError;
    }
}
