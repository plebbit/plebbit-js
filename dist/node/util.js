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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwWithErrorCode = exports.encode = exports.randomElement = exports.removeKeysWithUndefinedValues = exports.oldScore = exports.newScore = exports.topScore = exports.controversialScore = exports.hotScore = exports.replaceXWithY = exports.timestamp = exports.loadIpnsAsJson = exports.loadIpfsFileAsJson = exports.fetchCid = exports.TIMEFRAMES_TO_SECONDS = void 0;
var util_1 = require("./runtime/node/util");
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var errors_1 = require("./errors");
var err_code_1 = __importDefault(require("err-code"));
var ipfs_only_hash_1 = __importDefault(require("ipfs-only-hash"));
var lodash_1 = __importDefault(require("lodash"));
var safe_stable_stringify_1 = require("safe-stable-stringify");
//This is temp. TODO replace this with accurate mapping
exports.TIMEFRAMES_TO_SECONDS = Object.freeze({
    HOUR: 60 * 60,
    DAY: 60 * 60 * 24,
    WEEK: 60 * 60 * 24 * 7,
    MONTH: 60 * 60 * 24 * 7 * 4,
    YEAR: 60 * 60 * 24 * 7 * 4 * 12,
    ALL: Infinity
});
var DOWNLOAD_LIMIT_BYTES = 1000000; // 1mb
function fetchWithLimit(url, options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var res, e_1, totalBytesRead, reader, decoder, resText, _c, done, value;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, util_1.nativeFunctions.fetch(url, __assign(__assign({}, options), { size: DOWNLOAD_LIMIT_BYTES }))];
                case 1:
                    res = _d.sent();
                    if (!(((_a = res === null || res === void 0 ? void 0 : res.body) === null || _a === void 0 ? void 0 : _a.getReader) === undefined)) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.text()];
                case 2: return [2 /*return*/, [_d.sent(), res]];
                case 3: return [3 /*break*/, 5];
                case 4:
                    e_1 = _d.sent();
                    if (e_1.message.includes("over limit"))
                        throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", "fetch: url (".concat(url, ") points to a file larger than download limit (").concat(DOWNLOAD_LIMIT_BYTES, ") bytes"));
                    // If error is not related to size limit, then throw it again
                    throw e_1;
                case 5:
                    if (!(((_b = res === null || res === void 0 ? void 0 : res.body) === null || _b === void 0 ? void 0 : _b.getReader) !== undefined)) return [3 /*break*/, 9];
                    totalBytesRead = 0;
                    reader = res.body.getReader();
                    decoder = new TextDecoder("utf-8");
                    resText = "";
                    _d.label = 6;
                case 6:
                    if (!true) return [3 /*break*/, 8];
                    return [4 /*yield*/, reader.read()];
                case 7:
                    _c = _d.sent(), done = _c.done, value = _c.value;
                    //@ts-ignore
                    if (value)
                        resText += decoder.decode(value);
                    if (done || !value)
                        return [3 /*break*/, 8];
                    if (value.length + totalBytesRead > DOWNLOAD_LIMIT_BYTES)
                        throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", "fetch: url (".concat(url, ") points to a file larger than download limit (").concat(DOWNLOAD_LIMIT_BYTES, ") bytes"));
                    totalBytesRead += value.length;
                    return [3 /*break*/, 6];
                case 8: return [2 /*return*/, [resText, res]];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function fetchCid(cid, plebbit, catOptions) {
    if (catOptions === void 0) { catOptions = { length: DOWNLOAD_LIMIT_BYTES }; }
    return __awaiter(this, void 0, void 0, function () {
        var fileContent, url, _a, resText, res, error, e_2, generatedCid;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!is_ipfs_1.default.cid(cid) && is_ipfs_1.default.path(cid))
                        cid = cid.split("/")[2];
                    if (!is_ipfs_1.default.cid(cid))
                        throwWithErrorCode("ERR_CID_IS_INVALID", "fetchCid: (".concat(cid, ") is invalid as a CID"));
                    if (!!plebbit.ipfsClient) return [3 /*break*/, 2];
                    url = "".concat(plebbit.ipfsGatewayUrl, "/ipfs/").concat(cid);
                    return [4 /*yield*/, fetchWithLimit(url, { cache: "force-cache" })];
                case 1:
                    _a = _b.sent(), resText = _a[0], res = _a[1];
                    if (res.status === 200)
                        fileContent = resText;
                    else
                        throw Error("Failed to load IPFS via url (".concat(url, "). Status code ").concat(res.status, " and status text ").concat(res.statusText));
                    return [3 /*break*/, 7];
                case 2:
                    error = void 0;
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, plebbit.ipfsClient.cat(cid, catOptions)];
                case 4:
                    fileContent = _b.sent(); // Limit is 1mb files
                    return [3 /*break*/, 6];
                case 5:
                    e_2 = _b.sent();
                    error = e_2;
                    return [3 /*break*/, 6];
                case 6:
                    if (typeof fileContent !== "string")
                        throw Error("Was not able to load file with CID (".concat(cid, ") due to error: ").concat(error));
                    _b.label = 7;
                case 7: return [4 /*yield*/, ipfs_only_hash_1.default.of(fileContent)];
                case 8:
                    generatedCid = _b.sent();
                    if (fileContent.length === DOWNLOAD_LIMIT_BYTES && generatedCid !== cid)
                        throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", "fetchCid: CID (".concat(cid, ") points to a file larger than download limit ").concat(DOWNLOAD_LIMIT_BYTES));
                    if (generatedCid !== cid)
                        throwWithErrorCode("ERR_GENERATED_CID_DOES_NOT_MATCH", "fetchCid: Loaded file generates a different CID (".concat(generatedCid, ") than provided CID (").concat(cid, ")"));
                    return [2 /*return*/, fileContent];
            }
        });
    });
}
exports.fetchCid = fetchCid;
function loadIpfsFileAsJson(cid, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, fetchCid(cid, plebbit)];
                case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
            }
        });
    });
}
exports.loadIpfsFileAsJson = loadIpfsFileAsJson;
function loadIpnsAsJson(ipns, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var url, _a, resText, res, cid, error, e_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (typeof ipns !== "string")
                        throwWithErrorCode("ERR_IPNS_IS_INVALID", "loadIpnsAsJson: ipns (".concat(ipns, ") is undefined"));
                    if (!!plebbit.ipfsClient) return [3 /*break*/, 2];
                    url = "".concat(plebbit.ipfsGatewayUrl, "/ipns/").concat(ipns);
                    return [4 /*yield*/, fetchWithLimit(url, { cache: "no-store", size: DOWNLOAD_LIMIT_BYTES })];
                case 1:
                    _a = _b.sent(), resText = _a[0], res = _a[1];
                    if (res.status === 200)
                        return [2 /*return*/, JSON.parse(resText)];
                    else
                        throw Error("Failed to load IPNS via url (".concat(url, "). Status code ").concat(res.status, " and status text ").concat(res.statusText));
                    return [3 /*break*/, 7];
                case 2:
                    cid = void 0, error = void 0;
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, plebbit.ipfsClient.name.resolve(ipns)];
                case 4:
                    cid = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_3 = _b.sent();
                    error = e_3;
                    return [3 /*break*/, 6];
                case 6:
                    if (typeof cid !== "string")
                        throw Error("ipns (".concat(ipns, ") record ").concat(error ? " fails to resolve due to error ".concat(error, " ") : " does not exist"));
                    return [2 /*return*/, loadIpfsFileAsJson(cid, plebbit)];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.loadIpnsAsJson = loadIpnsAsJson;
