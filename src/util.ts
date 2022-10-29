import { Plebbit } from "./plebbit";
import { CommentType, OnlyDefinedProperties, Timeframe } from "./types";
import { nativeFunctions } from "./runtime/node/util";
import isIPFS from "is-ipfs";
import { codes, messages } from "./errors";
import errcode from "err-code";
import Hash from "ipfs-only-hash";

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

async function fetchWithLimit(url: string, options?): Promise<[resText: string, response: Response]> {
    // Node-fetch will take care of size limits through options.size, while browsers will process stream manually
    let res;
    try {
        res = await nativeFunctions.fetch(url, { ...options, size: DOWNLOAD_LIMIT_BYTES });
        // If getReader is undefined that means node-fetch is used here. node-fetch processes options.size automatically
        if (res?.body?.getReader === undefined) return [await res.text(), res];
    } catch (e) {
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

        let resText: string = "";

        while (true) {
            const { done, value } = await reader.read();
            //@ts-ignore
            if (value) resText += decoder.decode(value);
            if (done || !value) break;
            if (value.length + totalBytesRead > DOWNLOAD_LIMIT_BYTES)
                throw errcode(Error(messages.ERR_OVER_DOWNLOAD_LIMIT), codes.ERR_OVER_DOWNLOAD_LIMIT, {
                    details: `fetch: url (${url}) points to a file larger than download limit (${DOWNLOAD_LIMIT_BYTES}) bytes`
                });
            totalBytesRead += value.length;
        }
        return [resText, res];
    }
}

export async function fetchCid(cid: string, plebbit: Plebbit, catOptions = { length: DOWNLOAD_LIMIT_BYTES }): Promise<string> {
    if (!isIPFS.cid(cid) && isIPFS.path(cid)) cid = cid.split("/")[2];
    if (!isIPFS.cid(cid))
        throw errcode(Error(messages.ERR_CID_IS_INVALID), codes.ERR_CID_IS_INVALID, {
            details: `fetchCid: CID (${cid}) is invalid`
        });
    let fileContent: string | undefined;
    if (!plebbit.ipfsClient) {
        const url = `${plebbit.ipfsGatewayUrl}/ipfs/${cid}`;
        const [resText, res] = await fetchWithLimit(url, { cache: "force-cache" });
        if (res.status === 200) fileContent = resText;
        else throw Error(`Failed to load IPFS via url (${url}). Status code ${res.status} and status text ${res.statusText}`);
    } else {
        let error;
        try {
            fileContent = await plebbit.ipfsClient.cat(cid, catOptions); // Limit is 1mb files
        } catch (e) {
            error = e;
        }
        if (typeof fileContent !== "string") throw Error(`Was not able to load IPFS (${cid}) due to error: ${error}`);
    }

    const generatedCid: string = await Hash.of(fileContent);
    if (fileContent.length === DOWNLOAD_LIMIT_BYTES && generatedCid !== cid)
        throw errcode(Error(messages.ERR_OVER_DOWNLOAD_LIMIT), codes.ERR_OVER_DOWNLOAD_LIMIT, {
            details: `fetchCid: CID (${cid}) points to a file larger than download limit ${DOWNLOAD_LIMIT_BYTES}`
        });
    if (generatedCid !== cid)
        throw errcode(Error(messages.ERR_GENERATED_CID_DOES_NOT_MATCH), codes.ERR_GENERATED_CID_DOES_NOT_MATCH, {
            details: `fetchCid: Loaded file generates a different CID (${generatedCid}) than provided CID (${cid})`
        });
    return fileContent;
}

export async function loadIpfsFileAsJson(cid: string, plebbit: Plebbit) {
    return JSON.parse(await fetchCid(cid, plebbit));
}

export async function loadIpnsAsJson(ipns: string, plebbit: Plebbit) {
    if (typeof ipns !== "string")
        throw errcode(Error(messages.ERR_IPNS_IS_INVALID), codes.ERR_IPNS_IS_INVALID, {
            details: `loadIpnsAsJson: ipns (${ipns}) is invalid`
        });
    if (!plebbit.ipfsClient) {
        const url = `${plebbit.ipfsGatewayUrl}/ipns/${ipns}`;
        const [resText, res] = await fetchWithLimit(url, { cache: "no-store", size: DOWNLOAD_LIMIT_BYTES });
        if (res.status === 200) return JSON.parse(resText);
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

export function timestamp() {
    return Math.round(Date.now() / 1000);
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
    const newObj = JSON.parse(JSON.stringify(object));
    for (const prop in newObj)
        if (newObj[prop]?.constructor?.name === "Object" && JSON.stringify(newObj[prop]) === "{}") delete newObj[prop];

    return newObj;
}

export function randomElement<T>(array: Array<T>): T {
    return array[Math.floor(Math.random() * array.length)];
}
