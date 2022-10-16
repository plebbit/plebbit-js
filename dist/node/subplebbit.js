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
var util_3 = require("./runtime/node/util");
var version_1 = __importDefault(require("./version"));
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
        this.database = mergedProps.database;
        this.address = mergedProps.address;
        this.ipnsKeyName = mergedProps.ipnsKeyName;
        this.pubsubTopic = mergedProps.pubsubTopic;
        this.challengeTypes = mergedProps.challengeTypes;
        this.metricsCid = mergedProps.metricsCid;
        this.createdAt = mergedProps.createdAt;
        this.updatedAt = mergedProps.updatedAt;
        this.signer = mergedProps.signer;
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
    Subplebbit.prototype.initSignerIfNeeded = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var log, dbSigner;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:prePublish");
                        if (!this.dbHandler) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.dbHandler.querySubplebbitSigner(undefined)];
                    case 1:
                        dbSigner = _b.sent();
                        if (!!dbSigner) return [3 /*break*/, 3];
                        log.trace("Subplebbit has no signer in DB, will insert provided signer from createSubplebbitOptions into DB");
                        return [4 /*yield*/, this.dbHandler.insertSigner(__assign(__assign({}, this.signer), { ipnsKeyName: this.signer.address, usage: "subplebbit" }), undefined)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        if (!this.signer) {
                            log.trace("Subplebbit loaded signer from DB");
                            this.signer = dbSigner;
                        }
                        _b.label = 4;
                    case 4:
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
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.dbHandler) {
                            this.dbHandler = util_3.nativeFunctions.createDbHandler({
                                address: this.address,
                                database: this.database,
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
                        return [4 /*yield*/, this.initSignerIfNeeded()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
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
        return __assign(__assign({}, this.toJSON()), { ipnsKeyName: this.ipnsKeyName, database: this.database, signer: this.signer });
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
    // TODO rename and make this private
    Subplebbit.prototype.prePublish = function () {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var log, subplebbitIpfsNodeKey, error, e_1, ipfsKey, cachedSubplebbit, _e, _f, _g;
            var _this = this;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:prePublish");
                        if (!this.address && ((_a = this.signer) === null || _a === void 0 ? void 0 : _a.address))
                            this.address = this.signer.address;
                        return [4 /*yield*/, this.initDbIfNeeded()];
                    case 1:
                        _h.sent();
                        _h.label = 2;
                    case 2:
                        _h.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.plebbit.ipfsClient.key.list()];
                    case 3:
                        subplebbitIpfsNodeKey = (_h.sent()).filter(function (key) { return key.name === _this.signer.address; })[0];
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _h.sent();
                        error = e_1;
                        return [3 /*break*/, 5];
                    case 5:
                        if (error)
                            throw Error("Failed to list keys from ipfs node due to error: ".concat(error));
                        if (!this.signer)
                            throw Error("Failed to import subplebbit.signer into ipfs node since it's undefined");
                        if (!!subplebbitIpfsNodeKey) return [3 /*break*/, 7];
                        return [4 /*yield*/, util_3.nativeFunctions.importSignerIntoIpfsNode(__assign(__assign({}, this.signer), { ipnsKeyName: this.signer.address }), this.plebbit)];
                    case 6:
                        ipfsKey = _h.sent();
                        this.ipnsKeyName = ipfsKey.Name;
                        log("Imported subplebbit keys into ipfs node,", ipfsKey);
                        return [3 /*break*/, 8];
                    case 7:
                        log.trace("Subplebbit key is already in ipfs node, no need to import key, ", subplebbitIpfsNodeKey);
                        this.ipnsKeyName = subplebbitIpfsNodeKey["name"] || subplebbitIpfsNodeKey["Name"];
                        _h.label = 8;
                    case 8: return [4 /*yield*/, ((_b = this.dbHandler) === null || _b === void 0 ? void 0 : _b.keyvGet(this.address))];
                    case 9:
                        cachedSubplebbit = _h.sent();
                        if (cachedSubplebbit && JSON.stringify(cachedSubplebbit) !== "{}")
                            this.initSubplebbit(cachedSubplebbit); // Init subplebbit fields from DB
                        if (!this.pubsubTopic) {
                            this.pubsubTopic = this.address;
                            log("Defaulted subplebbit (".concat(this.address, ") pubsub topic to ").concat(this.pubsubTopic, " since sub owner hasn't provided any"));
                        }
                        if (!this.createdAt) {
                            this.createdAt = (0, util_1.timestamp)();
                            log("Subplebbit (".concat(this.address, ") createdAt has been set to ").concat(this.createdAt));
                        }
                        _e = JSON.stringify(this.toJSON());
                        _g = (_f = JSON).stringify;
                        return [4 /*yield*/, ((_c = this.dbHandler) === null || _c === void 0 ? void 0 : _c.keyvGet(this.address))];
                    case 10:
                        if (!(_e !== _g.apply(_f, [_h.sent()]))) return [3 /*break*/, 12];
                        return [4 /*yield*/, ((_d = this.dbHandler) === null || _d === void 0 ? void 0 : _d.keyvSet(this.address, this.toJSON()))];
                    case 11:
                        _h.sent();
                        _h.label = 12;
                    case 12: return [2 /*return*/];
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
                            throw (0, err_code_1.default)(Error(errors_1.messages.ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS), errors_1.codes.ERR_ENS_SUB_ADDRESS_TXT_RECORD_POINT_TO_DIFFERENT_ADDRESS, {
                                details: "subplebbit.address (".concat(this.address, "), resolved address (").concat(resolvedAddress, "), subplebbit.signer.address (").concat((_a = this.signer) === null || _a === void 0 ? void 0 : _a.address, ")")
                            });
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
                                database: this.database,
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
                        return [4 /*yield*/, this.dbHandler.keyvSet(this.address, this.toJSON())];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Subplebbit.prototype.updateOnce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, e_2, updateError, ipnsAddress, subplebbitIpns, _a, verified, failedVerificationReason, e_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:update");
                        if (!this.plebbit.resolver.isDomain(this.address)) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.assertDomainResolvesCorrectly(this.address)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _b.sent();
                        updateError = (0, err_code_1.default)(e_2, e_2.code, { details: "subplebbit.update: ".concat(e_2.details) });
                        log.error(updateError);
                        this.emit("error", updateError);
                        return [2 /*return*/];
                    case 4: return [4 /*yield*/, this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address)];
                    case 5:
                        ipnsAddress = _b.sent();
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 9, , 10]);
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(ipnsAddress, this.plebbit)];
                    case 7:
                        subplebbitIpns = _b.sent();
                        return [4 /*yield*/, (0, signer_1.verifyPublication)(subplebbitIpns, this.plebbit, "subplebbit")];
                    case 8:
                        _a = _b.sent(), verified = _a[0], failedVerificationReason = _a[1];
                        if (!verified)
                            throw (0, err_code_1.default)(Error(errors_1.messages.ERR_FAILED_TO_VERIFY_SIGNATURE), errors_1.codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
                                details: "subplebbit.update: Subplebbit (".concat(this.address, ") IPNS (").concat(ipnsAddress, ") signature is invalid. Will not update: ").concat(failedVerificationReason)
                            });
                        if (JSON.stringify(this.toJSON()) !== JSON.stringify(subplebbitIpns)) {
                            this.initSubplebbit(subplebbitIpns);
                            log("Remote Subplebbit received a new update. Will emit an update event");
                            this.emit("update", this);
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        e_3 = _b.sent();
                        log.error("Failed to update subplebbit IPNS, error:", e_3);
                        this.emit("error", e_3);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var log, trx, latestPost, _c, metrics, subplebbitPosts, resolvedAddress, currentIpns, e_4, _d, lastPublishOverTwentyMinutes, _e, subIpnsCacheKey, file;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync");
                        return [4 /*yield*/, this.dbHandler.createTransaction("subplebbit")];
                    case 1:
                        trx = _f.sent();
                        return [4 /*yield*/, this.dbHandler.queryLatestPost(trx)];
                    case 2:
                        latestPost = _f.sent();
                        return [4 /*yield*/, this.dbHandler.commitTransaction("subplebbit")];
                    case 3:
                        _f.sent();
                        this.lastPostCid = latestPost === null || latestPost === void 0 ? void 0 : latestPost.cid;
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.querySubplebbitMetrics(undefined),
                                this.sortHandler.generatePagesUnderComment(undefined, undefined)
                            ])];
                    case 4:
                        _c = _f.sent(), metrics = _c[0], subplebbitPosts = _c[1];
                        return [4 /*yield*/, this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address)];
                    case 5:
                        resolvedAddress = _f.sent();
                        _f.label = 6;
                    case 6:
                        _f.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(resolvedAddress, this.plebbit)];
                    case 7:
                        currentIpns = _f.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_4 = _f.sent();
                        log("Subplebbit IPNS (".concat(resolvedAddress, ") is not defined, will publish a new record"));
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
                        _d = this;
                        return [4 /*yield*/, this.plebbit.ipfsClient.add(JSON.stringify(metrics))];
                    case 10:
                        _d.metricsCid = (_f.sent()).path;
                        lastPublishOverTwentyMinutes = this.updatedAt < (0, util_1.timestamp)() - 60 * 20;
                        if (!(!currentIpns || JSON.stringify(currentIpns) !== JSON.stringify(this.toJSON()) || lastPublishOverTwentyMinutes)) return [3 /*break*/, 15];
                        this.updatedAt = (0, util_1.timestamp)();
                        _e = this;
                        return [4 /*yield*/, (0, signer_1.signPublication)(this.toJSON(), this.signer, this.plebbit, "subplebbit")];
                    case 11:
                        _e.signature = _f.sent();
                        subIpnsCacheKey = (0, js_sha256_1.sha256)("ipns" + this.address);
                        return [4 /*yield*/, ((_b = this.dbHandler) === null || _b === void 0 ? void 0 : _b.keyvSet(subIpnsCacheKey, this.toJSON()))];
                    case 12:
                        _f.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.add(JSON.stringify(this.toJSON()))];
                    case 13:
                        file = _f.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.name.publish(file.path, {
                                lifetime: "72h",
                                key: this.ipnsKeyName,
                                allowOffline: true
                            })];
                    case 14:
                        _f.sent();
                        this.emit("update", this);
                        log.trace("Published a new IPNS record for sub(".concat(this.address, ")"));
                        _f.label = 15;
                    case 15: return [2 /*return*/];
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
                        return [2 /*return*/, msg];
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
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var log, postOrCommentOrVote, _g, _h, author, msg, msg, parentCid, parent_1, derivedAddress, resolvedAddress, msg, _j, signatureIsVerified, failedVerificationReason, msg, res, res, ipnsKeyName, msg, ipfsSigner, _k, _l, _m, _o, trx, _p, _q, file, trx, _r, commentsUnderParent, parent_2, file;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeExchange:storePublicationIfValid");
                        delete this._challengeToSolution[challengeRequestId];
                        delete this._challengeToPublication[challengeRequestId];
                        if (!publication.hasOwnProperty("vote")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.plebbit.createVote(publication)];
                    case 1:
                        _g = _s.sent();
                        return [3 /*break*/, 7];
                    case 2:
                        if (!publication["commentCid"]) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.plebbit.createCommentEdit(publication)];
                    case 3:
                        _h = _s.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.plebbit.createComment(publication)];
                    case 5:
                        _h = _s.sent();
                        _s.label = 6;
                    case 6:
                        _g = _h;
                        _s.label = 7;
                    case 7:
                        postOrCommentOrVote = _g;
                        if (!((_a = postOrCommentOrVote === null || postOrCommentOrVote === void 0 ? void 0 : postOrCommentOrVote.author) === null || _a === void 0 ? void 0 : _a.address)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.dbHandler.queryAuthor(postOrCommentOrVote.author.address)];
                    case 8:
                        author = _s.sent();
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
                        parent_1 = _s.sent();
                        if (!parent_1) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_PARENT_DOES_NOT_EXIST];
                        }
                        if (parent_1.timestamp > postOrCommentOrVote.timestamp) {
                            log("(".concat(challengeRequestId, "): "), errors_1.messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT);
                            return [2 /*return*/, errors_1.messages.ERR_SUB_COMMENT_TIMESTAMP_IS_EARLIER_THAN_PARENT];
                        }
                        _s.label = 12;
                    case 12:
                        if (!this.plebbit.resolver.isDomain(publication.author.address)) return [3 /*break*/, 15];
                        return [4 /*yield*/, (0, util_2.getPlebbitAddressFromPublicKeyPem)(postOrCommentOrVote.signature.publicKey)];
                    case 13:
                        derivedAddress = _s.sent();
                        return [4 /*yield*/, this.plebbit.resolver.resolveAuthorAddressIfNeeded(publication.author.address)];
                    case 14:
                        resolvedAddress = _s.sent();
                        if (resolvedAddress !== derivedAddress) {
                            msg = "domain (".concat(postOrCommentOrVote.author.address, ") plebbit-author-address (").concat(resolvedAddress, ") does not have the same signer address (").concat((_c = this.signer) === null || _c === void 0 ? void 0 : _c.address, ")");
                            log("(".concat(challengeRequestId, "): "), msg);
                            return [2 /*return*/, msg];
                        }
                        _s.label = 15;
                    case 15: return [4 /*yield*/, (0, signer_1.verifyPublication)(postOrCommentOrVote, this.plebbit, postOrCommentOrVote.getType())];
                    case 16:
                        _j = _s.sent(), signatureIsVerified = _j[0], failedVerificationReason = _j[1];
                        if (!signatureIsVerified) {
                            msg = "Author (".concat(postOrCommentOrVote.author.address, ") ").concat(postOrCommentOrVote.getType(), "'s signature is invalid: ").concat(failedVerificationReason);
                            log("(".concat(challengeRequestId, "): "), msg);
                            return [2 /*return*/, msg];
                        }
                        if (!(postOrCommentOrVote instanceof vote_1.default)) return [3 /*break*/, 18];
                        return [4 /*yield*/, this.handleVote(postOrCommentOrVote, challengeRequestId)];
                    case 17:
                        res = _s.sent();
                        if (res)
                            return [2 /*return*/, res];
                        return [3 /*break*/, 36];
                    case 18:
                        if (!(postOrCommentOrVote instanceof comment_edit_1.CommentEdit)) return [3 /*break*/, 20];
                        return [4 /*yield*/, this.handleCommentEdit(postOrCommentOrVote, challengeRequestId)];
                    case 19:
                        res = _s.sent();
                        if (res)
                            return [2 /*return*/, res];
                        return [3 /*break*/, 36];
                    case 20:
                        if (!(postOrCommentOrVote instanceof comment_1.Comment)) return [3 /*break*/, 36];
                        ipnsKeyName = (0, js_sha256_1.sha256)(JSON.stringify(postOrCommentOrVote.toJSONSkeleton()));
                        return [4 /*yield*/, ((_d = this.dbHandler) === null || _d === void 0 ? void 0 : _d.querySigner(ipnsKeyName))];
                    case 21:
                        if (_s.sent()) {
                            msg = "Failed to insert ".concat(postOrCommentOrVote.constructor.name, " due to previous ").concat(postOrCommentOrVote.getType(), " having same ipns key name (duplicate?)");
                            log("(".concat(challengeRequestId, "): "), msg);
                            return [2 /*return*/, msg];
                        }
                        _k = signer_1.Signer.bind;
                        _l = [{}];
                        return [4 /*yield*/, this.plebbit.createSigner()];
                    case 22:
                        ipfsSigner = new (_k.apply(signer_1.Signer, [void 0, __assign.apply(void 0, [__assign.apply(void 0, _l.concat([(_s.sent())])), { ipnsKeyName: ipnsKeyName, usage: "comment" }])]))();
                        return [4 /*yield*/, this.dbHandler.insertSigner(ipfsSigner, undefined)];
                    case 23:
                        _s.sent();
                        _o = (_m = postOrCommentOrVote).setCommentIpnsKey;
                        return [4 /*yield*/, util_3.nativeFunctions.importSignerIntoIpfsNode(ipfsSigner, this.plebbit)];
                    case 24:
                        _o.apply(_m, [_s.sent()]);
                        if (!(postOrCommentOrVote instanceof post_1.default)) return [3 /*break*/, 30];
                        return [4 /*yield*/, this.dbHandler.createTransaction(challengeRequestId)];
                    case 25:
                        trx = _s.sent();
                        _q = (_p = postOrCommentOrVote).setPreviousCid;
                        return [4 /*yield*/, this.dbHandler.queryLatestPost(trx)];
                    case 26:
                        _q.apply(_p, [(_e = (_s.sent())) === null || _e === void 0 ? void 0 : _e.cid]);
                        return [4 /*yield*/, this.dbHandler.commitTransaction(challengeRequestId)];
                    case 27:
                        _s.sent();
                        postOrCommentOrVote.setDepth(0);
                        return [4 /*yield*/, this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()))];
                    case 28:
                        file = _s.sent();
                        postOrCommentOrVote.setPostCid(file.path);
                        postOrCommentOrVote.setCid(file.path);
                        return [4 /*yield*/, this.dbHandler.upsertComment(postOrCommentOrVote.toJSONForDb(challengeRequestId), postOrCommentOrVote.author.toJSONForDb(), undefined)];
                    case 29:
                        _s.sent();
                        log("(".concat(challengeRequestId, "): "), "New post with cid ".concat(postOrCommentOrVote.cid, " has been inserted into DB"));
                        return [3 /*break*/, 36];
                    case 30:
                        if (!(postOrCommentOrVote instanceof comment_1.Comment)) return [3 /*break*/, 36];
                        return [4 /*yield*/, this.dbHandler.createTransaction(challengeRequestId)];
                    case 31:
                        trx = _s.sent();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid, trx),
                                this.dbHandler.queryComment(postOrCommentOrVote.parentCid, trx)
                            ])];
                    case 32:
                        _r = _s.sent(), commentsUnderParent = _r[0], parent_2 = _r[1];
                        return [4 /*yield*/, this.dbHandler.commitTransaction(challengeRequestId)];
                    case 33:
                        _s.sent();
                        postOrCommentOrVote.setPreviousCid((_f = commentsUnderParent[0]) === null || _f === void 0 ? void 0 : _f.cid);
                        postOrCommentOrVote.setDepth(parent_2.depth + 1);
                        return [4 /*yield*/, this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()))];
                    case 34:
                        file = _s.sent();
                        postOrCommentOrVote.setCid(file.path);
                        postOrCommentOrVote.setPostCid(parent_2.postCid);
                        return [4 /*yield*/, this.dbHandler.upsertComment(postOrCommentOrVote.toJSONForDb(challengeRequestId), postOrCommentOrVote.author.toJSONForDb(), undefined)];
                    case 35:
                        _s.sent();
                        log("(".concat(challengeRequestId, "): "), "New comment with cid ".concat(postOrCommentOrVote.cid, " has been inserted into DB"));
                        _s.label = 36;
                    case 36: return [2 /*return*/, postOrCommentOrVote];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var log, decryptedRequest, _a, _b, _c, _d, providedChallenges, reasonForSkippingCaptcha, publicationOrReason, encryptedPublication, _e, toSignMsg, challengeVerification, _f, _g, toSignChallenge, challengeSignature, challengeMessage;
            var _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:handleChallengeRequest");
                        _a = [__assign({}, request)];
                        _h = {};
                        _c = (_b = JSON).parse;
                        return [4 /*yield*/, (0, signer_1.decrypt)(request.encryptedPublication.encrypted, request.encryptedPublication.encryptedKey, this.signer.privateKey)];
                    case 1:
                        decryptedRequest = __assign.apply(void 0, _a.concat([(_h.publication = _c.apply(_b, [_l.sent()]), _h)]));
                        this.emit("challengerequest", decryptedRequest);
                        return [4 /*yield*/, this.provideCaptchaCallback(decryptedRequest)];
                    case 2:
                        _d = _l.sent(), providedChallenges = _d[0], reasonForSkippingCaptcha = _d[1];
                        this._challengeToPublication[request.challengeRequestId] = decryptedRequest.publication;
                        log("Received a request to a challenge (".concat(request.challengeRequestId, ")"));
                        if (!(providedChallenges.length === 0)) return [3 /*break*/, 10];
                        // Subplebbit owner has chosen to skip challenging this user or post
                        log.trace("(".concat(request.challengeRequestId, "): No challenge is required"));
                        return [4 /*yield*/, this.dbHandler.upsertChallenge(request.toJSONForDb(), undefined)];
                    case 3:
                        _l.sent();
                        return [4 /*yield*/, this.storePublicationIfValid(decryptedRequest.publication, request.challengeRequestId)];
                    case 4:
                        publicationOrReason = _l.sent();
                        if (!(typeof publicationOrReason !== "string")) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, signer_1.encrypt)(JSON.stringify(publicationOrReason), publicationOrReason.signature.publicKey)];
                    case 5:
                        _e = _l.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _e = undefined;
                        _l.label = 7;
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
                        _j = {};
                        return [4 /*yield*/, (0, signer_1.signPublication)(toSignMsg, this.signer, this.plebbit, "challengeverificationmessage")];
                    case 8:
                        challengeVerification = new (_f.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _g.concat([(_j.signature = _l.sent(), _j)]))]))();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.upsertChallenge(challengeVerification.toJSONForDb(), undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeVerification)))
                            ])];
                    case 9:
                        _l.sent();
                        log("(".concat(request.challengeRequestId, "): "), "Published ".concat(challengeVerification.type, " over pubsub: "), (0, util_1.removeKeys)(toSignMsg, ["encryptedPublication"]));
                        this.emit("challengeverification", __assign(__assign({}, challengeVerification), { publication: decryptedRequest.publication }));
                        return [3 /*break*/, 14];
                    case 10:
                        _k = {
                            type: "CHALLENGE",
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            userAgent: version_1.default.USER_AGENT,
                            challengeRequestId: request.challengeRequestId
                        };
                        return [4 /*yield*/, (0, signer_1.encrypt)(JSON.stringify(providedChallenges), decryptedRequest.publication.signature.publicKey)];
                    case 11:
                        toSignChallenge = (_k.encryptedChallenges = _l.sent(),
                            _k);
                        return [4 /*yield*/, (0, signer_1.signPublication)(toSignChallenge, this.signer, this.plebbit, "challengemessage")];
                    case 12:
                        challengeSignature = _l.sent();
                        challengeMessage = new challenge_1.ChallengeMessage(__assign(__assign({}, toSignChallenge), { signature: challengeSignature }));
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.upsertChallenge(__assign(__assign({}, challengeMessage.toJSONForDb()), { challenges: providedChallenges }), undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeMessage)))
                            ])];
                    case 13:
                        _l.sent();
                        log("(".concat(request.challengeRequestId, "): "), "Published ".concat(challengeMessage.type, " over pubsub: "), (0, util_1.removeKeys)(toSignChallenge, ["encryptedChallenges"]));
                        this.emit("challengemessage", __assign(__assign({}, challengeMessage), { challenges: providedChallenges }));
                        _l.label = 14;
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
                        return [4 /*yield*/, (0, signer_1.encrypt)(JSON.stringify(publicationOrReason), publicationOrReason.signature.publicKey)];
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
                        return [4 /*yield*/, (0, signer_1.signPublication)(toSignMsg, this.signer, this.plebbit, "challengeverificationmessage")];
                    case 8:
                        challengeVerification = new (_f.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _g.concat([(_k.signature = _m.sent(), _k)]))]))();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.upsertChallenge(challengeVerification.toJSONForDb(), undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeVerification)))
                            ])];
                    case 9:
                        _m.sent();
                        log("(".concat(challengeAnswer.challengeRequestId, "): "), "Published ".concat(challengeVerification.type, " over pubsub:"), (0, util_1.removeKeys)(toSignMsg, ["encryptedPublication"]));
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
                        return [4 /*yield*/, (0, signer_1.signPublication)(toSignVerification, this.signer, this.plebbit, "challengeverificationmessage")];
                    case 11:
                        challengeVerification = new (_h.apply(challenge_1.ChallengeVerificationMessage, [void 0, __assign.apply(void 0, _j.concat([(_l.signature = _m.sent(), _l)]))]))();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.upsertChallenge(challengeVerification.toJSONForDb(), undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeVerification)))
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
            var _a, signatureIsVerified, failedVerificationReason;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, signer_1.verifyPublication)(msgParsed, this.plebbit, msgParsed.type === "CHALLENGEANSWER" ? "challengeanswermessage" : "challengerequestmessage")];
                    case 1:
                        _a = _b.sent(), signatureIsVerified = _a[0], failedVerificationReason = _a[1];
                        if (!signatureIsVerified)
                            throw (0, err_code_1.default)(Error(errors_1.messages.ERR_FAILED_TO_VERIFY_SIGNATURE), errors_1.codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
                                details: "subplebbit.handleChallengeExchange: Failed to verify ".concat(msgParsed.type, ", Failed verification reason: ").concat(failedVerificationReason)
                            });
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeExchange = function (pubsubMsg) {
        return __awaiter(this, void 0, void 0, function () {
            var log, msgParsed, e_5;
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
                        e_5 = _a.sent();
                        e_5.message = "failed process captcha for challenge request id (".concat(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId, "): ").concat(e_5.message);
                        log.error("(".concat(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId, "): "), e_5);
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
                answerIsCorrect = JSON.stringify(answerMessage.challengeAnswers) === JSON.stringify(actualSolution);
                log("(".concat(answerMessage === null || answerMessage === void 0 ? void 0 : answerMessage.challengeRequestId, "): "), "Answer's validity: ".concat(answerIsCorrect, ", user's answer: ").concat(answerMessage.challengeAnswers, ", actual solution: ").concat(actualSolution));
                challengeErrors = answerIsCorrect ? undefined : ["User solved captcha incorrectly"];
                return [2 /*return*/, [answerIsCorrect, challengeErrors]];
            });
        });
    };
    Subplebbit.prototype.syncComment = function (dbComment) {
        return __awaiter(this, void 0, void 0, function () {
            var log, commentIpns, _a, e_6, commentReplies, subplebbitSignature;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync:syncComment");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        _a = dbComment.ipnsName;
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(dbComment.ipnsName, this.plebbit)];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        commentIpns = _a;
                        return [3 /*break*/, 5];
                    case 4:
                        e_6 = _b.sent();
                        log.trace("Failed to load Comment (".concat(dbComment.cid, ") IPNS (").concat(dbComment.ipnsName, ") while syncing. Will attempt to publish a new IPNS record"));
                        return [3 /*break*/, 5];
                    case 5:
                        if (!(!commentIpns || !(0, util_1.shallowEqual)(commentIpns, dbComment.toJSONCommentUpdate(), ["replies", "signature"]))) return [3 /*break*/, 10];
                        log.trace("Attempting to update Comment (".concat(dbComment.cid, ")"));
                        return [4 /*yield*/, this.sortHandler.deleteCommentPageCache(dbComment)];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, this.sortHandler.generatePagesUnderComment(dbComment, undefined)];
                    case 7:
                        commentReplies = _b.sent();
                        dbComment.setReplies(commentReplies);
                        dbComment.setUpdatedAt((0, util_1.timestamp)());
                        return [4 /*yield*/, this.dbHandler.upsertComment(dbComment.toJSONForDb(undefined), dbComment.author.toJSONForDb(), undefined)];
                    case 8:
                        _b.sent();
                        return [4 /*yield*/, (0, signer_1.signPublication)(dbComment.toJSONCommentUpdate(), this.signer, this.plebbit, "commentupdate")];
                    case 9:
                        subplebbitSignature = _b.sent();
                        return [2 /*return*/, dbComment.edit(__assign(__assign({}, dbComment.toJSONCommentUpdate()), { signature: subplebbitSignature }))];
                    case 10:
                        log.trace("Comment (".concat(dbComment.cid, ") is up-to-date and does not need syncing"));
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.syncIpnsWithDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            var log, dbComments, e_7;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:sync");
                        log.trace("Starting to sync IPNS with DB");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.sortHandler.cacheCommentsPages()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.queryComments()];
                    case 3:
                        dbComments = _a.sent();
                        return [4 /*yield*/, Promise.all(dbComments.map(function (commentProps) { return __awaiter(_this, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = this.syncComment;
                                        return [4 /*yield*/, this.plebbit.createComment(commentProps)];
                                    case 1: return [2 /*return*/, _a.apply(this, [_b.sent()])];
                                }
                            }); }); }))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.updateSubplebbitIpns()];
                    case 5:
                        _a.sent();
                        exports.RUNNING_SUBPLEBBITS[this.signer.address] = true;
                        return [4 /*yield*/, this.dbHandler.keyvSet(this.address, this.toJSON())];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_7 = _a.sent();
                        log.error("Failed to sync due to error,", e_7);
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
                            throw (0, err_code_1.default)(Error(errors_1.messages.ERR_SUB_SIGNER_NOT_DEFINED), errors_1.codes.ERR_SUB_SIGNER_NOT_DEFINED, {
                                details: "signer: ".concat(JSON.stringify(this.signer), ", address: ").concat(this.address)
                            });
                        if (this._sync || exports.RUNNING_SUBPLEBBITS[this.signer.address])
                            throw (0, err_code_1.default)(Error(errors_1.messages.ERR_SUB_ALREADY_STARTED), errors_1.codes.ERR_SUB_ALREADY_STARTED, {
                                details: "address: ".concat(this.address)
                            });
                        this._sync = true;
                        exports.RUNNING_SUBPLEBBITS[this.signer.address] = true;
                        return [4 /*yield*/, this.prePublish()];
                    case 1:
                        _b.sent();
                        if (!this.provideCaptchaCallback) {
                            log("Subplebbit owner has not provided any captcha. Will go with default image captcha");
                            this.provideCaptchaCallback = this.defaultProvideCaptcha;
                            this.validateCaptchaAnswerCallback = this.defaultValidateCaptcha;
                        }
                        return [4 /*yield*/, this.plebbit.pubsubIpfsClient.pubsub.subscribe(this.pubsubTopic, function (pubsubMessage) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.handleChallengeExchange(pubsubMessage)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 2:
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
    Subplebbit.prototype._addPublicationToDb = function (publication) {
        return __awaiter(this, void 0, void 0, function () {
            var log, _a, validSignature, failedVerificationReason, decryptedRequestType;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:_addPublicationToDb");
                        return [4 /*yield*/, (0, signer_1.verifyPublication)(publication, this.plebbit, publication.getType())];
                    case 1:
                        _a = _b.sent(), validSignature = _a[0], failedVerificationReason = _a[1];
                        if (!validSignature)
                            throw (0, err_code_1.default)(Error(errors_1.messages.ERR_FAILED_TO_VERIFY_SIGNATURE), errors_1.codes.ERR_FAILED_TO_VERIFY_SIGNATURE, {
                                details: "subplebbit._addPublicationToDb: Failed verification reason: ".concat(failedVerificationReason)
                            });
                        log("Adding ".concat(publication.getType(), " to DB with author,"), (0, util_1.removeKeysWithUndefinedValues)(publication.author));
                        decryptedRequestType = {
                            type: "CHALLENGEREQUEST",
                            challengeRequestId: (0, uuid_1.v4)(),
                            protocolVersion: version_1.default.PROTOCOL_VERSION,
                            userAgent: version_1.default.USER_AGENT
                        };
                        return [4 /*yield*/, this.dbHandler.upsertChallenge(decryptedRequestType)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.storePublicationIfValid(publication.toJSON(), decryptedRequestType.challengeRequestId)];
                    case 3: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return Subplebbit;
}(events_1.default));
exports.Subplebbit = Subplebbit;
