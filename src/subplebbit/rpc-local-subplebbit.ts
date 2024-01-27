import Logger from "@plebbit/plebbit-logger";
import { decodePubsubMsgFromRpc, replaceXWithY } from "../util";
import { InternalSubplebbitRpcType, SubplebbitEditOptions, SubplebbitSettings } from "./types";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit";
import {
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeMessageType,
    DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor
} from "../types";
import { RemoteSubplebbit } from "./remote-subplebbit";

// This class is for subs that are running and publishing, over RPC. Can be used for both browser and node
export class RpcLocalSubplebbit extends RpcRemoteSubplebbit {
    private _startRpcSubscriptionId?: number;
    protected _usingDefaultChallenge: InternalSubplebbitRpcType["_usingDefaultChallenge"];
    settings?: SubplebbitSettings;

    toJSONInternalRpc(): InternalSubplebbitRpcType {
        return {
            ...this.toJSONIpfs(),
            settings: this.settings,
            _usingDefaultChallenge: this._usingDefaultChallenge,
            startedState: this.startedState
        };
    }

    async initRpcInternalSubplebbit(newProps: Partial<InternalSubplebbitRpcType>) {
        const mergedProps = { ...this.toJSONInternalRpc(), newProps };
        await super.initRemoteSubplebbitProps(newProps);
        this.settings = mergedProps.settings;
        this._setStartedState(mergedProps.startedState);
        this._usingDefaultChallenge = mergedProps._usingDefaultChallenge;
    }

    async start() {
        const log = Logger("plebbit-js:rpc-local-subplebbit:start");
        try {
            this._startRpcSubscriptionId = await this.plebbit.plebbitRpcClient.startSubplebbit(this.address);
            this._setState("started");
        } catch (e) {
            log.error(`Failed to start subplebbit (${this.address}) from RPC due to error`, e);
            this._setState("stopped");
            this._setStartedState("failed");
            throw e;
        }
        this.plebbit.plebbitRpcClient
            .getSubscription(this._startRpcSubscriptionId)
            .on("update", async (updateProps) => {
                log(`Received new subplebbitUpdate from RPC (${this.plebbit.plebbitRpcClientsOptions[0]})`);
                const newRpcRecord = <InternalSubplebbitRpcType>updateProps.params.result;
                await this.initRpcInternalSubplebbit(newRpcRecord);
                this.emit("update", this);
            })
            .on("startedstatechange", (args) => {
                const newStartedState: RemoteSubplebbit["startedState"] = args.params.result;
                this._setStartedState(newStartedState);
                this._updateRpcClientStateFromStartedState(newStartedState);
            })
            .on("challengerequest", (args) => {
                this._setRpcClientState("waiting-challenge-requests");
                this.emit(
                    "challengerequest",
                    <DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>decodePubsubMsgFromRpc(args.params.result)
                );
            })
            .on("challenge", (args) => {
                this._setRpcClientState("publishing-challenge");
                this.emit("challenge", <DecryptedChallengeMessageType>decodePubsubMsgFromRpc(args.params.result));
                this._setRpcClientState("waiting-challenge-answers");
            })
            .on("challengeanswer", (args) => {
                this.emit("challengeanswer", <DecryptedChallengeAnswerMessageType>decodePubsubMsgFromRpc(args.params.result));
            })
            .on("challengeverification", (args) => {
                this._setRpcClientState("publishing-challenge-verification");
                this.emit(
                    "challengeverification",
                    <DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor>decodePubsubMsgFromRpc(args.params.result)
                );
                this._setRpcClientState("waiting-challenge-requests");
            })

            .on("error", (args) => this.emit("error", args.params.result));

        this.plebbit.plebbitRpcClient.emitAllPendingMessages(this._startRpcSubscriptionId);
    }

    async stop() {
        if (this.state === "updating") {
            return super.stop();
        } else if (this.state === "started") {
            const log = Logger("plebbit-js:rpc-local-subplebbit:stop");
            await this.plebbit.plebbitRpcClient.stopSubplebbit(this.address);
            await this.plebbit.plebbitRpcClient.unsubscribe(this._startRpcSubscriptionId);
            this._setStartedState("stopped");
            this._setRpcClientState("stopped");
            this._startRpcSubscriptionId = undefined;
            log(`Stopped the running of local subplebbit (${this.address}) via RPC`);
            this._setState("stopped");
        }
    }

    async edit(newSubplebbitOptions: SubplebbitEditOptions) {
        // Right now if a sub owner passes settings.challenges = undefined or null, it will be explicitly changed to []
        // settings.challenges = [] means sub has no challenges
        if (newSubplebbitOptions.hasOwnProperty("settings") && newSubplebbitOptions.settings.hasOwnProperty("challenges"))
            newSubplebbitOptions.settings.challenges =
                newSubplebbitOptions.settings.challenges === undefined || newSubplebbitOptions.settings.challenges === null
                    ? []
                    : newSubplebbitOptions.settings.challenges;

        const optionsParsed = <SubplebbitEditOptions>replaceXWithY(newSubplebbitOptions, undefined, null);
        const newProps = await this.plebbit.plebbitRpcClient.editSubplebbit(this.address, optionsParsed);
        await this.initRpcInternalSubplebbit(newProps);
        return this;
    }

    async update() {
        if (this.state === "started") return;
        else return super.update();
    }

    async delete() {
        await this.stop();
        await this.plebbit.plebbitRpcClient.deleteSubplebbit(this.address);
    }
}
