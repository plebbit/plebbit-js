import type { createHelia } from "helia";
import type { KuboRpcClient } from "../types";
import type { PubsubRoutingComponents } from "@helia/ipns/routing";

type IpnsForBrowser = Pick<KuboRpcClient["_client"]["name"], "resolve">;
export interface IpfsClientForBrowser extends Omit<KuboRpcClient, "_client"> {
    _client: {
        add: KuboRpcClient["_client"]["add"];
        name: IpnsForBrowser;
        cat: KuboRpcClient["_client"]["cat"];
        pubsub: KuboRpcClient["_client"]["pubsub"];
        stop: KuboRpcClient["_client"]["stop"];
    };
}

type baseHelia = Awaited<ReturnType<typeof createHelia>>;

export interface HeliaWithLibp2pPubsub extends Awaited<ReturnType<typeof createHelia>> {
    libp2p: baseHelia["libp2p"] & {
        services: baseHelia["libp2p"]["services"] & {
            pubsub: PubsubRoutingComponents["libp2p"]["services"]["pubsub"];
        };
    };
}
