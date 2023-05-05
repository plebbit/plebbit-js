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
import { messages } from "./errors";
import lodash from "lodash";
import assert from "assert";
import { Pages } from "./pages";
import { PlebbitError } from "./plebbit-error";
import { ClientsManager } from "./client";

//This is temp. TODO replace this with accurate mapping
export const TIMEFRAMES_TO_SECONDS: Record<Timeframe, number> = Object.freeze({
    HOUR: 60 * 60,
    DAY: 60 * 60 * 24,
    WEEK: 60 * 60 * 24 * 7,
    MONTH: 60 * 60 * 24 * 7 * 4,
    YEAR: 60 * 60 * 24 * 7 * 4 * 12,
    ALL: Infinity
});

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
    subplebbit: Pages["_subplebbit"],
    clientManager: ClientsManager
): Promise<Pages> {
    if (!replies)
        return new Pages({
            pages: undefined,
            pageCids: undefined,
            subplebbit: subplebbit,
            pagesIpfs: undefined,
            parentCid: parentCid,
            clientManager
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
            parentCid: parentCid,
            clientManager
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
            parentCid: parentCid,
            clientManager
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
