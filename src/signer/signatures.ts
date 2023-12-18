import {
    getPeerIdFromPublicKey,
    getPeerIdFromPublicKeyBuffer,
    getPlebbitAddressFromPrivateKey,
    getPlebbitAddressFromPublicKey,
    getPlebbitAddressFromPublicKeyBuffer
} from "./util";
import * as cborg from "cborg";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import * as ed from "@noble/ed25519";

import PeerId from "peer-id";
import { removeNullAndUndefinedValuesRecursively, throwWithErrorCode, timestamp } from "../util";
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
    PubsubMessage,
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
    JsonSignature,
    PublicationsToSign,
    PublicationToVerify,
    PubsubMsgsToSign,
    PubsubSignature,
    SignerType,
    SubplebbitSignedPropertyNames,
    VoteSignedPropertyNames
} from "./constants";
import { BaseClientsManager } from "../clients/base-client-manager";
import { SubplebbitIpfsType } from "../subplebbit/types";
import { commentUpdateVerificationCache, pageVerificationCache, subplebbitVerificationCache } from "../constants";
import { sha256 } from "js-sha256";

export interface ValidationResult {
    valid: boolean;
    reason?: string; // Reason why it's invalid
}

const isProbablyBuffer = (arg) => arg && typeof arg !== "string" && typeof arg !== "number";

export const signBufferEd25519 = async (bufferToSign: Uint8Array, privateKeyBase64: string) => {
    if (!isProbablyBuffer(bufferToSign)) throw Error(`signBufferEd25519 invalid bufferToSign '${bufferToSign}' not buffer`);
    if (!privateKeyBase64 || typeof privateKeyBase64 !== "string") throw Error(`signBufferEd25519 privateKeyBase64 not a string`);
    const privateKeyBuffer = uint8ArrayFromString(privateKeyBase64, "base64");
    if (privateKeyBuffer.length !== 32)
        throw Error(`verifyBufferEd25519 publicKeyBase64 ed25519 public key length not 32 bytes (${privateKeyBuffer.length} bytes)`);
    // do not use to sign strings, it doesn't encode properly in the browser
    const signature = await ed.sign(bufferToSign, privateKeyBuffer);
    return signature;
};

export const verifyBufferEd25519 = async (bufferToSign: Uint8Array, bufferSignature: Uint8Array, publicKeyBase64: string) => {
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
            throwWithErrorCode("ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER", { authorAddress: author.address, signerAddress: derivedAddress });
    }
}

