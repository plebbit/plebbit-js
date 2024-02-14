import { ChallengeAnswerMessageType, ChallengeMessageType, ChallengeRequestMessageType, ChallengeVerificationMessageType, ProtocolVersion } from "./types.js";
import { Encrypted, PubsubSignature } from "./signer/constants.js";
export declare class ChallengeRequestMessage implements ChallengeRequestMessageType {
    encrypted: Encrypted;
    type: "CHALLENGEREQUEST";
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    acceptedChallengeTypes?: string[];
    signature: PubsubSignature;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;
    constructor(props: Omit<ChallengeRequestMessageType, "type">);
    toJSON(): ChallengeRequestMessageType;
}
export declare class ChallengeMessage implements ChallengeMessageType {
    encrypted: Encrypted;
    type: "CHALLENGE";
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    signature: PubsubSignature;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;
    constructor(props: Omit<ChallengeMessageType, "type">);
    toJSON(): ChallengeMessageType;
}
export declare class ChallengeAnswerMessage implements ChallengeAnswerMessageType {
    type: "CHALLENGEANSWER";
    encrypted: Encrypted;
    challengeRequestId: ChallengeRequestMessageType["challengeRequestId"];
    signature: PubsubSignature;
    protocolVersion: ProtocolVersion;
    userAgent: string;
    timestamp: number;
    constructor(props: Omit<ChallengeAnswerMessageType, "type">);
    toJSON(): ChallengeAnswerMessageType;
}
export declare class ChallengeVerificationMessage implements ChallengeVerificationMessageType {
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
    constructor(props: Omit<ChallengeVerificationMessageType, "type">);
    toJSON(): ChallengeVerificationMessageType;
}
