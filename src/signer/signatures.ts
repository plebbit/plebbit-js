import { getPeerIdFromPublicKey, getPlebbitAddressFromPrivateKey, getPlebbitAddressFromPublicKey } from "./util";
import * as cborg from "cborg";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import * as ed from "@noble/ed25519";

import PeerId from "peer-id";
import { removeNullAndUndefinedValuesRecursively, throwWithErrorCode } from "../util";
import { Plebbit } from "../plebbit";

import {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType,
    CommentEditPubsubMessage,
    CommentIpfsType,
    CommentPubsubMessage,
    CommentUpdate,
    CommentWithCommentUpdate,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreateVoteOptions,
    PageIpfs,
    SubplebbitIpfsType,
    SubplebbitType,
    VotePubsubMessage
} from "../types";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import { messages } from "../errors";
import assert from "assert";
import {
    ChallengeAnswerMessageSignedPropertyNames,
    ChallengeMessageSignedPropertyNames,
    ChallengeRequestMessageSignedPropertyNames,
    ChallengeVerificationMessageSignedPropertyNames,
    CommentEditSignedPropertyNames,
    CommentSignedPropertyNames,
    CommentUpdateSignedPropertyNames,
    PublicationsToSign,
    PublicationToVerify,
    SignatureType,
    SignerType,
    SubplebbitSignedPropertyNames,
    VoteSignedPropertyNames
} from "./constants";

interface ValidationResult {
    valid: boolean;
    reason?: string; // Reason why it's invalid
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
    signedPropertyNames: readonly string[],
    publication: PublicationsToSign,
    signer: SignerType,
    log: Logger
): Promise<SignatureType> {
    assert(signer.publicKey && typeof signer.type === "string" && signer.privateKey, "Signer props need to be defined befoe signing");

    const publicationEncoded = bufferCleanedObject(signedPropertyNames, publication); // The comment instances get jsoned over the pubsub, so it makes sense that we would json them before signing, to make sure the data is the same before and after getting jsoned
    const signatureData = uint8ArrayToString(await signBufferEd25519(publicationEncoded, signer.privateKey), "base64");
    return {
        signature: signatureData,
        publicKey: signer.publicKey,
        type: signer.type,
        signedPropertyNames: signedPropertyNames
    };
}

export async function signComment(comment: CreateCommentOptions, signer: SignerType, plebbit: Plebbit): Promise<SignatureType> {
    const log = Logger("plebbit-js:signatures:signComment");
    await _validateAuthorIpns(comment.author, signer, plebbit);
    return _sign(CommentSignedPropertyNames, comment, signer, log);
}

export async function signVote(vote: CreateVoteOptions, signer: SignerType, plebbit: Plebbit): Promise<SignatureType> {
    const log = Logger("plebbit-js:signatures:signVote");
    await _validateAuthorIpns(vote.author, signer, plebbit);
    return _sign(VoteSignedPropertyNames, vote, signer, log);
}

export async function signCommentEdit(edit: CreateCommentEditOptions, signer: SignerType, plebbit: Plebbit): Promise<SignatureType> {
    const log = Logger("plebbit-js:signatures:signCommentEdit");
    await _validateAuthorIpns(edit.author, signer, plebbit);
    return _sign(CommentEditSignedPropertyNames, edit, signer, log);
}

export async function signCommentUpdate(update: Omit<CommentUpdate, "signature">, signer: SignerType): Promise<SignatureType> {
    const log = Logger("plebbit-js:signatures:signCommentUpdate");
    // Not sure, should we validate update.authorEdit here?
    return _sign(CommentUpdateSignedPropertyNames, update, signer, log);
}

export async function signSubplebbit(subplebbit: Omit<SubplebbitIpfsType, "signature">, signer: SignerType): Promise<SignatureType> {
    const log = Logger("plebbit-js:signatures:signSubplebbit");
    return _sign(SubplebbitSignedPropertyNames, subplebbit, signer, log);
}

export async function signChallengeRequest(
    request: Omit<ChallengeRequestMessageType, "signature">,
    signer: SignerType
): Promise<SignatureType> {
    const log = Logger("plebbit-js:signatures:signChallengeRequest");
    return _sign(ChallengeRequestMessageSignedPropertyNames, request, signer, log);
}

export async function signChallengeMessage(
    challengeMessage: Omit<ChallengeMessageType, "signature">,
    signer: SignerType
): Promise<SignatureType> {
    const log = Logger("plebbit-js:signatures:signChallengeMessage");
    return _sign(ChallengeMessageSignedPropertyNames, challengeMessage, signer, log);
}

