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
var cborg_1 = require("cborg");
var to_string_1 = require("uint8arrays/to-string");
var from_string_1 = require("uint8arrays/from-string");
var assert_1 = __importDefault(require("assert"));
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
                    (0, assert_1.default)(isProbablyBuffer(bufferToSign), "signBufferRsa invalid bufferToSign '".concat(bufferToSign, "' not buffer"));
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
                (0, assert_1.default)(isProbablyBuffer(bufferToSign), "verifyBufferRsa invalid bufferSignature '".concat(bufferToSign, "' not buffer"));
                (0, assert_1.default)(isProbablyBuffer(bufferSignature), "verifyBufferRsa invalid bufferSignature '".concat(bufferSignature, "' not buffer"));
                return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKeyPem)(publicKeyPem)];
            case 1:
                peerId = _a.sent();
                return [4 /*yield*/, peerId.pubKey.verify(bufferToSign, bufferSignature)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.verifyBufferRsa = verifyBufferRsa;
function signPublication(publication, signer, plebbit, publicationType) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var log, resolvedAddress, derivedAddress, signedPropertyNames, fieldsToSign, commentEncoded, signatureData, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    (0, assert_1.default)(signer.publicKey);
                    (0, assert_1.default)(Object.keys(exports.SIGNED_PROPERTY_NAMES).includes(publicationType));
                    log = (0, plebbit_logger_1.default)("plebbit-js:signatures:signPublication");
                    publication = (0, util_2.removeKeysWithUndefinedValues)(publication);
                    if (!((_a = publication === null || publication === void 0 ? void 0 : publication.author) === null || _a === void 0 ? void 0 : _a.address)) return [3 /*break*/, 3];
                    return [4 /*yield*/, plebbit.resolver.resolveAuthorAddressIfNeeded(publication.author.address)];
                case 1:
                    resolvedAddress = _c.sent();
                    return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPrivateKeyPem)(signer.privateKey)];
                case 2:
                    derivedAddress = _c.sent();
                    assert_1.default.equal(resolvedAddress, derivedAddress, "author.address (".concat(publication.author.address, ") does not equate its resolved address (").concat(resolvedAddress, ") is invalid. For this publication to be signed, user needs to ensure plebbit-author-address points to same key used by signer (").concat(derivedAddress, ")"));
                    _c.label = 3;
                case 3:
                    signedPropertyNames = exports.SIGNED_PROPERTY_NAMES[publicationType];
                    log.trace("Fields to sign: ".concat(JSON.stringify(signedPropertyNames), ". Publication object to sign:  ").concat(JSON.stringify(publication)));
                    fieldsToSign = (0, util_2.keepKeys)(publication, signedPropertyNames);
                    commentEncoded = (0, cborg_1.encode)(fieldsToSign);
                    _b = to_string_1.toString;
                    return [4 /*yield*/, (0, exports.signBufferRsa)(commentEncoded, signer.privateKey)];
                case 4:
                    signatureData = _b.apply(void 0, [_c.sent(), "base64"]);
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
// Return [verification (boolean), reasonForFailing (string)]
function verifyPublication(publication, plebbit, publicationType, overrideAuthorAddressIfInvalid) {
    var _a;
    if (overrideAuthorAddressIfInvalid === void 0) { overrideAuthorAddressIfInvalid = true; }
    return __awaiter(this, void 0, void 0, function () {
        var log, publicationJson, cachedResult, verifyAuthor, verifyPublicationSignature, originalObj, _b, verified, failedVerificationReason, res, e_1, res;
        var _c;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    (0, assert_1.default)(Object.keys(exports.SIGNED_PROPERTY_NAMES).includes(publicationType));
                    log = (0, plebbit_logger_1.default)("plebbit-js:signatures:verifyPublication");
                    publicationJson = (0, util_2.removeKeysWithUndefinedValues)(publication);
                    cachedResult = plebbit._memCache.get((0, js_sha256_1.sha256)(JSON.stringify(publicationJson) + publicationType));
                    if (Array.isArray(cachedResult))
                        return [2 /*return*/, cachedResult];
                    verifyAuthor = function (signature, author) { return __awaiter(_this, void 0, void 0, function () {
                        var signaturePeerId, authorPeerId, resolvedAddress, derivedAddress;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKeyPem)(signature.publicKey)];
                                case 1:
                                    signaturePeerId = _b.sent();
                                    (0, assert_1.default)(author.address, "Author address is needed to verify");
                                    try {
                                        // There are cases where author.address is a crypto domain so PeerId.createFromB58String crashes
                                        authorPeerId = peer_id_1.default.createFromB58String(author.address);
                                    }
                                    catch (_c) { }
                                    if (!authorPeerId) return [3 /*break*/, 2];
                                    assert_1.default.equal(signaturePeerId.equals(authorPeerId), true, "comment.author.address doesn't match comment.signature.publicKey");
                                    return [3 /*break*/, 5];
                                case 2:
                                    if (!(overrideAuthorAddressIfInvalid && ((_a = publicationJson === null || publicationJson === void 0 ? void 0 : publicationJson.author) === null || _a === void 0 ? void 0 : _a.address))) return [3 /*break*/, 5];
                                    return [4 /*yield*/, plebbit.resolver.resolveAuthorAddressIfNeeded(publicationJson.author.address)];
                                case 3:
                                    resolvedAddress = _b.sent();
                                    if (!(resolvedAddress !== publicationJson.author.address)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPublicKeyPem)(publicationJson.signature.publicKey)];
                                case 4:
                                    derivedAddress = _b.sent();
                                    if (resolvedAddress !== derivedAddress) {
                                        // Means plebbit-author-address text record is resolving to another comment (outdated?)
                                        // Will always use address derived from publication.signature.publicKey as truth
                                        log.error("domain (".concat(publicationJson.author.address, ") resolved address (").concat(resolvedAddress, ") is invalid, changing publication.author.address to derived address ").concat(derivedAddress));
                                        publication.author.address = derivedAddress;
                                    }
                                    _b.label = 5;
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); };
                    verifyPublicationSignature = function (signature, publicationToBeVerified) { return __awaiter(_this, void 0, void 0, function () {
                        var commentWithFieldsToSign, commentEncoded, signatureIsValid;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    commentWithFieldsToSign = (0, util_2.keepKeys)(publicationToBeVerified, signature.signedPropertyNames);
                                    commentEncoded = (0, cborg_1.encode)(commentWithFieldsToSign);
                                    return [4 /*yield*/, (0, exports.verifyBufferRsa)(commentEncoded, (0, from_string_1.fromString)(signature.signature, "base64"), signature.publicKey)];
                                case 1:
                                    signatureIsValid = _a.sent();
                                    assert_1.default.equal(signatureIsValid, true, "Signature is invalid");
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 8, , 9]);
                    // Need to verify comment.signature (of original comment) and authorEdit (latest edit by author, if exists)
                    log.trace("Attempting to verify a ".concat(publicationType));
                    if (!publicationJson.original) return [3 /*break*/, 4];
                    originalObj = __assign(__assign({}, (0, util_2.removeKeys)(publicationJson, ["original"])), publication.original);
                    return [4 /*yield*/, verifyPublication(originalObj, plebbit, "comment", overrideAuthorAddressIfInvalid)];
                case 2:
                    _b = _d.sent(), verified = _b[0], failedVerificationReason = _b[1];
                    if (!verified)
                        return [2 /*return*/, [false, "Failed to verify ".concat(publicationType, ".original due to: ").concat(failedVerificationReason)]];
                    return [4 /*yield*/, verifyPublication(publicationJson.authorEdit, plebbit, "commentedit", overrideAuthorAddressIfInvalid)];
                case 3:
                    _c = _d.sent(), verified = _c[0], failedVerificationReason = _c[1];
                    if (!verified)
                        return [2 /*return*/, [false, "Failed to verify ".concat(publicationType, ".authorEdit due to: ").concat(failedVerificationReason)]];
                    return [3 /*break*/, 7];
                case 4: return [4 /*yield*/, verifyPublicationSignature(publicationJson.signature, publicationJson)];
                case 5:
                    _d.sent();
                    if (!(((_a = publicationJson === null || publicationJson === void 0 ? void 0 : publicationJson.author) === null || _a === void 0 ? void 0 : _a.address) && plebbit.resolveAuthorAddresses)) return [3 /*break*/, 7];
                    return [4 /*yield*/, verifyAuthor(publicationJson.signature, publicationJson.author)];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7:
                    res = [true, undefined];
                    plebbit._memCache.put((0, js_sha256_1.sha256)(JSON.stringify(publicationJson) + publicationType), res);
                    return [2 /*return*/, res];
                case 8:
                    e_1 = _d.sent();
                    log("Failed to verify ".concat(publicationType, " due to error: ").concat(e_1, "\nPublication: ").concat(JSON.stringify(publicationJson)));
                    res = [false, String(e_1)];
                    plebbit._memCache.put((0, js_sha256_1.sha256)(JSON.stringify(publicationJson) + publicationType), res);
                    return [2 /*return*/, res];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.verifyPublication = verifyPublication;
