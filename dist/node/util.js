import { messages } from "./errors.js";
import { PlebbitError } from "./plebbit-error.js";
//@ts-expect-error
import extName from "ext-name";
import { CID } from "kubo-rpc-client";
import * as Digest from "multiformats/hashes/digest";
import { Buffer } from "buffer";
import { base58btc } from "multiformats/bases/base58";
import * as remeda from "remeda";
import { DecryptedChallengeRequestPublicationSchema } from "./pubsub-messages/schema.js";
export function timestamp() {
    return Math.round(Date.now() / 1000);
}
export function replaceXWithY(obj, x, y) {
    // obj is a JS object
    if (!remeda.isPlainObject(obj))
        return obj;
    const newObj = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (obj[key] === x)
            newObj[key] = y;
        // `typeof`` gives browser transpiling error "Uncaught ReferenceError: exports is not defined"
        // don't know why but it can be fixed by replacing with `instanceof`
        // else if (typeof value === "object" && value !== null) newObj[key] = replaceXWithY(value, x, y);
        else if (remeda.isPlainObject(value))
            newObj[key] = replaceXWithY(value, x, y);
        else if (Array.isArray(value))
            newObj[key] = value.map((iterValue) => replaceXWithY(iterValue, x, y));
        else
            newObj[key] = value;
    });
    return newObj;
}
export function removeNullUndefinedValues(obj) {
    return remeda.pickBy(obj, remeda.isNonNullish);
}
function removeUndefinedValues(obj) {
    return remeda.pickBy(obj, remeda.isDefined.strict);
}
function removeNullUndefinedEmptyObjectValues(obj) {
    const firstStep = removeNullUndefinedValues(obj); // remove undefined and null values
    const secondStep = remeda.omitBy(firstStep, (value) => remeda.isPlainObject(value) && remeda.isEmpty(value)); // remove empty {} values
    return secondStep;
}
// A safe function that you can use that will not modify a JSON by removing null or empty objects
export function removeUndefinedValuesRecursively(obj) {
    if (Array.isArray(obj))
        return obj.map(removeUndefinedValuesRecursively);
    if (!remeda.isPlainObject(obj))
        return obj;
    const cleanedObj = removeUndefinedValues(obj);
    for (const [key, value] of Object.entries(cleanedObj))
        if (remeda.isPlainObject(value) || Array.isArray(value))
            cleanedObj[key] = removeUndefinedValuesRecursively(value);
    return cleanedObj;
}
export function removeNullUndefinedEmptyObjectsValuesRecursively(obj) {
    if (Array.isArray(obj))
        return obj.map(removeNullUndefinedEmptyObjectsValuesRecursively);
    if (!remeda.isPlainObject(obj))
        return obj;
    const cleanedObj = removeNullUndefinedEmptyObjectValues(obj);
    for (const key of Object.keys(cleanedObj)) {
        if (remeda.isPlainObject(cleanedObj[key]) || Array.isArray(cleanedObj[key]))
            cleanedObj[key] = removeNullUndefinedEmptyObjectsValuesRecursively(cleanedObj[key]);
        if (remeda.isPlainObject(cleanedObj[key]) && remeda.isEmpty(cleanedObj[key]))
            delete cleanedObj[key];
    }
    return cleanedObj;
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
    if (!remeda.isPlainObject(obj) && !parsedJsonString)
        return obj;
    const newObj = removeNullUndefinedValues(parsedJsonString || obj); // we may need clone here, not sure
    const booleanFields = [
        "deleted",
        "spoiler",
        "pinned",
        "locked",
        "removed",
        "nsfw",
        "commentIpfs_deleted",
        "commentIpfs_nsfw",
        "commentIpfs_spoiler",
        "commentIpfs_pinned",
        "commentIpfs_locked",
        "commentIpfs_removed",
        "commentUpdate_deleted",
        "commentUpdate_spoiler",
        "commentUpdate_pinned",
        "commentUpdate_locked",
        "commentUpdate_removed",
        "commentUpdate_nsfw",
        "isAuthorEdit"
    ]; // TODO use zod here
    for (const [key, value] of Object.entries(newObj)) {
        if (value === "[object Object]")
            throw Error(`key (${key}) shouldn't be [object Object]`);
        if (booleanFields.includes(key) && (value === 1 || value === 0))
            newObj[key] = Boolean(value);
        else
            newObj[key] = parseIfJsonString(value) || value;
    }
    if (newObj.extraProps)
        return { ...newObj, ...newObj.extraProps };
    else if (newObj["commentIpfs_extraProps"]) {
        // needed when creating pages
        const mappedExtraPropsOnCommentIpfs = remeda.mapKeys(newObj["commentIpfs_extraProps"], (key) => `commentIpfs_${String(key)}`);
        return { ...newObj, ...mappedExtraPropsOnCommentIpfs };
    }
    return newObj;
};
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
    const codes = remeda.keys.strict(messages);
    for (const code of codes)
        if (messages[code] === message)
            return code;
    throw Error(`No error code was found for message (${message})`);
}
export function doesDomainAddressHaveCapitalLetter(domainAddress) {
    if (!domainAddress.includes("."))
        return false;
    return /[A-Z]/.test(domainAddress); // Regex test for capital letters in English only
}
export function getPostUpdateTimestampRange(postUpdates, postTimestamp) {
    if (!postUpdates)
        throw Error("subplebbit has no post updates");
    if (!postTimestamp)
        throw Error("post has no timestamp");
    return (remeda.keys
        .strict(postUpdates)
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
    return false;
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
export function parseIpfsRawOptionToIpfsOptions(ipfsRawOption) {
    if (!ipfsRawOption)
        throw Error("Need to define the ipfs options");
    if (typeof ipfsRawOption === "string" || ipfsRawOption instanceof URL) {
        const url = new URL(ipfsRawOption);
        const authorization = url.username && url.password ? "Basic " + Buffer.from(`${url.username}:${url.password}`).toString("base64") : undefined;
        return {
            url: authorization ? url.origin + url.pathname : ipfsRawOption.toString(),
            ...(authorization ? { headers: { authorization, origin: "http://localhost" } } : undefined)
        };
    }
    else if ("bytes" in ipfsRawOption)
        return { url: ipfsRawOption };
    else
        return ipfsRawOption;
}
export function hideClassPrivateProps(_this) {
    // make props that start with _ not enumerable
    for (const propertyName in _this) {
        if (propertyName.startsWith("_"))
            Object.defineProperty(_this, propertyName, { enumerable: false });
    }
}
export function derivePublicationFromChallengeRequest(request) {
    const publicationFieldNames = remeda.keys.strict(DecryptedChallengeRequestPublicationSchema.shape);
    for (const pubName of publicationFieldNames)
        if (request[pubName])
            return request[pubName];
    throw Error("Failed to find publication on ChallengeRequest");
}
export function isRequestPubsubPublicationOfReply(request) {
    return Boolean(request.comment && request.comment.parentCid);
}
export function isRequestPubsubPublicationOfPost(request) {
    return Boolean(request.comment && !request.comment.parentCid);
}
//# sourceMappingURL=util.js.map