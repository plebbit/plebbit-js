import { concat as uint8ArrayConcat } from 'uint8arrays/concat';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import all from 'it-all';
import last from "it-last";
import Debug from "debug";
import fetch from 'node-fetch';
import FormData from "form-data"; //This is temp. TODO replace this with accurate mapping

export const TIMEFRAMES_TO_SECONDS = Object.freeze({
  "HOUR": 60 * 60,
  "DAY": 60 * 60 * 24,
  "WEEK": 60 * 60 * 24 * 7,
  "MONTH": 60 * 60 * 24 * 7 * 4,
  "YEAR": 60 * 60 * 24 * 7 * 4 * 12,
  "ALL": Infinity
});
const debug = Debug("plebbit-js:Util");
export async function loadIpfsFileAsJson(cid, plebbit) {
  if (!cid) return undefined;

  if (plebbit.ipfsGatewayUrl) {
    const res = await fetch(`${plebbit.ipfsGatewayUrl}/ipfs/${cid}`);
    if (res.status === 200) return await res.json();else return undefined;
  } else {
    const rawData = await all(plebbit.ipfsClient.cat(cid));
    const data = uint8ArrayConcat(rawData);

    if (!data) {
      debug(`IPFS (${cid}) loads undefined object (${data})`);
      return undefined;
    } else return JSON.parse(uint8ArrayToString(data));
  }
}
export async function loadIpnsAsJson(ipns, plebbit) {
  if (plebbit.ipfsGatewayUrl) {
    const res = await fetch(`${plebbit.ipfsGatewayUrl}/ipns/${ipns}`);
    if (res.status === 200) return await res.json();else return undefined;
  } else {
    const cid = await last(plebbit.ipfsClient.name.resolve(ipns));
    return await loadIpfsFileAsJson(cid, plebbit);
  }
}
export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export async function unsubscribeAllPubsubTopics(ipfsClients) {
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
export function chunks(arr, len) {
  let chunks = [],
      i = 0;

  while (i < arr.length) chunks.push(arr.slice(i, i += len));

  return chunks;
}
export function round(number, decimalPlaces) {
  const factorOfTen = Math.pow(10, decimalPlaces);
  return Math.round(number * factorOfTen) / factorOfTen;
}
export function parseJsonIfString(x) {
  return x instanceof String || typeof x === "string" ? JSON.parse(x) : x;
}
export function timestamp() {
  return Math.round(Date.now() / 1000);
}
export function replaceXWithY(obj, x, y) {
  // obj is a JS object
  const newObj = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (obj[key] === x) newObj[key] = y;else if (typeof value === "object" && value !== null) newObj[key] = replaceXWithY(value, x, y);else newObj[key] = value;
  });
  return newObj;
}
export function keepKeys(obj, keys) {
  const newObj = {};
  keys.forEach(key => newObj[key] = undefined);

  for (const key of Object.keys(obj)) if (keys.includes(key)) newObj[key] = obj[key];

  return newObj;
}
export function removeKeys(object1, keys) {
  const newObject = { ...object1
  };
  keys.forEach(key => delete newObject[key]);
  return newObject;
}
export function shallowEqual(object1, object2, excludeKeys = []) {
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
export async function waitTillCommentsArePublished(comments) {
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

export async function waitTillCommentsUpdate(comments) {
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
export function hotScore(comment) {
  const score = comment.upvoteCount - comment.downvoteCount;
  const order = Math.log10(Math.max(score, 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = comment.timestamp - 1134028003;
  return round(sign * order + seconds / 45000, 7);
}
export function controversialScore(comment) {
  if (comment.downvoteCount <= 0 || comment.upvoteCount <= 0) return 0;
  const magnitude = comment.upvoteCount + comment.downvoteCount;
  const balance = comment.upvoteCount > comment.downvoteCount ? parseFloat(comment.downvoteCount) / comment.upvoteCount : parseFloat(comment.upvoteCount) / comment.downvoteCount;
  return Math.pow(magnitude, balance);
}
export function topScore(comment) {
  return comment.upvoteCount - comment.downvoteCount;
}
export function newScore(comment) {
  return comment.timestamp;
}
export function oldScore(comment) {
  return -comment.timestamp;
}
export function removeKeysWithUndefinedValues(object) {
  return JSON.parse(JSON.stringify(object));
} // This is a temporary method until https://github.com/ipfs/js-ipfs/issues/3547 is fixed

export async function ipfsImportKey(signer, plebbit, password = '') {
  var _plebbit$ipfsHttpClie;

  const data = new FormData();
  data.append('file', signer.ipfsKey);
  const nodeUrl = typeof plebbit.ipfsHttpClientOptions === "string" ? plebbit.ipfsHttpClientOptions : plebbit.ipfsHttpClientOptions.url;
  if (!nodeUrl) throw "Can't figure out ipfs node URL";
  const url = `${nodeUrl}/key/import?arg=${signer.ipnsKeyName}`;
  const res = await fetch(url, {
    method: 'POST',
    body: data,
    headers: (_plebbit$ipfsHttpClie = plebbit.ipfsHttpClientOptions) === null || _plebbit$ipfsHttpClie === void 0 ? void 0 : _plebbit$ipfsHttpClie.headers
  });
  if (res.status !== 200) throw Error(`failed ipfs import key: '${url}' '${res.status}' '${res.statusText}'`);
  return await res.json();
}