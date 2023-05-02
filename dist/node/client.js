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
var util_1 = require("./util");
var assert_1 = __importDefault(require("assert"));
var p_limit_1 = __importDefault(require("p-limit"));
var ipfs_only_hash_1 = __importDefault(require("ipfs-only-hash"));
var signer_1 = require("./signer");
var lodash_1 = __importDefault(require("lodash"));
var util_2 = require("./runtime/node/util");
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var DOWNLOAD_LIMIT_BYTES = 1000000; // 1mb
var ClientsManager = /** @class */ (function () {
    function ClientsManager(plebbit) {
        this._plebbit = plebbit;
        this.curPubsubNodeUrl = Object.values(plebbit.clients.pubsubClients)[0]._clientOptions.url;
        if (plebbit.clients.ipfsClients)
            this.curIpfsNodeUrl = Object.values(plebbit.clients.ipfsClients)[0]._clientOptions.url;
        //@ts-expect-error
        this.clients = {};
        for (var _i = 0, _a = Object.keys(plebbit.clients); _i < _a.length; _i++) {
            var clientKey = _a[_i];
            this.clients[clientKey] = {};
            for (var _b = 0, _c = Object.keys(plebbit.clients[clientKey]); _b < _c.length; _b++) {
                var url = _c[_b];
                this.clients[clientKey][url] = { state: "stopped" };
            }
        }
    }
    ClientsManager.prototype.toJSON = function () {
        return undefined;
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
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentPubsub()._client.pubsub.subscribe(pubsubTopic, handler)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype.pubsubUnsubscribe = function (pubsubTopic, handler) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentPubsub()._client.pubsub.unsubscribe(pubsubTopic, handler)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype.pubsubPublish = function (pubsubTopic, data) {
        return __awaiter(this, void 0, void 0, function () {
            var dataBinary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataBinary = (0, from_string_1.fromString)(data);
                        return [4 /*yield*/, this.getCurrentPubsub()._client.pubsub.publish(pubsubTopic, dataBinary)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype._fetchWithLimit = function (url, options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var res, e_1, errorCode, totalBytesRead, reader, decoder, resText, _c, done, value;
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
                        e_1 = _d.sent();
                        if (e_1.message.includes("over limit"))
                            (0, util_1.throwWithErrorCode)("ERR_OVER_DOWNLOAD_LIMIT", { url: url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                        errorCode = url.includes("/ipfs/")
                            ? "ERR_FAILED_TO_FETCH_IPFS_VIA_GATEWAY"
                            : url.includes("/ipns/")
                                ? "ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY"
                                : "ERR_FAILED_TO_FETCH_GENERIC";
                        (0, util_1.throwWithErrorCode)(errorCode, { url: url, status: res === null || res === void 0 ? void 0 : res.status, statusText: res === null || res === void 0 ? void 0 : res.statusText });
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
            var ipfsClient, cid, error_1;
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
                        error_1 = _a.sent();
                        (0, util_1.throwWithErrorCode)("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipns: ipns, error: error_1 });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype.fetchCidP2P = function (cid) {
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
    ClientsManager.prototype.fetchWithGateway = function (gateway, path) {
        return __awaiter(this, void 0, void 0, function () {
            var url, timeBefore, isCid, resText, timeElapsedMs, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(gateway).concat(path);
                        timeBefore = Date.now();
                        isCid = path.includes("/ipfs/");
                        this.updateGatewayState(isCid ? "fetching-ipfs" : "fetching-ipns", gateway);
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
                        e_2 = _a.sent();
                        this.updateGatewayState("stopped", gateway);
                        return [4 /*yield*/, this._plebbit.stats.recordGatewayFailure(gateway, isCid ? "cid" : "ipns")];
                    case 7:
                        _a.sent();
                        throw e_2;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype.fetchFromMultipleGateways = function (loadOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var path, _firstResolve, type, queueLimit, gatewayFetches, res;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(loadOpts.cid || loadOpts.ipns);
                        path = loadOpts.cid ? "/ipfs/".concat(loadOpts.cid) : "/ipns/".concat(loadOpts.ipns);
                        _firstResolve = function (promises) {
                            return new Promise(function (resolve) { return promises.forEach(function (promise) { return promise.then(resolve); }); });
                        };
                        type = loadOpts.cid ? "cid" : "ipns";
                        queueLimit = (0, p_limit_1.default)(3);
                        return [4 /*yield*/, this._plebbit.stats.sortGatewaysAccordingToScore(type)];
                    case 1:
                        gatewayFetches = (_a.sent()).map(function (gateway) {
                            return queueLimit(function () { return _this.fetchWithGateway(gateway, path); });
                        });
                        return [4 /*yield*/, Promise.race([_firstResolve(gatewayFetches), Promise.allSettled(gatewayFetches)])];
                    case 2:
                        res = _a.sent();
                        if (typeof res === "string")
                            return [2 /*return*/, res];
                        //@ts-expect-error
                        else
                            throw res[0].reason;
                        return [2 /*return*/];
                }
            });
        });
    };
    // State methods here
    ClientsManager.prototype.updatePubsubState = function (newState) {
        this.clients.pubsubClients[this.curPubsubNodeUrl].state = newState;
    };
    ClientsManager.prototype.updateIpfsState = function (newState) {
        (0, assert_1.default)(this.curIpfsNodeUrl);
        this.clients.ipfsClients[this.curIpfsNodeUrl].state = newState;
    };
    ClientsManager.prototype.updateGatewayState = function (newState, gateway) {
        this.clients.ipfsGateways[gateway].state = newState;
    };
    ClientsManager.prototype.updateChainProviderState = function (newState, chainTicker) {
        this.clients.chainProviders[chainTicker].state = newState;
    };
    ClientsManager.prototype.handleError = function (e) {
        this._plebbit.emit("error", e);
    };
    // Resolver methods here
    ClientsManager.prototype.resolveSubplebbitAddressIfNeeded = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var log, resolvedSubplebbitAddress, txtRecordName, resolveCache, resolvedTimestamp, shouldResolveAgain, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:resolver:resolveSubplebbitAddressIfNeeded");
                        resolvedSubplebbitAddress = lodash_1.default.clone(subplebbitAddress);
                        txtRecordName = "subplebbit-address";
                        if (!subplebbitAddress.endsWith(".eth")) return [3 /*break*/, 8];
                        return [4 /*yield*/, this._plebbit._cache.getItem("".concat(subplebbitAddress, "_").concat(txtRecordName))];
                    case 1:
                        resolveCache = _a.sent();
                        if (!(typeof resolveCache === "string")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._plebbit._cache.getItem("".concat(subplebbitAddress, "_").concat(txtRecordName, "_timestamp"))];
                    case 2:
                        resolvedTimestamp = _a.sent();
                        (0, assert_1.default)(typeof resolvedTimestamp === "number");
                        shouldResolveAgain = (0, util_1.timestamp)() - resolvedTimestamp > 86400;
                        if (!shouldResolveAgain)
                            return [2 /*return*/, resolveCache];
                        log("Cache of ENS (".concat(subplebbitAddress, ") txt record name (").concat(txtRecordName, ") is stale. Invalidating the cache..."));
                        _a.label = 3;
                    case 3:
                        this.updateChainProviderState("resolving-subplebbit-address", "eth");
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this._plebbit.resolver._resolveEnsTxtRecord(subplebbitAddress, "subplebbit-address")];
                    case 5:
                        resolvedSubplebbitAddress = _a.sent();
                        this.updateChainProviderState("stopped", "eth");
                        return [2 /*return*/, resolvedSubplebbitAddress];
                    case 6:
                        e_3 = _a.sent();
                        this.updateChainProviderState("stopped", "eth");
                        throw e_3;
                    case 7: return [3 /*break*/, 9];
                    case 8: return [2 /*return*/, resolvedSubplebbitAddress];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype.resolveAuthorAddressIfNeeded = function (authorAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedAuthorAddress, log, txtRecordName, resolveCache, resolvedTimestamp, shouldResolveAgain, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(typeof authorAddress === "string", "subplebbitAddress needs to be a string to be resolved");
                        resolvedAuthorAddress = lodash_1.default.clone(authorAddress);
                        log = (0, plebbit_logger_1.default)("plebbit-js:plebbit:resolver:resolveAuthorAddressIfNeeded");
                        txtRecordName = "plebbit-author-address";
                        if (!authorAddress.endsWith(".eth")) return [3 /*break*/, 8];
                        return [4 /*yield*/, this._plebbit._cache.getItem("".concat(authorAddress, "_").concat(txtRecordName))];
                    case 1:
                        resolveCache = _a.sent();
                        if (!(typeof resolveCache === "string")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._plebbit._cache.getItem("".concat(authorAddress, "_").concat(txtRecordName, "_timestamp"))];
                    case 2:
                        resolvedTimestamp = _a.sent();
                        (0, assert_1.default)(typeof resolvedTimestamp === "number");
                        shouldResolveAgain = (0, util_1.timestamp)() - resolvedTimestamp > 86400;
                        if (!shouldResolveAgain)
                            return [2 /*return*/, resolveCache];
                        log("Cache of ENS (".concat(authorAddress, ") txt record name (").concat(txtRecordName, ") is stale. Invalidating the cache..."));
                        _a.label = 3;
                    case 3:
                        this.updateChainProviderState("resolving-author-address", "eth");
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this._plebbit.resolver._resolveEnsTxtRecord(authorAddress, txtRecordName)];
                    case 5:
                        resolvedAuthorAddress = _a.sent();
                        this.updateChainProviderState("stopped", "eth");
                        return [2 /*return*/, resolvedAuthorAddress];
                    case 6:
                        e_4 = _a.sent();
                        this.updateChainProviderState("stopped", "eth");
                        throw e_4;
                    case 7: return [3 /*break*/, 9];
                    case 8: return [2 /*return*/, resolvedAuthorAddress];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // Convience methods for plebbit here
    // No need to update states
    ClientsManager.prototype.fetchIpns = function (ipns) {
        return __awaiter(this, void 0, void 0, function () {
            var subCid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.curIpfsNodeUrl) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.resolveIpnsToCidP2P(ipns)];
                    case 1:
                        subCid = _a.sent();
                        return [2 /*return*/, this.fetchCidP2P(subCid)];
                    case 2: return [2 /*return*/, this.fetchFromMultipleGateways({ ipns: ipns })];
                }
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
                    return [2 /*return*/, this.fetchCidP2P(cid)];
                else
                    return [2 /*return*/, this.fetchFromMultipleGateways({ cid: cid })];
                return [2 /*return*/];
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
    PublicationClientsManager.prototype.publishChallengeRequest = function (pubsubTopic, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pubsubPublish(pubsubTopic, data)];
                    case 1:
                        _a.sent();
                        this.updatePubsubState("waiting-challenge");
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
    // State methods here
    PublicationClientsManager.prototype.updatePubsubState = function (newState) {
        _super.prototype.updatePubsubState.call(this, newState);
        this._publication.clients.pubsubClients[this.curPubsubNodeUrl].state = newState;
        this._publication.emit("clientschange");
    };
    PublicationClientsManager.prototype.updateIpfsState = function (newState) {
        _super.prototype.updateIpfsState.call(this, newState);
        this._publication.clients.ipfsClients[this.curIpfsNodeUrl].state = newState;
        this._publication.emit("clientschange");
    };
    PublicationClientsManager.prototype.updateGatewayState = function (newState, gateway) {
        _super.prototype.updateGatewayState.call(this, newState, gateway);
        this._publication.clients.ipfsGateways[gateway].state = newState;
        this._publication.emit("clientschange");
    };
    PublicationClientsManager.prototype.updateChainProviderState = function (newState, chainTicker) {
        _super.prototype.updateChainProviderState.call(this, newState, chainTicker);
        this._publication.clients.chainProviders[chainTicker].state = newState;
        this._publication.emit("clientschange");
    };
    PublicationClientsManager.prototype.handleError = function (e) {
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
                        return [4 /*yield*/, this.fetchCidP2P(subCid)];
                    case 3:
                        subJson = _b.apply(_a, [_e.sent()]);
                        this.updateIpfsState("stopped");
                        return [3 /*break*/, 6];
                    case 4:
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, this.fetchFromMultipleGateways({ ipns: subIpns })];
                    case 5:
                        subJson = _d.apply(_c, [_e.sent()]);
                        _e.label = 6;
                    case 6: return [4 /*yield*/, (0, signer_1.verifySubplebbit)(subJson, this._publication._plebbit.resolveAuthorAddresses, this)];
                    case 7:
                        signatureValidity = _e.sent();
                        if (!signatureValidity.valid)
                            (0, util_1.throwWithErrorCode)("ERR_SIGNATURE_IS_INVALID", { signatureValidity: signatureValidity, subplebbitAddress: subplebbitAddress, subJson: subJson });
                        return [2 /*return*/, subJson];
                }
            });
        });
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
                        return [4 /*yield*/, this.fetchCidP2P(updateCid)];
                    case 2:
                        commentUpdate = _b.apply(_a, [_e.sent()]);
                        this.updateIpfsState("stopped");
                        return [2 /*return*/, commentUpdate];
                    case 3:
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, this.fetchFromMultipleGateways({ ipns: ipnsName })];
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
                        return [4 /*yield*/, this.fetchCidP2P(cid)];
                    case 1:
                        commentContent = _b.apply(_a, [_e.sent()]);
                        this.updateIpfsState("stopped");
                        return [2 /*return*/, commentContent];
                    case 2:
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, this.fetchFromMultipleGateways({ cid: cid })];
                    case 3:
                        commentContent = _d.apply(_c, [_e.sent()]);
                        return [2 /*return*/, commentContent];
                }
            });
        });
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
    SubplebbitClientsManager.prototype.fetchSubplebbit = function (ipnsName) {
        return __awaiter(this, void 0, void 0, function () {
            var subplebbitCid, subplebbit, _a, _b, update, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        //@ts-expect-error
                        this._subplebbit._setUpdatingState("fetching-ipns");
                        if (!this.curIpfsNodeUrl) return [3 /*break*/, 3];
                        this.updateIpfsState("fetching-ipns");
                        return [4 /*yield*/, this.resolveIpnsToCidP2P(ipnsName)];
                    case 1:
                        subplebbitCid = _e.sent();
                        //@ts-expect-error
                        this._subplebbit._setUpdatingState("fetching-ipfs");
                        this.updateIpfsState("fetching-ipfs");
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this.fetchCidP2P(subplebbitCid)];
                    case 2:
                        subplebbit = _b.apply(_a, [_e.sent()]);
                        this.updateIpfsState("stopped");
                        return [2 /*return*/, subplebbit];
                    case 3:
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, this.fetchFromMultipleGateways({ ipns: ipnsName })];
                    case 4:
                        update = _d.apply(_c, [_e.sent()]);
                        return [2 /*return*/, update];
                }
            });
        });
    };
    SubplebbitClientsManager.prototype.updatePubsubState = function (newState) {
        _super.prototype.updatePubsubState.call(this, newState);
        this._subplebbit.clients.pubsubClients[this.curPubsubNodeUrl].state = newState;
        this._subplebbit.emit("clientschange");
    };
    SubplebbitClientsManager.prototype.updateIpfsState = function (newState) {
        _super.prototype.updateIpfsState.call(this, newState);
        this._subplebbit.clients.ipfsClients[this.curIpfsNodeUrl].state = newState;
        this._subplebbit.emit("clientschange");
    };
    SubplebbitClientsManager.prototype.updateGatewayState = function (newState, gateway) {
        _super.prototype.updateGatewayState.call(this, newState, gateway);
        this._subplebbit.clients.ipfsGateways[gateway].state = newState;
        this._subplebbit.emit("clientschange");
    };
    SubplebbitClientsManager.prototype.updateChainProviderState = function (newState, chainTicker) {
        _super.prototype.updateChainProviderState.call(this, newState, chainTicker);
        this._subplebbit.clients.chainProviders[chainTicker].state = newState;
        this._subplebbit.emit("clientschange");
    };
    SubplebbitClientsManager.prototype.handleError = function (e) {
        this._subplebbit.emit("error", e);
    };
    return SubplebbitClientsManager;
}(ClientsManager));
exports.SubplebbitClientsManager = SubplebbitClientsManager;
//# sourceMappingURL=client.js.map