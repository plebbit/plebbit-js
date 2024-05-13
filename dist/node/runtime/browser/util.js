import { sha256 } from "js-sha256";
import { default as browserNativeFunctions } from "./native-functions.js";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import Logger from "@plebbit/plebbit-logger";
import { create as CreateKuboRpcClient } from "kubo-rpc-client";
const storedIpfsClients = {};
// Functions should not be called in browser
export const getDefaultDataPath = () => undefined;
export const mkdir = () => {
    throw Error("mkdir should not be called in browser");
};
export const listSubplebbits = () => {
    throw Error("listSubplebbits should not be called in browser");
};
export function createIpfsClient(ipfsHttpClientOptions) {
    const cacheKey = sha256(deterministicStringify(ipfsHttpClientOptions));
    if (storedIpfsClients[cacheKey])
        return storedIpfsClients[cacheKey];
    const log = Logger("plebbit-js:plebbit:createIpfsClient");
    log("Creating a new ipfs client on browser with options", ipfsHttpClientOptions);
    storedIpfsClients[cacheKey] = CreateKuboRpcClient({
        ...ipfsHttpClientOptions
    });
    return storedIpfsClients[cacheKey];
}
export const nativeFunctions = browserNativeFunctions;
export const setNativeFunctions = (newNativeFunctions) => {
    if (!newNativeFunctions)
        throw Error(`User passed an undefined object to setNativeFunctions`);
    //@ts-expect-error
    for (const i in newNativeFunctions)
        nativeFunctions[i] = newNativeFunctions[i];
};
//# sourceMappingURL=util.js.map