import { Plebbit } from "./plebbit";
import { CommentType, OnlyDefinedProperties, Timeframe } from "./types";
import { messages } from "./errors";
export declare const TIMEFRAMES_TO_SECONDS: Record<Timeframe, number>;
export declare function fetchCid(cid: string, plebbit: Plebbit, catOptions?: {
    length: number;
}): Promise<string>;
export declare function loadIpfsFileAsJson(cid: string, plebbit: Plebbit): Promise<any>;
export declare function loadIpnsAsJson(ipns: string, plebbit: Plebbit): Promise<any>;
export declare function timestamp(): number;
export declare function replaceXWithY(obj: Object, x: any, y: any): any;
export declare function hotScore(comment: CommentType): number;
export declare function controversialScore(comment: CommentType): number;
export declare function topScore(comment: CommentType): number;
export declare function newScore(comment: CommentType): number;
export declare function oldScore(comment: CommentType): number;
export declare function removeKeysWithUndefinedValues<T extends Object>(object: T): OnlyDefinedProperties<T>;
export declare function encode(obj: Object): string;
export declare function throwWithErrorCode(code: keyof typeof messages, details?: string): void;
