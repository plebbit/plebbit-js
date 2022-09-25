import { default as NodeFormData } from "form-data";
import { Plebbit } from "./plebbit";
import { CommentType, OnlyDefinedProperties, Timeframe } from "./types";
import { nativeFunctions } from "./runtime/node/util";
import { Signer } from "./signer";
import { Buffer } from "buffer";
import isIPFS from "is-ipfs";
import { codes, messages } from "./errors";
import errcode from "err-code";

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

async function fetchWithLimit(url: string, options?): Promise<[resJson: Object, response: Response]> {
    // Node-fetch will take care of size limits through options.size, while browsers will process stream manually
    let res;
    try {
        res = await (globalThis["window"]?.fetch || nativeFunctions.fetch)(url, { ...options, size: DOWNLOAD_LIMIT_BYTES });
        // If getReader is undefined that means node-fetch is used here. node-fetch processes options.size automatically
        if (res.body.getReader === undefined) return [await res.json(), res];
    } catch (e) {
        console.log(`error.message: ${e.message}`);
        if (e.message.includes("over limit"))
            throw errcode(Error(messages.ERR_OVER_DOWNLOAD_LIMIT), codes.ERR_OVER_DOWNLOAD_LIMIT, {
                details: `fetch: url (${url}) points to a file larger than download limit (${DOWNLOAD_LIMIT_BYTES}) bytes`
            });
        // If error is not related to size limit, then throw it again
        throw e;
    }

    //@ts-ignore
    if (res?.body?.getReader !== undefined) {
        let totalBytesRead = 0;

        // @ts-ignore
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let resJson: string = "";

        while (true) {
            const { done, value } = await reader.read();
            //@ts-ignore
            if (value) resJson += decoder.decode(value);
            if (done || !value) break;
            if (value.length + totalBytesRead > DOWNLOAD_LIMIT_BYTES)
                throw errcode(Error(messages.ERR_OVER_DOWNLOAD_LIMIT), codes.ERR_OVER_DOWNLOAD_LIMIT, {
                    details: `fetch: url (${url}) points to a file larger than download limit (${DOWNLOAD_LIMIT_BYTES}) bytes`
                });
            totalBytesRead += value.length;
        }
        return [JSON.parse(resJson), res];
    }
}

export async function loadIpfsFileAsJson(cid: string, plebbit: Plebbit, defaultOptions = { timeout: 60000 }) {
    if (!isIPFS.cid(cid) && !isIPFS.path(cid))
        throw errcode(Error(messages.ERR_CID_IS_INVALID), codes.ERR_CID_IS_INVALID, {
            details: `loadIpfsFileAsJson: CID (${cid}) is invalid`
        });
    if (!plebbit.ipfsClient) {
        const url = `${plebbit.ipfsGatewayUrl}/ipfs/${cid}`;
        const [resJson, res] = await fetchWithLimit(url, { cache: "force-cache" });
        if (res.status === 200) return resJson;
        else throw Error(`Failed to load IPFS via url (${url}). Status code ${res.status} and status text ${res.statusText}`);
    } else {
        let fileContent: string | undefined, error;
        try {
            fileContent = await plebbit.ipfsClient.cat(cid, { ...defaultOptions, length: DOWNLOAD_LIMIT_BYTES }); // Limit is 1mb files
        } catch (e) {
            error = e;
        }
        if (typeof fileContent !== "string") throw Error(`Was not able to load IPFS (${cid}) due to error: ${error}`);
        try {
            return JSON.parse(fileContent);
        } catch {
            if (fileContent.length === DOWNLOAD_LIMIT_BYTES)
                throw errcode(Error(messages.ERR_OVER_DOWNLOAD_LIMIT), codes.ERR_OVER_DOWNLOAD_LIMIT, {
                    details: `loadIpfsFileAsJson: cid (${cid}) points to a file larger than download limit (${DOWNLOAD_LIMIT_BYTES}) bytes`
                });
        }
    }
}

