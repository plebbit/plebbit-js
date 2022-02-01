import {Challenge, challengeStages} from "./Challenge.js";
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string'
import {v4 as uuidv4} from 'uuid';
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';

class Publication {

    constructor(plebbit, subplebbit) {
        this.plebbit = plebbit;
        this.subplebbit = subplebbit;
        this.challenge = null;
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

    async publish(userOptions, solveChallengeCallback) {
        return new Promise(async (resolve, reject) => {

            const options = {"acceptedChallengeTypes": [], ...userOptions};
            if (!this.challenge || this.challenge?.answerIsVerified)
                this.challenge = new Challenge({
                    "requestId": uuidv4(),
                    "acceptedChallengeTypes": options["acceptedChallengeTypes"],
                    "stage": challengeStages["CHALLENGEREQUEST"]
                });
            // TODO check whether post has been added before
            const challengeRequest = {
                "msg": this.toJSON(),
                "challenge": this.challenge
            };

            const handleCaptchaVerification = async (pubsubMsg) => {
                const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
                // Subplebbit owner node will either answer with CHALLENGE OR CHALLENGE VERIFICATION
                this.challenge = msgParsed["challenge"] = new Challenge(msgParsed["challenge"]);
                if (this.challenge.stage === challengeStages.CHALLENGEVERIFICATION) {
                    await this.plebbit.ipfsClient.pubsub.unsubscribe(this.challenge.requestId, processChallenge);
                    await this.plebbit.ipfsClient.pubsub.unsubscribe(this.challenge.answerId, handleCaptchaVerification);
                    if (!this.challenge.answerIsVerified) {
                        console.error(`Failed to solve captcha, reason is: ${this.challenge.answerVerificationReason}`);
                        this.challenge = null;
                        reject(msgParsed);
                    } else
                        resolve(msgParsed);
                }
            };

            const processChallenge = async (pubsubMsg) => {
                const msgParsed = JSON.parse(uint8ArrayToString(pubsubMsg["data"]));
                // Subplebbit owner node will either answer with CHALLENGE OR CHALLENGE VERIFICATION
                this.challenge = msgParsed["challenge"] = new Challenge(msgParsed["challenge"]);
                if (this.challenge.stage === challengeStages.CHALLENGE) {
                    // Process CHALLENGE and reply with ChallengeAnswer
                    const challengeAnswer = solveChallengeCallback(this.challenge);
                    this.challenge.setAnswer(challengeAnswer);
                    this.challenge.setStage(challengeStages.CHALLENGEANSWER);
                    this.challenge.setAnswerId(uuidv4());
                    msgParsed["challenge"] = this.challenge;
                    await this.plebbit.ipfsClient.pubsub.subscribe(this.challenge.answerId, handleCaptchaVerification);
                    await this.plebbit.ipfsClient.pubsub.publish(this.challenge.requestId, uint8ArrayFromString(JSON.stringify(msgParsed)));
                } else if (this.challenge.stage === challengeStages.CHALLENGEVERIFICATION)
                    // If we reach this block that means the subplebbit owner has chosen to skip captcha by returning null on provideCaptchaCallback
                    handleCaptchaVerification(pubsubMsg).then(resolve).catch(reject);
            };

            await this.plebbit.ipfsClient.pubsub.subscribe(this.challenge.requestId, processChallenge);
            const postEncoded = uint8ArrayFromString(JSON.stringify(challengeRequest));

            await this.plebbit.ipfsClient.pubsub.publish(this.subplebbit.pubsubTopic, postEncoded);
        });


    }

}

export default Publication;