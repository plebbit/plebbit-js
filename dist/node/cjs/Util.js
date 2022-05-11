"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TIMEFRAMES_TO_SECONDS = void 0;
exports.chunks = chunks;
exports.controversialScore = controversialScore;
exports.hotScore = hotScore;
exports.ipfsImportKey = ipfsImportKey;
exports.keepKeys = keepKeys;
exports.loadIpfsFileAsJson = loadIpfsFileAsJson;
exports.loadIpnsAsJson = loadIpnsAsJson;
exports.newScore = newScore;
exports.oldScore = oldScore;
exports.parseJsonIfString = parseJsonIfString;
exports.removeKeys = removeKeys;
exports.removeKeysWithUndefinedValues = removeKeysWithUndefinedValues;
exports.replaceXWithY = replaceXWithY;
exports.round = round;
exports.shallowEqual = shallowEqual;
exports.sleep = sleep;
exports.timestamp = timestamp;
exports.topScore = topScore;
exports.unsubscribeAllPubsubTopics = unsubscribeAllPubsubTopics;
exports.waitTillCommentsArePublished = waitTillCommentsArePublished;
exports.waitTillCommentsUpdate = waitTillCommentsUpdate;

var _concat = require("uint8arrays/concat");

var _toString = require("uint8arrays/to-string");

var _itAll = _interopRequireDefault(require("it-all"));

var _itLast = _interopRequireDefault(require("it-last"));

