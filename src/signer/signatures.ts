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
import { Signer } from ".";
import {
    AuthorCommentEdit,
    ChallengeAnswerMessageType,
    ChallengeMessageType,
    ChallengeRequestMessageType,
    ChallengeVerificationMessageType,
    CommentEditType,
    CommentType,
    CommentUpdate,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreateVoteOptions,
    PageType,
    PublicationsToSign,
    PublicationToVerify,
    SignatureType,
    SignatureTypes,
    SignedPropertyNames,
    SubplebbitType,
    VoteType
} from "../types";
import Logger from "@plebbit/plebbit-logger";
import lodash from "lodash";
import errcode from "err-code";
import { codes, messages } from "../errors";

export const SIGNED_PROPERTY_NAMES: Record<SignatureTypes, SignedPropertyNames> = Object.freeze({
    comment: ["subplebbitAddress", "author", "timestamp", "content", "title", "link", "parentCid"],
    commentedit: [
        "author",
        "timestamp",
        "subplebbitAddress",
        "content",
        "commentCid",
        "deleted",
        "spoiler",
        "pinned",
        "locked",
        "removed",
        "moderatorReason",
        "flair",
        "reason",
        "commentAuthor"
    ],
    commentupdate: [
        "author",
        "spoiler",
        "pinned",
        "locked",
        "removed",
        "moderatorReason",
        "flair",
        "upvoteCount",
        "downvoteCount",
        "replies",
        "updatedAt",
        "replyCount",
        "authorEdit"
    ],
    vote: ["subplebbitAddress", "author", "timestamp", "vote", "commentCid"],
    subplebbit: [
        "title",
        "description",
        "roles",
        "pubsubTopic",
        "lastPostCid",
        "posts",
        "challengeTypes",
        "metricsCid",
        "createdAt",
        "updatedAt",
        "features",
        "suggested",
        "rules",
        "address",
        "flairs",
        "encryption"
    ],
    challengerequestmessage: ["type", "challengeRequestId", "encryptedPublication", "acceptedChallengeTypes"],
    challengemessage: ["type", "challengeRequestId", "encryptedChallenges"],
    challengeanswermessage: ["type", "challengeRequestId", "challengeAnswerId", "encryptedChallengeAnswers"],
    challengeverificationmessage: [
        "reason",
        "type",
        "challengeRequestId",
        "encryptedPublication",
        "challengeAnswerId",
        "challengeSuccess",
        "challengeErrors"
    ]
});

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

export async function signPublication(
    publication: PublicationsToSign,
    signer: Signer,
    plebbit: Plebbit,
    signatureType: SignatureTypes
): Promise<Signature> {
    if (typeof signer.publicKey !== "string") throw Error(`signer.publicKey (${signer.publicKey}) is not a valid public key`);

    if (!Object.keys(SIGNED_PROPERTY_NAMES).includes(signatureType)) throw Error(`signature type (${signatureType}) is not supported`);
    let publicationJson = <PublicationsToSign>removeKeysWithUndefinedValues(publication); // This line is needed to remove nested undefined values

    const log = Logger("plebbit-js:signatures:signPublication");

    if (publicationJson["author"]?.constructor?.name === "Object" && typeof publicationJson["author"]["address"] === "string") {
        publicationJson = <CreateCommentEditOptions | CreateVoteOptions | CreateCommentOptions>publicationJson;
        const resolvedAddress = await plebbit.resolver.resolveAuthorAddressIfNeeded(<string>publicationJson.author.address);
        const derivedAddress = await getPlebbitAddressFromPrivateKeyPem(signer.privateKey);
        if (resolvedAddress !== derivedAddress)
            throw Error(
                `author.address (${publicationJson?.author?.address}) does not equate its resolved address (${resolvedAddress}) is invalid. For this publication to be signed, user needs to ensure plebbit-author-address points to same key used by signer (${derivedAddress})`
            );
    }

    const signedPropertyNames = SIGNED_PROPERTY_NAMES[signatureType];

    const fieldsToSign = {
        ...lodash.fromPairs(signedPropertyNames.map((name: string) => [name, undefined])), // Create an object with all of signedPropertyNames present
        ...lodash.pick(publicationJson, signedPropertyNames)
    };
    log.trace("Fields to sign: ", signedPropertyNames);
    log.trace("Publication to sign: ", fieldsToSign);
    const commentEncoded = cborg.encode(fieldsToSign); // The comment instances get jsoned over the pubsub, so it makes sense that we would json them before signing, to make sure the data is the same before and after getting jsoned
    const signatureData = uint8ArrayToString(await signBufferRsa(commentEncoded, signer.privateKey), "base64");
    log.trace(`Publication been signed, signature:`, signatureData);
    return new Signature({
        signature: signatureData,
        publicKey: signer.publicKey,
        type: signer.type,
        signedPropertyNames: signedPropertyNames
    });
}