function timestamp() {
    return Math.round(Date.now() / 1000);
}
exports.timestamp = timestamp;
function replaceXWithY(obj, x, y) {
    // obj is a JS object
    var newObj = {};
    Object.entries(obj).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (obj[key] === x)
            newObj[key] = y;
        // `typeof`` gives browser transpiling error "Uncaught ReferenceError: exports is not defined"
        // don't know why but it can be fixed by replacing with `instanceof`
        // else if (typeof value === "object" && value !== null) newObj[key] = replaceXWithY(value, x, y);
        else if (value instanceof Object && value !== null)
            newObj[key] = replaceXWithY(value, x, y);
        else
            newObj[key] = value;
    });
    return newObj;
}
exports.replaceXWithY = replaceXWithY;
function hotScore(comment) {
    if (typeof comment.downvoteCount !== "number" || typeof comment.upvoteCount !== "number")
        throw Error("Comment.downvoteCount (".concat(comment.downvoteCount, ") and comment.upvoteCount (").concat(comment.upvoteCount, ") need to be defined before calculating hotScore"));
    var score = comment.upvoteCount - comment.downvoteCount;
    var order = Math.log10(Math.max(score, 1));
    var sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    var seconds = comment.timestamp - 1134028003;
    return lodash_1.default.round(sign * order + seconds / 45000, 7);
}
exports.hotScore = hotScore;
function controversialScore(comment) {
    if (typeof comment.downvoteCount !== "number" || typeof comment.upvoteCount !== "number")
        throw Error("Comment.downvoteCount (".concat(comment.downvoteCount, ") and comment.upvoteCount (").concat(comment.upvoteCount, ") need to be defined before calculating controversialScore"));
    if (comment.downvoteCount <= 0 || comment.upvoteCount <= 0)
        return 0;
    var magnitude = comment.upvoteCount + comment.downvoteCount;
    var balance = comment.upvoteCount > comment.downvoteCount
        ? comment.downvoteCount / comment.upvoteCount
        : comment.upvoteCount / comment.downvoteCount;
    return Math.pow(magnitude, balance);
}
exports.controversialScore = controversialScore;
function topScore(comment) {
    if (typeof comment.downvoteCount !== "number" || typeof comment.upvoteCount !== "number")
        throw Error("Comment.downvoteCount (".concat(comment.downvoteCount, ") and comment.upvoteCount (").concat(comment.upvoteCount, ") need to be defined before calculating topScore"));
    return comment.upvoteCount - comment.downvoteCount;
}
exports.topScore = topScore;
function newScore(comment) {
    if (typeof comment.timestamp !== "number")
        throw Error("Comment.timestamp (".concat(comment.timestamp, ") needs to defined to calculate newScore"));
    return comment.timestamp;
}
exports.newScore = newScore;
function oldScore(comment) {
    if (typeof comment.timestamp !== "number")
        throw Error("Comment.timestamp (".concat(comment.timestamp, ") needs to defined to calculate oldScore"));
    return -comment.timestamp;
}
exports.oldScore = oldScore;
function removeKeysWithUndefinedValues(object) {
    var _a, _b;
    var newObj = JSON.parse(JSON.stringify(object));
    for (var prop in newObj)
        if (((_b = (_a = newObj[prop]) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.name) === "Object" && JSON.stringify(newObj[prop]) === "{}")
            delete newObj[prop];
    return newObj;
}
exports.removeKeysWithUndefinedValues = removeKeysWithUndefinedValues;
function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
exports.randomElement = randomElement;
function encode(obj) {
    // May change in future
    // We're encoding in cborg and decoding to make sure all JSON objects can be stringified and parsed determinstically
    // Meaning the order of the fields will always be the same
    return (0, safe_stable_stringify_1.stringify)(obj);
}
exports.encode = encode;
function throwWithErrorCode(code, details) {
    throw (0, err_code_1.default)(Error(errors_1.messages[code]), errors_1.messages[errors_1.messages[code]], {
        details: details
    });
}
exports.throwWithErrorCode = throwWithErrorCode;
