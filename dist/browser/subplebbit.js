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
exports.Subplebbit = exports.RUNNING_SUBPLEBBITS = void 0;
var to_string_1 = require("uint8arrays/to-string");
var events_1 = __importDefault(require("events"));
var js_sha256_1 = require("js-sha256");
var from_string_1 = require("uint8arrays/from-string");
var challenge_1 = require("./challenge");
var sort_handler_1 = require("./sort-handler");
var util_1 = require("./util");
var signer_1 = require("./signer");
var pages_1 = require("./pages");
var comment_1 = require("./comment");
var vote_1 = __importDefault(require("./vote"));
var post_1 = __importDefault(require("./post"));
var util_2 = require("./signer/util");
var uuid_1 = require("uuid");
var comment_edit_1 = require("./comment-edit");
var err_code_1 = __importDefault(require("err-code"));
var errors_1 = require("./errors");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var util_3 = require("./runtime/browser/util");
var version_1 = __importDefault(require("./version"));
var lodash_1 = __importDefault(require("lodash"));
var signatures_1 = require("./signer/signatures");
var constants_1 = require("./constants");
var DEFAULT_UPDATE_INTERVAL_MS = 60000;
var DEFAULT_SYNC_INTERVAL_MS = 100000; // 1.67 minutes
exports.RUNNING_SUBPLEBBITS = {};
var Subplebbit = /** @class */ (function (_super) {
    __extends(Subplebbit, _super);
    function Subplebbit(props, plebbit) {
        var _this = _super.call(this) || this;
        _this.plebbit = plebbit;
        _this.initSubplebbit(props);
        _this._challengeToSolution = {}; // Map challenge ID to its solution
        _this._challengeToPublication = {}; // To hold unpublished posts/comments/votes
        _this._sync = false;
        // these functions might get separated from their `this` when used
        _this.start = _this.start.bind(_this);
        _this.update = _this.update.bind(_this);
        _this.stop = _this.stop.bind(_this);
        _this.edit = _this.edit.bind(_this);
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
        var _a, _b;
        var oldProps = this.toJSONInternal();
        var mergedProps = __assign(__assign({}, oldProps), newProps);
        this.title = mergedProps.title;
        this.description = mergedProps.description;
        this.lastPostCid = mergedProps.lastPostCid;
        this.address = mergedProps.address;
        this.pubsubTopic = mergedProps.pubsubTopic;
        this.challengeTypes = mergedProps.challengeTypes;
        this.metricsCid = mergedProps.metricsCid;
        this.createdAt = mergedProps.createdAt;
        this.updatedAt = mergedProps.updatedAt;
        this.signer = mergedProps.signer ? new signer_1.Signer(mergedProps.signer) : undefined;
        this.encryption = mergedProps.encryption;
        this.posts = new pages_1.Pages({
            pages: (_a = mergedProps === null || mergedProps === void 0 ? void 0 : mergedProps.posts) === null || _a === void 0 ? void 0 : _a.pages,
            pageCids: (_b = mergedProps === null || mergedProps === void 0 ? void 0 : mergedProps.posts) === null || _b === void 0 ? void 0 : _b.pageCids,
            subplebbit: this
        });
        this.roles = mergedProps.roles;
        this.features = mergedProps.features;
        this.suggested = mergedProps.suggested;
        this.rules = mergedProps.rules;
        this.flairs = mergedProps.flairs;
        this.signature = mergedProps.signature;
    };
    Subplebbit.prototype._initSignerProps = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!!this.signer.ipfsKey) return [3 /*break*/, 2];
                        _b = this.signer;
                        _c = Uint8Array.bind;
                        return [4 /*yield*/, (0, util_2.getIpfsKeyFromPrivateKeyPem)(this.signer.privateKey)];
                    case 1:
                        _b.ipfsKey = new (_c.apply(Uint8Array, [void 0, _d.sent()]))();
                        _d.label = 2;
                    case 2:
                        if (!this.signer.ipnsKeyName)
                            this.signer.ipnsKeyName = this.signer.address;
                        this.signer = new signer_1.Signer(this.signer);
                        if (typeof ((_a = this.signer) === null || _a === void 0 ? void 0 : _a.publicKey) !== "string")
                            throw Error("subplebbit.signer.publicKey is not defined");
                        this.encryption = {
                            type: "aes-cbc",
                            publicKey: this.signer.publicKey
                        };
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.initDbIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var obsoleteCache, subCache, signerAddress, signer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.dbHandler) {
                            this.dbHandler = util_3.nativeFunctions.createDbHandler({
                                address: this.address,
                                plebbit: {
                                    dataPath: this.plebbit.dataPath
                                }
                            });
                        }
                        return [4 /*yield*/, this.dbHandler.initDbIfNeeded()];
                    case 1:
                        _a.sent();
                        if (!this.sortHandler)
                            this.sortHandler = new sort_handler_1.SortHandler({ address: this.address, plebbit: this.plebbit, dbHandler: this.dbHandler });
                        return [4 /*yield*/, this.dbHandler.keyvGet(this.address)];
                    case 2:
                        obsoleteCache = _a.sent();
                        return [4 /*yield*/, this.dbHandler.keyvGet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT])];
                    case 3:
                        subCache = _a.sent();
                        if (!(obsoleteCache && !subCache)) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, util_2.getPlebbitAddressFromPublicKeyPem)(obsoleteCache.encryption.publicKey)];
                    case 4:
                        signerAddress = _a.sent();
                        return [4 /*yield*/, this.dbHandler.querySigner(signerAddress)];
                    case 5:
                        signer = _a.sent();
                        obsoleteCache.signer = signer;
                        // We changed the name of internal subplebbit cache, need to explicitly copy old cache to new key here
                        return [4 /*yield*/, this.dbHandler.keyvSet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT], obsoleteCache)];
                    case 6:
                        // We changed the name of internal subplebbit cache, need to explicitly copy old cache to new key here
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
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
        return __assign(__assign({}, this.toJSON()), { signer: this.signer });
    };
    Subplebbit.prototype.toJSON = function () {
        var _a;
        return {
            title: this.title,
            description: this.description,
            lastPostCid: this.lastPostCid,
            pubsubTopic: this.pubsubTopic,
            address: this.address,
            posts: (_a = this.posts) === null || _a === void 0 ? void 0 : _a.toJSON(),
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
    Subplebbit.prototype._importSignerIntoIpfsIfNeeded = function (signer) {
        return __awaiter(this, void 0, void 0, function () {
            var keyExistsInNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!signer.ipnsKeyName)
                            throw Error("signer.ipnsKeyName need to be defined before importing singer into IPFS");
                        return [4 /*yield*/, this.plebbit.ipfsClient.key.list()];
                    case 1:
                        keyExistsInNode = (_a.sent()).some(function (key) { return key.name === signer.ipnsKeyName; });
                        if (!!keyExistsInNode) return [3 /*break*/, 3];
                        return [4 /*yield*/, util_3.nativeFunctions.importSignerIntoIpfsNode(signer, this.plebbit)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // TODO rename and make this private
    Subplebbit.prototype.prePublish = function () {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var cachedSubplebbit, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: 
                    // Import ipfs key into node (if not imported already)
                    // Initialize signer
                    // Initialize address (needs signer)
                    // Initialize db (needs address)
                    return [4 /*yield*/, this.initDbIfNeeded()];
                    case 1:
                        // Import ipfs key into node (if not imported already)
                        // Initialize signer
                        // Initialize address (needs signer)
                        // Initialize db (needs address)
                        _g.sent();
                        return [4 /*yield*/, ((_a = this.dbHandler) === null || _a === void 0 ? void 0 : _a.keyvGet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT]))];
                    case 2:
                        cachedSubplebbit = _g.sent();
                        if (cachedSubplebbit && JSON.stringify(cachedSubplebbit) !== "{}")
                            this.initSubplebbit(__assign(__assign({}, cachedSubplebbit), (0, util_1.removeKeysWithUndefinedValues)(this.toJSONInternal()))); // Init subplebbit fields from DB
                        if (!this.signer)
                            throw Error("subplebbit.signer needs to be defined before proceeding");
                        // import ipfs key into ipfs node
                        return [4 /*yield*/, this._initSignerProps()];
                    case 3:
                        // import ipfs key into ipfs node
                        _g.sent();
                        return [4 /*yield*/, this._importSignerIntoIpfsIfNeeded(this.signer)];
                    case 4:
                        _g.sent();
                        _e = (_d = lodash_1.default).isEqual;
                        _f = [this.toJSONInternal()];
                        return [4 /*yield*/, ((_b = this.dbHandler) === null || _b === void 0 ? void 0 : _b.keyvGet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT]))];
                    case 5:
                        if (!!_e.apply(_d, _f.concat([_g.sent()]))) return [3 /*break*/, 7];
                        return [4 /*yield*/, ((_c = this.dbHandler) === null || _c === void 0 ? void 0 : _c.keyvSet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT], this.toJSONInternal()))];
                    case 6:
                        _g.sent();
                        _g.label = 7;
                    case 7: return [2 /*return*/];
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
                        return [4 /*yield*/, (0, util_2.getPlebbitAddressFromPublicKeyPem)(this.encryption.publicKey)];
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
            var log;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:edit");
                        if (!(newSubplebbitOptions.address && newSubplebbitOptions.address !== this.address)) return [3 /*break*/, 2];
                        this.assertDomainResolvesCorrectly(newSubplebbitOptions.address).catch(function (err) {
                            var editError = (0, err_code_1.default)(err, err.code, { details: "subplebbit.edit: ".concat(err.details) });
                            log.error(editError);
                            _this.emit("error", editError);
                        });
                        log.trace("Attempting to edit subplebbit.address from ".concat(this.address, " to ").concat(newSubplebbitOptions.address));
                        this.initSubplebbit(newSubplebbitOptions);
                        return [4 /*yield*/, this.dbHandler.changeDbFilename(newSubplebbitOptions.address, {
                                address: this.address,
                                plebbit: {
                                    dataPath: this.plebbit.dataPath
                                }
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.initSubplebbit(newSubplebbitOptions);
                        log("Subplebbit (".concat(this.address, ") props (").concat(Object.keys(newSubplebbitOptions), ") has been edited"));
                        return [4 /*yield*/, this.dbHandler.keyvSet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT], this.toJSONInternal())];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Subplebbit.prototype.updateOnce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, e_1, updateError, ipnsAddress, subplebbitIpns, e_2, updateValidity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:update");
                        if (!this.plebbit.resolver.isDomain(this.address)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.assertDomainResolvesCorrectly(this.address)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        updateError = (0, err_code_1.default)(e_1, e_1.code, { details: "subplebbit.update: ".concat(e_1.details) });
                        log.error(updateError);
                        this.emit("error", updateError);
                        return [2 /*return*/];
                    case 4: return [4 /*yield*/, this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address)];
                    case 5:
                        ipnsAddress = _a.sent();
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(ipnsAddress, this.plebbit)];
                    case 7:
                        subplebbitIpns = _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_2 = _a.sent();
                        log.error("Failed to load subplebbit IPNS, error:", e_2);
                        this.emit("error", e_2);
                        return [2 /*return*/];
                    case 9: return [4 /*yield*/, (0, signatures_1.verifySubplebbit)(subplebbitIpns, this.plebbit)];
                    case 10:
                        updateValidity = _a.sent();
                        if (!updateValidity.valid) {
                            log.error("Subplebbit update's signature is invalid. Error is '".concat(updateValidity.reason, "'"));
                            this.emit("error", "Subplebbit update's signature is invalid. Error is '".concat(updateValidity.reason, "'"));
                        }
                        else if (!lodash_1.default.isEqual(this.toJSON(), subplebbitIpns)) {
                            this.initSubplebbit(subplebbitIpns);
                            log("Remote Subplebbit received a new update. Will emit an update event");
                            this.emit("update", this);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this._updateInterval || this._sync)
                    return [2 /*return*/]; // No need to do anything if subplebbit is already updating
                this.updateOnce();
                this._updateInterval = setInterval(this.updateOnce.bind(this), this._updateIntervalMs);
                return [2 /*return*/];
            });
        });
    };
    Subplebbit.prototype.stop = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._updateInterval = clearInterval(this._updateInterval);
                        if (!this._sync) return [3 /*break*/, 2];
                        this.removeAllListeners();
                        this._sync = false;
                        this._syncInterval = clearInterval(this._syncInterval);
                        return [4 /*yield*/, this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.pubsubTopic)];
                    case 1:
                        _b.sent();
                        (_a = this.dbHandler) === null || _a === void 0 ? void 0 : _a.destoryConnection();
                        this.dbHandler = undefined;
                        exports.RUNNING_SUBPLEBBITS[this.signer.address] = false;
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.updateSubplebbitIpns = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log, trx, latestPost, _b, metrics, subplebbitPosts, resolvedAddress, currentIpns, e_3, _c, lastPublishOverTwentyMinutes, _d, file;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync");
                        return [4 /*yield*/, this.dbHandler.createTransaction("subplebbit")];
                    case 1:
                        trx = _e.sent();
                        return [4 /*yield*/, this.dbHandler.queryLatestPost(trx)];
                    case 2:
                        latestPost = _e.sent();
                        return [4 /*yield*/, this.dbHandler.commitTransaction("subplebbit")];
                    case 3:
                        _e.sent();
                        this.lastPostCid = latestPost === null || latestPost === void 0 ? void 0 : latestPost.cid;
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.querySubplebbitMetrics(undefined),
                                this.sortHandler.generatePagesUnderComment(undefined, undefined)
                            ])];
                    case 4:
                        _b = _e.sent(), metrics = _b[0], subplebbitPosts = _b[1];
                        return [4 /*yield*/, this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address)];
                    case 5:
                        resolvedAddress = _e.sent();
                        _e.label = 6;
                    case 6:
                        _e.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(resolvedAddress, this.plebbit)];
                    case 7:
                        currentIpns = _e.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_3 = _e.sent();
                        log("".concat(e_3, "\n subplebbit IPNS (").concat(resolvedAddress, ") is not defined, will publish a new record"));
                        return [3 /*break*/, 9];
                    case 9:
                        if (subplebbitPosts) {
                            if (!((_a = subplebbitPosts === null || subplebbitPosts === void 0 ? void 0 : subplebbitPosts.pages) === null || _a === void 0 ? void 0 : _a.hot))
                                throw Error("Generated pages for subplebbit.posts is missing pages");
                            this.posts = new pages_1.Pages({
                                pages: {
                                    hot: subplebbitPosts.pages.hot
                                },
                                pageCids: subplebbitPosts.pageCids,
                                subplebbit: this
                            });
                        }
                        _c = this;
                        return [4 /*yield*/, this.plebbit.ipfsClient.add((0, util_1.encode)(metrics))];
                    case 10:
                        _c.metricsCid = (_e.sent()).path;
                        lastPublishOverTwentyMinutes = this.updatedAt < (0, util_1.timestamp)() - 60 * 20;
                        if (!(!currentIpns || (0, util_1.encode)(currentIpns) !== (0, util_1.encode)(this.toJSON()) || lastPublishOverTwentyMinutes)) return [3 /*break*/, 14];
                        this.updatedAt = (0, util_1.timestamp)();
                        _d = this;
                        return [4 /*yield*/, (0, signatures_1.signSubplebbit)(this.toJSON(), this.signer)];
                    case 11:
                        _d.signature = _e.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.add((0, util_1.encode)(this.toJSON()))];
                    case 12:
                        file = _e.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.name.publish(file.path, {
                                lifetime: "72h",
                                key: this.signer.ipnsKeyName,
                                allowOffline: true
                            })];
                    case 13:
                        _e.sent();
                        this.emit("update", this);
                        log.trace("Published a new IPNS record for sub(".concat(this.address, ")"));
                        _e.label = 14;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleCommentEdit = function (commentEdit, challengeRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var log, commentToBeEdited, editorAddress, modRole, _i, _a, editField, msg, _b, _c, editField, msg, newAuthorProps, msg;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid:handleCommentEdit");
                        return [4 /*yield*/, this.dbHandler.queryComment(commentEdit.commentCid, undefined)];
                    case 1:
                        commentToBeEdited = _d.sent();
                        return [4 /*yield*/, (0, util_2.getPlebbitAddressFromPublicKeyPem)(commentEdit.signature.publicKey)];
                    case 2:
                        editorAddress = _d.sent();
                        modRole = this.roles && this.roles[editorAddress];
                        if (!(commentEdit.signature.publicKey === commentToBeEdited.signature.publicKey)) return [3 /*break*/, 5];
                        // CommentEdit is signed by original author
                        for (_i = 0, _a = Object.keys((0, util_1.removeKeysWithUndefinedValues)(commentEdit.toJSON())); _i < _a.length; _i++) {
                            editField = _a[_i];
                            if (!comment_edit_1.AUTHOR_EDIT_FIELDS.includes(editField)) {
                                msg = "Author (".concat(editorAddress, ") included field (").concat(editField, ") that cannot be used for a author's CommentEdit");
                                log("(".concat(challengeRequestId, "): "), msg);
                                return [2 /*return*/, msg];
                            }
                        }
                        return [4 /*yield*/, this.dbHandler.insertEdit(commentEdit.toJSONForDb(challengeRequestId))];
                    case 3:
                        _d.sent();
                        // If comment.flair is last modified by a mod, then reject
                        return [4 /*yield*/, this.dbHandler.editComment(commentEdit.toJSONForDb(challengeRequestId))];
                    case 4:
                        // If comment.flair is last modified by a mod, then reject
                        _d.sent();
                        // const commentAfterEdit = await this.dbHandler.queryComment(commentEdit.commentCid, undefined);
                        log.trace("(".concat(challengeRequestId, "): "), "Updated comment (".concat(commentEdit.commentCid, ") with CommentEdit: "), commentEdit.toJSON());
                        return [3 /*break*/, 11];
                    case 5:
                        if (!modRole) return [3 /*break*/, 10];
                        log.trace("(".concat(challengeRequestId, "): "), "".concat(modRole.role, " (").concat(editorAddress, ") is attempting to CommentEdit ").concat(commentToBeEdited === null || commentToBeEdited === void 0 ? void 0 : commentToBeEdited.cid, " with CommentEdit: "), commentEdit.toJSON());
                        for (_b = 0, _c = Object.keys((0, util_1.removeKeysWithUndefinedValues)(commentEdit.toJSON())); _b < _c.length; _b++) {
                            editField = _c[_b];
                            if (!comment_edit_1.MOD_EDIT_FIELDS.includes(editField)) {
                                msg = "".concat(modRole.role, " (").concat(editorAddress, ") included field (").concat(editField, ") that cannot be used for a mod's CommentEdit");
                                log("(".concat(challengeRequestId, "): "), msg);
                                return [2 /*return*/, msg];
                            }
                        }
                        return [4 /*yield*/, this.dbHandler.insertEdit(commentEdit.toJSONForDb(challengeRequestId))];
                    case 6:
                        _d.sent();
                        return [4 /*yield*/, this.dbHandler.editComment(commentEdit.toJSONForDb(challengeRequestId))];
                    case 7:
                        _d.sent();
                        if (!commentEdit.commentAuthor) return [3 /*break*/, 9];
                        newAuthorProps = __assign({ address: commentToBeEdited === null || commentToBeEdited === void 0 ? void 0 : commentToBeEdited.author.address }, commentEdit.commentAuthor);
                        return [4 /*yield*/, this.dbHandler.updateAuthor(newAuthorProps, true)];
                    case 8:
                        _d.sent();
                        log("(".concat(challengeRequestId, "): "), "Following props has been added to author (".concat(newAuthorProps.address, "): "), newAuthorProps, "By mod: ", modRole);
                        _d.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        msg = "Editor (non-mod) - (".concat(editorAddress, ") attempted to edit a comment (").concat(commentEdit.commentCid, ") without having original author keys.");
                        log("(".concat(challengeRequestId, "): "), msg);
                        return [2 /*return*/, errors_1.messages.ERR_UNAUTHORIZED_COMMENT_EDIT];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleVote = function (newVote, challengeRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var log, lastVote, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid:handleVote");
                        return [4 /*yield*/, this.dbHandler.getLastVoteOfAuthor(newVote.commentCid, newVote.author.address)];
                    case 1:
                        lastVote = _a.sent();
                        if (!(lastVote && newVote.signature.publicKey !== lastVote.signature.publicKey)) return [3 /*break*/, 2];
                        msg = "Author (".concat(newVote.author.address, ") attempted to change vote on (").concat(newVote.commentCid, ") without having correct credentials");
                        log("(".concat(challengeRequestId, "): "), msg);
                        return [2 /*return*/, msg];
                    case 2: return [4 /*yield*/, this.dbHandler.upsertVote(newVote.toJSONForDb(challengeRequestId), newVote.author.toJSONForDb(), undefined)];
                    case 3:
                        _a.sent();
                        log.trace("(".concat(challengeRequestId, "): "), "Upserted new vote (".concat(newVote.vote, ") for comment ").concat(newVote.commentCid));
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.storePublicationIfValid = function (publication, challengeRequestId) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var log, postOrCommentOrVote, _e, _f, author, msg, msg, parentCid, parent_1, signatureValidity, _g, _h, msg, res, res, ipnsKeyName, msg, ipfsSigner, _j, _k, _l, _m, trx, _o, _p, file, trx, _q, commentsUnderParent, parent_2, file;
            return __generator(this, function (_r) {
                switch (_r.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid");
                        delete this._challengeToSolution[challengeRequestId];
                        delete this._challengeToPublication[challengeRequestId];
                        if (!publication.hasOwnProperty("vote")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.plebbit.createVote(publication)];
                    case 1:
                        _e = _r.sent();
                        return [3 /*break*/, 7];
                    case 2:
                        if (!publication["commentCid"]) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.plebbit.createCommentEdit(publication)];
                    case 3:
                        _f = _r.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.plebbit.createComment(publication)];
                    case 5:
                        _f = _r.sent();
                        _r.label = 6;
                    case 6:
                        _e = _f;
                        _r.label = 7;
                    case 7:
                        postOrCommentOrVote = _e;
                        if (!((_a = postOrCommentOrVote === null || postOrCommentOrVote === void 0 ? void 0 : postOrCommentOrVote.author) === null || _a === void 0 ? void 0 : _a.address)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.dbHandler.queryAuthor(postOrCommentOrVote.author.address)];
                    case 8:
                        author = _r.sent();
                        if ((author === null || author === void 0 ? void 0 : author.banExpiresAt) && author.banExpiresAt > (0, util_1.timestamp)()) {
                            msg = "Author (".concat((_b = postOrCommentOrVote === null || postOrCommentOrVote === void 0 ? void 0 : postOrCommentOrVote.author) === null || _b === void 0 ? void 0 : _b.address, ") attempted to publish ").concat(postOrCommentOrVote.constructor.name, " even though they're banned until ").concat(author.banExpiresAt, ". Rejecting");
                            log("(".concat(challengeRequestId, "): "), msg);
                            return [2 /*return*/, msg];
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        msg = "Rejecting ".concat(postOrCommentOrVote.constructor.name, " because it doesn't have author.address");
                        log("(".concat(challengeRequestId, "): "), msg);
                        return [2 /*return*/, msg];
                    case 10:
                        if (!!(postOrCommentOrVote instanceof post_1.default)) return [3 /*break*/, 12];
                        parentCid = postOrCommentOrVote instanceof comment_1.Comment
                            ? postOrCommentOrVote.parentCid
                            : postOrCommentOrVote instanceof vote_1.default || postOrCommentOrVote instanceof comment_edit_1.CommentEdit
                                ? postOrCommentOrVote.commentCid
                                : undefined;
                        if (!parentCid) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_PARENT_CID_NOT_DEFINED];
                        }
                        return [4 /*yield*/, this.dbHandler.queryComment(parentCid)];
                    case 11:
                        parent_1 = _r.sent();
                        if (!parent_1) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST];
                        }
                        if (parent_1.timestamp > postOrCommentOrVote.timestamp) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT];
                        }
                        _r.label = 12;
                    case 12:
                        if (!(postOrCommentOrVote instanceof comment_1.Comment)) return [3 /*break*/, 14];
                        return [4 /*yield*/, (0, signatures_1.verifyComment)(postOrCommentOrVote, this.plebbit, false)];
                    case 13:
                        _g = _r.sent();
                        return [3 /*break*/, 19];
                    case 14:
                        if (!(postOrCommentOrVote instanceof vote_1.default)) return [3 /*break*/, 16];
                        return [4 /*yield*/, (0, signatures_1.verifyVote)(postOrCommentOrVote, this.plebbit, false)];
                    case 15:
                        _h = _r.sent();
                        return [3 /*break*/, 18];
                    case 16: return [4 /*yield*/, (0, signatures_1.verifyCommentEdit)(postOrCommentOrVote, this.plebbit, false)];
                    case 17:
                        _h = _r.sent();
                        _r.label = 18;
                    case 18:
                        _g = _h;
                        _r.label = 19;
                    case 19:
                        signatureValidity = _g;
                        if (!signatureValidity.valid) {
                            msg = "Author (".concat(postOrCommentOrVote.author.address, ") ").concat(postOrCommentOrVote.getType(), "'s signature is invalid due to '").concat(signatureValidity.reason, "'");
                            log("(".concat(challengeRequestId, "): "), msg);
                            return [2 /*return*/, signatureValidity.reason];
                        }
                        if (!(postOrCommentOrVote instanceof vote_1.default)) return [3 /*break*/, 21];
                        return [4 /*yield*/, this.handleVote(postOrCommentOrVote, challengeRequestId)];
                    case 20:
                        res = _r.sent();
                        if (res)
                            return [2 /*return*/, res];
                        return [3 /*break*/, 39];
                    case 21:
                        if (!(postOrCommentOrVote instanceof comment_edit_1.CommentEdit)) return [3 /*break*/, 23];
                        return [4 /*yield*/, this.handleCommentEdit(postOrCommentOrVote, challengeRequestId)];
                    case 22:
                        res = _r.sent();
                        if (res)
                            return [2 /*return*/, res];
                        return [3 /*break*/, 39];
                    case 23:
                        if (!(postOrCommentOrVote instanceof comment_1.Comment)) return [3 /*break*/, 39];
                        ipnsKeyName = (0, js_sha256_1.sha256)((0, util_1.encode)(postOrCommentOrVote.toJSONSkeleton()));
                        return [4 /*yield*/, this.dbHandler.querySigner(ipnsKeyName)];
                    case 24:
                        if (_r.sent()) {
                            msg = "Failed to insert ".concat(postOrCommentOrVote.constructor.name, " due to previous ").concat(postOrCommentOrVote.getType(), " having same ipns key name (duplicate?)");
                            log("(".concat(challengeRequestId, "): "), msg);
                            return [2 /*return*/, msg];
                        }
                        _j = signer_1.Signer.bind;
                        _k = [{}];
                        return [4 /*yield*/, this.plebbit.createSigner()];
                    case 25:
                        ipfsSigner = new (_j.apply(signer_1.Signer, [void 0, __assign.apply(void 0, [__assign.apply(void 0, _k.concat([(_r.sent())])), { ipnsKeyName: ipnsKeyName }])]))();
                        return [4 /*yield*/, this.dbHandler.insertSigner(ipfsSigner, undefined)];
                    case 26:
                        _r.sent();
                        _m = (_l = postOrCommentOrVote).setCommentIpnsKey;
                        return [4 /*yield*/, util_3.nativeFunctions.importSignerIntoIpfsNode(ipfsSigner, this.plebbit)];
                    case 27:
                        _m.apply(_l, [_r.sent()]);
                        if (!(postOrCommentOrVote instanceof post_1.default)) return [3 /*break*/, 33];
                        return [4 /*yield*/, this.dbHandler.createTransaction(challengeRequestId)];
                    case 28:
                        trx = _r.sent();
                        _p = (_o = postOrCommentOrVote).setPreviousCid;
                        return [4 /*yield*/, this.dbHandler.queryLatestPost(trx)];
                    case 29:
                        _p.apply(_o, [(_c = (_r.sent())) === null || _c === void 0 ? void 0 : _c.cid]);
                        return [4 /*yield*/, this.dbHandler.commitTransaction(challengeRequestId)];
                    case 30:
                        _r.sent();
                        postOrCommentOrVote.setDepth(0);
                        return [4 /*yield*/, this.plebbit.ipfsClient.add((0, util_1.encode)(postOrCommentOrVote.toJSONIpfs()))];
                    case 31:
                        file = _r.sent();
                        postOrCommentOrVote.setPostCid(file.path);
                        postOrCommentOrVote.setCid(file.path);
                        postOrCommentOrVote.original = lodash_1.default.pick(postOrCommentOrVote.toJSON(), ["author", "content", "flair"]);
                        return [4 /*yield*/, this.dbHandler.upsertComment(postOrCommentOrVote.toJSONForDb(challengeRequestId), postOrCommentOrVote.author.toJSONForDb(), undefined)];
                    case 32:
                        _r.sent();
                        postOrCommentOrVote.ipnsKeyName = postOrCommentOrVote.original = undefined; // so that ipnsKeyName and original would not be included in ChallengeVerification
                        log("(".concat(challengeRequestId, "): "), "New post with cid ".concat(postOrCommentOrVote.cid, " has been inserted into DB"));
                        return [3 /*break*/, 39];
                    case 33:
                        if (!(postOrCommentOrVote instanceof comment_1.Comment)) return [3 /*break*/, 39];
                        return [4 /*yield*/, this.dbHandler.createTransaction(challengeRequestId)];
                    case 34:
                        trx = _r.sent();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid, trx),
                                this.dbHandler.queryComment(postOrCommentOrVote.parentCid, trx)
                            ])];
                    case 35:
                        _q = _r.sent(), commentsUnderParent = _q[0], parent_2 = _q[1];
                        return [4 /*yield*/, this.dbHandler.commitTransaction(challengeRequestId)];
                    case 36:
                        _r.sent();
                        postOrCommentOrVote.setPreviousCid((_d = commentsUnderParent[0]) === null || _d === void 0 ? void 0 : _d.cid);
                        postOrCommentOrVote.setDepth(parent_2.depth + 1);
                        postOrCommentOrVote.setPostCid(parent_2.postCid);
                        return [4 /*yield*/, this.plebbit.ipfsClient.add((0, util_1.encode)(postOrCommentOrVote.toJSONIpfs()))];
                    case 37:
                        file = _r.sent();
                        postOrCommentOrVote.setCid(file.path);
                        postOrCommentOrVote.original = lodash_1.default.pick(postOrCommentOrVote.toJSON(), ["author", "content", "flair"]);
                        return [4 /*yield*/, this.dbHandler.upsertComment(postOrCommentOrVote.toJSONForDb(challengeRequestId), postOrCommentOrVote.author.toJSONForDb(), undefined)];
                    case 38:
                        _r.sent();
                        postOrCommentOrVote.ipnsKeyName = postOrCommentOrVote.original = undefined; // so that ipnsKeyName would not be included in ChallengeVerification
                        log("(".concat(challengeRequestId, "): "), "New comment with cid ".concat(postOrCommentOrVote.cid, " has been inserted into DB"));
                        _r.label = 39;
                    case 39: return [2 /*return*/, postOrCommentOrVote];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var log, decryptedRequest, _a, _b, _c, _d, providedChallenges, reasonForSkippingCaptcha, publicationOrReason, encryptedPublication, _e, toSignMsg, challengeVerification, _f, _g, toSignChallenge, challengeMessage, _h, _j;
            var _k, _l, _m, _o;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeRequest");
                        _a = [__assign({}, request)];
                        _k = {};
                        _c = (_b = JSON).parse;
                        return [4 /*yield*/, (0, signer_1.decrypt)(request.encryptedPublication.encrypted, request.encryptedPublication.encryptedKey, this.signer.privateKey)];
                    case 1:
                        decryptedRequest = __assign.apply(void 0, _a.concat([(_k.publication = _c.apply(_b, [_p.sent()]), _k)]));
                        this.emit("challengerequest", decryptedRequest);
                        return [4 /*yield*/, this.provideCaptchaCallback(decryptedRequest)];
                    case 2:
                        _d = _p.sent(), providedChallenges = _d[0], reasonForSkippingCaptcha = _d[1];
                        this._challengeToPublication[request.challengeRequestId] = decryptedRequest.publication;
                        log("Received a request to a challenge (".concat(request.challengeRequestId, ")"));
                        if (!(providedChallenges.length === 0)) return [3 /*break*/, 10];
                        // Subplebbit owner has chosen to skip challenging this user or post
                        log.trace("(".concat(request.challengeRequestId, "): No challenge is required"));
                        return [4 /*yield*/, this.dbHandler.upsertChallenge(request.toJSONForDb(), undefined)];
                    case 3:
                        _p.sent();
                        return [4 /*yield*/, this.storePublicationIfValid(decryptedRequest.publication, request.challengeRequestId)];
                    case 4:
                        publicationOrReason = _p.sent();
                        if (!(typeof publicationOrReason !== "string")) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, signer_1.encrypt)((0, util_1.encode)(publicationOrReason.toJSON()), publicationOrReason.signature.publicKey)];
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
                            protocolVersion: version_1.default.PROTOCOL_VERSION
                        };
                        _f = challenge_1.ChallengeVerificationMessage.bind;
                        _g = [__assign({}, toSignMsg)];
                        _l = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignMsg, this.signer)];
                    case 8:
                        challengeVerification = new (_f.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _g.concat([(_l.signature = _p.sent(), _l)]))]))();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.upsertChallenge(challengeVerification.toJSONForDb(), undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)((0, util_1.encode)(challengeVerification)))
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
                        return [4 /*yield*/, (0, signer_1.encrypt)((0, util_1.encode)(providedChallenges), decryptedRequest.publication.signature.publicKey)];
                    case 11:
                        toSignChallenge = (_m.encryptedChallenges = _p.sent(),
                            _m);
                        _h = challenge_1.ChallengeMessage.bind;
                        _j = [__assign({}, toSignChallenge)];
                        _o = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeMessage)(toSignChallenge, this.signer)];
                    case 12:
                        challengeMessage = new (_h.apply(challenge_1.ChallengeMessage, [void 0, __assign.apply(void 0, _j.concat([(_o.signature = _p.sent(), _o)]))]))();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.upsertChallenge(__assign(__assign({}, challengeMessage.toJSONForDb()), { challenges: providedChallenges }), undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)((0, util_1.encode)(challengeMessage)))
                            ])];
                    case 13:
                        _p.sent();
                        log("(".concat(request.challengeRequestId, "): "), "Published ".concat(challengeMessage.type, " over pubsub: "), lodash_1.default.omit(toSignChallenge, ["encryptedChallenges"]));
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
                        return [4 /*yield*/, (0, signer_1.decrypt)(challengeAnswer.encryptedChallengeAnswers.encrypted, challengeAnswer.encryptedChallengeAnswers.encryptedKey, (_a = this.signer) === null || _a === void 0 ? void 0 : _a.privateKey)];
                    case 1:
                        decryptedAnswers = _c.apply(_b, [_m.sent()]);
                        decryptedChallengeAnswer = __assign(__assign({}, challengeAnswer), { challengeAnswers: decryptedAnswers });
                        this.emit("challengeanswer", decryptedChallengeAnswer);
                        return [4 /*yield*/, this.validateCaptchaAnswerCallback(decryptedChallengeAnswer)];
                    case 2:
                        _d = _m.sent(), challengeSuccess = _d[0], challengeErrors = _d[1];
                        if (!challengeSuccess) return [3 /*break*/, 10];
                        log.trace("(".concat(challengeAnswer.challengeRequestId, "): "), "User has been answered correctly");
                        storedPublication = this._challengeToPublication[challengeAnswer.challengeRequestId];
                        return [4 /*yield*/, this.dbHandler.upsertChallenge(__assign(__assign({}, challengeAnswer.toJSONForDb()), { challengeAnswers: decryptedChallengeAnswer.challengeAnswers }), undefined)];
                    case 3:
                        _m.sent();
                        return [4 /*yield*/, this.storePublicationIfValid(storedPublication, challengeAnswer.challengeRequestId)];
                    case 4:
                        publicationOrReason = _m.sent();
                        if (!(typeof publicationOrReason !== "string")) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, signer_1.encrypt)((0, util_1.encode)(publicationOrReason.toJSON()), publicationOrReason.signature.publicKey)];
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
                            protocolVersion: version_1.default.PROTOCOL_VERSION
                        };
                        _f = challenge_1.ChallengeVerificationMessage.bind;
                        _g = [__assign({}, toSignMsg)];
                        _k = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignMsg, this.signer)];
                    case 8:
                        challengeVerification = new (_f.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _g.concat([(_k.signature = _m.sent(), _k)]))]))();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.upsertChallenge(challengeVerification.toJSONForDb(), undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)((0, util_1.encode)(challengeVerification)))
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
                            protocolVersion: version_1.default.PROTOCOL_VERSION
                        };
                        _h = challenge_1.ChallengeVerificationMessage.bind;
                        _j = [__assign({}, toSignVerification)];
                        _l = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignVerification, this.signer)];
                    case 11:
                        challengeVerification = new (_h.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _j.concat([(_l.signature = _m.sent(), _l)]))]))();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.upsertChallenge(challengeVerification.toJSONForDb(), undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)((0, util_1.encode)(challengeVerification)))
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
                            protocolVersion: version_1.default.PROTOCOL_VERSION
                        };
                        _b = challenge_1.ChallengeVerificationMessage.bind;
                        _c = [__assign({}, toSignVerification)];
                        _d = {};
                        return [4 /*yield*/, (0, signatures_1.signChallengeVerification)(toSignVerification, this.signer)];
                    case 5:
                        challengeVerification = new (_b.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _c.concat([(_d.signature = _e.sent(), _d)]))]))();
                        return [4 /*yield*/, this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)((0, util_1.encode)(challengeVerification)))];
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
            var log, msgParsed, e_4;
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
                        return [4 /*yield*/, this.handleChallengeAnswer(new challenge_1.ChallengeAnswerMessage(msgParsed))];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 11];
                    case 8:
                        e_4 = _a.sent();
                        e_4.message = "failed process captcha for challenge request id (".concat(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId, "): ").concat(e_4.message);
                        log.error("(".concat(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId, "): "), e_4);
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
                        return [2 /*return*/, [
                                [
                                    {
                                        challenge: image,
                                        type: "image"
                                    }
                                ],
                                undefined
                            ]];
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
            var signerRaw, commentIpnsSigner, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dbComment._initCommentUpdate(options);
                        return [4 /*yield*/, this.dbHandler.querySigner(dbComment.ipnsKeyName)];
                    case 1:
                        signerRaw = _a.sent();
                        if (!signerRaw)
                            throw Error("Comment ".concat(dbComment.cid, " IPNS signer is not stored in DB"));
                        commentIpnsSigner = new signer_1.Signer(signerRaw);
                        return [4 /*yield*/, this._importSignerIntoIpfsIfNeeded(commentIpnsSigner)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.add((0, util_1.encode)(__assign(__assign({}, dbComment.toJSONCommentUpdate()), { signature: options.signature })))];
                    case 3:
                        file = _a.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.name.publish(file.path, {
                                lifetime: "72h",
                                key: dbComment.ipnsKeyName,
                                allowOffline: true
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.syncComment = function (dbComment) {
        return __awaiter(this, void 0, void 0, function () {
            var log, commentIpns, _a, e_5, _b, _c, _d, subplebbitSignature;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync:syncComment");
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 4, , 5]);
                        _a = dbComment.ipnsName;
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(dbComment.ipnsName, this.plebbit)];
                    case 2:
                        _a = (_e.sent());
                        _e.label = 3;
                    case 3:
                        commentIpns = _a;
                        return [3 /*break*/, 5];
                    case 4:
                        e_5 = _e.sent();
                        log.trace("Failed to load Comment (".concat(dbComment.cid, ") IPNS (").concat(dbComment.ipnsName, ") while syncing. Will attempt to publish a new IPNS record"));
                        return [3 /*break*/, 5];
                    case 5:
                        if (!(!commentIpns ||
                            !lodash_1.default.isEqual(lodash_1.default.omit(commentIpns, ["replies", "signature"]), (0, util_1.removeKeysWithUndefinedValues)(lodash_1.default.omit(dbComment.toJSONCommentUpdate(), ["replies", "signature"]))))) return [3 /*break*/, 11];
                        log.trace("Attempting to update Comment (".concat(dbComment.cid, ")"));
                        return [4 /*yield*/, this.sortHandler.deleteCommentPageCache(dbComment)];
                    case 6:
                        _e.sent();
                        _b = dbComment.author;
                        return [4 /*yield*/, this.dbHandler.querySubplebbitAuthorFields(dbComment.cid)];
                    case 7:
                        _b.subplebbit = _e.sent();
                        dbComment.setUpdatedAt((0, util_1.timestamp)());
                        return [4 /*yield*/, this.dbHandler.upsertComment(dbComment.toJSONForDb(undefined), dbComment.author.toJSONForDb(), undefined)];
                    case 8:
                        _e.sent(); // Need to insert comment in DB before generating pages so props updated above would be included in pages
                        _d = (_c = dbComment).setReplies;
                        return [4 /*yield*/, this.sortHandler.generatePagesUnderComment(dbComment, undefined)];
                    case 9:
                        _d.apply(_c, [_e.sent()]);
                        return [4 /*yield*/, (0, signatures_1.signCommentUpdate)(dbComment.toJSONCommentUpdate(), this.signer)];
                    case 10:
                        subplebbitSignature = _e.sent();
                        return [2 /*return*/, this._publishCommentIpns(dbComment, __assign(__assign({}, dbComment.toJSONCommentUpdate()), { signature: subplebbitSignature }))];
                    case 11:
                        log.trace("Comment (".concat(dbComment.cid, ") is up-to-date and does not need syncing"));
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.syncIpnsWithDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, dbComments, e_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync");
                        log.trace("Starting to sync IPNS with DB");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.dbHandler.queryComments()];
                    case 2:
                        dbComments = _a.sent();
                        return [4 /*yield*/, Promise.all(dbComments.map(function (commentProps) { return __awaiter(_this, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = this.syncComment;
                                        return [4 /*yield*/, this.plebbit.createComment(commentProps)];
                                    case 1: return [2 /*return*/, _a.apply(this, [_b.sent()])];
                                }
                            }); }); }))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.sortHandler.cacheCommentsPages()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.updateSubplebbitIpns()];
                    case 5:
                        _a.sent();
                        exports.RUNNING_SUBPLEBBITS[this.signer.address] = true;
                        return [4 /*yield*/, this.dbHandler.keyvSet(constants_1.CACHE_KEYS[constants_1.CACHE_KEYS.INTERNAL_SUBPLEBBIT], this.toJSONInternal())];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_6 = _a.sent();
                        log.error("Failed to sync due to error,", e_6);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
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
                        if (this._sync || exports.RUNNING_SUBPLEBBITS[this.signer.address])
                            (0, util_1.throwWithErrorCode)("ERR_SUB_ALREADY_STARTED", "address: ".concat(this.address));
                        this._sync = true;
                        exports.RUNNING_SUBPLEBBITS[this.signer.address] = true;
                        if (!this.provideCaptchaCallback) {
                            log("Subplebbit owner has not provided any captcha. Will go with default image captcha");
                            this.provideCaptchaCallback = this.defaultProvideCaptcha;
                            this.validateCaptchaAnswerCallback = this.defaultValidateCaptcha;
                        }
                        if (typeof this.pubsubTopic !== "string") {
                            this.pubsubTopic = this.address;
                            log("Defaulted subplebbit (".concat(this.address, ") pubsub topic to ").concat(this.pubsubTopic, " since sub owner hasn't provided any"));
                        }
                        if (typeof this.createdAt !== "number") {
                            this.createdAt = (0, util_1.timestamp)();
                            log("Subplebbit (".concat(this.address, ") createdAt has been set to ").concat(this.createdAt));
                        }
                        return [4 /*yield*/, this.plebbit.pubsubIpfsClient.pubsub.subscribe(this.pubsubTopic, function (pubsubMessage) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.handleChallengeExchange(pubsubMessage)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _b.sent();
                        log.trace("Waiting for publications on pubsub topic (".concat(this.pubsubTopic, ")"));
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
        return __awaiter(this, void 0, void 0, function () {
            var resolvedAddress, e_7, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.stop()];
                    case 1:
                        _b.sent();
                        if (typeof this.plebbit.dataPath !== "string")
                            (0, util_1.throwWithErrorCode)("ERR_DATA_PATH_IS_NOT_DEFINED", "delete: plebbitOptions.dataPath=".concat(this.plebbit.dataPath));
                        if (!this.plebbit.ipfsClient)
                            throw Error("Ipfs client is not defined");
                        return [4 /*yield*/, util_3.nativeFunctions.deleteSubplebbit(this.address, this.plebbit.dataPath)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address)];
                    case 3:
                        resolvedAddress = _b.sent();
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.plebbit.ipfsClient.pin.rm(resolvedAddress)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_7 = _b.sent();
                        if (!e_7.message.includes("not pinned"))
                            throw e_7;
                        return [3 /*break*/, 7];
                    case 7: 
                    // block.rm requires CID.parse but it throws an error in Electron. Most likely due to context isolation
                    //@ts-ignore
                    return [4 /*yield*/, this.plebbit.ipfsClient.block.rm(resolvedAddress, { force: true })];
                    case 8:
                        // block.rm requires CID.parse but it throws an error in Electron. Most likely due to context isolation
                        //@ts-ignore
                        _b.sent();
                        if (!this.signer.ipnsKeyName) return [3 /*break*/, 12];
                        _b.label = 9;
                    case 9:
                        _b.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, this.plebbit.ipfsClient.key.rm(this.signer.ipnsKeyName)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        _a = _b.sent();
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._addPublicationToDb = function (publication) {
        return __awaiter(this, void 0, void 0, function () {
            var log, decryptedRequestType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:_addPublicationToDb");
                        log("Adding ".concat(publication.getType(), " to DB with author,"), (0, util_1.removeKeysWithUndefinedValues)(publication.author));
                        decryptedRequestType = {
                            type: "CHALLENGEREQUEST",
                            challengeRequestId: (0, uuid_1.v4)(),
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            userAgent: version_1.default.USER_AGENT
                        };
                        return [4 /*yield*/, this.dbHandler.upsertChallenge(decryptedRequestType)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.storePublicationIfValid(publication.toJSON(), decryptedRequestType.challengeRequestId)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Subplebbit;
}(events_1.default));
exports.Subplebbit = Subplebbit;
