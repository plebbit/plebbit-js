import { Plebbit } from "../../plebbit.js";
import { PlebbitOptions } from "../../types.js";
import { Server as RpcWebsocketsServer } from "rpc-websockets";
import {
    EncodedDecryptedChallengeAnswerMessageSchema,
    EncodedDecryptedChallengeMessageSchema,
    EncodedDecryptedChallengeRequestMessageSchema,
    EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthorSchema,
    EncodedDecryptedChallengeVerificationMessageSchema,
    EncodedDecryptedChallengeVerificationMessageWithSubplebbitAuthorSchema,
    EncodedPubsubMessageSignatureSchema,
    EncryptedEncodedSchema
} from "./schema.js";
import { z } from "zod";

export type PlebbitWsServerClassOptions = Pick<ConstructorParameters<typeof RpcWebsocketsServer>[0], "port" | "server"> & {
    plebbit: Plebbit;
    authKey?: string;
};

export interface PlebbitWsServerOptions extends Omit<PlebbitWsServerClassOptions, "plebbit"> {
    plebbitOptions?: PlebbitOptions;
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

export type EncodedDecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor = z.infer<
    typeof EncodedDecryptedChallengeVerificationMessageWithSubplebbitAuthorSchema
>;
