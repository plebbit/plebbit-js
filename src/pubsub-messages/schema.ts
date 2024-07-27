import { z } from "zod";
import { ChallengeAnswersSchema, CidStringSchema, PlebbitTimestampSchema, ProtocolVersionSchema, UserAgentSchema } from "../schema/schema";
import { VotePubsubMessageSchema } from "../publications/vote/schema";
import { CommentEditPubsubMessageSchema } from "../publications/comment-edit/schema";
import {
    CommentIpfsWithCidPostCidDefinedSchema,
    CommentPubsubMessageWithRefinementSchema,
    AuthorWithCommentUpdateSchema,
    CommentPubsubMessageSchema
} from "../publications/comment/schema";
import { ChallengeFileSchema, ChallengeFromGetChallengeSchema } from "../subplebbit/schema";

const AcceptedChallengeTypeSchema = z.string(); // TODO figure out the accepted challenge types
export const PubsubMessageSignatureSchema = z
    .object({
        signature: z.instanceof(Uint8Array), // (byte string in cbor)
        publicKey: z.instanceof(Uint8Array), // (byte string in cbor) 32 bytes
        type: z.enum(["ed25519"]),
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

export const DecryptedChallengeRequestSchema = z
    .object({
        // ChallengeRequestMessage.encrypted.ciphertext decrypts to JSON, with these props

        publication: VotePubsubMessageSchema.or(CommentEditPubsubMessageSchema).or(CommentPubsubMessageWithRefinementSchema),
        challengeAnswers: z.string().array().optional(), // some challenges might be included in subplebbit.challenges and can be pre-answered
        challengeCommentCids: CidStringSchema.array().optional() // some challenges could require including comment cids in other subs, like friendly subplebbit karma challenges
    })
    .strict();

export const DecryptedChallengeRequestMessageSchema = ChallengeRequestMessageSchema.merge(DecryptedChallengeRequestSchema);

export const DecryptedChallengeRequestMessageWithSubplebbitAuthorSchema = DecryptedChallengeRequestMessageSchema.extend({
    publication: VotePubsubMessageWithSubplebbitAuthorSchema.or(CommentEditPubsubMessageWithSubplebbitAuthorSchema).or(
        CommentPubsubMessageWithSubplebbitAuthorSchema
    )
}).strict();

// Challenge message

export const ChallengeInChallengePubsubMessageSchema = z
    .object({
        challenge: z.string(),
        type: ChallengeFromGetChallengeSchema.shape.type,
        caseInsensitive: ChallengeFileSchema.shape.caseInsensitive
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

// Handling challenges for subplebbit

export const IncomingPubsubMessageSchema = ChallengeRequestMessageSchema.or(ChallengeMessageSchema)
    .or(ChallengeAnswerMessageSchema)
    .or(ChallengeVerificationMessageSchema);

// Encoded pubsub messages for RPC
const Base64StringSchema = z.string().base64();

// Encrypted

export const EncryptedEncodedSchema = z.object({
    ciphertext: z.string(),
    iv: z.string(),
    tag: z.string(),
    type: EncryptedSchema.shape.type
});

// Pubsub messages

export const EncodedPubsubMessageSignatureSchema = PubsubMessageSignatureSchema.omit({ signature: true, publicKey: true }).extend({
    signature: z.string(),
    publicKey: z.string()
});

const BaseEncodedPubsubMessageSchema = z.object({
    challengeRequestId: Base64StringSchema,
    signature: EncodedPubsubMessageSignatureSchema
});

// Challenge request

export const EncodedDecryptedChallengeRequestMessageSchema = BaseEncodedPubsubMessageSchema.merge(
    DecryptedChallengeRequestMessageSchema.omit({
        challengeRequestId: true,
        encrypted: true,
        signature: true
    })
).extend({
    encrypted: EncryptedEncodedSchema
});

export const EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthorSchema = EncodedDecryptedChallengeRequestMessageSchema.omit({
    publication: true
}).extend({
    publication: DecryptedChallengeRequestMessageWithSubplebbitAuthorSchema.shape.publication
});

// challenge here

export const EncodedDecryptedChallengeMessageSchema = DecryptedChallengeMessageSchema.omit({
    challengeRequestId: true,
    encrypted: true,
    signature: true
})
    .merge(BaseEncodedPubsubMessageSchema)
    .extend({
        encrypted: EncryptedEncodedSchema
    });

// challenge answer

export const EncodedDecryptedChallengeAnswerMessageSchema = DecryptedChallengeAnswerMessageSchema.omit({
    challengeRequestId: true,
    encrypted: true,
    signature: true
})
    .merge(BaseEncodedPubsubMessageSchema)
    .extend({
        encrypted: EncryptedEncodedSchema
    });
// Challenge verification

export const EncodedDecryptedChallengeVerificationMessageSchema = BaseEncodedPubsubMessageSchema.merge(
    DecryptedChallengeVerificationMessageSchema.omit({ challengeRequestId: true, encrypted: true, signature: true }).extend({
        encrypted: EncryptedEncodedSchema.optional(),
        publication: DecryptedChallengeVerificationMessageSchema.shape.publication.optional()
    })
);
