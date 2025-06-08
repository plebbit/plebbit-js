import { pubsub as ipnsPubsubRouter, PubsubRoutingComponents } from "@helia/ipns/routing";
import { CustomProgressEvent } from "progress-events";
import Logger from "@plebbit/plebbit-logger";
import { CID } from "multiformats/cid";
import { peerIdFromString } from "@libp2p/peer-id";

import type { Fetch } from "@libp2p/fetch";
import type { HeliaWithLibp2pPubsub } from "./types.js";
import { binaryKeyToPubsubTopic, pubsubTopicToDhtKey } from "../util.js";

const log = Logger("plebbit-js:helia:ipns:routing:pubsub-with-fetch");

async function addPubsubPeersFromDelegatedRouters(helia: HeliaWithLibp2pPubsub, ipnsPeersCid: string, options?: { signal?: AbortSignal }) {
    const pubsubPeers: ReturnType<typeof peerIdFromString>[] = [];
    for await (const ipnsPubsubPeer of helia.libp2p.contentRouting.findProviders(CID.parse(ipnsPeersCid), options)) {
        try {
            await helia.libp2p.dial(ipnsPubsubPeer.id); // will be a no-op if we're already connected
            log("Succeesfully dialed", ipnsPubsubPeer.id.toString(), "To be able to connect for IPNS-OverPubsub", ipnsPeersCid);
            // if it succeeds, means we can connect to this peer

            pubsubPeers.push(peerIdFromString(ipnsPubsubPeer.id.toString()));
        } catch (e) {
            log.error("Failed to dial IPNS-Over-Pubsub peer", ipnsPubsubPeer.id.toString(), "Due to error", e);
        }
    }
    if (pubsubPeers.length === 0) throw Error("Failed to find any IPNS-Over-Pubsub peers from delegated routers");
    else return pubsubPeers;
    // need to add a check
}

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
                // add peers if if we don't have any peers connected to this topic
                let peersFromDelegatedRouters: Awaited<ReturnType<typeof addPubsubPeersFromDelegatedRouters>> | undefined;
                if (originalRouterPubsub.getSubscribers(topic).length === 0)
                    peersFromDelegatedRouters = await addPubsubPeersFromDelegatedRouters(helia, pubsubTopicToDhtKey(topic), options);

                const peersToFetchFrom = peersFromDelegatedRouters || originalRouterPubsub.getSubscribers(topic);

                if (!peersToFetchFrom?.length) throw Error("Failed to detect peers for pubsub topic");

                // call @libp2p/fetch here,
                for (const pubsubPeer of peersToFetchFrom) {
                    try {
                        ipnsRecordFromFetch = await libp2pFetchService.fetch(pubsubPeer, routingKey);
                        if (!ipnsRecordFromFetch) throw Error("Fetch for IPNS-Over-Pubsub returned undefined");
                        log("Fetched IPNS record of topic", topic, "from peer", pubsubPeer.toString());
                        break;
                    } catch (e) {
                        log.error("Failed to fetch IPNS record", topic, "from peer", pubsubPeer.toString(), e);
                    }
                }

                log("add subscription for topic", topic);
                originalRouterPubsub.subscribe(topic);
                //@ts-expect-error
                this.subscriptions.push(topic);

                //@ts-expect-error
                options.onProgress?.(new CustomProgressEvent("ipns:pubsub-with-fetch:subscribe", { topic }));

                if (ipnsRecordFromFetch) {
                    log("Fetched IPNS record of topic", topic, "from peers", peersToFetchFrom, "Using libp2p-fetch");
                } else {
                    log(
                        "Failed to fetch IPNS record of topic",
                        topic,
                        "using libp2p-fetch from peers",
                        peersToFetchFrom,
                        ".Will be awaiting in the gossip topic, it may take 30s+"
                    );
                }
            }
            if (ipnsRecordFromFetch) return ipnsRecordFromFetch;

            //@ts-expect-error
            const { record } = await this.localStore.get(routingKey, options);

            return record;
        } catch (err) {
            //@ts-expect-error
            options.onProgress?.(new CustomProgressEvent("ipns:pubsub-with-fetch:error", err));
            throw err;
        }
    };

    return originalRouter;
}
