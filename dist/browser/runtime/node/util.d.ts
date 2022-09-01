/// <reference types="node" />
import { promises as fs } from "fs";
export declare const getDefaultDataPath: () => string;
export declare const listSubplebbits: (dataPath: string) => Promise<string[]>;
export declare const mkdir: typeof fs.mkdir;
export declare const isRuntimeNode = true;
declare const _default: {
    getDefaultDataPath: () => string;
    listSubplebbits: (dataPath: string) => Promise<string[]>;
    isRuntimeNode: boolean;
};
export default _default;
