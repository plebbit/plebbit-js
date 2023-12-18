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
exports.BaseClientsManager = void 0;
var assert_1 = __importDefault(require("assert"));
var util_1 = require("../util");
var ipfs_only_hash_1 = __importDefault(require("ipfs-only-hash"));
var util_2 = require("../runtime/node/util");
var p_limit_1 = __importDefault(require("p-limit"));
var plebbit_error_1 = require("../plebbit-error");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var cborg = __importStar(require("cborg"));
var constants_1 = require("../constants");
var js_sha256_1 = require("js-sha256");
var DOWNLOAD_LIMIT_BYTES = 1000000; // 1mb
var BaseClientsManager = /** @class */ (function () {
    function BaseClientsManager(plebbit) {
        var _a, _b, _c, _d;
        this._plebbit = plebbit;
        this._defaultPubsubProviderUrl = (_b = (_a = Object.values(plebbit.clients.pubsubClients)[0]) === null || _a === void 0 ? void 0 : _a._clientOptions) === null || _b === void 0 ? void 0 : _b.url; // TODO Should be the gateway with the best score
        if (plebbit.clients.ipfsClients)
            this._defaultIpfsProviderUrl = (_d = (_c = Object.values(plebbit.clients.ipfsClients)[0]) === null || _c === void 0 ? void 0 : _c._clientOptions) === null || _d === void 0 ? void 0 : _d.url;
        if (this._defaultPubsubProviderUrl) {
            this.providerSubscriptions = {};
            for (var _i = 0, _e = Object.keys(plebbit.clients.pubsubClients); _i < _e.length; _i++) {
                var provider = _e[_i];
                this.providerSubscriptions[provider] = [];
            }
        }
    }
    BaseClientsManager.prototype.toJSON = function () {
        return undefined;
    };
    BaseClientsManager.prototype.getDefaultPubsub = function () {
        return this._plebbit.clients.pubsubClients[this._defaultPubsubProviderUrl];
    };
    BaseClientsManager.prototype.getDefaultIpfs = function () {
        (0, assert_1.default)(this._defaultIpfsProviderUrl);
        (0, assert_1.default)(this._plebbit.clients.ipfsClients[this._defaultIpfsProviderUrl]);
        return this._plebbit.clients.ipfsClients[this._defaultIpfsProviderUrl];
    };
    // Pubsub methods
    BaseClientsManager.prototype.pubsubSubscribeOnProvider = function (pubsubTopic, handler, pubsubProviderUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var log, timeBefore, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:client-manager:pubsubSubscribeOnProvider");
                        timeBefore = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 6]);
                        return [4 /*yield*/, this._plebbit.clients.pubsubClients[pubsubProviderUrl]._client.pubsub.subscribe(pubsubTopic, handler)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._plebbit.stats.recordGatewaySuccess(pubsubProviderUrl, "pubsub-subscribe", Date.now() - timeBefore)];
                    case 3:
                        _a.sent();
                        this.providerSubscriptions[pubsubProviderUrl].push(pubsubTopic);
                        return [2 /*return*/];
                    case 4:
                        e_1 = _a.sent();
                        return [4 /*yield*/, this._plebbit.stats.recordGatewayFailure(pubsubProviderUrl, "pubsub-subscribe")];
                    case 5:
                        _a.sent();
                        log.error("Failed to subscribe to pubsub topic (".concat(pubsubTopic, ") to (").concat(pubsubProviderUrl, ")"));
                        throw new plebbit_error_1.PlebbitError("ERR_PUBSUB_FAILED_TO_SUBSCRIBE", { pubsubTopic: pubsubTopic, pubsubProviderUrl: pubsubProviderUrl, error: e_1 });
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype.pubsubSubscribe = function (pubsubTopic, handler) {
        return __awaiter(this, void 0, void 0, function () {
            var providersSorted, providerToError, i, pubsubProviderUrl, combinedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._plebbit.stats.sortGatewaysAccordingToScore("pubsub-subscribe")];
                    case 1:
                        providersSorted = _a.sent();
                        providerToError = {};
                        for (i = 0; i < providersSorted.length; i++) {
                            pubsubProviderUrl = providersSorted[i];
                            try {
                                return [2 /*return*/, this.pubsubSubscribeOnProvider(pubsubTopic, handler, pubsubProviderUrl)];
                            }
                            catch (e) {
                                providerToError[pubsubProviderUrl] = e;
                            }
                        }
                        combinedError = new plebbit_error_1.PlebbitError("ERR_PUBSUB_FAILED_TO_SUBSCRIBE", { pubsubTopic: pubsubTopic, providerToError: providerToError });
                        this.emitError(combinedError);
                        throw combinedError;
                }
            });
        });
    };
    BaseClientsManager.prototype.pubsubUnsubscribeOnProvider = function (pubsubTopic, pubsubProvider, handler) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._plebbit.clients.pubsubClients[pubsubProvider]._client.pubsub.unsubscribe(pubsubTopic, handler)];
                    case 1:
                        _a.sent();
                        this.providerSubscriptions[pubsubProvider] = this.providerSubscriptions[pubsubProvider].filter(function (subPubsubTopic) { return subPubsubTopic !== pubsubTopic; });
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype.pubsubUnsubscribe = function (pubsubTopic, handler) {
        return __awaiter(this, void 0, void 0, function () {
            var i, pubsubProviderUrl, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < Object.keys(this._plebbit.clients.pubsubClients).length)) return [3 /*break*/, 6];
                        pubsubProviderUrl = Object.keys(this._plebbit.clients.pubsubClients)[i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.pubsubUnsubscribeOnProvider(pubsubTopic, pubsubProviderUrl, handler)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype.prePubsubPublishProvider = function (pubsubTopic, pubsubProvider) { };
    BaseClientsManager.prototype.postPubsubPublishProviderSuccess = function (pubsubTopic, pubsubProvider) { };
    BaseClientsManager.prototype.postPubsubPublishProviderFailure = function (pubsubTopic, pubsubProvider, error) { };
    BaseClientsManager.prototype.pubsubPublishOnProvider = function (pubsubTopic, data, pubsubProvider) {
        return __awaiter(this, void 0, void 0, function () {
            var log, dataBinary, timeBefore, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:pubsubPublish");
                        dataBinary = cborg.encode(data);
                        this.prePubsubPublishProvider(pubsubTopic, pubsubProvider);
                        timeBefore = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, this._plebbit.clients.pubsubClients[pubsubProvider]._client.pubsub.publish(pubsubTopic, dataBinary)];
                    case 2:
                        _a.sent();
                        this.postPubsubPublishProviderSuccess(pubsubTopic, pubsubProvider);
                        this._plebbit.stats.recordGatewaySuccess(pubsubProvider, "pubsub-publish", Date.now() - timeBefore); // Awaiting this statement will bug out tests
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        this.postPubsubPublishProviderFailure(pubsubTopic, pubsubProvider, error_1);
                        return [4 /*yield*/, this._plebbit.stats.recordGatewayFailure(pubsubProvider, "pubsub-publish")];
                    case 4:
                        _a.sent();
                        (0, util_1.throwWithErrorCode)("ERR_PUBSUB_FAILED_TO_PUBLISH", { pubsubTopic: pubsubTopic, pubsubProvider: pubsubProvider, error: error_1 });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype.pubsubPublish = function (pubsubTopic, data) {
        return __awaiter(this, void 0, void 0, function () {
            var log, providersSorted, providerToError, i, pubsubProviderUrl, e_2, combinedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:client-manager:pubsubPublish");
                        return [4 /*yield*/, this._plebbit.stats.sortGatewaysAccordingToScore("pubsub-publish")];
                    case 1:
                        providersSorted = _a.sent();
                        providerToError = {};
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < providersSorted.length)) return [3 /*break*/, 7];
                        pubsubProviderUrl = providersSorted[i];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.pubsubPublishOnProvider(pubsubTopic, data, pubsubProviderUrl)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        e_2 = _a.sent();
                        log.error("Failed to publish to pubsub topic (".concat(pubsubTopic, ") to (").concat(pubsubProviderUrl, ")"));
                        providerToError[pubsubProviderUrl] = e_2;
                        return [3 /*break*/, 6];
                    case 6:
                        i++;
                        return [3 /*break*/, 2];
                    case 7:
                        combinedError = new plebbit_error_1.PlebbitError("ERR_PUBSUB_FAILED_TO_PUBLISH", { pubsubTopic: pubsubTopic, data: data, providerToError: providerToError });
                        this.emitError(combinedError);
                        throw combinedError;
                }
            });
        });
    };
    // Gateway methods
    BaseClientsManager.prototype._fetchWithLimit = function (url, options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var res, e_3, errorCode, totalBytesRead, reader, decoder, resText, _c, done, value;
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
                        e_3 = _d.sent();
                        if (e_3.message.includes("over limit"))
                            (0, util_1.throwWithErrorCode)("ERR_OVER_DOWNLOAD_LIMIT", { url: url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                        errorCode = url.includes("/ipfs/")
                            ? "ERR_FAILED_TO_FETCH_IPFS_VIA_GATEWAY"
                            : url.includes("/ipns/")
                                ? "ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY"
                                : "ERR_FAILED_TO_FETCH_GENERIC";
                        (0, util_1.throwWithErrorCode)(errorCode, { url: url, status: res === null || res === void 0 ? void 0 : res.status, statusText: res === null || res === void 0 ? void 0 : res.statusText, error: e_3 });
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
    BaseClientsManager.prototype.preFetchGateway = function (gatewayUrl, path, loadType) { };
    BaseClientsManager.prototype.postFetchGatewaySuccess = function (gatewayUrl, path, loadType) { };
    BaseClientsManager.prototype.postFetchGatewayFailure = function (gatewayUrl, path, loadType, error) { };
    BaseClientsManager.prototype.postFetchGatewayAborted = function (gatewayUrl, path, loadType) { };
    BaseClientsManager.prototype._fetchFromGatewayAndVerifyIfNeeded = function (loadType, url, abortController, log) {
        return __awaiter(this, void 0, void 0, function () {
            var isCid, resText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.trace("Fetching url (".concat(url, ")"));
                        isCid = loadType === "comment" || loadType === "generic-ipfs";
                        return [4 /*yield*/, this._fetchWithLimit(url, { cache: isCid ? "force-cache" : "no-store", signal: abortController.signal })];
                    case 1:
                        resText = _a.sent();
                        if (!isCid) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._verifyContentIsSameAsCid(resText, url.split("/ipfs/")[1])];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, resText];
                }
            });
        });
    };
    BaseClientsManager.prototype._fetchWithGateway = function (gateway, path, loadType, abortController) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var log, url, timeBefore, isCid, cacheKey, isUsingCache, resText, fetchPromise, e_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:fetchWithGateway");
                        url = "".concat(gateway).concat(path);
                        timeBefore = Date.now();
                        isCid = loadType === "comment" || loadType === "generic-ipfs";
                        this.preFetchGateway(gateway, path, loadType);
                        cacheKey = url;
                        isUsingCache = true;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 8, , 13]);
                        resText = void 0;
                        if (!constants_1.gatewayFetchPromiseCache.has(cacheKey)) return [3 /*break*/, 3];
                        return [4 /*yield*/, constants_1.gatewayFetchPromiseCache.get(cacheKey)];
                    case 2:
                        resText = _c.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        isUsingCache = false;
                        fetchPromise = this._fetchFromGatewayAndVerifyIfNeeded(loadType, url, abortController, log);
                        constants_1.gatewayFetchPromiseCache.set(cacheKey, fetchPromise);
                        return [4 /*yield*/, fetchPromise];
                    case 4:
                        resText = _c.sent();
                        if (loadType === "subplebbit")
                            constants_1.gatewayFetchPromiseCache.delete(cacheKey); // ipns should not be cached
                        _c.label = 5;
                    case 5:
                        this.postFetchGatewaySuccess(gateway, path, loadType);
                        if (!!isUsingCache) return [3 /*break*/, 7];
                        return [4 /*yield*/, this._plebbit.stats.recordGatewaySuccess(gateway, isCid || loadType === "comment-update" ? "cid" : "ipns", Date.now() - timeBefore)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7: return [2 /*return*/, resText];
                    case 8:
                        e_4 = _c.sent();
                        constants_1.gatewayFetchPromiseCache.delete(cacheKey);
                        if (!(((_b = (_a = e_4 === null || e_4 === void 0 ? void 0 : e_4.details) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.type) === "aborted")) return [3 /*break*/, 9];
                        this.postFetchGatewayAborted(gateway, path, loadType);
                        return [2 /*return*/, undefined];
                    case 9:
                        this.postFetchGatewayFailure(gateway, path, loadType, e_4);
                        if (!!isUsingCache) return [3 /*break*/, 11];
                        return [4 /*yield*/, this._plebbit.stats.recordGatewayFailure(gateway, isCid ? "cid" : "ipns")];
                    case 10:
                        _c.sent();
                        _c.label = 11;
                    case 11: return [2 /*return*/, { error: e_4 }];
                    case 12: return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype._firstResolve = function (promises) {
        if (promises.length === 0)
            throw Error("No promises to find the first resolve");
        return new Promise(function (resolve) {
            return promises.forEach(function (promise, i) {
                return promise.then(function (res) {
                    if (typeof res === "string")
                        resolve({ res: res, i: i });
                });
            });
        });
    };
    BaseClientsManager.prototype.getGatewayTimeoutMs = function (loadType) {
        return loadType === "subplebbit"
            ? 5 * 60 * 1000 // 5min
            : loadType === "comment"
                ? 60 * 1000 // 1 min
                : loadType === "comment-update"
                    ? 2 * 60 * 1000 // 2min
                    : 30 * 1000; // 30s
    };
    BaseClientsManager.prototype.fetchFromMultipleGateways = function (loadOpts, loadType) {
        return __awaiter(this, void 0, void 0, function () {
            var path, type, timeoutMs, concurrencyLimit, queueLimit, gatewaysSorted, _a, gatewayFetches, cleanUp, _loop_1, _i, gatewaysSorted_1, gateway, gatewayPromises, res, gatewayToError, i, errorCode, combinedError;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, assert_1.default)(loadOpts.cid || loadOpts.ipns);
                        path = loadOpts.cid ? "/ipfs/".concat(loadOpts.cid) : "/ipns/".concat(loadOpts.ipns);
                        type = loadOpts.cid ? "cid" : "ipns";
                        timeoutMs = this._plebbit._clientsManager.getGatewayTimeoutMs(loadType);
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
                        gatewayFetches = {};
                        cleanUp = function () {
                            queueLimit.clearQueue();
                            Object.values(gatewayFetches).map(function (gateway) {
                                if (!gateway.response && !gateway.error)
                                    gateway.abortController.abort();
                                clearTimeout(gateway.timeoutId);
                            });
                        };
                        _loop_1 = function (gateway) {
                            var abortController = new AbortController();
                            gatewayFetches[gateway] = {
                                abortController: abortController,
                                promise: queueLimit(function () { return _this._fetchWithGateway(gateway, path, loadType, abortController); }),
                                timeoutId: setTimeout(function () { return abortController.abort(); }, timeoutMs)
                            };
                        };
                        for (_i = 0, gatewaysSorted_1 = gatewaysSorted; _i < gatewaysSorted_1.length; _i++) {
                            gateway = gatewaysSorted_1[_i];
                            _loop_1(gateway);
                        }
                        gatewayPromises = Object.values(gatewayFetches).map(function (fetching) { return fetching.promise; });
                        return [4 /*yield*/, Promise.race([this._firstResolve(gatewayPromises), Promise.allSettled(gatewayPromises)])];
                    case 4:
                        res = _b.sent();
                        if (Array.isArray(res)) {
                            cleanUp();
                            gatewayToError = {};
                            for (i = 0; i < res.length; i++)
                                if (res[i]["value"])
                                    gatewayToError[gatewaysSorted[i]] = res[i]["value"].error;
                            errorCode = Object.values(gatewayToError)[0].code;
                            combinedError = new plebbit_error_1.PlebbitError(errorCode, { loadOpts: loadOpts, gatewayToError: gatewayToError });
                            throw combinedError;
                        }
                        else {
                            cleanUp();
                            return [2 /*return*/, res.res];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // IPFS P2P methods
    BaseClientsManager.prototype.resolveIpnsToCidP2P = function (ipnsName) {
        return __awaiter(this, void 0, void 0, function () {
            var ipfsClient, cid, cidPromise, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ipfsClient = this.getDefaultIpfs();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        cid = void 0;
                        if (!constants_1.p2pIpnsPromiseCache.has(ipnsName)) return [3 /*break*/, 3];
                        return [4 /*yield*/, constants_1.p2pIpnsPromiseCache.get(ipnsName)];
                    case 2:
                        cid = _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        cidPromise = ipfsClient._client.name.resolve(ipnsName);
                        constants_1.p2pIpnsPromiseCache.set(ipnsName, cidPromise);
                        return [4 /*yield*/, cidPromise];
                    case 4:
                        cid = _a.sent();
                        constants_1.p2pIpnsPromiseCache.delete(ipnsName);
                        _a.label = 5;
                    case 5:
                        if (typeof cid !== "string")
                            (0, util_1.throwWithErrorCode)("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipnsName: ipnsName });
                        return [2 /*return*/, cid];
                    case 6:
                        error_2 = _a.sent();
                        constants_1.p2pIpnsPromiseCache.delete(ipnsName);
                        if ((error_2 === null || error_2 === void 0 ? void 0 : error_2.code) === "ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS")
                            throw error_2;
                        else
                            (0, util_1.throwWithErrorCode)("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipnsName: ipnsName, error: error_2 });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // TODO rename this to _fetchPathP2P
    BaseClientsManager.prototype._fetchCidP2P = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var ipfsClient, fetchPromise, promise, e_5;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ipfsClient = this.getDefaultIpfs();
                        fetchPromise = function () { return __awaiter(_this, void 0, void 0, function () {
                            var fileContent, calculatedCid;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, ipfsClient._client.cat(cid, { length: DOWNLOAD_LIMIT_BYTES })];
                                    case 1:
                                        fileContent = _a.sent();
                                        if (typeof fileContent !== "string")
                                            (0, util_1.throwWithErrorCode)("ERR_FAILED_TO_FETCH_IPFS_VIA_IPFS", { cid: cid });
                                        if (!(fileContent.length === DOWNLOAD_LIMIT_BYTES)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, ipfs_only_hash_1.default.of(fileContent)];
                                    case 2:
                                        calculatedCid = _a.sent();
                                        if (calculatedCid !== cid)
                                            (0, util_1.throwWithErrorCode)("ERR_OVER_DOWNLOAD_LIMIT", { cid: cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                                        _a.label = 3;
                                    case 3: return [2 /*return*/, fileContent];
                                }
                            });
                        }); };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!constants_1.p2pCidPromiseCache.has(cid)) return [3 /*break*/, 3];
                        return [4 /*yield*/, constants_1.p2pCidPromiseCache.get(cid)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        promise = fetchPromise();
                        constants_1.p2pCidPromiseCache.set(cid, promise);
                        return [4 /*yield*/, promise];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_5 = _a.sent();
                        constants_1.p2pCidPromiseCache.delete(cid);
                        throw e_5;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype._verifyContentIsSameAsCid = function (content, cid) {
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
    // Resolver methods here
    BaseClientsManager.prototype._getCachedTextRecord = function (address, txtRecord) {
        return __awaiter(this, void 0, void 0, function () {
            var resolveCache, resolvedTimestamp, stale;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._plebbit._storage.getItem("".concat(address, "_").concat(txtRecord))];
                    case 1:
                        resolveCache = _a.sent();
                        if (!(typeof resolveCache === "string")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._plebbit._storage.getItem("".concat(address, "_").concat(txtRecord, "_timestamp"))];
                    case 2:
                        resolvedTimestamp = _a.sent();
                        (0, assert_1.default)(typeof resolvedTimestamp === "number", "Cache of address (".concat(address, ") txt record (").concat(txtRecord, ") has no timestamp"));
                        stale = (0, util_1.timestamp)() - resolvedTimestamp > 3600;
                        return [2 /*return*/, { stale: stale, resolveCache: resolveCache }];
                    case 3: return [2 /*return*/, undefined];
                }
            });
        });
    };
    BaseClientsManager.prototype._resolveTextRecordWithCache = function (address, txtRecord) {
        return __awaiter(this, void 0, void 0, function () {
            var log, chain, cachedTextRecord;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:client-manager:resolveTextRecord");
                        chain = address.endsWith(".eth") ? "eth" : undefined;
                        if (!chain)
                            throw Error("Can't figure out the chain of the address");
                        return [4 /*yield*/, this._getCachedTextRecord(address, txtRecord)];
                    case 1:
                        cachedTextRecord = _a.sent();
                        if (cachedTextRecord) {
                            if (cachedTextRecord.stale)
                                this._resolveTextRecordConcurrently(address, txtRecord, chain);
                            return [2 /*return*/, cachedTextRecord.resolveCache];
                        }
                        else
                            return [2 /*return*/, this._resolveTextRecordConcurrently(address, txtRecord, chain)];
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype.preResolveTextRecord = function (address, txtRecordName, chain, chainProviderUrl) { };
    BaseClientsManager.prototype.postResolveTextRecordSuccess = function (address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl) { };
    BaseClientsManager.prototype.postResolveTextRecordFailure = function (address, txtRecordName, chain, chainProviderUrl, error) { };
    BaseClientsManager.prototype._resolveTextRecordSingleChainProvider = function (address, txtRecordName, chain, chainproviderUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var timeBefore, cacheKey, isUsingCache, resolvedTextRecord, resolvePromise, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.preResolveTextRecord(address, txtRecordName, chain, chainproviderUrl);
                        timeBefore = Date.now();
                        cacheKey = (0, js_sha256_1.sha256)(address + txtRecordName + chain + chainproviderUrl);
                        isUsingCache = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 11]);
                        resolvedTextRecord = void 0;
                        if (!constants_1.ensResolverPromiseCache.has(cacheKey)) return [3 /*break*/, 3];
                        return [4 /*yield*/, constants_1.ensResolverPromiseCache.get(cacheKey)];
                    case 2:
                        resolvedTextRecord = _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        isUsingCache = false;
                        resolvePromise = this._plebbit.resolver.resolveTxtRecord(address, txtRecordName, chain, chainproviderUrl);
                        constants_1.ensResolverPromiseCache.set(cacheKey, resolvePromise);
                        return [4 /*yield*/, resolvePromise];
                    case 4:
                        resolvedTextRecord = _a.sent();
                        _a.label = 5;
                    case 5:
                        this.postResolveTextRecordSuccess(address, txtRecordName, resolvedTextRecord, chain, chainproviderUrl);
                        if (!!isUsingCache) return [3 /*break*/, 7];
                        return [4 /*yield*/, this._plebbit.stats.recordGatewaySuccess(chainproviderUrl, chain, Date.now() - timeBefore)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/, resolvedTextRecord];
                    case 8:
                        e_6 = _a.sent();
                        constants_1.ensResolverPromiseCache.delete(cacheKey);
                        this.postResolveTextRecordFailure(address, txtRecordName, chain, chainproviderUrl, e_6);
                        if (!!isUsingCache) return [3 /*break*/, 10];
                        return [4 /*yield*/, this._plebbit.stats.recordGatewayFailure(chainproviderUrl, chain)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [2 /*return*/, { error: e_6 }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype._resolveTextRecordConcurrently = function (address, txtRecordName, chain) {
        return __awaiter(this, void 0, void 0, function () {
            var log, timeouts, _firstResolve, concurrencyLimit, queueLimit, i, cachedTextRecord, providersSorted, _a, providerPromises, resolvedTextRecord, errorsCombined, i_1, e_7;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:client-manager:_resolveEnsTextRecord");
                        timeouts = [0, 0, 100, 1000];
                        _firstResolve = function (promises) {
                            return new Promise(function (resolve) {
                                return promises.forEach(function (promise) {
                                    return promise.then(function (res) {
                                        if (typeof res === "string" || res === null)
                                            resolve(res);
                                    });
                                });
                            });
                        };
                        concurrencyLimit = 3;
                        queueLimit = (0, p_limit_1.default)(concurrencyLimit);
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < timeouts.length)) return [3 /*break*/, 17];
                        if (!(timeouts[i] !== 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, util_1.delay)(timeouts[i])];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, this._getCachedTextRecord(address, txtRecordName)];
                    case 4:
                        cachedTextRecord = _b.sent();
                        if (cachedTextRecord && !cachedTextRecord.stale)
                            return [2 /*return*/, cachedTextRecord.resolveCache];
                        log.trace("Retrying to resolve address (".concat(address, ") text record (").concat(txtRecordName, ") for the ").concat(i, "th time"));
                        if (!(this._plebbit.clients.chainProviders[chain].urls.length <= concurrencyLimit)) return [3 /*break*/, 5];
                        _a = this._plebbit.clients.chainProviders[chain].urls;
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this._plebbit.stats.sortGatewaysAccordingToScore(chain)];
                    case 6:
                        _a = _b.sent();
                        _b.label = 7;
                    case 7:
                        providersSorted = _a;
                        _b.label = 8;
                    case 8:
                        _b.trys.push([8, 15, , 16]);
                        providerPromises = providersSorted.map(function (providerUrl) {
                            return queueLimit(function () { return _this._resolveTextRecordSingleChainProvider(address, txtRecordName, chain, providerUrl); });
                        });
                        return [4 /*yield*/, Promise.race([
                                _firstResolve(providerPromises),
                                Promise.allSettled(providerPromises)
                            ])];
                    case 9:
                        resolvedTextRecord = _b.sent();
                        if (!Array.isArray(resolvedTextRecord)) return [3 /*break*/, 10];
                        errorsCombined = {};
                        for (i_1 = 0; i_1 < providersSorted.length; i_1++)
                            errorsCombined[providersSorted[i_1]] = resolvedTextRecord[i_1]["value"]["error"];
                        (0, util_1.throwWithErrorCode)("ERR_FAILED_TO_RESOLVE_TEXT_RECORD", { errors: errorsCombined, address: address, txtRecordName: txtRecordName, chain: chain });
                        return [3 /*break*/, 14];
                    case 10:
                        queueLimit.clearQueue();
                        if (!(typeof resolvedTextRecord === "string")) return [3 /*break*/, 13];
                        return [4 /*yield*/, this._plebbit._storage.setItem("".concat(address, "_").concat(txtRecordName), resolvedTextRecord)];
                    case 11:
                        _b.sent();
                        return [4 /*yield*/, this._plebbit._storage.setItem("".concat(address, "_").concat(txtRecordName, "_timestamp"), (0, util_1.timestamp)())];
                    case 12:
                        _b.sent();
                        _b.label = 13;
                    case 13: return [2 /*return*/, resolvedTextRecord];
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        e_7 = _b.sent();
                        if (i === timeouts.length - 1) {
                            log.error("Failed to resolve address (".concat(address, ") text record (").concat(txtRecordName, ") using providers "), providersSorted, e_7);
                            this.emitError(e_7);
                            throw e_7;
                        }
                        return [3 /*break*/, 16];
                    case 16:
                        i++;
                        return [3 /*break*/, 1];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype.resolveSubplebbitAddressIfNeeded = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, assert_1.default)(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
                if (!this._plebbit.resolver.isDomain(subplebbitAddress))
                    return [2 /*return*/, subplebbitAddress];
                return [2 /*return*/, this._resolveTextRecordWithCache(subplebbitAddress, "subplebbit-address")];
            });
        });
    };
    BaseClientsManager.prototype.resolveAuthorAddressIfNeeded = function (authorAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, assert_1.default)(typeof authorAddress === "string", "subplebbitAddress needs to be a string to be resolved");
                if (!this._plebbit.resolver.isDomain(authorAddress))
                    return [2 /*return*/, authorAddress];
                else if (this._plebbit.plebbitRpcClient)
                    return [2 /*return*/, this._plebbit.plebbitRpcClient.resolveAuthorAddress(authorAddress)];
                else
                    return [2 /*return*/, this._resolveTextRecordWithCache(authorAddress, "plebbit-author-address")];
                return [2 /*return*/];
            });
        });
    };
    // Misc functions
    BaseClientsManager.prototype.emitError = function (e) {
        this._plebbit.emit("error", e);
    };
    return BaseClientsManager;
}());
exports.BaseClientsManager = BaseClientsManager;
//# sourceMappingURL=base-client-manager.js.map