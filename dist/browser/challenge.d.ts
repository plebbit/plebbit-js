import { ChallengeAnswerMessageType, ChallengeMessageType, ChallengeRequestMessageType, ChallengeType, ChallengeVerificationMessageType, Encrypted, ProtocolVersion, SignatureType } from "./types";
export declare const PUBSUB_MESSAGE_TYPES: Readonly<{
    CHALLENGEREQUEST: "CHALLENGEREQUEST";
    CHALLENGE: "CHALLENGE";
    CHALLENGEANSWER: "CHALLENGEANSWER";
    CHALLENGEVERIFICATION: "CHALLENGEVERIFICATION";
}>;
export declare class Challenge implements ChallengeType {
    challenge: string;
    type: "image" | "text" | "video" | "audio" | "html";
    constructor(props: ChallengeType);
    toJSON(): ChallengeType;
}
export declare class ChallengeRequestMessage implements ChallengeRequestMessageType {
    encryptedPublication: Encrypted;
    type: "CHALLENGEREQUEST";
    challengeRequestId: string;
    acceptedChallengeTypes?: string[];
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    constructor(props: Omit<ChallengeRequestMessageType, "type">);
    toJSON(): ChallengeRequestMessageType;
    toJSONForDb(): Omit<ChallengeRequestMessageType, "signature" | "encryptedPublication">;
}
export declare class ChallengeMessage implements ChallengeMessageType {
    encryptedChallenges: Encrypted;
    type: "CHALLENGE";
    challengeRequestId: string;
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    constructor(props: Omit<ChallengeMessageType, "type">);
    toJSON(): ChallengeMessageType;
    toJSONForDb(): Omit<ChallengeMessageType, "signature" | "encryptedChallenges">;
}
export declare class ChallengeAnswerMessage implements ChallengeAnswerMessageType {
    type: "CHALLENGEANSWER";
    challengeAnswerId: string;
    encryptedChallengeAnswers: Encrypted;
    challengeRequestId: string;
    signature: SignatureType;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    constructor(props: Omit<ChallengeAnswerMessageType, "type">);
    toJSON(): ChallengeAnswerMessageType;
    toJSONForDb(): Omit<ChallengeAnswerMessageType, "signature" | "encryptedChallengeAnswers">;
}
export declare class ChallengeVerificationMessage implements ChallengeVerificationMessageType {
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
    constructor(props: Omit<ChallengeVerificationMessageType, "type">);
    toJSON(): ChallengeVerificationMessageType;
    toJSONForDb(): Omit<ChallengeVerificationMessageType, "encryptedPublication" | "signature">;
}
