import type { createHelia } from "helia";
import type { IpfsClient } from "../types";
import type { PubsubRoutingComponents } from "@helia/ipns/routing";

type IpnsForBrowser = Pick<IpfsClient["_client"]["name"], "resolve">;
export interface IpfsClientForBrowser extends Omit<IpfsClient, "_client"> {
    _client: {
        add: IpfsClient["_client"]["add"];
        name: IpnsForBrowser;
        cat: IpfsClient["_client"]["cat"];
        pubsub: IpfsClient["_client"]["pubsub"];
        stop: IpfsClient["_client"]["stop"];
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
