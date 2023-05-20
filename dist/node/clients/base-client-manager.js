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
exports.BaseClientsManager = void 0;
var assert_1 = __importDefault(require("assert"));
var util_1 = require("../util");
var from_string_1 = require("uint8arrays/from-string");
var ipfs_only_hash_1 = __importDefault(require("ipfs-only-hash"));
var util_2 = require("../runtime/node/util");
var p_limit_1 = __importDefault(require("p-limit"));
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var DOWNLOAD_LIMIT_BYTES = 1000000; // 1mb
var BaseClientsManager = /** @class */ (function () {
    function BaseClientsManager(plebbit) {
        this._plebbit = plebbit;
        this._curPubsubNodeUrl = Object.values(plebbit.clients.pubsubClients)[0]._clientOptions.url;
        if (plebbit.clients.ipfsClients)
            this._curIpfsNodeUrl = Object.values(plebbit.clients.ipfsClients)[0]._clientOptions.url;
    }
    BaseClientsManager.prototype.toJSON = function () {
        return undefined;
    };
    BaseClientsManager.prototype.getCurrentPubsub = function () {
        return this._plebbit.clients.pubsubClients[this._curPubsubNodeUrl];
    };
    BaseClientsManager.prototype.getCurrentIpfs = function () {
        (0, assert_1.default)(this._curIpfsNodeUrl);
        (0, assert_1.default)(this._plebbit.clients.ipfsClients[this._curIpfsNodeUrl]);
        return this._plebbit.clients.ipfsClients[this._curIpfsNodeUrl];
    };
    // Pubsub methods
    BaseClientsManager.prototype.pubsubSubscribe = function (pubsubTopic, handler) {
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
                        (0, util_1.throwWithErrorCode)("ERR_PUBSUB_FAILED_TO_SUBSCRIBE", { pubsubTopic: pubsubTopic, pubsubNode: this._curPubsubNodeUrl, error: e_1 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype.pubsubUnsubscribe = function (pubsubTopic, handler) {
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
                        (0, util_1.throwWithErrorCode)("ERR_PUBSUB_FAILED_TO_UNSUBSCRIBE", { pubsubTopic: pubsubTopic, pubsubNode: this._curPubsubNodeUrl, error: error_1 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype.pubsubPublish = function (pubsubTopic, data) {
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
                        (0, util_1.throwWithErrorCode)("ERR_PUBSUB_FAILED_TO_PUBLISH", { pubsubTopic: pubsubTopic, pubsubNode: this._curPubsubNodeUrl, error: error_2 });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Gateway methods
    BaseClientsManager.prototype._fetchWithLimit = function (url, options) {
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
    BaseClientsManager.prototype.preFetchGateway = function (gatewayUrl, path, loadType) { };
    BaseClientsManager.prototype.postFetchGatewaySuccess = function (gatewayUrl, path, loadType) { };
    BaseClientsManager.prototype.postFetchGatewayFailure = function (gatewayUrl, path, loadType) { };
    BaseClientsManager.prototype._fetchWithGateway = function (gateway, path, loadType) {
        return __awaiter(this, void 0, void 0, function () {
            var log, url, timeBefore, isCid, resText, timeElapsedMs, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:fetchWithGateway");
                        url = "".concat(gateway).concat(path);
                        log.trace("Fetching url (".concat(url, ")"));
                        timeBefore = Date.now();
                        isCid = path.includes("/ipfs/");
                        this.preFetchGateway(gateway, path, loadType);
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
                        this.postFetchGatewaySuccess(gateway, path, loadType);
                        timeElapsedMs = Date.now() - timeBefore;
                        return [4 /*yield*/, this._plebbit.stats.recordGatewaySuccess(gateway, isCid ? "cid" : "ipns", timeElapsedMs)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, resText];
                    case 6:
                        e_3 = _a.sent();
                        return [4 /*yield*/, this._plebbit.stats.recordGatewayFailure(gateway, isCid ? "cid" : "ipns")];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, { error: e_3 }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype.fetchFromMultipleGateways = function (loadOpts, loadType) {
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
    // IPFS P2P methods
    BaseClientsManager.prototype.resolveIpnsToCidP2P = function (ipns) {
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
    BaseClientsManager.prototype._fetchCidP2P = function (cid) {
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
    BaseClientsManager.prototype._getCachedEns = function (ens, txtRecord) {
        return __awaiter(this, void 0, void 0, function () {
            var resolveCache, resolvedTimestamp, stale;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._plebbit._cache.getItem("".concat(ens, "_").concat(txtRecord))];
                    case 1:
                        resolveCache = _a.sent();
                        if (!(typeof resolveCache === "string")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._plebbit._cache.getItem("".concat(ens, "_").concat(txtRecord, "_timestamp"))];
                    case 2:
                        resolvedTimestamp = _a.sent();
                        (0, assert_1.default)(typeof resolvedTimestamp === "number");
                        stale = (0, util_1.timestamp)() - resolvedTimestamp > 3600;
                        return [2 /*return*/, { stale: stale, resolveCache: resolveCache }];
                    case 3: return [2 /*return*/, undefined];
                }
            });
        });
    };
    BaseClientsManager.prototype._resolveEnsTextRecordWithCache = function (ens, txtRecord) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!ens.endsWith(".eth"))
                    return [2 /*return*/, ens];
                return [2 /*return*/, this._resolveEnsTextRecord(ens, txtRecord)];
            });
        });
    };
    BaseClientsManager.prototype.preResolveTextRecord = function (ens, txtRecordName) { };
    BaseClientsManager.prototype.postResolveTextRecordSuccess = function (ens, txtRecordName, resolvedTextRecord) { };
    BaseClientsManager.prototype.postResolveTextRecordFailure = function (ens, txtRecordName) { };
    BaseClientsManager.prototype._resolveEnsTextRecord = function (ens, txtRecordName) {
        return __awaiter(this, void 0, void 0, function () {
            var log, timeouts, i, cacheEns, resolvedTxtRecord, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:client-manager:_resolveEnsTextRecord");
                        timeouts = [0, 0, 100, 1000];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < timeouts.length)) return [3 /*break*/, 9];
                        if (!(timeouts[i] !== 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, util_1.delay)(timeouts[i])];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this._getCachedEns(ens, txtRecordName)];
                    case 4:
                        cacheEns = _a.sent();
                        if (cacheEns && !cacheEns.stale)
                            return [2 /*return*/, cacheEns.resolveCache];
                        log.trace("Retrying to resolve ENS (".concat(ens, ") text record (").concat(txtRecordName, ") for the ").concat(i, "th time"));
                        this.preResolveTextRecord(ens, txtRecordName);
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this._plebbit.resolver._resolveEnsTxtRecord(ens, txtRecordName)];
                    case 6:
                        resolvedTxtRecord = _a.sent();
                        this.postResolveTextRecordSuccess(ens, txtRecordName, resolvedTxtRecord);
                        return [2 /*return*/, resolvedTxtRecord];
                    case 7:
                        e_4 = _a.sent();
                        this.postResolveTextRecordFailure(ens, txtRecordName);
                        if (i === timeouts.length - 1) {
                            this.emitError(e_4);
                            throw e_4;
                        }
                        return [3 /*break*/, 8];
                    case 8:
                        i++;
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    BaseClientsManager.prototype.resolveSubplebbitAddressIfNeeded = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, assert_1.default)(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
                return [2 /*return*/, this._resolveEnsTextRecordWithCache(subplebbitAddress, "subplebbit-address")];
            });
        });
    };
    BaseClientsManager.prototype.resolveAuthorAddressIfNeeded = function (authorAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, assert_1.default)(typeof authorAddress === "string", "subplebbitAddress needs to be a string to be resolved");
                return [2 /*return*/, this._resolveEnsTextRecordWithCache(authorAddress, "plebbit-author-address")];
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