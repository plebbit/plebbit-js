import {
    getKeyPairFromPrivateKeyPem,
    getPeerIdFromPublicKeyPem,
    getPlebbitAddressFromPrivateKeyPem,
    getPlebbitAddressFromPublicKeyPem
} from "./util";
import { encode } from "cborg";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import assert from "assert";
import PeerId from "peer-id";
import { getDebugLevels, keepKeys, removeKeysWithUndefinedValues } from "../util";
import Publication from "../publication";
import { Plebbit } from "../plebbit";
import { Signer } from ".";

const debugs = getDebugLevels("signer:signatures");

export class Signature {
    signature: string;
    publicKey: string;
    type: "rsa";
    signedPropertyNames: string[];

    constructor(props) {
        this.signature = props["signature"];
        this.publicKey = props["publicKey"];
        this.type = props["type"];
        this.signedPropertyNames = props["signedPropertyNames"];
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

function getFieldsToSign(publication) {
    if (publication.hasOwnProperty("vote")) return ["subplebbitAddress", "author", "timestamp", "vote", "commentCid"];
    else if (publication.commentCid)
        // CommentEdit
        return [
            "subplebbitAddress",
            "content",
            "commentCid",
            "editTimestamp",
            "editReason",
            "deleted",
            "spoiler",
            "pinned",
            "locked",
            "removed",
            "moderatorReason"
        ];
    else if (publication.title)
        // Post
        return ["subplebbitAddress", "author", "timestamp", "content", "title", "link"];
    else if (publication.content)
        // Comment
        return ["subplebbitAddress", "author", "timestamp", "parentCid", "content"];
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

export async function signPublication(publication: Publication, signer: Signer, plebbit: Plebbit): Promise<Signature> {
    if (publication?.author?.address) {
        const resolvedAddress = await plebbit.resolver.resolveAuthorAddressIfNeeded(publication.author.address);
        const derivedAddress = await getPlebbitAddressFromPrivateKeyPem(signer.privateKey);
        assert.equal(
            resolvedAddress,
            derivedAddress,
            `domain (${publication.author.address}) resolved address (${resolvedAddress}) is invalid. For this publication to be signed, user needs to ensure plebbit-author-address points to same key used by signer`
        );
    }

    const fieldsToSign = getFieldsToSign(publication);
    const publicationSignFields = removeKeysWithUndefinedValues(keepKeys(publication, fieldsToSign));
    debugs.TRACE(`Fields to sign: ${JSON.stringify(fieldsToSign)}. Publication object to sign:  ${JSON.stringify(publicationSignFields)}`);
    const commentEncoded = encode(publicationSignFields); // The comment instances get jsoned over the pubsub, so it makes sense that we would json them before signing, to make sure the data is the same before and after getting jsoned
    const signatureData = uint8ArrayToString(await signBufferRsa(commentEncoded, signer.privateKey), "base64");
    debugs.DEBUG(`Publication been signed, signature data is (${signatureData})`);
    return new Signature({
        signature: signatureData,
        publicKey: signer.publicKey,
        type: signer.type,
        signedPropertyNames: fieldsToSign
    });
}

// Return [verification (boolean), reasonForFailing (string)]
export async function verifyPublication(publication, plebbit: Plebbit, overrideAuthorAddressIfInvalid = true) {
    const verifyAuthor = async (signature, author) => {
        const signaturePeerId = await getPeerIdFromPublicKeyPem(signature.publicKey);
        let authorPeerId: PeerId | undefined;
        try {
            // There are cases where author.address is a crypto domain so PeerId.createFromB58String crashes
            authorPeerId = PeerId.createFromB58String(author.address);
        } catch {}
        if (authorPeerId)
            assert.equal(signaturePeerId.equals(authorPeerId), true, "comment.author.address doesn't match comment.signature.publicKey");
        else if (overrideAuthorAddressIfInvalid && publication?.author?.address) {
            // Meaning author is a domain, crypto one likely
            const resolvedAddress = await plebbit.resolver.resolveAuthorAddressIfNeeded(publication.author.address);
            if (resolvedAddress !== publication.author.address) {
                // Means author.address is a crypto domain
                const derivedAddress = await getPlebbitAddressFromPublicKeyPem(publication.signature.publicKey);
                if (resolvedAddress !== derivedAddress) {
                    // Means plebbit-author-address text record is resolving to another comment (oudated?)
                    // Will always use address derived from publication.signature.publicKey as truth
                    debugs.INFO(
                        `domain (${publication.author.address}) resolved address (${resolvedAddress}) is invalid, changing publication.author.address to derived address ${derivedAddress}`
                    );
                    publication.author.address = derivedAddress;
                }
            }
        }
    };
    const verifyPublicationSignature = async (signature, publicationToBeVerified) => {
        const commentWithFieldsToSign = keepKeys(publicationToBeVerified, signature.signedPropertyNames);
        debugs.DEBUG(
            `signature.signedPropertyNames: [${signature.signedPropertyNames}], Attempt to verify a publication: ${JSON.stringify(
                commentWithFieldsToSign
            )}`
        );
        const commentEncoded = encode(removeKeysWithUndefinedValues(commentWithFieldsToSign));
        const signatureIsValid = await verifyBufferRsa(
            commentEncoded,
            uint8ArrayFromString(signature.signature, "base64"),
            signature.publicKey
        );
        assert.equal(signatureIsValid, true, "Signature is invalid");
    };

    try {
        if (publication.originalContent) {
            // This is a comment/post that has been edited, and we need to verify both signature and editSignature
            debugs.TRACE(
                "Attempting to verify a comment that has been edited. Will verify comment.author,  comment.signature and comment.editSignature"
            );
            const publicationJson = publication instanceof Publication ? publication.toJSON() : publication;
            const originalSignatureObj = { ...publicationJson, content: publication.originalContent };
            debugs.TRACE(`Attempting to verify comment.signature`);
            await verifyPublicationSignature(publication.signature, originalSignatureObj);
            debugs.TRACE(`Attempting to verify comment.editSignature`);
            const editedSignatureObj = { ...publicationJson, commentCid: publication.cid };
            await verifyPublicationSignature(publication.editSignature, editedSignatureObj);
            // Verify author at the end since we might change author.address which will fail signature verification
            publication.author ? await verifyAuthor(publication.signature, publication.author) : undefined;
        } else if (publication.commentCid && publication.content) {
            // Verify CommentEdit
            debugs.TRACE(`Attempting to verify CommentEdit`);
            await verifyPublicationSignature(publication.editSignature, publication);
        } else {
            debugs.TRACE(`Attempting to verify post/comment/vote`);
            await verifyPublicationSignature(publication.signature, publication);
            publication.author ? await verifyAuthor(publication.signature, publication.author) : undefined;
        }
        debugs.TRACE("Publication has been verified");
        return [true];
    } catch (e) {
        debugs.WARN(`Failed to verify publication due to error: ${e}`);
        return [false, String(e)];
    }
}
