import { parseJsonIfString } from "./util";
import {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeType,
    ChallengeVerificationMessageType,
    Encrypted
} from "./types";

export const PUBSUB_MESSAGE_TYPES = Object.freeze({
    CHALLENGEREQUEST: "CHALLENGEREQUEST",
    CHALLENGE: "CHALLENGE",
    CHALLENGEANSWER: "CHALLENGEANSWER",
    CHALLENGEVERIFICATION: "CHALLENGEVERIFICATION"
});

export class Challenge implements ChallengeType {
    challenge: string;
    type: "image" | "text" | "video" | "audio" | "html";
    constructor(props: ChallengeType) {
        this.challenge = props.challenge;
        this.type = props.type;
    }

    toJSON(): ChallengeType {
        return {
            challenge: this.challenge,
            type: this.type
        };
    }
}

export class ChallengeRequestMessage implements ChallengeRequestMessageType {
    encryptedPublication: Encrypted;
    type: "CHALLENGEREQUEST";
    challengeRequestId: string;
    acceptedChallengeTypes?: string[];
    constructor(props: Omit<ChallengeRequestMessageType, "type">) {
        this.type = "CHALLENGEREQUEST";
        this.challengeRequestId = props.challengeRequestId;
        this.acceptedChallengeTypes = parseJsonIfString(props.acceptedChallengeTypes);
        this.encryptedPublication = props.encryptedPublication;
    }

    toJSON(): ChallengeRequestMessageType {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            acceptedChallengeTypes: this.acceptedChallengeTypes,
            encryptedPublication: this.encryptedPublication
        };
    }
}

export class ChallengeMessage implements ChallengeMessageType {
    encryptedChallenges: Encrypted;
    type: "CHALLENGE";
    challengeRequestId: string;

    constructor(props: Omit<ChallengeMessageType, "type">) {
        this.type = "CHALLENGE";
        this.challengeRequestId = props.challengeRequestId;
        this.encryptedChallenges = props.encryptedChallenges;
    }

    toJSON(): ChallengeMessageType {
        return {
            encryptedChallenges: this.encryptedChallenges,
            type: this.type,
            challengeRequestId: this.challengeRequestId
        };
    }
}

export class ChallengeAnswerMessage implements ChallengeAnswerMessageType {
    type: "CHALLENGEANSWER";
    challengeAnswerId: string;
    encryptedChallengeAnswers: Encrypted;
    challengeRequestId: string;
    constructor(props: Omit<ChallengeAnswerMessageType, "type">) {
        this.type = "CHALLENGEANSWER";
        this.challengeRequestId = props.challengeRequestId;
        this.challengeAnswerId = props.challengeAnswerId;
        this.encryptedChallengeAnswers = props.encryptedChallengeAnswers;
    }

    toJSON(): ChallengeAnswerMessageType {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeAnswerId: this.challengeAnswerId,
            encryptedChallengeAnswers: this.encryptedChallengeAnswers
        };
    }
}

export class ChallengeVerificationMessage implements ChallengeVerificationMessageType {
    type: "CHALLENGEVERIFICATION";
    challengeRequestId: string;
    challengeAnswerId: string;
    challengeSuccess: boolean;
    challengeErrors?: (string | undefined)[];
    reason?: string;
    encryptedPublication?: Encrypted;

    constructor(props: Omit<ChallengeVerificationMessageType, "type">) {
        this.type = "CHALLENGEVERIFICATION";
        this.challengeRequestId = props.challengeRequestId;
        this.challengeAnswerId = props.challengeAnswerId;
        this.challengeSuccess = props.challengeSuccess;
        this.challengeErrors = parseJsonIfString(props.challengeErrors);
        this.reason = props.reason;
        this.encryptedPublication = props.encryptedPublication;
    }

    toJSON(): ChallengeVerificationMessageType {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeAnswerId: this.challengeAnswerId,
            challengeSuccess: this.challengeSuccess,
            challengeErrors: this.challengeErrors,
            reason: this.reason,
            encryptedPublication: this.encryptedPublication
        };
    }
}
