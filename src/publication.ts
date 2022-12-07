import { ChallengeAnswerMessage, ChallengeRequestMessage } from "./challenge";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { v4 as uuidv4 } from "uuid";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import EventEmitter from "events";
import Author from "./author";
import assert from "assert";
import { decrypt, encrypt, Signature, Signer } from "./signer";
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
import { throwWithErrorCode } from "./util";

class Publication extends EventEmitter implements PublicationType {
    subplebbitAddress: string;
    timestamp: number;
    signature: Signature;
    signer: Signer;
    author: Author;
    protocolVersion: ProtocolVersion;

    // private
    protected plebbit: Plebbit;
    protected subplebbit?: Subplebbit;
    private challenge: ChallengeRequestMessage;

    constructor(props: PublicationType, plebbit: Plebbit) {
        super();
        this.plebbit = plebbit;
        this._initProps(props);
    }

    _initProps(props: PublicationType) {
        this.subplebbitAddress = props.subplebbitAddress;
        this.timestamp = props.timestamp;
        this.signer = this.signer || props["signer"];
        this.signature = new Signature(props.signature);
        assert(props.author?.address, "publication.author.address need to be defined");
        this.author = new Author(props.author);
        this.protocolVersion = props.protocolVersion;
    }
    // TODO make this private/protected

    getType(): PublicationTypeName {
        throw new Error(`Should be implemented by children of Publication`);
    }

    toJSON(): PublicationType {
        return { ...this.toJSONSkeleton() };
    }

    // TODO make this private/protected
    toJSONSkeleton(): PublicationType {
        return {
            subplebbitAddress: this.subplebbitAddress,
            timestamp: this.timestamp,
            signature: this.signature instanceof Signature ? this.signature.toJSON() : this.signature,
            author: this.author.toJSON(),
            protocolVersion: this.protocolVersion
        };
    }

    private async handleChallengeExchange(pubsubMsg) {
        const log = Logger("plebbit-js:publication:handleChallengeExchange");

        const msgParsed: ChallengeMessageType | ChallengeVerificationMessageType = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
        if (msgParsed?.challengeRequestId !== this.challenge.challengeRequestId) return; // Process only this publication's challenge
        if (msgParsed?.type === "CHALLENGE") {
            const challengeMsgValidity = await verifyChallengeMessage(msgParsed);
            if (!challengeMsgValidity.valid) {
                log.error(`Received a CHALLENGEMESSAGE with invalid signature. Failed verification reason: ${challengeMsgValidity.reason}`);
                return;
            }

            log(
                `Received encrypted challenges.  Will decrypt and emit them on "challenge" event. User shoud publish solution by calling publishChallengeAnswers`
            );
            const decryptedChallenges: ChallengeType[] = JSON.parse(
                await decrypt(msgParsed.encryptedChallenges.encrypted, msgParsed.encryptedChallenges.encryptedKey, this.signer.privateKey)
            );
            const decryptedChallenge: DecryptedChallengeMessageType = { ...msgParsed, challenges: decryptedChallenges };
            this.emit("challenge", decryptedChallenge);
        } else if (msgParsed?.type === "CHALLENGEVERIFICATION") {
            const signatureValidation = await verifyChallengeVerification(msgParsed);
            if (!signatureValidation.valid) {
                log.error(
                    `Received a CHALLENGEVERIFICATIONMESSAGE with invalid signature. Failed verification reason: ${signatureValidation.reason}`
                );
                return;
            }
            let decryptedPublication: PublicationType | undefined;
            if (msgParsed.challengeSuccess && msgParsed.encryptedPublication) {
                log(
                    `Challenge (${msgParsed.challengeRequestId}) has passed. Will update publication props from ChallengeVerificationMessage.publication`
                );
                decryptedPublication = JSON.parse(
                    await decrypt(
                        msgParsed.encryptedPublication.encrypted,
                        msgParsed.encryptedPublication.encryptedKey,
                        this.signer.privateKey
                    )
                );
                assert(decryptedPublication);
                this._initProps(decryptedPublication);
            } else
                log.error(
                    `Challenge ${msgParsed.challengeRequestId} has failed to pass. Challenge errors = ${msgParsed.challengeErrors}, reason = '${msgParsed.reason}'`
                );

            this.emit("challengeverification", { ...msgParsed, publication: decryptedPublication }, this);
            await this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.subplebbit.pubsubTopic);
        }
    }

    async publishChallengeAnswers(challengeAnswers: string[]) {
        assert(this.subplebbit, "Subplebbit is not defined");
        const log = Logger("plebbit-js:publication:publishChallengeAnswers");

        if (!Array.isArray(challengeAnswers)) challengeAnswers = [challengeAnswers];

        // Encrypt challenges here
        const encryptedChallengeAnswers = await encrypt(JSON.stringify(challengeAnswers), this.subplebbit.encryption.publicKey);

        const toSignAnswer: Omit<ChallengeAnswerMessageType, "signature"> = {
            type: "CHALLENGEANSWER",
            challengeRequestId: this.challenge.challengeRequestId,
            challengeAnswerId: uuidv4(),
            encryptedChallengeAnswers: encryptedChallengeAnswers,
            userAgent: env.USER_AGENT,
            protocolVersion: env.PROTOCOL_VERSION
        };
        const challengeAnswer = new ChallengeAnswerMessage({
            ...toSignAnswer,
            signature: await signChallengeAnswer(toSignAnswer, this.signer)
        });
        await this.plebbit.pubsubIpfsClient.pubsub.publish(
            this.subplebbit.pubsubTopic,
            uint8ArrayFromString(JSON.stringify(challengeAnswer))
        );
        log(`Responded to challenge (${challengeAnswer.challengeRequestId}) with answers`, challengeAnswers);
        this.emit("challengeanswer", challengeAnswer);
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

        const encryptedPublication = await encrypt(JSON.stringify(this), this.subplebbit.encryption.publicKey);

        const toSignMsg: Omit<ChallengeRequestMessageType, "signature"> = {
            type: "CHALLENGEREQUEST",
            encryptedPublication,
            challengeRequestId: uuidv4(),
            acceptedChallengeTypes: options.acceptedChallengeTypes,
            userAgent: env.USER_AGENT,
            protocolVersion: env.PROTOCOL_VERSION
        };

        this.challenge = new ChallengeRequestMessage({ ...toSignMsg, signature: await signChallengeRequest(toSignMsg, this.signer) });
        log.trace(`Attempting to publish ${this.getType()} with options`, options);

        await Promise.all([
            this.plebbit.pubsubIpfsClient.pubsub.publish(this.subplebbit.pubsubTopic, uint8ArrayFromString(JSON.stringify(this.challenge))),
            this.plebbit.pubsubIpfsClient.pubsub.subscribe(this.subplebbit.pubsubTopic, this.handleChallengeExchange.bind(this))
        ]);
        log(`Sent a challenge request (${this.challenge.challengeRequestId})`);
        this.emit("challengerequest", this.challenge);
    }
}

export default Publication;
