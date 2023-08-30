import { promises as fs } from "fs";
import { default as nodeNativeFunctions } from "./native-functions";
import { NativeFunctions } from "../../types";
import path from "path";
import { Subplebbit } from "../../subplebbit";
import assert from "assert";
import { Knex } from "knex";
import { Plebbit } from "../../plebbit";
import { parseJsonStrings } from "../../util";
import scraper from "open-graph-scraper";
import { HttpProxyAgent, HttpsProxyAgent } from "hpagent";
import Logger from "@plebbit/plebbit-logger";
import { PlebbitError } from "../../plebbit-error";
import sizeOf from "image-size";

export const mkdir = fs.mkdir;

export const getDefaultDataPath = () => path.join(process.cwd(), ".plebbit");

export const getDefaultSubplebbitDbConfig = async (
    subplebbit: Pick<Subplebbit, "address"> & { plebbit: Pick<Plebbit, "dataPath" | "noData"> }
): Promise<Knex.Config<any>> => {
    let filename: string;
    if (subplebbit.plebbit.noData) filename = ":memory:";
    else {
        assert(typeof subplebbit.plebbit.dataPath === "string", "plebbit.dataPath need to be defined to get default subplebbit db config");
        filename = path.join(subplebbit.plebbit.dataPath, "subplebbits", subplebbit.address);
        await mkdir(path.dirname(filename), { recursive: true });
    }

    return {
        client: "sqlite3",
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
    subplebbit: Subplebbit,
    proxyHttpUrl?: string
): Promise<{ thumbnailUrl: string; thumbnailWidth: number; thumbnailHeight: number } | undefined> {
    const log = Logger(`plebbit-js:subplebbit:getThumbnailUrlOfLink`);

    //@ts-expect-error
    const thumbnail: { thumbnailUrl: string; thumbnailWidth: number; thumbnailHeight: number } = {};
    const options = { url, downloadLimit: 2000000 };

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

        thumbnail.thumbnailHeight = parseInt(res.result.ogImageHeight || res.result.ogImage["height"] || 0) || undefined;
        thumbnail.thumbnailWidth = parseInt(res.result.ogImageWidth || res.result.ogImage["width"] || 0) || undefined;
        if (!thumbnail.thumbnailWidth || !thumbnail.thumbnailHeight) {
            const dimensions = await fetchDimensionsOfImage(thumbnail.thumbnailUrl);
            thumbnail.thumbnailHeight = dimensions?.height;
            thumbnail.thumbnailWidth = dimensions?.width;
        }
        return thumbnail;
    } catch (e) {
        const plebbitError = new PlebbitError("ERR_FAILED_TO_FETCH_THUMBNAIL_URL_OF_LINK", {
            url,
            downloadLimit: options.downloadLimit,
            proxyHttpUrl,
            error: e
        });
        log.error(String(plebbitError));
        subplebbit.emit("error", plebbitError);
        return undefined;
    }
}

async function fetchDimensionsOfImage(imageUrl: string): Promise<{ width: number; height: number } | undefined> {
    const imageFetched = await nativeFunctions.fetch(imageUrl, { size: 5000000 }); // Max is 5mb
    const imageBuffer = await imageFetched.buffer();
    const dimensions = sizeOf(imageBuffer);
    return { width: dimensions.width, height: dimensions.height };
}

export const nativeFunctions: NativeFunctions = nodeNativeFunctions;
export const setNativeFunctions = (newNativeFunctions: Partial<NativeFunctions>) => {
    if (!newNativeFunctions) throw Error(`User passed an undefined object to setNativeFunctions`);
    for (const i in newNativeFunctions) nativeFunctions[i] = newNativeFunctions[i];
};

export default {
    getDefaultDataPath,
    nativeFunctions,
    setNativeFunctions,
    mkdir
};
