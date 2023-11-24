/// <reference types="node" />
import { promises as fs } from "fs";
import { NativeFunctions, PlebbitOptions } from "../../types";
import { Subplebbit } from "../../subplebbit/subplebbit";
import { Knex } from "knex";
import { Plebbit } from "../../plebbit";
export declare const mkdir: typeof fs.mkdir;
export declare const getDefaultDataPath: () => string;
export declare const getDefaultSubplebbitDbConfig: (subplebbit: Pick<Subplebbit, "address"> & {
    plebbit: Pick<PlebbitOptions, "dataPath" | "noData">;
}) => Promise<Knex.Config<any>>;
export declare function getThumbnailUrlOfLink(url: string, subplebbit: Subplebbit, proxyHttpUrl?: string): Promise<{
    thumbnailUrl: string;
    thumbnailWidth: number;
    thumbnailHeight: number;
} | undefined>;
export declare const nativeFunctions: NativeFunctions;
export declare const setNativeFunctions: (newNativeFunctions: Partial<NativeFunctions>) => void;
export declare const deleteOldSubplebbitInWindows: (subPath: string, plebbit: Pick<Plebbit, "_storage">) => Promise<void>;
declare const _default: {
    getDefaultDataPath: () => string;
    nativeFunctions: NativeFunctions;
    setNativeFunctions: (newNativeFunctions: Partial<NativeFunctions>) => void;
    mkdir: typeof fs.mkdir;
};
export default _default;
