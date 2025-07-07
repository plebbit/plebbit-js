import {
    pubsub as ipnsPubsubRouter,
    PubsubRoutingComponents,
    GetOptions as ipnsGetOptions,
    IPNSRouting,
    PutOptions
} from "@helia/ipns/routing";
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

const PARALLEL_IPNS_OVER_PUBSUB_FETCH_LIMIT = 3;
const IPNS_FETCH_COOLOFF_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

export class IpnsFetchRouter implements IPNSRouting {
    lastTimeFetchedIpnsRecord: Record<string, number> = {}; // key is the "heliaPeerId:topic", value is the timestamp when it was last fetched via libp2p/fetch
    _helia: HeliaWithLibp2pPubsub;
    constructor(helia: HeliaWithLibp2pPubsub) {
        this._helia = helia;
    }
    put(routingKey: Uint8Array, marshaledRecord: Uint8Array, options?: PutOptions): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async get(routingKey: Uint8Array, options?: PlebbitIpnsGetOptions): Promise<Uint8Array> {
        const libp2pFetchService = <Fetch>this._helia.libp2p.services.fetch;
        const topic = binaryKeyToPubsubTopic(routingKey);
        try {
            let ipnsRecordFromFetch: Uint8Array | undefined;

            // Check if we should use libp2p/fetch based on cooloff period
            const now = Date.now();
            const cooloffKey = `${topic}`;
            const lastFetchTime = this.lastTimeFetchedIpnsRecord[cooloffKey];
            const shouldUseFetch = !lastFetchTime || now - lastFetchTime > IPNS_FETCH_COOLOFF_PERIOD_MS;

            if (shouldUseFetch) {
                // Get peers providing this content
                const peersInPubsubTopic = await getPeersProvidingCid(this._helia, pubsubTopicToDhtKey(topic), options);

                if (peersInPubsubTopic.length > 0) {
                    const limit = pLimit(PARALLEL_IPNS_OVER_PUBSUB_FETCH_LIMIT);
                    const abortController = new AbortController();
                    const combinedSignal = options?.signal
                        ? AbortSignal.any([options.signal, abortController.signal])
                        : abortController.signal;

                    const fetchFromPeer = async (peer: (typeof peersInPubsubTopic)[0]) => {
                        // await this._helia.libp2p.dial(peer.id, { signal: combinedSignal });
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
                                this.lastTimeFetchedIpnsRecord[cooloffKey] = now;
                                log("Fetched IPNS", options?.ipnsName, "record for topic", topic, "using parallel fetch");
                                break;
                            }
                        }
                    } catch (error) {
                        log.trace("All parallel fetch attempts failed of IPNS", options?.ipnsName, "for topic", topic);
                    }
                }
            } else {
                log(
                    "Skipping libp2p/fetch for topic",
                    topic,
                    "and IPNS",
                    options?.ipnsName,
                    "due to cooloff period (last fetch was",
                    Math.round((now - lastFetchTime) / 1000),
                    "seconds ago)"
                );
                throw new Error("Already loaded via libp2p/fetch, should await for updates in gossipsub topic");
            }

            if (ipnsRecordFromFetch) return ipnsRecordFromFetch;

            // If no record found, throw an error
            throw new Error(`No IPNS record found for topic ${topic} using fetch`);
        } catch (error) {
            //@ts-expect-error
            error.details = { ...error.details, topic, routingKey, options };
            log.trace("Error in get method:", error);
            throw error;
        }
    }
}

export function createIpnsFetchRouter(helia: HeliaWithLibp2pPubsub): IPNSRouting {
    return new IpnsFetchRouter(helia);
}
