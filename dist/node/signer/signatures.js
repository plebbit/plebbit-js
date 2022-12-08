"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.verifyPage = exports.verifyChallengeVerification = exports.verifyChallengeAnswer = exports.verifyChallengeMessage = exports.verifyChallengeRequest = exports.verifyCommentUpdate = exports.verifySubplebbit = exports.verifyComment = exports.verifyCommentEdit = exports.verifyVote = exports.signChallengeVerification = exports.signChallengeAnswer = exports.signChallengeMessage = exports.signChallengeRequest = exports.signSubplebbit = exports.signCommentUpdate = exports.signCommentEdit = exports.signVote = exports.signComment = exports.verifyBufferRsa = exports.signBufferRsa = exports.Signature = void 0;
var util_1 = require("./util");
var cborg = __importStar(require("cborg"));
var to_string_1 = require("uint8arrays/to-string");
var from_string_1 = require("uint8arrays/from-string");
var peer_id_1 = __importDefault(require("peer-id"));
var util_2 = require("../util");
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var lodash_1 = __importDefault(require("lodash"));
var errors_1 = require("../errors");
var Signature = /** @class */ (function () {
    function Signature(props) {
        this.signature = props.signature;
        this.publicKey = props.publicKey;
        this.type = props.type;
        this.signedPropertyNames = props.signedPropertyNames;
    }
    Signature.prototype.toJSON = function () {
        return {
            signature: this.signature,
            publicKey: this.publicKey,
            type: this.type,
            signedPropertyNames: this.signedPropertyNames
        };
    };
    return Signature;
}());
exports.Signature = Signature;
var isProbablyBuffer = function (arg) { return arg && typeof arg !== "string" && typeof arg !== "number"; };
var signBufferRsa = function (bufferToSign, privateKeyPem, privateKeyPemPassword) {
    if (privateKeyPemPassword === void 0) { privateKeyPemPassword = ""; }
    return __awaiter(void 0, void 0, void 0, function () {
        var keyPair;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isProbablyBuffer(bufferToSign))
                        throw Error("signBufferRsa invalid bufferToSign '".concat(bufferToSign, "' not buffer"));
                    return [4 /*yield*/, (0, util_1.getKeyPairFromPrivateKeyPem)(privateKeyPem, privateKeyPemPassword)];
                case 1:
                    keyPair = _a.sent();
                    return [4 /*yield*/, keyPair.sign(bufferToSign)];
                case 2: 
                // do not use libp2p keyPair.sign to sign strings, it doesn't encode properly in the browser
                return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.signBufferRsa = signBufferRsa;
var verifyBufferRsa = function (bufferToSign, bufferSignature, publicKeyPem) { return __awaiter(void 0, void 0, void 0, function () {
    var peerId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!isProbablyBuffer(bufferToSign))
                    throw Error("verifyBufferRsa invalid bufferSignature '".concat(bufferToSign, "' not buffer"));
                if (!isProbablyBuffer(bufferSignature))
                    throw Error("verifyBufferRsa invalid bufferSignature '".concat(bufferSignature, "' not buffer"));
                return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKeyPem)(publicKeyPem)];
            case 1:
                peerId = _a.sent();
                return [4 /*yield*/, peerId.pubKey.verify(bufferToSign, bufferSignature)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.verifyBufferRsa = verifyBufferRsa;
function _validateAuthorIpns(author, signer, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var derivedAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!is_ipfs_1.default.cid(author.address)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPrivateKeyPem)(signer.privateKey)];
                case 1:
                    derivedAddress = _a.sent();
                    if (derivedAddress !== author.address)
                        (0, util_2.throwWithErrorCode)("ERR_AUTHOR_ADDRESS_NOT_MATCHING_SIGNER", "author.address=".concat(author.address, ", signer.address=").concat(derivedAddress));
                    return [3 /*break*/, 3];
                case 2:
                    if (plebbit.resolver.isDomain(author.address)) {
                        // As of now do nothing to verify authors with domain as addresses
                        // This may change in the future
                    }
                    else
                        (0, util_2.throwWithErrorCode)("ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_IPNS", "author.address = '".concat(author.address, "'"));
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function _sign(signedPropertyNames, publication, signer, log) {
    return __awaiter(this, void 0, void 0, function () {
        var fieldsToSign, publicationEncoded, signatureData, _a, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    fieldsToSign = __assign(__assign({}, lodash_1.default.fromPairs(signedPropertyNames.map(function (name) { return [name, undefined]; }))), lodash_1.default.pick((0, util_2.removeKeysWithUndefinedValues)(publication), signedPropertyNames));
                    log.trace("fields to sign: ", fieldsToSign);
                    publicationEncoded = cborg.encode(fieldsToSign);
                    _a = to_string_1.toString;
                    return [4 /*yield*/, (0, exports.signBufferRsa)(publicationEncoded, signer.privateKey)];
                case 1:
                    signatureData = _a.apply(void 0, [_d.sent(), "base64"]);
                    log.trace("fields have been signed, signature:", signatureData);
                    _b = Signature.bind;
                    _c = {
                        signature: signatureData
                    };
                    return [4 /*yield*/, signer.getPublicKey()];
                case 2: return [2 /*return*/, new (_b.apply(Signature, [void 0, (_c.publicKey = _d.sent(),
                            _c.type = signer.type,
                            _c.signedPropertyNames = signedPropertyNames,
                            _c)]))()];
            }
        });
    });
}
function signComment(comment, signer, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var log, signedPropertyNames;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signComment");
                    return [4 /*yield*/, _validateAuthorIpns(comment.author, signer, plebbit)];
                case 1:
                    _a.sent();
                    signedPropertyNames = ["subplebbitAddress", "author", "timestamp", "content", "title", "link", "parentCid"];
                    return [2 /*return*/, _sign(signedPropertyNames, comment, signer, log)];
            }
        });
    });
}
exports.signComment = signComment;
function signVote(vote, signer, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var log, signedPropertyNames;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signVote");
                    return [4 /*yield*/, _validateAuthorIpns(vote.author, signer, plebbit)];
                case 1:
                    _a.sent();
                    signedPropertyNames = ["subplebbitAddress", "author", "timestamp", "vote", "commentCid"];
                    return [2 /*return*/, _sign(signedPropertyNames, vote, signer, log)];
            }
        });
    });
}
exports.signVote = signVote;
function signCommentEdit(edit, signer, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var log, signedPropertyNames;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signCommentEdit");
                    return [4 /*yield*/, _validateAuthorIpns(edit.author, signer, plebbit)];
                case 1:
                    _a.sent();
                    signedPropertyNames = ["author", "timestamp", "subplebbitAddress", "content", "commentCid", "deleted", "spoiler", "pinned", "locked", "removed", "moderatorReason", "flair", "reason", "commentAuthor"];
                    return [2 /*return*/, _sign(signedPropertyNames, edit, signer, log)];
            }
        });
    });
}
exports.signCommentEdit = signCommentEdit;
function signCommentUpdate(update, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log, signedPropertyNames;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signCommentUpdate");
            signedPropertyNames = ["author", "spoiler", "pinned", "locked", "removed", "moderatorReason", "flair", "upvoteCount", "downvoteCount", "replies", "updatedAt", "replyCount", "authorEdit"];
            return [2 /*return*/, _sign(signedPropertyNames, update, signer, log)];
        });
    });
}
exports.signCommentUpdate = signCommentUpdate;
function signSubplebbit(subplebbit, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log, signedPropertyNames;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signSubplebbit");
            signedPropertyNames = ["title", "description", "roles", "pubsubTopic", "lastPostCid", "posts", "challengeTypes", "metricsCid", "createdAt", "updatedAt", "features", "suggested", "rules", "address", "flairs", "encryption"];
            return [2 /*return*/, _sign(signedPropertyNames, subplebbit, signer, log)];
        });
    });
}
exports.signSubplebbit = signSubplebbit;
function signChallengeRequest(request, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log, signedPropertyNames;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signChallengeRequest");
            signedPropertyNames = ["type", "challengeRequestId", "encryptedPublication", "acceptedChallengeTypes"];
            return [2 /*return*/, _sign(signedPropertyNames, request, signer, log)];
        });
    });
}
exports.signChallengeRequest = signChallengeRequest;
function signChallengeMessage(challengeMessage, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log, signedPropertyNames;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signChallengeMessage");
            signedPropertyNames = ["type", "challengeRequestId", "encryptedChallenges"];
            return [2 /*return*/, _sign(signedPropertyNames, challengeMessage, signer, log)];
        });
    });
}
exports.signChallengeMessage = signChallengeMessage;
function signChallengeAnswer(challengeAnswer, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log, signedPropertyNames;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signChallengeAnswer");
            signedPropertyNames = ["type", "challengeRequestId", "challengeAnswerId", "encryptedChallengeAnswers"];
            return [2 /*return*/, _sign(signedPropertyNames, challengeAnswer, signer, log)];
        });
    });
}
exports.signChallengeAnswer = signChallengeAnswer;
function signChallengeVerification(challengeVerification, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var log, signedPropertyNames;
        return __generator(this, function (_a) {
            log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signChallengeVerification");
            signedPropertyNames = ["reason", "type", "challengeRequestId", "encryptedPublication", "challengeAnswerId", "challengeSuccess", "challengeErrors"];
            return [2 /*return*/, _sign(signedPropertyNames, challengeVerification, signer, log)];
        });
    });
}
exports.signChallengeVerification = signChallengeVerification;
// Verify functions
var _verifyAuthor = function (publicationJson, plebbit) { return __awaiter(void 0, void 0, void 0, function () {
    var log, resolvedAuthorAddress, derivedAddress, authorPeerId, signaturePeerId;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                log = (0, plebbit_logger_1.default)("plebbit-js:signatures:verifyAuthor");
                if (!((_a = publicationJson.author) === null || _a === void 0 ? void 0 : _a.address))
                    return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_IPNS }];
                if (!plebbit.resolver.isDomain(publicationJson.author.address)) return [3 /*break*/, 3];
                if (!plebbit.resolveAuthorAddresses)
                    return [2 /*return*/, { valid: true }]; // Skip domain validation if plebbit.resolveAuthorAddresses=false
                return [4 /*yield*/, plebbit.resolver.resolveAuthorAddressIfNeeded(publicationJson.author.address)];
            case 1:
                resolvedAuthorAddress = _b.sent();
                return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPublicKeyPem)(publicationJson.signature.publicKey)];
            case 2:
                derivedAddress = _b.sent();
                if (resolvedAuthorAddress !== derivedAddress) {
                    // Means plebbit-author-address text record is resolving to another address (outdated?)
                    // Will always use address derived from publication.signature.publicKey as truth
                    log.error("domain (".concat(publicationJson.author.address, ") resolved address (").concat(resolvedAuthorAddress, ") is invalid, changing publication.author.address to derived address ").concat(derivedAddress));
                    return [2 /*return*/, { valid: true, newAddress: derivedAddress }];
                }
                return [3 /*break*/, 6];
            case 3:
                if (!is_ipfs_1.default.cid(publicationJson.author.address)) return [3 /*break*/, 5];
                authorPeerId = peer_id_1.default.createFromB58String(publicationJson.author.address);
                return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKeyPem)(publicationJson.signature.publicKey)];
            case 4:
                signaturePeerId = _b.sent();
                if (!signaturePeerId.equals(authorPeerId))
                    return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_AUTHOR_NOT_MATCHING_SIGNATURE }];
                return [3 /*break*/, 6];
            case 5: return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_AUTHOR_ADDRESS_IS_NOT_A_DOMAIN_OR_IPNS }];
            case 6: 
            // Author
            return [2 /*return*/, { valid: true }];
        }
    });
}); };
var _verifyPublicationSignature = function (publicationToBeVerified) { return __awaiter(void 0, void 0, void 0, function () {
    var commentWithFieldsToSign, commentEncoded, signatureIsValid;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                commentWithFieldsToSign = __assign(__assign({}, lodash_1.default.fromPairs(publicationToBeVerified.signature.signedPropertyNames.map(function (name) { return [name, undefined]; }))), lodash_1.default.pick(publicationToBeVerified, publicationToBeVerified.signature.signedPropertyNames));
                commentEncoded = cborg.encode(commentWithFieldsToSign);
                return [4 /*yield*/, (0, exports.verifyBufferRsa)(commentEncoded, (0, from_string_1.fromString)(publicationToBeVerified.signature.signature, "base64"), publicationToBeVerified.signature.publicKey)];
            case 1:
                signatureIsValid = _a.sent();
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
        var voteJson, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    voteJson = (0, util_2.removeKeysWithUndefinedValues)(vote);
                    return [4 /*yield*/, _verifyPublicationWithAuthor(voteJson, plebbit, overrideAuthorAddressIfInvalid)];
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
        var editJson, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    editJson = (0, util_2.removeKeysWithUndefinedValues)(edit);
                    return [4 /*yield*/, _verifyPublicationWithAuthor(editJson, plebbit, overrideAuthorAddressIfInvalid)];
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
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function () {
        var authorEditValidation, authorComment, authorCommentValidation;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!comment.authorEdit) return [3 /*break*/, 2];
                    // Means comment has been edited, verify comment.authorEdit.signature
                    if (comment.authorEdit.signature.publicKey !== comment.signature.publicKey)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR }];
                    return [4 /*yield*/, _verifyPublicationWithAuthor(comment.authorEdit, plebbit, overrideAuthorAddressIfInvalid)];
                case 1:
                    authorEditValidation = _f.sent();
                    if (!authorEditValidation.valid)
                        return [2 /*return*/, authorEditValidation];
                    if (comment.authorEdit.content && comment.content !== comment.authorEdit.content)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_COMMENT_SHOULD_BE_THE_LATEST_EDIT }];
                    if (overrideAuthorAddressIfInvalid && authorEditValidation.newAddress)
                        comment.authorEdit.author.address = authorEditValidation.newAddress;
                    _f.label = 2;
                case 2:
                    authorComment = (0, util_2.removeKeysWithUndefinedValues)(__assign(__assign({}, comment), { content: ((_a = comment.authorEdit) === null || _a === void 0 ? void 0 : _a.content) ? (_b = comment === null || comment === void 0 ? void 0 : comment.original) === null || _b === void 0 ? void 0 : _b.content : comment.content, author: __assign(__assign({}, lodash_1.default.omit(comment.author, ["banExpiresAt", "flair", "subplebbit"])), { flair: (_d = (_c = comment.original) === null || _c === void 0 ? void 0 : _c.author) === null || _d === void 0 ? void 0 : _d.flair }), flair: (_e = comment.original) === null || _e === void 0 ? void 0 : _e.flair }));
                    return [4 /*yield*/, _verifyPublicationWithAuthor(authorComment, plebbit, overrideAuthorAddressIfInvalid)];
                case 3:
                    authorCommentValidation = _f.sent();
                    if (!authorCommentValidation.valid)
                        return [2 /*return*/, authorCommentValidation];
                    if (authorCommentValidation.newAddress)
                        comment.author.address = authorCommentValidation.newAddress;
                    return [2 /*return*/, { valid: true }];
            }
        });
    });
}
exports.verifyComment = verifyComment;
function verifySubplebbit(subplebbit, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var subplebbitJson, _i, _a, page, pageValidity, signatureValidity, resolvedSubAddress, subPeerId, signaturePeerId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    subplebbitJson = (0, util_2.removeKeysWithUndefinedValues)(subplebbit);
                    if (!subplebbit.posts.pages) return [3 /*break*/, 4];
                    _i = 0, _a = Object.values(subplebbitJson.posts.pages);
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    page = _a[_i];
                    return [4 /*yield*/, verifyPage(lodash_1.default.cloneDeep(page), plebbit, subplebbit.address)];
                case 2:
                    pageValidity = _b.sent();
                    if (!pageValidity.valid)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SUBPLEBBIT_POSTS_INVALID }];
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, _verifyPublicationSignature(subplebbitJson)];
                case 5:
                    signatureValidity = _b.sent();
                    if (!signatureValidity)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SIGNATURE_IS_INVALID }];
                    return [4 /*yield*/, plebbit.resolver.resolveSubplebbitAddressIfNeeded(subplebbitJson.address)];
                case 6:
                    resolvedSubAddress = _b.sent();
                    subPeerId = peer_id_1.default.createFromB58String(resolvedSubAddress);
                    return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKeyPem)(subplebbitJson.signature.publicKey)];
                case 7:
                    signaturePeerId = _b.sent();
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
        var publicationJson, signatureValidity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    publicationJson = (0, util_2.removeKeysWithUndefinedValues)(publication);
                    return [4 /*yield*/, _verifyPublicationSignature(publicationJson)];
                case 1:
                    signatureValidity = _a.sent();
                    if (!signatureValidity)
                        return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_SIGNATURE_IS_INVALID }];
                    return [2 /*return*/, { valid: true }];
            }
        });
    });
}
function verifyCommentUpdate(update, subplebbitPublicKey, authorPublicKey) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (update.authorEdit && update.authorEdit.signature.publicKey !== authorPublicKey)
                return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_AUTHOR_EDIT_IS_NOT_SIGNED_BY_AUTHOR }];
            if (update.signature.publicKey !== subplebbitPublicKey)
                return [2 /*return*/, { valid: false, reason: errors_1.messages.ERR_COMMENT_UPDATE_IS_NOT_SIGNED_BY_SUBPLEBBIT }];
            return [2 /*return*/, _getValidationResult(update)];
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
function verifyPage(page, plebbit, subplebbitAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var verifyCommentInPage, e_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    verifyCommentInPage = function (comment, parentComment) { return __awaiter(_this, void 0, void 0, function () {
                        var commentSignatureValidity, code;
                        var _this = this;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (comment.subplebbitAddress !== subplebbitAddress)
                                        (0, util_2.throwWithErrorCode)("ERR_COMMENT_IN_PAGE_BELONG_TO_DIFFERENT_SUB", "verifyPage: Failed to verify page due to comment (".concat(comment.cid, ") having a subplebbit address (").concat(comment.subplebbitAddress, ") that is different than the address of the subplebbit that generate this page (").concat(subplebbitAddress, ")"));
                                    if (parentComment && parentComment.cid !== comment.parentCid)
                                        (0, util_2.throwWithErrorCode)("ERR_PARENT_CID_NOT_AS_EXPECTED", "verifyPage: Failed to verify page due to comment (".concat(comment.cid, ") having an unexpected parent cid (").concat(comment.parentCid, "), the expected parent cid (").concat(parentComment.cid, ")"));
                                    return [4 /*yield*/, verifyComment(comment, plebbit, true)];
                                case 1:
                                    commentSignatureValidity = _b.sent();
                                    if (!commentSignatureValidity.valid) {
                                        code = Object.entries(errors_1.messages).filter(function (_a) {
                                            var _ = _a[0], error = _a[1];
                                            return error === commentSignatureValidity.reason;
                                        })[0][0];
                                        (0, util_2.throwWithErrorCode)(code, "verifyPage: Failed to verify page due to comment ".concat(comment.cid, " with invalid signature due to '").concat(commentSignatureValidity.reason, "'"));
                                    }
                                    return [4 /*yield*/, Promise.all(Object.values((_a = comment === null || comment === void 0 ? void 0 : comment.replies) === null || _a === void 0 ? void 0 : _a.pages).map(function (page) { return __awaiter(_this, void 0, void 0, function () {
                                            var _this = this;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, Promise.all(page.comments.map(function (preloadedComment) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                                            return [2 /*return*/, verifyCommentInPage(preloadedComment, comment)];
                                                        }); }); }))];
                                                    case 1: return [2 /*return*/, _a.sent()];
                                                }
                                            });
                                        }); }))];
                                case 2:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.all(page.comments.map(function (comment) { return verifyCommentInPage(comment, undefined); }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { valid: true }];
                case 3:
                    e_1 = _a.sent();
                    return [2 /*return*/, { valid: false, reason: e_1.message }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.verifyPage = verifyPage;
//# sourceMappingURL=signatures.js.map