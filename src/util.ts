import { Plebbit } from "./plebbit";
import { CommentWithCommentUpdate, OnlyDefinedProperties, PageIpfs, PagesType, PagesTypeIpfs, PageType, Timeframe } from "./types";
import { nativeFunctions } from "./runtime/node/util";
import isIPFS from "is-ipfs";
import { messages } from "./errors";
import errcode from "err-code";
import Hash from "ipfs-only-hash";
import lodash from "lodash";
import { stringify as determinsticStringify } from "safe-stable-stringify";
import assert from "assert";

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
            throwWithErrorCode(
                "ERR_OVER_DOWNLOAD_LIMIT",
                `fetch: url (${url}) points to a file larger than download limit (${DOWNLOAD_LIMIT_BYTES}) bytes`
            );
        else throw Error(`Failed to fetch url (${url}) with options (${JSON.stringify(options)}) due to error (${e})`);
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
                throwWithErrorCode(
                    "ERR_OVER_DOWNLOAD_LIMIT",
                    `fetch: url (${url}) points to a file larger than download limit (${DOWNLOAD_LIMIT_BYTES}) bytes`
                );
            totalBytesRead += value.length;
        }
        return [resText, res];
    }
}

export async function fetchCid(cid: string, plebbit: Plebbit, catOptions = { length: DOWNLOAD_LIMIT_BYTES }): Promise<string> {
    if (!isIPFS.cid(cid) && isIPFS.path(cid)) cid = cid.split("/")[2];
    if (!isIPFS.cid(cid)) throwWithErrorCode("ERR_CID_IS_INVALID", `fetchCid: (${cid}) is invalid as a CID`);
    let fileContent: string | undefined;
    if (!plebbit.ipfsClient) {
        const url = `${plebbit.ipfsGatewayUrl}/ipfs/${cid}`;
        const [resText, res] = await fetchWithLimit(url, { headers: plebbit.ipfsHttpClientOptions?.headers, cache: "force-cache" });
        if (res.status === 200) fileContent = resText;
        else throw Error(`Failed to load IPFS via url (${url}). Status code ${res.status} and status text ${res.statusText}`);
    } else {
        let error;
        try {
            fileContent = await plebbit.ipfsClient.cat(cid, catOptions); // Limit is 1mb files
        } catch (e) {
            error = e;
        }
        if (typeof fileContent !== "string") throw Error(`Was not able to load file with CID (${cid}) due to error: ${error}`);
    }

    const generatedCid: string = await Hash.of(fileContent);
    if (fileContent.length === DOWNLOAD_LIMIT_BYTES && generatedCid !== cid)
        throwWithErrorCode(
            "ERR_OVER_DOWNLOAD_LIMIT",
            `fetchCid: CID (${cid}) points to a file larger than download limit ${DOWNLOAD_LIMIT_BYTES}`
        );
    if (generatedCid !== cid)
        throwWithErrorCode(
            "ERR_GENERATED_CID_DOES_NOT_MATCH",
            `fetchCid: Loaded file generates a different CID (${generatedCid}) than provided CID (${cid})`
        );
    return fileContent;
}

export async function loadIpfsFileAsJson(cid: string, plebbit: Plebbit) {
    return JSON.parse(await fetchCid(cid, plebbit));
}

export async function loadIpnsAsJson(ipns: string, plebbit: Plebbit) {
    if (typeof ipns !== "string") throwWithErrorCode("ERR_IPNS_IS_INVALID", `loadIpnsAsJson: ipns (${ipns}) is undefined`);
    if (!plebbit.ipfsClient) {
        const url = `${plebbit.ipfsGatewayUrl}/ipns/${ipns}`;
        const [resText, res] = await fetchWithLimit(url, {
            headers: plebbit.ipfsHttpClientOptions?.headers,
            cache: "no-store",
            size: DOWNLOAD_LIMIT_BYTES
        });
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
    assert(typeof comment.downvoteCount === "number" && typeof comment.upvoteCount === "number");

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

// TODO rename
export function removeKeysWithUndefinedValues<T extends Object>(object: T): OnlyDefinedProperties<T> {
    const newObj = JSON.parse(JSON.stringify(object));
    for (const prop in newObj)
        if (newObj[prop]?.constructor?.name === "Object" && JSON.stringify(newObj[prop]) === "{}") delete newObj[prop];

    return newObj;
}

export function throwWithErrorCode(code: keyof typeof messages, details?: string) {
    throw errcode(Error(messages[code]), messages[messages[code]], {
        details
    });
}

export async function parsePageIpfs(pageIpfs: PageIpfs, plebbit: Plebbit): Promise<PageType> {
    const finalComments = await Promise.all(pageIpfs.comments.map((commentObj) => plebbit.createComment(commentObj.comment)));
    pageIpfs.comments.forEach((obj, i) => finalComments[i]._initCommentUpdate(obj.commentUpdate));

    return { comments: finalComments, nextCid: pageIpfs.nextCid };
}

export async function parsePagesIfIpfs(pagesRaw: PagesType | PagesTypeIpfs, plebbit: Plebbit): Promise<PagesType | undefined> {
    if (!pagesRaw) return undefined;
    let isIpfs: boolean = false;
    const pages: PageType[] | PageIpfs[] = Object.values(pagesRaw.pages);

    for (const page of pages) {
        if (page.comments["commentUpdate"]) {
            isIpfs = true;
            break;
        }
    }
    if (isIpfs) {
        pagesRaw = pagesRaw as PagesTypeIpfs;
        const parsedPages = await Promise.all(Object.keys(pagesRaw).map((key) => parsePageIpfs(pagesRaw.pages[key], plebbit)));
        const pagesType: PagesType["pages"] = Object.fromEntries(Object.keys(pagesRaw.pages).map((key, i) => [key, parsedPages[i]]));
        return { pages: pagesType, pageCids: pagesRaw.pageCids };
    } else return <PagesType>pagesRaw;
}

const isJsonString = (jsonString: any) => {
    return typeof jsonString === "string" && /"((?:[^"\\\/\b\f\n\r\t]|\\u\d{4})*)"/gm.test(jsonString);
};

export const parseJsonStrings = (obj: any) => {
    if (obj === "[object Object]") throw Error(`Object shouldn't be [object Object]`);
    if (Array.isArray(obj)) return obj.map((o) => parseJsonStrings(o));
    if (!isJsonString(obj) && typeof obj !== "object") return obj;

    const newObj = isJsonString(obj) ? JSON.parse(obj) : lodash.cloneDeep(obj);
    const booleanFields = ["deleted", "spoiler", "pinned", "locked", "removed"];
    for (const [key, value] of Object.entries(newObj)) {
        if (value === "[object Object]") throw Error(`key (${key}) shouldn't be [object Object]`);

        if (booleanFields.includes(key) && typeof value === "number") newObj[key] = Boolean(value);
        else if (isJsonString(value)) newObj[key] = JSON.parse(<any>value);
        if (newObj[key]?.constructor?.name === "Object") newObj[key] = parseJsonStrings(newObj[key]);
    }
    return <any>newObj;
};
