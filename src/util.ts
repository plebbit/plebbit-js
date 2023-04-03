import { Plebbit } from "./plebbit";
import {
    CommentWithCommentUpdate,
    OnlyDefinedProperties,
    PageIpfs,
    PagesType,
    PagesTypeIpfs,
    PagesTypeJson,
    PageType,
    Timeframe
} from "./types";
import { nativeFunctions } from "./runtime/node/util";
import isIPFS from "is-ipfs";
import { messages } from "./errors";
import Hash from "ipfs-only-hash";
import lodash from "lodash";
import assert from "assert";
import { Pages } from "./pages";
import { PlebbitError } from "./plebbit-error";
import pLimit from "p-limit";

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

async function fetchWithLimit(url: string, options?): Promise<string> {
    // Node-fetch will take care of size limits through options.size, while browsers will process stream manually
    let res: Response;
    try {
        //@ts-expect-error
        res = await nativeFunctions.fetch(url, { ...options, size: DOWNLOAD_LIMIT_BYTES });
        if (res.status !== 200) throw Error("Failed to fetch");
        // If getReader is undefined that means node-fetch is used here. node-fetch processes options.size automatically
        if (res?.body?.getReader === undefined) return await res.text();
    } catch (e) {
        if (e.message.includes("over limit")) throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
        const errorCode = url.includes("/ipfs/")
            ? "ERR_FAILED_TO_FETCH_IPFS_VIA_GATEWAY"
            : url.includes("/ipns/")
            ? "ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY"
            : "ERR_FAILED_TO_FETCH_GENERIC";
        throwWithErrorCode(errorCode, { url, status: res?.status, statusText: res?.statusText });

        // If error is not related to size limit, then throw it again
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
                throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { url, downloadLimit: DOWNLOAD_LIMIT_BYTES });
            totalBytesRead += value.length;
        }
        return resText;
    }
}

function _raceToSuccess(promises: Promise<string>[]): Promise<string> {
    return new Promise((resolve) => promises.forEach((promise) => promise.then(resolve)));
}

async function fetchFromMultipleGateways(loadOpts: { cid?: string; ipns?: string }, plebbit: Plebbit): Promise<string> {
    assert(loadOpts.cid || loadOpts.ipns);

    const path = loadOpts.cid ? `/ipfs/${loadOpts.cid}` : `/ipns/${loadOpts.ipns}`;

    const fetchWithGateway = async (gateway: string) => {
        const url = `${gateway}${path}`;
        const timeBefore = Date.now();
        const type = loadOpts.cid ? "cid" : "ipns";
        try {
            const resText = await fetchWithLimit(url, { cache: loadOpts.cid ? "force-cache" : "no-store" });
            const timeElapsedMs = Date.now() - timeBefore;
            await plebbit.clients.ipfsGateways[gateway].stats.recordSuccess(type, timeElapsedMs); // TODO add success
            return resText;
        } catch (e) {
            await plebbit.clients.ipfsGateways[gateway].stats.recordFailure(type); // TODO add failure
            throw e;
        }
    };

    // TODO test potential errors here
    const queueLimit = pLimit(3);

    const gatewayFetches = Object.keys(plebbit.clients.ipfsGateways).map((gateway) => queueLimit(() => fetchWithGateway(gateway))); // Will be likely 5 promises, p-limit will limit to 3

    const res = await _raceToSuccess(gatewayFetches);
    assert(typeof res === "string");
    return res;
}

export async function fetchCid(cid: string, plebbit: Plebbit, catOptions = { length: DOWNLOAD_LIMIT_BYTES }): Promise<string> {
    if (!isIPFS.cid(cid) && isIPFS.path(cid)) cid = cid.split("/")[2];
    if (!isIPFS.cid(cid)) throwWithErrorCode("ERR_CID_IS_INVALID", `fetchCid: (${cid}) is invalid as a CID`);
    let fileContent: string | undefined;
    const ipfsClient = plebbit._defaultIpfsClient();
    if (!ipfsClient) {
        fileContent = await fetchFromMultipleGateways({ cid }, plebbit);
        const calculatedCid: string = await Hash.of(fileContent);
        if (fileContent.length === DOWNLOAD_LIMIT_BYTES && calculatedCid !== cid)
            throwWithErrorCode("ERR_OVER_DOWNLOAD_LIMIT", { cid, downloadLimit: DOWNLOAD_LIMIT_BYTES });
        if (calculatedCid !== cid) throwWithErrorCode("ERR_CALCULATED_CID_DOES_NOT_MATCH", { calculatedCid, cid });
    } else {
        let error;
        try {
            fileContent = await ipfsClient._client.cat(cid, catOptions); // Limit is 1mb files
        } catch (e) {
            error = e;
        }

        if (typeof fileContent !== "string") throwWithErrorCode("ERR_FAILED_TO_FETCH_IPFS_VIA_IPFS", { cid, error, options: catOptions });
    }

    plebbit.emit("fetchedcid", cid, fileContent);
    return fileContent;
}

