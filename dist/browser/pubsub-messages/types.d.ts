import type { CommentEditPubsubMessagePublication, CommentEditPubsubMessagePublicationWithSubplebbitAuthor } from "../publications/comment-edit/types";
import type { CommentModerationPubsubMessagePublication, CommentModerationPubsubMessagePublicationWithSubplebbitAuthor } from "../publications/comment-moderation/types";
import type { CommentPubsubMessagePublication, CommentPubsubMessageWithSubplebbitAuthor, PostPubsubMessageWithSubplebbitAuthor, ReplyPubsubMessageWithSubplebbitAuthor } from "../publications/comment/types";
import type { SubplebbitEditPublicationPubsubMessageWithSubplebbitAuthor, SubplebbitEditPubsubMessagePublication } from "../publications/subplebbit-edit/types";
import type { VotePubsubMessagePublication, VotePubsubMessageWithSubplebbitAuthor } from "../publications/vote/types";
import type { PubsubSignature } from "../signer/types";
import type { AuthorTypeWithCommentUpdate } from "../types";
import { ChallengeAnswerMessageSchema, ChallengeAnswerMessageSignedPropertyNames, ChallengeInChallengePubsubMessageSchema, ChallengeMessageSchema, ChallengeMessageSignedPropertyNames, ChallengeRequestMessageSchema, ChallengeRequestMessageSignedPropertyNames, ChallengeVerificationMessageSchema, ChallengeVerificationMessageSignedPropertyNames, DecryptedChallengeAnswerSchema, DecryptedChallengeRequestPublicationSchema, DecryptedChallengeRequestSchema, DecryptedChallengeSchema, DecryptedChallengeVerificationSchema } from "./schema";
import { z } from "zod";
export type ChallengeRequestMessageType = z.infer<typeof ChallengeRequestMessageSchema>;
export type DecryptedChallengeRequestPublication = z.infer<typeof DecryptedChallengeRequestPublicationSchema>;
export type DecryptedChallengeRequest = z.infer<typeof DecryptedChallengeRequestSchema>;
export type DecryptedChallengeRequestMessageType = DecryptedChallengeRequest & ChallengeRequestMessageType;
export interface DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor extends Omit<DecryptedChallengeRequestMessageType, "comment" | "vote" | "commentEdit" | "commentModeration" | "subplebbitEdit"> {
    vote?: VotePubsubMessageWithSubplebbitAuthor;
    comment?: CommentPubsubMessageWithSubplebbitAuthor;
    commentEdit?: CommentEditPubsubMessagePublicationWithSubplebbitAuthor;
    commentModeration?: CommentModerationPubsubMessagePublicationWithSubplebbitAuthor;
    subplebbitEdit?: SubplebbitEditPublicationPubsubMessageWithSubplebbitAuthor;
}
export type PublicationFromDecryptedChallengeRequest = NonNullable<VotePubsubMessagePublication | CommentPubsubMessagePublication | CommentEditPubsubMessagePublication | CommentModerationPubsubMessagePublication | SubplebbitEditPubsubMessagePublication>;
export type PublicationWithSubplebbitAuthorFromDecryptedChallengeRequest = PublicationFromDecryptedChallengeRequest & {
    author: AuthorTypeWithCommentUpdate;
};
export interface DecryptedChallengeRequestMessageWithReplySubplebbitAuthor extends DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor {
    comment: ReplyPubsubMessageWithSubplebbitAuthor;
}
export interface DecryptedChallengeRequestMessageWithPostSubplebbitAuthor extends DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor {
    comment: PostPubsubMessageWithSubplebbitAuthor;
}
export type ChallengeType = z.infer<typeof ChallengeInChallengePubsubMessageSchema>;
export type ChallengeMessageType = z.infer<typeof ChallengeMessageSchema>;
export type DecryptedChallenge = z.infer<typeof DecryptedChallengeSchema>;
export type DecryptedChallengeMessageType = ChallengeMessageType & DecryptedChallenge;
export type ChallengeAnswerMessageType = z.infer<typeof ChallengeAnswerMessageSchema>;
export type DecryptedChallengeAnswer = z.infer<typeof DecryptedChallengeAnswerSchema>;
export type DecryptedChallengeAnswerMessageType = ChallengeAnswerMessageType & DecryptedChallengeAnswer;
export type ChallengeVerificationMessageType = z.infer<typeof ChallengeVerificationMessageSchema>;
export type DecryptedChallengeVerification = z.infer<typeof DecryptedChallengeVerificationSchema>;
export type DecryptedChallengeVerificationMessageType = ChallengeVerificationMessageType & Partial<DecryptedChallengeVerification>;
export type PubsubMessage = ChallengeRequestMessageType | ChallengeMessageType | ChallengeAnswerMessageType | ChallengeVerificationMessageType;
export type EncryptedEncoded = {
    ciphertext: string;
    iv: string;
    tag: string;
    type: string;
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
export interface EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor extends Omit<EncodedDecryptedChallengeRequestMessageType, keyof DecryptedChallengeRequestPublication>, Pick<DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, keyof DecryptedChallengeRequestPublication> {
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
export interface ChallengeRequestMessageSignature extends PubsubSignature {
    signedPropertyNames: typeof ChallengeRequestMessageSignedPropertyNames;
}
export interface ChallengeMessageSignature extends PubsubSignature {
    signedPropertyNames: typeof ChallengeMessageSignedPropertyNames;
}
export interface ChallengeAnswerMessageSignature extends PubsubSignature {
    signedPropertyNames: typeof ChallengeAnswerMessageSignedPropertyNames;
}
export interface ChallengeVerificationMessageSignature extends PubsubSignature {
    signedPropertyNames: typeof ChallengeVerificationMessageSignedPropertyNames;
}
