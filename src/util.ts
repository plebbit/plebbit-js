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
    EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor,
    EncodedDecryptedChallengeVerificationMessageType,
    EncodedDecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor,
    OnlyDefinedProperties,
    PageIpfs,
    PagesInstanceType,
    PagesTypeIpfs,
    PagesTypeJson,
    PageInstanceType,
    PostSort,
    ReplySort,
    Timeframe,
    RepliesPagesTypeIpfs,
    PostsPagesTypeIpfs,
    PostSortName,
    ReplySortName
} from "./types.js";
import { messages } from "./errors.js";
import lodash from "lodash";
import assert from "assert";
import { BasePages } from "./pages.js";
import { PlebbitError } from "./plebbit-error.js";
import { Plebbit } from "./plebbit.js";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { SubplebbitIpfsType } from "./subplebbit/types.js";
//@ts-expect-error
import extName from "ext-name";
import { CID } from "kubo-rpc-client";
import * as Digest from "multiformats/hashes/digest";
import { base58btc } from "multiformats/bases/base58";
import * as remeda from "remeda";

//This is temp. TODO replace this with accurate mapping
export const TIMEFRAMES_TO_SECONDS: Record<Timeframe, number> = Object.freeze({
    HOUR: 60 * 60,
    DAY: 60 * 60 * 24,
    WEEK: 60 * 60 * 24 * 7,
    MONTH: 60 * 60 * 24 * 7 * 4,
    YEAR: 60 * 60 * 24 * 7 * 4 * 12,
    ALL: Infinity
});

