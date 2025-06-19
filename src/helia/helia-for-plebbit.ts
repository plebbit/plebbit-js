import { createHelia } from "helia";
import { ipns } from "@helia/ipns";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { identify } from "@libp2p/identify";
import { CID } from "multiformats/cid";
import { peerIdFromString } from "@libp2p/peer-id";
import { bitswap } from "@helia/block-brokers";
import { MemoryBlockstore } from "blockstore-core";
import { createDelegatedRoutingV1HttpApiClient } from "@helia/delegated-routing-v1-http-api-client";
import { unixfs } from "@helia/unixfs";
import { fetch as libp2pFetch } from "@libp2p/fetch";
import { createPubsubRouterWithFetch } from "./ipns-over-pubsub-with-fetch.js";
import Logger from "@plebbit/plebbit-logger";
import type { AddResult, NameResolveOptions as KuboNameResolveOptions } from "kubo-rpc-client";
import type { IpfsHttpClientPubsubMessage, ParsedPlebbitOptions } from "../types.js";

import { EventEmitter } from "events";
import type { HeliaWithLibp2pPubsub } from "./types.js";
import { PlebbitError } from "../plebbit-error.js";
import { Libp2pJsClient } from "./libp2pjsClient.js";

const log = Logger("plebbit-js:libp2p-js");

const libp2pJsClients: Record<string, Libp2pJsClient> = {}; // key => plebbit.clients.libp2pJsClients[key]

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

