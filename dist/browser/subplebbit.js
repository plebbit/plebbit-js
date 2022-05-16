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
var it_last_1 = __importDefault(require("it-last"));
var to_string_1 = require("uint8arrays/to-string");
var events_1 = __importDefault(require("events"));
var js_sha256_1 = require("js-sha256");
var from_string_1 = require("uint8arrays/from-string");
var challenge_1 = require("./challenge");
var assert_1 = __importDefault(require("assert"));
var db_handler_1 = require("./runtime/browser/db-handler");
var captcha_1 = require("./runtime/browser/captcha");
var sort_handler_1 = require("./sort-handler");
var uuid_1 = require("uuid");
var util_1 = require("./util");
var debug_1 = __importDefault(require("debug"));
var signer_1 = require("./signer");
var pages_1 = require("./pages");
var debug = (0, debug_1.default)("plebbit-js:subplebbit");
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
        _this.provideCaptchaCallback = undefined;
        _this.validateCaptchaAnswerCallback = undefined;
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
        this.posts =
            mergedProps["posts"] instanceof Object
                ? new pages_1.Pages(__assign(__assign({}, mergedProps["posts"]), { subplebbit: this }))
                : mergedProps["posts"];
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
    };
    Subplebbit.prototype.initSignerIfNeeded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dbSigner, ipnsKeys, ipfsKey;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.dbHandler) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.dbHandler.querySubplebbitSigner()];
                    case 1:
                        dbSigner = _a.sent();
                        if (!!dbSigner) return [3 /*break*/, 3];
                        (0, assert_1.default)(this.signer, "Subplebbit needs a signer to start");
                        debug("Subplebbit has no signer in DB, will insert provided signer from createSubplebbitOptions into DB");
                        // @ts-ignore
                        return [4 /*yield*/, this.dbHandler.insertSigner(__assign(__assign({}, this.signer), { ipnsKeyName: this.signer.address, usage: db_handler_1.SIGNER_USAGES.SUBPLEBBIT }))];
                    case 2:
                        // @ts-ignore
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        if (!this.signer) {
                            debug("Subplebbit loaded signer from DB");
                            // @ts-ignore
                            this.signer = dbSigner;
                        }
                        _a.label = 4;
                    case 4:
                        this.encryption = { type: this.signer.type, publicKey: this.signer.publicKey };
                        if (!(!this.address && this.signer)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.plebbit.ipfsClient.key.list()];
                    case 5:
                        ipnsKeys = _a.sent();
                        ipfsKey = ipnsKeys.filter(function (key) { return key.name === _this.signer.address; })[0];
                        debug(Boolean(ipfsKey)
                            ? "Owner has provided a signer that maps to ".concat(ipfsKey.id, " subplebbit address within ipfs node")
                            : "Owner has provided a signer that doesn't map to any subplebbit address within the ipfs node");
                        this.address = ipfsKey === null || ipfsKey === void 0 ? void 0 : ipfsKey.id;
                        _a.label = 6;
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
            moderatorsAddresses: this.moderatorsAddresses,
            latestPostCid: this.latestPostCid,
            pubsubTopic: this.pubsubTopic,
            address: this.address,
            posts: this.posts,
            challengeTypes: this.challengeTypes,
            metricsCid: this.metricsCid,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            encryption: this.encryption
        };
    };
    Subplebbit.prototype.prePublish = function (newSubplebbitOptions) {
        if (newSubplebbitOptions === void 0) { newSubplebbitOptions = {}; }
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
                        subplebbitIpfsNodeKey = (_a.sent()).filter(function (key) { return key.name === _this.address; })[0];
                        if (!!subplebbitIpfsNodeKey) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, util_1.ipfsImportKey)(__assign(__assign({}, this.signer), { ipnsKeyName: this.address }), this.plebbit)];
                    case 6:
                        ipfsKey = _a.sent();
                        this.ipnsKeyName = ipfsKey["name"] || ipfsKey["Name"];
                        debug("Imported keys into ipfs node, ".concat(JSON.stringify(ipfsKey)));
                        return [3 /*break*/, 8];
                    case 7:
                        debug("Subplebbit key is already in ipfs node, no need to import (".concat(JSON.stringify(subplebbitIpfsNodeKey), ")"));
                        this.ipnsKeyName = subplebbitIpfsNodeKey["name"] || subplebbitIpfsNodeKey["Name"];
                        _a.label = 8;
                    case 8:
                        (0, assert_1.default)(this.ipnsKeyName && this.address && this.signer && this.encryption && this.pubsubTopic, "These fields are needed to run the subplebbit");
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.edit = function (newSubplebbitOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var file, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prePublish(newSubplebbitOptions)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        this.initSubplebbit(__assign({ updatedAt: (0, util_1.timestamp)() }, newSubplebbitOptions));
                        return [4 /*yield*/, this.plebbit.ipfsClient.add(JSON.stringify(this))];
                    case 3:
                        file = _a.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.name.publish(file["cid"], {
                                lifetime: "72h",
                                key: this.ipnsKeyName
                            })];
                    case 4:
                        _a.sent();
                        debug("Subplebbit (".concat(this.address, ") props (").concat(Object.keys(newSubplebbitOptions), ") has been edited and its IPNS updated"));
                        return [2 /*return*/, this];
                    case 5:
                        e_1 = _a.sent();
                        debug("Failed to edit subplebbit due to ".concat(e_1));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.updateOnce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var subplebbitIpns, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(this.address, "Can't update subplebbit without address");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(this.address, this.plebbit)];
                    case 2:
                        subplebbitIpns = _a.sent();
                        if (this.emittedAt !== subplebbitIpns.updatedAt) {
                            this.emittedAt = subplebbitIpns.updatedAt;
                            this.initSubplebbit(subplebbitIpns);
                            debug("Subplebbit received a new update. Will emit an update event");
                            this.emit("update", this);
                        }
                        this.initSubplebbit(subplebbitIpns);
                        return [2 /*return*/, this];
                    case 3:
                        e_2 = _a.sent();
                        debug("Failed to update subplebbit IPNS, error: ".concat(e_2));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.update = function (updateIntervalMs) {
        if (updateIntervalMs === void 0) { updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS; }
        debug("Starting to poll updates for subplebbit (".concat(this.address, ") every ").concat(updateIntervalMs, " milliseconds"));
        if (this._updateInterval)
            clearInterval(this._updateInterval);
        this._updateInterval = setInterval(this.updateOnce.bind(this), updateIntervalMs); // One minute
        return this.updateOnce();
    };
    Subplebbit.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clearInterval(this._updateInterval);
                        return [4 /*yield*/, this.plebbit.ipfsClient.pubsub.unsubscribe(this.pubsubTopic)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.updateSubplebbitIpns = function () {
        return __awaiter(this, void 0, void 0, function () {
            var trx, latestPost, _a, metrics, _b, sortedPosts, sortedPostsCids, currentIpns, posts, newSubplebbitOptions, _c;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this.dbHandler.createTransaction()];
                    case 1:
                        trx = _f.sent();
                        return [4 /*yield*/, this.dbHandler.queryLatestPost(trx)];
                    case 2:
                        latestPost = _f.sent();
                        return [4 /*yield*/, trx.commit()];
                    case 3:
                        _f.sent();
                        return [4 /*yield*/, Promise.all([
                                // @ts-ignore
                                this.dbHandler.querySubplebbitMetrics(),
                                this.sortHandler.generatePagesUnderComment(),
                                (0, util_1.loadIpnsAsJson)(this.address, this.plebbit)
                            ])];
                    case 4:
                        _a = _f.sent(), metrics = _a[0], _b = _a[1], sortedPosts = _b[0], sortedPostsCids = _b[1], currentIpns = _a[2];
                        if (sortedPosts)
                            posts = new pages_1.Pages({
                                pages: (_d = {}, _d[sort_handler_1.POSTS_SORT_TYPES.HOT.type] = sortedPosts[sort_handler_1.POSTS_SORT_TYPES.HOT.type], _d),
                                pageCids: sortedPostsCids,
                                subplebbit: this
                            });
                        _c = [__assign({}, (currentIpns ? {} : { createdAt: (0, util_1.timestamp)() }))];
                        _e = { posts: posts };
                        return [4 /*yield*/, this.plebbit.ipfsClient.add(JSON.stringify(metrics))];
                    case 5:
                        newSubplebbitOptions = __assign.apply(void 0, _c.concat([(_e.metricsCid = (_f.sent()).path, _e.latestPostCid = latestPost === null || latestPost === void 0 ? void 0 : latestPost.postCid, _e)]));
                        if (!currentIpns ||
                            JSON.stringify(currentIpns.posts) !== JSON.stringify(newSubplebbitOptions.posts) ||
                            currentIpns.metricsCid !== newSubplebbitOptions.metricsCid ||
                            currentIpns.latestPostCid !== newSubplebbitOptions.latestPostCid) {
                            debug("Will attempt to sync subplebbit IPNS fields [".concat(Object.keys(newSubplebbitOptions), "]"));
                            return [2 /*return*/, this.edit(newSubplebbitOptions)];
                        }
                        else
                            debug("No need to update subplebbit IPNS");
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleCommentEdit = function (commentEdit, challengeRequestId, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var commentToBeEdited, _a, signatureIsVerified, verificationFailReason;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.dbHandler.queryComment(commentEdit.commentCid, trx)];
                    case 1:
                        commentToBeEdited = _b.sent();
                        return [4 /*yield*/, (0, signer_1.verifyPublication)(commentEdit)];
                    case 2:
                        _a = _b.sent(), signatureIsVerified = _a[0], verificationFailReason = _a[1];
                        if (!!signatureIsVerified) return [3 /*break*/, 3];
                        debug("Comment edit of ".concat(commentEdit.commentCid, " has been rejected due to having invalid signature. Reason = ").concat(verificationFailReason));
                        return [2 /*return*/, {
                                reason: "Comment edit of ".concat(commentEdit.commentCid, " has been rejected due to having invalid signature")
                            }];
                    case 3:
                        if (!!commentToBeEdited) return [3 /*break*/, 4];
                        debug("Unable to edit comment (".concat(commentEdit.commentCid, ") since it's not in local DB"));
                        return [2 /*return*/, { reason: "commentCid (".concat(commentEdit.commentCid, ") does not exist") }];
                    case 4:
                        if (!(commentEdit.editSignature.publicKey !== commentToBeEdited.signature.publicKey)) return [3 /*break*/, 5];
                        // Original comment and CommentEdit need to have same key
                        // TODO make exception for moderators
                        debug("User attempted to edit a comment (".concat(commentEdit.commentCid, ") without having its keys"));
                        return [2 /*return*/, {
                                reason: "Comment edit of ".concat(commentEdit.commentCid, " due to having different author keys than original comment")
                            }];
                    case 5:
                        if (!(0, util_1.shallowEqual)(commentToBeEdited.signature, commentEdit.editSignature)) return [3 /*break*/, 6];
                        debug("Signature of CommentEdit is identical to original comment (".concat(commentEdit.cid, ")"));
                        return [2 /*return*/, { reason: "Signature of CommentEdit is identical to original comment (".concat(commentEdit.cid, ")") }];
                    case 6:
                        commentEdit.setOriginalContent(commentToBeEdited.originalContent || commentToBeEdited.content);
                        return [4 /*yield*/, this.dbHandler.upsertComment(commentEdit, undefined, trx)];
                    case 7:
                        _b.sent();
                        debug("Updated content for comment ".concat(commentEdit.commentCid));
                        _b.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleVote = function (newVote, challengeRequestId, trx) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, signatureIsVerified, failedVerificationReason, lastVote;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, signer_1.verifyPublication)(newVote)];
                    case 1:
                        _b = _c.sent(), signatureIsVerified = _b[0], failedVerificationReason = _b[1];
                        if (!signatureIsVerified) {
                            debug("Author (".concat(newVote.author.address, ") vote (").concat(newVote.vote, " vote's signature is invalid. Reason = ").concat(failedVerificationReason));
                            return [2 /*return*/, { reason: "Invalid signature" }];
                        }
                        return [4 /*yield*/, this.dbHandler.getLastVoteOfAuthor(newVote.commentCid, newVote.author.address, trx)];
                    case 2:
                        lastVote = _c.sent();
                        if (!(lastVote && newVote.signature.publicKey !== lastVote.signature.publicKey)) return [3 /*break*/, 3];
                        // Original comment and CommentEdit need to have same key
                        // TODO make exception for moderators
                        debug("Author (".concat(newVote.author.address, ") attempted to edit a comment vote (").concat(newVote.commentCid, ") without having correct credentials"));
                        return [2 /*return*/, {
                                reason: "Author (".concat(newVote.author.address, ") attempted to change vote on  ").concat(newVote.commentCid, " without having correct credentials")
                            }];
                    case 3:
                        if (!(0, util_1.shallowEqual)(newVote.signature, lastVote === null || lastVote === void 0 ? void 0 : lastVote.signature)) return [3 /*break*/, 4];
                        debug("Signature of Vote is identical to original Vote (".concat(newVote.commentCid, ")"));
                        return [2 /*return*/, {
                                reason: "Signature of Vote is identical to original Vote (".concat(newVote.commentCid, ") by author ").concat((_a = newVote === null || newVote === void 0 ? void 0 : newVote.author) === null || _a === void 0 ? void 0 : _a.address)
                            }];
                    case 4:
                        if (!((lastVote === null || lastVote === void 0 ? void 0 : lastVote.vote) === newVote.vote)) return [3 /*break*/, 5];
                        debug("Author (".concat(newVote === null || newVote === void 0 ? void 0 : newVote.author.address, ") has duplicated their vote for comment ").concat(newVote.commentCid, ". Returning an error"));
                        return [2 /*return*/, { reason: "User duplicated their vote" }];
                    case 5: return [4 /*yield*/, this.dbHandler.upsertVote(newVote, challengeRequestId, trx)];
                    case 6:
                        _c.sent();
                        debug("Upserted new vote (".concat(newVote.vote, ") for comment ").concat(newVote.commentCid));
                        _c.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.publishPostAfterPassingChallenge = function (publication, challengeRequestId, trx) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var postOrCommentOrVote, _c, _d, res, res, signatureIsVerified, ipnsKeyName, msg, ipfsSigner, _e, ipfsKey, _f, _g, file, _h, commentsUnderParent, parent_1, file;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        delete this._challengeToSolution[challengeRequestId];
                        delete this._challengeToPublication[challengeRequestId];
                        if (!publication.hasOwnProperty("vote")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.plebbit.createVote(publication)];
                    case 1:
                        _c = _j.sent();
                        return [3 /*break*/, 7];
                    case 2:
                        if (!publication.commentCid) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.plebbit.createCommentEdit(publication)];
                    case 3:
                        _d = _j.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.plebbit.createComment(publication)];
                    case 5:
                        _d = _j.sent();
                        _j.label = 6;
                    case 6:
                        _c = _d;
                        _j.label = 7;
                    case 7:
                        postOrCommentOrVote = _c;
                        if (!(postOrCommentOrVote.getType() === "vote")) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.handleVote(postOrCommentOrVote, challengeRequestId, trx)];
                    case 8:
                        res = _j.sent();
                        if (res)
                            return [2 /*return*/, res];
                        return [3 /*break*/, 24];
                    case 9:
                        if (!postOrCommentOrVote.commentCid) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.handleCommentEdit(postOrCommentOrVote, challengeRequestId, trx)];
                    case 10:
                        res = _j.sent();
                        if (res)
                            return [2 /*return*/, res];
                        return [3 /*break*/, 24];
                    case 11:
                        if (!postOrCommentOrVote.content) return [3 /*break*/, 24];
                        return [4 /*yield*/, (0, signer_1.verifyPublication)(postOrCommentOrVote)];
                    case 12:
                        signatureIsVerified = (_j.sent())[0];
                        if (!signatureIsVerified) {
                            debug("Author (".concat(postOrCommentOrVote.author.address, ") comment's signature is invalid"));
                            return [2 /*return*/, { reason: "Invalid signature" }];
                        }
                        ipnsKeyName = (0, js_sha256_1.sha256)(JSON.stringify(postOrCommentOrVote.toJSONSkeleton()));
                        return [4 /*yield*/, this.dbHandler.querySigner(ipnsKeyName, trx)];
                    case 13:
                        if (!_j.sent()) return [3 /*break*/, 14];
                        msg = "Failed to insert ".concat(postOrCommentOrVote.getType(), " due to previous ").concat(postOrCommentOrVote.getType(), " having same ipns key name (duplicate?)");
                        debug(msg);
                        return [2 /*return*/, { reason: msg }];
                    case 14:
                        _e = [{}];
                        return [4 /*yield*/, this.plebbit.createSigner()];
                    case 15:
                        ipfsSigner = __assign.apply(void 0, [__assign.apply(void 0, _e.concat([(_j.sent())])), { ipnsKeyName: ipnsKeyName, usage: db_handler_1.SIGNER_USAGES.COMMENT }]);
                        return [4 /*yield*/, Promise.all([
                                (0, util_1.ipfsImportKey)(ipfsSigner, this.plebbit),
                                this.dbHandler.insertSigner(ipfsSigner, trx)
                            ])];
                    case 16:
                        ipfsKey = (_j.sent())[0];
                        postOrCommentOrVote.setCommentIpnsKey(ipfsKey);
                        if (!(postOrCommentOrVote.getType() === "post")) return [3 /*break*/, 20];
                        // @ts-ignore
                        _g = (_f = postOrCommentOrVote).setPreviousCid;
                        return [4 /*yield*/, this.dbHandler.queryLatestPost(trx)];
                    case 17:
                        // @ts-ignore
                        _g.apply(_f, [(_a = (_j.sent())) === null || _a === void 0 ? void 0 : _a.cid]);
                        postOrCommentOrVote.setDepth(0);
                        return [4 /*yield*/, this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()))];
                    case 18:
                        file = _j.sent();
                        postOrCommentOrVote.setPostCid(file.path);
                        postOrCommentOrVote.setCid(file.path);
                        return [4 /*yield*/, this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx)];
                    case 19:
                        _j.sent();
                        debug("New post with cid ".concat(postOrCommentOrVote.cid, " has been inserted into DB"));
                        return [3 /*break*/, 24];
                    case 20: return [4 /*yield*/, Promise.all([
                            this.dbHandler.queryCommentsUnderComment(postOrCommentOrVote.parentCid, trx),
                            this.dbHandler.queryComment(postOrCommentOrVote.parentCid, trx)
                        ])];
                    case 21:
                        _h = _j.sent(), commentsUnderParent = _h[0], parent_1 = _h[1];
                        postOrCommentOrVote.setPreviousCid((_b = commentsUnderParent[0]) === null || _b === void 0 ? void 0 : _b.cid);
                        postOrCommentOrVote.setDepth(parent_1.depth + 1);
                        return [4 /*yield*/, this.plebbit.ipfsClient.add(JSON.stringify(postOrCommentOrVote.toJSONIpfs()))];
                    case 22:
                        file = _j.sent();
                        postOrCommentOrVote.setCid(file.path);
                        return [4 /*yield*/, this.dbHandler.upsertComment(postOrCommentOrVote, challengeRequestId, trx)];
                    case 23:
                        _j.sent();
                        debug("New comment with cid ".concat(postOrCommentOrVote.cid, " has been inserted into DB"));
                        _j.label = 24;
                    case 24: return [2 /*return*/, { publication: postOrCommentOrVote }];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeRequest = function (msgParsed) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, providedChallenges, reasonForSkippingCaptcha, decryptedPublication, _b, _c, trx, _d, publishedPublication, restOfMsg, _e, challengeVerification, challengeMessage, e_3;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 13, , 14]);
                        return [4 /*yield*/, this.provideCaptchaCallback(msgParsed)];
                    case 1:
                        _a = _g.sent(), providedChallenges = _a[0], reasonForSkippingCaptcha = _a[1];
                        _c = (_b = JSON).parse;
                        return [4 /*yield*/, (0, signer_1.decrypt)(msgParsed.encryptedPublication.encryptedString, msgParsed.encryptedPublication.encryptedKey, this.signer.privateKey)];
                    case 2:
                        decryptedPublication = _c.apply(_b, [_g.sent()]);
                        this._challengeToPublication[msgParsed.challengeRequestId] = decryptedPublication;
                        debug("Received a request to a challenge (".concat(msgParsed.challengeRequestId, ")"));
                        if (!!providedChallenges) return [3 /*break*/, 11];
                        // Subplebbit owner has chosen to skip challenging this user or post
                        debug("Skipping challenge for ".concat(msgParsed.challengeRequestId, ", add publication to IPFS and respond with challengeVerificationMessage right away"));
                        if (!decryptedPublication.vote) return [3 /*break*/, 3];
                        _d = undefined;
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.dbHandler.createTransaction()];
                    case 4:
                        _d = _g.sent();
                        _g.label = 5;
                    case 5:
                        trx = _d;
                        return [4 /*yield*/, this.dbHandler.upsertChallenge(new challenge_1.ChallengeRequestMessage(msgParsed), trx)];
                    case 6:
                        _g.sent();
                        return [4 /*yield*/, this.publishPostAfterPassingChallenge(decryptedPublication, msgParsed.challengeRequestId, trx)];
                    case 7:
                        publishedPublication = _g.sent();
                        if (!("publication" in publishedPublication)) return [3 /*break*/, 9];
                        _f = {};
                        return [4 /*yield*/, (0, signer_1.encrypt)(JSON.stringify(publishedPublication.publication), (publishedPublication.publication.signature ||
                                publishedPublication.publication.editSignature).publicKey)];
                    case 8:
                        _e = (_f.encryptedPublication = _g.sent(),
                            _f);
                        return [3 /*break*/, 10];
                    case 9:
                        _e = publishedPublication;
                        _g.label = 10;
                    case 10:
                        restOfMsg = _e;
                        challengeVerification = new challenge_1.ChallengeVerificationMessage(__assign({ reason: reasonForSkippingCaptcha, challengePassed: Boolean(publishedPublication.publication), challengeAnswerId: msgParsed.challengeAnswerId, challengeErrors: undefined, challengeRequestId: msgParsed.challengeRequestId }, restOfMsg));
                        return [2 /*return*/, this.upsertAndPublishChallenge(challengeVerification, trx)];
                    case 11:
                        challengeMessage = new challenge_1.ChallengeMessage({
                            challengeRequestId: msgParsed.challengeRequestId,
                            challenges: providedChallenges
                        });
                        return [2 /*return*/, this.upsertAndPublishChallenge(challengeMessage, undefined)];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        e_3 = _g.sent();
                        debug("Failed to handle challenge request:", e_3);
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.upsertAndPublishChallenge = function (challenge, trx) {
        return __awaiter(this, void 0, void 0, function () {
            var e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 8]);
                        return [4 /*yield*/, this.dbHandler.upsertChallenge(challenge, trx)];
                    case 1:
                        _a.sent();
                        if (!trx) return [3 /*break*/, 3];
                        return [4 /*yield*/, trx.commit()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.plebbit.ipfsClient.pubsub.publish(this.pubsubTopic, (0, from_string_1.fromString)(JSON.stringify(challenge)))];
                    case 4:
                        _a.sent();
                        debug("Published challenge type ".concat(challenge.type, " (").concat(challenge.challengeRequestId, ")"));
                        return [3 /*break*/, 8];
                    case 5:
                        e_4 = _a.sent();
                        debug("Failed to either publish challenge or upsert in DB, error = ".concat(e_4));
                        if (!trx) return [3 /*break*/, 7];
                        return [4 /*yield*/, trx.rollback()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.handleChallengeAnswer = function (msgParsed) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, challengePassed, challengeErrors, storedPublication, trx, _b, publishedPublication, restOfMsg, _c, challengeVerification, challengeVerification, e_5;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 12, , 13]);
                        return [4 /*yield*/, this.validateCaptchaAnswerCallback(msgParsed)];
                    case 1:
                        _a = _e.sent(), challengePassed = _a[0], challengeErrors = _a[1];
                        if (!challengePassed) return [3 /*break*/, 10];
                        debug("Challenge (".concat(msgParsed.challengeRequestId, ") has answered correctly"));
                        storedPublication = this._challengeToPublication[msgParsed.challengeRequestId];
                        if (!storedPublication.vote) return [3 /*break*/, 2];
                        _b = undefined;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.dbHandler.createTransaction()];
                    case 3:
                        _b = _e.sent();
                        _e.label = 4;
                    case 4:
                        trx = _b;
                        return [4 /*yield*/, this.dbHandler.upsertChallenge(new challenge_1.ChallengeAnswerMessage(msgParsed), trx)];
                    case 5:
                        _e.sent();
                        return [4 /*yield*/, this.publishPostAfterPassingChallenge(storedPublication, msgParsed.challengeRequestId, trx)];
                    case 6:
                        publishedPublication = _e.sent();
                        if (!("publication" in publishedPublication)) return [3 /*break*/, 8];
                        _d = {};
                        return [4 /*yield*/, (0, signer_1.encrypt)(JSON.stringify(publishedPublication.publication), (publishedPublication.publication.editSignature ||
                                publishedPublication.publication.signature).publicKey)];
                    case 7:
                        _c = (_d.encryptedPublication = _e.sent(),
                            _d);
                        return [3 /*break*/, 9];
                    case 8:
                        _c = publishedPublication;
                        _e.label = 9;
                    case 9:
                        restOfMsg = _c;
                        challengeVerification = new challenge_1.ChallengeVerificationMessage(__assign({ challengeRequestId: msgParsed.challengeRequestId, challengeAnswerId: msgParsed.challengeAnswerId, challengePassed: challengePassed, challengeErrors: challengeErrors }, restOfMsg));
                        return [2 /*return*/, this.upsertAndPublishChallenge(challengeVerification, trx)];
                    case 10:
                        debug("Challenge (".concat(msgParsed.challengeRequestId, ") has answered incorrectly"));
                        challengeVerification = new challenge_1.ChallengeVerificationMessage({
                            challengeRequestId: msgParsed.challengeRequestId,
                            challengeAnswerId: msgParsed.challengeAnswerId,
                            challengePassed: challengePassed,
                            challengeErrors: challengeErrors
                        });
                        return [2 /*return*/, this.upsertAndPublishChallenge(challengeVerification, undefined)];
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        e_5 = _e.sent();
                        debug("Failed to handle challenge answers: ", e_5);
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.processCaptchaPubsub = function (pubsubMsg) {
        return __awaiter(this, void 0, void 0, function () {
            var msgParsed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        msgParsed = JSON.parse((0, to_string_1.toString)(pubsubMsg["data"]));
                        if (!(msgParsed.type === challenge_1.PUBSUB_MESSAGE_TYPES.CHALLENGEREQUEST)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.handleChallengeRequest(msgParsed)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(msgParsed.type === challenge_1.PUBSUB_MESSAGE_TYPES.CHALLENGEANSWER &&
                            this._challengeToPublication[msgParsed.challengeRequestId])) return [3 /*break*/, 4];
                        // Only reply to peers who started a challenge request earlier
                        return [4 /*yield*/, this.handleChallengeAnswer(msgParsed)];
                    case 3:
                        // Only reply to peers who started a challenge request earlier
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.defaultProvideCaptcha = function (challengeRequestMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Return question, type
                // Expected return is:
                // captcha, captcha type, reason for skipping captcha (if it's skipped by nullifying captcha)
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, image, text;
                        return __generator(this, function (_b) {
                            _a = (0, captcha_1.createCaptcha)(300, 100), image = _a.image, text = _a.text;
                            this._challengeToSolution[challengeRequestMessage.challengeRequestId] = [text];
                            image
                                .then(function (imageBuffer) {
                                return resolve([
                                    [
                                        new challenge_1.Challenge({
                                            challenge: imageBuffer,
                                            // @ts-ignore
                                            type: challenge_1.CHALLENGE_TYPES.image
                                        })
                                    ],
                                    undefined
                                ]);
                            })
                                .catch(reject);
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Subplebbit.prototype.defaultValidateCaptcha = function (challengeAnswerMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var actualSolution, answerIsCorrect, challengeErrors;
                        return __generator(this, function (_a) {
                            actualSolution = this._challengeToSolution[challengeAnswerMessage.challengeRequestId];
                            answerIsCorrect = JSON.stringify(challengeAnswerMessage.challengeAnswers) === JSON.stringify(actualSolution);
                            debug("Challenge (".concat(challengeAnswerMessage.challengeRequestId, "): Answer's validity: ").concat(answerIsCorrect, ", user's answer: ").concat(challengeAnswerMessage.challengeAnswers, ", actual solution: ").concat(actualSolution));
                            challengeErrors = answerIsCorrect ? undefined : ["User solved captcha incorrectly"];
                            resolve([answerIsCorrect, challengeErrors]);
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Subplebbit.prototype.syncIpnsWithDb = function (syncIntervalMs) {
        return __awaiter(this, void 0, void 0, function () {
            var syncComment, dbComments, e_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debug("Starting to sync IPNS with DB");
                        syncComment = function (dbComment) { return __awaiter(_this, void 0, void 0, function () {
                            var currentIpns, _a, sortedReplies, sortedRepliesCids, e_7;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, (0, util_1.loadIpnsAsJson)(dbComment.ipnsName, this.plebbit)];
                                    case 1:
                                        currentIpns = _b.sent();
                                        if (!(!currentIpns || !(0, util_1.shallowEqual)(currentIpns, dbComment.toJSONCommentUpdate(), ["replies"]))) return [3 /*break*/, 6];
                                        _b.label = 2;
                                    case 2:
                                        _b.trys.push([2, 5, , 6]);
                                        debug("Comment (".concat(dbComment.cid, ") IPNS is outdated"));
                                        return [4 /*yield*/, this.sortHandler.generatePagesUnderComment(dbComment)];
                                    case 3:
                                        _a = _b.sent(), sortedReplies = _a[0], sortedRepliesCids = _a[1];
                                        dbComment.setReplies(sortedReplies, sortedRepliesCids);
                                        dbComment.setUpdatedAt((0, util_1.timestamp)());
                                        return [4 /*yield*/, this.dbHandler.upsertComment(dbComment, undefined)];
                                    case 4:
                                        _b.sent();
                                        return [2 /*return*/, dbComment.edit(dbComment.toJSONCommentUpdate())];
                                    case 5:
                                        e_7 = _b.sent();
                                        debug("Failed to update comment (".concat(dbComment.cid, ") due to error=").concat(e_7));
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.dbHandler.queryComments()];
                    case 2:
                        dbComments = _a.sent();
                        return [4 /*yield*/, Promise.all(__spreadArray(__spreadArray([], dbComments.map(function (comment) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, syncComment(comment)];
                            }); }); }), true), [
                                this.updateSubplebbitIpns()
                            ], false))];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_6 = _a.sent();
                        debug("Failed to sync due to error: ".concat(e_6));
                        return [3 /*break*/, 5];
                    case 5:
                        setTimeout(this.syncIpnsWithDb.bind(this, syncIntervalMs), syncIntervalMs);
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.start = function (syncIntervalMs) {
        if (syncIntervalMs === void 0) { syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prePublish()];
                    case 1:
                        _a.sent();
                        if (!this.provideCaptchaCallback) {
                            debug("Subplebbit owner has not provided any captcha. Will go with default image captcha");
                            this.provideCaptchaCallback = this.defaultProvideCaptcha;
                            this.validateCaptchaAnswerCallback = this.defaultValidateCaptcha;
                        }
                        (0, assert_1.default)(this.dbHandler, "A connection to a database is needed for the hosting a subplebbit");
                        (0, assert_1.default)(this.pubsubTopic, "Pubsub topic need to defined before publishing");
                        return [4 /*yield*/, this.plebbit.ipfsClient.pubsub.subscribe(this.pubsubTopic, this.processCaptchaPubsub.bind(this))];
                    case 2:
                        _a.sent();
                        debug("Waiting for publications on pubsub topic (".concat(this.pubsubTopic, ")"));
                        return [4 /*yield*/, this.syncIpnsWithDb(syncIntervalMs)];
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
                        (_b = (_a = this.dbHandler) === null || _a === void 0 ? void 0 : _a.knex) === null || _b === void 0 ? void 0 : _b.destroy();
                        this.dbHandler = undefined;
                        return [2 /*return*/];
                }
            });
        });
    };
    Subplebbit.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ipfsPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // For development purposes ONLY
                    // Call this only if you know what you're doing
                    // rm ipns and ipfs
                    return [4 /*yield*/, this.stopPublishing()];
                    case 1:
                        // For development purposes ONLY
                        // Call this only if you know what you're doing
                        // rm ipns and ipfs
                        _a.sent();
                        return [4 /*yield*/, (0, it_last_1.default)(this.plebbit.ipfsClient.name.resolve(this.address))];
                    case 2:
                        ipfsPath = _a.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.pin.rm(ipfsPath)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.plebbit.ipfsClient.key.rm(this.ipnsKeyName)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // For development purposes only
    Subplebbit.prototype._addPublicationToDb = function (publication) {
        return __awaiter(this, void 0, void 0, function () {
            var trx, _a, randomUUID, publishedPublication, e_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!publication.vote) return [3 /*break*/, 1];
                        _a = undefined;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.dbHandler.createTransaction()];
                    case 2:
                        _a = _b.sent();
                        _b.label = 3;
                    case 3:
                        trx = _a;
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 9, , 12]);
                        randomUUID = (0, uuid_1.v4)();
                        return [4 /*yield*/, this.dbHandler.upsertChallenge(new challenge_1.ChallengeRequestMessage({ challengeRequestId: randomUUID }), trx)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, this.publishPostAfterPassingChallenge(publication, randomUUID, trx)];
                    case 6:
                        publishedPublication = _b.sent();
                        if (!trx) return [3 /*break*/, 8];
                        return [4 /*yield*/, trx.commit()];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [2 /*return*/, publishedPublication];
                    case 9:
                        e_8 = _b.sent();
                        debug("Failed to add publication to DB, error ".concat(e_8));
                        if (!trx) return [3 /*break*/, 11];
                        return [4 /*yield*/, trx.rollback()];
                    case 10:
                        _b.sent();
                        _b.label = 11;
                    case 11: return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    return Subplebbit;
}(events_1.default));
exports.Subplebbit = Subplebbit;
