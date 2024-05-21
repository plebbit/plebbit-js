// Signer section

import { ChallengeAnswerMessage, ChallengeRequestMessage } from "../challenge.js";

import { SubplebbitIpfsType } from "../subplebbit/types.js";

import {
    ChallengeMessageType,
    ChallengeVerificationMessageType,
    CommentUpdate,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreateVoteOptions,
} from "../types.js";

// ---------------------------
// SignedPropertyNames

export const CommentSignedPropertyNames: (keyof Omit<CreateCommentOptions, "signer" | "challengeCommentCids" | "challengeAnswers">)[] = [
    "subplebbitAddress",
    "author",
    "timestamp",
    "content",
    "title",
    "link",
    "parentCid"
] as const;

export const CommentEditSignedPropertyNames: (keyof Omit<
    CreateCommentEditOptions,
    "signer" | "challengeCommentCids" | "challengeAnswers"
>)[] = [
    "author",
    "timestamp",
    "subplebbitAddress",
    "content",
    "commentCid",
    "deleted",
    "spoiler",
    "pinned",
    "locked",
    "removed",
    "flair",
    "reason",
    "commentAuthor"
] as const;

export const VoteSignedPropertyNames: (keyof Omit<CreateVoteOptions, "signer" | "challengeCommentCids" | "challengeAnswers">)[] = [
    "subplebbitAddress",
    "author",
    "timestamp",
    "vote",
    "commentCid"
] as const;

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

