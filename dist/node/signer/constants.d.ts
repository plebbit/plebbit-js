import { ChallengeAnswerMessage, ChallengeRequestMessage } from "../challenge";
import { ChallengeAnswerMessageType, ChallengeMessageType, ChallengeRequestMessageType, ChallengeVerificationMessageType, CommentEditPubsubMessage, CommentPubsubMessage, CommentUpdate, CreateCommentEditOptions, CreateCommentOptions, CreateVoteOptions, PublicationTypeName, SubplebbitIpfsType, VotePubsubMessage } from "../types";
export declare type CreateSignerOptions = {
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
export declare type Encrypted = {
    ciphertext: string;
    iv: string;
    tag: string;
    type: "ed25519-aes-gcm";
};
export interface SignatureType {
    signature: string;
    publicKey: string;
    type: "ed25519";
    signedPropertyNames: readonly string[];
}
export declare type SignatureTypes = PublicationTypeName | "challengerequestmessage" | "challengemessage" | "challengeanswermessage" | "challengeverificationmessage";
export declare const CommentSignedPropertyNames: readonly (keyof CreateCommentOptions)[];
export declare const CommentEditSignedPropertyNames: readonly (keyof CreateCommentEditOptions)[];
export declare const VoteSignedPropertyNames: readonly (keyof CreateVoteOptions)[];
export declare const CommentUpdateSignedPropertyNames: readonly (keyof CommentUpdate)[];
export declare const SubplebbitSignedPropertyNames: readonly (keyof SubplebbitIpfsType)[];
export declare const ChallengeRequestMessageSignedPropertyNames: readonly (keyof ChallengeRequestMessage)[];
export declare const ChallengeMessageSignedPropertyNames: readonly (keyof ChallengeMessageType)[];
export declare const ChallengeAnswerMessageSignedPropertyNames: readonly (keyof ChallengeAnswerMessage)[];
export declare const ChallengeVerificationMessageSignedPropertyNames: readonly (keyof ChallengeVerificationMessageType)[];
export declare type CommentSignedPropertyNamesUnion = typeof CommentSignedPropertyNames[number];
export declare type CommentEditSignedPropertyNamesUnion = typeof CommentEditSignedPropertyNames[number];
export declare type VoteSignedPropertyNamesUnion = typeof VoteSignedPropertyNames[number];
export declare type CommentUpdatedSignedPropertyNamesUnion = typeof CommentUpdateSignedPropertyNames[number];
export declare type PublicationsToSign = CreateCommentEditOptions | CreateVoteOptions | CreateCommentOptions | Omit<CommentUpdate, "signature"> | Omit<SubplebbitIpfsType, "signature"> | Omit<ChallengeAnswerMessageType, "signature"> | Omit<ChallengeRequestMessageType, "signature"> | Omit<ChallengeVerificationMessageType, "signature"> | Omit<ChallengeMessageType, "signature">;
export declare type PublicationToVerify = CommentEditPubsubMessage | VotePubsubMessage | CommentPubsubMessage | CommentUpdate | SubplebbitIpfsType | ChallengeRequestMessageType | ChallengeMessageType | ChallengeAnswerMessageType | ChallengeVerificationMessageType;
