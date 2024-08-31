import { Plebbit } from "../plebbit.js";
import type { ChallengeAnswerMessageType, ChallengeMessageType, ChallengeRequestMessageType, ChallengeVerificationMessageType } from "../pubsub-messages/types";
import Logger from "@plebbit/plebbit-logger";
import { messages } from "../errors.js";
import { BaseClientsManager } from "../clients/base-client-manager.js";
import type { SubplebbitIpfsType } from "../subplebbit/types.js";
import type { JsonSignature, PublicationsToSign, PubsubMsgsToSign, PubsubSignature, SignerType } from "./types.js";
import type { CommentEditOptionsToSign, CommentEditPubsubMessage } from "../publications/comment-edit/types.js";
import type { VoteOptionsToSign, VotePubsubMessage } from "../publications/vote/types.js";
import type { CommentIpfsType, CommentIpfsWithCidDefined, CommentOptionsToSign, CommentPubsubMessage, CommentUpdateType } from "../publications/comment/types.js";
import type { PageIpfs } from "../pages/types.js";
export type ValidationResult = {
    valid: true;
} | {
    valid: false;
    reason: string;
};
export declare const signBufferEd25519: (bufferToSign: Uint8Array, privateKeyBase64: string) => Promise<Uint8Array>;
export declare const verifyBufferEd25519: (bufferToSign: Uint8Array, bufferSignature: Uint8Array, publicKeyBase64: string) => Promise<boolean>;
export declare function _signJson(signedPropertyNames: JsonSignature["signedPropertyNames"], publication: PublicationsToSign, signer: SignerType, log: Logger): Promise<JsonSignature>;
export declare function _signPubsubMsg(signedPropertyNames: PubsubSignature["signedPropertyNames"], msg: PubsubMsgsToSign, signer: SignerType, log: Logger): Promise<PubsubSignature>;
export declare function cleanUpBeforePublishing<T extends PublicationsToSign | PubsubMsgsToSign | PageIpfs>(msg: T): T;
export declare function signComment(comment: CommentOptionsToSign, plebbit: Plebbit): Promise<{
    type: "ed25519" | "eip191";
    publicKey: string;
    signature: string;
    signedPropertyNames: [string, ...string[]];
}>;
export declare function signCommentUpdate(update: Omit<CommentUpdateType, "signature">, signer: SignerType): Promise<{
    type: "ed25519" | "eip191";
    publicKey: string;
    signature: string;
    signedPropertyNames: [string, ...string[]];
}>;
export declare function signVote(vote: VoteOptionsToSign, plebbit: Plebbit): Promise<{
    type: "ed25519" | "eip191";
    publicKey: string;
    signature: string;
    signedPropertyNames: [string, ...string[]];
}>;
export declare function signCommentEdit(edit: CommentEditOptionsToSign, plebbit: Plebbit): Promise<{
    type: "ed25519" | "eip191";
    publicKey: string;
    signature: string;
    signedPropertyNames: [string, ...string[]];
}>;
export declare function signSubplebbit(subplebbit: Omit<SubplebbitIpfsType, "signature">, signer: SignerType): Promise<{
    type: "ed25519" | "eip191";
    publicKey: string;
    signature: string;
    signedPropertyNames: [string, ...string[]];
}>;
export declare function signChallengeRequest(request: Omit<ChallengeRequestMessageType, "signature">, signer: SignerType): Promise<{
    type: "ed25519";
    publicKey: Uint8Array;
    signature: Uint8Array;
    signedPropertyNames: [string, ...string[]];
}>;
export declare function signChallengeMessage(challengeMessage: Omit<ChallengeMessageType, "signature">, signer: SignerType): Promise<{
    type: "ed25519";
    publicKey: Uint8Array;
    signature: Uint8Array;
    signedPropertyNames: [string, ...string[]];
}>;
export declare function signChallengeAnswer(challengeAnswer: Omit<ChallengeAnswerMessageType, "signature">, signer: SignerType): Promise<{
    type: "ed25519";
    publicKey: Uint8Array;
    signature: Uint8Array;
    signedPropertyNames: [string, ...string[]];
}>;
export declare function signChallengeVerification(challengeVerification: Omit<ChallengeVerificationMessageType, "signature">, signer: SignerType): Promise<{
    type: "ed25519";
    publicKey: Uint8Array;
    signature: Uint8Array;
    signedPropertyNames: [string, ...string[]];
}>;
export declare function verifyVote(vote: VotePubsubMessage, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyCommentEdit(edit: CommentEditPubsubMessage, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyCommentPubsubMessage(comment: CommentPubsubMessage, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<({
    valid: true;
} & {
    derivedAddress?: string;
}) | ({
    valid: false;
    reason: string;
} & {
    derivedAddress?: string;
}) | {
    valid: boolean;
    reason: messages;
}>;
export declare function verifyCommentIpfs(comment: CommentIpfsType, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<({
    valid: true;
} & {
    derivedAddress?: string;
}) | ({
    valid: false;
    reason: string;
} & {
    derivedAddress?: string;
}) | {
    valid: boolean;
    reason: messages;
}>;
export declare function verifySubplebbit(subplebbit: SubplebbitIpfsType, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean, resolveDomainSubAddress?: boolean): Promise<ValidationResult>;
export declare function verifyCommentUpdate(update: CommentUpdateType, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, subplebbitAddress: string, comment: Pick<CommentIpfsWithCidDefined, "signature" | "cid">, overrideAuthorAddressIfInvalid: boolean, resolveDomainSubAddress?: boolean): Promise<ValidationResult>;
export declare function verifyChallengeRequest(request: ChallengeRequestMessageType, validateTimestampRange: boolean): Promise<ValidationResult>;
export declare function verifyChallengeMessage(challenge: ChallengeMessageType, pubsubTopic: string, validateTimestampRange: boolean): Promise<ValidationResult>;
export declare function verifyChallengeAnswer(answer: ChallengeAnswerMessageType, validateTimestampRange: boolean): Promise<ValidationResult>;
export declare function verifyChallengeVerification(verification: ChallengeVerificationMessageType, pubsubTopic: string, validateTimestampRange: boolean): Promise<ValidationResult>;
export declare function verifyPage(pageCid: string, page: PageIpfs, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, subplebbitAddress: string, parentCommentCid: string | undefined, overrideAuthorAddressIfInvalid: boolean, resolveDomainSubAddress?: boolean): Promise<ValidationResult>;
