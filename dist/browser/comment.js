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
exports.CommentEdit = exports.Comment = void 0;
var assert_1 = __importDefault(require("assert"));
var util_1 = require("./util");
var publication_1 = __importDefault(require("./publication"));
var debug_1 = __importDefault(require("debug"));
var pages_1 = require("./pages");
var sort_handler_1 = require("./sort-handler");
var debug = (0, debug_1.default)("plebbit-js:comment");
var DEFAULT_UPDATE_INTERVAL_MS = 60000; // One minute
var Comment = /** @class */ (function (_super) {
    __extends(Comment, _super);
    function Comment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Comment.prototype._initProps = function (props) {
        _super.prototype._initProps.call(this, props);
        this.postCid = props["postCid"];
        this.cid = props["cid"];
        this.parentCid = props["parentCid"];
        this.ipnsName = props["ipnsName"]; // each post needs its own IPNS record for its mutable data like edits, vote counts, comments
        this.ipnsKeyName = props["ipnsKeyName"];
        this.depth = props["depth"];
        this.setPreviousCid(props["previousCid"]);
        // CommentUpdate props
        this._initCommentUpdate(props);
    };
    Comment.prototype._initCommentUpdate = function (props) {
        this.upvoteCount = props["upvoteCount"];
        this.downvoteCount = props["downvoteCount"];
        this.replyCount = props["replyCount"];
        this.updatedAt = props["updatedAt"];
        this.replies =
            props["replies"] instanceof Object && JSON.stringify(props["replies"]) !== "{}"
                ? new pages_1.Pages(__assign(__assign({}, props["replies"]), { subplebbit: this.subplebbit }))
                : undefined;
        // Comment Edit props
        this.originalContent =
            props["originalContent"] ||
                this.originalContent ||
                (props["content"] && props["editSignature"] ? this.content : undefined);
        this.content = props["content"] || this.content;
        assert_1.default.notEqual(this.content, this.originalContent, "Content and original content can't be equal to each other");
        this.editSignature = (0, util_1.parseJsonIfString)(props["editSignature"]);
        this.editTimestamp = props["editTimestamp"];
        this.editReason = props["editReason"];
        this.deleted = props["deleted"];
        this.spoiler = props["spoiler"];
        this.pinned = props["pinned"];
        this.locked = props["locked"];
        this.removed = props["removed"];
        this.moderatorReason = props["moderatorReason"];
    };
    Comment.prototype.toJSON = function () {
        return __assign(__assign(__assign({}, this.toJSONIpfs()), this.toJSONCommentUpdate()), { cid: this.cid, originalContent: this.originalContent });
    };
    Comment.prototype.toJSONIpfs = function () {
        return __assign(__assign({}, this.toJSONSkeleton()), { previousCid: this.previousCid, ipnsName: this.ipnsName, postCid: this.postCid, depth: this.depth });
    };
    Comment.prototype.toJSONSkeleton = function () {
        return __assign(__assign({}, _super.prototype.toJSONSkeleton.call(this)), { content: this.content, parentCid: this.parentCid });
    };
    Comment.prototype.toJSONForDb = function (challengeRequestId) {
        var _a;
        var json = this.toJSON();
        ["replyCount", "upvoteCount", "downvoteCount", "replies", "author"].forEach(function (key) { return delete json[key]; });
        json["authorAddress"] = (_a = this === null || this === void 0 ? void 0 : this.author) === null || _a === void 0 ? void 0 : _a.address;
        json["challengeRequestId"] = challengeRequestId;
        json["ipnsKeyName"] = this.ipnsKeyName;
        json["signature"] = JSON.stringify(this.signature);
        return (0, util_1.removeKeysWithUndefinedValues)(json);
    };
    Comment.prototype.toJSONCommentUpdate = function () {
        return __assign(__assign({ replyCount: this.replyCount, upvoteCount: this.upvoteCount, downvoteCount: this.downvoteCount, replies: this.replies }, (this.originalContent ? { content: this.content } : undefined)), { updatedAt: this.updatedAt, editSignature: this.editSignature, editTimestamp: this.editTimestamp, editReason: this.editReason, deleted: this.deleted, spoiler: this.spoiler, pinned: this.pinned, locked: this.locked, removed: this.removed, moderatorReason: this.moderatorReason });
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
    Comment.prototype.setOriginalContent = function (newOriginalContent) {
        this.originalContent = newOriginalContent;
    };
    Comment.prototype.setReplies = function (sortedReplies, sortedRepliesCids) {
        var _a;
        if (sortedReplies)
            this.replies = new pages_1.Pages({
                // @ts-ignore
                pages: (_a = {}, _a[sort_handler_1.REPLIES_SORT_TYPES.TOP_ALL.type] = sortedReplies[sort_handler_1.REPLIES_SORT_TYPES.TOP_ALL.type], _a),
                pageCids: sortedRepliesCids,
                subplebbit: this.subplebbit
            });
    };
    Comment.prototype.updateOnce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(this.ipnsName, this.subplebbit.plebbit)];
                    case 1:
                        res = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        debug("Failed to load comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") due to error = ").concat(e_1.message));
                        return [3 /*break*/, 3];
                    case 3:
                        if (!res)
                            debug("Comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") is not pointing to any file"));
                        else {
                            if (res.updatedAt !== this.emittedAt) {
                                debug("Comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") received a new update. Emitting an update event..."));
                                this.emittedAt = res.updatedAt;
                                this._initCommentUpdate(res);
                                this.emit("update", this);
                            } else {
                                debug("Comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") has no new update"));
                                this._initCommentUpdate(res);
                            }
                            return [2 /*return*/, this];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Comment.prototype.update = function (updateIntervalMs) {
        if (updateIntervalMs === void 0) { updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS; }
        (0, assert_1.default)(this.ipnsName, "Comment need to have ipnsName field to poll updates");
        debug("Starting to poll updates for comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") every ").concat(updateIntervalMs, " milliseconds"));
        if (this._updateInterval)
            clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.updateOnce.bind(this), updateIntervalMs);
        return this.updateOnce();
    };
    Comment.prototype.stop = function () {
        clearInterval(this._updateInterval);
    };
    Comment.prototype.edit = function (commentUpdateOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(this.ipnsKeyName, "You need to have commentUpdate");
                        this._initCommentUpdate(commentUpdateOptions);
                        return [4 /*yield*/, this.subplebbit.plebbit.ipfsClient.add(JSON.stringify(this.toJSONCommentUpdate()))];
                    case 1:
                        file = _a.sent();
                        debug("Added comment (".concat(this.cid, ") IPNS (").concat(this.ipnsName, ") to ipfs, cid is ").concat(file.path));
                        return [4 /*yield*/, this.subplebbit.plebbit.ipfsClient.name.publish(file["cid"], {
                            lifetime: "72h",
                            key: this.ipnsKeyName,
                            allowOffline: true
                        })];
                    case 2:
                        _a.sent();
                        debug("Linked comment (".concat(this.cid, ") ipns name(").concat(this.ipnsName, ") to ipfs file (").concat(file.path, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    return Comment;
}(publication_1.default));
exports.Comment = Comment;
var CommentEdit = /** @class */ (function (_super) {
    __extends(CommentEdit, _super);
    function CommentEdit() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CommentEdit.prototype._initProps = function (props) {
        _super.prototype._initProps.call(this, props);
        this.commentCid = props["commentCid"];
    };
    CommentEdit.prototype.toJSON = function () {
        return __assign(__assign({}, _super.prototype.toJSON.call(this)), { commentCid: this.commentCid });
    };
    CommentEdit.prototype.toJSONForDb = function (challengeRequestId) {
        var json = _super.prototype.toJSONForDb.call(this, challengeRequestId);
        ["authorAddress", "challengeRequestId", "ipnsKeyName", "signature", "commentCid"].forEach(function (key) { return delete json[key]; });
        json["cid"] = this.commentCid;
        return (0, util_1.removeKeysWithUndefinedValues)(json);
    };
    return CommentEdit;
}(Comment));
exports.CommentEdit = CommentEdit;
