import { IpfsClient, NativeFunctions, PlebbitOptions } from "../../types.js";
import { Knex } from "knex";
import { Plebbit } from "../../plebbit.js";
import { RemoteSubplebbit } from "../../subplebbit/remote-subplebbit.js";
export declare const getDefaultDataPath: () => string;
export declare const getDefaultSubplebbitDbConfig: (subplebbit: Pick<RemoteSubplebbit, "address"> & {
    plebbit: Pick<PlebbitOptions, "dataPath" | "noData">;
}) => Promise<Knex.Config<any>>;
export declare function getThumbnailUrlOfLink(url: string, subplebbit: RemoteSubplebbit, proxyHttpUrl?: string): Promise<{
    thumbnailUrl: string;
    thumbnailWidth: number;
    thumbnailHeight: number;
} | undefined>;
export declare const nativeFunctions: NativeFunctions;
export declare const setNativeFunctions: (newNativeFunctions: Partial<NativeFunctions>) => void;
export declare const deleteOldSubplebbitInWindows: (subPath: string, plebbit: Pick<Plebbit, "_storage">) => Promise<void>;
export declare function listSubplebbits(plebbit: Plebbit): Promise<string[]>;
export declare function importSignerIntoIpfsNode(ipnsKeyName: string, ipfsKey: Uint8Array, ipfsNode: {
    url: string;
    headers?: Object;
}): Promise<{
    id: string;
    name: string;
}>;
export declare function moveSubplebbitDbToDeletedDirectory(subplebbitAddress: string, plebbit: Plebbit): Promise<void>;
export declare function createIpfsClient(ipfsHttpClientOptions: IpfsClient["_clientOptions"]): IpfsClient["_client"];
