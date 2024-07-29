// Signer section


import type {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType
} from "../pubsub-messages/types";

export const keysToOmitFromSignedPropertyNames = <["signer", "challengeCommentCids", "challengeAnswers"]>[
    "signer",
    "challengeCommentCids",
    "challengeAnswers"
];

// TODO this whole file should use props from zod

// TODO move the signed property names below to their respective files

export const ChallengeRequestMessageSignedPropertyNames: (keyof ChallengeRequestMessageType)[] = [
    "type",
    "challengeRequestId",
    "encrypted",
    "acceptedChallengeTypes",
    "timestamp"
] as const;
export const ChallengeMessageSignedPropertyNames: (keyof ChallengeMessageType)[] = [
    "type",
    "challengeRequestId",
    "encrypted",
    "timestamp"
] as const;
export const ChallengeAnswerMessageSignedPropertyNames: (keyof ChallengeAnswerMessageType)[] = [
    "type",
    "challengeRequestId",
    "encrypted",
    "timestamp"
] as const;
export const ChallengeVerificationMessageSignedPropertyNames: (keyof ChallengeVerificationMessageType)[] = [
    "reason",
    "type",
    "challengeRequestId",
    "encrypted",
    "challengeSuccess",
    "challengeErrors",
    "timestamp"
] as const;
