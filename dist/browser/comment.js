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
var assert_1 = __importDefault(require("assert"));
var util_1 = require("./util");
var publication_1 = __importDefault(require("./publication"));
var pages_1 = require("./pages");
var signer_1 = require("./signer");
var author_1 = __importDefault(require("./author"));
var debugs = (0, util_1.getDebugLevels)("comment");
var DEFAULT_UPDATE_INTERVAL_MS = 60000; // One minute
var Comment = /** @class */ (function (_super) {
    __extends(Comment, _super);
    function Comment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Comment.prototype._initProps = function (props) {
        _super.prototype._initProps.call(this, props);
        this.postCid = props.postCid;
        this.cid = props.cid;
        this.parentCid = props.parentCid;
        this.ipnsName = props.ipnsName; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.ipnsKeyName = props.ipnsKeyName;
        this.depth = props.depth;
        this.setPreviousCid(props.previousCid);
        // CommentUpdate props
        this._initCommentUpdate(props);
        this._mergeFields(props);
        // these functions might get separated from their `this` when used
        this.publish = this.publish.bind(this);
        this.update = this.update.bind(this);
        this.stop = this.stop.bind(this);
    };
    Comment.prototype._initCommentUpdate = function (props) {
        var _a;
        this.upvoteCount = props.upvoteCount;
        this.downvoteCount = props.downvoteCount;
        this.replyCount = props.replyCount;
        this.updatedAt = props.updatedAt;
        this.setReplies(props.replies);
        this.deleted = (_a = props.authorEdit) === null || _a === void 0 ? void 0 : _a.deleted;
        this.spoiler = props.spoiler;
        this.pinned = props.pinned;
        this.locked = props.locked;
        this.removed = props.removed;
        this.moderatorReason = props.moderatorReason;
        this.authorEdit = props.authorEdit;
        this.protocolVersion = props.protocolVersion;
    };
    Comment.prototype._mergeFields = function (props) {
        // TODO merge flairs, deleted, content, author here
        // TODO move original author and content to comment.original if needed
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var original = {};
        original["content"] =
            ((_a = props.original) === null || _a === void 0 ? void 0 : _a.content) || ((_b = this.original) === null || _b === void 0 ? void 0 : _b.content) || (props.content && ((_c = props.authorEdit) === null || _c === void 0 ? void 0 : _c.content) ? this.content : undefined);
        original["author"] =
            ((_d = props.original) === null || _d === void 0 ? void 0 : _d.author) || ((_e = this.original) === null || _e === void 0 ? void 0 : _e.author) || (props.author && props.authorEdit ? props.author : undefined);
        original["flair"] =
            ((_f = props.original) === null || _f === void 0 ? void 0 : _f.flair) || ((_g = this.original) === null || _g === void 0 ? void 0 : _g.flair) || (props.flair && ((_h = props.authorEdit) === null || _h === void 0 ? void 0 : _h.flair) ? props.flair : undefined);
        this.content = ((_j = props.authorEdit) === null || _j === void 0 ? void 0 : _j.content) || props.content || this.content;
        this.author = new author_1.default(__assign(__assign({}, props.author), this.author));
        for (var _i = 0, _k = Object.keys(original); _i < _k.length; _i++) {
            var key = _k[_i];
            this[key] &&
                original[key] &&
                assert_1.default.notEqual(this[key], original[key], "".concat(key, " and original ").concat(key, " can't be equal to each other"));
        }
        if (JSON.stringify(original) !== "{}")
            this.original = original;
    };
    Comment.prototype.getType = function () {
        return "comment";
    };
    Comment.prototype.toJSON = function () {
        return __assign(__assign(__assign({}, this.toJSONIpfs()), (this.updatedAt ? this.toJSONCommentUpdate() : undefined)), { cid: this.cid, original: this.original, author: this.author.toJSON() });
    };
    Comment.prototype.toJSONIpfs = function () {
        return __assign(__assign({}, this.toJSONSkeleton()), { previousCid: this.previousCid, ipnsName: this.ipnsName, postCid: this.postCid, depth: this.depth });
    };
    Comment.prototype.toJSONSkeleton = function () {
        return __assign(__assign({}, _super.prototype.toJSONSkeleton.call(this)), { content: this.content, parentCid: this.parentCid, flair: this.flair, spoiler: this.spoiler });
    };
    Comment.prototype.toJSONForDb = function (challengeRequestId) {
        var _a;
        var json = this.toJSON();
        ["replyCount", "upvoteCount", "downvoteCount", "replies"].forEach(function (key) { return delete json[key]; });
        json["authorAddress"] = (_a = this === null || this === void 0 ? void 0 : this.author) === null || _a === void 0 ? void 0 : _a.address;
        json["challengeRequestId"] = challengeRequestId;
        json["ipnsKeyName"] = this.ipnsKeyName;
        // @ts-ignore
        json["signature"] = JSON.stringify(this.signature);
        return (0, util_1.removeKeysWithUndefinedValues)(json);
    };
    Comment.prototype.toJSONCommentUpdate = function () {
        (0, assert_1.default)(typeof this.upvoteCount === "number" &&
            typeof this.downvoteCount === "number" &&
            typeof this.replyCount === "number" &&
            typeof this.updatedAt === "number", "Fields are needed to export a CommentUpdate JSON");
        return {
            upvoteCount: this.upvoteCount,
            downvoteCount: this.downvoteCount,
            replyCount: this.replyCount,
            authorEdit: this.authorEdit,
            replies: this.replies,
            flair: this.flair,
            spoiler: this.spoiler,
            pinned: this.pinned,
            locked: this.locked,
            removed: this.removed,
            moderatorReason: this.moderatorReason,
            updatedAt: this.updatedAt,
            protocolVersion: this.protocolVersion,
            author: { banExpiresAt: this.author.banExpiresAt, flair: this.flair }
        };
    };
    Comment.prototype.setCommentIpnsKey = function (ipnsKey) {
        // Contains name and id
        this.ipnsName = ipnsKey["id"] || ipnsKey["Id"];
        this.ipnsKeyName = ipnsKey["name"] || ipnsKey["Name"];
    };
    Comment.prototype.setPostCid = function (newPostCid) {
        this.postCid = newPostCid;
    };
    Comment.prototype.setCid = function (newCid) {
        this.cid = newCid;
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
    Comment.prototype.setReplies = function (replies) {
        if (replies)
            this.replies = new pages_1.Pages({
                pages: { topAll: replies.pages.topAll },
                pageCids: replies.pageCids,
                subplebbit: this.subplebbit
            });
    };
    Comment.prototype.updateOnce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, e_1, _a, verified, failedVerificationReason;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, assert_1.default)(this.ipnsName, "Comment needs to have ipnsName before updating");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(this.ipnsName, this.subplebbit.plebbit)];
                    case 2:
                        res = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        debugs.WARN("Failed to load comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") due to error = ").concat(e_1.message));
                        return [2 /*return*/];
                    case 4:
                        if (!(res && (!this.updatedAt || !(0, util_1.shallowEqual)(this.toJSONCommentUpdate(), res, ["signature"])))) return [3 /*break*/, 6];
                        debugs.DEBUG("Comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") received a new update. Will verify signature"));
                        return [4 /*yield*/, (0, signer_1.verifyPublication)(res, this.subplebbit.plebbit, "commentupdate")];
                    case 5:
                        _a = _b.sent(), verified = _a[0], failedVerificationReason = _a[1];
                        if (!verified) {
                            debugs.ERROR("Comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") signature is invalid. Will not update: ").concat(failedVerificationReason));
                            return [2 /*return*/];
                        }
                        this._initCommentUpdate(res);
                        this._mergeFields(this.toJSON());
                        this.emit("update", this);
                        return [3 /*break*/, 7];
                    case 6:
                        debugs.TRACE("Comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") has no new update"));
                        this._initCommentUpdate(res);
                        _b.label = 7;
                    case 7: return [2 /*return*/, this];
                }
            });
        });
    };
    Comment.prototype.update = function (updateIntervalMs) {
        if (updateIntervalMs === void 0) { updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS; }
        (0, assert_1.default)(this.ipnsName, "Comment need to have ipnsName field to poll updates");
        debugs.DEBUG("Starting to poll updates for comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") every ").concat(updateIntervalMs, " milliseconds"));
        if (this._updateInterval)
            clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.updateOnce.bind(this), updateIntervalMs);
        return this.updateOnce();
    };
    Comment.prototype.stop = function () {
        clearInterval(this._updateInterval);
    };
    Comment.prototype.edit = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, validSignature, failedVerificationReason, file;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, assert_1.default)(this.ipnsKeyName && this.subplebbit.plebbit.ipfsClient, "You need to have commentUpdate and ipfs client defined");
                        return [4 /*yield*/, (0, signer_1.verifyPublication)(options, this.subplebbit.plebbit, "commentupdate")];
                    case 1:
                        _a = _b.sent(), validSignature = _a[0], failedVerificationReason = _a[1];
                        (0, assert_1.default)(validSignature, "Failed to verify CommentUpdate (".concat(JSON.stringify(options), ") due to: ").concat(failedVerificationReason));
                        this._initCommentUpdate(options);
                        this._mergeFields(this.toJSON());
                        return [4 /*yield*/, this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(__assign(__assign({}, this.toJSONCommentUpdate()), { signature: options.signature })))];
                    case 2:
                        file = _b.sent();
                        return [4 /*yield*/, this.subplebbit.plebbit.ipfsClient.name.publish(file["cid"], {
                                lifetime: "72h",
                                key: this.ipnsKeyName,
                                allowOffline: true
                            })];
                    case 3:
                        _b.sent();
                        debugs.TRACE("Linked comment (".concat(this.cid, ") ipns name(").concat(this.ipnsName, ") to ipfs file (").concat(file.path, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    Comment.prototype.publish = function (userOptions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, assert_1.default)(this.content, "Need content field to publish comment");
                return [2 /*return*/, _super.prototype.publish.call(this, userOptions)];
            });
        });
    };
    return Comment;
}(publication_1.default));
exports.Comment = Comment;