const verifyAuthor = async (
    publicationJson: CommentEditType | VoteType | CommentType,
    plebbit: Plebbit,
    returnDerivedAuthorAddressIfInvalid: boolean
): Promise<Pick<ValidationResult, "valid"> & { newAddress?: string }> => {
    const log = Logger("plebbit-js:signatures:verifyAuthor");
    const authorAddress = plebbit.resolver.isDomain(publicationJson.author.address)
        ? await plebbit.resolver.resolveAuthorAddressIfNeeded(publicationJson.author.address)
        : publicationJson.author.address;
    const authorPeerId = PeerId.createFromB58String(authorAddress);
    const signaturePeerId = await getPeerIdFromPublicKeyPem(publicationJson.signature.publicKey);
    if (!signaturePeerId.equals(authorPeerId)) return { valid: false };
    if (returnDerivedAuthorAddressIfInvalid && plebbit.resolver.isDomain(publicationJson.author.address)) {
        const derivedAddress = await getPlebbitAddressFromPublicKeyPem(publicationJson.signature.publicKey);
        if (authorAddress !== derivedAddress) {
            // Means plebbit-author-address text record is resolving to another address (outdated?)
            // Will always use address derived from publication.signature.publicKey as truth
            log.error(
                `domain (${publicationJson.author.address}) resolved address (${authorAddress}) is invalid, changing publication.author.address to derived address ${derivedAddress}`
            );
            return { valid: true, newAddress: derivedAddress };
        }
    }
    return { valid: true };
};

const verifyPublicationSignature = async (signature: SignatureType, publicationToBeVerified: PublicationToVerify): Promise<boolean> => {
    const commentWithFieldsToSign = {
        ...lodash.fromPairs(signature.signedPropertyNames.map((name: string) => [name, undefined])), // Create an object with all of signedPropertyNames present
        ...lodash.pick(publicationToBeVerified, signature.signedPropertyNames)
    };
    const commentEncoded = cborg.encode(commentWithFieldsToSign);
    try {
        const signatureIsValid = await verifyBufferRsa(
            commentEncoded,
            uint8ArrayFromString(signature.signature, "base64"),
            signature.publicKey
        );
        if (!signatureIsValid) return false;
        return true;
    } catch {
        return false;
    }
};

const verifyPublicationWithAuthor = async (
    publicationJson: PublicationToVerify,
    plebbit: Plebbit
): Promise<ValidationResult & { newAddress?: string }> => {
    const signatureValidity = await verifyPublicationSignature(publicationJson.signature, publicationJson);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_INVALID };

    if (plebbit.resolveAuthorAddresses && publicationJson["author"]) {
        const authorSignatureValidity = await verifyAuthor(<VoteType | CommentType | CommentEditType>publicationJson, plebbit, true);
        if (!authorSignatureValidity.valid) return { valid: false, reason: messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE };

        if (authorSignatureValidity?.newAddress) return { valid: true, newAddress: authorSignatureValidity.newAddress };
    }

    return { valid: true };
};

export async function verifyVote(vote: VoteType, plebbit: Plebbit): Promise<ValidationResult> {
    const voteJson: VoteType = removeKeysWithUndefinedValues(vote);
    const res = await verifyPublicationWithAuthor(voteJson, plebbit);
    if (!res.valid) return res;
    return { valid: true };
}

export async function verifyCommentEdit(edit: CommentEditType, plebbit: Plebbit): Promise<ValidationResult> {
    const editJson: CommentEditType = removeKeysWithUndefinedValues(edit);
    const res = await verifyPublicationWithAuthor(editJson, plebbit);
    if (!res.valid) return res;
    return { valid: true };
}

