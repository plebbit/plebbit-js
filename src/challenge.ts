import {
    ChallengeAnswerMessageType,
    ChallengeAnswersTableRowInsert,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeRequestsTableRowInsert,
    ChallengesTableRow,
    ChallengesTableRowInsert,
    ChallengeVerificationMessageType,
    ChallengeVerificationsTableRowInsert,
    DecryptedChallengeAnswerMessageType,
    ProtocolVersion
} from "./types";
import lodash from "lodash";
import { Encrypted, SignatureType } from "./signer/constants";

export class ChallengeRequestMessage implements ChallengeRequestMessageType {
    encryptedPublication: Encrypted;
    type: "CHALLENGEREQUEST";
    challengeRequestId: string;
    acceptedChallengeTypes?: string[];
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;
    constructor(props: Omit<ChallengeRequestMessageType, "type">) {
        this.type = "CHALLENGEREQUEST";
        this.challengeRequestId = props.challengeRequestId;
        this.acceptedChallengeTypes = props.acceptedChallengeTypes;
        this.encryptedPublication = props.encryptedPublication;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }

    toJSON(): ChallengeRequestMessageType {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            acceptedChallengeTypes: this.acceptedChallengeTypes,
            encryptedPublication: this.encryptedPublication,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp
        };
    }

    toJSONForDb(): ChallengeRequestsTableRowInsert {
        return { ...lodash.omit(this.toJSON(), ["type", "encryptedPublication"]) };
    }
}

export class ChallengeMessage implements ChallengeMessageType {
    encryptedChallenges: Encrypted;
    type: "CHALLENGE";
    challengeRequestId: string;
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;

    constructor(props: Omit<ChallengeMessageType, "type">) {
        this.type = "CHALLENGE";
        this.challengeRequestId = props.challengeRequestId;
        this.encryptedChallenges = props.encryptedChallenges;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }

    toJSON(): ChallengeMessageType {
        return {
            encryptedChallenges: this.encryptedChallenges,
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp
        };
    }

    toJSONForDb(challengeTypes: ChallengesTableRow["challengeTypes"]): ChallengesTableRowInsert {
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
    timestamp: number;
    constructor(props: Omit<ChallengeAnswerMessageType, "type">) {
        this.type = "CHALLENGEANSWER";
        this.challengeAnswerId = props.challengeAnswerId;
        this.encryptedChallengeAnswers = props.encryptedChallengeAnswers;
        this.challengeRequestId = props.challengeRequestId;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }

    toJSON(): ChallengeAnswerMessageType {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeAnswerId: this.challengeAnswerId,
            encryptedChallengeAnswers: this.encryptedChallengeAnswers,
            signature: this.signature,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent,
            timestamp: this.timestamp
        };
    }

    toJSONForDb(challengeAnswers: DecryptedChallengeAnswerMessageType["challengeAnswers"]): ChallengeAnswersTableRowInsert {
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
    timestamp: number;

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
        this.timestamp = props.timestamp;
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
            userAgent: this.userAgent,
            timestamp: this.timestamp
        };
    }

    toJSONForDb(): ChallengeVerificationsTableRowInsert {
        return { ...lodash.omit(this.toJSON(), ["type", "encryptedPublication"]) };
    }
}
