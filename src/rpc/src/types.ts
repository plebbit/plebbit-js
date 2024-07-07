import { Plebbit } from "../../plebbit.js";
import {
    EncodedDecryptedChallengeAnswerMessageSchema,
    EncodedDecryptedChallengeMessageSchema,
    EncodedDecryptedChallengeRequestMessageSchema,
    EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthorSchema,
    EncodedDecryptedChallengeVerificationMessageSchema,
    EncodedPubsubMessageSignatureSchema,
    EncryptedEncodedSchema,
    PlebbitWsServerOptionsSchema
} from "./schema.js";
import { z } from "zod";

export type PlebbitWsServerOptions = z.infer<typeof PlebbitWsServerOptionsSchema>;

export interface PlebbitWsServerClassOptions extends PlebbitWsServerOptions {
    plebbit: Plebbit;
}

export type JsonRpcSendNotificationOptions = {
    method: string;
    result: any;
    subscription: number;
    event: string;
    connectionId: string;
};

// Encoded encrypted here

export type EncryptedEncoded = z.infer<typeof EncryptedEncodedSchema>;

// challenge request here
export type EncodedPubsubSignature = z.infer<typeof EncodedPubsubMessageSignatureSchema>;

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
