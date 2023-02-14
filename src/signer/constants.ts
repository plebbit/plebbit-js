// Signer section

import { ChallengeAnswerMessage, ChallengeRequestMessage } from "../challenge";
import {
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
    PublicationTypeName,
    SubplebbitIpfsType,
    VotePubsubMessage
} from "../types";

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
    ciphertext: string;
    iv: string;
    tag: string;
    type: "ed25519-aes-gcm";
};

// ---------------------------
// Signature

export interface SignatureType {
    signature: string;
    publicKey: string;
    type: "ed25519";
    signedPropertyNames: string[];
}

export type SignatureTypes =
    | PublicationTypeName
    | "challengerequestmessage"
    | "challengemessage"
    | "challengeanswermessage"
    | "challengeverificationmessage";

// ---------------------------
// SignedPropertyNames

export const CommentSignedPropertyNames: (keyof CreateCommentOptions)[] = [
    "subplebbitAddress",
    "author",
    "timestamp",
    "content",
    "title",
    "link",
    "parentCid"
];

export const CommentEditSignedPropertyNames: (keyof CreateCommentEditOptions)[] = [
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

export const VoteSignedPropertyNames: (keyof CreateVoteOptions)[] = ["subplebbitAddress", "author", "timestamp", "vote", "commentCid"];

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
    "cid"
];

export const SubplebbitSignedPropertyNames: (keyof SubplebbitIpfsType)[] = [
    "title",
    "description",
    "roles",
    "pubsubTopic",
    "lastPostCid",
    "posts",
    "challengeTypes",
    "metricsCid",
    "createdAt",
    "updatedAt",
    "features",
    "suggested",
    "rules",
    "address",
    "flairs",
    "encryption"
];

export const ChallengeRequestMessageSignedPropertyNames: (keyof ChallengeRequestMessage)[] = [
    "type",
    "challengeRequestId",
    "encryptedPublication",
    "acceptedChallengeTypes",
    "timestamp"
];
export const ChallengeMessageSignedPropertyNames: (keyof ChallengeMessageType)[] = [
    "type",
    "challengeRequestId",
    "encryptedChallenges",
    "timestamp"
];
export const ChallengeAnswerMessageSignedPropertyNames: (keyof ChallengeAnswerMessage)[] = [
    "type",
    "challengeRequestId",
    "challengeAnswerId",
    "encryptedChallengeAnswers",
    "timestamp"
];
export const ChallengeVerificationMessageSignedPropertyNames: (keyof ChallengeVerificationMessageType)[] = [
    "reason",
    "type",
    "challengeRequestId",
    "encryptedPublication",
    "challengeAnswerId",
    "challengeSuccess",
    "challengeErrors",
    "timestamp"
];

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
    | Omit<SubplebbitIpfsType, "signature">
    | Omit<ChallengeAnswerMessageType, "signature">
    | Omit<ChallengeRequestMessageType, "signature">
    | Omit<ChallengeVerificationMessageType, "signature">
    | Omit<ChallengeMessageType, "signature">;

// ---------------------------
// Verifying
export type PublicationToVerify =
    | CommentEditPubsubMessage
    | VotePubsubMessage
    | CommentPubsubMessage
    | CommentUpdate
    | SubplebbitIpfsType
    | ChallengeRequestMessageType
    | ChallengeMessageType
    | ChallengeAnswerMessageType
    | ChallengeVerificationMessageType;
