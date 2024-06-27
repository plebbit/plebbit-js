import type { CommentEditPubsubMessageWithSubplebbitAuthor } from "../publications/comment-edit/types";
import type { CommentPubsubMessage } from "../publications/comment/types";
import type { VotePubsubMessageWithSubplebbitAuthor } from "../publications/vote/types";
import type { EncodedPubsubSignature, EncryptedEncoded } from "../signer/types";
import type { AuthorTypeWithCommentUpdate } from "../types";
import {
    ChallengeAnswerMessageSchema,
    ChallengeInChallengePubsubMessageSchema,
    ChallengeMessageSchema,
    ChallengeRequestMessageSchema,
    ChallengeVerificationMessageSchema,
    DecryptedChallengeAnswerSchema,
    DecryptedChallengeRequestSchema,
    DecryptedChallengeSchema,
    DecryptedChallengeVerificationSchema
} from "./schema";

import { z } from "zod";

export type ChallengeRequestMessageType = z.infer<typeof ChallengeRequestMessageSchema>;

export type DecryptedChallengeRequest = z.infer<typeof DecryptedChallengeRequestSchema>;

export interface DecryptedChallengeRequestMessageType extends ChallengeRequestMessageType, DecryptedChallengeRequest {}

export interface CommentPubsubMessageWithSubplebbitAuthor extends CommentPubsubMessage {
    author: AuthorTypeWithCommentUpdate;
}

export interface DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor extends DecryptedChallengeRequestMessageType {
    // This interface will query author.subplebbit and embed it within publication.author
    // We may add author
    publication:
        | VotePubsubMessageWithSubplebbitAuthor
        | CommentEditPubsubMessageWithSubplebbitAuthor
        | CommentPubsubMessageWithSubplebbitAuthor;
}

export interface EncodedDecryptedChallengeRequestMessageType
    extends Omit<DecryptedChallengeRequestMessageType, "challengeRequestId" | "encrypted" | "signature">,
        BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded; // all base64 strings
}

export interface EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
    extends Omit<EncodedDecryptedChallengeRequestMessageType, "publication">,
        Pick<DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, "publication"> {}

// Challenge message here

export type ChallengeType = z.infer<typeof ChallengeInChallengePubsubMessageSchema>;

export type ChallengeMessageType = z.infer<typeof ChallengeMessageSchema>;

export type DecryptedChallenge = z.infer<typeof DecryptedChallengeSchema>;

export interface DecryptedChallengeMessageType extends ChallengeMessageType, DecryptedChallenge {}

export interface EncodedDecryptedChallengeMessageType
    extends Omit<DecryptedChallengeMessageType, "challengeRequestId" | "encrypted" | "signature">,
        BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded; // all base64 strings
}

export type ChallengeAnswerMessageType = z.infer<typeof ChallengeAnswerMessageSchema>;

export type DecryptedChallengeAnswer = z.infer<typeof DecryptedChallengeAnswerSchema>;

export interface DecryptedChallengeAnswerMessageType extends ChallengeAnswerMessageType, DecryptedChallengeAnswer {}

export interface BaseEncodedPubsubMessage {
    challengeRequestId: string; // base64 string
    signature: EncodedPubsubSignature;
}

export interface EncodedDecryptedChallengeAnswerMessageType
    extends Omit<DecryptedChallengeAnswerMessageType, "challengeRequestId" | "encrypted" | "signature">,
        BaseEncodedPubsubMessage {
    encrypted: EncryptedEncoded; // all base64 strings
}

export type ChallengeVerificationMessageType = z.infer<typeof ChallengeVerificationMessageSchema>;

export type DecryptedChallengeVerification = z.infer<typeof DecryptedChallengeVerificationSchema>;

export interface DecryptedChallengeVerificationMessageType extends ChallengeVerificationMessageType, DecryptedChallengeVerification {}

export interface EncodedDecryptedChallengeVerificationMessageType
    extends Omit<DecryptedChallengeVerificationMessageType, "challengeRequestId" | "encrypted" | "signature">,
        BaseEncodedPubsubMessage {
    encrypted?: EncryptedEncoded; // all base64 strings
}

export interface EncodedDecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor
    extends Omit<EncodedDecryptedChallengeVerificationMessageType, "publication">,
        Pick<DecryptedChallengeVerificationMessageType, "publication"> {}

// Misc challenge pubsub message

export type PubsubMessage =
    | ChallengeRequestMessageType
    | ChallengeMessageType
    | ChallengeAnswerMessageType
    | ChallengeVerificationMessageType;
