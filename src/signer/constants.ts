// Signer section

import { ChallengeAnswerMessage, ChallengeRequestMessage } from "../challenge.js";
import { SubplebbitIpfsType } from "../subplebbit/types.js";
import {
    AuthorCommentEdit,
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType,
    CommentEditPubsubMessage,
    CommentPubsubMessage,
    CommentUpdate,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreateVoteOptions,
    ModeratorCommentEdit,
    PublicationType,
    PublicationTypeName,
    VotePubsubMessage
} from "../types.js";

export type CreateSignerOptions = {
    privateKey?: string; // If undefined, generate a random private key
    type?: "ed25519";
};

export interface SignerType {
    type: "ed25519";
    privateKey: string;
    publicKey?: string;
    address: string;
    ipfsKey?: Uint8Array;
    ipnsKeyName?: string;
}

// ---------------------------
// Encryption
export type Encrypted = {
    // examples available at https://github.com/plebbit/plebbit-js/blob/master/docs/encryption.md
    ciphertext: Uint8Array;
    iv: Uint8Array;
    tag: Uint8Array;
    type: "ed25519-aes-gcm";
};

export type EncryptedEncoded = {
    ciphertext: string; // base64
    iv: string; // base64
    tag: string; // base64
    type: "ed25519-aes-gcm";
};
// ---------------------------
// Signature

export interface PubsubSignature {
    signature: Uint8Array; // (byte string in cbor)
    publicKey: Uint8Array; // (byte string in cbor) 32 bytes
    type: "ed25519";
    signedPropertyNames: readonly string[];
}

export interface EncodedPubsubSignature extends Omit<PubsubSignature, "signature" | "publicKey"> {
    signature: string; // base64
    publicKey: string; // base64
}

export interface JsonSignature extends Omit<PubsubSignature, "signature" | "publicKey"> {
    signature: string; // (base64)
    publicKey: string; // (base64) 32 bytes
}

export type SignatureTypes =
    | PublicationTypeName
    | "challengerequestmessage"
    | "challengemessage"
    | "challengeanswermessage"
    | "challengeverificationmessage";

// ---------------------------
// SignedPropertyNames

export const CommentSignedPropertyNames: readonly (keyof Omit<
    CreateCommentOptions,
    "signer" | "challengeCommentCids" | "challengeAnswers"
>)[] = ["subplebbitAddress", "author", "timestamp", "content", "title", "link", "parentCid"] as const;

export const CommentEditSignedPropertyNames: readonly (keyof Omit<
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

export const VoteSignedPropertyNames: readonly (keyof Omit<CreateVoteOptions, "signer" | "challengeCommentCids" | "challengeAnswers">)[] = [
    "subplebbitAddress",
    "author",
    "timestamp",
    "vote",
    "commentCid"
] as const;

export const SubplebbitSignedPropertyNames: readonly (keyof SubplebbitIpfsType)[] = [
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

export const ChallengeRequestMessageSignedPropertyNames: readonly (keyof ChallengeRequestMessage)[] = [
    "type",
    "challengeRequestId",
    "encrypted",
    "acceptedChallengeTypes",
    "timestamp"
] as const;
export const ChallengeMessageSignedPropertyNames: readonly (keyof ChallengeMessageType)[] = [
    "type",
    "challengeRequestId",
    "encrypted",
    "timestamp"
] as const;
export const ChallengeAnswerMessageSignedPropertyNames: readonly (keyof ChallengeAnswerMessage)[] = [
    "type",
    "challengeRequestId",
    "encrypted",
    "timestamp"
] as const;
export const ChallengeVerificationMessageSignedPropertyNames: readonly (keyof ChallengeVerificationMessageType)[] = [
    "reason",
    "type",
    "challengeRequestId",
    "encrypted",
    "challengeSuccess",
    "challengeErrors",
    "timestamp"
] as const;

export const CommentUpdateSignedPropertyNames: readonly (keyof CommentUpdate)[] = [
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

// ---------------------------
// SignedPropertyNames union (different representation)
export type CommentSignedPropertyNamesUnion = typeof CommentSignedPropertyNames[number];
export type CommentEditSignedPropertyNamesUnion = typeof CommentEditSignedPropertyNames[number];
export type VoteSignedPropertyNamesUnion = typeof VoteSignedPropertyNames[number];
export type CommentUpdatedSignedPropertyNamesUnion = typeof CommentUpdateSignedPropertyNames[number];

// ---------------------------
// Signing

export type PublicationsToSign =
    | CreateCommentEditOptions
    | CreateVoteOptions
    | CreateCommentOptions
    | Omit<CommentUpdate, "signature">
    | Omit<SubplebbitIpfsType, "signature">;

export type PubsubMsgsToSign =
    | Omit<ChallengeAnswerMessageType, "signature">
    | Omit<ChallengeRequestMessageType, "signature">
    | Omit<ChallengeVerificationMessageType, "signature">
    | Omit<ChallengeMessageType, "signature">;

// ---------------------------
// Verifying
export type PublicationToVerify = CommentEditPubsubMessage | VotePubsubMessage | CommentPubsubMessage | SubplebbitIpfsType | CommentUpdate;

// Export constants of CommentType fields

// Storing fields here to check before publishing if CommentEdit has proper field for either author or mod.
const PUBLICATION_FIELDS: (keyof Required<Omit<PublicationType, "challengeCommentCids" | "challengeAnswers">>)[] = [
    "author",
    "protocolVersion",
    "signature",
    "subplebbitAddress",
    "timestamp"
];

export const MOD_EDIT_FIELDS: (keyof ModeratorCommentEdit)[] = [
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

export const AUTHOR_EDIT_FIELDS: (keyof AuthorCommentEdit)[] = [
    ...PUBLICATION_FIELDS,
    "commentCid",
    "content",
    "flair",
    "spoiler",
    "reason",
    "deleted"
];
