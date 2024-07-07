import { z } from "zod";
import {
    DecryptedChallengeAnswerMessageSchema,
    DecryptedChallengeMessageSchema,
    DecryptedChallengeRequestMessageSchema,
    DecryptedChallengeRequestMessageWithSubplebbitAuthorSchema,
    DecryptedChallengeVerificationMessageSchema,
    EncryptedSchema,
    PubsubMessageSignatureSchema
} from "../../pubsub-messages/schema";
import { PlebbitUserOptionsSchema } from "../../schema";
import { Server as RpcWebsocketsServer } from "rpc-websockets";
import { Server as HTTPServer } from "http";
import { Server as HTTPSServer } from "https";

const Base64StringSchema = z.string().base64();

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
        encrypted: EncryptedEncodedSchema.optional(),
        publication: DecryptedChallengeVerificationMessageSchema.shape.publication.optional()
    })
);

// Setting up WS

const WsServerClassOptions = z.object({
    port: z.number().int().positive().optional(),
    server: z.custom<HTTPServer | HTTPSServer>((data) => data instanceof HTTPServer || data instanceof HTTPServer).optional()
});

export const PlebbitWsServerOptionsSchema = z
    .object({
        plebbitOptions: PlebbitUserOptionsSchema.optional(),
        authKey: z.string().optional()
    })
    .merge(WsServerClassOptions);
