import { Plebbit } from "../plebbit/plebbit.js";
import type { ChallengeAnswerMessageSignature, ChallengeAnswerMessageType, ChallengeMessageSignature, ChallengeMessageType, ChallengeRequestMessageSignature, ChallengeRequestMessageType, ChallengeVerificationMessageSignature, ChallengeVerificationMessageType, DecryptedChallengeVerification } from "../pubsub-messages/types";
import Logger from "@plebbit/plebbit-logger";
import { messages } from "../errors.js";
import { BaseClientsManager } from "../clients/base-client-manager.js";
import type { SubplebbitIpfsType, SubplebbitSignature } from "../subplebbit/types.js";
import type { JsonSignature, PubsubMsgToSign, PubsubSignature, SignerType } from "./types.js";
import type { CommentEditOptionsToSign, CommentEditPubsubMessagePublication, CommentEditSignature } from "../publications/comment-edit/types.js";
import type { VoteOptionsToSign, VotePubsubMessagePublication, VoteSignature } from "../publications/vote/types.js";
import type { CommentIpfsType, CommentIpfsWithCidDefined, CommentIpfsWithCidPostCidDefined, CommentOptionsToSign, CommentPubsubMessagePublication, CommentPubsubMessagPublicationSignature, CommentUpdateForChallengeVerification, CommentUpdateForChallengeVerificationSignature, CommentUpdateSignature, CommentUpdateType } from "../publications/comment/types.js";
import type { ModQueuePageIpfs, PageIpfs } from "../pages/types.js";
import type { CommentModerationOptionsToSign, CommentModerationPubsubMessagePublication, CommentModerationSignature } from "../publications/comment-moderation/types.js";
import type { SubplebbitEditPublicationOptionsToSign, SubplebbitEditPublicationSignature, SubplebbitEditPubsubMessagePublication } from "../publications/subplebbit-edit/types.js";
import { RemoteSubplebbit } from "../subplebbit/remote-subplebbit.js";
export type ValidationResult = {
    valid: true;
} | {
    valid: false;
    reason: string;
};
export declare const signBufferEd25519: (bufferToSign: Uint8Array, privateKeyBase64: string) => Promise<Uint8Array<ArrayBufferLike>>;
export declare const verifyBufferEd25519: (bufferToSign: Uint8Array, bufferSignature: Uint8Array, publicKeyBase64: string) => Promise<boolean>;
export declare function _signJson(signedPropertyNames: JsonSignature["signedPropertyNames"], cleanedPublication: Object, // should call cleanUpBeforePublish before calling _signJson
signer: SignerType, log: Logger): Promise<JsonSignature>;
export declare function _signPubsubMsg(signedPropertyNames: PubsubSignature["signedPropertyNames"], msg: PubsubMsgToSign, // should call cleanUpBeforePublish before calling _signPubsubMsg
signer: SignerType, log: Logger): Promise<PubsubSignature>;
export declare function cleanUpBeforePublishing<T>(msg: T): T;
export declare function signComment(comment: CommentOptionsToSign, plebbit: Plebbit): Promise<CommentPubsubMessagPublicationSignature>;
export declare function signCommentUpdate(update: Omit<CommentUpdateType, "signature">, signer: SignerType): Promise<CommentUpdateSignature>;
export declare function signCommentUpdateForChallengeVerification(update: Omit<DecryptedChallengeVerification["commentUpdate"], "signature">, signer: SignerType): Promise<CommentUpdateForChallengeVerificationSignature>;
export declare function signVote(vote: VoteOptionsToSign, plebbit: Plebbit): Promise<VoteSignature>;
export declare function signSubplebbitEdit(subplebbitEdit: SubplebbitEditPublicationOptionsToSign, plebbit: Plebbit): Promise<SubplebbitEditPublicationSignature>;
export declare function signCommentEdit(edit: CommentEditOptionsToSign, plebbit: Plebbit): Promise<CommentEditSignature>;
export declare function signCommentModeration(commentMod: CommentModerationOptionsToSign, plebbit: Plebbit): Promise<CommentModerationSignature>;
export declare function signSubplebbit(subplebbit: Omit<SubplebbitIpfsType, "signature">, signer: SignerType): Promise<SubplebbitSignature>;
export declare function signChallengeRequest(request: Omit<ChallengeRequestMessageType, "signature">, signer: SignerType): Promise<ChallengeRequestMessageSignature>;
export declare function signChallengeMessage(challengeMessage: Omit<ChallengeMessageType, "signature">, signer: SignerType): Promise<ChallengeMessageSignature>;
export declare function signChallengeAnswer(challengeAnswer: Omit<ChallengeAnswerMessageType, "signature">, signer: SignerType): Promise<ChallengeAnswerMessageSignature>;
export declare function signChallengeVerification(challengeVerification: Omit<ChallengeVerificationMessageType, "signature">, signer: SignerType): Promise<ChallengeVerificationMessageSignature>;
export declare function verifyVote(vote: VotePubsubMessagePublication, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifySubplebbitEdit(subplebbitEdit: SubplebbitEditPubsubMessagePublication, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyCommentEdit(edit: CommentEditPubsubMessagePublication, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyCommentModeration(moderation: CommentModerationPubsubMessagePublication, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult>;
export declare function verifyCommentPubsubMessage(comment: CommentPubsubMessagePublication, resolveAuthorAddresses: boolean, clientsManager: BaseClientsManager, overrideAuthorAddressIfInvalid: boolean): Promise<({
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
export declare function verifyCommentIpfs(opts: {
    comment: CommentIpfsType;
    calculatedCommentCid: string;
    resolveAuthorAddresses: boolean;
    clientsManager: BaseClientsManager;
    overrideAuthorAddressIfInvalid: boolean;
    subplebbitAddressFromInstance?: CommentIpfsType["subplebbitAddress"];
}): ReturnType<typeof verifyCommentPubsubMessage>;
export declare function verifySubplebbit({ subplebbit, subplebbitIpnsName, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid, validatePages, cacheIfValid }: {
    subplebbit: SubplebbitIpfsType;
    subplebbitIpnsName: string;
    resolveAuthorAddresses: boolean;
    clientsManager: BaseClientsManager;
    overrideAuthorAddressIfInvalid: boolean;
    validatePages: boolean;
    cacheIfValid?: boolean;
}): Promise<ValidationResult>;
export declare function verifyCommentUpdate({ update, resolveAuthorAddresses, clientsManager, subplebbit, comment, overrideAuthorAddressIfInvalid, validatePages, validateUpdateSignature }: {
    update: CommentUpdateType | CommentUpdateForChallengeVerification | ModQueuePageIpfs["comments"][0]["commentUpdate"];
    resolveAuthorAddresses: boolean;
    clientsManager: BaseClientsManager;
    subplebbit: SubplebbitForVerifyingPages;
    comment: Pick<CommentIpfsWithCidPostCidDefined, "signature" | "cid" | "depth" | "postCid">;
    overrideAuthorAddressIfInvalid: boolean;
    validatePages: boolean;
    validateUpdateSignature: boolean;
}): Promise<ValidationResult>;
export declare function verifyChallengeRequest(request: ChallengeRequestMessageType, validateTimestampRange: boolean): Promise<ValidationResult>;
export declare function verifyChallengeMessage(challenge: ChallengeMessageType, pubsubTopic: string, validateTimestampRange: boolean): Promise<ValidationResult>;
export declare function verifyChallengeAnswer(answer: ChallengeAnswerMessageType, validateTimestampRange: boolean): Promise<ValidationResult>;
export declare function verifyChallengeVerification(verification: ChallengeVerificationMessageType, pubsubTopic: string, validateTimestampRange: boolean): Promise<ValidationResult>;
type ParentCommentForVerifyingPages = Pick<CommentIpfsWithCidPostCidDefined, "cid" | "depth" | "postCid"> | Pick<CommentIpfsWithCidDefined, "postCid"> | {
    cid: undefined;
    depth: -1;
    postCid: undefined;
};
type SubplebbitForVerifyingPages = Pick<RemoteSubplebbit, "address" | "signature">;
export declare function verifyPageComment({ pageComment, subplebbit, parentComment, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid, validatePages, validateUpdateSignature }: {
    pageComment: (PageIpfs | ModQueuePageIpfs)["comments"][0];
    subplebbit: SubplebbitForVerifyingPages;
    parentComment: ParentCommentForVerifyingPages | undefined;
    resolveAuthorAddresses: boolean;
    clientsManager: BaseClientsManager;
    overrideAuthorAddressIfInvalid: boolean;
    validatePages: boolean;
    validateUpdateSignature: boolean;
}): Promise<ValidationResult>;
export declare function verifyPage({ pageCid, pageSortName, page, resolveAuthorAddresses, clientsManager, subplebbit, parentComment, overrideAuthorAddressIfInvalid, validatePages, validateUpdateSignature }: {
    pageCid: string | undefined;
    pageSortName: string | undefined;
    page: PageIpfs;
    resolveAuthorAddresses: boolean;
    clientsManager: BaseClientsManager;
    subplebbit: SubplebbitForVerifyingPages;
    parentComment: ParentCommentForVerifyingPages;
    overrideAuthorAddressIfInvalid: boolean;
    validatePages: boolean;
    validateUpdateSignature: boolean;
}): Promise<ValidationResult>;
export declare function verifyModQueuePage({ pageCid, page, resolveAuthorAddresses, clientsManager, subplebbit, overrideAuthorAddressIfInvalid, validatePages, validateUpdateSignature }: {
    pageCid: string | undefined;
    page: ModQueuePageIpfs;
    resolveAuthorAddresses: boolean;
    clientsManager: BaseClientsManager;
    subplebbit: SubplebbitForVerifyingPages;
    overrideAuthorAddressIfInvalid: boolean;
    validatePages: boolean;
    validateUpdateSignature: boolean;
}): Promise<ValidationResult>;
export {};
