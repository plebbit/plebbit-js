import { getPeerIdFromPublicKey, getPlebbitAddressFromPrivateKey, getPlebbitAddressFromPublicKey } from "./util";
import * as cborg from "cborg";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import * as ed from "@noble/ed25519";

import PeerId from "peer-id";
import { removeNullAndUndefinedValues, throwWithErrorCode } from "../util";
import { Plebbit } from "../plebbit";

import {
    AuthorCommentEdit,
    ChallengeAnswerMessageSignedPropertyNames,
    ChallengeAnswerMessageType,
    ChallengeMessageSignedPropertyNames,
    ChallengeMessageType,
    ChallengeRequestMessageSignedPropertyNames,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageSignedPropertyNames,
    ChallengeVerificationMessageType,
    CommentEditPubsubMessage,
    CommentEditSignedPropertyNames,
    CommentEditType,
    CommentIpfsType,
    CommentPubsubMessage,
    CommentSignedPropertyNames,
    CommentSignedPropertyNamesUnion,
    CommentType,
    CommentUpdate,
    CommentUpdatedSignedPropertyNames,
    CommentWithCommentUpdate,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreateVoteOptions,
    PageType,
    PublicationsToSign,
    PublicationToVerify,
    SignatureType,
    SignedPropertyNames,
    SignerType,
    SubplebbitSignedPropertyNames,
    SubplebbitType,
    VotePubsubMessage,
    VoteSignedPropertyNames,
    VoteType
} from "../types";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { messages } from "../errors";
import assert from "assert";

interface ValidationResult {
    valid: boolean;
    reason?: string; // Reason why it's invalid
}

export class Signature implements SignatureType {
    signature: string;
    publicKey: string;
    type: "rsa";
    signedPropertyNames: SignedPropertyNames;

    constructor(props: SignatureType) {
        this.signature = props.signature;
        this.publicKey = props.publicKey;
        this.type = props.type;
        this.signedPropertyNames = props.signedPropertyNames;
    }

    toJSON() {
        return {
            signature: this.signature,
            publicKey: this.publicKey,
            type: this.type,
            signedPropertyNames: this.signedPropertyNames
        };
    }
}

const isProbablyBuffer = (arg) => arg && typeof arg !== "string" && typeof arg !== "number";

export const signBufferEd25519 = async (bufferToSign, privateKeyBase64) => {
    if (!isProbablyBuffer(bufferToSign)) throw Error(`signBufferEd25519 invalid bufferToSign '${bufferToSign}' not buffer`);
    if (!privateKeyBase64 || typeof privateKeyBase64 !== "string") throw Error(`signBufferEd25519 privateKeyBase64 not a string`);
    const privateKeyBuffer = uint8ArrayFromString(privateKeyBase64, "base64");
    if (privateKeyBuffer.length !== 32)
        throw Error(`verifyBufferEd25519 publicKeyBase64 ed25519 public key length not 32 bytes (${privateKeyBuffer.length} bytes)`);
    // do not use to sign strings, it doesn't encode properly in the browser
    const signature = await ed.sign(bufferToSign, privateKeyBuffer);
    return signature;
};

export const verifyBufferEd25519 = async (bufferToSign, bufferSignature, publicKeyBase64: string) => {
    if (!isProbablyBuffer(bufferToSign)) throw Error(`verifyBufferEd25519 invalid bufferSignature '${bufferToSign}' not buffer`);
    if (!isProbablyBuffer(bufferSignature)) throw Error(`verifyBufferEd25519 invalid bufferSignature '${bufferSignature}' not buffer`);
    if (!publicKeyBase64 || typeof publicKeyBase64 !== "string")
        throw Error(`verifyBufferEd25519 publicKeyBase64 '${publicKeyBase64}' not a string`);
    const publicKeyBuffer = uint8ArrayFromString(publicKeyBase64, "base64");
    if (publicKeyBuffer.length !== 32)
        throw Error(
            `verifyBufferEd25519 publicKeyBase64 '${publicKeyBase64}' ed25519 public key length not 32 bytes (${publicKeyBuffer.length} bytes)`
        );
    const isValid = await ed.verify(bufferSignature, bufferToSign, publicKeyBuffer);
    return isValid;
};

