import Debug from "debug";
import { Plebbit } from "./plebbit";
import { CommentType, ProtocolVersion, Timeframe } from "./types";
export declare const TIMEFRAMES_TO_SECONDS: Record<Timeframe, number>;
export declare function loadIpfsFileAsJson(cid: string, plebbit: Plebbit, defaultOptions?: {
    timeout: number;
}): Promise<any>;
export declare function loadIpnsAsJson(ipns: string, plebbit: Plebbit): Promise<any>;
export declare function chunks<T>(arr: Array<T>, len: number): Array<Array<T>>;
export declare function round(number: number, decimalPlaces: number): number;
export declare function parseJsonIfString(x: any): any;
export declare function timestamp(): number;
export declare function keepKeys(obj: Object, keys: any[]): {};
export declare function removeKeys(object1: Object, keys: any[]): Object;
export declare function replaceXWithY(obj: Object, x: any, y: any): any;
export declare function shallowEqual(object1: any, object2: any, excludeKeys?: any[]): boolean;
export declare function waitTillPublicationsArePublished(publications: any): Promise<any[]>;
export declare function waitTillCommentsUpdate(comments: any, updateInterval: any): Promise<unknown>;
export declare function hotScore(comment: any): number;
export declare function controversialScore(comment: CommentType): number;
export declare function topScore(comment: CommentType): number;
export declare function newScore(comment: CommentType): number;
export declare function oldScore(comment: CommentType): number;
export declare function removeKeysWithUndefinedValues(object: any): any;
export declare function ipfsImportKey(signer: any, plebbit: any, password?: string): Promise<any>;
export declare function getDebugLevels(baseName: string): {
    FATAL: Debug;
    ERROR: Debug;
    WARN: Debug;
    INFO: Debug;
    DEBUG: Debug;
    TRACE: Debug;
};
export declare function isJsonObject(x: any): boolean;
export declare function randomElement<T>(array: Array<T>): T;
export declare function getProtocolVersion(): ProtocolVersion;
