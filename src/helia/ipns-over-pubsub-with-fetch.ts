import { pubsub as ipnsPubsubRouter, PubsubRoutingComponents } from "@helia/ipns/routing";
import { CustomProgressEvent } from "progress-events";
import Logger from "@plebbit/plebbit-logger";
import pLimit from "p-limit";

import type { Fetch } from "@libp2p/fetch";
import type { HeliaWithLibp2pPubsub } from "./types.js";
import { binaryKeyToPubsubTopic, pubsubTopicToDhtKey } from "../util.js";
import { getPeersProvidingCid } from "./util.js";
import { PlebbitError } from "../plebbit-error.js";

const log = Logger("plebbit-js:helia:ipns:routing:pubsub-with-fetch");

const PARALLEL_IPNS_OVER_PUBSUB_FETCH_LIMIT = 3;

export function createPubsubRouterWithFetch(helia: HeliaWithLibp2pPubsub) {
    const originalRouter = ipnsPubsubRouter(helia);

    const libp2pFetchService = <Fetch>helia.libp2p.services.fetch;

    //@ts-expect-error
    const originalRouterPubsub = <PubsubRoutingComponents["libp2p"]["services"]["pubsub"]>originalRouter.pubsub;
    originalRouter.get = async function (routingKey, options) {
        try {
            const topic = binaryKeyToPubsubTopic(routingKey);

            let ipnsRecordFromFetch: Uint8Array | undefined;
            if (!originalRouterPubsub.getTopics().includes(topic)) {
                // Get peers providing this content
                const peersInPubsubTopic = await getPeersProvidingCid(helia, pubsubTopicToDhtKey(topic), options);

                if (peersInPubsubTopic.length > 0) {
                    const limit = pLimit(PARALLEL_IPNS_OVER_PUBSUB_FETCH_LIMIT);
                    const abortController = new AbortController();
                    const combinedSignal = options?.signal
                        ? AbortSignal.any([options.signal, abortController.signal])
                        : abortController.signal;

                    const fetchFromPeer = async (peer: (typeof peersInPubsubTopic)[0]) => {
                        await helia.libp2p.dial(peer.id, { signal: combinedSignal });
                        const record = await libp2pFetchService.fetch(peer.id, routingKey, { signal: combinedSignal });
                        if (!record) {
                            throw new PlebbitError("ERR_FETCH_OVER_IPNS_OVER_PUBSUB_RETURNED_UNDEFINED", {
                                peerId: peer.id,
                                routingKey,
                                topic,
                                options
                            });
                        }
                        return record;
                    };

                    try {
                        // Start all operations, resolve on first success
                        const promises = peersInPubsubTopic.map((peer) =>
                            limit(() => fetchFromPeer(peer))
                                .then((result) => ({ success: true, result }))
                                .catch((error) => ({ success: false, error }))
                        );

                        // Keep racing until we get a success or all fail
                        for await (const outcome of promises) {
                            const settled = await outcome;
                            if (settled.success && "result" in settled) {
                                ipnsRecordFromFetch = settled.result;
                                abortController.abort(); // Cancel remaining operations
                                log("Fetched IPNS record for topic", topic, "using parallel fetch");
                                break;
                            }
                        }
                    } catch (error) {
                        log.trace("All parallel fetch attempts failed");
                    }
                }

                log("add subscription for topic", topic);
                originalRouterPubsub.subscribe(topic);
                //@ts-expect-error
                this.subscriptions.push(topic);

                //@ts-expect-error
                options.onProgress?.(new CustomProgressEvent("ipns:pubsub-with-fetch:subscribe", { topic: topic }));

                if (ipnsRecordFromFetch) {
                    log("Successfully obtained IPNS record for topic", topic);
                } else {
                    log("Failed to fetch IPNS record for topic", topic, "Will be awaiting in the gossip topic, it may take 30s+");
                }
            }
            if (ipnsRecordFromFetch) return ipnsRecordFromFetch;

            //@ts-expect-error
            const { record } = await this.localStore.get(routingKey, options);

            return record;
        } catch (err) {
            //@ts-expect-error
            err.details = { ...err.details, routingKey, topic: topic, options };
            //@ts-expect-error
            options.onProgress?.(new CustomProgressEvent("ipns:pubsub-with-fetch:error", err));
            throw err;
        }
    };

    return originalRouter;
}
