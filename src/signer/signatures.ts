import {
    getPeerIdFromPublicKey,
    getPeerIdFromPublicKeyBuffer,
    getPlebbitAddressFromPrivateKey,
    getPlebbitAddressFromPublicKey,
    getPlebbitAddressFromPublicKeyBuffer
} from "./util.js";
import * as cborg from "cborg";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import * as ed from "@noble/ed25519";

import PeerId from "peer-id";
import { isStringDomain, removeNullUndefinedEmptyObjectsValuesRecursively, throwWithErrorCode, timestamp } from "../util.js";
import { Plebbit } from "../plebbit.js";

import type {
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType,
    PubsubMessage
} from "../pubsub-messages/types";
import Logger from "@plebbit/plebbit-logger";
import { messages } from "../errors.js";
import assert from "assert";
import {
    ChallengeAnswerMessageSignedPropertyNames,
    ChallengeMessageSignedPropertyNames,
    ChallengeRequestMessageSignedPropertyNames,
    ChallengeVerificationMessageSignedPropertyNames
} from "./constants.js";
import { BaseClientsManager } from "../clients/base-client-manager.js";
import type { SubplebbitIpfsType } from "../subplebbit/types.js";
import { commentUpdateVerificationCache, pageVerificationCache, subplebbitVerificationCache } from "../constants.js";
import { sha256 } from "js-sha256";
import * as remeda from "remeda"; // tree-shaking supported!
import type { JsonSignature, PublicationToVerify, PublicationsToSign, PubsubMsgsToSign, PubsubSignature, SignerType } from "./types.js";
import type { CommentEditOptionsToSign, CommentEditPubsubMessage } from "../publications/comment-edit/types.js";
import type { VoteOptionsToSign, VotePubsubMessage } from "../publications/vote/types.js";
import type {
    CommentIpfsType,
    CommentIpfsWithCidDefined,
    CommentOptionsToSign,
    CommentPubsubMessage,
    CommentUpdate
} from "../publications/comment/types.js";
import { CommentEditSignedPropertyNames } from "../publications/comment-edit/schema.js";
import { VoteSignedPropertyNames } from "../publications/vote/schema.js";
import { CommentSignedPropertyNames, CommentUpdateSignedPropertyNames } from "../publications/comment/schema.js";
import type { PageIpfs } from "../pages/types.js";
import { SubplebbitSignedPropertyNames } from "../subplebbit/schema.js";

export type ValidationResult = { valid: true } | { valid: false; reason: string };

const cborgEncodeOptions = {
    typeEncoders: {
        undefined: () => {
            throw Error("Object to be encoded through cborg should not have undefined"); // we're not disallowing undefined, this is merely to catch bugs
        }
    }
};

const isProbablyBuffer = (arg: any) => arg && typeof arg !== "string" && typeof arg !== "number";

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

async function _validateAuthorAddressBeforeSigning(author: CommentOptionsToSign["author"], signer: SignerType, plebbit: Plebbit) {
    if (!author?.address)
        throwWithErrorCode("ERR_AUTHOR_ADDRESS_UNDEFINED", { authorAddress: author.address, signerAddress: signer.address });
    if (isStringDomain(author.address)) {
        // As of now do nothing to verify authors with domain as addresses
        // This may change in the future
    } else {
        const derivedAddress = await getPlebbitAddressFromPrivateKey(signer.privateKey);
        if (derivedAddress !== author.address)
            throwWithErrorCode("ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER", { authorAddress: author.address, signerAddress: derivedAddress });
    }
}

async function _signJson(
    signedPropertyNames: JsonSignature["signedPropertyNames"],
    publication: PublicationsToSign,
    signer: SignerType,
    log: Logger
): Promise<JsonSignature> {
    assert(signer.publicKey && typeof signer.type === "string" && signer.privateKey, "Signer props need to be defined befoe signing");

    // we assume here that publication already has been cleaned
    //@ts-expect-error
    const propsToSign = remeda.pick(publication, signedPropertyNames);
    const publicationEncoded = cborg.encode(propsToSign, cborgEncodeOptions);
    const signatureData = uint8ArrayToString(await signBufferEd25519(publicationEncoded, signer.privateKey), "base64");
    return {
        signature: signatureData,
        publicKey: signer.publicKey,
        type: signer.type,
        signedPropertyNames: signedPropertyNames
    };
}

