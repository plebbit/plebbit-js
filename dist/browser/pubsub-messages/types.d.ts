import type { CommentEditPubsubMessageWithSubplebbitAuthor } from "../publications/comment-edit/types";
import type { CommentPubsubMessageWithSubplebbitAuthor } from "../publications/comment/types";
import type { VotePubsubMessageWithSubplebbitAuthor } from "../publications/vote/types";
import type { PubsubSignature } from "../signer/types";
import { ChallengeAnswerMessageSchema, ChallengeInChallengePubsubMessageSchema, ChallengeMessageSchema, ChallengeRequestMessageSchema, ChallengeVerificationMessageSchema, DecryptedChallengeAnswerSchema, DecryptedChallengeRequestSchema, DecryptedChallengeSchema, DecryptedChallengeVerificationSchema } from "./schema";
import { z } from "zod";
export type ChallengeRequestMessageType = z.infer<typeof ChallengeRequestMessageSchema>;
export type DecryptedChallengeRequest = z.infer<typeof DecryptedChallengeRequestSchema>;
export type DecryptedChallengeRequestMessageType = DecryptedChallengeRequest & ChallengeRequestMessageType;
export type ChallengeType = z.infer<typeof ChallengeInChallengePubsubMessageSchema>;
export type ChallengeMessageType = z.infer<typeof ChallengeMessageSchema>;
export type DecryptedChallenge = z.infer<typeof DecryptedChallengeSchema>;
export type DecryptedChallengeMessageType = ChallengeMessageType & DecryptedChallenge;
export type ChallengeAnswerMessageType = z.infer<typeof ChallengeAnswerMessageSchema>;
export type DecryptedChallengeAnswer = z.infer<typeof DecryptedChallengeAnswerSchema>;
export type DecryptedChallengeAnswerMessageType = ChallengeAnswerMessageType & DecryptedChallengeAnswer;
export type ChallengeVerificationMessageType = z.infer<typeof ChallengeVerificationMessageSchema>;
export type DecryptedChallengeVerification = z.infer<typeof DecryptedChallengeVerificationSchema>;
export type DecryptedChallengeVerificationMessageType = ChallengeVerificationMessageType & DecryptedChallengeVerification;
export interface DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor extends DecryptedChallengeRequestMessageType {
    publication: VotePubsubMessageWithSubplebbitAuthor | CommentPubsubMessageWithSubplebbitAuthor | CommentEditPubsubMessageWithSubplebbitAuthor;
}
export type PubsubMessage = ChallengeRequestMessageType | ChallengeMessageType | ChallengeAnswerMessageType | ChallengeVerificationMessageType;
export type EncryptedEncoded = {
    ciphertext: string;
    iv: string;
    tag: string;
    type: "ed25519-aes-gcm";
};
export interface EncodedPubsubSignature extends Omit<PubsubSignature, "signature" | "publicKey"> {
    signature: string;
    publicKey: string;
}
export interface BaseEncodedPubsubMessage {
    challengeRequestId: string;
    signature: EncodedPubsubSignature;
}
export interface EncodedDecryptedChallengeRequestMessageType extends Omit<DecryptedChallengeRequestMessageType, "challengeRequestId" | "encrypted" | "signature">, BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded;
}
export interface EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor extends Omit<EncodedDecryptedChallengeRequestMessageType, "publication">, Pick<DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, "publication"> {
}
export interface EncodedDecryptedChallengeMessageType extends Omit<DecryptedChallengeMessageType, "challengeRequestId" | "encrypted" | "signature">, BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded;
}
export interface EncodedDecryptedChallengeAnswerMessageType extends Omit<DecryptedChallengeAnswerMessageType, "challengeRequestId" | "encrypted" | "signature">, BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded;
}
export interface EncodedDecryptedChallengeVerificationMessageType extends Omit<DecryptedChallengeVerificationMessageType, "challengeRequestId" | "encrypted" | "signature">, BaseEncodedPubsubMessage {
    encrypted?: EncryptedEncoded;
}
