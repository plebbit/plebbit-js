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
exports.SubplebbitClientsManager = exports.CommentClientsManager = exports.PublicationClientsManager = exports.ClientsManager = void 0;
var util_1 = require("../util");
var assert_1 = __importDefault(require("assert"));
var signer_1 = require("../signer");
var lodash_1 = __importDefault(require("lodash"));
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var plebbit_error_1 = require("../plebbit-error");
var ipfs_client_1 = require("./ipfs-client");
var pubsub_client_1 = require("./pubsub-client");
var chain_provider_client_1 = require("./chain-provider-client");
var ipfs_gateway_client_1 = require("./ipfs-gateway-client");
var base_client_manager_1 = require("./base-client-manager");
var constants_1 = require("../constants");
var plebbit_rpc_state_client_1 = require("./plebbit-rpc-state-client");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var p_limit_1 = __importDefault(require("p-limit"));
var ClientsManager = /** @class */ (function (_super) {
    __extends(ClientsManager, _super);
    function ClientsManager(plebbit) {
        var _this = _super.call(this, plebbit) || this;
        //@ts-expect-error
        _this.clients = {};
        _this._initIpfsGateways();
        _this._initIpfsClients();
        _this._initPubsubClients();
        _this._initChainProviders();
        _this._initPlebbitRpcClients();
        return _this;
    }
    ClientsManager.prototype._initIpfsGateways = function () {
        var _a;
        for (var _i = 0, _b = Object.keys(this._plebbit.clients.ipfsGateways); _i < _b.length; _i++) {
            var gatewayUrl = _b[_i];
            this.clients.ipfsGateways = __assign(__assign({}, this.clients.ipfsGateways), (_a = {}, _a[gatewayUrl] = new ipfs_gateway_client_1.GenericIpfsGatewayClient("stopped"), _a));
        }
    };
    ClientsManager.prototype._initIpfsClients = function () {
        var _a;
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
        //@ts-expect-error
        this.clients.chainProviders = {};
        for (var _i = 0, _a = Object.keys(this._plebbit.chainProviders); _i < _a.length; _i++) {
            var chain = _a[_i];
            this.clients.chainProviders[chain] = {};
            var chainProvider = this._plebbit.chainProviders[chain];
            for (var _b = 0, _c = chainProvider.urls; _b < _c.length; _b++) {
                var chainProviderUrl = _c[_b];
                this.clients.chainProviders[chain][chainProviderUrl] = new chain_provider_client_1.GenericChainProviderClient("stopped");
            }
        }
    };
    ClientsManager.prototype._initPlebbitRpcClients = function () {
        var _a;
        for (var _i = 0, _b = Object.keys(this._plebbit.clients.plebbitRpcClients); _i < _b.length; _i++) {
            var rpcUrl = _b[_i];
            this.clients.plebbitRpcClients = __assign(__assign({}, this.clients.plebbitRpcClients), (_a = {}, _a[rpcUrl] = new plebbit_rpc_state_client_1.GenericPlebbitRpcStateClient("stopped"), _a));
        }
    };
    // Overriding functions from base client manager here
    ClientsManager.prototype.preFetchGateway = function (gatewayUrl, path, loadType) {
        var gatewayState = loadType === "subplebbit"
            ? this._getStatePriorToResolvingSubplebbitIpns()
            : loadType === "comment-update"
                ? "fetching-update-ipfs"
                : loadType === "comment" || loadType === "generic-ipfs"
                    ? "fetching-ipfs"
                    : undefined;
        (0, assert_1.default)(gatewayState);
        this.updateGatewayState(gatewayState, gatewayUrl);
    };
    ClientsManager.prototype.postFetchGatewayFailure = function (gatewayUrl, path, loadType) {
        this.updateGatewayState("stopped", gatewayUrl);
    };
    ClientsManager.prototype.postFetchGatewaySuccess = function (gatewayUrl, path, loadType) {
        this.updateGatewayState("stopped", gatewayUrl);
    };
    ClientsManager.prototype.postFetchGatewayAborted = function (gatewayUrl, path, loadType) {
        this.postFetchGatewaySuccess(gatewayUrl, path, loadType);
    };
    ClientsManager.prototype.preResolveTextRecord = function (address, txtRecordName, chain, chainProviderUrl) {
        var newState = txtRecordName === "subplebbit-address" ? "resolving-subplebbit-address" : "resolving-author-address";
        this.updateChainProviderState(newState, chain, chainProviderUrl);
    };
    ClientsManager.prototype.postResolveTextRecordSuccess = function (address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl) {
        this.updateChainProviderState("stopped", chain, chainProviderUrl);
    };
    ClientsManager.prototype.postResolveTextRecordFailure = function (address, txtRecordName, chain, chainProviderUrl) {
        this.updateChainProviderState("stopped", chain, chainProviderUrl);
    };
    // State methods here
    ClientsManager.prototype.updatePubsubState = function (newState, pubsubProvider) {
        pubsubProvider = pubsubProvider || this._defaultPubsubProviderUrl;
        (0, assert_1.default)(typeof pubsubProvider === "string");
        (0, assert_1.default)(typeof newState === "string", "Can't update pubsub state to undefined");
        if (this.clients.pubsubClients[pubsubProvider].state === newState)
            return;
        this.clients.pubsubClients[pubsubProvider].state = newState;
        this.clients.pubsubClients[pubsubProvider].emit("statechange", newState);
    };
    ClientsManager.prototype.updateIpfsState = function (newState) {
        (0, assert_1.default)(this._defaultIpfsProviderUrl);
        (0, assert_1.default)(typeof newState === "string", "Can't update ipfs state to undefined");
        if (this.clients.ipfsClients[this._defaultIpfsProviderUrl].state === newState)
            return;
        this.clients.ipfsClients[this._defaultIpfsProviderUrl].state = newState;
        this.clients.ipfsClients[this._defaultIpfsProviderUrl].emit("statechange", newState);
    };
    ClientsManager.prototype.updateGatewayState = function (newState, gateway) {
        (0, assert_1.default)(typeof newState === "string", "Can't update gateway state to undefined");
        if (this.clients.ipfsGateways[gateway].state === newState)
            return;
        this.clients.ipfsGateways[gateway].state = newState;
        this.clients.ipfsGateways[gateway].emit("statechange", newState);
    };
    ClientsManager.prototype.updateChainProviderState = function (newState, chainTicker, chainProviderUrl) {
        (0, assert_1.default)(typeof newState === "string", "Can't update chain provider state to undefined");
        if (this.clients.chainProviders[chainTicker][chainProviderUrl].state === newState)
            return;
        this.clients.chainProviders[chainTicker][chainProviderUrl].state = newState;
        this.clients.chainProviders[chainTicker][chainProviderUrl].emit("statechange", newState);
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
                if (this._defaultIpfsProviderUrl)
                    return [2 /*return*/, this._fetchCidP2P(cid)];
                else
                    return [2 /*return*/, this.fetchFromMultipleGateways({ cid: cid }, "generic-ipfs")];
                return [2 /*return*/];
            });
        });
    };
    // fetchSubplebbit should be here
    ClientsManager.prototype._findErrorInSubplebbitRecord = function (subJson, ipnsNameOfSub) {
        return __awaiter(this, void 0, void 0, function () {
            var subInstanceAddress, error, updateValidity, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        subInstanceAddress = this._getSubplebbitAddressFromInstance();
                        if (subJson.address !== subInstanceAddress) {
                            error = new plebbit_error_1.PlebbitError("ERR_GATEWAY_RESPONDED_WITH_DIFFERENT_SUBPLEBBIT", {
                                addressFromSubplebbitInstance: subInstanceAddress,
                                ipnsName: ipnsNameOfSub,
                                addressFromGateway: subJson.address,
                                subplebbitIpnsFromGateway: subJson
                            });
                            return [2 /*return*/, error];
                        }
                        return [4 /*yield*/, (0, signer_1.verifySubplebbit)(subJson, this._plebbit.resolveAuthorAddresses, this, true)];
                    case 1:
                        updateValidity = _a.sent();
                        if (!updateValidity.valid) {
                            error = new plebbit_error_1.PlebbitError("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID", {
                                signatureValidity: updateValidity,
                                actualIpnsName: ipnsNameOfSub,
                                subplebbitIpns: subJson
                            });
                            return [2 /*return*/, error];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ClientsManager.prototype.fetchSubplebbit = function (subAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var ipnsName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.resolveSubplebbitAddressIfNeeded(subAddress)];
                    case 1:
                        ipnsName = _a.sent();
                        // if ipnsAddress is undefined then it will be handled in postResolveTextRecordSuccess
                        return [2 /*return*/, this._fetchSubplebbitIpns(ipnsName)];
                }
            });
        });
    };
    ClientsManager.prototype._fetchSubplebbitIpns = function (ipnsName) {
        return __awaiter(this, void 0, void 0, function () {
            var subJson, subplebbitCid, _a, _b, subError;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // This function should fetch SubplebbitIpfs, parse it and verify its signature
                        // Then return SubplebbitIpfs
                        this.preResolveSubplebbitIpns(ipnsName);
                        if (!this._defaultIpfsProviderUrl) return [3 /*break*/, 3];
                        this.preResolveSubplebbitIpnsP2P(ipnsName);
                        return [4 /*yield*/, this.resolveIpnsToCidP2P(ipnsName)];
                    case 1:
                        subplebbitCid = _c.sent();
                        this.postResolveSubplebbitIpnsP2P(ipnsName, subplebbitCid);
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this._fetchCidP2P(subplebbitCid)];
                    case 2:
                        subJson = _b.apply(_a, [_c.sent()]);
                        this.postFetchSubplebbitJsonP2P(subJson); // have not been verified yet
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this._fetchSubplebbitFromGateways(ipnsName)];
                    case 4:
                        subJson = _c.sent();
                        _c.label = 5;
                    case 5: return [4 /*yield*/, this._findErrorInSubplebbitRecord(subJson, ipnsName)];
                    case 6:
                        subError = _c.sent();
                        if (subError) {
                            this.postFetchSubplebbitInvalidRecord(subJson, subError); // should throw here
                            throw subError; // in case we forgot to throw at postFetchSubplebbitInvalidRecord
                        }
                        this.postFetchSubplebbitJsonSuccess(subJson); // We successfully fetched the json
                        constants_1.subplebbitForPublishingCache.set(subJson.address, lodash_1.default.pick(subJson, ["encryption", "pubsubTopic", "address"]));
                        return [2 /*return*/, subJson];
                }
            });
        });
    };
    ClientsManager.prototype._fetchSubplebbitFromGateways = function (ipnsName) {
        return __awaiter(this, void 0, void 0, function () {
            var log, concurrencyLimit, timeoutMs, path, queueLimit, gatewaysSorted, _a, gatewayFetches, _loop_1, _i, gatewaysSorted_1, gateway, cleanUp, _findRecentSubplebbit, promisesToIterate, suitableSubplebbit, _b, gatewayToError, _c, _d, gatewayUrl, combinedError;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:fetchSubplebbitFromGateways");
                        concurrencyLimit = 3;
                        timeoutMs = this._plebbit._clientsManager.getGatewayTimeoutMs("subplebbit");
                        path = "/ipns/".concat(ipnsName);
                        queueLimit = (0, p_limit_1.default)(concurrencyLimit);
                        if (!(Object.keys(this._plebbit.clients.ipfsGateways).length <= concurrencyLimit)) return [3 /*break*/, 1];
                        _a = Object.keys(this._plebbit.clients.ipfsGateways);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this._plebbit.stats.sortGatewaysAccordingToScore("ipns")];
                    case 2:
                        _a = _e.sent();
                        _e.label = 3;
                    case 3:
                        gatewaysSorted = _a;
                        gatewayFetches = {};
                        _loop_1 = function (gateway) {
                            var abortController = new AbortController();
                            gatewayFetches[gateway] = {
                                abortController: abortController,
                                promise: queueLimit(function () { return _this._fetchWithGateway(gateway, path, "subplebbit", abortController); }),
                                timeoutId: setTimeout(function () { return abortController.abort(); }, timeoutMs)
                            };
                        };
                        for (_i = 0, gatewaysSorted_1 = gatewaysSorted; _i < gatewaysSorted_1.length; _i++) {
                            gateway = gatewaysSorted_1[_i];
                            _loop_1(gateway);
                        }
                        cleanUp = function () {
                            queueLimit.clearQueue();
                            Object.values(gatewayFetches).map(function (gateway) {
                                if (!gateway.subplebbitRecord && !gateway.error)
                                    gateway.abortController.abort();
                                clearTimeout(gateway.timeoutId);
                            });
                        };
                        _findRecentSubplebbit = function () {
                            // Try to find a very recent subplebbit
                            // If not then go with the most recent subplebbit record after fetching from 3 gateways
                            var gatewaysWithSub = Object.keys(gatewayFetches).filter(function (gatewayUrl) { return gatewayFetches[gatewayUrl].subplebbitRecord; });
                            if (gatewaysWithSub.length === 0)
                                return undefined;
                            var totalGateways = gatewaysSorted.length;
                            var quorm = totalGateways <= 3 ? totalGateways : 3;
                            var gatewaysWithError = Object.keys(gatewayFetches).filter(function (gatewayUrl) { return gatewayFetches[gatewayUrl].error; });
                            for (var _i = 0, gatewaysWithSub_1 = gatewaysWithSub; _i < gatewaysWithSub_1.length; _i++) {
                                var gatewayUrl = gatewaysWithSub_1[_i];
                                if ((0, util_1.timestamp)() - gatewayFetches[gatewayUrl].subplebbitRecord.updatedAt <= 120) {
                                    // A very recent subplebbit, a good thing
                                    // TODO reward this gateway
                                    log("Gateway (".concat(gatewayUrl, ") was able to find a very recent subplebbit (").concat(ipnsName, ") record "));
                                    return gatewayFetches[gatewayUrl].subplebbitRecord;
                                }
                            }
                            // We weren't able to find a very recent subplebbit record
                            if (gatewaysWithSub.length >= quorm || gatewaysWithError.length + gatewaysWithSub.length === totalGateways) {
                                // we find the gateway with the max updatedAt
                                var bestGatewayUrl = lodash_1.default.maxBy(gatewaysWithSub, function (gatewayUrl) { return gatewayFetches[gatewayUrl].subplebbitRecord.updatedAt; });
                                return gatewayFetches[bestGatewayUrl].subplebbitRecord;
                            }
                            else
                                return undefined;
                        };
                        promisesToIterate = (Object.values(gatewayFetches).map(function (gatewayFetch) { return gatewayFetch.promise; }));
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                return promisesToIterate.map(function (gatewayPromise, i) {
                                    return gatewayPromise.then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                        var gatewaysWithError, recentSubplebbit;
                                        return __generator(this, function (_a) {
                                            if (typeof res === "string")
                                                Object.values(gatewayFetches)[i].subplebbitRecord = JSON.parse(res); // did not throw or abort
                                            else {
                                                // The fetching failed, if res === undefined then it's because it was aborted
                                                // else then there's plebbitError
                                                Object.values(gatewayFetches)[i].error = res
                                                    ? res.error
                                                    : new Error("Fetching from gateway has been aborted/timed out");
                                                gatewaysWithError = Object.keys(gatewayFetches).filter(function (gatewayUrl) { return gatewayFetches[gatewayUrl].error; });
                                                if (gatewaysWithError.length === gatewaysSorted.length)
                                                    // All gateways failed
                                                    reject("All gateways failed to fetch subplebbit record " + ipnsName);
                                            }
                                            recentSubplebbit = _findRecentSubplebbit();
                                            if (recentSubplebbit) {
                                                cleanUp();
                                                resolve(recentSubplebbit);
                                            }
                                            return [2 /*return*/];
                                        });
                                    }); });
                                });
                            })];
                    case 5:
                        suitableSubplebbit = _e.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _b = _e.sent();
                        cleanUp();
                        gatewayToError = {};
                        for (_c = 0, _d = Object.keys(gatewayFetches); _c < _d.length; _c++) {
                            gatewayUrl = _d[_c];
                            if (gatewayFetches[gatewayUrl].error)
                                gatewayToError[gatewayUrl] = gatewayFetches[gatewayUrl].error;
                        }
                        combinedError = new plebbit_error_1.PlebbitError("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS", { ipnsName: ipnsName, gatewayToError: gatewayToError });
                        throw combinedError;
                    case 7: 
                    // TODO add punishment for gateway that returns old ipns record
                    // TODO add punishment for gateway that returns invalid subplebbit
                    return [2 /*return*/, suitableSubplebbit];
                }
            });
        });
    };
    ClientsManager.prototype._getStatePriorToResolvingSubplebbitIpns = function () {
        return "fetching-subplebbit-ipns";
    };
    ClientsManager.prototype._getSubplebbitAddressFromInstance = function () {
        throw Error("Should be implemented");
    };
    ClientsManager.prototype.postFetchSubplebbitInvalidRecord = function (subJson, subError) {
        throw Error("Should be implemented");
    };
    ClientsManager.prototype.preResolveSubplebbitIpns = function (subIpnsName) {
        throw Error("Should be implemented");
    };
    ClientsManager.prototype.preResolveSubplebbitIpnsP2P = function (subIpnsName) {
        throw Error("Should be implemented");
    };
    ClientsManager.prototype.postResolveSubplebbitIpnsP2P = function (subIpnsName, subplebbitCid) {
        throw Error("Should be implemented");
    };
    ClientsManager.prototype.postFetchSubplebbitJsonP2P = function (subJson) {
        throw Error("Should be implemented");
    };
    ClientsManager.prototype.postFetchSubplebbitJsonSuccess = function (subJson) {
        throw Error("Should be implemented");
    };
    return ClientsManager;
}(base_client_manager_1.BaseClientsManager));
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
    PublicationClientsManager.prototype._initPlebbitRpcClients = function () {
        var _a;
        for (var _i = 0, _b = Object.keys(this._plebbit.clients.plebbitRpcClients); _i < _b.length; _i++) {
            var rpcUrl = _b[_i];
            this.clients.plebbitRpcClients = __assign(__assign({}, this.clients.plebbitRpcClients), (_a = {}, _a[rpcUrl] = new plebbit_rpc_state_client_1.PublicationPlebbitRpcStateClient("stopped"), _a));
        }
    };
    // Resolver methods here
    PublicationClientsManager.prototype.preResolveTextRecord = function (address, txtRecordName, resolvedTextRecord, chain) {
        _super.prototype.preResolveTextRecord.call(this, address, txtRecordName, resolvedTextRecord, chain);
        var isStartingToPublish = this._publication.publishingState === "stopped" || this._publication.publishingState === "failed";
        if (this._publication.state === "publishing" && txtRecordName === "subplebbit-address" && isStartingToPublish)
            this._publication._updatePublishingState("resolving-subplebbit-address");
    };
    PublicationClientsManager.prototype.postResolveTextRecordSuccess = function (address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl) {
        // TODO should check for regex of ipns eventually
        _super.prototype.postResolveTextRecordSuccess.call(this, address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl);
        if (!resolvedTextRecord) {
            this._publication._updatePublishingState("failed");
            var error = new plebbit_error_1.PlebbitError("ERR_ENS_TXT_RECORD_NOT_FOUND", {
                subplebbitAddress: address,
                textRecord: txtRecordName
            });
            this._publication.emit("error", error);
            throw error;
        }
    };
    PublicationClientsManager.prototype.emitError = function (e) {
        this._publication.emit("error", e);
    };
    PublicationClientsManager.prototype.updateIpfsState = function (newState) {
        _super.prototype.updateIpfsState.call(this, newState);
    };
    PublicationClientsManager.prototype.updatePubsubState = function (newState, pubsubProvider) {
        _super.prototype.updatePubsubState.call(this, newState, pubsubProvider);
    };
    PublicationClientsManager.prototype.updateGatewayState = function (newState, gateway) {
        _super.prototype.updateGatewayState.call(this, newState, gateway);
    };
    PublicationClientsManager.prototype._getSubplebbitAddressFromInstance = function () {
        return this._publication.subplebbitAddress;
    };
    PublicationClientsManager.prototype.postFetchSubplebbitInvalidRecord = function (subJson, subError) {
        this._publication._updatePublishingState("failed");
        this._publication.emit("error", subError);
        throw subError;
    };
    PublicationClientsManager.prototype.preResolveSubplebbitIpns = function (subIpnsName) {
        this._publication._updatePublishingState("fetching-subplebbit-ipns");
    };
    PublicationClientsManager.prototype.preResolveSubplebbitIpnsP2P = function (subIpnsName) {
        this.updateIpfsState("fetching-subplebbit-ipns");
    };
    PublicationClientsManager.prototype.postResolveSubplebbitIpnsP2P = function (subIpnsName, subplebbitCid) {
        this.updateIpfsState("fetching-subplebbit-ipfs");
        this._publication._updatePublishingState("fetching-subplebbit-ipfs");
    };
    PublicationClientsManager.prototype.postFetchSubplebbitJsonP2P = function (subJson) {
        this.updateIpfsState("stopped");
    };
    PublicationClientsManager.prototype.postFetchSubplebbitJsonSuccess = function (subJson) { };
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
    CommentClientsManager.prototype._initPlebbitRpcClients = function () {
        var _a;
        for (var _i = 0, _b = Object.keys(this._plebbit.clients.plebbitRpcClients); _i < _b.length; _i++) {
            var rpcUrl = _b[_i];
            this.clients.plebbitRpcClients = __assign(__assign({}, this.clients.plebbitRpcClients), (_a = {}, _a[rpcUrl] = new plebbit_rpc_state_client_1.CommentPlebbitRpcStateClient("stopped"), _a));
        }
    };
    // Resolver methods here
    CommentClientsManager.prototype.preResolveTextRecord = function (address, txtRecordName, resolvedTextRecord, chain) {
        _super.prototype.preResolveTextRecord.call(this, address, txtRecordName, resolvedTextRecord, chain);
        if (this._comment.state === "updating") {
            if (txtRecordName === "subplebbit-address")
                this._comment._setUpdatingState("resolving-subplebbit-address"); // Resolving for Subplebbit
            else if (txtRecordName === "plebbit-author-address")
                this._comment._setUpdatingState("resolving-author-address"); // Resolving for CommentIpfs
        }
    };
    CommentClientsManager.prototype._findCommentInSubplebbitPosts = function (subIpns, cid) {
        var _a, _b;
        if (!((_b = (_a = subIpns.posts) === null || _a === void 0 ? void 0 : _a.pages) === null || _b === void 0 ? void 0 : _b.hot))
            return undefined;
        var findInCommentAndChildren = function (comment) {
            var _a, _b;
            if (comment.comment.cid === cid)
                return comment.comment;
            if (!((_b = (_a = comment.update.replies) === null || _a === void 0 ? void 0 : _a.pages) === null || _b === void 0 ? void 0 : _b.topAll))
                return undefined;
            for (var _i = 0, _c = comment.update.replies.pages.topAll.comments; _i < _c.length; _i++) {
                var childComment = _c[_i];
                var commentInChild = findInCommentAndChildren(childComment);
                if (commentInChild)
                    return commentInChild;
            }
            return undefined;
        };
        for (var _i = 0, _c = subIpns.posts.pages.hot.comments; _i < _c.length; _i++) {
            var post = _c[_i];
            var commentInChild = findInCommentAndChildren(post);
            if (commentInChild)
                return commentInChild;
        }
        return undefined;
    };
    CommentClientsManager.prototype._fetchParentCommentForCommentUpdate = function (parentCid) {
        return __awaiter(this, void 0, void 0, function () {
            var commentContent, _a, _b, _c, commentContent, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!this._defaultIpfsProviderUrl) return [3 /*break*/, 2];
                        this.updateIpfsState("fetching-update-ipfs");
                        this._comment._setUpdatingState("fetching-update-ipfs");
                        _a = [{ cid: parentCid }];
                        _c = (_b = JSON).parse;
                        return [4 /*yield*/, this._fetchCidP2P(parentCid)];
                    case 1:
                        commentContent = __assign.apply(void 0, _a.concat([_c.apply(_b, [_g.sent()])]));
                        this.updateIpfsState("stopped");
                        return [2 /*return*/, commentContent];
                    case 2:
                        _d = [{ cid: parentCid }];
                        _f = (_e = JSON).parse;
                        return [4 /*yield*/, this.fetchFromMultipleGateways({ cid: parentCid }, "comment")];
                    case 3:
                        commentContent = __assign.apply(void 0, _d.concat([_f.apply(_e, [_g.sent()])]));
                        return [2 /*return*/, commentContent];
                }
            });
        });
    };
    CommentClientsManager.prototype._getParentsPath = function (subIpns) {
        return __awaiter(this, void 0, void 0, function () {
            var parentsPathCache, pathCache, postTimestampCache, parentCid, reversedPath, parentPathCache, parent_1, _a, finalParentsPath;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._plebbit.createStorageLRU(constants_1.commentPostUpdatesParentsPathConfig)];
                    case 1:
                        parentsPathCache = _b.sent();
                        return [4 /*yield*/, parentsPathCache.getItem(this._comment.cid)];
                    case 2:
                        pathCache = _b.sent();
                        if (pathCache)
                            return [2 /*return*/, pathCache.split("/").reverse().join("/")];
                        return [4 /*yield*/, this._plebbit.createStorageLRU(constants_1.postTimestampConfig)];
                    case 3:
                        postTimestampCache = _b.sent();
                        if (!(this._comment.depth === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, postTimestampCache.setItem(this._comment.cid, this._comment.timestamp)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        parentCid = this._comment.parentCid;
                        reversedPath = "".concat(this._comment.cid);
                        _b.label = 6;
                    case 6:
                        if (!parentCid) return [3 /*break*/, 14];
                        return [4 /*yield*/, parentsPathCache.getItem(parentCid)];
                    case 7:
                        parentPathCache = _b.sent();
                        if (!parentPathCache) return [3 /*break*/, 8];
                        reversedPath += "/" + parentPathCache;
                        return [3 /*break*/, 14];
                    case 8:
                        _a = this._findCommentInSubplebbitPosts(subIpns, parentCid);
                        if (_a) return [3 /*break*/, 10];
                        return [4 /*yield*/, this._fetchParentCommentForCommentUpdate(parentCid)];
                    case 9:
                        _a = (_b.sent());
                        _b.label = 10;
                    case 10:
                        parent_1 = _a;
                        if (!(parent_1.depth === 0)) return [3 /*break*/, 12];
                        return [4 /*yield*/, postTimestampCache.setItem(parent_1.cid, parent_1.timestamp)];
                    case 11:
                        _b.sent();
                        _b.label = 12;
                    case 12:
                        reversedPath += "/".concat(parentCid);
                        parentCid = parent_1.parentCid;
                        _b.label = 13;
                    case 13: return [3 /*break*/, 6];
                    case 14: return [4 /*yield*/, parentsPathCache.setItem(this._comment.cid, reversedPath)];
                    case 15:
                        _b.sent();
                        finalParentsPath = reversedPath.split("/").reverse().join("/");
                        return [2 /*return*/, finalParentsPath];
                }
            });
        });
    };
    CommentClientsManager.prototype.fetchCommentUpdate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, subIpns, parentsPostUpdatePath, postTimestamp, timestampRanges, _i, timestampRanges_1, timestampRange, folderCid, path, commentUpdate, _a, _b, e_1, update, _c, _d, e_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:comment:update");
                        return [4 /*yield*/, this.fetchSubplebbit(this._comment.subplebbitAddress)];
                    case 1:
                        subIpns = _e.sent();
                        return [4 /*yield*/, this._getParentsPath(subIpns)];
                    case 2:
                        parentsPostUpdatePath = _e.sent();
                        return [4 /*yield*/, this._plebbit.createStorageLRU(constants_1.postTimestampConfig)];
                    case 3: return [4 /*yield*/, (_e.sent()).getItem(this._comment.postCid)];
                    case 4:
                        postTimestamp = _e.sent();
                        if (typeof postTimestamp !== "number")
                            throw Error("Failed to fetch post timestamp");
                        timestampRanges = (0, util_1.getPostUpdateTimestampRange)(subIpns.postUpdates, postTimestamp);
                        if (timestampRanges.length === 0)
                            throw Error("Post has no timestamp range bucket");
                        _i = 0, timestampRanges_1 = timestampRanges;
                        _e.label = 5;
                    case 5:
                        if (!(_i < timestampRanges_1.length)) return [3 /*break*/, 14];
                        timestampRange = timestampRanges_1[_i];
                        folderCid = subIpns.postUpdates[timestampRange];
                        path = "".concat(folderCid, "/") + parentsPostUpdatePath + "/update";
                        this._comment._setUpdatingState("fetching-update-ipfs");
                        if (!this._defaultIpfsProviderUrl) return [3 /*break*/, 10];
                        this.updateIpfsState("fetching-update-ipfs");
                        _e.label = 6;
                    case 6:
                        _e.trys.push([6, 8, , 9]);
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this._fetchCidP2P(path)];
                    case 7:
                        commentUpdate = _b.apply(_a, [_e.sent()]);
                        this.updateIpfsState("stopped");
                        return [2 /*return*/, commentUpdate];
                    case 8:
                        e_1 = _e.sent();
                        // if does not exist, try the next timestamp range
                        log.error(e_1, "Failed to fetch CommentUpdate from path (".concat(path, "). Trying the next timestamp range"));
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 13];
                    case 10:
                        _e.trys.push([10, 12, , 13]);
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, this.fetchFromMultipleGateways({ cid: path }, "comment-update")];
                    case 11:
                        update = _d.apply(_c, [_e.sent()]);
                        return [2 /*return*/, update];
                    case 12:
                        e_2 = _e.sent();
                        // if does not exist, try the next timestamp range
                        log.error(e_2, "Failed to fetch CommentUpdate from path (".concat(path, "). Trying the next timestamp range"));
                        return [3 /*break*/, 13];
                    case 13:
                        _i++;
                        return [3 /*break*/, 5];
                    case 14: throw Error("CommentUpdate of comment (".concat(this._comment.cid, ") does not exist on all timestamp ranges: ").concat(timestampRanges));
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
                        if (!this._defaultIpfsProviderUrl) return [3 /*break*/, 2];
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
    CommentClientsManager.prototype._isPublishing = function () {
        return this._comment.state === "publishing";
    };
    CommentClientsManager.prototype.postFetchSubplebbitInvalidRecord = function (subJson, subError) {
        // are we updating or publishing?
        if (this._isPublishing()) {
            // we're publishing
            this._comment._updatePublishingState("failed");
        }
        else {
            // we're updating
            this._comment._setUpdatingState("failed");
        }
        this._comment.emit("error", subError);
        throw subError;
    };
    CommentClientsManager.prototype.postResolveTextRecordSuccess = function (address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl) {
        _super.prototype.postResolveTextRecordSuccess.call(this, address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl);
        // TODO should check for regex of ipns eventually
        if (!resolvedTextRecord) {
            // need to check if publishing or updating
            if (this._isPublishing()) {
                this._comment._updatePublishingState("failed");
            }
            else
                this._comment._setUpdatingState("failed");
            var error = new plebbit_error_1.PlebbitError("ERR_ENS_TXT_RECORD_NOT_FOUND", {
                subplebbitAddress: address,
                textRecord: txtRecordName
            });
            this._comment.emit("error", error);
            throw error;
        }
    };
    CommentClientsManager.prototype.preResolveSubplebbitIpns = function (subIpnsName) {
        if (this._isPublishing())
            this._comment._updatePublishingState("fetching-subplebbit-ipns");
        else
            this._comment._setUpdatingState("fetching-subplebbit-ipns");
    };
    CommentClientsManager.prototype.preResolveSubplebbitIpnsP2P = function (subIpnsName) {
        this.updateIpfsState("fetching-subplebbit-ipns");
    };
    CommentClientsManager.prototype.postResolveSubplebbitIpnsP2P = function (subIpnsName, subplebbitCid) {
        this.updateIpfsState("fetching-subplebbit-ipfs");
        if (this._isPublishing())
            this._comment._updatePublishingState("fetching-subplebbit-ipfs");
        else
            this._comment._setUpdatingState("fetching-subplebbit-ipfs");
    };
    CommentClientsManager.prototype.postFetchSubplebbitJsonP2P = function (subJson) {
        if (this._isPublishing())
            this.updateIpfsState("stopped");
    };
    CommentClientsManager.prototype.postFetchSubplebbitJsonSuccess = function (subJson) { };
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
    SubplebbitClientsManager.prototype._initPlebbitRpcClients = function () {
        var _a;
        for (var _i = 0, _b = Object.keys(this._plebbit.clients.plebbitRpcClients); _i < _b.length; _i++) {
            var rpcUrl = _b[_i];
            this.clients.plebbitRpcClients = __assign(__assign({}, this.clients.plebbitRpcClients), (_a = {}, _a[rpcUrl] = new plebbit_rpc_state_client_1.SubplebbitPlebbitRpcStateClient("stopped"), _a));
        }
    };
    SubplebbitClientsManager.prototype.updateIpfsState = function (newState) {
        _super.prototype.updateIpfsState.call(this, newState);
    };
    SubplebbitClientsManager.prototype.updatePubsubState = function (newState, pubsubProvider) {
        _super.prototype.updatePubsubState.call(this, newState, pubsubProvider);
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
    SubplebbitClientsManager.prototype.postFetchSubplebbitInvalidRecord = function (subJson, subError) {
        this._subplebbit._setUpdatingState("failed");
        this._subplebbit.emit("error", subError);
        throw subError;
    };
    SubplebbitClientsManager.prototype.preResolveTextRecord = function (address, txtRecordName, chain, chainProviderUrl) {
        _super.prototype.preResolveTextRecord.call(this, address, txtRecordName, chain, chainProviderUrl);
        if (this._subplebbit.state === "updating" &&
            txtRecordName === "subplebbit-address" &&
            this._subplebbit.updatingState !== "fetching-ipfs" // we don't state to be resolving-address when verifying signature
        )
            this._subplebbit._setUpdatingState("resolving-address");
    };
    SubplebbitClientsManager.prototype.postResolveTextRecordSuccess = function (address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl) {
        _super.prototype.postResolveTextRecordSuccess.call(this, address, txtRecordName, resolvedTextRecord, chain, chainProviderUrl);
        // TODO should check for regex of ipns eventually
        if (!resolvedTextRecord && this._subplebbit.state === "updating") {
            this._subplebbit._setUpdatingState("failed");
            var error = new plebbit_error_1.PlebbitError("ERR_ENS_TXT_RECORD_NOT_FOUND", {
                subplebbitAddress: address,
                textRecord: txtRecordName
            });
            this._subplebbit.emit("error", error);
            throw error;
        }
    };
    SubplebbitClientsManager.prototype._getSubplebbitAddressFromInstance = function () {
        return this._subplebbit.address;
    };
    SubplebbitClientsManager.prototype.preResolveSubplebbitIpns = function (subIpnsName) {
        this._subplebbit._setUpdatingState("fetching-ipns");
    };
    SubplebbitClientsManager.prototype.preResolveSubplebbitIpnsP2P = function (subIpnsName) {
        this.updateIpfsState("fetching-ipns");
    };
    SubplebbitClientsManager.prototype.postResolveSubplebbitIpnsP2P = function (subIpnsName, subplebbitCid) {
        this.updateIpfsState("fetching-ipfs");
        this._subplebbit._setUpdatingState("fetching-ipfs");
    };
    SubplebbitClientsManager.prototype.postFetchSubplebbitJsonP2P = function (subJson) {
        this.updateIpfsState("stopped");
    };
    SubplebbitClientsManager.prototype.postFetchSubplebbitJsonSuccess = function (subJson) {
        this._subplebbit._setUpdatingState("succeeded");
    };
    return SubplebbitClientsManager;
}(ClientsManager));
exports.SubplebbitClientsManager = SubplebbitClientsManager;
//# sourceMappingURL=client-manager.js.map