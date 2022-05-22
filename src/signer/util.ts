const libp2pCrypto = require("libp2p-crypto");
const cborg = require("cborg");
const PeerId = require("peer-id");
const jose = require("jose");
const assert = require("assert");
const { fromString: uint8ArrayFromString } = require("uint8arrays/from-string");
const { toString: uint8ArrayToString } = require("uint8arrays/to-string");

export const generatePrivateKeyPem = async () => {
    const keyPair = await generateKeyPair();
    const privateKeyPem = await getPrivateKeyPemFromKeyPair(keyPair);
    return privateKeyPem.trim();
};

export const getPlebbitAddressFromPrivateKeyPem = async (privateKeyPem) => {
    validatePrivateKeyPem(privateKeyPem);
    const peerId = await getPeerIdFromPrivateKeyPem(privateKeyPem);
    return peerId.toB58String().trim();
};

export const getIpfsKeyFromPrivateKeyPem = async (privateKeyPem, password = "") => {
    validatePrivateKeyPem(privateKeyPem);
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const keyPair = await libp2pCrypto.keys.import(privateKeyPem, password);
    return keyPair.bytes;
};

export const getPublicKeyPemFromPrivateKeyPem = async (privateKeyPem, password = "") => {
    validatePrivateKeyPem(privateKeyPem);
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const keyPair = await getKeyPairFromPrivateKeyPem(privateKeyPem, password);
    const publicKeyPem = await getPublicKeyPemFromKeyPair(keyPair);
    return publicKeyPem.trim();
};

export const getKeyPairFromPrivateKeyPem = async (privateKeyPem, password = "") => {
    validatePrivateKeyPem(privateKeyPem);
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const keyPair = await libp2pCrypto.keys.import(privateKeyPem, password);
    return keyPair;
};

export const getPeerIdFromPublicKeyPem = async (publicKeyPem) => {
    validatePublicKeyPem(publicKeyPem);
    const publicKeyFromPem = await jose.importSPKI(publicKeyPem, "RS256", { extractable: true });
    const jsonWebToken = await jose.exportJWK(publicKeyFromPem);
    const PublicKeyRsa = await getPublicKeyRsaConstructor();
    const publicKeyRsaInstance = new PublicKeyRsa(jsonWebToken);
    const peerId = await PeerId.createFromPubKey(publicKeyRsaInstance.bytes);
    return peerId;
};

const generateKeyPair = async () => {
    const keyPair = await libp2pCrypto.keys.generateKeyPair("RSA", 2048);
    return keyPair;
};

const getPrivateKeyPemFromKeyPair = async (keyPair, password = "") => {
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const privateKeyPem = await keyPair.export(password, "pkcs-8");
    return privateKeyPem.trim();
};

const getPublicKeyPemFromKeyPair = async (keyPair) => {
    // https://en.wikipedia.org/wiki/PKCS_8
    const publicKeyFromJsonWebToken = await jose.importJWK(keyPair._publicKey, "RS256", { extractable: true });
    const publicKeyPem = await jose.exportSPKI(publicKeyFromJsonWebToken);
    return publicKeyPem.trim();
};

let publicKeyRsaConstructor;
const getPublicKeyRsaConstructor = async () => {
    // we are forced to do this because publicKeyRsaConstructor isn't public
    if (!publicKeyRsaConstructor) {
        const keyPair = await libp2pCrypto.keys.generateKeyPair("RSA", 2048);
        // get the constuctor for the PublicKeyRsaInstance
        publicKeyRsaConstructor = keyPair.public.constructor;
    }
    return publicKeyRsaConstructor;
};

const getPeerIdFromPrivateKeyPem = async (privateKeyPem) => {
    validatePrivateKeyPem(privateKeyPem);
    const keyPair = await getKeyPairFromPrivateKeyPem(privateKeyPem);
    const peerId = await PeerId.createFromPubKey(keyPair.public.bytes);
    return peerId;
};

const validatePrivateKeyPem = (privateKeyPem) => {
    assert(typeof privateKeyPem === "string", `invalid encrypted private key pem '${privateKeyPem}' not a string`);
    assert(
        privateKeyPem.startsWith("-----BEGIN ENCRYPTED PRIVATE KEY-----"),
        `invalid encrypted private key pem '${privateKeyPem}' not encrypted private key pem`
    );
};

const validatePublicKeyPem = (publicKeyPem) => {
    assert(typeof publicKeyPem === "string", `invalid public key pem '${publicKeyPem}' not a string`);
    assert(
        publicKeyPem.startsWith("-----BEGIN PUBLIC KEY-----"),
        `invalid public key pem '${publicKeyPem}' not public key pem`
    );
};
