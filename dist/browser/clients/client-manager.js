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
var util_1 = require("../util");
var assert_1 = __importDefault(require("assert"));
var signer_1 = require("../signer");
var lodash_1 = __importDefault(require("lodash"));
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var ipfs_client_1 = require("./ipfs-client");
var pubsub_client_1 = require("./pubsub-client");
var chain_provider_client_1 = require("./chain-provider-client");
var ipfs_gateway_client_1 = require("./ipfs-gateway-client");
var base_client_manager_1 = require("./base-client-manager");
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
    // Overriding functions from base client manager here
    ClientsManager.prototype.preFetchGateway = function (gatewayUrl, path, loadType) {
        var gatewayState = loadType === "subplebbit"
            ? this._getStatePriorToResolvingSubplebbitIpns()
            : loadType === "comment-update"
                ? "fetching-update-ipns"
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
    ClientsManager.prototype.preResolveTextRecord = function (ens, txtRecordName) {
        var newState = txtRecordName === "subplebbit-address" ? "resolving-subplebbit-address" : "resolving-author-address";
        this.updateChainProviderState(newState, "eth");
    };
    ClientsManager.prototype.postResolveTextRecordSuccess = function (ens, txtRecordName, resolvedTextRecord) {
        this.updateChainProviderState("stopped", "eth");
    };
    ClientsManager.prototype.postResolveTextRecordFailure = function (ens, txtRecordName) {
        this.updateChainProviderState("stopped", "eth");
    };
    // State methods here
    ClientsManager.prototype.updatePubsubState = function (newState, pubsubProvider) {
        pubsubProvider = pubsubProvider || this._defaultPubsubProviderUrl;
        (0, assert_1.default)(typeof pubsubProvider === "string");
        (0, assert_1.default)(typeof newState === "string", "Can't update pubsub state to undefined");
        this.clients.pubsubClients[pubsubProvider].state = newState;
        this.clients.pubsubClients[pubsubProvider].emit("statechange", newState);
    };
    ClientsManager.prototype.updateIpfsState = function (newState) {
        (0, assert_1.default)(this._defaultIpfsProviderUrl);
        (0, assert_1.default)(typeof newState === "string", "Can't update ipfs state to undefined");
        this.clients.ipfsClients[this._defaultIpfsProviderUrl].state = newState;
        this.clients.ipfsClients[this._defaultIpfsProviderUrl].emit("statechange", newState);
    };
    ClientsManager.prototype.updateGatewayState = function (newState, gateway) {
        (0, assert_1.default)(typeof newState === "string", "Can't update gateway state to undefined");
        this.clients.ipfsGateways[gateway].state = newState;
        this.clients.ipfsGateways[gateway].emit("statechange", newState);
    };
    ClientsManager.prototype.updateChainProviderState = function (newState, chainTicker) {
        (0, assert_1.default)(typeof newState === "string", "Can't update chain provider state to undefined");
        this.clients.chainProviders[chainTicker].state = newState;
        this.clients.chainProviders[chainTicker].emit("statechange", newState);
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
                        if (!this._defaultIpfsProviderUrl) return [3 /*break*/, 3];
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
    // Pubsub methods here
    PublicationClientsManager.prototype.prePubsubPublishProvider = function (pubsubTopic, pubsubProvider) {
        var newState = this._publication.publishingState === "publishing-challenge-request"
            ? "publishing-challenge-request"
            : "publishing-challenge-answer";
        this.updatePubsubState(newState, pubsubProvider);
    };
    PublicationClientsManager.prototype.postPubsubPublishProviderSuccess = function (pubsubTopic, pubsubProvider) {
        this.updatePubsubState("stopped", pubsubProvider);
    };
    PublicationClientsManager.prototype.postPubsubPublishProviderFailure = function (pubsubTopic, pubsubProvider) {
        this.postPubsubPublishProviderSuccess(pubsubTopic, pubsubProvider);
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
                        if (!this._defaultIpfsProviderUrl) return [3 /*break*/, 4];
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
    PublicationClientsManager.prototype.updatePubsubState = function (newState, pubsubProvider) {
        _super.prototype.updatePubsubState.call(this, newState, pubsubProvider);
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
                        if (!this._defaultIpfsProviderUrl) return [3 /*break*/, 3];
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
                        if (!this._defaultIpfsProviderUrl) return [3 /*break*/, 3];
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
    SubplebbitClientsManager.prototype._getStatePriorToResolvingSubplebbitIpfs = function () {
        return "fetching-ipfs";
    };
    return SubplebbitClientsManager;
}(ClientsManager));
exports.SubplebbitClientsManager = SubplebbitClientsManager;
//# sourceMappingURL=client-manager.js.map