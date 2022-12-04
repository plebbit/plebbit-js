import {
    getKeyPairFromPrivateKeyPem,
    getPeerIdFromPublicKeyPem,
    getPlebbitAddressFromPrivateKeyPem,
    getPlebbitAddressFromPublicKeyPem
} from "./util";
import * as cborg from "cborg";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import PeerId from "peer-id";
import { removeKeysWithUndefinedValues } from "../util";
import { Plebbit } from "../plebbit";
import isIPFS from "is-ipfs";

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
    CommentEditSignedPropertyNames,
    CommentEditType,
    CommentSignedPropertyNames,
    CommentType,
    CommentUpdate,
    CommentUpdatedSignedPropertyNames,
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
    VoteSignedPropertyNames,
    VoteType
} from "../types";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import errcode from "err-code";
import { messages } from "../errors";

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

export const signBufferRsa = async (bufferToSign, privateKeyPem, privateKeyPemPassword = "") => {
    if (!isProbablyBuffer(bufferToSign)) throw Error(`signBufferRsa invalid bufferToSign '${bufferToSign}' not buffer`);
    const keyPair = await getKeyPairFromPrivateKeyPem(privateKeyPem, privateKeyPemPassword);
    // do not use libp2p keyPair.sign to sign strings, it doesn't encode properly in the browser
    return await keyPair.sign(bufferToSign);
};

export const verifyBufferRsa = async (bufferToSign, bufferSignature, publicKeyPem) => {
    if (!isProbablyBuffer(bufferToSign)) throw Error(`verifyBufferRsa invalid bufferSignature '${bufferToSign}' not buffer`);
    if (!isProbablyBuffer(bufferSignature)) throw Error(`verifyBufferRsa invalid bufferSignature '${bufferSignature}' not buffer`);
    const peerId = await getPeerIdFromPublicKeyPem(publicKeyPem);
    return await peerId.pubKey.verify(bufferToSign, bufferSignature);
};

async function _validateAuthor(author: CreateCommentOptions["author"], signer: SignerType, plebbit: Plebbit) {
    if (isIPFS.cid(author.address)) {
        const derivedAddress = await getPlebbitAddressFromPrivateKeyPem(signer.privateKey);
        if (derivedAddress !== author.address)
            throw errcode(
                Error(messages.ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER),
                messages[messages.ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER]
            );
    }
}

async function _sign(
    signedPropertyNames: SignedPropertyNames,
    publication: PublicationsToSign,
    signer: SignerType,
    log: Logger
): Promise<Signature> {
    const fieldsToSign = {
        ...lodash.fromPairs(signedPropertyNames.map((name: string) => [name, undefined])), // Create an object with all of signedPropertyNames present
        ...lodash.pick(removeKeysWithUndefinedValues(publication), signedPropertyNames)
    };
    log.trace(`fields to sign: `, fieldsToSign);
    const publicationEncoded = cborg.encode(fieldsToSign); // The comment instances get jsoned over the pubsub, so it makes sense that we would json them before signing, to make sure the data is the same before and after getting jsoned
    const signatureData = uint8ArrayToString(await signBufferRsa(publicationEncoded, signer.privateKey), "base64");
    log.trace(`fields have been signed, signature:`, signatureData);
    return new Signature({
        signature: signatureData,
        publicKey: signer.publicKey,
        type: signer.type,
        signedPropertyNames: signedPropertyNames
    });
}

export async function signComment(comment: CreateCommentOptions, signer: SignerType, plebbit: Plebbit): Promise<Signature> {
    const log = Logger("plebbit-js:signatures:signComment");
    await _validateAuthor(comment.author, signer, plebbit);

    //prettier-ignore
    const signedPropertyNames: CommentSignedPropertyNames = ["subplebbitAddress","author","timestamp","content","title","link","parentCid"];
    return _sign(signedPropertyNames, comment, signer, log);
}

export async function signVote(vote: CreateVoteOptions, signer: SignerType, plebbit: Plebbit): Promise<Signature> {
    const log = Logger("plebbit-js:signatures:signVote");
    await _validateAuthor(vote.author, signer, plebbit);

    const signedPropertyNames: VoteSignedPropertyNames = ["subplebbitAddress", "author", "timestamp", "vote", "commentCid"];
    return _sign(signedPropertyNames, vote, signer, log);
}

