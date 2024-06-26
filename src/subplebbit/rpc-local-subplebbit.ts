import Logger from "@plebbit/plebbit-logger";
import { decodePubsubMsgFromRpc, replaceXWithY } from "../util.js";
import type { InternalSubplebbitRpcType, LocalSubplebbitJsonType, LocalSubplebbitRpcJsonType, SubplebbitEditOptions } from "./types.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
import {
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeMessageType,
    DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    DecryptedChallengeVerificationMessageType,
    EncodedDecryptedChallengeAnswerMessageType,
    EncodedDecryptedChallengeMessageType,
    EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    EncodedDecryptedChallengeVerificationMessageType
} from "../types.js";
import { messages } from "../errors.js";
import { Plebbit } from "../plebbit.js";
import * as remeda from "remeda"; // tree-shaking supported!
import { PlebbitError } from "../plebbit-error.js";

// This class is for subs that are running and publishing, over RPC. Can be used for both browser and node
export class RpcLocalSubplebbit extends RpcRemoteSubplebbit {
    started: boolean; // Is the sub started and running? This is not specific to this instance, and applies to all instances of sub with this address
    private _startRpcSubscriptionId?: number;
    protected _usingDefaultChallenge!: InternalSubplebbitRpcType["_usingDefaultChallenge"];
    startedState!: "stopped" | "publishing-ipns" | "failed" | "succeeded";
    signer!: InternalSubplebbitRpcType["signer"];
    settings?: InternalSubplebbitRpcType["settings"];

    constructor(plebbit: Plebbit) {
        super(plebbit);
        this.started = false;
        this._setStartedState("stopped");
    }

    override toJSON(): LocalSubplebbitJsonType | LocalSubplebbitRpcJsonType {
        return {
            ...this.toJSONInternalRpc(),
            posts: this.posts.toJSON(),
            shortAddress: this.shortAddress
        };
    }

    toJSONInternalRpc(): InternalSubplebbitRpcType {
        return {
            ...this.toJSONIpfs(),
            settings: this.settings,
            _usingDefaultChallenge: this._usingDefaultChallenge,
            started: this.started,
            signer: this.signer
        };
    }

    async initRpcInternalSubplebbitNoMerge(newProps: InternalSubplebbitRpcType) {
        await super.initRemoteSubplebbitPropsNoMerge(newProps);
        this.settings = newProps.settings;
        this._usingDefaultChallenge = newProps._usingDefaultChallenge;
        this.started = newProps.started;
        this.signer = newProps.signer;
    }

    protected override async _handleRpcUpdateProps(rpcProps: InternalSubplebbitRpcType) {
        await this.initRpcInternalSubplebbitNoMerge(rpcProps);
    }

    protected _setStartedState(newState: RpcLocalSubplebbit["startedState"]) {
        if (newState === this.startedState) return;
        this.startedState = newState;
        this.emit("startedstatechange", this.startedState);
    }

    protected _updateRpcClientStateFromStartedState(startedState: RpcLocalSubplebbit["startedState"]) {
        const mapper: Record<RpcLocalSubplebbit["startedState"], RpcLocalSubplebbit["clients"]["plebbitRpcClients"][0]["state"][]> = {
            failed: ["stopped"],
            "publishing-ipns": ["publishing-ipns"],
            stopped: ["stopped"],
            succeeded: ["stopped"]
        };

        mapper[startedState].forEach(this._setRpcClientState.bind(this));
    }

