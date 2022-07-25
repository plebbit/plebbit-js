import { ChallengeAnswerMessage, ChallengeRequestMessage, PUBSUB_MESSAGE_TYPES } from "./challenge";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { v4 as uuidv4 } from "uuid";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import EventEmitter from "events";
import { getDebugLevels, parseJsonIfString } from "./util";
import Author from "./author";
import assert from "assert";
import { Subplebbit } from "./subplebbit";
import { decrypt, encrypt, Signature, Signer, verifyPublication } from "./signer";
import { ProtocolVersion, PublicationType, PublicationTypeName } from "./types";

const debugs = getDebugLevels("publication");

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
        this.signature = parseJsonIfString(props["signature"]);
        assert(props.author?.address, "publication.author.address need to be defined");
        this.author = new Author(parseJsonIfString(props["author"]));
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
        const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
        if (msgParsed?.challengeRequestId !== this.challenge.challengeRequestId) return; // Process only this publication's challenge
        if (msgParsed?.type === PUBSUB_MESSAGE_TYPES.CHALLENGE) {
            debugs.INFO(`Received challenges, will emit them and wait for user to solve them and call publishChallengeAnswers`);
            this.emit("challenge", msgParsed);
        } else if (msgParsed?.type === PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION) {
            if (!msgParsed.challengeSuccess)
                debugs.WARN(
                    `Challenge ${msgParsed.challengeRequestId} has failed to pass. Challenge errors = ${msgParsed.challengeErrors}, reason = ${msgParsed.reason}`
                );
            else {
                debugs.INFO(
                    `Challenge (${msgParsed.challengeRequestId}) has passed. Will update publication props from ChallengeVerificationMessage.publication`
                );
                msgParsed.publication = JSON.parse(
                    await decrypt(
                        msgParsed.encryptedPublication.encrypted,
                        msgParsed.encryptedPublication.encryptedKey,
                        this.signer.privateKey
                    )
                );
                this._initProps(msgParsed.publication);
            }
            this.emit("challengeverification", msgParsed, this);
            await this.subplebbit.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.subplebbit.pubsubTopic);
        }
    }

    async publishChallengeAnswers(challengeAnswers) {
        try {
            if (!Array.isArray(challengeAnswers)) challengeAnswers = [challengeAnswers];
            debugs.DEBUG(`Challenge Answers: ${challengeAnswers}`);
            const challengeAnswer = new ChallengeAnswerMessage({
                challengeRequestId: this.challenge.challengeRequestId,
                challengeAnswerId: uuidv4(),
                challengeAnswers: challengeAnswers
            });
            await this.subplebbit.plebbit.pubsubIpfsClient.pubsub.publish(
                this.subplebbit.pubsubTopic,
                uint8ArrayFromString(JSON.stringify(challengeAnswer))
            );
            debugs.DEBUG(`Responded to challenge (${challengeAnswer.challengeRequestId}) with answers ${JSON.stringify(challengeAnswers)}`);
        } catch (e) {
            debugs.ERROR(`Failed to publish challenge answers: `, e);
        }
    }

    async publish(userOptions) {
        assert(this.timestamp, "Need timestamp field to publish publication");
        assert(this.author?.address, "Need author address to publish publication");

        const [isSignatureValid, failedVerificationReason] = await verifyPublication(this, this.subplebbit.plebbit, this.getType());
        assert.ok(
            isSignatureValid,
            `Failed to publish since signature is invalid, failed verification reason: ${failedVerificationReason}`
        );
        assert.ok(this.subplebbitAddress);

        const options = { acceptedChallengeTypes: [], ...userOptions };
        debugs.DEBUG(`Attempting to publish ${this.getType()} with options (${JSON.stringify(options)})`);
        this.subplebbit = await this.subplebbit.plebbit.getSubplebbit(this.subplebbitAddress);
        assert.ok(this.subplebbit?.encryption?.publicKey, "Failed to load subplebbit for publishing");
        const encryptedPublication = await encrypt(JSON.stringify(this), this.subplebbit.encryption.publicKey);

        this.challenge = new ChallengeRequestMessage({
            encryptedPublication: encryptedPublication,
            challengeRequestId: uuidv4(),
            ...options
        });
        await Promise.all([
            this.subplebbit.plebbit.pubsubIpfsClient.pubsub.publish(
                this.subplebbit.pubsubTopic,
                uint8ArrayFromString(JSON.stringify(this.challenge))
            ),
            this.subplebbit.plebbit.pubsubIpfsClient.pubsub.subscribe(this.subplebbit.pubsubTopic, this.handleChallengeExchange.bind(this))
        ]);
        debugs.INFO(`Sent a challenge request (${this.challenge.challengeRequestId})`);
    }
}

export default Publication;
