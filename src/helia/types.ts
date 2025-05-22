import type { createHelia } from "helia";
import type { KuboRpcClient, ParsedPlebbitOptions } from "../types";
import type { PubsubRoutingComponents } from "@helia/ipns/routing";
import type { ipns } from "@helia/ipns";
import { unixfs } from "@helia/unixfs";

export interface HeliaWithKuboRpcClientFunctions extends Pick<NonNullable<KuboRpcClient["_client"]>, "add" | "cat" | "pubsub" | "stop"> {
    add: KuboRpcClient["_client"]["add"];
    name: Pick<KuboRpcClient["_client"]["name"], "resolve">;
    cat: KuboRpcClient["_client"]["cat"];
    pubsub: KuboRpcClient["_client"]["pubsub"];
    stop: KuboRpcClient["_client"]["stop"];
}

type baseHelia = Awaited<ReturnType<typeof createHelia>>;

export interface HeliaWithLibp2pPubsub extends Awaited<ReturnType<typeof createHelia>> {
    libp2p: baseHelia["libp2p"] & {
        services: baseHelia["libp2p"]["services"] & {
            pubsub: PubsubRoutingComponents["libp2p"]["services"]["pubsub"];
        };
    };
}

export interface Libp2pJsClient {
    helia: HeliaWithLibp2pPubsub;
    heliaUnixfs: ReturnType<typeof unixfs>;
    heliaIpnsRouter: ReturnType<typeof ipns>;
    heliaWithKuboRpcClientFunctions: HeliaWithKuboRpcClientFunctions;
    libp2pJsClientOptions: NonNullable<ParsedPlebbitOptions["libp2pJsClientOptions"]>[number];
    mergedHeliaOptions: Parameters<typeof createHelia>[0]; // merged defaults with user input for helia and libp2p
}
