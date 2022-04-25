import * as crypto from "libp2p-crypto";
import {PeerId} from "ipfs-core";
import {keepKeys, removeKeysWithUndefinedValues} from "./Util.js";
import {encode} from 'cborg';
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import {fromString as uint8ArrayFromString} from 'uint8arrays/from-string';
import * as jose from "jose";
import forge from 'node-forge'

// note: postCid is not included because it's written by the sub owner, not the author


export class Signer {
    constructor(props) {
        this.type = props.type;
        this.privateKey = props.privateKey;
        this.publicKey = props.publicKey;
        this.address = props.address;
        this.ipfsKey = Buffer.from(props.ipfsKey);
    }

    toJSON() {
        return {
            "type": this.type,
            "privateKey": this.privateKey,
            "publicKey": this.publicKey,
            "address": this.address,
            "ipfsKey": this.ipfsKey
        };
    }
}

export class Signature {
    constructor(props) {
        this.signature = props["signature"];
        this.publicKey = props["publicKey"];
        this.type = props["type"];
        this.signedPropertyNames = props["signedPropertyNames"];
    }

    toJSON() {
        return {
            "signature": this.signature,
            "publicKey": this.publicKey,
            "type": this.type,
            "signedPropertyNames": this.signedPropertyNames
        };
    }

}

let publicKeyRsaConstructor;

async function getPublicKeyRsaConstructor() {
    // we are forced to do this because publicKeyRsaConstructor isn't public
    if (!publicKeyRsaConstructor) {
        const keyPair = await crypto.keys.generateKeyPair('RSA', 2048)
        // get the constructor for the PublicKeyRsaInstance
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

function getFieldsToSign(publication) {
    if (publication.hasOwnProperty("vote"))
        return ["subplebbitAddress", "author", "timestamp", "vote", "commentCid"];
    else if (publication.commentCid) // CommentEdit
        return ["subplebbitAddress", "content", "commentCid", "editTimestamp", "editReason", "deleted", "spoiler", "pinned", "locked", "removed", "moderatorReason"];
    else if (publication.title) // Post
        return ["subplebbitAddress", "author", "timestamp", "content", "title", "link"];
    else if (publication.content) // Comment
        return ["subplebbitAddress", "author", "timestamp", "parentCid", "content"];
}

export async function signPublication(publication, signer) {
    const keyPair = await crypto.keys.import(signer.privateKey, "");
    const fieldsToSign = getFieldsToSign(publication);
    const publicationSignFields = keepKeys(publication, fieldsToSign);

    const commentEncoded = encode(publicationSignFields);
    const signatureData = uint8ArrayToString(await keyPair.sign(commentEncoded), 'base64');
    return new Signature({
        "signature": signatureData,
        "publicKey": signer.publicKey,
        "type": signer.type,
        "signedPropertyNames": Object.keys(publicationSignFields)
    });
}


// Return [verification (boolean), reasonForFailing (string)]
export async function verifyPublication(publication) {

    try {
        // CommentEdit won't have author prop
        const signature = publication.signature || publication.editSignature;
        const peerId = await getPeerIdFromPublicKeyPem(signature.publicKey);
        if (publication.author && !peerId.equals(PeerId.createFromB58String(publication.author.address)))
            return [false, "comment.author.address doesn't match comment.signature.publicKey"];

        const commentWithFieldsToSign = keepKeys(publication, signature.signedPropertyNames);
        const commentEncoded = encode(commentWithFieldsToSign);
        const signatureIsValid = await peerId.pubKey.verify(commentEncoded, uint8ArrayFromString(signature.signature, 'base64'));
        if (signatureIsValid)
            return [true,];
        else
            return [false, "comment.signature invalid"];
    } catch (e) {
        return [false, String(e)];
    }
}

export async function encrypt(stringToEncrypt, publicKeyPem) {
    // generate key of the cipher and encrypt the string using AES ECB 128
    // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Electronic_codebook_(ECB)
    const key = forge.random.getBytesSync(16); // not secure to reuse keys with ECB, generate new one each time
    const cipher = forge.cipher.createCipher('AES-ECB', key);
    cipher.start();
    cipher.update(forge.util.createBuffer(stringToEncrypt));
    cipher.finish();
    const encryptedBase64 = uint8ArrayToString(uint8ArrayFromString(cipher.output.toHex(), 'base16'), 'base64');

    // encrypt the AES ECB key with public key
    const peerId = await getPeerIdFromPublicKeyPem(publicKeyPem);
    const encryptedKeyBase64 = uint8ArrayToString(await peerId.pubKey.encrypt(key), 'base64');
    return {encryptedString: encryptedBase64, encryptedKey: encryptedKeyBase64, type: 'aes-ecb'};
}

export async function decrypt(encryptedString, encryptedKey, privateKeyPem, privateKeyPemPassword = '') {
    // decrypt key
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const keyPair = await crypto.keys.import(privateKeyPem, privateKeyPemPassword);

    const key = await keyPair.decrypt(uint8ArrayFromString(encryptedKey, 'base64'));

    // decrypt string using AES ECB 128
    // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Electronic_codebook_(ECB)
    const cipher = forge.cipher.createDecipher('AES-ECB', key.toString());
    cipher.start();
    cipher.update(forge.util.createBuffer(uint8ArrayFromString(encryptedString, 'base64')));
    cipher.finish();
    return cipher.output.toString();
}

