import { z } from "zod";
import { CreateSignerSchema, JsonSignatureSchema } from "../schema/schema";
import type { ChallengeAnswerMessageType, ChallengeMessageType, ChallengeRequestMessageType, ChallengeVerificationMessageType, PublicationFromDecryptedChallengeRequest } from "../pubsub-messages/types";
import type { SubplebbitIpfsType } from "../subplebbit/types";
import type { CommentUpdateForChallengeVerification, CommentUpdateType } from "../publications/comment/types";
import { EncryptedSchema, PubsubMessageSignatureSchema } from "../pubsub-messages/schema";
export type CreateSignerOptions = z.infer<typeof CreateSignerSchema>;
export type JsonSignature = z.infer<typeof JsonSignatureSchema>;
export interface SignerType {
    type: "ed25519";
    privateKey: string;
    publicKey?: string;
    address: string;
    ipfsKey?: Uint8Array;
    ipnsKeyName?: string;
}
export type Encrypted = z.infer<typeof EncryptedSchema>;
export type PubsubSignature = z.infer<typeof PubsubMessageSignatureSchema>;
export type PubsubMsgToSign = Omit<ChallengeAnswerMessageType, "signature"> | Omit<ChallengeRequestMessageType, "signature"> | Omit<ChallengeVerificationMessageType, "signature"> | Omit<ChallengeMessageType, "signature">;
export type PlebbitRecordToVerify = PublicationFromDecryptedChallengeRequest | SubplebbitIpfsType | CommentUpdateType | CommentUpdateForChallengeVerification;
