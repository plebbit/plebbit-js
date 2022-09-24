const libp2pCrypto = require("libp2p-crypto");
const PeerId = require("peer-id");
const jose = require("jose");

export const generatePrivateKeyPem = async (): Promise<string> => {
    const keyPair = await generateKeyPair();
    const privateKeyPem = await getPrivateKeyPemFromKeyPair(keyPair);
    return privateKeyPem.trim();
};

export const getPlebbitAddressFromPrivateKeyPem = async (privateKeyPem): Promise<string> => {
    validatePrivateKeyPem(privateKeyPem);
    const peerId = await getPeerIdFromPrivateKeyPem(privateKeyPem);
    return peerId.toB58String().trim();
};

export const getPlebbitAddressFromPublicKeyPem = async (publicKeyPem): Promise<string> => {
    validatePublicKeyPem(publicKeyPem);
    const peerId = await getPeerIdFromPublicKeyPem(publicKeyPem);
    return peerId.toB58String().trim();
};

export const getIpfsKeyFromPrivateKeyPem = async (privateKeyPem, password = "") => {
    validatePrivateKeyPem(privateKeyPem);
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const keyPair = await libp2pCrypto.keys.import(privateKeyPem, password);
    return keyPair.bytes;
};

export const getPublicKeyPemFromPrivateKeyPem = async (privateKeyPem, password = ""): Promise<string> => {
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
    if (typeof privateKeyPem !== "string") throw Error(`invalid encrypted private key pem '${privateKeyPem}' not a string`);
    if (!privateKeyPem.startsWith("-----BEGIN ENCRYPTED PRIVATE KEY-----"))
        throw Error(`invalid encrypted private key pem '${privateKeyPem}' not encrypted private key pem`);
};

const validatePublicKeyPem = (publicKeyPem) => {
    if (typeof publicKeyPem !== "string") throw Error(`invalid public key pem '${publicKeyPem}' not a string`);
    if (!publicKeyPem.startsWith("-----BEGIN PUBLIC KEY-----")) throw Error(`invalid public key pem '${publicKeyPem}' not public key pem`);
};
