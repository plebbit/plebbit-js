import { ChallengeAnswerMessage, ChallengeRequestMessage } from "./challenge";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { v4 as uuidv4 } from "uuid";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import Author from "./author";
import assert from "assert";
import { decrypt, encrypt, Signer } from "./signer";
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
    PublicationTypeName
} from "./types";
import Logger from "@plebbit/plebbit-logger";
import env from "./version";
import { Plebbit } from "./plebbit";
import { Subplebbit } from "./subplebbit";
import { signChallengeAnswer, signChallengeRequest, verifyChallengeMessage, verifyChallengeVerification } from "./signer/signatures";
import { throwWithErrorCode, timestamp } from "./util";
import { SignatureType } from "./signer/constants";
import { TypedEmitter } from "tiny-typed-emitter";
import { Comment } from "./comment";
import { PlebbitError } from "./plebbit-error";

class Publication extends TypedEmitter<PublicationEvents> implements PublicationType {
    subplebbitAddress: string;
    timestamp: number;
    signature: SignatureType;
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
    protected plebbit: Plebbit;
    protected subplebbit?: Subplebbit;
    protected pubsubMessageSigner: Signer;
    private _challengeAnswer: ChallengeAnswerMessage;
    private _challengeRequest: ChallengeRequestMessage;

    constructor(props: PublicationType, plebbit: Plebbit) {
        super();
        this.plebbit = plebbit;
        this._updatePublishingState("stopped");
        this._updateState("stopped");
        this._initProps(props);
        this.handleChallengeExchange = this.handleChallengeExchange.bind(this);
        this.on("error", (...args) => this.plebbit.emit("error", ...args));

        // public method should be bound
        this.publishChallengeAnswers = this.publishChallengeAnswers.bind(this);
    }

    _initProps(props: PublicationType) {
        this.subplebbitAddress = props.subplebbitAddress;
        this.timestamp = props.timestamp;
        this.signer = this.signer || props["signer"];
        this.signature = props.signature;
        if (props.author) this.author = new Author(props.author);
        this.protocolVersion = props.protocolVersion;
    }
    // TODO make this private/protected

