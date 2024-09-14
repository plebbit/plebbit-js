import { z } from "zod";
import { CreateSignerSchema, JsonSignatureSchema } from "../schema/schema";
import type {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType
} from "../pubsub-messages/types";
import type { SubplebbitIpfsType } from "../subplebbit/types";

import type { CommentEditPubsubMessagePublication } from "../publications/comment-edit/types";
import type { VotePubsubMessagePublication } from "../publications/vote/types";
import type { CommentPubsubMessagePublication, CommentUpdateType, CreateCommentOptions } from "../publications/comment/types";
import { CommentSignedPropertyNames, CommentUpdateSignedPropertyNames } from "../publications/comment/schema";
import { CommentEditSignedPropertyNames } from "../publications/comment-edit/schema";
import { VoteSignedPropertyNames } from "../publications/vote/schema";
import { EncryptedSchema, PubsubMessageSignatureSchema } from "../pubsub-messages/schema";
import { CommentModerationSignedPropertyNames } from "../publications/comment-moderation/schema";
import { CommentModerationPubsubMessagePublication } from "../publications/comment-moderation/types";

export type CreateSignerOptions = z.infer<typeof CreateSignerSchema>;

export type JsonSignature = z.infer<typeof JsonSignatureSchema>;

export interface SignerType {
    type: "ed25519";
    privateKey: string;
    publicKey?: string;
    address: string;
    ipfsKey?: Uint8Array;
    ipnsKeyName?: string;
}

// ---------------------------

export type Encrypted = z.infer<typeof EncryptedSchema>;

// ---------------------------
// Signature

export type PubsubSignature = z.infer<typeof PubsubMessageSignatureSchema>;

// ---------------------------
// SignedPropertyNames union (different representation)
export type CommentSignedPropertyNamesUnion = (typeof CommentSignedPropertyNames)[number];
export type CommentEditSignedPropertyNamesUnion = (typeof CommentEditSignedPropertyNames)[number];
export type CommentModerationSignedPropertyNamesUnion = (typeof CommentModerationSignedPropertyNames)[number];
export type VoteSignedPropertyNamesUnion = (typeof VoteSignedPropertyNames)[number];
export type CommentUpdatedSignedPropertyNamesUnion = (typeof CommentUpdateSignedPropertyNames)[number];

// ---------------------------
// Signing

export type PublicationsToSign =
    | Omit<CommentEditPubsubMessagePublication, "signature">
    | Omit<CommentModerationPubsubMessagePublication, "signature">
    | Omit<VotePubsubMessagePublication, "signature">
    | Omit<CommentPubsubMessagePublication, "signature">
    | Omit<CommentUpdateType, "signature">
    | Omit<SubplebbitIpfsType, "signature">;

export type PubsubMsgsToSign =
    | Omit<ChallengeAnswerMessageType, "signature">
    | Omit<ChallengeRequestMessageType, "signature">
    | Omit<ChallengeVerificationMessageType, "signature">
    | Omit<ChallengeMessageType, "signature">;

// ---------------------------
// Verifying
export type PublicationToVerify =
    | CommentEditPubsubMessagePublication
    | CommentModerationPubsubMessagePublication
    | VotePubsubMessagePublication
    | CommentPubsubMessagePublication
    | SubplebbitIpfsType
    | CommentUpdateType;
