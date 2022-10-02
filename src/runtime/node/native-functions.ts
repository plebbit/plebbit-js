import { DbHandlerPublicAPI, IpfsHttpClientPublicAPI, NativeFunctions, SignerType } from "../../types";
import { promises as fs } from "fs";
import path from "path";
import assert from "assert";

import { pendingSubplebbitCreations, Plebbit } from "../../plebbit";
import { DbHandler } from "./db-handler";

import fetch from "node-fetch";
import { create } from "ipfs-http-client";

import all from "it-all";
import last from "it-last";
import { concat as uint8ArrayConcat } from "uint8arrays/concat";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { createCaptcha } from "captcha-canvas";
import { Agent } from "http";
import FormData from "form-data";

const nativeFunctions: NativeFunctions = {
    createImageCaptcha: async (...args): Promise<{ image: string; text: string }> => {
        const { image, text } = createCaptcha(...args);

        const imageBase64 = (await image).toString("base64");

        return { image: imageBase64, text };
    },
    listSubplebbits: async (dataPath: string): Promise<string[]> => {
        assert(typeof dataPath === "string", "Data path is not defined");
        const subplebbitsPath = path.join(dataPath, "subplebbits");

        await fs.mkdir(subplebbitsPath, { recursive: true });

        const addresses = (await fs.readdir(subplebbitsPath)).filter(
            (address: string) => !Boolean(pendingSubplebbitCreations[address]) && !address.includes("journal")
        );

        return addresses;
    },

    createDbHandler: (subplebbit: DbHandler["_subplebbit"]): DbHandlerPublicAPI => {
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
        const ipfsClient = create(
            typeof ipfsHttpClientOptions === "string"
                ? { url: ipfsHttpClientOptions, agent: new Agent({ keepAlive: true, maxSockets: Infinity }) }
                : {
                      ...ipfsHttpClientOptions,
                      agent: ipfsHttpClientOptions.agent || new Agent({ keepAlive: true, maxSockets: Infinity })
                  }
        );

        const cat = async (...args: Parameters<IpfsHttpClientPublicAPI["cat"]>): Promise<string | undefined> => {
            const rawData = await all(ipfsClient.cat(...args));
            const data = uint8ArrayConcat(rawData);
            return uint8ArrayToString(data);
        };

        const resolveName = async (...args: Parameters<IpfsHttpClientPublicAPI["name"]["resolve"]>): Promise<string | undefined> => {
            return last(ipfsClient.name.resolve(...args));
        };

        return {
            add: ipfsClient.add,
            cat: cat,
            pubsub: {
                subscribe: ipfsClient.pubsub.subscribe,
                unsubscribe: ipfsClient.pubsub.unsubscribe,
                publish: ipfsClient.pubsub.publish
            },
            name: {
                publish: ipfsClient.name.publish,
                resolve: resolveName
            },
            config: {
                get: ipfsClient.config.get
            },
            key: {
                list: ipfsClient.key.list
            }
        };
    },
    importSignerIntoIpfsNode: async (signer: SignerType, plebbit: Plebbit): Promise<{ Id: string; Name: string }> => {
        const data = new FormData();
        if (typeof signer.ipnsKeyName !== "string")
            throw Error("Signer.ipnsKeyName needs to be defined before importing key into IPFS node");
        if (signer.ipfsKey?.constructor?.name !== "Uint8Array")
            throw Error("Signer.ipfsKey needs to be defined before importing key into IPFS node");
        const ipfsKeyFile = Buffer.from(signer.ipfsKey);

        data.append("file", ipfsKeyFile);
        const nodeUrl =
            typeof plebbit.ipfsHttpClientOptions === "string" ? plebbit.ipfsHttpClientOptions : plebbit.ipfsHttpClientOptions.url;
        if (!nodeUrl) throw Error("Can't figure out ipfs node URL");
        const url = `${nodeUrl}/key/import?arg=${signer.ipnsKeyName}`;
        const res = await nativeFunctions.fetch(url, {
            method: "POST",
            body: data
        });
        if (res.status !== 200) throw Error(`failed ipfs import key: '${url}' '${res.status}' '${res.statusText}'`);
        const resJson: { Id: string; Name: string } = await res.json();
        return resJson;
    }
};

export default nativeFunctions;
