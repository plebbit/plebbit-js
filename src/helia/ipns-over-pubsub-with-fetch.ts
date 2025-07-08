import { GetOptions as ipnsGetOptions, IPNSRouting, PutOptions } from "@helia/ipns/routing";
import Logger from "@plebbit/plebbit-logger";
import pLimit from "p-limit";
import pTimeout from "p-timeout";

import type { Fetch } from "@libp2p/fetch";
import { peerIdFromString } from "@libp2p/peer-id";
import type { HeliaWithLibp2pPubsub } from "./types.js";
import { binaryKeyToPubsubTopic, pubsubTopicToDhtKey, pubsubTopicToDhtKeyCid } from "../util.js";
import { PlebbitError } from "../plebbit-error.js";

const log = Logger("plebbit-js:helia:ipns:routing:pubsub-with-fetch");

export type PlebbitIpnsGetOptions = ipnsGetOptions & {
    ipnsName: string;
};

const PARALLEL_IPNS_OVER_PUBSUB_FETCH_LIMIT = 3;
const IPNS_FETCH_COOLOFF_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

// Infer types from the existing usage
type PeerId = ReturnType<typeof peerIdFromString>;

export class IpnsFetchRouter implements IPNSRouting {
    lastTimeFetchedIpnsRecord: Record<string, number> = {}; // key is the "heliaPeerId:topic", value is the timestamp when it was last fetched via libp2p/fetch
    _helia: HeliaWithLibp2pPubsub;
    _fetchService: Fetch;
    constructor(helia: HeliaWithLibp2pPubsub) {
        this._helia = helia;
        this._fetchService = <Fetch>helia.libp2p.services.fetch;
    }
    put(routingKey: Uint8Array, marshaledRecord: Uint8Array, options?: PutOptions): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private async _fetchFromPeer({
        peer,
        routingKey,
        topic,
        options
    }: {
        peer: PeerId;
        routingKey: Uint8Array;
        topic: string;
        options?: PlebbitIpnsGetOptions;
    }): Promise<Uint8Array> {
        // console.time("fetchFromPeer " + peer.toString() + " " + contentCidString);
        const contentCidString = pubsubTopicToDhtKeyCid(topic);
        console.log("Before fetchFromPeer " + peer.toString() + " " + contentCidString);
        const record = await pTimeout(this._fetchService.fetch(peer, routingKey, { signal: options?.signal }), {
            milliseconds: 10000
        });
        console.log("After fetchFromPeer " + peer.toString() + " " + contentCidString, "did it download a record?", !!record);
        // console.timeEnd("fetchFromPeer " + peer.toString() + " " + contentCidString);
        if (!record) {
            throw new PlebbitError("ERR_FETCH_OVER_IPNS_OVER_PUBSUB_RETURNED_UNDEFINED", {
                peerId: peer,
                routingKey,
                topic,
                contentCidString,
                options
            });
        }
        return record;
    }

    async _handleFetchingFromSubscribedPubsubPeers({
        routingKey,
        topic,
        pubsubSubscribers,
        options
    }: {
        routingKey: Uint8Array;
        topic: string;
        pubsubSubscribers: PeerId[];
        options: PlebbitIpnsGetOptions & { signal: AbortSignal; abortController: AbortController };
    }): Promise<Uint8Array> {
        const limit = pLimit(PARALLEL_IPNS_OVER_PUBSUB_FETCH_LIMIT);

        // We already have subscribers, no need to find providers
        log("Using", pubsubSubscribers.length, "existing pubsub subscribers for topic", topic);

        const promises = pubsubSubscribers.map((peer) =>
            limit(() =>
                this._fetchFromPeer({
                    peer,
                    routingKey,
                    topic,
                    options: options
                })
            )
                .then((result) => ({ success: true as const, result, peerId: peer }))
                .catch((error) => ({ success: false as const, error, peerId: peer }))
        );

        const peerIdToError: Record<string, Error> = {};
        // Keep racing until we get a success or all fail
        let ipnsRecordFromFetch: Uint8Array | undefined;
        for await (const outcome of promises) {
            const settled = await outcome;
            if (settled.success && "result" in settled) {
                ipnsRecordFromFetch = settled.result;
                options.abortController.abort(); // Cancel remaining operations
                limit.clearQueue();
                // Record successful fetch timestamp
                // this.lastTimeFetchedIpnsRecord[cooloffKey] = now;
                log("Fetched IPNS", options?.ipnsName, "record for topic", topic, "using pubsub subscribers");
                break;
            } else if ("error" in settled && settled.error) {
                // Track error by peer ID
                peerIdToError[settled.peerId.toString()] = settled.error;
            }
        }

        if (ipnsRecordFromFetch) {
            return ipnsRecordFromFetch;
        } else {
            throw new PlebbitError("ERR_FETCH_OVER_IPNS_OVER_PUBSUB_FAILED", {
                peerIdToError,
                topic,
                routingKey,
                options,
                fetchingFromGossipsubTopicSubscribers: true
            });
        }
    }

