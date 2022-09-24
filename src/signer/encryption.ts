import forge from "node-forge";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { getPeerIdFromPublicKeyPem, getKeyPairFromPrivateKeyPem } from "./util";
import libp2pCrypto from "libp2p-crypto";
import { Encrypted } from "../types";

const validateArgumentNotEmptyString = (value, propertyName, functionName) => {
    if (typeof value !== "string") throw Error(`function '${functionName}' argument '${propertyName}': '${value}' not a string`);
    if (value.length === 0) throw Error(`function '${functionName}' argument '${propertyName}': '${value}' empty string`);
};

export const generateKeyAesCbc = async () => {
    // key should be 16 bytes for AES CBC 128
    return libp2pCrypto.randomBytes(16);
};

export const encryptStringAesCbc = async (stringToEncrypt, key) => {
    // node-forge takes in buffers and string weirdly in the browser so use hex instead
    const keyAsForgeBuffer = forge.util.createBuffer(uint8ArrayToString(key, "base16"), "hex");
    // use the key as initializaton vector because we don't need an iv since we never reuse keys
    const iv = forge.util.createBuffer(uint8ArrayToString(key, "base16"), "hex");

    const cipher = forge.cipher.createCipher("AES-CBC", keyAsForgeBuffer);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(stringToEncrypt, "utf8"));
    cipher.finish();
    const encryptedBase64 = uint8ArrayToString(uint8ArrayFromString(cipher.output.toHex(), "base16"), "base64");
    return encryptedBase64;
};

export const decryptStringAesCbc = async (encryptedString, key) => {
    // node-forge takes in buffers and string weirdly in the browser so use hex instead
    const keyAsForgeBuffer = forge.util.createBuffer(uint8ArrayToString(key, "base16"), "hex");
    // use the key as initializaton vector because we don't need an iv since we never reuse keys
    const iv = forge.util.createBuffer(uint8ArrayToString(key, "base16"), "hex");

    const cipher = forge.cipher.createDecipher("AES-CBC", keyAsForgeBuffer);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(uint8ArrayFromString(encryptedString, "base64")));
    cipher.finish();
    const decrypted = cipher.output.toString();
    return decrypted;
};

export const encryptBufferRsa = async (stringToEncrypt, publicKeyPem) => {
    validateArgumentNotEmptyString(publicKeyPem, "publicKeyPem", "encryptBufferRsa");
    const peerId = await getPeerIdFromPublicKeyPem(publicKeyPem);
    const encryptedKeyBase64 = uint8ArrayToString(await peerId.pubKey.encrypt(stringToEncrypt), "base64");
    return encryptedKeyBase64;
};

export const decryptBufferRsa = async (encryptedStringBase64, privateKeyPem, privateKeyPemPassword = "") => {
    validateArgumentNotEmptyString(encryptedStringBase64, "encryptedStringBase64", "decryptBufferRsa");
    validateArgumentNotEmptyString(privateKeyPem, "privateKeyPem", "decryptBufferRsa");
    const keyPair = await getKeyPairFromPrivateKeyPem(privateKeyPem, privateKeyPemPassword);
    const decrypted = await keyPair.decrypt(uint8ArrayFromString(encryptedStringBase64, "base64"));
    return decrypted;
};

export const encrypt = async (stringToEncrypt, publicKeyPem): Promise<Encrypted> => {
    validateArgumentNotEmptyString(stringToEncrypt, "stringToEncrypt", "encrypt");
    validateArgumentNotEmptyString(publicKeyPem, "publicKeyPem", "encrypt");

    // add random padding to prevent linking encrypted publications by sizes
    // TODO: eventually use an algorithm to find the most anonymous padding length
    const randomPaddingLength = Math.round(Math.random() * 5000);
    let padding = "";
    while (padding.length < randomPaddingLength) {
        padding += " ";
    }

    // generate key of the cipher and encrypt the string using AES CBC 128
    // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_block_chaining_(CBC)
    const key = await generateKeyAesCbc(); // not secure to reuse keys because we don't use iv
    const encryptedBase64 = await encryptStringAesCbc(stringToEncrypt + padding, key);

    // encrypt the AES CBC key with public key
    const encryptedKeyBase64 = await encryptBufferRsa(key, publicKeyPem);
    return { encrypted: encryptedBase64, encryptedKey: encryptedKeyBase64, type: "aes-cbc" };
};

export const decrypt = async (encryptedString, encryptedKey, privateKeyPem, privateKeyPemPassword = "") => {
    validateArgumentNotEmptyString(encryptedString, "encryptedString", "decrypt");
    validateArgumentNotEmptyString(encryptedKey, "encryptedKey", "decrypt");
    validateArgumentNotEmptyString(privateKeyPem, "privateKeyPem", "decrypt");
    // decrypt key
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const key = await decryptBufferRsa(encryptedKey, privateKeyPem);

    // decrypt string using AES CBC 128
    // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_block_chaining_(CBC)
    let decrypted = await decryptStringAesCbc(encryptedString, key);

    // remove padding
    decrypted = decrypted.replace(/ *$/, "");

    return decrypted;
};
