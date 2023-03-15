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
exports.Subplebbit = void 0;
var to_string_1 = require("uint8arrays/to-string");
var events_1 = __importDefault(require("events"));
var js_sha256_1 = require("js-sha256");
var from_string_1 = require("uint8arrays/from-string");
var challenge_1 = require("./challenge");
var sort_handler_1 = require("./sort-handler");
var util_1 = require("./util");
var signer_1 = require("./signer");
var safe_stable_stringify_1 = require("safe-stable-stringify");
var comment_1 = require("./comment");
var post_1 = __importDefault(require("./post"));
var util_2 = require("./signer/util");
var comment_edit_1 = require("./comment-edit");
var err_code_1 = __importDefault(require("err-code"));
var errors_1 = require("./errors");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var util_3 = require("./runtime/browser/util");
var version_1 = __importDefault(require("./version"));
var lodash_1 = __importDefault(require("lodash"));
var signatures_1 = require("./signer/signatures");
var constants_1 = require("./constants");
var assert_1 = __importDefault(require("assert"));
var version_2 = __importDefault(require("./version"));
var DEFAULT_UPDATE_INTERVAL_MS = 60000;
var DEFAULT_SYNC_INTERVAL_MS = 100000; // 1.67 minutes
var Subplebbit = /** @class */ (function (_super) {
    __extends(Subplebbit, _super);
    function Subplebbit(plebbit) {
        var _this = _super.call(this) || this;
        _this.plebbit = plebbit;
        _this._challengeToSolution = {}; // Map challenge ID to its solution
        _this._challengeToPublication = {}; // To hold unpublished posts/comments/votes
        _this._challengeToPublicKey = {}; // Map out challenge request id to their signers
        _this._sync = false;
        // these functions might get separated from their `this` when used
        _this.start = _this.start.bind(_this);
        _this.update = _this.update.bind(_this);
        _this.stop = _this.stop.bind(_this);
        _this.edit = _this.edit.bind(_this);
        _this.handleChallengeExchange = _this.handleChallengeExchange.bind(_this);
        _this.on("error", function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = _this.plebbit).emit.apply(_a, __spreadArray(["error"], args, false));
        });
        _this._syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS;
        _this._updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS;
        return _this;
    }
    Subplebbit.prototype.initSubplebbit = function (newProps) {
        return __awaiter(this, void 0, void 0, function () {
            var oldProps, mergedProps, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        oldProps = this.toJSONInternal();
                        mergedProps = __assign(__assign({}, oldProps), newProps);
                        this.title = mergedProps.title;
                        this.description = mergedProps.description;
                        this.lastPostCid = mergedProps.lastPostCid;
                        this.address = mergedProps.address;
                        this.pubsubTopic = mergedProps.pubsubTopic;
                        this.challengeTypes = mergedProps.challengeTypes;
                        this.metricsCid = mergedProps.metricsCid;
                        this.createdAt = mergedProps.createdAt;
                        this.updatedAt = mergedProps.updatedAt;
                        this.encryption = mergedProps.encryption;
                        this.roles = mergedProps.roles;
                        this.features = mergedProps.features;
                        this.suggested = mergedProps.suggested;
                        this.rules = mergedProps.rules;
                        this.flairs = mergedProps.flairs;
                        this.signature = mergedProps.signature;
                        this._subplebbitUpdateTrigger = mergedProps._subplebbitUpdateTrigger;
                        if (!this.signer && mergedProps.signer)
                            this.signer = new signer_1.Signer(mergedProps.signer);
                        _a = this;
                        return [4 /*yield*/, (0, util_1.parseRawPages)(mergedProps.posts, undefined, this)];
                    case 1:
                        _a.posts = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._initSignerProps = function () {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (!(!((_b = (_a = this.signer) === null || _a === void 0 ? void 0 : _a.ipfsKey) === null || _b === void 0 ? void 0 : _b.byteLength) || ((_d = (_c = this.signer) === null || _c === void 0 ? void 0 : _c.ipfsKey) === null || _d === void 0 ? void 0 : _d.byteLength) <= 0)) return [3 /*break*/, 2];
                        _e = this.signer;
                        _f = Uint8Array.bind;
                        return [4 /*yield*/, (0, util_2.getIpfsKeyFromPrivateKey)(this.signer.privateKey)];
                    case 1:
                        _e.ipfsKey = new (_f.apply(Uint8Array, [void 0, _j.sent()]))();
                        _j.label = 2;
                    case 2:
                        if (!this.signer.ipnsKeyName)
                            this.signer.ipnsKeyName = this.signer.address;
                        if (!!this.signer.publicKey) return [3 /*break*/, 4];
                        _g = this.signer;
                        return [4 /*yield*/, (0, util_2.getPublicKeyFromPrivateKey)(this.signer.privateKey)];
                    case 3:
                        _g.publicKey = _j.sent();
                        _j.label = 4;
                    case 4:
                        if (!!this.signer.address) return [3 /*break*/, 6];
                        _h = this.signer;
                        return [4 /*yield*/, (0, util_2.getPlebbitAddressFromPrivateKey)(this.signer.privateKey)];
                    case 5:
                        _h.address = _j.sent();
                        _j.label = 6;
                    case 6:
                        this.encryption = {
                            type: "aes-cbc",
                            publicKey: this.signer.publicKey
                        };
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.initDbHandlerIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.dbHandler) return [3 /*break*/, 2];
                        this.dbHandler = util_3.nativeFunctions.createDbHandler({
                            address: this.address,
                            plebbit: {
                                dataPath: this.plebbit.dataPath
                            }
                        });
                        return [4 /*yield*/, this.dbHandler.initDbConfigIfNeeded()];
                    case 1:
                        _a.sent();
                        this.sortHandler = new sort_handler_1.SortHandler(lodash_1.default.pick(this, ["address", "plebbit", "dbHandler", "encryption"]));
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.setProvideCaptchaCallback = function (newCallback) {
        this.provideCaptchaCallback = newCallback;
    };
    Subplebbit.prototype.setValidateCaptchaAnswerCallback = function (newCallback) {
        this.validateCaptchaAnswerCallback = newCallback;
    };
    Subplebbit.prototype.toJSONInternal = function () {
        var _a;
        return __assign(__assign({}, this.toJSON()), { posts: (_a = this.posts) === null || _a === void 0 ? void 0 : _a.toJSON(), signer: this.signer ? lodash_1.default.pick(this.signer, ["privateKey", "type", "address"]) : undefined, _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });
    };
    Subplebbit.prototype.toJSON = function () {
        var _a;
        return __assign(__assign({}, this._toJSONBase()), { posts: (_a = this.posts) === null || _a === void 0 ? void 0 : _a.toJSON() });
    };
    Subplebbit.prototype._toJSONBase = function () {
        return {
            title: this.title,
            description: this.description,
            lastPostCid: this.lastPostCid,
            pubsubTopic: this.pubsubTopic,
            address: this.address,
            challengeTypes: this.challengeTypes,
            metricsCid: this.metricsCid,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            encryption: this.encryption,
            roles: this.roles,
            protocolVersion: this.protocolVersion,
            signature: this.signature,
            features: this.features,
            suggested: this.suggested,
            rules: this.rules,
            flairs: this.flairs
        };
    };
    Subplebbit.prototype.toJSONIpfs = function () {
        var _a;
        return __assign(__assign({}, this._toJSONBase()), { posts: (_a = this.posts) === null || _a === void 0 ? void 0 : _a.toJSONIpfs() });
    };
    Subplebbit.prototype._importSignerIntoIpfsIfNeeded = function (signer) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, keyExistsInNode, ipfsKey, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, assert_1.default)(signer.ipnsKeyName);
                        if (!!this._ipfsNodeIpnsKeyNames) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.plebbit.ipfsClient.key.list()];
                    case 1:
                        _a._ipfsNodeIpnsKeyNames = (_c.sent()).map(function (key) { return key.name; });
                        _c.label = 2;
                    case 2:
                        keyExistsInNode = this._ipfsNodeIpnsKeyNames.some(function (key) { return key === signer.ipnsKeyName; });
                        if (!!keyExistsInNode) return [3 /*break*/, 5];
                        _b = Uint8Array.bind;
                        return [4 /*yield*/, (0, util_2.getIpfsKeyFromPrivateKey)(signer.privateKey)];
                    case 3:
                        ipfsKey = new (_b.apply(Uint8Array, [void 0, _c.sent()]))();
                        return [4 /*yield*/, util_3.nativeFunctions.importSignerIntoIpfsNode(signer.ipnsKeyName, ipfsKey, this.plebbit)];
                    case 4:
                        _c.sent();
                        this._ipfsNodeIpnsKeyNames.push(signer.ipnsKeyName);
                        _c.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // TODO rename and make this private
    Subplebbit.prototype.prePublish = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, internalStateKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:prePublish");
                        return [4 /*yield*/, this.initDbHandlerIfNeeded()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.lockSubCreation()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.initDbIfNeeded()];
                    case 3:
                        _a.sent();
                        internalStateKey = constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT];
                        return [4 /*yield*/, this.dbHandler.keyvHas(internalStateKey)];
                    case 4:
                        if (!_a.sent()) return [3 /*break*/, 6];
                        log("Merging internal subplebbit state from DB and createSubplebbitOptions");
                        return [4 /*yield*/, this._mergeInstanceStateWithDbState({})];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!this.signer)
                            throw Error("subplebbit.signer needs to be defined before proceeding");
                        return [4 /*yield*/, this._initSignerProps()];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.keyvHas(internalStateKey)];
                    case 8:
                        if (!!(_a.sent())) return [3 /*break*/, 10];
                        log("Updating the internal state of subplebbit in DB with createSubplebbitOptions");
                        return [4 /*yield*/, this._updateDbInternalState(this.toJSONInternal())];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [4 /*yield*/, this.dbHandler.unlockSubCreation()];
                    case 11:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.assertDomainResolvesCorrectly = function (domain) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var resolvedAddress, derivedAddress;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.plebbit.resolver.isDomain(domain)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(domain)];
                    case 1:
                        resolvedAddress = _b.sent();
                        return [4 /*yield*/, (0, util_2.getPlebbitAddressFromPublicKey)(this.encryption.publicKey)];
                    case 2:
                        derivedAddress = _b.sent();
                        if (resolvedAddress !== derivedAddress)
                            (0, util_1.throwWithErrorCode)("ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS", "subplebbit.address (".concat(this.address, "), resolved address (").concat(resolvedAddress, "), subplebbit.signer.address (").concat((_a = this.signer) === null || _a === void 0 ? void 0 : _a.address, ")"));
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.edit = function (newSubplebbitOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var log, newSubProps;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:edit");
                        if (!(newSubplebbitOptions.address && newSubplebbitOptions.address !== this.address)) return [3 /*break*/, 4];
                        this.assertDomainResolvesCorrectly(newSubplebbitOptions.address).catch(function (err) {
                            var editError = (0, err_code_1.default)(err, err.code, { details: "subplebbit.edit: ".concat(err.details) });
                            log.error(editError);
                            _this.emit("error", editError);
                        });
                        log("Attempting to edit subplebbit.address from ".concat(this.address, " to ").concat(newSubplebbitOptions.address));
                        return [4 /*yield*/, this._updateDbInternalState(lodash_1.default.pick(newSubplebbitOptions, "address"))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.changeDbFilename(newSubplebbitOptions.address, {
                                address: newSubplebbitOptions.address,
                                plebbit: {
                                    dataPath: this.plebbit.dataPath
                                }
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._switchDbIfNeeded()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        newSubProps = __assign(__assign({}, lodash_1.default.omit(newSubplebbitOptions, "address")), { _subplebbitUpdateTrigger: true });
                        return [4 /*yield*/, this._updateDbInternalState(newSubProps)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.initSubplebbit(newSubProps)];
                    case 6:
                        _a.sent();
                        log("Subplebbit (".concat(this.address, ") props (").concat(Object.keys(newSubplebbitOptions), ") has been edited"));
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Subplebbit.prototype.updateOnce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, subState, e_1, updateError, ipnsAddress, subplebbitIpns, e_2, updateValidity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:update");
                        if (!this.dbHandler) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.dbHandler.keyvGet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT])];
                    case 1:
                        subState = _a.sent();
                        if (!((0, safe_stable_stringify_1.stringify)(this.toJSONInternal()) !== (0, safe_stable_stringify_1.stringify)(subState))) return [3 /*break*/, 3];
                        log("Remote Subplebbit received a new update. Will emit an update event");
                        return [4 /*yield*/, this.initSubplebbit(subState)];
                    case 2:
                        _a.sent();
                        this.emit("update", this);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 17];
                    case 4:
                        if (!this.plebbit.resolver.isDomain(this.address)) return [3 /*break*/, 8];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.assertDomainResolvesCorrectly(this.address)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_1 = _a.sent();
                        updateError = (0, err_code_1.default)(e_1, e_1.code, { details: "subplebbit.update: ".concat(e_1.details) });
                        log.error(updateError);
                        this.emit("error", updateError);
                        return [2 /*return*/];
                    case 8: return [4 /*yield*/, this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address)];
                    case 9:
                        ipnsAddress = _a.sent();
                        subplebbitIpns = void 0;
                        _a.label = 10;
                    case 10:
                        _a.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(ipnsAddress, this.plebbit)];
                    case 11:
                        subplebbitIpns = _a.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        e_2 = _a.sent();
                        log.error("Failed to load subplebbit IPNS, error:", e_2);
                        this.emit("error", e_2);
                        return [2 /*return*/];
                    case 13: return [4 /*yield*/, (0, signatures_1.verifySubplebbit)(subplebbitIpns, this.plebbit)];
                    case 14:
                        updateValidity = _a.sent();
                        if (!!updateValidity.valid) return [3 /*break*/, 15];
                        log.error("Subplebbit update's signature is invalid. Error is '".concat(updateValidity.reason, "'"));
                        this.emit("error", "Subplebbit update's signature is invalid. Error is '".concat(updateValidity.reason, "'"));
                        return [3 /*break*/, 17];
                    case 15:
                        if (!(this.updatedAt !== subplebbitIpns.updatedAt)) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.initSubplebbit(subplebbitIpns)];
                    case 16:
                        _a.sent();
                        log("Remote Subplebbit received a new update. Will emit an update event");
                        this.emit("update", this);
                        _a.label = 17;
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var updateLoop;
            var _this = this;
            return __generator(this, function (_a) {
                if (this._updateInterval || this._sync)
                    return [2 /*return*/]; // No need to do anything if subplebbit is already updating
                updateLoop = function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!this._updateInterval) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.updateOnce()];
                            case 1:
                                _a.sent();
                                setTimeout(updateLoop, this._updateIntervalMs);
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); };
                this.updateOnce().then(function () {
                    _this._updateInterval = setTimeout(updateLoop.bind(_this), _this._updateIntervalMs);
                });
                return [2 /*return*/];
            });
        });
    };
    Subplebbit.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._updateInterval = clearInterval(this._updateInterval);
                        if (!this._sync) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.pubsubTopic, this.handleChallengeExchange)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.rollbackAllTransactions()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.unlockSubStart()];
                    case 3:
                        _a.sent();
                        this._sync = false;
                        this._syncInterval = clearInterval(this._syncInterval);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._validateLocalSignature = function (newSignature, record) {
        return __awaiter(this, void 0, void 0, function () {
            var ipnsRecord, signatureValidation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ipnsRecord = JSON.parse(JSON.stringify(__assign(__assign({}, record), { signature: newSignature })));
                        return [4 /*yield*/, (0, signatures_1.verifySubplebbit)(ipnsRecord, this.plebbit)];
                    case 1:
                        signatureValidation = _a.sent();
                        assert_1.default.equal(signatureValidation.valid, true, "Failed to validate subplebbit (".concat(this.address, ") local signature due to reason (").concat(signatureValidation.reason, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.updateSubplebbitIpnsIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, lastPublishTooOld, trx, latestPost, _a, metrics, subplebbitPosts, metricsCid, updatedAt, newIpns, signature, file;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync");
                        lastPublishTooOld = this.updatedAt < (0, util_1.timestamp)() - 60 * 15;
                        if (!this._subplebbitUpdateTrigger && !lastPublishTooOld)
                            return [2 /*return*/]; // No reason to update
                        return [4 /*yield*/, this.dbHandler.createTransaction("subplebbit")];
                    case 1:
                        trx = _b.sent();
                        return [4 /*yield*/, this.dbHandler.queryLatestPostCid(trx)];
                    case 2:
                        latestPost = _b.sent();
                        return [4 /*yield*/, this.dbHandler.commitTransaction("subplebbit")];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.querySubplebbitMetrics(undefined),
                                this.sortHandler.generateSubplebbitPosts()
                            ])];
                    case 4:
                        _a = _b.sent(), metrics = _a[0], subplebbitPosts = _a[1];
                        return [4 /*yield*/, this.plebbit.ipfsClient.add((0, safe_stable_stringify_1.stringify)(metrics))];
                    case 5:
                        metricsCid = (_b.sent()).path;
                        return [4 /*yield*/, this._mergeInstanceStateWithDbState({})];
                    case 6:
                        _b.sent();
                        updatedAt = (0, util_1.timestamp)() === this.updatedAt ? (0, util_1.timestamp)() + 1 : (0, util_1.timestamp)();
                        newIpns = __assign(__assign({}, lodash_1.default.omit(this._toJSONBase(), "signature")), { lastPostCid: latestPost === null || latestPost === void 0 ? void 0 : latestPost.cid, metricsCid: metricsCid, updatedAt: updatedAt, posts: subplebbitPosts ? { pageCids: subplebbitPosts.pageCids, pages: lodash_1.default.pick(subplebbitPosts.pages, "hot") } : undefined });
                        return [4 /*yield*/, (0, signatures_1.signSubplebbit)(newIpns, this.signer)];
                    case 7:
                        signature = _b.sent();
                        return [4 /*yield*/, this._validateLocalSignature(signature, newIpns)];
                    case 8:
                        _b.sent();
                        return [4 /*yield*/, this.initSubplebbit(__assign(__assign({}, newIpns), { signature: signature }))];
                    case 9:
                        _b.sent();
                        this._subplebbitUpdateTrigger = false;
                        return [4 /*yield*/, this._updateDbInternalState(lodash_1.default.pick(this.toJSONInternal(), ["posts", "lastPostCid", "metricsCid", "updatedAt", "signature", "_subplebbitUpdateTrigger"]))];
                    case 10:
                        _b.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.add((0, safe_stable_stringify_1.stringify)(__assign(__assign({}, newIpns), { signature: signature })))];
                    case 11:
                        file = _b.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.name.publish(file.path, {
                                lifetime: "72h",
                                key: this.signer.ipnsKeyName,
                                allowOffline: true
                            })];
                    case 12:
                        _b.sent();
                        this.emit("update", this);
                        log("Published a new IPNS record for sub(".concat(this.address, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleCommentEdit = function (commentEditRaw, challengeRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var log, validRes, commentEdit, commentToBeEdited, editorAddress, modRole, _i, _a, editField, msg, _b, _c, editField, msg, msg, msg;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleCommentEdit");
                        return [4 /*yield*/, (0, signatures_1.verifyCommentEdit)(commentEditRaw, this.plebbit, false)];
                    case 1:
                        validRes = _d.sent();
                        if (!validRes.valid) {
                            log("(".concat(challengeRequestId, "): "), validRes.reason);
                            return [2 /*return*/, validRes.reason];
                        }
                        return [4 /*yield*/, this.plebbit.createCommentEdit(commentEditRaw)];
                    case 2:
                        commentEdit = _d.sent();
                        return [4 /*yield*/, this.dbHandler.queryComment(commentEdit.commentCid, undefined)];
                    case 3:
                        commentToBeEdited = _d.sent();
                        return [4 /*yield*/, (0, util_2.getPlebbitAddressFromPublicKey)(commentEdit.signature.publicKey)];
                    case 4:
                        editorAddress = _d.sent();
                        modRole = this.roles && this.roles[commentEdit.author.address];
                        if (!(commentEdit.signature.publicKey === commentToBeEdited.signature.publicKey)) return [3 /*break*/, 6];
                        // CommentEdit is signed by original author
                        for (_i = 0, _a = Object.keys((0, util_1.removeKeysWithUndefinedValues)(commentEdit.toJSON())); _i < _a.length; _i++) {
                            editField = _a[_i];
                            if (!comment_edit_1.AUTHOR_EDIT_FIELDS.includes(editField)) {
                                msg = errors_1.messages.ERR_SUB_COMMENT_EDIT_AUTHOR_INVALID_FIELD;
                                log("(".concat(challengeRequestId, "): "), msg);
                                return [2 /*return*/, msg];
                            }
                        }
                        return [4 /*yield*/, this.dbHandler.insertEdit(commentEdit.toJSONForDb(challengeRequestId))];
                    case 5:
                        _d.sent();
                        log.trace("(".concat(challengeRequestId, "): "), "Updated comment (".concat(commentEdit.commentCid, ") with CommentEdit: "), commentEdit.toJSON());
                        return [3 /*break*/, 9];
                    case 6:
                        if (!modRole) return [3 /*break*/, 8];
                        log.trace("(".concat(challengeRequestId, "): "), "".concat(modRole.role, " (").concat(editorAddress, ") is attempting to CommentEdit ").concat(commentToBeEdited === null || commentToBeEdited === void 0 ? void 0 : commentToBeEdited.cid, " with CommentEdit: "), commentEdit.toJSON());
                        for (_b = 0, _c = Object.keys((0, util_1.removeKeysWithUndefinedValues)(commentEdit.toJSON())); _b < _c.length; _b++) {
                            editField = _c[_b];
                            if (!comment_edit_1.MOD_EDIT_FIELDS.includes(editField)) {
                                msg = errors_1.messages.ERR_SUB_COMMENT_EDIT_MOD_INVALID_FIELD;
                                log("(".concat(challengeRequestId, "): "), msg);
                                return [2 /*return*/, msg];
                            }
                        }
                        if (typeof commentEdit.locked === "boolean" && commentToBeEdited.depth !== 0) {
                            msg = errors_1.messages.ERR_SUB_COMMENT_EDIT_CAN_NOT_LOCK_REPLY;
                            log("(".concat(challengeRequestId, "): "), msg);
                            return [2 /*return*/, msg];
                        }
                        return [4 /*yield*/, this.dbHandler.insertEdit(commentEdit.toJSONForDb(challengeRequestId))];
                    case 7:
                        _d.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        msg = "Editor (non-mod) - (".concat(editorAddress, ") attempted to edit a comment (").concat(commentEdit.commentCid, ") without having original author keys.");
                        log("(".concat(challengeRequestId, "): "), msg);
                        return [2 /*return*/, errors_1.messages.ERR_UNAUTHORIZED_COMMENT_EDIT];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleVote = function (newVoteProps, challengeRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var log, lastVote, validRes, msg, newVote;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleVote");
                        return [4 /*yield*/, this.dbHandler.getLastVoteOfAuthor(newVoteProps.commentCid, newVoteProps.author.address)];
                    case 1:
                        lastVote = _a.sent();
                        return [4 /*yield*/, (0, signatures_1.verifyVote)(newVoteProps, this.plebbit, false)];
                    case 2:
                        validRes = _a.sent();
                        if (!validRes.valid) {
                            log("(".concat(challengeRequestId, "): "), validRes.reason);
                            return [2 /*return*/, validRes.reason];
                        }
                        if (!(lastVote && newVoteProps.signature.publicKey !== lastVote.signature.publicKey)) return [3 /*break*/, 3];
                        msg = "Author (".concat(newVoteProps.author.address, ") attempted to change vote on (").concat(newVoteProps.commentCid, ") without having correct credentials");
                        log("(".concat(challengeRequestId, "): "), msg);
                        return [2 /*return*/, msg];
                    case 3: return [4 /*yield*/, this.plebbit.createVote(newVoteProps)];
                    case 4:
                        newVote = _a.sent();
                        return [4 /*yield*/, this.dbHandler.deleteVote(newVote.author.address, newVote.commentCid)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.insertVote(newVote.toJSONForDb(challengeRequestId))];
                    case 6:
                        _a.sent();
                        log.trace("(".concat(challengeRequestId, "): "), "inserted new vote (".concat(newVote.vote, ") for comment ").concat(newVote.commentCid));
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.isPublicationVote = function (publication) {
        return publication.hasOwnProperty("vote");
    };
    Subplebbit.prototype.isPublicationComment = function (publication) {
        return !this.isPublicationVote(publication) && !this.isPublicationCommentEdit(publication);
    };
    Subplebbit.prototype.isPublicationReply = function (publication) {
        return this.isPublicationComment(publication) && typeof publication["parentCid"] === "string";
    };
    Subplebbit.prototype.isPublicationPost = function (publication) {
        return this.isPublicationComment(publication) && !publication["parentCid"];
    };
    Subplebbit.prototype.isPublicationCommentEdit = function (publication) {
        return !this.isPublicationVote(publication) && publication.hasOwnProperty("commentCid");
    };
    Subplebbit.prototype.storePublicationIfValid = function (publication, challengeRequestId) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var log, authorModEdits, msg, forbiddenAuthorFields, parentCid, parent_1, parentFlags, isParentDeleted, postFlags, isPostDeleted, forbiddenCommentFields_1, validRes, ipnsKeyName, commentToInsert, ipfsSigner, _d, _e, _f, _g, trx, _h, _j, file, trx, _k, commentsUnderParent, parent_2, file;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid");
                        delete this._challengeToSolution[challengeRequestId];
                        delete this._challengeToPublication[challengeRequestId];
                        delete this._challengeToPublicKey[challengeRequestId];
                        if (publication["signer"]) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_FORBIDDEN_SIGNER_FIELD);
                            return [2 /*return*/, errors_1.messages.ERR_FORBIDDEN_SIGNER_FIELD];
                        }
                        log.trace("(".concat(challengeRequestId, "): "), "Will attempt to store publication if valid, ", publication);
                        if (publication.subplebbitAddress !== this.address) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS);
                            return [2 /*return*/, errors_1.messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS];
                        }
                        if (!((_a = publication === null || publication === void 0 ? void 0 : publication.author) === null || _a === void 0 ? void 0 : _a.address)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.dbHandler.queryAuthorModEdits(publication.author.address)];
                    case 1:
                        authorModEdits = _l.sent();
                        if (typeof authorModEdits.banExpiresAt === "number" && authorModEdits.banExpiresAt > (0, util_1.timestamp)()) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_AUTHOR_IS_BANNED);
                            return [2 /*return*/, errors_1.messages.ERR_AUTHOR_IS_BANNED];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        msg = "Rejecting publication because it doesn't have author.address";
                        log("(".concat(challengeRequestId, "): "), msg);
                        return [2 /*return*/, msg];
                    case 3:
                        forbiddenAuthorFields = ["subplebbit"];
                        if (Object.keys(publication.author).some(function (key) { return forbiddenAuthorFields.includes(key); })) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_FORBIDDEN_AUTHOR_FIELD);
                            return [2 /*return*/, errors_1.messages.ERR_FORBIDDEN_AUTHOR_FIELD];
                        }
                        if (!!this.isPublicationPost(publication)) return [3 /*break*/, 9];
                        parentCid = this.isPublicationReply(publication)
                            ? publication["parentCid"]
                            : this.isPublicationVote(publication) || this.isPublicationCommentEdit(publication)
                                ? publication["commentCid"]
                                : undefined;
                        if (!parentCid) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED];
                        }
                        return [4 /*yield*/, this.dbHandler.queryComment(parentCid)];
                    case 4:
                        parent_1 = _l.sent();
                        if (!parent_1) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST];
                        }
                        return [4 /*yield*/, this.dbHandler.queryCommentFlags(parentCid)];
                    case 5:
                        parentFlags = _l.sent();
                        if (parentFlags.removed && !this.isPublicationCommentEdit(publication)) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED];
                        }
                        return [4 /*yield*/, this.dbHandler.queryAuthorEditDeleted(parentCid)];
                    case 6:
                        isParentDeleted = _l.sent();
                        if (isParentDeleted && !this.isPublicationCommentEdit(publication)) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED];
                        }
                        return [4 /*yield*/, this.dbHandler.queryCommentFlags(parent_1.postCid)];
                    case 7:
                        postFlags = _l.sent();
                        if (postFlags.removed && !this.isPublicationCommentEdit(publication)) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED];
                        }
                        return [4 /*yield*/, this.dbHandler.queryAuthorEditDeleted(parent_1.postCid)];
                    case 8:
                        isPostDeleted = _l.sent();
                        if (isPostDeleted && !this.isPublicationCommentEdit(publication)) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED];
                        }
                        if (postFlags.locked && !this.isPublicationCommentEdit(publication)) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED];
                        }
                        if (parent_1.timestamp > publication.timestamp) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT];
                        }
                        _l.label = 9;
                    case 9:
                        if (!this.isPublicationVote(publication)) return [3 /*break*/, 10];
                        return [2 /*return*/, this.handleVote(publication, challengeRequestId)];
                    case 10:
                        if (!this.isPublicationCommentEdit(publication)) return [3 /*break*/, 11];
                        return [2 /*return*/, this.handleCommentEdit(publication, challengeRequestId)];
                    case 11:
                        if (!this.isPublicationComment(publication)) return [3 /*break*/, 31];
                        forbiddenCommentFields_1 = [
                            "cid",
                            "signer",
                            "ipnsKeyName",
                            "previousCid",
                            "ipnsName",
                            "depth",
                            "postCid",
                            "upvoteCount",
                            "downvoteCount",
                            "replyCount",
                            "updatedAt",
                            "replies",
                            "edit",
                            "deleted",
                            "pinned",
                            "locked",
                            "removed",
                            "reason"
                        ];
                        if (Object.keys(publication).some(function (key) { return forbiddenCommentFields_1.includes(key); })) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_FORBIDDEN_COMMENT_FIELD);
                            return [2 /*return*/, errors_1.messages.ERR_FORBIDDEN_COMMENT_FIELD];
                        }
                        return [4 /*yield*/, (0, signatures_1.verifyComment)(publication, this.plebbit, false)];
                    case 12:
                        validRes = _l.sent();
                        if (!validRes.valid) {
                            log("(".concat(challengeRequestId, "): "), validRes.reason);
                            return [2 /*return*/, validRes.reason];
                        }
                        ipnsKeyName = (0, js_sha256_1.sha256)((0, safe_stable_stringify_1.stringify)(publication));
                        return [4 /*yield*/, this.dbHandler.querySigner(ipnsKeyName)];
                    case 13:
                        if (_l.sent()) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_DUPLICATE_COMMENT);
                            return [2 /*return*/, errors_1.messages.ERR_DUPLICATE_COMMENT];
                        }
                        return [4 /*yield*/, this.plebbit.createComment(publication)];
                    case 14:
                        commentToInsert = _l.sent();
                        return [4 /*yield*/, this.plebbit.createSigner()];
                    case 15:
                        ipfsSigner = _l.sent();
                        ipfsSigner.ipnsKeyName = ipnsKeyName;
                        return [4 /*yield*/, this.dbHandler.insertSigner(ipfsSigner.toJSONSignersTableRow(), undefined)];
                    case 16:
                        _l.sent();
                        _d = ipfsSigner;
                        _e = Uint8Array.bind;
                        return [4 /*yield*/, (0, util_2.getIpfsKeyFromPrivateKey)(ipfsSigner.privateKey)];
                    case 17:
                        _d.ipfsKey = new (_e.apply(Uint8Array, [void 0, _l.sent()]))();
                        _g = (_f = commentToInsert).setCommentIpnsKey;
                        return [4 /*yield*/, util_3.nativeFunctions.importSignerIntoIpfsNode(ipfsSigner.ipnsKeyName, ipfsSigner.ipfsKey, this.plebbit)];
                    case 18:
                        _g.apply(_f, [_l.sent()]);
                        if (!(commentToInsert instanceof post_1.default)) return [3 /*break*/, 24];
                        return [4 /*yield*/, this.dbHandler.createTransaction(challengeRequestId)];
                    case 19:
                        trx = _l.sent();
                        _j = (_h = commentToInsert).setPreviousCid;
                        return [4 /*yield*/, this.dbHandler.queryLatestPostCid(trx)];
                    case 20:
                        _j.apply(_h, [(_b = (_l.sent())) === null || _b === void 0 ? void 0 : _b.cid]);
                        return [4 /*yield*/, this.dbHandler.commitTransaction(challengeRequestId)];
                    case 21:
                        _l.sent();
                        commentToInsert.setDepth(0);
                        return [4 /*yield*/, this.plebbit.ipfsClient.add((0, safe_stable_stringify_1.stringify)(commentToInsert.toJSONIpfs()))];
                    case 22:
                        file = _l.sent();
                        commentToInsert.setPostCid(file.path);
                        commentToInsert.setCid(file.path);
                        return [4 /*yield*/, this.dbHandler.insertComment(commentToInsert.toJSONCommentsTableRowInsert(challengeRequestId))];
                    case 23:
                        _l.sent();
                        log("(".concat(challengeRequestId, "): "), "New post with cid ".concat(commentToInsert.cid, " has been inserted into DB"));
                        return [3 /*break*/, 30];
                    case 24:
                        if (!(commentToInsert instanceof comment_1.Comment)) return [3 /*break*/, 30];
                        return [4 /*yield*/, this.dbHandler.createTransaction(challengeRequestId)];
                    case 25:
                        trx = _l.sent();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.queryCommentsUnderComment(commentToInsert.parentCid, trx),
                                this.dbHandler.queryComment(commentToInsert.parentCid, trx)
                            ])];
                    case 26:
                        _k = _l.sent(), commentsUnderParent = _k[0], parent_2 = _k[1];
                        return [4 /*yield*/, this.dbHandler.commitTransaction(challengeRequestId)];
                    case 27:
                        _l.sent();
                        commentToInsert.setPreviousCid((_c = commentsUnderParent[0]) === null || _c === void 0 ? void 0 : _c.cid);
                        commentToInsert.setDepth(parent_2.depth + 1);
                        commentToInsert.setPostCid(parent_2.postCid);
                        return [4 /*yield*/, this.plebbit.ipfsClient.add((0, safe_stable_stringify_1.stringify)(commentToInsert.toJSONIpfs()))];
                    case 28:
                        file = _l.sent();
                        commentToInsert.setCid(file.path);
                        return [4 /*yield*/, this.dbHandler.insertComment(commentToInsert.toJSONCommentsTableRowInsert(challengeRequestId))];
                    case 29:
                        _l.sent();
                        log("(".concat(challengeRequestId, "): "), "New comment with cid ".concat(commentToInsert.cid, " has been inserted into DB"));
                        _l.label = 30;
                    case 30: return [2 /*return*/, commentToInsert.toJSONAfterChallengeVerification()];
                    case 31: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var log, decryptedRequest, _a, _b, _c, _d, providedChallenges, reasonForSkippingCaptcha, publicationOrReason, encryptedPublication, _e, toSignMsg, challengeVerification, _f, _g, toSignChallenge, challengeMessage, _h, _j, challengeTypes;
            var _k, _l, _m, _o;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeRequest");
                        _a = [__assign({}, request)];
                        _k = {};
                        _c = (_b = JSON).parse;
                        return [4 /*yield*/, (0, signer_1.decrypt)(request.encryptedPublication, this.signer.privateKey, request.signature.publicKey)];
                    case 1:
                        decryptedRequest = __assign.apply(void 0, _a.concat([(_k.publication = _c.apply(_b, [_p.sent()]), _k)]));
                        this._challengeToPublication[request.challengeRequestId] = decryptedRequest.publication;
                        this._challengeToPublicKey[request.challengeRequestId] = decryptedRequest.signature.publicKey;
                        return [4 /*yield*/, this.dbHandler.insertChallengeRequest(request.toJSONForDb(), undefined)];
                    case 2:
                        _p.sent();
                        this.emit("challengerequest", decryptedRequest);
                        return [4 /*yield*/, this.provideCaptchaCallback(decryptedRequest)];
                    case 3:
                        _d = _p.sent(), providedChallenges = _d[0], reasonForSkippingCaptcha = _d[1];
                        log("Received a request to a challenge (".concat(request.challengeRequestId, ")"));
                        if (!(providedChallenges.length === 0)) return [3 /*break*/, 10];
                        // Subplebbit owner has chosen to skip challenging this user or post
                        log.trace("(".concat(request.challengeRequestId, "): No challenge is required"));
                        return [4 /*yield*/, this.storePublicationIfValid(decryptedRequest.publication, request.challengeRequestId)];
                    case 4:
                        publicationOrReason = _p.sent();
                        if (!lodash_1.default.isPlainObject(publicationOrReason)) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, signer_1.encrypt)((0, safe_stable_stringify_1.stringify)(publicationOrReason), this.signer.privateKey, request.signature.publicKey)];
                    case 5:
                        _e = _p.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _e = undefined;
                        _p.label = 7;
                    case 7:
                        encryptedPublication = _e;
                        toSignMsg = {
                            type: "CHALLENGEVERIFICATION",
                            challengeRequestId: request.challengeRequestId,
                            challengeAnswerId: undefined,
                            challengeSuccess: typeof publicationOrReason !== "string",
                            reason: typeof publicationOrReason === "string" ? publicationOrReason : reasonForSkippingCaptcha,
                            encryptedPublication: encryptedPublication,
                            challengeErrors: undefined,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _f = challenge_1.ChallengeVerificationMessage.bind;
                        _g = [__assign({}, toSignMsg)];
                        _l = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignMsg, this.signer)];
                    case 8:
                        challengeVerification = new (_f.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _g.concat([(_l.signature = _p.sent(), _l)]))]))();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)((0, safe_stable_stringify_1.stringify)(challengeVerification)))
                            ])];
                    case 9:
                        _p.sent();
                        log("(".concat(request.challengeRequestId, "): "), "Published ".concat(challengeVerification.type, " over pubsub: "), lodash_1.default.omit(toSignMsg, ["encryptedPublication"]));
                        this.emit("challengeverification", __assign(__assign({}, challengeVerification), { publication: decryptedRequest.publication }));
                        return [3 /*break*/, 14];
                    case 10:
                        _m = {
                            type: "CHALLENGE",
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            userAgent: version_1.default.USER_AGENT,
                            challengeRequestId: request.challengeRequestId
                        };
                        return [4 /*yield*/, (0, signer_1.encrypt)((0, safe_stable_stringify_1.stringify)(providedChallenges), this.signer.privateKey, request.signature.publicKey)];
                    case 11:
                        toSignChallenge = (_m.encryptedChallenges = _p.sent(),
                            _m.timestamp = (0, util_1.timestamp)(),
                            _m);
                        _h = challenge_1.ChallengeMessage.bind;
                        _j = [__assign({}, toSignChallenge)];
                        _o = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeMessage)(toSignChallenge, this.signer)];
                    case 12:
                        challengeMessage = new (_h.apply(challenge_1.ChallengeMessage, [void 0, __assign.apply(void 0, _j.concat([(_o.signature = _p.sent(), _o)]))]))();
                        challengeTypes = providedChallenges.map(function (challenge) { return challenge.type; });
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.insertChallenge(challengeMessage.toJSONForDb(challengeTypes), undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)((0, safe_stable_stringify_1.stringify)(challengeMessage)))
                            ])];
                    case 13:
                        _p.sent();
                        log.trace("(".concat(request.challengeRequestId, "): "), "Published ".concat(challengeMessage.type, " over pubsub: "), lodash_1.default.omit(toSignChallenge, ["encryptedChallenges"]));
                        this.emit("challengemessage", __assign(__assign({}, challengeMessage), { challenges: providedChallenges }));
                        _p.label = 14;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeAnswer = function (challengeAnswer) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log, decryptedAnswers, _b, _c, decryptedChallengeAnswer, _d, challengeSuccess, challengeErrors, storedPublication, publicationOrReason, encryptedPublication, _e, toSignMsg, challengeVerification, _f, _g, toSignVerification, challengeVerification, _h, _j;
            var _k, _l;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeAnswer");
                        _c = (_b = JSON).parse;
                        return [4 /*yield*/, (0, signer_1.decrypt)(challengeAnswer.encryptedChallengeAnswers, (_a = this.signer) === null || _a === void 0 ? void 0 : _a.privateKey, challengeAnswer.signature.publicKey)];
                    case 1:
                        decryptedAnswers = _c.apply(_b, [_m.sent()]);
                        decryptedChallengeAnswer = __assign(__assign({}, challengeAnswer), { challengeAnswers: decryptedAnswers });
                        return [4 /*yield*/, this.dbHandler.insertChallengeAnswer(challengeAnswer.toJSONForDb(decryptedChallengeAnswer.challengeAnswers), undefined)];
                    case 2:
                        _m.sent();
                        this.emit("challengeanswer", decryptedChallengeAnswer);
                        return [4 /*yield*/, this.validateCaptchaAnswerCallback(decryptedChallengeAnswer)];
                    case 3:
                        _d = _m.sent(), challengeSuccess = _d[0], challengeErrors = _d[1];
                        if (!challengeSuccess) return [3 /*break*/, 10];
                        log.trace("(".concat(challengeAnswer.challengeRequestId, "): "), "User has been answered correctly");
                        storedPublication = this._challengeToPublication[challengeAnswer.challengeRequestId];
                        return [4 /*yield*/, this.storePublicationIfValid(storedPublication, challengeAnswer.challengeRequestId)];
                    case 4:
                        publicationOrReason = _m.sent();
                        if (!lodash_1.default.isPlainObject(publicationOrReason)) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, signer_1.encrypt)((0, safe_stable_stringify_1.stringify)(publicationOrReason), this.signer.privateKey, challengeAnswer.signature.publicKey)];
                    case 5:
                        _e = _m.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _e = undefined;
                        _m.label = 7;
                    case 7:
                        encryptedPublication = _e;
                        toSignMsg = {
                            type: "CHALLENGEVERIFICATION",
                            challengeRequestId: challengeAnswer.challengeRequestId,
                            challengeAnswerId: challengeAnswer.challengeAnswerId,
                            challengeSuccess: typeof publicationOrReason !== "string",
                            reason: typeof publicationOrReason === "string" ? publicationOrReason : undefined,
                            encryptedPublication: encryptedPublication,
                            challengeErrors: challengeErrors,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _f = challenge_1.ChallengeVerificationMessage.bind;
                        _g = [__assign({}, toSignMsg)];
                        _k = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignMsg, this.signer)];
                    case 8:
                        challengeVerification = new (_f.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _g.concat([(_k.signature = _m.sent(), _k)]))]))();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)((0, safe_stable_stringify_1.stringify)(challengeVerification)))
                            ])];
                    case 9:
                        _m.sent();
                        log("(".concat(challengeAnswer.challengeRequestId, "): "), "Published ".concat(challengeVerification.type, " over pubsub:"), lodash_1.default.omit(toSignMsg, ["encryptedPublication"]));
                        this.emit("challengeverification", __assign(__assign({}, challengeVerification), { publication: encryptedPublication ? publicationOrReason : undefined }));
                        return [3 /*break*/, 13];
                    case 10:
                        log.trace("Challenge (".concat(challengeAnswer.challengeRequestId, ") has been answered incorrectly"));
                        toSignVerification = {
                            type: "CHALLENGEVERIFICATION",
                            challengeRequestId: challengeAnswer.challengeRequestId,
                            challengeAnswerId: challengeAnswer.challengeAnswerId,
                            challengeSuccess: challengeSuccess,
                            challengeErrors: challengeErrors,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _h = challenge_1.ChallengeVerificationMessage.bind;
                        _j = [__assign({}, toSignVerification)];
                        _l = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignVerification, this.signer)];
                    case 11:
                        challengeVerification = new (_h.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _j.concat([(_l.signature = _m.sent(), _l)]))]))();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)((0, safe_stable_stringify_1.stringify)(challengeVerification)))
                            ])];
                    case 12:
                        _m.sent();
                        log("(".concat(challengeAnswer.challengeRequestId, "): "), "Published ".concat(challengeVerification.type, " over pubsub:"), toSignVerification);
                        this.emit("challengeverification", challengeVerification);
                        _m.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._verifyPubsubMsgSignature = function (msgParsed) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, _a, toSignVerification, challengeVerification, _b, _c, err;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!(msgParsed.type === "CHALLENGEANSWER")) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, signatures_1.verifyChallengeAnswer)(msgParsed)];
                    case 1:
                        _a = _e.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, (0, signatures_1.verifyChallengeRequest)(msgParsed)];
                    case 3:
                        _a = _e.sent();
                        _e.label = 4;
                    case 4:
                        validation = _a;
                        if (!!validation.valid) return [3 /*break*/, 7];
                        toSignVerification = {
                            type: "CHALLENGEVERIFICATION",
                            challengeRequestId: msgParsed.challengeRequestId,
                            challengeAnswerId: msgParsed["challengeAnswerId"],
                            challengeSuccess: false,
                            reason: validation.reason,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _b = challenge_1.ChallengeVerificationMessage.bind;
                        _c = [__assign({}, toSignVerification)];
                        _d = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignVerification, this.signer)];
                    case 5:
                        challengeVerification = new (_b.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _c.concat([(_d.signature = _e.sent(), _d)]))]))();
                        return [4 /*yield*/, this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)((0, safe_stable_stringify_1.stringify)(challengeVerification)))];
                    case 6:
                        _e.sent();
                        err = (0, err_code_1.default)(Error(errors_1.messages.ERR_SIGNATURE_IS_INVALID), errors_1.messages[errors_1.messages.ERR_SIGNATURE_IS_INVALID], {
                            details: "subplebbit.handleChallengeExchange: Failed to verify ".concat(msgParsed.type, ", Failed verification reason: ").concat(validation.reason)
                        });
                        this.emit("error", err);
                        throw err;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeExchange = function (pubsubMsg) {
        return __awaiter(this, void 0, void 0, function () {
            var log, msgParsed, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeExchange");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 11]);
                        msgParsed = JSON.parse((0, to_string_1.toString)(pubsubMsg.data));
                        if (!(msgParsed.type === "CHALLENGEREQUEST")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._verifyPubsubMsgSignature(msgParsed)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.handleChallengeRequest(new challenge_1.ChallengeRequestMessage(msgParsed))];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        if (!(msgParsed.type === "CHALLENGEANSWER" && this._challengeToPublication[msgParsed.challengeRequestId])) return [3 /*break*/, 7];
                        // Only reply to peers who started a challenge request earlier
                        return [4 /*yield*/, this._verifyPubsubMsgSignature(msgParsed)];
                    case 5:
                        // Only reply to peers who started a challenge request earlier
                        _a.sent();
                        if (msgParsed.signature.publicKey !== this._challengeToPublicKey[msgParsed.challengeRequestId])
                            return [2 /*return*/];
                        return [4 /*yield*/, this.handleChallengeAnswer(new challenge_1.ChallengeAnswerMessage(msgParsed))];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 11];
                    case 8:
                        e_3 = _a.sent();
                        e_3.message = "failed process captcha for challenge request id (".concat(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId, "): ").concat(e_3.message);
                        log.error("(".concat(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId, "): "), e_3);
                        if (!(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.dbHandler.rollbackTransaction(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.defaultProvideCaptcha = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, image, text;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, util_3.nativeFunctions.createImageCaptcha(300, 100)];
                    case 1:
                        _a = _b.sent(), image = _a.image, text = _a.text;
                        this._challengeToSolution[request.challengeRequestId] = [text];
                        return [2 /*return*/, [[{ challenge: image, type: "image/png" }], undefined]];
                }
            });
        });
    };
    Subplebbit.prototype.defaultValidateCaptcha = function (answerMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var log, actualSolution, answerIsCorrect, challengeErrors;
            return __generator(this, function (_a) {
                log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:validateCaptcha");
                actualSolution = this._challengeToSolution[answerMessage.challengeRequestId];
                answerIsCorrect = lodash_1.default.isEqual(answerMessage.challengeAnswers, actualSolution);
                log("(".concat(answerMessage === null || answerMessage === void 0 ? void 0 : answerMessage.challengeRequestId, "): "), "Answer's validity: ".concat(answerIsCorrect, ", user's answer: ").concat(answerMessage.challengeAnswers, ", actual solution: ").concat(actualSolution));
                challengeErrors = answerIsCorrect ? undefined : ["User solved captcha incorrectly"];
                return [2 /*return*/, [answerIsCorrect, challengeErrors]];
            });
        });
    };
    Subplebbit.prototype._publishCommentIpns = function (dbComment, options) {
        return __awaiter(this, void 0, void 0, function () {
            var signerRaw, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbHandler.querySigner(dbComment.ipnsKeyName)];
                    case 1:
                        signerRaw = _a.sent();
                        if (!signerRaw)
                            throw Error("Comment ".concat(dbComment.cid, " IPNS signer is not stored in DB"));
                        return [4 /*yield*/, this._importSignerIntoIpfsIfNeeded(signerRaw)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.add((0, safe_stable_stringify_1.stringify)(options))];
                    case 3:
                        file = _a.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.name.publish(file.path, {
                                lifetime: "72h",
                                key: signerRaw.ipnsKeyName,
                                allowOffline: true
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._validateCommentUpdate = function (update, comment) {
        return __awaiter(this, void 0, void 0, function () {
            var simUpdate, signatureValidity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        simUpdate = JSON.parse((0, safe_stable_stringify_1.stringify)(update));
                        return [4 /*yield*/, (0, signatures_1.verifyCommentUpdate)(simUpdate, this, comment, this.plebbit)];
                    case 1:
                        signatureValidity = _a.sent();
                        (0, assert_1.default)(signatureValidity.valid, "Comment Update signature is invalid. Reason (".concat(signatureValidity.reason, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._updateComment = function (comment) {
        return __awaiter(this, void 0, void 0, function () {
            var log, _a, calculatedCommentUpdate, storedCommentUpdate, generatedPages, newUpdatedAt, commentUpdatePriorToSigning, newIpns, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync:syncComment");
                        // If we're here that means we're gonna calculate the new update and publish it
                        log("Attempting to update Comment (".concat(comment.cid, ")"));
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.queryCalculatedCommentUpdate(comment),
                                this.dbHandler.queryStoredCommentUpdate(comment),
                                this.sortHandler.generateRepliesPages(comment)
                            ])];
                    case 1:
                        _a = _d.sent(), calculatedCommentUpdate = _a[0], storedCommentUpdate = _a[1], generatedPages = _a[2];
                        if (calculatedCommentUpdate.replyCount > 0)
                            (0, assert_1.default)(generatedPages);
                        newUpdatedAt = (storedCommentUpdate === null || storedCommentUpdate === void 0 ? void 0 : storedCommentUpdate.updatedAt) === (0, util_1.timestamp)() ? (0, util_1.timestamp)() + 1 : (0, util_1.timestamp)();
                        commentUpdatePriorToSigning = __assign(__assign({}, calculatedCommentUpdate), { replies: generatedPages ? { pageCids: generatedPages.pageCids, pages: lodash_1.default.pick(generatedPages.pages, "topAll") } : undefined, updatedAt: newUpdatedAt, protocolVersion: version_2.default.PROTOCOL_VERSION });
                        _b = [__assign({}, commentUpdatePriorToSigning)];
                        _c = {};
                        return [4 /*yield*/, (0, signatures_1.signCommentUpdate)(commentUpdatePriorToSigning, this.signer)];
                    case 2:
                        newIpns = __assign.apply(void 0, _b.concat([(_c.signature = _d.sent(), _c)]));
                        return [4 /*yield*/, this._validateCommentUpdate(newIpns, comment)];
                    case 3:
                        _d.sent(); // Should be removed once signature are working properly
                        return [4 /*yield*/, this.dbHandler.upsertCommentUpdate(newIpns)];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, this._publishCommentIpns(comment, newIpns)];
                    case 5:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._listenToIncomingRequests = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, subscribedTopics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync");
                        return [4 /*yield*/, this.plebbit.pubsubIpfsClient.pubsub.ls()];
                    case 1:
                        subscribedTopics = _a.sent();
                        if (!!subscribedTopics.includes(this.pubsubTopic)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.pubsubTopic, this.handleChallengeExchange)];
                    case 2:
                        _a.sent(); // Make sure it's not hanging
                        return [4 /*yield*/, this.plebbit.pubsubIpfsClient.pubsub.subscribe(this.pubsubTopic, this.handleChallengeExchange)];
                    case 3:
                        _a.sent();
                        log("Waiting for publications on pubsub topic (".concat(this.pubsubTopic, ")"));
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._getDbInternalState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var internalState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbHandler.lockSubState()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.keyvGet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT])];
                    case 2:
                        internalState = _a.sent();
                        return [4 /*yield*/, this.dbHandler.unlockSubState()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, internalState];
                }
            });
        });
    };
    Subplebbit.prototype._mergeInstanceStateWithDbState = function (overrideProps) {
        return __awaiter(this, void 0, void 0, function () {
            var currentDbState, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = lodash_1.default).omit;
                        return [4 /*yield*/, this._getDbInternalState()];
                    case 1:
                        currentDbState = _b.apply(_a, [_c.sent(), "address"]);
                        return [4 /*yield*/, this.initSubplebbit(__assign(__assign({}, currentDbState), overrideProps))];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._switchDbIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, internalState, potentialNewAddresses, wasSubRunning, newAddresses, newAddress;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync");
                        return [4 /*yield*/, this.dbHandler.keyvGet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT])];
                    case 1:
                        internalState = _a.sent();
                        potentialNewAddresses = lodash_1.default.uniq([internalState.address, this.dbHandler.subAddress(), this.address]);
                        if (!this.dbHandler.isDbInMemory()) return [3 /*break*/, 2];
                        this.address = this.dbHandler.subAddress();
                        return [3 /*break*/, 9];
                    case 2:
                        if (!(potentialNewAddresses.length > 1)) return [3 /*break*/, 9];
                        return [4 /*yield*/, Promise.all(potentialNewAddresses.map(this.dbHandler.isSubStartLocked))];
                    case 3:
                        wasSubRunning = (_a.sent()).some(Boolean);
                        newAddresses = potentialNewAddresses.filter(function (address) { return _this.dbHandler.subDbExists(address); });
                        if (newAddresses.length > 1)
                            throw Error("There are multiple dbs of the same sub");
                        newAddress = newAddresses[0];
                        log("Updating to a new address (".concat(newAddress, ") "));
                        return [4 /*yield*/, Promise.all(potentialNewAddresses.map(this.dbHandler.unlockSubStart))];
                    case 4:
                        _a.sent();
                        if (!wasSubRunning) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.dbHandler.lockSubStart(newAddress)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        this.address = newAddress;
                        this.dbHandler = this.sortHandler = undefined;
                        return [4 /*yield*/, this.initDbHandlerIfNeeded()];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.initDbIfNeeded()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._updateCommentsThatNeedToBeUpdated = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, minimumUpdatedAt, trx, commentsToUpdate, commentsGroupedByDepth, depthsKeySorted, _i, depthsKeySorted_1, depthKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:_updateCommentsThatNeedToBeUpdated");
                        minimumUpdatedAt = (0, util_1.timestamp)() - 71 * 60 * 60;
                        return [4 /*yield*/, this.dbHandler.createTransaction("_updateCommentsThatNeedToBeUpdated")];
                    case 1:
                        trx = _a.sent();
                        return [4 /*yield*/, this.dbHandler.queryCommentsToBeUpdated({
                                minimumUpdatedAt: minimumUpdatedAt,
                                ipnsKeyNames: this._ipfsNodeIpnsKeyNames
                            }, trx)];
                    case 2:
                        commentsToUpdate = _a.sent();
                        return [4 /*yield*/, this.dbHandler.commitTransaction("_updateCommentsThatNeedToBeUpdated")];
                    case 3:
                        _a.sent();
                        if (commentsToUpdate.length === 0)
                            return [2 /*return*/];
                        this._subplebbitUpdateTrigger = true;
                        log("Will update ".concat(commentsToUpdate.length, " comments in this update loop for subplebbit (").concat(this.address, ")"));
                        commentsGroupedByDepth = lodash_1.default.groupBy(commentsToUpdate, "depth");
                        depthsKeySorted = Object.keys(commentsGroupedByDepth).sort(function (a, b) { return Number(b) - Number(a); });
                        _i = 0, depthsKeySorted_1 = depthsKeySorted;
                        _a.label = 4;
                    case 4:
                        if (!(_i < depthsKeySorted_1.length)) return [3 /*break*/, 7];
                        depthKey = depthsKeySorted_1[_i];
                        return [4 /*yield*/, Promise.all(commentsGroupedByDepth[depthKey].map(this._updateComment.bind(this)))];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.syncIpnsWithDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, _a, e_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync");
                        return [4 /*yield*/, this._switchDbIfNeeded()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this._mergeInstanceStateWithDbState({})];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 8, , 9]);
                        _a = this;
                        return [4 /*yield*/, this.plebbit.ipfsClient.key.list()];
                    case 4:
                        _a._ipfsNodeIpnsKeyNames = (_b.sent()).map(function (key) { return key.name; });
                        return [4 /*yield*/, this._listenToIncomingRequests()];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, this._updateCommentsThatNeedToBeUpdated()];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, this.updateSubplebbitIpnsIfNeeded()];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_4 = _b.sent();
                        log.error("Failed to sync due to error,", e_4);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._updateDbInternalState = function (props) {
        return __awaiter(this, void 0, void 0, function () {
            var internalStateBefore;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (Object.keys(props).length === 0)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.dbHandler.lockSubState()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.keyvGet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT])];
                    case 2:
                        internalStateBefore = _a.sent();
                        return [4 /*yield*/, this.dbHandler.keyvSet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT], __assign(__assign({}, internalStateBefore), props))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.unlockSubState()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._syncLoop = function (syncIntervalMs) {
        return __awaiter(this, void 0, void 0, function () {
            var loop;
            var _this = this;
            return __generator(this, function (_a) {
                loop = function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!this._sync) return [3 /*break*/, 3];
                                return [4 /*yield*/, this.syncIpnsWithDb()];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, this._syncLoop(syncIntervalMs)];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                }); };
                this._syncInterval = setTimeout(loop.bind(this), syncIntervalMs);
                return [2 /*return*/];
            });
        });
    };
    Subplebbit.prototype.start = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:start");
                        if (!((_a = this.signer) === null || _a === void 0 ? void 0 : _a.address))
                            (0, util_1.throwWithErrorCode)("ERR_SUB_SIGNER_NOT_DEFINED", "signer: ".concat(JSON.stringify(this.signer), ", address: ").concat(this.address));
                        return [4 /*yield*/, this.initDbHandlerIfNeeded()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.dbHandler.lockSubStart()];
                    case 2:
                        _b.sent(); // Will throw if sub is locked already
                        this._sync = true;
                        return [4 /*yield*/, this.dbHandler.initDbIfNeeded()];
                    case 3:
                        _b.sent();
                        // Import subplebbit keys onto ipfs node
                        return [4 /*yield*/, this._importSignerIntoIpfsIfNeeded({ ipnsKeyName: this.signer.ipnsKeyName, privateKey: this.signer.privateKey })];
                    case 4:
                        // Import subplebbit keys onto ipfs node
                        _b.sent();
                        if (!this.provideCaptchaCallback) {
                            log("Subplebbit owner has not provided any captcha. Will go with default image captcha");
                            this.provideCaptchaCallback = this.defaultProvideCaptcha;
                            this.validateCaptchaAnswerCallback = this.defaultValidateCaptcha;
                        }
                        if (!(typeof this.pubsubTopic !== "string")) return [3 /*break*/, 6];
                        this.pubsubTopic = lodash_1.default.clone(this.address);
                        log("Defaulted subplebbit (".concat(this.address, ") pubsub topic to ").concat(this.pubsubTopic, " since sub owner hasn't provided any"));
                        return [4 /*yield*/, this._updateDbInternalState(lodash_1.default.pick(this, "pubsubTopic"))];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        if (!(typeof this.createdAt !== "number")) return [3 /*break*/, 8];
                        this.createdAt = (0, util_1.timestamp)();
                        log("Subplebbit (".concat(this.address, ") createdAt has been set to ").concat(this.createdAt));
                        return [4 /*yield*/, this._updateDbInternalState(lodash_1.default.pick(this, "createdAt"))];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [4 /*yield*/, this._listenToIncomingRequests()];
                    case 9:
                        _b.sent();
                        this._subplebbitUpdateTrigger = true;
                        return [4 /*yield*/, this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger })];
                    case 10:
                        _b.sent();
                        this.syncIpnsWithDb()
                            .then(function () { return _this._syncLoop(_this._syncIntervalMs); })
                            .catch(function (reason) {
                            log.error(reason);
                            _this.emit("error", reason);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.delete = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.stop()];
                    case 1:
                        _c.sent();
                        if (typeof this.plebbit.dataPath !== "string")
                            (0, util_1.throwWithErrorCode)("ERR_DATA_PATH_IS_NOT_DEFINED", "delete: plebbitOptions.dataPath=".concat(this.plebbit.dataPath));
                        if (!this.plebbit.ipfsClient)
                            throw Error("Ipfs client is not defined");
                        return [4 /*yield*/, util_3.nativeFunctions.deleteSubplebbit(this.address, this.plebbit.dataPath)];
                    case 2:
                        _c.sent();
                        if (!(typeof ((_a = this.signer) === null || _a === void 0 ? void 0 : _a.ipnsKeyName) === "string")) return [3 /*break*/, 6];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.plebbit.ipfsClient.key.rm(this.signer.ipnsKeyName)];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _b = _c.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return Subplebbit;
}(events_1.default));
exports.Subplebbit = Subplebbit;
