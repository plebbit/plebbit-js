import { CommentsTableRow, CommentUpdatesRow, DecryptedChallengeAnswerMessageType, DecryptedChallengeMessageType, DecryptedChallengeRequestMessageType, DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, DecryptedChallengeVerificationMessageType, DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor, EncodedDecryptedChallengeAnswerMessageType, EncodedDecryptedChallengeMessageType, EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor, EncodedDecryptedChallengeVerificationMessageType, EncodedDecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor, OnlyDefinedProperties, PageIpfs, PagesType, PagesTypeIpfs, PagesTypeJson, PageType, Timeframe } from "./types";
import { messages } from "./errors";
import { BasePages } from "./pages";
import { Plebbit } from "./plebbit";
export declare const TIMEFRAMES_TO_SECONDS: Record<Timeframe, number>;
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
export declare function removeNullAndUndefinedValues<T extends Object>(obj: T): T;
export declare function removeNullAndUndefinedValuesRecursively<T>(obj: T): T;
export declare function removeKeysWithUndefinedValues<T extends Object>(object: T): OnlyDefinedProperties<T>;
export declare function throwWithErrorCode(code: keyof typeof messages, details?: {}): void;
export declare const parseJsonStrings: (obj: any) => any;
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
export declare function doesEnsAddressHaveCapitalLetter(ensAddress: string): boolean;
export declare function decodePubsubMsgFromRpc(pubsubMsg: EncodedDecryptedChallengeMessageType | EncodedDecryptedChallengeAnswerMessageType | EncodedDecryptedChallengeRequestMessageTypeWithSubplebbitAuthor | EncodedDecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor | EncodedDecryptedChallengeVerificationMessageType): DecryptedChallengeRequestMessageType | DecryptedChallengeAnswerMessageType | DecryptedChallengeVerificationMessageType | DecryptedChallengeMessageType | DecryptedChallengeRequestMessageTypeWithSubplebbitAuthor | DecryptedChallengeVerificationMessageTypeWithSubplebbitAuthor;