    getType(): PublicationTypeName {
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

    private async handleChallengeExchange(pubsubMsg) {
        const log = Logger("plebbit-js:publication:handleChallengeExchange");

        const msgParsed: ChallengeMessageType | ChallengeVerificationMessageType = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
        if (msgParsed?.challengeRequestId !== this._challengeRequest.challengeRequestId) return; // Process only this publication's challenge
        if (msgParsed?.type === "CHALLENGE") {
            const challengeMsgValidity = await verifyChallengeMessage(msgParsed);
            if (!challengeMsgValidity.valid) {
                const error = new PlebbitError("ERR_SIGNATURE_IS_INVALID", {
                    pubsubMsg: msgParsed,
                    signatureValidity: challengeMsgValidity
                });
                log.error(error);
                this.emit("error", error);
                return;
            }

            log(
                `Received encrypted challenges.  Will decrypt and emit them on "challenge" event. User shoud publish solution by calling publishChallengeAnswers`
            );
            const decryptedChallenges: ChallengeType[] = JSON.parse(
                await decrypt(msgParsed.encryptedChallenges, this.pubsubMessageSigner.privateKey, this.subplebbit.encryption.publicKey)
            );
            const decryptedChallenge: DecryptedChallengeMessageType = { ...msgParsed, challenges: decryptedChallenges };
            this._updatePublishingState("waiting-challenge-answers");
            this.emit("challenge", decryptedChallenge);
        } else if (msgParsed?.type === "CHALLENGEVERIFICATION") {
            const signatureValidation = await verifyChallengeVerification(msgParsed);
            if (!signatureValidation.valid) {
                const error = new PlebbitError("ERR_SIGNATURE_IS_INVALID", {
                    signatureValidity: signatureValidation,
                    pubsubMsg: msgParsed
                });
                this._updatePublishingState("failed");
                log.error(error);
                this.emit("error", error);
                return;
            }
            let decryptedPublication: CommentIpfsWithCid | undefined;
            if (msgParsed.challengeSuccess) {
                this._updatePublishingState("succeeded");
                log(`Challenge (${msgParsed.challengeRequestId}) has passed`);
                if (msgParsed.encryptedPublication) {
                    decryptedPublication = JSON.parse(
                        await decrypt(
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

            this.emit(
                "challengeverification",
                { ...msgParsed, publication: decryptedPublication },
                this instanceof Comment && decryptedPublication ? this : undefined
            );
            await this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange);
        }
    }

    async publishChallengeAnswers(challengeAnswers: string[]) {
        assert(this.subplebbit, "Subplebbit is not defined");
        const log = Logger("plebbit-js:publication:publishChallengeAnswers");

        if (!Array.isArray(challengeAnswers)) challengeAnswers = [challengeAnswers];
        this._updatePublishingState("publishing-challenge-answer");

        const encryptedChallengeAnswers = await encrypt(
            JSON.stringify(challengeAnswers),
            this.pubsubMessageSigner.privateKey,
            this.subplebbit.encryption.publicKey
        );

        const toSignAnswer: Omit<ChallengeAnswerMessageType, "signature"> = {
            type: "CHALLENGEANSWER",
            challengeRequestId: this._challengeRequest.challengeRequestId,
            challengeAnswerId: uuidv4(),
            encryptedChallengeAnswers: encryptedChallengeAnswers,
            userAgent: env.USER_AGENT,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        };
        this._challengeAnswer = new ChallengeAnswerMessage({
            ...toSignAnswer,
            signature: await signChallengeAnswer(toSignAnswer, this.pubsubMessageSigner)
        });
        await this.plebbit.pubsubIpfsClient.pubsub.publish(
            this._pubsubTopicWithfallback(),
            uint8ArrayFromString(JSON.stringify(this._challengeAnswer))
        );
        this._updatePublishingState("waiting-challenge-verification");
        log(`Responded to challenge (${this._challengeAnswer.challengeRequestId}) with answers`, challengeAnswers);
        this.emit("challengeanswer", { ...this._challengeAnswer, challengeAnswers });
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
    }

    private _updatePublishingState(newState: Publication["publishingState"]) {
        this.publishingState = newState;
        this.emit("publishingstatechange", this.publishingState);
    }

    protected _updateState(newState: Publication["state"]) {
        this.state = newState;
        this.emit("statechange", this.state);
    }

    private _setPublishingStateUpdaters() {
        let resolvedAddress: string;
        const commentSubplebbitAddress = this.subplebbitAddress;
        const resolvedSubplebbitAddress = ((subAddress: string, subResolvedAddress: string) => {
            if (subAddress === commentSubplebbitAddress) {
                this._updatePublishingState("fetching-subplebbit-ipns");
                resolvedAddress = subResolvedAddress;
                this.plebbit.removeListener("resolvedsubplebbitaddress", resolvedSubplebbitAddress);
            }
        }).bind(this);

        this.plebbit.on("resolvedsubplebbitaddress", resolvedSubplebbitAddress);

        const fetchingSubIpfs = ((ipns: string, cid: string) => {
            assert(resolvedAddress);
            if (ipns === resolvedAddress) {
                this._updatePublishingState("fetching-subplebbit-ipfs");
                this.plebbit.removeListener("resolvedipns", fetchingSubIpfs);
            }
        }).bind(this);

        // insert condition here
        if (this.plebbit.ipfsClient) this.plebbit.on("resolvedipns", fetchingSubIpfs);
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
        this._setPublishingStateUpdaters();
        this.subplebbit = await this.plebbit.getSubplebbit(this.subplebbitAddress);
        this._updatePublishingState("publishing-challenge-request");

        this._validateSubFields();

        await this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange);

        this.pubsubMessageSigner = await this.plebbit.createSigner();

        const encryptedPublication = await encrypt(
            JSON.stringify(this.toJSONPubsubMessagePublication()),
            this.pubsubMessageSigner.privateKey,
            this.subplebbit.encryption.publicKey
        );

        const toSignMsg: Omit<ChallengeRequestMessageType, "signature"> = {
            type: "CHALLENGEREQUEST",
            encryptedPublication,
            challengeRequestId: uuidv4(),
            acceptedChallengeTypes: options.acceptedChallengeTypes,
            userAgent: env.USER_AGENT,
            protocolVersion: env.PROTOCOL_VERSION,
            timestamp: timestamp()
        };

        this._challengeRequest = new ChallengeRequestMessage({
            ...toSignMsg,
            signature: await signChallengeRequest(toSignMsg, this.pubsubMessageSigner)
        });
        log.trace(`Attempting to publish ${this.getType()} with options`, options);

        await Promise.all([
            this.plebbit.pubsubIpfsClient.pubsub.publish(
                this._pubsubTopicWithfallback(),
                uint8ArrayFromString(JSON.stringify(this._challengeRequest))
            ),
            this.plebbit.pubsubIpfsClient.pubsub.subscribe(this._pubsubTopicWithfallback(), this.handleChallengeExchange)
        ]);
        this._updatePublishingState("waiting-challenge");
        log(`Sent a challenge request (${this._challengeRequest.challengeRequestId})`);
        this.emit("challengerequest", { ...this._challengeRequest, publication: this.toJSONPubsubMessagePublication() });
    }
}

export default Publication;
