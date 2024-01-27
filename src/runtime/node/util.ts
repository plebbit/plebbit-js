import { promises as fs } from "fs";
import { default as nodeNativeFunctions } from "./native-functions";
import { NativeFunctions, PlebbitOptions } from "../../types";
import path from "path";
import assert from "assert";
import { Knex } from "knex";
import { parseJsonStrings } from "../../util";
import scraper from "open-graph-scraper";
import { HttpProxyAgent, HttpsProxyAgent } from "hpagent";
import Logger from "@plebbit/plebbit-logger";
import { PlebbitError } from "../../plebbit-error";
import probe from "probe-image-size";
import { Plebbit } from "../../plebbit";
import { STORAGE_KEYS } from "../../constants";
import lodash from "lodash";
import { RemoteSubplebbit } from "../../subplebbit/remote-subplebbit";

export const mkdir = fs.mkdir;

export const getDefaultDataPath = () => path.join(process.cwd(), ".plebbit");

export const getDefaultSubplebbitDbConfig = async (
    subplebbit: Pick<RemoteSubplebbit, "address"> & { plebbit: Pick<PlebbitOptions, "dataPath" | "noData"> }
): Promise<Knex.Config<any>> => {
    let filename: string;
    if (subplebbit.plebbit.noData) filename = ":memory:";
    else {
        assert(typeof subplebbit.plebbit.dataPath === "string", "plebbit.dataPath need to be defined to get default subplebbit db config");
        filename = path.join(subplebbit.plebbit.dataPath, "subplebbits", subplebbit.address);
        await mkdir(path.dirname(filename), { recursive: true });
    }

    return {
        client: "better-sqlite3",
        connection: { filename },
        useNullAsDefault: true,
        acquireConnectionTimeout: 120000,
        postProcessResponse: (result, queryContext) => {
            return parseJsonStrings(result);
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
    const options = {
        url,
        downloadLimit: 2000000,
        headers: {
            "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)"
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

        thumbnail.thumbnailUrl = typeof res.result.ogImage === "string" ? res.result.ogImage : res.result.ogImage["url"];
        assert(thumbnail.thumbnailUrl, "thumbnailUrl needs to be defined");

        const ogImageHeight = res.result.ogImage?.[0]?.height;
        const ogImageWidth = res.result.ogImage?.[0]?.width;

        thumbnail.thumbnailHeight = typeof ogImageHeight === "number" ? ogImageHeight : undefined;
        thumbnail.thumbnailWidth = typeof ogImageWidth === "number" ? ogImageWidth : undefined;
        if (lodash.isNil(thumbnail.thumbnailWidth) || lodash.isNil(thumbnail.thumbnailHeight)) {
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

export default {
    getDefaultDataPath,
    nativeFunctions,
    setNativeFunctions,
    mkdir
};
