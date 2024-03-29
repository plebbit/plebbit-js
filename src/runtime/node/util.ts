import { promises as fs } from "fs";
import { default as nodeNativeFunctions } from "./native-functions.js";
import { IpfsClient, NativeFunctions, PlebbitOptions } from "../../types.js";
import path from "path";
import assert from "assert";
import { Knex } from "knex";
import { parseDbResponses, throwWithErrorCode } from "../../util.js";
import scraper from "open-graph-scraper";
import { HttpProxyAgent, HttpsProxyAgent } from "hpagent";
import { PlebbitError } from "../../plebbit-error.js";
import probe from "probe-image-size";
import { Plebbit } from "../../plebbit.js";
import { STORAGE_KEYS } from "../../constants.js";
import lodash from "lodash";
import { RemoteSubplebbit } from "../../subplebbit/remote-subplebbit.js";
import os from "os";
import * as fileType from "file-type";
import { OpenGraphScraperOptions } from "open-graph-scraper/dist/lib/types.js";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { sha256 } from "js-sha256";
import { stringify as deterministicStringify } from "safe-stable-stringify";
import { create as CreateKuboRpcClient } from "kubo-rpc-client";
import Logger from "@plebbit/plebbit-logger";

const storedIpfsClients: Record<string, ReturnType<typeof createIpfsClient>> = {};

export const getDefaultDataPath = () => path.join(process.cwd(), ".plebbit");

export const getDefaultSubplebbitDbConfig = async (
    subplebbit: Pick<RemoteSubplebbit, "address"> & { plebbit: Pick<PlebbitOptions, "dataPath" | "noData"> }
): Promise<Knex.Config<any>> => {
    let filename: string;
    if (subplebbit.plebbit.noData) filename = ":memory:";
    else {
        assert(typeof subplebbit.plebbit.dataPath === "string", "plebbit.dataPath need to be defined to get default subplebbit db config");
        filename = path.join(subplebbit.plebbit.dataPath, "subplebbits", subplebbit.address);
        await fs.mkdir(path.dirname(filename), { recursive: true });
    }

    return {
        client: "better-sqlite3",
        connection: { filename },
        useNullAsDefault: true,
        acquireConnectionTimeout: 120000,
        postProcessResponse: (result, queryContext) => {
            return parseDbResponses(result);
        }
    };
};

// Should be moved to subplebbit.ts
export async function getThumbnailUrlOfLink(
    url: string,
    subplebbit: RemoteSubplebbit,
    proxyHttpUrl?: string
): Promise<{ thumbnailUrl: string; thumbnailWidth: number; thumbnailHeight: number } | undefined> {
    const log = Logger(`plebbit-js:subplebbit:getThumbnailUrlOfLink`);

    //@ts-expect-error
    const thumbnail: { thumbnailUrl: string; thumbnailWidth: number; thumbnailHeight: number } = {};
    const options: OpenGraphScraperOptions = {
        url,
        fetchOptions: {
            headers: {
                "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)"
            },
            //@ts-expect-error
            downloadLimit: 2000000
        }
    };

    try {
        if (proxyHttpUrl) {
            const httpAgent = new HttpProxyAgent({ proxy: proxyHttpUrl });
            const httpsAgent = new HttpsProxyAgent({ proxy: proxyHttpUrl });
            options["agent"] = { https: httpsAgent, http: httpAgent };
        }
        const res = await scraper(options);

        if (res.error) return undefined;
        if (!res?.result?.ogImage) return undefined;

        res.result.ogImage[0].url;
        thumbnail.thumbnailUrl = res.result.ogImage[0].url;
        assert(typeof thumbnail.thumbnailUrl === "string", "thumbnailUrl needs to be a string");

        thumbnail.thumbnailHeight = Number(res.result.ogImage?.[0]?.height);
        thumbnail.thumbnailWidth = Number(res.result.ogImage?.[0]?.width);
        if (thumbnail.thumbnailHeight === 0 || isNaN(thumbnail.thumbnailHeight)) {
            const dimensions = await fetchDimensionsOfImage(thumbnail.thumbnailUrl);
            thumbnail.thumbnailHeight = dimensions?.height;
            thumbnail.thumbnailWidth = dimensions?.width;
        }
        return thumbnail;
    } catch (e) {
        const plebbitError = new PlebbitError("ERR_FAILED_TO_FETCH_THUMBNAIL_URL_OF_LINK", {
            url,
            scrapeOptions: options,
            proxyHttpUrl,
            error: e
        });
        log.error(String(plebbitError));
        subplebbit.emit("error", plebbitError);
        return undefined;
    }
}

