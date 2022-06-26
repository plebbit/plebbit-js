import { Encrypted } from "./types";
export declare const PUBSUB_MESSAGE_TYPES: Readonly<{
    CHALLENGEREQUEST: "CHALLENGEREQUEST";
    CHALLENGE: "CHALLENGE";
    CHALLENGEANSWER: "CHALLENGEANSWER";
    CHALLENGEVERIFICATION: "CHALLENGEVERIFICATION";
}>;
export declare const CHALLENGE_TYPES: Readonly<{
    IMAGE: "image";
    TEXT: "text";
    VIDEO: "video";
    AUDIO: "audio";
    HTML: "html";
}>;
export declare class Challenge {
    challenge: any[];
    type: string;
    constructor(props: any);
}
declare class ChallengeBase {
    type: string;
    challengeRequestId: string;
    acceptedChallengeTypes: string[];
    encryptedPublication: Encrypted;
    challengeAnswerId: string;
    toJSONForDb(): any;
}
export declare class ChallengeRequestMessage extends ChallengeBase {
    constructor(props: any);
    toJSONForDb(): any;
}
export declare class ChallengeMessage extends ChallengeBase {
    challenges: Challenge[];
    constructor(props: any);
    toJSONForDb(): any;
}
export declare class ChallengeAnswerMessage extends ChallengeBase {
    challengeAnswers: string[];
    constructor(props: any);
    toJSONForDb(): any;
}
export declare class ChallengeVerificationMessage extends ChallengeBase {
    challengeSuccess: boolean;
    challengeErrors: (string | null)[];
    reason: string;
    constructor(props: any);
    toJSONForDb(): any;
}
export {};
