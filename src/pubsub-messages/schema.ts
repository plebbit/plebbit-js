import { z } from "zod";
import { CommentCidSchema, PlebbitTimestampSchema, ProtocolVersionSchema, UserAgentSchema } from "../schema/schema";
import { VotePubsubMessageSchema } from "../publications/vote/schema";
import { CommentEditPubsubMessageSchema } from "../publications/comment-edit/schema";
import {
    CommentIpfsWithCidPostCidDefinedSchema,
    CommentPubsubMessageWithRefinementSchema,
    AuthorWithCommentUpdateSchema,
    CommentPubsubMessageSchema
} from "../publications/comment/schema";

const AcceptedChallengeTypeSchema = z.string(); // TODO figure out the accepted challenge types
export const PubsubMessageSignatureSchema = z.object({
    signature: z.instanceof(Uint8Array), // (byte string in cbor)
    publicKey: z.instanceof(Uint8Array), // (byte string in cbor) 32 bytes
    type: z.enum(["ed25519"]),
    signedPropertyNames: z.string().array()
});

const PubsubMessageBaseSchema = z.object({
    challengeRequestId: z.instanceof(Uint8Array), // (byte string in cbor) // multihash of pubsubmessage.signature.publicKey, each challengeRequestMessage must use a new public key
    signature: PubsubMessageSignatureSchema,
    protocolVersion: ProtocolVersionSchema,
    userAgent: UserAgentSchema,
    timestamp: PlebbitTimestampSchema
});

export const EncryptedSchema = z.object({
    // examples available at https://github.com/plebbit/plebbit-js/blob/master/docs/encryption.md
    ciphertext: z.instanceof(Uint8Array),
    iv: z.instanceof(Uint8Array),
    tag: z.instanceof(Uint8Array),
    type: z.enum(["ed25519-aes-gcm"])
});

// publication with subplebbit author that are added by subplebbit when they respond to publication, or emit an event

export const CommentIpfsWithCidDefinedAndOptionalSubplebbitAuthorSchema = CommentIpfsWithCidPostCidDefinedSchema.extend({
    author: AuthorWithCommentUpdateSchema
});

export const VotePubsubMessageWithSubplebbitAuthorSchema = VotePubsubMessageSchema.extend({
    author: AuthorWithCommentUpdateSchema
});

export const CommentEditPubsubMessageWithSubplebbitAuthorSchema = CommentEditPubsubMessageSchema.extend({
    author: AuthorWithCommentUpdateSchema
});

export const CommentPubsubMessageWithSubplebbitAuthorSchema = CommentPubsubMessageSchema.extend({
    author: AuthorWithCommentUpdateSchema
});

// Challenge Request message

export const ChallengeRequestMessageSchema = PubsubMessageBaseSchema.extend({
    type: z.enum(["CHALLENGEREQUEST"]),
    encrypted: EncryptedSchema, // Will decrypt to DecryptedChallengeRequestSchema
    acceptedChallengeTypes: AcceptedChallengeTypeSchema.array().optional()
});

export const DecryptedChallengeRequestSchema = z.object({
    // ChallengeRequestMessage.encrypted.ciphertext decrypts to JSON, with these props

    publication: VotePubsubMessageSchema.or(CommentEditPubsubMessageSchema).or(CommentPubsubMessageWithRefinementSchema),
    challengeAnswers: z.string().array().optional(), // some challenges might be included in subplebbit.challenges and can be pre-answered
    challengeCommentCids: CommentCidSchema.array().optional() // some challenges could require including comment cids in other subs, like friendly subplebbit karma challenges
});

export const DecryptedChallengeRequestMessageSchema = ChallengeRequestMessageSchema.merge(DecryptedChallengeRequestSchema);

export const DecryptedChallengeRequestMessageWithSubplebbitAuthorSchema = DecryptedChallengeRequestMessageSchema.extend({
    publication: VotePubsubMessageWithSubplebbitAuthorSchema.or(CommentEditPubsubMessageWithSubplebbitAuthorSchema).or(
        CommentPubsubMessageWithSubplebbitAuthorSchema
    )
});

// Challenge message

export const ChallengeInChallengePubsubMessageSchema = z.object({
    challenge: z.string(),
    type: z.enum(["image/png", "text/plain", "chain/<chainTicker>"]),
    caseInsensitive: z.boolean().optional()
});

export const ChallengeMessageSchema = PubsubMessageBaseSchema.extend({
    type: z.enum(["CHALLENGE"]),
    encrypted: EncryptedSchema // Will decrypt to DecryptedChallengeSchema
});

export const DecryptedChallengeSchema = z.object({
    challenges: ChallengeInChallengePubsubMessageSchema.array()
});

export const DecryptedChallengeMessageSchema = ChallengeMessageSchema.merge(DecryptedChallengeSchema);

// Challenge answer

export const ChallengeAnswerMessageSchema = PubsubMessageBaseSchema.extend({
    type: z.enum(["CHALLENGEANSWER"]),
    encrypted: EncryptedSchema // Will decrypt to DecryptedChallengeAnswerSchema
});

export const DecryptedChallengeAnswerSchema = z.object({
    challengeAnswers: z.string().array().nonempty() // for example ['2+2=4', '1+7=8']
});

export const DecryptedChallengeAnswerMessageSchema = ChallengeAnswerMessageSchema.merge(DecryptedChallengeAnswerSchema);

// Challenge Verification

export const ChallengeVerificationMessageSchema = PubsubMessageBaseSchema.extend({
    type: z.enum(["CHALLENGEVERIFICATION"]),
    challengeSuccess: z.boolean(),
    challengeErrors: z.string().or(z.undefined()).array().optional(),
    reason: z.string().optional(),
    encrypted: EncryptedSchema.optional() // Will decrypt to DecryptedChallengeVerificationSchema
});

export const DecryptedChallengeVerificationSchema = z.object({
    publication: CommentIpfsWithCidDefinedAndOptionalSubplebbitAuthorSchema.optional()
});

export const DecryptedChallengeVerificationMessageSchema = ChallengeVerificationMessageSchema.merge(DecryptedChallengeVerificationSchema);

// Handling challenges for subplebbit

export const IncomingPubsubMessageSchema = ChallengeRequestMessageSchema.or(ChallengeMessageSchema)
    .or(ChallengeAnswerMessageSchema)
    .or(ChallengeVerificationMessageSchema);

// Handling challenges for publication
