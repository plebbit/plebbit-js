import { ChallengeAnswerMessage, ChallengeRequestMessage, ChallengeVerificationMessage } from "./challenge";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { v4 as uuidv4 } from "uuid";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import EventEmitter from "events";
import { parseJsonIfString } from "./util";
import Author from "./author";
import assert from "assert";
import { Subplebbit } from "./subplebbit";
import { decrypt, encrypt, Signature, Signer, verifyPublication } from "./signer";
import {
    ChallengeMessageType,
    ChallengeType,
    ChallengeVerificationMessageType,
    DecryptedChallengeMessageType,
    ProtocolVersion,
    PublicationType,
    PublicationTypeName
} from "./types";
import errcode from "err-code";
import { codes, messages } from "./errors";
import Logger from "@plebbit/plebbit-logger";

class Publication extends EventEmitter implements PublicationType {
    subplebbitAddress: string;
    timestamp: number;
    signature: Signature;
    signer: Signer;
    author: Author;
    protocolVersion: ProtocolVersion;

    // private
    protected subplebbit: Subplebbit;
    private challenge: ChallengeRequestMessage;

    constructor(props: PublicationType, subplebbit) {
        super();
        this.subplebbit = subplebbit;
        this._initProps(props);
    }

    _initProps(props: PublicationType) {
        this.subplebbitAddress = props["subplebbitAddress"];
        this.timestamp = props["timestamp"];
        this.signer = this.signer || props["signer"];
        this.signature = parseJsonIfString(props.signature);
        assert(props.author?.address, "publication.author.address need to be defined");
        this.author = new Author(parseJsonIfString(props.author));
        this.protocolVersion = props.protocolVersion;
    }
    getType(): PublicationTypeName {
        throw new Error(`Should be implemented by children of Publication`);
    }

    toJSON(): PublicationType {
        return { ...this.toJSONSkeleton() };
    }

    toJSONSkeleton(): PublicationType {
        return {
            subplebbitAddress: this.subplebbitAddress,
            timestamp: this.timestamp,
            signature: this.signature instanceof Signature ? this.signature.toJSON() : this.signature,
            author: this.author.toJSON(),
            protocolVersion: this.protocolVersion
        };
    }

