import { DbHandlerPublicAPI, IpfsHttpClientPublicAPI, NativeFunctions } from "../../types";
import { promises as fs } from "fs";
import path from "path";
import assert from "assert";

import { pendingSubplebbitCreations } from "../../plebbit";
import { DbHandler } from "./db-handler";
import { Subplebbit } from "../../subplebbit";

import fetch from "node-fetch";
import { create } from "ipfs-http-client";

const nativeFunctions: NativeFunctions = {
    listSubplebbits: async (dataPath: string): Promise<string[]> => {
        const stat = await fs.lstat(dataPath);
        assert(stat.isDirectory(), `dataPath (${dataPath}) is not a directory`);
        const subplebbitsPath = path.join(dataPath, "subplebbits");

        await fs.mkdir(subplebbitsPath, { recursive: true });

        const addresses = (await fs.readdir(subplebbitsPath)).filter(
            (address: string) => !Boolean(pendingSubplebbitCreations[address]) && !address.includes("journal")
        );

        return addresses;
    },

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
            pubsubSubscribe: ipfsClient.pubsub.subscribe,
            pubsubUnsubscribe: ipfsClient.pubsub.unsubscribe,
            pubsubPublish: ipfsClient.pubsub.publish,
            publishName: ipfsClient.name.publish,
            resolveName: ipfsClient.name.resolve,
            getConfig: ipfsClient.config.get,
            listKeys: ipfsClient.key.list
        };
    }
};

export default nativeFunctions;