export const POSTS_SORT_TYPES: PostSort = {
    hot: { score: (...args) => hotScore(...args) },
    new: { score: (...args) => newScore(...args) },
    active: {
        score: (...args) => {
            throw Error("Active sort has no scoring");
        }
    },
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

export const REPLIES_SORT_TYPES: ReplySort = {
    ...lodash.pick(POSTS_SORT_TYPES, ["topAll", "new", "controversialAll"]),
    old: { score: (...args) => oldScore(...args) }
};

export function timestamp() {
    return Math.round(Date.now() / 1000);
}

export function replaceXWithY(obj: Record<string, any>, x: any, y: any): any {
    // obj is a JS object
    if (!remeda.isPlainObject(obj)) return obj;
    const newObj: Record<string, any> = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (obj[key] === x) newObj[key] = y;
        // `typeof`` gives browser transpiling error "Uncaught ReferenceError: exports is not defined"
        // don't know why but it can be fixed by replacing with `instanceof`
        // else if (typeof value === "object" && value !== null) newObj[key] = replaceXWithY(value, x, y);
        else if (remeda.isPlainObject(value)) newObj[key] = replaceXWithY(value, x, y);
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

export function removeNullAndUndefinedValues<T extends Object>(obj: T) {
    return remeda.omitBy(obj, remeda.isNil);
}

export function removeNullAndUndefinedValuesRecursively<T>(obj: any): T {
    if (Array.isArray(obj)) return <T>obj.map(removeNullAndUndefinedValuesRecursively);
    if (!remeda.isPlainObject(obj)) return obj;
    const cleanedObj: any = removeNullAndUndefinedValues(obj);
    for (const [key, value] of Object.entries(cleanedObj))
        if (remeda.isPlainObject(value) || Array.isArray(value)) cleanedObj[key] = removeNullAndUndefinedValuesRecursively(value);

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

const parseIfJsonString = (jsonString: any) => {
    if (typeof jsonString !== "string" || (!jsonString.startsWith("{") && !jsonString.startsWith("["))) return undefined;
    try {
        return JSON.parse(jsonString);
    } catch {
        return undefined;
    }
};

// Only for DB
export const parseDbResponses = (obj: any): any => {
    // This function is gonna be called for every query on db, it should be optimized
    if (obj === "[object Object]") throw Error(`Object shouldn't be [object Object]`);
    if (Array.isArray(obj)) return obj.map((o) => parseDbResponses(o));
    const parsedJsonString = parseIfJsonString(obj);
    if (!lodash.isPlainObject(obj) && !parsedJsonString) return obj;

    const newObj = removeNullAndUndefinedValues(parsedJsonString || lodash.cloneDeep(obj)); // not sure why we need clone here
    const booleanFields = [
        "deleted",
        "spoiler",
        "pinned",
        "locked",
        "removed",
        "commentUpdate_deleted",
        "commentUpdate_spoiler",
        "commentUpdate_pinned",
        "commentUpdate_locked",
        "commentUpdate_removed",
        "isAuthorEdit"
    ];
    for (const [key, value] of Object.entries(newObj)) {
        if (value === "[object Object]") throw Error(`key (${key}) shouldn't be [object Object]`);

        if (booleanFields.includes(key) && (value === 1 || value === 0)) newObj[key] = Boolean(value);
        else newObj[key] = parseIfJsonString(value) || value;
    }
    return <any>newObj;
};

export async function parsePageIpfs(pageIpfs: PageIpfs, plebbit: Plebbit): Promise<PageInstanceType> {
    const finalComments = await Promise.all(pageIpfs.comments.map((commentObj) => plebbit.createComment(commentObj.comment)));
    await Promise.all(finalComments.map((comment, i) => comment._initCommentUpdate(pageIpfs.comments[i].update)));

    return { comments: finalComments, nextCid: pageIpfs.nextCid };
}

export async function parsePagesIpfs(pagesRaw: PagesTypeIpfs, plebbit: Plebbit): Promise<PagesInstanceType> {
    const keys = <(keyof (typeof pagesRaw)["pages"])[]>Object.keys(pagesRaw.pages);
    const parsedPages = await Promise.all(Object.values(pagesRaw.pages).map((pageIpfs) => parsePageIpfs(pageIpfs, plebbit)));
    const pagesType = Object.fromEntries(keys.map((key, i) => [key, parsedPages[i]]));
    return { pages: pagesType, pageCids: pagesRaw.pageCids };
}

// To use for both subplebbit.posts and comment.replies

export async function parseRawPages(
    replies: PagesTypeIpfs | PagesTypeJson | BasePages | undefined,
    plebbit: Plebbit
): Promise<Pick<BasePages, "pages"> & { pagesIpfs: RepliesPagesTypeIpfs | PostsPagesTypeIpfs | undefined }> {
    if (!replies)
        return {
            pages: {},
            pagesIpfs: undefined
        };

    // if (remeda.isEmpty(replies.pages)) return { pages: {}, pagesIpfs: undefined }; // not sure why it's needed

    const isIpfs = Boolean(Object.values(replies.pages)[0]?.comments[0]["update"]);

    if (isIpfs) {
        replies = replies as PagesTypeIpfs;
        const parsedPages = await parsePagesIpfs(replies, plebbit);
        return {
            pages: parsedPages.pages,
            pagesIpfs: replies
        };
    } else if (replies instanceof BasePages)
        return { pages: replies.pages, pagesIpfs: replies.toJSONIpfs() }; // already parsed
    else {
        replies = replies as PagesTypeJson;
        const pagesWithCommentInstancesEntries = await Promise.all(
            remeda.entries.strict(replies.pages).map(async ([pageKey, pageJson]) => {
                const comments = await Promise.all(
                    pageJson.comments.map((commentJson) => plebbit.createComment.bind(plebbit)(commentJson))
                );
                return remeda.entries.strict({ [pageKey]: { comments, nextCid: pageJson.nextCid } })[0];
            })
        );

        const pagesWithCommentInstances = remeda.fromEntries.strict(pagesWithCommentInstancesEntries);

        return {
            pages: pagesWithCommentInstances,
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

export function firstResolve<T>(promises: Promise<T>[]) {
    return new Promise<T>((resolve) => promises.forEach((promise) => promise.then(resolve)));
}

export function getErrorCodeFromMessage(message: string): keyof typeof messages {
    const codes = <(keyof typeof messages)[]>Object.keys(messages);
    for (const code of codes) if (messages[code] === message) return code;
    throw Error(`No error code was found for message (${message})`);
}

export function doesDomainAddressHaveCapitalLetter(domainAddress: string) {
    if (!domainAddress.includes(".")) return false;
    return /[A-Z]/.test(domainAddress); // Regex test for capital letters in English only
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
    let parsedPubsubMsg:
        | DecryptedChallengeMessageType
        | DecryptedChallengeAnswerMessageType
        | DecryptedChallengeRequestMessageType
        | DecryptedChallengeVerificationMessageType
        | DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor
        | DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor = pubsubMsg;
    parsedPubsubMsg.challengeRequestId = uint8ArrayFromString(pubsubMsg.challengeRequestId, "base58btc");
    if (pubsubMsg.encrypted) {
        parsedPubsubMsg.encrypted!.tag = uint8ArrayFromString(pubsubMsg.encrypted.tag, "base64");
        parsedPubsubMsg.encrypted!.iv = uint8ArrayFromString(pubsubMsg.encrypted.iv, "base64");
        parsedPubsubMsg.encrypted!.ciphertext = uint8ArrayFromString(pubsubMsg.encrypted.ciphertext, "base64");
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

export function isLinkValid(link: string): boolean {
    try {
        const url = new URL(link);
        if (url.protocol !== "https:") throw Error("Not a valid https url");
        return true;
    } catch (e) {
        return false;
    }
}

export function isLinkOfMedia(link: string): boolean {
    if (!link) return false;
    let mime;
    try {
        mime = extName(new URL(link).pathname.toLowerCase().replace("/", ""))[0]?.mime;
    } catch (e) {
        return false;
    }
    if (mime?.startsWith("image") || mime?.startsWith("video") || mime?.startsWith("audio")) return true;
    return false;
}

export async function genToArray<T>(gen: AsyncIterable<T>): Promise<T[]> {
    const out: T[] = [];
    for await (const x of gen) {
        out.push(x);
    }
    return out;
}

export function isStringDomain(x: string | undefined) {
    return typeof x === "string" && x.includes(".");
}

export function isIpns(x: string) {
    // This function will test if a string is of IPNS address (12D)
    try {
        Digest.decode(base58btc.decode(`z${x}`));
        return true;
    } catch {
        return false;
    }
}

export function isIpfsCid(x: string) {
    try {
        return Boolean(CID.parse(x));
    } catch {
        return false;
    }
}

export function isIpfsPath(x: string): boolean {
    return x.startsWith("/ipfs/");
}
