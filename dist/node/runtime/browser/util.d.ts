import { IpfsClient, NativeFunctions } from "../../types.js";
export declare const getDefaultDataPath: () => undefined;
export declare const mkdir: () => never;
export declare const listSubplebbits: () => never;
export declare const monitorSubplebbitsDirectory: () => never;
export declare function importSignerIntoIpfsNode(ipnsKeyName: string, ipfsKey: Uint8Array, ipfsNode: IpfsClient["_clientOptions"]): Promise<{
    id: string;
    name: string;
}>;
export declare function createIpfsClient(ipfsHttpClientOptions: IpfsClient["_clientOptions"]): IpfsClient["_client"];
export declare const nativeFunctions: NativeFunctions;
export declare const setNativeFunctions: (newNativeFunctions: Partial<NativeFunctions>) => void;
