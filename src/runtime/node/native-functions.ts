import { DbHandlerPublicAPI, IpfsHttpClientPublicAPI, NativeFunctions } from "../../types";
import fs from "fs/promises";
import path from "path";
import assert from "assert";
import os from "os";
import lodash from "lodash";

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
import * as fileType from "file-type";
import { throwWithErrorCode } from "../../util";
import { Plebbit } from "../../plebbit";
import { deleteOldSubplebbitInWindows } from "./util";
import { STORAGE_KEYS } from "../../constants";
import Logger from "@plebbit/plebbit-logger";

const nativeFunctions: NativeFunctions = {
    createImageCaptcha: async (...args): Promise<{ image: string; text: string }> => {
        const { image, text } = createCaptcha(...args);

        const imageBase64 = (await image).toString("base64");

        return { image: imageBase64, text };
    },
    listSubplebbits: async (dataPath: string, plebbit: Plebbit): Promise<string[]> => {
        assert(typeof dataPath === "string", "Data path is not defined");
        const log = Logger("plebbit-js:listSubplebbits");
        const subplebbitsPath = path.join(dataPath, "subplebbits");

        await fs.mkdir(subplebbitsPath, { recursive: true });

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

        const files = (await fs.readdir(subplebbitsPath, { withFileTypes: true }))
            .filter((file) => file.isFile()) // Filter directories out
            .filter((file) => !/-journal$/.test(file.name)) // Filter SQLite3 journal files out
            .map((file) => file.name);

        const filterResults = await Promise.all(
            files.map(async (address) => {
                if (Array.isArray(deletedPersistentSubs) && deletedPersistentSubs.includes(address)) return false;
                const typeOfFile = await fileType.fromFile(path.join(subplebbitsPath, address));
                return typeOfFile?.mime === "application/x-sqlite3";
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
            (ipfsHttpClientOptions.url?.toString()?.includes("https"));
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
            pin: { rm: ipfsClient.pin.rm, ls: ipfsClient.pin.ls, addAll: pinAddAll },
            block: { rm: blockRm },
            swarm: { peers: ipfsClient.swarm.peers },
            files: ipfsClient.files
        };
    },
    importSignerIntoIpfsNode: async (
        ipnsKeyName: string,
        ipfsKey: Uint8Array,
        ipfsNode: { url: string; headers?: Object }
    ) => {
        const data = new FormData();
        if (typeof ipnsKeyName !== "string") throw Error("ipnsKeyName needs to be defined before importing key into IPFS node");
        if (!ipfsKey || ipfsKey.constructor?.name !== "Uint8Array" || ipfsKey.byteLength <= 0)
            throw Error("ipfsKey needs to be defined before importing key into IPFS node");

        data.append("file", Buffer.from(ipfsKey));
        const nodeUrl = ipfsNode.url;
        if (!nodeUrl) throw Error(`Can't figure out ipfs node URL from ipfsNode (${JSON.stringify(ipfsNode)}`);
        const url = `${nodeUrl}/key/import?arg=${ipnsKeyName}&ipns-base=b58mh`;
        const res = await nativeFunctions.fetch(url, {
            method: "POST",
            body: data,
            headers: <Record<string, string>>ipfsNode?.headers // We're assuming that only IPFS one client will be used
        });

        if (res.status !== 200)
            throwWithErrorCode("ERR_FAILED_TO_IMPORT_IPFS_KEY", { url, status: res.status, statusText: res.statusText, ipnsKeyName });
        const resJson: { Id: string; Name: string } = await res.json();

        return { id: resJson.Id, name: resJson.Name };
    },
    deleteSubplebbit: async (subplebbitAddress: string, dataPath: string, plebbit: Plebbit) => {
        // Delete subplebbit will just move the sub db file to another directory
        const oldPath = path.join(dataPath, "subplebbits", subplebbitAddress);
        const newPath = path.join(dataPath, "subplebbits", "deleted", subplebbitAddress);
        await fs.mkdir(path.join(dataPath, "subplebbits", "deleted"), { recursive: true });
        await fs.cp(oldPath, newPath);
        if (os.type() === "Windows_NT") await deleteOldSubplebbitInWindows(oldPath, plebbit);
        else await fs.rm(oldPath);
    }
};

export default nativeFunctions;
