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
exports.verifyPage = exports.verifyChallengeVerification = exports.verifyChallengeAnswer = exports.verifyChallengeMessage = exports.verifyChallengeRequest = exports.verifyCommentUpdate = exports.verifySubplebbit = exports.verifyComment = exports.verifyCommentEdit = exports.verifyVote = exports.signChallengeVerification = exports.signChallengeAnswer = exports.signChallengeMessage = exports.signChallengeRequest = exports.signSubplebbit = exports.signCommentUpdate = exports.signCommentEdit = exports.signVote = exports.signComment = exports.verifyBufferEd25519 = exports.signBufferEd25519 = void 0;
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
function _sign(signedPropertyNames, publication, signer, log) {
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
                    return [2 /*return*/, _sign(constants_1.CommentSignedPropertyNames, comment, signer, log)];
            }
        });
    });
}
exports.signComment = signComment;
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
                    return [2 /*return*/, _sign(constants_1.VoteSignedPropertyNames, vote, signer, log)];
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
                    return [2 /*return*/, _sign(constants_1.CommentEditSignedPropertyNames, edit, signer, log)];
            }
        });
    });
}
exports.signCommentEdit = signCommentEdit;
function signCommentUpdate(update, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signCommentUpdate");
            // Not sure, should we validate update.authorEdit here?
            return [2 /*return*/, _sign(constants_1.CommentUpdateSignedPropertyNames, update, signer, log)];
        });
    });
}
exports.signCommentUpdate = signCommentUpdate;
function signSubplebbit(subplebbit, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signSubplebbit");
            return [2 /*return*/, _sign(constants_1.SubplebbitSignedPropertyNames, subplebbit, signer, log)];
        });
    });
}
exports.signSubplebbit = signSubplebbit;
function signChallengeRequest(request, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signChallengeRequest");
            return [2 /*return*/, _sign(constants_1.ChallengeRequestMessageSignedPropertyNames, request, signer, log)];
        });
    });
}
exports.signChallengeRequest = signChallengeRequest;
function signChallengeMessage(challengeMessage, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signChallengeMessage");
            return [2 /*return*/, _sign(constants_1.ChallengeMessageSignedPropertyNames, challengeMessage, signer, log)];
        });
    });
}
exports.signChallengeMessage = signChallengeMessage;
function signChallengeAnswer(challengeAnswer, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signChallengeAnswer");
            return [2 /*return*/, _sign(constants_1.ChallengeAnswerMessageSignedPropertyNames, challengeAnswer, signer, log)];
        });
    });
}
exports.signChallengeAnswer = signChallengeAnswer;
function signChallengeVerification(challengeVerification, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signChallengeVerification");
            return [2 /*return*/, _sign(constants_1.ChallengeVerificationMessageSignedPropertyNames, challengeVerification, signer, log)];
        });
    });
}
exports.signChallengeVerification = signChallengeVerification;
// Verify functions
var _verifyAuthor = function (publicationJson, plebbit) { return __awaiter(void 0, void 0, void 0, function () {
    var log, resolvedAuthorAddress, derivedAddress, authorPeerId, signaturePeerId, _a;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                log = (0, plebbit_logger_1.default)("plebbit-js:signatures:verifyAuthor");
                if (!((_b = publicationJson.author) === null || _b === void 0 ? void 0 : _b.address))
                    return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_AUTHOR_ADDRESS_UNDEFINED }];
                if (!plebbit.resolver.isDomain(publicationJson.author.address)) return [3 /*break*/, 3];
                if (!plebbit.resolveAuthorAddresses)
                    return [2 /*return*/, { valid: true }]; // Skip domain validation if plebbit.resolveAuthorAddresses=false
                return [4 /*yield*/, plebbit.resolver.resolveAuthorAddressIfNeeded(publicationJson.author.address)];
            case 1:
                resolvedAuthorAddress = _c.sent();
                return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPublicKey)(publicationJson.signature.publicKey)];
            case 2:
                derivedAddress = _c.sent();
                if (resolvedAuthorAddress !== derivedAddress) {
                    // Means plebbit-author-address text record is resolving to another address (outdated?)
                    // Will always use address derived from publication.signature.publicKey as truth
                    log.error("domain (".concat(publicationJson.author.address, ") resolved address (").concat(resolvedAuthorAddress, ") is invalid, changing publication.author.address to derived address ").concat(derivedAddress));
                    return [2 /*return*/, { valid: true, newAddress: derivedAddress }];
                }
                return [3 /*break*/, 6];
            case 3:
                _c.trys.push([3, 5, , 6]);
                authorPeerId = peer_id_1.default.createFromB58String(publicationJson.author.address);
                return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKey)(publicationJson.signature.publicKey)];
            case 4:
                signaturePeerId = _c.sent();
                if (!signaturePeerId.equals(authorPeerId))
                    return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE }];
                return [3 /*break*/, 6];
            case 5:
                _a = _c.sent();
                return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_B58 }];
            case 6: 
            // Author
            return [2 /*return*/, { valid: true }];
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
var _verifyPublicationSignature = function (publicationToBeVerified) { return __awaiter(void 0, void 0, void 0, function () {
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
var _verifyPublicationWithAuthor = function (publicationJson, plebbit, overrideAuthorAddressIfInvalid) { return __awaiter(void 0, void 0, void 0, function () {
    var authorSignatureValidity, signatureValidity;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, _verifyAuthor(publicationJson, plebbit)];
            case 1:
                authorSignatureValidity = _a.sent();
                if (!authorSignatureValidity.valid)
                    return [2 /*return*/, { valid: false, reason: authorSignatureValidity.reason }];
                if (!overrideAuthorAddressIfInvalid && authorSignatureValidity.newAddress)
                    return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE }];
                return [4 /*yield*/, _verifyPublicationSignature(publicationJson)];
            case 2:
                signatureValidity = _a.sent();
                if (!signatureValidity)
                    return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SIGNATURE_IS_INVALID }];
                if (authorSignatureValidity === null || authorSignatureValidity === void 0 ? void 0 : authorSignatureValidity.newAddress)
                    return [2 /*return*/, { valid: true, newAddress: authorSignatureValidity.newAddress }];
                return [2 /*return*/, { valid: true }];
        }
    });
}); };
function verifyVote(vote, plebbit, overrideAuthorAddressIfInvalid) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _verifyPublicationWithAuthor(vote, plebbit, overrideAuthorAddressIfInvalid)];
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
function verifyCommentEdit(edit, plebbit, overrideAuthorAddressIfInvalid) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _verifyPublicationWithAuthor(edit, plebbit, overrideAuthorAddressIfInvalid)];
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
function verifyComment(comment, plebbit, overrideAuthorAddressIfInvalid) {
    return __awaiter(this, void 0, void 0, function () {
        var validation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, assert_1.default)(!comment["updatedAt"], "This function should be used for comments with no CommentUpdate. Use verifyCommentWithUpdate instead");
                    return [4 /*yield*/, _verifyPublicationWithAuthor(comment, plebbit, overrideAuthorAddressIfInvalid)];
                case 1:
                    validation = _a.sent();
                    if (!validation.valid)
                        return [2 /*return*/, validation];
                    if (validation.newAddress)
                        comment.author.address = validation.newAddress;
                    return [2 /*return*/, { valid: true }];
            }
        });
    });
}
exports.verifyComment = verifyComment;
function verifySubplebbit(subplebbit, plebbit) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var _i, _b, page, pageValidity, signatureValidity, resolvedSubAddress, subPeerId, signaturePeerId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!((_a = subplebbit.posts) === null || _a === void 0 ? void 0 : _a.pages)) return [3 /*break*/, 4];
                    _i = 0, _b = Object.values(subplebbit.posts.pages);
                    _c.label = 1;
                case 1:
                    if (!(_i < _b.length)) return [3 /*break*/, 4];
                    page = _b[_i];
                    return [4 /*yield*/, verifyPage(lodash_1.default.cloneDeep(page), plebbit, subplebbit, undefined)];
                case 2:
                    pageValidity = _c.sent();
                    if (!pageValidity.valid)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SUBPLEBBIT_POSTS_INVALID }];
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, _verifyPublicationSignature(subplebbit)];
                case 5:
                    signatureValidity = _c.sent();
                    if (!signatureValidity)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SIGNATURE_IS_INVALID }];
                    return [4 /*yield*/, plebbit.resolver.resolveSubplebbitAddressIfNeeded(subplebbit.address)];
                case 6:
                    resolvedSubAddress = _c.sent();
                    subPeerId = peer_id_1.default.createFromB58String(resolvedSubAddress);
                    return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKey)(subplebbit.signature.publicKey)];
                case 7:
                    signaturePeerId = _c.sent();
                    if (!subPeerId.equals(signaturePeerId))
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SUBPLEBBIT_ADDRESS_DOES_NOT_MATCH_PUBLIC_KEY }];
                    return [2 /*return*/, { valid: true }];
            }
        });
    });
}
exports.verifySubplebbit = verifySubplebbit;
function _getValidationResult(publication) {
    return __awaiter(this, void 0, void 0, function () {
        var signatureValidity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _verifyPublicationSignature(publication)];
                case 1:
                    signatureValidity = _a.sent();
                    if (!signatureValidity)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SIGNATURE_IS_INVALID }];
                    return [2 /*return*/, { valid: true }];
            }
        });
    });
}
function verifyCommentUpdate(update, subplebbit, comment, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var updateSignatureAddress, subplebbitResolvedAddress, pagesValidity, invalidPageValidity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (update.edit && update.edit.signature.publicKey !== comment.signature.publicKey)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR }];
                    return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPublicKey)(update.signature.publicKey)];
                case 1:
                    updateSignatureAddress = _a.sent();
                    return [4 /*yield*/, plebbit.resolver.resolveSubplebbitAddressIfNeeded(subplebbit.address)];
                case 2:
                    subplebbitResolvedAddress = _a.sent();
                    if (updateSignatureAddress !== subplebbitResolvedAddress)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT }];
                    if (update.cid !== comment.cid)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_COMMENT_UPDATE_DIFFERENT_CID_THAN_COMMENT }];
                    if (!update.replies) return [3 /*break*/, 4];
                    return [4 /*yield*/, Promise.all(Object.values(update.replies.pages).map(function (page) { return verifyPage(page, plebbit, subplebbit, comment.cid); }))];
                case 3:
                    pagesValidity = _a.sent();
                    invalidPageValidity = pagesValidity.find(function (validity) { return !validity.valid; });
                    if (invalidPageValidity)
                        return [2 /*return*/, invalidPageValidity];
                    _a.label = 4;
                case 4: return [2 /*return*/, _getValidationResult(update)];
            }
        });
    });
}
exports.verifyCommentUpdate = verifyCommentUpdate;
function verifyChallengeRequest(request) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, _getValidationResult(request)];
        });
    });
}
exports.verifyChallengeRequest = verifyChallengeRequest;
function verifyChallengeMessage(challenge) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, _getValidationResult(challenge)];
        });
    });
}
exports.verifyChallengeMessage = verifyChallengeMessage;
function verifyChallengeAnswer(answer) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, _getValidationResult(answer)];
        });
    });
}
exports.verifyChallengeAnswer = verifyChallengeAnswer;
function verifyChallengeVerification(verification) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, _getValidationResult(verification)];
        });
    });
}
exports.verifyChallengeVerification = verifyChallengeVerification;
function verifyPage(page, plebbit, subplebbit, parentCommentCid) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, pageComment, commentSignatureValidity, commentUpdateSignatureValidity;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = page.comments;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    pageComment = _a[_i];
                    if (pageComment.comment.subplebbitAddress !== subplebbit.address)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB }];
                    if (parentCommentCid !== pageComment.comment.parentCid)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_PARENT_CID_NOT_AS_EXPECTED }];
                    return [4 /*yield*/, verifyComment(pageComment.comment, plebbit, true)];
                case 2:
                    commentSignatureValidity = _b.sent();
                    if (!commentSignatureValidity.valid)
                        return [2 /*return*/, commentSignatureValidity];
                    return [4 /*yield*/, verifyCommentUpdate(pageComment.update, subplebbit, pageComment.comment, plebbit)];
                case 3:
                    commentUpdateSignatureValidity = _b.sent();
                    if (!commentUpdateSignatureValidity.valid)
                        return [2 /*return*/, commentUpdateSignatureValidity];
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, { valid: true }];
            }
        });
    });
}
exports.verifyPage = verifyPage;
