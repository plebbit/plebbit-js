import { ChallengeAnswerMessage, ChallengeRequestMessage } from "./challenge";
import Author from "./author";
import assert from "assert";
import { Signer, decryptEd25519AesGcm, encryptEd25519AesGcm } from "./signer";
import {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeType,
    ChallengeVerificationMessageType,
    CommentIpfsWithCid,
    DecryptedChallengeMessageType,
    ProtocolVersion,
    PublicationEvents,
    PublicationType,
    PublicationTypeName,
    SubplebbitIpfsType
} from "./types";
import Logger from "@plebbit/plebbit-logger";
import env from "./version";
import { Plebbit } from "./plebbit";
import { signChallengeAnswer, signChallengeRequest, verifyChallengeMessage, verifyChallengeVerification } from "./signer/signatures";
import { throwWithErrorCode, timestamp } from "./util";
import { TypedEmitter } from "tiny-typed-emitter";
import { Comment } from "./comment";
import { PlebbitError } from "./plebbit-error";
import { getBufferedPlebbitAddressFromPublicKey } from "./signer/util";
import { CommentClientsManager, PublicationClientsManager } from "./clients/client-manager";
import { MessageHandlerFn } from "ipfs-http-client/types/src/pubsub/subscription-tracker";
import * as cborg from "cborg";
import { JsonSignature } from "./signer/constants";
import { sha256 } from "js-sha256";
import lodash from "lodash";

class Publication extends TypedEmitter<PublicationEvents> implements PublicationType {
    // Only publication props
    clients: PublicationClientsManager["clients"];

    subplebbitAddress: string;
    timestamp: number;
    signature: JsonSignature;
    signer: Signer;
    author: Author;
    protocolVersion: ProtocolVersion;

    state: "stopped" | "updating" | "publishing";
    publishingState:
        | "stopped"
        | "resolving-subplebbit-address"
        | "fetching-subplebbit-ipns"
        | "fetching-subplebbit-ipfs"
        | "publishing-challenge-request"
        | "waiting-challenge"
        | "waiting-challenge-answers"
        | "publishing-challenge-answer"
        | "waiting-challenge-verification"
        | "failed"
        | "succeeded";

    // private
    protected subplebbit?: SubplebbitIpfsType;
    protected pubsubMessageSigner: Signer;
    private _challengeAnswer: ChallengeAnswerMessage;
    private _challengeRequest: ChallengeRequestMessage;
    _clientsManager: PublicationClientsManager | CommentClientsManager;
    _plebbit: Plebbit;

    constructor(props: PublicationType, plebbit: Plebbit) {
        super();
        this._plebbit = plebbit;
        this._updatePublishingState("stopped");
        this._updateState("stopped");
        this._initClients();
        this._initProps(props);
        this.handleChallengeExchange = this.handleChallengeExchange.bind(this);
        this.on("error", (...args) => this._plebbit.emit("error", ...args));

        // public method should be bound
        this.publishChallengeAnswers = this.publishChallengeAnswers.bind(this);
    }

    protected _initClients() {
        this._clientsManager = new PublicationClientsManager(this);
        this.clients = this._clientsManager.clients;
    }

    _initProps(props: PublicationType) {
        this.subplebbitAddress = props.subplebbitAddress;
        this.timestamp = props.timestamp;
        this.signer = this.signer || props["signer"];
        this.signature = props.signature;
        if (props.author) this.author = new Author(props.author);
        this.protocolVersion = props.protocolVersion;
    }

    protected getType(): PublicationTypeName {
        throw new Error(`Should be implemented by children of Publication`);
    }

    // This is the publication that user publishes over pubsub
    toJSONPubsubMessagePublication(): PublicationType {
        return {
            subplebbitAddress: this.subplebbitAddress,
            timestamp: this.timestamp,
            signature: this.signature,
            author: this.author.toJSONIpfs(),
            protocolVersion: this.protocolVersion
        };
    }