var _debug = _interopRequireDefault(require("debug"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _formData = _interopRequireDefault(require("form-data"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//This is temp. TODO replace this with accurate mapping
const TIMEFRAMES_TO_SECONDS = Object.freeze({
  "HOUR": 60 * 60,
  "DAY": 60 * 60 * 24,
  "WEEK": 60 * 60 * 24 * 7,
  "MONTH": 60 * 60 * 24 * 7 * 4,
  "YEAR": 60 * 60 * 24 * 7 * 4 * 12,
  "ALL": Infinity
});
exports.TIMEFRAMES_TO_SECONDS = TIMEFRAMES_TO_SECONDS;
const debug = (0, _debug.default)("plebbit-js:Util");

async function loadIpfsFileAsJson(cid, plebbit) {
  if (!cid) return undefined;

  if (plebbit.ipfsGatewayUrl) {
    const res = await (0, _nodeFetch.default)(`${plebbit.ipfsGatewayUrl}/ipfs/${cid}`);
    if (res.status === 200) return await res.json();else return undefined;
  } else {
    const rawData = await (0, _itAll.default)(plebbit.ipfsClient.cat(cid));
    const data = (0, _concat.concat)(rawData);

    if (!data) {
      debug(`IPFS (${cid}) loads undefined object (${data})`);
      return undefined;
    } else return JSON.parse((0, _toString.toString)(data));
  }
}

async function loadIpnsAsJson(ipns, plebbit) {
  if (plebbit.ipfsGatewayUrl) {
    const res = await (0, _nodeFetch.default)(`${plebbit.ipfsGatewayUrl}/ipns/${ipns}`);
    if (res.status === 200) return await res.json();else return undefined;
  } else {
    const cid = await (0, _itLast.default)(plebbit.ipfsClient.name.resolve(ipns));
    return await loadIpfsFileAsJson(cid, plebbit);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function unsubscribeAllPubsubTopics(ipfsClients) {
  return new Promise(async (resolve, reject) => {
    if (!Array.isArray(ipfsClients)) ipfsClients = [ipfsClients];

    const errHandle = err => {
      console.error(err);
      reject(err);
    };

    const unsubscribePromises = ipfsClients.map(ipfsClient => {
      return new Promise(async (nestedResolve, nestedReject) => {
        ipfsClient.pubsub.ls().then(async pubsubTopics => {
          Promise.all(pubsubTopics.map(topic => ipfsClient.pubsub.unsubscribe(topic))).then(nestedResolve).catch(nestedResolve);
        }).catch(nestedReject);
      });
    });
    Promise.all(unsubscribePromises).then(resolve).catch(errHandle);
  });
}

function chunks(arr, len) {
  let chunks = [],
      i = 0;

  while (i < arr.length) chunks.push(arr.slice(i, i += len));

  return chunks;
}

function round(number, decimalPlaces) {
  const factorOfTen = Math.pow(10, decimalPlaces);
  return Math.round(number * factorOfTen) / factorOfTen;
}

function parseJsonIfString(x) {
  return x instanceof String || typeof x === "string" ? JSON.parse(x) : x;
}

function timestamp() {
  return Math.round(Date.now() / 1000);
}

function replaceXWithY(obj, x, y) {
  // obj is a JS object
  const newObj = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (obj[key] === x) newObj[key] = y;else if (typeof value === "object" && value !== null) newObj[key] = replaceXWithY(value, x, y);else newObj[key] = value;
  });
  return newObj;
}

function keepKeys(obj, keys) {
  const newObj = {};
  keys.forEach(key => newObj[key] = undefined);

  for (const key of Object.keys(obj)) if (keys.includes(key)) newObj[key] = obj[key];

  return newObj;
}

function removeKeys(object1, keys) {
  const newObject = { ...object1
  };
  keys.forEach(key => delete newObject[key]);
  return newObject;
}

function shallowEqual(object1, object2, excludeKeys = []) {
  object1 = removeKeys(object1 || {}, excludeKeys);
  object1 = removeKeysWithUndefinedValues(object1); // To get rid of keys with undefined value

  object2 = removeKeys(object2 || {}, excludeKeys);
  object2 = removeKeysWithUndefinedValues(object2); // To get rid of keys with undefined value

  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) if (JSON.stringify(object1[key]) !== JSON.stringify(object2[key])) return false;

  return true;
}

async function waitTillCommentsArePublished(comments) {
  return new Promise(async (resolve, reject) => {
    const promises = comments.map(comment => {
      return new Promise(async (commentResolve, commentReject) => {
        comment.once("challengeverification", ([challengeVerificationMessage, newComment]) => {
          commentResolve(newComment);
        });
      });
    });
    Promise.all(promises).then(resolve).catch(reject);
  });
} // Takes a list of Comments, run .update on them and make sure at least one update has been polled


async function waitTillCommentsUpdate(comments) {
  return new Promise(async (resolve, reject) => {
    const promises = comments.map(comment => {
      return new Promise(async (commentResolve, commentReject) => {
        comment.once("update", newComment => {
          comment.stop();
          commentResolve(newComment);
        });
        await comment.update();
      });
    });
    Promise.all(promises).then(resolve).catch(reject);
  });
}

function hotScore(comment) {
  const score = comment.upvoteCount - comment.downvoteCount;
  const order = Math.log10(Math.max(score, 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = comment.timestamp - 1134028003;
  return round(sign * order + seconds / 45000, 7);
}

function controversialScore(comment) {
  if (comment.downvoteCount <= 0 || comment.upvoteCount <= 0) return 0;
  const magnitude = comment.upvoteCount + comment.downvoteCount;
  const balance = comment.upvoteCount > comment.downvoteCount ? parseFloat(comment.downvoteCount) / comment.upvoteCount : parseFloat(comment.upvoteCount) / comment.downvoteCount;
  return Math.pow(magnitude, balance);
}

function topScore(comment) {
  return comment.upvoteCount - comment.downvoteCount;
}

function newScore(comment) {
  return comment.timestamp;
}

function oldScore(comment) {
  return -comment.timestamp;
}

function removeKeysWithUndefinedValues(object) {
  return JSON.parse(JSON.stringify(object));
} // This is a temporary method until https://github.com/ipfs/js-ipfs/issues/3547 is fixed


async function ipfsImportKey(signer, plebbit, password = '') {
  var _plebbit$ipfsHttpClie;

  const data = new _formData.default();
  data.append('file', signer.ipfsKey);
  const nodeUrl = typeof plebbit.ipfsHttpClientOptions === "string" ? plebbit.ipfsHttpClientOptions : plebbit.ipfsHttpClientOptions.url;
  if (!nodeUrl) throw "Can't figure out ipfs node URL";
  const url = `${nodeUrl}/key/import?arg=${signer.ipnsKeyName}`;
  const res = await (0, _nodeFetch.default)(url, {
    method: 'POST',
    body: data,
    headers: (_plebbit$ipfsHttpClie = plebbit.ipfsHttpClientOptions) === null || _plebbit$ipfsHttpClie === void 0 ? void 0 : _plebbit$ipfsHttpClie.headers
  });
  if (res.status !== 200) throw res.statusText;
  return await res.json();
}