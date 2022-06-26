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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebugLevels = exports.ipfsImportKey = exports.removeKeysWithUndefinedValues = exports.oldScore = exports.newScore = exports.topScore = exports.controversialScore = exports.hotScore = exports.waitTillCommentsUpdate = exports.waitTillPublicationsArePublished = exports.shallowEqual = exports.replaceXWithY = exports.removeKeys = exports.keepKeys = exports.timestamp = exports.parseJsonIfString = exports.round = exports.chunks = exports.sleep = exports.loadIpnsAsJson = exports.loadIpfsFileAsJson = exports.TIMEFRAMES_TO_SECONDS = void 0;
const concat_1 = require("uint8arrays/concat");
const to_string_1 = require("uint8arrays/to-string");
const it_all_1 = __importDefault(require("it-all"));
const it_last_1 = __importDefault(require("it-last"));
const debug_1 = __importDefault(require("debug"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const form_data_1 = __importDefault(require("form-data"));
const assert_1 = __importDefault(require("assert"));
//This is temp. TODO replace this with accurate mapping
exports.TIMEFRAMES_TO_SECONDS = Object.freeze({
    HOUR: 60 * 60,
    DAY: 60 * 60 * 24,
    WEEK: 60 * 60 * 24 * 7,
    MONTH: 60 * 60 * 24 * 7 * 4,
    YEAR: 60 * 60 * 24 * 7 * 4 * 12,
    ALL: Infinity
});
const debugs = getDebugLevels("util");
function loadIpfsFileAsJson(cid, plebbit, defaultOptions = { timeout: 60000 }) {
    return __awaiter(this, void 0, void 0, function* () {
        assert_1.default.ok(cid, "Cid has to not be null to load");
        if (!plebbit.ipfsClient) {
            const url = `${plebbit.ipfsGatewayUrl}/ipfs/${cid}`;
            const res = yield (0, node_fetch_1.default)(url, {});
            if (res.status === 200)
                return yield res.json();
            else
                throw `Failed to load IPFS via url (${url}). Status code ${res.status} and status text ${res.statusText}`;
        }
        else {
            const rawData = yield (0, it_all_1.default)(plebbit.ipfsClient.cat(cid, defaultOptions));
            const data = (0, concat_1.concat)(rawData);
            if (!data)
                throw new Error(`IPFS file (${cid}) is empty or does not exist`);
            else
                return JSON.parse((0, to_string_1.toString)(data));
        }
    });
}
exports.loadIpfsFileAsJson = loadIpfsFileAsJson;
function loadIpnsAsJson(ipns, plebbit) {
    return __awaiter(this, void 0, void 0, function* () {
        assert_1.default.ok(ipns, "ipns has to be not null to load");
        if (!plebbit.ipfsClient) {
            const url = `${plebbit.ipfsGatewayUrl}/ipns/${ipns}`;
            const res = yield (0, node_fetch_1.default)(url, {});
            if (res.status === 200)
                return yield res.json();
            else
                throw `Failed to load IPNS via url (${url}). Status code ${res.status} and status text ${res.statusText}`;
        }
        else {
            const cid = yield (0, it_last_1.default)(plebbit.ipfsClient.name.resolve(ipns));
            if (!cid)
                throw new Error(`IPNS (${ipns}) resolves to undefined`);
            (0, assert_1.default)(typeof cid === "string", "CID has to be a string");
            debugs.TRACE(`IPNS (${ipns}) resolved to ${cid}`);
            return loadIpfsFileAsJson(cid, plebbit);
        }
    });
}
exports.loadIpnsAsJson = loadIpnsAsJson;
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
exports.sleep = sleep;
function chunks(arr, len) {
    let chunks = [], i = 0;
    while (i < arr.length)
        chunks.push(arr.slice(i, (i += len)));
    return chunks;
}
exports.chunks = chunks;
function round(number, decimalPlaces) {
    const factorOfTen = Math.pow(10, decimalPlaces);
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
    const newObj = {};
    keys.forEach((key) => (newObj[key] = undefined));
    for (const key of Object.keys(obj))
        if (keys.includes(key))
            newObj[key] = obj[key];
    return newObj;
}
exports.keepKeys = keepKeys;
function removeKeys(object1, keys) {
    const newObject = Object.assign({}, object1);
    keys.forEach((key) => delete newObject[key]);
    return newObject;
}
exports.removeKeys = removeKeys;
function replaceXWithY(obj, x, y) {
    // obj is a JS object
    const newObj = {};
    Object.entries(obj).forEach(([key, value]) => {
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
function shallowEqual(object1, object2, excludeKeys = []) {
    object1 = removeKeys(object1 || {}, excludeKeys);
    object1 = removeKeysWithUndefinedValues(object1); // To get rid of keys with undefined value
    object2 = removeKeys(object2 || {}, excludeKeys);
    object2 = removeKeysWithUndefinedValues(object2); // To get rid of keys with undefined value
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length)
        return false;
    for (const key of keys1)
        if (JSON.stringify(object1[key]) !== JSON.stringify(object2[key]))
            return false;
    return true;
}
exports.shallowEqual = shallowEqual;
function waitTillPublicationsArePublished(publications) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = publications.map((publication) => {
            return new Promise((publicationResolve, publicationReject) => __awaiter(this, void 0, void 0, function* () {
                publication.once("challengeverification", (challengeVerificationMessage, newComment) => {
                    publicationResolve(challengeVerificationMessage);
                });
            }));
        });
        return yield Promise.all(promises);
    });
}
exports.waitTillPublicationsArePublished = waitTillPublicationsArePublished;
// Takes a list of Comments, run .update on them and make sure at least one update has been polled
function waitTillCommentsUpdate(comments, updateInterval) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const promises = comments.map((comment) => {
                return new Promise((commentResolve, commentReject) => __awaiter(this, void 0, void 0, function* () {
                    comment.once("update", (newComment) => {
                        comment.stop();
                        commentResolve(newComment);
                    });
                    yield comment.update(updateInterval);
                }));
            });
            Promise.all(promises).then(resolve).catch(reject);
        }));
    });
}
exports.waitTillCommentsUpdate = waitTillCommentsUpdate;
function hotScore(comment) {
    const score = comment.upvoteCount - comment.downvoteCount;
    const order = Math.log10(Math.max(score, 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = comment.timestamp - 1134028003;
    return round(sign * order + seconds / 45000, 7);
}
exports.hotScore = hotScore;
function controversialScore(comment) {
    if (comment.downvoteCount <= 0 || comment.upvoteCount <= 0)
        return 0;
    const magnitude = comment.upvoteCount + comment.downvoteCount;
    const balance = comment.upvoteCount > comment.downvoteCount
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
function ipfsImportKey(signer, plebbit, password = "") {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const data = new form_data_1.default();
        data.append("file", Buffer.from(signer.ipfsKey));
        const nodeUrl = typeof plebbit.ipfsHttpClientOptions === "string" ? plebbit.ipfsHttpClientOptions : plebbit.ipfsHttpClientOptions.url;
        if (!nodeUrl)
            throw new Error("Can't figure out ipfs node URL");
        const url = `${nodeUrl}/key/import?arg=${signer.ipnsKeyName}`;
        const res = yield (0, node_fetch_1.default)(url, {
            method: "POST",
            body: data,
            headers: (_a = plebbit.ipfsHttpClientOptions) === null || _a === void 0 ? void 0 : _a.headers
        });
        if (res.status !== 200)
            throw new Error(`failed ipfs import key: '${url}' '${res.status}' '${res.statusText}'`);
        return yield res.json();
    });
}
exports.ipfsImportKey = ipfsImportKey;
function getDebugLevels(baseName) {
    const debugsObj = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"].map((debugLevel) => ({
        [debugLevel]: (0, debug_1.default)(`plebbit-js:${baseName}:${debugLevel}`)
    }));
    return Object.assign({}, ...debugsObj);
}
exports.getDebugLevels = getDebugLevels;