export async function signChallengeAnswer(
    challengeAnswer: Omit<ChallengeAnswerMessageType, "signature">,
    signer: SignerType
): Promise<SignatureType> {
    const log = Logger("plebbit-js:signatures:signChallengeAnswer");
    return _sign(ChallengeAnswerMessageSignedPropertyNames, challengeAnswer, signer, log);
}

export async function signChallengeVerification(
    challengeVerification: Omit<ChallengeVerificationMessageType, "signature">,
    signer: SignerType
): Promise<SignatureType> {
    const log = Logger("plebbit-js:signatures:signChallengeVerification");
    return _sign(ChallengeVerificationMessageSignedPropertyNames, challengeVerification, signer, log);
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

// DO NOT MODIFY THIS FUNCTION, OTHERWISE YOU RISK BREAKING BACKWARD COMPATIBILITY
const bufferCleanedObject = (signedPropertyNames: readonly string[], objectToSign: PublicationsToSign) => {
    const propsToSign = removeNullAndUndefinedValuesRecursively(lodash.pick(objectToSign, signedPropertyNames));

    const bufferToSign = cborg.encode(propsToSign);
    return bufferToSign;
};

// DO NOT MODIFY THIS FUNCTION, OTHERWISE YOU RISK BREAKING BACKWARD COMPATIBILITY
const _verifyPublicationSignature = async (publicationToBeVerified: PublicationToVerify): Promise<boolean> => {
    const propsToSign = {};
    for (const propertyName of publicationToBeVerified.signature.signedPropertyNames)
        if (publicationToBeVerified[propertyName] !== undefined && publicationToBeVerified[propertyName] !== null) {
            propsToSign[propertyName] = publicationToBeVerified[propertyName];
        }

    const signatureIsValid = await verifyBufferEd25519(
        cborg.encode(propsToSign),
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

export async function verifySubplebbit(subplebbit: SubplebbitIpfsType, plebbit: Plebbit): Promise<ValidationResult> {
    if (subplebbit.posts?.pages)
        for (const page of Object.values(subplebbit.posts.pages)) {
            const pageValidity = await verifyPage(lodash.cloneDeep(page), plebbit, subplebbit, undefined);
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
    subplebbit: Pick<SubplebbitType, "address" | "encryption">,
    comment: Pick<CommentWithCommentUpdate, "signature" | "cid">,
    plebbit: Plebbit
): Promise<ValidationResult> {
    if (update.edit && update.edit.signature.publicKey !== comment.signature.publicKey)
        return { valid: false, reason: messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR };

    if (update.signature.publicKey !== subplebbit.encryption.publicKey)
        return { valid: false, reason: messages.ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT };

    if (update.cid !== comment.cid) return { valid: false, reason: messages.ERR_COMMENT_UPDATE_DIFFERENT_CID_THAN_COMMENT };

    if (update.replies) {
        // Validate update.replies
        const pagesValidity = await Promise.all(
            Object.values(update.replies.pages).map((page) => verifyPage(page, plebbit, subplebbit, comment.cid))
        );
        const invalidPageValidity = pagesValidity.find((validity) => !validity.valid);
        if (invalidPageValidity) return invalidPageValidity;
    }

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

export async function verifyPage(
    page: PageIpfs,
    plebbit: Plebbit,
    subplebbit: Pick<SubplebbitType, "address" | "encryption">,
    parentCommentCid: string | undefined
): Promise<ValidationResult> {
    for (const pageComment of page.comments) {
        if (pageComment.comment.subplebbitAddress !== subplebbit.address)
            throwWithErrorCode(
                "ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB",
                `verifyPage: Failed to verify page due to comment (${pageComment.comment.cid}) having a subplebbit address (${pageComment.comment.subplebbitAddress}) that is different than the address of the subplebbit that generate this page (${subplebbit.address})`
            );
        if (parentCommentCid !== pageComment.comment.parentCid)
            throwWithErrorCode(
                "ERR_PARENT_CID_NOT_AS_EXPECTED",
                `verifyPage: Failed to verify page due to comment (${pageComment.comment.cid}) having an unexpected parent cid (${pageComment.comment.parentCid}), the expected parent cid (${parentCommentCid})`
            );

        const commentSignatureValidity = await verifyComment(pageComment.comment, plebbit, true);
        if (!commentSignatureValidity.valid) return commentSignatureValidity;
        const commentUpdateSignatureValidity = await verifyCommentUpdate(
            pageComment.commentUpdate,
            subplebbit,
            pageComment.comment,
            plebbit
        );
        if (!commentUpdateSignatureValidity.valid) return commentUpdateSignatureValidity;
    }
    return { valid: true };
}
