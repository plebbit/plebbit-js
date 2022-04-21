import {ChallengeAnswerMessage, ChallengeRequestMessage, PUBSUB_MESSAGE_TYPES} from "./Challenge.js";
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string'
import {v4 as uuidv4} from 'uuid';
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import EventEmitter from "events";
import Debug from "debug";
import {parseJsonIfString, timestamp} from "./Util.js";
import Author from "./Author.js";
import {decrypt, encrypt} from "./Signer.js";


const debug = Debug("plebbit-js:Publication");


class Publication extends EventEmitter {
    constructor(props, subplebbit) {
        super();
        this.subplebbit = subplebbit;
        this._initProps(props);
    }

    _initProps(props) {
        this.subplebbitAddress = props["subplebbitAddress"] || this.subplebbit.subplebbitAddress;
        this.timestamp = props["timestamp"] || timestamp();
        this.signer = this.signer || props["signer"];
        this.signature = parseJsonIfString(props["signature"]);
        this.author = props["author"] ? new Author(props["author"]) : undefined;
    }

    setSubplebbit(newSubplebbit) {
        this.subplebbit = newSubplebbit;
        this.subplebbitAddress = this.subplebbit.subplebbitAddress;
    }

    getType() {
        if (this.hasOwnProperty("title"))
            return "post";
        else if (this.hasOwnProperty("vote"))
            return "vote";
        else
            return "comment";
    }

    toJSON() {
        return {...(this.toJSONSkeleton())};
    }

    toJSONSkeleton() {
        return {
            "subplebbitAddress": this.subplebbitAddress, "timestamp": this.timestamp, "signature": this.signature,
            "author": this.author,
        };
    }

    async #handleChallengeExchange(pubsubMsg) {
        const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
        if (msgParsed?.challengeRequestId !== this.challenge.challengeRequestId)
            return; // Process only this publication's challenge
        if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGE) {
            debug(`Received challenges, will emit them and wait for user to solve them and call publishChallengeAnswers`);
            this.emit("challenge", msgParsed);
        } else if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION) {
            if (!msgParsed.challengePassed)
                debug(`Challenge ${msgParsed.challengeRequestId} has failed to pass. Challenge errors = ${msgParsed.challengeErrors}, reason = ${msgParsed.reason}`);
            else {
                debug(`Challenge (${msgParsed.challengeRequestId}) has passed. Will update publication props from ChallengeVerificationMessage.publication`);
                msgParsed.publication = JSON.parse(await decrypt(msgParsed.encryptedPublication.encryptedString, msgParsed.encryptedPublication.encryptedKey, this.signer.privateKey));
                this._initProps(msgParsed.publication);
            }
            this.emit("challengeverification", [msgParsed, this]);
        }

    }

    async publishChallengeAnswers(challengeAnswers) {
        const challengeAnswer = new ChallengeAnswerMessage({
            "challengeRequestId": this.challenge.challengeRequestId,
            "challengeAnswerId": uuidv4(),
            "challengeAnswers": challengeAnswers
        });
        await this.subplebbit.plebbit.ipfsClient.pubsub.publish(this.subplebbit.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeAnswer)));
        debug(`Responded to challenge (${challengeAnswer.challengeRequestId}) with answers`);
    }

    async publish(userOptions) {
        const options = {"acceptedChallengeTypes": [], ...userOptions};
        const encryptedPublication = await encrypt(JSON.stringify(this), this.subplebbit.encryption.publicKey);
        this.challenge = new ChallengeRequestMessage({
            "encryptedPublication": encryptedPublication,
            "challengeRequestId": uuidv4(),
            ...options,
        });
        await Promise.all([
            this.subplebbit.plebbit.ipfsClient.pubsub.publish(this.subplebbit.pubsubTopic, uint8ArrayFromString(JSON.stringify(this.challenge))),
            this.subplebbit.plebbit.ipfsClient.pubsub.subscribe(this.subplebbit.pubsubTopic, this.#handleChallengeExchange.bind(this))
        ]);
        debug(`Sent a challenge request (${this.challenge.challengeRequestId})`);
    }
}

export default Publication;