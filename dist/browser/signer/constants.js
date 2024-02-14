// Signer section
// ---------------------------
// SignedPropertyNames
export const CommentSignedPropertyNames = ["subplebbitAddress", "author", "timestamp", "content", "title", "link", "parentCid"];
export const CommentEditSignedPropertyNames = [
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
export const VoteSignedPropertyNames = [
    "subplebbitAddress",
    "author",
    "timestamp",
    "vote",
    "commentCid"
];
export const SubplebbitSignedPropertyNames = [
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
export const ChallengeRequestMessageSignedPropertyNames = [
    "type",
    "challengeRequestId",
    "encrypted",
    "acceptedChallengeTypes",
    "timestamp"
];
export const ChallengeMessageSignedPropertyNames = [
    "type",
    "challengeRequestId",
    "encrypted",
    "timestamp"
];
export const ChallengeAnswerMessageSignedPropertyNames = [
    "type",
    "challengeRequestId",
    "encrypted",
    "timestamp"
];
export const ChallengeVerificationMessageSignedPropertyNames = [
    "reason",
    "type",
    "challengeRequestId",
    "encrypted",
    "challengeSuccess",
    "challengeErrors",
    "timestamp"
];
export const CommentUpdateSignedPropertyNames = [
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
const PUBLICATION_FIELDS = [
    "author",
    "protocolVersion",
    "signature",
    "subplebbitAddress",
    "timestamp"
];
export const MOD_EDIT_FIELDS = [
    ...PUBLICATION_FIELDS,
    "commentCid",
    "flair",
    "spoiler",
    "pinned",
    "locked",
    "removed",
    "reason",
    "commentAuthor"
];
export const AUTHOR_EDIT_FIELDS = [
    ...PUBLICATION_FIELDS,
    "commentCid",
    "content",
    "flair",
    "spoiler",
    "reason",
    "deleted"
];
//# sourceMappingURL=constants.js.map