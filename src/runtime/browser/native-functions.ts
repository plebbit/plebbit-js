import { IpfsHttpClientPublicAPI, NativeFunctions } from "../../types";

import { default as nodeFetch } from "node-fetch";
import { create } from "ipfs-http-client";

const nativeFunctions: NativeFunctions = {
    listSubplebbits: async (dataPath: string): Promise<string[]> => {
        throw new Error("Shouldn't call listSubplebbits over native-functions of browser");
    },

    createDbHandler: (subplebbit) => {
        throw new Error("Shouldn't call createDbHandler over native-functions of browser");
    },

    //@ts-ignore
    fetch: nodeFetch,
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
