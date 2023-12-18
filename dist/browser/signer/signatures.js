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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.verifyPage = exports.verifyChallengeVerification = exports.verifyChallengeAnswer = exports.verifyChallengeMessage = exports.verifyChallengeRequest = exports.verifyCommentUpdate = exports.verifySubplebbit = exports.verifyComment = exports.verifyCommentEdit = exports.verifyVote = exports.signChallengeVerification = exports.signChallengeAnswer = exports.signChallengeMessage = exports.signChallengeRequest = exports.signSubplebbit = exports.signCommentEdit = exports.signVote = exports.signCommentUpdate = exports.signComment = exports.verifyBufferEd25519 = exports.signBufferEd25519 = void 0;
var util_1 = require("./util");
var cborg = __importStar(require("cborg"));
var to_string_1 = require("uint8arrays/to-string");
var from_string_1 = require("uint8arrays/from-string");
var ed = __importStar(require("@noble/ed25519"));
var peer_id_1 = __importDefault(require("peer-id"));
var util_2 = require("../util");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var lodash_1 = __importDefault(require("lodash"));
var errors_1 = require("../errors");
var assert_1 = __importDefault(require("assert"));
var constants_1 = require("./constants");
var constants_2 = require("../constants");
var js_sha256_1 = require("js-sha256");
var isProbablyBuffer = function (arg) { return arg && typeof arg !== "string" && typeof arg !== "number"; };
var signBufferEd25519 = function (bufferToSign, privateKeyBase64) { return __awaiter(void 0, void 0, void 0, function () {
    var privateKeyBuffer, signature;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!isProbablyBuffer(bufferToSign))
                    throw Error("signBufferEd25519 invalid bufferToSign '".concat(bufferToSign, "' not buffer"));
                if (!privateKeyBase64 || typeof privateKeyBase64 !== "string")
                    throw Error("signBufferEd25519 privateKeyBase64 not a string");
                privateKeyBuffer = (0, from_string_1.fromString)(privateKeyBase64, "base64");
                if (privateKeyBuffer.length !== 32)
                    throw Error("verifyBufferEd25519 publicKeyBase64 ed25519 public key length not 32 bytes (".concat(privateKeyBuffer.length, " bytes)"));
                return [4 /*yield*/, ed.sign(bufferToSign, privateKeyBuffer)];
            case 1:
                signature = _a.sent();
                return [2 /*return*/, signature];
        }
    });
}); };
exports.signBufferEd25519 = signBufferEd25519;
var verifyBufferEd25519 = function (bufferToSign, bufferSignature, publicKeyBase64) { return __awaiter(void 0, void 0, void 0, function () {
    var publicKeyBuffer, isValid;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!isProbablyBuffer(bufferToSign))
                    throw Error("verifyBufferEd25519 invalid bufferSignature '".concat(bufferToSign, "' not buffer"));
                if (!isProbablyBuffer(bufferSignature))
                    throw Error("verifyBufferEd25519 invalid bufferSignature '".concat(bufferSignature, "' not buffer"));
                if (!publicKeyBase64 || typeof publicKeyBase64 !== "string")
                    throw Error("verifyBufferEd25519 publicKeyBase64 '".concat(publicKeyBase64, "' not a string"));
                publicKeyBuffer = (0, from_string_1.fromString)(publicKeyBase64, "base64");
                if (publicKeyBuffer.length !== 32)
                    throw Error("verifyBufferEd25519 publicKeyBase64 '".concat(publicKeyBase64, "' ed25519 public key length not 32 bytes (").concat(publicKeyBuffer.length, " bytes)"));
                return [4 /*yield*/, ed.verify(bufferSignature, bufferToSign, publicKeyBuffer)];
            case 1:
                isValid = _a.sent();
                return [2 /*return*/, isValid];
        }
    });
}); };
exports.verifyBufferEd25519 = verifyBufferEd25519;
function _validateAuthorIpns(author, signer, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var derivedAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!plebbit.resolver.isDomain(author.address)) return [3 /*break*/, 1];
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPrivateKey)(signer.privateKey)];
                case 2:
                    derivedAddress = _a.sent();
                    if (derivedAddress !== author.address)
                        (0, util_2.throwWithErrorCode)("ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER", { authorAddress: author.address, signerAddress: derivedAddress });
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function _signJson(signedPropertyNames, publication, signer, log) {
    return __awaiter(this, void 0, void 0, function () {
        var publicationEncoded, signatureData, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, assert_1.default)(signer.publicKey && typeof signer.type === "string" && signer.privateKey, "Signer props need to be defined befoe signing");
                    publicationEncoded = bufferCleanedObject(signedPropertyNames, publication);
                    _a = to_string_1.toString;
                    return [4 /*yield*/, (0, exports.signBufferEd25519)(publicationEncoded, signer.privateKey)];
                case 1:
                    signatureData = _a.apply(void 0, [_b.sent(), "base64"]);
                    return [2 /*return*/, {
                            signature: signatureData,
                            publicKey: signer.publicKey,
                            type: signer.type,
                            signedPropertyNames: signedPropertyNames
                        }];
            }
        });
    });
}
function _signPubsubMsg(signedPropertyNames, msg, signer, log) {
    return __awaiter(this, void 0, void 0, function () {
        var publicationEncoded, signatureData, publicKeyBuffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, assert_1.default)(signer.publicKey && typeof signer.type === "string" && signer.privateKey, "Signer props need to be defined befoe signing");
                    publicationEncoded = bufferCleanedObject(signedPropertyNames, msg);
                    return [4 /*yield*/, (0, exports.signBufferEd25519)(publicationEncoded, signer.privateKey)];
                case 1:
                    signatureData = _a.sent();
                    publicKeyBuffer = (0, from_string_1.fromString)(signer.publicKey, "base64");
                    return [2 /*return*/, {
                            signature: signatureData,
                            publicKey: publicKeyBuffer,
                            type: signer.type,
                            signedPropertyNames: signedPropertyNames
                        }];
            }
        });
    });
}
function signComment(comment, signer, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signComment");
                    return [4 /*yield*/, _validateAuthorIpns(comment.author, signer, plebbit)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, _signJson(constants_1.CommentSignedPropertyNames, comment, signer, log)];
            }
        });
    });
}
exports.signComment = signComment;
function signCommentUpdate(update, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signCommentUpdate");
            // Not sure, should we validate update.authorEdit here?
            return [2 /*return*/, _signJson(constants_1.CommentUpdateSignedPropertyNames, update, signer, log)];
        });
    });
}
exports.signCommentUpdate = signCommentUpdate;
function signVote(vote, signer, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signVote");
                    return [4 /*yield*/, _validateAuthorIpns(vote.author, signer, plebbit)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, _signJson(constants_1.VoteSignedPropertyNames, vote, signer, log)];
            }
        });
    });
}
exports.signVote = signVote;
function signCommentEdit(edit, signer, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signCommentEdit");
                    return [4 /*yield*/, _validateAuthorIpns(edit.author, signer, plebbit)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, _signJson(constants_1.CommentEditSignedPropertyNames, edit, signer, log)];
            }
        });
    });
}
exports.signCommentEdit = signCommentEdit;
function signSubplebbit(subplebbit, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signSubplebbit");
            return [2 /*return*/, _signJson(constants_1.SubplebbitSignedPropertyNames, subplebbit, signer, log)];
        });
    });
}
exports.signSubplebbit = signSubplebbit;
function signChallengeRequest(request, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signChallengeRequest");
            return [2 /*return*/, _signPubsubMsg(constants_1.ChallengeRequestMessageSignedPropertyNames, request, signer, log)];
        });
    });
}
exports.signChallengeRequest = signChallengeRequest;
function signChallengeMessage(challengeMessage, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signChallengeMessage");
            return [2 /*return*/, _signPubsubMsg(constants_1.ChallengeMessageSignedPropertyNames, challengeMessage, signer, log)];
        });
    });
}
exports.signChallengeMessage = signChallengeMessage;
function signChallengeAnswer(challengeAnswer, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signChallengeAnswer");
            return [2 /*return*/, _signPubsubMsg(constants_1.ChallengeAnswerMessageSignedPropertyNames, challengeAnswer, signer, log)];
        });
    });
}
exports.signChallengeAnswer = signChallengeAnswer;
function signChallengeVerification(challengeVerification, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signChallengeVerification");
            return [2 /*return*/, _signPubsubMsg(constants_1.ChallengeVerificationMessageSignedPropertyNames, challengeVerification, signer, log)];
        });
    });
}
exports.signChallengeVerification = signChallengeVerification;
// Verify functions
var _verifyAuthor = function (publicationJson, resolveAuthorAddresses, clientsManager) { return __awaiter(void 0, void 0, void 0, function () {
    var log, derivedAddress, resolvedAuthorAddress, authorPeerId, signaturePeerId, _a;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                log = (0, plebbit_logger_1.default)("plebbit-js:signatures:verifyAuthor");
                return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPublicKey)(publicationJson.signature.publicKey)];
            case 1:
                derivedAddress = _c.sent();
                if (!((_b = publicationJson.author) === null || _b === void 0 ? void 0 : _b.address))
                    return [2 /*return*/, { useDerivedAddress: true, reason: errors_1.messages.ERR_AUTHOR_ADDRESS_UNDEFINED, derivedAddress: derivedAddress }];
                if (!publicationJson.author.address.includes(".")) return [3 /*break*/, 3];
                if (!resolveAuthorAddresses)
                    return [2 /*return*/, { useDerivedAddress: false }];
                return [4 /*yield*/, clientsManager.resolveAuthorAddressIfNeeded(publicationJson.author.address)];
            case 2:
                resolvedAuthorAddress = _c.sent();
                if (resolvedAuthorAddress !== derivedAddress) {
                    // Means plebbit-author-address text record is resolving to another address (outdated?)
                    // Will always use address derived from publication.signature.publicKey as truth
                    log.error("author address (".concat(publicationJson.author.address, ") resolved address (").concat(resolvedAuthorAddress, ") is invalid"));
                    return [2 /*return*/, { useDerivedAddress: true, derivedAddress: derivedAddress, reason: errors_1.messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE }];
                }
                return [3 /*break*/, 8];
            case 3:
                authorPeerId = void 0, signaturePeerId = void 0;
                try {
                    authorPeerId = peer_id_1.default.createFromB58String(publicationJson.author.address);
                }
                catch (_d) {
                    return [2 /*return*/, { useDerivedAddress: true, reason: errors_1.messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58, derivedAddress: derivedAddress }];
                }
                _c.label = 4;
            case 4:
                _c.trys.push([4, 6, , 7]);
                return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKey)(publicationJson.signature.publicKey)];
            case 5:
                signaturePeerId = _c.sent();
                return [3 /*break*/, 7];
            case 6:
                _a = _c.sent();
                return [2 /*return*/, { useDerivedAddress: false, reason: errors_1.messages.ERR_SIGNATURE_PUBLIC_KEY_IS_NOT_B58 }];
            case 7:
                if (!signaturePeerId.equals(authorPeerId))
                    return [2 /*return*/, { useDerivedAddress: true, reason: errors_1.messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE, derivedAddress: derivedAddress }];
                _c.label = 8;
            case 8: 
            // Author
            return [2 /*return*/, { useDerivedAddress: false }];
        }
    });
}); };
// DO NOT MODIFY THIS FUNCTION, OTHERWISE YOU RISK BREAKING BACKWARD COMPATIBILITY
var bufferCleanedObject = function (signedPropertyNames, objectToSign) {
    var propsToSign = (0, util_2.removeNullAndUndefinedValuesRecursively)(lodash_1.default.pick(objectToSign, signedPropertyNames));
    var bufferToSign = cborg.encode(propsToSign);
    return bufferToSign;
};
// DO NOT MODIFY THIS FUNCTION, OTHERWISE YOU RISK BREAKING BACKWARD COMPATIBILITY
var _verifyJsonSignature = function (publicationToBeVerified) { return __awaiter(void 0, void 0, void 0, function () {
    var propsToSign, _i, _a, propertyName, signatureIsValid;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                propsToSign = {};
                for (_i = 0, _a = publicationToBeVerified.signature.signedPropertyNames; _i < _a.length; _i++) {
                    propertyName = _a[_i];
                    if (publicationToBeVerified[propertyName] !== undefined && publicationToBeVerified[propertyName] !== null) {
                        propsToSign[propertyName] = publicationToBeVerified[propertyName];
                    }
                }
                return [4 /*yield*/, (0, exports.verifyBufferEd25519)(cborg.encode(propsToSign), (0, from_string_1.fromString)(publicationToBeVerified.signature.signature, "base64"), publicationToBeVerified.signature.publicKey)];
            case 1:
                signatureIsValid = _b.sent();
                return [2 /*return*/, signatureIsValid];
        }
    });
}); };
// DO NOT MODIFY THIS FUNCTION, OTHERWISE YOU RISK BREAKING BACKWARD COMPATIBILITY
var _verifyPubsubSignature = function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var propsToSign, _i, _a, propertyName, publicKeyBase64, signatureIsValid;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                propsToSign = {};
                for (_i = 0, _a = msg.signature.signedPropertyNames; _i < _a.length; _i++) {
                    propertyName = _a[_i];
                    if (msg[propertyName] !== undefined && msg[propertyName] !== null) {
                        propsToSign[propertyName] = msg[propertyName];
                    }
                }
                publicKeyBase64 = (0, to_string_1.toString)(msg.signature.publicKey, "base64");
                return [4 /*yield*/, (0, exports.verifyBufferEd25519)(cborg.encode(propsToSign), msg.signature.signature, publicKeyBase64)];
            case 1:
                signatureIsValid = _b.sent();
                return [2 /*return*/, signatureIsValid];
        }
    });
}); };
var _verifyPublicationWithAuthor = function (publicationJson, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid) { return __awaiter(void 0, void 0, void 0, function () {
    var log, authorSignatureValidity, signatureValidity, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                log = (0, plebbit_logger_1.default)("plebbit-js:signatures:verifyPublicationWithAUthor");
                return [4 /*yield*/, _verifyAuthor(publicationJson, resolveAuthorAddresses, clientsManager)];
            case 1:
                authorSignatureValidity = _a.sent();
                if (authorSignatureValidity.useDerivedAddress && !overrideAuthorAddressIfInvalid)
                    return [2 /*return*/, { valid: false, reason: authorSignatureValidity.reason }];
                return [4 /*yield*/, _verifyJsonSignature(publicationJson)];
            case 2:
                signatureValidity = _a.sent();
                if (!signatureValidity)
                    return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SIGNATURE_IS_INVALID }];
                if (overrideAuthorAddressIfInvalid && authorSignatureValidity.useDerivedAddress) {
                    log("Will override publication.author.address (".concat(publicationJson.author.address, ") with signer address (").concat(authorSignatureValidity.derivedAddress, ")"));
                    publicationJson.author.address = authorSignatureValidity.derivedAddress;
                }
                res = { valid: true };
                if (authorSignatureValidity.derivedAddress)
                    res.derivedAddress = authorSignatureValidity.derivedAddress;
                return [2 /*return*/, res];
        }
    });
}); };
function verifyVote(vote, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _verifyPublicationWithAuthor(vote, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid)];
                case 1:
                    res = _a.sent();
                    if (!res.valid)
                        return [2 /*return*/, res];
                    return [2 /*return*/, { valid: true }];
            }
        });
    });
}
exports.verifyVote = verifyVote;
function verifyCommentEdit(edit, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _verifyPublicationWithAuthor(edit, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid)];
                case 1:
                    res = _a.sent();
                    if (!res.valid)
                        return [2 /*return*/, res];
                    return [2 /*return*/, { valid: true }];
            }
        });
    });
}
exports.verifyCommentEdit = verifyCommentEdit;
function verifyComment(comment, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid) {
    return __awaiter(this, void 0, void 0, function () {
        var validation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _verifyPublicationWithAuthor(comment, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid)];
                case 1:
                    validation = _a.sent();
                    if (!validation.valid)
                        return [2 /*return*/, validation];
                    return [2 /*return*/, validation];
            }
        });
    });
}
exports.verifyComment = verifyComment;
function verifySubplebbit(subplebbit, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var log, signatureValidity, cacheKey, _i, _b, pageSortName, pageValidity, resolvedSubAddress, subPeerId, signaturePeerId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    log = (0, plebbit_logger_1.default)("plebbit-js:signatures:verifySubplebbit");
                    return [4 /*yield*/, _verifyJsonSignature(subplebbit)];
                case 1:
                    signatureValidity = _c.sent();
                    if (!signatureValidity)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SIGNATURE_IS_INVALID }];
                    cacheKey = (0, js_sha256_1.sha256)(subplebbit.signature.signature + resolveAuthorAddresses + overrideAuthorAddressIfInvalid);
                    if (constants_2.subplebbitVerificationCache.has(cacheKey))
                        return [2 /*return*/, { valid: true }];
                    if (!((_a = subplebbit.posts) === null || _a === void 0 ? void 0 : _a.pages)) return [3 /*break*/, 5];
                    _i = 0, _b = Object.keys(subplebbit.posts.pages);
                    _c.label = 2;
                case 2:
                    if (!(_i < _b.length)) return [3 /*break*/, 5];
                    pageSortName = _b[_i];
                    return [4 /*yield*/, verifyPage(subplebbit.posts.pageCids[pageSortName], subplebbit.posts.pages[pageSortName], resolveAuthorAddresses, clientsManager, subplebbit.address, undefined, overrideAuthorAddressIfInvalid)];
                case 3:
                    pageValidity = _c.sent();
                    if (!pageValidity.valid) {
                        log.error("Subplebbit (".concat(subplebbit.address, ") page (").concat(pageSortName, " - ").concat(subplebbit.posts.pageCids[pageSortName], ") has an invalid signature due to reason (").concat(pageValidity.reason, ")"));
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SUBPLEBBIT_POSTS_INVALID }];
                    }
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, clientsManager.resolveSubplebbitAddressIfNeeded(subplebbit.address)];
                case 6:
                    resolvedSubAddress = _c.sent();
                    if (!resolvedSubAddress)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY }];
                    subPeerId = peer_id_1.default.createFromB58String(resolvedSubAddress);
                    return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKey)(subplebbit.signature.publicKey)];
                case 7:
                    signaturePeerId = _c.sent();
                    if (!subPeerId.equals(signaturePeerId))
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY }];
                    constants_2.subplebbitVerificationCache.set(cacheKey, true);
                    return [2 /*return*/, { valid: true }];
            }
        });
    });
}
exports.verifySubplebbit = verifySubplebbit;
function _getJsonValidationResult(publication) {
    return __awaiter(this, void 0, void 0, function () {
        var signatureValidity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _verifyJsonSignature(publication)];
                case 1:
                    signatureValidity = _a.sent();
                    if (!signatureValidity)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SIGNATURE_IS_INVALID }];
                    return [2 /*return*/, { valid: true }];
            }
        });
    });
}
function _getBinaryValidationResult(publication) {
    return __awaiter(this, void 0, void 0, function () {
        var signatureValidity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _verifyPubsubSignature(publication)];
                case 1:
                    signatureValidity = _a.sent();
                    if (!signatureValidity)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SIGNATURE_IS_INVALID }];
                    return [2 /*return*/, { valid: true }];
            }
        });
    });
}
function verifyCommentUpdate(update, resolveAuthorAddresses, clientsManager, subplebbitAddress, comment, overrideAuthorAddressIfInvalid) {
    return __awaiter(this, void 0, void 0, function () {
        var log, jsonValidation, cacheKey, editSignatureValidation, pagesValidity, invalidPageValidity, updateSignatureAddress, subplebbitResolvedAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log = (0, plebbit_logger_1.default)("plebbit-js:signatures:verifyCommentUpdate");
                    return [4 /*yield*/, _getJsonValidationResult(update)];
                case 1:
                    jsonValidation = _a.sent();
                    if (!jsonValidation.valid)
                        return [2 /*return*/, jsonValidation];
                    cacheKey = (0, js_sha256_1.sha256)(update.signature.signature + resolveAuthorAddresses + subplebbitAddress + JSON.stringify(comment) + overrideAuthorAddressIfInvalid);
                    if (constants_2.commentUpdateVerificationCache.has(cacheKey))
                        return [2 /*return*/, { valid: true }];
                    if (!update.edit) return [3 /*break*/, 3];
                    if (update.edit.signature.publicKey !== comment.signature.publicKey)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR }];
                    return [4 /*yield*/, _getJsonValidationResult(update.edit)];
                case 2:
                    editSignatureValidation = _a.sent();
                    if (!editSignatureValidation.valid)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SIGNATURE_IS_INVALID }];
                    _a.label = 3;
                case 3:
                    if (update.cid !== comment.cid)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_COMMENT_UPDATE_DIFFERENT_CID_THAN_COMMENT }];
                    if (!update.replies) return [3 /*break*/, 5];
                    return [4 /*yield*/, Promise.all(Object.keys(update.replies.pages).map(function (sortName) {
                            return verifyPage(update.replies.pageCids[sortName], update.replies.pages[sortName], resolveAuthorAddresses, clientsManager, subplebbitAddress, comment.cid, overrideAuthorAddressIfInvalid);
                        }))];
                case 4:
                    pagesValidity = _a.sent();
                    invalidPageValidity = pagesValidity.find(function (validity) { return !validity.valid; });
                    if (invalidPageValidity)
                        return [2 /*return*/, invalidPageValidity];
                    _a.label = 5;
                case 5: return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPublicKey)(update.signature.publicKey)];
                case 6:
                    updateSignatureAddress = _a.sent();
                    return [4 /*yield*/, clientsManager.resolveSubplebbitAddressIfNeeded(subplebbitAddress)];
                case 7:
                    subplebbitResolvedAddress = _a.sent();
                    if (updateSignatureAddress !== subplebbitResolvedAddress) {
                        log.error("Comment (".concat(update.cid, "), CommentUpdate's signature address (").concat(updateSignatureAddress, ") is not the same as the B58 address of the subplebbit (").concat(subplebbitResolvedAddress, ")"));
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT }];
                    }
                    constants_2.commentUpdateVerificationCache.set(cacheKey, true);
                    return [2 /*return*/, { valid: true }];
            }
        });
    });
}
exports.verifyCommentUpdate = verifyCommentUpdate;
// -5 mins
function _minimumTimestamp() {
    return (0, util_2.timestamp)() - 5 * 60;
}
// +5mins
function _maximumTimestamp() {
    return (0, util_2.timestamp)() + 5 * 60;
}
function _validateChallengeRequestId(msg) {
    return __awaiter(this, void 0, void 0, function () {
        var signaturePublicKeyPeerId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKeyBuffer)(msg.signature.publicKey)];
                case 1:
                    signaturePublicKeyPeerId = _a.sent();
                    if (!signaturePublicKeyPeerId.equals(msg.challengeRequestId))
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_CHALLENGE_REQUEST_ID_NOT_DERIVED_FROM_SIGNATURE }];
                    else
                        return [2 /*return*/, { valid: true }];
                    return [2 /*return*/];
            }
        });
    });
}
function verifyChallengeRequest(request, validateTimestampRange) {
    return __awaiter(this, void 0, void 0, function () {
        var idValid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _validateChallengeRequestId(request)];
                case 1:
                    idValid = _a.sent();
                    if (!idValid.valid)
                        return [2 /*return*/, idValid];
                    if ((validateTimestampRange && _minimumTimestamp() > request.timestamp) || _maximumTimestamp() < request.timestamp)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_PUBSUB_MSG_TIMESTAMP_IS_OUTDATED }];
                    return [2 /*return*/, _getBinaryValidationResult(request)];
            }
        });
    });
}
exports.verifyChallengeRequest = verifyChallengeRequest;
function verifyChallengeMessage(challenge, pubsubTopic, validateTimestampRange) {
    return __awaiter(this, void 0, void 0, function () {
        var msgSignerAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPublicKeyBuffer)(challenge.signature.publicKey)];
                case 1:
                    msgSignerAddress = _a.sent();
                    if (msgSignerAddress !== pubsubTopic)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_CHALLENGE_MSG_SIGNER_IS_NOT_SUBPLEBBIT }];
                    if ((validateTimestampRange && _minimumTimestamp() > challenge.timestamp) || _maximumTimestamp() < challenge.timestamp)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_PUBSUB_MSG_TIMESTAMP_IS_OUTDATED }];
                    return [2 /*return*/, _getBinaryValidationResult(challenge)];
            }
        });
    });
}
exports.verifyChallengeMessage = verifyChallengeMessage;
function verifyChallengeAnswer(answer, validateTimestampRange) {
    return __awaiter(this, void 0, void 0, function () {
        var idValid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _validateChallengeRequestId(answer)];
                case 1:
                    idValid = _a.sent();
                    if (!idValid.valid)
                        return [2 /*return*/, idValid];
                    if ((validateTimestampRange && _minimumTimestamp() > answer.timestamp) || _maximumTimestamp() < answer.timestamp)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_PUBSUB_MSG_TIMESTAMP_IS_OUTDATED }];
                    return [2 /*return*/, _getBinaryValidationResult(answer)];
            }
        });
    });
}
exports.verifyChallengeAnswer = verifyChallengeAnswer;
function verifyChallengeVerification(verification, pubsubTopic, validateTimestampRange) {
    return __awaiter(this, void 0, void 0, function () {
        var msgSignerAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPublicKeyBuffer)(verification.signature.publicKey)];
                case 1:
                    msgSignerAddress = _a.sent();
                    if (msgSignerAddress !== pubsubTopic)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_CHALLENGE_VERIFICATION_MSG_SIGNER_IS_NOT_SUBPLEBBIT }];
                    if ((validateTimestampRange && _minimumTimestamp() > verification.timestamp) || _maximumTimestamp() < verification.timestamp)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_PUBSUB_MSG_TIMESTAMP_IS_OUTDATED }];
                    return [2 /*return*/, _getBinaryValidationResult(verification)];
            }
        });
    });
}
exports.verifyChallengeVerification = verifyChallengeVerification;
function verifyPage(pageCid, page, resolveAuthorAddresses, clientsManager, subplebbitAddress, parentCommentCid, overrideAuthorAddressIfInvalid) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, shouldCache, _i, _a, pageComment, commentSignatureValidity, commentUpdateSignatureValidity;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cacheKey = (0, js_sha256_1.sha256)(pageCid + resolveAuthorAddresses + overrideAuthorAddressIfInvalid + subplebbitAddress + parentCommentCid);
                    if (constants_2.pageVerificationCache.has(cacheKey))
                        return [2 /*return*/, { valid: true }];
                    shouldCache = true;
                    _i = 0, _a = page.comments;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    pageComment = _a[_i];
                    if (pageComment.comment.subplebbitAddress !== subplebbitAddress)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB }];
                    if (parentCommentCid !== pageComment.comment.parentCid)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_PARENT_CID_NOT_AS_EXPECTED }];
                    return [4 /*yield*/, verifyComment(pageComment.comment, resolveAuthorAddresses, clientsManager, overrideAuthorAddressIfInvalid)];
                case 2:
                    commentSignatureValidity = _b.sent();
                    if (!commentSignatureValidity.valid)
                        return [2 /*return*/, commentSignatureValidity];
                    if (commentSignatureValidity.derivedAddress)
                        shouldCache = false;
                    return [4 /*yield*/, verifyCommentUpdate(pageComment.update, resolveAuthorAddresses, clientsManager, subplebbitAddress, pageComment.comment, overrideAuthorAddressIfInvalid)];
                case 3:
                    commentUpdateSignatureValidity = _b.sent();
                    if (!commentUpdateSignatureValidity.valid)
                        return [2 /*return*/, commentUpdateSignatureValidity];
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    if (shouldCache)
                        constants_2.pageVerificationCache.set(cacheKey, true);
                    return [2 /*return*/, { valid: true }];
            }
        });
    });
}
exports.verifyPage = verifyPage;
//# sourceMappingURL=signatures.js.map