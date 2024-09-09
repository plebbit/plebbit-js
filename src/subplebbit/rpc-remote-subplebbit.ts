import Logger from "@plebbit/plebbit-logger";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
import type { RpcRemoteSubplebbitType } from "./types.js";
import * as remeda from "remeda";
import { PlebbitError } from "../plebbit-error.js";
import { parseRpcRemoteSubplebbitUpdateEventWithPlebbitErrorIfItFails } from "../schema/schema-util.js";

export class RpcRemoteSubplebbit extends RemoteSubplebbit {
    private _updateRpcSubscriptionId?: number = undefined;

    protected _setRpcClientState(newState: RemoteSubplebbit["clients"]["plebbitRpcClients"][""]["state"]) {
        const currentRpcUrl = remeda.keys.strict(this.clients.plebbitRpcClients)[0];
        const currentState = this.clients.plebbitRpcClients[currentRpcUrl].state;
        if (newState === currentState) return;
        this.clients.plebbitRpcClients[currentRpcUrl].state = newState;
        this.clients.plebbitRpcClients[currentRpcUrl].emit("statechange", newState);
    }

    protected _updateRpcClientStateFromUpdatingState(updatingState: RpcRemoteSubplebbit["updatingState"]) {
        // We're deriving the the rpc state from updating state

        const mapper: Record<RpcRemoteSubplebbit["updatingState"], RemoteSubplebbit["clients"]["plebbitRpcClients"][0]["state"][]> = {
            failed: ["stopped"],
            "fetching-ipfs": ["fetching-ipfs"],
            "fetching-ipns": ["fetching-ipns"],
            "publishing-ipns": ["publishing-ipns"],
            "resolving-address": ["resolving-subplebbit-address"],
            stopped: ["stopped"],
            succeeded: ["stopped"]
        };

        const newRpcClientState = mapper[updatingState] || [updatingState]; // There may be a case where the rpc server transmits a new state that is not part of mapper
        newRpcClientState.forEach(this._setRpcClientState.bind(this));
    }

    protected async _processUpdateEventFromRpcUpdate(args: any) {
        // This function is to handle "update" event emitted after calling rpcRemoteSubplebbit.update()
        // It's overidden in rpc-local-subplebbit
        const log = Logger("plebbit-js:rpc-remote-subplebbit:_processUpdateEventFromRpcUpdate");
        let updateRecord: RpcRemoteSubplebbitType;
        try {
            updateRecord = parseRpcRemoteSubplebbitUpdateEventWithPlebbitErrorIfItFails(args.params.result);
        } catch (e) {
            log.error("Failed to parse the schema of remote subplebbit sent by rpc", e);
            this.emit("error", <PlebbitError>e);
            throw e;
        }

        await this.initSubplebbitIpfsPropsNoMerge(updateRecord.subplebbit);
        this.updateCid = updateRecord.updateCid;

        this.emit("update", this);
    }

    private _handleUpdatingStateChangeFromRpcUpdate(args: any) {
        const newUpdatingState: RpcRemoteSubplebbit["updatingState"] = args.params.result; // we're being optimistic that RPC server sent an appropiate updating state string

        this._setUpdatingState(newUpdatingState);
        this._updateRpcClientStateFromUpdatingState(newUpdatingState);
    }

    override async update() {
        const log = Logger("plebbit-js:rpc-remote-subplebbit:update");

        if (this.state !== "stopped" || this._updateRpcSubscriptionId) return; // No need to do anything if subplebbit is already updating

        try {
            this._updateRpcSubscriptionId = await this._plebbit.plebbitRpcClient!.subplebbitUpdateSubscribe(this.address);
            this._setState("updating");
        } catch (e) {
            log.error("Failed to receive subplebbitUpdate from RPC due to error", e);
            this._setState("stopped");
            this._setUpdatingState("failed");
            throw e;
        }
        this._plebbit
            .plebbitRpcClient!.getSubscription(this._updateRpcSubscriptionId)
            .on("update", this._processUpdateEventFromRpcUpdate.bind(this))
            .on("updatingstatechange", this._handleUpdatingStateChangeFromRpcUpdate.bind(this))
            .on("error", (args) => this.emit("error", args.params.result)); // zod here

        this._plebbit.plebbitRpcClient!.emitAllPendingMessages(this._updateRpcSubscriptionId);
    }

    override async stop() {
        const log = Logger("plebbit-js:rpc-remote-subplebbit:stop");
        if (this.state !== "updating") throw Error("User call rpcRemoteSubplebbit.stop() without updating first");

        if (!this._updateRpcSubscriptionId) throw Error("rpcRemoteSub.state is updating but no subscription id");
        await this._plebbit.plebbitRpcClient!.unsubscribe(this._updateRpcSubscriptionId);
        this._setRpcClientState("stopped");
        this._updateRpcSubscriptionId = undefined;
        log.trace(`Stopped the update of remote subplebbit (${this.address}) via RPC`);
        this._setUpdatingState("stopped");
        this._setState("stopped");
    }
}
