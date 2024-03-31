import { messages } from "./errors.js";
import lodash from "lodash";
import assert from "assert";
import { BasePages } from "./pages.js";
import { PlebbitError } from "./plebbit-error.js";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import extName from "ext-name";
import { CID } from "kubo-rpc-client";
import * as Digest from "multiformats/hashes/digest";
import { base58btc } from "multiformats/bases/base58";
//This is temp. TODO replace this with accurate mapping
export const TIMEFRAMES_TO_SECONDS = Object.freeze({
    HOUR: 60 * 60,
    DAY: 60 * 60 * 24,
    WEEK: 60 * 60 * 24 * 7,
    MONTH: 60 * 60 * 24 * 7 * 4,
    YEAR: 60 * 60 * 24 * 7 * 4 * 12,
    ALL: Infinity
});
export const POSTS_SORT_TYPES = {
    hot: { score: (...args) => hotScore(...args) },
    new: { score: (...args) => newScore(...args) },
    active: { score: (...args) => undefined },
    topHour: { timeframe: "HOUR", score: (...args) => topScore(...args) },
    topDay: { timeframe: "DAY", score: (...args) => topScore(...args) },
    topWeek: { timeframe: "WEEK", score: (...args) => topScore(...args) },
    topMonth: { timeframe: "MONTH", score: (...args) => topScore(...args) },
    topYear: { timeframe: "YEAR", score: (...args) => topScore(...args) },
    topAll: { timeframe: "ALL", score: (...args) => topScore(...args) },
    controversialHour: { timeframe: "HOUR", score: (...args) => controversialScore(...args) },
    controversialDay: { timeframe: "DAY", score: (...args) => controversialScore(...args) },
    controversialWeek: { timeframe: "WEEK", score: (...args) => controversialScore(...args) },
    controversialMonth: { timeframe: "MONTH", score: (...args) => controversialScore(...args) },
    controversialYear: { timeframe: "YEAR", score: (...args) => controversialScore(...args) },
    controversialAll: { timeframe: "ALL", score: (...args) => controversialScore(...args) }
};
export const REPLIES_SORT_TYPES = {
    ...lodash.pick(POSTS_SORT_TYPES, ["topAll", "new", "controversialAll"]),
    old: { score: (...args) => oldScore(...args) }
};
export function timestamp() {
    return Math.round(Date.now() / 1000);
}
export function replaceXWithY(obj, x, y) {
    // obj is a JS object
    if (!lodash.isPlainObject(obj))
        return obj;
    const newObj = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (obj[key] === x)
            newObj[key] = y;
        // `typeof`` gives browser transpiling error "Uncaught ReferenceError: exports is not defined"
        // don't know why but it can be fixed by replacing with `instanceof`
        // else if (typeof value === "object" && value !== null) newObj[key] = replaceXWithY(value, x, y);
        else if (lodash.isPlainObject(value))
            newObj[key] = replaceXWithY(value, x, y);
        else if (Array.isArray(value))
            newObj[key] = value.map((iterValue) => replaceXWithY(iterValue, x, y));
        else
            newObj[key] = value;
    });
    return newObj;
}
export function hotScore(comment) {
    assert(typeof comment.update.downvoteCount === "number" &&
        typeof comment.update.upvoteCount === "number" &&
        typeof comment.comment.timestamp === "number");
    let score = comment.update.upvoteCount - comment.update.downvoteCount;
    score++; // reddit initial upvotes is 1, plebbit is 0
    const order = Math.log10(Math.max(Math.abs(score), 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = comment.comment.timestamp - 1134028003;
    return lodash.round(sign * order + seconds / 45000, 7);
}
export function controversialScore(comment) {
    assert(typeof comment.update.downvoteCount === "number" && typeof comment.update.upvoteCount === "number");
    const upvoteCount = comment.update.upvoteCount + 1; // reddit initial upvotes is 1, plebbit is 0
    if (comment.update.downvoteCount <= 0 || upvoteCount <= 0)
        return 0;
    const magnitude = upvoteCount + comment.update.downvoteCount;
    const balance = upvoteCount > comment.update.downvoteCount
        ? comment.update.downvoteCount / upvoteCount
        : upvoteCount / comment.update.downvoteCount;
    return Math.pow(magnitude, balance);
}
export function topScore(comment) {
    assert(typeof comment.update.downvoteCount === "number" && typeof comment.update.upvoteCount === "number");
    return comment.update.upvoteCount - comment.update.downvoteCount;
}
export function newScore(comment) {
    assert(typeof comment.comment.timestamp === "number");
    return comment.comment.timestamp;
}
export function oldScore(comment) {
    assert(typeof comment.comment.timestamp === "number");
    return -comment.comment.timestamp;
}
function removeNullUndefinedValues(obj) {
    return lodash.omitBy(obj, lodash.isNil);
}
function removeNullUndefinedEmptyObjectValues(obj) {
    const firstStep = removeNullUndefinedValues(obj); // remove undefined and null values
    const secondStep = lodash.omitBy(firstStep, (value) => lodash.isPlainObject(value) && lodash.isEmpty(value)); // remove empty {} values
    return secondStep;
}
export function removeNullUndefinedEmptyObjectsValuesRecursively(obj) {
    if (Array.isArray(obj))
        return obj.map(removeNullUndefinedEmptyObjectsValuesRecursively);
    if (!lodash.isPlainObject(obj))
        return obj;
    const cleanedObj = removeNullUndefinedEmptyObjectValues(obj);
    for (const [key, value] of Object.entries(cleanedObj))
        if (lodash.isPlainObject(value) || Array.isArray(value))
            cleanedObj[key] = removeNullUndefinedEmptyObjectsValuesRecursively(value);
    return cleanedObj;
}
// TODO rename
export function removeKeysWithUndefinedValues(object) {
    const newObj = lodash.cloneDeep(object);
    for (const prop in newObj)
        if (newObj[prop]?.constructor?.name === "Object" && JSON.stringify(newObj[prop]) === "{}")
            delete newObj[prop];
    return newObj;
}
export function throwWithErrorCode(code, details) {
    throw new PlebbitError(code, details);
}
const parseIfJsonString = (jsonString) => {
    if (typeof jsonString !== "string" || (!jsonString.startsWith("{") && !jsonString.startsWith("[")))
        return undefined;
    try {
        return JSON.parse(jsonString);
    }
    catch {
        return undefined;
    }
};
// Only for DB
export const parseDbResponses = (obj) => {
    // This function is gonna be called for every query on db, it should be optimized
    if (obj === "[object Object]")
        throw Error(`Object shouldn't be [object Object]`);
    if (Array.isArray(obj))
        return obj.map((o) => parseDbResponses(o));
    const parsedJsonString = parseIfJsonString(obj);
    if (!lodash.isPlainObject(obj) && !parsedJsonString)
        return obj;
    const newObj = removeNullUndefinedValues(parsedJsonString || lodash.cloneDeep(obj)); // not sure why we need clone here
    //prettier-ignore
    const booleanFields = ["deleted", "spoiler", "pinned", "locked", "removed", "commentUpdate_deleted", "commentUpdate_spoiler", "commentUpdate_pinned", "commentUpdate_locked", "commentUpdate_removed", "isAuthorEdit"];
    for (const [key, value] of Object.entries(newObj)) {
        if (value === "[object Object]")
            throw Error(`key (${key}) shouldn't be [object Object]`);
        if (booleanFields.includes(key) && (value === 1 || value === 0))
            newObj[key] = Boolean(value);
        else
            newObj[key] = parseIfJsonString(value) || value;
    }
    return newObj;
};
export async function parsePageIpfs(pageIpfs, plebbit) {
    const finalComments = await Promise.all(pageIpfs.comments.map((commentObj) => plebbit.createComment(commentObj.comment)));
    await Promise.all(finalComments.map((comment, i) => comment._initCommentUpdate(pageIpfs.comments[i].update)));
    return { comments: finalComments, nextCid: pageIpfs.nextCid };
}
export async function parsePagesIpfs(pagesRaw, plebbit) {
    const parsedPages = await Promise.all(Object.keys(pagesRaw.pages).map((key) => parsePageIpfs(pagesRaw.pages[key], plebbit)));
    const pagesType = Object.fromEntries(Object.keys(pagesRaw.pages).map((key, i) => [key, parsedPages[i]]));
    return { pages: pagesType, pageCids: pagesRaw.pageCids };
}
// To use for both subplebbit.posts and comment.replies
export async function parseRawPages(replies, plebbit) {
    if (!replies)
        return {
            pages: undefined,
            pagesIpfs: undefined
        };
    if (replies instanceof BasePages)
        return replies;
    if (!replies.pages)
        return { pages: undefined, pagesIpfs: undefined };
    const isIpfs = Boolean(Object.values(replies.pages)[0]?.comments[0]["update"]);
    if (isIpfs) {
        replies = replies;
        const parsedPages = await parsePagesIpfs(replies, plebbit);
        return {
            pages: parsedPages.pages,
            pagesIpfs: replies.pages
        };
    }
    else {
        replies = replies;
        const repliesClone = lodash.cloneDeep(replies);
        //@ts-expect-error
        const pageKeys = Object.keys(repliesClone.pages);
        for (const key of pageKeys)
            repliesClone.pages[key].comments = await Promise.all(replies.pages[key].comments.map((comment) => plebbit.createComment.bind(plebbit)(comment)));
        return {
            pages: repliesClone.pages,
            pagesIpfs: undefined
        };
    }
}
export function shortifyAddress(address) {
    if (address.includes("."))
        return address; // If a domain then no need to shortify
    // Remove prefix (12D3KooW)
    const removedPrefix = address.slice(8);
    // Return first 12 characters
    const shortAddress = removedPrefix.slice(0, 12);
    return shortAddress;
}
export function shortifyCid(cid) {
    // Remove prefix (Qm)
    // Return first 12 characters
    return cid.slice(2).slice(0, 12);
}
export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export function firstResolve(promises) {
    return new Promise((resolve) => promises.forEach((promise) => promise.then(resolve)));
}
export function getErrorCodeFromMessage(message) {
    for (const code of Object.keys(messages))
        if (messages[code] === message)
            return code;
    throw Error(`No error code was found for message (${message})`);
}
export function doesDomainAddressHaveCapitalLetter(domainAddress) {
    if (!domainAddress.includes("."))
        return false;
    return /[A-Z]/.test(domainAddress); // Regex test for capital letters in English only
}
export function decodePubsubMsgFromRpc(pubsubMsg) {
    //@ts-expect-error
    const parsedPubsubMsg = pubsubMsg;
    parsedPubsubMsg.challengeRequestId = uint8ArrayFromString(pubsubMsg.challengeRequestId, "base58btc");
    if (pubsubMsg.encrypted) {
        parsedPubsubMsg.encrypted.tag = uint8ArrayFromString(pubsubMsg.encrypted.tag, "base64");
        parsedPubsubMsg.encrypted.iv = uint8ArrayFromString(pubsubMsg.encrypted.iv, "base64");
        parsedPubsubMsg.encrypted.ciphertext = uint8ArrayFromString(pubsubMsg.encrypted.ciphertext, "base64");
    }
    parsedPubsubMsg.signature.publicKey = uint8ArrayFromString(pubsubMsg.signature.publicKey, "base64");
    parsedPubsubMsg.signature.signature = uint8ArrayFromString(pubsubMsg.signature.signature, "base64");
    return parsedPubsubMsg;
}
export function getPostUpdateTimestampRange(postUpdates, postTimestamp) {
    if (!postUpdates)
        throw Error("subplebbit has no post updates");
    if (!postTimestamp)
        throw Error("post has no timestamp");
    return (Object.keys(postUpdates)
        // sort from smallest to biggest
        .sort((a, b) => Number(a) - Number(b))
        // find the smallest timestamp range where comment.timestamp is newer
        .filter((timestampRange) => timestamp() - Number(timestampRange) <= postTimestamp));
}
export function isLinkValid(link) {
    try {
        const url = new URL(link);
        if (url.protocol !== "https:")
            throw Error("Not a valid https url");
        return true;
    }
    catch (e) {
        return false;
    }
}
export function isLinkOfMedia(link) {
    if (!link)
        return false;
    let mime;
    try {
        mime = extName(new URL(link).pathname.toLowerCase().replace("/", ""))[0]?.mime;
    }
    catch (e) {
        return false;
    }
    if (mime?.startsWith("image") || mime?.startsWith("video") || mime?.startsWith("audio"))
        return true;
}
export async function genToArray(gen) {
    const out = [];
    for await (const x of gen) {
        out.push(x);
    }
    return out;
}
export function isStringDomain(x) {
    return typeof x === "string" && x.includes(".");
}
export function isIpns(x) {
    // This function will test if a string is of IPNS address (12D)
    try {
        Digest.decode(base58btc.decode(`z${x}`));
        return true;
    }
    catch {
        return false;
    }
}
export function isIpfsCid(x) {
    try {
        return Boolean(CID.parse(x));
    }
    catch {
        return false;
    }
}
export function isIpfsPath(x) {
    return x.startsWith("/ipfs/");
}
//# sourceMappingURL=util.js.map