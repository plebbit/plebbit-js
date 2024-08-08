import { z } from "zod";
import { ChallengeAnswersSchema, CidStringSchema, PlebbitTimestampSchema, ProtocolVersionSchema, UserAgentSchema } from "../schema/schema";
import { VotePubsubMessageSchema } from "../publications/vote/schema";
import { CommentEditPubsubMessageSchema } from "../publications/comment-edit/schema";
import {
    CommentIpfsWithCidPostCidDefinedSchema,
    AuthorWithCommentUpdateSchema,
    CommentPubsubMessageSchema,
    CreateCommentOptionsSchema
} from "../publications/comment/schema";
import { ChallengeFileSchema, ChallengeFromGetChallengeSchema } from "../subplebbit/schema";
import * as remeda from "remeda";

const AcceptedChallengeTypeSchema = z.string(); // TODO figure out the accepted challenge types
export const PubsubMessageSignatureSchema = z
    .object({
        signature: z.instanceof(Uint8Array), // (byte string in cbor)
        publicKey: z.instanceof(Uint8Array), // (byte string in cbor) 32 bytes
        type: z.enum(["ed25519"]),
        signedPropertyNames: z.string().array().nonempty()
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
        type: z.enum(["ed25519-aes-gcm"])
    })
    .strict();

// publication with subplebbit author that are added by subplebbit when they respond to publication, or emit an event

export const CommentIpfsWithCidDefinedAndOptionalSubplebbitAuthorSchema = CommentIpfsWithCidPostCidDefinedSchema.extend({
    author: AuthorWithCommentUpdateSchema
}).strict();

export const VotePubsubMessageWithSubplebbitAuthorSchema = VotePubsubMessageSchema.extend({
    author: AuthorWithCommentUpdateSchema
}).strict();

export const CommentEditPubsubMessageWithSubplebbitAuthorSchema = CommentEditPubsubMessageSchema.extend({
    author: AuthorWithCommentUpdateSchema
}).strict();

export const CommentPubsubMessageWithSubplebbitAuthorSchema = CommentPubsubMessageSchema.extend({
    author: AuthorWithCommentUpdateSchema
}).strict();

// Challenge Request message

export const ChallengeRequestMessageSchema = PubsubMessageBaseSchema.extend({
    type: z.enum(["CHALLENGEREQUEST"]),
    encrypted: EncryptedSchema, // Will decrypt to DecryptedChallengeRequestSchema
    acceptedChallengeTypes: AcceptedChallengeTypeSchema.array().optional()
}).strict();

export const DecryptedChallengeRequestSchema = z.object({
    // ChallengeRequestMessage.encrypted.ciphertext decrypts to JSON, with these props

    publication: VotePubsubMessageSchema.or(CommentEditPubsubMessageSchema).or(CommentPubsubMessageSchema),
    challengeAnswers: CreateCommentOptionsSchema.shape.challengeAnswers, // some challenges might be included in subplebbit.challenges and can be pre-answered
    challengeCommentCids: CreateCommentOptionsSchema.shape.challengeCommentCids // some challenges could require including comment cids in other subs, like friendly subplebbit karma challenges
});

export const DecryptedChallengeRequestMessageSchema = ChallengeRequestMessageSchema.merge(DecryptedChallengeRequestSchema);

export const DecryptedChallengeRequestMessageWithSubplebbitAuthorSchema = DecryptedChallengeRequestMessageSchema.extend({
    publication: VotePubsubMessageWithSubplebbitAuthorSchema.or(CommentEditPubsubMessageWithSubplebbitAuthorSchema).or(
        CommentPubsubMessageWithSubplebbitAuthorSchema
    )
}).strict();

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
    type: z.enum(["CHALLENGE"]),
    encrypted: EncryptedSchema // Will decrypt to DecryptedChallengeSchema
}).strict();

export const DecryptedChallengeSchema = z
    .object({
        challenges: ChallengeInChallengePubsubMessageSchema.array()
    })
    .strict();

export const DecryptedChallengeMessageSchema = ChallengeMessageSchema.merge(DecryptedChallengeSchema).strict();

export const ChallengeMessageSignedPropertyNames = remeda.keys.strict(remeda.omit(ChallengeMessageSchema.shape, ["signature"]));

// Challenge answer

export const ChallengeAnswerMessageSchema = PubsubMessageBaseSchema.extend({
    type: z.enum(["CHALLENGEANSWER"]),
    encrypted: EncryptedSchema // Will decrypt to DecryptedChallengeAnswerSchema
}).strict();

export const DecryptedChallengeAnswerSchema = z
    .object({
        challengeAnswers: ChallengeAnswersSchema // for example ['2+2=4', '1+7=8']
    })
    .strict();

export const DecryptedChallengeAnswerMessageSchema = ChallengeAnswerMessageSchema.merge(DecryptedChallengeAnswerSchema).strict();

export const ChallengeAnswerMessageSignedPropertyNames = remeda.keys.strict(remeda.omit(ChallengeAnswerMessageSchema.shape, ["signature"]));

// Challenge Verification

export const ChallengeVerificationMessageSchema = PubsubMessageBaseSchema.extend({
    type: z.enum(["CHALLENGEVERIFICATION"]),
    challengeSuccess: z.boolean(),
    challengeErrors: z.string().or(z.undefined()).array().optional(),
    reason: z.string().optional(),
    encrypted: EncryptedSchema.optional() // Will decrypt to DecryptedChallengeVerificationSchema
}).strict();

export const DecryptedChallengeVerificationSchema = z
    .object({
        publication: CommentIpfsWithCidDefinedAndOptionalSubplebbitAuthorSchema.optional()
    })
    .strict();

export const DecryptedChallengeVerificationMessageSchema = ChallengeVerificationMessageSchema.merge(
    DecryptedChallengeVerificationSchema
).strict();

export const ChallengeVerificationMessageSignedPropertyNames = remeda.keys.strict(
    remeda.omit(ChallengeVerificationMessageSchema.shape, ["signature"])
);

// Handling challenges for subplebbit

export const IncomingPubsubMessageSchema = ChallengeRequestMessageSchema.or(ChallengeMessageSchema)
    .or(ChallengeAnswerMessageSchema)
    .or(ChallengeVerificationMessageSchema);
