import { GetOptions as ipnsGetOptions, IPNSRouting, PutOptions } from "@helia/ipns/routing";
import Logger from "@plebbit/plebbit-logger";
import pLimit from "p-limit";
import pTimeout from "p-timeout";

import type { Fetch } from "@libp2p/fetch";
import { peerIdFromString } from "@libp2p/peer-id";
import type { HeliaWithLibp2pPubsub } from "./types.js";
import { binaryKeyToPubsubTopic, pubsubTopicToDhtKey, pubsubTopicToDhtKeyCid } from "../util.js";
import { PlebbitError } from "../plebbit-error.js";
import { CID } from "kubo-rpc-client";

const log = Logger("plebbit-js:helia:ipns:routing:pubsub-with-fetch");

export type PlebbitIpnsGetOptions = ipnsGetOptions & {
    ipnsName: string;
};

const PARALLEL_IPNS_OVER_PUBSUB_FETCH_LIMIT = 1;
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
        const contentCidString = pubsubTopicToDhtKeyCid(topic);

        // Check if already aborted
        if (options?.signal?.aborted) {
            throw new Error("Fetch aborted");
        }

        console.log("Before fetchFromPeer " + peer.toString() + " " + contentCidString);

        // Check again after delay
        if (options?.signal?.aborted) {
            throw new Error("Fetch aborted");
        }

        const record = await pTimeout(this._fetchService.fetch(peer, routingKey), {
            milliseconds: 6000,
            signal: options?.signal
        });

        console.log("After fetchFromPeer " + peer.toString() + " " + contentCidString, "did it download a record?", !!record);

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

        // Create individual abort controllers for each fetch
        const fetchAbortControllers: AbortController[] = [];

        const peerIdToError: Record<string, Error> = {};
        let ipnsRecordFromFetch: Uint8Array | undefined;

        // With p-limit(1), we execute sequentially, so we can try subscribers one by one
        // and stop as soon as we get a successful result
        try {
            for (const peer of pubsubSubscribers) {
                if (ipnsRecordFromFetch) {
                    break; // Already got a result, stop trying more subscribers
                }

                const peerAbortController = new AbortController();
                fetchAbortControllers.push(peerAbortController);

                const combinedSignal = AbortSignal.any([options.signal, peerAbortController.signal]);

                try {
                    const result = await limit(() =>
                        this._fetchFromPeer({
                            peer,
                            routingKey,
                            topic,
                            options: { ...options, signal: combinedSignal }
                        })
                    );
                    ipnsRecordFromFetch = result;
                    log("Fetched IPNS", options?.ipnsName, "record for topic", topic, "using pubsub subscribers");
                    break; // Success! Stop trying more subscribers
                } catch (error) {
                    peerIdToError[peer.toString()] = error as Error;
                    // Continue to next subscriber
                }
            }
        } finally {
            // Clean up any remaining abort controllers
            fetchAbortControllers.forEach((controller) => controller.abort());
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
        const pubsubTopicCidString = pubsubTopicToDhtKey(topic);
        const pubsubTopicCid = CID.parse(pubsubTopicToDhtKey(topic));

        let ipnsRecordFromFetch: Uint8Array | undefined;
        const peerIdToError: Record<string, Error> = {};

        // Create individual abort controllers for each fetch
        const fetchAbortControllers: AbortController[] = [];

        const fetchFromIpnsPeerInLimit = async (peer: PeerId, peerAbortController: AbortController) => {
            if (ipnsRecordFromFetch) throw Error("Already fetched IPNS record");

            // Create combined signal that includes the peer-specific abort controller
            const combinedSignal = AbortSignal.any([options.signal, peerAbortController.signal]);

            return this._fetchFromPeer({
                peer,
                routingKey,
                topic,
                options: { ...options, signal: combinedSignal }
            });
        };

        const cleanUp = () => {
            findProvidersAbortController.abort();
            fetchAbortControllers.forEach((controller) => controller.abort());
        };

        const findProvidersAbortController = new AbortController();

        // Process providers as they're discovered
        try {
            for await (const peer of this._helia.libp2p.contentRouting.findProviders(pubsubTopicCid, {
                signal: findProvidersAbortController.signal
            })) {
                if (ipnsRecordFromFetch) {
                    break; // Already got a result, stop trying more providers
                }

                const peerAbortController = new AbortController();
                fetchAbortControllers.push(peerAbortController);

                try {
                    const result = await limit(() => fetchFromIpnsPeerInLimit(peer.id, peerAbortController));
                    ipnsRecordFromFetch = result;
                    cleanUp();
                    log("Fetched IPNS", options?.ipnsName, "record for topic", topic, "using provider discovery");
                    break; // Success! Stop trying more providers
                } catch (error) {
                    peerIdToError[peer.id.toString()] = error as Error;
                    // Continue to next provider
                }
            }
        } catch (e) {
            //@ts-expect-error
            e.details = {
                //@ts-expect-error
                ...e.details,
                topic,
                routingKey,
                peerIdToError,
                pubsubTopicCid,
                pubsubTopicCidString,
                options
            };
            throw e;
        } finally {
            // Clean up any remaining abort controllers
            cleanUp();
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
        const pubsubSubscribers: any[] = []; // TODO revert this later

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
