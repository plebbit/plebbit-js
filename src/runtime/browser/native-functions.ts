import { IpfsHttpClientPublicAPI, NativeFunctions } from "../../types";

import { CID, create, Options } from "ipfs-http-client";

import all from "it-all";
import last from "it-last";
import { concat as uint8ArrayConcat } from "uint8arrays/concat";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

const nativeFunctions: NativeFunctions = {
    createImageCaptcha: async (...args): Promise<{ image: string; text: string }> => {
        throw Error("Shouldn't call createImageCaptcha over native-functions of browser");
    },
    listSubplebbits: async (dataPath: string): Promise<string[]> => {
        return [];
    },

    //@ts-ignore
    fetch: (...args) => window.fetch(...args),
    createIpfsClient: (ipfsHttpClientOptions: Options): IpfsHttpClientPublicAPI => {
        const ipfsClient = create(ipfsHttpClientOptions);

        const cat = async (...args: Parameters<IpfsHttpClientPublicAPI["cat"]>): Promise<string | undefined> => {
            const rawData = await all(ipfsClient.cat(...args));
            const data = uint8ArrayConcat(rawData);
            return uint8ArrayToString(data);
        };

        const resolveName = async (...args: Parameters<IpfsHttpClientPublicAPI["name"]["resolve"]>) => {
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
    importSignerIntoIpfsNode: async () => {
        throw Error("Shouldn't call importSignerIntoIpfsNode over native-functions of browser");
    }
};

export default nativeFunctions;
