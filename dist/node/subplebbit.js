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
var assert_1 = __importDefault(require("assert"));
var db_handler_1 = require("./runtime/node/db-handler");
var captcha_1 = require("./runtime/node/captcha");
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
var debugs = (0, util_1.getDebugLevels)("subplebbit");
var DEFAULT_UPDATE_INTERVAL_MS = 60000;
var DEFAULT_SYNC_INTERVAL_MS = 100000; // 5 minutes
var Subplebbit = /** @class */ (function (_super) {
    __extends(Subplebbit, _super);
    function Subplebbit(props, plebbit) {
        var _this = _super.call(this) || this;
        _this.plebbit = plebbit;
        _this.initSubplebbit(props);
        _this._challengeToSolution = {}; // Map challenge ID to its solution
        _this._challengeToPublication = {}; // To hold unpublished posts/comments/votes
        _this._sync = false;
        _this.provideCaptchaCallback = undefined;
        _this.validateCaptchaAnswerCallback = undefined;
        // these functions might get separated from their `this` when used
        _this.start = _this.start.bind(_this);
        _this.update = _this.update.bind(_this);
        _this.stop = _this.stop.bind(_this);
        _this.edit = _this.edit.bind(_this);
        return _this;
    }
    Subplebbit.prototype.initSubplebbit = function (newProps) {
        var oldProps = this.toJSONInternal();
        var mergedProps = __assign(__assign({}, oldProps), newProps);
        this.title = mergedProps["title"];
        this.description = mergedProps["description"];
        this.moderatorsAddresses = mergedProps["moderatorsAddresses"];
        this.latestPostCid = mergedProps["latestPostCid"];
        this._dbConfig = mergedProps["database"];
        this.address = mergedProps["address"];
        this.ipnsKeyName = mergedProps["ipnsKeyName"];
        this.pubsubTopic = mergedProps["pubsubTopic"] || this.address;
        this.sortHandler = new sort_handler_1.SortHandler(this);
        this.challengeTypes = mergedProps["challengeTypes"];
        this.metricsCid = mergedProps["metricsCid"];
        this.createdAt = mergedProps["createdAt"];
        this.updatedAt = mergedProps["updatedAt"];
        this.signer = mergedProps["signer"];
        this.encryption = mergedProps["encryption"];
        this.posts =
            mergedProps["posts"] instanceof Object
                ? new pages_1.Pages(__assign(__assign({}, mergedProps["posts"]), { subplebbit: this }))
                : mergedProps["posts"];
        this.roles = mergedProps["roles"];
    };
    Subplebbit.prototype.initSignerIfNeeded = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var dbSigner, ipnsKeys, ipfsKey;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.dbHandler) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.dbHandler.querySubplebbitSigner(undefined)];
                    case 1:
                        dbSigner = _b.sent();
                        if (!!dbSigner) return [3 /*break*/, 3];
                        (0, assert_1.default)(this.signer, "Subplebbit needs a signer to start");
                        debugs.INFO("Subplebbit has no signer in DB, will insert provided signer from createSubplebbitOptions into DB");
                        return [4 /*yield*/, this.dbHandler.insertSigner(__assign(__assign({}, this.signer), { ipnsKeyName: this.signer.address, usage: "subplebbit" }), undefined)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        if (!this.signer) {
                            debugs.DEBUG("Subplebbit loaded signer from DB");
                            this.signer = dbSigner;
                        }
                        _b.label = 4;
                    case 4:
                        (0, assert_1.default)((_a = this.signer) === null || _a === void 0 ? void 0 : _a.publicKey);
                        this.encryption = {
                            type: "aes-cbc",
                            publicKey: this.signer.publicKey
                        };
                        if (!(!this.address && this.signer)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.plebbit.ipfsClient.key.list()];
                    case 5:
                        ipnsKeys = _b.sent();
                        ipfsKey = ipnsKeys.filter(function (key) { return key.name === _this.signer.address; })[0];
                        debugs.DEBUG(Boolean(ipfsKey)
                            ? "Owner has provided a signer that maps to ".concat(ipfsKey.id, " subplebbit address within ipfs node")
                            : "Owner has provided a signer that doesn't map to any subplebbit address within the ipfs node");
                        this.address = ipfsKey === null || ipfsKey === void 0 ? void 0 : ipfsKey.id;
                        _b.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.initDbIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, db_handler_1.subplebbitInitDbIfNeeded)(this)];
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
        return __assign(__assign({}, this.toJSON()), { ipnsKeyName: this.ipnsKeyName, database: this._dbConfig, signer: this.signer });
    };
    Subplebbit.prototype.toJSON = function () {
        return {
            title: this.title,
            description: this.description,
            latestPostCid: this.latestPostCid,
            pubsubTopic: this.pubsubTopic,
            address: this.address,
            posts: this.posts,
            challengeTypes: this.challengeTypes,
            metricsCid: this.metricsCid,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            encryption: this.encryption,
            roles: this.roles,
            protocolVersion: this.protocolVersion,
            signature: this.signature
        };
    };
    Subplebbit.prototype.prePublish = function () {
        return __awaiter(this, void 0, void 0, function () {
            var subplebbitIpfsNodeKey, ipfsKey;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.signer && this.address)) return [3 /*break*/, 2];
                        // Load signer from DB
                        return [4 /*yield*/, this.initDbIfNeeded()];
                    case 1:
                        // Load signer from DB
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        if (!this.address && this.signer)
                            this.address = this.signer.address;
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.initDbIfNeeded()];
                    case 4:
                        _a.sent();
                        (0, assert_1.default)(this.address && this.signer, "Both address and signer need to be defined at this point");
                        if (!this.pubsubTopic)
                            this.pubsubTopic = this.address;
                        return [4 /*yield*/, this.plebbit.ipfsClient.key.list()];
                    case 5:
                        subplebbitIpfsNodeKey = (_a.sent()).filter(function (key) { return key.name === _this.signer.address; })[0];
                        if (!!subplebbitIpfsNodeKey) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, util_1.ipfsImportKey)(__assign(__assign({}, this.signer), { ipnsKeyName: this.signer.address }), this.plebbit)];
                    case 6:
                        ipfsKey = _a.sent();
                        this.ipnsKeyName = ipfsKey["name"] || ipfsKey["Name"];
                        debugs.INFO("Imported subplebbit keys into ipfs node, ".concat(JSON.stringify(ipfsKey)));
                        return [3 /*break*/, 8];
                    case 7:
                        debugs.TRACE("Subplebbit key is already in ipfs node, no need to import (".concat(JSON.stringify(subplebbitIpfsNodeKey), ")"));
                        this.ipnsKeyName = subplebbitIpfsNodeKey["name"] || subplebbitIpfsNodeKey["Name"];
                        _a.label = 8;
                    case 8:
                        (0, assert_1.default)(this.ipnsKeyName && this.address && this.signer && this.encryption && this.pubsubTopic, "These fields are needed to run the subplebbit");
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.assertDomainResolvesCorrectlyIfNeeded = function (domain) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var resolvedAddress;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.plebbit.resolver.isDomain(domain)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(domain)];
                    case 1:
                        resolvedAddress = _c.sent();
                        assert_1.default.strictEqual(resolvedAddress, (_a = this.signer) === null || _a === void 0 ? void 0 : _a.address, "ENS (".concat(this.address, ") resolved address (").concat(resolvedAddress, ") should be equal to derived address from signer (").concat((_b = this.signer) === null || _b === void 0 ? void 0 : _b.address, ")"));
                        _c.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.edit = function (newSubplebbitOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!newSubplebbitOptions.address) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.assertDomainResolvesCorrectlyIfNeeded(newSubplebbitOptions.address)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.prePublish()];
                    case 3:
                        _a.sent();
                        (0, assert_1.default)(this.plebbit.ipfsClient && this.dbHandler, "subplebbit.ipfsClient and dbHandler is needed to edit");
                        this.initSubplebbit(__assign({ updatedAt: (0, util_1.timestamp)() }, newSubplebbitOptions));
                        if (!newSubplebbitOptions.address) return [3 /*break*/, 5];
                        debugs.DEBUG("Attempting to edit subplebbit.address from ".concat(this.address, " to ").concat(newSubplebbitOptions.address));
                        return [4 /*yield*/, this.dbHandler.changeDbFilename("".concat(newSubplebbitOptions.address))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.plebbit.ipfsClient.add(JSON.stringify(this))];
                    case 6:
                        file = _a.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.name.publish(file["cid"], {
                                lifetime: "72h",
                                key: this.ipnsKeyName,
                                allowOffline: true
                            })];
                    case 7:
                        _a.sent();
                        debugs.INFO("Subplebbit (".concat(this.address, ") props (").concat(Object.keys(newSubplebbitOptions), ") has been edited and its IPNS updated"));
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Subplebbit.prototype.updateOnce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ipnsAddress, subplebbitIpns, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address)];
                    case 1:
                        ipnsAddress = _a.sent();
                        (0, assert_1.default)(ipnsAddress, "Can't update subplebbit without address");
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(ipnsAddress, this.plebbit)];
                    case 3:
                        subplebbitIpns = _a.sent();
                        if (this.emittedAt !== subplebbitIpns.updatedAt) {
                            this.emittedAt = subplebbitIpns.updatedAt;
                            this.initSubplebbit(subplebbitIpns);
                            debugs.INFO("Subplebbit received a new update. Will emit an update event");
                            this.emit("update", this);
                        }
                        this.initSubplebbit(subplebbitIpns);
                        return [2 /*return*/, this];
                    case 4:
                        e_1 = _a.sent();
                        debugs.ERROR("Failed to update subplebbit IPNS, error: ".concat(e_1));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.update = function (updateIntervalMs) {
        if (updateIntervalMs === void 0) { updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS; }
        if (this._updateInterval)
            clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.updateOnce.bind(this), updateIntervalMs);
        return this.updateOnce();
    };
    Subplebbit.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._updateInterval = clearInterval(this._updateInterval);
                return [2 /*return*/];
            });
        });
    };
    Subplebbit.prototype.updateSubplebbitIpns = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var trx, latestPost, _b, metrics, subplebbitPosts, resolvedAddress, currentIpns, e_2, posts, metricsCid, newSubplebbitOptions;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, assert_1.default)(this.dbHandler);
                        return [4 /*yield*/, this.dbHandler.createTransaction("subplebbit")];
                    case 1:
                        trx = _c.sent();
                        return [4 /*yield*/, this.dbHandler.queryLatestPost(trx)];
                    case 2:
                        latestPost = _c.sent();
                        return [4 /*yield*/, this.dbHandler.commitTransaction("subplebbit")];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.querySubplebbitMetrics(undefined),
                                this.sortHandler.generatePagesUnderComment(undefined, undefined)
                            ])];
                    case 4:
                        _b = _c.sent(), metrics = _b[0], subplebbitPosts = _b[1];
                        return [4 /*yield*/, this.plebbit.resolver.resolveSubplebbitAddressIfNeeded(this.address)];
                    case 5:
                        resolvedAddress = _c.sent();
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(resolvedAddress, this.plebbit)];
                    case 7:
                        currentIpns = _c.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_2 = _c.sent();
                        debugs.WARN("Subplebbit IPNS (".concat(resolvedAddress, ") is not defined, will publish a new record"));
                        return [3 /*break*/, 9];
                    case 9:
                        if (subplebbitPosts) {
                            if (!((_a = subplebbitPosts === null || subplebbitPosts === void 0 ? void 0 : subplebbitPosts.pages) === null || _a === void 0 ? void 0 : _a.hot))
                                throw new Error("Generated pages for subplebbit.posts is missing pages");
                            posts = new pages_1.Pages({
                                pages: {
                                    hot: subplebbitPosts.pages.hot
                                },
                                pageCids: subplebbitPosts.pageCids,
                                subplebbit: this
                            });
                        }
                        return [4 /*yield*/, this.plebbit.ipfsClient.add(JSON.stringify(metrics))];
                    case 10:
                        metricsCid = (_c.sent()).path;
                        newSubplebbitOptions = __assign(__assign(__assign(__assign({}, (!currentIpns && !posts && !this.createdAt ? { createdAt: (0, util_1.timestamp)() } : {})), (JSON.stringify(posts) !== JSON.stringify(this.posts) ? { posts: posts } : {})), (metricsCid !== this.metricsCid ? { metricsCid: metricsCid } : {})), ((latestPost === null || latestPost === void 0 ? void 0 : latestPost.postCid) !== this.latestPostCid ? { latestPostCid: latestPost === null || latestPost === void 0 ? void 0 : latestPost.postCid } : {}));
                        if (JSON.stringify(newSubplebbitOptions) !== "{}") {
                            debugs.DEBUG("Will attempt to sync subplebbit IPNS fields [".concat(Object.keys(newSubplebbitOptions), "]"));
                            return [2 /*return*/, this.edit(newSubplebbitOptions)];
                        }
                        else
                            debugs.TRACE("No need to sync subplebbit IPNS");
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleCommentEdit = function (commentEdit, challengeRequestId) {
        return __awaiter(this, void 0, void 0, function () {
            var commentToBeEdited, editorAddress, modRole, _i, _a, editField, msg, _b, _c, editField, msg, newAuthorProps, msg;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        (0, assert_1.default)(this.dbHandler, "Need db handler to handleCommentEdit");
                        return [4 /*yield*/, this.dbHandler.queryComment(commentEdit.commentCid, undefined)];
                    case 1:
                        commentToBeEdited = _d.sent();
                        (0, assert_1.default)(commentToBeEdited);
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
                                debugs.WARN(msg);
                                return [2 /*return*/, { reason: msg }];
                            }
                        }
                        return [4 /*yield*/, this.dbHandler.insertEdit(commentEdit, challengeRequestId)];
                    case 3:
                        _d.sent();
                        // If comment.flair is last modified by a mod, then reject
                        return [4 /*yield*/, this.dbHandler.editComment(commentEdit, challengeRequestId)];
                    case 4:
                        // If comment.flair is last modified by a mod, then reject
                        _d.sent();
                        // const commentAfterEdit = await this.dbHandler.queryComment(commentEdit.commentCid, undefined);
                        debugs.INFO("Updated comment (".concat(commentEdit.commentCid, ") with CommentEdit: ").concat(JSON.stringify((0, util_1.removeKeys)(commentEdit, ["signature"]))));
                        return [3 /*break*/, 11];
                    case 5:
                        if (!modRole) return [3 /*break*/, 10];
                        debugs.DEBUG("".concat(modRole.role, " (").concat(editorAddress, ") is attempting to CommentEdit ").concat(commentToBeEdited === null || commentToBeEdited === void 0 ? void 0 : commentToBeEdited.cid, " with CommentEdit (").concat(JSON.stringify((0, util_1.removeKeys)(commentEdit, ["signature"])), ")"));
                        for (_b = 0, _c = Object.keys((0, util_1.removeKeysWithUndefinedValues)(commentEdit.toJSON())); _b < _c.length; _b++) {
                            editField = _c[_b];
                            if (!comment_edit_1.MOD_EDIT_FIELDS.includes(editField)) {
                                msg = "".concat(modRole.role, " (").concat(editorAddress, ") included field (").concat(editField, ") that cannot be used for a mod's CommentEdit");
                                debugs.WARN(msg);
                                return [2 /*return*/, { reason: msg }];
                            }
                        }
                        return [4 /*yield*/, this.dbHandler.insertEdit(commentEdit, challengeRequestId)];
                    case 6:
                        _d.sent();
                        return [4 /*yield*/, this.dbHandler.editComment(commentEdit, challengeRequestId)];
                    case 7:
                        _d.sent();
                        if (!commentEdit.commentAuthor) return [3 /*break*/, 9];
                        newAuthorProps = __assign({ address: commentToBeEdited === null || commentToBeEdited === void 0 ? void 0 : commentToBeEdited.author.address }, commentEdit.commentAuthor);
                        return [4 /*yield*/, this.dbHandler.updateAuthor(newAuthorProps, true)];
                    case 8:
                        _d.sent();
                        debugs.INFO("Mod (".concat(JSON.stringify(modRole), ") has add following props to author (").concat(newAuthorProps.address, "):  ").concat(JSON.stringify(newAuthorProps)));
                        _d.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        msg = "Editor (non-mod) - (".concat(editorAddress, ") attempted to edit a comment (").concat(commentEdit.commentCid, ") without having original author keys.");
                        debugs.INFO(msg);
                        return [2 /*return*/, { reason: msg }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleVote = function (newVote, challengeRequestId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var lastVote, trx;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.dbHandler.getLastVoteOfAuthor(newVote.commentCid, newVote.author.address)];
                    case 1:
                        lastVote = _c.sent();
                        if (!(lastVote && newVote.signature.publicKey !== lastVote.signature.publicKey)) return [3 /*break*/, 2];
                        debugs.INFO("Author (".concat(newVote.author.address, ") attempted to edit a comment vote (").concat(newVote.commentCid, ") without having correct credentials"));
                        return [2 /*return*/, {
                                reason: "Author (".concat(newVote.author.address, ") attempted to change vote on  ").concat(newVote.commentCid, " without having correct credentials")
                            }];
                    case 2:
                        if (!(0, util_1.shallowEqual)(newVote.signature, lastVote === null || lastVote === void 0 ? void 0 : lastVote.signature)) return [3 /*break*/, 3];
                        debugs.INFO("Signature of Vote is identical to original Vote (".concat(newVote.commentCid, ")"));
                        return [2 /*return*/, {
                                reason: "Signature of Vote is identical to original Vote (".concat(newVote.commentCid, ") by author ").concat((_a = newVote === null || newVote === void 0 ? void 0 : newVote.author) === null || _a === void 0 ? void 0 : _a.address)
                            }];
                    case 3:
                        if (!((lastVote === null || lastVote === void 0 ? void 0 : lastVote.vote) === newVote.vote)) return [3 /*break*/, 4];
                        debugs.INFO("Author (".concat(newVote === null || newVote === void 0 ? void 0 : newVote.author.address, ") has duplicated their vote for comment ").concat(newVote.commentCid, ". Returning an error"));
                        return [2 /*return*/, { reason: "User duplicated their vote" }];
                    case 4: return [4 /*yield*/, this.dbHandler.createTransaction(challengeRequestId)];
                    case 5:
                        trx = _c.sent();
                        return [4 /*yield*/, this.dbHandler.upsertVote(newVote, challengeRequestId, trx)];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, ((_b = this.dbHandler) === null || _b === void 0 ? void 0 : _b.commitTransaction(challengeRequestId))];
                    case 7:
                        _c.sent();
                        debugs.INFO("Upserted new vote (".concat(newVote.vote, ") for comment ").concat(newVote.commentCid));
                        _c.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.publishPostAfterPassingChallenge = function (publication, challengeRequestId) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function () {
            var postOrCommentOrVote, _j, _k, author, msg, msg, parentCid, errResponse, parent_1, err, derivedAddress, resolvedAddress, msg, _l, signatureIsVerified, failedVerificationReason, msg, res, res, ipnsKeyName, ipfsSigner, _m, _o, ipfsKey, e_3, msg, trx, _p, _q, file, trx, _r, commentsUnderParent, parent_2, file;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        delete this._challengeToSolution[challengeRequestId];
                        delete this._challengeToPublication[challengeRequestId];
                        (0, assert_1.default)(this.dbHandler);
                        if (!publication.hasOwnProperty("vote")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.plebbit.createVote(publication)];
                    case 1:
                        _j = _s.sent();
                        return [3 /*break*/, 7];
                    case 2:
                        if (!publication.commentCid) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.plebbit.createCommentEdit(publication)];
                    case 3:
                        _k = _s.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.plebbit.createComment(publication)];
                    case 5:
                        _k = _s.sent();
                        _s.label = 6;
                    case 6:
                        _j = _k;
                        _s.label = 7;
                    case 7:
                        postOrCommentOrVote = _j;
                        if (!((_a = postOrCommentOrVote === null || postOrCommentOrVote === void 0 ? void 0 : postOrCommentOrVote.author) === null || _a === void 0 ? void 0 : _a.address)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.dbHandler.queryAuthor(postOrCommentOrVote.author.address)];
                    case 8:
                        author = _s.sent();
                        if ((author === null || author === void 0 ? void 0 : author.banExpiresAt) && author.banExpiresAt > (0, util_1.timestamp)()) {
                            msg = "Author (".concat((_b = postOrCommentOrVote === null || postOrCommentOrVote === void 0 ? void 0 : postOrCommentOrVote.author) === null || _b === void 0 ? void 0 : _b.address, ") attempted to publish ").concat(postOrCommentOrVote.constructor.name, " even though they're banned until ").concat(author.banExpiresAt, ". Rejecting");
                            debugs.INFO(msg);
                            return [2 /*return*/, { reason: msg }];
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        msg = "Rejecting ".concat(postOrCommentOrVote.constructor.name, " because it doesn't have author.address");
                        debugs.INFO(msg);
                        return [2 /*return*/, { reason: msg }];
                    case 10:
                        if (!!(postOrCommentOrVote instanceof post_1.default)) return [3 /*break*/, 12];
                        parentCid = postOrCommentOrVote instanceof comment_1.Comment
                            ? postOrCommentOrVote.parentCid
                            : postOrCommentOrVote instanceof vote_1.default || postOrCommentOrVote instanceof comment_edit_1.CommentEdit
                                ? postOrCommentOrVote.commentCid
                                : undefined;
                        errResponse = {
                            reason: "Rejecting ".concat(postOrCommentOrVote.constructor.name, " because its parentCid or commentCid is not defined")
                        };
                        if (!parentCid) {
                            debugs.INFO(errResponse.reason);
                            return [2 /*return*/, errResponse];
                        }
                        return [4 /*yield*/, this.dbHandler.queryComment(parentCid)];
                    case 11:
                        parent_1 = _s.sent();
                        if (!parent_1) {
                            debugs.INFO(errResponse.reason);
                            return [2 /*return*/, errResponse];
                        }
                        if (parent_1.timestamp > postOrCommentOrVote.timestamp) {
                            err = {
                                reason: "Rejecting ".concat(postOrCommentOrVote.constructor.name, " because its timestamp (").concat(postOrCommentOrVote.timestamp, ") is earlier than its parent (").concat(parent_1.timestamp, ")")
                            };
                            debugs.INFO(err.reason);
                            return [2 /*return*/, err];
                        }
                        _s.label = 12;
                    case 12: return [4 /*yield*/, (0, util_2.getPlebbitAddressFromPublicKeyPem)(postOrCommentOrVote.signature.publicKey)];
                    case 13:
                        derivedAddress = _s.sent();
                        return [4 /*yield*/, this.plebbit.resolver.resolveAuthorAddressIfNeeded((_c = publication === null || publication === void 0 ? void 0 : publication.author) === null || _c === void 0 ? void 0 : _c.address)];
                    case 14:
                        resolvedAddress = _s.sent();
                        if (resolvedAddress !== ((_d = publication === null || publication === void 0 ? void 0 : publication.author) === null || _d === void 0 ? void 0 : _d.address)) {
                            // Means author.address is a crypto domain
                            if (resolvedAddress !== derivedAddress) {
                                msg = "domain (".concat(postOrCommentOrVote.author.address, ") plebbit-author-address (").concat(resolvedAddress, ") does not have the same signer address (").concat((_e = this.signer) === null || _e === void 0 ? void 0 : _e.address, ")");
                                debugs.INFO(msg);
                                return [2 /*return*/, { reason: msg }];
                            }
                        }
                        return [4 /*yield*/, (0, signer_1.verifyPublication)(postOrCommentOrVote, this.plebbit, postOrCommentOrVote.getType())];
                    case 15:
                        _l = _s.sent(), signatureIsVerified = _l[0], failedVerificationReason = _l[1];
                        if (!signatureIsVerified) {
                            msg = "Author (".concat((_f = postOrCommentOrVote === null || postOrCommentOrVote === void 0 ? void 0 : postOrCommentOrVote.author) === null || _f === void 0 ? void 0 : _f.address, ") ").concat(postOrCommentOrVote.getType(), "'s signature is invalid: ").concat(failedVerificationReason);
                            debugs.INFO(msg);
                            return [2 /*return*/, { reason: msg }];
                        }
                        if (!(postOrCommentOrVote instanceof vote_1.default)) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.handleVote(postOrCommentOrVote, challengeRequestId)];
                    case 16:
                        res = _s.sent();
                        if (res)
                            return [2 /*return*/, res];
                        return [3 /*break*/, 37];
                    case 17:
                        if (!(postOrCommentOrVote instanceof comment_edit_1.CommentEdit)) return [3 /*break*/, 19];
                        return [4 /*yield*/, this.handleCommentEdit(postOrCommentOrVote, challengeRequestId)];
                    case 18:
                        res = _s.sent();
                        if (res)
                            return [2 /*return*/, res];
                        return [3 /*break*/, 37];
                    case 19:
                        if (!(postOrCommentOrVote instanceof comment_1.Comment)) return [3 /*break*/, 37];
                        ipnsKeyName = (0, js_sha256_1.sha256)(JSON.stringify(postOrCommentOrVote.toJSONSkeleton()));
                        _s.label = 20;
                    case 20:
                        _s.trys.push([20, 24, , 25]);
                        _m = signer_1.Signer.bind;
                        _o = [{}];
                        return [4 /*yield*/, this.plebbit.createSigner()];
                    case 21:
                        ipfsSigner = new (_m.apply(signer_1.Signer, [void 0, __assign.apply(void 0, [__assign.apply(void 0, _o.concat([(_s.sent())])), { ipnsKeyName: ipnsKeyName, usage: "comment" }])]))();
                        return [4 /*yield*/, this.dbHandler.insertSigner(ipfsSigner, undefined)];
                    case 22:
                        _s.sent();
                        return [4 /*yield*/, (0, util_1.ipfsImportKey)(ipfsSigner, this.plebbit)];
                    case 23:
                        ipfsKey = _s.sent();
                        postOrCommentOrVote.setCommentIpnsKey(ipfsKey);
                        return [3 /*break*/, 25];
                    case 24:
                        e_3 = _s.sent();
                        msg = "Failed to insert ".concat(postOrCommentOrVote.constructor.name, " due to previous ").concat(postOrCommentOrVote.getType(), " having same ipns key name (duplicate?): ").concat(e_3);
                        debugs.DEBUG(msg);
                        return [2 /*return*/, { reason: msg }];
                    case 25:
                        if (!(postOrCommentOrVote instanceof post_1.default)) return [3 /*break*/, 31];
                        return [4 /*yield*/, this.dbHandler.createTransaction(challengeRequestId)];
                    case 26:
                        trx = _s.sent();
                        _q = (_p = postOrCommentOrVote).setPreviousCid;
                        return [4 /*yield*/, this.dbHandler.queryLatestPost(trx)];
                    case 27:
                        _q.apply(_p, [(_g = (_s.sent())) === null || _g === void 0 ? void 0 : _g.cid]);
                        postOrCommentOrVote.setDepth(0);
                        return [4 /*yield*/, this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()))];
                    case 28:
                        file = _s.sent();
                        postOrCommentOrVote.setPostCid(file.path);
                        postOrCommentOrVote.setCid(file.path);
                        return [4 /*yield*/, this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx)];
                    case 29:
                        _s.sent();
                        return [4 /*yield*/, this.dbHandler.commitTransaction(challengeRequestId)];
                    case 30:
                        _s.sent();
                        debugs.INFO("New post with cid ".concat(postOrCommentOrVote.cid, " has been inserted into DB"));
                        return [3 /*break*/, 37];
                    case 31:
                        if (!(postOrCommentOrVote instanceof comment_1.Comment)) return [3 /*break*/, 37];
                        return [4 /*yield*/, this.dbHandler.createTransaction(challengeRequestId)];
                    case 32:
                        trx = _s.sent();
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid, trx),
                                this.dbHandler.queryComment(postOrCommentOrVote.parentCid, trx)
                            ])];
                    case 33:
                        _r = _s.sent(), commentsUnderParent = _r[0], parent_2 = _r[1];
                        postOrCommentOrVote.setPreviousCid((_h = commentsUnderParent[0]) === null || _h === void 0 ? void 0 : _h.cid);
                        postOrCommentOrVote.setDepth(parent_2.depth + 1);
                        return [4 /*yield*/, this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()))];
                    case 34:
                        file = _s.sent();
                        postOrCommentOrVote.setCid(file.path);
                        postOrCommentOrVote.setPostCid(parent_2.postCid);
                        return [4 /*yield*/, this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx)];
                    case 35:
                        _s.sent();
                        return [4 /*yield*/, this.dbHandler.commitTransaction(challengeRequestId)];
                    case 36:
                        _s.sent();
                        debugs.INFO("New comment with cid ".concat(postOrCommentOrVote.cid, " has been inserted into DB"));
                        _s.label = 37;
                    case 37: return [2 /*return*/, { publication: postOrCommentOrVote }];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeRequest = function (msgParsed) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, providedChallenges, reasonForSkippingCaptcha, decryptedPublication, _b, _c, publishedPublication, restOfMsg, _d, challengeVerification, challengeMessage;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this.provideCaptchaCallback(msgParsed)];
                    case 1:
                        _a = _f.sent(), providedChallenges = _a[0], reasonForSkippingCaptcha = _a[1];
                        _c = (_b = JSON).parse;
                        return [4 /*yield*/, (0, signer_1.decrypt)(msgParsed.encryptedPublication.encrypted, msgParsed.encryptedPublication.encryptedKey, this.signer.privateKey)];
                    case 2:
                        decryptedPublication = _c.apply(_b, [_f.sent()]);
                        this._challengeToPublication[msgParsed.challengeRequestId] = decryptedPublication;
                        debugs.DEBUG("Received a request to a challenge (".concat(msgParsed.challengeRequestId, ")"));
                        if (!!providedChallenges) return [3 /*break*/, 9];
                        // Subplebbit owner has chosen to skip challenging this user or post
                        debugs.DEBUG("Skipping challenge for ".concat(msgParsed.challengeRequestId, ", add publication to IPFS and respond with challengeVerificationMessage right away"));
                        return [4 /*yield*/, this.dbHandler.upsertChallenge(new challenge_1.ChallengeRequestMessage(msgParsed), undefined)];
                    case 3:
                        _f.sent();
                        return [4 /*yield*/, this.publishPostAfterPassingChallenge(decryptedPublication, msgParsed.challengeRequestId)];
                    case 4:
                        publishedPublication = _f.sent();
                        if (!("publication" in publishedPublication)) return [3 /*break*/, 6];
                        _e = {};
                        return [4 /*yield*/, (0, signer_1.encrypt)(JSON.stringify(publishedPublication.publication), (publishedPublication.publication.signature || publishedPublication.publication.editSignature).publicKey)];
                    case 5:
                        _d = (_e.encryptedPublication = _f.sent(),
                            _e);
                        return [3 /*break*/, 7];
                    case 6:
                        _d = publishedPublication;
                        _f.label = 7;
                    case 7:
                        restOfMsg = _d;
                        challengeVerification = new challenge_1.ChallengeVerificationMessage(__assign({ reason: reasonForSkippingCaptcha, challengeSuccess: Boolean(publishedPublication.publication), challengeAnswerId: msgParsed.challengeAnswerId, challengeErrors: undefined, challengeRequestId: msgParsed.challengeRequestId }, restOfMsg));
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.upsertChallenge(challengeVerification, undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeVerification)))
                            ])];
                    case 8:
                        _f.sent();
                        debugs.INFO("Published ".concat(challengeVerification.type, " over pubsub for challenge (").concat(challengeVerification.challengeRequestId, ")"));
                        this.emit("challengeverification", challengeVerification);
                        return [3 /*break*/, 11];
                    case 9:
                        challengeMessage = new challenge_1.ChallengeMessage({
                            challengeRequestId: msgParsed.challengeRequestId,
                            challenges: providedChallenges
                        });
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.upsertChallenge(challengeMessage, undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeMessage)))
                            ])];
                    case 10:
                        _f.sent();
                        debugs.INFO("Published ".concat(challengeMessage.type, " (").concat(challengeMessage.challengeRequestId, ") over pubsub"));
                        _f.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeAnswer = function (msgParsed) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, challengeSuccess, challengeErrors, storedPublication, publishedPublication, restOfMsg, _b, challengeVerification, challengeVerification;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.validateCaptchaAnswerCallback(msgParsed)];
                    case 1:
                        _a = _d.sent(), challengeSuccess = _a[0], challengeErrors = _a[1];
                        if (!challengeSuccess) return [3 /*break*/, 8];
                        debugs.DEBUG("Challenge (".concat(msgParsed.challengeRequestId, ") has been answered correctly"));
                        storedPublication = this._challengeToPublication[msgParsed.challengeRequestId];
                        return [4 /*yield*/, this.dbHandler.upsertChallenge(new challenge_1.ChallengeAnswerMessage(msgParsed), undefined)];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, this.publishPostAfterPassingChallenge(storedPublication, msgParsed.challengeRequestId)];
                    case 3:
                        publishedPublication = _d.sent();
                        if (!("publication" in publishedPublication)) return [3 /*break*/, 5];
                        _c = {};
                        return [4 /*yield*/, (0, signer_1.encrypt)(JSON.stringify(publishedPublication.publication), (publishedPublication.publication.editSignature || publishedPublication.publication.signature).publicKey)];
                    case 4:
                        _b = (_c.encryptedPublication = _d.sent(),
                            _c);
                        return [3 /*break*/, 6];
                    case 5:
                        _b = publishedPublication;
                        _d.label = 6;
                    case 6:
                        restOfMsg = _b;
                        challengeVerification = new challenge_1.ChallengeVerificationMessage(__assign({ challengeRequestId: msgParsed.challengeRequestId, challengeAnswerId: msgParsed.challengeAnswerId, challengeSuccess: challengeSuccess, challengeErrors: challengeErrors }, restOfMsg));
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.upsertChallenge(challengeVerification, undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeVerification)))
                            ])];
                    case 7:
                        _d.sent();
                        debugs.INFO("Published ".concat(challengeVerification.type, " over pubsub: ").concat(JSON.stringify((0, util_1.removeKeys)(challengeVerification, ["publication"]))));
                        return [3 /*break*/, 10];
                    case 8:
                        debugs.INFO("Challenge (".concat(msgParsed.challengeRequestId, ") has answered incorrectly"));
                        challengeVerification = new challenge_1.ChallengeVerificationMessage({
                            challengeRequestId: msgParsed.challengeRequestId,
                            challengeAnswerId: msgParsed.challengeAnswerId,
                            challengeSuccess: challengeSuccess,
                            challengeErrors: challengeErrors
                        });
                        return [4 /*yield*/, Promise.all([
                                this.dbHandler.upsertChallenge(challengeVerification, undefined),
                                this.plebbit.pubsubIpfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challengeVerification)))
                            ])];
                    case 9:
                        _d.sent();
                        debugs.INFO("Published failed ".concat(challengeVerification.type, " (").concat(challengeVerification.challengeRequestId, ")"));
                        this.emit("challengeverification", challengeVerification);
                        _d.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.processCaptchaPubsub = function (pubsubMsg) {
        return __awaiter(this, void 0, void 0, function () {
            var msgParsed, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(this.dbHandler);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 9]);
                        msgParsed = JSON.parse((0, to_string_1.toString)(pubsubMsg.data));
                        if (!(msgParsed.type === challenge_1.PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handleChallengeRequest(msgParsed)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(msgParsed.type === challenge_1.PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER && this._challengeToPublication[msgParsed.challengeRequestId])) return [3 /*break*/, 5];
                        // Only reply to peers who started a challenge request earlier
                        return [4 /*yield*/, this.handleChallengeAnswer(msgParsed)];
                    case 4:
                        // Only reply to peers who started a challenge request earlier
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 9];
                    case 6:
                        e_4 = _a.sent();
                        e_4.message = "failed process captcha for challenge request id (".concat(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId, "): ").concat(e_4.message);
                        debugs.ERROR(e_4);
                        if (!(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.dbHandler.rollbackTransaction(msgParsed === null || msgParsed === void 0 ? void 0 : msgParsed.challengeRequestId)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.defaultProvideCaptcha = function (challengeRequestMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, image, text, imageBuffer;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = (0, captcha_1.createCaptcha)(300, 100), image = _a.image, text = _a.text;
                        this._challengeToSolution[challengeRequestMessage.challengeRequestId] = [text];
                        return [4 /*yield*/, image];
                    case 1:
                        imageBuffer = (_b.sent()).toString("base64");
                        return [2 /*return*/, [
                                [
                                    new challenge_1.Challenge({
                                        challenge: imageBuffer,
                                        type: challenge_1.CHALLENGE_TYPES.IMAGE
                                    })
                                ]
                            ]];
                }
            });
        });
    };
    Subplebbit.prototype.defaultValidateCaptcha = function (challengeAnswerMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var actualSolution, answerIsCorrect, challengeErrors;
            return __generator(this, function (_a) {
                actualSolution = this._challengeToSolution[challengeAnswerMessage.challengeRequestId];
                answerIsCorrect = JSON.stringify(challengeAnswerMessage.challengeAnswers) === JSON.stringify(actualSolution);
                debugs.DEBUG("Challenge (".concat(challengeAnswerMessage.challengeRequestId, "): Answer's validity: ").concat(answerIsCorrect, ", user's answer: ").concat(challengeAnswerMessage.challengeAnswers, ", actual solution: ").concat(actualSolution));
                challengeErrors = answerIsCorrect ? undefined : ["User solved captcha incorrectly"];
                return [2 /*return*/, [answerIsCorrect, challengeErrors]];
            });
        });
    };
    Subplebbit.prototype.syncComment = function (dbComment) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var commentIpns, e_5, commentReplies, subplebbitSignature;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, assert_1.default)(this.dbHandler);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(dbComment.ipnsName, this.plebbit)];
                    case 2:
                        commentIpns = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_5 = _b.sent();
                        debugs.TRACE("Failed to load Comment (".concat(dbComment.cid, ") IPNS (").concat(dbComment.ipnsName, ") while syncing. Will attempt to publish a new IPNS record"));
                        return [3 /*break*/, 4];
                    case 4:
                        if (!(!commentIpns || !(0, util_1.shallowEqual)(commentIpns, dbComment.toJSONCommentUpdate(), ["replies", "signature"]))) return [3 /*break*/, 9];
                        debugs.DEBUG("Attempting to update Comment (".concat(dbComment.cid, ")"));
                        return [4 /*yield*/, this.sortHandler.deleteCommentPageCache(dbComment)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, this.sortHandler.generatePagesUnderComment(dbComment, undefined)];
                    case 6:
                        commentReplies = _b.sent();
                        dbComment.setReplies(commentReplies);
                        dbComment.setUpdatedAt((0, util_1.timestamp)());
                        return [4 /*yield*/, this.dbHandler.upsertComment(dbComment, undefined)];
                    case 7:
                        _b.sent();
                        (0, assert_1.default)(this.signer);
                        return [4 /*yield*/, (0, signer_1.signPublication)(__assign(__assign({}, dbComment.toJSONCommentUpdate()), { replies: (_a = dbComment === null || dbComment === void 0 ? void 0 : dbComment.replies) === null || _a === void 0 ? void 0 : _a.toJSON() }), this.signer, this.plebbit, "commentupdate")];
                    case 8:
                        subplebbitSignature = _b.sent();
                        return [2 /*return*/, dbComment.edit(__assign(__assign({}, (0, util_1.removeKeysWithUndefinedValues)(dbComment.toJSONCommentUpdate())), { signature: subplebbitSignature }))];
                    case 9:
                        debugs.TRACE("Comment (".concat(dbComment.cid, ") is up-to-date and does not need syncing"));
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.syncIpnsWithDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dbComments;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(this.dbHandler, "DbHandler need to be defined before syncing");
                        debugs.TRACE("Starting to sync IPNS with DB");
                        // try {
                        return [4 /*yield*/, this.sortHandler.cacheCommentsPages()];
                    case 1:
                        // try {
                        _a.sent();
                        return [4 /*yield*/, this.dbHandler.queryComments()];
                    case 2:
                        dbComments = _a.sent();
                        return [4 /*yield*/, Promise.all(__spreadArray(__spreadArray([], dbComments.map(function (comment) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, this.syncComment(comment)];
                            }); }); }), true), [this.updateSubplebbitIpns()], false))];
                    case 3:
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
                switch (_a.label) {
                    case 0:
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
                        return [4 /*yield*/, this.syncIpnsWithDb()];
                    case 1:
                        _a.sent();
                        setTimeout(loop.bind(this), syncIntervalMs);
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.start = function (syncIntervalMs) {
        if (syncIntervalMs === void 0) { syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(!this._sync, "Subplebbit is already started");
                        this._sync = true;
                        return [4 /*yield*/, this.prePublish()];
                    case 1:
                        _a.sent();
                        if (!this.provideCaptchaCallback) {
                            debugs.INFO("Subplebbit owner has not provided any captcha. Will go with default image captcha");
                            this.provideCaptchaCallback = this.defaultProvideCaptcha;
                            this.validateCaptchaAnswerCallback = this.defaultValidateCaptcha;
                        }
                        (0, assert_1.default)(this.dbHandler, "A connection to a database is needed for the hosting a subplebbit");
                        (0, assert_1.default)(this.pubsubTopic, "Pubsub topic need to defined before publishing");
                        return [4 /*yield*/, this.plebbit.pubsubIpfsClient.pubsub.subscribe(this.pubsubTopic, function (pubsubMessage) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.processCaptchaPubsub(pubsubMessage)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 2:
                        _a.sent();
                        debugs.INFO("Waiting for publications on pubsub topic (".concat(this.pubsubTopic, ")"));
                        return [4 /*yield*/, this._syncLoop(syncIntervalMs)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.stopPublishing = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.removeAllListeners();
                        return [4 /*yield*/, this.stop()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.plebbit.pubsubIpfsClient.pubsub.unsubscribe(this.pubsubTopic)];
                    case 2:
                        _c.sent();
                        (_b = (_a = this.dbHandler) === null || _a === void 0 ? void 0 : _a.knex) === null || _b === void 0 ? void 0 : _b.destroy();
                        this.dbHandler = undefined;
                        this._sync = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype._addPublicationToDb = function (publication) {
        return __awaiter(this, void 0, void 0, function () {
            var randomUUID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debugs.INFO("Adding ".concat(publication.getType(), " with author (").concat(JSON.stringify(publication.author), ") to DB directly"));
                        randomUUID = (0, uuid_1.v4)();
                        return [4 /*yield*/, this.dbHandler.upsertChallenge(new challenge_1.ChallengeRequestMessage({ challengeRequestId: randomUUID }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.publishPostAfterPassingChallenge(publication, randomUUID)];
                    case 2: return [2 /*return*/, (_a.sent()).publication];
                }
            });
        });
    };
    return Subplebbit;
}(events_1.default));
exports.Subplebbit = Subplebbit;
