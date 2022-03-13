import {ChallengeAnswerMessage, ChallengeRequestMessage, PUBSUB_MESSAGE_TYPES} from "./Challenge.js";
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string'
import {v4 as uuidv4} from 'uuid';
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import assert from "assert";

class Publication {

    constructor(props, subplebbit) {
        this.subplebbit = subplebbit;
        this._initProps(props);
    }

    _initProps(props) {
        this.subplebbitAddress = props["subplebbitAddress"] || this.subplebbit.subplebbitAddress;
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
        return {"subplebbitAddress": this.subplebbitAddress};
    }

    async #publish(userOptions, solveChallengeCallback) {
        return new Promise(async (resolve, reject) => {

            const options = {"acceptedChallengeTypes": [], ...userOptions};
            const challengeRequest = new ChallengeRequestMessage({
                "publication": this.toJSON(),
                "challengeRequestId": uuidv4(),
                "acceptedChallengeTypes": options["acceptedChallengeTypes"]
            });

            const handleCaptchaVerification = async (pubsubMsg) => {
                const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
                // Subplebbit owner node will either answer with CHALLENGE OR CHALLENGE VERIFICATION
                if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION) {
                    if (!msgParsed.challengePassed)
                        reject(msgParsed);
                    else {
                        this._initProps(msgParsed.publication);
                        resolve(msgParsed);
                    }
                }
            };

            const processChallenge = async (pubsubMsg) => {
                const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
                // Subplebbit owner node will either answer with CHALLENGE OR CHALLENGE VERIFICATION
                if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGE) {
                    // Process CHALLENGE and reply with ChallengeAnswer
                    assert(solveChallengeCallback, "User has not provided a callback for solving challenge");
                    const answers = await solveChallengeCallback(msgParsed);
                    const challengeAnswer = new ChallengeAnswerMessage({
                        "challengeRequestId": msgParsed.challengeRequestId, "challengeAnswerId": uuidv4(),
                        "challengeAnswers": answers
                    });
                    await this.subplebbit.plebbit.ipfsClient.pubsub.subscribe(challengeAnswer.challengeAnswerId, handleCaptchaVerification);
                    await this.subplebbit.plebbit.ipfsClient.pubsub.publish(challengeAnswer.challengeRequestId, uint8ArrayFromString(JSON.stringify(challengeAnswer)));
                } else if (msgParsed.type === PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION)
                    // If we reach this block that means the subplebbit owner has chosen to skip captcha by returning null on provideCaptchaCallback
                    handleCaptchaVerification(pubsubMsg).then(resolve).catch(reject);
            };
            await this.subplebbit.plebbit.ipfsClient.pubsub.subscribe(challengeRequest.challengeRequestId, processChallenge);
            await this.subplebbit.plebbit.ipfsClient.pubsub.publish(this.subplebbit.pubsubTopic, uint8ArrayFromString(JSON.stringify(challengeRequest)));
        });


    }

    async publish(userOptions, solveChallengeCallback) {
        return new Promise(async (resolve, reject) => {
            this.#publish(userOptions, solveChallengeCallback).then(async (challengeVerificationMessage) => {
                // Unsubscribe all events
                try {
                    await this.subplebbit.plebbit.ipfsClient.pubsub.unsubscribe(challengeVerificationMessage.challengeRequestId);
                    await this.subplebbit.plebbit.ipfsClient.pubsub.unsubscribe(challengeVerificationMessage.challengeAnswerId);
                    const topics = await this.subplebbit.plebbit.ipfsClient.pubsub.ls();
                    assert(!topics.includes(challengeVerificationMessage.challengeRequestId), "Failed to unsubscribe from challenge request ID event");
                    assert(!topics.includes(challengeVerificationMessage.challengeAnswerId), "Failed to unsubscribe from challenge answer ID event");
                    resolve(challengeVerificationMessage);
                } catch {
                }
            }).catch(reject)
        });
    }

}

export default Publication;