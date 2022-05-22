"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function (resolve) {
            resolve(value);
        });
    }

    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }

        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }

        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }

        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = {
        label: 0, sent: function () {
            if (t[0] & 1) throw t[1];
            return t[1];
        }, trys: [], ops: []
    }, f, y, t, g;
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
    }), g;

    function verb(n) {
        return function (v) {
            return step([n, v]);
        };
    }

    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {value: op[1], done: false};
                case 5:
                    _.label++;
                    y = op[1];
                    op = [0];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [6, e];
            y = 0;
        } finally {
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {value: op[0] ? op[1] : void 0, done: true};
    }
};
Object.defineProperty(exports, "__esModule", {value: true});
exports.getPeerIdFromPublicKeyPem = exports.getKeyPairFromPrivateKeyPem = exports.getPublicKeyPemFromPrivateKeyPem = exports.getIpfsKeyFromPrivateKeyPem = exports.getPlebbitAddressFromPrivateKeyPem = exports.generatePrivateKeyPem = void 0;
var libp2pCrypto = require("libp2p-crypto");
var cborg = require("cborg");
var PeerId = require("peer-id");
var jose = require("jose");
var assert = require("assert");
var uint8ArrayFromString = require("uint8arrays/from-string").fromString;
var uint8ArrayToString = require("uint8arrays/to-string").toString;
var generatePrivateKeyPem = function () {
    return __awaiter(void 0, void 0, void 0, function () {
        var keyPair, privateKeyPem;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    return [4 /*yield*/, generateKeyPair()];
                case 1:
                    keyPair = _a.sent();
                    return [4 /*yield*/, getPrivateKeyPemFromKeyPair(keyPair)];
                case 2:
                    privateKeyPem = _a.sent();
                    return [2 /*return*/, privateKeyPem.trim()];
            }
        });
    });
};
exports.generatePrivateKeyPem = generatePrivateKeyPem;
var getPlebbitAddressFromPrivateKeyPem = function (privateKeyPem) {
    return __awaiter(void 0, void 0, void 0, function () {
        var peerId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validatePrivateKeyPem(privateKeyPem);
                    return [4 /*yield*/, getPeerIdFromPrivateKeyPem(privateKeyPem)];
                case 1:
                    peerId = _a.sent();
                    return [2 /*return*/, peerId.toB58String().trim()];
            }
        });
    });
};
exports.getPlebbitAddressFromPrivateKeyPem = getPlebbitAddressFromPrivateKeyPem;
var getIpfsKeyFromPrivateKeyPem = function (privateKeyPem, password) {
    if (password === void 0) {
        password = "";
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var keyPair;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validatePrivateKeyPem(privateKeyPem);
                    return [4 /*yield*/, libp2pCrypto.keys.import(privateKeyPem, password)];
                case 1:
                    keyPair = _a.sent();
                    return [2 /*return*/, keyPair.bytes];
            }
        });
    });
};
exports.getIpfsKeyFromPrivateKeyPem = getIpfsKeyFromPrivateKeyPem;
var getPublicKeyPemFromPrivateKeyPem = function (privateKeyPem, password) {
    if (password === void 0) {
        password = "";
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var keyPair, publicKeyPem;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validatePrivateKeyPem(privateKeyPem);
                    return [4 /*yield*/, (0, exports.getKeyPairFromPrivateKeyPem)(privateKeyPem, password)];
                case 1:
                    keyPair = _a.sent();
                    return [4 /*yield*/, getPublicKeyPemFromKeyPair(keyPair)];
                case 2:
                    publicKeyPem = _a.sent();
                    return [2 /*return*/, publicKeyPem.trim()];
            }
        });
    });
};
exports.getPublicKeyPemFromPrivateKeyPem = getPublicKeyPemFromPrivateKeyPem;
var getKeyPairFromPrivateKeyPem = function (privateKeyPem, password) {
    if (password === void 0) {
        password = "";
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var keyPair;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validatePrivateKeyPem(privateKeyPem);
                    return [4 /*yield*/, libp2pCrypto.keys.import(privateKeyPem, password)];
                case 1:
                    keyPair = _a.sent();
                    return [2 /*return*/, keyPair];
            }
        });
    });
};
exports.getKeyPairFromPrivateKeyPem = getKeyPairFromPrivateKeyPem;
var getPeerIdFromPublicKeyPem = function (publicKeyPem) {
    return __awaiter(void 0, void 0, void 0, function () {
        var publicKeyFromPem, jsonWebToken, PublicKeyRsa, publicKeyRsaInstance, peerId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validatePublicKeyPem(publicKeyPem);
                    return [4 /*yield*/, jose.importSPKI(publicKeyPem, "RS256", {extractable: true})];
                case 1:
                    publicKeyFromPem = _a.sent();
                    return [4 /*yield*/, jose.exportJWK(publicKeyFromPem)];
                case 2:
                    jsonWebToken = _a.sent();
                    return [4 /*yield*/, getPublicKeyRsaConstructor()];
                case 3:
                    PublicKeyRsa = _a.sent();
                    publicKeyRsaInstance = new PublicKeyRsa(jsonWebToken);
                    return [4 /*yield*/, PeerId.createFromPubKey(publicKeyRsaInstance.bytes)];
                case 4:
                    peerId = _a.sent();
                    return [2 /*return*/, peerId];
            }
        });
    });
};
exports.getPeerIdFromPublicKeyPem = getPeerIdFromPublicKeyPem;
var generateKeyPair = function () {
    return __awaiter(void 0, void 0, void 0, function () {
        var keyPair;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    return [4 /*yield*/, libp2pCrypto.keys.generateKeyPair("RSA", 2048)];
                case 1:
                    keyPair = _a.sent();
                    return [2 /*return*/, keyPair];
            }
        });
    });
};
var getPrivateKeyPemFromKeyPair = function (keyPair, password) {
    if (password === void 0) {
        password = "";
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var privateKeyPem;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    return [4 /*yield*/, keyPair.export(password, "pkcs-8")];
                case 1:
                    privateKeyPem = _a.sent();
                    return [2 /*return*/, privateKeyPem.trim()];
            }
        });
    });
};
var getPublicKeyPemFromKeyPair = function (keyPair) {
    return __awaiter(void 0, void 0, void 0, function () {
        var publicKeyFromJsonWebToken, publicKeyPem;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    return [4 /*yield*/, jose.importJWK(keyPair._publicKey, "RS256", {extractable: true})];
                case 1:
                    publicKeyFromJsonWebToken = _a.sent();
                    return [4 /*yield*/, jose.exportSPKI(publicKeyFromJsonWebToken)];
                case 2:
                    publicKeyPem = _a.sent();
                    return [2 /*return*/, publicKeyPem.trim()];
            }
        });
    });
};
var publicKeyRsaConstructor;
var getPublicKeyRsaConstructor = function () {
    return __awaiter(void 0, void 0, void 0, function () {
        var keyPair;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!publicKeyRsaConstructor) return [3 /*break*/, 2];
                    return [4 /*yield*/, libp2pCrypto.keys.generateKeyPair("RSA", 2048)];
                case 1:
                    keyPair = _a.sent();
                    // get the constuctor for the PublicKeyRsaInstance
                    publicKeyRsaConstructor = keyPair.public.constructor;
                    _a.label = 2;
                case 2:
                    return [2 /*return*/, publicKeyRsaConstructor];
            }
        });
    });
};
var getPeerIdFromPrivateKeyPem = function (privateKeyPem) {
    return __awaiter(void 0, void 0, void 0, function () {
        var keyPair, peerId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validatePrivateKeyPem(privateKeyPem);
                    return [4 /*yield*/, (0, exports.getKeyPairFromPrivateKeyPem)(privateKeyPem)];
                case 1:
                    keyPair = _a.sent();
                    return [4 /*yield*/, PeerId.createFromPubKey(keyPair.public.bytes)];
                case 2:
                    peerId = _a.sent();
                    return [2 /*return*/, peerId];
            }
        });
    });
};
var validatePrivateKeyPem = function (privateKeyPem) {
    assert(typeof privateKeyPem === "string", "invalid encrypted private key pem '".concat(privateKeyPem, "' not a string"));
    assert(privateKeyPem.startsWith("-----BEGIN ENCRYPTED PRIVATE KEY-----"), "invalid encrypted private key pem '".concat(privateKeyPem, "' not encrypted private key pem"));
};
var validatePublicKeyPem = function (publicKeyPem) {
    assert(typeof publicKeyPem === "string", "invalid public key pem '".concat(publicKeyPem, "' not a string"));
    assert(publicKeyPem.startsWith("-----BEGIN PUBLIC KEY-----"), "invalid public key pem '".concat(publicKeyPem, "' not public key pem"));
};
