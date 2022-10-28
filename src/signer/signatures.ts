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
import { keepKeys, removeKeys, removeKeysWithUndefinedValues } from "../util";
import { Plebbit } from "../plebbit";
import { Signer } from ".";
import {
    AuthorType,
    CommentEditType,
    CommentType,
    CreateCommentEditOptions,
    CreateCommentOptions,
    CreateVoteOptions,
    PublicationsToSign,
    PublicationToVerify,
    SignatureType,
    SignatureTypes,
    SignedPropertyNames,
    SubplebbitType,
    VoteType
} from "../types";
import { sha256 } from "js-sha256";
import Logger from "@plebbit/plebbit-logger";
import { CommentEdit } from "../comment-edit";
import Vote from "../vote";
import { Comment } from "../comment";

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

    const fieldsToSign = keepKeys(publicationJson, signedPropertyNames);
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

const verifyPublicationSignature = async (signature: SignatureType, publicationToBeVerified: PublicationToVerify) => {
    const commentWithFieldsToSign = keepKeys(publicationToBeVerified, signature.signedPropertyNames);
    const commentEncoded = cborg.encode(commentWithFieldsToSign);
    const signatureIsValid = await verifyBufferRsa(
        commentEncoded,
        uint8ArrayFromString(signature.signature, "base64"),
        signature.publicKey
    );
    if (!signatureIsValid) throw Error("Signature is invalid");
};

// Return [verification (boolean), reasonForFailing (string)]
export async function verifyPublication(
    publication: PublicationToVerify,
    plebbit: Plebbit,
    signatureType: SignatureTypes,
    overrideAuthorAddressIfInvalid = true
): Promise<[boolean, string | undefined]> {
    if (!Object.keys(SIGNED_PROPERTY_NAMES).includes(signatureType)) throw Error(`signature type (${signatureType}) is not supported`);
    let publicationJson = <PublicationToVerify>removeKeysWithUndefinedValues(publication); // This line is needed to remove nested undefined values
    if (!publicationJson.signature) throw Error(`Publication has no signature to verify`);

    const log = Logger("plebbit-js:signatures:verifyPublication");

    const cachedResult: [boolean, string] = plebbit._memCache.get(sha256(JSON.stringify(publicationJson) + signatureType));
    if (Array.isArray(cachedResult)) return cachedResult;

    const verifyAuthor = async (signature: SignatureType, author: AuthorType) => {
        publicationJson = <CommentEditType | VoteType | CommentType>publicationJson;
        const signaturePeerId = await getPeerIdFromPublicKeyPem(signature.publicKey);
        let authorPeerId: PeerId | undefined;
        try {
            // There are cases where author.address is a crypto domain so PeerId.createFromB58String crashes
            authorPeerId = PeerId.createFromB58String(author.address);
        } catch {}
        if (authorPeerId && !signaturePeerId.equals(authorPeerId))
            throw Error("comment.author.address doesn't match comment.signature.publicKey");
        else if (overrideAuthorAddressIfInvalid && publicationJson?.author?.address) {
            // Meaning author is a domain, crypto one likely
            const resolvedAddress = await plebbit.resolver.resolveAuthorAddressIfNeeded(publicationJson.author.address);
            if (resolvedAddress !== publicationJson.author.address) {
                // Means author.address is a crypto domain
                const derivedAddress = await getPlebbitAddressFromPublicKeyPem(publication.signature.publicKey);
                if (resolvedAddress !== derivedAddress) {
                    // Means plebbit-author-address text record is resolving to another comment (outdated?)
                    // Will always use address derived from publication.signature.publicKey as truth
                    log.error(
                        `domain (${publicationJson.author.address}) resolved address (${resolvedAddress}) is invalid, changing publication.author.address to derived address ${derivedAddress}`
                    );
                    (<CommentEdit | Vote | Comment>publication).author.address = derivedAddress; // Change argument Publication author address. This is why we're using publicationJson
                }
            }
        }
    };

    try {
        // Need to verify comment.signature (of original comment) and authorEdit (latest edit by author, if exists)
        log.trace(`Attempting to verify a ${signatureType}`);

        if (signatureType === "comment" && publicationJson["authorEdit"]) {
            // Means comment has been edited, verify both comment.signature and comment.authorEdit.signature
            publicationJson = <CommentType>publicationJson;
            const originalObj = { ...removeKeys(publicationJson, ["original", "authorEdit"]), ...publicationJson.original };
            let [verified, failedVerificationReason] = await verifyPublication(
                originalObj,
                plebbit,
                "comment",
                overrideAuthorAddressIfInvalid
            );
            if (!verified) return [false, `Failed to verify ${signatureType}.original due to: ${failedVerificationReason}`];

            [verified, failedVerificationReason] = await verifyPublication(
                publicationJson.authorEdit,
                plebbit,
                "commentedit",
                overrideAuthorAddressIfInvalid
            );
            if (!verified) return [false, `Failed to verify ${signatureType}.authorEdit due to: ${failedVerificationReason}`];
        } else if (signatureType === "comment" && publicationJson["updatedAt"]) {
            // We're verifying a comment (IPFS) along with Comment Update
            publicationJson = <CommentType>publicationJson;
            const originalObj = { ...removeKeys(publicationJson, ["original"]), ...publicationJson.original };

            // Verify comment (IPFS)
            await verifyPublicationSignature(publicationJson.signature, originalObj);
        } else if (signatureType === "subplebbit") {
            publicationJson = <SubplebbitType>publicationJson;
            await verifyPublicationSignature(publicationJson.signature, publicationJson);
            const resolvedSubAddress: string = plebbit.resolver.isDomain(publicationJson.address)
                ? await plebbit.resolver.resolveSubplebbitAddressIfNeeded(publicationJson.address)
                : publicationJson.address;
            const subPeerId = PeerId.createFromB58String(resolvedSubAddress);
            const signaturePeerId = await getPeerIdFromPublicKeyPem(publicationJson.signature.publicKey);
            if (!subPeerId.equals(signaturePeerId))
                throw Error("subplebbit.address.publicKey doesn't equal subplebbit.signature.publicKey");
        } else {
            await verifyPublicationSignature(publicationJson.signature, publicationJson);
            // Verify author at the end since we might change author.address which will fail signature verification
            if (publicationJson["author"] && publicationJson["author"]["address"] && plebbit.resolveAuthorAddresses)
                await verifyAuthor(publicationJson.signature, (<CommentEditType | VoteType | CommentType>publicationJson).author);
        }

        const res: [boolean, string | undefined] = [true, undefined];
        plebbit._memCache.put(sha256(JSON.stringify(publicationJson) + signatureType), res);
        return res;
    } catch (e) {
        log(`Failed to verify ${signatureType} due to error:`, e);
        log("Publication: ", publicationJson);
        const res: [boolean, string | undefined] = [false, String(e)];
        plebbit._memCache.put(sha256(JSON.stringify(publicationJson) + signatureType), res);

        return res;
    }
}
