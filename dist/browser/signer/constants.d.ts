import { ChallengeAnswerMessage, ChallengeRequestMessage } from "../challenge";
import { ChallengeAnswerMessageType, ChallengeMessageType, ChallengeRequestMessageType, ChallengeVerificationMessageType, CommentEditPubsubMessage, CommentPubsubMessage, CommentUpdate, CreateCommentEditOptions, CreateCommentOptions, CreateVoteOptions, PublicationTypeName, SubplebbitIpfsType, VotePubsubMessage } from "../types";
export type CreateSignerOptions = {
    privateKey?: string;
    type?: "ed25519";
};
export interface SignerType {
    type: "ed25519";
    privateKey: string;
    publicKey?: string;
    address: string;
    ipfsKey?: Uint8Array;
    ipnsKeyName?: string;
}
export type Encrypted = {
    ciphertext: Uint8Array;
    iv: Uint8Array;
    tag: Uint8Array;
    type: "ed25519-aes-gcm";
};
export interface PubsubSignature {
    signature: Uint8Array;
    publicKey: Uint8Array;
    type: "ed25519";
    signedPropertyNames: readonly string[];
}
export interface JsonSignature extends Omit<PubsubSignature, "signature" | "publicKey"> {
    signature: string;
    publicKey: string;
}
export type SignatureTypes = PublicationTypeName | "challengerequestmessage" | "challengemessage" | "challengeanswermessage" | "challengeverificationmessage";
export declare const CommentSignedPropertyNames: readonly (keyof CreateCommentOptions)[];
export declare const CommentEditSignedPropertyNames: readonly (keyof CreateCommentEditOptions)[];
export declare const VoteSignedPropertyNames: readonly (keyof CreateVoteOptions)[];
export declare const CommentUpdateSignedPropertyNames: readonly (keyof CommentUpdate)[];
export declare const SubplebbitSignedPropertyNames: readonly (keyof SubplebbitIpfsType)[];
export declare const ChallengeRequestMessageSignedPropertyNames: readonly (keyof ChallengeRequestMessage)[];
export declare const ChallengeMessageSignedPropertyNames: readonly (keyof ChallengeMessageType)[];
export declare const ChallengeAnswerMessageSignedPropertyNames: readonly (keyof ChallengeAnswerMessage)[];
export declare const ChallengeVerificationMessageSignedPropertyNames: readonly (keyof ChallengeVerificationMessageType)[];
export type CommentSignedPropertyNamesUnion = typeof CommentSignedPropertyNames[number];
export type CommentEditSignedPropertyNamesUnion = typeof CommentEditSignedPropertyNames[number];
export type VoteSignedPropertyNamesUnion = typeof VoteSignedPropertyNames[number];
export type CommentUpdatedSignedPropertyNamesUnion = typeof CommentUpdateSignedPropertyNames[number];
export type PublicationsToSign = CreateCommentEditOptions | CreateVoteOptions | CreateCommentOptions | Omit<CommentUpdate, "signature"> | Omit<SubplebbitIpfsType, "signature">;
export type PubsubMsgsToSign = Omit<ChallengeAnswerMessageType, "signature"> | Omit<ChallengeRequestMessageType, "signature"> | Omit<ChallengeVerificationMessageType, "signature"> | Omit<ChallengeMessageType, "signature">;
export type PublicationToVerify = CommentEditPubsubMessage | VotePubsubMessage | CommentPubsubMessage | CommentUpdate | SubplebbitIpfsType;
