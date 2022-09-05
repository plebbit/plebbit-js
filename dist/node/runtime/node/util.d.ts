/// <reference types="node" />
/// <reference types="node-fetch" />
import { promises as fs } from "fs";
import { NativeFunctions } from "../../types";
export declare const getDefaultDataPath: () => string;
export declare const mkdir: typeof fs.mkdir;
export declare const isRuntimeNode = true;
export declare let nativeFunctions: NativeFunctions;
export declare const setNativeFunctions: (pNativeFunctions: Partial<NativeFunctions>) => {
    listSubplebbits: (dataPath: string) => Promise<string[]>;
    createDbHandler: (subplebbit: import("../../types").SubplebbitType) => import("../../types").DbHandlerPublicAPI;
    fetch: typeof import("node-fetch").default;
    createIpfsClient: (options: import("ipfs-http-client/types/src/types").Options) => import("../../types").IpfsHttpClientPublicAPI;
};
declare const _default: {
    getDefaultDataPath: () => string;
    isRuntimeNode: boolean;
    nativeFunctions: NativeFunctions;
    setNativeFunctions: (pNativeFunctions: Partial<NativeFunctions>) => {
        listSubplebbits: (dataPath: string) => Promise<string[]>;
        createDbHandler: (subplebbit: import("../../types").SubplebbitType) => import("../../types").DbHandlerPublicAPI;
        fetch: typeof import("node-fetch").default;
        createIpfsClient: (options: import("ipfs-http-client/types/src/types").Options) => import("../../types").IpfsHttpClientPublicAPI;
    };
};
export default _default;
