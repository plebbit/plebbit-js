import { Plebbit } from "../plebbit";
import { ChallengeAnswerMessageType, ChallengeMessageType, ChallengeRequestMessageType, ChallengeVerificationMessageType, CommentEditType, CommentType, CommentUpdate, CreateCommentEditOptions, CreateCommentOptions, CreateVoteOptions, PageType, SignatureType, SignedPropertyNames, SignerType, SubplebbitType, VoteType } from "../types";
interface ValidationResult {
    valid: boolean;
    reason?: string;
}
export declare class Signature implements SignatureType {
    signature: string;
    publicKey: string;
    type: "rsa";
    signedPropertyNames: SignedPropertyNames;
    constructor(props: SignatureType);
    toJSON(): {
        signature: string;
        publicKey: string;
        type: "rsa";
        signedPropertyNames: SignedPropertyNames;
    };
}
export declare const signBufferRsa: (bufferToSign: any, privateKeyPem: any, privateKeyPemPassword?: string) => Promise<any>;
export declare const verifyBufferRsa: (bufferToSign: any, bufferSignature: any, publicKeyPem: any) => Promise<any>;
export declare function signComment(comment: CreateCommentOptions, signer: SignerType, plebbit: Plebbit): Promise<Signature>;
export declare function signVote(vote: CreateVoteOptions, signer: SignerType, plebbit: Plebbit): Promise<Signature>;
export declare function signCommentEdit(edit: CreateCommentEditOptions, signer: SignerType, plebbit: Plebbit): Promise<Signature>;
export declare function signCommentUpdate(update: Omit<CommentUpdate, "signature">, signer: SignerType): Promise<Signature>;
export declare function signSubplebbit(subplebbit: Omit<SubplebbitType, "signature">, signer: SignerType): Promise<Signature>;
export declare function signChallengeRequest(request: Omit<ChallengeRequestMessageType, "signature">, signer: SignerType): Promise<Signature>;
export declare function signChallengeMessage(challengeMessage: Omit<ChallengeMessageType, "signature">, signer: SignerType): Promise<Signature>;
export declare function signChallengeAnswer(challengeAnswer: Omit<ChallengeAnswerMessageType, "signature">, signer: SignerType): Promise<Signature>;
export declare function signChallengeVerification(challengeVerification: Omit<ChallengeVerificationMessageType, "signature">, signer: SignerType): Promise<Signature>;
export declare function verifyVote(vote: VoteType, plebbit: Plebbit, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyCommentEdit(edit: CommentEditType, plebbit: Plebbit, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyComment(comment: CommentType, plebbit: Plebbit, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifySubplebbit(subplebbit: SubplebbitType, plebbit: Plebbit): Promise<ValidationResult>;
export declare function verifyCommentUpdate(update: CommentUpdate, subplebbitPublicKey: string, authorPublicKey: string): Promise<ValidationResult>;
export declare function verifyChallengeRequest(request: ChallengeRequestMessageType): Promise<ValidationResult>;
export declare function verifyChallengeMessage(challenge: ChallengeMessageType): Promise<ValidationResult>;
export declare function verifyChallengeAnswer(answer: ChallengeAnswerMessageType): Promise<ValidationResult>;
export declare function verifyChallengeVerification(verification: ChallengeVerificationMessageType): Promise<ValidationResult>;
export declare function verifyPage(page: PageType, plebbit: Plebbit, subplebbitAddress: string): Promise<ValidationResult>;
export {};