export async function signCommentEdit(edit: CreateCommentEditOptions, signer: SignerType, plebbit: Plebbit): Promise<Signature> {
    const log = Logger("plebbit-js:signatures:signCommentEdit");
    await _validateAuthor(edit.author, signer, plebbit);
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
    publicationJson: CommentEditType | VoteType | CommentType,
    plebbit: Plebbit,
    returnDerivedAuthorAddressIfInvalid: boolean
): Promise<ValidationResult & { newAddress?: string }> => {
    const log = Logger("plebbit-js:signatures:verifyAuthor");

    if (
        plebbit.resolver.isDomain(publicationJson.author.address) &&
        plebbit.resolveAuthorAddresses &&
        returnDerivedAuthorAddressIfInvalid
    ) {
        const resolvedAuthorAddress = await plebbit.resolver.resolveAuthorAddressIfNeeded(publicationJson.author.address);
        const derivedAddress = await getPlebbitAddressFromPublicKeyPem(publicationJson.signature.publicKey);
        if (resolvedAuthorAddress !== derivedAddress) {
            // Means plebbit-author-address text record is resolving to another address (outdated?)
            // Will always use address derived from publication.signature.publicKey as truth
            log.error(
                `domain (${publicationJson.author.address}) resolved address (${resolvedAuthorAddress}) is invalid, changing publication.author.address to derived address ${derivedAddress}`
            );
            return { valid: true, newAddress: derivedAddress };
        }
    } else if (!plebbit.resolver.isDomain(publicationJson.author.address)) {
        const authorPeerId = PeerId.createFromB58String(publicationJson.author.address);
        const signaturePeerId = await getPeerIdFromPublicKeyPem(publicationJson.signature.publicKey);
        if (!signaturePeerId.equals(authorPeerId)) return { valid: false, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE };
    }
    return { valid: true };
};

const _verifyPublicationSignature = async (publicationToBeVerified: PublicationToVerify): Promise<boolean> => {
    const commentWithFieldsToSign = {
        ...lodash.fromPairs(publicationToBeVerified.signature.signedPropertyNames.map((name: string) => [name, undefined])), // Create an object with all of signedPropertyNames present
        ...lodash.pick(publicationToBeVerified, publicationToBeVerified.signature.signedPropertyNames)
    };
    const commentEncoded = cborg.encode(commentWithFieldsToSign);

    const signatureIsValid = await verifyBufferRsa(
        commentEncoded,
        uint8ArrayFromString(publicationToBeVerified.signature.signature, "base64"),
        publicationToBeVerified.signature.publicKey
    );
    return signatureIsValid;
};

const _verifyPublicationWithAuthor = async (
    publicationJson: PublicationToVerify,
    plebbit: Plebbit,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult & { newAddress?: string }> => {
    if (publicationJson["author"]) {
        const authorSignatureValidity = await _verifyAuthor(<VoteType | CommentType | CommentEditType>publicationJson, plebbit, true);

        if (!authorSignatureValidity.valid) return { valid: false, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE };

        if (!overrideAuthorAddressIfInvalid && authorSignatureValidity.newAddress)
            return { valid: false, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE };

        if (authorSignatureValidity?.newAddress) return { valid: true, newAddress: authorSignatureValidity.newAddress };
    }

    const signatureValidity = await _verifyPublicationSignature(publicationJson);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };

    return { valid: true };
};

export async function verifyVote(vote: VoteType, plebbit: Plebbit, overrideAuthorAddressIfInvalid: boolean): Promise<ValidationResult> {
    const voteJson: VoteType = removeKeysWithUndefinedValues(vote);
    const res = await _verifyPublicationWithAuthor(voteJson, plebbit, overrideAuthorAddressIfInvalid);
    if (!res.valid) return res;
    return { valid: true };
}

