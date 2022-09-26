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
exports.verifyPublication = exports.signPublication = exports.verifyBufferRsa = exports.signBufferRsa = exports.Signature = exports.SIGNED_PROPERTY_NAMES = void 0;
var util_1 = require("./util");
var cborg = __importStar(require("cborg"));
var to_string_1 = require("uint8arrays/to-string");
var from_string_1 = require("uint8arrays/from-string");
var peer_id_1 = __importDefault(require("peer-id"));
var util_2 = require("../util");
var js_sha256_1 = require("js-sha256");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
exports.SIGNED_PROPERTY_NAMES = Object.freeze({
    comment: ["subplebbitAddress", "author", "timestamp", "content", "title", "link", "parentCid"],
    commentedit: [
        "author",
        "timestamp",
        "subplebbitAddress",
        "content",
        "commentCid",
        "deleted",
        "spoiler",
        "pinned",
        "locked",
        "removed",
        "moderatorReason",
        "flair",
        "reason",
        "commentAuthor"
    ],
    commentupdate: [
        "author",
        "spoiler",
        "pinned",
        "locked",
        "removed",
        "moderatorReason",
        "flair",
        "upvoteCount",
        "downvoteCount",
        "replies",
        "updatedAt",
        "replyCount",
        "authorEdit"
    ],
    vote: ["subplebbitAddress", "author", "timestamp", "vote", "commentCid"],
    subplebbit: [
        "title",
        "description",
        "roles",
        "pubsubTopic",
        "lastPostCid",
        "posts",
        "challengeTypes",
        "metricsCid",
        "createdAt",
        "updatedAt",
        "features",
        "suggested",
        "rules",
        "address",
        "flairs",
        "encryption"
    ],
    challengerequestmessage: ["type", "challengeRequestId", "encryptedPublication", "acceptedChallengeTypes"],
    challengemessage: ["type", "challengeRequestId", "encryptedChallenges"],
    challengeanswermessage: ["type", "challengeRequestId", "challengeAnswerId", "encryptedChallengeAnswers"],
    challengeverificationmessage: [
        "reason",
        "type",
        "challengeRequestId",
        "encryptedPublication",
        "challengeAnswerId",
        "challengeSuccess",
        "challengeErrors"
    ]
});
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
function signPublication(publication, signer, plebbit, signatureType) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var publicationJson, log, resolvedAddress, derivedAddress, signedPropertyNames, fieldsToSign, commentEncoded, signatureData, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (typeof signer.publicKey !== "string")
                        throw Error("signer.publicKey (".concat(signer.publicKey, ") is not a valid public key"));
                    if (!Object.keys(exports.SIGNED_PROPERTY_NAMES).includes(signatureType))
                        throw Error("signature type (".concat(signatureType, ") is not supported"));
                    publicationJson = (0, util_2.removeKeysWithUndefinedValues)(publication);
                    log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signPublication");
                    if (!(((_b = (_a = publicationJson["author"]) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.name) === "Object" && typeof publicationJson["author"]["address"] === "string")) return [3 /*break*/, 3];
                    publicationJson = publicationJson;
                    return [4 /*yield*/, plebbit.resolver.resolveAuthorAddressIfNeeded(publicationJson.author.address)];
                case 1:
                    resolvedAddress = _e.sent();
                    return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPrivateKeyPem)(signer.privateKey)];
                case 2:
                    derivedAddress = _e.sent();
                    if (resolvedAddress !== derivedAddress)
                        throw Error("author.address (".concat((_c = publicationJson === null || publicationJson === void 0 ? void 0 : publicationJson.author) === null || _c === void 0 ? void 0 : _c.address, ") does not equate its resolved address (").concat(resolvedAddress, ") is invalid. For this publication to be signed, user needs to ensure plebbit-author-address points to same key used by signer (").concat(derivedAddress, ")"));
                    _e.label = 3;
                case 3:
                    signedPropertyNames = exports.SIGNED_PROPERTY_NAMES[signatureType];
                    fieldsToSign = (0, util_2.keepKeys)(publicationJson, signedPropertyNames);
                    log.trace("Fields to sign: ".concat(JSON.stringify(signedPropertyNames), ". Publication object to sign:  ").concat(JSON.stringify(fieldsToSign)));
                    commentEncoded = cborg.encode(fieldsToSign);
                    _d = to_string_1.toString;
                    return [4 /*yield*/, (0, exports.signBufferRsa)(commentEncoded, signer.privateKey)];
                case 4:
                    signatureData = _d.apply(void 0, [_e.sent(), "base64"]);
                    log.trace("Publication been signed, signature data is (".concat(signatureData, ")"));
                    return [2 /*return*/, new Signature({
                            signature: signatureData,
                            publicKey: signer.publicKey,
                            type: signer.type,
                            signedPropertyNames: signedPropertyNames
                        })];
            }
        });
    });
}
exports.signPublication = signPublication;
var verifyPublicationSignature = function (signature, publicationToBeVerified) { return __awaiter(void 0, void 0, void 0, function () {
    var commentWithFieldsToSign, commentEncoded, signatureIsValid;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                commentWithFieldsToSign = (0, util_2.keepKeys)(publicationToBeVerified, signature.signedPropertyNames);
                commentEncoded = cborg.encode(commentWithFieldsToSign);
                return [4 /*yield*/, (0, exports.verifyBufferRsa)(commentEncoded, (0, from_string_1.fromString)(signature.signature, "base64"), signature.publicKey)];
            case 1:
                signatureIsValid = _a.sent();
                if (!signatureIsValid)
                    throw Error("Signature is invalid");
                return [2 /*return*/];
        }
    });
}); };
// Return [verification (boolean), reasonForFailing (string)]
function verifyPublication(publication, plebbit, signatureType, overrideAuthorAddressIfInvalid) {
    if (overrideAuthorAddressIfInvalid === void 0) { overrideAuthorAddressIfInvalid = true; }
    return __awaiter(this, void 0, void 0, function () {
        var publicationJson, log, cachedResult, verifyAuthor, originalObj, _a, verified, failedVerificationReason, resolvedSubAddress, _b, subPeerId, signaturePeerId, res, e_1, res;
        var _c;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!Object.keys(exports.SIGNED_PROPERTY_NAMES).includes(signatureType))
                        throw Error("signature type (".concat(signatureType, ") is not supported"));
                    publicationJson = (0, util_2.removeKeysWithUndefinedValues)(publication);
                    log = (0, plebbit_logger_1.default)("plebbit-js:signatures:verifyPublication");
                    cachedResult = plebbit._memCache.get((0, js_sha256_1.sha256)(JSON.stringify(publicationJson) + signatureType));
                    if (Array.isArray(cachedResult))
                        return [2 /*return*/, cachedResult];
                    verifyAuthor = function (signature, author) { return __awaiter(_this, void 0, void 0, function () {
                        var signaturePeerId, authorPeerId, resolvedAddress, derivedAddress;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    publicationJson = publicationJson;
                                    return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKeyPem)(signature.publicKey)];
                                case 1:
                                    signaturePeerId = _b.sent();
                                    try {
                                        // There are cases where author.address is a crypto domain so PeerId.createFromB58String crashes
                                        authorPeerId = peer_id_1.default.createFromB58String(author.address);
                                    }
                                    catch (_c) { }
                                    if (!(authorPeerId && !signaturePeerId.equals(authorPeerId))) return [3 /*break*/, 2];
                                    throw Error("comment.author.address doesn't match comment.signature.publicKey");
                                case 2:
                                    if (!(overrideAuthorAddressIfInvalid && ((_a = publicationJson === null || publicationJson === void 0 ? void 0 : publicationJson.author) === null || _a === void 0 ? void 0 : _a.address))) return [3 /*break*/, 5];
                                    return [4 /*yield*/, plebbit.resolver.resolveAuthorAddressIfNeeded(publicationJson.author.address)];
                                case 3:
                                    resolvedAddress = _b.sent();
                                    if (!(resolvedAddress !== publicationJson.author.address)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPublicKeyPem)(publication.signature.publicKey)];
                                case 4:
                                    derivedAddress = _b.sent();
                                    if (resolvedAddress !== derivedAddress) {
                                        // Means plebbit-author-address text record is resolving to another comment (outdated?)
                                        // Will always use address derived from publication.signature.publicKey as truth
                                        log.error("domain (".concat(publicationJson.author.address, ") resolved address (").concat(resolvedAddress, ") is invalid, changing publication.author.address to derived address ").concat(derivedAddress));
                                        publication.author.address = derivedAddress; // Change argument Publication author address. This is why we're using publicationJson
                                    }
                                    _b.label = 5;
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); };
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 14, , 15]);
                    // Need to verify comment.signature (of original comment) and authorEdit (latest edit by author, if exists)
                    log.trace("Attempting to verify a ".concat(signatureType));
                    if (!publicationJson["original"]) return [3 /*break*/, 4];
                    publicationJson = publicationJson;
                    originalObj = __assign(__assign({}, (0, util_2.removeKeys)(publicationJson, ["original"])), publicationJson.original);
                    return [4 /*yield*/, verifyPublication(originalObj, plebbit, "comment", overrideAuthorAddressIfInvalid)];
                case 2:
                    _a = _d.sent(), verified = _a[0], failedVerificationReason = _a[1];
                    if (!verified)
                        return [2 /*return*/, [false, "Failed to verify ".concat(signatureType, ".original due to: ").concat(failedVerificationReason)]];
                    if (!publicationJson.authorEdit)
                        throw Error("Comment.original is defined while publication.authorEdit is not");
                    return [4 /*yield*/, verifyPublication(publicationJson.authorEdit, plebbit, "commentedit", overrideAuthorAddressIfInvalid)];
                case 3:
                    _c = _d.sent(), verified = _c[0], failedVerificationReason = _c[1];
                    if (!verified)
                        return [2 /*return*/, [false, "Failed to verify ".concat(signatureType, ".authorEdit due to: ").concat(failedVerificationReason)]];
                    return [3 /*break*/, 13];
                case 4:
                    if (!(signatureType === "subplebbit")) return [3 /*break*/, 10];
                    publicationJson = publicationJson;
                    return [4 /*yield*/, verifyPublicationSignature(publicationJson.signature, publicationJson)];
                case 5:
                    _d.sent();
                    if (!plebbit.resolver.isDomain(publicationJson.address)) return [3 /*break*/, 7];
                    return [4 /*yield*/, plebbit.resolver.resolveSubplebbitAddressIfNeeded(publicationJson.address)];
                case 6:
                    _b = _d.sent();
                    return [3 /*break*/, 8];
                case 7:
                    _b = publicationJson.address;
                    _d.label = 8;
                case 8:
                    resolvedSubAddress = _b;
                    subPeerId = peer_id_1.default.createFromB58String(resolvedSubAddress);
                    return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKeyPem)(publicationJson.signature.publicKey)];
                case 9:
                    signaturePeerId = _d.sent();
                    if (!subPeerId.equals(signaturePeerId))
                        throw Error("subplebbit.address.publicKey doesn't equal subplebbit.signature.publicKey");
                    return [3 /*break*/, 13];
                case 10: return [4 /*yield*/, verifyPublicationSignature(publicationJson.signature, publicationJson)];
                case 11:
                    _d.sent();
                    if (!(publicationJson["author"] && publicationJson["author"]["address"] && plebbit.resolveAuthorAddresses)) return [3 /*break*/, 13];
                    return [4 /*yield*/, verifyAuthor(publicationJson.signature, publicationJson.author)];
                case 12:
                    _d.sent();
                    _d.label = 13;
                case 13:
                    res = [true, undefined];
                    plebbit._memCache.put((0, js_sha256_1.sha256)(JSON.stringify(publicationJson) + signatureType), res);
                    return [2 /*return*/, res];
                case 14:
                    e_1 = _d.sent();
                    log("Failed to verify ".concat(signatureType, " due to error: ").concat(e_1, "\nPublication: ").concat(JSON.stringify(publicationJson)));
                    res = [false, String(e_1)];
                    plebbit._memCache.put((0, js_sha256_1.sha256)(JSON.stringify(publicationJson) + signatureType), res);
                    return [2 /*return*/, res];
                case 15: return [2 /*return*/];
            }
        });
    });
}
exports.verifyPublication = verifyPublication;