export async function createLibp2pJsClientOrUseExistingOne(
    plebbitOptions: Required<Pick<ParsedPlebbitOptions, "httpRoutersOptions">> &
        NonNullable<ParsedPlebbitOptions["libp2pJsClientOptions"]>[number]
): Promise<Libp2pJsClient> {
    if (!plebbitOptions.httpRoutersOptions?.length) throw Error("You need to have plebbit.httpRouterOptions to set up helia");
    if (libp2pJsClients[plebbitOptions.key]) {
        libp2pJsClients[plebbitOptions.key].countOfUsesOfInstance++;
        return libp2pJsClients[plebbitOptions.key];
    }

    const mergedHeliaInit = {
        libp2p: {
            addresses: { listen: [] }, // TODO at some point we should use addresses, but right now it gets into an infinite loop with random walk
            services: {
                identify: identify(),
                pubsub: gossipsub(),
                fetch: libp2pFetch(),
                ...getDelegatedRoutingFields(plebbitOptions.httpRoutersOptions)
            },
            peerDiscovery: undefined,
            ...plebbitOptions.libp2pOptions
        },
        blockstore: new MemoryBlockstore(), // TODO use indexed db here
        blockBrokers: [bitswap()],
        start: false,
        ...plebbitOptions.heliaOptions
    } as Libp2pJsClient["_mergedHeliaOptions"];

    const helia = <HeliaWithLibp2pPubsub>await createHelia(mergedHeliaInit);

    //@ts-expect-error
    helia.routing.routers = [helia.routing.routers[0]]; // remove gateway routing

    log("Initialized libp2pjs helia with key", plebbitOptions.key, "peer id", helia.libp2p.peerId.toString());

    const pubsubEventHandler = new EventEmitter();

    helia.libp2p.services.pubsub.addEventListener("message", (evt) => {
        log.trace(`Event from helia libp2p pubsub:`, `on topic ${evt.detail.topic}`);

        //@ts-expect-error
        const msgFormatted: IpfsHttpClientPubsubMessage = { data: evt.detail.data, topic: evt.detail.topic, type: evt.detail.type };
        pubsubEventHandler.emit(evt.detail.topic, msgFormatted);
    });

    const heliaFs = unixfs(helia);

    const ipnsNameResolver = ipns(helia, {
        routers: [createPubsubRouterWithFetch(helia)]
    });

    //@ts-expect-error
    ipnsNameResolver.routers = ipnsNameResolver.routers.slice(1); // remove gateway ipns routing and keep only pubsub

    const throwIfHeliaIsStoppingOrStopped = () => {
        if (helia.libp2p.status === "stopped" || helia.libp2p.status === "stopping")
            throw new PlebbitError("ERR_HELIAS_STOPPING_OR_STOPPED", {
                heliaStatus: helia.libp2p.status,
                heliaKey: plebbitOptions.key,
                heliaPeerId: helia.libp2p.peerId.toString(),
                helia
            });
    };

    const ipnsPubsubAbortControllers: Record<string, AbortController> = {}; // abort id => abort signal
    const heliaWithKuboRpcClientShape: Libp2pJsClient["heliaWithKuboRpcClientFunctions"] = {
        name: {
            resolve: (ipnsName: string, options?: KuboNameResolveOptions) => {
                // Create an async generator function
                throwIfHeliaIsStoppingOrStopped();
                async function* generator() {
                    const ipnsNameAsPeerId = typeof ipnsName === "string" ? peerIdFromString(ipnsName) : ipnsName;
                    const abortId = String(Math.random());
                    const abortSignal = new AbortController();
                    ipnsPubsubAbortControllers[abortId] = abortSignal;
                    log.trace("Resolving ipns name", ipnsName, "with options", options);
                    try {
                        const result = await ipnsNameResolver.resolve(ipnsNameAsPeerId.toMultihash(), {
                            ...options,
                            signal: abortSignal.signal
                        });
                        yield result.record.value;
                        return;
                    } catch (err) {
                        const error = <Error>err;
                        if (error.name === "NotFoundError")
                            throw new PlebbitError("ERR_RESOLVED_IPNS_P2P_TO_UNDEFINED", {
                                heliaError: err,
                                ipnsName,
                                ipnsResolveOptions: options
                            });
                        else throw err;
                    } finally {
                        delete ipnsPubsubAbortControllers[abortId];
                    }
                }

                return generator();
            }
        },
        cat(ipfsPath: string, options) {
            throwIfHeliaIsStoppingOrStopped();
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
                throwIfHeliaIsStoppingOrStopped();
                const res = await helia.libp2p.services.pubsub.publish(topic, data);
                log("Published new data to topic", topic, "And the result is", res);
            },
            subscribe: async (topic, handler, options) => {
                throwIfHeliaIsStoppingOrStopped();
                //@ts-expect-error
                pubsubEventHandler.on(topic, handler);
                helia.libp2p.services.pubsub.subscribe(topic);
            },
            unsubscribe: async (topic, handler, options) => {
                throwIfHeliaIsStoppingOrStopped();
                //@ts-expect-error
                pubsubEventHandler.removeListener(topic, handler);
                if (pubsubEventHandler.listenerCount(topic) === 0) helia.libp2p.services.pubsub.unsubscribe(topic);
            }
        },
        async add(
            entry: Parameters<Libp2pJsClient["heliaWithKuboRpcClientFunctions"]["add"]>[0], // More specific types will be checked internally
            options?: Parameters<Libp2pJsClient["heliaWithKuboRpcClientFunctions"]["add"]>[1]
        ): Promise<AddResult> {
            throw Error("Helia 'add' is not supported");
        },
        async stop(options) {
            libp2pJsClients[plebbitOptions.key].countOfUsesOfInstance--;
            if (libp2pJsClients[plebbitOptions.key].countOfUsesOfInstance === 0) {
                Object.entries(ipnsPubsubAbortControllers).forEach(([key, abortController]) => {
                    abortController.abort("Aborting ipns pubsub because we're stopping helia instance");
                    delete ipnsPubsubAbortControllers[key];
                });
                for (const topic of helia.libp2p.services.pubsub.getTopics()) helia.libp2p.services.pubsub.unsubscribe(topic);
                try {
                    await helia.stop();
                } catch (e) {
                    log.error("Error stopping helia", e);
                }

                delete libp2pJsClients[plebbitOptions.key];
                log("Helia/libp2p-js stopped with key", plebbitOptions.key, "and peer id", helia.libp2p.peerId.toString());
            }
        }
    };

    const fullInstanceWithOptions = {
        helia,
        heliaWithKuboRpcClientFunctions: heliaWithKuboRpcClientShape,
        heliaUnixfs: heliaFs,
        heliaIpnsRouter: ipnsNameResolver,
        mergedHeliaOptions: mergedHeliaInit,
        countOfUsesOfInstance: 1,
        libp2pJsClientOptions: plebbitOptions,
        key: plebbitOptions.key
    };

    libp2pJsClients[plebbitOptions.key] = new Libp2pJsClient(fullInstanceWithOptions);

    await helia.start();
    log("Helia/libp2p-js started with key", plebbitOptions.key, "and peer id", helia.libp2p.peerId.toString());

    return libp2pJsClients[plebbitOptions.key];
}
