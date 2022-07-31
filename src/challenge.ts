import { parseJsonIfString } from "./util";
import { Encrypted } from "./types";

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
    challenge: any;
    type: string;
    constructor(props: Challenge) {
        this.challenge = props.challenge;
        this.type = props.type; // will be dozens of challenge types, like holding a certain amount of a token
    }
}

class ChallengeBase {
    type: string;
    challengeRequestId: string;
    acceptedChallengeTypes?: string[];
    encryptedPublication?: Encrypted;
    challengeAnswerId: string;

    toJSONForDb?() {
        const obj = JSON.parse(JSON.stringify(this));
        delete obj.encryptedPublication;
        return obj;
    }
}

export class ChallengeRequestMessage extends ChallengeBase {
    encryptedPublication: Encrypted;
    constructor(props: Omit<ChallengeRequestMessage, "type">) {
        super();
        this.type = PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST; // One of CHALLENGE_STAGES
        this.challengeRequestId = props.challengeRequestId;
        this.acceptedChallengeTypes = parseJsonIfString(props.acceptedChallengeTypes);
        this.encryptedPublication = props.encryptedPublication;
    }

    toJSONForDb?() {
        return { ...super.toJSONForDb(), acceptedChallengeTypes: JSON.stringify(this.acceptedChallengeTypes) };
    }
}

export class ChallengeMessage extends ChallengeBase {
    challenges: Challenge[];

    constructor(props: Omit<ChallengeMessage, "type">) {
        super();
        this.type = PUBSUB_MESSAGE_TYPES.CHALLENGE;
        this.challengeRequestId = props.challengeRequestId;
        this.challenges = parseJsonIfString(props.challenges);
    }

    toJSONForDb?() {
        return { ...super.toJSONForDb(), challenges: JSON.stringify(this.challenges) };
    }
}

export class ChallengeAnswerMessage extends ChallengeBase {
    challengeAnswers: string[];

    constructor(props: Omit<ChallengeAnswerMessage, "type">) {
        super();
        this.type = PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER;
        this.challengeRequestId = props.challengeRequestId;
        this.challengeAnswerId = props.challengeAnswerId;
        this.challengeAnswers = parseJsonIfString(props.challengeAnswers);
    }

    toJSONForDb?() {
        return { ...super.toJSONForDb(), challengeAnswers: JSON.stringify(this.challengeAnswers) };
    }
}

export class ChallengeVerificationMessage extends ChallengeBase {
    challengeSuccess: boolean;
    challengeErrors: string[] | undefined;
    encryptedPublication?: Encrypted;
    reason?: string;

    constructor(props: Omit<ChallengeVerificationMessage, "type">) {
        super();
        this.type = PUBSUB_MESSAGE_TYPES.CHALLENGEVERIFICATION;
        this.challengeRequestId = props.challengeRequestId;
        this.challengeAnswerId = props.challengeAnswerId;
        this.challengeSuccess = props.challengeSuccess;
        this.challengeErrors = parseJsonIfString(props.challengeErrors);
        this.reason = props.reason;
        this.encryptedPublication = props.encryptedPublication;
    }

    toJSONForDb?() {
        return { ...super.toJSONForDb(), challengeErrors: JSON.stringify(this.challengeErrors) };
    }
}
