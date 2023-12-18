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
exports.Subplebbit = void 0;
var challenge_1 = require("../challenge");
var sort_handler_1 = require("./sort-handler");
var util_1 = require("../util");
var signer_1 = require("../signer");
var pages_1 = require("../pages");
var safe_stable_stringify_1 = require("safe-stable-stringify");
var ipfs_only_hash_1 = __importDefault(require("ipfs-only-hash"));
var util_2 = require("../signer/util");
var comment_edit_1 = require("../comment-edit");
var errors_1 = require("../errors");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var util_3 = require("../runtime/node/util");
var version_1 = __importDefault(require("../version"));
var lodash_1 = __importDefault(require("lodash"));
var signatures_1 = require("../signer/signatures");
var constants_1 = require("../constants");
var assert_1 = __importDefault(require("assert"));
var version_2 = __importDefault(require("../version"));
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var plebbit_error_1 = require("../plebbit-error");
var retry_1 = __importDefault(require("retry"));
var client_manager_1 = require("../clients/client-manager");
var cborg = __importStar(require("cborg"));
var encryption_1 = require("../signer/encryption");
var challenges_1 = require("../runtime/node/challenges");
var js_sha256_1 = require("js-sha256");
var lru_cache_1 = __importDefault(require("lru-cache"));
var Subplebbit = /** @class */ (function (_super) {
    __extends(Subplebbit, _super);
    function Subplebbit(plebbit) {
        var _this = _super.call(this) || this;
        _this._cidsToUnPin = [];
        // These caches below will be used to facilitate challenges exchange with authors, they will expire after 10 minutes
        // Most of the time they will be delete and cleaned up automatically
        _this._challengeAnswerPromises = new lru_cache_1.default({
            max: 1000,
            ttl: 600000
        });
        _this._challengeAnswerResolveReject = new lru_cache_1.default({
            max: 1000,
            ttl: 600000
        });
        _this._ongoingChallengeExchanges = new lru_cache_1.default({
            max: 1000,
            ttl: 600000
        }); // Will be a list of challenge request ids
        _this._postUpdatesBuckets = [86400, 604800, 2592000, 3153600000]; // 1 day, 1 week, 1 month, 100 years. Expecting to be sorted from smallest to largest
        _this.plebbit = plebbit;
        _this._setState("stopped");
        _this._setStartedState("stopped");
        _this._setUpdatingState("stopped");
        _this._isSubRunningLocally = false;
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
                        this.lastCommentCid = mergedProps.lastCommentCid;
                        this.setAddress(mergedProps.address);
                        this.pubsubTopic = mergedProps.pubsubTopic;
                        this.challenges = mergedProps.challenges;
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
                        this.postUpdates = mergedProps.postUpdates;
                        this._setStartedState(mergedProps.startedState);
                        if (!this.signer && mergedProps.signer)
                            this.signer = new signer_1.Signer(mergedProps.signer);
                        if (!newProps["posts"]) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, util_1.parseRawPages)(newProps["posts"], this.plebbit)];
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
        if ((0, util_1.doesEnsAddressHaveCapitalLetter)(newAddress))
            throw new plebbit_error_1.PlebbitError("ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newAddress });
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
                            plebbit: lodash_1.default.pick(this.plebbit, ["dataPath", "noData", "_storage"])
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
    Subplebbit.prototype.toJSONInternal = function () {
        var _a;
        return __assign(__assign({}, lodash_1.default.omit(this.toJSON(), ["shortAddress"])), { posts: (_a = this.posts) === null || _a === void 0 ? void 0 : _a.toJSONIpfs(), signer: this.signer ? lodash_1.default.pick(this.signer, ["privateKey", "type", "address"]) : undefined, _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger, settings: this.settings, startedState: this.startedState });
    };
    Subplebbit.prototype.toJSONInternalRpc = function () {
        return __assign({}, lodash_1.default.omit(this.toJSONInternal(), ["signer"]));
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
            lastCommentCid: this.lastCommentCid,
            pubsubTopic: this.pubsubTopic,
            address: this.address,
            challenges: this.challenges,
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
            flairs: this.flairs,
            postUpdates: this.postUpdates
        };
    };
    Subplebbit.prototype.toJSONIpfs = function () {
        var _a;
        return __assign(__assign({}, this._toJSONBase()), { posts: (_a = this.posts) === null || _a === void 0 ? void 0 : _a.toJSONIpfs() });
    };
    Subplebbit.prototype._importSubplebbitSignerIntoIpfsIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ipfsNodeKeys;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.signer)
                            throw Error("subplebbit.signer is not defined");
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.key.list()];
                    case 1:
                        ipfsNodeKeys = _a.sent();
                        if (!!ipfsNodeKeys.find(function (key) { return key.name === _this.signer.ipnsKeyName; })) return [3 /*break*/, 3];
                        return [4 /*yield*/, util_3.nativeFunctions.importSignerIntoIpfsNode(this.signer.ipnsKeyName, this.signer.ipfsKey, {
                                url: this.plebbit.ipfsHttpClientsOptions[0].url,
                                headers: this.plebbit.ipfsHttpClientsOptions[0].headers
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._defaultSettingsOfChallenges = function (log) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!((_a = this.settings) === null || _a === void 0 ? void 0 : _a.challenges)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.edit({
                                settings: {
                                    challenges: [
                                        {
                                            name: "captcha-canvas-v3",
                                            exclude: [{ role: ["moderator", "admin", "owner"], post: false, reply: false, vote: false }]
                                        }
                                    ]
                                }
                            })];
                    case 1:
                        _b.sent();
                        log("Defaulted the challenges of subplebbit (".concat(this.address, ") to captcha-canvas-v3"));
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._createNewLocalSubDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:_createNewLocalSubDb");
                        return [4 /*yield*/, this.initDbHandlerIfNeeded()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.initDbIfNeeded()];
                    case 2:
                        _a.sent();
                        if (!this.signer)
                            (0, util_1.throwWithErrorCode)("ERR_LOCAL_SUB_HAS_NO_SIGNER_IN_INTERNAL_STATE", { address: this.address });
                        return [4 /*yield*/, this._initSignerProps()];
                    case 3:
                        _a.sent();
                        // Default props here
                        return [4 /*yield*/, this._defaultSettingsOfChallenges(log)];
                    case 4:
                        // Default props here
                        _a.sent();
                        if (!this.pubsubTopic)
                            this.pubsubTopic = lodash_1.default.clone(this.signer.address);
                        if (typeof this.createdAt !== "number")
                            this.createdAt = (0, util_1.timestamp)();
                        return [4 /*yield*/, this._updateDbInternalState(this.toJSONInternal())];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.destoryConnection()];
                    case 6:
                        _a.sent(); // Need to destory connection so process wouldn't hang
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._loadLocalSubDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // This function will load the InternalSubplebbit props from the local db and update its props with it
                    return [4 /*yield*/, this.initDbHandlerIfNeeded()];
                    case 1:
                        // This function will load the InternalSubplebbit props from the local db and update its props with it
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.initDbIfNeeded()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._mergeInstanceStateWithDbState({})];
                    case 3:
                        _a.sent(); // Load InternalSubplebbit from DB here
                        if (!this.signer)
                            (0, util_1.throwWithErrorCode)("ERR_LOCAL_SUB_HAS_NO_SIGNER_IN_INTERNAL_STATE", { address: this.address });
                        return [4 /*yield*/, this._initSignerProps()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.destoryConnection()];
                    case 5:
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
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log, optionsParsed, newProps_1, newProps;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:edit");
                        // Right now if a sub owner passes settings.challenges = undefined or null, it will be explicitly changed to []
                        // settings.challenges = [] means sub has no challenges
                        if (newSubplebbitOptions.hasOwnProperty("settings") && newSubplebbitOptions.settings.hasOwnProperty("challenges"))
                            newSubplebbitOptions.settings.challenges =
                                newSubplebbitOptions.settings.challenges === undefined || newSubplebbitOptions.settings.challenges === null
                                    ? []
                                    : newSubplebbitOptions.settings.challenges;
                        if (!this.plebbit.plebbitRpcClient) return [3 /*break*/, 3];
                        optionsParsed = (0, util_1.replaceXWithY)(newSubplebbitOptions, undefined, null);
                        return [4 /*yield*/, this.plebbit.plebbitRpcClient.editSubplebbit(this.address, optionsParsed)];
                    case 1:
                        newProps_1 = _b.sent();
                        return [4 /*yield*/, this.initSubplebbit(newProps_1)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, this];
                    case 3:
                        if (Array.isArray((_a = newSubplebbitOptions === null || newSubplebbitOptions === void 0 ? void 0 : newSubplebbitOptions.settings) === null || _a === void 0 ? void 0 : _a.challenges))
                            newSubplebbitOptions.challenges = newSubplebbitOptions.settings.challenges.map(challenges_1.getSubplebbitChallengeFromSubplebbitChallengeSettings);
                        return [4 /*yield*/, this.dbHandler.initDestroyedConnection()];
                    case 4:
                        _b.sent();
                        this._subplebbitUpdateTrigger = true;
                        newProps = __assign(__assign({}, newSubplebbitOptions), { _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger });
                        if (!(newSubplebbitOptions.address && newSubplebbitOptions.address !== this.address)) return [3 /*break*/, 11];
                        if ((0, util_1.doesEnsAddressHaveCapitalLetter)(newSubplebbitOptions.address))
                            throw new plebbit_error_1.PlebbitError("ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER", { subplebbitAddress: newSubplebbitOptions.address });
                        this.assertDomainResolvesCorrectly(newSubplebbitOptions.address).catch(function (err) {
                            log.error(err.toString());
                            _this.emit("error", err);
                        });
                        log("Attempting to edit subplebbit.address from ".concat(this.address, " to ").concat(newSubplebbitOptions.address));
                        return [4 /*yield*/, this._updateDbInternalState(newProps)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, this.dbHandler.isSubStartLocked()];
                    case 6:
                        if (!!(_b.sent())) return [3 /*break*/, 10];
                        log("will rename the subplebbit db in edit() because the subplebbit is not being ran anywhere else");
                        return [4 /*yield*/, this._movePostUpdatesFolderToNewAddress(this.address, newSubplebbitOptions.address)];
                    case 7:
                        _b.sent();
                        return [4 /*yield*/, this.dbHandler.destoryConnection()];
                    case 8:
                        _b.sent();
                        return [4 /*yield*/, this.dbHandler.changeDbFilename(newSubplebbitOptions.address, {
                                address: newSubplebbitOptions.address,
                                plebbit: lodash_1.default.pick(this.plebbit, ["dataPath", "noData", "_storage"])
                            })];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [3 /*break*/, 14];
                    case 11: return [4 /*yield*/, this._updateDbInternalState(newProps)];
                    case 12:
                        _b.sent();
                        if (!!this._isSubRunningLocally) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.dbHandler.destoryConnection()];
                    case 13:
                        _b.sent(); // Need to destory connection so process wouldn't hang
                        _b.label = 14;
                    case 14: return [4 /*yield*/, this.initSubplebbit(newProps)];
                    case 15:
                        _b.sent();
                        log("Subplebbit (".concat(this.address, ") props (").concat(Object.keys(newProps), ") has been edited"));
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Subplebbit.prototype._setState = function (newState) {
        if (newState === this.state)
            return;
        this.state = newState;
        this.emit("statechange", this.state);
    };
    Subplebbit.prototype._setUpdatingState = function (newState) {
        if (newState === this.updatingState)
            return;
        this.updatingState = newState;
        this.emit("updatingstatechange", this.updatingState);
    };
    Subplebbit.prototype._setStartedState = function (newState) {
        if (newState === this.startedState)
            return;
        this.startedState = newState;
        this.emit("startedstatechange", this.startedState);
    };
    Subplebbit.prototype._setRpcClientState = function (newState) {
        var currentRpcUrl = Object.keys(this.clients.plebbitRpcClients)[0];
        if (newState === this.clients.plebbitRpcClients[currentRpcUrl].state)
            return;
        this.clients.plebbitRpcClients[currentRpcUrl].state = newState;
        this.clients.plebbitRpcClients[currentRpcUrl].emit("statechange", newState);
    };
    Subplebbit.prototype._updateRpcClientStateFromStartedState = function (startedState) {
        var mapper = {
            failed: ["stopped"],
            "publishing-ipns": ["publishing-ipns"],
            stopped: ["stopped"],
            succeeded: ["stopped"]
        };
        mapper[startedState].forEach(this._setRpcClientState.bind(this));
    };
    Subplebbit.prototype._updateRpcClientStateFromUpdatingState = function (updatingState) {
        // We're deriving the the rpc state from updating state
        var mapper = {
            failed: ["stopped"],
            "fetching-ipfs": ["fetching-ipfs"],
            "fetching-ipns": ["fetching-ipns"],
            "resolving-address": ["resolving-subplebbit-address"],
            stopped: ["stopped"],
            succeeded: ["stopped"]
        };
        mapper[updatingState].forEach(this._setRpcClientState.bind(this));
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
            var log, subState, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:update");
                        if (!this.dbHandler) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._getDbInternalState(false)];
                    case 1:
                        subState = _b.sent();
                        if (!((0, safe_stable_stringify_1.stringify)(this.toJSONInternal()) !== (0, safe_stable_stringify_1.stringify)(subState))) return [3 /*break*/, 3];
                        log("Local Subplebbit received a new update. Will emit an update event");
                        this._setUpdatingState("succeeded");
                        return [4 /*yield*/, this.initSubplebbit(subState)];
                    case 2:
                        _b.sent();
                        this._rawSubplebbitType = this.toJSONIpfs();
                        this.emit("update", this);
                        constants_1.subplebbitForPublishingCache.set(subState.address, lodash_1.default.pick(subState, ["encryption", "address", "pubsubTopic"]));
                        _b.label = 3;
                    case 3: return [3 /*break*/, 8];
                    case 4:
                        this._loadingOperation = retry_1.default.operation({ forever: true, factor: 2 });
                        _a = this;
                        return [4 /*yield*/, this._retryLoadingSubplebbitIpns(log, this.address)];
                    case 5:
                        _a._rawSubplebbitType = _b.sent();
                        if (!((this.updatedAt || 0) < this._rawSubplebbitType.updatedAt)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.initSubplebbit(this._rawSubplebbitType)];
                    case 6:
                        _b.sent();
                        log("Remote Subplebbit received a new update. Will emit an update event");
                        this.emit("update", this);
                        constants_1.subplebbitForPublishingCache.set(this._rawSubplebbitType.address, lodash_1.default.pick(this._rawSubplebbitType, ["encryption", "address", "pubsubTopic"]));
                        return [3 /*break*/, 8];
                    case 7:
                        log.trace("Remote subplebbit received a SubplebbitIpfsType with no new information");
                        _b.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, _a, e_2, updateLoop;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.state !== "stopped" || this._updateRpcSubscriptionId || this._startRpcSubscriptionId)
                            return [2 /*return*/]; // No need to do anything if subplebbit is already updating
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:update");
                        if (!this.plebbit.plebbitRpcClient) return [3 /*break*/, 5];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, this.plebbit.plebbitRpcClient.subplebbitUpdate(this.address)];
                    case 2:
                        _a._updateRpcSubscriptionId = _b.sent();
                        this._setState("updating");
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _b.sent();
                        log.error("Failed to receive subplebbitUpdate from RPC due to error", e_2);
                        this._setState("stopped");
                        this._setUpdatingState("failed");
                        throw e_2;
                    case 4:
                        this.plebbit.plebbitRpcClient
                            .getSubscription(this._updateRpcSubscriptionId)
                            .on("update", function (updateProps) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        log("Received new subplebbitUpdate from RPC (".concat(this.plebbit.plebbitRpcClientsOptions[0], ")"));
                                        this._rawSubplebbitType = updateProps.params.result;
                                        return [4 /*yield*/, this.initSubplebbit(this._rawSubplebbitType)];
                                    case 1:
                                        _a.sent();
                                        this.emit("update", this);
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .on("updatingstatechange", function (args) {
                            var newUpdatingState = args.params.result;
                            _this._setUpdatingState(newUpdatingState);
                            _this._updateRpcClientStateFromUpdatingState(newUpdatingState);
                        })
                            .on("error", function (args) { return _this.emit("error", args.params.result); });
                        this.plebbit.plebbitRpcClient.emitAllPendingMessages(this._updateRpcSubscriptionId);
                        return [2 /*return*/];
                    case 5:
                        updateLoop = (function () { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                if (this.state === "updating")
                                    this.updateOnce()
                                        .catch(function (e) { return log.error("Failed to update subplebbit", e); })
                                        .finally(function () { return setTimeout(updateLoop, _this.plebbit.updateInterval); });
                                return [2 /*return*/];
                            });
                        }); }).bind(this);
                        this._setState("updating");
                        this.updateOnce()
                            .catch(function (e) { return log.error("Failed to update subplebbit", e); })
                            .finally(function () { return (_this._updateTimeout = setTimeout(updateLoop, _this.plebbit.updateInterval)); });
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.pubsubTopicWithfallback = function () {
        return this.pubsubTopic || this.address;
    };
    Subplebbit.prototype.stop = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:stop");
                        (_a = this._loadingOperation) === null || _a === void 0 ? void 0 : _a.stop();
                        clearTimeout(this._updateTimeout);
                        this._updateTimeout = undefined;
                        if (!(this.plebbit.plebbitRpcClient && this._updateRpcSubscriptionId)) return [3 /*break*/, 2];
                        // We're updating a remote sub here
                        return [4 /*yield*/, this.plebbit.plebbitRpcClient.unsubscribe(this._updateRpcSubscriptionId)];
                    case 1:
                        // We're updating a remote sub here
                        _b.sent();
                        this._setRpcClientState("stopped");
                        this._updateRpcSubscriptionId = undefined;
                        log.trace("Stopped the update of remote subplebbit (".concat(this.address, ") via RPC"));
                        return [3 /*break*/, 13];
                    case 2:
                        if (!(this.plebbit.plebbitRpcClient && this._startRpcSubscriptionId)) return [3 /*break*/, 5];
                        // Subplebbit is running over RPC
                        return [4 /*yield*/, this.plebbit.plebbitRpcClient.stopSubplebbit(this.address)];
                    case 3:
                        // Subplebbit is running over RPC
                        _b.sent();
                        return [4 /*yield*/, this.plebbit.plebbitRpcClient.unsubscribe(this._startRpcSubscriptionId)];
                    case 4:
                        _b.sent();
                        this._setStartedState("stopped");
                        this._setRpcClientState("stopped");
                        this._startRpcSubscriptionId = undefined;
                        log("Stopped the running of local subplebbit (".concat(this.address, ") via RPC"));
                        return [3 /*break*/, 13];
                    case 5:
                        if (!this._isSubRunningLocally) return [3 /*break*/, 13];
                        // Subplebbit is running locally
                        this._isSubRunningLocally = false;
                        if (!this._publishLoopPromise) return [3 /*break*/, 7];
                        return [4 /*yield*/, this._publishLoopPromise];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [4 /*yield*/, this._clientsManager.pubsubUnsubscribe(this.pubsubTopicWithfallback(), this.handleChallengeExchange)];
                    case 8:
                        _b.sent();
                        this._setStartedState("stopped");
                        return [4 /*yield*/, this._updateDbInternalState({ startedState: this.startedState })];
                    case 9:
                        _b.sent();
                        return [4 /*yield*/, this.dbHandler.rollbackAllTransactions()];
                    case 10:
                        _b.sent();
                        return [4 /*yield*/, this.dbHandler.unlockSubStart()];
                    case 11:
                        _b.sent();
                        this._syncInterval = clearInterval(this._syncInterval);
                        this._clientsManager.updateIpfsState("stopped");
                        this._clientsManager.updatePubsubState("stopped", undefined);
                        return [4 /*yield*/, this.dbHandler.destoryConnection()];
                    case 12:
                        _b.sent();
                        log("Stopped the running of local subplebbit (".concat(this.address, ")"));
                        _b.label = 13;
                    case 13:
                        this._setUpdatingState("stopped");
                        this._setState("stopped");
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._unpinStaleCids = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:unpinStaleCids");
                        this._cidsToUnPin = lodash_1.default.uniq(this._cidsToUnPin);
                        if (!(this._cidsToUnPin.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.all(this._cidsToUnPin.map(function (cid) { return __awaiter(_this, void 0, void 0, function () {
                                var e_3;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.pin.rm(cid)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            e_3 = _a.sent();
                                            log.error("Failed to unpin cid ".concat(cid, " due to error "), e_3);
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a.sent();
                        log("unpinned ".concat(this._cidsToUnPin.length, " stale cids from ipfs node for subplebbit (").concat(this.address, ")"));
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._isCurrentSubplebbitEqualToLatestPublishedRecord = function () {
        var fieldsToOmit = ["posts", "updatedAt"];
        var rawSubplebbitTypeFiltered = lodash_1.default.omit(this._rawSubplebbitType, fieldsToOmit);
        var currentSubplebbitFiltered = lodash_1.default.omit(this.toJSONIpfs(), fieldsToOmit);
        return lodash_1.default.isEqual(rawSubplebbitTypeFiltered, currentSubplebbitFiltered);
    };
    Subplebbit.prototype._calculateNewPostUpdates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var postUpdates, _i, _a, timeBucket, statRes, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        postUpdates = {};
                        _i = 0, _a = this._postUpdatesBuckets;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        timeBucket = _a[_i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this._clientsManager
                                .getDefaultIpfs()
                                ._client.files.stat("/".concat(this.address, "/postUpdates/").concat(timeBucket))];
                    case 3:
                        statRes = _c.sent();
                        if (statRes.blocks !== 0)
                            postUpdates[String(timeBucket)] = String(statRes.cid);
                        return [3 /*break*/, 5];
                    case 4:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        if (Object.keys(postUpdates).length === 0)
                            return [2 /*return*/, undefined];
                        return [2 /*return*/, postUpdates];
                }
            });
        });
    };
    Subplebbit.prototype.updateSubplebbitIpnsIfNeeded = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log, lastPublishTooOld, dbInstance, trx, latestPost, latestComment, _b, stats, subplebbitPosts, newPageCids_1, pageCidsToUnPin, newPostUpdates, statsCid, updatedAt, newIpns, signature, file, ttl, lifetime, publishRes;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync");
                        lastPublishTooOld = this.updatedAt < (0, util_1.timestamp)() - 60 * 15;
                        return [4 /*yield*/, this._getDbInternalState(true)];
                    case 1:
                        dbInstance = _d.sent();
                        this._subplebbitUpdateTrigger =
                            this._subplebbitUpdateTrigger ||
                                dbInstance._subplebbitUpdateTrigger ||
                                !this._isCurrentSubplebbitEqualToLatestPublishedRecord();
                        if (!this._subplebbitUpdateTrigger && !lastPublishTooOld)
                            return [2 /*return*/]; // No reason to update
                        return [4 /*yield*/, this.dbHandler.createTransaction("subplebbit")];
                    case 2:
                        trx = _d.sent();
                        return [4 /*yield*/, this.dbHandler.queryLatestPostCid(trx)];
                    case 3:
                        latestPost = _d.sent();
                        return [4 /*yield*/, this.dbHandler.queryLatestCommentCid(trx)];
                    case 4:
                        latestComment = _d.sent();
                        return [4 /*yield*/, this.dbHandler.commitTransaction("subplebbit")];
                    case 5:
                        _d.sent();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.querySubplebbitStats(undefined),
                                this.sortHandler.generateSubplebbitPosts()
                            ])];
                    case 6:
                        _b = _d.sent(), stats = _b[0], subplebbitPosts = _b[1];
                        if (subplebbitPosts && ((_a = this.posts) === null || _a === void 0 ? void 0 : _a.pageCids)) {
                            newPageCids_1 = lodash_1.default.uniq(Object.values(subplebbitPosts.pageCids));
                            pageCidsToUnPin = lodash_1.default.uniq(Object.values(this.posts.pageCids).filter(function (oldPageCid) { return !newPageCids_1.includes(oldPageCid); }));
                            (_c = this._cidsToUnPin).push.apply(_c, pageCidsToUnPin);
                        }
                        return [4 /*yield*/, this._calculateNewPostUpdates()];
                    case 7:
                        newPostUpdates = _d.sent();
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.add((0, safe_stable_stringify_1.stringify)(stats))];
                    case 8:
                        statsCid = (_d.sent()).path;
                        if (this.statsCid && statsCid !== this.statsCid)
                            this._cidsToUnPin.push(this.statsCid);
                        return [4 /*yield*/, this._mergeInstanceStateWithDbState({})];
                    case 9:
                        _d.sent();
                        updatedAt = (0, util_1.timestamp)() === this.updatedAt ? (0, util_1.timestamp)() + 1 : (0, util_1.timestamp)();
                        newIpns = __assign(__assign({}, lodash_1.default.omit(this._toJSONBase(), "signature")), { lastPostCid: latestPost === null || latestPost === void 0 ? void 0 : latestPost.cid, lastCommentCid: latestComment === null || latestComment === void 0 ? void 0 : latestComment.cid, statsCid: statsCid, updatedAt: updatedAt, posts: subplebbitPosts ? { pageCids: subplebbitPosts.pageCids, pages: lodash_1.default.pick(subplebbitPosts.pages, "hot") } : undefined, postUpdates: newPostUpdates });
                        return [4 /*yield*/, (0, signatures_1.signSubplebbit)(newIpns, this.signer)];
                    case 10:
                        signature = _d.sent();
                        // this._validateLocalSignature(signature, newIpns); // this commented line should be taken out later
                        return [4 /*yield*/, this.initSubplebbit(__assign(__assign({}, newIpns), { signature: signature }))];
                    case 11:
                        // this._validateLocalSignature(signature, newIpns); // this commented line should be taken out later
                        _d.sent();
                        this._subplebbitUpdateTrigger = false;
                        this._rawSubplebbitType = __assign(__assign({}, newIpns), { signature: signature });
                        return [4 /*yield*/, this._updateDbInternalState(lodash_1.default.pick(this.toJSONInternal(), [
                                "posts",
                                "lastPostCid",
                                "lastCommentCid",
                                "statsCid",
                                "updatedAt",
                                "signature",
                                "startedState",
                                "_subplebbitUpdateTrigger",
                                "postUpdates"
                            ]))];
                    case 12:
                        _d.sent();
                        return [4 /*yield*/, this._unpinStaleCids()];
                    case 13:
                        _d.sent();
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.add((0, safe_stable_stringify_1.stringify)(this._rawSubplebbitType))];
                    case 14:
                        file = _d.sent();
                        this._cidsToUnPin = [file.path];
                        ttl = this._isSubRunningLocally ? "".concat(this.plebbit.publishInterval * 3, "ms") : undefined;
                        lifetime = this._isSubRunningLocally ? "".concat(this.plebbit.publishInterval * 1000, "ms") : "24h";
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.name.publish(file.path, {
                                key: this.signer.ipnsKeyName,
                                allowOffline: true,
                                ttl: ttl,
                                lifetime: lifetime
                            })];
                    case 15:
                        publishRes = _d.sent();
                        this.emit("update", this);
                        log("Published a new IPNS record for sub(".concat(this.address, ") on IPNS (").concat(publishRes.name, ") that points to file (").concat(publishRes.value, ") with updatedAt (").concat(this.updatedAt, ")"));
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.storeCommentEdit = function (commentEditRaw, challengeRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var log, commentEdit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleCommentEdit");
                        return [4 /*yield*/, this.plebbit.createCommentEdit(commentEditRaw)];
                    case 1:
                        commentEdit = _a.sent();
                        return [4 /*yield*/, this.dbHandler.insertEdit(commentEdit.toJSONForDb())];
                    case 2:
                        _a.sent();
                        log.trace("(".concat(challengeRequestId, "): "), "Updated comment (".concat(commentEdit.commentCid, ") with CommentEdit: "), commentEditRaw);
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.storeVote = function (newVoteProps, challengeRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var log, newVote;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleVote");
                        return [4 /*yield*/, this.plebbit.createVote(newVoteProps)];
                    case 1:
                        newVote = _a.sent();
                        return [4 /*yield*/, this.dbHandler.deleteVote(newVote.author.address, newVote.commentCid)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.insertVote(newVote.toJSONForDb())];
                    case 3:
                        _a.sent();
                        log.trace("(".concat(challengeRequestId.toString(), "): "), "inserted new vote (".concat(newVote.vote, ") for comment ").concat(newVote.commentCid));
                        return [2 /*return*/, undefined];
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
    Subplebbit.prototype.storePublication = function (request) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var log, publication, publicationHash, commentToInsert, thumbnailInfo, trx, _d, _e, file, trxForInsert, trx, _f, commentsUnderParent, parent_1, file, trxForInsert;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid");
                        publication = request.publication;
                        publicationHash = (0, js_sha256_1.sha256)((0, safe_stable_stringify_1.stringify)(publication));
                        if (!this.isPublicationVote(publication)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.storeVote(publication, request.challengeRequestId)];
                    case 1:
                        if (!this.isPublicationCommentEdit(publication)) return [3 /*break*/, 2];
                        return [2 /*return*/, this.storeCommentEdit(publication, request.challengeRequestId)];
                    case 2: return [4 /*yield*/, this.plebbit.createComment(publication)];
                    case 3:
                        commentToInsert = _g.sent();
                        if (!(commentToInsert.link && ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.fetchThumbnailUrls))) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, util_3.getThumbnailUrlOfLink)(commentToInsert.link, this, this.settings.fetchThumbnailUrlsProxyUrl)];
                    case 4:
                        thumbnailInfo = _g.sent();
                        if (thumbnailInfo) {
                            commentToInsert.thumbnailUrl = thumbnailInfo.thumbnailUrl;
                            commentToInsert.thumbnailUrlWidth = thumbnailInfo.thumbnailWidth;
                            commentToInsert.thumbnailUrlHeight = thumbnailInfo.thumbnailHeight;
                        }
                        _g.label = 5;
                    case 5:
                        if (!this.isPublicationPost(commentToInsert)) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.dbHandler.createTransaction(request.challengeRequestId.toString())];
                    case 6:
                        trx = _g.sent();
                        _e = (_d = commentToInsert).setPreviousCid;
                        return [4 /*yield*/, this.dbHandler.queryLatestPostCid(trx)];
                    case 7:
                        _e.apply(_d, [(_b = (_g.sent())) === null || _b === void 0 ? void 0 : _b.cid]);
                        return [4 /*yield*/, this.dbHandler.commitTransaction(request.challengeRequestId.toString())];
                    case 8:
                        _g.sent();
                        commentToInsert.setDepth(0);
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.add((0, safe_stable_stringify_1.stringify)(commentToInsert.toJSONIpfs()))];
                    case 9:
                        file = _g.sent();
                        commentToInsert.setPostCid(file.path);
                        commentToInsert.setCid(file.path);
                        return [4 /*yield*/, this.dbHandler.createTransaction(request.challengeRequestId.toString())];
                    case 10:
                        trxForInsert = _g.sent();
                        return [4 /*yield*/, this.dbHandler.insertComment(commentToInsert.toJSONCommentsTableRowInsert(publicationHash), trxForInsert)];
                    case 11:
                        _g.sent();
                        return [4 /*yield*/, this.dbHandler.commitTransaction(request.challengeRequestId.toString())];
                    case 12:
                        _g.sent();
                        log("(".concat(request.challengeRequestId.toString(), "): "), "New post with cid ".concat(commentToInsert.cid, " has been inserted into DB"));
                        return [3 /*break*/, 21];
                    case 13: return [4 /*yield*/, this.dbHandler.createTransaction(request.challengeRequestId.toString())];
                    case 14:
                        trx = _g.sent();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.queryCommentsUnderComment(commentToInsert.parentCid, trx),
                                this.dbHandler.queryComment(commentToInsert.parentCid, trx)
                            ])];
                    case 15:
                        _f = _g.sent(), commentsUnderParent = _f[0], parent_1 = _f[1];
                        return [4 /*yield*/, this.dbHandler.commitTransaction(request.challengeRequestId.toString())];
                    case 16:
                        _g.sent();
                        commentToInsert.setPreviousCid((_c = commentsUnderParent[0]) === null || _c === void 0 ? void 0 : _c.cid);
                        commentToInsert.setDepth(parent_1.depth + 1);
                        commentToInsert.setPostCid(parent_1.postCid);
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.add((0, safe_stable_stringify_1.stringify)(commentToInsert.toJSONIpfs()))];
                    case 17:
                        file = _g.sent();
                        commentToInsert.setCid(file.path);
                        return [4 /*yield*/, this.dbHandler.createTransaction(request.challengeRequestId.toString())];
                    case 18:
                        trxForInsert = _g.sent();
                        return [4 /*yield*/, this.dbHandler.insertComment(commentToInsert.toJSONCommentsTableRowInsert(publicationHash), trxForInsert)];
                    case 19:
                        _g.sent();
                        return [4 /*yield*/, this.dbHandler.commitTransaction(request.challengeRequestId.toString())];
                    case 20:
                        _g.sent();
                        log("(".concat(request.challengeRequestId.toString(), "): "), "New comment with cid ".concat(commentToInsert.cid, " has been inserted into DB"));
                        _g.label = 21;
                    case 21: return [2 /*return*/, commentToInsert.toJSONAfterChallengeVerification()];
                }
            });
        });
    };
    Subplebbit.prototype._decryptOrRespondWithFailure = function (request) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var log, decrypted, _c, _d, e_4;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeExchange");
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 6]);
                        _d = (_c = JSON).parse;
                        return [4 /*yield*/, (0, signer_1.decryptEd25519AesGcmPublicKeyBuffer)(request.encrypted, this.signer.privateKey, request.signature.publicKey)];
                    case 2:
                        decrypted = _d.apply(_c, [_e.sent()]);
                        if (request.type === "CHALLENGEREQUEST")
                            return [2 /*return*/, __assign(__assign({}, request), decrypted)];
                        else if (request.type === "CHALLENGEANSWER")
                            return [2 /*return*/, __assign(__assign({}, request), decrypted)];
                        return [3 /*break*/, 6];
                    case 3:
                        e_4 = _e.sent();
                        log.error("Failed to decrypt request (".concat((_a = request === null || request === void 0 ? void 0 : request.challengeRequestId) === null || _a === void 0 ? void 0 : _a.toString(), ") due to error"), e_4);
                        if (!((_b = request === null || request === void 0 ? void 0 : request.challengeRequestId) === null || _b === void 0 ? void 0 : _b.toString())) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._publishFailedChallengeVerification({ reason: errors_1.messages.ERR_SUB_FAILED_TO_DECRYPT_PUBSUB_MSG }, request.challengeRequestId)];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5: throw e_4;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._respondWithErrorIfSignatureOfPublicationIsInvalid = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var validity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isPublicationComment(request.publication)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, signatures_1.verifyComment)(request.publication, this.plebbit.resolveAuthorAddresses, this._clientsManager, false)];
                    case 1:
                        validity = _a.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!this.isPublicationCommentEdit(request.publication)) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, signatures_1.verifyCommentEdit)(request.publication, this.plebbit.resolveAuthorAddresses, this._clientsManager, false)];
                    case 3:
                        validity = _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        if (!this.isPublicationVote(request.publication)) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, signatures_1.verifyVote)(request.publication, this.plebbit.resolveAuthorAddresses, this._clientsManager, false)];
                    case 5:
                        validity = _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!!validity.valid) return [3 /*break*/, 8];
                        return [4 /*yield*/, this._publishFailedChallengeVerification({ reason: validity.reason }, request.challengeRequestId)];
                    case 7:
                        _a.sent();
                        (0, util_1.throwWithErrorCode)((0, util_1.getErrorCodeFromMessage)(validity.reason), { publication: request.publication, validity: validity });
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._publishChallenges = function (challenges, request) {
        return __awaiter(this, void 0, void 0, function () {
            var log, toEncryptChallenge, toSignChallenge, challengeMessage, _a, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:_publishChallenges");
                        toEncryptChallenge = { challenges: challenges };
                        _c = {
                            type: "CHALLENGE",
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            userAgent: version_1.default.USER_AGENT,
                            challengeRequestId: request.challengeRequestId
                        };
                        return [4 /*yield*/, (0, encryption_1.encryptEd25519AesGcmPublicKeyBuffer)((0, safe_stable_stringify_1.stringify)(toEncryptChallenge), this.signer.privateKey, request.signature.publicKey)];
                    case 1:
                        toSignChallenge = (_c.encrypted = _e.sent(),
                            _c.timestamp = (0, util_1.timestamp)(),
                            _c);
                        _a = challenge_1.ChallengeMessage.bind;
                        _b = [__assign({}, toSignChallenge)];
                        _d = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeMessage)(toSignChallenge, this.signer)];
                    case 2:
                        challengeMessage = new (_a.apply(challenge_1.ChallengeMessage, [void 0, __assign.apply(void 0, _b.concat([(_d.signature = _e.sent(), _d)]))]))();
                        this._clientsManager.updatePubsubState("publishing-challenge", undefined);
                        return [4 /*yield*/, this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeMessage)];
                    case 3:
                        _e.sent();
                        log.trace("(".concat(request.challengeRequestId.toString(), "): "), "Published ".concat(challengeMessage.type, " over pubsub: "), (0, util_1.removeNullAndUndefinedValuesRecursively)(lodash_1.default.omit(toSignChallenge, ["encrypted"])));
                        this._clientsManager.updatePubsubState("waiting-challenge-answers", undefined);
                        this.emit("challenge", __assign(__assign({}, challengeMessage), { challenges: challenges }));
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._publishFailedChallengeVerification = function (result, challengeRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var log, toSignVerification, challengeVerification, _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:_publishFailedChallengeVerification");
                        toSignVerification = {
                            type: "CHALLENGEVERIFICATION",
                            challengeRequestId: challengeRequestId,
                            challengeSuccess: false,
                            challengeErrors: result.challengeErrors,
                            reason: result.reason,
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
                        this._clientsManager.updatePubsubState("publishing-challenge-verification", undefined);
                        log("(".concat(challengeRequestId, "): "), "Will publish ".concat(challengeVerification.type, " over pubsub:"), toSignVerification);
                        return [4 /*yield*/, this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification)];
                    case 2:
                        _d.sent();
                        this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
                        this.emit("challengeverification", __assign(__assign({}, challengeVerification), { publication: undefined }));
                        this._ongoingChallengeExchanges.delete(challengeRequestId.toString());
                        this._cleanUpChallengeAnswerPromise(challengeRequestId.toString());
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._publishChallengeVerification = function (challengeResult, request) {
        return __awaiter(this, void 0, void 0, function () {
            var log, publication, _a, encrypted, _b, toSignMsg, challengeVerification, _c, _d, objectToEmit;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:_publishChallengeVerification");
                        if (!!challengeResult.challengeSuccess) return [3 /*break*/, 1];
                        return [2 /*return*/, this._publishFailedChallengeVerification(challengeResult, request.challengeRequestId)];
                    case 1:
                        // Challenge has passed, we store the publication (except if there's an issue with the publication)
                        log.trace("(".concat(request.challengeRequestId.toString(), "): "), "User has been answered correctly");
                        return [4 /*yield*/, this.storePublication(request)];
                    case 2:
                        publication = _f.sent();
                        if (!lodash_1.default.isPlainObject(publication)) return [3 /*break*/, 4];
                        _a = publication.author;
                        return [4 /*yield*/, this.dbHandler.querySubplebbitAuthor(publication.author.address)];
                    case 3:
                        _a.subplebbit = _f.sent();
                        _f.label = 4;
                    case 4:
                        if (!lodash_1.default.isPlainObject(publication)) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, encryption_1.encryptEd25519AesGcmPublicKeyBuffer)((0, safe_stable_stringify_1.stringify)({ publication: publication }), this.signer.privateKey, request.signature.publicKey)];
                    case 5:
                        _b = _f.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _b = undefined;
                        _f.label = 7;
                    case 7:
                        encrypted = _b;
                        toSignMsg = {
                            type: "CHALLENGEVERIFICATION",
                            challengeRequestId: request.challengeRequestId,
                            challengeSuccess: true,
                            reason: undefined,
                            encrypted: encrypted,
                            challengeErrors: challengeResult.challengeErrors,
                            userAgent: version_1.default.USER_AGENT,
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            timestamp: (0, util_1.timestamp)()
                        };
                        _c = challenge_1.ChallengeVerificationMessage.bind;
                        _d = [__assign({}, toSignMsg)];
                        _e = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignMsg, this.signer)];
                    case 8:
                        challengeVerification = new (_c.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _d.concat([(_e.signature = _f.sent(), _e)]))]))();
                        this._clientsManager.updatePubsubState("publishing-challenge-verification", undefined);
                        return [4 /*yield*/, this._clientsManager.pubsubPublish(this.pubsubTopicWithfallback(), challengeVerification)];
                    case 9:
                        _f.sent();
                        this._clientsManager.updatePubsubState("waiting-challenge-requests", undefined);
                        objectToEmit = __assign(__assign({}, challengeVerification), { publication: publication });
                        this.emit("challengeverification", objectToEmit);
                        this._ongoingChallengeExchanges.delete(request.challengeRequestId.toString());
                        this._cleanUpChallengeAnswerPromise(request.challengeRequestId.toString());
                        log("(".concat(request.challengeRequestId.toString(), "): "), "Published ".concat(challengeVerification.type, " over pubsub:"), (0, util_1.removeNullAndUndefinedValuesRecursively)(lodash_1.default.omit(objectToEmit, ["encrypted", "signature"])));
                        _f.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._checkPublicationValidity = function (request) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var log, publication, forbiddenAuthorFields, parentCid, parent_2, parentFlags, isParentDeleted, postFlags, isPostDeleted, publicationKilobyteSize, forbiddenCommentFields_1, publicationHash, publicationInDb, lastVote, commentEdit, commentToBeEdited, editSignedByOriginalAuthor, editorModRole, allowedEditFields, _i, _c, editField;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeRequest:checkPublicationValidity");
                        publication = lodash_1.default.cloneDeep(request.publication);
                        if (publication["signer"])
                            return [2 /*return*/, errors_1.messages.ERR_FORBIDDEN_SIGNER_FIELD];
                        if (publication.subplebbitAddress !== this.address)
                            return [2 /*return*/, errors_1.messages.ERR_PUBLICATION_INVALID_SUBPLEBBIT_ADDRESS];
                        if (typeof ((_b = (_a = publication === null || publication === void 0 ? void 0 : publication.author) === null || _a === void 0 ? void 0 : _a.subplebbit) === null || _b === void 0 ? void 0 : _b.banExpiresAt) === "number" && publication.author.subplebbit.banExpiresAt > (0, util_1.timestamp)())
                            return [2 /*return*/, errors_1.messages.ERR_AUTHOR_IS_BANNED];
                        delete publication.author.subplebbit; // author.subplebbit is generated by the sub so we need to remove it
                        forbiddenAuthorFields = ["shortAddress"];
                        if (Object.keys(publication.author).some(function (key) { return forbiddenAuthorFields.includes(key); }))
                            return [2 /*return*/, errors_1.messages.ERR_FORBIDDEN_AUTHOR_FIELD];
                        if (!!this.isPublicationPost(publication)) return [3 /*break*/, 6];
                        parentCid = this.isPublicationReply(publication)
                            ? publication["parentCid"]
                            : this.isPublicationVote(publication) || this.isPublicationCommentEdit(publication)
                                ? publication["commentCid"]
                                : undefined;
                        if (!parentCid)
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED];
                        return [4 /*yield*/, this.dbHandler.queryComment(parentCid)];
                    case 1:
                        parent_2 = _d.sent();
                        if (!parent_2)
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST];
                        return [4 /*yield*/, this.dbHandler.queryCommentFlags(parentCid)];
                    case 2:
                        parentFlags = _d.sent();
                        if (parentFlags.removed && !this.isPublicationCommentEdit(publication))
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_REMOVED];
                        return [4 /*yield*/, this.dbHandler.queryAuthorEditDeleted(parentCid)];
                    case 3:
                        isParentDeleted = _d.sent();
                        if (isParentDeleted && !this.isPublicationCommentEdit(publication))
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_PARENT_HAS_BEEN_DELETED];
                        return [4 /*yield*/, this.dbHandler.queryCommentFlags(parent_2.postCid)];
                    case 4:
                        postFlags = _d.sent();
                        if (postFlags.removed && !this.isPublicationCommentEdit(publication))
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_REMOVED];
                        return [4 /*yield*/, this.dbHandler.queryAuthorEditDeleted(parent_2.postCid)];
                    case 5:
                        isPostDeleted = _d.sent();
                        if (isPostDeleted && !this.isPublicationCommentEdit(publication))
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_POST_HAS_BEEN_DELETED];
                        if (postFlags.locked && !this.isPublicationCommentEdit(publication))
                            return [2 /*return*/, errors_1.messages.ERR_SUB_PUBLICATION_POST_IS_LOCKED];
                        if (parent_2.timestamp > publication.timestamp)
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT];
                        _d.label = 6;
                    case 6:
                        publicationKilobyteSize = Buffer.byteLength(JSON.stringify(publication)) / 1000;
                        if (publicationKilobyteSize > 40)
                            return [2 /*return*/, errors_1.messages.ERR_COMMENT_OVER_ALLOWED_SIZE];
                        if (!this.isPublicationComment(publication)) return [3 /*break*/, 8];
                        forbiddenCommentFields_1 = [
                            "cid",
                            "signer",
                            "previousCid",
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
                        if (Object.keys(publication).some(function (key) { return forbiddenCommentFields_1.includes(key); }))
                            return [2 /*return*/, errors_1.messages.ERR_FORBIDDEN_COMMENT_FIELD];
                        publicationHash = (0, js_sha256_1.sha256)((0, safe_stable_stringify_1.stringify)(publication));
                        return [4 /*yield*/, this.dbHandler.queryCommentByRequestPublicationHash(publicationHash)];
                    case 7:
                        publicationInDb = _d.sent();
                        if (publicationInDb)
                            return [2 /*return*/, errors_1.messages.ERR_DUPLICATE_COMMENT];
                        if (lodash_1.default.isString(publication["link"]) && publication["link"].length > 2000)
                            return [2 /*return*/, errors_1.messages.COMMENT_LINK_LENGTH_IS_OVER_LIMIT];
                        _d.label = 8;
                    case 8:
                        if (!this.isPublicationVote(request.publication)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.dbHandler.getLastVoteOfAuthor(request.publication["commentCid"], request.publication.author.address)];
                    case 9:
                        lastVote = _d.sent();
                        if (lastVote && request.publication.signature.publicKey !== lastVote.signature.publicKey)
                            return [2 /*return*/, errors_1.messages.UNAUTHORIZED_AUTHOR_ATTEMPTED_TO_CHANGE_VOTE];
                        _d.label = 10;
                    case 10:
                        if (!this.isPublicationCommentEdit(request.publication)) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.plebbit.createCommentEdit(request.publication)];
                    case 11:
                        commentEdit = _d.sent();
                        return [4 /*yield*/, this.dbHandler.queryComment(commentEdit.commentCid, undefined)];
                    case 12:
                        commentToBeEdited = _d.sent();
                        editSignedByOriginalAuthor = commentEdit.signature.publicKey === commentToBeEdited.signature.publicKey;
                        editorModRole = this.roles && this.roles[commentEdit.author.address];
                        allowedEditFields = editSignedByOriginalAuthor && editorModRole
                            ? __spreadArray(__spreadArray([], comment_edit_1.AUTHOR_EDIT_FIELDS, true), comment_edit_1.MOD_EDIT_FIELDS, true) : editSignedByOriginalAuthor
                            ? comment_edit_1.AUTHOR_EDIT_FIELDS
                            : editorModRole
                                ? comment_edit_1.MOD_EDIT_FIELDS
                                : undefined;
                        if (!allowedEditFields)
                            return [2 /*return*/, errors_1.messages.ERR_UNAUTHORIZED_COMMENT_EDIT];
                        for (_i = 0, _c = Object.keys((0, util_1.removeKeysWithUndefinedValues)(request.publication)); _i < _c.length; _i++) {
                            editField = _c[_i];
                            if (!allowedEditFields.includes(editField))
                                return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_EDIT_UNAUTHORIZED_FIELD];
                        }
                        if (editorModRole && typeof commentEdit.locked === "boolean" && commentToBeEdited.depth !== 0)
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_EDIT_CAN_NOT_LOCK_REPLY];
                        _d.label = 13;
                    case 13: return [2 /*return*/, undefined];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeRequest = function (request) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var log, requestSignatureValidation, decryptedRequest, decryptedRequestWithSubplebbitAuthor, e_5, _e, _f, publicationInvalidityReason, answerPromiseKey, getChallengeAnswers, challengeVerification, e_6;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeRequest");
                        if (this._ongoingChallengeExchanges.has(request.challengeRequestId.toString()))
                            return [2 /*return*/]; // This is a duplicate challenge request
                        this._ongoingChallengeExchanges.set(request.challengeRequestId.toString(), true);
                        return [4 /*yield*/, (0, signatures_1.verifyChallengeRequest)(request, true)];
                    case 1:
                        requestSignatureValidation = _g.sent();
                        if (!requestSignatureValidation.valid)
                            (0, util_1.throwWithErrorCode)((0, util_1.getErrorCodeFromMessage)(requestSignatureValidation.reason), {
                                challengeRequest: lodash_1.default.omit(request, ["encrypted"])
                            });
                        return [4 /*yield*/, this._decryptOrRespondWithFailure(request)];
                    case 2:
                        decryptedRequest = _g.sent();
                        if (typeof ((_b = (_a = decryptedRequest === null || decryptedRequest === void 0 ? void 0 : decryptedRequest.publication) === null || _a === void 0 ? void 0 : _a.author) === null || _b === void 0 ? void 0 : _b.address) !== "string")
                            return [2 /*return*/, this._publishFailedChallengeVerification({ reason: errors_1.messages.ERR_AUTHOR_ADDRESS_UNDEFINED }, decryptedRequest.challengeRequestId)];
                        if ((_d = (_c = decryptedRequest === null || decryptedRequest === void 0 ? void 0 : decryptedRequest.publication) === null || _c === void 0 ? void 0 : _c.author) === null || _d === void 0 ? void 0 : _d["subplebbit"])
                            return [2 /*return*/, this._publishFailedChallengeVerification({ reason: errors_1.messages.ERR_FORBIDDEN_AUTHOR_FIELD }, decryptedRequest.challengeRequestId)];
                        decryptedRequestWithSubplebbitAuthor = decryptedRequest;
                        _g.label = 3;
                    case 3:
                        _g.trys.push([3, 5, , 7]);
                        return [4 /*yield*/, this._respondWithErrorIfSignatureOfPublicationIsInvalid(decryptedRequest)];
                    case 4:
                        _g.sent(); // This function will throw an error if signature is invalid
                        return [3 /*break*/, 7];
                    case 5:
                        e_5 = _g.sent();
                        _e = decryptedRequestWithSubplebbitAuthor.publication.author;
                        return [4 /*yield*/, this.dbHandler.querySubplebbitAuthor(decryptedRequest.publication.author.address)];
                    case 6:
                        _e.subplebbit = _g.sent();
                        this.emit("challengerequest", decryptedRequestWithSubplebbitAuthor);
                        return [2 /*return*/];
                    case 7:
                        _f = decryptedRequestWithSubplebbitAuthor.publication.author;
                        return [4 /*yield*/, this.dbHandler.querySubplebbitAuthor(decryptedRequest.publication.author.address)];
                    case 8:
                        _f.subplebbit = _g.sent();
                        this.emit("challengerequest", decryptedRequestWithSubplebbitAuthor);
                        return [4 /*yield*/, this._checkPublicationValidity(decryptedRequestWithSubplebbitAuthor)];
                    case 9:
                        publicationInvalidityReason = _g.sent();
                        if (publicationInvalidityReason)
                            return [2 /*return*/, this._publishFailedChallengeVerification({ reason: publicationInvalidityReason }, request.challengeRequestId)];
                        answerPromiseKey = decryptedRequestWithSubplebbitAuthor.challengeRequestId.toString();
                        getChallengeAnswers = function (challenges) { return __awaiter(_this, void 0, void 0, function () {
                            var challengeAnswers;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: 
                                    // ...get challenge answers from user. e.g.:
                                    // step 1. subplebbit publishes challenge pubsub message with `challenges` provided in argument of `getChallengeAnswers`
                                    // step 2. subplebbit waits for challenge answer pubsub message with `challengeAnswers` and then returns `challengeAnswers`
                                    return [4 /*yield*/, this._publishChallenges(challenges, decryptedRequestWithSubplebbitAuthor)];
                                    case 1:
                                        // ...get challenge answers from user. e.g.:
                                        // step 1. subplebbit publishes challenge pubsub message with `challenges` provided in argument of `getChallengeAnswers`
                                        // step 2. subplebbit waits for challenge answer pubsub message with `challengeAnswers` and then returns `challengeAnswers`
                                        _a.sent();
                                        this._challengeAnswerPromises.set(answerPromiseKey, new Promise(function (resolve, reject) { return _this._challengeAnswerResolveReject.set(answerPromiseKey, { resolve: resolve, reject: reject }); }));
                                        return [4 /*yield*/, this._challengeAnswerPromises.get(answerPromiseKey)];
                                    case 2:
                                        challengeAnswers = _a.sent();
                                        this._cleanUpChallengeAnswerPromise(answerPromiseKey);
                                        return [2 /*return*/, challengeAnswers];
                                }
                            });
                        }); };
                        _g.label = 10;
                    case 10:
                        _g.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, (0, challenges_1.getChallengeVerification)(decryptedRequestWithSubplebbitAuthor, this, getChallengeAnswers)];
                    case 11:
                        challengeVerification = _g.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        e_6 = _g.sent();
                        // getChallengeVerification will throw if one of the getChallenge function throws, which indicates a bug with the challenge script
                        // notify the sub owner that that one of his challenge is misconfigured via an error event
                        log.error("getChallenge failed, the sub owner needs to check the challenge code. The error is: ", e_6);
                        this.emit("error", e_6);
                        // notify the author that his publication wasn't published because the subplebbit is misconfigured
                        challengeVerification = {
                            challengeSuccess: false,
                            reason: "One of the subplebbit challenges is misconfigured: ".concat(e_6.message)
                        };
                        return [3 /*break*/, 13];
                    case 13: return [4 /*yield*/, this._publishChallengeVerification(challengeVerification, decryptedRequestWithSubplebbitAuthor)];
                    case 14:
                        _g.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._cleanUpChallengeAnswerPromise = function (challengeRequestIdString) {
        this._challengeAnswerPromises.delete(challengeRequestIdString);
        this._challengeAnswerResolveReject.delete(challengeRequestIdString);
    };
    Subplebbit.prototype.handleChallengeAnswer = function (challengeAnswer) {
        return __awaiter(this, void 0, void 0, function () {
            var log, answerSignatureValidation, decryptedChallengeAnswer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeAnswer");
                        return [4 /*yield*/, (0, signatures_1.verifyChallengeAnswer)(challengeAnswer, true)];
                    case 1:
                        answerSignatureValidation = _a.sent();
                        if (!answerSignatureValidation.valid) {
                            this._cleanUpChallengeAnswerPromise(challengeAnswer.challengeRequestId.toString());
                            this._ongoingChallengeExchanges.delete(challengeAnswer.challengeRequestId.toString());
                            (0, util_1.throwWithErrorCode)((0, util_1.getErrorCodeFromMessage)(answerSignatureValidation.reason), { challengeAnswer: challengeAnswer });
                        }
                        return [4 /*yield*/, this._decryptOrRespondWithFailure(challengeAnswer)];
                    case 2:
                        decryptedChallengeAnswer = _a.sent();
                        this.emit("challengeanswer", decryptedChallengeAnswer);
                        this._challengeAnswerResolveReject
                            .get(challengeAnswer.challengeRequestId.toString())
                            .resolve(decryptedChallengeAnswer.challengeAnswers);
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeExchange = function (pubsubMsg) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log, msgParsed, e_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeExchange");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, , 11]);
                        msgParsed = cborg.decode(pubsubMsg.data);
                        if (!(msgParsed.type === "CHALLENGEREQUEST")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handleChallengeRequest(new challenge_1.ChallengeRequestMessage(msgParsed))];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(msgParsed.type === "CHALLENGEANSWER" &&
                            !this._ongoingChallengeExchanges.has(msgParsed.challengeRequestId.toString()))) return [3 /*break*/, 5];
                        // Respond with error to answers without challenge request
                        return [4 /*yield*/, this._publishFailedChallengeVerification({ reason: errors_1.messages.ERR_CHALLENGE_ANSWER_WITH_NO_CHALLENGE_REQUEST }, msgParsed.challengeRequestId)];
                    case 4:
                        // Respond with error to answers without challenge request
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        if (!(msgParsed.type === "CHALLENGEANSWER")) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.handleChallengeAnswer(new challenge_1.ChallengeAnswerMessage(msgParsed))];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [3 /*break*/, 11];
                    case 8:
                        e_7 = _b.sent();
                        e_7.message = "failed process captcha for challenge request id (".concat(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId, "): ").concat(e_7.message);
                        log.error("(".concat(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId, "): "), String(e_7));
                        if (!((_a = msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId) === null || _a === void 0 ? void 0 : _a.toString())) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.dbHandler.rollbackTransaction(msgParsed.challengeRequestId.toString())];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._calculatePostUpdatePathForExistingCommentUpdate = function (timestampRange, currentIpfsPath) {
        var pathParts = currentIpfsPath.split("/");
        return __spreadArray(["/" + this.address, "postUpdates", timestampRange], pathParts.slice(4), true).join("/");
    };
    Subplebbit.prototype._calculateIpfsPathForCommentUpdate = function (dbComment, storedCommentUpdate) {
        return __awaiter(this, void 0, void 0, function () {
            var postTimestamp, _a, timestampRange, parentsCids;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(dbComment.depth === 0)) return [3 /*break*/, 1];
                        _a = dbComment.timestamp;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.dbHandler.queryComment(dbComment.postCid)];
                    case 2:
                        _a = (_b.sent()).timestamp;
                        _b.label = 3;
                    case 3:
                        postTimestamp = _a;
                        timestampRange = this._postUpdatesBuckets.find(function (bucket) { return (0, util_1.timestamp)() - bucket <= postTimestamp; });
                        if (!(storedCommentUpdate === null || storedCommentUpdate === void 0 ? void 0 : storedCommentUpdate.ipfsPath)) return [3 /*break*/, 4];
                        return [2 /*return*/, this._calculatePostUpdatePathForExistingCommentUpdate(timestampRange, storedCommentUpdate.ipfsPath)];
                    case 4: return [4 /*yield*/, this.dbHandler.queryParents(dbComment)];
                    case 5:
                        parentsCids = (_b.sent()).map(function (parent) { return parent.cid; }).reverse();
                        return [2 /*return*/, __spreadArray(__spreadArray(["/" + this.address, "postUpdates", timestampRange], parentsCids, true), [dbComment.cid, "update"], false).join("/")];
                }
            });
        });
    };
    Subplebbit.prototype._writeCommentUpdateToIpfsFilePath = function (newCommentUpdate, ipfsPath, oldIpfsPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // TODO need to exclude reply.replies here
                    return [4 /*yield*/, this._clientsManager
                            .getDefaultIpfs()
                            ._client.files.write(ipfsPath, (0, safe_stable_stringify_1.stringify)(newCommentUpdate), { parents: true, truncate: true, create: true })];
                    case 1:
                        // TODO need to exclude reply.replies here
                        _a.sent();
                        if (!(oldIpfsPath && oldIpfsPath !== ipfsPath)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.files.rm(oldIpfsPath)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.dbHandler.upsertCommentUpdate(__assign(__assign({}, newCommentUpdate), { ipfsPath: ipfsPath }))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._updateComment = function (comment) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log, _b, calculatedCommentUpdate, storedCommentUpdate, generatedPages, newPageCids_2, pageCidsToUnPin, newUpdatedAt, commentUpdatePriorToSigning, newCommentUpdate, _c, ipfsPath;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
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
                        _b = _f.sent(), calculatedCommentUpdate = _b[0], storedCommentUpdate = _b[1], generatedPages = _b[2];
                        if (calculatedCommentUpdate.replyCount > 0)
                            (0, assert_1.default)(generatedPages);
                        if (((_a = storedCommentUpdate === null || storedCommentUpdate === void 0 ? void 0 : storedCommentUpdate.replies) === null || _a === void 0 ? void 0 : _a.pageCids) && generatedPages) {
                            newPageCids_2 = lodash_1.default.uniq(Object.values(generatedPages.pageCids));
                            pageCidsToUnPin = lodash_1.default.uniq(Object.values(storedCommentUpdate.replies.pageCids).filter(function (oldPageCid) { return !newPageCids_2.includes(oldPageCid); }));
                            (_d = this._cidsToUnPin).push.apply(_d, pageCidsToUnPin);
                        }
                        newUpdatedAt = (storedCommentUpdate === null || storedCommentUpdate === void 0 ? void 0 : storedCommentUpdate.updatedAt) === (0, util_1.timestamp)() ? (0, util_1.timestamp)() + 1 : (0, util_1.timestamp)();
                        commentUpdatePriorToSigning = __assign(__assign({}, calculatedCommentUpdate), { replies: generatedPages ? { pageCids: generatedPages.pageCids, pages: lodash_1.default.pick(generatedPages.pages, "topAll") } : undefined, updatedAt: newUpdatedAt, protocolVersion: version_2.default.PROTOCOL_VERSION });
                        _c = [__assign({}, commentUpdatePriorToSigning)];
                        _e = {};
                        return [4 /*yield*/, (0, signatures_1.signCommentUpdate)(commentUpdatePriorToSigning, this.signer)];
                    case 2:
                        newCommentUpdate = __assign.apply(void 0, _c.concat([(_e.signature = _f.sent(), _e)]));
                        return [4 /*yield*/, this._calculateIpfsPathForCommentUpdate(comment, storedCommentUpdate)];
                    case 3:
                        ipfsPath = _f.sent();
                        return [4 /*yield*/, this._writeCommentUpdateToIpfsFilePath(newCommentUpdate, ipfsPath, storedCommentUpdate === null || storedCommentUpdate === void 0 ? void 0 : storedCommentUpdate.ipfsPath)];
                    case 4:
                        _f.sent();
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
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync:_listenToIncomingRequests");
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
                    case 2: return [4 /*yield*/, this.dbHandler.keyvGet(constants_1.STORAGE_KEYS[constants_1.STORAGE_KEYS.INTERNAL_SUBPLEBBIT])];
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
    Subplebbit.prototype._movePostUpdatesFolderToNewAddress = function (oldAddress, newAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var commentUpdates, _i, commentUpdates_1, commentUpdate, pathParts, newIpfsPath, e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.files.mv("/".concat(oldAddress), "/".concat(newAddress))];
                    case 1:
                        _a.sent(); // Could throw
                        return [4 /*yield*/, this.dbHandler.queryAllStoredCommentUpdates()];
                    case 2:
                        commentUpdates = _a.sent();
                        _i = 0, commentUpdates_1 = commentUpdates;
                        _a.label = 3;
                    case 3:
                        if (!(_i < commentUpdates_1.length)) return [3 /*break*/, 6];
                        commentUpdate = commentUpdates_1[_i];
                        pathParts = commentUpdate.ipfsPath.split("/");
                        pathParts[1] = newAddress;
                        newIpfsPath = pathParts.join("/");
                        return [4 /*yield*/, this.dbHandler.upsertCommentUpdate(__assign(__assign({}, commentUpdate), { ipfsPath: newIpfsPath }))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        e_8 = _a.sent();
                        if (e_8.message !== "file does not exist")
                            throw e_8; // A critical error
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._switchDbWhileRunningIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, internalState, currentDbAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:_switchDbIfNeeded");
                        return [4 /*yield*/, this._getDbInternalState(true)];
                    case 1:
                        internalState = _a.sent();
                        currentDbAddress = this.dbHandler.subAddress();
                        if (!this.dbHandler.isDbInMemory()) return [3 /*break*/, 2];
                        this.setAddress(this.dbHandler.subAddress());
                        return [3 /*break*/, 10];
                    case 2:
                        if (!(internalState.address !== currentDbAddress)) return [3 /*break*/, 10];
                        // That means a call has been made to edit the sub's address while it's running
                        // We need to stop the sub from running, change its file name, then establish a connection to the new DB
                        log("Running sub (".concat(currentDbAddress, ") has received a new address (").concat(internalState.address, ") to change to"));
                        return [4 /*yield*/, this.dbHandler.unlockSubStart()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.rollbackAllTransactions()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this._movePostUpdatesFolderToNewAddress(currentDbAddress, internalState.address)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.destoryConnection()];
                    case 6:
                        _a.sent();
                        this.setAddress(internalState.address);
                        return [4 /*yield*/, this.dbHandler.changeDbFilename(internalState.address, {
                                address: internalState.address,
                                plebbit: lodash_1.default.pick(this.plebbit, ["dataPath", "noData", "_storage"])
                            })];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.initDestroyedConnection()];
                    case 8:
                        _a.sent();
                        this.sortHandler = new sort_handler_1.SortHandler(lodash_1.default.pick(this, ["address", "plebbit", "dbHandler", "encryption", "_clientsManager"]));
                        this._subplebbitUpdateTrigger = true;
                        return [4 /*yield*/, this.dbHandler.lockSubStart()];
                    case 9:
                        _a.sent(); // Lock the new address start
                        _a.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._updateCommentsThatNeedToBeUpdated = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, trx, commentsToUpdate, commentsGroupedByDepth, depthsKeySorted, _i, depthsKeySorted_1, depthKey, _a, _b, comment;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:_updateCommentsThatNeedToBeUpdated");
                        return [4 /*yield*/, this.dbHandler.createTransaction("_updateCommentsThatNeedToBeUpdated")];
                    case 1:
                        trx = _c.sent();
                        return [4 /*yield*/, this.dbHandler.queryCommentsToBeUpdated(trx)];
                    case 2:
                        commentsToUpdate = _c.sent();
                        return [4 /*yield*/, this.dbHandler.commitTransaction("_updateCommentsThatNeedToBeUpdated")];
                    case 3:
                        _c.sent();
                        if (commentsToUpdate.length === 0)
                            return [2 /*return*/];
                        this._subplebbitUpdateTrigger = true;
                        log("Will update ".concat(commentsToUpdate.length, " comments in this update loop for subplebbit (").concat(this.address, ")"));
                        commentsGroupedByDepth = lodash_1.default.groupBy(commentsToUpdate, "depth");
                        depthsKeySorted = Object.keys(commentsGroupedByDepth).sort(function (a, b) { return Number(b) - Number(a); });
                        _i = 0, depthsKeySorted_1 = depthsKeySorted;
                        _c.label = 4;
                    case 4:
                        if (!(_i < depthsKeySorted_1.length)) return [3 /*break*/, 9];
                        depthKey = depthsKeySorted_1[_i];
                        _a = 0, _b = commentsGroupedByDepth[depthKey];
                        _c.label = 5;
                    case 5:
                        if (!(_a < _b.length)) return [3 /*break*/, 8];
                        comment = _b[_a];
                        return [4 /*yield*/, this._updateComment(comment)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        _a++;
                        return [3 /*break*/, 5];
                    case 8:
                        _i++;
                        return [3 /*break*/, 4];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._repinCommentsIPFSIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, dbCommentsCids, pinnedCids, unpinnedCommentsCids, unpinnedCommentsFromDb, _i, unpinnedCommentsFromDb_1, unpinnedCommentRow, commentInstance, commentIpfsJson, commentIpfsContent, contentHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync");
                        return [4 /*yield*/, this.dbHandler.queryAllCommentsCid()];
                    case 1:
                        dbCommentsCids = _a.sent();
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.pin.ls()];
                    case 2:
                        pinnedCids = (_a.sent()).map(function (cid) { return cid.cid.toString(); });
                        unpinnedCommentsCids = lodash_1.default.difference(dbCommentsCids, pinnedCids);
                        if (unpinnedCommentsCids.length === 0)
                            return [2 /*return*/];
                        log("There are ".concat(unpinnedCommentsCids.length, " comments that need to be repinned"));
                        return [4 /*yield*/, this.dbHandler.queryCommentsByCids(unpinnedCommentsCids)];
                    case 3:
                        unpinnedCommentsFromDb = _a.sent();
                        _i = 0, unpinnedCommentsFromDb_1 = unpinnedCommentsFromDb;
                        _a.label = 4;
                    case 4:
                        if (!(_i < unpinnedCommentsFromDb_1.length)) return [3 /*break*/, 9];
                        unpinnedCommentRow = unpinnedCommentsFromDb_1[_i];
                        return [4 /*yield*/, this.plebbit.createComment(unpinnedCommentRow)];
                    case 5:
                        commentInstance = _a.sent();
                        commentIpfsJson = commentInstance.toJSONIpfs();
                        if (unpinnedCommentRow.ipnsName)
                            commentIpfsJson["ipnsName"] = unpinnedCommentRow.ipnsName; // Added for backward compatibility
                        commentIpfsContent = (0, safe_stable_stringify_1.stringify)(commentIpfsJson);
                        return [4 /*yield*/, ipfs_only_hash_1.default.of(commentIpfsContent)];
                    case 6:
                        contentHash = _a.sent();
                        assert_1.default.equal(contentHash, unpinnedCommentRow.cid);
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.add(commentIpfsContent, { pin: true })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 4];
                    case 9: return [4 /*yield*/, this.dbHandler.deleteAllCommentUpdateRows()];
                    case 10:
                        _a.sent(); // delete CommentUpdate rows to force a new production of CommentUpdate
                        log("".concat(unpinnedCommentsFromDb.length, " comments' IPFS have been repinned"));
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._repinCommentUpdateIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, shouldUpdateAllComments, e_9, commentUpdatesToRepin, _a, _i, commentUpdatesToRepin_1, commentUpdateRaw, newIpfsPath, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:start:_repinCommentUpdateIfNeeded");
                        shouldUpdateAllComments = false;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._clientsManager.getDefaultIpfs()._client.files.stat("/".concat(this.address))];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_9 = _c.sent();
                        if (e_9.message === "file does not exist")
                            shouldUpdateAllComments = true;
                        else
                            throw e_9;
                        return [3 /*break*/, 4];
                    case 4:
                        if (!shouldUpdateAllComments) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.dbHandler.queryAllStoredCommentUpdates()];
                    case 5:
                        _a = _c.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.dbHandler.queryCommentUpdatesWithPlaceHolderForIpfsPath()];
                    case 7:
                        _a = _c.sent();
                        _c.label = 8;
                    case 8:
                        commentUpdatesToRepin = _a;
                        if (!(commentUpdatesToRepin.length > 0)) return [3 /*break*/, 15];
                        log.error("CommentUpdates are not added under PostUpdates folder (/".concat(this.address, "). Will add all stored CommentUpdate to IPFS files"));
                        _i = 0, commentUpdatesToRepin_1 = commentUpdatesToRepin;
                        _c.label = 9;
                    case 9:
                        if (!(_i < commentUpdatesToRepin_1.length)) return [3 /*break*/, 15];
                        commentUpdateRaw = commentUpdatesToRepin_1[_i];
                        _b = this._calculateIpfsPathForCommentUpdate;
                        return [4 /*yield*/, this.dbHandler.queryComment(commentUpdateRaw.cid)];
                    case 10: return [4 /*yield*/, _b.apply(this, [_c.sent(), undefined])];
                    case 11:
                        newIpfsPath = _c.sent();
                        return [4 /*yield*/, this._writeCommentUpdateToIpfsFilePath(commentUpdateRaw, newIpfsPath, undefined)];
                    case 12:
                        _c.sent();
                        return [4 /*yield*/, this.dbHandler.upsertCommentUpdate(__assign(__assign({}, commentUpdateRaw), { ipfsPath: newIpfsPath }))];
                    case 13:
                        _c.sent();
                        log("Added the CommentUpdate of (".concat(commentUpdateRaw.cid, ") to IPFS files"));
                        _c.label = 14;
                    case 14:
                        _i++;
                        return [3 /*break*/, 9];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._adjustPostUpdatesBucketsIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, commentUpdateOfPosts, _loop_1, this_1, _i, commentUpdateOfPosts_1, post;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // This function will be ran a lot, maybe we should move it out of the sync loop or try to limit its execution
                        if (!this.postUpdates)
                            return [2 /*return*/];
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:start:_adjustPostUpdatesBucketsIfNeeded");
                        return [4 /*yield*/, this.dbHandler.queryCommentUpdatesOfPostsForBucketAdjustment()];
                    case 1:
                        commentUpdateOfPosts = _a.sent();
                        _loop_1 = function (post) {
                            var currentTimestampBucketOfPost, newTimestampBucketOfPost, newPostIpfsPath, newPostIpfsPathWithoutUpdate, currentPostIpfsPathWithoutUpdate, newTimestampBucketPath, commentUpdatesWithOutdatedIpfsPath, _b, commentUpdatesWithOutdatedIpfsPath_1, commentUpdate, newIpfsPath;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        currentTimestampBucketOfPost = Number(post.ipfsPath.split("/")[3]);
                                        newTimestampBucketOfPost = this_1._postUpdatesBuckets.find(function (bucket) { return (0, util_1.timestamp)() - bucket <= post.timestamp; });
                                        if (!(currentTimestampBucketOfPost !== newTimestampBucketOfPost)) return [3 /*break*/, 8];
                                        log("Post (".concat(post.cid, ") current postUpdates timestamp bucket (").concat(currentTimestampBucketOfPost, ") is outdated. Will move it to bucket (").concat(newTimestampBucketOfPost, ")"));
                                        newPostIpfsPath = this_1._calculatePostUpdatePathForExistingCommentUpdate(newTimestampBucketOfPost, post.ipfsPath);
                                        newPostIpfsPathWithoutUpdate = newPostIpfsPath.replace("/update", "");
                                        currentPostIpfsPathWithoutUpdate = post.ipfsPath.replace("/update", "");
                                        newTimestampBucketPath = newPostIpfsPathWithoutUpdate.split("/").slice(0, 4).join("/");
                                        return [4 /*yield*/, this_1._clientsManager.getDefaultIpfs()._client.files.mkdir(newTimestampBucketPath, { parents: true })];
                                    case 1:
                                        _c.sent();
                                        return [4 /*yield*/, this_1._clientsManager
                                                .getDefaultIpfs()
                                                ._client.files.mv(currentPostIpfsPathWithoutUpdate, newPostIpfsPathWithoutUpdate)];
                                    case 2:
                                        _c.sent(); // should move post and its children
                                        return [4 /*yield*/, this_1.dbHandler.queryCommentsUpdatesWithPostCid(post.cid)];
                                    case 3:
                                        commentUpdatesWithOutdatedIpfsPath = _c.sent();
                                        _b = 0, commentUpdatesWithOutdatedIpfsPath_1 = commentUpdatesWithOutdatedIpfsPath;
                                        _c.label = 4;
                                    case 4:
                                        if (!(_b < commentUpdatesWithOutdatedIpfsPath_1.length)) return [3 /*break*/, 7];
                                        commentUpdate = commentUpdatesWithOutdatedIpfsPath_1[_b];
                                        newIpfsPath = this_1._calculatePostUpdatePathForExistingCommentUpdate(newTimestampBucketOfPost, commentUpdate.ipfsPath);
                                        return [4 /*yield*/, this_1.dbHandler.upsertCommentUpdate(__assign(__assign({}, commentUpdate), { ipfsPath: newIpfsPath }))];
                                    case 5:
                                        _c.sent();
                                        _c.label = 6;
                                    case 6:
                                        _b++;
                                        return [3 /*break*/, 4];
                                    case 7:
                                        this_1._subplebbitUpdateTrigger = true;
                                        _c.label = 8;
                                    case 8: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, commentUpdateOfPosts_1 = commentUpdateOfPosts;
                        _a.label = 2;
                    case 2:
                        if (!(_i < commentUpdateOfPosts_1.length)) return [3 /*break*/, 5];
                        post = commentUpdateOfPosts_1[_i];
                        return [5 /*yield**/, _loop_1(post)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.syncIpnsWithDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, e_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync");
                        return [4 /*yield*/, this._switchDbWhileRunningIfNeeded()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, this._mergeInstanceStateWithDbState({})];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._listenToIncomingRequests()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this._adjustPostUpdatesBucketsIfNeeded()];
                    case 5:
                        _a.sent();
                        this._setStartedState("publishing-ipns");
                        this._clientsManager.updateIpfsState("publishing-ipns");
                        return [4 /*yield*/, this._updateCommentsThatNeedToBeUpdated()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.updateSubplebbitIpnsIfNeeded()];
                    case 7:
                        _a.sent();
                        this._setStartedState("succeeded");
                        this._clientsManager.updateIpfsState("stopped");
                        return [3 /*break*/, 9];
                    case 8:
                        e_10 = _a.sent();
                        this._setStartedState("failed");
                        this._clientsManager.updateIpfsState("stopped");
                        log.error("Failed to sync due to error,", e_10);
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
                        return [4 /*yield*/, this.dbHandler.keyvGet(constants_1.STORAGE_KEYS[constants_1.STORAGE_KEYS.INTERNAL_SUBPLEBBIT])];
                    case 2:
                        internalStateBefore = _a.sent();
                        return [4 /*yield*/, this.dbHandler.keyvSet(constants_1.STORAGE_KEYS[constants_1.STORAGE_KEYS.INTERNAL_SUBPLEBBIT], __assign(__assign({}, internalStateBefore), props))];
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
                if (!this._isSubRunningLocally)
                    return [2 /*return*/];
                loop = function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this._publishLoopPromise = this.syncIpnsWithDb();
                                return [4 /*yield*/, this._publishLoopPromise];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, this._syncLoop(syncIntervalMs)];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
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
            var log, _b, e_11;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:start");
                        if (!this.plebbit.plebbitRpcClient) return [3 /*break*/, 5];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        _b = this;
                        return [4 /*yield*/, this.plebbit.plebbitRpcClient.startSubplebbit(this.address)];
                    case 2:
                        _b._startRpcSubscriptionId = _c.sent();
                        this._setState("started");
                        return [3 /*break*/, 4];
                    case 3:
                        e_11 = _c.sent();
                        log.error("Failed to start subplebbit (".concat(this.address, ") from RPC due to error"), e_11);
                        this._setState("stopped");
                        this._setStartedState("failed");
                        throw e_11;
                    case 4:
                        this.plebbit.plebbitRpcClient
                            .getSubscription(this._startRpcSubscriptionId)
                            .on("update", function (updateProps) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        log("Received new subplebbitUpdate from RPC (".concat(this.plebbit.plebbitRpcClientsOptions[0], ")"));
                                        this._rawSubplebbitType = updateProps.params.result;
                                        return [4 /*yield*/, this.initSubplebbit(this._rawSubplebbitType)];
                                    case 1:
                                        _a.sent();
                                        this.emit("update", this);
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .on("startedstatechange", function (args) {
                            var newStartedState = args.params.result;
                            _this._setStartedState(newStartedState);
                            _this._updateRpcClientStateFromStartedState(newStartedState);
                        })
                            .on("challengerequest", function (args) {
                            _this._setRpcClientState("waiting-challenge-requests");
                            _this.emit("challengerequest", (0, util_1.decodePubsubMsgFromRpc)(args.params.result));
                        })
                            .on("challenge", function (args) {
                            _this._setRpcClientState("publishing-challenge");
                            _this.emit("challenge", (0, util_1.decodePubsubMsgFromRpc)(args.params.result));
                            _this._setRpcClientState("waiting-challenge-answers");
                        })
                            .on("challengeanswer", function (args) {
                            _this.emit("challengeanswer", (0, util_1.decodePubsubMsgFromRpc)(args.params.result));
                        })
                            .on("challengeverification", function (args) {
                            _this._setRpcClientState("publishing-challenge-verification");
                            _this.emit("challengeverification", (0, util_1.decodePubsubMsgFromRpc)(args.params.result));
                            _this._setRpcClientState("waiting-challenge-requests");
                        })
                            .on("error", function (args) { return _this.emit("error", args.params.result); });
                        this.plebbit.plebbitRpcClient.emitAllPendingMessages(this._startRpcSubscriptionId);
                        return [2 /*return*/];
                    case 5:
                        if (!((_a = this.signer) === null || _a === void 0 ? void 0 : _a.address))
                            (0, util_1.throwWithErrorCode)("ERR_SUB_SIGNER_NOT_DEFINED");
                        if (!this._clientsManager.getDefaultIpfs())
                            (0, util_1.throwWithErrorCode)("ERR_CAN_NOT_RUN_A_SUB_WITH_NO_IPFS_NODE", { ipfsHttpClientOptions: this.plebbit.ipfsHttpClientsOptions });
                        return [4 /*yield*/, this.dbHandler.initDestroyedConnection()];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, this.dbHandler.lockSubStart()];
                    case 7:
                        _c.sent(); // Will throw if sub is locked already
                        this._setState("started");
                        this._setStartedState("publishing-ipns");
                        this._isSubRunningLocally = true;
                        return [4 /*yield*/, this.dbHandler.initDbIfNeeded()];
                    case 8:
                        _c.sent();
                        return [4 /*yield*/, this.dbHandler.initDestroyedConnection()];
                    case 9:
                        _c.sent();
                        return [4 /*yield*/, this._defaultSettingsOfChallenges(log)];
                    case 10:
                        _c.sent();
                        // Import subplebbit keys onto ipfs node
                        return [4 /*yield*/, this._importSubplebbitSignerIntoIpfsIfNeeded()];
                    case 11:
                        // Import subplebbit keys onto ipfs node
                        _c.sent();
                        this._subplebbitUpdateTrigger = true;
                        return [4 /*yield*/, this._updateDbInternalState({ _subplebbitUpdateTrigger: this._subplebbitUpdateTrigger, startedState: this.startedState })];
                    case 12:
                        _c.sent();
                        return [4 /*yield*/, this._repinCommentsIPFSIfNeeded()];
                    case 13:
                        _c.sent();
                        return [4 /*yield*/, this._repinCommentUpdateIfNeeded()];
                    case 14:
                        _c.sent();
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
            var log, ipfsClient, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.stop()];
                    case 1:
                        _c.sent();
                        if (this.plebbit.plebbitRpcClient)
                            return [2 /*return*/, this.plebbit.plebbitRpcClient.deleteSubplebbit(this.address)];
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:delete");
                        if (typeof this.plebbit.dataPath !== "string")
                            (0, util_1.throwWithErrorCode)("ERR_DATA_PATH_IS_NOT_DEFINED", { plebbitDataPath: this.plebbit.dataPath });
                        ipfsClient = this._clientsManager.getDefaultIpfs();
                        if (!ipfsClient)
                            throw Error("Ipfs client is not defined");
                        return [4 /*yield*/, util_3.nativeFunctions.deleteSubplebbit(this.address, this.plebbit.dataPath, this.plebbit)];
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