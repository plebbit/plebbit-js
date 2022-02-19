import {Challenge, CHALLENGE_STAGES} from "./Challenge.js";
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string'
import {v4 as uuidv4} from 'uuid';
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import assert from "assert";

class Publication {

    constructor(props,subplebbit) {
        this.subplebbit = subplebbit;
        this.challenge = props["challenge"];
    }

    setSubplebbit(newSubplebbit) {
        this.subplebbit = newSubplebbit;
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
        return {"subplebbitIpnsName": this.subplebbit.ipnsName, "challenge": this.challenge};
    }

    async #publish(userOptions, solveChallengeCallback) {
        return new Promise(async (resolve, reject) => {

            const options = {"acceptedChallengeTypes": [], ...userOptions};
            if (!this.challenge || this.challenge?.answerIsVerified)
                this.challenge = new Challenge({
                    "requestId": uuidv4(),
                    "acceptedChallengeTypes": options["acceptedChallengeTypes"],
                    "stage": CHALLENGE_STAGES["CHALLENGEREQUEST"]
                });
            // TODO check whether post has been added before
            const challengeRequest = {
                "msg": this.toJSON(),
                "challenge": this.challenge
            };

            const handleCaptchaVerification = async (pubsubMsg) => {
                const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
                // Subplebbit owner node will either answer with CHALLENGE OR CHALLENGE VERIFICATION
                if (msgParsed.challenge.stage === CHALLENGE_STAGES.CHALLENGEVERIFICATION) {
                    this.challenge = msgParsed["challenge"] = new Challenge(msgParsed["challenge"]);
                    if (!this.challenge.answerIsVerified || msgParsed.msg.error) {
                        reject(msgParsed);
                    } else
                        resolve(msgParsed);
                }
            };

            const processChallenge = async (pubsubMsg) => {
                const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
                // Subplebbit owner node will either answer with CHALLENGE OR CHALLENGE VERIFICATION
                if (msgParsed.challenge.stage === CHALLENGE_STAGES.CHALLENGE) {
                    this.challenge = msgParsed["challenge"] = new Challenge(msgParsed["challenge"]);
                    // Process CHALLENGE and reply with ChallengeAnswer
                    assert(solveChallengeCallback, "User has not provided a callback for solving challenge");
                    const challengeAnswer = await solveChallengeCallback(this.challenge);
                    this.challenge.setAnswer(challengeAnswer);
                    this.challenge.setStage(CHALLENGE_STAGES.CHALLENGEANSWER);
                    this.challenge.setAnswerId(uuidv4());
                    msgParsed["challenge"] = this.challenge;
                    await this.subplebbit.ipfsClient.pubsub.subscribe(this.challenge.answerId, handleCaptchaVerification);
                    await this.subplebbit.ipfsClient.pubsub.publish(this.challenge.requestId, uint8ArrayFromString(JSON.stringify(msgParsed)));
                } else if (msgParsed.challenge.stage === CHALLENGE_STAGES.CHALLENGEVERIFICATION) {
                    // If we reach this block that means the subplebbit owner has chosen to skip captcha by returning null on provideCaptchaCallback
                    this.challenge = msgParsed["challenge"] = new Challenge(msgParsed["challenge"]);
                    handleCaptchaVerification(pubsubMsg).then(resolve).catch(reject);
                }
            };

            await this.subplebbit.ipfsClient.pubsub.subscribe(this.challenge.requestId, processChallenge);
            const publicationEncoded = uint8ArrayFromString(JSON.stringify(challengeRequest));

            await this.subplebbit.ipfsClient.pubsub.publish(this.subplebbit.pubsubTopic, publicationEncoded);
        });


    }

    async publish(userOptions, solveChallengeCallback) {
        return new Promise(async (resolve, reject) => {
            this.#publish(userOptions, solveChallengeCallback).then(resolve).catch(reject).finally(async () => {
                // Unsubscribe all events
                try {
                    if (this.challenge?.requestId)
                        await this.subplebbit.ipfsClient.pubsub.unsubscribe(this.challenge.requestId);
                    if (this.challenge?.answerId)
                        await this.subplebbit.ipfsClient.pubsub.unsubscribe(this.challenge.answerId);
                } catch {
                }
                const topics = await this.subplebbit.ipfsClient.pubsub.ls();
                assert(!topics.includes(this.challenge.requestId), "Failed to unsubscribe from challenge request ID event");
                assert(!topics.includes(this.challenge.answerId), "Failed to unsubscribe from challenge answer ID event");
            })
        });
    }

}

export default Publication;