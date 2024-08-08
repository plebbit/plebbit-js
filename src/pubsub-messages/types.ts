import type { PubsubSignature } from "../signer/types";
import {
    ChallengeAnswerMessageSchema,
    ChallengeInChallengePubsubMessageSchema,
    ChallengeMessageSchema,
    ChallengeRequestMessageSchema,
    ChallengeVerificationMessageSchema,
    CommentPubsubMessageWithSubplebbitAuthorSchema,
    DecryptedChallengeAnswerMessageSchema,
    DecryptedChallengeAnswerSchema,
    DecryptedChallengeMessageSchema,
    DecryptedChallengeRequestMessageSchema,
    DecryptedChallengeRequestMessageWithSubplebbitAuthorSchema,
    DecryptedChallengeRequestSchema,
    DecryptedChallengeSchema,
    DecryptedChallengeVerificationMessageSchema,
    DecryptedChallengeVerificationSchema
} from "./schema";

import { z } from "zod";

// Challenge requests here

export type ChallengeRequestMessageType = z.infer<typeof ChallengeRequestMessageSchema>;

export type DecryptedChallengeRequest = z.infer<typeof DecryptedChallengeRequestSchema>;

export type DecryptedChallengeRequestMessageType = z.infer<typeof DecryptedChallengeRequestMessageSchema>;

export type CommentPubsubMessageWithSubplebbitAuthor = z.infer<typeof CommentPubsubMessageWithSubplebbitAuthorSchema>;

export type DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor = z.infer<
    typeof DecryptedChallengeRequestMessageWithSubplebbitAuthorSchema
>;

// Challenge message here

export type ChallengeType = z.infer<typeof ChallengeInChallengePubsubMessageSchema>;

export type ChallengeMessageType = z.infer<typeof ChallengeMessageSchema>;

export type DecryptedChallenge = z.infer<typeof DecryptedChallengeSchema>;

export type DecryptedChallengeMessageType = z.infer<typeof DecryptedChallengeMessageSchema>;

// Challenge answer here
export type ChallengeAnswerMessageType = z.infer<typeof ChallengeAnswerMessageSchema>;

export type DecryptedChallengeAnswer = z.infer<typeof DecryptedChallengeAnswerSchema>;

export type DecryptedChallengeAnswerMessageType = z.infer<typeof DecryptedChallengeAnswerMessageSchema>;

// challenge verification

export type ChallengeVerificationMessageType = z.infer<typeof ChallengeVerificationMessageSchema>;

export type DecryptedChallengeVerification = z.infer<typeof DecryptedChallengeVerificationSchema>;

export type DecryptedChallengeVerificationMessageType = z.infer<typeof DecryptedChallengeVerificationMessageSchema>;

// Misc challenge pubsub message

export type PubsubMessage =
    | ChallengeRequestMessageType
    | ChallengeMessageType
    | ChallengeAnswerMessageType
    | ChallengeVerificationMessageType;

// encoded for rpc here

export type EncryptedEncoded = {
    ciphertext: string; // base64
    iv: string; // base64
    tag: string; // base64
    type: "ed25519-aes-gcm";
};

export interface EncodedPubsubSignature extends Omit<PubsubSignature, "signature" | "publicKey"> {
    signature: string; // base64
    publicKey: string; // base64
}

export interface BaseEncodedPubsubMessage {
    challengeRequestId: string; // base64 string
    signature: EncodedPubsubSignature;
}
export interface EncodedDecryptedChallengeRequestMessageType
    extends Omit<DecryptedChallengeRequestMessageType, "challengeRequestId" | "encrypted" | "signature">,
        BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded; // all base64 strings
}

export interface EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
    extends Omit<EncodedDecryptedChallengeRequestMessageType, "publication">,
        Pick<DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, "publication"> {}

export interface EncodedDecryptedChallengeMessageType
    extends Omit<DecryptedChallengeMessageType, "challengeRequestId" | "encrypted" | "signature">,
        BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded; // all base64 strings
}

export interface EncodedDecryptedChallengeAnswerMessageType
    extends Omit<DecryptedChallengeAnswerMessageType, "challengeRequestId" | "encrypted" | "signature">,
        BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded; // all base64 strings
}

export interface EncodedDecryptedChallengeVerificationMessageType
    extends Omit<DecryptedChallengeVerificationMessageType, "challengeRequestId" | "encrypted" | "signature">,
        BaseEncodedPubsubMessage {
    encrypted?: EncryptedEncoded; // all base64 strings
}