    private async handleChallengeExchange(pubsubMsg: Parameters<MessageHandlerFn>[0]) {
        const log = Logger("plebbit-js:publication:handleChallengeExchange");
        const msgParsed: ChallengeMessageType | ChallengeVerificationMessageType = cborg.decode(pubsubMsg.data);
        if (!lodash.isEqual(msgParsed?.challengeRequestId, this._challengeRequest.challengeRequestId)) return; // Process only this publication's challenge
        if (msgParsed?.type === "CHALLENGE") {
            const challengeMsgValidity = await verifyChallengeMessage(msgParsed, this._pubsubTopicWithfallback(), true);
            if (!challengeMsgValidity.valid) {
                const error = new PlebbitError("ERR_CHALLENGE_SIGNATURE_IS_INVALID", {
                    pubsubMsg: msgParsed,
                    reason: challengeMsgValidity.reason
                });
                log.error(error.toString());
                this.emit("error", error);
                return;
            }

            log(
                `Received encrypted challenges.  Will decrypt and emit them on "challenge" event. User shoud publish solution by calling publishChallengeAnswers`
            );
            const decryptedChallenges: ChallengeType[] = JSON.parse(
                await decryptEd25519AesGcm(
                    msgParsed.encryptedChallenges,
                    this.pubsubMessageSigner.privateKey,
                    this.subplebbit.encryption.publicKey
                )
            );
            const decryptedChallenge: DecryptedChallengeMessageType = {
                ...msgParsed,
                challenges: decryptedChallenges
            };
            this._updatePublishingState("waiting-challenge-answers");
            this._clientsManager.updatePubsubState("waiting-challenge-answers", undefined);
            this.emit("challenge", decryptedChallenge);
        } else if (msgParsed?.type === "CHALLENGEVERIFICATION") {
            const signatureValidation = await verifyChallengeVerification(msgParsed, this._pubsubTopicWithfallback(), true);
            if (!signatureValidation.valid) {
                const error = new PlebbitError("ERR_CHALLENGE_VERIFICATION_SIGNATURE_IS_INVALID", {
                    pubsubMsg: msgParsed,
                    reason: signatureValidation.reason
                });
                this._updatePublishingState("failed");
                log.error(error.toString());
                this.emit("error", error);
                return;
            }
            let decryptedPublication: CommentIpfsWithCid | undefined;
            if (msgParsed.challengeSuccess) {
                this._updatePublishingState("succeeded");
                log(`Challenge (${msgParsed.challengeRequestId}) has passed`);
                if (msgParsed.encryptedPublication) {
                    decryptedPublication = JSON.parse(
                        await decryptEd25519AesGcm(
                            msgParsed.encryptedPublication,
                            this.pubsubMessageSigner.privateKey,
                            this.subplebbit.encryption.publicKey
                        )
                    );
                    assert(decryptedPublication);
                    this._initProps(decryptedPublication);
                }
            } else {
                this._updatePublishingState("failed");
                log(
                    `Challenge ${msgParsed.challengeRequestId} has failed to pass. Challenge errors = ${msgParsed.challengeErrors}, reason = '${msgParsed.reason}'`
                );
            }

            await this._clientsManager.pubsubUnsubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange);
            this._clientsManager.updatePubsubState("stopped", undefined);
            this.emit(
                "challengeverification",
                { ...msgParsed, publication: decryptedPublication },
                this instanceof Comment && decryptedPublication ? this : undefined
            );
        }
    }

    async publishChallengeAnswers(challengeAnswers: string[]) {
        assert(this.subplebbit, "Subplebbit is not defined");
        const log = Logger("plebbit-js:publication:publishChallengeAnswers");

        if (!Array.isArray(challengeAnswers)) challengeAnswers = [challengeAnswers];

        const encryptedChallengeAnswers = await encryptEd25519AesGcm(
            JSON.stringify(challengeAnswers),
            this.pubsubMessageSigner.privateKey,
            this.subplebbit.encryption.publicKey
        );

        const toSignAnswer: Omit<ChallengeAnswerMessageType, "signature"> = {
            type: "CHALLENGEANSWER",
            challengeRequestId: this._challengeRequest.challengeRequestId,
            encryptedChallengeAnswers: encryptedChallengeAnswers,
            userAgent: env.USER_AGENT,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        };
        this._challengeAnswer = new ChallengeAnswerMessage({
            ...toSignAnswer,
            signature: await signChallengeAnswer(toSignAnswer, this.pubsubMessageSigner)
        });
        this._updatePublishingState("publishing-challenge-answer");
        await this._clientsManager.pubsubPublish(this._pubsubTopicWithfallback(), this._challengeAnswer);
        this._updatePublishingState("waiting-challenge-verification");
        this._clientsManager.updatePubsubState("waiting-challenge-verification", undefined);

        log(`Responded to challenge (${this._challengeAnswer.challengeRequestId}) with answers`, challengeAnswers);
        this.emit("challengeanswer", {
            ...this._challengeAnswer,
            challengeAnswers
        });
    }

    private _validatePublicationFields() {
        if (typeof this.timestamp !== "number" || this.timestamp < 0)
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType, timestamp: this.timestamp });

        if (typeof this.author?.address !== "string")
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType(), authorAddress: this.author?.address });
        if (typeof this.subplebbitAddress !== "string")
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", { type: this.getType(), subplebbitAddress: this.subplebbitAddress });
    }

    private _validateSubFields() {
        if (typeof this.subplebbit?.encryption?.publicKey !== "string")
            throwWithErrorCode("ERR_SUBPLEBBIT_MISSING_FIELD", { subplebbitPublicKey: this.subplebbit?.encryption?.publicKey });
        if (typeof this._pubsubTopicWithfallback() !== "string")
            throwWithErrorCode("ERR_SUBPLEBBIT_MISSING_FIELD", {
                pubsubTopic: this.subplebbit?.pubsubTopic,
                address: this.subplebbit?.address
            });
    }

    _updatePublishingState(newState: Publication["publishingState"]) {
        this.publishingState = newState;
        this.emit("publishingstatechange", this.publishingState);
    }

    protected _updateState(newState: Publication["state"]) {
        this.state = newState;
        this.emit("statechange", this.state);
    }

    private _pubsubTopicWithfallback() {
        return this.subplebbit.pubsubTopic || this.subplebbit.address;
    }

    async publish() {
        const log = Logger("plebbit-js:publication:publish");
        this._updateState("publishing");

        this._validatePublicationFields();

        const options = { acceptedChallengeTypes: [] };
        this._updatePublishingState("resolving-subplebbit-address");
        this.subplebbit = await this._clientsManager.fetchSubplebbitForPublishing(this.subplebbitAddress);
        this._updatePublishingState("publishing-challenge-request");

        this._validateSubFields();

        await this._clientsManager.pubsubUnsubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange);

        this.pubsubMessageSigner = await this._plebbit.createSigner();

        const encryptedPublication = await encryptEd25519AesGcm(
            JSON.stringify(this.toJSONPubsubMessagePublication()),
            this.pubsubMessageSigner.privateKey,
            this.subplebbit.encryption.publicKey
        );

        const challengeRequestId = await getBufferedPlebbitAddressFromPublicKey(this.pubsubMessageSigner.publicKey);

        const toSignMsg: Omit<ChallengeRequestMessageType, "signature"> = {
            type: "CHALLENGEREQUEST",
            encryptedPublication,
            challengeRequestId,
            acceptedChallengeTypes: options.acceptedChallengeTypes,
            userAgent: env.USER_AGENT,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        };

        this._challengeRequest = new ChallengeRequestMessage({
            ...toSignMsg,
            signature: await signChallengeRequest(toSignMsg, this.pubsubMessageSigner)
        });
        log.trace(
            `Attempting to publish ${this.getType()} with challenge id (${
                this._challengeRequest.challengeRequestId
            }) to pubsub topic (${this._pubsubTopicWithfallback()})`
        );

        this._clientsManager.updatePubsubState("subscribing-pubsub", undefined);
        try {
            await this._clientsManager.pubsubSubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange);
            await this._clientsManager.pubsubPublish(this._pubsubTopicWithfallback(), this._challengeRequest);
        } catch (e) {
            this._clientsManager.updatePubsubState("stopped", undefined);
            this._updatePublishingState("failed");
            this.emit("error", e);
            throw e;
        }
        this._clientsManager.updatePubsubState("waiting-challenge", undefined);

        this._updatePublishingState("waiting-challenge");

        log(`Sent a challenge request (${this._challengeRequest.challengeRequestId})`);
        this.emit("challengerequest", {
            ...this._challengeRequest,
            publication: this.toJSONPubsubMessagePublication()
        });
    }
}

export default Publication;
