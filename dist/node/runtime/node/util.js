import { promises as fs } from "fs";
import { default as nodeNativeFunctions } from "./native-functions.js";
import path from "path";
import assert from "assert";
import { throwWithErrorCode } from "../../util.js";
import scraper from "open-graph-scraper";
import { HttpProxyAgent, HttpsProxyAgent } from "hpagent";
import { PlebbitError } from "../../plebbit-error.js";
import probe from "probe-image-size";
import { STORAGE_KEYS } from "../../constants.js";
import os from "os";
import { fileTypeFromFile } from "file-type";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { create as CreateKuboRpcClient } from "kubo-rpc-client";
import Logger from "@plebbit/plebbit-logger";
import * as remeda from "remeda";
import { watch as fsWatch } from "node:fs";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
export const getDefaultDataPath = () => path.join(process.cwd(), ".plebbit");
export const getDefaultSubplebbitDbConfig = async (subplebbitAddress, plebbit) => {
    let filename;
    if (plebbit.noData)
        filename = ":memory:";
    else {
        assert(typeof plebbit.dataPath === "string", "plebbit.dataPath need to be defined to get default subplebbit db config");
        filename = path.join(plebbit.dataPath, "subplebbits", subplebbitAddress);
        await fs.mkdir(path.dirname(filename), { recursive: true });
    }
    return {
        filename,
        fileMustExist: true
    };
};
async function _getThumbnailUrlOfLink(url, agent) {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const lowerCaseLink = url.toLowerCase();
    if (imageExtensions.some((ext) => lowerCaseLink.endsWith(ext))) {
        return { thumbnailUrl: url };
    }
    const options = {
        url,
        fetchOptions: {
            // not sure which prop is used here, but let's use both
            //@ts-expect-error
            downloadLimit: 2000000,
            size: 2000000
        }
    };
    if (agent)
        options["agent"] = agent;
    const res = await scraper(options);
    if (res.error) {
        throw res;
    }
    if (!res?.result?.ogImage)
        return undefined;
    return {
        thumbnailUrl: res.result.ogImage[0].url,
        thumbnailUrlWidth: Number(res.result.ogImage[0].width),
        thumbnailUrlHeight: Number(res.result.ogImage[0].height)
    };
}
// Should be moved to subplebbit.ts
export async function getThumbnailPropsOfLink(url, subplebbit, proxyHttpUrl) {
    const log = Logger(`plebbit-js:subplebbit:getThumbnailUrlOfLink`);
    const agent = proxyHttpUrl
        ? {
            http: new HttpProxyAgent({ proxy: proxyHttpUrl }),
            https: new HttpsProxyAgent({ proxy: proxyHttpUrl })
        }
        : undefined;
    let thumbnailOg;
    try {
        thumbnailOg = await _getThumbnailUrlOfLink(url, agent);
    }
    catch (e) {
        const plebbitError = new PlebbitError("ERR_FAILED_TO_FETCH_THUMBNAIL_URL_OF_LINK", {
            error: e,
            url,
            proxyHttpUrl,
            subplebbitAddress: subplebbit.address
        });
        //@ts-expect-error
        plebbitError.stack = e.stack;
        log.error(plebbitError);
        subplebbit.emit("error", plebbitError);
        return undefined;
    }
    if (!thumbnailOg)
        return undefined;
    try {
        let thumbnailHeight = thumbnailOg.thumbnailUrlHeight;
        let thumbnailWidth = thumbnailOg.thumbnailUrlWidth;
        if (typeof thumbnailHeight !== "number" || thumbnailHeight === 0 || isNaN(thumbnailHeight)) {
            const probedDimensions = await fetchDimensionsOfImage(thumbnailOg.thumbnailUrl, agent);
            if (probedDimensions) {
                thumbnailHeight = probedDimensions.height;
                thumbnailWidth = probedDimensions.width;
            }
        }
        if (typeof thumbnailWidth !== "number" || typeof thumbnailHeight !== "number")
            return { thumbnailUrl: thumbnailOg.thumbnailUrl };
        return { thumbnailUrl: thumbnailOg.thumbnailUrl, thumbnailUrlHeight: thumbnailHeight, thumbnailUrlWidth: thumbnailWidth };
    }
    catch (e) {
        const plebbitError = new PlebbitError("ERR_FAILED_TO_FETCH_THUMBNAIL_DIMENSION_OF_LINK", {
            url,
            proxyHttpUrl,
            error: e,
            subplebbitAddress: subplebbit.address
        });
        //@ts-expect-error
        plebbitError.stack = e.stack;
        log.error(plebbitError);
        subplebbit.emit("error", plebbitError);
        return undefined;
    }
}
async function fetchDimensionsOfImage(imageUrl, agent) {
    const result = await probe(imageUrl, { agent });
    if (typeof result?.width === "number")
        return { width: result.width, height: result.height };
}
export const nativeFunctions = nodeNativeFunctions;
export const setNativeFunctions = (newNativeFunctions) => {
    if (!newNativeFunctions)
        throw Error(`User passed an undefined object to setNativeFunctions`);
    //@ts-expect-error
    for (const i in newNativeFunctions)
        nativeFunctions[i] = newNativeFunctions[i];
};
export const deleteOldSubplebbitInWindows = async (subPath, plebbit) => {
    const log = Logger("plebbit-js:subplebbit:deleteStaleSubplebbitInWindows");
    const subAddress = path.basename(subPath);
    await new Promise((resolve) => setTimeout(resolve, 10000)); // give windows time to release the file
    try {
        await fs.rm(subPath);
        log(`Succeeded in deleting old subplebbit (${subAddress})`);
    }
    catch (e) {
        // Assume it's because of EBUSY
        log.error(`Failed to delete old subplebbit (${subAddress}). Restarting the node process or daemon should make this error disappear`, e);
        // Put subAddress in storage
        const storageKey = STORAGE_KEYS[STORAGE_KEYS.PERSISTENT_DELETED_SUBPLEBBITS];
        const subsThatWeFailedToDelete = (await plebbit._storage.getItem(storageKey)) || [];
        if (!subsThatWeFailedToDelete.includes(subAddress))
            subsThatWeFailedToDelete.push(subAddress);
        await plebbit._storage.setItem(storageKey, subsThatWeFailedToDelete);
        log(`Updated persistent deleted subplebbits in storage`, subsThatWeFailedToDelete);
    }
};
async function _handlePersistentSubsIfNeeded(plebbit, log) {
    const deletedPersistentSubs = (await plebbit._storage.getItem(STORAGE_KEYS[STORAGE_KEYS.PERSISTENT_DELETED_SUBPLEBBITS]));
    if (Array.isArray(deletedPersistentSubs)) {
        if (deletedPersistentSubs.length === 0) {
            await plebbit._storage.removeItem(STORAGE_KEYS[STORAGE_KEYS.PERSISTENT_DELETED_SUBPLEBBITS]);
            log("Removed persistent deleted subplebbits from storage because there are none left");
            return undefined;
        }
        // Attempt to delete them
        const subsThatWereDeletedSuccessfully = [];
        for (const subAddress of deletedPersistentSubs) {
            const subPath = path.join(plebbit.dataPath, "subplebbits", subAddress);
            try {
                await fs.rm(subPath, { force: true });
                log(`Succeeded in deleting old db path (${subAddress})`);
                subsThatWereDeletedSuccessfully.push(subAddress);
            }
            catch (e) {
                log.error(`Failed to delete stale db (${subAddress}). This error should go away after restarting the daemon or process`, e);
            }
        }
        const newPersistentDeletedSubplebbits = remeda.difference(deletedPersistentSubs, subsThatWereDeletedSuccessfully);
        if (newPersistentDeletedSubplebbits.length === 0) {
            await plebbit._storage.removeItem(STORAGE_KEYS[STORAGE_KEYS.PERSISTENT_DELETED_SUBPLEBBITS]);
            log("Removed persistent deleted subplebbits from storage because there are none left");
            return undefined;
        }
        else {
            await plebbit._storage.setItem(STORAGE_KEYS[STORAGE_KEYS.PERSISTENT_DELETED_SUBPLEBBITS], newPersistentDeletedSubplebbits);
            log(`Updated persistent deleted subplebbits in storage`, newPersistentDeletedSubplebbits);
            return newPersistentDeletedSubplebbits;
        }
    }
}
export async function listSubplebbits(plebbit) {
    const log = Logger("plebbit-js:listSubplebbits");
    if (typeof plebbit.dataPath !== "string")
        throw Error("plebbit.dataPath needs to be defined to listSubplebbits");
    const subplebbitsPath = path.join(plebbit.dataPath, "subplebbits");
    await fs.mkdir(subplebbitsPath, { recursive: true });
    const deletedPersistentSubs = (await _handlePersistentSubsIfNeeded(plebbit, log)) || [];
    if (deletedPersistentSubs.length > 0)
        log(`persistent subplebbits that refuse to be deleted`, deletedPersistentSubs);
    const files = (await fs.readdir(subplebbitsPath, { withFileTypes: false, recursive: false })).filter((file) => !file.includes(".lock") &&
        !file.endsWith("-journal") &&
        !file.endsWith("-shm") &&
        !file.endsWith("-wal") &&
        !deletedPersistentSubs.includes(file)); // Filter locks and journal files out
    const subplebbitFilesWeDontNeedToCheck = plebbit.subplebbits ? files.filter((address) => plebbit.subplebbits.includes(address)) : [];
    const filesToCheckIfSqlite = files.filter((address) => !subplebbitFilesWeDontNeedToCheck.includes(address));
    const filterResults = await Promise.all(filesToCheckIfSqlite.map(async (address) => {
        try {
            const typeOfFile = await fileTypeFromFile(path.join(subplebbitsPath, address)); // This line fails if file no longer exists
            if (typeOfFile?.mime === "application/x-sqlite3") {
                log.trace("Detected new sqlite db file in plebbit.datapath", address);
                return true;
            }
            else
                return false;
        }
        catch (e) {
            return false;
        }
    }));
    const filtered_results = [...subplebbitFilesWeDontNeedToCheck, ...filesToCheckIfSqlite.filter((_, i) => filterResults[i])].sort(); // make sure it's sorted, so the order is always the same
    return filtered_results;
}
export async function importSignerIntoKuboNode(ipnsKeyName, ipfsKey, kuboRpcClientOptions) {
    const data = new FormData();
    if (typeof ipnsKeyName !== "string")
        throw Error("ipnsKeyName needs to be defined before importing key into IPFS node");
    if (!ipfsKey || ipfsKey.constructor?.name !== "Uint8Array" || ipfsKey.byteLength <= 0)
        throw Error("ipfsKey needs to be defined before importing key into IPFS node");
    data.append("file", new Blob([ipfsKey]));
    const kuboRpcUrl = kuboRpcClientOptions.url;
    if (!kuboRpcUrl)
        throw Error(`Can't figure out ipfs node URL from ipfsNode (${JSON.stringify(kuboRpcClientOptions)}`);
    const url = `${kuboRpcUrl}/key/import?arg=${ipnsKeyName}&ipns-base=b58mh`;
    const res = await fetch(url, {
        method: "POST",
        body: data,
        headers: kuboRpcClientOptions.headers
    });
    if (res.status !== 200)
        throwWithErrorCode("ERR_FAILED_TO_IMPORT_IPFS_KEY", { url, status: res.status, statusText: res.statusText, ipnsKeyName });
    const resJson = await res.json();
    return { id: resJson.Id, name: resJson.Name };
}
export async function moveSubplebbitDbToDeletedDirectory(subplebbitAddress, plebbit) {
    if (typeof plebbit.dataPath !== "string")
        throw Error("plebbit.dataPath is not defined");
    const oldPath = path.join(plebbit.dataPath, "subplebbits", subplebbitAddress);
    const newPath = path.join(plebbit.dataPath, "subplebbits", "deleted", subplebbitAddress);
    // Create the deleted directory if it doesn't exist
    await fs.mkdir(path.join(plebbit.dataPath, "subplebbits", "deleted"), { recursive: true });
    // Check if the source file exists
    if (!existsSync(oldPath)) {
        throw Error(`Source database ${oldPath} does not exist`);
    }
    // Use better-sqlite3 backup instead of file copy
    try {
        const Database = (await import("better-sqlite3")).default;
        const sourceDb = new Database(oldPath, { fileMustExist: true });
        // Perform backup
        await sourceDb.backup(newPath);
        // Close the connection
        sourceDb.close();
        // Delete the original file
        if (os.type() === "Windows_NT") {
            await deleteOldSubplebbitInWindows(oldPath, plebbit);
        }
        else {
            await fs.rm(oldPath);
        }
    }
    catch (error) {
        error.details = { ...error.details, oldPath, newPath };
        throw error;
    }
}
export function createKuboRpcClient(kuboRpcClientOptions) {
    const log = Logger("plebbit-js:plebbit:createKuboRpcClient");
    log.trace("Creating a new kubo client on node with options", kuboRpcClientOptions);
    const isHttpsAgent = (typeof kuboRpcClientOptions.url === "string" && kuboRpcClientOptions.url.startsWith("https")) ||
        kuboRpcClientOptions?.protocol === "https" ||
        (kuboRpcClientOptions.url instanceof URL && kuboRpcClientOptions?.url?.protocol === "https:") ||
        kuboRpcClientOptions.url?.toString()?.includes("https");
    const Agent = isHttpsAgent ? HttpsAgent : HttpAgent;
    const onehourMs = 1000 * 60 * 60;
    const kuboRpcClient = CreateKuboRpcClient({
        ...kuboRpcClientOptions,
        agent: kuboRpcClientOptions.agent || new Agent({ keepAlive: true, maxSockets: Infinity, timeout: onehourMs }),
        timeout: onehourMs
    });
    return kuboRpcClient;
}
export async function monitorSubplebbitsDirectory(plebbit) {
    const watchAbortController = new AbortController();
    const subsPath = path.join(plebbit.dataPath, "subplebbits");
    await mkdir(subsPath, { recursive: true });
    const extensionsToIgnore = [".lock", "-journal", "-shm", "-wal"];
    fsWatch(subsPath, { signal: watchAbortController.signal, persistent: false, recursive: false }, async (eventType, filename) => {
        if (typeof filename === "string" && extensionsToIgnore.some((ext) => filename?.endsWith(ext)))
            return; // we only care about subplebbits
        const currentSubs = await listSubplebbits(plebbit);
        if (deterministicStringify(currentSubs) !== deterministicStringify(plebbit.subplebbits))
            plebbit.emit("subplebbitschange", currentSubs);
    });
    const currentListedSubs = await listSubplebbits(plebbit);
    if (deterministicStringify(currentListedSubs) !== deterministicStringify(plebbit.subplebbits))
        plebbit.emit("subplebbitschange", currentListedSubs);
    return watchAbortController;
}
export function calculateExpectedSignatureSize(newIpns) {
    // Get all non-undefined properties as they'll be in signedPropertyNames
    const signedProps = Object.entries(newIpns)
        .filter(([_, value]) => value !== undefined)
        .map(([key]) => key);
    const mockSignature = {
        signature: "A".repeat(88), // ed25519 sig is 64 bytes -> 88 bytes in base64
        publicKey: "A".repeat(44), // ed25519 pubkey is 32 bytes -> 44 bytes in base64
        type: "ed25519",
        signedPropertyNames: signedProps
    };
    return Buffer.byteLength(JSON.stringify(mockSignature), "utf8");
}
//# sourceMappingURL=util.js.map