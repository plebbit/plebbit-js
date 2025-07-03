import { pubsub as ipnsPubsubRouter, PubsubRoutingComponents, GetOptions as ipnsGetOptions } from "@helia/ipns/routing";
import { CustomProgressEvent } from "progress-events";
import Logger from "@plebbit/plebbit-logger";
import pLimit from "p-limit";

import type { Fetch } from "@libp2p/fetch";
import type { HeliaWithLibp2pPubsub } from "./types.js";
import { binaryKeyToPubsubTopic, pubsubTopicToDhtKey } from "../util.js";
import { getPeersProvidingCid } from "./util.js";
import { PlebbitError } from "../plebbit-error.js";

const log = Logger("plebbit-js:helia:ipns:routing:pubsub-with-fetch");

export type PlebbitIpnsGetOptions = ipnsGetOptions & {
    ipnsName: string;
};

const lastTimeFetchedIpnsRecord: Record<string, number> = {}; // key is the "heliaPeerId:topic", value is the timestamp when it was last fetched via libp2p/fetch

const PARALLEL_IPNS_OVER_PUBSUB_FETCH_LIMIT = 3;
const IPNS_FETCH_COOLOFF_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

export function createPubsubRouterWithFetch(helia: HeliaWithLibp2pPubsub) {
    const originalRouter = ipnsPubsubRouter(helia);

    const libp2pFetchService = <Fetch>helia.libp2p.services.fetch;

    //@ts-expect-error
    const originalRouterPubsub = <PubsubRoutingComponents["libp2p"]["services"]["pubsub"]>originalRouter.pubsub;
    originalRouter.get = async function (routingKey, options: PlebbitIpnsGetOptions) {
        try {
            const topic = binaryKeyToPubsubTopic(routingKey);

            let ipnsRecordFromFetch: Uint8Array | undefined;

            // Check if we should use libp2p/fetch based on cooloff period
            const now = Date.now();
            const cooloffKey = `${helia.libp2p.peerId.toString()}:${topic}`;
            const lastFetchTime = lastTimeFetchedIpnsRecord[cooloffKey];
            const shouldUseFetch = !lastFetchTime || now - lastFetchTime > IPNS_FETCH_COOLOFF_PERIOD_MS;

            if (shouldUseFetch) {
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
                                // Record successful fetch timestamp
                                lastTimeFetchedIpnsRecord[cooloffKey] = now;
                                log("Fetched IPNS", options.ipnsName, "record for topic", topic, "using parallel fetch");
                                break;
                            }
                        }
                    } catch (error) {
                        log.trace("All parallel fetch attempts failed of IPNS", options.ipnsName, "for topic", topic);
                    }
                }
            } else {
                log(
                    "Skipping libp2p/fetch for topic",
                    topic,
                    "and IPNS",
                    options.ipnsName,
                    "due to cooloff period (last fetch was",
                    Math.round((now - lastFetchTime) / 1000),
                    "seconds ago)"
                );
            }

            // Always subscribe to pubsub if not already subscribed
            if (!originalRouterPubsub.getTopics().includes(topic)) {
                log("add subscription for topic", topic);
                originalRouterPubsub.subscribe(topic);
                //@ts-expect-error
                this.subscriptions.push(topic);

                options.onProgress?.(new CustomProgressEvent("ipns:pubsub-with-fetch:subscribe", { topic: topic }));
            }

            if (ipnsRecordFromFetch) {
                log("Successfully obtained IPNS", options.ipnsName, "record for topic", topic);
                return ipnsRecordFromFetch;
            } else if (shouldUseFetch) {
                log(
                    "Failed to fetch IPNS",
                    options.ipnsName,
                    "record for topic",
                    topic,
                    "Will be awaiting in the gossip topic, it may take 30s+"
                );
            }

            //@ts-expect-error
            const { record } = await this.localStore.get(routingKey, options);

            return record;
        } catch (err) {
            //@ts-expect-error
            err.details = { ...err.details, routingKey, topic: topic, options };
            options.onProgress?.(new CustomProgressEvent("ipns:pubsub-with-fetch:error", err));
            throw err;
        }
    };

    return originalRouter;
}
