import { concat as uint8ArrayConcat } from "uint8arrays/concat";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import all from "it-all";
import last from "it-last";
import Debug from "debug";
import fetch from "node-fetch";
import FormData from "form-data";
import assert from "assert";
import { Plebbit } from "./plebbit";
import { CommentType, ProtocolVersion, Timeframe } from "./types";
import { isRuntimeNode } from "./runtime/node/util";
import { Signer } from "./signer";
//This is temp. TODO replace this with accurate mapping
export const TIMEFRAMES_TO_SECONDS: Record<Timeframe, number> = Object.freeze({
    HOUR: 60 * 60,
    DAY: 60 * 60 * 24,
    WEEK: 60 * 60 * 24 * 7,
    MONTH: 60 * 60 * 24 * 7 * 4,
    YEAR: 60 * 60 * 24 * 7 * 4 * 12,
    ALL: Infinity
});
const DOWNLOAD_LIMIT_BYTES = 1000000; // 1mb
const debugs = getDebugLevels("util");

async function fetchWithLimit(url: string, options?) {
    // Node-fetch will take care of size limits through options.size, while browsers will process stream manually
    debugs.DEBUG(`Attempting to fetch url: ${url}`);
    const res = await fetch(url, options);
    if (isRuntimeNode) return res; // No need to process stream for Node

    const originalRes = res.clone();
    // @ts-ignore
    const reader = res.body.getReader();
    let currentChunk: any = undefined,
        totalBytesRead = 0;

    while (true) {
        currentChunk = await reader.read();
        const { done, value } = currentChunk;
        if (done || !value) break;
        if (value.length + totalBytesRead > options.size) throw new Error(`content size at ${url} over limit: ${options.size}`);
        totalBytesRead += value.length;
        debugs.TRACE(`Total bytes read from ${url}: ${totalBytesRead}`);
    }
    return originalRes;
}

export async function loadIpfsFileAsJson(cid: string, plebbit: Plebbit, defaultOptions = { timeout: 60000 }) {
    assert.ok(cid, "Cid has to not be null to load");
    if (!plebbit.ipfsClient) {
        const url = `${plebbit.ipfsGatewayUrl}/ipfs/${cid}`;
        const res = await fetchWithLimit(url, { cache: "force-cache", size: DOWNLOAD_LIMIT_BYTES });
        if (res.status === 200) return res.json();
        else throw new Error(`Failed to load IPFS via url (${url}). Status code ${res.status} and status text ${res.statusText}`);
    } else {
        let rawData, error;
        try {
            rawData = await all(plebbit.ipfsClient.cat(cid, { ...defaultOptions, length: DOWNLOAD_LIMIT_BYTES })); // Limit is 1mb files
        } catch (e) {
            error = e;
        }
        const data = uint8ArrayConcat(rawData);
        if (!data) throw new Error(`Was not able to load IPFS (${cid}) due to error: ${error}`);
        else return JSON.parse(uint8ArrayToString(data));
    }
}

export async function loadIpnsAsJson(ipns: string, plebbit: Plebbit) {
    assert.ok(ipns, "ipns has to be not null to load");
    if (!plebbit.ipfsClient) {
        const url = `${plebbit.ipfsGatewayUrl}/ipns/${ipns}`;
        const res = await fetchWithLimit(url, { cache: "no-store", size: DOWNLOAD_LIMIT_BYTES });
        if (res.status === 200) return await res.json();
        else throw new Error(`Failed to load IPNS via url (${url}). Status code ${res.status} and status text ${res.statusText}`);
    } else {
        let cid, error;
        try {
            cid = await last(plebbit.ipfsClient.name.resolve(ipns));
        } catch (e) {
            error = e;
        }
        if (!cid) throw new Error(`IPNS (${ipns}) resolves to undefined due to error: ${error}`);
        assert(typeof cid === "string", "CID has to be a string");
        debugs.TRACE(`IPNS (${ipns}) resolved to ${cid}`);
        return loadIpfsFileAsJson(cid, plebbit);
    }
}

export function chunks<T>(arr: Array<T>, len: number): Array<Array<T>> {
    let chunks: T[][] = [];
    let i = 0;
    while (i < arr.length) chunks.push(arr.slice(i, (i += len)));
    return chunks;
}

export function round(number: number, decimalPlaces: number): number {
    const factorOfTen = Math.pow(10, decimalPlaces);
    return Math.round(number * factorOfTen) / factorOfTen;
}

export function parseJsonIfString(x) {
    // @ts-ignore
    return x instanceof String || typeof x === "string" ? JSON.parse(x) : x;
}

export function timestamp() {
    return Math.round(Date.now() / 1000);
}

export function keepKeys(obj: Object, keys: any[]) {
    const newObj = {};
    keys.forEach((key) => (newObj[key] = undefined));
    for (const key of Object.keys(obj)) if (keys.includes(key)) newObj[key] = obj[key];
    return newObj;
}

export function removeKeys(object1: Object, keys: any[]): Object {
    const newObject = { ...object1 };
    keys.forEach((key) => delete newObject[key]);
    return newObject;
}

