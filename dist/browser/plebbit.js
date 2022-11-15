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
exports.Plebbit = exports.pendingSubplebbitCreations = void 0;
var util_1 = require("./runtime/browser/util");
var comment_1 = require("./comment");
var post_1 = __importDefault(require("./post"));
var subplebbit_1 = require("./subplebbit");
var util_2 = require("./util");
var vote_1 = __importDefault(require("./vote"));
var signer_1 = require("./signer");
var resolver_1 = require("./resolver");
var tinycache_1 = __importDefault(require("tinycache"));
var comment_edit_1 = require("./comment-edit");
var util_3 = require("./signer/util");
var events_1 = __importDefault(require("events"));
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var err_code_1 = __importDefault(require("err-code"));
var errors_1 = require("./errors");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var version_1 = __importDefault(require("./version"));
var lodash_1 = __importDefault(require("lodash"));
var signatures_1 = require("./signer/signatures");
exports.pendingSubplebbitCreations = {};
var Plebbit = /** @class */ (function (_super) {
    __extends(Plebbit, _super);
    function Plebbit(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.ipfsHttpClientOptions = options.ipfsHttpClientOptions; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        _this.ipfsClient = _this.ipfsHttpClientOptions
            ? util_1.nativeFunctions.createIpfsClient(_this.ipfsHttpClientOptions)
            : undefined;
        _this.pubsubHttpClientOptions = options.pubsubHttpClientOptions || { url: "https://pubsubprovider.xyz/api/v0" };
        _this.pubsubIpfsClient = options.pubsubHttpClientOptions
            ? util_1.nativeFunctions.createIpfsClient(options.pubsubHttpClientOptions)
            : _this.ipfsClient
                ? _this.ipfsClient
                : util_1.nativeFunctions.createIpfsClient(_this.pubsubHttpClientOptions);
        _this.blockchainProviders = options.blockchainProviders || {
            avax: {
                url: "https://api.avax.network/ext/bc/C/rpc",
                chainId: 43114
            },
            matic: {
                url: "https://polygon-rpc.com",
                chainId: 137
            }
        };
        _this.resolveAuthorAddresses = options.hasOwnProperty("resolveAuthorAddresses") ? options.resolveAuthorAddresses : true;
        _this._memCache = new tinycache_1.default();
        _this.resolver = new resolver_1.Resolver({
            plebbit: { _memCache: _this._memCache, resolveAuthorAddresses: _this.resolveAuthorAddresses },
            blockchainProviders: _this.blockchainProviders
        });
        _this.dataPath = options.dataPath || (0, util_1.getDefaultDataPath)();
        return _this;
    }
    Plebbit.prototype._init = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var log, gatewayFromNode, splits, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:_init");
                        if (!this.dataPath) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, util_1.mkdir)(this.dataPath, { recursive: true })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!options["ipfsGatewayUrl"]) return [3 /*break*/, 3];
                        this.ipfsGatewayUrl = options["ipfsGatewayUrl"];
                        return [3 /*break*/, 6];
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.ipfsClient.config.get("Addresses.Gateway")];
                    case 4:
                        gatewayFromNode = _a.sent();
                        if (Array.isArray(gatewayFromNode))
                            gatewayFromNode = gatewayFromNode[0];
                        splits = gatewayFromNode.toString().split("/");
                        this.ipfsGatewayUrl = "http://".concat(splits[2], ":").concat(splits[4]);
                        log.trace("plebbit.ipfsGatewayUrl retrieved from IPFS node: ".concat(this.ipfsGatewayUrl));
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        this.ipfsGatewayUrl = "https://cloudflare-ipfs.com";
                        log(e_1, "\nFailed to retrieve gateway url from ipfs node, will default to ".concat(this.ipfsGatewayUrl));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Plebbit.prototype.getSubplebbit = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedSubplebbitAddress, subplebbitJson, signatureValidity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.resolver.isDomain(subplebbitAddress) && !is_ipfs_1.default.cid(subplebbitAddress))
                            throw (0, err_code_1.default)(Error(errors_1.messages.ERR_INVALID_SUBPLEBBIT_ADDRESS), errors_1.codes.ERR_INVALID_SUBPLEBBIT_ADDRESS, {
                                details: "getSubplebbit: subplebbitAddress (".concat(subplebbitAddress, ") can't be used to get a subplebbit")
                            });
                        return [4 /*yield*/, this.resolver.resolveSubplebbitAddressIfNeeded(subplebbitAddress)];
                    case 1:
                        resolvedSubplebbitAddress = _a.sent();
                        return [4 /*yield*/, (0, util_2.loadIpnsAsJson)(resolvedSubplebbitAddress, this)];
                    case 2:
                        subplebbitJson = _a.sent();
                        return [4 /*yield*/, (0, signer_1.verifySubplebbit)(subplebbitJson, this)];
                    case 3:
                        signatureValidity = _a.sent();
                        if (!signatureValidity.valid)
                            throw (0, err_code_1.default)(Error(errors_1.messages.ERR_SIGNATURE_IS_INVALID), errors_1.codes.ERR_SIGNATURE_IS_INVALID, {
                                details: "getSubplebbit: Failed verification reason: ".concat(signatureValidity.reason)
                            });
                        return [2 /*return*/, new subplebbit_1.Subplebbit(subplebbitJson, this)];
                }
            });
        });
    };
    Plebbit.prototype.getComment = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var commentJson, signatureValidity, title;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!is_ipfs_1.default.cid(cid))
                            throw (0, err_code_1.default)(Error(errors_1.messages.ERR_CID_IS_INVALID), errors_1.codes.ERR_CID_IS_INVALID, {
                                details: "getComment: cid (".concat(cid, ") is invalid as a CID")
                            });
                        return [4 /*yield*/, (0, util_2.loadIpfsFileAsJson)(cid, this)];
                    case 1:
                        commentJson = _a.sent();
                        return [4 /*yield*/, (0, signer_1.verifyComment)(commentJson, this, true)];
                    case 2:
                        signatureValidity = _a.sent();
                        if (!signatureValidity.valid)
                            throw (0, err_code_1.default)(Error(errors_1.messages.ERR_SIGNATURE_IS_INVALID), errors_1.codes.ERR_SIGNATURE_IS_INVALID, {
                                details: "getComment: Failed verification reason: ".concat(signatureValidity.reason, ", ").concat(commentJson.depth === 0 ? "post" : "comment", ": ").concat(JSON.stringify(commentJson))
                            });
                        title = commentJson.title;
                        return [2 /*return*/, typeof title === "string"
                                ? new post_1.default(__assign(__assign({}, commentJson), { cid: cid, title: title, postCid: cid }), this)
                                : new comment_1.Comment(__assign(__assign({}, commentJson), { cid: cid }), this)];
                }
            });
        });
    };
    Plebbit.prototype.createComment = function (options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log, commentSignature, finalProps, title;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createComment");
                        if (!options.signer)
                            return [2 /*return*/, typeof options.title === "string" ? new post_1.default(options, this) : new comment_1.Comment(options, this)];
                        if (!options.timestamp) {
                            options.timestamp = (0, util_2.timestamp)();
                            log.trace("User hasn't provided a timestamp in createCommentOptions, defaulting to (".concat(options.timestamp, ")"));
                        }
                        if (!((_a = options === null || options === void 0 ? void 0 : options.author) === null || _a === void 0 ? void 0 : _a.address)) {
                            options.author = __assign(__assign({}, options.author), { address: options.signer.address });
                            log("CreateCommentOptions did not provide author.address, will define it to signer.address (".concat(options.signer.address, ")"));
                        }
                        return [4 /*yield*/, (0, signatures_1.signComment)(options, options.signer, this)];
                    case 1:
                        commentSignature = _b.sent();
                        finalProps = __assign(__assign({}, options), { signature: commentSignature, protocolVersion: version_1.default.PROTOCOL_VERSION });
                        title = finalProps.title;
                        return [2 /*return*/, typeof title === "string" ? new post_1.default(__assign(__assign({}, finalProps), { title: title }), this) : new comment_1.Comment(finalProps, this)];
                }
            });
        });
    };
    Plebbit.prototype._canRunSub = function () {
        try {
            //@ts-ignore
            util_1.nativeFunctions.createDbHandler({ address: "", plebbit: this });
            return true;
        }
        catch (_a) { }
        return false;
    };
    Plebbit.prototype.createSubplebbit = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var log, canRunSub, newSub, remoteSub, subHasBeenCreatedBefore, _a, localSubs, derivedAddress, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createSubplebbit");
                        canRunSub = this._canRunSub();
                        newSub = function () { return __awaiter(_this, void 0, void 0, function () {
                            var subplebbit, key, subHasBeenCreatedBefore;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!canRunSub)
                                            throw Error("missing nativeFunctions required to create a subplebbit");
                                        if (canRunSub && !this.dataPath)
                                            throw (0, err_code_1.default)(Error(errors_1.messages.ERR_DATA_PATH_IS_NOT_DEFINED), errors_1.codes.ERR_DATA_PATH_IS_NOT_DEFINED, {
                                                details: "createSubplebbit: canRunSub=".concat(canRunSub, ", plebbitOptions.dataPath=").concat(this.dataPath)
                                            });
                                        subplebbit = new subplebbit_1.Subplebbit(options, this);
                                        key = subplebbit.address || subplebbit.signer.address;
                                        return [4 /*yield*/, this.listSubplebbits()];
                                    case 1:
                                        subHasBeenCreatedBefore = (_a.sent()).includes(key);
                                        if (!subHasBeenCreatedBefore && exports.pendingSubplebbitCreations[key])
                                            throw Error("Can't recreate a pending subplebbit that is waiting to be created");
                                        if (!subHasBeenCreatedBefore)
                                            exports.pendingSubplebbitCreations[key] = true;
                                        return [4 /*yield*/, subplebbit.prePublish()];
                                    case 2:
                                        _a.sent();
                                        if (!subHasBeenCreatedBefore)
                                            exports.pendingSubplebbitCreations[key] = false;
                                        log("Created subplebbit (".concat(subplebbit.address, ") with props:"), (0, util_2.removeKeysWithUndefinedValues)(lodash_1.default.omit(subplebbit.toJSON(), ["signer"])));
                                        return [2 /*return*/, subplebbit];
                                }
                            });
                        }); };
                        remoteSub = function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, new subplebbit_1.Subplebbit(options, this)];
                            });
                        }); };
                        if (!(options.address && !options.signer)) return [3 /*break*/, 4];
                        if (!!canRunSub) return [3 /*break*/, 1];
                        return [2 /*return*/, remoteSub()];
                    case 1: return [4 /*yield*/, this.listSubplebbits()];
                    case 2:
                        subHasBeenCreatedBefore = (_c.sent()).includes(options.address);
                        if (subHasBeenCreatedBefore)
                            return [2 /*return*/, newSub()];
                        else
                            return [2 /*return*/, remoteSub()];
                        _c.label = 3;
                    case 3: return [3 /*break*/, 13];
                    case 4:
                        if (!(!options.address && !options.signer)) return [3 /*break*/, 8];
                        if (!!canRunSub) return [3 /*break*/, 5];
                        throw Error("missing nativeFunctions required to create a subplebbit");
                    case 5:
                        _a = options;
                        return [4 /*yield*/, this.createSigner()];
                    case 6:
                        _a.signer = _c.sent();
                        log("Did not provide CreateSubplebbitOptions.signer, generated random signer with address (".concat(options.signer.address, ")"));
                        return [2 /*return*/, newSub()];
                    case 7: return [3 /*break*/, 13];
                    case 8:
                        if (!(!options.address && options.signer)) return [3 /*break*/, 12];
                        if (!canRunSub)
                            throw Error("missing nativeFunctions required to create a subplebbit");
                        return [4 /*yield*/, this.listSubplebbits()];
                    case 9:
                        localSubs = _c.sent();
                        _b = options.signer.address;
                        if (_b) return [3 /*break*/, 11];
                        return [4 /*yield*/, (0, util_3.getPlebbitAddressFromPrivateKeyPem)(options.signer.privateKey)];
                    case 10:
                        _b = (_c.sent());
                        _c.label = 11;
                    case 11:
                        derivedAddress = _b;
                        if (localSubs.includes(derivedAddress))
                            options.address = derivedAddress;
                        return [2 /*return*/, newSub()];
                    case 12:
                        if (!canRunSub)
                            return [2 /*return*/, remoteSub()];
                        else
                            return [2 /*return*/, newSub()];
                        _c.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    Plebbit.prototype.createVote = function (options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log, voteSignature, voteProps;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createVote");
                        if (!options.signer)
                            return [2 /*return*/, new vote_1.default(options, this)];
                        if (!options.timestamp) {
                            options.timestamp = (0, util_2.timestamp)();
                            log.trace("User hasn't provided a timestamp in createVote, defaulting to (".concat(options.timestamp, ")"));
                        }
                        if (!((_a = options === null || options === void 0 ? void 0 : options.author) === null || _a === void 0 ? void 0 : _a.address)) {
                            options.author = __assign(__assign({}, options.author), { address: options.signer.address });
                            log.trace("CreateVoteOptions did not provide author.address, will define it to signer.address (".concat(options.signer.address, ")"));
                        }
                        return [4 /*yield*/, (0, signatures_1.signVote)(options, options.signer, this)];
                    case 1:
                        voteSignature = _b.sent();
                        voteProps = __assign(__assign({}, options), { signature: voteSignature, protocolVersion: version_1.default.PROTOCOL_VERSION });
                        return [2 /*return*/, new vote_1.default(voteProps, this)];
                }
            });
        });
    };
    Plebbit.prototype.createCommentEdit = function (options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log, commentEditProps, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createCommentEdit");
                        if (!options.signer)
                            return [2 /*return*/, new comment_edit_1.CommentEdit(options, this)]; // User just wants to instantiate a CommentEdit object, not publish
                        if (!options.timestamp) {
                            options.timestamp = (0, util_2.timestamp)();
                            log.trace("User hasn't provided editTimestamp in createCommentEdit, defaulted to (".concat(options.timestamp, ")"));
                        }
                        if (!((_a = options === null || options === void 0 ? void 0 : options.author) === null || _a === void 0 ? void 0 : _a.address)) {
                            if (typeof options.signer.address !== "string")
                                throw Error("createCommentEditOptions.signer.address is not defined");
                            options.author = __assign(__assign({}, options.author), { address: options.signer.address });
                            log.trace("CreateCommentEditOptions did not provide author.address, will define it to signer.address (".concat(options.signer.address, ")"));
                        }
                        _b = [__assign({}, options)];
                        _c = {};
                        return [4 /*yield*/, (0, signatures_1.signCommentEdit)(options, options.signer, this)];
                    case 1:
                        commentEditProps = __assign.apply(void 0, _b.concat([(_c.signature = _d.sent(), _c.protocolVersion = version_1.default.PROTOCOL_VERSION, _c)]));
                        return [2 /*return*/, new comment_edit_1.CommentEdit(commentEditProps, this)];
                }
            });
        });
    };
    Plebbit.prototype.createSigner = function (createSignerOptions) {
        return (0, signer_1.createSigner)(createSignerOptions);
    };
    Plebbit.prototype.listSubplebbits = function () {
        return __awaiter(this, void 0, void 0, function () {
            var canRunSub;
            return __generator(this, function (_a) {
                canRunSub = this._canRunSub();
                if (canRunSub && !this.dataPath)
                    throw (0, err_code_1.default)(Error(errors_1.messages.ERR_DATA_PATH_IS_NOT_DEFINED), errors_1.codes.ERR_DATA_PATH_IS_NOT_DEFINED, {
                        details: "listSubplebbits: canRunSub=".concat(canRunSub, ", plebbitOptions.dataPath=").concat(this.dataPath)
                    });
                return [2 /*return*/, util_1.nativeFunctions.listSubplebbits(this.dataPath)];
            });
        });
    };
    Plebbit.prototype.fetchCid = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, util_2.fetchCid)(cid, this)];
            });
        });
    };
    return Plebbit;
}(events_1.default));
exports.Plebbit = Plebbit;
