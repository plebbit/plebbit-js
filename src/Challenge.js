import {parseJsonIfString} from "./Util.js";

export const PUBSUB_MESSAGE_TYPES = Object.freeze({
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

export class Challenge {
    constructor(props) {
        this.challenge = props["challenge"];
        this.type = props["type"]; // will be dozens of challenge types, like holding a certain amount of a token
    }
}

class ChallengeBase {
    toJSONForDb() {
        const obj = JSON.parse(JSON.stringify(this));
        delete obj.publication;
        return obj;
    }
}

export class ChallengeRequestMessage extends ChallengeBase {
    constructor(props) {
        super();
        this.type = PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST // One of CHALLENGE_STAGES
        this.challengeRequestId = props["challengeRequestId"];
        this.acceptedChallengeTypes = parseJsonIfString(props["acceptedChallengeTypes"]);
        this.publication = props["publication"];
    }

    toJSONForDb() {
        return {...super.toJSONForDb(), "acceptedChallengeTypes": JSON.stringify(this.acceptedChallengeTypes)};
    }
}

export class ChallengeMessage extends ChallengeBase {
    constructor(props) {
        super();
        this.type = PUBSUB_MESSAGE_TYPES.CHALLENGE;
        this.challengeRequestId = props["challengeRequestId"];
        this.challenges = parseJsonIfString(props["challenges"]);
    }

    toJSONForDb() {
        return {...super.toJSONForDb(), "challenges": JSON.stringify(this.challenges)};
    }
}

export class ChallengeAnswerMessage extends ChallengeBase {
    constructor(props) {
        super();
        this.type = PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER;
        this.challengeRequestId = props["challengeRequestId"];
        this.challengeAnswerId = props["challengeAnswerId"];
        this.challengeAnswers = parseJsonIfString(props["challengeAnswers"]);
    }

    toJSONForDb() {
        return {...super.toJSONForDb(), "challengeAnswers": JSON.stringify(this.challengeAnswers)};
    }
}

export class ChallengeVerificationMessage extends ChallengeBase {
    constructor(props) {
        super();
        this.type = PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION;
        this.challengeRequestId = props["challengeRequestId"];
        this.challengeAnswerId = props["challengeAnswerId"];
        this.challengePassed = props["challengePassed"];
        this.challengeErrors = parseJsonIfString(props["challengeErrors"]);
        this.reason = props["reason"];
        this.publication = props["publication"];
    }

    toJSONForDb() {
        return {...super.toJSONForDb(), "challengeErrors": JSON.stringify(this.challengeErrors)};
    }
}