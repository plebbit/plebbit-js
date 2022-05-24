import Debug from "debug";
import { getKeyPairFromPrivateKeyPem, getPeerIdFromPublicKeyPem } from "./util";
import { encode } from "cborg";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import assert from "assert";
import PeerId from "peer-id";
import { keepKeys, removeKeysWithUndefinedValues } from "../util";
import Publication from "../publication";

const debug = Debug("plebbit-js:signer:signatures");

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

export async function signPublication(publication, signer) {
    const keyPair = await getKeyPairFromPrivateKeyPem(signer.privateKey, "");
    const fieldsToSign = getFieldsToSign(publication);
    debug(`Will sign fields ${JSON.stringify(fieldsToSign)}`);
    const publicationSignFields = keepKeys(publication, fieldsToSign);
    const commentEncoded = encode(removeKeysWithUndefinedValues(publicationSignFields)); // The comment instances get jsoned over the pubsub, so it makes sense that we would json them before signing, to make sure the data is the same before and after getting jsoned
    const signatureData = uint8ArrayToString(await keyPair.sign(commentEncoded), "base64");
    debug(`Publication been signed, signature data is (${signatureData})`);
    return new Signature({
        signature: signatureData,
        publicKey: signer.publicKey,
        type: signer.type,
        signedPropertyNames: fieldsToSign
    });
}

// Return [verification (boolean), reasonForFailing (string)]
export async function verifyPublication(publication) {
    const verifyAuthor = async (signature, author) => {
        const peerId = await getPeerIdFromPublicKeyPem(signature.publicKey);
        assert.equal(
            peerId.equals(PeerId.createFromB58String(author.address)),
            true,
            "comment.author.address doesn't match comment.signature.publicKey"
        );
    };
    const verifyPublicationSignature = async (signature, publicationToBeVerified) => {
        const peerId = await getPeerIdFromPublicKeyPem(signature.publicKey);
        const commentWithFieldsToSign = keepKeys(publicationToBeVerified, signature.signedPropertyNames);
        const commentEncoded = encode(removeKeysWithUndefinedValues(commentWithFieldsToSign));
        const signatureIsValid = await peerId.pubKey.verify(commentEncoded, uint8ArrayFromString(signature.signature, "base64"));
        assert.equal(signatureIsValid, true, "Signature is invalid");
    };

    try {
        if (publication.originalContent) {
            // This is a comment/post that has been edited, and we need to verify both signature and editSignature
            debug(
                "Attempting to verify a comment that has been edited. Will verify comment.author,  comment.signature and comment.editSignature"
            );
            publication.author ? await verifyAuthor(publication.signature, publication.author) : undefined;
            const publicationJson = publication instanceof Publication ? publication.toJSON() : publication;
            const originalSignatureObj = { ...publicationJson, content: publication.originalContent };
            debug(`Attempting to verify comment.signature`);
            await verifyPublicationSignature(publication.signature, originalSignatureObj);
            debug(`Attempting to verify comment.signature`);
            const editedSignatureObj = { ...publicationJson, commentCid: publication.cid };
            await verifyPublicationSignature(publication.editSignature, editedSignatureObj);
        } else if (publication.commentCid && publication.content) {
            // Verify CommentEdit
            debug(`Attempting to verify CommentEdit`);
            await verifyPublicationSignature(publication.editSignature, publication);
        } else {
            debug(`Attempting to verify post/comment/vote`);
            publication.author ? await verifyAuthor(publication.signature, publication.author) : undefined;
            await verifyPublicationSignature(publication.signature, publication);
        }
        debug("Publication has been verified");
        return [true];
    } catch (e) {
        debug(`Failed to verify publication`);
        return [false, String(e)];
    }
}
