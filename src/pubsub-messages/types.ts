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
    DecryptedChallengeVerificationSchema,
    EncodedDecryptedChallengeAnswerMessageSchema,
    EncodedDecryptedChallengeMessageSchema,
    EncodedDecryptedChallengeRequestMessageSchema,
    EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthorSchema,
    EncodedDecryptedChallengeVerificationMessageSchema
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

// challenge request here

export type EncodedDecryptedChallengeRequestMessageType = z.infer<typeof EncodedDecryptedChallengeRequestMessageSchema>;

export type EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor = z.infer<
    typeof EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthorSchema
>;

// challenge here

export type EncodedDecryptedChallengeMessageType = z.infer<typeof EncodedDecryptedChallengeMessageSchema>;

// challenge answer
export type EncodedDecryptedChallengeAnswerMessageType = z.infer<typeof EncodedDecryptedChallengeAnswerMessageSchema>;
// challenge verification

export type EncodedDecryptedChallengeVerificationMessageType = z.infer<typeof EncodedDecryptedChallengeVerificationMessageSchema>;
