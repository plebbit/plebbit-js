// Signer section

import type { ChallengeAnswerMessage, ChallengeRequestMessage } from "../challenge.js";
import type { CommentUpdate } from "../publications/comment/types.js";

import type { SubplebbitIpfsType } from "../subplebbit/types.js";

import type { ChallengeMessageType, ChallengeVerificationMessageType } from "../types.js";

export const keysToOmitFromSignature = <["signer", "challengeCommentCids", "challengeAnswers"]>[
    "signer",
    "challengeCommentCids",
    "challengeAnswers"
];

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

export const ChallengeRequestMessageSignedPropertyNames: (keyof ChallengeRequestMessage)[] = [
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
export const ChallengeAnswerMessageSignedPropertyNames: (keyof ChallengeAnswerMessage)[] = [
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