export async function loadIpfsFileAsJson(cid: string, plebbit: Plebbit) {
    return JSON.parse(await fetchCid(cid, plebbit));
}

export async function loadIpnsAsJson(ipns: string, plebbit: Plebbit, callbackAfterResolve?: (ipns: string, cid: string) => void) {
    if (typeof ipns !== "string") throwWithErrorCode("ERR_IPNS_IS_INVALID", { ipns });
    const ipfsClient = plebbit._defaultIpfsClient();
    if (!ipfsClient) {
        const resText = await fetchFromMultipleGateways({ ipns }, plebbit);
        plebbit.emit("fetchedipns", ipns, resText);
        return JSON.parse(resText);
    } else {
        let cid: string | undefined, error;
        try {
            cid = await ipfsClient._client.name.resolve(ipns);
        } catch (e) {
            error = e;
        }
        if (typeof cid !== "string") throwWithErrorCode("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS", { ipns, error });
        plebbit.emit("resolvedipns", ipns, cid);
        if (callbackAfterResolve) callbackAfterResolve(ipns, cid);
        return loadIpfsFileAsJson(cid, plebbit);
    }
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

export function hotScore(comment: Pick<CommentWithCommentUpdate, "timestamp" | "upvoteCount" | "downvoteCount">) {
    assert(typeof comment.downvoteCount === "number" && typeof comment.upvoteCount === "number" && typeof comment.timestamp === "number");

    const score = comment.upvoteCount - comment.downvoteCount;
    const order = Math.log10(Math.max(score, 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = comment.timestamp - 1134028003;
    return lodash.round(sign * order + seconds / 45000, 7);
}

export function controversialScore(comment: Pick<CommentWithCommentUpdate, "timestamp" | "upvoteCount" | "downvoteCount">) {
    assert(typeof comment.downvoteCount === "number" && typeof comment.upvoteCount === "number");

    if (comment.downvoteCount <= 0 || comment.upvoteCount <= 0) return 0;
    const magnitude = comment.upvoteCount + comment.downvoteCount;
    const balance =
        comment.upvoteCount > comment.downvoteCount
            ? comment.downvoteCount / comment.upvoteCount
            : comment.upvoteCount / comment.downvoteCount;
    return Math.pow(magnitude, balance);
}

export function topScore(comment: Pick<CommentWithCommentUpdate, "timestamp" | "upvoteCount" | "downvoteCount">) {
    assert(typeof comment.downvoteCount === "number" && typeof comment.upvoteCount === "number");

    return comment.upvoteCount - comment.downvoteCount;
}

export function newScore(comment: Pick<CommentWithCommentUpdate, "timestamp" | "upvoteCount" | "downvoteCount">) {
    assert(typeof comment.timestamp === "number");
    return comment.timestamp;
}

export function oldScore(comment: Pick<CommentWithCommentUpdate, "timestamp" | "upvoteCount" | "downvoteCount">) {
    assert(typeof comment.timestamp === "number");

    return -comment.timestamp;
}

export function removeNullAndUndefinedValues<T extends Object>(obj: T): T {
    return <T>lodash.omitBy(obj, lodash.isNil);
}

export function removeNullAndUndefinedValuesRecursively<T>(obj: T): T {
    if (Array.isArray(obj)) return <T>obj.map(removeNullAndUndefinedValuesRecursively);
    if (!lodash.isPlainObject(obj)) return obj;
    const cleanedObj = removeNullAndUndefinedValues(obj);
    for (const [key, value] of Object.entries(cleanedObj))
        if (lodash.isPlainObject(value) || Array.isArray(value)) cleanedObj[key] = removeNullAndUndefinedValuesRecursively(value);

    return cleanedObj;
}

// TODO rename
export function removeKeysWithUndefinedValues<T extends Object>(object: T): OnlyDefinedProperties<T> {
    const newObj = JSON.parse(JSON.stringify(object));
    for (const prop in newObj)
        if (newObj[prop]?.constructor?.name === "Object" && JSON.stringify(newObj[prop]) === "{}") delete newObj[prop];

    return newObj;
}

export function throwWithErrorCode(code: keyof typeof messages, details?: {}) {
    throw new PlebbitError(code, details);
}

export async function parsePageIpfs(pageIpfs: PageIpfs, subplebbit: Pages["_subplebbit"]): Promise<PageType> {
    const finalComments = await Promise.all(pageIpfs.comments.map((commentObj) => subplebbit.plebbit.createComment(commentObj.comment)));
    for (let i = 0; i < finalComments.length; i++) {
        //@ts-expect-error
        finalComments[i].subplebbit = subplebbit;
        await finalComments[i]._initCommentUpdate(pageIpfs.comments[i].update);
    }

    return { comments: finalComments, nextCid: pageIpfs.nextCid };
}

export async function parsePagesIpfs(pagesRaw: PagesTypeIpfs, subplebbit: Pages["_subplebbit"]): Promise<PagesType> {
    const parsedPages = await Promise.all(Object.keys(pagesRaw.pages).map((key) => parsePageIpfs(pagesRaw.pages[key], subplebbit)));
    const pagesType: PagesType["pages"] = Object.fromEntries(Object.keys(pagesRaw.pages).map((key, i) => [key, parsedPages[i]]));
    return { pages: pagesType, pageCids: pagesRaw.pageCids };
}

const isJsonString = (jsonString: any) => {
    if (typeof jsonString !== "string" || (!jsonString.startsWith("{") && !jsonString.startsWith("["))) return false;
    try {
        JSON.parse(jsonString);
        return true;
    } catch {
        return false;
    }
};

// Only for DB
export const parseJsonStrings = (obj: any) => {
    if (obj === "[object Object]") throw Error(`Object shouldn't be [object Object]`);
    if (Array.isArray(obj)) return obj.map((o) => parseJsonStrings(o));
    if (!isJsonString(obj) && !lodash.isPlainObject(obj)) return obj;

    const newObj = removeNullAndUndefinedValues(isJsonString(obj) ? JSON.parse(obj) : lodash.cloneDeep(obj));
    //prettier-ignore
    const booleanFields = ["deleted", "spoiler", "pinned", "locked", "removed", "commentUpdate_deleted", "commentUpdate_spoiler", "commentUpdate_pinned", "commentUpdate_locked", "commentUpdate_removed"];
    for (const [key, value] of Object.entries(newObj)) {
        if (value === "[object Object]") throw Error(`key (${key}) shouldn't be [object Object]`);

        if (booleanFields.includes(key) && typeof value === "number") newObj[key] = Boolean(value);
        else if (isJsonString(value)) newObj[key] = removeNullAndUndefinedValues(JSON.parse(<any>value));
        if (newObj[key]?.constructor?.name === "Object") newObj[key] = removeNullAndUndefinedValues(parseJsonStrings(newObj[key]));
    }
    return <any>newObj;
};

// To use for both subplebbit.posts and comment.replies

export async function parseRawPages(
    replies: PagesTypeIpfs | PagesTypeJson | Pages | undefined,
    parentCid: string | undefined,
    subplebbit: Pages["_subplebbit"]
): Promise<Pages> {
    if (!replies)
        return new Pages({
            pages: undefined,
            pageCids: undefined,
            subplebbit: subplebbit,
            pagesIpfs: undefined,
            parentCid: parentCid
        });

    if (replies instanceof Pages) return replies;

    const isIpfs = Boolean(Object.values(replies.pages)[0]?.comments[0]["update"]);

    if (isIpfs) {
        replies = replies as PagesTypeIpfs;
        const parsedPages = await parsePagesIpfs(replies, subplebbit);
        return new Pages({
            pages: parsedPages.pages,
            pageCids: parsedPages.pageCids,
            subplebbit: subplebbit,
            pagesIpfs: replies.pages,
            parentCid: parentCid
        });
    } else {
        replies = replies as PagesTypeJson;
        const repliesClone = lodash.cloneDeep(replies) as PagesType;
        //@ts-expect-error
        const pageKeys: (keyof PagesType["pages"])[] = Object.keys(repliesClone.pages);
        for (const key of pageKeys)
            repliesClone.pages[key].comments = await Promise.all(
                replies.pages[key].comments.map((comment) =>
                    subplebbit.plebbit.createComment.bind(subplebbit.plebbit)({ ...comment, subplebbit })
                )
            );

        return new Pages({
            pages: repliesClone.pages,
            pageCids: replies.pageCids,
            subplebbit: subplebbit,
            pagesIpfs: undefined,
            parentCid: parentCid
        });
    }
}

export function shortifyAddress(address: string): string {
    if (address.includes(".")) return address; // If a domain then no need to shortify
    // Remove prefix (12D3KooW)
    const removedPrefix = address.slice(8);
    // Return first 12 characters
    const shortAddress = removedPrefix.slice(0, 12);
    return shortAddress;
}

export function shortifyCid(cid: string): string {
    // Remove prefix (Qm)
    // Return first 12 characters
    return cid.slice(2).slice(0, 12);
}