export function replaceXWithY(obj: Object, x: any, y: any): any {
    // obj is a JS object
    const newObj = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (obj[key] === x) newObj[key] = y;
        // `typeof`` gives browser transpiling error "Uncaught ReferenceError: exports is not defined"
        // don't know why but it can be fixed by replacing with `instanceof`
        // else if (typeof value === "object" && value !== null) newObj[key] = replaceXWithY(value, x, y);
        else if (value instanceof Object && value !== null) newObj[key] = replaceXWithY(value, x, y);
        else newObj[key] = value;
    });
    return newObj;
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

export async function waitTillPublicationsArePublished(publications) {
    const promises = publications.map((publication) => {
        return new Promise(async (publicationResolve, publicationReject) => {
            publication.once("challengeverification", (challengeVerificationMessage, newComment) => {
                publicationResolve(challengeVerificationMessage);
            });
        });
    });
    return await Promise.all(promises);
}

// Takes a list of Comments, run .update on them and make sure at least one update has been polled
export async function waitTillCommentsUpdate(comments, updateInterval) {
    return new Promise(async (resolve, reject) => {
        const promises = comments.map((comment) => {
            return new Promise(async (commentResolve, commentReject) => {
                comment.once("update", (newComment) => {
                    comment.stop();
                    commentResolve(newComment);
                });
                await comment.update(updateInterval);
            });
        });
        Promise.all(promises).then(resolve).catch(reject);
    });
}

export function hotScore(comment: CommentType) {
    assert(
        typeof comment.downvoteCount === "number" && typeof comment.upvoteCount === "number",
        `Comment.downvoteCount (${comment.downvoteCount}) and comment.upvoteCount (${comment.upvoteCount}) need to be defined before calculating hotScore`
    );
    const score = comment.upvoteCount - comment.downvoteCount;
    const order = Math.log10(Math.max(score, 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = comment.timestamp - 1134028003;
    return round(sign * order + seconds / 45000, 7);
}

export function controversialScore(comment: CommentType) {
    assert(
        typeof comment.downvoteCount === "number" && typeof comment.upvoteCount === "number",
        `Comment.downvoteCount (${comment.downvoteCount}) and comment.upvoteCount (${comment.upvoteCount}) need to be defined before calculating controversialScore`
    );
    if (comment.downvoteCount <= 0 || comment.upvoteCount <= 0) return 0;
    const magnitude = comment.upvoteCount + comment.downvoteCount;
    const balance =
        comment.upvoteCount > comment.downvoteCount
            ? comment.downvoteCount / comment.upvoteCount
            : comment.upvoteCount / comment.downvoteCount;
    return Math.pow(magnitude, balance);
}

export function topScore(comment: CommentType) {
    assert(
        typeof comment.downvoteCount === "number" && typeof comment.upvoteCount === "number",
        `Comment.downvoteCount (${comment.downvoteCount}) and comment.upvoteCount (${comment.upvoteCount}) need to be defined before calculating topScore`
    );
    return comment.upvoteCount - comment.downvoteCount;
}

export function newScore(comment: CommentType) {
    assert(typeof comment.timestamp === "number", `Comment.timestamp (${comment.timestamp}) needs to defined to calculate newScore`);
    return comment.timestamp;
}

export function oldScore(comment: CommentType) {
    assert(typeof comment.timestamp === "number", `Comment.timestamp (${comment.timestamp}) needs to defined to calculate oldScore`);
    return -comment.timestamp;
}

export function removeKeysWithUndefinedValues(object) {
    return JSON.parse(JSON.stringify(object));
}

// This is a temporary method until https://github.com/ipfs/js-ipfs/issues/3547 is fixed
export async function ipfsImportKey(signer: Signer, plebbit, password = "") {
    const data = new FormData();
    data.append("file", Buffer.from(signer.ipfsKey));
    const nodeUrl = typeof plebbit.ipfsHttpClientOptions === "string" ? plebbit.ipfsHttpClientOptions : plebbit.ipfsHttpClientOptions.url;
    if (!nodeUrl) throw new Error("Can't figure out ipfs node URL");
    const url = `${nodeUrl}/key/import?arg=${signer.ipnsKeyName}`;
    const res = await fetch(url, {
        method: "POST",
        body: data,
        headers: plebbit.ipfsHttpClientOptions?.headers
    });
    if (res.status !== 200) throw new Error(`failed ipfs import key: '${url}' '${res.status}' '${res.statusText}'`);
    return await res.json();
}

export function getDebugLevels(baseName: string): { FATAL: Debug; ERROR: Debug; WARN: Debug; INFO: Debug; DEBUG: Debug; TRACE: Debug } {
    const debugsObj = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"].map((debugLevel) => ({
        [debugLevel]: Debug(`plebbit-js:${baseName}:${debugLevel}`)
    }));
    return Object.assign({}, ...debugsObj);
}

export function randomElement<T>(array: Array<T>): T {
    return array[Math.floor(Math.random() * array.length)];
}

export function getProtocolVersion(): ProtocolVersion {
    return "1.0.0";
}
