"use strict";
// Signer section
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentUpdateSignedPropertyNames = exports.ChallengeVerificationMessageSignedPropertyNames = exports.ChallengeAnswerMessageSignedPropertyNames = exports.ChallengeMessageSignedPropertyNames = exports.ChallengeRequestMessageSignedPropertyNames = exports.SubplebbitSignedPropertyNames = exports.VoteSignedPropertyNames = exports.CommentEditSignedPropertyNames = exports.CommentSignedPropertyNames = void 0;
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
    "encryption",
    "postUpdates"
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
//# sourceMappingURL=constants.js.map