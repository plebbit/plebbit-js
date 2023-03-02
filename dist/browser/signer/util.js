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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeerIdFromPublicKey = exports.getPeerIdFromPrivateKey = exports.getPublicKeyFromPrivateKey = exports.getIpfsKeyFromPrivateKey = exports.getPlebbitAddressFromPublicKey = exports.getPlebbitAddressFromPrivateKey = exports.generatePrivateKey = void 0;
// NOTE: Ed25519PublicKey, Ed25519PrivateKey are not public apis, could break when upgrading libp2p-crypto
var _a = require('libp2p-crypto/src/keys/ed25519-class'), Ed25519PublicKey = _a.Ed25519PublicKey, Ed25519PrivateKey = _a.Ed25519PrivateKey;
var PeerId = require("peer-id");
var ed = require('@noble/ed25519');
var uint8ArrayFromString = require('uint8arrays/from-string').fromString;
var uint8ArrayToString = require('uint8arrays/to-string').toString;
var generatePrivateKey = function () { return __awaiter(void 0, void 0, void 0, function () {
    var privateKeyBuffer, privateKeyBase64;
    return __generator(this, function (_a) {
        privateKeyBuffer = ed.utils.randomPrivateKey();
        privateKeyBase64 = uint8ArrayToString(privateKeyBuffer, 'base64');
        return [2 /*return*/, privateKeyBase64];
    });
}); };
exports.generatePrivateKey = generatePrivateKey;
var getPlebbitAddressFromPrivateKey = function (privateKeyBase64) { return __awaiter(void 0, void 0, void 0, function () {
    var peerId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getPeerIdFromPrivateKey)(privateKeyBase64)];
            case 1:
                peerId = _a.sent();
                return [2 /*return*/, peerId.toB58String().trim()];
        }
    });
}); };
exports.getPlebbitAddressFromPrivateKey = getPlebbitAddressFromPrivateKey;
var getPlebbitAddressFromPublicKey = function (publicKeyBase64) { return __awaiter(void 0, void 0, void 0, function () {
    var peerId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getPeerIdFromPublicKey)(publicKeyBase64)];
            case 1:
                peerId = _a.sent();
                return [2 /*return*/, peerId.toB58String().trim()];
        }
    });
}); };
exports.getPlebbitAddressFromPublicKey = getPlebbitAddressFromPublicKey;
var getIpfsKeyFromPrivateKey = function (privateKeyBase64) { return __awaiter(void 0, void 0, void 0, function () {
    var privateKeyBuffer, publicKeyBuffer, privateAndPublicKeyBuffer, ed25519PrivateKeyInstance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!privateKeyBase64 || typeof privateKeyBase64 !== 'string')
                    throw Error("getIpfsKeyFromPrivateKey privateKeyBase64 not a string");
                try {
                    privateKeyBuffer = uint8ArrayFromString(privateKeyBase64, 'base64');
                }
                catch (e) {
                    e.message = "getIpfsKeyFromPrivateKey privateKeyBase64 invalid: ".concat(e.message);
                    throw e;
                }
                if (privateKeyBuffer.length !== 32)
                    throw Error("getIpfsKeyFromPrivateKey privateKeyBase64 ed25519 private key length not 32 bytes (".concat(privateKeyBuffer.length, " bytes)"));
                return [4 /*yield*/, ed.getPublicKey(privateKeyBuffer)
                    // ipfs ed25519 private keys format are private (32 bytes) + public (32 bytes) (64 bytes total)
                ];
            case 1:
                publicKeyBuffer = _a.sent();
                privateAndPublicKeyBuffer = new Uint8Array(64);
                privateAndPublicKeyBuffer.set(privateKeyBuffer);
                privateAndPublicKeyBuffer.set(publicKeyBuffer, 32);
                ed25519PrivateKeyInstance = new Ed25519PrivateKey(privateAndPublicKeyBuffer, publicKeyBuffer);
                // the "ipfs key" adds a suffix, then the private key, then the public key, it is not the raw private key
                return [2 /*return*/, ed25519PrivateKeyInstance.bytes];
        }
    });
}); };
exports.getIpfsKeyFromPrivateKey = getIpfsKeyFromPrivateKey;
var getPublicKeyFromPrivateKey = function (privateKeyBase64) { return __awaiter(void 0, void 0, void 0, function () {
    var privateKeyBuffer, publicKeyBuffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!privateKeyBase64 || typeof privateKeyBase64 !== 'string')
                    throw Error("getPublicKeyFromPrivateKey privateKeyBase64 not a string");
                try {
                    privateKeyBuffer = uint8ArrayFromString(privateKeyBase64, 'base64');
                }
                catch (e) {
                    e.message = "getPublicKeyFromPrivateKey privateKeyBase64 invalid: ".concat(e.message);
                    throw e;
                }
                if (privateKeyBuffer.length !== 32)
                    throw Error("getPublicKeyFromPrivateKey privateKeyBase64 ed25519 private key length not 32 bytes (".concat(privateKeyBuffer.length, " bytes)"));
                return [4 /*yield*/, ed.getPublicKey(privateKeyBuffer)];
            case 1:
                publicKeyBuffer = _a.sent();
                return [2 /*return*/, uint8ArrayToString(publicKeyBuffer, 'base64')];
        }
    });
}); };
exports.getPublicKeyFromPrivateKey = getPublicKeyFromPrivateKey;
var getPeerIdFromPrivateKey = function (privateKeyBase64) { return __awaiter(void 0, void 0, void 0, function () {
    var ipfsKey, peerId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getIpfsKeyFromPrivateKey)(privateKeyBase64)
                // the PeerId private key is not a raw private key, it's an "ipfs key"
            ];
            case 1:
                ipfsKey = _a.sent();
                return [4 /*yield*/, PeerId.createFromPrivKey(ipfsKey)];
            case 2:
                peerId = _a.sent();
                return [2 /*return*/, peerId];
        }
    });
}); };
exports.getPeerIdFromPrivateKey = getPeerIdFromPrivateKey;
var getPeerIdFromPublicKey = function (publicKeyBase64) { return __awaiter(void 0, void 0, void 0, function () {
    var publicKeyBuffer, ed25519PublicKeyInstance, peerId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!publicKeyBase64 || typeof publicKeyBase64 !== 'string')
                    throw Error("getPeerIdFromPublicKey publicKeyBase64 '".concat(publicKeyBase64, "' not a string"));
                try {
                    publicKeyBuffer = uint8ArrayFromString(publicKeyBase64, 'base64');
                }
                catch (e) {
                    e.message = "getPeerIdFromPublicKey publicKeyBase64 invalid: ".concat(e.message);
                    throw e;
                }
                if (publicKeyBuffer.length !== 32)
                    throw Error("getPeerIdFromPublicKey publicKeyBase64 '".concat(publicKeyBase64, "' ed25519 public key length not 32 bytes (").concat(publicKeyBuffer.length, " bytes)"));
                ed25519PublicKeyInstance = new Ed25519PublicKey(publicKeyBuffer);
                return [4 /*yield*/, PeerId.createFromPubKey(ed25519PublicKeyInstance.bytes)];
            case 1:
                peerId = _a.sent();
                return [2 /*return*/, peerId];
        }
    });
}); };
exports.getPeerIdFromPublicKey = getPeerIdFromPublicKey;
