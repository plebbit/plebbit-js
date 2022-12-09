"use strict";
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var assert_1 = __importDefault(require("assert"));
var plebbit_1 = require("../../plebbit");
var db_handler_1 = require("./db-handler");
var node_fetch_1 = __importDefault(require("node-fetch"));
var ipfs_http_client_1 = require("ipfs-http-client");
var it_all_1 = __importDefault(require("it-all"));
var it_last_1 = __importDefault(require("it-last"));
var concat_1 = require("uint8arrays/concat");
var to_string_1 = require("uint8arrays/to-string");
var captcha_canvas_1 = require("captcha-canvas");
var http_1 = require("http");
var https_1 = require("https");
var form_data_1 = __importDefault(require("form-data"));
var multiaddr_1 = require("multiaddr");
var nativeFunctions = {
    createImageCaptcha: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(void 0, void 0, void 0, function () {
            var _a, image, text, imageBase64;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = captcha_canvas_1.createCaptcha.apply(void 0, args), image = _a.image, text = _a.text;
                        return [4 /*yield*/, image];
                    case 1:
                        imageBase64 = (_b.sent()).toString("base64");
                        return [2 /*return*/, { image: imageBase64, text: text }];
                }
            });
        });
    },
    listSubplebbits: function (dataPath) { return __awaiter(void 0, void 0, void 0, function () {
        var subplebbitsPath, addresses;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, assert_1.default)(typeof dataPath === "string", "Data path is not defined");
                    subplebbitsPath = path_1.default.join(dataPath, "subplebbits");
                    return [4 /*yield*/, promises_1.default.mkdir(subplebbitsPath, { recursive: true })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, promises_1.default.readdir(subplebbitsPath, { withFileTypes: true })];
                case 2:
                    addresses = (_a.sent())
                        .filter(function (file) { return file.isFile() && !Boolean(plebbit_1.pendingSubplebbitCreations[file.name]) && !/-journal$/.test(file.name); } // Ignore sqlite journal files
                    )
                        .map(function (file) { return file.name; });
                    return [2 /*return*/, addresses];
            }
        });
    }); },
    createDbHandler: function (subplebbit) {
        var dbHandler = new db_handler_1.DbHandler(subplebbit);
        var dbApi = {};
        for (var property in dbHandler)
            if (typeof dbHandler[property] === "function" && !property.startsWith("_"))
                dbApi[property] = dbHandler[property].bind(dbHandler);
        //@ts-ignore
        return dbApi;
    },
    //@ts-ignore
    fetch: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(void 0, void 0, void 0, function () {
            var res, resObj, property;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, node_fetch_1.default.apply(void 0, args)];
                    case 1:
                        res = _a.sent();
                        resObj = {};
                        for (property in res)
                            resObj[property] = typeof res[property] === "function" ? res[property].bind(res) : res[property];
                        return [2 /*return*/, resObj];
                }
            });
        });
    },
    createIpfsClient: function (ipfsHttpClientOptions) {
        var _a;
        var isHttpsAgent = typeof ipfsHttpClientOptions === "string"
            ? ipfsHttpClientOptions.startsWith("https")
            : (typeof ipfsHttpClientOptions.url === "string" && ipfsHttpClientOptions.url.startsWith("https")) ||
                (ipfsHttpClientOptions === null || ipfsHttpClientOptions === void 0 ? void 0 : ipfsHttpClientOptions.protocol) === "https" ||
                (ipfsHttpClientOptions.url instanceof URL && ((_a = ipfsHttpClientOptions === null || ipfsHttpClientOptions === void 0 ? void 0 : ipfsHttpClientOptions.url) === null || _a === void 0 ? void 0 : _a.protocol) === "https:") ||
                (ipfsHttpClientOptions.url instanceof multiaddr_1.Multiaddr && ipfsHttpClientOptions.url.protoNames().includes("https"));
        var Agent = isHttpsAgent ? https_1.Agent : http_1.Agent;
        var ipfsClient = (0, ipfs_http_client_1.create)(typeof ipfsHttpClientOptions === "string"
            ? { url: ipfsHttpClientOptions, agent: new Agent({ keepAlive: true, maxSockets: Infinity }) }
            : __assign(__assign({}, ipfsHttpClientOptions), { agent: ipfsHttpClientOptions.agent || new Agent({ keepAlive: true, maxSockets: Infinity }) }));
        var cat = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(void 0, void 0, void 0, function () {
                var rawData, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, it_all_1.default)(ipfsClient.cat.apply(ipfsClient, args))];
                        case 1:
                            rawData = _a.sent();
                            data = (0, concat_1.concat)(rawData);
                            return [2 /*return*/, (0, to_string_1.toString)(data)];
                    }
                });
            });
        };
        var resolveName = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(void 0, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    return [2 /*return*/, (0, it_last_1.default)((_a = ipfsClient.name).resolve.apply(_a, args))];
                });
            });
        };
        var blockRm = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(void 0, void 0, void 0, function () {
                var rmResults, _a, _b, res, e_1_1;
                var _c;
                var e_1, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            rmResults = [];
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 6, 7, 12]);
                            _a = __asyncValues((_c = ipfsClient.block).rm.apply(_c, args));
                            _e.label = 2;
                        case 2: return [4 /*yield*/, _a.next()];
                        case 3:
                            if (!(_b = _e.sent(), !_b.done)) return [3 /*break*/, 5];
                            res = _b.value;
                            rmResults.push(res);
                            _e.label = 4;
                        case 4: return [3 /*break*/, 2];
                        case 5: return [3 /*break*/, 12];
                        case 6:
                            e_1_1 = _e.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 12];
                        case 7:
                            _e.trys.push([7, , 10, 11]);
                            if (!(_b && !_b.done && (_d = _a.return))) return [3 /*break*/, 9];
                            return [4 /*yield*/, _d.call(_a)];
                        case 8:
                            _e.sent();
                            _e.label = 9;
                        case 9: return [3 /*break*/, 11];
                        case 10:
                            if (e_1) throw e_1.error;
                            return [7 /*endfinally*/];
                        case 11: return [7 /*endfinally*/];
                        case 12: return [2 /*return*/, rmResults];
                    }
                });
            });
        };
        return {
            add: ipfsClient.add,
            cat: cat,
            pubsub: {
                subscribe: ipfsClient.pubsub.subscribe,
                unsubscribe: ipfsClient.pubsub.unsubscribe,
                publish: ipfsClient.pubsub.publish
            },
            name: {
                publish: ipfsClient.name.publish,
                resolve: resolveName
            },
            config: {
                get: ipfsClient.config.get
            },
            key: {
                list: ipfsClient.key.list,
                rm: ipfsClient.key.rm
            },
            pin: { rm: ipfsClient.pin.rm },
            block: { rm: blockRm }
        };
    },
    importSignerIntoIpfsNode: function (ipnsKeyName, ipfsKey, plebbit) { return __awaiter(void 0, void 0, void 0, function () {
        var data, ipfsKeyFile, nodeUrl, url, res, resJson;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    data = new form_data_1.default();
                    if (typeof ipnsKeyName !== "string")
                        throw Error("ipnsKeyName needs to be defined before importing key into IPFS node");
                    if (!ipfsKey || ((_a = ipfsKey.constructor) === null || _a === void 0 ? void 0 : _a.name) !== "Uint8Array" || ipfsKey.byteLength <= 0)
                        throw Error("ipfsKey needs to be defined before importing key into IPFS node");
                    ipfsKeyFile = Buffer.from(ipfsKey);
                    data.append("file", ipfsKeyFile);
                    nodeUrl = typeof plebbit.ipfsHttpClientOptions === "string" ? plebbit.ipfsHttpClientOptions : plebbit.ipfsHttpClientOptions.url;
                    if (!nodeUrl)
                        throw Error("Can't figure out ipfs node URL");
                    url = "".concat(nodeUrl, "/key/import?arg=").concat(ipnsKeyName);
                    return [4 /*yield*/, nativeFunctions.fetch(url, {
                            method: "POST",
                            body: data
                        })];
                case 1:
                    res = _b.sent();
                    if (res.status !== 200)
                        throw Error("failed ipfs import key: '".concat(url, "' '").concat(res.status, "' '").concat(res.statusText, "'"));
                    return [4 /*yield*/, res.json()];
                case 2:
                    resJson = _b.sent();
                    return [2 /*return*/, resJson];
            }
        });
    }); },
    deleteSubplebbit: function (subplebbitAddress, dataPath) { return __awaiter(void 0, void 0, void 0, function () {
        var oldPath, newPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oldPath = path_1.default.join(dataPath, "subplebbits", subplebbitAddress);
                    newPath = path_1.default.join(dataPath, "subplebbits", "deleted", subplebbitAddress);
                    return [4 /*yield*/, promises_1.default.mkdir(path_1.default.join(dataPath, "subplebbits", "deleted"), { recursive: true })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, promises_1.default.rename(oldPath, newPath)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }
};
exports.default = nativeFunctions;
