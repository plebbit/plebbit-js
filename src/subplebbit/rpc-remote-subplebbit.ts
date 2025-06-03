import Logger from "@plebbit/plebbit-logger";
import { RemoteSubplebbit } from "./remote-subplebbit.js";
import type { RpcRemoteSubplebbitType, SubplebbitEvents, SubplebbitRpcErrorToTransmit } from "./types.js";
import * as remeda from "remeda";
import { PlebbitError } from "../plebbit-error.js";
import { parseRpcRemoteSubplebbitUpdateEventWithPlebbitErrorIfItFails } from "../schema/schema-util.js";
import { RpcLocalSubplebbit } from "./rpc-local-subplebbit.js";

export class RpcRemoteSubplebbit extends RemoteSubplebbit {
    private _updateRpcSubscriptionId?: number = undefined;
    private _updatingRpcSubInstanceWithListeners?: { subplebbit: RpcRemoteSubplebbit | RpcLocalSubplebbit } & Pick<
        SubplebbitEvents,
        | "error"
        | "updatingstatechange"
        | "startedstatechange"
        | "update"
        | "statechange"
        | "challengerequest"
        | "challengeverification"
        | "challengeanswer"
        | "challenge"
    > = undefined; // The plebbit._updatingSubplebbits we're subscribed to

    protected _setRpcClientState(newState: RemoteSubplebbit["clients"]["plebbitRpcClients"][""]["state"]) {
        const currentRpcUrl = remeda.keys.strict(this.clients.plebbitRpcClients)[0];
        const currentState = this.clients.plebbitRpcClients[currentRpcUrl].state;
        if (newState === currentState) return;
        this.clients.plebbitRpcClients[currentRpcUrl].state = newState;
        this.clients.plebbitRpcClients[currentRpcUrl].emit("statechange", newState);
    }

    override get updatingState(): RemoteSubplebbit["updatingState"] {
        if (this._updatingRpcSubInstanceWithListeners) {
            return this._updatingRpcSubInstanceWithListeners.subplebbit.updatingState;
        } else return this._updatingState;
    }

    protected _setStartedStateNoEmission(newState: RpcLocalSubplebbit["startedState"]) {
        if (newState === this.startedState) return;
        this.startedState = newState;
    }

    protected _setStartedStateWithEmission(newState: RpcLocalSubplebbit["startedState"]) {
        if (newState === this.startedState) return;
        this.startedState = newState;
        this.emit("startedstatechange", this.startedState);
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

    protected _processUpdateEventFromRpcUpdate(args: any) {
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

        this.initSubplebbitIpfsPropsNoMerge(updateRecord.subplebbit);
        this.updateCid = updateRecord.updateCid;

        if (updateRecord.updatingState) this._setUpdatingStateNoEmission(updateRecord.updatingState);

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
            update: (updatingSubplebbit) => {
                if (updatingSubplebbit.raw.subplebbitIpfs) {
                    this.initSubplebbitIpfsPropsNoMerge(updatingSubplebbit.raw.subplebbitIpfs);
                    this.updateCid = updatingSubplebbit.updateCid;
                    this.emit("update", this);
                }
            },
            statechange: async (newState) => {
                if (newState === "stopped" && this.state !== "stopped")
                    // plebbit._updatingSubplebbits[address].stop() has been called, we need to clean up the subscription
                    // or plebbit._startedSubplebbits[address].stop has been called
                    await this.stop();
            },
            challengerequest: (challengeRequest) => this.emit("challengerequest", challengeRequest),
            challengeverification: (challengeVerification) => this.emit("challengeverification", challengeVerification),
            challengeanswer: (challengeAnswer) => this.emit("challengeanswer", challengeAnswer),
            challenge: (challenge) => this.emit("challenge", challenge),
            startedstatechange: (startedState) => this._setStartedStateWithEmission.bind(this)(startedState)
        };

        this._updatingRpcSubInstanceWithListeners.subplebbit.on("update", this._updatingRpcSubInstanceWithListeners.update);
        this._updatingRpcSubInstanceWithListeners.subplebbit.on(
            "updatingstatechange",
            this._updatingRpcSubInstanceWithListeners.updatingstatechange
        );
        this._updatingRpcSubInstanceWithListeners.subplebbit.on("error", this._updatingRpcSubInstanceWithListeners.error);
        this._updatingRpcSubInstanceWithListeners.subplebbit.on("statechange", this._updatingRpcSubInstanceWithListeners.statechange);
        this._updatingRpcSubInstanceWithListeners.subplebbit.on(
            "challengerequest",
            this._updatingRpcSubInstanceWithListeners.challengerequest
        );
        this._updatingRpcSubInstanceWithListeners.subplebbit.on(
            "challengeverification",
            this._updatingRpcSubInstanceWithListeners.challengeverification
        );
        this._updatingRpcSubInstanceWithListeners.subplebbit.on(
            "challengeanswer",
            this._updatingRpcSubInstanceWithListeners.challengeanswer
        );
        this._updatingRpcSubInstanceWithListeners.subplebbit.on("challenge", this._updatingRpcSubInstanceWithListeners.challenge);
        this._updatingRpcSubInstanceWithListeners.subplebbit.on(
            "startedstatechange",
            this._updatingRpcSubInstanceWithListeners.startedstatechange
        );

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

        this._updatingRpcSubInstanceWithListeners.subplebbit._numOfListenersForUpdatingInstance++;
        if (updatingSubplebbit.raw.subplebbitIpfs) {
            this.initSubplebbitIpfsPropsNoMerge(updatingSubplebbit.raw.subplebbitIpfs);
            this.updateCid = updatingSubplebbit.updateCid;
            this.emit("update", this);
        }
    }

