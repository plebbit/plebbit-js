import { sha256 } from "js-sha256";
import { IpfsClient, NativeFunctions } from "../../types.js";
import { default as browserNativeFunctions } from "./native-functions.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import Logger from "@plebbit/plebbit-logger";
import { create as CreateKuboRpcClient } from "kubo-rpc-client";

const storedIpfsClients: Record<string, ReturnType<typeof createIpfsClient>> = {};

// Functions should not be called in browser
export const getDefaultDataPath = () => undefined;

export const mkdir = () => {
    throw Error("mkdir should not be called in browser");
};

export const listSubplebbits = () => {
    throw Error("listSubplebbits should not be called in browser");
};

export function createIpfsClient(ipfsHttpClientOptions: IpfsClient["_clientOptions"]): IpfsClient["_client"] {
    const cacheKey = sha256(deterministicStringify(ipfsHttpClientOptions));
    if (storedIpfsClients[cacheKey]) return storedIpfsClients[cacheKey];
    const log = Logger("plebbit-js:plebbit:createIpfsClient");
    log("Creating a new ipfs client on browser with options", ipfsHttpClientOptions);

    storedIpfsClients[cacheKey] = CreateKuboRpcClient({
        ...ipfsHttpClientOptions
    });

    return storedIpfsClients[cacheKey];
}

export const nativeFunctions: NativeFunctions = browserNativeFunctions;
export const setNativeFunctions = (newNativeFunctions: Partial<NativeFunctions>) => {
    if (!newNativeFunctions) throw Error(`User passed an undefined object to setNativeFunctions`);
    for (const i in newNativeFunctions) nativeFunctions[i] = newNativeFunctions[i];
};
