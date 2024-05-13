import Logger from "@plebbit/plebbit-logger";
import { decodePubsubMsgFromRpc, replaceXWithY } from "../util.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
import { messages } from "../errors.js";
import * as remeda from "remeda"; // tree-shaking supported!
import { PlebbitError } from "../plebbit-error.js";
// This class is for subs that are running and publishing, over RPC. Can be used for both browser and node
export class RpcLocalSubplebbit extends RpcRemoteSubplebbit {
    constructor(plebbit) {
        super(plebbit);
        this.started = false;
        this._setStartedState("stopped");
    }
    toJSON() {
        return {
            ...this.toJSONInternalRpc(),
            posts: this.posts.toJSON(),
            shortAddress: this.shortAddress
        };
    }
    toJSONInternalRpc() {
        return {
            ...this.toJSONIpfs(),
            settings: this.settings,
            _usingDefaultChallenge: this._usingDefaultChallenge,
            started: this.started,
            signer: this.signer
        };
    }
    async initRpcInternalSubplebbitNoMerge(newProps) {
        await super.initRemoteSubplebbitPropsNoMerge(newProps);
        this.settings = newProps.settings;
        this._usingDefaultChallenge = newProps._usingDefaultChallenge;
        this.started = newProps.started;
        this.signer = newProps.signer;
    }
    async _handleRpcUpdateProps(rpcProps) {
        await this.initRpcInternalSubplebbitNoMerge(rpcProps);
    }
    _setStartedState(newState) {
        if (newState === this.startedState)
            return;
        this.startedState = newState;
        this.emit("startedstatechange", this.startedState);
    }
    _updateRpcClientStateFromStartedState(startedState) {
        const mapper = {
            failed: ["stopped"],
            "publishing-ipns": ["publishing-ipns"],
            stopped: ["stopped"],
            succeeded: ["stopped"]
        };
        mapper[startedState].forEach(this._setRpcClientState.bind(this));
    }
    async start() {
        const log = Logger("plebbit-js:rpc-local-subplebbit:start");
        // we can't start the same instance multiple times
        if (typeof this._startRpcSubscriptionId === "number")
            throw new PlebbitError("ERR_SUB_ALREADY_STARTED", { subplebbitAddress: this.address });
        try {
            this._startRpcSubscriptionId = await this.plebbit.plebbitRpcClient.startSubplebbit(this.address);
            this._setState("started");
        }
        catch (e) {
            log.error(`Failed to start subplebbit (${this.address}) from RPC due to error`, e);
            this._setState("stopped");
            this._setStartedState("failed");
            throw e;
        }
        this.started = true;
        this.plebbit
            .plebbitRpcClient.getSubscription(this._startRpcSubscriptionId)
            .on("update", async (updateProps) => {
            log(`Received update event from startSubplebbit (${this.address}) from RPC (${this.plebbit.plebbitRpcClientsOptions[0]})`);
            const newRpcRecord = updateProps.params.result;
            await this._handleRpcUpdateProps(newRpcRecord);
            this.emit("update", this);
        })
            .on("startedstatechange", (args) => {
            const newStartedState = args.params.result;
            this._setStartedState(newStartedState);
            this._updateRpcClientStateFromStartedState(newStartedState);
        })
            .on("challengerequest", (args) => {
            const request = args.params.result;
            this._setRpcClientState("waiting-challenge-requests");
            this.emit("challengerequest", decodePubsubMsgFromRpc(request));
        })
            .on("challenge", (args) => {
            this._setRpcClientState("publishing-challenge");
            const challenge = args.params.result;
            this.emit("challenge", decodePubsubMsgFromRpc(challenge));
            this._setRpcClientState("waiting-challenge-answers");
        })
            .on("challengeanswer", (args) => {
            const challengeAnswer = args.params.result;
            this.emit("challengeanswer", decodePubsubMsgFromRpc(challengeAnswer));
        })
            .on("challengeverification", (args) => {
            const challengeVerification = args.params.result;
            this._setRpcClientState("publishing-challenge-verification");
            this.emit("challengeverification", decodePubsubMsgFromRpc(challengeVerification));
            this._setRpcClientState("waiting-challenge-requests");
        })
            .on("error", (args) => this.emit("error", args.params.result));
        this.plebbit.plebbitRpcClient.emitAllPendingMessages(this._startRpcSubscriptionId);
    }
    async stop() {
        if (this.state === "updating") {
            return super.stop();
        }
        else if (this.state === "started") {
            // Need to be careful not to stop an already running sub
            const log = Logger("plebbit-js:rpc-local-subplebbit:stop");
            try {
                await this.plebbit.plebbitRpcClient.stopSubplebbit(this.address);
            }
            catch (e) {
                if (e instanceof Error && e.message !== messages.ERR_RPC_CLIENT_TRYING_TO_STOP_SUB_THAT_IS_NOT_RUNNING)
                    throw e;
            }
            if (!this._startRpcSubscriptionId)
                throw Error("rpcLocalSub.state is started but has no subscription ID");
            await this.plebbit.plebbitRpcClient.unsubscribe(this._startRpcSubscriptionId);
            this._setStartedState("stopped");
            this._setRpcClientState("stopped");
            this.started = false;
            this._startRpcSubscriptionId = undefined;
            log(`Stopped the running of local subplebbit (${this.address}) via RPC`);
            this._setState("stopped");
        }
        else
            throw Error("User called rpcLocalSub.stop() without updating or starting");
    }
    async edit(newSubplebbitOptions) {
        // Right now if a sub owner passes settings.challenges = undefined or null, it will be explicitly changed to []
        // settings.challenges = [] means sub has no challenges
        if (remeda.isPlainObject(newSubplebbitOptions.settings) && "challenges" in newSubplebbitOptions.settings)
            newSubplebbitOptions.settings.challenges =
                newSubplebbitOptions.settings.challenges === undefined || newSubplebbitOptions.settings.challenges === null
                    ? []
                    : newSubplebbitOptions.settings.challenges;
        const optionsParsed = replaceXWithY(newSubplebbitOptions, undefined, null);
        const newProps = await this.plebbit.plebbitRpcClient.editSubplebbit(this.address, optionsParsed);
        await this._handleRpcUpdateProps(newProps);
        return this;
    }
    async update() {
        if (this.state === "started")
            return;
        else
            return super.update();
    }
    async delete() {
        // Make sure to stop updating or starting first
        if (this.state === "started") {
            if (!this._startRpcSubscriptionId)
                throw Error("rpcLocalSub.state has started state but without subscription id");
            await this.plebbit.plebbitRpcClient.unsubscribe(this._startRpcSubscriptionId);
            this._startRpcSubscriptionId = undefined;
            this._setStartedState("stopped");
        }
        else if (this.state === "updating")
            await super.stop(); // will take care of unsubscribing to subplebbitUpdate
        await this.plebbit.plebbitRpcClient.deleteSubplebbit(this.address);
        this.started = false;
        this._setRpcClientState("stopped");
        this._setState("stopped");
    }
}
//# sourceMappingURL=rpc-local-subplebbit.js.map