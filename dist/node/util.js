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
exports.shortifyCid = exports.shortifyAddress = exports.parseRawPages = exports.parseJsonStrings = exports.parsePagesIpfs = exports.parsePageIpfs = exports.throwWithErrorCode = exports.removeKeysWithUndefinedValues = exports.removeNullAndUndefinedValuesRecursively = exports.removeNullAndUndefinedValues = exports.oldScore = exports.newScore = exports.topScore = exports.controversialScore = exports.hotScore = exports.replaceXWithY = exports.timestamp = exports.loadIpnsAsJson = exports.loadIpfsFileAsJson = exports.fetchCid = exports.TIMEFRAMES_TO_SECONDS = void 0;
var util_1 = require("./runtime/node/util");
var is_ipfs_1 = __importDefault(require("is-ipfs"));
var ipfs_only_hash_1 = __importDefault(require("ipfs-only-hash"));
var lodash_1 = __importDefault(require("lodash"));
var assert_1 = __importDefault(require("assert"));
var pages_1 = require("./pages");
var plebbit_error_1 = require("./plebbit-error");
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
                    //@ts-expect-error
                    res = _d.sent();
                    if (!(((_a = res === null || res === void 0 ? void 0 : res.body) === null || _a === void 0 ? void 0 : _a.getReader) === undefined)) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.text()];
                case 2: return [2 /*return*/, [_d.sent(), res]];
                case 3: return [3 /*break*/, 5];
                case 4:
                    e_1 = _d.sent();
                    if (e_1.message.includes("over limit"))
                        throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { url: url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                    else
                        throwWithErrorCode("ERR_FAILED_TO_FETCH_HTTP_GENERIC", { url: url, status: res === null || res === void 0 ? void 0 : res.status, statusText: res === null || res === void 0 ? void 0 : res.statusText });
                    return [3 /*break*/, 5];
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
                        throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { url: url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                    totalBytesRead += value.length;
                    return [3 /*break*/, 6];
                case 8: return [2 /*return*/, [resText, res]];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function fetchCid(cid, plebbit, catOptions) {
    var _a;
    if (catOptions === void 0) { catOptions = { length: DOWNLOAD_LIMIT_BYTES }; }
    return __awaiter(this, void 0, void 0, function () {
        var fileContent, url, _b, resText, res, error, e_2, calculatedCid;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!is_ipfs_1.default.cid(cid) && is_ipfs_1.default.path(cid))
                        cid = cid.split("/")[2];
                    if (!is_ipfs_1.default.cid(cid))
                        throwWithErrorCode("ERR_CID_IS_INVALID", "fetchCid: (".concat(cid, ") is invalid as a CID"));
                    if (!!plebbit.ipfsClient) return [3 /*break*/, 2];
                    url = "".concat(plebbit.ipfsGatewayUrl, "/ipfs/").concat(cid);
                    return [4 /*yield*/, fetchWithLimit(url, { headers: (_a = plebbit.ipfsHttpClientOptions) === null || _a === void 0 ? void 0 : _a.headers, cache: "force-cache" })];
                case 1:
                    _b = _c.sent(), resText = _b[0], res = _b[1];
                    if (res.status === 200)
                        fileContent = resText;
                    else
                        throwWithErrorCode("ERR_FAILED_TO_FETCH_HTTP_GENERIC", { url: url, status: res.status, statusText: res.statusText });
                    return [3 /*break*/, 7];
                case 2:
                    error = void 0;
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, plebbit.ipfsClient.cat(cid, catOptions)];
                case 4:
                    fileContent = _c.sent(); // Limit is 1mb files
                    return [3 /*break*/, 6];
                case 5:
                    e_2 = _c.sent();
                    error = e_2;
                    return [3 /*break*/, 6];
                case 6:
                    if (typeof fileContent !== "string")
                        throwWithErrorCode("ERR_FAILED_TO_FETCH_IPFS_GENERIC", { cid: cid, error: error, options: catOptions });
                    _c.label = 7;
                case 7: return [4 /*yield*/, ipfs_only_hash_1.default.of(fileContent)];
                case 8:
                    calculatedCid = _c.sent();
                    if (fileContent.length === DOWNLOAD_LIMIT_BYTES && calculatedCid !== cid)
                        throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid: cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
                    if (calculatedCid !== cid)
                        throwWithErrorCode("ERR_CALCULATED_CID_DOES_NOT_MATCH", { calculatedCid: calculatedCid, cid: cid });
                    plebbit.emit("fetchedcid", cid, fileContent);
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
function loadIpnsAsJson(ipns, plebbit, callbackAfterResolve) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var url, _b, resText, res, cid, error, e_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (typeof ipns !== "string")
                        throwWithErrorCode("ERR_IPNS_IS_INVALID", { ipns: ipns });
                    if (!!plebbit.ipfsClient) return [3 /*break*/, 2];
                    url = "".concat(plebbit.ipfsGatewayUrl, "/ipns/").concat(ipns);
                    return [4 /*yield*/, fetchWithLimit(url, {
                            headers: (_a = plebbit.ipfsHttpClientOptions) === null || _a === void 0 ? void 0 : _a.headers,
                            cache: "no-store",
                            size: DOWNLOAD_LIMIT_BYTES
                        })];
                case 1:
                    _b = _c.sent(), resText = _b[0], res = _b[1];
                    if (res.status === 200) {
                        plebbit.emit("fetchedipns", ipns, resText);
                        return [2 /*return*/, JSON.parse(resText)];
                    }
                    else
                        throwWithErrorCode("ERR_FAILED_TO_FETCH_HTTP_GENERIC", { url: url, status: res.status, statusText: res.statusText });
                    return [3 /*break*/, 7];
                case 2:
                    cid = void 0, error = void 0;
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, plebbit.ipfsClient.name.resolve(ipns)];
                case 4:
                    cid = _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_3 = _c.sent();
                    error = e_3;
                    return [3 /*break*/, 6];
                case 6:
                    if (typeof cid !== "string")
                        throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS", { ipns: ipns, error: error });
                    plebbit.emit("resolvedsubplebbitipns", ipns, cid);
                    if (callbackAfterResolve)
                        callbackAfterResolve(ipns, cid);
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
    (0, assert_1.default)(typeof comment.downvoteCount === "number" && typeof comment.upvoteCount === "number" && typeof comment.timestamp === "number");
    var score = comment.upvoteCount - comment.downvoteCount;
    var order = Math.log10(Math.max(score, 1));
    var sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    var seconds = comment.timestamp - 1134028003;
    return lodash_1.default.round(sign * order + seconds / 45000, 7);
}
exports.hotScore = hotScore;
function controversialScore(comment) {
    (0, assert_1.default)(typeof comment.downvoteCount === "number" && typeof comment.upvoteCount === "number");
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
    (0, assert_1.default)(typeof comment.downvoteCount === "number" && typeof comment.upvoteCount === "number");
    return comment.upvoteCount - comment.downvoteCount;
}
exports.topScore = topScore;
function newScore(comment) {
    (0, assert_1.default)(typeof comment.timestamp === "number");
    return comment.timestamp;
}
exports.newScore = newScore;
function oldScore(comment) {
    (0, assert_1.default)(typeof comment.timestamp === "number");
    return -comment.timestamp;
}
exports.oldScore = oldScore;
function removeNullAndUndefinedValues(obj) {
    return lodash_1.default.omitBy(obj, lodash_1.default.isNil);
}
exports.removeNullAndUndefinedValues = removeNullAndUndefinedValues;
function removeNullAndUndefinedValuesRecursively(obj) {
    if (Array.isArray(obj))
        return obj.map(removeNullAndUndefinedValuesRecursively);
    if (!lodash_1.default.isPlainObject(obj))
        return obj;
    var cleanedObj = removeNullAndUndefinedValues(obj);
    for (var _i = 0, _a = Object.entries(cleanedObj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (lodash_1.default.isPlainObject(value) || Array.isArray(value))
            cleanedObj[key] = removeNullAndUndefinedValuesRecursively(value);
    }
    return cleanedObj;
}
exports.removeNullAndUndefinedValuesRecursively = removeNullAndUndefinedValuesRecursively;
// TODO rename
function removeKeysWithUndefinedValues(object) {
    var _a, _b;
    var newObj = JSON.parse(JSON.stringify(object));
    for (var prop in newObj)
        if (((_b = (_a = newObj[prop]) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.name) === "Object" && JSON.stringify(newObj[prop]) === "{}")
            delete newObj[prop];
    return newObj;
}
exports.removeKeysWithUndefinedValues = removeKeysWithUndefinedValues;
function throwWithErrorCode(code, details) {
    throw new plebbit_error_1.PlebbitError(code, details);
}
exports.throwWithErrorCode = throwWithErrorCode;
function parsePageIpfs(pageIpfs, subplebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var finalComments, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(pageIpfs.comments.map(function (commentObj) { return subplebbit.plebbit.createComment(commentObj.comment); }))];
                case 1:
                    finalComments = _a.sent();
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < finalComments.length)) return [3 /*break*/, 5];
                    //@ts-expect-error
                    finalComments[i].subplebbit = subplebbit;
                    return [4 /*yield*/, finalComments[i]._initCommentUpdate(pageIpfs.comments[i].update)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, { comments: finalComments, nextCid: pageIpfs.nextCid }];
            }
        });
    });
}
exports.parsePageIpfs = parsePageIpfs;
function parsePagesIpfs(pagesRaw, subplebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var parsedPages, pagesType;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(Object.keys(pagesRaw.pages).map(function (key) { return parsePageIpfs(pagesRaw.pages[key], subplebbit); }))];
                case 1:
                    parsedPages = _a.sent();
                    pagesType = Object.fromEntries(Object.keys(pagesRaw.pages).map(function (key, i) { return [key, parsedPages[i]]; }));
                    return [2 /*return*/, { pages: pagesType, pageCids: pagesRaw.pageCids }];
            }
        });
    });
}
exports.parsePagesIpfs = parsePagesIpfs;
var isJsonString = function (jsonString) {
    if (typeof jsonString !== "string" || (!jsonString.startsWith("{") && !jsonString.startsWith("[")))
        return false;
    try {
        JSON.parse(jsonString);
        return true;
    }
    catch (_a) {
        return false;
    }
};
// Only for DB
var parseJsonStrings = function (obj) {
    var _a, _b;
    if (obj === "[object Object]")
        throw Error("Object shouldn't be [object Object]");
    if (Array.isArray(obj))
        return obj.map(function (o) { return (0, exports.parseJsonStrings)(o); });
    if (!isJsonString(obj) && !lodash_1.default.isPlainObject(obj))
        return obj;
    var newObj = removeNullAndUndefinedValues(isJsonString(obj) ? JSON.parse(obj) : lodash_1.default.cloneDeep(obj));
    //prettier-ignore
    var booleanFields = ["deleted", "spoiler", "pinned", "locked", "removed", "commentUpdate_deleted", "commentUpdate_spoiler", "commentUpdate_pinned", "commentUpdate_locked", "commentUpdate_removed"];
    for (var _i = 0, _c = Object.entries(newObj); _i < _c.length; _i++) {
        var _d = _c[_i], key = _d[0], value = _d[1];
        if (value === "[object Object]")
            throw Error("key (".concat(key, ") shouldn't be [object Object]"));
        if (booleanFields.includes(key) && typeof value === "number")
            newObj[key] = Boolean(value);
        else if (isJsonString(value))
            newObj[key] = removeNullAndUndefinedValues(JSON.parse(value));
        if (((_b = (_a = newObj[key]) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.name) === "Object")
            newObj[key] = removeNullAndUndefinedValues((0, exports.parseJsonStrings)(newObj[key]));
    }
    return newObj;
};
exports.parseJsonStrings = parseJsonStrings;
// To use for both subplebbit.posts and comment.replies
function parseRawPages(replies, parentCid, subplebbit) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var isIpfs, parsedPages, repliesClone, pageKeys, _i, pageKeys_1, key, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!replies)
                        return [2 /*return*/, new pages_1.Pages({
                                pages: undefined,
                                pageCids: undefined,
                                subplebbit: subplebbit,
                                pagesIpfs: undefined,
                                parentCid: parentCid
                            })];
                    if (replies instanceof pages_1.Pages)
                        return [2 /*return*/, replies];
                    isIpfs = Boolean((_a = Object.values(replies.pages)[0]) === null || _a === void 0 ? void 0 : _a.comments[0]["update"]);
                    if (!isIpfs) return [3 /*break*/, 2];
                    replies = replies;
                    return [4 /*yield*/, parsePagesIpfs(replies, subplebbit)];
                case 1:
                    parsedPages = _c.sent();
                    return [2 /*return*/, new pages_1.Pages({
                            pages: parsedPages.pages,
                            pageCids: parsedPages.pageCids,
                            subplebbit: subplebbit,
                            pagesIpfs: replies.pages,
                            parentCid: parentCid
                        })];
                case 2:
                    replies = replies;
                    repliesClone = lodash_1.default.cloneDeep(replies);
                    pageKeys = Object.keys(repliesClone.pages);
                    _i = 0, pageKeys_1 = pageKeys;
                    _c.label = 3;
                case 3:
                    if (!(_i < pageKeys_1.length)) return [3 /*break*/, 6];
                    key = pageKeys_1[_i];
                    _b = repliesClone.pages[key];
                    return [4 /*yield*/, Promise.all(replies.pages[key].comments.map(function (comment) {
                            return subplebbit.plebbit.createComment.bind(subplebbit.plebbit)(__assign(__assign({}, comment), { subplebbit: subplebbit }));
                        }))];
                case 4:
                    _b.comments = _c.sent();
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, new pages_1.Pages({
                        pages: repliesClone.pages,
                        pageCids: replies.pageCids,
                        subplebbit: subplebbit,
                        pagesIpfs: undefined,
                        parentCid: parentCid
                    })];
            }
        });
    });
}
exports.parseRawPages = parseRawPages;
function shortifyAddress(address) {
    if (address.includes("."))
        return address; // If a domain then no need to shortify
    // Remove prefix (12D3KooW)
    var removedPrefix = address.slice(8);
    // Return first 12 characters
    var shortAddress = removedPrefix.slice(0, 12);
    return shortAddress;
}
exports.shortifyAddress = shortifyAddress;
function shortifyCid(cid) {
    // Remove prefix (Qm)
    // Return first 12 characters
    return cid.slice(2).slice(0, 12);
}
exports.shortifyCid = shortifyCid;
