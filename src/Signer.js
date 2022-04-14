import * as crypto from "libp2p-crypto";
import {PeerId} from "ipfs-core";
import {keepKeys} from "./Util.js";
import {encode} from 'cborg';
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string';
import * as jose from "jose";

// note: postCid is not included because it's written by the sub owner, not the author

const COMMENT_FIELDS_TO_SIGN = ["subplebbitAddress", "author", "timestamp", "parentCid", "content", "title", "link"];

export class Signer {
    constructor(props) {
        this.type = props.type;
        this.privateKey = props.privateKey;
        this.publicKey = props.publicKey;
        this.address = props.address;
    }
}

export class Signature {
    constructor(props) {
        this.signature = props["signature"];
        this.publicKey = props["publicKey"];
        this.type = props["type"];
    }

    toJSON() {
        return {"signature": this.signature, "publicKey": this.publicKey, "type": this.type};
    }

}

let publicKeyRsaConstructor;

async function getPublicKeyRsaConstructor() {
    // we are forced to do this because publicKeyRsaConstructor isn't public
    if (!publicKeyRsaConstructor) {
        const keyPair = await crypto.keys.generateKeyPair('RSA', 2048)
        // get the constuctor for the PublicKeyRsaInstance
        publicKeyRsaConstructor = keyPair.public.constructor
    }
    return publicKeyRsaConstructor
}

async function getPeerIdFromPublicKeyPem(publicKeyPem) {
    const publicKeyFromPem = await jose.importSPKI(publicKeyPem, 'RSA256');
    const jsonWebToken = await jose.exportJWK(publicKeyFromPem);
    const PublicKeyRsa = await getPublicKeyRsaConstructor();
    const publicKeyRsaInstance = new PublicKeyRsa(jsonWebToken);
    return await PeerId.createFromPubKey(publicKeyRsaInstance.bytes);
}

export async function getAddressFromPublicKeyPem(publicKeyPem) {
    return (await getPeerIdFromPublicKeyPem(publicKeyPem)).toB58String();
}


export async function createCommentSignature(comment, signer) {
    const keyPair = await crypto.keys.import(signer.privateKey, "");

    const commentEncoded = encode(keepKeys(JSON.parse(JSON.stringify(comment)), COMMENT_FIELDS_TO_SIGN));
    const signatureData = uint8ArrayToString(await keyPair.sign(commentEncoded), 'base64');
    return new Signature({"signature": signatureData, "publicKey": signer.publicKey || publicKeyPem, "type": signer.type});
}


// Return [verification (boolean), reasonForFailing (string)]
export async function verifyCommentSignature(comment) {

    try {
        const peerId = await getPeerIdFromPublicKeyPem(comment.signature.publicKey);
        if (!peerId.equals(PeerId.createFromB58String(comment.author.address)))
            return [false, "comment.author.address doesn't match comment.signature.publicKey"];
        const commentWithFieldsToSign = keepKeys(JSON.parse(JSON.stringify(comment)), COMMENT_FIELDS_TO_SIGN);
        const commentEncoded = encode(commentWithFieldsToSign);
        const signatureIsValid = await peerId.pubKey.verify(commentEncoded, uint8ArrayFromString(comment.signature.signature, 'base64'));
        if (signatureIsValid)
            return [true,];
        else
            return [false, "comment.signature invalid"];
    } catch (e) {
        return [false, String(e)];
    }


}

