import {
    CommentsTableRow,
    CommentUpdatesRow,
    DecryptedChallengeAnswerMessageType,
    DecryptedChallengeMessageType,
    DecryptedChallengeRequestMessageType,
    DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    DecryptedChallengeVerificationMessageType,
    DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor,
    EncodedDecryptedChallengeAnswerMessageType,
    EncodedDecryptedChallengeMessageType,
    EncodedDecryptedChallengeRequestMessageType,
    EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    EncodedDecryptedChallengeVerificationMessageType,
    EncodedDecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor,
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
import { BasePages } from "./pages";
import { PlebbitError } from "./plebbit-error";
import { Plebbit } from "./plebbit";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { SubplebbitIpfsType } from "./subplebbit/types";
import extName from "ext-name";
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
    if (!lodash.isPlainObject(obj)) return obj;
    const newObj = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (obj[key] === x) newObj[key] = y;
        // `typeof`` gives browser transpiling error "Uncaught ReferenceError: exports is not defined"
        // don't know why but it can be fixed by replacing with `instanceof`
        // else if (typeof value === "object" && value !== null) newObj[key] = replaceXWithY(value, x, y);
        else if (lodash.isPlainObject(value)) newObj[key] = replaceXWithY(value, x, y);
        else if (Array.isArray(value)) newObj[key] = value.map((iterValue) => replaceXWithY(iterValue, x, y));
        else newObj[key] = value;
    });
    return newObj;
}

