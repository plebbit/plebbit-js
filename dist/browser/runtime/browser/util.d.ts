import type { KuboRpcClient, NativeFunctions } from "../../types.js";
export declare const getDefaultDataPath: () => undefined;
export declare const mkdir: () => never;
export declare const listSubplebbits: () => never;
export declare const monitorSubplebbitsDirectory: () => never;
export declare function importSignerIntoKuboNode(ipnsKeyName: string, ipfsKey: Uint8Array, ipfsNode: KuboRpcClient["_clientOptions"]): Promise<{
    id: string;
    name: string;
}>;
export declare function createKuboRpcClient(kuboRpcClientOptions: KuboRpcClient["_clientOptions"]): KuboRpcClient["_client"];
export declare const nativeFunctions: NativeFunctions;
export declare const setNativeFunctions: (newNativeFunctions: Partial<NativeFunctions>) => void;
