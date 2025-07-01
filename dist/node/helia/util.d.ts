import type { HeliaWithLibp2pPubsub } from "./types.js";
import Logger from "@plebbit/plebbit-logger";
export declare function connectToPeersProvidingCid({ helia, contentCid, maxPeers, options, log }: {
    helia: HeliaWithLibp2pPubsub;
    contentCid: string;
    maxPeers: number;
    log: Logger;
    options?: {
        signal?: AbortSignal;
    };
}): Promise<import("@libp2p/interface").Connection[]>;
export declare function waitForTopicPeers(helia: HeliaWithLibp2pPubsub, topic: string, minPeers?: number, timeoutMs?: number): Promise<import("@libp2p/interface").PeerId[]>;
