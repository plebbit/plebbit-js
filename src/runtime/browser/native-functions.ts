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

    createDbHandler: (subplebbit) => {
        throw new Error("Shouldn't call createDbHandler over native-functions of browser");
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

        const resolveName = async (...args: Parameters<IpfsHttpClientPublicAPI["resolveName"]>) => {
            return last(ipfsClient.name.resolve(...args));
        };
        return {
            add: ipfsClient.add,
            pubsubSubscribe: ipfsClient.pubsub.subscribe,
            pubsubUnsubscribe: ipfsClient.pubsub.unsubscribe,
            pubsubPublish: ipfsClient.pubsub.publish,
            publishName: ipfsClient.name.publish,
            getConfig: ipfsClient.config.get,
            listKeys: ipfsClient.key.list,
            cat,
            resolveName
        };
    }
};

export default nativeFunctions;