async function _validateAuthorIpns(author: CreateCommentOptions["author"], signer: SignerType, plebbit: Plebbit) {
    if (plebbit.resolver.isDomain(author.address)) {
        // As of now do nothing to verify authors with domain as addresses
        // This may change in the future
    } else {
        const derivedAddress = await getPlebbitAddressFromPrivateKey(signer.privateKey);
        if (derivedAddress !== author.address)
            throwWithErrorCode(
                "ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER",
                `author.address=${author.address}, signer.address=${derivedAddress}`
            );
    }
}

async function _sign(
    signedPropertyNames: SignedPropertyNames,
    publication: PublicationsToSign,
    signer: SignerType,
    log: Logger
): Promise<Signature> {
    assert(signer.publicKey && typeof signer.type === "string" && signer.privateKey, "Signer props need to be defined befoe signing");

    const cleanedObj = removeNullAndUndefinedValues(publication); // Will remove undefined and null values
    const publicationEncoded = getBufferToSign(signedPropertyNames, cleanedObj); // The comment instances get jsoned over the pubsub, so it makes sense that we would json them before signing, to make sure the data is the same before and after getting jsoned
    const signatureData = uint8ArrayToString(await signBufferEd25519(publicationEncoded, signer.privateKey), "base64");
    return new Signature({
        signature: signatureData,
        publicKey: signer.publicKey,
        type: signer.type,
        signedPropertyNames: signedPropertyNames
    });
}

export async function signComment(comment: CreateCommentOptions, signer: SignerType, plebbit: Plebbit): Promise<Signature> {
    const log = Logger("plebbit-js:signatures:signComment");
    await _validateAuthorIpns(comment.author, signer, plebbit);

    //prettier-ignore
    const signedPropertyNames: CommentSignedPropertyNames = ["subplebbitAddress","author","timestamp","content","title","link","parentCid"];
    return _sign(signedPropertyNames, comment, signer, log);
}

export async function signVote(vote: CreateVoteOptions, signer: SignerType, plebbit: Plebbit): Promise<Signature> {
    const log = Logger("plebbit-js:signatures:signVote");
    await _validateAuthorIpns(vote.author, signer, plebbit);

    const signedPropertyNames: VoteSignedPropertyNames = ["subplebbitAddress", "author", "timestamp", "vote", "commentCid"];
    return _sign(signedPropertyNames, vote, signer, log);
}

export async function signCommentEdit(edit: CreateCommentEditOptions, signer: SignerType, plebbit: Plebbit): Promise<Signature> {
    const log = Logger("plebbit-js:signatures:signCommentEdit");
    await _validateAuthorIpns(edit.author, signer, plebbit);
    //prettier-ignore
    const signedPropertyNames: CommentEditSignedPropertyNames = ["author","timestamp","subplebbitAddress","content","commentCid","deleted","spoiler","pinned","locked","removed","moderatorReason","flair","reason","commentAuthor"];
    return _sign(signedPropertyNames, edit, signer, log);
}

export async function signCommentUpdate(update: Omit<CommentUpdate, "signature">, signer: SignerType): Promise<Signature> {
    const log = Logger("plebbit-js:signatures:signCommentUpdate");
    // Not sure, should we validate update.authorEdit here?
    //prettier-ignore
    const signedPropertyNames: CommentUpdatedSignedPropertyNames = ["author","spoiler","pinned","locked","removed","moderatorReason","flair","upvoteCount","downvoteCount","replies","updatedAt","replyCount","authorEdit"];
    return _sign(signedPropertyNames, update, signer, log);
}

export async function signSubplebbit(subplebbit: Omit<SubplebbitType, "signature">, signer: SignerType): Promise<Signature> {
    const log = Logger("plebbit-js:signatures:signSubplebbit");
    //prettier-ignore
    const signedPropertyNames: SubplebbitSignedPropertyNames = ["title","description","roles","pubsubTopic","lastPostCid","posts","challengeTypes","metricsCid","createdAt","updatedAt","features","suggested","rules","address","flairs","encryption"];

    return _sign(signedPropertyNames, subplebbit, signer, log);
}