export async function verifyComment(
    comment: CommentType,
    plebbit: Plebbit,
    overrideAuthorAddressIfInvalid = true
): Promise<ValidationResult> {
    const commentJson: CommentType = removeKeysWithUndefinedValues(comment);

    if (comment.authorEdit) {
        // Means comment has been edited, verify both comment.signature and comment.authorEdit.signature
        const originalObj: CommentType = { ...lodash.omit(commentJson, ["original", "authorEdit"]), ...commentJson.original };
        const originalValidation = await verifyPublicationWithAuthor(originalObj, plebbit);
        if (!originalValidation.valid) return originalValidation;
        if (overrideAuthorAddressIfInvalid && originalValidation.newAddress) comment.author.address = originalValidation.newAddress;

        const authorEditValidation = await verifyPublicationWithAuthor(<AuthorCommentEdit>commentJson.authorEdit, plebbit);
        if (!authorEditValidation.valid) return authorEditValidation;
        if (overrideAuthorAddressIfInvalid && authorEditValidation.newAddress)
            comment.authorEdit.author.address = authorEditValidation.newAddress;
    } else if (typeof commentJson.updatedAt === "number") {
        // We're verifying a comment (IPFS) along with Comment Update
        const originalObj = { ...lodash.omit(commentJson, ["original"]), ...commentJson.original };

        // Verify comment (IPFS)
        const res = await verifyPublicationWithAuthor(originalObj, plebbit);
        if (!res.valid) return res;
        if (overrideAuthorAddressIfInvalid && res.newAddress) comment.author.address = res.newAddress;
    } else {
        const res = await verifyPublicationWithAuthor(commentJson, plebbit);
        if (!res.valid) return res;
        if (overrideAuthorAddressIfInvalid && res.newAddress) comment.author.address = res.newAddress;
    }
    return { valid: true };
}

export async function verifySubplebbit(subplebbit: SubplebbitType, plebbit: Plebbit): Promise<ValidationResult> {
    const subplebbitJson: SubplebbitType = removeKeysWithUndefinedValues(subplebbit);
    const signatureValidity = await verifyPublicationSignature(subplebbitJson.signature, subplebbitJson);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_NOT_VALID };
    const resolvedSubAddress = await plebbit.resolver.resolveSubplebbitAddressIfNeeded(subplebbitJson.address);

    const subPeerId = PeerId.createFromB58String(resolvedSubAddress);
    const signaturePeerId = await getPeerIdFromPublicKeyPem(subplebbitJson.signature.publicKey);
    if (!subPeerId.equals(signaturePeerId)) return { valid: false, reason: messages.ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY };
    return { valid: true };
}

async function _getValidationResult(publication: PublicationToVerify) {
    //@ts-ignore
    const publicationJson: PublicationToVerify = removeKeysWithUndefinedValues(publication);
    const signatureValidity = await verifyPublicationSignature(publicationJson.signature, publicationJson);
    if (!signatureValidity) return { valid: false, reason: messages.ERR_SIGNATURE_IS_NOT_VALID };
    return { valid: true };
}

export async function verifyCommentUpdate(update: CommentUpdate): Promise<ValidationResult> {
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

export async function verifyPage(page: PageType, plebbit: Plebbit): Promise<ValidationResult> {
    const verifyCommentInPage = async (comment: CommentType, parentComment?: CommentType) => {
        if (comment.subplebbitAddress !== this.subplebbit.address) throw Error(messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB);
        if (parentComment && parentComment.cid !== comment.parentCid) throw Error(messages.ERR_PARENT_CID_NOT_AS_EXPECTED);

        const commentSignatureValidity = await verifyComment(comment, plebbit, true);
        if (!commentSignatureValidity.valid)
            throw errcode(Error(messages.ERR_SIGNATURE_IS_INVALID), codes.ERR_SIGNATURE_IS_INVALID, {
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
        await Promise.all(
            page.comments.map(async (comment) => {
                await verifyCommentInPage(comment, undefined);
            })
        );
        return { valid: true };
    } catch (e) {
        return { valid: false, reason: e.message };
    }
}
