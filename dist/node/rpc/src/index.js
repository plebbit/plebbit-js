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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var rpc_websockets_1 = require("rpc-websockets");
var plebbit_js_1 = __importStar(require("./lib/plebbit-js"));
var utils_1 = require("./utils");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var events_1 = require("events");
var log = (0, plebbit_logger_1.default)("plebbit-js-rpc:plebbit-ws-server");
var lodash_1 = __importDefault(require("lodash"));
// store started subplebbits  to be able to stop them
// store as a singleton because not possible to start the same sub twice at the same time
var startedSubplebbits = {};
var getStartedSubplebbit = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(startedSubplebbits[address] === "pending")) return [3 /*break*/, 2];
                return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 20); })];
            case 1:
                _a.sent();
                return [3 /*break*/, 0];
            case 2: return [2 /*return*/, startedSubplebbits[address]];
        }
    });
}); };
var PlebbitWsServer = /** @class */ (function (_super) {
    __extends(PlebbitWsServer, _super);
    function PlebbitWsServer(_a) {
        var port = _a.port, plebbit = _a.plebbit, plebbitOptions = _a.plebbitOptions;
        var _this = _super.call(this) || this;
        _this.connections = {};
        _this.subscriptionCleanups = {};
        // store publishing publications so they can be used by publishChallengeAnswers
        _this.publishing = {};
        var log = (0, plebbit_logger_1.default)("plebbit:PlebbitWsServer");
        // don't instantiate plebbit in constructor because it's an async function
        _this.plebbit = plebbit;
        _this.rpcWebsockets = new rpc_websockets_1.Server({
            port: port
            // might be needed to specify host for security later
            // host: 'localhost'
        });
        // rpc-sockets uses this library https://www.npmjs.com/package/ws
        _this.ws = _this.rpcWebsockets.wss;
        // forward errors to PlebbitWsServer
        _this.rpcWebsockets.on("error", function (error) {
            _this.emit("error", error);
        });
        _this.plebbit.on("error", function (error) {
            _this.emit("error", error);
        });
        _this.on("error", function (err) {
            log.error(err);
        });
        // save connections to send messages to them later
        _this.ws.on("connection", function (ws) {
            //@ts-expect-error
            _this.connections[ws._id] = ws;
            //@ts-expect-error
            _this.subscriptionCleanups[ws._id] = {};
        });
        // cleanup on disconnect
        _this.rpcWebsockets.on("disconnection", function (ws) {
            var subscriptionCleanups = _this.subscriptionCleanups[ws._id];
            for (var subscriptionId in subscriptionCleanups) {
                subscriptionCleanups[subscriptionId]();
                delete subscriptionCleanups[subscriptionId];
            }
            delete _this.subscriptionCleanups[ws._id];
            delete _this.connections[ws._id];
        });
        // register all JSON RPC methods
        _this.rpcWebsocketsRegister("getComment", _this.getComment.bind(_this));
        _this.rpcWebsocketsRegister("getSubplebbitPage", _this.getSubplebbitPage.bind(_this));
        _this.rpcWebsocketsRegister("getCommentPage", _this.getCommentPage.bind(_this));
        _this.rpcWebsocketsRegister("createSubplebbit", _this.createSubplebbit.bind(_this));
        _this.rpcWebsocketsRegister("startSubplebbit", _this.startSubplebbit.bind(_this));
        _this.rpcWebsocketsRegister("stopSubplebbit", _this.stopSubplebbit.bind(_this));
        _this.rpcWebsocketsRegister("editSubplebbit", _this.editSubplebbit.bind(_this));
        _this.rpcWebsocketsRegister("deleteSubplebbit", _this.deleteSubplebbit.bind(_this));
        _this.rpcWebsocketsRegister("listSubplebbits", _this.listSubplebbits.bind(_this));
        _this.rpcWebsocketsRegister("fetchCid", _this.fetchCid.bind(_this));
        _this.rpcWebsocketsRegister("resolveAuthorAddress", _this.resolveAuthorAddress.bind(_this));
        _this.rpcWebsocketsRegister("getSettings", _this.getSettings.bind(_this));
        _this.rpcWebsocketsRegister("setSettings", _this.setSettings.bind(_this));
        // JSON RPC pubsub methods
        _this.rpcWebsocketsRegister("commentUpdate", _this.commentUpdate.bind(_this));
        _this.rpcWebsocketsRegister("subplebbitUpdate", _this.subplebbitUpdate.bind(_this));
        _this.rpcWebsocketsRegister("publishComment", _this.publishComment.bind(_this));
        _this.rpcWebsocketsRegister("publishVote", _this.publishVote.bind(_this));
        _this.rpcWebsocketsRegister("publishCommentEdit", _this.publishCommentEdit.bind(_this));
        _this.rpcWebsocketsRegister("publishChallengeAnswers", _this.publishChallengeAnswers.bind(_this));
        _this.rpcWebsocketsRegister("unsubscribe", _this.unsubscribe.bind(_this));
        return _this;
    }
    // util function to log errors of registered methods
    PlebbitWsServer.prototype.rpcWebsocketsRegister = function (method, callback) {
        var _this = this;
        var callbackWithErrorHandled = function (params, connectionId) { return __awaiter(_this, void 0, void 0, function () {
            var res, e_1, errorJson, errorJson;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, callback(params, connectionId)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res];
                    case 2:
                        e_1 = _a.sent();
                        log.error("".concat(callback.name, " error"), { params: params, error: e_1 });
                        // We need to stringify the error here because rpc-websocket will remove props from PlebbitError
                        if (!e_1.code) {
                            errorJson = JSON.parse(JSON.stringify(e_1, Object.getOwnPropertyNames(e_1)));
                            delete errorJson["stack"];
                            throw errorJson;
                        }
                        else {
                            errorJson = (0, utils_1.clone)(e_1);
                            delete errorJson["stack"];
                            throw errorJson;
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.rpcWebsockets.register(method, callbackWithErrorHandled);
    };
    // send json rpc notification message (no id field, but must have subscription id)
    PlebbitWsServer.prototype.jsonRpcSendNotification = function (_a) {
        var _b, _c, _d, _e, _f, _g, _h, _j;
        var method = _a.method, result = _a.result, subscription = _a.subscription, event = _a.event, connectionId = _a.connectionId;
        var message = {
            jsonrpc: "2.0",
            method: method,
            params: {
                result: result,
                subscription: subscription,
                event: event
            }
        };
        if (event === "error") {
            (_c = (_b = message === null || message === void 0 ? void 0 : message.params) === null || _b === void 0 ? void 0 : _b.result) === null || _c === void 0 ? true : delete _c.stack;
            (_g = (_f = (_e = (_d = message === null || message === void 0 ? void 0 : message.params) === null || _d === void 0 ? void 0 : _d.result) === null || _e === void 0 ? void 0 : _e.details) === null || _f === void 0 ? void 0 : _f.error) === null || _g === void 0 ? true : delete _g.stack;
        }
        (_j = (_h = this.connections[connectionId]) === null || _h === void 0 ? void 0 : _h.send) === null || _j === void 0 ? void 0 : _j.call(_h, JSON.stringify(message));
    };
    PlebbitWsServer.prototype.getComment = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var cid, comment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cid = params[0];
                        return [4 /*yield*/, this.plebbit.getComment(cid)];
                    case 1:
                        comment = _a.sent();
                        //@ts-expect-error
                        return [2 /*return*/, __assign({ cid: cid }, comment._rawCommentIpfs)];
                }
            });
        });
    };
    PlebbitWsServer.prototype.getSubplebbitPage = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var pageCid, subplebbitAddress, subplebbit, page;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pageCid = params[0];
                        subplebbitAddress = params[1];
                        return [4 /*yield*/, this.plebbit.createSubplebbit({ address: subplebbitAddress })];
                    case 1:
                        subplebbit = _a.sent();
                        return [4 /*yield*/, subplebbit.posts._fetchAndVerifyPage(pageCid)];
                    case 2:
                        page = _a.sent();
                        return [2 /*return*/, page];
                }
            });
        });
    };
    PlebbitWsServer.prototype.getCommentPage = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var pageCid, commentCid, subplebbitAddress, comment, page;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pageCid = params[0], commentCid = params[1], subplebbitAddress = params[2];
                        return [4 /*yield*/, this.plebbit.createComment({ cid: commentCid, subplebbitAddress: subplebbitAddress })];
                    case 1:
                        comment = _a.sent();
                        return [4 /*yield*/, comment.replies._fetchAndVerifyPage(pageCid)];
                    case 2:
                        page = _a.sent();
                        return [2 /*return*/, page];
                }
            });
        });
    };
    PlebbitWsServer.prototype.createSubplebbit = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var createSubplebbitOptions, subplebbit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createSubplebbitOptions = params[0];
                        if (createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.address) {
                            throw Error("createSubplebbitOptions?.address '".concat(createSubplebbitOptions === null || createSubplebbitOptions === void 0 ? void 0 : createSubplebbitOptions.address, "' must be undefined to create a new subplebbit"));
                        }
                        return [4 /*yield*/, this.plebbit.createSubplebbit(createSubplebbitOptions)];
                    case 1:
                        subplebbit = _a.sent();
                        return [2 /*return*/, subplebbit.toJSONInternalRpc()];
                }
            });
        });
    };
    PlebbitWsServer.prototype.startSubplebbit = function (params, connectionId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var address, subscriptionId, sendEvent, subplebbit_1, e_2;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        address = params[0];
                        if (startedSubplebbits[address]) {
                            throw Error("subplebbit '".concat(address, "' already started"));
                        }
                        startedSubplebbits[address] = "pending";
                        subscriptionId = (0, utils_1.generateSubscriptionId)();
                        sendEvent = function (event, result) {
                            return _this.jsonRpcSendNotification({ method: "startSubplebbit", subscription: subscriptionId, event: event, result: result, connectionId: connectionId });
                        };
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.plebbit.createSubplebbit({ address: address })];
                    case 2:
                        subplebbit_1 = _c.sent();
                        subplebbit_1.on("update", function () { return sendEvent("update", subplebbit_1.toJSONInternalRpc()); });
                        subplebbit_1.on("startedstatechange", function () { return sendEvent("startedstatechange", subplebbit_1.startedState); });
                        subplebbit_1.on("challenge", function (challenge) { return sendEvent("challenge", (0, utils_1.encodePubsubMsg)(challenge)); });
                        subplebbit_1.on("challengeanswer", function (answer) { return sendEvent("challengeanswer", (0, utils_1.encodePubsubMsg)(answer)); });
                        subplebbit_1.on("challengerequest", function (request) { return sendEvent("challengerequest", (0, utils_1.encodePubsubMsg)(request)); });
                        subplebbit_1.on("challengeverification", function (challengeVerification) {
                            return sendEvent("challengeverification", (0, utils_1.encodePubsubMsg)(challengeVerification));
                        });
                        subplebbit_1.on("error", function (error) { return sendEvent("error", error); });
                        // cleanup function
                        this.subscriptionCleanups[connectionId][subscriptionId] = function () {
                            subplebbit_1.removeAllListeners("update");
                            subplebbit_1.removeAllListeners("startedstatechange");
                            subplebbit_1.removeAllListeners("challenge");
                            subplebbit_1.removeAllListeners("challengeanswer");
                            subplebbit_1.removeAllListeners("challengerequest");
                            subplebbit_1.removeAllListeners("challengeverification");
                        };
                        subplebbit_1.emit("update", subplebbit_1); // Need to emit an update so rpc user can receive sub props prior to running
                        return [4 /*yield*/, subplebbit_1.start()];
                    case 3:
                        _c.sent();
                        startedSubplebbits[address] = subplebbit_1;
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _c.sent();
                        if ((_b = (_a = this.subscriptionCleanups) === null || _a === void 0 ? void 0 : _a[connectionId]) === null || _b === void 0 ? void 0 : _b[subscriptionId])
                            this.subscriptionCleanups[connectionId][subscriptionId]();
                        delete startedSubplebbits[address];
                        throw e_2;
                    case 5: return [2 /*return*/, subscriptionId];
                }
            });
        });
    };
    PlebbitWsServer.prototype.stopSubplebbit = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var address, startedSubplebbit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = params[0];
                        return [4 /*yield*/, getStartedSubplebbit(address)];
                    case 1:
                        startedSubplebbit = _a.sent();
                        if (!startedSubplebbit)
                            return [2 /*return*/, true];
                        return [4 /*yield*/, startedSubplebbit.stop()];
                    case 2:
                        _a.sent();
                        delete startedSubplebbits[address];
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PlebbitWsServer.prototype.editSubplebbit = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var address, editSubplebbitOptions, subplebbit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = params[0];
                        editSubplebbitOptions = params[1];
                        return [4 /*yield*/, this.plebbit.createSubplebbit({ address: address })];
                    case 1:
                        subplebbit = _a.sent();
                        return [4 /*yield*/, subplebbit.edit(editSubplebbitOptions)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, subplebbit.toJSONInternalRpc()];
                }
            });
        });
    };
    PlebbitWsServer.prototype.deleteSubplebbit = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var address, startedSubplebbit, addresses, subplebbit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = params[0];
                        return [4 /*yield*/, getStartedSubplebbit(address)];
                    case 1:
                        startedSubplebbit = _a.sent();
                        if (!startedSubplebbit) return [3 /*break*/, 4];
                        return [4 /*yield*/, startedSubplebbit.stop()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, startedSubplebbit.delete()];
                    case 3:
                        _a.sent();
                        delete startedSubplebbits[address];
                        return [3 /*break*/, 8];
                    case 4: return [4 /*yield*/, this.plebbit.listSubplebbits()];
                    case 5:
                        addresses = _a.sent();
                        if (!addresses.includes(address)) {
                            throw Error("subplebbit with address '".concat(address, "' not found in plebbit.listSubplebbits()"));
                        }
                        return [4 /*yield*/, this.plebbit.createSubplebbit({ address: address })];
                    case 6:
                        subplebbit = _a.sent();
                        return [4 /*yield*/, subplebbit.delete()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/, true];
                }
            });
        });
    };
    PlebbitWsServer.prototype.listSubplebbits = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var subplebbits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.plebbit.listSubplebbits()];
                    case 1:
                        subplebbits = _a.sent();
                        return [2 /*return*/, (0, utils_1.clone)(subplebbits)];
                }
            });
        });
    };
    PlebbitWsServer.prototype.fetchCid = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var cid, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cid = params[0];
                        return [4 /*yield*/, this.plebbit.fetchCid(cid)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    PlebbitWsServer.prototype.getSettings = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var plebbitOptions, challenges;
            return __generator(this, function (_a) {
                plebbitOptions = this.plebbit.parsedPlebbitOptions;
                challenges = lodash_1.default.mapValues(plebbit_js_1.default.Plebbit.challenges, function (challengeFactory) {
                    return lodash_1.default.omit(challengeFactory({}), "getChallenge");
                });
                return [2 /*return*/, { plebbitOptions: plebbitOptions, challenges: challenges }];
            });
        });
    };
    PlebbitWsServer.prototype.setSettings = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var settings, _a, _b, _c, _d, _i, address, startedSubplebbit, error_1, _e, _f, error_2;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        settings = params[0];
                        _a = this;
                        return [4 /*yield*/, plebbit_js_1.default.Plebbit(settings.plebbitOptions)];
                    case 1:
                        _a.plebbit = _g.sent();
                        this.plebbit.on("error", function (error) {
                            _this.emit("error", error);
                        });
                        _b = startedSubplebbits;
                        _c = [];
                        for (_d in _b)
                            _c.push(_d);
                        _i = 0;
                        _g.label = 2;
                    case 2:
                        if (!(_i < _c.length)) return [3 /*break*/, 12];
                        _d = _c[_i];
                        if (!(_d in _b)) return [3 /*break*/, 11];
                        address = _d;
                        return [4 /*yield*/, getStartedSubplebbit(address)];
                    case 3:
                        startedSubplebbit = _g.sent();
                        _g.label = 4;
                    case 4:
                        _g.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, startedSubplebbit.stop()];
                    case 5:
                        _g.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _g.sent();
                        log.error("setPlebbitOptions failed stopping subplebbit", { error: error_1, address: address, params: params });
                        return [3 /*break*/, 7];
                    case 7:
                        _g.trys.push([7, 10, , 11]);
                        _e = startedSubplebbits;
                        _f = address;
                        return [4 /*yield*/, this.plebbit.createSubplebbit({ address: address })];
                    case 8:
                        _e[_f] = _g.sent();
                        return [4 /*yield*/, startedSubplebbits[address].start()];
                    case 9:
                        _g.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        error_2 = _g.sent();
                        log.error("setPlebbitOptions failed restarting subplebbit", { error: error_2, address: address, params: params });
                        return [3 /*break*/, 11];
                    case 11:
                        _i++;
                        return [3 /*break*/, 2];
                    case 12: 
                    // TODO: possibly restart all updating comment/subplebbit subscriptions with new plebbit options,
                    // not sure if needed because plebbit-react-hooks clients can just reload the page, low priority
                    return [2 /*return*/, true];
                }
            });
        });
    };
    PlebbitWsServer.prototype.commentUpdate = function (params, connectionId) {
        return __awaiter(this, void 0, void 0, function () {
            var cid, subscriptionId, sendEvent, comment, e_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cid = params[0];
                        subscriptionId = (0, utils_1.generateSubscriptionId)();
                        sendEvent = function (event, result) {
                            return _this.jsonRpcSendNotification({ method: "commentUpdate", subscription: subscriptionId, event: event, result: result, connectionId: connectionId });
                        };
                        return [4 /*yield*/, this.plebbit.createComment({ cid: cid })];
                    case 1:
                        comment = _a.sent();
                        comment.on("update", function () {
                            //@ts-expect-error
                            return sendEvent("update", comment.updatedAt ? comment._rawCommentUpdate : __assign({ cid: cid }, comment._rawCommentIpfs));
                        });
                        comment.on("updatingstatechange", function () { return sendEvent("updatingstatechange", comment.updatingState); });
                        comment.on("error", function (error) { return sendEvent("error", error); });
                        // cleanup function
                        this.subscriptionCleanups[connectionId][subscriptionId] = function () {
                            comment.stop().catch(function (error) { return log.error("commentUpdate stop error", { error: error, params: params }); });
                            comment.removeAllListeners("update");
                            comment.removeAllListeners("updatingstatechange");
                        };
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, comment.update()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_3 = _a.sent();
                        this.subscriptionCleanups[connectionId][subscriptionId]();
                        throw e_3;
                    case 5: return [2 /*return*/, subscriptionId];
                }
            });
        });
    };
    PlebbitWsServer.prototype.subplebbitUpdate = function (params, connectionId) {
        return __awaiter(this, void 0, void 0, function () {
            var address, subscriptionId, sendEvent, subplebbit, e_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = params[0];
                        subscriptionId = (0, utils_1.generateSubscriptionId)();
                        sendEvent = function (event, result) {
                            return _this.jsonRpcSendNotification({ method: "subplebbitUpdate", subscription: subscriptionId, event: event, result: result, connectionId: connectionId });
                        };
                        return [4 /*yield*/, this.plebbit.createSubplebbit({ address: address })];
                    case 1:
                        subplebbit = _a.sent();
                        subplebbit.on("update", function () { return sendEvent("update", subplebbit.signer ? subplebbit.toJSONInternalRpc() : subplebbit.toJSONIpfs()); });
                        subplebbit.on("updatingstatechange", function () { return sendEvent("updatingstatechange", subplebbit.updatingState); });
                        subplebbit.on("error", function (error) { return sendEvent("error", error); });
                        // cleanup function
                        this.subscriptionCleanups[connectionId][subscriptionId] = function () {
                            subplebbit.stop().catch(function (error) { return log.error("subplebbitUpdate stop error", { error: error, params: params }); });
                            subplebbit.removeAllListeners("update");
                            subplebbit.removeAllListeners("updatingstatechange");
                        };
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        if (subplebbit.signer)
                            // need to send an update when fetching sub from db for first time
                            subplebbit.emit("update", subplebbit);
                        return [4 /*yield*/, subplebbit.update()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_4 = _a.sent();
                        this.subscriptionCleanups[connectionId][subscriptionId]();
                        throw e_4;
                    case 5: return [2 /*return*/, subscriptionId];
                }
            });
        });
    };
    PlebbitWsServer.prototype.publishComment = function (params, connectionId) {
        return __awaiter(this, void 0, void 0, function () {
            var publishOptions, subscriptionId, sendEvent, comment, e_5;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        publishOptions = params[0];
                        subscriptionId = (0, utils_1.generateSubscriptionId)();
                        sendEvent = function (event, result) {
                            return _this.jsonRpcSendNotification({ method: "publishComment", subscription: subscriptionId, event: event, result: result, connectionId: connectionId });
                        };
                        return [4 /*yield*/, this.plebbit.createComment(__assign({ challengeAnswers: publishOptions.challengeAnswers, challengeCommentCids: publishOptions.challengeCommentCids }, publishOptions.publication))];
                    case 1:
                        comment = _a.sent();
                        this.publishing[subscriptionId] = comment;
                        comment.on("challenge", function (challenge) { return sendEvent("challenge", (0, utils_1.encodePubsubMsg)(challenge)); });
                        comment.on("challengeanswer", function (answer) { return sendEvent("challengeanswer", (0, utils_1.encodePubsubMsg)(answer)); });
                        comment.on("challengerequest", function (request) { return sendEvent("challengerequest", (0, utils_1.encodePubsubMsg)(request)); });
                        comment.on("challengeverification", function (challengeVerification) {
                            return sendEvent("challengeverification", (0, utils_1.encodePubsubMsg)(challengeVerification));
                        });
                        comment.on("publishingstatechange", function () { return sendEvent("publishingstatechange", comment.publishingState); });
                        comment.on("error", function (error) { return sendEvent("error", error); });
                        // cleanup function
                        this.subscriptionCleanups[connectionId][subscriptionId] = function () {
                            delete _this.publishing[subscriptionId];
                            comment.stop().catch(function (error) { return log.error("publishComment stop error", { error: error, params: params }); });
                            comment.removeAllListeners("challenge");
                            comment.removeAllListeners("challengeanswer");
                            comment.removeAllListeners("challengerequest");
                            comment.removeAllListeners("challengeverification");
                            comment.removeAllListeners("publishingstatechange");
                        };
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, comment.publish()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_5 = _a.sent();
                        this.subscriptionCleanups[connectionId][subscriptionId]();
                        throw e_5;
                    case 5: return [2 /*return*/, subscriptionId];
                }
            });
        });
    };
    PlebbitWsServer.prototype.publishVote = function (params, connectionId) {
        return __awaiter(this, void 0, void 0, function () {
            var publishOptions, subscriptionId, sendEvent, vote, e_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        publishOptions = params[0];
                        subscriptionId = (0, utils_1.generateSubscriptionId)();
                        sendEvent = function (event, result) {
                            return _this.jsonRpcSendNotification({ method: "publishVote", subscription: subscriptionId, event: event, result: result, connectionId: connectionId });
                        };
                        return [4 /*yield*/, this.plebbit.createVote(__assign(__assign({}, publishOptions.publication), { challengeAnswers: publishOptions.challengeAnswers, challengeCommentCids: publishOptions.challengeCommentCids }))];
                    case 1:
                        vote = _a.sent();
                        this.publishing[subscriptionId] = vote;
                        vote.on("challenge", function (challenge) { return sendEvent("challenge", (0, utils_1.encodePubsubMsg)(challenge)); });
                        vote.on("challengeanswer", function (answer) { return sendEvent("challengeanswer", (0, utils_1.encodePubsubMsg)(answer)); });
                        vote.on("challengerequest", function (request) { return sendEvent("challengerequest", (0, utils_1.encodePubsubMsg)(request)); });
                        vote.on("challengeverification", function (challengeVerification) {
                            return sendEvent("challengeverification", (0, utils_1.encodePubsubMsg)(challengeVerification));
                        });
                        vote.on("publishingstatechange", function () { return sendEvent("publishingstatechange", vote.publishingState); });
                        vote.on("error", function (error) { return sendEvent("error", error); });
                        // cleanup function
                        this.subscriptionCleanups[connectionId][subscriptionId] = function () {
                            delete _this.publishing[subscriptionId];
                            vote.stop().catch(function (error) { return log.error("publishVote stop error", { error: error, params: params }); });
                            vote.removeAllListeners("challenge");
                            vote.removeAllListeners("challengeanswer");
                            vote.removeAllListeners("challengerequest");
                            vote.removeAllListeners("challengeverification");
                            vote.removeAllListeners("publishingstatechange");
                        };
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, vote.publish()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_6 = _a.sent();
                        this.subscriptionCleanups[connectionId][subscriptionId]();
                        throw e_6;
                    case 5: return [2 /*return*/, subscriptionId];
                }
            });
        });
    };
    PlebbitWsServer.prototype.publishCommentEdit = function (params, connectionId) {
        return __awaiter(this, void 0, void 0, function () {
            var publishOptions, subscriptionId, sendEvent, commentEdit, e_7;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        publishOptions = params[0];
                        subscriptionId = (0, utils_1.generateSubscriptionId)();
                        sendEvent = function (event, result) {
                            return _this.jsonRpcSendNotification({ method: "publishCommentEdit", subscription: subscriptionId, event: event, result: result, connectionId: connectionId });
                        };
                        return [4 /*yield*/, this.plebbit.createCommentEdit(__assign(__assign({}, publishOptions.publication), { challengeCommentCids: publishOptions.challengeCommentCids, challengeAnswers: publishOptions.challengeAnswers }))];
                    case 1:
                        commentEdit = _a.sent();
                        this.publishing[subscriptionId] = commentEdit;
                        commentEdit.on("challenge", function (challenge) { return sendEvent("challenge", (0, utils_1.encodePubsubMsg)(challenge)); });
                        commentEdit.on("challengeanswer", function (answer) { return sendEvent("challengeanswer", (0, utils_1.encodePubsubMsg)(answer)); });
                        commentEdit.on("challengerequest", function (request) { return sendEvent("challengerequest", (0, utils_1.encodePubsubMsg)(request)); });
                        commentEdit.on("challengeverification", function (challengeVerification) {
                            return sendEvent("challengeverification", (0, utils_1.encodePubsubMsg)(challengeVerification));
                        });
                        commentEdit.on("publishingstatechange", function () { return sendEvent("publishingstatechange", commentEdit.publishingState); });
                        commentEdit.on("error", function (error) { return sendEvent("error", error); });
                        // cleanup function
                        this.subscriptionCleanups[connectionId][subscriptionId] = function () {
                            delete _this.publishing[subscriptionId];
                            commentEdit.stop().catch(function (error) { return log.error("publishCommentEdit stop error", { error: error, params: params }); });
                            commentEdit.removeAllListeners("challengerequest");
                            commentEdit.removeAllListeners("challenge");
                            commentEdit.removeAllListeners("challengeanswer");
                            commentEdit.removeAllListeners("challengeverification");
                            commentEdit.removeAllListeners("publishingstatechange");
                        };
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, commentEdit.publish()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_7 = _a.sent();
                        this.subscriptionCleanups[connectionId][subscriptionId]();
                        throw e_7;
                    case 5: return [2 /*return*/, subscriptionId];
                }
            });
        });
    };
    PlebbitWsServer.prototype.publishChallengeAnswers = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var subscriptionId, answers, publication;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        subscriptionId = params[0];
                        answers = params[1];
                        if (!this.publishing[subscriptionId]) {
                            throw Error("no subscription with id '".concat(subscriptionId, "'"));
                        }
                        publication = this.publishing[subscriptionId];
                        return [4 /*yield*/, publication.publishChallengeAnswers(answers)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    PlebbitWsServer.prototype.resolveAuthorAddress = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var authorAddress, resolvedAuthorAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authorAddress = params[0];
                        return [4 /*yield*/, this.plebbit.resolveAuthorAddress(authorAddress)];
                    case 1:
                        resolvedAuthorAddress = _a.sent();
                        return [2 /*return*/, resolvedAuthorAddress];
                }
            });
        });
    };
    PlebbitWsServer.prototype.unsubscribe = function (params, connectionId) {
        return __awaiter(this, void 0, void 0, function () {
            var subscriptionId;
            return __generator(this, function (_a) {
                subscriptionId = params[0];
                if (!this.subscriptionCleanups[connectionId][subscriptionId])
                    return [2 /*return*/, true];
                this.subscriptionCleanups[connectionId][subscriptionId]();
                delete this.subscriptionCleanups[connectionId][subscriptionId];
                return [2 /*return*/, true];
            });
        });
    };
    PlebbitWsServer.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, subplebbitAddress, startedSub;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = Object.keys(startedSubplebbits);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        subplebbitAddress = _a[_i];
                        return [4 /*yield*/, getStartedSubplebbit(subplebbitAddress)];
                    case 2:
                        startedSub = _b.sent();
                        return [4 /*yield*/, startedSub.stop()];
                    case 3:
                        _b.sent();
                        delete startedSubplebbits[subplebbitAddress];
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        this.ws.close();
                        return [4 /*yield*/, this.plebbit.destroy()];
                    case 6:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return PlebbitWsServer;
}(events_1.EventEmitter));
var createPlebbitWsServer = function (_a) {
    var port = _a.port, plebbitOptions = _a.plebbitOptions;
    return __awaiter(void 0, void 0, void 0, function () {
        var plebbit, plebbitWss;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (typeof port !== "number") {
                        throw Error("createPlebbitWsServer port '".concat(port, "' not a number"));
                    }
                    return [4 /*yield*/, plebbit_js_1.default.Plebbit(plebbitOptions)];
                case 1:
                    plebbit = _b.sent();
                    plebbitWss = new PlebbitWsServer({ plebbit: plebbit, port: port, plebbitOptions: plebbitOptions });
                    return [2 /*return*/, plebbitWss];
            }
        });
    });
};
var PlebbitRpc = {
    PlebbitWsServer: createPlebbitWsServer,
    // for mocking plebbit-js during tests
    setPlebbitJs: plebbit_js_1.setPlebbitJs
};
module.exports = PlebbitRpc;
//# sourceMappingURL=index.js.map