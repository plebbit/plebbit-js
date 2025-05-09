import { createHelia } from "helia";
import { ipns } from "@helia/ipns";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { identify } from "@libp2p/identify";
import { CID } from "multiformats/cid";
import { peerIdFromString } from "@libp2p/peer-id";
import { bitswap } from "@helia/block-brokers";
import { MemoryBlockstore } from "blockstore-core";
import { createEd25519PeerId } from "@libp2p/peer-id-factory";
import { createDelegatedRoutingV1HttpApiClient } from "@helia/delegated-routing-v1-http-api-client";
import { unixfs } from "@helia/unixfs";
import { fetch as libp2pFetch } from "@libp2p/fetch";
import { createPubsubRouterWithFetch } from "./ipns-over-pubsub-with-fetch.js";
import Logger from "@plebbit/plebbit-logger";
import type { IpfsHttpClientPubsubMessage, ParsedPlebbitOptions } from "../types.js";

import { EventEmitter } from "events";
import type { HeliaWithLibp2pPubsub, IpfsClientForBrowser } from "./types.js";
import type { NameResolveOptions } from "kubo-rpc-client";
import { CustomEvent as CustomEventFromLibp2p } from "@libp2p/interfaces/events";

const log = Logger("plebbit-js:helia-browser");

let heliaBrowserClient: IpfsClientForBrowser;

function getDelegatedRoutingFields(routers: string[]) {
    const routersObj: Record<string, ReturnType<typeof createDelegatedRoutingV1HttpApiClient>> = {};
    for (let i = 0; i < routers.length; i++) {
        const routingClient = createDelegatedRoutingV1HttpApiClient(routers[i]);
        //@ts-expect-error
        routingClient.getIPNS = routingClient.getPeers = routingClient.putIPNS = undefined; // our routers don't support any of these
        //@ts-expect-error
        routersObj["delegatedRouting" + i] = () => routingClient;
    }
    return routersObj;
}

export async function createHeliaNode(
    plebbitOptions: Required<Pick<ParsedPlebbitOptions, "httpRoutersOptions">>
): Promise<IpfsClientForBrowser> {
    if (heliaBrowserClient) return heliaBrowserClient;
    if (!plebbitOptions.httpRoutersOptions?.length) throw Error("You need to have plebbit.httpRouterOptions to set up helia");

    if (!global.CustomEvent) global.CustomEvent = CustomEventFromLibp2p;

    // const peerId = await createEd25519PeerId();
    const helia = <HeliaWithLibp2pPubsub>await createHelia({
        libp2p: {
            peerId: peerId, // TODO use indexed db here
            addresses: {
                listen: [] // Empty for browser environment
            },
            services: {
                identify: identify(),
                pubsub: gossipsub(),
                fetch: libp2pFetch(),
                ...getDelegatedRoutingFields(plebbitOptions.httpRoutersOptions)
            },
            peerDiscovery: undefined
        },
        blockstore: new MemoryBlockstore(), // TODO use indexed db here
        blockBrokers: [bitswap()],
        start: false
    });

    //@ts-expect-error
    helia.routing.routers = [helia.routing.routers[0]]; // remove gateway routing

    log("Initialized helia in browser", helia.libp2p.peerId.toString());

    const pubsubEventHandler = new EventEmitter();

    helia.libp2p.services.pubsub.addEventListener("message", (evt) => {
        //@ts-expect-error
        log(`Event from helia libp2p pubsub in browser:`, `${evt.detail["from"]}: on topic ${evt.detail.topic}`);

        //@ts-expect-error
        const msgFormatted: IpfsHttpClientPubsubMessage = { data: evt.detail.data, topic: evt.detail.topic, type: evt.detail.type };
        pubsubEventHandler.emit(evt.detail.topic, msgFormatted);
    });

    const heliaFs = unixfs(helia);

    const ipnsNameResolver = ipns(helia, {
        routers: [createPubsubRouterWithFetch(helia)]
    });

    //@ts-expect-error
    ipnsNameResolver.routers = ipnsNameResolver.routers.slice(1); // remove gateway ipns routing

    const ipfsClientForBrowesr: IpfsClientForBrowser["_client"] = {
        name: {
            resolve: (ipnsName: string, options?: NameResolveOptions | undefined) => {
                // Create an async generator function
                async function* generator() {
                    const ipnsNameAsPeerId = typeof ipnsName === "string" ? peerIdFromString(ipnsName) : ipnsName;
                    const result = await ipnsNameResolver.resolve(ipnsNameAsPeerId.toMultihash(), options);
                    yield result.record.value;
                    return;
                }

                return generator();
            }
        },
        cat(ipfsPath: string, options) {
            // ipfsPath could be a string of cid or ipfs path
            if (ipfsPath.includes("/")) {
                // it's a path <root-cid>/<path>/
                const rootCid = ipfsPath.split("/")[0];
                const path = ipfsPath.split("/").slice(1).join("/");
                return heliaFs.cat(CID.parse(rootCid), { ...options, path });
            } else {
                // a cid string
                return heliaFs.cat(CID.parse(ipfsPath), options);
            }
        },
        pubsub: {
            ls: async () => helia.libp2p.services.pubsub.getTopics(),
            peers: async (topic, options) => helia.libp2p.services.pubsub.getSubscribers(topic),
            publish: async (topic, data, options) => {
                const res = await helia.libp2p.services.pubsub.publish(topic, data);
                log("Published new data to topic", topic, "And the result is", res);
            },
            subscribe: async (topic, handler, options) => {
                //@ts-expect-error
                pubsubEventHandler.on(topic, handler);
                helia.libp2p.services.pubsub.subscribe(topic);
            },
            unsubscribe: async (topic, handler, options) => {
                //@ts-expect-error
                pubsubEventHandler.removeListener(topic, handler);
                if (pubsubEventHandler.listenerCount(topic) === 0) helia.libp2p.services.pubsub.unsubscribe(topic);
            }
        },
        add(entry, options) {
            throw Error("Adding files to helia node is not supported at the moment");
        },
        stop(options) {
            return helia.stop();
        }
    };

    heliaBrowserClient = {
        _client: ipfsClientForBrowesr,
        //@ts-expect-error
        _clientOptions: undefined, // TODO not sure if it should be undefined
        peers: async () =>
            helia.libp2p.getConnections().map((conn) => ({ ...conn, peer: conn.remotePeer, addr: conn.remoteAddr, streams: undefined }))
    };

    await helia.start();

    return heliaBrowserClient;
}
