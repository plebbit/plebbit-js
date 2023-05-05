import { DbHandlerPublicAPI, IpfsHttpClientPublicAPI, NativeFunctions } from "../../types";
import fs from "fs/promises";
import path from "path";
import assert from "assert";

import { Plebbit } from "../../plebbit";
import { DbHandler } from "./db-handler";

import fetch from "node-fetch";
import { CID, create, Options } from "ipfs-http-client";

import all from "it-all";
import last from "it-last";
import { concat as uint8ArrayConcat } from "uint8arrays/concat";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { createCaptcha } from "captcha-canvas";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import FormData from "form-data";
import { Multiaddr } from "multiaddr";
import * as fileType from "file-type";
import { throwWithErrorCode } from "../../util";

const nativeFunctions: NativeFunctions = {
    createImageCaptcha: async (...args): Promise<{ image: string; text: string }> => {
        const { image, text } = createCaptcha(...args);

        const imageBase64 = (await image).toString("base64");

        return { image: imageBase64, text };
    },
    listSubplebbits: async (dataPath: string): Promise<string[]> => {
        assert(typeof dataPath === "string", "Data path is not defined");
        const subplebbitsPath = path.join(dataPath, "subplebbits");
        const dbHandler = new DbHandler({ address: "", plebbit: { dataPath: dataPath } }); // Hollow db handler created just to use lock functionality

        await fs.mkdir(subplebbitsPath, { recursive: true });

        const files = (await fs.readdir(subplebbitsPath, { withFileTypes: true }))
            .filter((file) => file.isFile()) // Filter directories out
            .filter((file) => !/-journal$/.test(file.name)) // Filter SQLite3 journal files out
            .map((file) => file.name);

        const filterResults = await Promise.all(
            files.map(async (address) => {
                const typeOfFile = await fileType.fromFile(path.join(subplebbitsPath, address));
                return typeOfFile?.mime === "application/x-sqlite3" && !(await dbHandler.isSubCreationLocked(address));
            })
        );

        const filtered_results = files.filter((_, i) => filterResults[i]);

        return filtered_results;
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

    //@ts-ignore
    fetch: async (...args) => {
        const res = await fetch(...args);
        const resObj = {};
        for (const property in res) resObj[property] = typeof res[property] === "function" ? res[property].bind(res) : res[property];

        return resObj;
    },
    createIpfsClient: (ipfsHttpClientOptions: Options): IpfsHttpClientPublicAPI => {
        const isHttpsAgent =
            (typeof ipfsHttpClientOptions.url === "string" && ipfsHttpClientOptions.url.startsWith("https")) ||
            ipfsHttpClientOptions?.protocol === "https" ||
            (ipfsHttpClientOptions.url instanceof URL && ipfsHttpClientOptions?.url?.protocol === "https:") ||
            (ipfsHttpClientOptions.url instanceof Multiaddr && ipfsHttpClientOptions.url.protoNames().includes("https"));
        const Agent = isHttpsAgent ? HttpsAgent : HttpAgent;

        const ipfsClient = create({
            ...ipfsHttpClientOptions,
            agent: ipfsHttpClientOptions.agent || new Agent({ keepAlive: true, maxSockets: Infinity })
        });

        const cat = async (...args: Parameters<IpfsHttpClientPublicAPI["cat"]>): Promise<string | undefined> => {
            const rawData = await all(ipfsClient.cat(...args));
            const data = uint8ArrayConcat(rawData);
            return uint8ArrayToString(data);
        };

        const resolveName = async (...args: Parameters<IpfsHttpClientPublicAPI["name"]["resolve"]>): Promise<string | undefined> => {
            return last(ipfsClient.name.resolve(...args));
        };

        const blockRm = async (...args: Parameters<IpfsHttpClientPublicAPI["block"]["rm"]>) => {
            const rmResults: { cid: CID; error?: Error }[] = [];
            for await (const res of ipfsClient.block.rm(...args)) rmResults.push(res);

            return rmResults;
        };

        const pinls = async (...args: Parameters<IpfsHttpClientPublicAPI["pin"]["ls"]>) => {
            return all(ipfsClient.pin.ls(...args));
        };

        const pinAddAll = async (...args: Parameters<IpfsHttpClientPublicAPI["pin"]["addAll"]>) => {
            return all(ipfsClient.pin.addAll(...args));
        };

        return {
            add: ipfsClient.add,
            cat: cat,
            pubsub: {
                subscribe: ipfsClient.pubsub.subscribe,
                unsubscribe: ipfsClient.pubsub.unsubscribe,
                publish: ipfsClient.pubsub.publish,
                ls: ipfsClient.pubsub.ls,
                peers: ipfsClient.pubsub.peers
            },
            name: {
                publish: ipfsClient.name.publish,
                resolve: resolveName
            },
            config: {
                get: ipfsClient.config.get
            },
            key: {
                list: ipfsClient.key.list,
                rm: ipfsClient.key.rm
            },
            pin: { rm: ipfsClient.pin.rm, ls: pinls, addAll: pinAddAll },
            block: { rm: blockRm },
            swarm: { peers: ipfsClient.swarm.peers }
        };
    },
    importSignerIntoIpfsNode: async (ipnsKeyName: string, ipfsKey: Uint8Array, plebbit: Plebbit): Promise<{ Id: string; Name: string }> => {
        const data = new FormData();
        if (typeof ipnsKeyName !== "string") throw Error("ipnsKeyName needs to be defined before importing key into IPFS node");
        if (!ipfsKey || ipfsKey.constructor?.name !== "Uint8Array" || ipfsKey.byteLength <= 0)
            throw Error("ipfsKey needs to be defined before importing key into IPFS node");

        data.append("file", Buffer.from(ipfsKey));
        const nodeUrl = plebbit.ipfsHttpClientsOptions[0]?.url;
        if (!nodeUrl)
            throw Error(`Can't figure out ipfs node URL from ipfsHttpClientOptions (${JSON.stringify(plebbit.ipfsHttpClientsOptions)}`);
        const url = `${nodeUrl}/key/import?arg=${ipnsKeyName}&ipns-base=b58mh`;
        const res = await nativeFunctions.fetch(url, {
            method: "POST",
            body: data,
            headers: <Record<string, string>>plebbit.ipfsHttpClientsOptions[0]?.headers // We're assuming that only IPFS one client will be used
        });

        if (res.status !== 200)
            throwWithErrorCode("ERR_FAILED_TO_IMPORT_IPFS_KEY", { url, status: res.status, statusText: res.statusText, ipnsKeyName });
        const resJson: { Id: string; Name: string } = await res.json();
        return resJson;
    },
    deleteSubplebbit: async (subplebbitAddress: string, dataPath: string) => {
        // Delete subplebbit will just move the sub db file to another directory
        const oldPath = path.join(dataPath, "subplebbits", subplebbitAddress);
        const newPath = path.join(dataPath, "subplebbits", "deleted", subplebbitAddress);
        await fs.mkdir(path.join(dataPath, "subplebbits", "deleted"), { recursive: true });
        await fs.rename(oldPath, newPath);
    }
};

export default nativeFunctions;
