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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.Plebbit = void 0;
var util_1 = __importStar(require("./runtime/node/util"));
var comment_1 = require("./comment");
var post_1 = __importDefault(require("./post"));
var subplebbit_1 = require("./subplebbit");
var util_2 = require("./util");
var vote_1 = __importDefault(require("./vote"));
var ipfs_http_client_1 = require("ipfs-http-client");
var assert_1 = __importDefault(require("assert"));
var signer_1 = require("./signer");
var resolver_1 = require("./resolver");
var tinycache_1 = __importDefault(require("tinycache"));
var comment_edit_1 = require("./comment-edit");
var util_3 = require("./signer/util");
var debugs = (0, util_2.getDebugLevels)("plebbit");
var Plebbit = /** @class */ (function () {
    function Plebbit(options) {
        if (options === void 0) { options = {}; }
        this.ipfsHttpClientOptions = options["ipfsHttpClientOptions"]; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        this.ipfsClient = this.ipfsHttpClientOptions ? (0, ipfs_http_client_1.create)(this.ipfsHttpClientOptions) : undefined;
        this.pubsubHttpClientOptions = options["pubsubHttpClientOptions"] || { url: "https://pubsubprovider.xyz/api/v0" };
        this.pubsubIpfsClient = options["pubsubHttpClientOptions"]
            ? (0, ipfs_http_client_1.create)(options["pubsubHttpClientOptions"])
            : this.ipfsClient
                ? this.ipfsClient
                : (0, ipfs_http_client_1.create)(this.pubsubHttpClientOptions);
        this.dataPath = options["dataPath"] || util_1.default.getDefaultDataPath();
        this.blockchainProviders = options.blockchainProviders || {
            avax: {
                url: "https://api.avax.network/ext/bc/C/rpc",
                chainId: 43114
            },
            matic: {
                url: "https://polygon-rpc.com",
                chainId: 137
            }
        };
        this.resolver = new resolver_1.Resolver({ plebbit: this, blockchainProviders: this.blockchainProviders });
        this.resolveAuthorAddresses = options["resolveAuthorAddresses"] || true;
        this._memCache = new tinycache_1.default();
    }
    Plebbit.prototype._init = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var gatewayFromNode, splits, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!options["ipfsGatewayUrl"]) return [3 /*break*/, 1];
                        this.ipfsGatewayUrl = options["ipfsGatewayUrl"];
                        return [3 /*break*/, 4];
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.ipfsClient.config.get("Addresses.Gateway")];
                    case 2:
                        gatewayFromNode = _a.sent();
                        debugs.TRACE("Gateway from node: ".concat(JSON.stringify(gatewayFromNode)));
                        if (Array.isArray(gatewayFromNode))
                            gatewayFromNode = gatewayFromNode[0];
                        splits = gatewayFromNode.toString().split("/");
                        this.ipfsGatewayUrl = "http://".concat(splits[2], ":").concat(splits[4]);
                        debugs.TRACE("plebbit.ipfsGatewayUrl retrieved from IPFS node: ".concat(this.ipfsGatewayUrl));
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this.ipfsGatewayUrl = "https://cloudflare-ipfs.com";
                        debugs.ERROR("".concat(e_1.msg, ": Failed to retrieve gateway url from ipfs node, will default to ").concat(this.ipfsGatewayUrl));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Plebbit.prototype.getSubplebbit = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedSubplebbitAddress, subplebbitJson;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(typeof subplebbitAddress === "string");
                        (0, assert_1.default)(subplebbitAddress.length > 0);
                        return [4 /*yield*/, this.resolver.resolveSubplebbitAddressIfNeeded(subplebbitAddress)];
                    case 1:
                        resolvedSubplebbitAddress = _a.sent();
                        (0, assert_1.default)(typeof resolvedSubplebbitAddress === "string" && resolvedSubplebbitAddress.length > 0, "Resolved address of a subplebbit needs to be defined");
                        return [4 /*yield*/, (0, util_2.loadIpnsAsJson)(resolvedSubplebbitAddress, this)];
                    case 2:
                        subplebbitJson = _a.sent();
                        return [2 /*return*/, new subplebbit_1.Subplebbit(subplebbitJson, this)];
                }
            });
        });
    };
    Plebbit.prototype.getComment = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var commentJson, subplebbit, publication, _a, signatureIsVerified, failedVerificationReason;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, util_2.loadIpfsFileAsJson)(cid, this)];
                    case 1:
                        commentJson = _b.sent();
                        return [4 /*yield*/, this.getSubplebbit(commentJson["subplebbitAddress"])];
                    case 2:
                        subplebbit = _b.sent();
                        publication = commentJson["title"]
                            ? new post_1.default(__assign(__assign({}, commentJson), { postCid: cid, cid: cid }), subplebbit)
                            : new comment_1.Comment(__assign(__assign({}, commentJson), { cid: cid }), subplebbit);
                        return [4 /*yield*/, (0, signer_1.verifyPublication)(publication, this, "comment")];
                    case 3:
                        _a = _b.sent(), signatureIsVerified = _a[0], failedVerificationReason = _a[1];
                        assert_1.default.equal(signatureIsVerified, true, "Signature of comment/post ".concat(cid, " is invalid due to reason=").concat(failedVerificationReason));
                        return [2 /*return*/, publication];
                }
            });
        });
    };
    Plebbit.prototype.createComment = function (options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var commentSubplebbit, commentSignature, finalProps;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        commentSubplebbit = { plebbit: this, address: options.subplebbitAddress };
                        if (!options.signer)
                            return [2 /*return*/, options.title ? new post_1.default(options, commentSubplebbit) : new comment_1.Comment(options, commentSubplebbit)];
                        if (!options.timestamp) {
                            options.timestamp = (0, util_2.timestamp)();
                            debugs.TRACE("User hasn't provided a timestamp in createCommentOptions, defaulting to (".concat(options.timestamp, ")"));
                        }
                        if (!((_a = options === null || options === void 0 ? void 0 : options.author) === null || _a === void 0 ? void 0 : _a.address)) {
                            options.author = __assign(__assign({}, options.author), { address: options.signer.address });
                            debugs.TRACE("CreateCommentOptions did not provide author.address, will define it to signer.address (".concat(options.signer.address, ")"));
                        }
                        return [4 /*yield*/, (0, signer_1.signPublication)(options, options.signer, this, "comment")];
                    case 1:
                        commentSignature = _b.sent();
                        finalProps = __assign(__assign({}, options), { signature: commentSignature, protocolVersion: (0, util_2.getProtocolVersion)() });
                        return [2 /*return*/, finalProps.title ? new post_1.default(finalProps, commentSubplebbit) : new comment_1.Comment(finalProps, commentSubplebbit)];
                }
            });
        });
    };
    Plebbit.prototype.createSubplebbit = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var newSub, localSubs, _a, localSubs, derivedAddress, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        newSub = function () { return __awaiter(_this, void 0, void 0, function () {
                            var subplebbit;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        (0, assert_1.default)(util_1.isRuntimeNode, "Runtime need to include node APIs to create a publishing subplebbit");
                                        subplebbit = new subplebbit_1.Subplebbit(options, this);
                                        return [4 /*yield*/, subplebbit.start()];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, subplebbit.edit(options)];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, subplebbit.stopPublishing()];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/, subplebbit];
                                }
                            });
                        }); };
                        if (!(options.address && !options.signer)) return [3 /*break*/, 4];
                        if (!!util_1.isRuntimeNode) return [3 /*break*/, 1];
                        return [2 /*return*/, new subplebbit_1.Subplebbit(options, this)];
                    case 1: return [4 /*yield*/, this.listSubplebbits()];
                    case 2:
                        localSubs = _c.sent();
                        if (localSubs.includes(options.address))
                            return [2 /*return*/, newSub()];
                        else
                            return [2 /*return*/, new subplebbit_1.Subplebbit(options, this)];
                        _c.label = 3;
                    case 3: return [3 /*break*/, 13];
                    case 4:
                        if (!(!options.address && !options.signer)) return [3 /*break*/, 8];
                        if (!!util_1.isRuntimeNode) return [3 /*break*/, 5];
                        throw new Error("Can't instantenate a publishing subplebbit without node API");
                    case 5:
                        _a = options;
                        return [4 /*yield*/, this.createSigner()];
                    case 6:
                        _a.signer = _c.sent();
                        debugs.DEBUG("Did not provide CreateSubplebbitOptions.signer, generated random signer with address (".concat(options.signer.address, ")"));
                        return [2 /*return*/, newSub()];
                    case 7: return [3 /*break*/, 13];
                    case 8:
                        if (!(!options.address && options.signer)) return [3 /*break*/, 12];
                        if (!util_1.isRuntimeNode)
                            throw new Error("Can't instantenate a publishing subplebbit without node API");
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
                        if (!util_1.isRuntimeNode)
                            return [2 /*return*/, new subplebbit_1.Subplebbit(options, this)];
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
            var subplebbit, voteSignature, voteProps;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        subplebbit = { plebbit: this, address: options.subplebbitAddress };
                        if (!options.signer)
                            return [2 /*return*/, new vote_1.default(options, subplebbit)];
                        if (!options.timestamp) {
                            options.timestamp = (0, util_2.timestamp)();
                            debugs.TRACE("User hasn't provided a timestamp in createVote, defaulting to (".concat(options.timestamp, ")"));
                        }
                        if (!((_a = options === null || options === void 0 ? void 0 : options.author) === null || _a === void 0 ? void 0 : _a.address)) {
                            options.author = __assign(__assign({}, options.author), { address: options.signer.address });
                            debugs.TRACE("CreateVoteOptions did not provide author.address, will define it to signer.address (".concat(options.signer.address, ")"));
                        }
                        return [4 /*yield*/, (0, signer_1.signPublication)(options, options.signer, this, "vote")];
                    case 1:
                        voteSignature = _b.sent();
                        voteProps = __assign(__assign({}, options), { signature: voteSignature, protocolVersion: (0, util_2.getProtocolVersion)() });
                        return [2 /*return*/, new vote_1.default(voteProps, subplebbit)];
                }
            });
        });
    };
    Plebbit.prototype.createCommentEdit = function (options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var subplebbitObj, commentEditProps, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        subplebbitObj = { plebbit: this, address: options.subplebbitAddress };
                        if (!options.signer)
                            return [2 /*return*/, new comment_edit_1.CommentEdit(options, subplebbitObj)]; // User just wants to instantiate a CommentEdit object, not publish
                        if (!options.timestamp) {
                            options.timestamp = (0, util_2.timestamp)();
                            debugs.DEBUG("User hasn't provided editTimestamp in createCommentEdit, defaulted to (".concat(options.timestamp, ")"));
                        }
                        if (!((_a = options === null || options === void 0 ? void 0 : options.author) === null || _a === void 0 ? void 0 : _a.address)) {
                            options.author = __assign(__assign({}, options.author), { address: options.signer.address });
                            debugs.TRACE("CreateCommentEditOptions did not provide author.address, will define it to signer.address (".concat(options.signer.address, ")"));
                        }
                        _b = [__assign({}, options)];
                        _c = {};
                        return [4 /*yield*/, (0, signer_1.signPublication)(options, options.signer, this, "commentedit")];
                    case 1:
                        commentEditProps = __assign.apply(void 0, _b.concat([(_c.signature = _d.sent(), _c.protocolVersion = (0, util_2.getProtocolVersion)(), _c)]));
                        return [2 /*return*/, new comment_edit_1.CommentEdit(commentEditProps, subplebbitObj)];
                }
            });
        });
    };
    Plebbit.prototype.createSigner = function (createSignerOptions) {
        return (0, signer_1.createSigner)(createSignerOptions);
    };
    Plebbit.prototype.listSubplebbits = function () {
        return util_1.default.listSubplebbits(this);
    };
    return Plebbit;
}());
exports.Plebbit = Plebbit;
