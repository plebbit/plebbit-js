import { Plebbit } from "../plebbit";
import { ChallengeAnswerMessageType, ChallengeMessageType, ChallengeRequestMessageType, ChallengeVerificationMessageType, CommentEditPubsubMessage, CommentIpfsType, CommentPubsubMessage, CommentUpdate, CommentWithCommentUpdate, CreateCommentEditOptions, CreateCommentOptions, CreateVoteOptions, PageIpfs, SubplebbitIpfsType, SubplebbitType, VotePubsubMessage } from "../types";
import { SignatureType, SignerType } from "./constants";
interface ValidationResult {
    valid: boolean;
    reason?: string;
}
export declare const signBufferEd25519: (bufferToSign: any, privateKeyBase64: any) => Promise<Uint8Array>;
export declare const verifyBufferEd25519: (bufferToSign: any, bufferSignature: any, publicKeyBase64: string) => Promise<boolean>;
export declare function signComment(comment: CreateCommentOptions, signer: SignerType, plebbit: Plebbit): Promise<SignatureType>;
export declare function signVote(vote: CreateVoteOptions, signer: SignerType, plebbit: Plebbit): Promise<SignatureType>;
export declare function signCommentEdit(edit: CreateCommentEditOptions, signer: SignerType, plebbit: Plebbit): Promise<SignatureType>;
export declare function signCommentUpdate(update: Omit<CommentUpdate, "signature">, signer: SignerType): Promise<SignatureType>;
export declare function signSubplebbit(subplebbit: Omit<SubplebbitIpfsType, "signature">, signer: SignerType): Promise<SignatureType>;
export declare function signChallengeRequest(request: Omit<ChallengeRequestMessageType, "signature">, signer: SignerType): Promise<SignatureType>;
export declare function signChallengeMessage(challengeMessage: Omit<ChallengeMessageType, "signature">, signer: SignerType): Promise<SignatureType>;
export declare function signChallengeAnswer(challengeAnswer: Omit<ChallengeAnswerMessageType, "signature">, signer: SignerType): Promise<SignatureType>;
export declare function signChallengeVerification(challengeVerification: Omit<ChallengeVerificationMessageType, "signature">, signer: SignerType): Promise<SignatureType>;
export declare function verifyVote(vote: VotePubsubMessage, plebbit: Plebbit, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyCommentEdit(edit: CommentEditPubsubMessage, plebbit: Plebbit, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyComment(comment: CommentPubsubMessage | CommentIpfsType, plebbit: Plebbit, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifySubplebbit(subplebbit: SubplebbitIpfsType, plebbit: Plebbit): Promise<ValidationResult>;
export declare function verifyCommentUpdate(update: CommentUpdate, subplebbit: Pick<SubplebbitType, "address">, comment: Pick<CommentWithCommentUpdate, "signature" | "cid">, plebbit: Plebbit): Promise<ValidationResult>;
export declare function verifyChallengeRequest(request: ChallengeRequestMessageType): Promise<ValidationResult>;
export declare function verifyChallengeMessage(challenge: ChallengeMessageType): Promise<ValidationResult>;
export declare function verifyChallengeAnswer(answer: ChallengeAnswerMessageType): Promise<ValidationResult>;
export declare function verifyChallengeVerification(verification: ChallengeVerificationMessageType): Promise<ValidationResult>;
export declare function verifyPage(page: PageIpfs, plebbit: Plebbit, subplebbit: Pick<SubplebbitType, "address">, parentCommentCid: string | undefined): Promise<ValidationResult>;
export {};
