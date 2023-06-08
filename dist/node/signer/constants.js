"use strict";
// Signer section
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeVerificationMessageSignedPropertyNames = exports.ChallengeAnswerMessageSignedPropertyNames = exports.ChallengeMessageSignedPropertyNames = exports.ChallengeRequestMessageSignedPropertyNames = exports.SubplebbitSignedPropertyNames = exports.CommentUpdateSignedPropertyNames = exports.VoteSignedPropertyNames = exports.CommentEditSignedPropertyNames = exports.CommentSignedPropertyNames = void 0;
// ---------------------------
// SignedPropertyNames
exports.CommentSignedPropertyNames = [
    "subplebbitAddress",
    "author",
    "timestamp",
    "content",
    "title",
    "link",
    "parentCid"
];
exports.CommentEditSignedPropertyNames = [
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
    "reason",
    "flair",
    "reason",
    "commentAuthor"
];
exports.VoteSignedPropertyNames = [
    "subplebbitAddress",
    "author",
    "timestamp",
    "vote",
    "commentCid"
];
exports.CommentUpdateSignedPropertyNames = [
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
];
exports.SubplebbitSignedPropertyNames = [
    "title",
    "description",
    "roles",
    "pubsubTopic",
    "lastPostCid",
    "posts",
    "challengeTypes",
    "statsCid",
    "createdAt",
    "updatedAt",
    "features",
    "suggested",
    "rules",
    "address",
    "flairs",
    "encryption"
];
exports.ChallengeRequestMessageSignedPropertyNames = [
    "type",
    "challengeRequestId",
    "encryptedPublication",
    "acceptedChallengeTypes",
    "timestamp"
];
exports.ChallengeMessageSignedPropertyNames = [
    "type",
    "challengeRequestId",
    "encryptedChallenges",
    "timestamp"
];
exports.ChallengeAnswerMessageSignedPropertyNames = [
    "type",
    "challengeRequestId",
    "encryptedChallengeAnswers",
    "timestamp"
];
exports.ChallengeVerificationMessageSignedPropertyNames = [
    "reason",
    "type",
    "challengeRequestId",
    "encryptedPublication",
    "challengeSuccess",
    "challengeErrors",
    "timestamp"
];
//# sourceMappingURL=constants.js.map