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
    "challenges",
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
    "encrypted",
    "acceptedChallengeTypes",
    "timestamp"
];
exports.ChallengeMessageSignedPropertyNames = [
    "type",
    "challengeRequestId",
    "encrypted",
    "timestamp"
];
exports.ChallengeAnswerMessageSignedPropertyNames = [
    "type",
    "challengeRequestId",
    "encrypted",
    "timestamp"
];
exports.ChallengeVerificationMessageSignedPropertyNames = [
    "reason",
    "type",
    "challengeRequestId",
    "encrypted",
    "challengeSuccess",
    "challengeErrors",
    "timestamp"
];
//# sourceMappingURL=constants.js.map