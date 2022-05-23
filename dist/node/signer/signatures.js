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
exports.verifyPublication = exports.signPublication = exports.Signature = void 0;
var debug_1 = __importDefault(require("debug"));
var util_1 = require("./util");
var cborg_1 = require("cborg");
var to_string_1 = require("uint8arrays/to-string");
var from_string_1 = require("uint8arrays/from-string");
var assert_1 = __importDefault(require("assert"));
var peer_id_1 = __importDefault(require("peer-id"));
var util_2 = require("../util");
var publication_1 = __importDefault(require("../publication"));
var debug = (0, debug_1.default)("plebbit-js:signer:signatures");
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
function signPublication(publication, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var keyPair, fieldsToSign, publicationSignFields, commentEncoded, signatureData, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, util_1.getKeyPairFromPrivateKeyPem)(signer.privateKey, "")];
                case 1:
                    keyPair = _b.sent();
                    fieldsToSign = getFieldsToSign(publication);
                    debug("Will sign fields ".concat(JSON.stringify(fieldsToSign)));
                    publicationSignFields = (0, util_2.keepKeys)(publication, fieldsToSign);
                    commentEncoded = (0, cborg_1.encode)(publicationSignFields);
                    _a = to_string_1.toString;
                    return [4 /*yield*/, keyPair.sign(commentEncoded)];
                case 2:
                    signatureData = _a.apply(void 0, [_b.sent(), "base64"]);
                    debug("Publication been signed, signature data is (".concat(signatureData, ")"));
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
function verifyPublication(publication) {
    return __awaiter(this, void 0, void 0, function () {
        var verifyAuthor, verifyPublicationSignature, _a, publicationJson, originalSignatureObj, editedSignatureObj, _b, e_1;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    verifyAuthor = function (signature, author) { return __awaiter(_this, void 0, void 0, function () {
                        var peerId;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKeyPem)(signature.publicKey)];
                                case 1:
                                    peerId = _a.sent();
                                    assert_1.default.equal(peerId.equals(peer_id_1.default.createFromB58String(author.address)), true, "comment.author.address doesn't match comment.signature.publicKey");
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    verifyPublicationSignature = function (signature, publicationToBeVerified) { return __awaiter(_this, void 0, void 0, function () {
                        var peerId, commentWithFieldsToSign, commentEncoded, signatureIsValid;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, util_1.getPeerIdFromPublicKeyPem)(signature.publicKey)];
                                case 1:
                                    peerId = _a.sent();
                                    commentWithFieldsToSign = (0, util_2.keepKeys)(publicationToBeVerified, signature.signedPropertyNames);
                                    commentEncoded = (0, cborg_1.encode)(commentWithFieldsToSign);
                                    return [4 /*yield*/, peerId.pubKey.verify(commentEncoded, (0, from_string_1.fromString)(signature.signature, "base64"))];
                                case 2:
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
                    debug("Attempting to verify a comment that has been edited. Will verify comment.author,  comment.signature and comment.editSignature");
                    if (!publication.author) return [3 /*break*/, 3];
                    return [4 /*yield*/, verifyAuthor(publication.signature, publication.author)];
                case 2:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = undefined;
                    _c.label = 4;
                case 4:
                    _a;
                    publicationJson = publication instanceof publication_1.default ? publication.toJSON() : publication;
                    originalSignatureObj = __assign(__assign({}, publicationJson), { content: publication.originalContent });
                    debug("Attempting to verify comment.signature");
                    return [4 /*yield*/, verifyPublicationSignature(publication.signature, originalSignatureObj)];
                case 5:
                    _c.sent();
                    debug("Attempting to verify comment.signature");
                    editedSignatureObj = __assign(__assign({}, publicationJson), { commentCid: publication.cid });
                    return [4 /*yield*/, verifyPublicationSignature(publication.editSignature, editedSignatureObj)];
                case 6:
                    _c.sent();
                    return [3 /*break*/, 14];
                case 7:
                    if (!(publication.commentCid && publication.content)) return [3 /*break*/, 9];
                    // Verify CommentEdit
                    debug("Attempting to verify CommentEdit");
                    return [4 /*yield*/, verifyPublicationSignature(publication.editSignature, publication)];
                case 8:
                    _c.sent();
                    return [3 /*break*/, 14];
                case 9:
                    debug("Attempting to verify post/comment/vote");
                    if (!publication.author) return [3 /*break*/, 11];
                    return [4 /*yield*/, verifyAuthor(publication.signature, publication.author)];
                case 10:
                    _b = _c.sent();
                    return [3 /*break*/, 12];
                case 11:
                    _b = undefined;
                    _c.label = 12;
                case 12:
                    _b;
                    return [4 /*yield*/, verifyPublicationSignature(publication.signature, publication)];
                case 13:
                    _c.sent();
                    _c.label = 14;
                case 14:
                    debug("Publication has been verified");
                    return [2 /*return*/, [true]];
                case 15:
                    e_1 = _c.sent();
                    debug("Failed to verify publication");
                    return [2 /*return*/, [false, String(e_1)]];
                case 16: return [2 /*return*/];
            }
        });
    });
}
exports.verifyPublication = verifyPublication;
