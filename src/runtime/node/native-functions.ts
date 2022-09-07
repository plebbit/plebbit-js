import { DbHandlerPublicAPI, IpfsHttpClientPublicAPI, NativeFunctions } from "../../types";
import { promises as fs } from "fs";
import path from "path";
import assert from "assert";

import { pendingSubplebbitCreations } from "../../plebbit";
import { DbHandler } from "./db-handler";
import { Subplebbit } from "../../subplebbit";

import fetch from "node-fetch";
import { create } from "ipfs-http-client";

import all from "it-all";
import last from "it-last";
import { concat as uint8ArrayConcat } from "uint8arrays/concat";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

const nativeFunctions: NativeFunctions = {
    listSubplebbits: async (dataPath: string): Promise<string[]> => {
        assert(typeof dataPath === "string", "Data path is not defined");
        const stat = await fs.lstat(dataPath);
        assert(stat.isDirectory(), `dataPath (${dataPath}) is not a directory`);
        const subplebbitsPath = path.join(dataPath, "subplebbits");

        await fs.mkdir(subplebbitsPath, { recursive: true });

        const addresses = (await fs.readdir(subplebbitsPath)).filter(
            (address: string) => !Boolean(pendingSubplebbitCreations[address]) && !address.includes("journal")
        );

        return addresses;
    },

    getDefaultDataPath: () => path.join(process.cwd(), ".plebbit"),
    createDbHandler: (subplebbit: Subplebbit): DbHandlerPublicAPI => {
        const dbHandler = new DbHandler(subplebbit);

        const dbApi = {};

        for (const property in dbHandler)
            if (typeof dbHandler[property] === "function" && !property.startsWith("_"))
                dbApi[property] = dbHandler[property].bind(dbHandler);

        //@ts-ignore
        return dbApi;
    },

    fetch: fetch,
    createIpfsClient: (ipfsHttpClientOptions): IpfsHttpClientPublicAPI => {
        const ipfsClient = create(ipfsHttpClientOptions);

        return {
            add: ipfsClient.add,
            cat: ipfsClient.cat,
            pubsub: {
                subscribe: ipfsClient.pubsub.subscribe,
                unsubscribe: ipfsClient.pubsub.unsubscribe,
                publish: ipfsClient.pubsub.publish
            },
            name: {
                publish: ipfsClient.name.publish,
                resolve: (...args) => {
                    const res = ipfsClient.name.resolve(...args);
                    //@ts-ignore
                    res.next = res.next.bind(res);
                    return res;
                }
            },
            config: {
                get: ipfsClient.config.get
            },
            key: {
                list: ipfsClient.key.list
            }
        };
    }
};

export default nativeFunctions;
