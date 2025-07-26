import type { HeliaWithLibp2pPubsub } from "./types.js";
import type { PeerInfo } from "@libp2p/interface";
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
    // TODO need to check if this hangs or not
    const peersWithContent: PeerInfo[] = [];
    const connectedPeersWithContent: Awaited<ReturnType<typeof helia.libp2p.dial>>[] = [];
    const peerDialToError: Record<string, Error> = {};
    try {
        for await (const peer of helia.libp2p.contentRouting.findProviders(CID.parse(contentCid), options)) {
            peersWithContent.push(peer);
            try {
                const conn = await helia.libp2p.dial(peer.id, options); // will be a no-op if we're already connected
                // if it succeeds, means we can connect to this peer

                connectedPeersWithContent.push(conn);
                if (connectedPeersWithContent.length >= maxPeers) break;
            } catch (e) {
                peerDialToError[peer.id.toString()] = e as Error;
                log.trace("Failed to dial IPNS-Over-Pubsub peer", peer.id.toString(), "Due to error", e);
            }
        }
    } catch (e) {
        (e as PlebbitError).details = {
            ...(e as PlebbitError).details,
            contentCid,
            options,
            maxPeersBeforeWeStopLookingForProviders: maxPeers,
            connectedPeersWithContent,
            peersWithContent,
            peerDialToError
        };
        throw e;
    }
    log.trace("Connected to", connectedPeersWithContent.length, "peers", "for content", contentCid);
    if (connectedPeersWithContent.length === 0) {
        const error = new PlebbitError("ERR_FAILED_TO_DIAL_ANY_PEERS_PROVIDING_CID", {
            contentCid,
            peerDialToError,
            peersWithContent,
            options
        });
        log.error(error);
        throw error;
    } else return connectedPeersWithContent;
}

export async function waitForTopicPeers(helia: HeliaWithLibp2pPubsub, topic: string, minPeers = 1, timeoutMs = 10000) {
    // after connecting to peers, we need to get the peers from the pubsub service
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
