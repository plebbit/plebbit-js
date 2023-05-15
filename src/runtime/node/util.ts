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

export async function getThumbnailUrlOfLink(url: string, proxyHttpUrl?: string): Promise<string> {
    const imageFileExtensions = [".png", ".jpg", ".webp", ".jpeg"];
    for (const extension of imageFileExtensions) if (url.endsWith(extension)) return url;

    const options = { url, downloadLimit: 2000000 };
    if (proxyHttpUrl) {
        const httpAgent = new HttpProxyAgent({ proxy: proxyHttpUrl });
        const httpsAgent = new HttpsProxyAgent({ proxy: proxyHttpUrl });
        options["agent"] = { https: httpsAgent, http: httpAgent };
    }
    const res = await scraper(options);

    if (res.error) return undefined;

    if (typeof res.result.ogImage === "string") return res.result.ogImage;
    else if (res.result.ogImage["url"]) return res.result.ogImage["url"];
    else return undefined;
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
