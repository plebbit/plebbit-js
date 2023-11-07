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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var rpc_websockets_1 = require("rpc-websockets");
var assert_1 = __importDefault(require("assert"));
var subplebbit_1 = require("../subplebbit/subplebbit");
var plebbit_error_1 = require("../plebbit-error");
var events_1 = __importDefault(require("events"));
var p_timeout_1 = __importDefault(require("p-timeout"));
var util_1 = require("../util");
var log = (0, plebbit_logger_1.default)("plebbit-js:PlebbitRpcClient");
var PlebbitRpcClient = /** @class */ (function () {
    function PlebbitRpcClient(plebbit) {
        var _this = this;
        this._subscriptionEvents = {}; // subscription ID -> event emitter
        this._pendingSubscriptionMsgs = {};
        (0, assert_1.default)(plebbit.plebbitRpcClientsOptions);
        this._plebbit = plebbit;
        this._webSocketClient = new rpc_websockets_1.Client(plebbit.plebbitRpcClientsOptions[0]);
        this._timeoutSeconds = 20;
        // Set up events here
        // save all subscription messages (ie json rpc messages without 'id', also called json rpc 'notifications')
        // NOTE: it is possible to receive a subscription message before receiving the subscription id
        //@ts-expect-error
        this._webSocketClient.socket.on("message", function (jsonMessage) {
            var _a, _b, _c, _d;
            var message = JSON.parse(jsonMessage);
            var subscriptionId = (_a = message === null || message === void 0 ? void 0 : message.params) === null || _a === void 0 ? void 0 : _a.subscription;
            if (subscriptionId) {
                _this._initSubscriptionEvent(subscriptionId);
                // We need to parse error props into PlebbitErrors
                if (((_b = message === null || message === void 0 ? void 0 : message.params) === null || _b === void 0 ? void 0 : _b.event) === "error") {
                    message.params.result = new plebbit_error_1.PlebbitError(message.params.result.code, message.params.result.details);
                    delete message.params.result.stack; // Need to delete locally generated PlebbitError stack
                }
                if (_this._subscriptionEvents[subscriptionId].listenerCount((_c = message === null || message === void 0 ? void 0 : message.params) === null || _c === void 0 ? void 0 : _c.event) === 0)
                    _this._pendingSubscriptionMsgs[subscriptionId].push(message);
                else
                    _this._subscriptionEvents[subscriptionId].emit((_d = message === null || message === void 0 ? void 0 : message.params) === null || _d === void 0 ? void 0 : _d.event, message);
            }
        });
        // debug raw JSON RPC messages in console (optional)
        //@ts-expect-error
        this._webSocketClient.socket.on("message", function (message) { return log.trace("from RPC server:", message.toString()); });
        // forward errors to Plebbit
        this._webSocketClient.on("error", function (error) {
            _this._plebbit.emit("error", error);
        });
        this._webSocketClient.on("close", function () {
            log.error("connection with web socket has been closed");
            _this._openConnectionPromise = undefined;
        });
        // Process error JSON from server into a PlebbitError instance
        var originalWebsocketCall = this._webSocketClient.call.bind(this._webSocketClient);
        this._webSocketClient.call = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._init()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, originalWebsocketCall.apply(void 0, args)];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4:
                            e_1 = _a.sent();
                            //e is an error json representation of PlebbitError
                            if (Object.keys(e_1).length === 0)
                                throw Error("RPC server sent an empty error for call " + args[0]);
                            if (e_1 === null || e_1 === void 0 ? void 0 : e_1.code)
                                throw new plebbit_error_1.PlebbitError(e_1 === null || e_1 === void 0 ? void 0 : e_1.code, e_1 === null || e_1 === void 0 ? void 0 : e_1.details);
                            else
                                throw new Error(e_1.message);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
    }
    PlebbitRpcClient.prototype._init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // wait for websocket connection to open
                        //@ts-expect-error
                        if (this._webSocketClient.ready)
                            return [2 /*return*/];
                        if (!this._openConnectionPromise)
                            this._openConnectionPromise = (0, p_timeout_1.default)(new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, this._webSocketClient.once("open", resolve)];
                            }); }); }), this._timeoutSeconds * 1000);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._openConnectionPromise];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        (0, util_1.throwWithErrorCode)("ERR_FAILED_TO_OPEN_CONNECTION_TO_RPC", {
                            plebbitRpcUrl: this._plebbit.plebbitRpcClientsOptions[0],
                            timeoutSeconds: this._timeoutSeconds
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.getSubscription = function (subscriptionId) {
        if (!this._subscriptionEvents[subscriptionId])
            throw Error("No subscription to RPC with id (".concat(subscriptionId, ")"));
        else
            return this._subscriptionEvents[subscriptionId];
    };
    PlebbitRpcClient.prototype.unsubscribe = function (subscriptionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("unsubscribe", [subscriptionId])];
                    case 1:
                        _a.sent();
                        if (this._subscriptionEvents[subscriptionId])
                            this._subscriptionEvents[subscriptionId].removeAllListeners();
                        delete this._subscriptionEvents[subscriptionId];
                        delete this._pendingSubscriptionMsgs[subscriptionId];
                        return [2 /*return*/];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.emitAllPendingMessages = function (subscriptionId) {
        var _this = this;
        this._pendingSubscriptionMsgs[subscriptionId].forEach(function (message) { var _a; return _this._subscriptionEvents[subscriptionId].emit((_a = message === null || message === void 0 ? void 0 : message.params) === null || _a === void 0 ? void 0 : _a.event, message); });
        delete this._pendingSubscriptionMsgs[subscriptionId];
    };
    PlebbitRpcClient.prototype.getComment = function (commentCid) {
        return __awaiter(this, void 0, void 0, function () {
            var commentProps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("getComment", [commentCid])];
                    case 1:
                        commentProps = _a.sent();
                        return [2 /*return*/, this._plebbit.createComment(commentProps)];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.getCommentPage = function (pageCid, commentCid, subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var pageIpfs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("getCommentPage", [pageCid, commentCid, subplebbitAddress])];
                    case 1:
                        pageIpfs = _a.sent();
                        return [2 /*return*/, pageIpfs];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.getSubplebbitPage = function (pageCid, subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var pageIpfs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("getSubplebbitPage", [pageCid, subplebbitAddress])];
                    case 1:
                        pageIpfs = _a.sent();
                        return [2 /*return*/, pageIpfs];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.createSubplebbit = function (createSubplebbitOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var subProps, subplebbit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("createSubplebbit", [createSubplebbitOptions])];
                    case 1:
                        subProps = _a.sent();
                        subplebbit = new subplebbit_1.Subplebbit(this._plebbit);
                        return [4 /*yield*/, subplebbit.initSubplebbit(subProps)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, subplebbit];
                }
            });
        });
    };
    PlebbitRpcClient.prototype._initSubscriptionEvent = function (subscriptionId) {
        if (!this._subscriptionEvents[subscriptionId])
            this._subscriptionEvents[subscriptionId] = new events_1.default();
        if (!this._pendingSubscriptionMsgs[subscriptionId])
            this._pendingSubscriptionMsgs[subscriptionId] = [];
    };
    PlebbitRpcClient.prototype.startSubplebbit = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var subscriptionId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("startSubplebbit", [subplebbitAddress])];
                    case 1:
                        subscriptionId = _a.sent();
                        this._initSubscriptionEvent(subscriptionId);
                        return [2 /*return*/, subscriptionId];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.stopSubplebbit = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("stopSubplebbit", [subplebbitAddress])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.editSubplebbit = function (subplebbitAddress, subplebbitEditOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var editedSub;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("editSubplebbit", [subplebbitAddress, subplebbitEditOptions])];
                    case 1:
                        editedSub = (_a.sent());
                        return [2 /*return*/, editedSub];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.deleteSubplebbit = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("deleteSubplebbit", [subplebbitAddress])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.subplebbitUpdate = function (subplebbitAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var subscriptionId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("subplebbitUpdate", [subplebbitAddress])];
                    case 1:
                        subscriptionId = _a.sent();
                        this._initSubscriptionEvent(subscriptionId);
                        return [2 /*return*/, subscriptionId];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.publishComment = function (commentProps) {
        return __awaiter(this, void 0, void 0, function () {
            var subscriptionId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("publishComment", [commentProps])];
                    case 1:
                        subscriptionId = _a.sent();
                        return [2 /*return*/, subscriptionId];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.publishCommentEdit = function (commentEditProps) {
        return __awaiter(this, void 0, void 0, function () {
            var subscriptionId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("publishCommentEdit", [commentEditProps])];
                    case 1:
                        subscriptionId = _a.sent();
                        return [2 /*return*/, subscriptionId];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.publishVote = function (voteProps) {
        return __awaiter(this, void 0, void 0, function () {
            var subscriptionId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("publishVote", [voteProps])];
                    case 1:
                        subscriptionId = _a.sent();
                        return [2 /*return*/, subscriptionId];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.commentUpdate = function (commentCid) {
        return __awaiter(this, void 0, void 0, function () {
            var subscriptionId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assert_1.default)(commentCid, "Need to have comment cid in order to call RPC commentUpdate");
                        return [4 /*yield*/, this._webSocketClient.call("commentUpdate", [commentCid])];
                    case 1:
                        subscriptionId = _a.sent();
                        this._initSubscriptionEvent(subscriptionId);
                        return [2 /*return*/, subscriptionId];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.publishChallengeAnswers = function (subscriptionId, challengeAnswers) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("publishChallengeAnswers", [subscriptionId, challengeAnswers])];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.resolveAuthorAddress = function (authorAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("resolveAuthorAddress", [authorAddress])];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.listSubplebbits = function () {
        return __awaiter(this, void 0, void 0, function () {
            var subs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("listSubplebbits", [])];
                    case 1:
                        subs = _a.sent();
                        return [2 /*return*/, subs];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.fetchCid = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("fetchCid", [cid])];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.setSettings = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("setSettings", [settings])];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.getSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._webSocketClient.call("getSettings", [])];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    PlebbitRpcClient.prototype.getDefaults = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw Error("Not implemented");
            });
        });
    };
    PlebbitRpcClient.prototype.getPeers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw Error("Not implemented");
            });
        });
    };
    PlebbitRpcClient.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw Error("Not implemented");
            });
        });
    };
    return PlebbitRpcClient;
}());
exports.default = PlebbitRpcClient;
//# sourceMappingURL=plebbit-rpc-client.js.map