async function fetchDimensionsOfImage(imageUrl: string): Promise<{ width: number; height: number } | undefined> {
    const result = await probe(imageUrl);
    return { width: result.width, height: result.height };
}

export const nativeFunctions: NativeFunctions = nodeNativeFunctions;
export const setNativeFunctions = (newNativeFunctions: Partial<NativeFunctions>) => {
    if (!newNativeFunctions) throw Error(`User passed an undefined object to setNativeFunctions`);
    for (const i in newNativeFunctions) nativeFunctions[i] = newNativeFunctions[i];
};

export const deleteOldSubplebbitInWindows = async (subPath: string, plebbit: Pick<Plebbit, "_storage">) => {
    const log = Logger("plebbit-js:subplebbit:deleteStaleSubplebbitInWindows");
    const subAddress = path.basename(subPath);
    try {
        await fs.rm(subPath);
        log(`Succeeded in deleting old subplebbit (${subAddress})`);
    } catch (e) {
        // Assume it's because of EBUSY
        log.error(
            `Failed to delete old subplebbit (${subAddress}). Restarting the node process or daemon should make this error disappear`
        );
        // Put subAddress in storage
        const storageKey = STORAGE_KEYS[STORAGE_KEYS.PERSISTENT_DELETED_SUBPLEBBITS];
        const subsThatWeFailedToDelete: string[] = (await plebbit._storage.getItem(storageKey)) || [];
        if (!subsThatWeFailedToDelete.includes(subAddress)) subsThatWeFailedToDelete.push(subAddress);
        await plebbit._storage.setItem(storageKey, subsThatWeFailedToDelete);
    }
};

async function _handlePersistentSubsIfNeeded(plebbit: Plebbit, log: Logger) {
    const deletedPersistentSubs = <string[] | undefined>(
        await plebbit._storage.getItem(STORAGE_KEYS[STORAGE_KEYS.PERSISTENT_DELETED_SUBPLEBBITS])
    );
    if (Array.isArray(deletedPersistentSubs)) {
        // Attempt to delete them
        const subsThatWereDeletedSuccessfully: string[] = [];
        await Promise.all(
            deletedPersistentSubs.map(async (subAddress) => {
                const subPath = path.join(plebbit.dataPath, "subplebbits", subAddress);
                try {
                    await fs.rm(subPath, { force: true });
                    log(`Succeeded in deleting old db path (${subAddress})`);
                    subsThatWereDeletedSuccessfully.push(subAddress);
                } catch (e) {
                    log.error(
                        `Failed to delete stale db (${subAddress}). This error should go away after restarting the daemon or process`
                    );
                }
                const newPersistentDeletedSubplebbits = lodash.difference(deletedPersistentSubs, subsThatWereDeletedSuccessfully);
                if (newPersistentDeletedSubplebbits.length === 0)
                    await plebbit._storage.removeItem(STORAGE_KEYS[STORAGE_KEYS.PERSISTENT_DELETED_SUBPLEBBITS]);
                else
                    await plebbit._storage.setItem(
                        STORAGE_KEYS[STORAGE_KEYS.PERSISTENT_DELETED_SUBPLEBBITS],
                        newPersistentDeletedSubplebbits
                    );
            })
        );
    }
    return deletedPersistentSubs;
}