export async function verifyCommentEdit(
    edit: CommentEditType,
    plebbit: Plebbit,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult> {
    const editJson: CommentEditType = removeKeysWithUndefinedValues(edit);
    const res = await _verifyPublicationWithAuthor(editJson, plebbit, overrideAuthorAddressIfInvalid);
    if (!res.valid) return res;
    return { valid: true };
}

export async function verifyComment(
    comment: CommentType,
    plebbit: Plebbit,
    overrideAuthorAddressIfInvalid: boolean
): Promise<ValidationResult> {
    if (comment.authorEdit) {
        // Means comment has been edited, verify comment.authorEdit.signature

        if (comment.authorEdit.signature.publicKey !== comment.signature.publicKey)
            return { valid: false, reason: messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR };

        const authorEditValidation = await _verifyPublicationWithAuthor(
            <AuthorCommentEdit>comment.authorEdit,
            plebbit,
            overrideAuthorAddressIfInvalid
        );
        if (!authorEditValidation.valid) return authorEditValidation;
        if (comment.authorEdit.content && comment.content !== comment.authorEdit.content)
            return { valid: false, reason: messages.ERR_COMMENT_SHOULD_BE_THE_LATEST_EDIT };
        if (overrideAuthorAddressIfInvalid && authorEditValidation.newAddress)
            comment.authorEdit.author.address = authorEditValidation.newAddress;
    }

    // This is the original comment that was published by the author. No CommentUpdate fields should be included here
    // The signature created by the user via createComment should be valid, since `authorComment` is an object that separates author comment from CommentUpdate
    const authorComment = removeKeysWithUndefinedValues({
        ...comment,
        content: comment.authorEdit?.content ? comment?.original?.content : comment.content,
        author: { ...lodash.omit(comment.author, ["banExpiresAt", "flair", "subplebbit"]), flair: comment.original?.author?.flair },
        flair: comment.original?.flair
    });

    const authorCommentValidation = await _verifyPublicationWithAuthor(authorComment, plebbit, overrideAuthorAddressIfInvalid);
    if (!authorCommentValidation.valid) return authorCommentValidation;
    if (authorCommentValidation.newAddress) comment.author.address = authorCommentValidation.newAddress;

    return { valid: true };
}

export async function verifySubplebbit(subplebbit: SubplebbitType, plebbit: Plebbit): Promise<ValidationResult> {
    const subplebbitJson: SubplebbitType = removeKeysWithUndefinedValues(subplebbit);

    if (subplebbit.posts.pages)
        for (const page of Object.values(subplebbitJson.posts.pages)) {
            const pageValidity = await verifyPage(lodash.cloneDeep(page), plebbit, subplebbit.address);
            if (!pageValidity.valid) return { valid: false, reason: messages.ERR_SUBPLEBBIT_POSTS_INVALID };
        }

    const signatureValidity = await _verifyPublicationSignature(subplebbitJson);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };

    const resolvedSubAddress = await plebbit.resolver.resolveSubplebbitAddressIfNeeded(subplebbitJson.address);

    const subPeerId = PeerId.createFromB58String(resolvedSubAddress);
    const signaturePeerId = await getPeerIdFromPublicKeyPem(subplebbitJson.signature.publicKey);
    if (!subPeerId.equals(signaturePeerId)) return { valid: false, reason: messages.ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY };
    return { valid: true };
}

async function _getValidationResult(publication: PublicationToVerify) {
    //@ts-ignore
    const publicationJson: PublicationToVerify = removeKeysWithUndefinedValues(publication);
    const signatureValidity = await _verifyPublicationSignature(publicationJson);
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
    const verifyCommentInPage = async (comment: CommentType, parentComment?: CommentType) => {
        if (comment.subplebbitAddress !== subplebbitAddress) throw Error(messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB);
        if (parentComment && parentComment.cid !== comment.parentCid) throw Error(messages.ERR_PARENT_CID_NOT_AS_EXPECTED);

        const commentSignatureValidity = await verifyComment(comment, plebbit, true);
        if (!commentSignatureValidity.valid)
            throw errcode(Error(commentSignatureValidity.reason), messages[messages.ERR_SIGNATURE_IS_INVALID], {
                details: `getPage: Failed to verify comment ${comment.cid} due to '${commentSignatureValidity.reason}'`
            });

        await Promise.all(
            Object.values(comment?.replies?.pages).map(
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
