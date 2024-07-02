import { z } from "zod";
import {
    DecryptedChallengeAnswerMessageSchema,
    DecryptedChallengeMessageSchema,
    DecryptedChallengeRequestMessageSchema,
    DecryptedChallengeRequestMessageWithSubplebbitAuthorSchema,
    DecryptedChallengeRequestSchema,
    DecryptedChallengeVerificationMessageSchema,
    DecryptedChallengeVerificationSchema,
    EncryptedSchema,
    PubsubMessageSignatureSchema
} from "../../pubsub-messages/schema";

const Base64StringSchema = z.string(); // TODO add validation

// Encrypted

export const EncryptedEncodedSchema = z.object({
    ciphertext: Base64StringSchema,
    iv: z.string(),
    tag: Base64StringSchema,
    type: EncryptedSchema.shape.type
});

// Pubsub messages

export const EncodedPubsubMessageSignatureSchema = PubsubMessageSignatureSchema.omit({ signature: true, publicKey: true }).extend({
    signature: Base64StringSchema,
    publicKey: Base64StringSchema
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
        encrypted: EncryptedEncodedSchema.optional()
    })
);

export const EncodedDecryptedChallengeVerificationMessageWithSubplebbitAuthorSchema =
    EncodedDecryptedChallengeVerificationMessageSchema.extend({
        publication: DecryptedChallengeVerificationMessageSchema.shape.publication
    });
