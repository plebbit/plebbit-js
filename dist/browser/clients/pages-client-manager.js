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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsPagesClientsManager = exports.RepliesPagesClientsManager = exports.BasePagesClientsManager = void 0;
var assert_1 = __importDefault(require("assert"));
var base_client_manager_1 = require("./base-client-manager");
var ipfs_client_1 = require("./ipfs-client");
var ipfs_gateway_client_1 = require("./ipfs-gateway-client");
var sort_handler_1 = require("../sort-handler");
var lodash_1 = __importDefault(require("lodash"));
var constants_1 = require("../constants");
var BasePagesClientsManager = /** @class */ (function (_super) {
    __extends(BasePagesClientsManager, _super);
    function BasePagesClientsManager(pages) {
        var _this = _super.call(this, pages._plebbit) || this;
        //@ts-expect-error
        _this.clients = {};
        _this._initIpfsGateways();
        _this._initIpfsClients();
        if (pages.pageCids)
            _this.updatePageCidsToSortTypes(pages.pageCids);
        return _this;
    }
    BasePagesClientsManager.prototype.getSortTypes = function () {
        throw Error("This method should be overridden");
    };
    // Init functions here
    BasePagesClientsManager.prototype._initIpfsGateways = function () {
        this.clients.ipfsGateways = {};
        for (var _i = 0, _a = this.getSortTypes(); _i < _a.length; _i++) {
            var sortType = _a[_i];
            this.clients.ipfsGateways[sortType] = {};
            for (var _b = 0, _c = Object.keys(this._plebbit.clients.ipfsGateways); _b < _c.length; _b++) {
                var gatewayUrl = _c[_b];
                this.clients.ipfsGateways[sortType][gatewayUrl] = new ipfs_gateway_client_1.PagesIpfsGatewayClient("stopped");
            }
        }
    };
    BasePagesClientsManager.prototype._initIpfsClients = function () {
        if (this._plebbit.clients.ipfsClients) {
            this.clients.ipfsClients = {};
            for (var _i = 0, _a = this.getSortTypes(); _i < _a.length; _i++) {
                var sortType = _a[_i];
                this.clients.ipfsClients[sortType] = {};
                for (var _b = 0, _c = Object.keys(this._plebbit.clients.ipfsClients); _b < _c.length; _b++) {
                    var ipfsUrl = _c[_b];
                    this.clients.ipfsClients[sortType][ipfsUrl] = new ipfs_client_1.PagesIpfsClient("stopped");
                }
            }
        }
    };
    // Override methods from BaseClientsManager here
    BasePagesClientsManager.prototype.preFetchGateway = function (gatewayUrl, path, loadType) {
        var cid = path.split("/")[2];
        var sortTypes = constants_1.pageCidToSortTypesCache.get(cid);
        this.updateGatewayState("fetching-ipfs", gatewayUrl, sortTypes);
    };
    BasePagesClientsManager.prototype.postFetchGatewaySuccess = function (gatewayUrl, path, loadType) {
        var cid = path.split("/")[2];
        var sortTypes = constants_1.pageCidToSortTypesCache.get(cid);
        this.updateGatewayState("stopped", gatewayUrl, sortTypes);
    };
    BasePagesClientsManager.prototype.postFetchGatewayFailure = function (gatewayUrl, path, loadType) {
        this.postFetchGatewaySuccess(gatewayUrl, path, loadType);
    };
    BasePagesClientsManager.prototype._updatePageCidsSortCache = function (pageCid, sortTypes) {
        var curSortTypes = constants_1.pageCidToSortTypesCache.get(pageCid);
        if (!curSortTypes) {
            constants_1.pageCidToSortTypesCache.set(pageCid, sortTypes);
        }
        else {
            var newSortTypes = lodash_1.default.uniq(__spreadArray(__spreadArray([], curSortTypes, true), sortTypes, true));
            constants_1.pageCidToSortTypesCache.set(pageCid, newSortTypes);
        }
    };
    BasePagesClientsManager.prototype.updatePageCidsToSortTypes = function (newPageCids) {
        for (var _i = 0, _a = Object.keys(newPageCids); _i < _a.length; _i++) {
            var sortType = _a[_i];
            var pageCid = newPageCids[sortType];
            this._updatePageCidsSortCache(pageCid, [sortType]);
        }
    };
    BasePagesClientsManager.prototype.updatePageCidsToSortTypesToIncludeSubsequent = function (nextPageCid, previousPageCid) {
        var sortTypes = constants_1.pageCidToSortTypesCache.get(previousPageCid);
        (0, assert_1.default)(Array.isArray(sortTypes));
        this._updatePageCidsSortCache(nextPageCid, sortTypes);
    };
    BasePagesClientsManager.prototype.updateIpfsState = function (newState, sortTypes) {
        (0, assert_1.default)(Array.isArray(sortTypes), "Can't determine sort type");
        (0, assert_1.default)(typeof this._defaultIpfsProviderUrl === "string");
        for (var _i = 0, sortTypes_1 = sortTypes; _i < sortTypes_1.length; _i++) {
            var sortType = sortTypes_1[_i];
            this.clients.ipfsClients[sortType][this._defaultIpfsProviderUrl].state = newState;
            this.clients.ipfsClients[sortType][this._defaultIpfsProviderUrl].emit("statechange", newState);
        }
    };
    BasePagesClientsManager.prototype.updateGatewayState = function (newState, gateway, sortTypes) {
        (0, assert_1.default)(Array.isArray(sortTypes), "Can't determine sort type");
        for (var _i = 0, sortTypes_2 = sortTypes; _i < sortTypes_2.length; _i++) {
            var sortType = sortTypes_2[_i];
            this.clients.ipfsGateways[sortType][gateway].state = newState;
            this.clients.ipfsGateways[sortType][gateway].emit("statechange", newState);
        }
    };
    BasePagesClientsManager.prototype.fetchPage = function (pageCid) {
        return __awaiter(this, void 0, void 0, function () {
            var sortTypes, page, _a, _b, page, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!this._defaultIpfsProviderUrl) return [3 /*break*/, 2];
                        sortTypes = constants_1.pageCidToSortTypesCache.get(pageCid);
                        (0, assert_1.default)(Array.isArray(sortTypes), "Page cid is not mapped to a sort type");
                        this.updateIpfsState("fetching-ipfs", sortTypes);
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this._fetchCidP2P(pageCid)];
                    case 1:
                        page = _b.apply(_a, [_e.sent()]);
                        this.updateIpfsState("stopped", sortTypes);
                        if (page.nextCid)
                            this.updatePageCidsToSortTypesToIncludeSubsequent(page.nextCid, pageCid);
                        return [2 /*return*/, page];
                    case 2:
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, this.fetchFromMultipleGateways({ cid: pageCid }, "generic-ipfs")];
                    case 3:
                        page = _d.apply(_c, [_e.sent()]);
                        if (page.nextCid)
                            this.updatePageCidsToSortTypesToIncludeSubsequent(page.nextCid, pageCid);
                        return [2 /*return*/, page];
                }
            });
        });
    };
    return BasePagesClientsManager;
}(base_client_manager_1.BaseClientsManager));
exports.BasePagesClientsManager = BasePagesClientsManager;
var RepliesPagesClientsManager = /** @class */ (function (_super) {
    __extends(RepliesPagesClientsManager, _super);
    function RepliesPagesClientsManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RepliesPagesClientsManager.prototype.getSortTypes = function () {
        return Object.keys(sort_handler_1.REPLIES_SORT_TYPES);
    };
    return RepliesPagesClientsManager;
}(BasePagesClientsManager));
exports.RepliesPagesClientsManager = RepliesPagesClientsManager;
var PostsPagesClientsManager = /** @class */ (function (_super) {
    __extends(PostsPagesClientsManager, _super);
    function PostsPagesClientsManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PostsPagesClientsManager.prototype.getSortTypes = function () {
        return Object.keys(sort_handler_1.POSTS_SORT_TYPES);
    };
    return PostsPagesClientsManager;
}(BasePagesClientsManager));
exports.PostsPagesClientsManager = PostsPagesClientsManager;
//# sourceMappingURL=pages-client-manager.js.map