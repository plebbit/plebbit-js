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
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var assert_1 = __importDefault(require("assert"));
var lodash_1 = __importDefault(require("lodash"));
var Stats = /** @class */ (function () {
    function Stats(plebbit) {
        this._plebbit = plebbit;
    }
    Stats.prototype.toJSON = function () {
        return undefined;
    };
    Stats.prototype._getSuccessCountKey = function (gatewayUrl, type) {
        return "".concat(this._getBaseKey(gatewayUrl, type), "_COUNT_SUCCESS");
    };
    Stats.prototype._getSuccessAverageKey = function (gatewayUrl, type) {
        return "".concat(this._getBaseKey(gatewayUrl, type), "_AVERAGE_SUCCESS");
    };
    Stats.prototype.recordGatewaySuccess = function (gatewayUrl, type, timeElapsedMs) {
        return __awaiter(this, void 0, void 0, function () {
            var log, countKey, averageKey, curAverage, curCount, newAverage, newCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:stats:gateway:success");
                        log.trace("Attempting to record gateway (".concat(gatewayUrl, ") success for type (").concat(type, ") that took ").concat(timeElapsedMs, "ms"));
                        countKey = this._getSuccessCountKey(gatewayUrl, type);
                        averageKey = this._getSuccessAverageKey(gatewayUrl, type);
                        return [4 /*yield*/, this._plebbit._cache.getItem(averageKey)];
                    case 1:
                        curAverage = (_a.sent()) || 0;
                        return [4 /*yield*/, this._plebbit._cache.getItem(countKey)];
                    case 2:
                        curCount = (_a.sent()) || 0;
                        newAverage = curAverage + (timeElapsedMs - curAverage) / (curCount + 1);
                        newCount = curCount + 1;
                        return [4 /*yield*/, Promise.all([this._plebbit._cache.setItem(averageKey, newAverage), this._plebbit._cache.setItem(countKey, newCount)])];
                    case 3:
                        _a.sent();
                        log.trace("Updated gateway (".concat(gatewayUrl, ") success average from (").concat(curAverage, ") to ").concat(newAverage, " and count from (").concat(curCount, ") to (").concat(newCount, ") for type (").concat(type, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    Stats.prototype._getBaseKey = function (url, type) {
        return "STATS_".concat(url, "_").concat(type);
    };
    Stats.prototype._getFailuresCountKey = function (url, type) {
        return "".concat(this._getBaseKey(url, type), "_COUNT_FAILURE");
    };
    Stats.prototype.recordGatewayFailure = function (gatewayUrl, type) {
        return __awaiter(this, void 0, void 0, function () {
            var log, countKey, curCount, newCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:stats:gateway:failure");
                        log.trace("Attempting to record gateway (".concat(gatewayUrl, ") failure for type (").concat(type, ")"));
                        countKey = this._getFailuresCountKey(gatewayUrl, type);
                        return [4 /*yield*/, this._plebbit._cache.getItem(countKey)];
                    case 1:
                        curCount = (_a.sent()) || 0;
                        newCount = curCount + 1;
                        return [4 /*yield*/, this._plebbit._cache.setItem(countKey, newCount)];
                    case 2:
                        _a.sent();
                        log.trace("Updated gateway (".concat(gatewayUrl, ") failure  count from (").concat(curCount, ") to (").concat(newCount, ") for type (").concat(type, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    Stats.prototype._gatewayScore = function (failureCounts, successCounts, successAverageMs) {
        // Thanks for @thisisnotph for their input on this formula
        return ((1 / (successAverageMs + 150) / (1 / (successAverageMs + 100) + 1 / 150)) * 0.2 +
            ((successCounts + 0.288) / (failureCounts * 2 + successCounts + 1)) * 0.8);
    };
    Stats.prototype.sortGatewaysAccordingToScore = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var log, gatewayType, gateways, score, gatewaysSorted;
            var _this = this;
            return __generator(this, function (_a) {
                log = (0, plebbit_logger_1.default)("plebbit-js:stats:gateway:sort");
                gatewayType = type === "cid" || type === "ipns"
                    ? "ipfsGateways"
                    : type === "pubsub-publish"
                        ? "pubsubClients"
                        : type === "eth" || type === "avax" || type === "matic"
                            ? "chainProviders"
                            : undefined;
                (0, assert_1.default)(gatewayType);
                gateways = gatewayType === "chainProviders"
                    ? this._plebbit.clients.chainProviders[type].urls
                    : Object.keys(this._plebbit.clients[gatewayType]);
                score = function (gatewayUrl) { return __awaiter(_this, void 0, void 0, function () {
                    var failureCounts, successCounts, successAverageMs, gatewayScore;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this._plebbit._cache.getItem(this._getFailuresCountKey(gatewayUrl, type))];
                            case 1:
                                failureCounts = (_a.sent()) || 0;
                                return [4 /*yield*/, this._plebbit._cache.getItem(this._getSuccessCountKey(gatewayUrl, type))];
                            case 2:
                                successCounts = (_a.sent()) || 0;
                                return [4 /*yield*/, this._plebbit._cache.getItem(this._getSuccessAverageKey(gatewayUrl, type))];
                            case 3:
                                successAverageMs = (_a.sent()) || 0;
                                gatewayScore = this._gatewayScore(failureCounts, successCounts, successAverageMs);
                                log.trace("gateway (".concat(gatewayUrl, ") score is (").concat(gatewayScore, ") for type (").concat(type, ")"));
                                return [2 /*return*/, score];
                        }
                    });
                }); };
                gatewaysSorted = lodash_1.default.sortBy(gateways, score);
                return [2 /*return*/, gatewaysSorted];
            });
        });
    };
    return Stats;
}());
exports.default = Stats;
//# sourceMappingURL=stats.js.map