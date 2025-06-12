import type { KuboRpcClient, NativeFunctions } from "../../types.js";
import { Plebbit } from "../../plebbit/plebbit.js";
import { RemoteSubplebbit } from "../../subplebbit/remote-subplebbit.js";
import Logger from "@plebbit/plebbit-logger";
import type { SubplebbitIpfsType } from "../../subplebbit/types.js";
import type { CommentUpdateType } from "../../publications/comment/types.js";
import { DbHandler } from "./subplebbit/db-handler.js";
export declare const getDefaultDataPath: () => string;
export declare const getDefaultSubplebbitDbConfig: (subplebbitAddress: SubplebbitIpfsType["address"], plebbit: Plebbit) => Promise<DbHandler["_dbConfig"]>;
export declare function getThumbnailPropsOfLink(url: string, subplebbit: RemoteSubplebbit, proxyHttpUrl?: string): Promise<{
    thumbnailUrl: string;
    thumbnailUrlWidth?: number;
    thumbnailUrlHeight?: number;
} | undefined>;
export declare const nativeFunctions: NativeFunctions;
export declare const setNativeFunctions: (newNativeFunctions: Partial<NativeFunctions>) => void;
export declare const deleteOldSubplebbitInWindows: (subPath: string, plebbit: Pick<Plebbit, "_storage">) => Promise<void>;
export declare function trytoDeleteSubsThatFailedToBeDeletedBefore(plebbit: Plebbit, log: Logger): Promise<string[] | undefined>;
export declare function listSubplebbitsSync(plebbit: Plebbit): string[];
export declare function importSignerIntoKuboNode(ipnsKeyName: string, ipfsKey: Uint8Array, kuboRpcClientOptions: KuboRpcClient["_clientOptions"]): Promise<{
    id: string;
    name: string;
}>;
export declare function moveSubplebbitDbToDeletedDirectory(subplebbitAddress: string, plebbit: Plebbit): Promise<void>;
export declare function createKuboRpcClient(kuboRpcClientOptions: KuboRpcClient["_clientOptions"]): KuboRpcClient["_client"];
export declare function monitorSubplebbitsDirectory(plebbit: Plebbit): Promise<AbortController>;
export declare function calculateExpectedSignatureSize(newIpns: Omit<SubplebbitIpfsType, "signature" | "posts"> | Omit<CommentUpdateType, "signature" | "posts">): number;
