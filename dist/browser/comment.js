"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Comment = void 0;
var util_1 = require("./util");
var publication_1 = __importDefault(require("./publication"));
var pages_1 = require("./pages");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var lodash_1 = __importDefault(require("lodash"));
var signatures_1 = require("./signer/signatures");
var assert_1 = __importDefault(require("assert"));
var DEFAULT_UPDATE_INTERVAL_MS = 60000; // One minute
var Comment = /** @class */ (function (_super) {
    __extends(Comment, _super);
    function Comment(props, plebbit) {
        var _this = _super.call(this, props, plebbit) || this;
        _this._updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS;
        _this._setUpdatingState("stopped");
        // these functions might get separated from their `this` when used
        _this.publish = _this.publish.bind(_this);
        _this.update = _this.update.bind(_this);
        _this.stop = _this.stop.bind(_this);
        return _this;
    }
    Comment.prototype._initProps = function (props) {
        // This function is called once at in the constructor
        _super.prototype._initProps.call(this, props);
        this.postCid = props.postCid;
        this.setCid(props.cid);
        this.parentCid = props.parentCid;
        this.ipnsName = props.ipnsName; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.ipnsKeyName = props.ipnsKeyName;
        this.depth = props.depth;
        this.link = props.link;
        this.title = props.title;
        this.thumbnailUrl = props.thumbnailUrl;
        this.content = props.content;
        this.original = props.original;
        this.spoiler = props.spoiler;
        this.protocolVersion = props.protocolVersion;
        this.flair = props.flair;
        this.setPreviousCid(props.previousCid);
        this.replies = new pages_1.Pages({
            pages: undefined,
            pageCids: undefined,
            subplebbit: { address: this.subplebbitAddress, plebbit: this.plebbit },
            pagesIpfs: undefined,
            parentCid: this.cid
        });
    };
    Comment.prototype._initCommentUpdate = function (props) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function () {
            var _m;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        if (!this.original)
                            this.original = (0, util_1.removeNullAndUndefinedValuesRecursively)(lodash_1.default.pick(this.toJSONPubsubMessagePublication(), ["author", "flair", "content", "protocolVersion"]));
                        this._rawCommentUpdate = props;
                        this.upvoteCount = props.upvoteCount;
                        this.downvoteCount = props.downvoteCount;
                        this.replyCount = props.replyCount;
                        this.updatedAt = props.updatedAt;
                        this.deleted = (_a = props.edit) === null || _a === void 0 ? void 0 : _a.deleted;
                        this.pinned = props.pinned;
                        this.locked = props.locked;
                        this.removed = props.removed;
                        this.reason = props.reason;
                        this.edit = props.edit;
                        this.protocolVersion = props.protocolVersion;
                        // Merge props from original comment and CommentUpdate
                        this.spoiler = (_c = (_b = props.edit) === null || _b === void 0 ? void 0 : _b.spoiler) !== null && _c !== void 0 ? _c : this.spoiler;
                        this.author.subplebbit = (_d = props.author) === null || _d === void 0 ? void 0 : _d.subplebbit;
                        if ((_e = props.edit) === null || _e === void 0 ? void 0 : _e.content)
                            this.content = props.edit.content;
                        this.flair = props.flair || ((_f = props.edit) === null || _f === void 0 ? void 0 : _f.flair) || this.flair;
                        this.author.flair = ((_h = (_g = props.author) === null || _g === void 0 ? void 0 : _g.subplebbit) === null || _h === void 0 ? void 0 : _h.flair) || ((_k = (_j = props.edit) === null || _j === void 0 ? void 0 : _j.author) === null || _k === void 0 ? void 0 : _k.flair) || ((_l = this.author) === null || _l === void 0 ? void 0 : _l.flair);
                        (0, assert_1.default)(this.cid);
                        _m = this;
                        return [4 /*yield*/, (0, util_1.parseRawPages)(props.replies, this.cid, { address: this.subplebbitAddress, plebbit: this.plebbit })];
                    case 1:
                        _m.replies = _o.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Comment.prototype.getType = function () {
        return "comment";
    };
    Comment.prototype.toJSON = function () {
        var _a;
        var base = this.cid
            ? __assign(__assign({}, this.toJSONAfterChallengeVerification()), { shortCid: this.shortCid }) : this.toJSONPubsubMessagePublication();
        return __assign(__assign({}, base), (typeof this.updatedAt === "number"
            ? {
                author: this.author.toJSONIpfsWithCommentUpdate(),
                original: this.original,
                upvoteCount: this.upvoteCount,
                downvoteCount: this.downvoteCount,
                replyCount: this.replyCount,
                updatedAt: this.updatedAt,
                deleted: this.deleted,
                pinned: this.pinned,
                locked: this.locked,
                removed: this.removed,
                reason: this.reason,
                edit: this.edit,
                protocolVersion: this.protocolVersion,
                spoiler: this.spoiler,
                flair: this.flair,
                replies: (_a = this.replies) === null || _a === void 0 ? void 0 : _a.toJSON()
            }
            : {}));
    };
    Comment.prototype.toJSONPagesIpfs = function (commentUpdate) {
        (0, assert_1.default)(this.cid && this.postCid);
        return {
            comment: __assign(__assign({}, this.toJSONIpfs()), { author: this.author.toJSONIpfs(), cid: this.cid, postCid: this.postCid }),
            update: commentUpdate
        };
    };
    Comment.prototype.toJSONIpfs = function () {
        if (typeof this.ipnsName !== "string")
            throw Error("comment.ipnsName should be defined before calling toJSONIpfs");
        if (typeof this.depth !== "number")
            throw Error("comment.depth should be defined before calling toJSONIpfs");
        return __assign(__assign({}, this.toJSONPubsubMessagePublication()), { previousCid: this.previousCid, ipnsName: this.ipnsName, postCid: this.postCid, depth: this.depth, thumbnailUrl: this.thumbnailUrl });
    };
    Comment.prototype.toJSONPubsubMessagePublication = function () {
        return __assign(__assign({}, _super.prototype.toJSONPubsubMessagePublication.call(this)), { content: this.content, parentCid: this.parentCid, flair: this.flair, spoiler: this.spoiler, link: this.link, title: this.title });
    };
    Comment.prototype.toJSONAfterChallengeVerification = function () {
        (0, assert_1.default)(this.cid && this.postCid);
        return __assign(__assign({}, this.toJSONIpfs()), { postCid: this.postCid, cid: this.cid });
    };
    Comment.prototype.toJSONCommentsTableRowInsert = function (challengeRequestId) {
        (0, assert_1.default)(this.ipnsKeyName && this.cid && this.postCid);
        return __assign(__assign({}, this.toJSONIpfs()), { postCid: this.postCid, cid: this.cid, authorAddress: this.author.address, challengeRequestId: challengeRequestId, ipnsKeyName: this.ipnsKeyName });
    };
    Comment.prototype.toJSONMerged = function () {
        var _a;
        (0, assert_1.default)(this.ipnsName && typeof this.updatedAt === "number" && this.original);
        return __assign(__assign({}, this.toJSONAfterChallengeVerification()), { author: this.author.toJSONIpfsWithCommentUpdate(), original: this.original, upvoteCount: this.upvoteCount, downvoteCount: this.downvoteCount, replyCount: this.replyCount, updatedAt: this.updatedAt, deleted: this.deleted, pinned: this.pinned, locked: this.locked, removed: this.removed, reason: this.reason, edit: this.edit, protocolVersion: this.protocolVersion, spoiler: this.spoiler, flair: this.flair, replies: (_a = this.replies) === null || _a === void 0 ? void 0 : _a.toJSON() });
    };
    Comment.prototype.setCommentIpnsKey = function (ipnsKey) {
        // Contains name and id
        this.ipnsName = ipnsKey.Id;
        this.ipnsKeyName = ipnsKey.Name;
    };
    Comment.prototype.setPostCid = function (newPostCid) {
        this.postCid = newPostCid;
    };
    Comment.prototype.setCid = function (newCid) {
        this.cid = newCid;
        if (this.cid)
            this.shortCid = (0, util_1.shortifyCid)(this.cid);
    };
    Comment.prototype.setPreviousCid = function (newPreviousCid) {
        this.previousCid = newPreviousCid;
    };
    Comment.prototype.setDepth = function (newDepth) {
        this.depth = newDepth;
    };
    Comment.prototype.setUpdatedAt = function (newUpdatedAt) {
        this.updatedAt = newUpdatedAt;
    };
    Comment.prototype.updateOnce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, res, e_1, errMsg, commentInstance, signatureValidity, errMsg;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:comment:update");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this._setUpdatingState("fetching-ipns");
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(this.ipnsName, this.plebbit, function (ipns, cid) { return _this._setUpdatingState("fetching-ipfs"); })];
                    case 2:
                        res = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this._setUpdatingState("failed");
                        errMsg = "Failed to load comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") due to error: ").concat(e_1);
                        log.error(errMsg);
                        this.emit("error", errMsg);
                        return [2 /*return*/];
                    case 4:
                        if (!(res && this.updatedAt !== res.updatedAt)) return [3 /*break*/, 7];
                        log("Comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") received a new update. Will verify signature"));
                        commentInstance = lodash_1.default.pick(this, ["cid", "signature"]);
                        return [4 /*yield*/, (0, signatures_1.verifyCommentUpdate)(res, { address: this.subplebbitAddress }, commentInstance, this.plebbit)];
                    case 5:
                        signatureValidity = _a.sent();
                        if (!signatureValidity.valid) {
                            this._setUpdatingState("failed");
                            errMsg = "Comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") signature is invalid due to '").concat(signatureValidity.reason, "'");
                            log.error(errMsg);
                            this.emit("error", errMsg);
                            return [2 /*return*/];
                        }
                        this._setUpdatingState("succeeded");
                        return [4 /*yield*/, this._initCommentUpdate(res)];
                    case 6:
                        _a.sent();
                        this.emit("update", this);
                        return [3 /*break*/, 9];
                    case 7:
                        if (!res) return [3 /*break*/, 9];
                        log.trace("Comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") has no new update"));
                        this._setUpdatingState("succeeded");
                        return [4 /*yield*/, this._initCommentUpdate(res)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Comment.prototype._setUpdatingState = function (newState) {
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    };
    Comment.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof this.ipnsName !== "string")
                    (0, util_1.throwWithErrorCode)("ERR_COMMENT_UPDATE_MISSING_IPNS_NAME");
                if (this._updateInterval)
                    return [2 /*return*/]; // Do nothing if it's already updating
                this._updateState("updating");
                this.updateOnce();
                this._updateInterval = setInterval(this.updateOnce.bind(this), this._updateIntervalMs);
                return [2 /*return*/];
            });
        });
    };
    Comment.prototype.stop = function () {
        this._updateInterval = clearInterval(this._updateInterval);
    };
    Comment.prototype._validateSignature = function () {
        return __awaiter(this, void 0, void 0, function () {
            var commentObj, signatureValidity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        commentObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication()));
                        return [4 /*yield*/, (0, signatures_1.verifyComment)(commentObj, this.plebbit, true)];
                    case 1:
                        signatureValidity = _a.sent();
                        if (!signatureValidity.valid)
                            (0, util_1.throwWithErrorCode)("ERR_SIGNATURE_IS_INVALID", "comment.publish: Failed to publish due to invalid signature. Reason=".concat(signatureValidity.reason));
                        return [2 /*return*/];
                }
            });
        });
    };
    Comment.prototype.publish = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._validateSignature()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, _super.prototype.publish.call(this)];
                }
            });
        });
    };
    return Comment;
}(publication_1.default));
exports.Comment = Comment;
