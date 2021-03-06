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
exports.Page = exports.Pages = void 0;
var util_1 = require("./util");
var signer_1 = require("./signer");
var assert_1 = __importDefault(require("assert"));
var debugs = (0, util_1.getDebugLevels)("pages");
var Pages = /** @class */ (function () {
    function Pages(props) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this.subplebbit = props.subplebbit;
        (0, assert_1.default)(this.subplebbit.address, "Address of subplebbit is needed to verify pages");
    }
    Pages.prototype.getPage = function (pageCid) {
        return __awaiter(this, void 0, void 0, function () {
            var page, _a, verifyComment;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = Page.bind;
                        return [4 /*yield*/, (0, util_1.loadIpfsFileAsJson)(pageCid, this.subplebbit.plebbit)];
                    case 1:
                        page = new (_a.apply(Page, [void 0, _b.sent()]))();
                        verifyComment = function (comment, parentComment) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, signatureIsVerified, failedVerificationReason, preloadedCommentsChunks;
                            var _this = this;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        assert_1.default.equal(comment.subplebbitAddress, this.subplebbit.address, "Comment in page should be under the same subplebbit");
                                        if (parentComment)
                                            assert_1.default.equal(parentComment.cid, comment.parentCid, "Comment under parent comment/post should have parentCid initialized");
                                        debugs.TRACE("In page (".concat(pageCid, "), Attempting to verify comment (").concat(comment.cid, ") under parent comment (").concat(parentComment === null || parentComment === void 0 ? void 0 : parentComment.cid, ")"));
                                        return [4 /*yield*/, (0, signer_1.verifyPublication)(comment, this.subplebbit.plebbit, "comment")];
                                    case 1:
                                        _a = _b.sent(), signatureIsVerified = _a[0], failedVerificationReason = _a[1];
                                        assert_1.default.equal(signatureIsVerified, true, "Signature of published comment should be valid, Failed verification reason is ".concat(failedVerificationReason));
                                        debugs.TRACE("Comment (".concat(comment.cid, ") has been verified. Will attempt to verify its ").concat(comment.replyCount, " replies"));
                                        if (!comment.replies) return [3 /*break*/, 3];
                                        preloadedCommentsChunks = Object.keys(comment.replies.pages).map(function (sortType) { return comment.replies.pages[sortType].comments; });
                                        return [4 /*yield*/, Promise.all(preloadedCommentsChunks.map(function (preloadedComments) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, Promise.all(preloadedComments.map(function (preloadedComment) { return verifyComment(preloadedComment, comment); }))];
                                                    case 1: return [2 /*return*/, _a.sent()];
                                                }
                                            }); }); }))];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, Promise.all(page.comments.map(function (comment) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, verifyComment(comment, undefined)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, page];
                }
            });
        });
    };
    Pages.prototype.toJSON = function () {
        return { pages: this.pages, pageCids: this.pageCids };
    };
    return Pages;
}());
exports.Pages = Pages;
var Page = /** @class */ (function () {
    function Page(props) {
        this.comments = props.comments;
        this.nextCid = props.nextCid;
    }
    Page.prototype.toJSON = function () {
        return {
            comments: this.comments.map(function (c) { return c.toJSON(); }),
            nextCid: this.nextCid
        };
    };
    return Page;
}());
exports.Page = Page;
