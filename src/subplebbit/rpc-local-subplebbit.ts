import Logger from "@plebbit/plebbit-logger";
import type {
    InternalSubplebbitBeforeFirstUpdateRpcType,
    InternalSubplebbitAfterFirstUpdateRpcType,
    SubplebbitEditOptions,
    SubplebbitIpfsType
} from "./types.js";
import { RpcRemoteSubplebbit } from "./rpc-remote-subplebbit.js";
import { z } from "zod";
import { messages } from "../errors.js";
import * as remeda from "remeda";
import { Plebbit } from "../plebbit.js";
import { PlebbitError } from "../plebbit-error.js";

import {
    parseEncodedDecryptedChallengeAnswerWithPlebbitErrorIfItFails,
    parseEncodedDecryptedChallengeRequestWithSubplebbitAuthorWithPlebbitErrorIfItFails,
    parseEncodedDecryptedChallengeVerificationWithPlebbitErrorIfItFails,
    parseEncodedDecryptedChallengeWithPlebbitErrorIfItFails,
    parseLocalSubplebbitRpcUpdateResultWithPlebbitErrorIfItFails,
    parseRpcSubplebbitStartedStateWithPlebbitErrorIfItFails
} from "../schema/schema-util.js";
import {
    RpcInternalSubplebbitRecordAfterFirstUpdateSchema,
    RpcInternalSubplebbitRecordBeforeFirstUpdateSchema,
    RpcLocalSubplebbitUpdateResultSchema,
    StartedStateSchema,
    SubplebbitEditOptionsSchema,
    SubplebbitIpfsSchema
} from "./schema.js";
import { EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthorSchema } from "../pubsub-messages/schema.js";
import {
    decodeRpcChallengeAnswerPubsubMsg,
    decodeRpcChallengePubsubMsg,
    decodeRpcChallengeRequestPubsubMsg,
    decodeRpcChallengeVerificationPubsubMsg
} from "../clients/rpc-client/decode-rpc-response-util.js";
import { SubscriptionIdSchema } from "../clients/rpc-client/schema.js";
import type {
    EncodedDecryptedChallengeAnswerMessageType,
    EncodedDecryptedChallengeMessageType,
    EncodedDecryptedChallengeVerificationMessageType
} from "../pubsub-messages/types.js";

// This class is for subs that are running and publishing, over RPC. Can be used for both browser and node
export class RpcLocalSubplebbit extends RpcRemoteSubplebbit {
    started: boolean; // Is the sub started and running? This is not specific to this instance, and applies to all instances of sub with this address
    startedState!: z.infer<typeof StartedStateSchema>;
    signer!: InternalSubplebbitAfterFirstUpdateRpcType["signer"];
    settings?: InternalSubplebbitAfterFirstUpdateRpcType["settings"];
    editable!: Pick<RpcLocalSubplebbit, keyof SubplebbitEditOptions>;

    // Private stuff
    private _startRpcSubscriptionId?: z.infer<typeof SubscriptionIdSchema> = undefined;
    protected _usingDefaultChallenge!: InternalSubplebbitAfterFirstUpdateRpcType["_usingDefaultChallenge"];

    constructor(plebbit: Plebbit) {
        super(plebbit);
        this.started = false;
        //@ts-expect-error
        this._usingDefaultChallenge = undefined;
        this.start = this.start.bind(this);
        this.edit = this.edit.bind(this);
        this._setStartedState("stopped");
        this.on("update", () => {
            this.editable = remeda.pick(this, remeda.keys.strict(SubplebbitEditOptionsSchema.shape));
        });
    }


    toJSONInternalRpcAfterFirstUpdate(): InternalSubplebbitAfterFirstUpdateRpcType {
        return RpcInternalSubplebbitRecordAfterFirstUpdateSchema.parse({
            ...this.toJSONIpfs(),
            ...this.toJSONInternalRpcBeforeFirstUpdate(),
            cid: this.cid
        });
    }

    toJSONInternalRpcBeforeFirstUpdate(): InternalSubplebbitBeforeFirstUpdateRpcType {
        //@ts-expect-error
        return remeda.pick(this, Object.keys(RpcInternalSubplebbitRecordBeforeFirstUpdateSchema.shape));
    }

    async initRpcInternalSubplebbitBeforeFirstUpdateNoMerge(newProps: InternalSubplebbitBeforeFirstUpdateRpcType) {
        await this.initRemoteSubplebbitPropsNoMerge(newProps);
        this.signer = newProps.signer;
        this.settings = newProps.settings;
        this._usingDefaultChallenge = newProps._usingDefaultChallenge;
        this.started = newProps.started;
    }

