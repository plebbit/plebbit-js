import { CommentsTableRow, CommentUpdatesRow, DecryptedChallengeAnswerMessageType, DecryptedChallengeMessageType, DecryptedChallengeRequestMessageType, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, DecryptedChallengeVerificationMessageType, DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor, EncodedDecryptedChallengeAnswerMessageType, EncodedDecryptedChallengeMessageType, EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, EncodedDecryptedChallengeVerificationMessageType, EncodedDecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor, OnlyDefinedProperties, PageIpfs, PagesType, PagesTypeIpfs, PagesTypeJson, PageType, PostSort, ReplySort, Timeframe } from "./types.js";
import { messages } from "./errors.js";
import { BasePages } from "./pages.js";
import { Plebbit } from "./plebbit.js";
import { SubplebbitIpfsType } from "./subplebbit/types.js";
export declare const TIMEFRAMES_TO_SECONDS: Record<Timeframe, number>;
export declare const POSTS_SORT_TYPES: PostSort;
export declare const REPLIES_SORT_TYPES: ReplySort;
export declare function timestamp(): number;
export declare function replaceXWithY(obj: Object, x: any, y: any): any;
export declare function hotScore(comment: {
    comment: CommentsTableRow;
    update: CommentUpdatesRow;
}): number;
export declare function controversialScore(comment: {
    comment: CommentsTableRow;
    update: CommentUpdatesRow;
}): number;
export declare function topScore(comment: {
    comment: CommentsTableRow;
    update: CommentUpdatesRow;
}): number;
export declare function newScore(comment: {
    comment: CommentsTableRow;
    update: CommentUpdatesRow;
}): number;
export declare function oldScore(comment: {
    comment: CommentsTableRow;
    update: CommentUpdatesRow;
}): number;
export declare function removeNullUndefinedEmptyObjectsValuesRecursively<T>(obj: T): T;
export declare function removeKeysWithUndefinedValues<T extends Object>(object: T): OnlyDefinedProperties<T>;
export declare function throwWithErrorCode(code: keyof typeof messages, details?: {}): void;
export declare const parseDbResponses: (obj: any) => any;
export declare function parsePageIpfs(pageIpfs: PageIpfs, plebbit: Plebbit): Promise<PageType>;
export declare function parsePagesIpfs(pagesRaw: PagesTypeIpfs, plebbit: Plebbit): Promise<PagesType>;
export declare function parseRawPages(replies: PagesTypeIpfs | PagesTypeJson | BasePages | undefined, plebbit: Plebbit): Promise<BasePages | {
    pages: Partial<Record<"hot" | "new" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "active" | "old", PageType>>;
    pagesIpfs: Partial<Record<"hot" | "new" | "topHour" | "topDay" | "topWeek" | "topMonth" | "topYear" | "topAll" | "controversialHour" | "controversialDay" | "controversialWeek" | "controversialMonth" | "controversialYear" | "controversialAll" | "active" | "old", PageIpfs>>;
}>;
export declare function shortifyAddress(address: string): string;
export declare function shortifyCid(cid: string): string;
export declare function delay(ms: number): Promise<void>;
export declare function firstResolve(promises: Promise<any>[]): Promise<any>;
export declare function getErrorCodeFromMessage(message: string): keyof typeof messages;
export declare function doesDomainAddressHaveCapitalLetter(domainAddress: string): boolean;
export declare function decodePubsubMsgFromRpc(pubsubMsg: EncodedDecryptedChallengeMessageType | EncodedDecryptedChallengeAnswerMessageType | EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor | EncodedDecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor | EncodedDecryptedChallengeVerificationMessageType): DecryptedChallengeMessageType | DecryptedChallengeRequestMessageType | DecryptedChallengeAnswerMessageType | DecryptedChallengeVerificationMessageType | DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor | DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor;
export declare function getPostUpdateTimestampRange(postUpdates: SubplebbitIpfsType["postUpdates"], postTimestamp: number): string[];
export declare function isLinkValid(link: string): boolean;
export declare function isLinkOfMedia(link: string): boolean;
export declare function genToArray<T>(gen: AsyncIterable<T>): Promise<T[]>;
export declare function isStringDomain(x: string | undefined): boolean;
export declare function isIpns(x: string): boolean;
export declare function isIpfsCid(x: string): boolean;
export declare function isIpfsPath(x: string): boolean;
