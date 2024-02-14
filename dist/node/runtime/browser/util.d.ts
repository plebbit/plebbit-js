import { IpfsClient, NativeFunctions } from "../../types.js";
export declare const getDefaultDataPath: () => any;
export declare const mkdir: () => never;
export declare const listSubplebbits: () => never;
export declare function createIpfsClient(ipfsHttpClientOptions: IpfsClient["_clientOptions"]): IpfsClient["_client"];
export declare const nativeFunctions: NativeFunctions;
export declare const setNativeFunctions: (newNativeFunctions: Partial<NativeFunctions>) => void;
