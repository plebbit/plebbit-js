"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = void 0;
var ethers_1 = require("ethers");
var util_1 = require("./util");
var debugs = (0, util_1.getDebugLevels)("resolver");
var Resolver = /** @class */ (function () {
    function Resolver(options) {
        this.blockchainProviders = options.blockchainProviders;
        this.cachedBlockchainProviders = {};
        this.plebbit = options.plebbit;
    }
    Resolver.prototype.toJSON = function () {
        return { blockchainProviders: this.blockchainProviders };
    };
    Resolver.prototype._getBlockchainProvider = function (chainTicker) {
        if (this.cachedBlockchainProviders[chainTicker])
            return this.cachedBlockchainProviders[chainTicker];
        if (this.blockchainProviders[chainTicker]) {
            this.cachedBlockchainProviders[chainTicker] = new ethers_1.ethers.providers.JsonRpcProvider({ url: this.blockchainProviders[chainTicker].url }, this.blockchainProviders[chainTicker].chainId);
            return this.cachedBlockchainProviders[chainTicker];
        }
        if (chainTicker === "eth") {
            this.cachedBlockchainProviders["eth"] = ethers_1.ethers.getDefaultProvider();
            return this.cachedBlockchainProviders["eth"];
        }
        throw Error("no blockchain provider settings for chain ticker '".concat(chainTicker, "'"));
    };
    Resolver.prototype._resolveEnsTxtRecord = function (ensName, txtRecordName) {
        return __awaiter(this, void 0, void 0, function () {
            var cachedResponse, blockchainProvider, resolver, txtRecordResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cachedResponse = this.plebbit._memCache.get(ensName + txtRecordName);
                        debugs.TRACE("Attempting to resolve ENS (".concat(ensName, ") text record (").concat(txtRecordName, "), cached response: ").concat(cachedResponse));
                        if (cachedResponse) {
                            debugs.DEBUG("ENS (".concat(ensName, ") text record (").concat(txtRecordName, ") is already cached: ").concat(JSON.stringify(cachedResponse)));
                            return [2 /*return*/, cachedResponse];
                        }
                        blockchainProvider = this._getBlockchainProvider("eth");
                        return [4 /*yield*/, blockchainProvider.getResolver(ensName)];
                    case 1:
                        resolver = _a.sent();
                        return [4 /*yield*/, resolver.getText(txtRecordName)];
                    case 2:
                        txtRecordResult = _a.sent();
                        debugs.DEBUG("Resolved text record name (".concat(txtRecordName, ") of ENS (").concat(ensName, ") to ").concat(txtRecordResult));
                        if (!txtRecordResult)
                            throw new Error("ENS (".concat(ensName, ") has no field for ").concat(txtRecordName));
                        this.plebbit._memCache.put(ensName + txtRecordName, txtRecordResult, 3.6e6); // Expire ENS cache after an hour
                        return [2 /*return*/, txtRecordResult];
                }
            });
        });
    };
    Resolver.prototype.resolveAuthorAddressIfNeeded = function (authorAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.plebbit.resolveAuthorAddresses)
                    return [2 /*return*/, authorAddress];
                if (authorAddress === null || authorAddress === void 0 ? void 0 : authorAddress.endsWith(".eth")) {
                    debugs.DEBUG("Will attempt to resolve plebbit-author-address of ".concat(authorAddress));
                    return [2 /*return*/, this._resolveEnsTxtRecord(authorAddress, "plebbit-author-address")];
                }
                return [2 /*return*/, authorAddress];
            });
        });
    };
    Resolver.prototype.resolveSubplebbitAddressIfNeeded = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (subplebbitAddress === null || subplebbitAddress === void 0 ? void 0 : subplebbitAddress.endsWith(".eth")) {
                    debugs.DEBUG("Will attempt to resolve subplebbit-address of ".concat(subplebbitAddress));
                    return [2 /*return*/, this._resolveEnsTxtRecord(subplebbitAddress, "subplebbit-address")];
                }
                return [2 /*return*/, subplebbitAddress];
            });
        });
    };
    Resolver.prototype.isDomain = function (address) {
        if (address === null || address === void 0 ? void 0 : address.endsWith(".eth"))
            return true;
        return false;
    };
    return Resolver;
}());
exports.Resolver = Resolver;