async function _signPubsubMsg(
    signedPropertyNames: PubsubSignature["signedPropertyNames"],
    msg: PubsubMsgsToSign,
    signer: SignerType,
    log: Logger
): Promise<PubsubSignature> {
    assert(signer.publicKey && typeof signer.type === "string" && signer.privateKey, "Signer props need to be defined befoe signing");

    // we assume here that pubsub msg already has been cleaned
    //@ts-expect-error
    const propsToSign = remeda.pick(msg, signedPropertyNames);
    const publicationEncoded = cborg.encode(propsToSign, cborgEncodeOptions); // The comment instances get jsoned over the pubsub, so it makes sense that we would json them before signing, to make sure the data is the same before and after getting jsoned
    const signatureData = await signBufferEd25519(publicationEncoded, signer.privateKey);
    const publicKeyBuffer = uint8ArrayFromString(signer.publicKey, "base64");
    return {
        signature: signatureData,
        publicKey: publicKeyBuffer,
        type: signer.type,
        signedPropertyNames: signedPropertyNames
    };
}

export function cleanUpBeforePublishing<T extends PublicationsToSign | PubsubMsgsToSign | PageIpfs>(msg: T): T {
    // removing values that are undefined/null recursively
    //  removing values that are empty objects recursively, like subplebbit.roles.name: {} or subplebbit.posts: {}
    // We may add other steps in the future

    return removeNullUndefinedEmptyObjectsValuesRecursively(msg);
}

export async function signComment(comment: CommentOptionsToSign, plebbit: Plebbit) {
    const log = Logger("plebbit-js:signatures:signComment");
    await _validateAuthorAddressBeforeSigning(comment.author, comment.signer, plebbit);
    return _signJson(<JsonSignature["signedPropertyNames"]>CommentSignedPropertyNames, comment, comment.signer, log);
}

export async function signCommentUpdate(update: Omit<CommentUpdate, "signature">, signer: SignerType) {
    const log = Logger("plebbit-js:signatures:signCommentUpdate");
    // Not sure, should we validate update.authorEdit here?
    return _signJson(<JsonSignature["signedPropertyNames"]>CommentUpdateSignedPropertyNames, update, signer, log);
}

export async function signVote(vote: VoteOptionsToSign, plebbit: Plebbit) {
    const log = Logger("plebbit-js:signatures:signVote");
    await _validateAuthorAddressBeforeSigning(vote.author, vote.signer, plebbit);
    return _signJson(<JsonSignature["signedPropertyNames"]>VoteSignedPropertyNames, vote, vote.signer, log);
}

export async function signCommentEdit(edit: CommentEditOptionsToSign, plebbit: Plebbit) {
    const log = Logger("plebbit-js:signatures:signCommentEdit");
    await _validateAuthorAddressBeforeSigning(edit.author, edit.signer, plebbit);
    return _signJson(<JsonSignature["signedPropertyNames"]>CommentEditSignedPropertyNames, edit, edit.signer, log);
}

