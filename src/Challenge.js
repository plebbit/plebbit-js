const challengeStages = Object.freeze({
    CHALLENGEREQUEST: "CHALLENGEREQUEST",
    CHALLENGE: "CHALLENGE",
    CHALLENGEANSWER: "CHALLENGEANSWER",
    CHALLENGEVERIFICATION: "CHALLENGEVERIFICATION"
});

class Challenge {
    constructor(props) {
        this.stage = props["stage"]; // will be dozens of challenge types, like holding a certain amount of a token
        this.challenge = props["challenge"]; // data required to complete the challenge, could be html, png, etc.
        this.requestId = props["requestId"];
        this.answerId = props["answerId"];
        this.answer = props["answer"];
        this.answerIsVerified = props["answerIsVerified"];
        this.failedVerificationReason = props["failedVerificationReason"];
        this.acceptedChallengeTypes = props["acceptedChallengeTypes"];
        this.type = props["type"];
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

    setFailedVerificationReason(newFailedVerificationReason) {
        this.failedVerificationReason = newFailedVerificationReason;
    }

    setType(newType){
        this.type = newType;
    }
}

export {challengeStages, Challenge};