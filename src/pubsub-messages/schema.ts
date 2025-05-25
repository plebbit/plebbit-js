import { z } from "zod";
import {
    ChallengeAnswersSchema,
    CreatePublicationUserOptionsSchema,
    PlebbitTimestampSchema,
    ProtocolVersionSchema,
    UserAgentSchema
} from "../schema/schema.js";
import { VotePubsubMessagePublicationSchema } from "../publications/vote/schema.js";
import { CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema } from "../publications/comment-edit/schema.js";
import {
    CommentIpfsSchema,
    CommentPubsubMessageWithFlexibleAuthorRefinementSchema,
    CommentUpdateForChallengeVerificationSchema
} from "../publications/comment/schema.js";
import { ChallengeFileSchema, ChallengeFromGetChallengeSchema } from "../subplebbit/schema.js";
import * as remeda from "remeda";
import { CommentModerationPubsubMessagePublicationSchema } from "../publications/comment-moderation/schema.js";
import { SubplebbitEditPubsubMessagePublicationSchema } from "../publications/subplebbit-edit/schema.js";
import { nonNegativeIntStringSchema } from "../schema.js";

const AcceptedChallengeTypeSchema = z.string().min(1);

export const PubsubMessageSignatureSchema = z
    .object({
        signature: z.instanceof(Uint8Array), // (byte string in cbor)
        publicKey: z.instanceof(Uint8Array), // (byte string in cbor) 32 bytes
        type: z.string().min(1),
        signedPropertyNames: z.string().array()
    })
    .strict();

const PubsubMessageBaseSchema = z.object({
    challengeRequestId: z.instanceof(Uint8Array), // (byte string in cbor) // multihash of pubsubmessage.signature.publicKey, each challengeRequestMessage must use a new public key
    signature: PubsubMessageSignatureSchema,
    protocolVersion: ProtocolVersionSchema,
    userAgent: UserAgentSchema,
    timestamp: PlebbitTimestampSchema
});

export const EncryptedSchema = z
    .object({
        // examples available at https://github.com/plebbit/plebbit-js/blob/master/docs/encryption.md
        ciphertext: z.instanceof(Uint8Array),
        iv: z.instanceof(Uint8Array),
        tag: z.instanceof(Uint8Array),
        type: z.string().min(1)
    })
    .strict();

// publication with subplebbit author that are added by subplebbit when they respond to publication, or emit an event

// Challenge Request message

export const ChallengeRequestMessageSchema = PubsubMessageBaseSchema.extend({
    type: z.literal("CHALLENGEREQUEST"),
    encrypted: EncryptedSchema, // Will decrypt to DecryptedChallengeRequestSchema
    acceptedChallengeTypes: AcceptedChallengeTypeSchema.array().optional()
}).strict();

export const DecryptedChallengeRequestPublicationSchema = z.object({
    comment: CommentPubsubMessageWithFlexibleAuthorRefinementSchema.optional(),
    vote: VotePubsubMessagePublicationSchema.passthrough().optional(),
    commentEdit: CommentEditPubsubMessagePublicationWithFlexibleAuthorSchema.passthrough().optional(),
    commentModeration: CommentModerationPubsubMessagePublicationSchema.passthrough().optional(),
    subplebbitEdit: SubplebbitEditPubsubMessagePublicationSchema.passthrough().optional()
});

// ChallengeRequestMessage.encrypted.ciphertext decrypts to JSON, with these props
export const DecryptedChallengeRequestSchema = DecryptedChallengeRequestPublicationSchema.merge(
    CreatePublicationUserOptionsSchema.shape.challengeRequest.unwrap()
);

export const ChallengeRequestMessageSignedPropertyNames = remeda.keys.strict(
    remeda.omit(ChallengeRequestMessageSchema.shape, ["signature"])
);
// Challenge message

export const ChallengeInChallengePubsubMessageSchema = z
    .object({
        challenge: z.string(),
        type: z.lazy(() => ChallengeFromGetChallengeSchema.shape.type),
        caseInsensitive: z.lazy(() => ChallengeFileSchema.shape.caseInsensitive)
    })
    .strict();

export const ChallengeMessageSchema = PubsubMessageBaseSchema.extend({
    type: z.literal("CHALLENGE"),
    encrypted: EncryptedSchema // Will decrypt to DecryptedChallengeSchema
}).strict();

export const DecryptedChallengeSchema = z
    .object({
        challenges: ChallengeInChallengePubsubMessageSchema.array()
    })
    .strict();
export const ChallengeMessageSignedPropertyNames = remeda.keys.strict(remeda.omit(ChallengeMessageSchema.shape, ["signature"]));

// Challenge answer

export const ChallengeAnswerMessageSchema = PubsubMessageBaseSchema.extend({
    type: z.literal("CHALLENGEANSWER"),
    encrypted: EncryptedSchema // Will decrypt to DecryptedChallengeAnswerSchema
}).strict();

export const DecryptedChallengeAnswerSchema = z
    .object({
        challengeAnswers: ChallengeAnswersSchema // for example ['2+2=4', '1+7=8']
    })
    .strict();

export const ChallengeAnswerMessageSignedPropertyNames = remeda.keys.strict(remeda.omit(ChallengeAnswerMessageSchema.shape, ["signature"]));

// Challenge Verification

export const ChallengeVerificationMessageSchema = PubsubMessageBaseSchema.extend({
    type: z.literal("CHALLENGEVERIFICATION"),
    challengeSuccess: z.boolean(),
    challengeErrors: z.record(nonNegativeIntStringSchema, z.string()).optional(), // challenge index => challenge error
    reason: z.string().optional(),
    encrypted: EncryptedSchema.optional() // Will decrypt to DecryptedChallengeVerificationSchema
}).strict();

export const DecryptedChallengeVerificationSchema = z
    .object({
        comment: CommentIpfsSchema.passthrough(),
        commentUpdate: CommentUpdateForChallengeVerificationSchema.passthrough()
    })
    .strict();

export const ChallengeVerificationMessageSignedPropertyNames = remeda.keys.strict(
    remeda.omit(ChallengeVerificationMessageSchema.shape, ["signature"])
);

// Handling challenges for subplebbit
