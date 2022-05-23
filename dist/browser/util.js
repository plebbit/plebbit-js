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
exports.ipfsImportKey = exports.removeKeysWithUndefinedValues = exports.oldScore = exports.newScore = exports.topScore = exports.controversialScore = exports.hotScore = exports.waitTillCommentsUpdate = exports.waitTillPublicationsArePublished = exports.shallowEqual = exports.replaceXWithY = exports.removeKeys = exports.keepKeys = exports.timestamp = exports.parseJsonIfString = exports.round = exports.chunks = exports.sleep = exports.loadIpnsAsJson = exports.loadIpfsFileAsJson = exports.TIMEFRAMES_TO_SECONDS = void 0;
var concat_1 = require("uint8arrays/concat");
var to_string_1 = require("uint8arrays/to-string");
var it_all_1 = __importDefault(require("it-all"));
var it_last_1 = __importDefault(require("it-last"));
var debug_1 = __importDefault(require("debug"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var form_data_1 = __importDefault(require("form-data"));
var assert_1 = __importDefault(require("assert"));
//This is temp. TODO replace this with accurate mapping
exports.TIMEFRAMES_TO_SECONDS = Object.freeze({
    HOUR: 60 * 60,
    DAY: 60 * 60 * 24,
    WEEK: 60 * 60 * 24 * 7,
    MONTH: 60 * 60 * 24 * 7 * 4,
    YEAR: 60 * 60 * 24 * 7 * 4 * 12,
    ALL: Infinity
});
var debug = (0, debug_1.default)("plebbit-js:util");
function loadIpfsFileAsJson(cid, plebbit, defaultOptions) {
    if (defaultOptions === void 0) { defaultOptions = { timeout: 60000 }; }
    return __awaiter(this, void 0, void 0, function () {
        var url, res, rawData, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    assert_1.default.ok(cid, "Cid has to not be null to load");
                    if (!plebbit.ipfsGatewayUrl) return [3 /*break*/, 5];
                    url = "".concat(plebbit.ipfsGatewayUrl, "/ipfs/").concat(cid);
                    return [4 /*yield*/, (0, node_fetch_1.default)(url)];
                case 1:
                    res = _a.sent();
                    if (!(res.status === 200)) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.json()];
                case 2:
                    return [2 /*return*/, _a.sent()];
                case 3:
                    throw "Failed to load IPFS via url (".concat(url, "). Status code ").concat(res.status, " and status text ").concat(res.statusText);
                case 4:
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, (0, it_all_1.default)(plebbit.ipfsClient.cat(cid, defaultOptions))];
                case 6:
                    rawData = _a.sent();
                    data = (0, concat_1.concat)(rawData);
                    if (!data) {
                        debug("IPFS (".concat(cid, ") loads undefined object (").concat(data, ")"));
                        return [2 /*return*/, undefined];
                    }
                    else
                        return [2 /*return*/, JSON.parse((0, to_string_1.toString)(data))];
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.loadIpfsFileAsJson = loadIpfsFileAsJson;
function loadIpnsAsJson(ipns, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var url, res, cid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!plebbit.ipfsGatewayUrl) return [3 /*break*/, 5];
                    url = "".concat(plebbit.ipfsGatewayUrl, "/ipns/").concat(ipns);
                    return [4 /*yield*/, (0, node_fetch_1.default)(url)];
                case 1:
                    res = _a.sent();
                    if (!(res.status === 200)) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.json()];
                case 2:
                    return [2 /*return*/, _a.sent()];
                case 3:
                    throw "Failed to load IPNS via url (".concat(url, "). Status code ").concat(res.status, " and status text ").concat(res.statusText);
                case 4:
                    return [3 /*break*/, 8];
                case 5:
                    return [4 /*yield*/, (0, it_last_1.default)(plebbit.ipfsClient.name.resolve(ipns))];
                case 6:
                    cid = _a.sent();
                    if (!cid)
                        return [2 /*return*/, undefined];
                    return [4 /*yield*/, loadIpfsFileAsJson(cid, plebbit)];
                case 7:
                    return [2 /*return*/, _a.sent()];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.loadIpnsAsJson = loadIpnsAsJson;
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
exports.sleep = sleep;
function chunks(arr, len) {
    var chunks = [], i = 0;
    while (i < arr.length)
        chunks.push(arr.slice(i, (i += len)));
    return chunks;
}
exports.chunks = chunks;
function round(number, decimalPlaces) {
    var factorOfTen = Math.pow(10, decimalPlaces);
    return Math.round(number * factorOfTen) / factorOfTen;
}
exports.round = round;
function parseJsonIfString(x) {
    // @ts-ignore
    return x instanceof String || typeof x === "string" ? JSON.parse(x) : x;
}
exports.parseJsonIfString = parseJsonIfString;
function timestamp() {
    return Math.round(Date.now() / 1000);
}
exports.timestamp = timestamp;
function keepKeys(obj, keys) {
    var newObj = {};
    keys.forEach(function (key) { return (newObj[key] = undefined); });
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var key = _a[_i];
        if (keys.includes(key))
            newObj[key] = obj[key];
    }
    return newObj;
}
exports.keepKeys = keepKeys;
function removeKeys(object1, keys) {
    var newObject = __assign({}, object1);
    keys.forEach(function (key) { return delete newObject[key]; });
    return newObject;
}
exports.removeKeys = removeKeys;
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
function shallowEqual(object1, object2, excludeKeys) {
    if (excludeKeys === void 0) { excludeKeys = []; }
    object1 = removeKeys(object1 || {}, excludeKeys);
    object1 = removeKeysWithUndefinedValues(object1); // To get rid of keys with undefined value
    object2 = removeKeys(object2 || {}, excludeKeys);
    object2 = removeKeysWithUndefinedValues(object2); // To get rid of keys with undefined value
    var keys1 = Object.keys(object1);
    var keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length)
        return false;
    for (var _i = 0, keys1_1 = keys1; _i < keys1_1.length; _i++) {
        var key = keys1_1[_i];
        if (JSON.stringify(object1[key]) !== JSON.stringify(object2[key]))
            return false;
    }
    return true;
}
exports.shallowEqual = shallowEqual;
function waitTillPublicationsArePublished(publications) {
    return __awaiter(this, void 0, void 0, function () {
        var promises;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    promises = publications.map(function (publication) {
                        return new Promise(function (publicationResolve, publicationReject) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                publication.once("challengeverification", function (challengeVerificationMessage, newComment) {
                                    publicationResolve(challengeVerificationMessage);
                                });
                                return [2 /*return*/];
                            });
                        }); });
                    });
                    return [4 /*yield*/, Promise.all(promises)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.waitTillPublicationsArePublished = waitTillPublicationsArePublished;
// Takes a list of Comments, run .update on them and make sure at least one update has been polled
function waitTillCommentsUpdate(comments, updateInterval) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var promises;
                    var _this = this;
                    return __generator(this, function (_a) {
                        promises = comments.map(function (comment) {
                            return new Promise(function (commentResolve, commentReject) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            comment.once("update", function (newComment) {
                                                comment.stop();
                                                commentResolve(newComment);
                                            });
                                            return [4 /*yield*/, comment.update(updateInterval)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        });
                        Promise.all(promises).then(resolve).catch(reject);
                        return [2 /*return*/];
                    });
                }); })];
        });
    });
}
exports.waitTillCommentsUpdate = waitTillCommentsUpdate;
function hotScore(comment) {
    var score = comment.upvoteCount - comment.downvoteCount;
    var order = Math.log10(Math.max(score, 1));
    var sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    var seconds = comment.timestamp - 1134028003;
    return round(sign * order + seconds / 45000, 7);
}
exports.hotScore = hotScore;
function controversialScore(comment) {
    if (comment.downvoteCount <= 0 || comment.upvoteCount <= 0)
        return 0;
    var magnitude = comment.upvoteCount + comment.downvoteCount;
    var balance = comment.upvoteCount > comment.downvoteCount
        ? parseFloat(comment.downvoteCount) / comment.upvoteCount
        : parseFloat(comment.upvoteCount) / comment.downvoteCount;
    return Math.pow(magnitude, balance);
}
exports.controversialScore = controversialScore;
function topScore(comment) {
    return comment.upvoteCount - comment.downvoteCount;
}
exports.topScore = topScore;
function newScore(comment) {
    return comment.timestamp;
}
exports.newScore = newScore;
function oldScore(comment) {
    return -comment.timestamp;
}
exports.oldScore = oldScore;
function removeKeysWithUndefinedValues(object) {
    return JSON.parse(JSON.stringify(object));
}
exports.removeKeysWithUndefinedValues = removeKeysWithUndefinedValues;
// This is a temporary method until https://github.com/ipfs/js-ipfs/issues/3547 is fixed
function ipfsImportKey(signer, plebbit, password) {
    var _a;
    if (password === void 0) { password = ""; }
    return __awaiter(this, void 0, void 0, function () {
        var data, nodeUrl, url, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    data = new form_data_1.default();
                    data.append("file", signer.ipfsKey);
                    nodeUrl = typeof plebbit.ipfsHttpClientOptions === "string"
                        ? plebbit.ipfsHttpClientOptions
                        : plebbit.ipfsHttpClientOptions.url;
                    if (!nodeUrl)
                        throw "Can't figure out ipfs node URL";
                    url = "".concat(nodeUrl, "/key/import?arg=").concat(signer.ipnsKeyName);
                    return [4 /*yield*/, (0, node_fetch_1.default)(url, {
                            method: "POST",
                            body: data,
                            headers: (_a = plebbit.ipfsHttpClientOptions) === null || _a === void 0 ? void 0 : _a.headers
                        })];
                case 1:
                    res = _b.sent();
                    if (res.status !== 200)
                        throw Error("failed ipfs import key: '".concat(url, "' '").concat(res.status, "' '").concat(res.statusText, "'"));
                    return [4 /*yield*/, res.json()];
                case 2: return [2 /*return*/, _b.sent()];
            }
        });
    });
}
exports.ipfsImportKey = ipfsImportKey;
