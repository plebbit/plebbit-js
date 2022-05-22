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
exports.decrypt = exports.encrypt = exports.decryptBufferRsa = exports.encryptBufferRsa = exports.decryptStringAesEcb = exports.encryptStringAesEcb = exports.generateKeyAesEcb = void 0;
var debug_1 = __importDefault(require("debug"));
var node_forge_1 = __importDefault(require("node-forge"));
var to_string_1 = require("uint8arrays/to-string");
var from_string_1 = require("uint8arrays/from-string");
var util_1 = require("./util");
var assert_1 = __importDefault(require("assert"));
var libp2p_crypto_1 = __importDefault(require("libp2p-crypto"));
var debug = (0, debug_1.default)("plebbit-js:signer:encryption");
var validateArgumentNotEmptyString = function (value, propertyName, functionName) {
    (0, assert_1.default)(typeof value === "string", "function '".concat(functionName, "' argument '").concat(propertyName, "': '").concat(value, "' not a string"));
    (0, assert_1.default)(value.length > 0, "function '".concat(functionName, "' argument '").concat(propertyName, "': '").concat(value, "' empty string"));
};
var generateKeyAesEcb = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // key should be 16 bytes for AES ECB 128
        return [2 /*return*/, libp2p_crypto_1.default.randomBytes(16)];
    });
}); };
exports.generateKeyAesEcb = generateKeyAesEcb;
var encryptStringAesEcb = function (stringToEncrypt, key) { return __awaiter(void 0, void 0, void 0, function () {
    var keyAsForgeBuffer, cipher, encryptedBase64;
    return __generator(this, function (_a) {
        keyAsForgeBuffer = node_forge_1.default.util.createBuffer((0, to_string_1.toString)(key, "base16"), "hex");
        cipher = node_forge_1.default.cipher.createCipher("AES-ECB", keyAsForgeBuffer);
        cipher.start();
        cipher.update(node_forge_1.default.util.createBuffer(stringToEncrypt, "utf8"));
        cipher.finish();
        encryptedBase64 = (0, to_string_1.toString)((0, from_string_1.fromString)(cipher.output.toHex(), "base16"), "base64");
        return [2 /*return*/, encryptedBase64];
    });
}); };
exports.encryptStringAesEcb = encryptStringAesEcb;
var decryptStringAesEcb = function (encryptedString, key) { return __awaiter(void 0, void 0, void 0, function () {
    var keyAsForgeBuffer, cipher, decrypted;
    return __generator(this, function (_a) {
        keyAsForgeBuffer = node_forge_1.default.util.createBuffer((0, to_string_1.toString)(key, "base16"), "hex");
        cipher = node_forge_1.default.cipher.createDecipher("AES-ECB", keyAsForgeBuffer);
        cipher.start();
        cipher.update(node_forge_1.default.util.createBuffer((0, from_string_1.fromString)(encryptedString, "base64")));
        cipher.finish();
        decrypted = cipher.output.toString();
        return [2 /*return*/, decrypted];
    });
}); };
exports.decryptStringAesEcb = decryptStringAesEcb;
var encryptBufferRsa = function (stringToEncrypt, publicKeyPem) { return __awaiter(void 0, void 0, void 0, function () {
    var peerId, encryptedKeyBase64, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                validateArgumentNotEmptyString(publicKeyPem, "publicKeyPem", "encryptBufferRsa");
                return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKeyPem)(publicKeyPem)];
            case 1:
                peerId = _b.sent();
                _a = to_string_1.toString;
                return [4 /*yield*/, peerId.pubKey.encrypt(stringToEncrypt)];
            case 2:
                encryptedKeyBase64 = _a.apply(void 0, [_b.sent(), "base64"]);
                return [2 /*return*/, encryptedKeyBase64];
        }
    });
}); };
exports.encryptBufferRsa = encryptBufferRsa;
var decryptBufferRsa = function (encryptedStringBase64, privateKeyPem, privateKeyPemPassword) {
    if (privateKeyPemPassword === void 0) { privateKeyPemPassword = ""; }
    return __awaiter(void 0, void 0, void 0, function () {
        var keyPair, decrypted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validateArgumentNotEmptyString(encryptedStringBase64, "encryptedStringBase64", "decryptBufferRsa");
                    validateArgumentNotEmptyString(privateKeyPem, "privateKeyPem", "decryptBufferRsa");
                    return [4 /*yield*/, (0, util_1.getKeyPairFromPrivateKeyPem)(privateKeyPem, privateKeyPemPassword)];
                case 1:
                    keyPair = _a.sent();
                    return [4 /*yield*/, keyPair.decrypt((0, from_string_1.fromString)(encryptedStringBase64, "base64"))];
                case 2:
                    decrypted = _a.sent();
                    return [2 /*return*/, decrypted];
            }
        });
    });
};
exports.decryptBufferRsa = decryptBufferRsa;
var encrypt = function (stringToEncrypt, publicKeyPem) { return __awaiter(void 0, void 0, void 0, function () {
    var key, encryptedBase64, encryptedKeyBase64;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validateArgumentNotEmptyString(stringToEncrypt, "stringToEncrypt", "encrypt");
                validateArgumentNotEmptyString(publicKeyPem, "publicKeyPem", "encrypt");
                return [4 /*yield*/, (0, exports.generateKeyAesEcb)()];
            case 1:
                key = _a.sent();
                return [4 /*yield*/, (0, exports.encryptStringAesEcb)(stringToEncrypt, key)];
            case 2:
                encryptedBase64 = _a.sent();
                return [4 /*yield*/, (0, exports.encryptBufferRsa)(key, publicKeyPem)];
            case 3:
                encryptedKeyBase64 = _a.sent();
                return [2 /*return*/, { encrypted: encryptedBase64, encryptedKey: encryptedKeyBase64, type: "aes-ecb" }];
        }
    });
}); };
exports.encrypt = encrypt;
var decrypt = function (encryptedString, encryptedKey, privateKeyPem, privateKeyPemPassword) {
    if (privateKeyPemPassword === void 0) { privateKeyPemPassword = ""; }
    return __awaiter(void 0, void 0, void 0, function () {
        var key, decrypted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validateArgumentNotEmptyString(encryptedString, "encryptedString", "decrypt");
                    validateArgumentNotEmptyString(encryptedKey, "encryptedKey", "decrypt");
                    validateArgumentNotEmptyString(privateKeyPem, "privateKeyPem", "decrypt");
                    return [4 /*yield*/, (0, exports.decryptBufferRsa)(encryptedKey, privateKeyPem)];
                case 1:
                    key = _a.sent();
                    return [4 /*yield*/, (0, exports.decryptStringAesEcb)(encryptedString, key)];
                case 2:
                    decrypted = _a.sent();
                    return [2 /*return*/, decrypted];
            }
        });
    });
};
exports.decrypt = decrypt;
