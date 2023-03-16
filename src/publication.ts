import { ChallengeAnswerMessage, ChallengeRequestMessage } from "./challenge";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { v4 as uuidv4 } from "uuid";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import EventEmitter from "events";
import Author from "./author";
import assert from "assert";
import { decrypt, encrypt, Signer } from "./signer";
import {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeType,
    ChallengeVerificationMessageType,
    DecryptedChallengeMessageType,
    ProtocolVersion,
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

class Publication extends EventEmitter implements PublicationType {
    subplebbitAddress: string;
    timestamp: number;
    signature: SignatureType;
    signer: Signer;
    author: Author;
    protocolVersion: ProtocolVersion;

    // private
    protected plebbit: Plebbit;
    protected subplebbit?: Subplebbit;
    protected pubsubMessageSigner: Signer;
    private _challengeAnswer: ChallengeAnswerMessage;
    private _challengeRequest: ChallengeRequestMessage;

    constructor(props: PublicationType, plebbit: Plebbit) {
        super();
        this.plebbit = plebbit;
        this._initProps(props);
        this.handleChallengeExchange = this.handleChallengeExchange.bind(this);
        this.on("error", (...args) => this.plebbit.emit("error", ...args));
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
                const errMsg = `Received a CHALLENGEMESSAGE with invalid signature. Failed verification reason: ${challengeMsgValidity.reason}`;
                log.error(errMsg);
                this.emit("error", errMsg);
                return;
            }

            log(
                `Received encrypted challenges.  Will decrypt and emit them on "challenge" event. User shoud publish solution by calling publishChallengeAnswers`
            );
            const decryptedChallenges: ChallengeType[] = JSON.parse(
                await decrypt(msgParsed.encryptedChallenges, this.pubsubMessageSigner.privateKey, this.subplebbit.encryption.publicKey)
            );
            const decryptedChallenge: DecryptedChallengeMessageType = { ...msgParsed, challenges: decryptedChallenges };
            this.emit("challenge", decryptedChallenge);
        } else if (msgParsed?.type === "CHALLENGEVERIFICATION") {
            const signatureValidation = await verifyChallengeVerification(msgParsed);
            if (!signatureValidation.valid) {
                const errMsg = `Received a CHALLENGEVERIFICATIONMESSAGE with invalid signature. Failed verification reason: ${signatureValidation.reason}`;
                log.error(errMsg);
                this.emit("error", errMsg);
                return;
            }
            let decryptedPublication: PublicationType | undefined;
            if (msgParsed.challengeSuccess && msgParsed.encryptedPublication) {
                log(
                    `Challenge (${msgParsed.challengeRequestId}) has passed. Will update publication props from ChallengeVerificationMessage.publication`
                );
                decryptedPublication = JSON.parse(
                    await decrypt(msgParsed.encryptedPublication, this.pubsubMessageSigner.privateKey, this.subplebbit.encryption.publicKey)
                );
                assert(decryptedPublication);
                this._initProps(decryptedPublication);
            } else if (msgParsed.challengeSuccess) log(`Challenge (${msgParsed.challengeRequestId}) has passed`);
            else
                log(
                    `Challenge ${msgParsed.challengeRequestId} has failed to pass. Challenge errors = ${msgParsed.challengeErrors}, reason = '${msgParsed.reason}'`
                );

            this.emit("challengeverification", { ...msgParsed, publication: decryptedPublication }, this);
            await this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.subplebbit.pubsubTopic, this.handleChallengeExchange);
        }
    }

    async publishChallengeAnswers(challengeAnswers: string[]) {
        assert(this.subplebbit, "Subplebbit is not defined");
        const log = Logger("plebbit-js:publication:publishChallengeAnswers");

        if (!Array.isArray(challengeAnswers)) challengeAnswers = [challengeAnswers];

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
            this.subplebbit.pubsubTopic,
            uint8ArrayFromString(JSON.stringify(this._challengeAnswer))
        );
        log(`Responded to challenge (${this._challengeAnswer.challengeRequestId}) with answers`, challengeAnswers);
        this.emit("challengeanswer", this._challengeAnswer);
    }

    private _validatePublicationFields() {
        if (typeof this.timestamp !== "number" || this.timestamp < 0)
            throwWithErrorCode(
                "ERR_PUBLICATION_MISSING_FIELD",
                `${this.getType()}.publish: timestamp (${this.timestamp}) should be a positive number`
            );

        if (typeof this.author?.address !== "string")
            throwWithErrorCode(
                "ERR_PUBLICATION_MISSING_FIELD",
                `${this.getType()}.publish: author.address (${this.author.address}) should be a string`
            );
        if (typeof this.subplebbitAddress !== "string")
            throwWithErrorCode("ERR_PUBLICATION_MISSING_FIELD", `${this.getType()}.publish: subplebbitAddress should be a string`);
    }

    private _validateSubFields() {
        if (typeof this.subplebbit?.encryption?.publicKey !== "string")
            throwWithErrorCode("ERR_SUBPLEBBIT_MISSING_FIELD", `${this.getType()}.publish: subplebbit.encryption.publicKey does not exist`);

        if (typeof this.subplebbit.pubsubTopic !== "string")
            throwWithErrorCode("ERR_SUBPLEBBIT_MISSING_FIELD", `${this.getType()}.publish: subplebbit.pubsubTopic does not exist`);
    }

    async publish() {
        const log = Logger("plebbit-js:publication:publish");

        this._validatePublicationFields();

        const options = { acceptedChallengeTypes: [] };
        this.subplebbit = await this.plebbit.getSubplebbit(this.subplebbitAddress);

        this._validateSubFields();

        await this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.subplebbit.pubsubTopic, this.handleChallengeExchange);

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
                this.subplebbit.pubsubTopic,
                uint8ArrayFromString(JSON.stringify(this._challengeRequest))
            ),
            this.plebbit.pubsubIpfsClient.pubsub.subscribe(this.subplebbit.pubsubTopic, this.handleChallengeExchange)
        ]);
        log(`Sent a challenge request (${this._challengeRequest.challengeRequestId})`);
        this.emit("challengerequest", this._challengeRequest);
    }
}

export default Publication;