export async function listSubplebbits(plebbit: Plebbit) {
    const log = Logger("plebbit-js:listSubplebbits");

    const subplebbitsPath = path.join(plebbit.dataPath, "subplebbits");

    await fs.mkdir(subplebbitsPath, { recursive: true });

    const deletedPersistentSubs = await _handlePersistentSubsIfNeeded(plebbit, log);

    const files = (await fs.readdir(subplebbitsPath, { withFileTypes: true }))
        .filter((file) => file.isFile()) // Filter directories out
        .filter((file) => !/-journal$/.test(file.name)) // Filter SQLite3 journal files out
        .map((file) => file.name);

    const filterResults = await Promise.all(
        files.map(async (address) => {
            if (Array.isArray(deletedPersistentSubs) && deletedPersistentSubs.includes(address)) return false;
            try {
                //@ts-expect-error
                const typeOfFile = await fileType.default.fromFile(path.join(subplebbitsPath, address)); // This line fails if file no longer exists
                return typeOfFile?.mime === "application/x-sqlite3";
            } catch (e) {
                return false;
            }
        })
    );

    const filtered_results = files.filter((_, i) => filterResults[i]).sort(); // make sure it's sorted, so the order is always the same

    return filtered_results;
}

export async function importSignerIntoIpfsNode(ipnsKeyName: string, ipfsKey: Uint8Array, ipfsNode: { url: string; headers?: Object }) {
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
        headers: <Record<string, string>>ipfsNode?.headers // We're assuming that only IPFS one client will be used
    });

    if (res.status !== 200)
        throwWithErrorCode("ERR_FAILED_TO_IMPORT_IPFS_KEY", { url, status: res.status, statusText: res.statusText, ipnsKeyName });
    const resJson: { Id: string; Name: string } = await res.json();

    return { id: resJson.Id, name: resJson.Name };
}

export async function moveSubplebbitDbToDeletedDirectory(subplebbitAddress: string, plebbit: Plebbit) {
    // Delete subplebbit will just move the sub db file to another directory
    if (typeof plebbit.dataPath !== "string") throw Error("plebbit.dataPath is not defined");
    const oldPath = path.join(plebbit.dataPath, "subplebbits", subplebbitAddress);
    const newPath = path.join(plebbit.dataPath, "subplebbits", "deleted", subplebbitAddress);
    await fs.mkdir(path.join(plebbit.dataPath, "subplebbits", "deleted"), { recursive: true });
    await fs.cp(oldPath, newPath);
    if (os.type() === "Windows_NT") await deleteOldSubplebbitInWindows(oldPath, plebbit);
    else await fs.rm(oldPath);
}

export function createIpfsClient(ipfsHttpClientOptions: IpfsClient["_clientOptions"]): IpfsClient["_client"] {
    const cacheKey = sha256(deterministicStringify(ipfsHttpClientOptions));
    if (storedIpfsClients[cacheKey]) return storedIpfsClients[cacheKey];
    const log = Logger("plebbit-js:plebbit:createIpfsClient");
    log("Creating a new ipfs client on node with options", ipfsHttpClientOptions);
    const isHttpsAgent =
        (typeof ipfsHttpClientOptions.url === "string" && ipfsHttpClientOptions.url.startsWith("https")) ||
        ipfsHttpClientOptions?.protocol === "https" ||
        (ipfsHttpClientOptions.url instanceof URL && ipfsHttpClientOptions?.url?.protocol === "https:") ||
        ipfsHttpClientOptions.url?.toString()?.includes("https");
    const Agent = isHttpsAgent ? HttpsAgent : HttpAgent;

    const onehourMs = 1000 * 60 * 60;

    storedIpfsClients[cacheKey] = CreateKuboRpcClient({
        ...ipfsHttpClientOptions,
        agent: ipfsHttpClientOptions.agent || new Agent({ keepAlive: true, maxSockets: Infinity, timeout: onehourMs }),
        timeout: onehourMs
    });

    return storedIpfsClients[cacheKey];
}
