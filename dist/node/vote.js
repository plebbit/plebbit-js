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
var publication_1 = __importDefault(require("./publication"));
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var signer_1 = require("./signer");
var util_1 = require("./util");
var Vote = /** @class */ (function (_super) {
    __extends(Vote, _super);
    function Vote(props, plebbit) {
        var _this = _super.call(this, props, plebbit) || this;
        _this.commentCid = props.commentCid;
        _this.vote = props.vote; // Either 1, 0, -1 (upvote, cancel vote, downvote)
        // public method should be bound
        _this.publish = _this.publish.bind(_this);
        return _this;
    }
    Vote.prototype.toJSONPubsubMessagePublication = function () {
        return __assign(__assign({}, _super.prototype.toJSONPubsubMessagePublication.call(this)), { commentCid: this.commentCid, vote: this.vote });
    };
    Vote.prototype.toJSON = function () {
        return this.toJSONPubsubMessagePublication();
    };
    Vote.prototype.getType = function () {
        return "vote";
    };
    Vote.prototype.toJSONForDb = function (challengeRequestId) {
        return __assign(__assign({}, this.toJSON()), { authorAddress: this.author.address, challengeRequestId: challengeRequestId });
    };
    Vote.prototype._validateSignature = function () {
        return __awaiter(this, void 0, void 0, function () {
            var voteObj, signatureValidity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        voteObj = JSON.parse(JSON.stringify(this.toJSONPubsubMessagePublication()));
                        return [4 /*yield*/, (0, signer_1.verifyVote)(voteObj, this._plebbit.resolveAuthorAddresses, this._clientsManager, true)];
                    case 1:
                        signatureValidity = _a.sent();
                        if (!signatureValidity.valid)
                            (0, util_1.throwWithErrorCode)("ERR_SIGNATURE_IS_INVALID", { signatureValidity: signatureValidity });
                        return [2 /*return*/];
                }
            });
        });
    };
    Vote.prototype.publish = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (![-1, 0, 1].includes(this.vote))
                            (0, util_1.throwWithErrorCode)("ERR_PUBLICATION_MISSING_FIELD", { vote: this.vote });
                        if (!is_ipfs_1.default.cid(this.commentCid))
                            (0, util_1.throwWithErrorCode)("ERR_CID_IS_INVALID", { commentCid: this.commentCid });
                        return [4 /*yield*/, this._validateSignature()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, _super.prototype.publish.call(this)];
                }
            });
        });
    };
    return Vote;
}(publication_1.default));
exports.default = Vote;
//# sourceMappingURL=vote.js.map