export async function signChallengeRequest(
    request: Omit<ChallengeRequestMessageType, "signature">,
    signer: SignerType
): Promise<Signature> {
    const log = Logger("plebbit-js:signatures:signChallengeRequest");
    //prettier-ignore
    const signedPropertyNames: ChallengeRequestMessageSignedPropertyNames = ["type", "challengeRequestId", "encryptedPublication", "acceptedChallengeTypes"];

    return _sign(signedPropertyNames, request, signer, log);
}

export async function signChallengeMessage(
    challengeMessage: Omit<ChallengeMessageType, "signature">,
    signer: SignerType
): Promise<Signature> {
    const log = Logger("plebbit-js:signatures:signChallengeMessage");
    const signedPropertyNames: ChallengeMessageSignedPropertyNames = ["type", "challengeRequestId", "encryptedChallenges"];

    return _sign(signedPropertyNames, challengeMessage, signer, log);
}

export async function signChallengeAnswer(
    challengeAnswer: Omit<ChallengeAnswerMessageType, "signature">,
    signer: SignerType
): Promise<Signature> {
    const log = Logger("plebbit-js:signatures:signChallengeAnswer");
    //prettier-ignore
    const signedPropertyNames: ChallengeAnswerMessageSignedPropertyNames = ["type", "challengeRequestId", "challengeAnswerId", "encryptedChallengeAnswers"];

    return _sign(signedPropertyNames, challengeAnswer, signer, log);
}

export async function signChallengeVerification(
    challengeVerification: Omit<ChallengeVerificationMessageType, "signature">,
    signer: SignerType
): Promise<Signature> {
    const log = Logger("plebbit-js:signatures:signChallengeVerification");
    //prettier-ignore
    const signedPropertyNames: ChallengeVerificationMessageSignedPropertyNames = ["reason","type","challengeRequestId","encryptedPublication","challengeAnswerId","challengeSuccess","challengeErrors"];

    return _sign(signedPropertyNames, challengeVerification, signer, log);
}

// Verify functions
const _verifyAuthor = async (
    publicationJson: CommentEditPubsubMessage | VotePubsubMessage | CommentPubsubMessage,
    plebbit: Plebbit
): Promise<ValidationResult & { newAddress?: string }> => {
    const log = Logger("plebbit-js:signatures:verifyAuthor");

    if (!publicationJson.author?.address) return { valid: false, reason: messages.ERR_AUTHOR_ADDRESS_UNDEFINED };

    if (plebbit.resolver.isDomain(publicationJson.author.address)) {
        if (!plebbit.resolveAuthorAddresses) return { valid: true }; // Skip domain validation if plebbit.resolveAuthorAddresses=false
        const resolvedAuthorAddress = await plebbit.resolver.resolveAuthorAddressIfNeeded(publicationJson.author.address);
        const derivedAddress = await getPlebbitAddressFromPublicKey(publicationJson.signature.publicKey);
        if (resolvedAuthorAddress !== derivedAddress) {
            // Means plebbit-author-address text record is resolving to another address (outdated?)
            // Will always use address derived from publication.signature.publicKey as truth
            log.error(
                `domain (${publicationJson.author.address}) resolved address (${resolvedAuthorAddress}) is invalid, changing publication.author.address to derived address ${derivedAddress}`
            );
            return { valid: true, newAddress: derivedAddress };
        }
    } else {
        const authorPeerId = PeerId.createFromB58String(publicationJson.author.address);
        const signaturePeerId = await getPeerIdFromPublicKey(publicationJson.signature.publicKey);
        if (!signaturePeerId.equals(authorPeerId)) return { valid: false, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE };
    }
    // Author
    return { valid: true };
};

const getBufferToSign = (signedPropertyNames: SignedPropertyNames, objectToSign: any) => {
    const propsToSign = lodash.pick(objectToSign, signedPropertyNames);

    const bufferToSign = cborg.encode(propsToSign);
    return bufferToSign;
};

const _verifyPublicationSignature = async (publicationToBeVerified: PublicationToVerify): Promise<boolean> => {
    const signatureIsValid = await verifyBufferEd25519(
        getBufferToSign(publicationToBeVerified.signature.signedPropertyNames, publicationToBeVerified),
        uint8ArrayFromString(publicationToBeVerified.signature.signature, "base64"),
        publicationToBeVerified.signature.publicKey
    );
    return signatureIsValid;
};