    async _handleFetchingFromProviders({
        routingKey,
        topic,
        options
    }: {
        routingKey: Uint8Array;
        topic: string;
        options: PlebbitIpnsGetOptions & { signal: AbortSignal; abortController: AbortController };
    }): Promise<Uint8Array> {
        const limit = pLimit(PARALLEL_IPNS_OVER_PUBSUB_FETCH_LIMIT);
        // No subscribers, need to find providers using content routing and process them as they come
        const pubsubTopicCid = pubsubTopicToDhtKeyCid(topic);

        const providerPromises: Promise<
            { success: true; result: Uint8Array; peerId: PeerId } | { success: false; error: Error; peerId: PeerId }
        >[] = [];

        let ipnsRecordFromFetch: Uint8Array | undefined;
        const peerIdToError: Record<string, Error> = {};

        // Process providers as they're discovered
        // TODO need to optimize this and make peers we already connected at the top
        for await (const peer of this._helia.libp2p.contentRouting.findProviders(pubsubTopicCid, options)) {
            if (ipnsRecordFromFetch) break; // Stop if we already found a record

            const promise = limit(() => this._fetchFromPeer({ peer: peer.id, routingKey, topic, options }))
                .then((result) => {
                    if (!ipnsRecordFromFetch) {
                        ipnsRecordFromFetch = result;
                        // this.lastTimeFetchedIpnsRecord[cooloffKey] = now;
                        log("Fetched IPNS", options?.ipnsName, "record for topic", topic, "using provider discovery");
                        // options.abortController.abort(); // Cancel remaining operations
                        limit.clearQueue();
                    }
                    return { success: true as const, result, peerId: peer.id };
                })
                .catch((error) => ({ success: false as const, error, peerId: peer.id }));

            providerPromises.push(promise);
        }

        // Wait for any remaining promises if we haven't found a record yet

        const allResults = await Promise.allSettled(providerPromises);
        for (const result of allResults) {
            if (result.status === "fulfilled" && result.value.success && "result" in result.value) {
                ipnsRecordFromFetch = result.value.result;
                // this.lastTimeFetchedIpnsRecord[cooloffKey] = now;
                log("Fetched IPNS", options?.ipnsName, "record for topic", topic, "using provider discovery");
                break;
            } else if (result.status === "fulfilled" && result.value.success && "error" in result.value && result.value.error) {
                // Handle case where fetchFromPeer succeeded but returned { success: false, error }
                peerIdToError[result.value.peerId.toString()] = result.value.error as Error;
            } else if (result.status === "rejected") {
                // Handle case where fetchFromPeer promise was rejected
                // Note: We can't track peerId for rejected promises since we lose the context
                log.trace("Promise rejected without peer context:", result.reason);
            }
        }

        if (ipnsRecordFromFetch) {
            return ipnsRecordFromFetch;
        } else {
            throw new PlebbitError("ERR_FETCH_OVER_IPNS_OVER_PUBSUB_FAILED", {
                peerIdToError,
                fetchingFromProviders: true,
                topic,
                routingKey,
                options
            });
        }
    }

    async get(routingKey: Uint8Array, options: PlebbitIpnsGetOptions): Promise<Uint8Array> {
        const topic = binaryKeyToPubsubTopic(routingKey);

        // Check if we should use libp2p/fetch based on cooloff period
        const now = Date.now();
        const cooloffKey = `${topic}`;
        const lastFetchTime = this.lastTimeFetchedIpnsRecord[cooloffKey];
        const shouldUseFetch = !lastFetchTime || now - lastFetchTime > IPNS_FETCH_COOLOFF_PERIOD_MS;

        if (!shouldUseFetch) {
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

        // First check if we already have pubsub subscribers
        const pubsubSubscribers: any[] = []; // will revert this later

        const abortController = new AbortController();
        const combinedSignal = options?.signal ? AbortSignal.any([options.signal, abortController.signal]) : abortController.signal;

        try {
            if (pubsubSubscribers.length > 0)
                return await this._handleFetchingFromSubscribedPubsubPeers({
                    routingKey,
                    topic,
                    pubsubSubscribers,
                    options: { ...options, signal: combinedSignal, abortController }
                });
            else
                return await this._handleFetchingFromProviders({
                    routingKey,
                    topic,
                    options: { ...options, signal: combinedSignal, abortController }
                });
        } catch (error) {
            //@ts-expect-error
            error.details = { ...error.details, topic, routingKey, options };
            log.trace("Error in get method:", error);
            throw error;
        } finally {
            abortController.abort(); // make sure to abort
        }
    }
}

export function createIpnsFetchRouter(helia: HeliaWithLibp2pPubsub): IPNSRouting {
    return new IpnsFetchRouter(helia);
}