export function hotScore(comment: { comment: CommentsTableRow; update: CommentUpdatesRow }) {
    assert(
        typeof comment.update.downvoteCount === "number" &&
            typeof comment.update.upvoteCount === "number" &&
            typeof comment.comment.timestamp === "number"
    );

    let score = comment.update.upvoteCount - comment.update.downvoteCount;
    score++; // reddit initial upvotes is 1, plebbit is 0
    const order = Math.log10(Math.max(Math.abs(score), 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = comment.comment.timestamp - 1134028003;
    return lodash.round(sign * order + seconds / 45000, 7);
}

export function controversialScore(comment: { comment: CommentsTableRow; update: CommentUpdatesRow }) {
    assert(typeof comment.update.downvoteCount === "number" && typeof comment.update.upvoteCount === "number");

    const upvoteCount = comment.update.upvoteCount + 1; // reddit initial upvotes is 1, plebbit is 0
    if (comment.update.downvoteCount <= 0 || upvoteCount <= 0) return 0;
    const magnitude = upvoteCount + comment.update.downvoteCount;
    const balance =
        upvoteCount > comment.update.downvoteCount
            ? comment.update.downvoteCount / upvoteCount
            : upvoteCount / comment.update.downvoteCount;
    return Math.pow(magnitude, balance);
}

export function topScore(comment: { comment: CommentsTableRow; update: CommentUpdatesRow }) {
    assert(typeof comment.update.downvoteCount === "number" && typeof comment.update.upvoteCount === "number");

    return comment.update.upvoteCount - comment.update.downvoteCount;
}

export function newScore(comment: { comment: CommentsTableRow; update: CommentUpdatesRow }) {
    assert(typeof comment.comment.timestamp === "number");
    return comment.comment.timestamp;
}

export function oldScore(comment: { comment: CommentsTableRow; update: CommentUpdatesRow }) {
    assert(typeof comment.comment.timestamp === "number");

    return -comment.comment.timestamp;
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
    const newObj = lodash.cloneDeep(object);
    for (const prop in newObj)
        if (newObj[prop]?.constructor?.name === "Object" && JSON.stringify(newObj[prop]) === "{}") delete newObj[prop];

    return newObj;
}

export function throwWithErrorCode(code: keyof typeof messages, details?: {}) {
    throw new PlebbitError(code, details);
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
        else if (isJsonString(value)) newObj[key] = JSON.parse(<any>value);
        if (lodash.isPlainObject(newObj[key])) newObj[key] = removeNullAndUndefinedValues(parseJsonStrings(newObj[key]));
    }
    return <any>newObj;
};

export async function parsePageIpfs(pageIpfs: PageIpfs, plebbit: Plebbit): Promise<PageType> {
    const finalComments = await Promise.all(pageIpfs.comments.map((commentObj) => plebbit.createComment(commentObj.comment)));
    await Promise.all(finalComments.map((comment, i) => comment._initCommentUpdate(pageIpfs.comments[i].update)));

    return { comments: finalComments, nextCid: pageIpfs.nextCid };
}

export async function parsePagesIpfs(pagesRaw: PagesTypeIpfs, plebbit: Plebbit): Promise<PagesType> {
    const parsedPages = await Promise.all(Object.keys(pagesRaw.pages).map((key) => parsePageIpfs(pagesRaw.pages[key], plebbit)));
    const pagesType: PagesType["pages"] = Object.fromEntries(Object.keys(pagesRaw.pages).map((key, i) => [key, parsedPages[i]]));
    return { pages: pagesType, pageCids: pagesRaw.pageCids };
}

// To use for both subplebbit.posts and comment.replies

export async function parseRawPages(replies: PagesTypeIpfs | PagesTypeJson | BasePages | undefined, plebbit: Plebbit) {
    if (!replies)
        return {
            pages: undefined,
            pagesIpfs: undefined
        };

    if (replies instanceof BasePages) return replies;

    if (!replies.pages) return { pages: undefined, pagesIpfs: undefined };

    const isIpfs = Boolean(Object.values(replies.pages)[0]?.comments[0]["update"]);

    if (isIpfs) {
        replies = replies as PagesTypeIpfs;
        const parsedPages = await parsePagesIpfs(replies, plebbit);
        return {
            pages: parsedPages.pages,
            pagesIpfs: replies.pages
        };
    } else {
        replies = replies as PagesTypeJson;
        const repliesClone = lodash.cloneDeep(replies) as PagesType;
        //@ts-expect-error
        const pageKeys: (keyof PagesType["pages"])[] = Object.keys(repliesClone.pages);
        for (const key of pageKeys)
            repliesClone.pages[key].comments = await Promise.all(
                replies.pages[key].comments.map((comment) => plebbit.createComment.bind(plebbit)(comment))
            );

        return {
            pages: repliesClone.pages,
            pagesIpfs: undefined
        };
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

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function firstResolve(promises: Promise<any>[]) {
    return new Promise<any>((resolve) => promises.forEach((promise) => promise.then(resolve)));
}

export function getErrorCodeFromMessage(message: string): keyof typeof messages {
    for (const code of Object.keys(messages)) if (messages[code] === message) return <keyof typeof messages>code;
    throw Error(`No error code was found for message (${message})`);
}

export function doesEnsAddressHaveCapitalLetter(ensAddress: string) {
    if (!ensAddress.endsWith(".eth")) return false;
    return /[A-Z]/.test(ensAddress); // Regex test for capital letters in English only
}

export function decodePubsubMsgFromRpc(
    pubsubMsg:
        | EncodedDecryptedChallengeMessageType
        | EncodedDecryptedChallengeAnswerMessageType
        | EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
        | EncodedDecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor
        | EncodedDecryptedChallengeVerificationMessageType
) {
    //@ts-expect-error
    const parsedPubsubMsg:
        | DecryptedChallengeMessageType
        | DecryptedChallengeAnswerMessageType
        | DecryptedChallengeRequestMessageType
        | DecryptedChallengeVerificationMessageType
        | DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
        | DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor = pubsubMsg;
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

export function getPostUpdateTimestampRange(postUpdates: SubplebbitIpfsType["postUpdates"], postTimestamp: number) {
    if (!postUpdates) throw Error("subplebbit has no post updates");
    if (!postTimestamp) throw Error("post has no timestamp");
    return (
        Object.keys(postUpdates)
            // sort from smallest to biggest
            .sort((a, b) => Number(a) - Number(b))
            // find the smallest timestamp range where comment.timestamp is newer
            .filter((timestampRange) => timestamp() - Number(timestampRange) <= postTimestamp)
    );
}

export function isLinkValid(link: string) {
    try {
        const url = new URL(link);
        if (url.protocol !== "https:") throw Error("Not a valid https url");
        return true;
    } catch (e) {
        return false;
    }
}

export function isLinkOfMedia(link: string) {
    if (!link) return false;
    let mime;
    try {
        mime = extName(new URL(link).pathname.toLowerCase().replace("/", ""))[0]?.mime;
    } catch (e) {
        return false;
    }
    if (mime?.startsWith("image") || mime?.startsWith("video") || mime?.startsWith("audio")) return true;
}

export async function genToArray<T>(gen: AsyncIterable<T>): Promise<T[]> {
    const out: T[] = [];
    for await (const x of gen) {
        out.push(x);
    }
    return out;
}
