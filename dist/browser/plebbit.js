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
exports.Plebbit = void 0;
var util_1 = require("./runtime/browser/util");
var comment_1 = require("./comment");
var subplebbit_1 = require("./subplebbit/subplebbit");
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
var storage_1 = __importDefault(require("./runtime/browser/storage"));
var client_manager_1 = require("./clients/client-manager");
var plebbit_rpc_client_1 = __importDefault(require("./clients/plebbit-rpc-client"));
var plebbit_error_1 = require("./plebbit-error");
var plebbit_rpc_state_client_1 = require("./clients/plebbit-rpc-state-client");
var Plebbit = /** @class */ (function (_super) {
    __extends(Plebbit, _super);
    function Plebbit(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        var acceptedOptions = [
            "chainProviders",
            "dataPath",
            "ipfsGatewayUrls",
            "ipfsHttpClientsOptions",
            "pubsubHttpClientsOptions",
            "resolveAuthorAddresses",
            "plebbitRpcClientsOptions",
            "publishInterval",
            "updateInterval",
            "noData"
        ];
        for (var _i = 0, _a = Object.keys(options); _i < _a.length; _i++) {
            var option = _a[_i];
            if (!acceptedOptions.includes(option))
                (0, util_2.throwWithErrorCode)("ERR_PLEBBIT_OPTION_NOT_ACCEPTED", { option: option });
        }
        _this._userPlebbitOptions = options;
        //@ts-expect-error
        _this.parsedPlebbitOptions = lodash_1.default.cloneDeep(options);
        _this.parsedPlebbitOptions.plebbitRpcClientsOptions = _this.plebbitRpcClientsOptions = options.plebbitRpcClientsOptions;
        if (_this.plebbitRpcClientsOptions)
            _this.plebbitRpcClient = new plebbit_rpc_client_1.default(_this);
        _this._pubsubSubscriptions = {};
        //@ts-expect-error
        _this.clients = {};
        _this.ipfsHttpClientsOptions = _this.parsedPlebbitOptions.ipfsHttpClientsOptions =
            Array.isArray(options.ipfsHttpClientsOptions) && typeof options.ipfsHttpClientsOptions[0] === "string"
                ? _this._parseUrlToOption(options.ipfsHttpClientsOptions)
                : options.ipfsHttpClientsOptions; // Same as https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#options
        var fallbackPubsubProviders = _this.plebbitRpcClientsOptions ? undefined : [{ url: "https://pubsubprovider.xyz/api/v0" }];
        _this.pubsubHttpClientsOptions = _this.parsedPlebbitOptions.pubsubHttpClientsOptions =
            Array.isArray(options.pubsubHttpClientsOptions) && typeof options.pubsubHttpClientsOptions[0] === "string"
                ? _this._parseUrlToOption(options.pubsubHttpClientsOptions)
                : options.pubsubHttpClientsOptions || _this.ipfsHttpClientsOptions || fallbackPubsubProviders;
        _this.publishInterval = _this.parsedPlebbitOptions.publishInterval = options.hasOwnProperty("publishInterval")
            ? options.publishInterval
            : 20000; // Default to 20s
        _this.updateInterval = _this.parsedPlebbitOptions.updateInterval = options.hasOwnProperty("updateInterval")
            ? options.updateInterval
            : 60000; // Default to 1 minute
        _this.noData = _this.parsedPlebbitOptions.noData = options.hasOwnProperty("noData") ? options.noData : false;
        _this._initIpfsClients();
        _this._initPubsubClients();
        _this._initRpcClients();
        if (!_this.noData && !_this.plebbitRpcClient)
            _this.dataPath = _this.parsedPlebbitOptions.dataPath = options.dataPath || (0, util_1.getDefaultDataPath)();
        return _this;
    }
    Plebbit.prototype._initIpfsClients = function () {
        this.clients.ipfsClients = {};
        if (!this.ipfsHttpClientsOptions)
            return;
        if (!util_1.nativeFunctions)
            throw Error("Native function is defined at all. Can't create ipfs client: " + JSON.stringify(this._userPlebbitOptions));
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
        if (this.pubsubHttpClientsOptions) {
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
        }
    };
    Plebbit.prototype._initRpcClients = function () {
        this.clients.plebbitRpcClients = {};
        if (this.parsedPlebbitOptions.plebbitRpcClientsOptions)
            for (var _i = 0, _a = this.plebbitRpcClientsOptions; _i < _a.length; _i++) {
                var rpcUrl = _a[_i];
                this.clients.plebbitRpcClients[rpcUrl] = new plebbit_rpc_state_client_1.GenericPlebbitRpcStateClient("stopped");
            }
    };
    Plebbit.prototype._initResolver = function (options) {
        var _a;
        this.chainProviders = this.parsedPlebbitOptions.chainProviders = this.plebbitRpcClient
            ? {}
            : options.chainProviders || {
                eth: { urls: ["viem", "ethers.js"], chainId: 1 },
                avax: {
                    urls: ["https://api.avax.network/ext/bc/C/rpc"],
                    chainId: 43114
                },
                matic: {
                    urls: ["https://polygon-rpc.com"],
                    chainId: 137
                }
            };
        if (((_a = this.chainProviders) === null || _a === void 0 ? void 0 : _a.eth) && !this.chainProviders.eth.chainId)
            this.chainProviders.eth.chainId = 1;
        this.clients.chainProviders = this.chainProviders;
        this.resolveAuthorAddresses = this.parsedPlebbitOptions.resolveAuthorAddresses = options.hasOwnProperty("resolveAuthorAddresses")
            ? options.resolveAuthorAddresses
            : true;
        this.resolver = new resolver_1.Resolver({
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
            var log, fallbackGateways, _i, _a, gatewayUrl, _b, fallbackGateways_1, gatewayUrl;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:_init");
                        fallbackGateways = this.plebbitRpcClient ? undefined : lodash_1.default.shuffle(["https://cloudflare-ipfs.com", "https://ipfs.io"]);
                        if (!this.dataPath) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, util_1.mkdir)(this.dataPath, { recursive: true })];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2:
                        this.clients.ipfsGateways = {};
                        if (options.ipfsGatewayUrls)
                            for (_i = 0, _a = options.ipfsGatewayUrls; _i < _a.length; _i++) {
                                gatewayUrl = _a[_i];
                                this.clients.ipfsGateways[gatewayUrl] = {};
                            }
                        else if (fallbackGateways)
                            for (_b = 0, fallbackGateways_1 = fallbackGateways; _b < fallbackGateways_1.length; _b++) {
                                gatewayUrl = fallbackGateways_1[_b];
                                this.clients.ipfsGateways[gatewayUrl] = {};
                            }
                        // Init cache
                        this._storage = new storage_1.default({ dataPath: this.dataPath, noData: this.noData });
                        return [4 /*yield*/, this._storage.init()];
                    case 3:
                        _c.sent();
                        // Init stats
                        this.stats = new stats_1.default({ _storage: this._storage, clients: this.clients });
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
            var subplebbit, updatePromise, error, errorPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        subplebbit = new subplebbit_1.Subplebbit(this);
                        return [4 /*yield*/, subplebbit.initSubplebbit({ address: subplebbitAddress })];
                    case 1:
                        _a.sent();
                        subplebbit.update();
                        updatePromise = new Promise(function (resolve) { return subplebbit.once("update", resolve); });
                        errorPromise = new Promise(function (resolve) { return subplebbit.once("error", function (err) { return resolve((error = err)); }); });
                        return [4 /*yield*/, Promise.race([updatePromise, errorPromise])];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, subplebbit.stop()];
                    case 3:
                        _a.sent();
                        if (error)
                            throw error;
                        return [2 /*return*/, subplebbit];
                }
            });
        });
    };
    Plebbit.prototype.getComment = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var log, comment, originalLoadMethod, updatePromise, error, errorPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:getComment");
                        return [4 /*yield*/, this.createComment({ cid: cid })];
                    case 1:
                        comment = _a.sent();
                        originalLoadMethod = comment._retryLoadingCommentUpdate.bind(comment);
                        //@ts-expect-error
                        comment._retryLoadingCommentUpdate = function () { };
                        comment.update();
                        updatePromise = new Promise(function (resolve) { return comment.once("update", resolve); });
                        errorPromise = new Promise(function (resolve) { return comment.once("error", function (err) { return resolve((error = err)); }); });
                        return [4 /*yield*/, Promise.race([updatePromise, errorPromise])];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, comment.stop()];
                    case 3:
                        _a.sent();
                        //@ts-expect-error
                        comment._retryLoadingCommentUpdate = originalLoadMethod;
                        if (error) {
                            log.error("Failed to load comment (".concat(cid, ") due to error: ").concat(error));
                            throw error;
                        }
                        return [2 /*return*/, comment];
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
    Plebbit.prototype._createCommentInstance = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var comment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = options;
                        comment = new comment_1.Comment(options, this);
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
            var log, formattedOptions, fieldsFilled, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createComment");
                        if (options["cid"] && !is_ipfs_1.default.cid(options["cid"]))
                            (0, util_2.throwWithErrorCode)("ERR_CID_IS_INVALID", { cid: options["cid"] });
                        formattedOptions = options instanceof comment_1.Comment ? options.toJSON() : options;
                        formattedOptions["protocolVersion"] = formattedOptions["protocolVersion"] || version_1.default.PROTOCOL_VERSION;
                        if (!(options["signature"] || options["cid"])) return [3 /*break*/, 1];
                        return [2 /*return*/, this._createCommentInstance(formattedOptions)];
                    case 1: return [4 /*yield*/, this._initMissingFields(formattedOptions, log)];
                    case 2:
                        fieldsFilled = _b.sent();
                        _a = fieldsFilled;
                        return [4 /*yield*/, (0, signatures_1.signComment)(fieldsFilled, fieldsFilled.signer, this)];
                    case 3:
                        _a.signature = _b.sent();
                        return [2 /*return*/, this._createCommentInstance(fieldsFilled)];
                }
            });
        });
    };
    Plebbit.prototype._canCreateNewLocalSub = function () {
        try {
            //@ts-ignore
            util_1.nativeFunctions.createDbHandler({ address: "", plebbit: this });
            return true;
        }
        catch (_a) { }
        return false;
    };
    Plebbit.prototype._createSubplebbitRpc = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var log, rpcSubs, isSubLocal, newLocalSub;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createSubplebbit");
                        log.trace("Received subplebbit options to create a subplebbit instance over RPC:", options);
                        if (!(options.address && !options["signer"])) return [3 /*break*/, 2];
                        options = options;
                        return [4 /*yield*/, this.listSubplebbits()];
                    case 1:
                        rpcSubs = _a.sent();
                        isSubLocal = rpcSubs.includes(options.address);
                        if (isSubLocal)
                            return [2 /*return*/, this.getSubplebbit(options.address)]; // getSubplebbit will fetch the local sub through RPC subplebbitUpdate
                        else
                            return [2 /*return*/, this._createRemoteSubplebbitInstance(options)];
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.plebbitRpcClient.createSubplebbit(options)];
                    case 3:
                        newLocalSub = _a.sent();
                        log("Created local-RPC subplebbit (".concat(newLocalSub.address, ") with props:"), newLocalSub.toJSON());
                        return [2 /*return*/, newLocalSub];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Plebbit.prototype._createRemoteSubplebbitInstance = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var log, subplebbit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createRemoteSubplebbit");
                        log.trace("Received subplebbit options to create a remote subplebbit instance:", options);
                        if (!options.address)
                            throw new plebbit_error_1.PlebbitError("ERR_SUBPLEBBIT_OPTIONS_MISSING_ADDRESS", {
                                options: options
                            });
                        subplebbit = new subplebbit_1.Subplebbit(this);
                        return [4 /*yield*/, subplebbit.initSubplebbit(options)];
                    case 1:
                        _a.sent();
                        log.trace("Created remote subplebbit instance (".concat(subplebbit.address, ")"));
                        return [2 /*return*/, subplebbit];
                }
            });
        });
    };
    Plebbit.prototype._createLocalSub = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var log, canCreateLocalSub, isLocalSub, subplebbit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createLocalSubplebbit");
                        log.trace("Received subplebbit options to create a local subplebbit instance:", options);
                        canCreateLocalSub = this._canCreateNewLocalSub();
                        if (!canCreateLocalSub)
                            throw new plebbit_error_1.PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { plebbitOptions: this._userPlebbitOptions });
                        if (!options.address)
                            throw new plebbit_error_1.PlebbitError("ERR_SUBPLEBBIT_OPTIONS_MISSING_ADDRESS", {
                                options: options
                            });
                        return [4 /*yield*/, this.listSubplebbits()];
                    case 1:
                        isLocalSub = (_a.sent()).includes(options.address);
                        subplebbit = new subplebbit_1.Subplebbit(this);
                        return [4 /*yield*/, subplebbit.initSubplebbit(isLocalSub ? { address: options.address } : options)];
                    case 2:
                        _a.sent();
                        if (!isLocalSub) return [3 /*break*/, 4];
                        return [4 /*yield*/, subplebbit._loadLocalSubDb()];
                    case 3:
                        _a.sent();
                        log.trace("Created instance of existing local subplebbit (".concat(subplebbit.address, ") with props:"), (0, util_2.removeKeysWithUndefinedValues)(lodash_1.default.omit(subplebbit.toJSON(), ["signer"])));
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, subplebbit._createNewLocalSubDb()];
                    case 5:
                        _a.sent();
                        log.trace("Created a new local subplebbit (".concat(subplebbit.address, ") with props:"), (0, util_2.removeKeysWithUndefinedValues)(lodash_1.default.omit(subplebbit.toJSON(), ["signer"])));
                        _a.label = 6;
                    case 6: return [2 /*return*/, subplebbit];
                }
            });
        });
    };
    Plebbit.prototype.createSubplebbit = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var log, canCreateLocalSub, localSubs, isSubLocal, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:createSubplebbit");
                        log.trace("Received options: ", options);
                        if ((options === null || options === void 0 ? void 0 : options.address) && (0, util_2.doesEnsAddressHaveCapitalLetter)(options === null || options === void 0 ? void 0 : options.address))
                            throw new plebbit_error_1.PlebbitError("ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: options === null || options === void 0 ? void 0 : options.address });
                        if (this.plebbitRpcClient)
                            return [2 /*return*/, this._createSubplebbitRpc(options)];
                        canCreateLocalSub = this._canCreateNewLocalSub();
                        if (options["signer"] && !canCreateLocalSub)
                            throw new plebbit_error_1.PlebbitError("ERR_CAN_NOT_CREATE_A_SUB", { plebbitOptions: this._userPlebbitOptions });
                        if (!canCreateLocalSub)
                            return [2 /*return*/, this._createRemoteSubplebbitInstance(options)];
                        if (!(options.address && !options["signer"])) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.listSubplebbits()];
                    case 1:
                        localSubs = _c.sent();
                        isSubLocal = localSubs.includes(options.address);
                        if (isSubLocal)
                            return [2 /*return*/, this._createLocalSub(options)];
                        else
                            return [2 /*return*/, this._createRemoteSubplebbitInstance(options)];
                        return [3 /*break*/, 7];
                    case 2:
                        if (!(!options.address && !options["signer"])) return [3 /*break*/, 4];
                        options = options;
                        _a = options;
                        return [4 /*yield*/, this.createSigner()];
                    case 3:
                        _a.signer = _c.sent();
                        options.address = options.signer.address;
                        log("Did not provide CreateSubplebbitOptions.signer, generated random signer with address (".concat(options.address, ")"));
                        return [2 /*return*/, this._createLocalSub(options)];
                    case 4:
                        if (!(!options.address && options["signer"])) return [3 /*break*/, 6];
                        options = options;
                        _b = options;
                        return [4 /*yield*/, this.createSigner(options.signer)];
                    case 5:
                        _b.signer = _c.sent();
                        options.address = options.signer.address;
                        return [2 /*return*/, this._createLocalSub(options)];
                    case 6: return [2 /*return*/, this._createLocalSub(options)];
                    case 7: return [2 /*return*/];
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
                        options["protocolVersion"] = options["protocolVersion"] || version_1.default.PROTOCOL_VERSION;
                        if (options["signature"])
                            return [2 /*return*/, new vote_1.default(options, this)];
                        return [4 /*yield*/, this._initMissingFields(options, log)];
                    case 1:
                        finalOptions = _b.sent();
                        _a = finalOptions;
                        return [4 /*yield*/, (0, signatures_1.signVote)(finalOptions, finalOptions.signer, this)];
                    case 2:
                        _a.signature = _b.sent();
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
                        options["protocolVersion"] = options["protocolVersion"] || version_1.default.PROTOCOL_VERSION;
                        if (options["signature"])
                            return [2 /*return*/, new comment_edit_1.CommentEdit(options, this)]; // User just wants to instantiate a CommentEdit object, not publish
                        return [4 /*yield*/, this._initMissingFields(options, log)];
                    case 1:
                        finalOptions = _b.sent();
                        //@ts-expect-error
                        _a = finalOptions;
                        return [4 /*yield*/, (0, signatures_1.signCommentEdit)(finalOptions, options.signer, this)];
                    case 2:
                        //@ts-expect-error
                        _a.signature = _b.sent();
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
            var canCreateSubs;
            return __generator(this, function (_a) {
                if (this.plebbitRpcClient)
                    return [2 /*return*/, this.plebbitRpcClient.listSubplebbits()];
                canCreateSubs = this._canCreateNewLocalSub();
                if (!canCreateSubs || !this.dataPath)
                    return [2 /*return*/, []];
                return [2 /*return*/, util_1.nativeFunctions.listSubplebbits(this.dataPath, this)];
            });
        });
    };
    Plebbit.prototype.fetchCid = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.plebbitRpcClient)
                    return [2 /*return*/, this.plebbitRpcClient.fetchCid(cid)];
                else
                    return [2 /*return*/, this._clientsManager.fetchCid(cid)];
                return [2 /*return*/];
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
    Plebbit.prototype.resolveAuthorAddress = function (authorAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var resolved;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._clientsManager.resolveAuthorAddressIfNeeded(authorAddress)];
                    case 1:
                        resolved = _a.sent();
                        return [2 /*return*/, resolved];
                }
            });
        });
    };
    Plebbit.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.plebbitRpcClient) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.plebbitRpcClient.destroy()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Plebbit.prototype.toJSON = function () {
        return undefined;
    };
    return Plebbit;
}(tiny_typed_emitter_1.TypedEmitter));
exports.Plebbit = Plebbit;
//# sourceMappingURL=plebbit.js.map