async function _signJson(
    signedPropertyNames: readonly string[],
    publication: PublicationsToSign,
    signer: SignerType,
    log: Logger
): Promise<JsonSignature> {
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

async function _signPubsubMsg(
    signedPropertyNames: readonly string[],
    msg: PubsubMsgsToSign,
    signer: SignerType,
    log: Logger
): Promise<PubsubSignature> {
    assert(signer.publicKey && typeof signer.type === "string" && signer.privateKey, "Signer props need to be defined befoe signing");

    const publicationEncoded = bufferCleanedObject(signedPropertyNames, msg); // The comment instances get jsoned over the pubsub, so it makes sense that we would json them before signing, to make sure the data is the same before and after getting jsoned
    const signatureData = await signBufferEd25519(publicationEncoded, signer.privateKey);
    const publicKeyBuffer = uint8ArrayFromString(signer.publicKey, "base64");
    return {
        signature: signatureData,
        publicKey: publicKeyBuffer,
        type: signer.type,
        signedPropertyNames: signedPropertyNames
    };
}

export async function signComment(comment: CreateCommentOptions, signer: SignerType, plebbit: Plebbit) {
    const log = Logger("plebbit-js:signatures:signComment");
    await _validateAuthorIpns(comment.author, signer, plebbit);
    return _signJson(CommentSignedPropertyNames, comment, signer, log);
}

export async function signCommentUpdate(update: Omit<CommentUpdate, "signature">, signer: SignerType) {
    const log = Logger("plebbit-js:signatures:signCommentUpdate");
    // Not sure, should we validate update.authorEdit here?
    return _signJson(CommentUpdateSignedPropertyNames, update, signer, log);
}

export async function signVote(vote: CreateVoteOptions, signer: SignerType, plebbit: Plebbit) {
    const log = Logger("plebbit-js:signatures:signVote");
    await _validateAuthorIpns(vote.author, signer, plebbit);
    return _signJson(VoteSignedPropertyNames, vote, signer, log);
}

export async function signCommentEdit(edit: CreateCommentEditOptions, signer: SignerType, plebbit: Plebbit) {
    const log = Logger("plebbit-js:signatures:signCommentEdit");
    await _validateAuthorIpns(edit.author, signer, plebbit);
    return _signJson(CommentEditSignedPropertyNames, edit, signer, log);
}

export async function signSubplebbit(subplebbit: Omit<SubplebbitIpfsType, "signature">, signer: SignerType) {
    const log = Logger("plebbit-js:signatures:signSubplebbit");
    return _signJson(SubplebbitSignedPropertyNames, subplebbit, signer, log);
}

export async function signChallengeRequest(request: Omit<ChallengeRequestMessageType, "signature">, signer: SignerType) {
    const log = Logger("plebbit-js:signatures:signChallengeRequest");
    return _signPubsubMsg(ChallengeRequestMessageSignedPropertyNames, request, signer, log);
}

export async function signChallengeMessage(challengeMessage: Omit<ChallengeMessageType, "signature">, signer: SignerType) {
    const log = Logger("plebbit-js:signatures:signChallengeMessage");
    return _signPubsubMsg(ChallengeMessageSignedPropertyNames, challengeMessage, signer, log);
}

export async function signChallengeAnswer(challengeAnswer: Omit<ChallengeAnswerMessageType, "signature">, signer: SignerType) {
    const log = Logger("plebbit-js:signatures:signChallengeAnswer");
    return _signPubsubMsg(ChallengeAnswerMessageSignedPropertyNames, challengeAnswer, signer, log);
}

export async function signChallengeVerification(
    challengeVerification: Omit<ChallengeVerificationMessageType, "signature">,
    signer: SignerType
) {
    const log = Logger("plebbit-js:signatures:signChallengeVerification");
    return _signPubsubMsg(ChallengeVerificationMessageSignedPropertyNames, challengeVerification, signer, log);
}

// Verify functions
const _verifyAuthor = async (
    publicationJson: CommentEditPubsubMessage | VotePubsubMessage | CommentPubsubMessage,
    resolveAuthorAddresses: boolean,
    clientsManager: BaseClientsManager
): Promise<Omit<ValidationResult, "valid"> & { useDerivedAddress: boolean; derivedAddress?: string }> => {
    const log = Logger("plebbit-js:signatures:verifyAuthor");
    const derivedAddress = await getPlebbitAddressFromPublicKey(publicationJson.signature.publicKey);

    if (!publicationJson.author?.address) return { useDerivedAddress: true, reason: messages.ERR_AUTHOR_ADDRESS_UNDEFINED, derivedAddress };

    // Is it a domain?
    if (publicationJson.author.address.includes(".")) {
        if (!resolveAuthorAddresses) return { useDerivedAddress: false };
        const resolvedAuthorAddress = await clientsManager.resolveAuthorAddressIfNeeded(publicationJson.author.address);
        if (resolvedAuthorAddress !== derivedAddress) {
            // Means plebbit-author-address text record is resolving to another address (outdated?)
            // Will always use address derived from publication.signature.publicKey as truth
            log.error(`author address (${publicationJson.author.address}) resolved address (${resolvedAuthorAddress}) is invalid`);
            return { useDerivedAddress: true, derivedAddress, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE };
        }
    } else {
        let authorPeerId: PeerId, signaturePeerId: PeerId;
        try {
            authorPeerId = PeerId.createFromB58String(publicationJson.author.address);
        } catch {
            return { useDerivedAddress: true, reason: messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58, derivedAddress };
        }
        try {
            signaturePeerId = await getPeerIdFromPublicKey(publicationJson.signature.publicKey);
        } catch {
            return { useDerivedAddress: false, reason: messages.ERR_SIGNATURE_PUBLIC_KEY_IS_NOT_B58 };
        }
        if (!signaturePeerId.equals(authorPeerId))
            return { useDerivedAddress: true, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE, derivedAddress };
    }
    // Author
    return { useDerivedAddress: false };
};

// DO NOT MODIFY THIS FUNCTION, OTHERWISE YOU RISK BREAKING BACKWARD COMPATIBILITY
const bufferCleanedObject = (signedPropertyNames: readonly string[], objectToSign: PublicationsToSign | PubsubMsgsToSign) => {
    const propsToSign = removeNullAndUndefinedValuesRecursively(lodash.pick(objectToSign, signedPropertyNames));

    const bufferToSign = cborg.encode(propsToSign);
    return bufferToSign;
};

// DO NOT MODIFY THIS FUNCTION, OTHERWISE YOU RISK BREAKING BACKWARD COMPATIBILITY
const _verifyJsonSignature = async (publicationToBeVerified: PublicationToVerify): Promise<boolean> => {
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
// DO NOT MODIFY THIS FUNCTION, OTHERWISE YOU RISK BREAKING BACKWARD COMPATIBILITY
const _verifyPubsubSignature = async (msg: PubsubMessage): Promise<boolean> => {
    const propsToSign = {};
    for (const propertyName of msg.signature.signedPropertyNames)
        if (msg[propertyName] !== undefined && msg[propertyName] !== null) {
            propsToSign[propertyName] = msg[propertyName];
        }

    const publicKeyBase64 = uint8ArrayToString(msg.signature.publicKey, "base64");
    const signatureIsValid = await verifyBufferEd25519(cborg.encode(propsToSign), msg.signature.signature, publicKeyBase64);
    return signatureIsValid;
};

const _verifyPublicationWithAuthor = async (
    publicationJson: VotePubsubMessage | CommentPubsubMessage | CommentEditPubsubMessage,
    resolveAuthorAddresses: boolean,
    clientsManager: BaseClientsManager,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult & { derivedAddress?: string }> => {
    // Validate author
    const log = Logger("plebbit-js:signatures:verifyPublicationWithAUthor");
    const authorSignatureValidity = await _verifyAuthor(publicationJson, resolveAuthorAddresses, clientsManager);

    if (authorSignatureValidity.useDerivedAddress && !overrideAuthorAddressIfInvalid)
        return { valid: false, reason: authorSignatureValidity.reason };

    // Validate signature
    const signatureValidity = await _verifyJsonSignature(publicationJson);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };

    if (overrideAuthorAddressIfInvalid && authorSignatureValidity.useDerivedAddress) {
        log(
            `Will override publication.author.address (${publicationJson.author.address}) with signer address (${authorSignatureValidity.derivedAddress})`
        );
        publicationJson.author.address = authorSignatureValidity.derivedAddress;
    }

    return { valid: true, derivedAddress: authorSignatureValidity.derivedAddress };
};

export async function verifyVote(
    vote: VotePubsubMessage,
    resolveAuthorAddresses: boolean,
    clientsManager: BaseClientsManager,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult> {
    const res = await _verifyPublicationWithAuthor(vote, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid);
    if (!res.valid) return res;
    return { valid: true };
}

export async function verifyCommentEdit(
    edit: CommentEditPubsubMessage,
    resolveAuthorAddresses: boolean,
    clientsManager: BaseClientsManager,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult> {
    const res = await _verifyPublicationWithAuthor(edit, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid);
    if (!res.valid) return res;
    return { valid: true };
}

export async function verifyComment(
    comment: CommentPubsubMessage | CommentIpfsType,
    resolveAuthorAddresses: boolean,
    clientsManager: BaseClientsManager,
    overrideAuthorAddressIfInvalid: boolean
) {
    const validation = await _verifyPublicationWithAuthor(comment, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid);
    if (!validation.valid) return validation;

    return validation;
}

export async function verifySubplebbit(
    subplebbit: SubplebbitIpfsType,
    resolveAuthorAddresses: boolean,
    clientsManager: BaseClientsManager,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult> {
    const log = Logger("plebbit-js:signatures:verifySubplebbit");
    const signatureValidity = await _verifyJsonSignature(subplebbit);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };
    const cacheKey = sha256(subplebbit.signature.signature + resolveAuthorAddresses + overrideAuthorAddressIfInvalid);
    if (subplebbitVerificationCache.has(cacheKey)) return { valid: true };

    if (subplebbit.posts?.pages)
        for (const pageSortName of Object.keys(subplebbit.posts.pages)) {
            const pageValidity = await verifyPage(
                subplebbit.posts.pageCids[pageSortName],
                subplebbit.posts.pages[pageSortName],
                resolveAuthorAddresses,
                clientsManager,
                subplebbit.address,
                undefined,
                overrideAuthorAddressIfInvalid
            );

            if (!pageValidity.valid) {
                log.error(
                    `Subplebbit (${subplebbit.address}) page (${pageSortName} - ${subplebbit.posts.pageCids[pageSortName]}) has an invalid signature due to reason (${pageValidity.reason})`
                );
                return { valid: false, reason: messages.ERR_SUBPLEBBIT_POSTS_INVALID };
            }
        }

    const resolvedSubAddress = await clientsManager.resolveSubplebbitAddressIfNeeded(subplebbit.address);

    if (!resolvedSubAddress) return { valid: false, reason: messages.ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY };

    const subPeerId = PeerId.createFromB58String(resolvedSubAddress);
    const signaturePeerId = await getPeerIdFromPublicKey(subplebbit.signature.publicKey);
    if (!subPeerId.equals(signaturePeerId)) return { valid: false, reason: messages.ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY };
    subplebbitVerificationCache.set(cacheKey, true);
    return { valid: true };
}

async function _getJsonValidationResult(publication: PublicationToVerify) {
    const signatureValidity = await _verifyJsonSignature(publication);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };
    return { valid: true };
}

async function _getBinaryValidationResult(publication: PubsubMessage) {
    const signatureValidity = await _verifyPubsubSignature(publication);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };
    return { valid: true };
}

export async function verifyCommentUpdate(
    update: CommentUpdate,
    resolveAuthorAddresses: boolean,
    clientsManager: BaseClientsManager,
    subplebbitAddress: string,
    comment: Pick<CommentWithCommentUpdate, "signature" | "cid">,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult> {
    const log = Logger("plebbit-js:signatures:verifyCommentUpdate");

    const jsonValidation = await _getJsonValidationResult(update);

    if (!jsonValidation.valid) return jsonValidation;

    const cacheKey = sha256(
        update.signature.signature + resolveAuthorAddresses + subplebbitAddress + JSON.stringify(comment) + overrideAuthorAddressIfInvalid
    );

    if (commentUpdateVerificationCache.has(cacheKey)) return { valid: true };
    if (update.edit) {
        if (update.edit.signature.publicKey !== comment.signature.publicKey)
            return { valid: false, reason: messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR };
        const editSignatureValidation = await _getJsonValidationResult(update.edit);
        if (!editSignatureValidation.valid) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };
    }
    if (update.cid !== comment.cid) return { valid: false, reason: messages.ERR_COMMENT_UPDATE_DIFFERENT_CID_THAN_COMMENT };

    if (update.replies) {
        // Validate update.replies
        const pagesValidity = await Promise.all(
            Object.keys(update.replies.pages).map((sortName) =>
                verifyPage(
                    update.replies.pageCids[sortName],
                    update.replies.pages[sortName],
                    resolveAuthorAddresses,
                    clientsManager,
                    subplebbitAddress,
                    comment.cid,
                    overrideAuthorAddressIfInvalid
                )
            )
        );
        const invalidPageValidity = pagesValidity.find((validity) => !validity.valid);
        if (invalidPageValidity) return invalidPageValidity;
    }

    const updateSignatureAddress: string = await getPlebbitAddressFromPublicKey(update.signature.publicKey);
    const subplebbitResolvedAddress = await clientsManager.resolveSubplebbitAddressIfNeeded(subplebbitAddress);
    if (updateSignatureAddress !== subplebbitResolvedAddress) {
        log.error(
            `Comment (${update.cid}), CommentUpdate's signature address (${updateSignatureAddress}) is not the same as the B58 address of the subplebbit (${subplebbitResolvedAddress})`
        );
        return { valid: false, reason: messages.ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT };
    }

    commentUpdateVerificationCache.set(cacheKey, true);

    return { valid: true };
}

// -5 mins
function _minimumTimestamp() {
    return timestamp() - 5 * 60;
}

// +5mins
function _maximumTimestamp() {
    return timestamp() + 5 * 60;
}

async function _validateChallengeRequestId(msg: ChallengeRequestMessageType | ChallengeAnswerMessageType) {
    const signaturePublicKeyPeerId = await getPeerIdFromPublicKeyBuffer(msg.signature.publicKey);
    if (!signaturePublicKeyPeerId.equals(msg.challengeRequestId))
        return { valid: false, reason: messages.ERR_CHALLENGE_REQUEST_ID_NOT_DERIVED_FROM_SIGNATURE };
    else return { valid: true };
}

export async function verifyChallengeRequest(
    request: ChallengeRequestMessageType,
    validateTimestampRange: boolean
): Promise<ValidationResult> {
    const idValid = await _validateChallengeRequestId(request);
    if (!idValid.valid) return idValid;

    if ((validateTimestampRange && _minimumTimestamp() > request.timestamp) || _maximumTimestamp() < request.timestamp)
        return { valid: false, reason: messages.ERR_PUBSUB_MSG_TIMESTAMP_IS_OUTDATED };

    return _getBinaryValidationResult(request);
}

export async function verifyChallengeMessage(
    challenge: ChallengeMessageType,
    pubsubTopic: string,
    validateTimestampRange: boolean
): Promise<ValidationResult> {
    const msgSignerAddress = await getPlebbitAddressFromPublicKeyBuffer(challenge.signature.publicKey);
    if (msgSignerAddress !== pubsubTopic) return { valid: false, reason: messages.ERR_CHALLENGE_MSG_SIGNER_IS_NOT_SUBPLEBBIT };
    if ((validateTimestampRange && _minimumTimestamp() > challenge.timestamp) || _maximumTimestamp() < challenge.timestamp)
        return { valid: false, reason: messages.ERR_PUBSUB_MSG_TIMESTAMP_IS_OUTDATED };

    return _getBinaryValidationResult(challenge);
}

export async function verifyChallengeAnswer(
    answer: ChallengeAnswerMessageType,
    validateTimestampRange: boolean
): Promise<ValidationResult> {
    const idValid = await _validateChallengeRequestId(answer);
    if (!idValid.valid) return idValid;

    if ((validateTimestampRange && _minimumTimestamp() > answer.timestamp) || _maximumTimestamp() < answer.timestamp)
        return { valid: false, reason: messages.ERR_PUBSUB_MSG_TIMESTAMP_IS_OUTDATED };

    return _getBinaryValidationResult(answer);
}

export async function verifyChallengeVerification(
    verification: ChallengeVerificationMessageType,
    pubsubTopic: string,
    validateTimestampRange: boolean
): Promise<ValidationResult> {
    const msgSignerAddress = await getPlebbitAddressFromPublicKeyBuffer(verification.signature.publicKey);
    if (msgSignerAddress !== pubsubTopic) return { valid: false, reason: messages.ERR_CHALLENGE_VERIFICATION_MSG_SIGNER_IS_NOT_SUBPLEBBIT };
    if ((validateTimestampRange && _minimumTimestamp() > verification.timestamp) || _maximumTimestamp() < verification.timestamp)
        return { valid: false, reason: messages.ERR_PUBSUB_MSG_TIMESTAMP_IS_OUTDATED };

    return _getBinaryValidationResult(verification);
}

export async function verifyPage(
    pageCid: string,
    page: PageIpfs,
    resolveAuthorAddresses: boolean,
    clientsManager: BaseClientsManager,
    subplebbitAddress: string,
    parentCommentCid: string | undefined,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult> {
    const cacheKey = sha256(pageCid + resolveAuthorAddresses + overrideAuthorAddressIfInvalid + subplebbitAddress + parentCommentCid);
    if (pageVerificationCache.has(cacheKey)) return { valid: true };
    let shouldCache = true;
    for (const pageComment of page.comments) {
        if (pageComment.comment.subplebbitAddress !== subplebbitAddress)
            return { valid: false, reason: messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB };
        if (parentCommentCid !== pageComment.comment.parentCid) return { valid: false, reason: messages.ERR_PARENT_CID_NOT_AS_EXPECTED };

        // it should not cache if there's overriding of author.address because we want calls to verify page to override it
        const commentSignatureValidity = await verifyComment(
            pageComment.comment,
            resolveAuthorAddresses,
            clientsManager,
            overrideAuthorAddressIfInvalid
        );
        if (!commentSignatureValidity.valid) return commentSignatureValidity;
        if (commentSignatureValidity.derivedAddress) shouldCache = false;
        const commentUpdateSignatureValidity = await verifyCommentUpdate(
            pageComment.update,
            resolveAuthorAddresses,
            clientsManager,
            subplebbitAddress,
            pageComment.comment,
            overrideAuthorAddressIfInvalid
        );
        if (!commentUpdateSignatureValidity.valid) return commentUpdateSignatureValidity;
    }
    if (shouldCache) pageVerificationCache.set(cacheKey, true);

    return { valid: true };
}
