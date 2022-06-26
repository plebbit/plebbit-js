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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = exports.decryptBufferRsa = exports.encryptBufferRsa = exports.decryptStringAesEcb = exports.encryptStringAesEcb = exports.generateKeyAesEcb = void 0;
const debug_1 = __importDefault(require("debug"));
const node_forge_1 = __importDefault(require("node-forge"));
const to_string_1 = require("uint8arrays/to-string");
const from_string_1 = require("uint8arrays/from-string");
const util_1 = require("./util");
const assert_1 = __importDefault(require("assert"));
const libp2p_crypto_1 = __importDefault(require("libp2p-crypto"));
const debug = (0, debug_1.default)("plebbit-js:signer:encryption");
const validateArgumentNotEmptyString = (value, propertyName, functionName) => {
    (0, assert_1.default)(typeof value === "string", `function '${functionName}' argument '${propertyName}': '${value}' not a string`);
    (0, assert_1.default)(value.length > 0, `function '${functionName}' argument '${propertyName}': '${value}' empty string`);
};
const generateKeyAesEcb = () => __awaiter(void 0, void 0, void 0, function* () {
    // key should be 16 bytes for AES ECB 128
    return libp2p_crypto_1.default.randomBytes(16);
});
exports.generateKeyAesEcb = generateKeyAesEcb;
const encryptStringAesEcb = (stringToEncrypt, key) => __awaiter(void 0, void 0, void 0, function* () {
    // node-forge takes in buffers and string weirdly in the browser so use hex instead
    const keyAsForgeBuffer = node_forge_1.default.util.createBuffer((0, to_string_1.toString)(key, "base16"), "hex");
    const cipher = node_forge_1.default.cipher.createCipher("AES-ECB", keyAsForgeBuffer);
    cipher.start();
    cipher.update(node_forge_1.default.util.createBuffer(stringToEncrypt, "utf8"));
    cipher.finish();
    const encryptedBase64 = (0, to_string_1.toString)((0, from_string_1.fromString)(cipher.output.toHex(), "base16"), "base64");
    return encryptedBase64;
});
exports.encryptStringAesEcb = encryptStringAesEcb;
const decryptStringAesEcb = (encryptedString, key) => __awaiter(void 0, void 0, void 0, function* () {
    // node-forge takes in buffers and string weirdly in the browser so use hex instead
    const keyAsForgeBuffer = node_forge_1.default.util.createBuffer((0, to_string_1.toString)(key, "base16"), "hex");
    const cipher = node_forge_1.default.cipher.createDecipher("AES-ECB", keyAsForgeBuffer);
    cipher.start();
    cipher.update(node_forge_1.default.util.createBuffer((0, from_string_1.fromString)(encryptedString, "base64")));
    cipher.finish();
    const decrypted = cipher.output.toString();
    return decrypted;
});
exports.decryptStringAesEcb = decryptStringAesEcb;
const encryptBufferRsa = (stringToEncrypt, publicKeyPem) => __awaiter(void 0, void 0, void 0, function* () {
    validateArgumentNotEmptyString(publicKeyPem, "publicKeyPem", "encryptBufferRsa");
    const peerId = yield (0, util_1.getPeerIdFromPublicKeyPem)(publicKeyPem);
    const encryptedKeyBase64 = (0, to_string_1.toString)(yield peerId.pubKey.encrypt(stringToEncrypt), "base64");
    return encryptedKeyBase64;
});
exports.encryptBufferRsa = encryptBufferRsa;
const decryptBufferRsa = (encryptedStringBase64, privateKeyPem, privateKeyPemPassword = "") => __awaiter(void 0, void 0, void 0, function* () {
    validateArgumentNotEmptyString(encryptedStringBase64, "encryptedStringBase64", "decryptBufferRsa");
    validateArgumentNotEmptyString(privateKeyPem, "privateKeyPem", "decryptBufferRsa");
    const keyPair = yield (0, util_1.getKeyPairFromPrivateKeyPem)(privateKeyPem, privateKeyPemPassword);
    const decrypted = yield keyPair.decrypt((0, from_string_1.fromString)(encryptedStringBase64, "base64"));
    return decrypted;
});
exports.decryptBufferRsa = decryptBufferRsa;
const encrypt = (stringToEncrypt, publicKeyPem) => __awaiter(void 0, void 0, void 0, function* () {
    validateArgumentNotEmptyString(stringToEncrypt, "stringToEncrypt", "encrypt");
    validateArgumentNotEmptyString(publicKeyPem, "publicKeyPem", "encrypt");
    // generate key of the cipher and encrypt the string using AES ECB 128
    // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Electronic_codebook_(ECB)
    const key = yield (0, exports.generateKeyAesEcb)(); // not secure to reuse keys with ECB, generate new one each time
    const encryptedBase64 = yield (0, exports.encryptStringAesEcb)(stringToEncrypt, key);
    // encrypt the AES ECB key with public key
    const encryptedKeyBase64 = yield (0, exports.encryptBufferRsa)(key, publicKeyPem);
    return { encrypted: encryptedBase64, encryptedKey: encryptedKeyBase64, type: "aes-ecb" };
});
exports.encrypt = encrypt;
const decrypt = (encryptedString, encryptedKey, privateKeyPem, privateKeyPemPassword = "") => __awaiter(void 0, void 0, void 0, function* () {
    validateArgumentNotEmptyString(encryptedString, "encryptedString", "decrypt");
    validateArgumentNotEmptyString(encryptedKey, "encryptedKey", "decrypt");
    validateArgumentNotEmptyString(privateKeyPem, "privateKeyPem", "decrypt");
    // decrypt key
    // you can optionally encrypt the PEM by providing a password
    // https://en.wikipedia.org/wiki/PKCS_8
    const key = yield (0, exports.decryptBufferRsa)(encryptedKey, privateKeyPem);
    // decrypt string using AES ECB 128
    // https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Electronic_codebook_(ECB)
    const decrypted = yield (0, exports.decryptStringAesEcb)(encryptedString, key);
    return decrypted;
});
exports.decrypt = decrypt;
