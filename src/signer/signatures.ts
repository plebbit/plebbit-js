import {
    getKeyPairFromPrivateKeyPem,
    getPeerIdFromPublicKeyPem,
    getPlebbitAddressFromPrivateKeyPem,
    getPlebbitAddressFromPublicKeyPem
} from "./util";
import * as cborg from "cborg";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import assert from "assert";
import PeerId from "peer-id";
import { keepKeys, removeKeys, removeKeysWithUndefinedValues } from "../util";
import { Plebbit } from "../plebbit";
import { Signer } from ".";
import { AuthorType, SignatureType, SignatureTypes, SignedPropertyNames } from "../types";
import { sha256 } from "js-sha256";
import Logger from "@plebbit/plebbit-logger";

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
    assert(isProbablyBuffer(bufferToSign), `signBufferRsa invalid bufferToSign '${bufferToSign}' not buffer`);
    const keyPair = await getKeyPairFromPrivateKeyPem(privateKeyPem, privateKeyPemPassword);
    // do not use libp2p keyPair.sign to sign strings, it doesn't encode properly in the browser
    return await keyPair.sign(bufferToSign);
};

export const verifyBufferRsa = async (bufferToSign, bufferSignature, publicKeyPem) => {
    assert(isProbablyBuffer(bufferToSign), `verifyBufferRsa invalid bufferSignature '${bufferToSign}' not buffer`);
    assert(isProbablyBuffer(bufferSignature), `verifyBufferRsa invalid bufferSignature '${bufferSignature}' not buffer`);
    const peerId = await getPeerIdFromPublicKeyPem(publicKeyPem);
    return await peerId.pubKey.verify(bufferToSign, bufferSignature);
};

export async function signPublication(publication, signer: Signer, plebbit: Plebbit, signatureType: SignatureTypes): Promise<Signature> {
    assert(signer.publicKey);
    assert(Object.keys(SIGNED_PROPERTY_NAMES).includes(signatureType));
    const log = Logger("plebbit-js:signatures:signPublication");

    publication = removeKeysWithUndefinedValues(publication);
    if (publication?.author?.address) {
        const resolvedAddress = await plebbit.resolver.resolveAuthorAddressIfNeeded(publication.author.address);
        const derivedAddress = await getPlebbitAddressFromPrivateKeyPem(signer.privateKey);
        assert.equal(
            resolvedAddress,
            derivedAddress,
            `author.address (${publication.author.address}) does not equate its resolved address (${resolvedAddress}) is invalid. For this publication to be signed, user needs to ensure plebbit-author-address points to same key used by signer (${derivedAddress})`
        );
    }

    const signedPropertyNames = SIGNED_PROPERTY_NAMES[signatureType];

    log.trace(`Fields to sign: ${JSON.stringify(signedPropertyNames)}. Publication object to sign:  ${JSON.stringify(publication)}`);

    const fieldsToSign = keepKeys(publication, signedPropertyNames);
    const commentEncoded = cborg.encode(fieldsToSign); // The comment instances get jsoned over the pubsub, so it makes sense that we would json them before signing, to make sure the data is the same before and after getting jsoned
    const signatureData = uint8ArrayToString(await signBufferRsa(commentEncoded, signer.privateKey), "base64");
    log.trace(`Publication been signed, signature data is (${signatureData})`);
    return new Signature({
        signature: signatureData,
        publicKey: signer.publicKey,
        type: signer.type,
        signedPropertyNames: signedPropertyNames
    });
}

// Return [verification (boolean), reasonForFailing (string)]
export async function verifyPublication(
    publication,
    plebbit: Plebbit,
    signatureType: SignatureTypes,
    overrideAuthorAddressIfInvalid = true
): Promise<[boolean, string | undefined]> {
    assert(Object.keys(SIGNED_PROPERTY_NAMES).includes(signatureType));
    const log = Logger("plebbit-js:signatures:verifyPublication");

    const publicationJson = removeKeysWithUndefinedValues(publication);
    const cachedResult: [boolean, string] = plebbit._memCache.get(sha256(JSON.stringify(publicationJson) + signatureType));
    if (Array.isArray(cachedResult)) return cachedResult;

    const verifyAuthor = async (signature: Signature, author: AuthorType) => {
        const signaturePeerId = await getPeerIdFromPublicKeyPem(signature.publicKey);
        assert(author.address, "Author address is needed to verify");
        let authorPeerId: PeerId | undefined;
        try {
            // There are cases where author.address is a crypto domain so PeerId.createFromB58String crashes
            authorPeerId = PeerId.createFromB58String(author.address);
        } catch {}
        if (authorPeerId)
            assert.equal(signaturePeerId.equals(authorPeerId), true, "comment.author.address doesn't match comment.signature.publicKey");
        else if (overrideAuthorAddressIfInvalid && publicationJson?.author?.address) {
            // Meaning author is a domain, crypto one likely
            const resolvedAddress = await plebbit.resolver.resolveAuthorAddressIfNeeded(publicationJson.author.address);
            if (resolvedAddress !== publicationJson.author.address) {
                // Means author.address is a crypto domain
                const derivedAddress = await getPlebbitAddressFromPublicKeyPem(publicationJson.signature.publicKey);
                if (resolvedAddress !== derivedAddress) {
                    // Means plebbit-author-address text record is resolving to another comment (outdated?)
                    // Will always use address derived from publication.signature.publicKey as truth
                    log.error(
                        `domain (${publicationJson.author.address}) resolved address (${resolvedAddress}) is invalid, changing publication.author.address to derived address ${derivedAddress}`
                    );
                    publication.author.address = derivedAddress;
                }
            }
        }
    };
    const verifyPublicationSignature = async (signature: Signature, publicationToBeVerified) => {
        const commentWithFieldsToSign = keepKeys(publicationToBeVerified, signature.signedPropertyNames);
        const commentEncoded = cborg.encode(commentWithFieldsToSign);
        const signatureIsValid = await verifyBufferRsa(
            commentEncoded,
            uint8ArrayFromString(signature.signature, "base64"),
            signature.publicKey
        );
        assert.equal(signatureIsValid, true, "Signature is invalid");
    };

    try {
        // Need to verify comment.signature (of original comment) and authorEdit (latest edit by author, if exists)
        log.trace(`Attempting to verify a ${signatureType}`);

        if (publicationJson.original) {
            // Means comment has been edited, verify both comment.signature and comment.authorEdit.signature
            const originalObj = { ...removeKeys(publicationJson, ["original"]), ...publication.original };
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
        } else {
            await verifyPublicationSignature(publicationJson.signature, publicationJson);
            // Verify author at the end since we might change author.address which will fail signature verification
            if (publicationJson?.author?.address && plebbit.resolveAuthorAddresses)
                await verifyAuthor(publicationJson.signature, publicationJson.author);
        }

        const res: [boolean, string | undefined] = [true, undefined];
        plebbit._memCache.put(sha256(JSON.stringify(publicationJson) + signatureType), res);
        return res;
    } catch (e) {
        log(`Failed to verify ${signatureType} due to error: ${e}\nPublication: ${JSON.stringify(publicationJson)}`);
        const res: [boolean, string | undefined] = [false, String(e)];
        plebbit._memCache.put(sha256(JSON.stringify(publicationJson) + signatureType), res);

        return res;
    }
}
