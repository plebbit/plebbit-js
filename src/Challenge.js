export const CHALLENGE_STAGES = Object.freeze({
    CHALLENGEREQUEST: "CHALLENGEREQUEST",
    CHALLENGE: "CHALLENGE",
    CHALLENGEANSWER: "CHALLENGEANSWER",
    CHALLENGEVERIFICATION: "CHALLENGEVERIFICATION"
});

export const CHALLENGE_TYPES = Object.freeze({
    IMAGE: "image",
    TEXT: "text",
    VIDEO: "video",
    AUDIO: "audio",
    HTML: "html"
});

class Challenge {
    constructor(props) {
        this.stage = props["stage"]; // Current challenge stage. Will be one of challengeStages declared above
        this.challenge = props["challenge"] || null; // data required to complete the challenge, could be html, png, etc.
        this.requestId = props["requestId"];
        this.answerId = props["answerId"] || null;
        this.answer = props["answer"] || null;
        this.answerIsVerified = Boolean(props["answerIsVerified"]);
        this.answerVerificationReason = props["answerVerificationReason"] || null;
        this.acceptedChallengeTypes = (typeof props["acceptedChallengeTypes"] === 'string' || props["acceptedChallengeTypes"] instanceof String) ? JSON.parse(props["acceptedChallengeTypes"]) : props["acceptedChallengeTypes"];
        this.type = props["type"] || null; // will be dozens of challenge types, like holding a certain amount of a token
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

    setType(newType) {
        this.type = newType;
    }

    toJSONForDb() {
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