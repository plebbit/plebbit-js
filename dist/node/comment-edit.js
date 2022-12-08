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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentEdit = exports.AUTHOR_EDIT_FIELDS = exports.MOD_EDIT_FIELDS = void 0;
var publication_1 = __importDefault(require("./publication"));
var signatures_1 = require("./signer/signatures");
var util_1 = require("./util");
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var PUBLICATION_FIELDS = [
    "author",
    "protocolVersion",
    "signature",
    "subplebbitAddress",
    "timestamp"
];
// Storing fields here to check before publishing if CommentEdit has proper field for either author or mod.
exports.MOD_EDIT_FIELDS = __spreadArray(__spreadArray([], PUBLICATION_FIELDS, true), [
    "commentCid",
    "flair",
    "spoiler",
    "pinned",
    "locked",
    "removed",
    "moderatorReason",
    "commentAuthor"
], false);
exports.AUTHOR_EDIT_FIELDS = __spreadArray(__spreadArray([], PUBLICATION_FIELDS, true), [
    "commentCid",
    "content",
    "flair",
    "spoiler",
    "reason",
    "deleted"
], false);
var CommentEdit = /** @class */ (function (_super) {
    __extends(CommentEdit, _super);
    function CommentEdit(props, plebbit) {
        return _super.call(this, props, plebbit) || this;
    }
    CommentEdit.prototype._initProps = function (props) {
        _super.prototype._initProps.call(this, props);
        this.commentCid = props.commentCid;
        this.content = props.content;
        this.reason = props.reason;
        this.deleted = props.deleted;
        this.flair = props.flair;
        this.spoiler = props.spoiler;
        this.pinned = props.pinned;
        this.locked = props.pinned;
        this.removed = props.removed;
        this.moderatorReason = props.moderatorReason;
        this.commentAuthor = props.commentAuthor;
    };
    CommentEdit.prototype.toJSON = function () {
        return __assign(__assign({}, _super.prototype.toJSON.call(this)), { commentCid: this.commentCid, content: this.content, reason: this.reason, deleted: this.deleted, flair: this.flair, spoiler: this.spoiler, pinned: this.pinned, locked: this.locked, removed: this.removed, moderatorReason: this.moderatorReason, commentAuthor: this.commentAuthor });
    };
    CommentEdit.prototype.toJSONForDb = function (challengeRequestId) {
        return (0, util_1.removeKeysWithUndefinedValues)(__assign(__assign({}, this.toJSON()), { author: JSON.stringify(this.author), authorAddress: this.author.address, challengeRequestId: challengeRequestId }));
    };
    CommentEdit.prototype.getType = function () {
        return "commentedit";
    };
    CommentEdit.prototype.publish = function () {
        return __awaiter(this, void 0, void 0, function () {
            var signatureValidity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // TODO if publishing with content,reason, deleted, verify that publisher is original author
                        if (!is_ipfs_1.default.cid(this.commentCid))
                            (0, util_1.throwWithErrorCode)("ERR_CID_IS_INVALID", "commentEdit.publish: commentCid (".concat(this.commentCid, ") is invalid as a CID"));
                        return [4 /*yield*/, (0, signatures_1.verifyCommentEdit)(this.toJSON(), this.plebbit, true)];
                    case 1:
                        signatureValidity = _a.sent();
                        if (!signatureValidity.valid)
                            (0, util_1.throwWithErrorCode)("ERR_SIGNATURE_IS_INVALID", "commentEdit.publish: Failed to publish due to invalid signature. Reason=".concat(signatureValidity.reason));
                        return [2 /*return*/, _super.prototype.publish.call(this)];
                }
            });
        });
    };
    return CommentEdit;
}(publication_1.default));
exports.CommentEdit = CommentEdit;
//# sourceMappingURL=comment-edit.js.map