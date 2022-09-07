import { IpfsHttpClientPublicAPI, NativeFunctions } from "../../types";

import { create } from "ipfs-http-client";

import all from "it-all";
import last from "it-last";
import { concat as uint8ArrayConcat } from "uint8arrays/concat";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

const nativeFunctions: NativeFunctions = {
    listSubplebbits: async (dataPath: string): Promise<string[]> => {
        return [];
    },

    getDefaultDataPath: () => undefined,

    createDbHandler: (subplebbit) => {
        throw new Error("Shouldn't call createDbHandler over native-functions of browser");
    },

    //@ts-ignore
    fetch: (...args) => window.fetch(...args),
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
                resolve: ipfsClient.name.resolve
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
