"use strict";
// Signer section
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHOR_EDIT_FIELDS = exports.MOD_EDIT_FIELDS = exports.CommentUpdateSignedPropertyNames = exports.ChallengeVerificationMessageSignedPropertyNames = exports.ChallengeAnswerMessageSignedPropertyNames = exports.ChallengeMessageSignedPropertyNames = exports.ChallengeRequestMessageSignedPropertyNames = exports.SubplebbitSignedPropertyNames = exports.VoteSignedPropertyNames = exports.CommentEditSignedPropertyNames = exports.CommentSignedPropertyNames = void 0;
// ---------------------------
// SignedPropertyNames
exports.CommentSignedPropertyNames = ["subplebbitAddress", "author", "timestamp", "content", "title", "link", "parentCid"];
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
// Export constants of CommentType fields
// Storing fields here to check before publishing if CommentEdit has proper field for either author or mod.
var PUBLICATION_FIELDS = [
    "author",
    "protocolVersion",
    "signature",
    "subplebbitAddress",
    "timestamp"
];
exports.MOD_EDIT_FIELDS = __spreadArray(__spreadArray([], PUBLICATION_FIELDS, true), [
    "commentCid",
    "flair",
    "spoiler",
    "pinned",
    "locked",
    "removed",
    "reason",
    "commentAuthor"
], false);
exports.AUTHOR_EDIT_FIELDS = __spreadArray(__spreadArray([], PUBLICATION_FIELDS, true), [
    "commentCid",
    "content",
    "flair",
    "spoiler",
    "reason",
    "deleted"
], false);
//# sourceMappingURL=constants.js.map