import type { createHelia } from "helia";
import type { KuboRpcClient } from "../types.js";
import type { PubsubRoutingComponents } from "@helia/ipns/routing";

export interface HeliaWithKuboRpcClientFunctions extends Pick<NonNullable<KuboRpcClient["_client"]>, "add" | "cat" | "pubsub" | "stop"> {
    add: KuboRpcClient["_client"]["add"];
    name: Pick<KuboRpcClient["_client"]["name"], "resolve">;
    cat: KuboRpcClient["_client"]["cat"];
    pubsub: KuboRpcClient["_client"]["pubsub"];
    stop: KuboRpcClient["_client"]["stop"];
}

type baseHelia = Awaited<ReturnType<typeof createHelia>>;

export interface HeliaWithLibp2pPubsub extends baseHelia {
    libp2p: baseHelia["libp2p"] & {
        services: baseHelia["libp2p"]["services"] & {
            pubsub: PubsubRoutingComponents["libp2p"]["services"]["pubsub"];
        };
    };
}
