"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptEd25519AesGcm = exports.encryptEd25519AesGcm = exports.decryptStringAesGcm = exports.encryptStringAesGcm = void 0;
var node_forge_1 = __importDefault(require("node-forge"));
var to_string_1 = require("uint8arrays/to-string");
var from_string_1 = require("uint8arrays/from-string");
var ed = __importStar(require("@noble/ed25519"));
var isProbablyBuffer = function (arg) { return arg && typeof arg !== "string" && typeof arg !== "number"; };
var uint8ArrayToNodeForgeBuffer = function (uint8Array) {
    var forgeBuffer = node_forge_1.default.util.createBuffer();
    for (var _i = 0, uint8Array_1 = uint8Array; _i < uint8Array_1.length; _i++) {
        var byte = uint8Array_1[_i];
        forgeBuffer.putByte(byte);
    }
    return forgeBuffer;
};
// NOTE: never pass the last param 'iv', only used for testing, it must always be random
var encryptStringAesGcm = function (plaintext, key, iv) { return __awaiter(void 0, void 0, void 0, function () {
    var keyAsForgeBuffer, ivAsForgeBuffer, cipher;
    return __generator(this, function (_a) {
        if (!plaintext || typeof plaintext !== "string")
            throw Error("encryptStringAesGcm plaintext '".concat(plaintext, "' not a string"));
        if (!isProbablyBuffer(key))
            throw Error("encryptStringAesGcm invalid key '".concat(key, "' not buffer"));
        // use random 12 bytes uint8 array for iv
        if (!iv) {
            iv = ed.utils.randomPrivateKey().slice(0, 12);
        }
        keyAsForgeBuffer = uint8ArrayToNodeForgeBuffer(key);
        ivAsForgeBuffer = uint8ArrayToNodeForgeBuffer(iv);
        cipher = node_forge_1.default.cipher.createCipher("AES-GCM", keyAsForgeBuffer);
        cipher.start({ iv: ivAsForgeBuffer });
        cipher.update(node_forge_1.default.util.createBuffer(plaintext, "utf8"));
        cipher.finish();
        return [2 /*return*/, {
                ciphertext: (0, from_string_1.fromString)(cipher.output.toHex(), "base16"),
                iv: iv,
                // AES-GCM has authentication tag https://en.wikipedia.org/wiki/Galois/Counter_Mode
                tag: (0, from_string_1.fromString)(cipher.mode.tag.toHex(), "base16")
            }];
    });
}); };
exports.encryptStringAesGcm = encryptStringAesGcm;
var decryptStringAesGcm = function (ciphertext, key, iv, tag) { return __awaiter(void 0, void 0, void 0, function () {
    var keyAsForgeBuffer, ivAsForgeBuffer, tagAsForgeBuffer, cipher, decrypted;
    return __generator(this, function (_a) {
        if (!isProbablyBuffer(ciphertext))
            throw Error("decryptStringAesGcm invalid ciphertext '".concat(ciphertext, "' not buffer"));
        if (!isProbablyBuffer(key))
            throw Error("decryptStringAesGcm invalid key '".concat(key, "' not buffer"));
        if (!isProbablyBuffer(iv))
            throw Error("decryptStringAesGcm invalid iv '".concat(iv, "' not buffer"));
        if (!isProbablyBuffer(tag))
            throw Error("decryptStringAesGcm invalid tag '".concat(tag, "' not buffer"));
        keyAsForgeBuffer = uint8ArrayToNodeForgeBuffer(key);
        ivAsForgeBuffer = uint8ArrayToNodeForgeBuffer(iv);
        tagAsForgeBuffer = uint8ArrayToNodeForgeBuffer(tag);
        cipher = node_forge_1.default.cipher.createDecipher("AES-GCM", keyAsForgeBuffer);
        cipher.start({ iv: ivAsForgeBuffer, tag: tagAsForgeBuffer });
        cipher.update(node_forge_1.default.util.createBuffer(ciphertext));
        cipher.finish();
        decrypted = cipher.output.toString();
        return [2 /*return*/, decrypted];
    });
}); };
exports.decryptStringAesGcm = decryptStringAesGcm;
var encryptEd25519AesGcm = function (plaintext, privateKeyBase64, publicKeyBase64) { return __awaiter(void 0, void 0, void 0, function () {
    var privateKeyBuffer, publicKeyBuffer, randomPaddingLength, padding, aesGcmKey, aesGcmKey16Bytes, _a, ciphertext, iv, tag, encryptedBase64;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!plaintext || typeof plaintext !== "string")
                    throw Error("encryptEd25519AesGcm plaintext '".concat(plaintext, "' not a string"));
                if (!privateKeyBase64 || typeof privateKeyBase64 !== "string")
                    throw Error("encryptEd25519AesGcm privateKeyBase64 not a string");
                privateKeyBuffer = (0, from_string_1.fromString)(privateKeyBase64, "base64");
                if (privateKeyBuffer.length !== 32)
                    throw Error("encryptEd25519AesGcm publicKeyBase64 ed25519 public key length not 32 bytes (".concat(privateKeyBuffer.length, " bytes)"));
                if (!publicKeyBase64 || typeof publicKeyBase64 !== "string")
                    throw Error("encryptEd25519AesGcm publicKeyBase64 '".concat(publicKeyBase64, "' not a string"));
                publicKeyBuffer = (0, from_string_1.fromString)(publicKeyBase64, "base64");
                if (publicKeyBuffer.length !== 32)
                    throw Error("encryptEd25519AesGcm publicKeyBase64 '".concat(publicKeyBase64, "' ed25519 public key length not 32 bytes (").concat(publicKeyBuffer.length, " bytes)"));
                randomPaddingLength = Math.round(Math.random() * 5000);
                padding = "";
                while (padding.length < randomPaddingLength) {
                    padding += " ";
                }
                return [4 /*yield*/, ed.getSharedSecret(privateKeyBuffer, publicKeyBuffer)];
            case 1:
                aesGcmKey = _b.sent();
                aesGcmKey16Bytes = aesGcmKey.slice(0, 16);
                return [4 /*yield*/, (0, exports.encryptStringAesGcm)(plaintext + padding, aesGcmKey16Bytes)];
            case 2:
                _a = _b.sent(), ciphertext = _a.ciphertext, iv = _a.iv, tag = _a.tag;
                encryptedBase64 = {
                    ciphertext: (0, to_string_1.toString)(ciphertext, "base64"),
                    iv: (0, to_string_1.toString)(iv, "base64"),
                    // AES-GCM has authentication tag https://en.wikipedia.org/wiki/Galois/Counter_Mode
                    tag: (0, to_string_1.toString)(tag, "base64"),
                    type: "ed25519-aes-gcm"
                };
                return [2 /*return*/, encryptedBase64];
        }
    });
}); };
exports.encryptEd25519AesGcm = encryptEd25519AesGcm;
var decryptEd25519AesGcm = function (encrypted, privateKeyBase64, publicKeyBase64) { return __awaiter(void 0, void 0, void 0, function () {
    var ciphertextBuffer, privateKeyBuffer, publicKeyBuffer, ivBuffer, tagBuffer, aesGcmKey, aesGcmKey16Bytes, decrypted;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(encrypted === null || encrypted === void 0 ? void 0 : encrypted.ciphertext) || typeof (encrypted === null || encrypted === void 0 ? void 0 : encrypted.ciphertext) !== "string")
                    throw Error("decryptEd25519AesGcm encrypted.ciphertext '".concat(encrypted.ciphertext, "' not a string"));
                ciphertextBuffer = (0, from_string_1.fromString)(encrypted.ciphertext, "base64");
                if (!privateKeyBase64 || typeof privateKeyBase64 !== "string")
                    throw Error("decryptEd25519AesGcm ".concat(privateKeyBase64, " privateKeyBase64 not a string"));
                privateKeyBuffer = (0, from_string_1.fromString)(privateKeyBase64, "base64");
                if (privateKeyBuffer.length !== 32)
                    throw Error("decryptEd25519AesGcm publicKeyBase64 ed25519 public key length not 32 bytes (".concat(privateKeyBuffer.length, " bytes)"));
                if (!publicKeyBase64 || typeof publicKeyBase64 !== "string")
                    throw Error("decryptEd25519AesGcm publicKeyBase64 '".concat(publicKeyBase64, "' not a string"));
                publicKeyBuffer = (0, from_string_1.fromString)(publicKeyBase64, "base64");
                if (publicKeyBuffer.length !== 32)
                    throw Error("decryptEd25519AesGcm publicKeyBase64 '".concat(publicKeyBase64, "' ed25519 public key length not 32 bytes (").concat(publicKeyBuffer.length, " bytes)"));
                if (!(encrypted === null || encrypted === void 0 ? void 0 : encrypted.iv) || typeof (encrypted === null || encrypted === void 0 ? void 0 : encrypted.iv) !== "string")
                    throw Error("decryptEd25519AesGcm encrypted.iv '".concat(encrypted.iv, "' not a string"));
                ivBuffer = (0, from_string_1.fromString)(encrypted.iv, "base64");
                if (!(encrypted === null || encrypted === void 0 ? void 0 : encrypted.tag) || typeof (encrypted === null || encrypted === void 0 ? void 0 : encrypted.tag) !== "string")
                    throw Error("decryptEd25519AesGcm encrypted.tag '".concat(encrypted.tag, "' not a string"));
                tagBuffer = (0, from_string_1.fromString)(encrypted.tag, "base64");
                return [4 /*yield*/, ed.getSharedSecret(privateKeyBuffer, publicKeyBuffer)];
            case 1:
                aesGcmKey = _a.sent();
                aesGcmKey16Bytes = aesGcmKey.slice(0, 16);
                return [4 /*yield*/, (0, exports.decryptStringAesGcm)(ciphertextBuffer, aesGcmKey16Bytes, ivBuffer, tagBuffer)];
            case 2:
                decrypted = _a.sent();
                // remove padding
                decrypted = decrypted.replace(/ *$/, "");
                return [2 /*return*/, decrypted];
        }
    });
}); };
exports.decryptEd25519AesGcm = decryptEd25519AesGcm;