    protected _handleRpcErrorEvent(args: any) {
        const error: SubplebbitRpcErrorToTransmit = args.params.result;
        if (error.details?.newUpdatingState) this._setUpdatingStateNoEmission(error.details.newUpdatingState);
        if (error.details?.newStartedState) this._setStartedStateNoEmission(error.details.newStartedState);
        this.emit("error", error);
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
            .on("error", this._handleRpcErrorEvent.bind(this));

        this._plebbit._plebbitRpcClient!.emitAllPendingMessages(this._updateRpcSubscriptionId);
    }

    async _createAndSubscribeToNewUpdatingSubplebbit(updatingSubplebbit?: RpcRemoteSubplebbit) {
        const log = Logger("plebbit-js:rpc-remote-subplebbit:_createNewUpdatingSubplebbit");
        const updatingSub =
            updatingSubplebbit || ((await this._plebbit.createSubplebbit({ address: this.address })) as RpcRemoteSubplebbit);
        this._plebbit._updatingSubplebbits[this.address] = updatingSub;
        log("Creating a new entry for this._plebbit._updatingSubplebbits", this.address);

        if (updatingSub !== this)
            // in plebbit.createSubplebbit() this function is called with the subplebbit instance itself
            await this._initMirroringUpdatingSubplebbit(updatingSub);
        await updatingSub._initRpcUpdateSubscription();
    }

    override async update() {
        const log = Logger("plebbit-js:rpc-remote-subplebbit:update");

        if (this.state === "started") throw new PlebbitError("ERR_SUB_ALREADY_STARTED", { address: this.address });
        if (this.state !== "stopped") return; // No need to do anything if subplebbit is already updating
        this._setState("updating");
        try {
            if (this._plebbit._updatingSubplebbits[this.address]) {
                await this._initMirroringUpdatingSubplebbit(this._plebbit._updatingSubplebbits[this.address] as RpcRemoteSubplebbit);
            } else if (this._plebbit._startedSubplebbits[this.address]) {
                await this._initMirroringUpdatingSubplebbit(this._plebbit._startedSubplebbits[this.address] as RpcLocalSubplebbit);
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
        this._updatingRpcSubInstanceWithListeners.subplebbit.removeListener(
            "challengerequest",
            this._updatingRpcSubInstanceWithListeners.challengerequest
        );
        this._updatingRpcSubInstanceWithListeners.subplebbit.removeListener(
            "challengeverification",
            this._updatingRpcSubInstanceWithListeners.challengeverification
        );
        this._updatingRpcSubInstanceWithListeners.subplebbit.removeListener(
            "challengeanswer",
            this._updatingRpcSubInstanceWithListeners.challengeanswer
        );
        this._updatingRpcSubInstanceWithListeners.subplebbit.removeListener(
            "challenge",
            this._updatingRpcSubInstanceWithListeners.challenge
        );
        this._updatingRpcSubInstanceWithListeners.subplebbit.removeListener(
            "startedstatechange",
            this._updatingRpcSubInstanceWithListeners.startedstatechange
        );
        const clientKeys = remeda.keys.strict(this.clients);

        for (const clientType of clientKeys)
            if (this.clients[clientType])
                for (const clientUrl of Object.keys(this.clients[clientType]))
                    if (clientType !== "chainProviders") this.clients[clientType][clientUrl].unmirror();
                    else
                        for (const clientDeeperUrl of remeda.keys.strict(this.clients[clientType]))
                            this.clients[clientType][clientUrl][clientDeeperUrl].unmirror();
        this._updatingRpcSubInstanceWithListeners.subplebbit._numOfListenersForUpdatingInstance--;

        if (
            this._updatingRpcSubInstanceWithListeners.subplebbit._numOfListenersForUpdatingInstance === 0 &&
            this._updatingRpcSubInstanceWithListeners.subplebbit.state === "updating"
        ) {
            const log = Logger("plebbit-js:rpc-remote-subplebbit:_cleanupMirroringUpdatingSubplebbit");
            log("Cleaning up plebbit._updatingSubplebbits", this.address, "There are no subplebbits using it for updates");
            await this._updatingRpcSubInstanceWithListeners.subplebbit.stop();
        }
        this._updatingRpcSubInstanceWithListeners = undefined;
    }

    override async stop() {
        const log = Logger("plebbit-js:rpc-remote-subplebbit:stop");
        if (this.state === "stopped") return;

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
        this._setStartedStateWithEmission("stopped");
        this.posts._stop();
    }
}
