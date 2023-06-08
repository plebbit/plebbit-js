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
var js_sha256_1 = require("js-sha256");
var challenge_1 = require("./challenge");
var sort_handler_1 = require("./sort-handler");
var util_1 = require("./util");
var signer_1 = require("./signer");
var pages_1 = require("./pages");
var safe_stable_stringify_1 = require("safe-stable-stringify");
var ipfs_only_hash_1 = __importDefault(require("ipfs-only-hash"));
var comment_1 = require("./comment");
var post_1 = __importDefault(require("./post"));
var util_2 = require("./signer/util");
var comment_edit_1 = require("./comment-edit");
var errors_1 = require("./errors");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var util_3 = require("./runtime/browser/util");
var version_1 = __importDefault(require("./version"));
var lodash_1 = __importDefault(require("lodash"));
var signatures_1 = require("./signer/signatures");
var constants_1 = require("./constants");
var assert_1 = __importDefault(require("assert"));
var version_2 = __importDefault(require("./version"));
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var plebbit_error_1 = require("./plebbit-error");
var retry_1 = __importDefault(require("retry"));
var client_manager_1 = require("./clients/client-manager");
var cborg = __importStar(require("cborg"));
var encryption_1 = require("./signer/encryption");
var Subplebbit = /** @class */ (function (_super) {
    __extends(Subplebbit, _super);
    function Subplebbit(plebbit) {
        var _this = _super.call(this) || this;
        _this.plebbit = plebbit;
        _this._challengeIdToSolution = {}; // Map challenge ID to its solution
        _this._challengeIdToChallengeRequest = {}; // To hold unpublished posts/comments/votes
        _this._setState("stopped");
        _this._setStartedState("stopped");
        _this._setUpdatingState("stopped");
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
        _this._clientsManager = new client_manager_1.SubplebbitClientsManager(_this);
        _this.clients = _this._clientsManager.clients;
        _this.posts = new pages_1.PostsPages({
            pageCids: undefined,
            pages: undefined,
            plebbit: _this.plebbit,
            subplebbitAddress: undefined,
            pagesIpfs: undefined
        });
        return _this;
    }
    Subplebbit.prototype.initSubplebbit = function (newProps) {
        return __awaiter(this, void 0, void 0, function () {
            var oldProps, mergedProps, parsedPages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        oldProps = this.toJSONInternal();
                        mergedProps = __assign(__assign({}, oldProps), newProps);
                        this.title = mergedProps.title;
                        this.description = mergedProps.description;
                        this.lastPostCid = mergedProps.lastPostCid;
                        this.setAddress(mergedProps.address);
                        this.pubsubTopic = mergedProps.pubsubTopic;
                        this.challengeTypes = mergedProps.challengeTypes;
                        this.statsCid = mergedProps.statsCid;
                        this.createdAt = mergedProps.createdAt;
                        this.updatedAt = mergedProps.updatedAt;
                        this.encryption = mergedProps.encryption;
                        this.roles = mergedProps.roles;
                        this.features = mergedProps.features;
                        this.suggested = mergedProps.suggested;
                        this.rules = mergedProps.rules;
                        this.flairs = mergedProps.flairs;
                        this.signature = mergedProps.signature;
                        this.settings = mergedProps.settings;
                        this._subplebbitUpdateTrigger = mergedProps._subplebbitUpdateTrigger;
                        if (!this.signer && mergedProps.signer)
                            this.signer = new signer_1.Signer(mergedProps.signer);
                        if (!mergedProps.posts) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, util_1.parseRawPages)(mergedProps.posts, this.plebbit)];
                    case 1:
                        parsedPages = _a.sent();
                        this.posts.updateProps(__assign(__assign({}, parsedPages), { plebbit: this.plebbit, subplebbitAddress: this.address, pageCids: mergedProps.posts.pageCids }));
                        return [3 /*break*/, 3];
                    case 2:
                        this.posts.updateProps({
                            plebbit: this.plebbit,
                            subplebbitAddress: this.address,
                            pageCids: undefined,
                            pages: undefined,
                            pagesIpfs: undefined
                        });
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.setAddress = function (newAddress) {
        this.address = newAddress;
        this.shortAddress = (0, util_1.shortifyAddress)(this.address);
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
                            type: "ed25519-aes-gcm",
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
                                dataPath: this.plebbit.dataPath,
                                noData: this.plebbit.noData
                            }
                        });
                        return [4 /*yield*/, this.dbHandler.initDbConfigIfNeeded()];
                    case 1:
                        _a.sent();
                        this.sortHandler = new sort_handler_1.SortHandler(lodash_1.default.pick(this, ["address", "plebbit", "dbHandler", "encryption", "_clientsManager"]));
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
        return __assign(__assign({}, this.toJSON()), { posts: (_a = this.posts) === null || _a === void 0 ? void 0 : _a.toJSON(), signer: this.signer ? lodash_1.default.pick(this.signer, ["privateKey", "type", "address"]) : undefined, _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger, settings: this.settings });
    };
    Subplebbit.prototype.toJSON = function () {
        var _a;
        return __assign(__assign({}, this._toJSONBase()), { posts: (_a = this.posts) === null || _a === void 0 ? void 0 : _a.toJSON(), shortAddress: this.shortAddress });
    };
    Subplebbit.prototype._toJSONBase = function () {
        return {
            title: this.title,
            description: this.description,
            lastPostCid: this.lastPostCid,
            pubsubTopic: this.pubsubTopic,
            address: this.address,
            challengeTypes: this.challengeTypes,
            statsCid: this.statsCid,
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
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.key.list()];
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
            var log;
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
                        return [4 /*yield*/, this.dbHandler.keyvHas(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT])];
                    case 4:
                        if (!_a.sent()) return [3 /*break*/, 6];
                        log("Merging internal subplebbit state from DB and createSubplebbitOptions");
                        return [4 /*yield*/, this._mergeInstanceStateWithDbState({})];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!this.signer)
                            (0, util_1.throwWithErrorCode)("ERR_LOCAL_SUB_HAS_NO_SIGNER_IN_INTERNAL_STATE", { address: this.address });
                        return [4 /*yield*/, this._initSignerProps()];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.keyvHas(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT])];
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
                        return [4 /*yield*/, this.dbHandler.destoryConnection()];
                    case 12:
                        _a.sent(); // Need to destory connection so process wouldn't hang
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.assertDomainResolvesCorrectly = function (domain) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.plebbit.resolver.isDomain(domain)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._clientsManager.resolveSubplebbitAddressIfNeeded(domain)];
                    case 1:
                        resolvedAddress = _a.sent();
                        if (resolvedAddress !== this.signer.address)
                            (0, util_1.throwWithErrorCode)("ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS", {
                                subplebbitAddress: this.address,
                                resolvedAddress: resolvedAddress,
                                signerAddress: this.signer.address
                            });
                        _a.label = 2;
                    case 2: return [2 /*return*/];
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
                        return [4 /*yield*/, this.dbHandler.initDestroyedConnection()];
                    case 1:
                        _a.sent();
                        if (!(newSubplebbitOptions.address && newSubplebbitOptions.address !== this.address)) return [3 /*break*/, 5];
                        this.assertDomainResolvesCorrectly(newSubplebbitOptions.address).catch(function (err) {
                            log.error(err.toString());
                            _this.emit("error", err);
                        });
                        log("Attempting to edit subplebbit.address from ".concat(this.address, " to ").concat(newSubplebbitOptions.address));
                        return [4 /*yield*/, this._updateDbInternalState(lodash_1.default.pick(newSubplebbitOptions, "address"))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.changeDbFilename(newSubplebbitOptions.address, {
                                address: newSubplebbitOptions.address,
                                plebbit: {
                                    dataPath: this.plebbit.dataPath,
                                    noData: this.plebbit.noData
                                }
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._switchDbIfNeeded()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        newSubProps = __assign(__assign({}, lodash_1.default.omit(newSubplebbitOptions, "address")), { _subplebbitUpdateTrigger: true });
                        return [4 /*yield*/, this._updateDbInternalState(newSubProps)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.initSubplebbit(newSubProps)];
                    case 7:
                        _a.sent();
                        log("Subplebbit (".concat(this.address, ") props (").concat(Object.keys(newSubplebbitOptions), ") has been edited"));
                        if (!!this._sync) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.dbHandler.destoryConnection()];
                    case 8:
                        _a.sent(); // Need to destory connection so process wouldn't hang
                        _a.label = 9;
                    case 9: // Need to destory connection so process wouldn't hang
                    return [2 /*return*/, this];
                }
            });
        });
    };
    Subplebbit.prototype._setState = function (newState) {
        this.state = newState;
        this.emit("statechange", this.state);
    };
    Subplebbit.prototype._setUpdatingState = function (newState) {
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    };
    Subplebbit.prototype._setStartedState = function (newState) {
        this.startedState = newState;
        this.emit("startedstatechange", this.startedState);
    };
    Subplebbit.prototype._retryLoadingSubplebbitIpns = function (log, subplebbitIpnsAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        _this._loadingOperation.attempt(function (curAttempt) { return __awaiter(_this, void 0, void 0, function () {
                            var update, e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        log.trace("Retrying to load subplebbit ipns (".concat(subplebbitIpnsAddress, ") for the ").concat(curAttempt, "th time"));
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, this._clientsManager.fetchSubplebbit(subplebbitIpnsAddress)];
                                    case 2:
                                        update = _a.sent();
                                        resolve(update);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        e_1 = _a.sent();
                                        this._setUpdatingState("failed");
                                        log.error(String(e_1));
                                        this.emit("error", e_1);
                                        this._loadingOperation.retry(e_1);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); });
                    })];
            });
        });
    };
    Subplebbit.prototype.updateOnce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, subState, ipnsAddress, subplebbitIpns, updateValidity, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:update");
                        if (!this.dbHandler) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._getDbInternalState(false)];
                    case 1:
                        subState = _a.sent();
                        if (!((0, safe_stable_stringify_1.stringify)(this.toJSONInternal()) !== (0, safe_stable_stringify_1.stringify)(subState))) return [3 /*break*/, 3];
                        log("Local Subplebbit received a new update. Will emit an update event");
                        this._setUpdatingState("succeeded");
                        return [4 /*yield*/, this.initSubplebbit(subState)];
                    case 2:
                        _a.sent();
                        this.emit("update", this);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 11];
                    case 4:
                        this._setUpdatingState("resolving-address");
                        return [4 /*yield*/, this._clientsManager.resolveSubplebbitAddressIfNeeded(this.address)];
                    case 5:
                        ipnsAddress = _a.sent();
                        if (!ipnsAddress)
                            return [2 /*return*/]; // Temporary. Should retry
                        this._loadingOperation = retry_1.default.operation({ forever: true, factor: 2 });
                        return [4 /*yield*/, this._retryLoadingSubplebbitIpns(log, ipnsAddress)];
                    case 6:
                        subplebbitIpns = _a.sent();
                        return [4 /*yield*/, (0, signatures_1.verifySubplebbit)(subplebbitIpns, this.plebbit.resolveAuthorAddresses, this._clientsManager)];
                    case 7:
                        updateValidity = _a.sent();
                        if (!!updateValidity.valid) return [3 /*break*/, 8];
                        this._setUpdatingState("failed");
                        error = new plebbit_error_1.PlebbitError("ERR_SIGNATURE_IS_INVALID", { signatureValidity: updateValidity, subplebbitIpns: subplebbitIpns });
                        this.emit("error", error);
                        return [3 /*break*/, 11];
                    case 8:
                        if (!(this.updatedAt !== subplebbitIpns.updatedAt)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.initSubplebbit(subplebbitIpns)];
                    case 9:
                        _a.sent();
                        this._setUpdatingState("succeeded");
                        log("Remote Subplebbit received a new update. Will emit an update event");
                        this.emit("update", this);
                        return [3 /*break*/, 11];
                    case 10:
                        log.trace("Remote subplebbit received a new update with no new information");
                        this._setUpdatingState("succeeded");
                        _a.label = 11;
                    case 11: return [2 /*return*/];
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
                this._setState("updating");
                updateLoop = (function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        if (this._updateInterval)
                            this.updateOnce().finally(function () { return setTimeout(updateLoop, _this.plebbit.updateInterval); });
                        return [2 /*return*/];
                    });
                }); }).bind(this);
                this.updateOnce().finally(function () { return (_this._updateInterval = setTimeout(updateLoop, _this.plebbit.updateInterval)); });
                return [2 /*return*/];
            });
        });
    };
    Subplebbit.prototype.pubsubTopicWithfallback = function () {
        return this.pubsubTopic || this.address;
    };
    Subplebbit.prototype.stop = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._updateInterval = clearTimeout(this._updateInterval);
                        (_a = this._loadingOperation) === null || _a === void 0 ? void 0 : _a.stop();
                        this._setUpdatingState("stopped");
                        if (!this._sync) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._clientsManager
                                .getDefaultPubsub()
                                ._client.pubsub.unsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.dbHandler.rollbackAllTransactions()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.dbHandler.unlockSubStart()];
                    case 3:
                        _b.sent();
                        this._sync = false;
                        this._syncInterval = clearInterval(this._syncInterval);
                        this._setStartedState("stopped");
                        this._clientsManager.updateIpfsState("stopped");
                        this._clientsManager.updatePubsubState("stopped", undefined);
                        _b.label = 4;
                    case 4:
                        if (!this.dbHandler) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.dbHandler.destoryConnection()];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        this._setState("stopped");
                        return [2 /*return*/];
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
                        return [4 /*yield*/, (0, signatures_1.verifySubplebbit)(ipnsRecord, this.plebbit.resolveAuthorAddresses, this._clientsManager)];
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
            var log, lastPublishTooOld, trx, latestPost, _a, stats, subplebbitPosts, statsCid, updatedAt, newIpns, signature, file, publishRes;
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
                                this.dbHandler.querySubplebbitStats(undefined),
                                this.sortHandler.generateSubplebbitPosts()
                            ])];
                    case 4:
                        _a = _b.sent(), stats = _a[0], subplebbitPosts = _a[1];
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.add((0, safe_stable_stringify_1.stringify)(stats))];
                    case 5:
                        statsCid = (_b.sent()).path;
                        return [4 /*yield*/, this._mergeInstanceStateWithDbState({})];
                    case 6:
                        _b.sent();
                        updatedAt = (0, util_1.timestamp)() === this.updatedAt ? (0, util_1.timestamp)() + 1 : (0, util_1.timestamp)();
                        newIpns = __assign(__assign({}, lodash_1.default.omit(this._toJSONBase(), "signature")), { lastPostCid: latestPost === null || latestPost === void 0 ? void 0 : latestPost.cid, statsCid: statsCid, updatedAt: updatedAt, posts: subplebbitPosts ? { pageCids: subplebbitPosts.pageCids, pages: lodash_1.default.pick(subplebbitPosts.pages, "hot") } : undefined });
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
                        return [4 /*yield*/, this._updateDbInternalState(lodash_1.default.pick(this.toJSONInternal(), ["posts", "lastPostCid", "statsCid", "updatedAt", "signature", "_subplebbitUpdateTrigger"]))];
                    case 10:
                        _b.sent();
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.add((0, safe_stable_stringify_1.stringify)(__assign(__assign({}, newIpns), { signature: signature })))];
                    case 11:
                        file = _b.sent();
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.name.publish(file.path, {
                                key: this.signer.ipnsKeyName,
                                allowOffline: true
                            })];
                    case 12:
                        publishRes = _b.sent();
                        this.emit("update", this);
                        log("Published a new IPNS record for sub(".concat(this.address, ") on IPNS (").concat(publishRes.name, ") that points to file (").concat(publishRes.value, ") with updatedAt (").concat(this.updatedAt, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleCommentEdit = function (commentEditRaw, challengeRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var log, commentEdit, commentToBeEdited, editorAddress, modRole, _i, _a, editField, msg, _b, _c, editField, msg, msg, msg;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleCommentEdit");
                        return [4 /*yield*/, this.plebbit.createCommentEdit(commentEditRaw)];
                    case 1:
                        commentEdit = _d.sent();
                        return [4 /*yield*/, this.dbHandler.queryComment(commentEdit.commentCid, undefined)];
                    case 2:
                        commentToBeEdited = _d.sent();
                        return [4 /*yield*/, (0, util_2.getPlebbitAddressFromPublicKey)(commentEdit.signature.publicKey)];
                    case 3:
                        editorAddress = _d.sent();
                        modRole = this.roles && this.roles[commentEdit.author.address];
                        if (!(commentEdit.signature.publicKey === commentToBeEdited.signature.publicKey)) return [3 /*break*/, 5];
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
                    case 4:
                        _d.sent();
                        log.trace("(".concat(challengeRequestId, "): "), "Updated comment (".concat(commentEdit.commentCid, ") with CommentEdit: "), commentEdit.toJSON());
                        return [3 /*break*/, 8];
                    case 5:
                        if (!modRole) return [3 /*break*/, 7];
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
                    case 6:
                        _d.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        msg = "Editor (non-mod) - (".concat(editorAddress, ") attempted to edit a comment (").concat(commentEdit.commentCid, ") without having original author keys.");
                        log("(".concat(challengeRequestId, "): "), msg);
                        return [2 /*return*/, errors_1.messages.ERR_UNAUTHORIZED_COMMENT_EDIT];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleVote = function (newVoteProps, challengeRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var log, lastVote, msg, newVote;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleVote");
                        return [4 /*yield*/, this.dbHandler.getLastVoteOfAuthor(newVoteProps.commentCid, newVoteProps.author.address)];
                    case 1:
                        lastVote = _a.sent();
                        if (!(lastVote && newVoteProps.signature.publicKey !== lastVote.signature.publicKey)) return [3 /*break*/, 2];
                        msg = "Author (".concat(newVoteProps.author.address, ") attempted to change vote on (").concat(newVoteProps.commentCid, ") without having correct credentials");
                        log("(".concat(challengeRequestId, "): "), msg);
                        return [2 /*return*/, msg];
                    case 2: return [4 /*yield*/, this.plebbit.createVote(newVoteProps)];
                    case 3:
                        newVote = _a.sent();
                        return [4 /*yield*/, this.dbHandler.deleteVote(newVote.author.address, newVote.commentCid)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.insertVote(newVote.toJSONForDb(challengeRequestId))];
                    case 5:
                        _a.sent();
                        log.trace("(".concat(challengeRequestId, "): "), "inserted new vote (".concat(newVote.vote, ") for comment ").concat(newVote.commentCid));
                        _a.label = 6;
                    case 6: return [2 /*return*/];
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
    Subplebbit.prototype.storePublicationIfValid = function (request) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var log, publication, authorModEdits, msg, forbiddenAuthorFields, parentCid, parent_1, parentFlags, isParentDeleted, postFlags, isPostDeleted, forbiddenCommentFields_1, publicationKilobyteSize, ipnsKeyName, commentToInsert, _e, ipfsSigner, _f, _g, _h, _j, trx, _k, _l, file, trx, _m, commentsUnderParent, parent_2, file;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid");
                        publication = request.publication;
                        delete this._challengeIdToSolution[request.challengeRequestId.toString()];
                        delete this._challengeIdToChallengeRequest[request.challengeRequestId.toString()];
                        if (publication["signer"]) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_FORBIDDEN_SIGNER_FIELD);
                            return [2 /*return*/, errors_1.messages.ERR_FORBIDDEN_SIGNER_FIELD];
                        }
                        log.trace("(".concat(request.challengeRequestId, "): "), "Will attempt to store publication if valid, ", publication);
                        if (publication.subplebbitAddress !== this.address) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS);
                            return [2 /*return*/, errors_1.messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS];
                        }
                        if (!((_a = publication === null || publication === void 0 ? void 0 : publication.author) === null || _a === void 0 ? void 0 : _a.address)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.dbHandler.queryAuthorModEdits(publication.author.address)];
                    case 1:
                        authorModEdits = _o.sent();
                        if (typeof authorModEdits.banExpiresAt === "number" && authorModEdits.banExpiresAt > (0, util_1.timestamp)()) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_AUTHOR_IS_BANNED);
                            return [2 /*return*/, errors_1.messages.ERR_AUTHOR_IS_BANNED];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        msg = "Rejecting publication because it doesn't have author.address";
                        log("(".concat(request.challengeRequestId, "): "), msg);
                        return [2 /*return*/, msg];
                    case 3:
                        forbiddenAuthorFields = ["subplebbit", "shortAddress"];
                        if (Object.keys(publication.author).some(function (key) { return forbiddenAuthorFields.includes(key); })) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_FORBIDDEN_AUTHOR_FIELD);
                            return [2 /*return*/, errors_1.messages.ERR_FORBIDDEN_AUTHOR_FIELD];
                        }
                        if (!!this.isPublicationPost(publication)) return [3 /*break*/, 9];
                        parentCid = this.isPublicationReply(publication)
                            ? publication["parentCid"]
                            : this.isPublicationVote(publication) || this.isPublicationCommentEdit(publication)
                                ? publication["commentCid"]
                                : undefined;
                        if (!parentCid) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED];
                        }
                        return [4 /*yield*/, this.dbHandler.queryComment(parentCid)];
                    case 4:
                        parent_1 = _o.sent();
                        if (!parent_1) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST];
                        }
                        return [4 /*yield*/, this.dbHandler.queryCommentFlags(parentCid)];
                    case 5:
                        parentFlags = _o.sent();
                        if (parentFlags.removed && !this.isPublicationCommentEdit(publication)) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED];
                        }
                        return [4 /*yield*/, this.dbHandler.queryAuthorEditDeleted(parentCid)];
                    case 6:
                        isParentDeleted = _o.sent();
                        if (isParentDeleted && !this.isPublicationCommentEdit(publication)) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED];
                        }
                        return [4 /*yield*/, this.dbHandler.queryCommentFlags(parent_1.postCid)];
                    case 7:
                        postFlags = _o.sent();
                        if (postFlags.removed && !this.isPublicationCommentEdit(publication)) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED];
                        }
                        return [4 /*yield*/, this.dbHandler.queryAuthorEditDeleted(parent_1.postCid)];
                    case 8:
                        isPostDeleted = _o.sent();
                        if (isPostDeleted && !this.isPublicationCommentEdit(publication)) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED];
                        }
                        if (postFlags.locked && !this.isPublicationCommentEdit(publication)) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED];
                        }
                        if (parent_1.timestamp > publication.timestamp) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT];
                        }
                        _o.label = 9;
                    case 9:
                        if (!this.isPublicationVote(publication)) return [3 /*break*/, 10];
                        return [2 /*return*/, this.handleVote(publication, request.challengeRequestId)];
                    case 10:
                        if (!this.isPublicationCommentEdit(publication)) return [3 /*break*/, 11];
                        return [2 /*return*/, this.handleCommentEdit(publication, request.challengeRequestId)];
                    case 11:
                        if (!this.isPublicationComment(publication)) return [3 /*break*/, 32];
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
                            "reason",
                            "shortCid"
                        ];
                        if (Object.keys(publication).some(function (key) { return forbiddenCommentFields_1.includes(key); })) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_FORBIDDEN_COMMENT_FIELD);
                            return [2 /*return*/, errors_1.messages.ERR_FORBIDDEN_COMMENT_FIELD];
                        }
                        publicationKilobyteSize = Buffer.byteLength(JSON.stringify(publication)) / 1000;
                        if (publicationKilobyteSize > 40) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_COMMENT_OVER_ALLOWED_SIZE);
                            return [2 /*return*/, errors_1.messages.ERR_COMMENT_OVER_ALLOWED_SIZE];
                        }
                        ipnsKeyName = (0, js_sha256_1.sha256)((0, safe_stable_stringify_1.stringify)(publication));
                        return [4 /*yield*/, this.dbHandler.querySigner(ipnsKeyName)];
                    case 12:
                        if (_o.sent()) {
                            log("(".concat(request.challengeRequestId, "): "), errors_1.messages.ERR_DUPLICATE_COMMENT);
                            return [2 /*return*/, errors_1.messages.ERR_DUPLICATE_COMMENT];
                        }
                        return [4 /*yield*/, this.plebbit.createComment(publication)];
                    case 13:
                        commentToInsert = _o.sent();
                        if (!(commentToInsert.link && ((_b = this.settings) === null || _b === void 0 ? void 0 : _b.fetchThumbnailUrls))) return [3 /*break*/, 15];
                        _e = commentToInsert;
                        return [4 /*yield*/, (0, util_3.getThumbnailUrlOfLink)(commentToInsert.link, this, this.settings.fetchThumbnailUrlsProxyUrl)];
                    case 14:
                        _e.thumbnailUrl = _o.sent();
                        _o.label = 15;
                    case 15: return [4 /*yield*/, this.plebbit.createSigner()];
                    case 16:
                        ipfsSigner = _o.sent();
                        ipfsSigner.ipnsKeyName = ipnsKeyName;
                        return [4 /*yield*/, this.dbHandler.insertSigner(ipfsSigner.toJSONSignersTableRow(), undefined)];
                    case 17:
                        _o.sent();
                        _f = ipfsSigner;
                        _g = Uint8Array.bind;
                        return [4 /*yield*/, (0, util_2.getIpfsKeyFromPrivateKey)(ipfsSigner.privateKey)];
                    case 18:
                        _f.ipfsKey = new (_g.apply(Uint8Array, [void 0, _o.sent()]))();
                        _j = (_h = commentToInsert).setCommentIpnsKey;
                        return [4 /*yield*/, util_3.nativeFunctions.importSignerIntoIpfsNode(ipfsSigner.ipnsKeyName, ipfsSigner.ipfsKey, this.plebbit)];
                    case 19:
                        _j.apply(_h, [_o.sent()]);
                        if (!(commentToInsert instanceof post_1.default)) return [3 /*break*/, 25];
                        return [4 /*yield*/, this.dbHandler.createTransaction(request.challengeRequestId.toString())];
                    case 20:
                        trx = _o.sent();
                        _l = (_k = commentToInsert).setPreviousCid;
                        return [4 /*yield*/, this.dbHandler.queryLatestPostCid(trx)];
                    case 21:
                        _l.apply(_k, [(_c = (_o.sent())) === null || _c === void 0 ? void 0 : _c.cid]);
                        return [4 /*yield*/, this.dbHandler.commitTransaction(request.challengeRequestId.toString())];
                    case 22:
                        _o.sent();
                        commentToInsert.setDepth(0);
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.add((0, safe_stable_stringify_1.stringify)(commentToInsert.toJSONIpfs()))];
                    case 23:
                        file = _o.sent();
                        commentToInsert.setPostCid(file.path);
                        commentToInsert.setCid(file.path);
                        return [4 /*yield*/, this.dbHandler.insertComment(commentToInsert.toJSONCommentsTableRowInsert(request.challengeRequestId))];
                    case 24:
                        _o.sent();
                        log("(".concat(request.challengeRequestId, "): "), "New post with cid ".concat(commentToInsert.cid, " has been inserted into DB"));
                        return [3 /*break*/, 31];
                    case 25:
                        if (!(commentToInsert instanceof comment_1.Comment)) return [3 /*break*/, 31];
                        return [4 /*yield*/, this.dbHandler.createTransaction(request.challengeRequestId.toString())];
                    case 26:
                        trx = _o.sent();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.queryCommentsUnderComment(commentToInsert.parentCid, trx),
                                this.dbHandler.queryComment(commentToInsert.parentCid, trx)
                            ])];
                    case 27:
                        _m = _o.sent(), commentsUnderParent = _m[0], parent_2 = _m[1];
                        return [4 /*yield*/, this.dbHandler.commitTransaction(request.challengeRequestId.toString())];
                    case 28:
                        _o.sent();
                        commentToInsert.setPreviousCid((_d = commentsUnderParent[0]) === null || _d === void 0 ? void 0 : _d.cid);
                        commentToInsert.setDepth(parent_2.depth + 1);
                        commentToInsert.setPostCid(parent_2.postCid);
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.add((0, safe_stable_stringify_1.stringify)(commentToInsert.toJSONIpfs()))];
                    case 29:
                        file = _o.sent();
                        commentToInsert.setCid(file.path);
                        return [4 /*yield*/, this.dbHandler.insertComment(commentToInsert.toJSONCommentsTableRowInsert(request.challengeRequestId))];
                    case 30:
                        _o.sent();
                        log("(".concat(request.challengeRequestId, "): "), "New comment with cid ".concat(commentToInsert.cid, " has been inserted into DB"));
                        _o.label = 31;
                    case 31: return [2 /*return*/, commentToInsert.toJSONAfterChallengeVerification()];
                    case 32: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._decryptOrRespondWithFailure = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var log, decrypted, e_2, toSignMsg, challengeVerification, _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeExchange");
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 6]);
                        return [4 /*yield*/, (0, signer_1.decryptEd25519AesGcmPublicKeyBuffer)(request.type === "CHALLENGEANSWER" ? request.encryptedChallengeAnswers : request.encryptedPublication, this.signer.privateKey, request.signature.publicKey)];
                    case 2:
                        decrypted = _d.sent();
                        if (request.type === "CHALLENGEREQUEST")
                            return [2 /*return*/, __assign(__assign({}, request), { publication: JSON.parse(decrypted) })];
                        else if (request.type === "CHALLENGEANSWER")
                            return [2 /*return*/, __assign(__assign({}, request), { challengeAnswers: JSON.parse(decrypted) })];
                        return [3 /*break*/, 6];
                    case 3:
                        e_2 = _d.sent();
                        log.error("Failed to decrypt request (".concat(request.challengeRequestId, ") due to error"), e_2);
                        toSignMsg = {
                            type: "CHALLENGEVERIFICATION",
                            challengeRequestId: request.challengeRequestId,
                            challengeSuccess: false,
                            reason: errors_1.messages.ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _a = challenge_1.ChallengeVerificationMessage.bind;
                        _b = [__assign({}, toSignMsg)];
                        _c = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignMsg, this.signer)];
                    case 4:
                        challengeVerification = new (_a.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _b.concat([(_c.signature = _d.sent(), _c)]))]))();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                                this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification)
                            ])];
                    case 5:
                        _d.sent();
                        throw e_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._respondWithErrorIfSignatureOfPublicationIsInvalid = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var validity, toSignMsg, challengeVerification, _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.isPublicationComment(request.publication)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, signatures_1.verifyComment)(request.publication, this.plebbit.resolveAuthorAddresses, this._clientsManager, false)];
                    case 1:
                        validity = _d.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!this.isPublicationCommentEdit(request.publication)) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, signatures_1.verifyCommentEdit)(request.publication, this.plebbit.resolveAuthorAddresses, this._clientsManager, false)];
                    case 3:
                        validity = _d.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        if (!this.isPublicationVote(request.publication)) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, signatures_1.verifyVote)(request.publication, this.plebbit.resolveAuthorAddresses, this._clientsManager, false)];
                    case 5:
                        validity = _d.sent();
                        _d.label = 6;
                    case 6:
                        if (!!validity.valid) return [3 /*break*/, 9];
                        toSignMsg = {
                            type: "CHALLENGEVERIFICATION",
                            challengeRequestId: request.challengeRequestId,
                            challengeSuccess: false,
                            reason: validity.reason,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _a = challenge_1.ChallengeVerificationMessage.bind;
                        _b = [__assign({}, toSignMsg)];
                        _c = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignMsg, this.signer)];
                    case 7:
                        challengeVerification = new (_a.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _b.concat([(_c.signature = _d.sent(), _c)]))]))();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                                this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification)
                            ])];
                    case 8:
                        _d.sent();
                        (0, util_1.throwWithErrorCode)((0, util_1.getErrorCodeFromMessage)(validity.reason), { publication: request.publication, validity: validity });
                        _d.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var log, requestSignatureValidation, decryptedRequest, _a, providedChallenges, reasonForSkippingCaptcha, publicationOrReason, encryptedPublication, _b, toSignMsg, challengeVerification, _c, _d, toSignChallenge, challengeMessage, _e, _f, challengeTypes;
            var _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeRequest");
                        if (this._challengeIdToChallengeRequest[request.challengeRequestId.toString()])
                            return [2 /*return*/];
                        return [4 /*yield*/, (0, signatures_1.verifyChallengeRequest)(request, true)];
                    case 1:
                        requestSignatureValidation = _k.sent();
                        if (!requestSignatureValidation.valid)
                            (0, util_1.throwWithErrorCode)((0, util_1.getErrorCodeFromMessage)(requestSignatureValidation.reason), { request: request });
                        return [4 /*yield*/, this._decryptOrRespondWithFailure(request)];
                    case 2:
                        decryptedRequest = _k.sent();
                        return [4 /*yield*/, this.dbHandler.insertChallengeRequest(request.toJSONForDb(), undefined)];
                    case 3:
                        _k.sent();
                        return [4 /*yield*/, this._respondWithErrorIfSignatureOfPublicationIsInvalid(decryptedRequest)];
                    case 4:
                        _k.sent();
                        this._challengeIdToChallengeRequest[decryptedRequest.challengeRequestId.toString()] = decryptedRequest;
                        this.emit("challengerequest", decryptedRequest);
                        return [4 /*yield*/, this.provideCaptchaCallback(decryptedRequest)];
                    case 5:
                        _a = _k.sent(), providedChallenges = _a[0], reasonForSkippingCaptcha = _a[1];
                        log("Received a request to a challenge (".concat(decryptedRequest.challengeRequestId.toString(), ")"));
                        if (!(providedChallenges.length === 0)) return [3 /*break*/, 12];
                        // Subplebbit owner has chosen to skip challenging this user or post
                        log.trace("(".concat(decryptedRequest.challengeRequestId, "): No challenge is required"));
                        return [4 /*yield*/, this.storePublicationIfValid(decryptedRequest)];
                    case 6:
                        publicationOrReason = _k.sent();
                        if (!lodash_1.default.isPlainObject(publicationOrReason)) return [3 /*break*/, 8];
                        return [4 /*yield*/, (0, encryption_1.encryptEd25519AesGcmPublicKeyBuffer)((0, safe_stable_stringify_1.stringify)(publicationOrReason), this.signer.privateKey, request.signature.publicKey)];
                    case 7:
                        _b = _k.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        _b = undefined;
                        _k.label = 9;
                    case 9:
                        encryptedPublication = _b;
                        toSignMsg = {
                            type: "CHALLENGEVERIFICATION",
                            challengeRequestId: request.challengeRequestId,
                            challengeSuccess: typeof publicationOrReason !== "string",
                            reason: typeof publicationOrReason === "string" ? publicationOrReason : reasonForSkippingCaptcha,
                            encryptedPublication: encryptedPublication,
                            challengeErrors: undefined,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _c = challenge_1.ChallengeVerificationMessage.bind;
                        _d = [__assign({}, toSignMsg)];
                        _g = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignMsg, this.signer)];
                    case 10:
                        challengeVerification = new (_c.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _d.concat([(_g.signature = _k.sent(), _g)]))]))();
                        this._clientsManager.updatePubsubState("publishing-challenge-verification", undefined);
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                                this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification)
                            ])];
                    case 11:
                        _k.sent();
                        log("(".concat(decryptedRequest.challengeRequestId, "): "), "Published ".concat(challengeVerification.type, " over pubsub: "), lodash_1.default.omit(toSignMsg, ["encryptedPublication"]));
                        this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
                        this.emit("challengeverification", __assign(__assign({}, challengeVerification), { publication: typeof publicationOrReason === "string" ? undefined : publicationOrReason }));
                        return [3 /*break*/, 16];
                    case 12:
                        _h = {
                            type: "CHALLENGE",
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            userAgent: version_1.default.USER_AGENT,
                            challengeRequestId: request.challengeRequestId
                        };
                        return [4 /*yield*/, (0, encryption_1.encryptEd25519AesGcmPublicKeyBuffer)((0, safe_stable_stringify_1.stringify)(providedChallenges), this.signer.privateKey, request.signature.publicKey)];
                    case 13:
                        toSignChallenge = (_h.encryptedChallenges = _k.sent(),
                            _h.timestamp = (0, util_1.timestamp)(),
                            _h);
                        _e = challenge_1.ChallengeMessage.bind;
                        _f = [__assign({}, toSignChallenge)];
                        _j = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeMessage)(toSignChallenge, this.signer)];
                    case 14:
                        challengeMessage = new (_e.apply(challenge_1.ChallengeMessage, [void 0, __assign.apply(void 0, _f.concat([(_j.signature = _k.sent(), _j)]))]))();
                        this._clientsManager.updatePubsubState("publishing-challenge", undefined);
                        challengeTypes = providedChallenges.map(function (challenge) { return challenge.type; });
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.insertChallenge(challengeMessage.toJSONForDb(challengeTypes), undefined),
                                this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeMessage)
                            ])];
                    case 15:
                        _k.sent();
                        log.trace("(".concat(decryptedRequest.challengeRequestId, "): "), "Published ".concat(challengeMessage.type, " over pubsub: "), lodash_1.default.omit(toSignChallenge, ["encryptedChallenges"]));
                        this._clientsManager.updatePubsubState("waiting-challenge-answers", undefined);
                        this.emit("challengemessage", __assign(__assign({}, challengeMessage), { challenges: providedChallenges }));
                        _k.label = 16;
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeAnswer = function (challengeAnswer) {
        return __awaiter(this, void 0, void 0, function () {
            var log, answerSignatureValidation, decryptedChallengeAnswer, _a, challengeSuccess, challengeErrors, publicationOrReason, encryptedPublication, _b, toSignMsg, challengeVerification, _c, _d, toSignVerification, challengeVerification, _e, _f;
            var _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeAnswer");
                        return [4 /*yield*/, (0, signatures_1.verifyChallengeAnswer)(challengeAnswer, true)];
                    case 1:
                        answerSignatureValidation = _j.sent();
                        if (!answerSignatureValidation.valid)
                            (0, util_1.throwWithErrorCode)((0, util_1.getErrorCodeFromMessage)(answerSignatureValidation.reason), { challengeAnswer: challengeAnswer });
                        return [4 /*yield*/, this._decryptOrRespondWithFailure(challengeAnswer)];
                    case 2:
                        decryptedChallengeAnswer = _j.sent();
                        return [4 /*yield*/, this.dbHandler.insertChallengeAnswer(challengeAnswer.toJSONForDb(decryptedChallengeAnswer.challengeAnswers), undefined)];
                    case 3:
                        _j.sent();
                        this.emit("challengeanswer", decryptedChallengeAnswer);
                        return [4 /*yield*/, this.validateCaptchaAnswerCallback(decryptedChallengeAnswer)];
                    case 4:
                        _a = _j.sent(), challengeSuccess = _a[0], challengeErrors = _a[1];
                        if (!challengeSuccess) return [3 /*break*/, 11];
                        log.trace("(".concat(decryptedChallengeAnswer.challengeRequestId, "): "), "User has been answered correctly");
                        return [4 /*yield*/, this.storePublicationIfValid(this._challengeIdToChallengeRequest[decryptedChallengeAnswer.challengeRequestId.toString()])];
                    case 5:
                        publicationOrReason = _j.sent();
                        if (!lodash_1.default.isPlainObject(publicationOrReason)) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, encryption_1.encryptEd25519AesGcmPublicKeyBuffer)((0, safe_stable_stringify_1.stringify)(publicationOrReason), this.signer.privateKey, challengeAnswer.signature.publicKey)];
                    case 6:
                        _b = _j.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _b = undefined;
                        _j.label = 8;
                    case 8:
                        encryptedPublication = _b;
                        toSignMsg = {
                            type: "CHALLENGEVERIFICATION",
                            challengeRequestId: challengeAnswer.challengeRequestId,
                            challengeSuccess: typeof publicationOrReason !== "string",
                            reason: typeof publicationOrReason === "string" ? publicationOrReason : undefined,
                            encryptedPublication: encryptedPublication,
                            challengeErrors: challengeErrors,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _c = challenge_1.ChallengeVerificationMessage.bind;
                        _d = [__assign({}, toSignMsg)];
                        _g = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignMsg, this.signer)];
                    case 9:
                        challengeVerification = new (_c.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _d.concat([(_g.signature = _j.sent(), _g)]))]))();
                        this._clientsManager.updatePubsubState("publishing-challenge-verification", undefined);
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                                this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification)
                            ])];
                    case 10:
                        _j.sent();
                        log("(".concat(decryptedChallengeAnswer.challengeRequestId, "): "), "Published ".concat(challengeVerification.type, " over pubsub:"), lodash_1.default.omit(toSignMsg, ["encryptedPublication"]));
                        this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
                        this.emit("challengeverification", __assign(__assign({}, challengeVerification), { publication: encryptedPublication ? publicationOrReason : undefined }));
                        return [3 /*break*/, 14];
                    case 11:
                        log.trace("Challenge (".concat(decryptedChallengeAnswer.challengeRequestId, ") has been answered incorrectly"));
                        toSignVerification = {
                            type: "CHALLENGEVERIFICATION",
                            challengeRequestId: challengeAnswer.challengeRequestId,
                            challengeSuccess: challengeSuccess,
                            challengeErrors: challengeErrors,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _e = challenge_1.ChallengeVerificationMessage.bind;
                        _f = [__assign({}, toSignVerification)];
                        _h = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignVerification, this.signer)];
                    case 12:
                        challengeVerification = new (_e.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _f.concat([(_h.signature = _j.sent(), _h)]))]))();
                        this._clientsManager.updatePubsubState("publishing-challenge-verification", undefined);
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.insertChallengeVerification(challengeVerification.toJSONForDb(), undefined),
                                this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification)
                            ])];
                    case 13:
                        _j.sent();
                        log("(".concat(decryptedChallengeAnswer.challengeRequestId, "): "), "Published ".concat(challengeVerification.type, " over pubsub:"), toSignVerification);
                        this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
                        this.emit("challengeverification", __assign({}, challengeVerification));
                        _j.label = 14;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._respondWithErrorToAnswerWithNoRequest = function (answer) {
        return __awaiter(this, void 0, void 0, function () {
            var toSignVerification, challengeVerification, _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        toSignVerification = {
                            type: "CHALLENGEVERIFICATION",
                            challengeRequestId: answer.challengeRequestId,
                            challengeSuccess: false,
                            reason: errors_1.messages.ERR_CHALLENGE_ANSWER_WITH_NO_CHALLENGE_REQUEST,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _a = challenge_1.ChallengeVerificationMessage.bind;
                        _b = [__assign({}, toSignVerification)];
                        _c = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignVerification, this.signer)];
                    case 1:
                        challengeVerification = new (_a.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _b.concat([(_c.signature = _d.sent(), _c)]))]))();
                        return [4 /*yield*/, this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification)];
                    case 2:
                        _d.sent();
                        return [2 /*return*/];
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
                        msgParsed = cborg.decode(pubsubMsg.data);
                        if (!(msgParsed.type === "CHALLENGEREQUEST")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handleChallengeRequest(new challenge_1.ChallengeRequestMessage(msgParsed))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(msgParsed.type === "CHALLENGEANSWER" &&
                            !this._challengeIdToChallengeRequest[msgParsed.challengeRequestId.toString()])) return [3 /*break*/, 5];
                        // Respond with error to answers without challenge request
                        return [4 /*yield*/, this._respondWithErrorToAnswerWithNoRequest(msgParsed)];
                    case 4:
                        // Respond with error to answers without challenge request
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        if (!(msgParsed.type === "CHALLENGEANSWER")) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.handleChallengeAnswer(new challenge_1.ChallengeAnswerMessage(msgParsed))];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 11];
                    case 8:
                        e_3 = _a.sent();
                        e_3.message = "failed process captcha for challenge request id (".concat(msgParsed.challengeRequestId, "): ").concat(e_3.message);
                        log.error("(".concat(msgParsed.challengeRequestId, "): "), String(e_3));
                        if (!msgParsed) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.dbHandler.rollbackTransaction(msgParsed.challengeRequestId.toString())];
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
                        this._challengeIdToSolution[request.challengeRequestId.toString()] = [text];
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
                actualSolution = this._challengeIdToChallengeRequest[answerMessage.challengeRequestId.toString()];
                answerIsCorrect = lodash_1.default.isEqual(answerMessage.challengeAnswers, actualSolution);
                log("(".concat(answerMessage.challengeRequestId, "): "), "Answer's validity: ".concat(answerIsCorrect, ", user's answer: ").concat(answerMessage.challengeAnswers, ", actual solution: ").concat(actualSolution));
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
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.add((0, safe_stable_stringify_1.stringify)(options))];
                    case 3:
                        file = _a.sent();
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.name.publish(file.path, {
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
                        return [4 /*yield*/, (0, signatures_1.verifyCommentUpdate)(simUpdate, this.plebbit.resolveAuthorAddresses, this._clientsManager, this.address, comment)];
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
                        _d.sent(); // TODO Should be removed once signature are working properly
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
                        return [4 /*yield*/, this._clientsManager.getDefaultPubsub()._client.pubsub.ls()];
                    case 1:
                        subscribedTopics = _a.sent();
                        if (!!subscribedTopics.includes(this.pubsubTopicWithfallback())) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._clientsManager.pubsubUnsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange)];
                    case 2:
                        _a.sent(); // Make sure it's not hanging
                        return [4 /*yield*/, this._clientsManager.pubsubSubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange)];
                    case 3:
                        _a.sent();
                        this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
                        log("Waiting for publications on pubsub topic (".concat(this.pubsubTopicWithfallback(), ")"));
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._getDbInternalState = function (lock) {
        if (lock === void 0) { lock = true; }
        return __awaiter(this, void 0, void 0, function () {
            var internalState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!lock) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.dbHandler.lockSubState()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.dbHandler.keyvGet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT])];
                    case 3:
                        internalState = _a.sent();
                        if (!lock) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.dbHandler.unlockSubState()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, internalState];
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
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:_switchDbIfNeeded");
                        return [4 /*yield*/, this._getDbInternalState(false)];
                    case 1:
                        internalState = _a.sent();
                        potentialNewAddresses = lodash_1.default.uniq([internalState.address, this.dbHandler.subAddress(), this.address]);
                        if (!this.dbHandler.isDbInMemory()) return [3 /*break*/, 2];
                        this.setAddress(this.dbHandler.subAddress());
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
                        this._subplebbitUpdateTrigger = true;
                        return [4 /*yield*/, Promise.all(potentialNewAddresses.map(this.dbHandler.unlockSubStart))];
                    case 4:
                        _a.sent();
                        if (!wasSubRunning) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.dbHandler.lockSubStart(newAddress)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        this.setAddress(newAddress);
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
            var log, trx, commentsToUpdate, commentsGroupedByDepth, depthsKeySorted, _i, depthsKeySorted_1, depthKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:_updateCommentsThatNeedToBeUpdated");
                        return [4 /*yield*/, this.dbHandler.createTransaction("_updateCommentsThatNeedToBeUpdated")];
                    case 1:
                        trx = _a.sent();
                        return [4 /*yield*/, this.dbHandler.queryCommentsToBeUpdated(this._ipfsNodeIpnsKeyNames, trx)];
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
    Subplebbit.prototype._repinCommentsIPFSIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, dbCommentsCids, pinnedCids, unpinnedCommentsCids, unpinnedComments, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync");
                        return [4 /*yield*/, this.dbHandler.queryAllCommentsCid()];
                    case 1:
                        dbCommentsCids = _c.sent();
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.pin.ls()];
                    case 2:
                        pinnedCids = (_c.sent()).map(function (cid) { return cid.cid.toString(); });
                        unpinnedCommentsCids = lodash_1.default.difference(dbCommentsCids, pinnedCids);
                        if (unpinnedCommentsCids.length === 0)
                            return [2 /*return*/];
                        log.trace("There are ".concat(unpinnedCommentsCids.length, " comments that need to be repinned"));
                        _b = (_a = Promise).all;
                        return [4 /*yield*/, this.dbHandler.queryCommentsByCids(unpinnedCommentsCids)];
                    case 3: return [4 /*yield*/, _b.apply(_a, [(_c.sent()).map(function (dbRes) { return _this.plebbit.createComment(dbRes); })])];
                    case 4:
                        unpinnedComments = _c.sent();
                        return [4 /*yield*/, Promise.all(unpinnedComments.map(function (comment) { return __awaiter(_this, void 0, void 0, function () {
                                var commentIpfsContent, contentHash;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            commentIpfsContent = (0, safe_stable_stringify_1.stringify)(comment.toJSONIpfs());
                                            return [4 /*yield*/, ipfs_only_hash_1.default.of(commentIpfsContent)];
                                        case 1:
                                            contentHash = _a.sent();
                                            assert_1.default.equal(contentHash, comment.cid);
                                            return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.add(commentIpfsContent, { pin: true })];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 5:
                        _c.sent();
                        log("".concat(unpinnedComments.length, " comments' IPFS have been repinned"));
                        return [2 /*return*/];
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
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, this._mergeInstanceStateWithDbState({})];
                    case 3:
                        _b.sent();
                        _a = this;
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.key.list()];
                    case 4:
                        _a._ipfsNodeIpnsKeyNames = (_b.sent()).map(function (key) { return key.name; });
                        return [4 /*yield*/, this._listenToIncomingRequests()];
                    case 5:
                        _b.sent();
                        this._setStartedState("publishing-ipns");
                        this._clientsManager.updateIpfsState("publishing-ipns");
                        return [4 /*yield*/, Promise.all([this._updateCommentsThatNeedToBeUpdated(), this._repinCommentsIPFSIfNeeded()])];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, this.updateSubplebbitIpnsIfNeeded()];
                    case 7:
                        _b.sent();
                        this._setStartedState("succeeded");
                        this._clientsManager.updateIpfsState("stopped");
                        return [3 /*break*/, 9];
                    case 8:
                        e_4 = _b.sent();
                        this._setStartedState("failed");
                        this._clientsManager.updateIpfsState("stopped");
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
                            (0, util_1.throwWithErrorCode)("ERR_SUB_SIGNER_NOT_DEFINED");
                        if (!this._clientsManager.getDefaultIpfs())
                            (0, util_1.throwWithErrorCode)("ERR_CAN_NOT_RUN_A_SUB_WITH_NO_IPFS_NODE", { ipfsHttpClientOptions: this.plebbit.ipfsHttpClientsOptions });
                        return [4 /*yield*/, this.dbHandler.initDestroyedConnection()];
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
                        this.pubsubTopic = lodash_1.default.clone(this.signer.address);
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
                    case 8:
                        this._subplebbitUpdateTrigger = true;
                        return [4 /*yield*/, this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger })];
                    case 9:
                        _b.sent();
                        this._setState("started");
                        this.syncIpnsWithDb()
                            .then(function () { return _this._syncLoop(_this.plebbit.publishInterval); })
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
            var ipfsClient, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.stop()];
                    case 1:
                        _c.sent();
                        if (typeof this.plebbit.dataPath !== "string")
                            (0, util_1.throwWithErrorCode)("ERR_DATA_PATH_IS_NOT_DEFINED", { plebbitDataPath: this.plebbit.dataPath });
                        ipfsClient = this._clientsManager.getDefaultIpfs();
                        if (!ipfsClient)
                            throw Error("Ipfs client is not defined");
                        return [4 /*yield*/, util_3.nativeFunctions.deleteSubplebbit(this.address, this.plebbit.dataPath)];
                    case 2:
                        _c.sent();
                        if (!(typeof ((_a = this.signer) === null || _a === void 0 ? void 0 : _a.ipnsKeyName) === "string")) return [3 /*break*/, 6];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, ipfsClient._client.key.rm(this.signer.ipnsKeyName)];
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
}(tiny_typed_emitter_1.TypedEmitter));
exports.Subplebbit = Subplebbit;
//# sourceMappingURL=subplebbit.js.map