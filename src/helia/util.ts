import type { HeliaWithLibp2pPubsub } from "./types.js";
import { CID } from "multiformats/cid";
import Logger from "@plebbit/plebbit-logger";
import { PlebbitError } from "../plebbit-error.js";

export async function connectToPeersProvidingCid({
    helia,
    contentCid,
    maxPeers,
    options,
    log
}: {
    helia: HeliaWithLibp2pPubsub;
    contentCid: string;
    maxPeers: number; // how many peers to dial before we stop
    log: Logger;
    options?: { signal?: AbortSignal };
}) {
    const peersWithContent: Awaited<ReturnType<typeof helia.libp2p.dial>>[] = [];
    const peerDialToError: Record<string, Error> = {};
    for await (const peer of helia.libp2p.contentRouting.findProviders(CID.parse(contentCid), options)) {
        try {
            const conn = await helia.libp2p.dial(peer.id, options); // will be a no-op if we're already connected
            // if it succeeds, means we can connect to this peer

            peersWithContent.push(conn);
            if (peersWithContent.length >= maxPeers) break;
        } catch (e) {
            peerDialToError[peer.id.toString()] = e as Error;
            log.trace("Failed to dial IPNS-Over-Pubsub peer", peer.id.toString(), "Due to error", e);
        }
    }
    log.trace("Connected to", peersWithContent.length, "peers", "for content", contentCid);
    if (peersWithContent.length === 0) {
        const error = new PlebbitError("ERR_FAILED_TO_DIAL_ANY_PEERS_PROVIDING_CID", {
            contentCid,
            peerDialToError
        });
        log.error(error);
        throw error;
    } else return peersWithContent;
}

export async function waitForTopicPeers(helia: HeliaWithLibp2pPubsub, topic: string, minPeers = 1, timeoutMs = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        const subscribers = helia.libp2p.services.pubsub.getSubscribers(topic);
        if (subscribers.length >= minPeers) {
            return subscribers;
        }

        // Wait 100ms before checking again
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new PlebbitError("ERR_TIMEOUT_WAITING_FOR_PUBSUB_TOPIC_PEERS", {
        topic,
        minPeers,
        timeoutMs
    });
}
