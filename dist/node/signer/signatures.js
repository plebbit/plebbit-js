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
exports.verifyPublication = exports.signPublication = exports.verifyBufferRsa = exports.signBufferRsa = exports.Signature = void 0;
var util_1 = require("./util");
var cborg_1 = require("cborg");
var to_string_1 = require("uint8arrays/to-string");
var from_string_1 = require("uint8arrays/from-string");
var assert_1 = __importDefault(require("assert"));
var peer_id_1 = __importDefault(require("peer-id"));
var util_2 = require("../util");
var publication_1 = __importDefault(require("../publication"));
var debugs = (0, util_2.getDebugLevels)("signer:signatures");
var Signature = /** @class */ (function () {
    function Signature(props) {
        this.signature = props["signature"];
        this.publicKey = props["publicKey"];
        this.type = props["type"];
        this.signedPropertyNames = props["signedPropertyNames"];
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
function getFieldsToSign(publication) {
    if (publication.hasOwnProperty("vote"))
        return ["subplebbitAddress", "author", "timestamp", "vote", "commentCid"];
    else if (publication.commentCid)
        // CommentEdit
        return [
            "subplebbitAddress",
            "content",
            "commentCid",
            "editTimestamp",
            "editReason",
            "deleted",
            "spoiler",
            "pinned",
            "locked",
            "removed",
            "moderatorReason"
        ];
    else if (publication.title)
        // Post
        return ["subplebbitAddress", "author", "timestamp", "content", "title", "link"];
    else if (publication.content)
        // Comment
        return ["subplebbitAddress", "author", "timestamp", "parentCid", "content"];
}
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
function signPublication(publication, signer, plebbit) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var resolvedAddress, derivedAddress, fieldsToSign, publicationSignFields, commentEncoded, signatureData, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
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
                    fieldsToSign = getFieldsToSign(publication);
                    publicationSignFields = (0, util_2.removeKeysWithUndefinedValues)((0, util_2.keepKeys)(publication, fieldsToSign));
                    debugs.TRACE("Fields to sign: ".concat(JSON.stringify(fieldsToSign), ". Publication object to sign:  ").concat(JSON.stringify(publicationSignFields)));
                    commentEncoded = (0, cborg_1.encode)(publicationSignFields);
                    _b = to_string_1.toString;
                    return [4 /*yield*/, (0, exports.signBufferRsa)(commentEncoded, signer.privateKey)];
                case 4:
                    signatureData = _b.apply(void 0, [_c.sent(), "base64"]);
                    debugs.DEBUG("Publication been signed, signature data is (".concat(signatureData, ")"));
                    return [2 /*return*/, new Signature({
                            signature: signatureData,
                            publicKey: signer.publicKey,
                            type: signer.type,
                            signedPropertyNames: fieldsToSign
                        })];
            }
        });
    });
}
exports.signPublication = signPublication;
// Return [verification (boolean), reasonForFailing (string)]
function verifyPublication(publication, plebbit, overrideAuthorAddressIfInvalid) {
    if (overrideAuthorAddressIfInvalid === void 0) { overrideAuthorAddressIfInvalid = true; }
    return __awaiter(this, void 0, void 0, function () {
        var verifyAuthor, verifyPublicationSignature, publicationJson, originalSignatureObj, editedSignatureObj, _a, _b, e_1;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    verifyAuthor = function (signature, author) { return __awaiter(_this, void 0, void 0, function () {
                        var signaturePeerId, authorPeerId, resolvedAddress, derivedAddress;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKeyPem)(signature.publicKey)];
                                case 1:
                                    signaturePeerId = _b.sent();
                                    try {
                                        // There are cases where author.address is a crypto domain so PeerId.createFromB58String crashes
                                        authorPeerId = peer_id_1.default.createFromB58String(author.address);
                                    }
                                    catch (_c) { }
                                    if (!authorPeerId) return [3 /*break*/, 2];
                                    assert_1.default.equal(signaturePeerId.equals(authorPeerId), true, "comment.author.address doesn't match comment.signature.publicKey");
                                    return [3 /*break*/, 5];
                                case 2:
                                    if (!(overrideAuthorAddressIfInvalid && ((_a = publication === null || publication === void 0 ? void 0 : publication.author) === null || _a === void 0 ? void 0 : _a.address))) return [3 /*break*/, 5];
                                    return [4 /*yield*/, plebbit.resolver.resolveAuthorAddressIfNeeded(publication.author.address)];
                                case 3:
                                    resolvedAddress = _b.sent();
                                    if (!(resolvedAddress !== publication.author.address)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, (0, util_1.getPlebbitAddressFromPublicKeyPem)(publication.signature.publicKey)];
                                case 4:
                                    derivedAddress = _b.sent();
                                    if (resolvedAddress !== derivedAddress) {
                                        // Means plebbit-author-address text record is resolving to another comment (oudated?)
                                        // Will always use address derived from publication.signature.publicKey as truth
                                        debugs.INFO("domain (".concat(publication.author.address, ") resolved address (").concat(resolvedAddress, ") is invalid, changing publication.author.address to derived address ").concat(derivedAddress));
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
                                    debugs.DEBUG("signature.signedPropertyNames: [".concat(signature.signedPropertyNames, "], Attempt to verify a publication: ").concat(JSON.stringify(commentWithFieldsToSign)));
                                    commentEncoded = (0, cborg_1.encode)((0, util_2.removeKeysWithUndefinedValues)(commentWithFieldsToSign));
                                    return [4 /*yield*/, (0, exports.verifyBufferRsa)(commentEncoded, (0, from_string_1.fromString)(signature.signature, "base64"), signature.publicKey)];
                                case 1:
                                    signatureIsValid = _a.sent();
                                    assert_1.default.equal(signatureIsValid, true, "Signature is invalid");
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 15, , 16]);
                    if (!publication.originalContent) return [3 /*break*/, 7];
                    // This is a comment/post that has been edited, and we need to verify both signature and editSignature
                    debugs.TRACE("Attempting to verify a comment that has been edited. Will verify comment.author,  comment.signature and comment.editSignature");
                    publicationJson = publication instanceof publication_1.default ? publication.toJSON() : publication;
                    originalSignatureObj = __assign(__assign({}, publicationJson), { content: publication.originalContent });
                    debugs.TRACE("Attempting to verify comment.signature");
                    return [4 /*yield*/, verifyPublicationSignature(publication.signature, originalSignatureObj)];
                case 2:
                    _c.sent();
                    debugs.TRACE("Attempting to verify comment.editSignature");
                    editedSignatureObj = __assign(__assign({}, publicationJson), { commentCid: publication.cid });
                    return [4 /*yield*/, verifyPublicationSignature(publication.editSignature, editedSignatureObj)];
                case 3:
                    _c.sent();
                    if (!
                    // Verify author at the end since we might change author.address which will fail signature verification
                    publication.author) 
                    // Verify author at the end since we might change author.address which will fail signature verification
                    return [3 /*break*/, 5];
                    return [4 /*yield*/, verifyAuthor(publication.signature, publication.author)];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = undefined;
                    _c.label = 6;
                case 6:
                    // Verify author at the end since we might change author.address which will fail signature verification
                    _a;
                    return [3 /*break*/, 14];
                case 7:
                    if (!(publication.commentCid && publication.content)) return [3 /*break*/, 9];
                    // Verify CommentEdit
                    debugs.TRACE("Attempting to verify CommentEdit");
                    return [4 /*yield*/, verifyPublicationSignature(publication.editSignature, publication)];
                case 8:
                    _c.sent();
                    return [3 /*break*/, 14];
                case 9:
                    debugs.TRACE("Attempting to verify post/comment/vote");
                    return [4 /*yield*/, verifyPublicationSignature(publication.signature, publication)];
                case 10:
                    _c.sent();
                    if (!publication.author) return [3 /*break*/, 12];
                    return [4 /*yield*/, verifyAuthor(publication.signature, publication.author)];
                case 11:
                    _b = _c.sent();
                    return [3 /*break*/, 13];
                case 12:
                    _b = undefined;
                    _c.label = 13;
                case 13:
                    _b;
                    _c.label = 14;
                case 14:
                    debugs.TRACE("Publication has been verified");
                    return [2 /*return*/, [true]];
                case 15:
                    e_1 = _c.sent();
                    debugs.WARN("Failed to verify publication due to error: ".concat(e_1));
                    return [2 /*return*/, [false, String(e_1)]];
                case 16: return [2 /*return*/];
            }
        });
    });
}
exports.verifyPublication = verifyPublication;
