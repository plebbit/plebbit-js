import Logger from "@plebbit/plebbit-logger";
import { replaceXWithY } from "../util.js";
import type { InternalSubplebbitRpcType, LocalSubplebbitJsonType, LocalSubplebbitRpcJsonType, SubplebbitEditOptions } from "./types.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
import { z } from "zod";
import { messages } from "../errors.js";
import { Plebbit } from "../plebbit.js";
import * as remeda from "remeda"; // tree-shaking supported!
import { PlebbitError } from "../plebbit-error.js";
import { RpcInternalSubplebbitRecordSchema, StartedStateSchema, SubplebbitEditOptionsSchema } from "./schema.js";
import {
    EncodedDecryptedChallengeAnswerMessageSchema,
    EncodedDecryptedChallengeMessageSchema,
    EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthorSchema,
    EncodedDecryptedChallengeVerificationMessageSchema
} from "../rpc/src/schema.js";
import {
    decodeRpcChallengeAnswerPubsubMsg,
    decodeRpcChallengePubsubMsg,
    decodeRpcChallengeRequestPubsubMsg,
    decodeRpcChallengeVerificationPubsubMsg
} from "../clients/rpc-client/decode-rpc-response-util.js";
import { SubscriptionIdSchema } from "../clients/rpc-client/schema.js";

// This class is for subs that are running and publishing, over RPC. Can be used for both browser and node
export class RpcLocalSubplebbit extends RpcRemoteSubplebbit {
    started: boolean; // Is the sub started and running? This is not specific to this instance, and applies to all instances of sub with this address
    private _startRpcSubscriptionId?: z.infer<typeof SubscriptionIdSchema>;
    protected _usingDefaultChallenge!: InternalSubplebbitRpcType["_usingDefaultChallenge"];
    startedState!: z.infer<typeof StartedStateSchema>;
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

                const newRpcRecord = RpcInternalSubplebbitRecordSchema.parse(updateProps.params.result);
                await this._handleRpcUpdateProps(newRpcRecord);
                this.emit("update", this);
                if (!newRpcRecord.started) {
                    // This is the rpc server telling us that this sub has been stopped by another instance
                    await this._cleanUpRpcConnection(log);
                }
            })
            .on("startedstatechange", (args) => {
                const newStartedState = StartedStateSchema.parse(args.params.result);
                this._setStartedState(newStartedState);
                this._updateRpcClientStateFromStartedState(newStartedState);
            })
            .on("challengerequest", (args) => {
                const encodedRequest = EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthorSchema.parse(args.params.result);
                const request = decodeRpcChallengeRequestPubsubMsg(encodedRequest);
                this._setRpcClientState("waiting-challenge-requests");
                this.emit("challengerequest", request);
            })
            .on("challenge", (args) => {
                const encodedChallenge = EncodedDecryptedChallengeMessageSchema.parse(args.params.result);
                const challenge = decodeRpcChallengePubsubMsg(encodedChallenge);

                this._setRpcClientState("publishing-challenge");
                this.emit("challenge", challenge);
                this._setRpcClientState("waiting-challenge-answers");
            })
            .on("challengeanswer", (args) => {
                const encodedChallengeAnswer = EncodedDecryptedChallengeAnswerMessageSchema.parse(args.params.result);

                const challengeAnswer = decodeRpcChallengeAnswerPubsubMsg(encodedChallengeAnswer);
                this.emit("challengeanswer", challengeAnswer);
            })
            .on("challengeverification", (args) => {
                const encodedChallengeVerification = EncodedDecryptedChallengeVerificationMessageSchema.parse(args.params.result);
                const challengeVerification = decodeRpcChallengeVerificationPubsubMsg(encodedChallengeVerification);
                this._setRpcClientState("publishing-challenge-verification");
                this.emit("challengeverification", challengeVerification);
                this._setRpcClientState("waiting-challenge-requests");
            })

            .on("error", (args) => this.emit("error", args.params.result)); // TODO need to figure out how to zod parse error

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
        const parsedEditOptions = SubplebbitEditOptionsSchema.parse(newSubplebbitOptions);
        const optionsParsed = <SubplebbitEditOptions>replaceXWithY(parsedEditOptions, undefined, null); // JSON-RPC removes undefined, so we have to replace it with null
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
