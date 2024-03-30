import Logger from "@plebbit/plebbit-logger";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
import type { InternalSubplebbitRpcType, SubplebbitIpfsType } from "./types.js";

export class RpcRemoteSubplebbit extends RemoteSubplebbit {
    private _updateRpcSubscriptionId?: number;

    protected _setRpcClientState(newState: RemoteSubplebbit["clients"]["plebbitRpcClients"][""]["state"]) {
        const currentRpcUrl = Object.keys(this.clients.plebbitRpcClients)[0];
        const currentState = this.clients.plebbitRpcClients[currentRpcUrl].state;
        if (newState === currentState) return;
        this.clients.plebbitRpcClients[currentRpcUrl].state = newState;
        this.clients.plebbitRpcClients[currentRpcUrl].emit("statechange", newState);
    }

    protected _updateRpcClientStateFromStartedState(startedState: RemoteSubplebbit["startedState"]) {
        const mapper: Record<RemoteSubplebbit["startedState"], RemoteSubplebbit["clients"]["plebbitRpcClients"][0]["state"][]> = {
            failed: ["stopped"],
            "publishing-ipns": ["publishing-ipns"],
            stopped: ["stopped"],
            succeeded: ["stopped"]
        };

        mapper[startedState].forEach(this._setRpcClientState.bind(this));
    }

    protected _updateRpcClientStateFromUpdatingState(updatingState: RemoteSubplebbit["updatingState"]) {
        // We're deriving the the rpc state from updating state

        const mapper: Record<RemoteSubplebbit["updatingState"], RemoteSubplebbit["clients"]["plebbitRpcClients"][0]["state"][]> = {
            failed: ["stopped"],
            "fetching-ipfs": ["fetching-ipfs"],
            "fetching-ipns": ["fetching-ipns"],
            "resolving-address": ["resolving-subplebbit-address"],
            stopped: ["stopped"],
            succeeded: ["stopped"]
        };

        mapper[updatingState].forEach(this._setRpcClientState.bind(this));
    }

    protected async _handleRpcUpdateProps(rpcProps: SubplebbitIpfsType) {
        await this.initRemoteSubplebbitPropsNoMerge(rpcProps);
    }

    async update() {
        const log = Logger("plebbit-js:rpc-remote-subplebbit:update");

        if (this.state !== "stopped" || this._updateRpcSubscriptionId) return; // No need to do anything if subplebbit is already updating

        try {
            this._updateRpcSubscriptionId = await this.plebbit.plebbitRpcClient.subplebbitUpdate(this.address);
            this._setState("updating");
        } catch (e) {
            log.error("Failed to receive subplebbitUpdate from RPC due to error", e);
            this._setState("stopped");
            this._setUpdatingState("failed");
            throw e;
        }
        this.plebbit.plebbitRpcClient
            .getSubscription(this._updateRpcSubscriptionId)
            .on("update", async (updateProps) => {
                log(`Received new subplebbitUpdate (${this.address}) from RPC (${this.plebbit.plebbitRpcClientsOptions[0]})`);
                const rpcSubProps = <SubplebbitIpfsType | InternalSubplebbitRpcType>updateProps.params.result;
                await this._handleRpcUpdateProps(rpcSubProps);
                this.emit("update", this);
            })
            .on("updatingstatechange", (args) => {
                const newUpdatingState: RemoteSubplebbit["updatingState"] = args.params.result;
                this._setUpdatingState(newUpdatingState);
                this._updateRpcClientStateFromUpdatingState(newUpdatingState);
            })
            .on("error", (args) => this.emit("error", args.params.result));

        this.plebbit.plebbitRpcClient.emitAllPendingMessages(this._updateRpcSubscriptionId);
    }

    async stop() {
        const log = Logger("plebbit-js:rpc-remote-subplebbit:stop");

        await this.plebbit.plebbitRpcClient.unsubscribe(this._updateRpcSubscriptionId);
        this._setRpcClientState("stopped");
        this._updateRpcSubscriptionId = undefined;
        log.trace(`Stopped the update of remote subplebbit (${this.address}) via RPC`);
        this._setUpdatingState("stopped");
        this._setState("stopped");
    }
}
