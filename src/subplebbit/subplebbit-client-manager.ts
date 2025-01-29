import retry, { RetryOperation } from "retry";
import { CachedTextRecordResolve } from "../clients/base-client-manager.js";
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
import { SubplebbitIpfsType } from "./types.js";
import Logger from "@plebbit/plebbit-logger";
import { timestamp } from "../util.js";

export class SubplebbitClientsManager extends ClientsManager {
    override clients!: {
        ipfsGateways: { [ipfsGatewayUrl: string]: SubplebbitIpfsGatewayClient };
        ipfsClients: { [ipfsClientUrl: string]: SubplebbitIpfsClient };
        pubsubClients: { [pubsubClientUrl: string]: SubplebbitPubsubClient };
        chainProviders: Record<ChainTicker, { [chainProviderUrl: string]: GenericChainProviderClient }>;
        plebbitRpcClients: Record<string, SubplebbitPlebbitRpcStateClient>;
    };
    private _subplebbit: RemoteSubplebbit;
    _ipnsLoadingOperation?: RetryOperation = undefined;
    _updateTimeout?: NodeJS.Timeout = undefined;

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
        staleCache?: CachedTextRecordResolve
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
        staleCache?: CachedTextRecordResolve
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

    // functions for updatingSubInstance

    private async _retryLoadingSubplebbitAddress(
        subplebbitAddress: SubplebbitIpfsType["address"]
    ): Promise<ResultOfFetchingSubplebbit | PlebbitError | Error> {
        const log = Logger("plebbit-js:remote-subplebbit:update:_retryLoadingSubplebbitIpns");

        return new Promise((resolve) => {
            this._ipnsLoadingOperation!.attempt(async (curAttempt) => {
                log.trace(`Retrying to load subplebbit ${subplebbitAddress} for the ${curAttempt}th time`);
                try {
                    const update = await this.fetchNewUpdateForSubplebbit(subplebbitAddress);
                    resolve(update);
                } catch (e) {
                    this._subplebbit._setUpdatingState("failed");
                    log.error(`Failed to load Subplebbit ${this._subplebbit.address} record for the ${curAttempt}th attempt`, e);
                    if (e instanceof Error && !this._subplebbit._isRetriableErrorWhenLoading(e))
                        resolve(e); // critical error that can't be retried
                    else this._ipnsLoadingOperation!.retry(<Error>e);
                }
            });
        });
    }

    private _findInvalidCidInNonRetriableError(err: PlebbitError): string | undefined {
        const findCidInErr = (err: any) => err.details?.cidOfSubIpns || err.details?.cid;
        if (err.details.gatewayToError)
            for (const gateway of Object.keys(err.details.gatewayToError))
                if (findCidInErr(err.details.gatewayToError[gateway])) return findCidInErr(err.details.gatewayToError[gateway]);
        return findCidInErr(err);
    }

    async updateOnce() {
        const log = Logger("plebbit-js:remote-subplebbit:update");

        this._ipnsLoadingOperation = retry.operation({ forever: true, factor: 2 });
        const loadedSubIpfsOrError = await this._retryLoadingSubplebbitAddress(this._subplebbit.address); // will return undefined if no new sub CID is found
        this._ipnsLoadingOperation.stop();

        if (loadedSubIpfsOrError instanceof Error) {
            log.error(
                `Subplebbit ${this._subplebbit.address} encountered a non retriable error while updating, will emit an error event and mark invalid cid to not be loaded again`
            );
            if (loadedSubIpfsOrError instanceof PlebbitError) {
                const invalidCid = this._findInvalidCidInNonRetriableError(loadedSubIpfsOrError);
                if (invalidCid) this._subplebbit._lastInvalidSubplebbitCid = invalidCid;
            }
            this._subplebbit.emit("error", <PlebbitError>loadedSubIpfsOrError);
            return;
        } else if (loadedSubIpfsOrError?.subplebbit && (this._subplebbit.updatedAt || 0) < loadedSubIpfsOrError.subplebbit.updatedAt) {
            await this._subplebbit.initSubplebbitIpfsPropsNoMerge(loadedSubIpfsOrError.subplebbit);
            this._subplebbit.updateCid = loadedSubIpfsOrError.cid;
            log(
                `Remote Subplebbit`,
                this._subplebbit.address,
                `received a new update. Will emit an update event with updatedAt`,
                this._subplebbit.updatedAt,
                "that's",
                timestamp() - this._subplebbit.updatedAt!,
                "seconds old"
            );
            this._subplebbit.emit("update", this._subplebbit);
        } else if (loadedSubIpfsOrError === undefined) {
            this._subplebbit._setUpdatingState("succeeded"); // we loaded a sub record that we already consumed
            if (this._defaultIpfsProviderUrl) this.updateIpfsState("stopped");
        }
    }

    async startUpdatingLoop() {
        const log = Logger("plebbit-js:remote-subplebbit:update");

        const updateInterval = this._defaultIpfsProviderUrl ? 1000 : this._plebbit.updateInterval; // if we're on helia or kubo we should resolve IPNS every second
        const updateLoop = (async () => {
            if (this._subplebbit.state === "updating")
                this.updateOnce()
                    .catch((e) => log.error(`Failed to update subplebbit ${this._subplebbit.address}`, e))
                    .finally(() => setTimeout(updateLoop, updateInterval));
        }).bind(this);

        this.updateOnce()
            .catch((e) => log.error(`Failed to update subplebbit ${this._subplebbit.address}`, e))
            .finally(() => (this._updateTimeout = setTimeout(updateLoop, updateInterval)));
    }

    async stopUpdatingLoop() {
        this._ipnsLoadingOperation?.stop();
        clearTimeout(this._updateTimeout);
    }
}
