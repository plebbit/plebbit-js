import { z } from "zod";
import { CreateSignerSchema, JsonSignatureSchema } from "../schema/schema";
import type {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType,
    CommentPubsubMessage,
    CommentUpdate,
    CreateCommentOptions,
    PublicationTypeName
} from "../types";
import type { SubplebbitIpfsType } from "../subplebbit/types";
import {
    CommentSignedPropertyNames,
    VoteSignedPropertyNames,
    CommentEditSignedPropertyNames,
    CommentUpdateSignedPropertyNames
} from "./constants";
import type { CommentEditPubsubMessage, CreateCommentEditOptions } from "../publications/comment-edit/types";
import { CreateVoteOptions, VotePubsubMessage } from "../publications/vote/types";

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
    iv: string; // base64export type CreateSignerOptions = z.infer<typeof CreateSignerSchema>;

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
