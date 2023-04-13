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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = void 0;
var ethers_1 = require("ethers");
var assert_1 = __importDefault(require("assert"));
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var lodash_1 = __importDefault(require("lodash"));
var util_1 = require("./util");
var Resolver = /** @class */ (function () {
    function Resolver(plebbit) {
        this.cachedChainProviders = {};
        this.plebbit = plebbit;
    }
    Resolver.prototype.toJSON = function () {
        return undefined;
    };
    Resolver.prototype.toString = function () {
        return undefined;
    };
    // cache the chain providers because only 1 should be running at the same time
    Resolver.prototype._getChainProvider = function (chainTicker) {
        var _a, _b, _c;
        (0, assert_1.default)(chainTicker && typeof chainTicker === "string", "invalid chainTicker '".concat(chainTicker, "'"));
        (0, assert_1.default)(this.plebbit.chainProviders, "invalid chainProviders '".concat(this.plebbit.chainProviders, "'"));
        if (this.cachedChainProviders[chainTicker]) {
            return this.cachedChainProviders[chainTicker];
        }
        if (chainTicker === "eth") {
            // if using eth, use ethers' default provider unless another provider is specified
            if (!this.plebbit.chainProviders["eth"] || ((_c = (_b = (_a = this.plebbit.chainProviders["eth"]) === null || _a === void 0 ? void 0 : _a.urls) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.match(/DefaultProvider/i))) {
                this.cachedChainProviders["eth"] = ethers_1.ethers.getDefaultProvider();
                return this.cachedChainProviders["eth"];
            }
        }
        if (this.plebbit.chainProviders[chainTicker]) {
            this.cachedChainProviders[chainTicker] = new ethers_1.ethers.providers.JsonRpcProvider({ url: this.plebbit.chainProviders[chainTicker].urls[0] }, this.plebbit.chainProviders[chainTicker].chainId);
            return this.cachedChainProviders[chainTicker];
        }
        (0, util_1.throwWithErrorCode)("ERR_NO_CHAIN_PROVIDER_FOR_CHAIN_TICKER", { chainTicker: chainTicker, chainProviders: this.plebbit.chainProviders });
    };
    Resolver.prototype._resolveEnsTxtRecord = function (ensName, txtRecordName) {
        return __awaiter(this, void 0, void 0, function () {
            var log, cachedResponse, chainProvider, resolver, txtRecordResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:resolver:_resolveEnsTxtRecord");
                        cachedResponse = this.plebbit._memCache.get(ensName + txtRecordName);
                        if (cachedResponse && typeof cachedResponse === "string")
                            return [2 /*return*/, cachedResponse];
                        chainProvider = this._getChainProvider("eth");
                        return [4 /*yield*/, chainProvider.getResolver(ensName)];
                    case 1:
                        resolver = _a.sent();
                        if (!resolver)
                            (0, util_1.throwWithErrorCode)("ERR_ENS_RESOLVER_NOT_FOUND", { ensName: ensName, chainProvider: chainProvider });
                        return [4 /*yield*/, resolver.getText(txtRecordName)];
                    case 2:
                        txtRecordResult = _a.sent();
                        if (!txtRecordResult)
                            (0, util_1.throwWithErrorCode)("ERR_ENS_TXT_RECORD_NOT_FOUND", { ensName: ensName, txtRecordName: txtRecordName, chainProvider: chainProvider });
                        log.trace("Resolved text record name (".concat(txtRecordName, ") of ENS (").concat(ensName, ") to ").concat(txtRecordResult));
                        this.plebbit._memCache.put(ensName + txtRecordName, txtRecordResult, 3.6e6); // Expire memory ENS cache after an hour
                        return [2 /*return*/, txtRecordResult];
                }
            });
        });
    };
    Resolver.prototype.resolveAuthorAddressIfNeeded = function (authorAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var resolved;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(typeof authorAddress === "string", "authorAddress needs to be a string to be resolved");
                        if (!this.plebbit.resolveAuthorAddresses)
                            return [2 /*return*/, authorAddress];
                        resolved = lodash_1.default.clone(authorAddress);
                        if (!authorAddress.endsWith(".eth")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._resolveEnsTxtRecord(authorAddress, "plebbit-author-address")];
                    case 1:
                        resolved = _a.sent();
                        _a.label = 2;
                    case 2:
                        this.plebbit.emit("resolvedauthoraddress", authorAddress, resolved);
                        return [2 /*return*/, resolved];
                }
            });
        });
    };
    Resolver.prototype.resolveSubplebbitAddressIfNeeded = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedSubplebbitAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(typeof subplebbitAddress === "string", "subplebbitAddress needs to be a string to be resolved");
                        resolvedSubplebbitAddress = lodash_1.default.clone(subplebbitAddress);
                        if (!subplebbitAddress.endsWith(".eth")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._resolveEnsTxtRecord(subplebbitAddress, "subplebbit-address")];
                    case 1:
                        resolvedSubplebbitAddress = _a.sent();
                        _a.label = 2;
                    case 2:
                        this.plebbit.emit("resolvedsubplebbitaddress", subplebbitAddress, resolvedSubplebbitAddress);
                        return [2 /*return*/, resolvedSubplebbitAddress];
                }
            });
        });
    };
    Resolver.prototype.isDomain = function (address) {
        return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(address);
    };
    return Resolver;
}());
exports.Resolver = Resolver;
//# sourceMappingURL=resolver.js.map