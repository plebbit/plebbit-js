import { z } from "zod";
import { CreateSignerSchema, JsonSignatureSchema } from "../schema/schema";
import type {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType,
    PublicationTypeName
} from "../types";
import type { SubplebbitIpfsType } from "../subplebbit/types";

import type { CommentEditPubsubMessage, CreateCommentEditOptions } from "../publications/comment-edit/types";
import type { CreateVoteOptions, VotePubsubMessage } from "../publications/vote/types";
import type { CommentPubsubMessage, CommentUpdate, CreateCommentOptions } from "../publications/comment/types";
import { CommentSignedPropertyNames } from "../publications/comment/schema";
import { CommentEditSignedPropertyNames } from "../publications/comment-edit/schema";
import { VoteSignedPropertyNames } from "../publications/vote/schema";
import { CommentUpdateSignedPropertyNames } from "./constants";
import { EncryptedSchema, PubsubMessageSignatureSchema } from "../pubsub-messages/schema";

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

export type EncryptedEncoded = {
    ciphertext: string; // base64
    iv: string; // base64export type CreateSignerOptions = z.infer<typeof CreateSignerSchema>;

    tag: string; // base64
    type: "ed25519-aes-gcm";
};
// ---------------------------
// Signature

export type PubsubSignature = z.infer<typeof PubsubMessageSignatureSchema>;

export interface EncodedPubsubSignature extends Omit<PubsubSignature, "signature" | "publicKey"> {
    signature: string; // base64
    publicKey: string; // base64
}

export type SignatureTypes =
    | PublicationTypeName
    | "challengerequestmessage"
    | "challengemessage"
    | "challengeanswermessage"
    | "challengeverificationmessage";

// ---------------------------
// SignedPropertyNames union (different representation)
export type CommentSignedPropertyNamesUnion = (typeof CommentSignedPropertyNames)[number];
export type CommentEditSignedPropertyNamesUnion = (typeof CommentEditSignedPropertyNames)[number];
export type VoteSignedPropertyNamesUnion = (typeof VoteSignedPropertyNames)[number];
export type CommentUpdatedSignedPropertyNamesUnion = (typeof CommentUpdateSignedPropertyNames)[number];

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
