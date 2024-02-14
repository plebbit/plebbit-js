import { Plebbit } from "../plebbit.js";
import { ChallengeAnswerMessageType, ChallengeMessageType, ChallengeRequestMessageType, ChallengeVerificationMessageType, CommentEditPubsubMessage, CommentIpfsType, CommentPubsubMessage, CommentUpdate, CommentWithCommentUpdate, CreateCommentEditOptions, CreateCommentOptions, CreateVoteOptions, PageIpfs, VotePubsubMessage } from "../types.js";
import { JsonSignature, PubsubSignature, SignerType } from "./constants.js";
import { BaseClientsManager } from "../clients/base-client-manager.js";
import { SubplebbitIpfsType } from "../subplebbit/types.js";
export interface ValidationResult {
    valid: boolean;
    reason?: string;
}
export declare const signBufferEd25519: (bufferToSign: Uint8Array, privateKeyBase64: string) => Promise<Uint8Array>;
export declare const verifyBufferEd25519: (bufferToSign: Uint8Array, bufferSignature: Uint8Array, publicKeyBase64: string) => Promise<boolean>;
export declare function signComment(comment: CreateCommentOptions, signer: SignerType, plebbit: Plebbit): Promise<JsonSignature>;
export declare function signCommentUpdate(update: Omit<CommentUpdate, "signature">, signer: SignerType): Promise<JsonSignature>;
export declare function signVote(vote: CreateVoteOptions, signer: SignerType, plebbit: Plebbit): Promise<JsonSignature>;
export declare function signCommentEdit(edit: CreateCommentEditOptions, signer: SignerType, plebbit: Plebbit): Promise<JsonSignature>;
export declare function signSubplebbit(subplebbit: Omit<SubplebbitIpfsType, "signature">, signer: SignerType): Promise<JsonSignature>;
export declare function signChallengeRequest(request: Omit<ChallengeRequestMessageType, "signature">, signer: SignerType): Promise<PubsubSignature>;
export declare function signChallengeMessage(challengeMessage: Omit<ChallengeMessageType, "signature">, signer: SignerType): Promise<PubsubSignature>;
export declare function signChallengeAnswer(challengeAnswer: Omit<ChallengeAnswerMessageType, "signature">, signer: SignerType): Promise<PubsubSignature>;
export declare function signChallengeVerification(challengeVerification: Omit<ChallengeVerificationMessageType, "signature">, signer: SignerType): Promise<PubsubSignature>;
export declare function verifyVote(vote: VotePubsubMessage, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyCommentEdit(edit: CommentEditPubsubMessage, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyComment(comment: CommentPubsubMessage | CommentIpfsType, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult & {
    derivedAddress?: string;
}>;
export declare function verifySubplebbit(subplebbit: SubplebbitIpfsType, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyCommentUpdate(update: CommentUpdate, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, subplebbitAddress: string, comment: Pick<CommentWithCommentUpdate, "signature" | "cid">, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyChallengeRequest(request: ChallengeRequestMessageType, validateTimestampRange: boolean): Promise<ValidationResult>;
export declare function verifyChallengeMessage(challenge: ChallengeMessageType, pubsubTopic: string, validateTimestampRange: boolean): Promise<ValidationResult>;
export declare function verifyChallengeAnswer(answer: ChallengeAnswerMessageType, validateTimestampRange: boolean): Promise<ValidationResult>;
export declare function verifyChallengeVerification(verification: ChallengeVerificationMessageType, pubsubTopic: string, validateTimestampRange: boolean): Promise<ValidationResult>;
export declare function verifyPage(pageCid: string, page: PageIpfs, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, subplebbitAddress: string, parentCommentCid: string | undefined, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
