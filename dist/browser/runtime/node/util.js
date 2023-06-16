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
exports.setNativeFunctions = exports.nativeFunctions = exports.getThumbnailUrlOfLink = exports.getDefaultSubplebbitDbConfig = exports.getDefaultDataPath = exports.mkdir = void 0;
var fs_1 = require("fs");
var native_functions_1 = __importDefault(require("./native-functions"));
var path_1 = __importDefault(require("path"));
var assert_1 = __importDefault(require("assert"));
var util_1 = require("../../util");
var open_graph_scraper_1 = __importDefault(require("open-graph-scraper"));
var hpagent_1 = require("hpagent");
var plebbit_logger_1 = __importDefault(require("@plebbit/plebbit-logger"));
var plebbit_error_1 = require("../../plebbit-error");
exports.mkdir = fs_1.promises.mkdir;
var getDefaultDataPath = function () { return path_1.default.join(process.cwd(), ".plebbit"); };
exports.getDefaultDataPath = getDefaultDataPath;
var getDefaultSubplebbitDbConfig = function (subplebbit) { return __awaiter(void 0, void 0, void 0, function () {
    var filename;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!subplebbit.plebbit.noData) return [3 /*break*/, 1];
                filename = ":memory:";
                return [3 /*break*/, 3];
            case 1:
                (0, assert_1.default)(typeof subplebbit.plebbit.dataPath === "string", "plebbit.dataPath need to be defined to get default subplebbit db config");
                filename = path_1.default.join(subplebbit.plebbit.dataPath, "subplebbits", subplebbit.address);
                return [4 /*yield*/, (0, exports.mkdir)(path_1.default.dirname(filename), { recursive: true })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/, {
                    client: "sqlite3",
                    connection: { filename: filename },
                    useNullAsDefault: true,
                    acquireConnectionTimeout: 120000,
                    postProcessResponse: function (result, queryContext) {
                        return (0, util_1.parseJsonStrings)(result);
                    }
                }];
        }
    });
}); };
exports.getDefaultSubplebbitDbConfig = getDefaultSubplebbitDbConfig;
// Should be moved to subplebbit.ts
function getThumbnailUrlOfLink(url, subplebbit, proxyHttpUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var log, options, httpAgent, httpsAgent, res, e_1, plebbitError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log = (0, plebbit_logger_1.default)("plebbit-js:subplebbit:getThumbnailUrlOfLink");
                    options = { url: url, downloadLimit: 2000000 };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    if (proxyHttpUrl) {
                        httpAgent = new hpagent_1.HttpProxyAgent({ proxy: proxyHttpUrl });
                        httpsAgent = new hpagent_1.HttpsProxyAgent({ proxy: proxyHttpUrl });
                        options["agent"] = { https: httpsAgent, http: httpAgent };
                    }
                    return [4 /*yield*/, (0, open_graph_scraper_1.default)(options)];
                case 2:
                    res = _a.sent();
                    if (res.error)
                        return [2 /*return*/, undefined];
                    if (typeof res.result.ogImage === "string")
                        return [2 /*return*/, res.result.ogImage];
                    else if (res.result.ogImage["url"])
                        return [2 /*return*/, res.result.ogImage["url"]];
                    else
                        return [2 /*return*/, undefined];
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    plebbitError = new plebbit_error_1.PlebbitError("ERR_FAILED_TO_FETCH_THUMBNAIL_URL_OF_LINK", {
                        url: url,
                        downloadLimit: options.downloadLimit,
                        proxyHttpUrl: proxyHttpUrl
                    });
                    log.error(String(plebbitError));
                    subplebbit.emit("error", plebbitError);
                    return [2 /*return*/, undefined];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getThumbnailUrlOfLink = getThumbnailUrlOfLink;
exports.nativeFunctions = native_functions_1.default;
var setNativeFunctions = function (newNativeFunctions) {
    if (!newNativeFunctions)
        throw Error("User passed an undefined object to setNativeFunctions");
    for (var i in newNativeFunctions)
        exports.nativeFunctions[i] = newNativeFunctions[i];
};
exports.setNativeFunctions = setNativeFunctions;
exports.default = {
    getDefaultDataPath: exports.getDefaultDataPath,
    nativeFunctions: exports.nativeFunctions,
    setNativeFunctions: exports.setNativeFunctions,
    mkdir: exports.mkdir
};
//# sourceMappingURL=util.js.map