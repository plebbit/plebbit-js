import {concat as uint8ArrayConcat} from 'uint8arrays/concat';
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import all from 'it-all';
import last from "it-last";
export const TIMEFRAMES_TO_SECONDS = Object.freeze({
    "HOUR": 60 * 60,
    "DAY": 60 * 60 * 24,
    "WEEK": 60 * 60 * 24 * 7,
    "MONTH": 60 * 60 * 24 * 7 * 30,
    "YEAR": 60 * 60 * 24 * 7 * 30 * 365,
    "ALL": Infinity
});

export async function loadIpfsFileAsJson(cid, ipfsClient) {
    return new Promise((resolve, reject) => {
        all(ipfsClient.cat(cid))
            .then(rawData => uint8ArrayConcat(rawData))
            .catch(reject)
            .then(data => {
                const jsonObject = JSON.parse(uint8ArrayToString(data));
                resolve(jsonObject);
            }).catch(reject);
    });
}

export async function loadIpnsAsJson(ipns, ipfsClient) {
    return new Promise(async (resolve, reject) => {
        last(ipfsClient.name.resolve(ipns)).then(cid => {
            if (!cid)
                throw new Error(`Ipns (${ipns}) does not point to anything`);
            loadIpfsFileAsJson(cid, ipfsClient).then(resolve).catch(reject);
        }).catch(reject);
    });
}

export async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function unsubscribeAllPubsubTopics(ipfsClient) {
    let subscribedTopics = await ipfsClient.pubsub.ls();
    for (const topic of subscribedTopics) {
        await ipfsClient.pubsub.unsubscribe(topic);
        await sleep(1000);
    }
}

export function chunks(arr, len) {
    let chunks = [], i = 0;
    while (i < arr.length)
        chunks.push(arr.slice(i, i += len));
    return chunks;
}

export function round(number, decimalPlaces) {
    const factorOfTen = Math.pow(10, decimalPlaces);
    return Math.round(number * factorOfTen) / factorOfTen;
}

export function parseJsonIfString(x) {
    return (x instanceof String || typeof x === "string") ? JSON.parse(x) : x;
}