    override async start() {
        const log = Logger("plebbit-js:rpc-local-subplebbit:start");
        // we can't start the same instance multiple times
        if (typeof this._startRpcSubscriptionId === "number")
            throw new PlebbitError("ERR_SUB_ALREADY_STARTED", { subplebbitAddress: this.address });

        try {
            this._startRpcSubscriptionId = await this.plebbit.plebbitRpcClient!.startSubplebbit(this.address);
            this._setState("started");
        } catch (e) {
            log.error(`Failed to start subplebbit (${this.address}) from RPC due to error`, e);
            this._setState("stopped");
            this._setStartedState("failed");
            throw e;
        }
        this.started = true;
        this.plebbit
            .plebbitRpcClient!.getSubscription(this._startRpcSubscriptionId)
            .on("update", async (updateProps) => {
                log(`Received update event from startSubplebbit (${this.address}) from RPC (${this.plebbit.plebbitRpcClientsOptions![0]})`);
                const newRpcRecord = <InternalSubplebbitRpcType>updateProps.params.result;
                // zod here
                await this._handleRpcUpdateProps(newRpcRecord);
                this.emit("update", this);
                if (!newRpcRecord.started) {
                    // This is the rpc server telling us that this sub has been stopped by another instance
                    await this._cleanUpRpcConnection(log);
                }
            })
            .on("startedstatechange", (args) => {
                const newStartedState = <RpcLocalSubplebbit["startedState"]>args.params.result;
                // zod here
                this._setStartedState(newStartedState);
                this._updateRpcClientStateFromStartedState(newStartedState);
            })
            .on("challengerequest", (args) => {
                const request = <EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>args.params.result;
                // zod here
                this._setRpcClientState("waiting-challenge-requests");
                this.emit("challengerequest", <DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor>decodePubsubMsgFromRpc(request));
            })
            .on("challenge", (args) => {
                this._setRpcClientState("publishing-challenge");
                const challenge = <EncodedDecryptedChallengeMessageType>args.params.result;
                // zod here
                this.emit("challenge", <DecryptedChallengeMessageType>decodePubsubMsgFromRpc(challenge));
                this._setRpcClientState("waiting-challenge-answers");
            })
            .on("challengeanswer", (args) => {
                // zod here
                const challengeAnswer = <EncodedDecryptedChallengeAnswerMessageType>args.params.result;
                this.emit("challengeanswer", <DecryptedChallengeAnswerMessageType>decodePubsubMsgFromRpc(challengeAnswer));
            })
            .on("challengeverification", (args) => {
                const challengeVerification = <EncodedDecryptedChallengeVerificationMessageType>args.params.result;
                // zod here
                this._setRpcClientState("publishing-challenge-verification");
                this.emit(
                    "challengeverification",
                    <DecryptedChallengeVerificationMessageType>decodePubsubMsgFromRpc(challengeVerification)
                );
                this._setRpcClientState("waiting-challenge-requests");
            })

            .on("error", (args) => this.emit("error", args.params.result));

        this.plebbit.plebbitRpcClient!.emitAllPendingMessages(this._startRpcSubscriptionId);
    }

    private async _cleanUpRpcConnection(log: Logger) {
        if (this._startRpcSubscriptionId) await this.plebbit.plebbitRpcClient!.unsubscribe(this._startRpcSubscriptionId);
        this._setStartedState("stopped");
        this._setRpcClientState("stopped");
        this.started = false;
        this._startRpcSubscriptionId = undefined;
        log(`Stopped the running of local subplebbit (${this.address}) via RPC`);
        this._setState("stopped");
    }

    override async stop() {
        if (this.state === "updating") {
            return super.stop();
        } else if (this.state === "started") {
            // Need to be careful not to stop an already running sub
            const log = Logger("plebbit-js:rpc-local-subplebbit:stop");
            try {
                await this.plebbit.plebbitRpcClient!.stopSubplebbit(this.address);
            } catch (e) {
                if (e instanceof Error && e.message !== messages.ERR_RPC_CLIENT_TRYING_TO_STOP_SUB_THAT_IS_NOT_RUNNING) throw e;
            }
            await this._cleanUpRpcConnection(log);
        } else throw Error("User called rpcLocalSub.stop() without updating or starting");
    }

    override async edit(newSubplebbitOptions: SubplebbitEditOptions) {
        // zod here
        // Right now if a sub owner passes settings.challenges = undefined or null, it will be explicitly changed to []
        // settings.challenges = [] means sub has no challenges
        if (remeda.isPlainObject(newSubplebbitOptions.settings) && "challenges" in newSubplebbitOptions.settings)
            newSubplebbitOptions.settings.challenges =
                newSubplebbitOptions.settings.challenges === undefined || newSubplebbitOptions.settings.challenges === null
                    ? []
                    : newSubplebbitOptions.settings.challenges;

        const optionsParsed = <SubplebbitEditOptions>replaceXWithY(newSubplebbitOptions, undefined, null);
        const newProps = await this.plebbit.plebbitRpcClient!.editSubplebbit(this.address, optionsParsed);
        await this._handleRpcUpdateProps(newProps);
        return this;
    }

    override async update() {
        if (this.state === "started") return;
        else return super.update();
    }

    override async delete() {
        // Make sure to stop updating or starting first
        if (this.state === "started" || this.state === "updating") await this.stop();

        await this.plebbit.plebbitRpcClient!.deleteSubplebbit(this.address);

        this.started = false;
        this._setRpcClientState("stopped");
        this._setState("stopped");
    }
}
