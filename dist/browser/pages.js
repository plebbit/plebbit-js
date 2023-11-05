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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.PostsPages = exports.RepliesPages = exports.BasePages = void 0;
var util_1 = require("./util");
var signatures_1 = require("./signer/signatures");
var lodash_1 = __importDefault(require("lodash"));
var assert_1 = __importDefault(require("assert"));
var pages_client_manager_1 = require("./clients/pages-client-manager");
var plebbit_error_1 = require("./plebbit-error");
var BasePages = /** @class */ (function () {
    function BasePages(props) {
        this._plebbit = props.plebbit;
        this._initClientsManager();
        this.updateProps(props);
    }
    BasePages.prototype.updateProps = function (props) {
        this.pages = props.pages;
        this.pageCids = props.pageCids;
        this._plebbit = props.plebbit;
        this._subplebbitAddress = props.subplebbitAddress;
        this._parentCid = props.parentCid;
        this._pagesIpfs = props.pagesIpfs;
        if (this.pageCids)
            this._clientsManager.updatePageCidsToSortTypes(this.pageCids);
    };
    BasePages.prototype._initClientsManager = function () {
        throw Error("This function should be overridden");
    };
    BasePages.prototype._fetchAndVerifyPage = function (pageCid) {
        return __awaiter(this, void 0, void 0, function () {
            var pageIpfs, signatureValidity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(typeof this._subplebbitAddress === "string", "Subplebbit address needs to be defined under page");
                        return [4 /*yield*/, this._clientsManager.fetchPage(pageCid)];
                    case 1:
                        pageIpfs = _a.sent();
                        if (!!this._plebbit.plebbitRpcClient) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, signatures_1.verifyPage)(pageIpfs, this._plebbit.resolveAuthorAddresses, this._clientsManager, this._subplebbitAddress, this._parentCid, true)];
                    case 2:
                        signatureValidity = _a.sent();
                        if (!signatureValidity.valid)
                            throw new plebbit_error_1.PlebbitError("ERR_PAGE_SIGNATURE_IS_INVALID", {
                                signatureValidity: signatureValidity,
                                parentCid: this._parentCid,
                                subplebbitAddress: this._subplebbitAddress,
                                pageIpfs: pageIpfs,
                                pageCid: pageCid
                            });
                        _a.label = 3;
                    case 3: return [2 /*return*/, pageIpfs];
                }
            });
        });
    };
    BasePages.prototype.getPage = function (pageCid) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = util_1.parsePageIpfs;
                        return [4 /*yield*/, this._fetchAndVerifyPage(pageCid)];
                    case 1: return [4 /*yield*/, _a.apply(void 0, [_b.sent(), this._plebbit])];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    BasePages.prototype.toJSON = function () {
        if (!this.pages)
            return undefined;
        var pagesJson = lodash_1.default.mapValues(this.pages, function (page) {
            var commentsJson = page.comments.map(function (comment) { return comment.toJSONMerged(); });
            return { comments: commentsJson, nextCid: page.nextCid };
        });
        return { pages: pagesJson, pageCids: this.pageCids };
    };
    BasePages.prototype.toJSONIpfs = function () {
        if (!this.pages)
            return undefined;
        (0, assert_1.default)(this._pagesIpfs);
        return {
            pages: this._pagesIpfs,
            pageCids: this.pageCids
        };
    };
    return BasePages;
}());
exports.BasePages = BasePages;
var RepliesPages = /** @class */ (function (_super) {
    __extends(RepliesPages, _super);
    function RepliesPages(props) {
        return _super.call(this, props) || this;
    }
    RepliesPages.prototype.updateProps = function (props) {
        _super.prototype.updateProps.call(this, props);
    };
    RepliesPages.prototype._initClientsManager = function () {
        this._clientsManager = new pages_client_manager_1.RepliesPagesClientsManager(this);
        this.clients = this._clientsManager.clients;
    };
    // TODO override toJSON, toJSONIpfs
    RepliesPages.prototype.toJSON = function () {
        return _super.prototype.toJSON.call(this);
    };
    return RepliesPages;
}(BasePages));
exports.RepliesPages = RepliesPages;
var PostsPages = /** @class */ (function (_super) {
    __extends(PostsPages, _super);
    function PostsPages(props) {
        return _super.call(this, props) || this;
    }
    PostsPages.prototype.updateProps = function (props) {
        _super.prototype.updateProps.call(this, props);
    };
    PostsPages.prototype._initClientsManager = function () {
        this._clientsManager = new pages_client_manager_1.PostsPagesClientsManager(this);
        this.clients = this._clientsManager.clients;
    };
    PostsPages.prototype.toJSON = function () {
        return _super.prototype.toJSON.call(this);
    };
    return PostsPages;
}(BasePages));
exports.PostsPages = PostsPages;
//# sourceMappingURL=pages.js.map