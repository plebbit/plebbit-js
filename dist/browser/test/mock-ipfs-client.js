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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
var socket_io_client_1 = __importDefault(require("socket.io-client"));
var port = 25963;
if (globalThis["window"] && !globalThis["window"]["io"])
    globalThis["window"]["io"] = (0, socket_io_client_1.default)("ws://localhost:".concat(port));
var ioClient = ((_a = globalThis["window"]) === null || _a === void 0 ? void 0 : _a["io"]) || (0, socket_io_client_1.default)("ws://localhost:".concat(port));
var IpfsHttpClient = /** @class */ (function () {
    function IpfsHttpClient() {
        var _this = this;
        this.subscriptions = [];
        this.pubsub = {
            publish: function (topic, message) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    ioClient.emit(topic, message);
                    return [2 /*return*/];
                });
            }); },
            subscribe: function (topic, rawCallback) { return __awaiter(_this, void 0, void 0, function () {
                var callback;
                return __generator(this, function (_a) {
                    callback = function (msg) {
                        rawCallback({ from: undefined, seqno: undefined, topicIDs: undefined, data: new Uint8Array(msg) });
                    };
                    ioClient.on(topic, callback);
                    this.subscriptions.push({ topic: topic, rawCallback: rawCallback, callback: callback });
                    return [2 /*return*/];
                });
            }); },
            unsubscribe: function (topic, rawCallback) { return __awaiter(_this, void 0, void 0, function () {
                var toUnsubscribeIndex_1;
                return __generator(this, function (_a) {
                    if (!rawCallback) {
                        ioClient.off(topic);
                        this.subscriptions = this.subscriptions.filter(function (sub) { return sub.topic !== topic; });
                    }
                    else {
                        toUnsubscribeIndex_1 = this.subscriptions.findIndex(function (sub) { return sub.topic === topic && sub.rawCallback === rawCallback; });
                        if (toUnsubscribeIndex_1 === -1)
                            return [2 /*return*/];
                        ioClient.off(topic, this.subscriptions[toUnsubscribeIndex_1].callback);
                        this.subscriptions = this.subscriptions.filter(function (_, i) { return i !== toUnsubscribeIndex_1; });
                    }
                    return [2 /*return*/];
                });
            }); },
            ls: function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.subscriptions.map(function (sub) { return sub.topic; })];
                });
            }); }
        };
    }
    return IpfsHttpClient;
}());
var create = function () { return new IpfsHttpClient(); };
exports.create = create;
//# sourceMappingURL=mock-ipfs-client.js.map