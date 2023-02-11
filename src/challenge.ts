import {
    ChallengeAnswerMessageType,
    ChallengeAnswersTableRow,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeRequestsTableRow,
    ChallengesTableRow,
    ChallengeVerificationMessageType,
    ChallengeVerificationsTableRow,
    DecryptedChallengeAnswerMessageType,
    Encrypted,
    ProtocolVersion,
    SignatureType
} from "./types";
import lodash from "lodash";

export class ChallengeRequestMessage implements ChallengeRequestMessageType {
    encryptedPublication: Encrypted;
    type: "CHALLENGEREQUEST";
    challengeRequestId: string;
    acceptedChallengeTypes?: string[];
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    constructor(props: Omit<ChallengeRequestMessageType, "type">) {
        this.type = "CHALLENGEREQUEST";
        this.challengeRequestId = props.challengeRequestId;
        this.acceptedChallengeTypes = props.acceptedChallengeTypes;
        this.encryptedPublication = props.encryptedPublication;
        this.signature = props.signature;
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

    toJSONForDb(): ChallengeRequestsTableRow {
        return lodash.omit(this.toJSON(), ["type", "encryptedPublication"]);
    }
}

export class ChallengeMessage implements ChallengeMessageType {
    encryptedChallenges: Encrypted;
    type: "CHALLENGE";
    challengeRequestId: string;
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
    userAgent: string;

    constructor(props: Omit<ChallengeMessageType, "type">) {
        this.type = "CHALLENGE";
        this.challengeRequestId = props.challengeRequestId;
        this.encryptedChallenges = props.encryptedChallenges;
        this.signature = props.signature;
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

    toJSONForDb(challengeTypes: ChallengesTableRow["challengeTypes"]): ChallengesTableRow {
        return { ...lodash.omit(this.toJSON(), ["type", "encryptedChallenges"]), challengeTypes };
    }
}

export class ChallengeAnswerMessage implements ChallengeAnswerMessageType {
    type: "CHALLENGEANSWER";
    challengeAnswerId: string;
    encryptedChallengeAnswers: Encrypted;
    challengeRequestId: string;
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    constructor(props: Omit<ChallengeAnswerMessageType, "type">) {
        this.type = "CHALLENGEANSWER";
        this.challengeAnswerId = props.challengeAnswerId;
        this.encryptedChallengeAnswers = props.encryptedChallengeAnswers;
        this.challengeRequestId = props.challengeRequestId;
        this.signature = props.signature;
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

    toJSONForDb(challengeAnswers: DecryptedChallengeAnswerMessageType["challengeAnswers"]): ChallengeAnswersTableRow {
        return { ...lodash.omit(this.toJSON(), ["type", "encryptedChallengeAnswers"]), challengeAnswers };
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
    signature: SignatureType;
    protocolVersion: "1.0.0";
    userAgent: string;

    constructor(props: Omit<ChallengeVerificationMessageType, "type">) {
        this.type = "CHALLENGEVERIFICATION";
        this.challengeRequestId = props.challengeRequestId;
        this.challengeAnswerId = props.challengeAnswerId;
        this.challengeSuccess = props.challengeSuccess;
        this.challengeErrors = props.challengeErrors;
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

    toJSONForDb(): ChallengeVerificationsTableRow {
        return lodash.omit(this.toJSON(), ["type", "encryptedPublication"]);
    }
}
