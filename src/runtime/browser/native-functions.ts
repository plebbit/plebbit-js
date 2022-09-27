import { IpfsHttpClientPublicAPI, NativeFunctions } from "../../types";

import { create } from "ipfs-http-client";

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

    createDbHandler: (subplebbit) => {
        throw Error("Shouldn't call createDbHandler over native-functions of browser");
    },

    //@ts-ignore
    fetch: (...args) => window.fetch(...args),
    createIpfsClient: (ipfsHttpClientOptions): IpfsHttpClientPublicAPI => {
        const ipfsClient = create(ipfsHttpClientOptions);

        const cat = async (...args: Parameters<IpfsHttpClientPublicAPI["cat"]>): Promise<string | undefined> => {
            const rawData = await all(ipfsClient.cat(...args));
            const data = uint8ArrayConcat(rawData);
            return uint8ArrayToString(data);
        };

        const resolveName = async (...args: Parameters<IpfsHttpClientPublicAPI["name"]["resolve"]>) => {
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
    }
};

export default nativeFunctions;
