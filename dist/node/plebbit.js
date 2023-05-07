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
exports.Plebbit = void 0;
var util_1 = require("./runtime/node/util");
var comment_1 = require("./comment");
var post_1 = __importDefault(require("./post"));
var subplebbit_1 = require("./subplebbit");
var util_2 = require("./util");
var vote_1 = __importDefault(require("./vote"));
var signer_1 = require("./signer");
var resolver_1 = require("./resolver");
var comment_edit_1 = require("./comment-edit");
var util_3 = require("./signer/util");
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var version_1 = __importDefault(require("./version"));
var lodash_1 = __importDefault(require("lodash"));
var signatures_1 = require("./signer/signatures");
var buffer_1 = require("buffer");
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var stats_1 = __importDefault(require("./stats"));
var cache_1 = __importDefault(require("./runtime/node/cache"));
var client_manager_1 = require("./clients/client-manager");
var Plebbit = /** @class */ (function (_super) {
    __extends(Plebbit, _super);
    function Plebbit(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this._pubsubSubscriptions = {};
        var acceptedOptions = [
            "chainProviders",
            "dataPath",
            "ipfsGatewayUrls",
            "ipfsHttpClientsOptions",
            "pubsubHttpClientsOptions",
            "resolveAuthorAddresses"
        ];
        for (var _i = 0, _a = Object.keys(options); _i < _a.length; _i++) {
            var option = _a[_i];
            if (!acceptedOptions.includes(option))
                (0, util_2.throwWithErrorCode)("ERR_PLEBBIT_OPTION_NOT_ACCEPTED", { option: option });
        }
        //@ts-expect-error
        _this.clients = {};
        _this.ipfsHttpClientsOptions =
            Array.isArray(options.ipfsHttpClientsOptions) && typeof options.ipfsHttpClientsOptions[0] === "string"
                ? _this._parseUrlToOption(options.ipfsHttpClientsOptions)
                : options.ipfsHttpClientsOptions; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        _this.pubsubHttpClientsOptions =
            Array.isArray(options.pubsubHttpClientsOptions) && typeof options.pubsubHttpClientsOptions[0] === "string"
                ? _this._parseUrlToOption(options.pubsubHttpClientsOptions)
                : options.pubsubHttpClientsOptions ||
                    _this.ipfsHttpClientsOptions || [{ url: "https://pubsubprovider.xyz/api/v0" }];
        _this._initIpfsClients();
        _this._initPubsubClients();
        _this.dataPath = options.dataPath || (0, util_1.getDefaultDataPath)();
        return _this;
    }
    Plebbit.prototype._initIpfsClients = function () {
        if (!this.ipfsHttpClientsOptions)
            return;
        this.clients.ipfsClients = {};
        for (var _i = 0, _a = this.ipfsHttpClientsOptions; _i < _a.length; _i++) {
            var clientOptions = _a[_i];
            var ipfsClient = util_1.nativeFunctions.createIpfsClient(clientOptions);
            this.clients.ipfsClients[clientOptions.url] = {
                _client: ipfsClient,
                _clientOptions: clientOptions,
                peers: ipfsClient.swarm.peers
            };
        }
    };
    Plebbit.prototype._initPubsubClients = function () {
        var _this = this;
        var _a, _b;
        this.clients.pubsubClients = {};
        var _loop_1 = function (clientOptions) {
            var ipfsClient = ((_b = (_a = this_1.clients.ipfsClients) === null || _a === void 0 ? void 0 : _a[clientOptions.url]) === null || _b === void 0 ? void 0 : _b._client) || util_1.nativeFunctions.createIpfsClient(clientOptions); // Only create a new ipfs client if pubsub options is different than ipfs
            this_1.clients.pubsubClients[clientOptions.url] = {
                _client: ipfsClient,
                _clientOptions: clientOptions,
                peers: function () { return __awaiter(_this, void 0, void 0, function () {
                    var topics, _a, _b, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0: return [4 /*yield*/, ipfsClient.pubsub.ls()];
                            case 1:
                                topics = _e.sent();
                                _b = (_a = lodash_1.default).uniq;
                                _d = (_c = lodash_1.default).flattenDeep;
                                return [4 /*yield*/, Promise.all(topics.map(function (topic) { return ipfsClient.pubsub.peers(topic); }))];
                            case 2: return [2 /*return*/, _b.apply(_a, [_d.apply(_c, [_e.sent()])])];
                        }
                    });
                }); }
            };
        };
        var this_1 = this;
        for (var _i = 0, _c = this.pubsubHttpClientsOptions; _i < _c.length; _i++) {
            var clientOptions = _c[_i];
            _loop_1(clientOptions);
        }
    };
    Plebbit.prototype._initResolver = function (options) {
        this.chainProviders = options.chainProviders || {
            avax: {
                urls: ["https://api.avax.network/ext/bc/C/rpc"],
                chainId: 43114
            },
            matic: {
                urls: ["https://polygon-rpc.com"],
                chainId: 137
            }
        };
        this.clients.chainProviders = this.chainProviders;
        if (!this.clients.chainProviders["eth"])
            this.clients.chainProviders["eth"] = { urls: ["DefaultProvider"], chainId: 1 };
        this.resolveAuthorAddresses = options.hasOwnProperty("resolveAuthorAddresses") ? options.resolveAuthorAddresses : true;
        this.resolver = new resolver_1.Resolver({
            _cache: this._cache,
            resolveAuthorAddresses: this.resolveAuthorAddresses,
            chainProviders: this.chainProviders
        });
    };
    Plebbit.prototype._parseUrlToOption = function (urlStrings) {
        var parsed = [];
        for (var _i = 0, urlStrings_1 = urlStrings; _i < urlStrings_1.length; _i++) {
            var urlString = urlStrings_1[_i];
            var url = new URL(urlString);
            var authorization = url.username && url.password ? "Basic " + buffer_1.Buffer.from("".concat(url.username, ":").concat(url.password)).toString("base64") : undefined;
            parsed.push(__assign({ url: authorization ? url.origin + url.pathname : urlString }, (authorization ? { headers: { authorization: authorization, origin: "http://localhost" } } : undefined)));
        }
        return parsed;
    };
    Plebbit.prototype._init = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var log, fallbackGateways, _i, _a, gatewayUrl, _b, _c, ipfsClient, gatewayFromNode, splits, ipfsGatewayUrl, e_1, _d, fallbackGateways_1, gatewayUrl;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:_init");
                        fallbackGateways = lodash_1.default.shuffle(["https://cloudflare-ipfs.com", "https://ipfs.io"]);
                        if (!this.dataPath) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, util_1.mkdir)(this.dataPath, { recursive: true })];
                    case 1:
                        _e.sent();
                        _e.label = 2;
                    case 2:
                        this.clients.ipfsGateways = {};
                        if (!options.ipfsGatewayUrls) return [3 /*break*/, 3];
                        for (_i = 0, _a = options.ipfsGatewayUrls; _i < _a.length; _i++) {
                            gatewayUrl = _a[_i];
                            this.clients.ipfsGateways[gatewayUrl] = {};
                        }
                        return [3 /*break*/, 11];
                    case 3:
                        if (!this.clients.ipfsClients) return [3 /*break*/, 10];
                        _b = 0, _c = Object.values(this.clients.ipfsClients);
                        _e.label = 4;
                    case 4:
                        if (!(_b < _c.length)) return [3 /*break*/, 9];
                        ipfsClient = _c[_b];
                        _e.label = 5;
                    case 5:
                        _e.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, ipfsClient._client.config.get("Addresses.Gateway")];
                    case 6:
                        gatewayFromNode = _e.sent();
                        if (Array.isArray(gatewayFromNode))
                            gatewayFromNode = gatewayFromNode[0];
                        splits = gatewayFromNode.toString().split("/");
                        ipfsGatewayUrl = "http://".concat(splits[2], ":").concat(splits[4]);
                        log.trace("plebbit.ipfsGatewayUrl (".concat(ipfsGatewayUrl, ") retrieved from IPFS node (").concat(ipfsClient._clientOptions.url, ")"));
                        this.clients.ipfsGateways[ipfsGatewayUrl] = {};
                        return [3 /*break*/, 8];
                    case 7:
                        e_1 = _e.sent();
                        log("Failed to retrieve gateway url from ipfs node (".concat(ipfsClient._clientOptions.url, ")"));
                        return [3 /*break*/, 8];
                    case 8:
                        _b++;
                        return [3 /*break*/, 4];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        for (_d = 0, fallbackGateways_1 = fallbackGateways; _d < fallbackGateways_1.length; _d++) {
                            gatewayUrl = fallbackGateways_1[_d];
                            this.clients.ipfsGateways[gatewayUrl] = {};
                        }
                        _e.label = 11;
                    case 11:
                        // Init cache
                        this._cache = new cache_1.default({ dataPath: this.dataPath });
                        return [4 /*yield*/, this._cache.init()];
                    case 12:
                        _e.sent();
                        // Init stats
                        this.stats = new stats_1.default({ _cache: this._cache, clients: this.clients });
                        // Init resolver
                        this._initResolver(options);
                        // Init clients manager
                        this._clientsManager = new client_manager_1.ClientsManager(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    Plebbit.prototype.getSubplebbit = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedSubplebbitAddress, subplebbitJson, _a, _b, signatureValidity, subplebbit;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (typeof subplebbitAddress !== "string" || subplebbitAddress.length === 0)
                            (0, util_2.throwWithErrorCode)("ERR_INVALID_SUBPLEBBIT_ADDRESS", { subplebbitAddress: subplebbitAddress });
                        return [4 /*yield*/, this._clientsManager.resolveSubplebbitAddressIfNeeded(subplebbitAddress)];
                    case 1:
                        resolvedSubplebbitAddress = _c.sent();
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this._clientsManager.fetchIpns(resolvedSubplebbitAddress)];
                    case 2:
                        subplebbitJson = _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, (0, signer_1.verifySubplebbit)(subplebbitJson, this.resolveAuthorAddresses, this._clientsManager)];
                    case 3:
                        signatureValidity = _c.sent();
                        if (!signatureValidity.valid)
                            (0, util_2.throwWithErrorCode)("ERR_SIGNATURE_IS_INVALID", { signatureValidity: signatureValidity });
                        subplebbit = new subplebbit_1.Subplebbit(this);
                        return [4 /*yield*/, subplebbit.initSubplebbit(subplebbitJson)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, subplebbit];
                }
            });
        });
    };
    Plebbit.prototype.getComment = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var commentJson, _a, _b, signatureValidity;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!is_ipfs_1.default.cid(cid))
                            (0, util_2.throwWithErrorCode)("ERR_CID_IS_INVALID", "getComment: cid (".concat(cid, ") is invalid as a CID"));
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this.fetchCid(cid)];
                    case 1:
                        commentJson = _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, (0, signer_1.verifyComment)(commentJson, this.resolveAuthorAddresses, this._clientsManager, true)];
                    case 2:
                        signatureValidity = _c.sent();
                        if (!signatureValidity.valid)
                            (0, util_2.throwWithErrorCode)("ERR_SIGNATURE_IS_INVALID", { cid: cid, signatureValidity: signatureValidity });
                        return [2 /*return*/, this.createComment(__assign(__assign({}, commentJson), { cid: cid }))];
                }
            });
        });
    };
    Plebbit.prototype._initMissingFields = function (pubOptions, log) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var clonedOptions, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        clonedOptions = lodash_1.default.cloneDeep(pubOptions);
                        if (!clonedOptions.timestamp) {
                            clonedOptions.timestamp = (0, util_2.timestamp)();
                            log.trace("User hasn't provided a timestamp, defaulting to (".concat(clonedOptions.timestamp, ")"));
                        }
                        if (!!clonedOptions.signer.address) return [3 /*break*/, 2];
                        _b = clonedOptions.signer;
                        return [4 /*yield*/, (0, util_3.getPlebbitAddressFromPrivateKey)(clonedOptions.signer.privateKey)];
                    case 1:
                        _b.address = _c.sent();
                        _c.label = 2;
                    case 2:
                        if (!((_a = clonedOptions === null || clonedOptions === void 0 ? void 0 : clonedOptions.author) === null || _a === void 0 ? void 0 : _a.address)) {
                            clonedOptions.author = __assign(__assign({}, clonedOptions.author), { address: clonedOptions.signer.address });
                            log("author.address was not provided, will define it to signer.address (".concat(clonedOptions.author.address, ")"));
                        }
                        delete clonedOptions.author["shortAddress"]; // Forcefully delete shortAddress so it won't be a part of the signature
                        return [2 /*return*/, clonedOptions];
                }
            });
        });
    };
    Plebbit.prototype._createCommentInstance = function (options, subplebbit) {
        return __awaiter(this, void 0, void 0, function () {
            var comment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = options;
                        comment = options.parentCid ? new comment_1.Comment(options, this) : new post_1.default(options, this);
                        comment["subplebbit"] = subplebbit;
                        if (!(typeof options["updatedAt"] === "number")) return [3 /*break*/, 2];
                        return [4 /*yield*/, comment._initCommentUpdate(options)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, comment];
                }
            });
        });
    };
    Plebbit.prototype.createComment = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var log, finalOptions, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createComment");
                        finalOptions = options instanceof comment_1.Comment ? options.toJSON() : options;
                        if (!options["signer"] || options["signature"])
                            return [2 /*return*/, this._createCommentInstance(finalOptions, options["subplebbit"])];
                        return [4 /*yield*/, this._initMissingFields(options, log)];
                    case 1:
                        //@ts-ignore
                        finalOptions = (_b.sent());
                        _a = finalOptions;
                        return [4 /*yield*/, (0, signatures_1.signComment)(finalOptions, finalOptions.signer, this)];
                    case 2:
                        _a.signature = _b.sent();
                        finalOptions.protocolVersion = version_1.default.PROTOCOL_VERSION;
                        return [2 /*return*/, this._createCommentInstance(finalOptions)];
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
            var log, canRunSub, localSub, remoteSub, dbHandler, isSubLocal, _a, signer;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createSubplebbit");
                        canRunSub = this._canRunSub();
                        localSub = function () { return __awaiter(_this, void 0, void 0, function () {
                            var subplebbit;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!canRunSub)
                                            (0, util_2.throwWithErrorCode)("ERR_PLEBBIT_MISSING_NATIVE_FUNCTIONS", { canRunSub: canRunSub, dataPath: this.dataPath });
                                        if (!this.dataPath)
                                            (0, util_2.throwWithErrorCode)("ERR_DATA_PATH_IS_NOT_DEFINED", { canRunSub: canRunSub, dataPath: this.dataPath });
                                        subplebbit = new subplebbit_1.Subplebbit(this);
                                        return [4 /*yield*/, subplebbit.initSubplebbit(options)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, subplebbit.prePublish()];
                                    case 2:
                                        _a.sent(); // May fail because sub is already being created (locked)
                                        log("Created subplebbit (".concat(subplebbit.address, ") with props:"), (0, util_2.removeKeysWithUndefinedValues)(lodash_1.default.omit(subplebbit.toJSON(), ["signer"])));
                                        return [2 /*return*/, subplebbit];
                                }
                            });
                        }); };
                        remoteSub = function () { return __awaiter(_this, void 0, void 0, function () {
                            var subplebbit;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        subplebbit = new subplebbit_1.Subplebbit(this);
                                        return [4 /*yield*/, subplebbit.initSubplebbit(options)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/, subplebbit];
                                }
                            });
                        }); };
                        if (!(options.address && !options.signer)) return [3 /*break*/, 1];
                        if (!canRunSub)
                            return [2 /*return*/, remoteSub()];
                        else {
                            dbHandler = util_1.nativeFunctions.createDbHandler({ address: options.address, plebbit: this });
                            isSubLocal = dbHandler.subDbExists();
                            if (isSubLocal)
                                return [2 /*return*/, localSub()];
                            else
                                return [2 /*return*/, remoteSub()];
                        }
                        return [3 /*break*/, 8];
                    case 1:
                        if (!(!options.address && !options.signer)) return [3 /*break*/, 5];
                        if (!!canRunSub) return [3 /*break*/, 2];
                        throw Error("missing nativeFunctions required to create a subplebbit");
                    case 2:
                        _a = options;
                        return [4 /*yield*/, this.createSigner()];
                    case 3:
                        _a.signer = _b.sent();
                        options.address = options.signer.address;
                        log("Did not provide CreateSubplebbitOptions.signer, generated random signer with address (".concat(options.address, ")"));
                        return [2 /*return*/, localSub()];
                    case 4: return [3 /*break*/, 8];
                    case 5:
                        if (!(!options.address && options.signer)) return [3 /*break*/, 7];
                        if (!canRunSub)
                            throw Error("missing nativeFunctions required to create a subplebbit");
                        return [4 /*yield*/, this.createSigner(options.signer)];
                    case 6:
                        signer = _b.sent();
                        options.address = signer.address;
                        options.signer = signer;
                        return [2 /*return*/, localSub()];
                    case 7:
                        if (!canRunSub)
                            return [2 /*return*/, remoteSub()];
                        else
                            return [2 /*return*/, localSub()];
                        _b.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Plebbit.prototype.createVote = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var log, finalOptions, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createVote");
                        if (!options["signer"])
                            return [2 /*return*/, new vote_1.default(options, this)];
                        return [4 /*yield*/, this._initMissingFields(options, log)];
                    case 1:
                        finalOptions = _b.sent();
                        _a = finalOptions;
                        return [4 /*yield*/, (0, signatures_1.signVote)(finalOptions, finalOptions.signer, this)];
                    case 2:
                        _a.signature = _b.sent();
                        finalOptions.protocolVersion = version_1.default.PROTOCOL_VERSION;
                        return [2 /*return*/, new vote_1.default(finalOptions, this)];
                }
            });
        });
    };
    Plebbit.prototype.createCommentEdit = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var log, finalOptions, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createCommentEdit");
                        if (!options.signer || options.signature)
                            return [2 /*return*/, new comment_edit_1.CommentEdit(options, this)]; // User just wants to instantiate a CommentEdit object, not publish
                        return [4 /*yield*/, this._initMissingFields(options, log)];
                    case 1:
                        finalOptions = _b.sent();
                        _a = finalOptions;
                        return [4 /*yield*/, (0, signatures_1.signCommentEdit)(finalOptions, finalOptions.signer, this)];
                    case 2:
                        _a.signature = _b.sent();
                        finalOptions.protocolVersion = version_1.default.PROTOCOL_VERSION;
                        return [2 /*return*/, new comment_edit_1.CommentEdit(finalOptions, this)];
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
                if (!canRunSub || !this.dataPath)
                    return [2 /*return*/, []];
                return [2 /*return*/, util_1.nativeFunctions.listSubplebbits(this.dataPath)];
            });
        });
    };
    Plebbit.prototype.fetchCid = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._clientsManager.fetchCid(cid)];
            });
        });
    };
    // Used to pre-subscribe so publishing on pubsub would be faster
    Plebbit.prototype.pubsubSubscribe = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var handler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._pubsubSubscriptions[subplebbitAddress])
                            return [2 /*return*/];
                        handler = function () { };
                        return [4 /*yield*/, this._clientsManager.pubsubSubscribe(subplebbitAddress, handler)];
                    case 1:
                        _a.sent();
                        this._pubsubSubscriptions[subplebbitAddress] = handler;
                        return [2 /*return*/];
                }
            });
        });
    };
    Plebbit.prototype.pubsubUnsubscribe = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._pubsubSubscriptions[subplebbitAddress])
                            return [2 /*return*/];
                        return [4 /*yield*/, this._clientsManager.pubsubUnsubscribe(subplebbitAddress, this._pubsubSubscriptions[subplebbitAddress])];
                    case 1:
                        _a.sent();
                        delete this._pubsubSubscriptions[subplebbitAddress];
                        return [2 /*return*/];
                }
            });
        });
    };
    return Plebbit;
}(tiny_typed_emitter_1.TypedEmitter));
exports.Plebbit = Plebbit;
//# sourceMappingURL=plebbit.js.map