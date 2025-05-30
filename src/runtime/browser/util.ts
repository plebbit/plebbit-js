import type { KuboRpcClient, NativeFunctions } from "../../types.js";
import { default as browserNativeFunctions } from "./native-functions.js";
import Logger from "@plebbit/plebbit-logger";
import { create as CreateKuboRpcClient } from "kubo-rpc-client";
import { throwWithErrorCode } from "../../util.js";

// Functions should not be called in browser
export const getDefaultDataPath = () => undefined;

export const mkdir = () => {
    throw Error("mkdir should not be called in browser");
};

export const listSubplebbits = () => {
    throw Error("listSubplebbits should not be called in browser");
};

export const listSubplebbitsSync = () => {
    throw Error("listSubplebbitsSync should not be called in browser");
};

export const monitorSubplebbitsDirectory = () => {
    throw Error("monitorSubplebbitsDirectory should not be called in browser");
};

export async function importSignerIntoKuboNode(ipnsKeyName: string, ipfsKey: Uint8Array, ipfsNode: KuboRpcClient["_clientOptions"]) {
    const data = new FormData();
    if (typeof ipnsKeyName !== "string") throw Error("ipnsKeyName needs to be defined before importing key into IPFS node");
    if (!ipfsKey || ipfsKey.constructor?.name !== "Uint8Array" || ipfsKey.byteLength <= 0)
        throw Error("ipfsKey needs to be defined before importing key into IPFS node");

    data.append("file", new Blob([ipfsKey]));
    const nodeUrl = ipfsNode.url;
    if (!nodeUrl) throw Error(`Can't figure out ipfs node URL from ipfsNode (${JSON.stringify(ipfsNode)}`);
    const url = `${nodeUrl}/key/import?arg=${ipnsKeyName}&ipns-base=b58mh`;
    const res = await fetch(url, {
        method: "POST",
        body: data,
        headers: ipfsNode.headers
    });

    if (res.status !== 200)
        throwWithErrorCode("ERR_FAILED_TO_IMPORT_IPFS_KEY", { url, status: res.status, statusText: res.statusText, ipnsKeyName });
    const resJson: { Id: string; Name: string } = await res.json();

    return { id: resJson.Id, name: resJson.Name };
}

export function createKuboRpcClient(kuboRpcClientOptions: KuboRpcClient["_clientOptions"]): KuboRpcClient["_client"] {
    const log = Logger("plebbit-js:plebbit:createKuboRpcClient");
    log("Creating a new ipfs client on browser with options", kuboRpcClientOptions);

    const kuboRpcClient = CreateKuboRpcClient({
        ...kuboRpcClientOptions
    });

    return kuboRpcClient;
}

export const nativeFunctions: NativeFunctions = browserNativeFunctions;
export const setNativeFunctions = (newNativeFunctions: Partial<NativeFunctions>) => {
    if (!newNativeFunctions) throw Error(`User passed an undefined object to setNativeFunctions`);
    //@ts-expect-error
    for (const i in newNativeFunctions) nativeFunctions[i] = newNativeFunctions[i];
};
