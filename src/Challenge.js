export const challengeStages = Object.freeze({
    CHALLENGEREQUEST: "CHALLENGEREQUEST",
    CHALLENGE: "CHALLENGE",
    CHALLENGEANSWER: "CHALLENGEANSWER",
    CHALLENGEVERIFICATION: "CHALLENGEVERIFICATION"
});

export const challengeTypes = Object.freeze({"image": "image", "mathcli": "mathcli"});

class Challenge {
    constructor(props) {
        this.stage = props["stage"]; // Current challenge stage. Will be one of challengeStages declared above
        this.challenge = props["challenge"]; // data required to complete the challenge, could be html, png, etc.
        this.requestId = props["requestId"];
        this.answerId = props["answerId"];
        this.answer = props["answer"];
        this.answerIsVerified = props["answerIsVerified"];
        this.answerVerificationReason = props["answerVerificationReason"];
        this.acceptedChallengeTypes = props["acceptedChallengeTypes"];
        this.type = props["type"]; // will be dozens of challenge types, like holding a certain amount of a token
    }

    setStage(newStage) {
        this.stage = newStage;
    }

    setChallenge(newChallenge) {
        this.challenge = newChallenge;
    }

    setAnswer(newChallengeAnswer) {
        this.answer = newChallengeAnswer;
    }

    setAnswerId(newChallengeAnswerId) {
        this.answerId = newChallengeAnswerId;
    }

    setAnswerIsVerified(newChallengeAnswerIsVerified) {
        this.answerIsVerified = newChallengeAnswerIsVerified;
    }

    setAnswerVerificationReason(newFailedVerificationReason) {
        this.answerVerificationReason = newFailedVerificationReason;
    }

    setType(newType){
        this.type = newType;
    }

    toJSONForDb(){
        return {
            "stage": this.stage,
            "challenge": this.challenge,
            "requestId": this.requestId,
            "answerId": this.answerId,
            "answer": this.answer,
            "answerIsVerified": this.answerIsVerified,
            "answerVerificationReason": this.answerVerificationReason,
            "acceptedChallengeTypes": JSON.stringify(this.acceptedChallengeTypes),
            "type": this.type
        };
    }
}
export default Challenge;
export {Challenge};