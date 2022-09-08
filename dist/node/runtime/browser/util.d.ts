/// <reference types="node-fetch" />
import { NativeFunctions } from "../../types";
export declare const isRuntimeNode = false;
export declare let nativeFunctions: NativeFunctions;
export declare const setNativeFunctions: (pNativeFunctions: Partial<NativeFunctions>) => {
    listSubplebbits: (dataPath: string) => Promise<string[]>;
    getDefaultDataPath: () => string;
    createDbHandler: (subplebbit: import("../../types").SubplebbitType) => import("../../types").DbHandlerPublicAPI;
    fetch: typeof import("node-fetch").default;
    createIpfsClient: (options: import("ipfs-http-client/types/src/types").Options) => import("../../types").IpfsHttpClientPublicAPI;
};
declare const _default: {
    isRuntimeNode: boolean;
    setNativeFunctions: (pNativeFunctions: Partial<NativeFunctions>) => {
        listSubplebbits: (dataPath: string) => Promise<string[]>;
        getDefaultDataPath: () => string;
        createDbHandler: (subplebbit: import("../../types").SubplebbitType) => import("../../types").DbHandlerPublicAPI;
        fetch: typeof import("node-fetch").default;
        createIpfsClient: (options: import("ipfs-http-client/types/src/types").Options) => import("../../types").IpfsHttpClientPublicAPI;
    };
    nativeFunctions: NativeFunctions;
};
export default _default;