    async initRpcInternalSubplebbitAfterFirstUpdateNoMerge(newProps: InternalSubplebbitAfterFirstUpdateRpcType) {
        const subplebbitIpfs = SubplebbitIpfsSchema.passthrough().parse(
            remeda.pick(newProps, <(keyof SubplebbitIpfsType)[]>[...newProps.signature.signedPropertyNames, "signature"])
        );
        await super.initSubplebbitIpfsPropsNoMerge(subplebbitIpfs);
        await this.initRpcInternalSubplebbitBeforeFirstUpdateNoMerge(newProps);
        this.cid = newProps.cid;
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

    protected override async _processUpdateEventFromRpcUpdate(args: any) {
        // This function is gonna be called with every update event from rpcLocalSubplebbit.update()
        const log = Logger("plebbit-js:rpc-local-subplebbit:_processUpdateEventFromRpcUpdate");
        let updateRecord: z.infer<typeof RpcLocalSubplebbitUpdateResultSchema>;
        try {
            updateRecord = parseLocalSubplebbitRpcUpdateResultWithPlebbitErrorIfItFails(args.params.result);
        } catch (e) {
            log.error("The update event from rpc contains an invalid schema", e);
            this.emit("error", <PlebbitError>e);
            throw e;
        }

        if ("updatedAt" in updateRecord) await this.initRpcInternalSubplebbitAfterFirstUpdateNoMerge(updateRecord);
        else await this.initRpcInternalSubplebbitBeforeFirstUpdateNoMerge(updateRecord);

        this.emit("update", this);
    }

    private async _handleRpcUpdateEventFromStart(args: any) {
        // This function is gonna be called with every update event from rpcLocalSubplebbit.start()

        const log = Logger("plebbit-js:rpc-local-subplebbit:_handleRpcUpdateEventFromStart");
        let updateRecord: z.infer<typeof RpcLocalSubplebbitUpdateResultSchema>;
        try {
            updateRecord = parseLocalSubplebbitRpcUpdateResultWithPlebbitErrorIfItFails(args.params.result);
        } catch (e) {
            log.error("The update event from rpc contains an invalid schema", e);
            this.emit("error", <PlebbitError>e);
            throw e;
        }

        if ("updatedAt" in updateRecord) {
            await this.initRpcInternalSubplebbitAfterFirstUpdateNoMerge(updateRecord);
            if (!updateRecord.started)
                // This is the rpc server telling us that this sub has been stopped by another instance
                await this._cleanUpRpcConnection(log);
        } else await this.initRpcInternalSubplebbitBeforeFirstUpdateNoMerge(updateRecord);

        this.emit("update", this);
    }

    private _handleRpcStartedStateChangeEvent(args: any) {
        const log = Logger("plebbit-js:rpc-local-subplebbit:_handleRpcStartedStateChangeEvent");

        let newStartedState: RpcLocalSubplebbit["startedState"];
        // TODO default rpc client state if we can't recognize the new updating state

        try {
            newStartedState = parseRpcSubplebbitStartedStateWithPlebbitErrorIfItFails(args.params.result);
        } catch (e) {
            log.error("The startedstatechange event from rpc contains an invalid schema", e);
            this.emit("error", <PlebbitError>e);
            throw e;
        }

        this._setStartedState(newStartedState);
        this._updateRpcClientStateFromStartedState(newStartedState);
    }

    private _handleRpcChallengeRequestEvent(args: any) {
        const log = Logger("plebbit-js:rpc-local-subplebbit:_handleRpcChallengeRequestEvent");
        let encodedRequest: z.infer<typeof EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthorSchema>;
        try {
            encodedRequest = parseEncodedDecryptedChallengeRequestWithSubplebbitAuthorWithPlebbitErrorIfItFails(args.params.result);
        } catch (e) {
            log.error("The challengerequest event from rpc contains an invalid schema", e);
            this.emit("error", <PlebbitError>e);
            throw e;
        }
        const request = decodeRpcChallengeRequestPubsubMsg(encodedRequest);
        this._setRpcClientState("waiting-challenge-requests");
        this.emit("challengerequest", request);
    }

    private _handleRpcChallengeEvent(args: any) {
        const log = Logger("plebbit-js:rpc-local-subplebbit:_handleRpcChallengeEvent");

        let encodedChallenge: EncodedDecryptedChallengeMessageType;
        try {
            encodedChallenge = parseEncodedDecryptedChallengeWithPlebbitErrorIfItFails(args.params.result);
        } catch (e) {
            log.error("The challenge event from rpc contains an invalid schema", e);
            this.emit("error", <PlebbitError>e);
            throw e;
        }
        const challenge = decodeRpcChallengePubsubMsg(encodedChallenge);

        this._setRpcClientState("publishing-challenge");
        this.emit("challenge", challenge);
        this._setRpcClientState("waiting-challenge-answers");
    }

    private _handleRpcChallengeAnswerEvent(args: any) {
        const log = Logger("plebbit-js:rpc-local-subplebbit:_handleRpcChallengeAnswerEvent");

        let encodedChallengeAnswer: EncodedDecryptedChallengeAnswerMessageType;
        try {
            encodedChallengeAnswer = parseEncodedDecryptedChallengeAnswerWithPlebbitErrorIfItFails(args.params.result);
        } catch (e) {
            log.error("The challengeanswer event from rpc contains an invalid schema", e);
            this.emit("error", <PlebbitError>e);
            throw e;
        }

        const challengeAnswer = decodeRpcChallengeAnswerPubsubMsg(encodedChallengeAnswer);
        this.emit("challengeanswer", challengeAnswer);
    }

    private _handleRpcChallengeVerificationEvent(args: any) {
        const log = Logger("plebbit-js:rpc-local-subplebbit:_handleRpcChallengeVerificationEvent");

        let encodedChallengeVerification: EncodedDecryptedChallengeVerificationMessageType;

        try {
            encodedChallengeVerification = parseEncodedDecryptedChallengeVerificationWithPlebbitErrorIfItFails(args.params.result);
        } catch (e) {
            log.error("The challengeverification event from rpc contains an invalid schema", e);
            this.emit("error", <PlebbitError>e);
            throw e;
        }

        const challengeVerification = decodeRpcChallengeVerificationPubsubMsg(encodedChallengeVerification);
        this._setRpcClientState("publishing-challenge-verification");
        this.emit("challengeverification", challengeVerification);
        this._setRpcClientState("waiting-challenge-requests");
    }

    async start() {
        const log = Logger("plebbit-js:rpc-local-subplebbit:start");
        // we can't start the same instance multiple times
        if (typeof this._startRpcSubscriptionId === "number")
            throw new PlebbitError("ERR_SUB_ALREADY_STARTED", { subplebbitAddress: this.address });

        try {
            this._startRpcSubscriptionId = await this._plebbit.plebbitRpcClient!.startSubplebbit(this.address);
            this._setState("started");
        } catch (e) {
            log.error(`Failed to start subplebbit (${this.address}) from RPC due to error`, e);
            this._setState("stopped");
            this._setStartedState("failed");
            throw e;
        }
        this.started = true;
        this._plebbit
            .plebbitRpcClient!.getSubscription(this._startRpcSubscriptionId)
            .on("update", this._handleRpcUpdateEventFromStart.bind(this))
            .on("startedstatechange", this._handleRpcStartedStateChangeEvent.bind(this))
            .on("challengerequest", this._handleRpcChallengeRequestEvent.bind(this))
            .on("challenge", this._handleRpcChallengeEvent.bind(this))
            .on("challengeanswer", this._handleRpcChallengeAnswerEvent.bind(this))
            .on("challengeverification", this._handleRpcChallengeVerificationEvent.bind(this))

            .on("error", (args) => this.emit("error", args.params.result)); // TODO need to figure out how to zod parse error

        this._plebbit.plebbitRpcClient!.emitAllPendingMessages(this._startRpcSubscriptionId);
    }

    private async _cleanUpRpcConnection(log: Logger) {
        if (this._startRpcSubscriptionId) await this._plebbit.plebbitRpcClient!.unsubscribe(this._startRpcSubscriptionId);
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
                await this._plebbit.plebbitRpcClient!.stopSubplebbit(this.address);
            } catch (e) {
                if (e instanceof Error && e.message !== messages.ERR_RPC_CLIENT_TRYING_TO_STOP_SUB_THAT_IS_NOT_RUNNING) throw e;
            }
            await this._cleanUpRpcConnection(log);
        } else throw Error("User called rpcLocalSub.stop() without updating or starting");
    }

    async edit(newSubplebbitOptions: SubplebbitEditOptions) {
        const subPropsAfterEdit = await this._plebbit.plebbitRpcClient!.editSubplebbit(this.address, newSubplebbitOptions);
        if ("updatedAt" in subPropsAfterEdit) await this.initRpcInternalSubplebbitAfterFirstUpdateNoMerge(subPropsAfterEdit);
        else await this.initRpcInternalSubplebbitBeforeFirstUpdateNoMerge(subPropsAfterEdit);
        this.emit("update", this);
        return this;
    }

    override async update() {
        if (this.state === "started") return;
        else return super.update();
    }

    async delete() {
        // Make sure to stop updating or starting first
        if (this.state === "started" || this.state === "updating") await this.stop();

        await this._plebbit.plebbitRpcClient!.deleteSubplebbit(this.address);

        this.started = false;
        this._setRpcClientState("stopped");
        this._setState("stopped");
    }
}
