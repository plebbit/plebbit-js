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
exports.SubplebbitClientsManager = exports.CommentClientsManager = exports.PublicationClientsManager = exports.ClientsManager = void 0;
var from_string_1 = require("uint8arrays/from-string");
var util_1 = require("../util");
var assert_1 = __importDefault(require("assert"));
var ipfs_only_hash_1 = __importDefault(require("ipfs-only-hash"));
var signer_1 = require("../signer");
var lodash_1 = __importDefault(require("lodash"));
var util_2 = require("../runtime/node/util");
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var p_limit_1 = __importDefault(require("p-limit"));
var ipfs_client_1 = require("./ipfs-client");
var pubsub_client_1 = require("./pubsub-client");
var chain_provider_client_1 = require("./chain-provider-client");
var ipfs_gateway_client_1 = require("./ipfs-gateway-client");
var DOWNLOAD_LIMIT_BYTES = 1000000; // 1mb
var ClientsManager = /** @class */ (function () {
    function ClientsManager(plebbit) {
        this._plebbit = plebbit;
        this.curPubsubNodeUrl = Object.values(plebbit.clients.pubsubClients)[0]._clientOptions.url;
        if (plebbit.clients.ipfsClients)
            this.curIpfsNodeUrl = Object.values(plebbit.clients.ipfsClients)[0]._clientOptions.url;
        //@ts-expect-error
        this.clients = {};
        this._initIpfsGateways();
        this._initIpfsClients();
        this._initPubsubClients();
        this._initChainProviders();
    }
    ClientsManager.prototype.toJSON = function () {
        return undefined;
    };
    ClientsManager.prototype._initIpfsGateways = function () {
        var _a;
        for (var _i = 0, _b = Object.keys(this._plebbit.clients.ipfsGateways); _i < _b.length; _i++) {
            var gatewayUrl = _b[_i];
            this.clients.ipfsGateways = __assign(__assign({}, this.clients.ipfsGateways), (_a = {}, _a[gatewayUrl] = new ipfs_gateway_client_1.GenericIpfsGatewayClient("stopped"), _a));
        }
    };
    ClientsManager.prototype._initIpfsClients = function () {
        var _a;
        if (this._plebbit.clients.ipfsClients)
            for (var _i = 0, _b = Object.keys(this._plebbit.clients.ipfsClients); _i < _b.length; _i++) {
                var ipfsUrl = _b[_i];
                this.clients.ipfsClients = __assign(__assign({}, this.clients.ipfsClients), (_a = {}, _a[ipfsUrl] = new ipfs_client_1.GenericIpfsClient("stopped"), _a));
            }
    };
    ClientsManager.prototype._initPubsubClients = function () {
        var _a;
        for (var _i = 0, _b = Object.keys(this._plebbit.clients.pubsubClients); _i < _b.length; _i++) {
            var pubsubUrl = _b[_i];
            this.clients.pubsubClients = __assign(__assign({}, this.clients.pubsubClients), (_a = {}, _a[pubsubUrl] = new pubsub_client_1.GenericPubsubClient("stopped"), _a));
        }
    };
    ClientsManager.prototype._initChainProviders = function () {
        var _a;
        for (var _i = 0, _b = Object.keys(this._plebbit.clients.chainProviders); _i < _b.length; _i++) {
            var chainProviderUrl = _b[_i];
            this.clients.chainProviders = __assign(__assign({}, this.clients.chainProviders), (_a = {}, _a[chainProviderUrl] = new chain_provider_client_1.GenericChainProviderClient("stopped"), _a));
        }
    };
    ClientsManager.prototype.getCurrentPubsub = function () {
        return this._plebbit.clients.pubsubClients[this.curPubsubNodeUrl];
    };
    ClientsManager.prototype.getCurrentIpfs = function () {
        (0, assert_1.default)(this.curIpfsNodeUrl);
        (0, assert_1.default)(this._plebbit.clients.ipfsClients[this.curIpfsNodeUrl]);
        return this._plebbit.clients.ipfsClients[this.curIpfsNodeUrl];
    };
    ClientsManager.prototype.pubsubSubscribe = function (pubsubTopic, handler) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getCurrentPubsub()._client.pubsub.subscribe(pubsubTopic, handler)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        (0, util_1.throwWithErrorCode)("ERR_PUBSUB_FAILED_TO_SUBSCRIBE", { pubsubTopic: pubsubTopic, pubsubNode: this.curPubsubNodeUrl, error: e_1 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype.pubsubUnsubscribe = function (pubsubTopic, handler) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getCurrentPubsub()._client.pubsub.unsubscribe(pubsubTopic, handler)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        (0, util_1.throwWithErrorCode)("ERR_PUBSUB_FAILED_TO_UNSUBSCRIBE", { pubsubTopic: pubsubTopic, pubsubNode: this.curPubsubNodeUrl, error: error_1 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype.pubsubPublish = function (pubsubTopic, data) {
        return __awaiter(this, void 0, void 0, function () {
            var dataBinary, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataBinary = (0, from_string_1.fromString)(data);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getCurrentPubsub()._client.pubsub.publish(pubsubTopic, dataBinary)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        (0, util_1.throwWithErrorCode)("ERR_PUBSUB_FAILED_TO_PUBLISH", { pubsubTopic: pubsubTopic, pubsubNode: this.curPubsubNodeUrl, error: error_2 });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype._fetchWithLimit = function (url, options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var res, e_2, errorCode, totalBytesRead, reader, decoder, resText, _c, done, value;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, util_2.nativeFunctions.fetch(url, __assign(__assign({}, options), { size: DOWNLOAD_LIMIT_BYTES }))];
                    case 1:
                        //@ts-expect-error
                        res = _d.sent();
                        if (res.status !== 200)
                            throw Error("Failed to fetch");
                        if (!(((_a = res === null || res === void 0 ? void 0 : res.body) === null || _a === void 0 ? void 0 : _a.getReader) === undefined)) return [3 /*break*/, 3];
                        return [4 /*yield*/, res.text()];
                    case 2: return [2 /*return*/, _d.sent()];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_2 = _d.sent();
                        if (e_2.message.includes("over limit"))
                            (0, util_1.throwWithErrorCode)("ERR_OVER_DOWNLOAD_LIMIT", { url: url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                        errorCode = url.includes("/ipfs/")
                            ? "ERR_FAILED_TO_FETCH_IPFS_VIA_GATEWAY"
                            : url.includes("/ipns/")
                                ? "ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY"
                                : "ERR_FAILED_TO_FETCH_GENERIC";
                        (0, util_1.throwWithErrorCode)(errorCode, { url: url, status: res === null || res === void 0 ? void 0 : res.status, statusText: res === null || res === void 0 ? void 0 : res.statusText, error: e_2 });
                        return [3 /*break*/, 5];
                    case 5:
                        if (!(((_b = res === null || res === void 0 ? void 0 : res.body) === null || _b === void 0 ? void 0 : _b.getReader) !== undefined)) return [3 /*break*/, 9];
                        totalBytesRead = 0;
                        reader = res.body.getReader();
                        decoder = new TextDecoder("utf-8");
                        resText = "";
                        _d.label = 6;
                    case 6:
                        if (!true) return [3 /*break*/, 8];
                        return [4 /*yield*/, reader.read()];
                    case 7:
                        _c = _d.sent(), done = _c.done, value = _c.value;
                        //@ts-ignore
                        if (value)
                            resText += decoder.decode(value);
                        if (done || !value)
                            return [3 /*break*/, 8];
                        if (value.length + totalBytesRead > DOWNLOAD_LIMIT_BYTES)
                            (0, util_1.throwWithErrorCode)("ERR_OVER_DOWNLOAD_LIMIT", { url: url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                        totalBytesRead += value.length;
                        return [3 /*break*/, 6];
                    case 8: return [2 /*return*/, resText];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype.resolveIpnsToCidP2P = function (ipns) {
        return __awaiter(this, void 0, void 0, function () {
            var ipfsClient, cid, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ipfsClient = this.getCurrentIpfs();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ipfsClient._client.name.resolve(ipns)];
                    case 2:
                        cid = _a.sent();
                        if (typeof cid !== "string")
                            (0, util_1.throwWithErrorCode)("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipns: ipns });
                        return [2 /*return*/, cid];
                    case 3:
                        error_3 = _a.sent();
                        (0, util_1.throwWithErrorCode)("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipns: ipns, error: error_3 });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype._fetchCidP2P = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var ipfsClient, fileContent, calculatedCid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ipfsClient = this.getCurrentIpfs();
                        return [4 /*yield*/, ipfsClient._client.cat(cid, { length: DOWNLOAD_LIMIT_BYTES })];
                    case 1:
                        fileContent = _a.sent();
                        if (typeof fileContent !== "string")
                            (0, util_1.throwWithErrorCode)("ERR_FAILED_TO_FETCH_IPFS_VIA_IPFS", { cid: cid });
                        return [4 /*yield*/, ipfs_only_hash_1.default.of(fileContent)];
                    case 2:
                        calculatedCid = _a.sent();
                        if (fileContent.length === DOWNLOAD_LIMIT_BYTES && calculatedCid !== cid)
                            (0, util_1.throwWithErrorCode)("ERR_OVER_DOWNLOAD_LIMIT", { cid: cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                        return [2 /*return*/, fileContent];
                }
            });
        });
    };
    ClientsManager.prototype._verifyContentIsSameAsCid = function (content, cid) {
        return __awaiter(this, void 0, void 0, function () {
            var calculatedCid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ipfs_only_hash_1.default.of(content)];
                    case 1:
                        calculatedCid = _a.sent();
                        if (content.length === DOWNLOAD_LIMIT_BYTES && calculatedCid !== cid)
                            (0, util_1.throwWithErrorCode)("ERR_OVER_DOWNLOAD_LIMIT", { cid: cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                        if (calculatedCid !== cid)
                            (0, util_1.throwWithErrorCode)("ERR_CALCULATED_CID_DOES_NOT_MATCH", { calculatedCid: calculatedCid, cid: cid });
                        return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype._fetchWithGateway = function (gateway, path, loadType) {
        return __awaiter(this, void 0, void 0, function () {
            var log, url, timeBefore, isCid, gatewayState, resText, timeElapsedMs, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:fetchWithGateway");
                        url = "".concat(gateway).concat(path);
                        log.trace("Fetching url (".concat(url, ")"));
                        timeBefore = Date.now();
                        isCid = path.includes("/ipfs/");
                        gatewayState = loadType === "subplebbit"
                            ? this._getStatePriorToResolvingSubplebbitIpns()
                            : loadType === "comment-update"
                                ? "fetching-update-ipns"
                                : loadType === "comment" || loadType === "generic-ipfs"
                                    ? "fetching-ipfs"
                                    : undefined;
                        (0, assert_1.default)(gatewayState);
                        this.updateGatewayState(gatewayState, gateway);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 8]);
                        return [4 /*yield*/, this._fetchWithLimit(url, { cache: isCid ? "force-cache" : "no-store" })];
                    case 2:
                        resText = _a.sent();
                        if (!isCid) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._verifyContentIsSameAsCid(resText, path.split("/ipfs/")[1])];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.updateGatewayState("stopped", gateway);
                        timeElapsedMs = Date.now() - timeBefore;
                        return [4 /*yield*/, this._plebbit.stats.recordGatewaySuccess(gateway, isCid ? "cid" : "ipns", timeElapsedMs)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, resText];
                    case 6:
                        e_3 = _a.sent();
                        this.updateGatewayState("stopped", gateway);
                        return [4 /*yield*/, this._plebbit.stats.recordGatewayFailure(gateway, isCid ? "cid" : "ipns")];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, { error: e_3 }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype.fetchFromMultipleGateways = function (loadOpts, loadType) {
        return __awaiter(this, void 0, void 0, function () {
            var path, _firstResolve, type, concurrencyLimit, queueLimit, gatewaysSorted, _a, gatewayPromises, res;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, assert_1.default)(loadOpts.cid || loadOpts.ipns);
                        path = loadOpts.cid ? "/ipfs/".concat(loadOpts.cid) : "/ipns/".concat(loadOpts.ipns);
                        _firstResolve = function (promises) {
                            return new Promise(function (resolve) {
                                return promises.forEach(function (promise) {
                                    return promise.then(function (res) {
                                        if (typeof res === "string")
                                            resolve(res);
                                    });
                                });
                            });
                        };
                        type = loadOpts.cid ? "cid" : "ipns";
                        concurrencyLimit = 3;
                        queueLimit = (0, p_limit_1.default)(concurrencyLimit);
                        if (!(Object.keys(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit)) return [3 /*break*/, 1];
                        _a = Object.keys(this._plebbit.clients.ipfsGateways);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this._plebbit.stats.sortGatewaysAccordingToScore(type)];
                    case 2:
                        _a = _b.sent();
                        _b.label = 3;
                    case 3:
                        gatewaysSorted = _a;
                        gatewayPromises = gatewaysSorted.map(function (gateway) { return queueLimit(function () { return _this._fetchWithGateway(gateway, path, loadType); }); });
                        return [4 /*yield*/, Promise.race([_firstResolve(gatewayPromises), Promise.allSettled(gatewayPromises)])];
                    case 4:
                        res = _b.sent();
                        if (typeof res === "string") {
                            queueLimit.clearQueue();
                            return [2 /*return*/, res];
                        } //@ts-expect-error
                        else
                            throw res[0].value.error;
                        return [2 /*return*/];
                }
            });
        });
    };
    // State methods here
    ClientsManager.prototype.updatePubsubState = function (newState) {
        this.clients.pubsubClients[this.curPubsubNodeUrl].state = newState;
        this.clients.pubsubClients[this.curPubsubNodeUrl].emit("statechange", newState);
    };
    ClientsManager.prototype.updateIpfsState = function (newState) {
        (0, assert_1.default)(this.curIpfsNodeUrl);
        this.clients.ipfsClients[this.curIpfsNodeUrl].state = newState;
        this.clients.ipfsClients[this.curIpfsNodeUrl].emit("statechange", newState);
    };
    ClientsManager.prototype.updateGatewayState = function (newState, gateway) {
        this.clients.ipfsGateways[gateway].state = newState;
        this.clients.ipfsGateways[gateway].emit("statechange", newState);
    };
    ClientsManager.prototype.updateChainProviderState = function (newState, chainTicker) {
        this.clients.chainProviders[chainTicker].state = newState;
        this.clients.chainProviders[chainTicker].emit("statechange", newState);
    };
    ClientsManager.prototype.emitError = function (e) {
        this._plebbit.emit("error", e);
    };
    // Resolver methods here
    ClientsManager.prototype._resolveEnsTextRecordWithCache = function (ens, txtRecord) {
        return __awaiter(this, void 0, void 0, function () {
            var log, resolveCache, resolvedTimestamp, shouldResolveAgain;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:client-manager:_resolveEnsTextRecordWithCache");
                        if (!ens.endsWith(".eth"))
                            return [2 /*return*/, ens];
                        return [4 /*yield*/, this._plebbit._cache.getItem("".concat(ens, "_").concat(txtRecord))];
                    case 1:
                        resolveCache = _a.sent();
                        if (!(typeof resolveCache === "string")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._plebbit._cache.getItem("".concat(ens, "_").concat(txtRecord, "_timestamp"))];
                    case 2:
                        resolvedTimestamp = _a.sent();
                        (0, assert_1.default)(typeof resolvedTimestamp === "number");
                        shouldResolveAgain = (0, util_1.timestamp)() - resolvedTimestamp > 3600;
                        if (!shouldResolveAgain)
                            return [2 /*return*/, resolveCache];
                        log.trace("Cache of ENS (".concat(ens, ") txt record name (").concat(txtRecord, ") is stale. Returning stale result while resolving in background and updating cache"));
                        this._resolveEnsTextRecord(ens, txtRecord);
                        return [2 /*return*/, resolveCache];
                    case 3: return [2 /*return*/, this._resolveEnsTextRecord(ens, txtRecord)];
                }
            });
        });
    };
    ClientsManager.prototype._resolveEnsTextRecord = function (ens, txtRecordName) {
        return __awaiter(this, void 0, void 0, function () {
            var log, timeouts, i, newState, resolvedTxtRecord, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:client-manager:_resolveEnsTextRecord");
                        timeouts = [0, 0, 100, 1000];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < timeouts.length)) return [3 /*break*/, 8];
                        if (!(timeouts[i] !== 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, util_1.delay)(timeouts[i])];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        log.trace("Retrying to resolve ENS (".concat(ens, ") text record (").concat(txtRecordName, ") for the ").concat(i, "th time"));
                        newState = txtRecordName === "subplebbit-address" ? "resolving-subplebbit-address" : "resolving-author-address";
                        this.updateChainProviderState(newState, "eth");
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this._plebbit.resolver._resolveEnsTxtRecord(ens, txtRecordName)];
                    case 5:
                        resolvedTxtRecord = _a.sent();
                        this.updateChainProviderState("stopped", "eth");
                        return [2 /*return*/, resolvedTxtRecord];
                    case 6:
                        e_4 = _a.sent();
                        this.updateChainProviderState("stopped", "eth");
                        if (i === timeouts.length - 1) {
                            this.emitError(e_4);
                            throw e_4;
                        }
                        return [3 /*break*/, 7];
                    case 7:
                        i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype.resolveSubplebbitAddressIfNeeded = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, assert_1.default)(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
                return [2 /*return*/, this._resolveEnsTextRecordWithCache(subplebbitAddress, "subplebbit-address")];
            });
        });
    };
    ClientsManager.prototype.resolveAuthorAddressIfNeeded = function (authorAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, assert_1.default)(typeof authorAddress === "string", "subplebbitAddress needs to be a string to be resolved");
                return [2 /*return*/, this._resolveEnsTextRecordWithCache(authorAddress, "plebbit-author-address")];
            });
        });
    };
    ClientsManager.prototype.fetchCid = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var finalCid;
            return __generator(this, function (_a) {
                finalCid = lodash_1.default.clone(cid);
                if (!is_ipfs_1.default.cid(finalCid) && is_ipfs_1.default.path(finalCid))
                    finalCid = finalCid.split("/")[2];
                if (!is_ipfs_1.default.cid(finalCid))
                    (0, util_1.throwWithErrorCode)("ERR_CID_IS_INVALID", { cid: cid });
                if (this.curIpfsNodeUrl)
                    return [2 /*return*/, this._fetchCidP2P(cid)];
                else
                    return [2 /*return*/, this.fetchFromMultipleGateways({ cid: cid }, "generic-ipfs")];
                return [2 /*return*/];
            });
        });
    };
    ClientsManager.prototype._getStatePriorToResolvingSubplebbitIpns = function () {
        return "fetching-subplebbit-ipns";
    };
    ClientsManager.prototype._getStatePriorToResolvingSubplebbitIpfs = function () {
        return "fetching-subplebbit-ipfs";
    };
    ClientsManager.prototype.fetchSubplebbitIpns = function (ipnsAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var subCid, content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.curIpfsNodeUrl) return [3 /*break*/, 3];
                        this.updateIpfsState(this._getStatePriorToResolvingSubplebbitIpns());
                        return [4 /*yield*/, this.resolveIpnsToCidP2P(ipnsAddress)];
                    case 1:
                        subCid = _a.sent();
                        this.updateIpfsState(this._getStatePriorToResolvingSubplebbitIpfs());
                        return [4 /*yield*/, this._fetchCidP2P(subCid)];
                    case 2:
                        content = _a.sent();
                        this.updateIpfsState("stopped");
                        return [2 /*return*/, content];
                    case 3: return [2 /*return*/, this.fetchFromMultipleGateways({ ipns: ipnsAddress }, "subplebbit")];
                }
            });
        });
    };
    return ClientsManager;
}());
exports.ClientsManager = ClientsManager;
var PublicationClientsManager = /** @class */ (function (_super) {
    __extends(PublicationClientsManager, _super);
    function PublicationClientsManager(publication) {
        var _this = _super.call(this, publication._plebbit) || this;
        _this._publication = publication;
        return _this;
    }
    PublicationClientsManager.prototype._initIpfsClients = function () {
        var _a;
        if (this._plebbit.clients.ipfsClients)
            for (var _i = 0, _b = Object.keys(this._plebbit.clients.ipfsClients); _i < _b.length; _i++) {
                var ipfsUrl = _b[_i];
                this.clients.ipfsClients = __assign(__assign({}, this.clients.ipfsClients), (_a = {}, _a[ipfsUrl] = new ipfs_client_1.PublicationIpfsClient("stopped"), _a));
            }
    };
    PublicationClientsManager.prototype._initPubsubClients = function () {
        var _a;
        for (var _i = 0, _b = Object.keys(this._plebbit.clients.pubsubClients); _i < _b.length; _i++) {
            var pubsubUrl = _b[_i];
            this.clients.pubsubClients = __assign(__assign({}, this.clients.pubsubClients), (_a = {}, _a[pubsubUrl] = new pubsub_client_1.PublicationPubsubClient("stopped"), _a));
        }
    };
    PublicationClientsManager.prototype.publishChallengeRequest = function (pubsubTopic, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.updatePubsubState("publishing-challenge-request");
                        return [4 /*yield*/, this.pubsubPublish(pubsubTopic, data)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PublicationClientsManager.prototype.publishChallengeAnswer = function (pubsubTopic, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pubsubPublish(pubsubTopic, data)];
                    case 1:
                        _a.sent();
                        this.updatePubsubState("waiting-challenge-verification");
                        return [2 /*return*/];
                }
            });
        });
    };
    PublicationClientsManager.prototype.emitError = function (e) {
        this._publication.emit("error", e);
    };
    PublicationClientsManager.prototype.fetchSubplebbitForPublishing = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var subIpns, subJson, subCid, _a, _b, _c, _d, signatureValidity;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (typeof subplebbitAddress !== "string" || subplebbitAddress.length === 0)
                            (0, util_1.throwWithErrorCode)("ERR_INVALID_SUBPLEBBIT_ADDRESS", { subplebbitAddress: subplebbitAddress });
                        return [4 /*yield*/, this.resolveSubplebbitAddressIfNeeded(subplebbitAddress)];
                    case 1:
                        subIpns = _e.sent();
                        this._publication._updatePublishingState("fetching-subplebbit-ipns");
                        if (!this.curIpfsNodeUrl) return [3 /*break*/, 4];
                        this.updateIpfsState("fetching-subplebbit-ipns");
                        return [4 /*yield*/, this.resolveIpnsToCidP2P(subIpns)];
                    case 2:
                        subCid = _e.sent();
                        this._publication._updatePublishingState("fetching-subplebbit-ipfs");
                        this.updateIpfsState("fetching-subplebbit-ipfs");
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this._fetchCidP2P(subCid)];
                    case 3:
                        subJson = _b.apply(_a, [_e.sent()]);
                        this.updateIpfsState("stopped");
                        return [3 /*break*/, 6];
                    case 4:
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, this.fetchFromMultipleGateways({ ipns: subIpns }, "subplebbit")];
                    case 5:
                        subJson = _d.apply(_c, [_e.sent()]);
                        _e.label = 6;
                    case 6: return [4 /*yield*/, (0, signer_1.verifySubplebbit)(subJson, this._plebbit.resolveAuthorAddresses, this)];
                    case 7:
                        signatureValidity = _e.sent();
                        if (!signatureValidity.valid)
                            (0, util_1.throwWithErrorCode)("ERR_SIGNATURE_IS_INVALID", { signatureValidity: signatureValidity, subplebbitAddress: subplebbitAddress, subJson: subJson });
                        return [2 /*return*/, subJson];
                }
            });
        });
    };
    PublicationClientsManager.prototype.updateIpfsState = function (newState) {
        _super.prototype.updateIpfsState.call(this, newState);
    };
    PublicationClientsManager.prototype.updatePubsubState = function (newState) {
        this.clients.pubsubClients[this.curPubsubNodeUrl].state = newState;
        this.clients.pubsubClients[this.curPubsubNodeUrl].emit("statechange", newState);
    };
    PublicationClientsManager.prototype.updateGatewayState = function (newState, gateway) {
        _super.prototype.updateGatewayState.call(this, newState, gateway);
    };
    return PublicationClientsManager;
}(ClientsManager));
exports.PublicationClientsManager = PublicationClientsManager;
var CommentClientsManager = /** @class */ (function (_super) {
    __extends(CommentClientsManager, _super);
    function CommentClientsManager(comment) {
        var _this = _super.call(this, comment) || this;
        _this._comment = comment;
        return _this;
    }
    CommentClientsManager.prototype._initIpfsClients = function () {
        var _a;
        if (this._plebbit.clients.ipfsClients)
            for (var _i = 0, _b = Object.keys(this._plebbit.clients.ipfsClients); _i < _b.length; _i++) {
                var ipfsUrl = _b[_i];
                this.clients.ipfsClients = __assign(__assign({}, this.clients.ipfsClients), (_a = {}, _a[ipfsUrl] = new ipfs_client_1.CommentIpfsClient("stopped"), _a));
            }
    };
    CommentClientsManager.prototype.fetchCommentUpdate = function (ipnsName) {
        return __awaiter(this, void 0, void 0, function () {
            var updateCid, commentUpdate, _a, _b, update, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this._comment._setUpdatingState("fetching-update-ipns");
                        if (!this.curIpfsNodeUrl) return [3 /*break*/, 3];
                        this.updateIpfsState("fetching-update-ipns");
                        return [4 /*yield*/, this.resolveIpnsToCidP2P(ipnsName)];
                    case 1:
                        updateCid = _e.sent();
                        this._comment._setUpdatingState("fetching-update-ipfs");
                        this.updateIpfsState("fetching-update-ipfs");
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this._fetchCidP2P(updateCid)];
                    case 2:
                        commentUpdate = _b.apply(_a, [_e.sent()]);
                        this.updateIpfsState("stopped");
                        return [2 /*return*/, commentUpdate];
                    case 3:
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, this.fetchFromMultipleGateways({ ipns: ipnsName }, "comment-update")];
                    case 4:
                        update = _d.apply(_c, [_e.sent()]);
                        return [2 /*return*/, update];
                }
            });
        });
    };
    CommentClientsManager.prototype.fetchCommentCid = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var commentContent, _a, _b, commentContent, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this._comment._setUpdatingState("fetching-ipfs");
                        if (!this.curIpfsNodeUrl) return [3 /*break*/, 2];
                        this.updateIpfsState("fetching-ipfs");
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this._fetchCidP2P(cid)];
                    case 1:
                        commentContent = _b.apply(_a, [_e.sent()]);
                        this.updateIpfsState("stopped");
                        return [2 /*return*/, commentContent];
                    case 2:
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, this.fetchFromMultipleGateways({ cid: cid }, "comment")];
                    case 3:
                        commentContent = _d.apply(_c, [_e.sent()]);
                        return [2 /*return*/, commentContent];
                }
            });
        });
    };
    CommentClientsManager.prototype.updateIpfsState = function (newState) {
        _super.prototype.updateIpfsState.call(this, newState);
    };
    return CommentClientsManager;
}(PublicationClientsManager));
exports.CommentClientsManager = CommentClientsManager;
var SubplebbitClientsManager = /** @class */ (function (_super) {
    __extends(SubplebbitClientsManager, _super);
    function SubplebbitClientsManager(subplebbit) {
        var _this = _super.call(this, subplebbit.plebbit) || this;
        _this._subplebbit = subplebbit;
        return _this;
    }
    SubplebbitClientsManager.prototype._initIpfsClients = function () {
        var _a;
        if (this._plebbit.clients.ipfsClients)
            for (var _i = 0, _b = Object.keys(this._plebbit.clients.ipfsClients); _i < _b.length; _i++) {
                var ipfsUrl = _b[_i];
                this.clients.ipfsClients = __assign(__assign({}, this.clients.ipfsClients), (_a = {}, _a[ipfsUrl] = new ipfs_client_1.SubplebbitIpfsClient("stopped"), _a));
            }
    };
    SubplebbitClientsManager.prototype._initPubsubClients = function () {
        var _a;
        for (var _i = 0, _b = Object.keys(this._plebbit.clients.pubsubClients); _i < _b.length; _i++) {
            var pubsubUrl = _b[_i];
            this.clients.pubsubClients = __assign(__assign({}, this.clients.pubsubClients), (_a = {}, _a[pubsubUrl] = new pubsub_client_1.SubplebbitPubsubClient("stopped"), _a));
        }
    };
    SubplebbitClientsManager.prototype.fetchSubplebbit = function (ipnsName) {
        return __awaiter(this, void 0, void 0, function () {
            var subplebbitCid, subplebbit, _a, _b, update, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this._subplebbit._setUpdatingState("fetching-ipns");
                        if (!this.curIpfsNodeUrl) return [3 /*break*/, 3];
                        this.updateIpfsState("fetching-ipns");
                        return [4 /*yield*/, this.resolveIpnsToCidP2P(ipnsName)];
                    case 1:
                        subplebbitCid = _e.sent();
                        this._subplebbit._setUpdatingState("fetching-ipfs");
                        this.updateIpfsState("fetching-ipfs");
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this._fetchCidP2P(subplebbitCid)];
                    case 2:
                        subplebbit = _b.apply(_a, [_e.sent()]);
                        this.updateIpfsState("stopped");
                        return [2 /*return*/, subplebbit];
                    case 3:
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, this.fetchFromMultipleGateways({ ipns: ipnsName }, "subplebbit")];
                    case 4:
                        update = _d.apply(_c, [_e.sent()]);
                        return [2 /*return*/, update];
                }
            });
        });
    };
    SubplebbitClientsManager.prototype.updateIpfsState = function (newState) {
        _super.prototype.updateIpfsState.call(this, newState);
    };
    SubplebbitClientsManager.prototype.updatePubsubState = function (newState) {
        _super.prototype.updatePubsubState.call(this, newState);
    };
    SubplebbitClientsManager.prototype.updateGatewayState = function (newState, gateway) {
        _super.prototype.updateGatewayState.call(this, newState, gateway);
    };
    SubplebbitClientsManager.prototype.emitError = function (e) {
        this._subplebbit.emit("error", e);
    };
    SubplebbitClientsManager.prototype._getStatePriorToResolvingSubplebbitIpns = function () {
        return "fetching-ipns";
    };
    SubplebbitClientsManager.prototype._getStatePriorToResolvingSubplebbitIpfs = function () {
        return "fetching-ipfs";
    };
    return SubplebbitClientsManager;
}(ClientsManager));
exports.SubplebbitClientsManager = SubplebbitClientsManager;
//# sourceMappingURL=client-manager.js.map