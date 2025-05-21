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
import pTimeout, { TimeoutError } from "p-timeout";
import { of as calculateIpfsCidV0Lib } from "typestub-ipfs-only-hash";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { sha256 } from "multiformats/hashes/sha2";
import { base32 } from "multiformats/bases/base32";
import retry from "retry";
import PeerId from "peer-id";
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
        "isAuthorEdit",
        "publishedToPostUpdatesIpfs"
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
export function parseIpfsRawOptionToIpfsOptions(kuboRpcRawOption) {
    if (!kuboRpcRawOption)
        throw Error("Need to define the ipfs options");
    if (typeof kuboRpcRawOption === "string" || kuboRpcRawOption instanceof URL) {
        const url = new URL(kuboRpcRawOption);
        const authorization = url.username && url.password ? "Basic " + Buffer.from(`${url.username}:${url.password}`).toString("base64") : undefined;
        return {
            url: authorization ? url.origin + url.pathname : kuboRpcRawOption.toString(),
            ...(authorization ? { headers: { authorization, origin: "http://localhost" } } : undefined)
        };
    }
    else if ("bytes" in kuboRpcRawOption)
        return { url: kuboRpcRawOption };
    else
        return kuboRpcRawOption;
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
export async function resolveWhenPredicateIsTrue(toUpdate, predicate, eventName = "update") {
    // should add a timeout?
    const listenerPromise = new Promise(async (resolve) => {
        const listener = async () => {
            try {
                const conditionStatus = await predicate();
                if (conditionStatus) {
                    resolve(conditionStatus);
                    toUpdate.removeListener(eventName, listener);
                }
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        };
        toUpdate.on(eventName, listener);
        await listener(); // make sure we're checking at least once
    });
    await listenerPromise;
}
export async function waitForUpdateInSubInstanceWithErrorAndTimeout(subplebbit, timeoutMs) {
    const wasUpdating = subplebbit.state === "updating";
    const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
    let updateError;
    const errorListener = (err) => (updateError = err);
    subplebbit.on("error", errorListener);
    try {
        await subplebbit.update();
        await pTimeout(Promise.race([updatePromise, new Promise((resolve) => subplebbit.once("error", resolve))]), {
            milliseconds: timeoutMs,
            message: updateError || new TimeoutError(`Subplebbit ${subplebbit.address} update timed out after ${timeoutMs}ms`)
        });
        if (updateError)
            throw updateError;
    }
    catch (e) {
        if (updateError)
            throw updateError;
        if (subplebbit._plebbit._updatingSubplebbits[subplebbit.address]?._clientsManager._ipnsLoadingOperation?.mainError())
            throw subplebbit._plebbit._updatingSubplebbits[subplebbit.address]._clientsManager._ipnsLoadingOperation.mainError();
        throw e;
    }
    finally {
        subplebbit.removeListener("error", errorListener);
        if (!wasUpdating)
            await subplebbit.stop();
    }
}
export function calculateIpfsCidV0(content) {
    return calculateIpfsCidV0Lib(content);
}
/**
 * converts a binary record key to a pubsub topic key
 */
export function binaryKeyToPubsubTopic(key) {
    const b64url = uint8ArrayToString(key, "base64url");
    return `/record/${b64url}`;
}
export function ipnsNameToIpnsOverPubsubTopic(ipnsName) {
    // for ipns over pubsub, the topic is '/record/' + Base64Url(Uint8Array('/ipns/') + Uint8Array('12D...'))
    // https://github.com/ipfs/helia/blob/1561e4a106074b94e421a77b0b8776b065e48bc5/packages/ipns/src/routing/pubsub.ts#L169
    const ipnsNamespaceBytes = new TextEncoder().encode("/ipns/");
    const ipnsNameBytes = PeerId.parse(ipnsName).toBytes(); // accepts base58 (12D...) and base36 (k51...)
    const ipnsNameBytesWithNamespace = new Uint8Array(ipnsNamespaceBytes.length + ipnsNameBytes.length);
    ipnsNameBytesWithNamespace.set(ipnsNamespaceBytes, 0);
    ipnsNameBytesWithNamespace.set(ipnsNameBytes, ipnsNamespaceBytes.length);
    const pubsubTopic = "/record/" + uint8ArrayToString(ipnsNameBytesWithNamespace, "base64url");
    return pubsubTopic;
}
export async function pubsubTopicToDhtKey(pubsubTopic) {
    // pubsub topic dht key used by kubo is a cid of "floodsub:topic" https://github.com/libp2p/go-libp2p-pubsub/blob/3aa9d671aec0f777a7f668ca2b2ceb37218fb6bb/discovery.go#L328
    const string = `floodsub:${pubsubTopic}`;
    // convert string to same cid as kubo https://github.com/libp2p/go-libp2p/blob/024293c77e17794b0dd9dacec3032b4c5a535f64/p2p/discovery/routing/routing.go#L70
    const bytes = new TextEncoder().encode(string);
    const hash = await sha256.digest(bytes);
    const cidVersion = 1;
    const multicodec = 0x55;
    const cid = CID.create(cidVersion, multicodec, hash);
    return cid.toString(base32);
}
export async function retryKuboIpfsAdd({ kuboRpcClient, log, content, inputNumOfRetries, options }) {
    const numOfRetries = inputNumOfRetries ?? 3;
    return new Promise((resolve, reject) => {
        const operation = retry.operation({
            retries: numOfRetries,
            factor: 2,
            minTimeout: 1000
        });
        operation.attempt(async (currentAttempt) => {
            try {
                const addRes = await kuboRpcClient.add(content, options);
                resolve(addRes);
            }
            catch (error) {
                log.error(`Failed attempt ${currentAttempt}/${numOfRetries + 1} to add content to IPFS:`, error);
                if (operation.retry(error))
                    return;
                reject(operation.mainError() || error);
            }
        });
    });
}
//# sourceMappingURL=util.js.map