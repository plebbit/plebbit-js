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
import { Encrypted, PubsubSignature } from "./signer/constants";
import assert from "assert";

export class ChallengeRequestMessage implements ChallengeRequestMessageType {
    encrypted: Encrypted;
    type: "CHALLENGEREQUEST";
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    acceptedChallengeTypes?: string[];
    signature: PubsubSignature;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;
    constructor(props: Omit<ChallengeRequestMessageType, "type">) {
        this.type = "CHALLENGEREQUEST";
        this.challengeRequestId = props.challengeRequestId;
        this.acceptedChallengeTypes = props.acceptedChallengeTypes;
        this.encrypted = props.encrypted;
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
            encrypted: this.encrypted,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp
        };
    }

    toJSONForDb(challengeAnswers: string[] | undefined, challengeCommentCids: string[] | undefined): ChallengeRequestsTableRowInsert {
        return {
            ...lodash.omit(this.toJSON(), ["type", "encrypted"]),
            acceptedChallengeTypes: Array.isArray(this.acceptedChallengeTypes) ? JSON.stringify(this.acceptedChallengeTypes) : undefined,
            challengeAnswers: Array.isArray(challengeAnswers) ? JSON.stringify(challengeAnswers) : undefined,
            challengeCommentCids: Array.isArray(challengeCommentCids) ? JSON.stringify(challengeCommentCids) : undefined
        };
    }
}

export class ChallengeMessage implements ChallengeMessageType {
    encrypted: Encrypted;
    type: "CHALLENGE";
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    signature: PubsubSignature;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;

    constructor(props: Omit<ChallengeMessageType, "type">) {
        this.type = "CHALLENGE";
        this.challengeRequestId = props.challengeRequestId;
        this.encrypted = props.encrypted;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }

    toJSON(): ChallengeMessageType {
        return {
            encrypted: this.encrypted,
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            signature: this.signature,
            userAgent: this.userAgent,
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp
        };
    }

    toJSONForDb(challengeTypes: ChallengesTableRow["challengeTypes"]): ChallengesTableRowInsert {
        assert(Array.isArray(challengeTypes), `Challenge types need to be array, (${challengeTypes}) is not an array`);

        const challengeTypesFormattedForDb = JSON.stringify(challengeTypes);
        if (challengeTypesFormattedForDb === "[object Object]") throw Error(`challengeTypes  shouldn't be [object Object]`);

        return { ...lodash.omit(this.toJSON(), ["type", "encrypted"]), challengeTypes: challengeTypesFormattedForDb };
    }
}

export class ChallengeAnswerMessage implements ChallengeAnswerMessageType {
    type: "CHALLENGEANSWER";
    encrypted: Encrypted;
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    signature: PubsubSignature;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;
    constructor(props: Omit<ChallengeAnswerMessageType, "type">) {
        this.type = "CHALLENGEANSWER";
        this.encrypted = props.encrypted;
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
            encrypted: this.encrypted,
            signature: this.signature,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent,
            timestamp: this.timestamp
        };
    }

    toJSONForDb(challengeAnswers: DecryptedChallengeAnswerMessageType["challengeAnswers"]): ChallengeAnswersTableRowInsert {
        assert(Array.isArray(challengeAnswers), `Challenge answers need to be array, (${challengeAnswers}) is not an array`);
        const challengeAnswersFormattedForDb = JSON.stringify(challengeAnswers);
        if (challengeAnswersFormattedForDb === "[object Object]") throw Error(`challengeAnswers  shouldn't be [object Object]`);

        return { ...lodash.omit(this.toJSON(), ["type", "encrypted"]), challengeAnswers: challengeAnswersFormattedForDb };
    }
}

export class ChallengeVerificationMessage implements ChallengeVerificationMessageType {
    type: "CHALLENGEVERIFICATION";
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    challengeSuccess: boolean;
    challengeErrors?: (string | undefined)[];
    reason?: string;
    encrypted?: Encrypted;
    signature: PubsubSignature;
    protocolVersion: "1.0.0";
    userAgent: string;
    timestamp: number;

    constructor(props: Omit<ChallengeVerificationMessageType, "type">) {
        this.type = "CHALLENGEVERIFICATION";
        this.challengeRequestId = props.challengeRequestId;
        this.challengeSuccess = props.challengeSuccess;
        this.challengeErrors = props.challengeErrors;
        this.reason = props.reason;
        this.encrypted = props.encrypted;
        this.signature = props.signature;
        this.protocolVersion = props.protocolVersion;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }

    toJSON(): ChallengeVerificationMessageType {
        return {
            type: this.type,
            challengeRequestId: this.challengeRequestId,
            challengeSuccess: this.challengeSuccess,
            challengeErrors: this.challengeErrors,
            reason: this.reason,
            encrypted: this.encrypted,
            signature: this.signature,
            protocolVersion: this.protocolVersion,
            userAgent: this.userAgent,
            timestamp: this.timestamp
        };
    }

    toJSONForDb(): ChallengeVerificationsTableRowInsert {
        return {
            ...lodash.omit(this.toJSON(), ["type", "encrypted"]),
            challengeErrors: Array.isArray(this.challengeErrors) ? JSON.stringify(this.challengeErrors) : undefined
        };
    }
}
