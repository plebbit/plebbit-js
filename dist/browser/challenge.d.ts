import { ChallengeAnswerMessageType, ChallengeAnswersTableRowInsert, ChallengeMessageType, ChallengeRequestMessageType, ChallengeRequestsTableRowInsert, ChallengesTableRow, ChallengesTableRowInsert, ChallengeVerificationMessageType, ChallengeVerificationsTableRowInsert, DecryptedChallengeAnswerMessageType, ProtocolVersion } from "./types";
import { Encrypted, PubsubSignature } from "./signer/constants";
export declare class ChallengeRequestMessage implements ChallengeRequestMessageType {
    encryptedPublication: Encrypted;
    type: "CHALLENGEREQUEST";
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    acceptedChallengeTypes?: string[];
    signature: PubsubSignature;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;
    constructor(props: Omit<ChallengeRequestMessageType, "type">);
    toJSON(): ChallengeRequestMessageType;
    toJSONForDb(): ChallengeRequestsTableRowInsert;
}
export declare class ChallengeMessage implements ChallengeMessageType {
    encryptedChallenges: Encrypted;
    type: "CHALLENGE";
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    signature: PubsubSignature;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;
    constructor(props: Omit<ChallengeMessageType, "type">);
    toJSON(): ChallengeMessageType;
    toJSONForDb(challengeTypes: ChallengesTableRow["challengeTypes"]): ChallengesTableRowInsert;
}
export declare class ChallengeAnswerMessage implements ChallengeAnswerMessageType {
    type: "CHALLENGEANSWER";
    encryptedChallengeAnswers: Encrypted;
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    signature: PubsubSignature;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;
    constructor(props: Omit<ChallengeAnswerMessageType, "type">);
    toJSON(): ChallengeAnswerMessageType;
    toJSONForDb(challengeAnswers: DecryptedChallengeAnswerMessageType["challengeAnswers"]): ChallengeAnswersTableRowInsert;
}
export declare class ChallengeVerificationMessage implements ChallengeVerificationMessageType {
    type: "CHALLENGEVERIFICATION";
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    challengeSuccess: boolean;
    challengeErrors?: (string | undefined)[];
    reason?: string;
    encryptedPublication?: Encrypted;
    signature: PubsubSignature;
    protocolVersion: "1.0.0";
    userAgent: string;
    timestamp: number;
    constructor(props: Omit<ChallengeVerificationMessageType, "type">);
    toJSON(): ChallengeVerificationMessageType;
    toJSONForDb(): ChallengeVerificationsTableRowInsert;
}
