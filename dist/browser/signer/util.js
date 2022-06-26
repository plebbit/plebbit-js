"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeerIdFromPublicKeyPem = exports.getKeyPairFromPrivateKeyPem = exports.getPublicKeyPemFromPrivateKeyPem = exports.getIpfsKeyFromPrivateKeyPem = exports.getPlebbitAddressFromPublicKeyPem = exports.getPlebbitAddressFromPrivateKeyPem = exports.generatePrivateKeyPem = void 0;
const libp2pCrypto = require("libp2p-crypto");
const cborg = require("cborg");
const PeerId = require("peer-id");
const jose = require("jose");
const assert = require("assert");
const { fromString: uint8ArrayFromString } = require("uint8arrays/from-string");
const { toString: uint8ArrayToString } = require("uint8arrays/to-string");
const generatePrivateKeyPem = () => __awaiter(void 0, void 0, void 0, function* () {
    const keyPair = yield generateKeyPair();
    const privateKeyPem = yield getPrivateKeyPemFromKeyPair(keyPair);
    return privateKeyPem.trim();
});
exports.generatePrivateKeyPem = generatePrivateKeyPem;
const getPlebbitAddressFromPrivateKeyPem = (privateKeyPem) => __awaiter(void 0, void 0, void 0, function* () {
    validatePrivateKeyPem(privateKeyPem);
    const peerId = yield getPeerIdFromPrivateKeyPem(privateKeyPem);
    return peerId.toB58String().trim();
});
exports.getPlebbitAddressFromPrivateKeyPem = getPlebbitAddressFromPrivateKeyPem;
const getPlebbitAddressFromPublicKeyPem = (publicKeyPem) => __awaiter(void 0, void 0, void 0, function* () {
    validatePublicKeyPem(publicKeyPem);
    const peerId = yield (0, exports.getPeerIdFromPublicKeyPem)(publicKeyPem);
    return peerId.toB58String().trim();
});
exports.getPlebbitAddressFromPublicKeyPem = getPlebbitAddressFromPublicKeyPem;
const getIpfsKeyFromPrivateKeyPem = (privateKeyPem, password = "") => __awaiter(void 0, void 0, void 0, function* () {
    validatePrivateKeyPem(privateKeyPem);
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const keyPair = yield libp2pCrypto.keys.import(privateKeyPem, password);
    return keyPair.bytes;
});
exports.getIpfsKeyFromPrivateKeyPem = getIpfsKeyFromPrivateKeyPem;
const getPublicKeyPemFromPrivateKeyPem = (privateKeyPem, password = "") => __awaiter(void 0, void 0, void 0, function* () {
    validatePrivateKeyPem(privateKeyPem);
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const keyPair = yield (0, exports.getKeyPairFromPrivateKeyPem)(privateKeyPem, password);
    const publicKeyPem = yield getPublicKeyPemFromKeyPair(keyPair);
    return publicKeyPem.trim();
});
exports.getPublicKeyPemFromPrivateKeyPem = getPublicKeyPemFromPrivateKeyPem;
const getKeyPairFromPrivateKeyPem = (privateKeyPem, password = "") => __awaiter(void 0, void 0, void 0, function* () {
    validatePrivateKeyPem(privateKeyPem);
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const keyPair = yield libp2pCrypto.keys.import(privateKeyPem, password);
    return keyPair;
});
exports.getKeyPairFromPrivateKeyPem = getKeyPairFromPrivateKeyPem;
const getPeerIdFromPublicKeyPem = (publicKeyPem) => __awaiter(void 0, void 0, void 0, function* () {
    validatePublicKeyPem(publicKeyPem);
    const publicKeyFromPem = yield jose.importSPKI(publicKeyPem, "RS256", { extractable: true });
    const jsonWebToken = yield jose.exportJWK(publicKeyFromPem);
    const PublicKeyRsa = yield getPublicKeyRsaConstructor();
    const publicKeyRsaInstance = new PublicKeyRsa(jsonWebToken);
    const peerId = yield PeerId.createFromPubKey(publicKeyRsaInstance.bytes);
    return peerId;
});
exports.getPeerIdFromPublicKeyPem = getPeerIdFromPublicKeyPem;
const generateKeyPair = () => __awaiter(void 0, void 0, void 0, function* () {
    const keyPair = yield libp2pCrypto.keys.generateKeyPair("RSA", 2048);
    return keyPair;
});
const getPrivateKeyPemFromKeyPair = (keyPair, password = "") => __awaiter(void 0, void 0, void 0, function* () {
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const privateKeyPem = yield keyPair.export(password, "pkcs-8");
    return privateKeyPem.trim();
});
const getPublicKeyPemFromKeyPair = (keyPair) => __awaiter(void 0, void 0, void 0, function* () {
    // https://en.wikipedia.org/wiki/PKCS_8
    const publicKeyFromJsonWebToken = yield jose.importJWK(keyPair._publicKey, "RS256", { extractable: true });
    const publicKeyPem = yield jose.exportSPKI(publicKeyFromJsonWebToken);
    return publicKeyPem.trim();
});
let publicKeyRsaConstructor;
const getPublicKeyRsaConstructor = () => __awaiter(void 0, void 0, void 0, function* () {
    // we are forced to do this because publicKeyRsaConstructor isn't public
    if (!publicKeyRsaConstructor) {
        const keyPair = yield libp2pCrypto.keys.generateKeyPair("RSA", 2048);
        // get the constuctor for the PublicKeyRsaInstance
        publicKeyRsaConstructor = keyPair.public.constructor;
    }
    return publicKeyRsaConstructor;
});
const getPeerIdFromPrivateKeyPem = (privateKeyPem) => __awaiter(void 0, void 0, void 0, function* () {
    validatePrivateKeyPem(privateKeyPem);
    const keyPair = yield (0, exports.getKeyPairFromPrivateKeyPem)(privateKeyPem);
    const peerId = yield PeerId.createFromPubKey(keyPair.public.bytes);
    return peerId;
});
const validatePrivateKeyPem = (privateKeyPem) => {
    assert(typeof privateKeyPem === "string", `invalid encrypted private key pem '${privateKeyPem}' not a string`);
    assert(privateKeyPem.startsWith("-----BEGIN ENCRYPTED PRIVATE KEY-----"), `invalid encrypted private key pem '${privateKeyPem}' not encrypted private key pem`);
};
const validatePublicKeyPem = (publicKeyPem) => {
    assert(typeof publicKeyPem === "string", `invalid public key pem '${publicKeyPem}' not a string`);
    assert(publicKeyPem.startsWith("-----BEGIN PUBLIC KEY-----"), `invalid public key pem '${publicKeyPem}' not public key pem`);
};