export async function signSubplebbit(subplebbit: Omit<SubplebbitIpfsType, "signature">, signer: SignerType) {
    const log = Logger("plebbit-js:signatures:signSubplebbit");
    return _signJson(<JsonSignature["signedPropertyNames"]>SubplebbitSignedPropertyNames, subplebbit, signer, log);
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

type VerifyAuthorRes = { useDerivedAddress: false; reason?: string } | { useDerivedAddress: true; derivedAddress: string; reason: string };

// Verify functions
const _verifyAuthor = async (
    publicationJson: CommentEditPubsubMessage | VotePubsubMessage | CommentPubsubMessage,
    resolveAuthorAddresses: boolean,
    clientsManager: BaseClientsManager
): Promise<VerifyAuthorRes> => {
    const log = Logger("plebbit-js:signatures:verifyAuthor");
    const derivedAddress = await getPlebbitAddressFromPublicKey(publicationJson.signature.publicKey);

    if (!publicationJson.author?.address) return { useDerivedAddress: true, reason: messages.ERR_AUTHOR_ADDRESS_UNDEFINED, derivedAddress };

    // Is it a domain?
    if (publicationJson.author.address.includes(".")) {
        if (!resolveAuthorAddresses) return { useDerivedAddress: false };
        let resolvedAuthorAddress: string | null;
        try {
            resolvedAuthorAddress = await clientsManager.resolveAuthorAddressIfNeeded(publicationJson.author.address);
        } catch (e) {
            log.error("Failed to resolve author address to verify author", e);
            return { useDerivedAddress: true, derivedAddress, reason: messages.ERR_FAILED_TO_RESOLVE_AUTHOR_DOMAIN };
        }
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
const _verifyJsonSignature = async (publicationToBeVerified: PublicationToVerify): Promise<boolean> => {
    const propsToSign = {};
    for (const propertyName of publicationToBeVerified.signature.signedPropertyNames) {
        //@ts-expect-error
        if (publicationToBeVerified[propertyName] !== undefined && publicationToBeVerified[propertyName] !== null) {
            //@ts-expect-error
            propsToSign[propertyName] = publicationToBeVerified[propertyName];
        }
    }

    const signatureIsValid = await verifyBufferEd25519(
        cborg.encode(propsToSign, cborgEncodeOptions),
        uint8ArrayFromString(publicationToBeVerified.signature.signature, "base64"),
        publicationToBeVerified.signature.publicKey
    );
    return signatureIsValid;
};
// DO NOT MODIFY THIS FUNCTION, OTHERWISE YOU RISK BREAKING BACKWARD COMPATIBILITY
const _verifyPubsubSignature = async (msg: PubsubMessage): Promise<boolean> => {
    const propsToSign = {};
    for (const propertyName of msg.signature.signedPropertyNames) {
        //@ts-expect-error
        if (msg[propertyName] !== undefined && msg[propertyName] !== null) propsToSign[propertyName] = msg[propertyName];
    }

    const publicKeyBase64 = uint8ArrayToString(msg.signature.publicKey, "base64");
    const signatureIsValid = await verifyBufferEd25519(
        cborg.encode(propsToSign, cborgEncodeOptions),
        msg.signature.signature,
        publicKeyBase64
    );
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

    const res: ValidationResult & { derivedAddress?: string } = { valid: true };
    if (authorSignatureValidity.useDerivedAddress) res.derivedAddress = authorSignatureValidity.derivedAddress;
    return res;
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
    overrideAuthorAddressIfInvalid: boolean,
    resolveDomainSubAddress = true
): Promise<ValidationResult> {
    const log = Logger("plebbit-js:signatures:verifySubplebbit");
    const signatureValidity = await _verifyJsonSignature(subplebbit);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID };
    const cacheKey = sha256(
        subplebbit.signature.signature + resolveAuthorAddresses + overrideAuthorAddressIfInvalid + resolveDomainSubAddress
    );
    if (subplebbitVerificationCache.has(cacheKey)) return { valid: true };

    if (subplebbit.posts?.pages)
        for (const pageSortName of remeda.keys.strict(subplebbit.posts.pages)) {
            const pageCid = subplebbit.posts.pageCids[pageSortName];
            if (typeof pageCid !== "string") throw Error("Failed to find page cid of subplebbit to verify");
            const page = subplebbit.posts.pages[pageSortName];
            if (!remeda.isPlainObject(page)) throw Error("failed to find page ipfs of subplebbit to verify");
            const pageValidity = await verifyPage(
                pageCid,
                page,
                resolveAuthorAddresses,
                clientsManager,
                subplebbit.address,
                undefined,
                overrideAuthorAddressIfInvalid,
                resolveDomainSubAddress
            );

            if (!pageValidity.valid) {
                log.error(
                    `Subplebbit (${subplebbit.address}) page (${pageSortName} - ${subplebbit.posts.pageCids[pageSortName]}) has an invalid signature due to reason (${pageValidity.reason})`
                );
                return { valid: false, reason: messages.ERR_SUBPLEBBIT_POSTS_INVALID };
            }
        }

    // Need to check if we should validate sub address here (if it's a domain)
    const addressIsDomain = subplebbit.address.includes(".");
    if (addressIsDomain && !resolveDomainSubAddress) {
        subplebbitVerificationCache.set(cacheKey, true);
        return { valid: true };
    }

    let resolvedSubAddress: string | null;

    try {
        resolvedSubAddress = await clientsManager.resolveSubplebbitAddressIfNeeded(subplebbit.address);
    } catch (e) {
        log.error("failed to verify the subplebbit record due to domain resolving failure", e);
        return { valid: false, reason: messages.ERR_FAILED_TO_RESOLVE_SUBPLEBBIT_DOMAIN };
    }

    if (addressIsDomain && resolveDomainSubAddress && !resolvedSubAddress)
        return { valid: false, reason: messages.ERR_SUBPLEBBIT_DOMAIN_HAS_NO_TEXT_RECORD };

    if (!resolvedSubAddress) throw Error("resolved sub address should be defined at this point");
    const subPeerId = PeerId.createFromB58String(resolvedSubAddress);
    const signaturePeerId = await getPeerIdFromPublicKey(subplebbit.signature.publicKey);
    if (!subPeerId.equals(signaturePeerId)) return { valid: false, reason: messages.ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY };
    subplebbitVerificationCache.set(cacheKey, true);
    return { valid: true };
}

async function _getJsonValidationResult(publication: PublicationToVerify): Promise<ValidationResult> {
    const signatureValidity = await _verifyJsonSignature(publication);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };
    return { valid: true };
}

async function _getBinaryValidationResult(publication: PubsubMessage): Promise<ValidationResult> {
    const signatureValidity = await _verifyPubsubSignature(publication);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };
    return { valid: true };
}

