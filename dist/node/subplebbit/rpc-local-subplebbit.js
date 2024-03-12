import Logger from "@plebbit/plebbit-logger";
import { decodePubsubMsgFromRpc, replaceXWithY } from "../util.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
import { messages } from "../errors.js";
// This class is for subs that are running and publishing, over RPC. Can be used for both browser and node
export class RpcLocalSubplebbit extends RpcRemoteSubplebbit {
    toJSONInternalRpc() {
        return {
            ...this.toJSONIpfs(),
            settings: this.settings,
            _usingDefaultChallenge: this._usingDefaultChallenge,
            startedState: this.startedState
        };
    }
    async initRpcInternalSubplebbit(newProps) {
        const mergedProps = { ...this.toJSONInternalRpc(), ...newProps };
        await super.initRemoteSubplebbitProps(newProps);
        this.settings = mergedProps.settings;
        // only use startedState from local state if we're not getting updates from rpc
        if (!this._startRpcSubscriptionId)
            this._setStartedState(mergedProps.startedState);
        this._usingDefaultChallenge = mergedProps._usingDefaultChallenge;
    }
    async _handleRpcUpdateProps(rpcProps) {
        await this.initRpcInternalSubplebbit(rpcProps);
    }
    async start() {
        const log = Logger("plebbit-js:rpc-local-subplebbit:start");
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
        this.plebbit.plebbitRpcClient
            .getSubscription(this._startRpcSubscriptionId)
            .on("update", async (updateProps) => {
            log(`Received new subplebbitUpdate from RPC (${this.plebbit.plebbitRpcClientsOptions[0]})`);
            const newRpcRecord = updateProps.params.result;
            await this.initRpcInternalSubplebbit(newRpcRecord);
            this.emit("update", this);
        })
            .on("startedstatechange", (args) => {
            const newStartedState = args.params.result;
            this._setStartedState(newStartedState);
            this._updateRpcClientStateFromStartedState(newStartedState);
        })
            .on("challengerequest", (args) => {
            this._setRpcClientState("waiting-challenge-requests");
            this.emit("challengerequest", decodePubsubMsgFromRpc(args.params.result));
        })
            .on("challenge", (args) => {
            this._setRpcClientState("publishing-challenge");
            this.emit("challenge", decodePubsubMsgFromRpc(args.params.result));
            this._setRpcClientState("waiting-challenge-answers");
        })
            .on("challengeanswer", (args) => {
            this.emit("challengeanswer", decodePubsubMsgFromRpc(args.params.result));
        })
            .on("challengeverification", (args) => {
            this._setRpcClientState("publishing-challenge-verification");
            this.emit("challengeverification", decodePubsubMsgFromRpc(args.params.result));
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
            const log = Logger("plebbit-js:rpc-local-subplebbit:stop");
            try {
                await this.plebbit.plebbitRpcClient.stopSubplebbit(this.address);
            }
            catch (e) {
                if (e.message !== messages.ERR_RPC_CLIENT_TRYING_TO_STOP_SUB_THAT_IS_NOT_RUNNING)
                    throw e;
                log(e);
            }
            if (this._startRpcSubscriptionId)
                await this.plebbit.plebbitRpcClient.unsubscribe(this._startRpcSubscriptionId);
            this._setStartedState("stopped");
            this._setRpcClientState("stopped");
            this._startRpcSubscriptionId = undefined;
            log(`Stopped the running of local subplebbit (${this.address}) via RPC`);
            this._setState("stopped");
        }
    }
    async edit(newSubplebbitOptions) {
        // Right now if a sub owner passes settings.challenges = undefined or null, it will be explicitly changed to []
        // settings.challenges = [] means sub has no challenges
        if (newSubplebbitOptions.hasOwnProperty("settings") && newSubplebbitOptions.settings.hasOwnProperty("challenges"))
            newSubplebbitOptions.settings.challenges =
                newSubplebbitOptions.settings.challenges === undefined || newSubplebbitOptions.settings.challenges === null
                    ? []
                    : newSubplebbitOptions.settings.challenges;
        const optionsParsed = replaceXWithY(newSubplebbitOptions, undefined, null);
        const newProps = await this.plebbit.plebbitRpcClient.editSubplebbit(this.address, optionsParsed);
        await this.initRpcInternalSubplebbit(newProps);
        return this;
    }
    async update() {
        if (this.state === "started")
            return;
        else
            return super.update();
    }
    async delete() {
        if (this._startRpcSubscriptionId) {
            await this.plebbit.plebbitRpcClient.unsubscribe(this._startRpcSubscriptionId);
            this._startRpcSubscriptionId = undefined;
            this._setStartedState("stopped");
        }
        if (this.state === "updating")
            await super.stop();
        await this.plebbit.plebbitRpcClient.deleteSubplebbit(this.address);
        this._setRpcClientState("stopped");
        this._setState("stopped");
    }
}
//# sourceMappingURL=rpc-local-subplebbit.js.map