export async function loadIpnsAsJson(ipns: string, plebbit: Plebbit) {
    if (typeof ipns !== "string")
        throw errcode(Error(messages.ERR_IPNS_IS_INVALID), codes.ERR_IPNS_IS_INVALID, {
            details: `loadIpnsAsJson: ipns (${ipns}) is invalid`
        });
    if (!plebbit.ipfsClient) {
        const url = `${plebbit.ipfsGatewayUrl}/ipns/${ipns}`;
        const [resJson, res] = await fetchWithLimit(url, { cache: "no-store", size: DOWNLOAD_LIMIT_BYTES });
        if (res.status === 200) return resJson;
        else throw Error(`Failed to load IPNS via url (${url}). Status code ${res.status} and status text ${res.statusText}`);
    } else {
        let cid: string | undefined, error;
        try {
            cid = await plebbit.ipfsClient.name.resolve(ipns);
        } catch (e) {
            error = e;
        }
        if (typeof cid !== "string")
            throw Error(`ipns (${ipns}) record ${error ? ` fails to resolve due to error ${error} ` : " does not exist"}`);
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

export function keepKeys<T extends Record<string, any>, V extends string>(obj: T, keys: V[]): Pick<T, V> {
    return Object.assign(
        {},
        ...keys.map((key) => ({ [key]: undefined })),
        ...Object.entries(obj).map(([key, value]) => ((<string[]>keys).includes(key) ? { [key]: value } : undefined))
    );
}

export function removeKeys<T extends Record<string, any>, V extends string>(object1: T, keys: V[]): Omit<T, V> {
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

export function shallowEqual(object1: Object, object2: Object, excludeKeys: any[] = []) {
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
    if (typeof comment.downvoteCount !== "number" || typeof comment.upvoteCount !== "number")
        throw Error(
            `Comment.downvoteCount (${comment.downvoteCount}) and comment.upvoteCount (${comment.upvoteCount}) need to be defined before calculating hotScore`
        );
    const score = comment.upvoteCount - comment.downvoteCount;
    const order = Math.log10(Math.max(score, 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = comment.timestamp - 1134028003;
    return round(sign * order + seconds / 45000, 7);
}

export function controversialScore(comment: CommentType) {
    if (typeof comment.downvoteCount !== "number" || typeof comment.upvoteCount !== "number")
        throw Error(
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
    if (typeof comment.downvoteCount !== "number" || typeof comment.upvoteCount !== "number")
        throw Error(
            `Comment.downvoteCount (${comment.downvoteCount}) and comment.upvoteCount (${comment.upvoteCount}) need to be defined before calculating topScore`
        );

    return comment.upvoteCount - comment.downvoteCount;
}

export function newScore(comment: CommentType) {
    if (typeof comment.timestamp !== "number")
        throw Error(`Comment.timestamp (${comment.timestamp}) needs to defined to calculate newScore`);
    return comment.timestamp;
}

export function oldScore(comment: CommentType) {
    if (typeof comment.timestamp !== "number")
        throw Error(`Comment.timestamp (${comment.timestamp}) needs to defined to calculate oldScore`);
    return -comment.timestamp;
}

export function removeKeysWithUndefinedValues<T extends Object>(object: T): OnlyDefinedProperties<T> {
    return JSON.parse(JSON.stringify(object));
}

// This is a temporary method until https://github.com/ipfs/js-ipfs/issues/3547 is fixed
export async function ipfsImportKey(signer: Signer, plebbit, password = "") {
    const data = globalThis["FormData"] ? new FormData() : new NodeFormData();
    if (typeof signer.ipnsKeyName !== "string") throw Error("Signer.ipnsKeyName needs to be defined before importing key into IPFS node");
    if (signer.ipfsKey?.constructor?.name !== "Uint8Array")
        throw Error("Signer.ipfsKey needs to be defined before importing key into IPFS node");
    const ipfsKeyFile = globalThis["Buffer"] ? Buffer.from(signer.ipfsKey) : new File([signer.ipfsKey], "myfile");

    //@ts-ignore
    data.append("file", ipfsKeyFile);
    const nodeUrl = typeof plebbit.ipfsHttpClientOptions === "string" ? plebbit.ipfsHttpClientOptions : plebbit.ipfsHttpClientOptions.url;
    if (!nodeUrl) throw new Error("Can't figure out ipfs node URL");
    const url = `${nodeUrl}/key/import?arg=${signer.ipnsKeyName}`;
    const res = await (globalThis["window"] ? window.fetch : nativeFunctions.fetch)(url, {
        method: "POST",
        //@ts-ignore
        body: data,
        headers: plebbit.ipfsHttpClientOptions?.headers
    });
    if (res.status !== 200) throw new Error(`failed ipfs import key: '${url}' '${res.status}' '${res.statusText}'`);
    return await res.json();
}

export function randomElement<T>(array: Array<T>): T {
    return array[Math.floor(Math.random() * array.length)];
}