export async function verifyCommentUpdate(
    update: CommentUpdate,
    resolveAuthorAddresses: boolean,
    clientsManager: BaseClientsManager,
    subplebbitAddress: string,
    comment: Pick<CommentIpfsWithCidDefined, "signature" | "cid">,
    overrideAuthorAddressIfInvalid: boolean,
    resolveDomainSubAddress = true
): Promise<ValidationResult> {
    const log = Logger("plebbit-js:signatures:verifyCommentUpdate");

    const jsonValidation = await _getJsonValidationResult(update);

    if (!jsonValidation.valid) return jsonValidation;

    const cacheKey = sha256(
        update.signature.signature +
            resolveAuthorAddresses +
            subplebbitAddress +
            JSON.stringify(comment) +
            overrideAuthorAddressIfInvalid +
            resolveDomainSubAddress
    );

    if (commentUpdateVerificationCache.has(cacheKey)) return { valid: true };
    if (update.edit) {
        if (update.edit.signature.publicKey !== comment.signature.publicKey)
            return { valid: false, reason: messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR };
        const editSignatureValidation = await _getJsonValidationResult(update.edit);
        if (!editSignatureValidation.valid) return { valid: false, reason: messages.ERR_COMMENT_UPDATE_EDIT_SIGNATURE_IS_INVALID };
    }
    if (update.cid !== comment.cid) return { valid: false, reason: messages.ERR_COMMENT_UPDATE_DIFFERENT_CID_THAN_COMMENT };

    if (update.replies) {
        // Validate update.replies
        const replyPageKeys = remeda.keys.strict(update.replies.pages);
        for (const replyKey of replyPageKeys) {
            const pageCid = update.replies.pageCids[replyKey];
            if (!pageCid) throw Error("Failed to find page cid of the page");
            const page = update.replies.pages[replyKey];
            if (!page) throw Error("Failed to find page to verify within comment update");
            const validity = await verifyPage(
                pageCid,
                page,
                resolveAuthorAddresses,
                clientsManager,
                subplebbitAddress,
                comment.cid,
                overrideAuthorAddressIfInvalid,
                resolveDomainSubAddress
            );
            if (!validity.valid) return validity;
        }
    }

    if (subplebbitAddress.includes(".") && !resolveDomainSubAddress) {
        commentUpdateVerificationCache.set(cacheKey, true);

        return { valid: true };
    }
    const updateSignatureAddress: string = await getPlebbitAddressFromPublicKey(update.signature.publicKey);
    let subplebbitResolvedAddress: string | null;
    try {
        subplebbitResolvedAddress = await clientsManager.resolveSubplebbitAddressIfNeeded(subplebbitAddress);
    } catch (e) {
        log.error(e);
        return { valid: false, reason: messages.ERR_FAILED_TO_RESOLVE_SUBPLEBBIT_DOMAIN };
    }
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

async function _validateChallengeRequestId(msg: ChallengeRequestMessageType | ChallengeAnswerMessageType): Promise<ValidationResult> {
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
    overrideAuthorAddressIfInvalid: boolean,
    resolveDomainSubAddress = true
): Promise<ValidationResult> {
    const cacheKey = sha256(
        pageCid + resolveAuthorAddresses + overrideAuthorAddressIfInvalid + subplebbitAddress + parentCommentCid + resolveDomainSubAddress
    );
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
            overrideAuthorAddressIfInvalid,
            resolveDomainSubAddress
        );
        if (!commentUpdateSignatureValidity.valid) return commentUpdateSignatureValidity;
    }
    if (shouldCache) pageVerificationCache.set(cacheKey, true);

    return { valid: true };
}
