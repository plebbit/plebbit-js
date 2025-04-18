import Logger from "@plebbit/plebbit-logger";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
import type { RpcRemoteSubplebbitType } from "./types.js";
import * as remeda from "remeda";
import { PlebbitError } from "../plebbit-error.js";
import { parseRpcRemoteSubplebbitUpdateEventWithPlebbitErrorIfItFails } from "../schema/schema-util.js";
import { SubplebbitEvents } from "../types.js";

export class RpcRemoteSubplebbit extends RemoteSubplebbit {
    private _updateRpcSubscriptionId?: number = undefined;
    private _updatingRpcSubInstanceWithListeners?: { subplebbit: RpcRemoteSubplebbit } & Pick<
        SubplebbitEvents,
        "error" | "updatingstatechange" | "update" | "statechange"
    > = undefined; // The plebbit._updatingSubplebbits we're subscribed to

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
            "waiting-retry": ["stopped"],
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

        this._setUpdatingStateWithEventEmissionIfNewState(newUpdatingState);
        this._updateRpcClientStateFromUpdatingState(newUpdatingState);
    }

    private async _initMirroringUpdatingSubplebbit(updatingSubplebbit: RpcRemoteSubplebbit) {
        this._updatingRpcSubInstanceWithListeners = {
            subplebbit: updatingSubplebbit,
            error: (err) => this.emit("error", err),
            updatingstatechange: (updatingState) => this._setUpdatingStateWithEventEmissionIfNewState.bind(this)(updatingState),
            update: async (updatingSubplebbit) => {
                if (updatingSubplebbit._rawSubplebbitIpfs) {
                    await this.initSubplebbitIpfsPropsNoMerge(updatingSubplebbit._rawSubplebbitIpfs);
                    this.updateCid = updatingSubplebbit.updateCid;
                    this.emit("update", this);
                }
            },
            statechange: async (newState) => {
                if (newState === "stopped")
                    // plebbit._updatingSubplebbits[address].stop() has been called, we need to clean up the subscription
                    await this.stop();
            }
        };

        this._updatingRpcSubInstanceWithListeners.subplebbit.on("update", this._updatingRpcSubInstanceWithListeners.update);
        this._updatingRpcSubInstanceWithListeners.subplebbit.on(
            "updatingstatechange",
            this._updatingRpcSubInstanceWithListeners.updatingstatechange
        );
        this._updatingRpcSubInstanceWithListeners.subplebbit.on("error", this._updatingRpcSubInstanceWithListeners.error);
        this._updatingRpcSubInstanceWithListeners.subplebbit.on("statechange", this._updatingRpcSubInstanceWithListeners.statechange);

        const clientKeys = remeda.keys.strict(this.clients);

        for (const clientType of clientKeys)
            if (updatingSubplebbit.clients[clientType])
                for (const clientUrl of Object.keys(updatingSubplebbit.clients[clientType]))
                    if (clientType !== "chainProviders")
                        this.clients[clientType][clientUrl].mirror(updatingSubplebbit.clients[clientType][clientUrl]);
                    else {
                        for (const clientDeeperUrl of remeda.keys.strict(updatingSubplebbit.clients[clientType]))
                            this.clients[clientType][clientUrl][clientDeeperUrl].mirror(
                                updatingSubplebbit.clients[clientType][clientUrl][clientDeeperUrl]
                            );
                    }

        if (updatingSubplebbit._rawSubplebbitIpfs) {
            await this.initSubplebbitIpfsPropsNoMerge(updatingSubplebbit._rawSubplebbitIpfs);
            this.updateCid = updatingSubplebbit.updateCid;
            this.emit("update", this);
        }
    }

    async _initRpcUpdateSubscription() {
        const log = Logger("plebbit-js:rpc-remote-subplebbit:_initRpcUpdateSubscription");
        this._setState("updating");
        try {
            this._updateRpcSubscriptionId = await this._plebbit._plebbitRpcClient!.subplebbitUpdateSubscribe(this.address);
        } catch (e) {
            log.error("Failed to receive subplebbitUpdate from RPC due to error", e);
            this._setState("stopped");
            this._setUpdatingStateWithEventEmissionIfNewState("failed");
            throw e;
        }
        this._plebbit
            ._plebbitRpcClient!.getSubscription(this._updateRpcSubscriptionId)
            .on("update", this._processUpdateEventFromRpcUpdate.bind(this))
            .on("updatingstatechange", this._handleUpdatingStateChangeFromRpcUpdate.bind(this))
            .on("error", (args) => this.emit("error", args.params.result));

        this._plebbit._plebbitRpcClient!.emitAllPendingMessages(this._updateRpcSubscriptionId);
    }

    async _createAndSubscribeToNewUpdatingSubplebbit() {
        const log = Logger("plebbit-js:rpc-remote-subplebbit:_createNewUpdatingSubplebbit");
        const updatingSub = (await this._plebbit.createSubplebbit({ address: this.address })) as RpcRemoteSubplebbit;
        this._plebbit._updatingSubplebbits[this.address] = updatingSub;
        log("Creating a new entry for this._plebbit._updatingSubplebbits", this.address);

        const updatingSubRemoveListenerListener = async (eventName: string, listener: Function) => {
            const count = updatingSub.listenerCount("update");

            if (count === 0) {
                log.trace(`cleaning up plebbit._updatingSubplebbits`, this.address, "There are no subplebbits using it for updates");
                await cleanUpUpdatingSubInstance();
            }
        };

        const cleanUpUpdatingSubInstance = async () => {
            updatingSub.removeListener("removeListener", updatingSubRemoveListenerListener);
            if (updatingSub.state === "updating") await updatingSub.stop();
        };

        updatingSub.on("removeListener", updatingSubRemoveListenerListener);

        await updatingSub._initRpcUpdateSubscription();
        await this._initMirroringUpdatingSubplebbit(updatingSub);
    }

    override async update() {
        const log = Logger("plebbit-js:rpc-remote-subplebbit:update");

        if (this.state !== "stopped") return; // No need to do anything if subplebbit is already updating
        this._setState("updating");
        try {
            if (this._plebbit._updatingSubplebbits[this.address]) {
                await this._initMirroringUpdatingSubplebbit(this._plebbit._updatingSubplebbits[this.address] as RpcRemoteSubplebbit);
                return;
            } else {
                // creating a new entry in plebbit._updatingSubplebbits
                // poll updates from RPC
                await this._createAndSubscribeToNewUpdatingSubplebbit();
            }
        } catch (e) {
            await this.stop();
            throw e;
        }
    }

    private async _cleanupMirroringUpdatingSubplebbit() {
        if (!this._updatingRpcSubInstanceWithListeners)
            throw Error("rpcRemoteSubplebbit.state is updating but no mirroring updating subplebbit");
        this._updatingRpcSubInstanceWithListeners.subplebbit.removeListener("update", this._updatingRpcSubInstanceWithListeners.update);
        this._updatingRpcSubInstanceWithListeners.subplebbit.removeListener(
            "updatingstatechange",
            this._updatingRpcSubInstanceWithListeners.updatingstatechange
        );
        this._updatingRpcSubInstanceWithListeners.subplebbit.removeListener("error", this._updatingRpcSubInstanceWithListeners.error);
        this._updatingRpcSubInstanceWithListeners.subplebbit.removeListener(
            "statechange",
            this._updatingRpcSubInstanceWithListeners.statechange
        );

        const clientKeys = remeda.keys.strict(this.clients);

        for (const clientType of clientKeys)
            if (this.clients[clientType])
                for (const clientUrl of Object.keys(this.clients[clientType]))
                    if (clientType !== "chainProviders") this.clients[clientType][clientUrl].unmirror();
                    else
                        for (const clientDeeperUrl of remeda.keys.strict(this.clients[clientType]))
                            this.clients[clientType][clientUrl][clientDeeperUrl].unmirror();

        this._updatingRpcSubInstanceWithListeners = undefined;
    }

    override async stop() {
        const log = Logger("plebbit-js:rpc-remote-subplebbit:stop");
        if (this.state !== "updating") throw new PlebbitError("ERR_CALLED_SUBPLEBBIT_STOP_WITHOUT_UPDATE", { address: this.address });

        if (this._updatingRpcSubInstanceWithListeners) {
            await this._cleanupMirroringUpdatingSubplebbit();
        } else if (this._updateRpcSubscriptionId) {
            try {
                await this._plebbit._plebbitRpcClient!.unsubscribe(this._updateRpcSubscriptionId);
            } catch (e) {
                log.error("Failed to unsubscribe from subplebbitUpdate", e);
            }
            this._updateRpcSubscriptionId = undefined;
            log.trace(`Stopped the update of remote subplebbit (${this.address}) via RPC`);
            delete this._plebbit._updatingSubplebbits[this.address];
        }
        this._setRpcClientState("stopped");
        this._setUpdatingStateWithEventEmissionIfNewState("stopped");
        this._setState("stopped");
        this.posts._stop();
    }
}
