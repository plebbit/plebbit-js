import { pubsub as ipnsPubsubRouter, PubsubRoutingComponents } from "@helia/ipns/routing";
import { CustomProgressEvent } from "progress-events";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { logger } from "@libp2p/logger";
import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";
import { base32 } from "multiformats/bases/base32";
import { peerIdFromString } from "@libp2p/peer-id";

import type { Fetch } from "@libp2p/fetch";
import type { HeliaWithLibp2pPubsub } from "./types";

const log = logger("helia:ipns:routing:pubsub-with-fetch");

/**
 * converts a binary record key to a pubsub topic key
 */
function keyToTopic(key: Uint8Array) {
    const b64url = uint8ArrayToString(key, "base64url");

    return `/record/${b64url}`;
}

const pubsubTopicToDhtKey = async (pubsubTopic: string) => {
    // pubsub topic dht key used by kubo is a cid of "floodsub:topic" https://github.com/libp2p/go-libp2p-pubsub/blob/3aa9d671aec0f777a7f668ca2b2ceb37218fb6bb/discovery.go#L328
    const string = `floodsub:${pubsubTopic}`;

    // convert string to same cid as kubo https://github.com/libp2p/go-libp2p/blob/024293c77e17794b0dd9dacec3032b4c5a535f64/p2p/discovery/routing/routing.go#L70
    const bytes = new TextEncoder().encode(string);
    const hash = await sha256.digest(bytes);
    const cidVersion = 1;
    const multicodec = 0x55;
    const cid = CID.create(cidVersion, multicodec, hash);
    return cid.toString(base32);
};

async function addPubsubPeersFromDelegatedRouters(helia: HeliaWithLibp2pPubsub, ipnsPeersCid: string) {
    for await (const ipnsPubsubPeer of helia.libp2p.contentRouting.findProviders(CID.parse(ipnsPeersCid))) {
        try {
            await helia.libp2p.dial(ipnsPubsubPeer.id); // will be a no-op if we're already connected
            // we should stop making new connections maybe after 3 connections?
            log("Succeesfully dialed", ipnsPubsubPeer.id.toString(), "To be able to connect for IPNS-OverPubsub", ipnsPeersCid);
            // if it succeeds, means we can connect to this peer

            return [peerIdFromString(ipnsPubsubPeer.id.toString())];
        } catch (e) {}
    }
    throw Error("Failed to find any IPNS-Over-Pubsub peers from delegated routers");

    // need to add a check
}

export function createPubsubRouterWithFetch(helia: HeliaWithLibp2pPubsub) {
    const originalRouter = ipnsPubsubRouter(helia);

    const libp2pFetchService = <Fetch>helia.libp2p.services.fetch;

    //@ts-expect-error
    const pubsub = <PubsubRoutingComponents["libp2p"]["services"]["pubsub"]>originalRouter.pubsub;
    originalRouter.get = async function (routingKey, options) {
        try {
            const topic = keyToTopic(routingKey);

            let ipnsRecordFromFetch: Uint8Array | undefined;
            if (!pubsub.getTopics().includes(topic)) {
                // add peers if if we don't have any peers connected to this topic
                let peersFromDelegatedRouters: Awaited<ReturnType<typeof addPubsubPeersFromDelegatedRouters>> | undefined;
                if (pubsub.getSubscribers(topic).length === 0)
                    peersFromDelegatedRouters = await addPubsubPeersFromDelegatedRouters(helia, await pubsubTopicToDhtKey(topic));

                const peersToFetchFrom = peersFromDelegatedRouters || pubsub.getSubscribers(topic);

                if (!peersToFetchFrom?.length) throw Error("Failed to detect peers for pubsub topic");

                // call @libp2p/fetch here,
                for (const pubsubPeer of peersToFetchFrom) {
                    try {
                        ipnsRecordFromFetch = await libp2pFetchService.fetch(pubsubPeer, routingKey);
                        if (!ipnsRecordFromFetch) throw Error("Fetch for IPNS-Over-PUbsub returned undefined");
                        log("Fetched IPNS record of topic", topic, "from peer", pubsubPeer.toString());
                    } catch (e) {
                        log.error("Failed to fetch IPNS record", topic, "from peer", pubsubPeer.toString(), e);
                    }
                }

                log("add subscription for topic", topic);
                pubsub.subscribe(topic);
                //@ts-expect-error
                this.subscriptions.push(topic);

                //@ts-expect-error
                options.onProgress?.(new CustomProgressEvent("ipns:pubsub-with-fetch:subscribe", { topic }));
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
