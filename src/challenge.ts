import { parseJsonIfString } from "./util";
import {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeType,
    ChallengeVerificationMessageType,
    Encrypted,
    ProtocolVersion
} from "./types";
import { Signature } from "./signer/signatures";

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
    signature: Signature;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    constructor(props: Omit<ChallengeRequestMessageType, "type">) {
        this.type = "CHALLENGEREQUEST";
        this.challengeRequestId = props.challengeRequestId;
        this.acceptedChallengeTypes = parseJsonIfString(props.acceptedChallengeTypes);
        this.encryptedPublication = props.encryptedPublication;
        this.signature = parseJsonIfString(props.signature);
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
    }

    toJSON(): ChallengeRequestMessageType {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            acceptedChallengeTypes: this.acceptedChallengeTypes,
            encryptedPublication: this.encryptedPublication,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion
        };
    }

    toJSONForDb(): Omit<ChallengeRequestMessageType, "signature" | "encryptedPublication"> {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            acceptedChallengeTypes: this.acceptedChallengeTypes,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion
        };
    }
}

export class ChallengeMessage implements ChallengeMessageType {
    encryptedChallenges: Encrypted;
    type: "CHALLENGE";
    challengeRequestId: string;
    signature: Signature;
    protocolVersion: ProtocolVersion;
    userAgent: string;

    constructor(props: Omit<ChallengeMessageType, "type">) {
        this.type = "CHALLENGE";
        this.challengeRequestId = props.challengeRequestId;
        this.encryptedChallenges = props.encryptedChallenges;
        this.signature = parseJsonIfString(props.signature);
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
    }

    toJSON(): ChallengeMessageType {
        return {
            encryptedChallenges: this.encryptedChallenges,
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion
        };
    }

    toJSONForDb(): Omit<ChallengeMessageType, "signature" | "encryptedChallenges"> {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion
        };
    }
}

export class ChallengeAnswerMessage implements ChallengeAnswerMessageType {
    type: "CHALLENGEANSWER";
    challengeAnswerId: string;
    encryptedChallengeAnswers: Encrypted;
    challengeRequestId: string;
    signature: Signature;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    constructor(props: Omit<ChallengeAnswerMessageType, "type">) {
        this.type = "CHALLENGEANSWER";
        this.challengeAnswerId = props.challengeAnswerId;
        this.encryptedChallengeAnswers = props.encryptedChallengeAnswers;
        this.challengeRequestId = props.challengeRequestId;
        this.signature = parseJsonIfString(props.signature);
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
    }

    toJSON(): ChallengeAnswerMessageType {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeAnswerId: this.challengeAnswerId,
            encryptedChallengeAnswers: this.encryptedChallengeAnswers,
            signature: this.signature,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent
        };
    }

    toJSONForDb(): Omit<ChallengeAnswerMessageType, "signature" | "encryptedChallengeAnswers"> {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeAnswerId: this.challengeAnswerId,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent
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
    signature: Signature;
    protocolVersion: "1.0.0";
    userAgent: string;

    constructor(props: Omit<ChallengeVerificationMessageType, "type">) {
        this.type = "CHALLENGEVERIFICATION";
        this.challengeRequestId = props.challengeRequestId;
        this.challengeAnswerId = props.challengeAnswerId;
        this.challengeSuccess = props.challengeSuccess;
        this.challengeErrors = parseJsonIfString(props.challengeErrors);
        this.reason = props.reason;
        this.encryptedPublication = props.encryptedPublication;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
    }

    toJSON(): ChallengeVerificationMessageType {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeAnswerId: this.challengeAnswerId,
            challengeSuccess: this.challengeSuccess,
            challengeErrors: this.challengeErrors,
            reason: this.reason,
            encryptedPublication: this.encryptedPublication,
            signature: this.signature,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent
        };
    }

    toJSONForDb(): Omit<ChallengeVerificationMessageType, "encryptedPublication" | "signature"> {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeAnswerId: this.challengeAnswerId,
            challengeSuccess: this.challengeSuccess,
            challengeErrors: this.challengeErrors,
            reason: this.reason,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent
        };
    }
}