const _verifyPublicationWithAuthor = async (
    publicationJson: VotePubsubMessage | CommentPubsubMessage | CommentEditPubsubMessage,
    plebbit: Plebbit,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult & { newAddress?: string }> => {
    // Validate author
    const authorSignatureValidity = await _verifyAuthor(publicationJson, plebbit);

    if (!authorSignatureValidity.valid) return { valid: false, reason: authorSignatureValidity.reason };

    if (!overrideAuthorAddressIfInvalid && authorSignatureValidity.newAddress)
        return { valid: false, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE };

    // Validate signature

    const signatureValidity = await _verifyPublicationSignature(publicationJson);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };

    if (authorSignatureValidity?.newAddress) return { valid: true, newAddress: authorSignatureValidity.newAddress };

    return { valid: true };
};

export async function verifyVote(
    vote: VotePubsubMessage,
    plebbit: Plebbit,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult> {
    const res = await _verifyPublicationWithAuthor(vote, plebbit, overrideAuthorAddressIfInvalid);
    if (!res.valid) return res;
    return { valid: true };
}

export async function verifyCommentEdit(
    edit: CommentEditPubsubMessage,
    plebbit: Plebbit,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult> {
    const res = await _verifyPublicationWithAuthor(edit, plebbit, overrideAuthorAddressIfInvalid);
    if (!res.valid) return res;
    return { valid: true };
}

export async function verifyComment(
    comment: CommentPubsubMessage | CommentIpfsType,
    plebbit: Plebbit,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult> {
    assert(!comment["updatedAt"], "This function should be used for comments with no CommentUpdate. Use verifyCommentWithUpdate instead");

    const validation = await _verifyPublicationWithAuthor(comment, plebbit, overrideAuthorAddressIfInvalid);
    if (!validation.valid) return validation;
    if (validation.newAddress) comment.author.address = validation.newAddress;

    return { valid: true };
}

export async function verifyCommentWithCommentUpdate(
    comment: CommentWithCommentUpdate,
    plebbit: Plebbit,
    overrideAuthorAddressIfInvalid: boolean
) {
    // Comments within pages are merged with CommentUpdate automatically, so we have to untangle them so we can verify original comment and update separately
    if (comment.authorEdit) {
        // Means comment has been edited, verify comment.authorEdit.signature

        if (comment.authorEdit.signature.publicKey !== comment.signature.publicKey)
            return { valid: false, reason: messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR };

        if (comment.authorEdit.content && comment.content !== comment.authorEdit.content)
            return { valid: false, reason: messages.ERR_COMMENT_SHOULD_BE_THE_LATEST_EDIT };

        const authorEditValidation = await _verifyPublicationWithAuthor(comment.authorEdit, plebbit, overrideAuthorAddressIfInvalid);
        if (!authorEditValidation.valid) return authorEditValidation;

        if (overrideAuthorAddressIfInvalid && authorEditValidation.newAddress)
            comment.authorEdit.author.address = authorEditValidation.newAddress;
    }

    // Validate comment.replies
    const pagesValidity = await Promise.all(
        Object.values(comment.replies.pages).map((page) => verifyPage(page, plebbit, comment.subplebbitAddress))
    );
    const invalidPageValidity = pagesValidity.find((validity) => !validity.valid);
    if (invalidPageValidity) return invalidPageValidity;

    // This is the original comment that was published by the author. No CommentUpdate fields should be included here
    // The signature created by the user via createComment should be valid, since `authorComment` is an object that separates author comment from CommentUpdate
    // We're calling removeNullAndUndefinedValues to omit content and other fields that may be undefined
    const authorComment: CommentPubsubMessage = {
        ...lodash.pick(comment, [...(<CommentSignedPropertyNames>comment.signature.signedPropertyNames), "signature", "protocolVersion"]),
        author: lodash.omit(comment.author, ["banExpiresAt", "flair", "subplebbit"])
    };
    if (comment.original?.author?.flair) authorComment.author.flair = comment.original?.author?.flair;
    if (comment.authorEdit?.content) authorComment.content = comment?.original?.content;

    return verifyComment(authorComment, plebbit, overrideAuthorAddressIfInvalid);
}

export async function verifySubplebbit(subplebbit: SubplebbitType, plebbit: Plebbit): Promise<ValidationResult> {
    for (const page of Object.values(subplebbit.posts.pages)) {
        const pageValidity = await verifyPage(lodash.cloneDeep(page), plebbit, subplebbit.address);
        if (!pageValidity.valid) return { valid: false, reason: messages.ERR_SUBPLEBBIT_POSTS_INVALID };
    }

    const signatureValidity = await _verifyPublicationSignature(subplebbit);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };

    const resolvedSubAddress = await plebbit.resolver.resolveSubplebbitAddressIfNeeded(subplebbit.address);

    const subPeerId = PeerId.createFromB58String(resolvedSubAddress);
    const signaturePeerId = await getPeerIdFromPublicKey(subplebbit.signature.publicKey);
    if (!subPeerId.equals(signaturePeerId)) return { valid: false, reason: messages.ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY };
    return { valid: true };
}

async function _getValidationResult(publication: PublicationToVerify) {
    const signatureValidity = await _verifyPublicationSignature(publication);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };
    return { valid: true };
}

export async function verifyCommentUpdate(
    update: CommentUpdate,
    subplebbitPublicKey: string,
    authorPublicKey: string
): Promise<ValidationResult> {
    if (update.authorEdit && update.authorEdit.signature.publicKey !== authorPublicKey)
        return { valid: false, reason: messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR };

    if (update.signature.publicKey !== subplebbitPublicKey)
        return { valid: false, reason: messages.ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT };

    return _getValidationResult(update);
}

export async function verifyChallengeRequest(request: ChallengeRequestMessageType): Promise<ValidationResult> {
    return _getValidationResult(request);
}

export async function verifyChallengeMessage(challenge: ChallengeMessageType): Promise<ValidationResult> {
    return _getValidationResult(challenge);
}

export async function verifyChallengeAnswer(answer: ChallengeAnswerMessageType): Promise<ValidationResult> {
    return _getValidationResult(answer);
}

export async function verifyChallengeVerification(verification: ChallengeVerificationMessageType): Promise<ValidationResult> {
    return _getValidationResult(verification);
}

export async function verifyPage(page: PageType, plebbit: Plebbit, subplebbitAddress: string): Promise<ValidationResult> {
    const verifyCommentInPage = async (comment: CommentWithCommentUpdate, parentComment?: CommentWithCommentUpdate) => {
        if (comment.subplebbitAddress !== subplebbitAddress)
            throwWithErrorCode(
                "ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB",
                `verifyPage: Failed to verify page due to comment (${comment.cid}) having a subplebbit address (${comment.subplebbitAddress}) that is different than the address of the subplebbit that generate this page (${subplebbitAddress})`
            );
        if (parentComment && parentComment.cid !== comment.parentCid)
            throwWithErrorCode(
                "ERR_PARENT_CID_NOT_AS_EXPECTED",
                `verifyPage: Failed to verify page due to comment (${comment.cid}) having an unexpected parent cid (${comment.parentCid}), the expected parent cid (${parentComment.cid})`
            );

        const commentSignatureValidity = await verifyCommentWithCommentUpdate(comment, plebbit, true);
        if (!commentSignatureValidity.valid) {
            //@ts-expect-error
            const code: keyof typeof messages = Object.entries(messages).filter(
                ([_, error]) => error === commentSignatureValidity.reason
            )[0][0];
            throwWithErrorCode(
                code,
                `verifyPage: Failed to verify page due to comment ${comment.cid} with invalid signature due to '${commentSignatureValidity.reason}'`
            );
        }

        // We're iterating recurisvely through all comments in a page, by verifying comments in each depth
        await Promise.all(
            Object.values(comment.replies.pages).map(
                async (page) =>
                    await Promise.all(page.comments.map(async (preloadedComment) => verifyCommentInPage(preloadedComment, comment)))
            )
        );
    };

    try {
        await Promise.all(page.comments.map((comment) => verifyCommentInPage(comment, undefined)));
        return { valid: true };
    } catch (e) {
        return { valid: false, reason: e.message };
    }
}
