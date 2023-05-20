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
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.shortifyCid = exports.shortifyAddress = exports.parseRawPages = exports.parsePagesIpfs = exports.parsePageIpfs = exports.parseJsonStrings = exports.throwWithErrorCode = exports.removeKeysWithUndefinedValues = exports.removeNullAndUndefinedValuesRecursively = exports.removeNullAndUndefinedValues = exports.oldScore = exports.newScore = exports.topScore = exports.controversialScore = exports.hotScore = exports.replaceXWithY = exports.timestamp = exports.TIMEFRAMES_TO_SECONDS = void 0;
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
    (0, assert_1.default)(typeof comment.update.downvoteCount === "number" &&
        typeof comment.update.upvoteCount === "number" &&
        typeof comment.comment.timestamp === "number");
    var score = comment.update.upvoteCount - comment.update.downvoteCount;
    var order = Math.log10(Math.max(score, 1));
    var sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    var seconds = comment.comment.timestamp - 1134028003;
    return lodash_1.default.round(sign * order + seconds / 45000, 7);
}
exports.hotScore = hotScore;
function controversialScore(comment) {
    (0, assert_1.default)(typeof comment.update.downvoteCount === "number" && typeof comment.update.upvoteCount === "number");
    if (comment.update.downvoteCount <= 0 || comment.update.upvoteCount <= 0)
        return 0;
    var magnitude = comment.update.upvoteCount + comment.update.downvoteCount;
    var balance = comment.update.upvoteCount > comment.update.downvoteCount
        ? comment.update.downvoteCount / comment.update.upvoteCount
        : comment.update.upvoteCount / comment.update.downvoteCount;
    return Math.pow(magnitude, balance);
}
exports.controversialScore = controversialScore;
function topScore(comment) {
    (0, assert_1.default)(typeof comment.update.downvoteCount === "number" && typeof comment.update.upvoteCount === "number");
    return comment.update.upvoteCount - comment.update.downvoteCount;
}
exports.topScore = topScore;
function newScore(comment) {
    (0, assert_1.default)(typeof comment.comment.timestamp === "number");
    return comment.comment.timestamp;
}
exports.newScore = newScore;
function oldScore(comment) {
    (0, assert_1.default)(typeof comment.comment.timestamp === "number");
    return -comment.comment.timestamp;
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
function parsePageIpfs(pageIpfs, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var finalComments;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(pageIpfs.comments.map(function (commentObj) { return plebbit.createComment(commentObj.comment); }))];
                case 1:
                    finalComments = _a.sent();
                    return [4 /*yield*/, Promise.all(finalComments.map(function (comment, i) { return comment._initCommentUpdate(pageIpfs.comments[i].update); }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { comments: finalComments, nextCid: pageIpfs.nextCid }];
            }
        });
    });
}
exports.parsePageIpfs = parsePageIpfs;
function parsePagesIpfs(pagesRaw, plebbit) {
    return __awaiter(this, void 0, void 0, function () {
        var parsedPages, pagesType;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(Object.keys(pagesRaw.pages).map(function (key) { return parsePageIpfs(pagesRaw.pages[key], plebbit); }))];
                case 1:
                    parsedPages = _a.sent();
                    pagesType = Object.fromEntries(Object.keys(pagesRaw.pages).map(function (key, i) { return [key, parsedPages[i]]; }));
                    return [2 /*return*/, { pages: pagesType, pageCids: pagesRaw.pageCids }];
            }
        });
    });
}
exports.parsePagesIpfs = parsePagesIpfs;
// To use for both subplebbit.posts and comment.replies
function parseRawPages(replies, plebbit) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var isIpfs, parsedPages, repliesClone, pageKeys, _i, pageKeys_1, key, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!replies)
                        return [2 /*return*/, {
                                pages: undefined,
                                pagesIpfs: undefined
                            }];
                    if (replies instanceof pages_1.BasePages)
                        return [2 /*return*/, replies];
                    if (!replies.pages)
                        return [2 /*return*/, { pages: undefined, pagesIpfs: undefined }];
                    isIpfs = Boolean((_a = Object.values(replies.pages)[0]) === null || _a === void 0 ? void 0 : _a.comments[0]["update"]);
                    if (!isIpfs) return [3 /*break*/, 2];
                    replies = replies;
                    return [4 /*yield*/, parsePagesIpfs(replies, plebbit)];
                case 1:
                    parsedPages = _c.sent();
                    return [2 /*return*/, {
                            pages: parsedPages.pages,
                            pagesIpfs: replies.pages
                        }];
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
                    return [4 /*yield*/, Promise.all(replies.pages[key].comments.map(function (comment) { return plebbit.createComment.bind(plebbit)(comment); }))];
                case 4:
                    _b.comments = _c.sent();
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, {
                        pages: repliesClone.pages,
                        pagesIpfs: undefined
                    }];
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
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
exports.delay = delay;
//# sourceMappingURL=util.js.map