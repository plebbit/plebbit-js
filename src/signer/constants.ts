// Signer section

import type { CommentUpdate } from "../publications/comment/types.js";

import type { SubplebbitIpfsType } from "../subplebbit/types.js";

import type {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType
} from "../pubsub-messages/types";

export const keysToOmitFromSignature = <["signer", "challengeCommentCids", "challengeAnswers"]>[
    "signer",
    "challengeCommentCids",
    "challengeAnswers"
];

// TODO this whole file should use props from zod

// TODO move the signed property names below to their respective files
export const SubplebbitSignedPropertyNames: (keyof SubplebbitIpfsType)[] = [
    "title",
    "description",
    "roles",
    "pubsubTopic",
    "lastPostCid",
    "posts",
    "challenges",
    "statsCid",
    "createdAt",
    "updatedAt",
    "features",
    "suggested",
    "rules",
    "address",
    "flairs",
    "encryption",
    "postUpdates"
] as const;

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

export const CommentUpdateSignedPropertyNames: (keyof CommentUpdate)[] = [
    "author",
    "spoiler",
    "pinned",
    "locked",
    "removed",
    "reason",
    "flair",
    "upvoteCount",
    "downvoteCount",
    "replies",
    "updatedAt",
    "replyCount",
    "edit",
    "cid",
    "lastChildCid",
    "lastReplyTimestamp"
] as const;