    async handleChallengeExchange(pubsubMsg) {
        const log = Logger("plebbit-js:publication:handleChallengeExchange");

        const msgParsed: ChallengeMessageType | ChallengeVerificationMessageType = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
        if (msgParsed?.challengeRequestId !== this.challenge.challengeRequestId) return; // Process only this publication's challenge
        if (msgParsed?.type === "CHALLENGE") {
            log(
                `Received encrypted challenges.  Will decrypt and emit them on "challenge". User shoud publish solution by calling publishChallengeAnswers`
            );
            const decryptedChallenges: ChallengeType[] = JSON.parse(
                await decrypt(msgParsed.encryptedChallenges.encrypted, msgParsed.encryptedChallenges.encryptedKey, this.signer.privateKey)
            );
            const decryptedChallenge: DecryptedChallengeMessageType = { ...msgParsed, challenges: decryptedChallenges };
            this.emit("challenge", decryptedChallenge);
        } else if (msgParsed?.type === "CHALLENGEVERIFICATION") {
            let decryptedPublication: PublicationType | undefined;
            if (!(<ChallengeVerificationMessage>msgParsed).challengeSuccess)
                log.error(
                    `Challenge ${msgParsed.challengeRequestId} has failed to pass. Challenge errors = ${
                        (<ChallengeVerificationMessage>msgParsed).challengeErrors
                    }, reason = ${(<ChallengeVerificationMessage>msgParsed).reason}`
                );
            else {
                log(
                    `Challenge (${msgParsed.challengeRequestId}) has passed. Will update publication props from ChallengeVerificationMessage.publication`
                );
                assert(msgParsed.encryptedPublication, "Challengeverification did not include encrypted publication");
                decryptedPublication = JSON.parse(
                    await decrypt(
                        msgParsed.encryptedPublication.encrypted,
                        msgParsed.encryptedPublication.encryptedKey,
                        this.signer.privateKey
                    )
                );
                assert(decryptedPublication);
                this._initProps(decryptedPublication);
            }
            this.emit("challengeverification", { ...msgParsed, publication: decryptedPublication }, this);
            await this.subplebbit.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.subplebbit.pubsubTopic);
        }
    }

    async publishChallengeAnswers(challengeAnswers: string[]) {
        const log = Logger("plebbit-js:publication:publishChallengeAnswers");

        if (!Array.isArray(challengeAnswers)) challengeAnswers = [challengeAnswers];

        // Encrypt challenges here
        const encryptedChallengeAnswers = await encrypt(JSON.stringify(challengeAnswers), this.subplebbit.encryption.publicKey);

        const challengeAnswer = new ChallengeAnswerMessage({
            challengeRequestId: this.challenge.challengeRequestId,
            challengeAnswerId: uuidv4(),
            encryptedChallengeAnswers: encryptedChallengeAnswers
        });
        await this.subplebbit.plebbit.pubsubIpfsClient.pubsub.publish(
            this.subplebbit.pubsubTopic,
            uint8ArrayFromString(JSON.stringify(challengeAnswer))
        );
        log(`Responded to challenge (${challengeAnswer.challengeRequestId}) with answers ${JSON.stringify(challengeAnswers)}`);
        this.emit("challengeanswer", challengeAnswer);
    }

    async publish(userOptions) {
        const log = Logger("plebbit-js:publication:publish");

        if (typeof this.timestamp !== "number" || this.timestamp <= 0)
            throw errcode(Error(messages.ERR_PUBLICATION_MISSING_FIELD), codes.ERR_PUBLICATION_MISSING_FIELD, {
                details: `${this.getType()}.publish: timestamp should be a number`
            });

        if (typeof this.author?.address !== "string")
            throw errcode(Error(messages.ERR_PUBLICATION_MISSING_FIELD), codes.ERR_PUBLICATION_MISSING_FIELD, {
                details: `${this.getType()}.publish: author.address should be a string`
            });
        if (typeof this.subplebbitAddress !== "string")
            throw errcode(Error(messages.ERR_PUBLICATION_MISSING_FIELD), codes.ERR_PUBLICATION_MISSING_FIELD, {
                details: `${this.getType()}.publish: subplebbitAddress should be a string`
            });

        const [isSignatureValid, failedVerificationReason] = await verifyPublication(this, this.subplebbit.plebbit, this.getType());
        if (!isSignatureValid)
            throw errcode(Error(messages.ERR_FAILED_TO_VERIFY_SIGNATURE), codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
                details: `${this.getType()}.publish: Failed verification reason: ${failedVerificationReason}, publication: ${JSON.stringify(
                    this
                )}`
            });

        const options = { acceptedChallengeTypes: [], ...userOptions };
        this.subplebbit = await this.subplebbit.plebbit.getSubplebbit(this.subplebbitAddress);

        if (typeof this.subplebbit?.encryption?.publicKey !== "string")
            throw errcode(Error(messages.ERR_SUBPLEBBIT_MISSING_FIELD), codes.ERR_SUBPLEBBIT_MISSING_FIELD, {
                details: `${this.getType()}.publish: subplebbit.encryption.publicKey does not exist`
            });

        if (typeof this.subplebbit.pubsubTopic !== "string")
            throw errcode(Error(messages.ERR_SUBPLEBBIT_MISSING_FIELD), codes.ERR_SUBPLEBBIT_MISSING_FIELD, {
                details: `${this.getType()}.publish: subplebbit.pubsubTopic does not exist`
            });

        const encryptedPublication = await encrypt(JSON.stringify(this), this.subplebbit.encryption.publicKey);

        this.challenge = new ChallengeRequestMessage({
            encryptedPublication: encryptedPublication,
            challengeRequestId: uuidv4(),
            ...options
        });
        log.trace(`Attempting to publish ${this.getType()} with options (${JSON.stringify(options)})`);

        await Promise.all([
            this.subplebbit.plebbit.pubsubIpfsClient.pubsub.publish(
                this.subplebbit.pubsubTopic,
                uint8ArrayFromString(JSON.stringify(this.challenge))
            ),
            this.subplebbit.plebbit.pubsubIpfsClient.pubsub.subscribe(this.subplebbit.pubsubTopic, this.handleChallengeExchange.bind(this))
        ]);
        log(`Sent a challenge request (${this.challenge.challengeRequestId})`);
        this.emit("challengerequest", this.challenge);
    }
}

export default Publication;
