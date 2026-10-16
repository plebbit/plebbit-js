import { afterAll, beforeAll, expect, it } from "vitest";
import { generateKeyPair } from "@libp2p/crypto/keys";
import { peerIdFromPrivateKey } from "@libp2p/peer-id";
import { generateMockPost, mockPKCWithHeliaConfig } from "../../../dist/node/test/test-util.js";
import { MockHttpRouter } from "../../../dist/node/runtime/node/test/mock-http-router.js";
import { ipnsNameToIpnsOverPubsubTopic, pubsubTopicToDhtKeyCid } from "../../../dist/node/util.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";
import type { PKC } from "../../../dist/node/pkc/pkc.js";
import type { PKCError } from "../../../dist/node/pkc-error.js";

// Issue #377: a community hosted behind NAT announces only /p2p-circuit addrs. The libp2p-js
// client finds its providers but never dials them (issue #215: /libp2p/fetch fails over a limited
// relayed connection), so the resolve fails. Before this issue that failure was reported as the
// generic ERR_RESOLVED_IPNS_P2P_TO_UNDEFINED ("Does this IPNS name exist?"), and publish() /
// getCommunity() sat for the full community-ipns timeout (5 minutes) before surfacing it.
//
// The client already knows why it failed, so it must say so: ERR_COMMUNITY_UNREACHABLE_FROM_THIS_CLIENT
// with the reason and the provider peer ids in details, retriable in the update loop (a seeder may
// show up), and thrown immediately by the shared wait helper so publish() and getCommunity() fail
// fast.
//
// In-process libp2p-js client only: under the RPC config the test process has no libp2p-js client
// (the RPC server owns the node and its routers), so the mock router could not be injected.
describeSkipIfRpc("ERR_COMMUNITY_UNREACHABLE_FROM_THIS_CLIENT (issue #377)", () => {
    const DOCS_URL = "https://github.com/pkcprotocol/pkc-js/blob/master/docs/reachability.md";
    // One failed resolve cycle is: direct fetch (instant, every provider skipped locally) +
    // fallback warmup (10s subscriber-wait floor) + router.get(). Fail-fast must land right after
    // that first cycle, nowhere near the 5-minute community-ipns timeout.
    const FAIL_FAST_MAX_MS = 40_000;
    const TEST_TIMEOUT_MS = 90_000;

    let pkc: PKC;
    let router: MockHttpRouter;

    const randomPeerIdString = async () => peerIdFromPrivateKey(await generateKeyPair("Ed25519")).toString();

    // A fresh community address (IPNS name) whose only provider on the router is a peer announcing
    // nothing but a relay address, like a Kubo host whose AutoNAT reachability is Private.
    const announceRelayOnlyCommunity = async (): Promise<{ address: string; providerPeerId: string }> => {
        const address = await randomPeerIdString();
        const providerPeerId = await randomPeerIdString();
        const relayPeerId = await randomPeerIdString();
        const topicCid = pubsubTopicToDhtKeyCid(ipnsNameToIpnsOverPubsubTopic(address)).toString();
        router.addProviderForTesting(topicCid, {
            ID: providerPeerId,
            Addrs: [`/ip4/127.0.0.1/tcp/1/ws/p2p/${relayPeerId}/p2p-circuit`]
        });
        return { address, providerPeerId };
    };

    const expectUnreachableError = (error: PKCError, providerPeerId: string) => {
        expect(error.code).to.equal("ERR_COMMUNITY_UNREACHABLE_FROM_THIS_CLIENT");
        expect(error.message).to.include(DOCS_URL);
        expect(error.details.reason).to.equal("relay-only-providers");
        expect(error.details.providerPeerIds).to.deep.equal([providerPeerId]);
        expect(error.details.providersFound).to.equal(1);
        expect(error.details.docsUrl).to.equal(DOCS_URL);
    };

    beforeAll(async () => {
        router = new MockHttpRouter();
        await router.start();
        pkc = await mockPKCWithHeliaConfig({ pkcOptions: { httpRoutersOptions: [router.url] } });
    });

    afterAll(async () => {
        if (pkc) await pkc.destroy();
        if (router) await router.destroy();
    });

    it(
        "community.update() emits the error with the reason and provider peer ids, and keeps retrying",
        async () => {
            const { address, providerPeerId } = await announceRelayOnlyCommunity();
            const community = await pkc.createCommunity({ address });
            const errors: PKCError[] = [];
            community.on("error", (error) => errors.push(error as PKCError));
            try {
                const startedAt = Date.now();
                await community.update();
                await new Promise<void>((resolve, reject) => {
                    const timer = setTimeout(() => reject(new Error("no error event within the fail-fast budget")), FAIL_FAST_MAX_MS);
                    community.on("error", () => {
                        clearTimeout(timer);
                        resolve();
                    });
                });
                const elapsedMs = Date.now() - startedAt;
                expect(elapsedMs, `first error event took ${elapsedMs}ms`).to.be.lessThan(FAIL_FAST_MAX_MS);

                expectUnreachableError(errors[0], providerPeerId);
                // Retriable: a seeder or a direct address can show up later, so the loop must go on.
                expect(errors[0].details.retriableError).to.equal(true);
                expect(community.updatingState).to.equal("waiting-retry");
                expect(community.state).to.equal("updating");
            } finally {
                await community.stop();
            }
        },
        TEST_TIMEOUT_MS
    );

    it(
        "pkc.getCommunity() rejects with the error right after the first failed cycle instead of waiting the 5-minute timeout",
        async () => {
            const { address, providerPeerId } = await announceRelayOnlyCommunity();
            const startedAt = Date.now();
            let thrown: PKCError | undefined;
            try {
                await pkc.getCommunity({ address });
            } catch (e) {
                thrown = e as PKCError;
            }
            const elapsedMs = Date.now() - startedAt;
            expect(thrown, "getCommunity must reject").to.not.equal(undefined);
            expect(elapsedMs, `getCommunity took ${elapsedMs}ms to reject`).to.be.lessThan(FAIL_FAST_MAX_MS);
            expectUnreachableError(thrown!, providerPeerId);
        },
        TEST_TIMEOUT_MS
    );

    it(
        "publish() to a never-loaded community rejects with the error right after the first failed cycle",
        async () => {
            const { address, providerPeerId } = await announceRelayOnlyCommunity();
            const post = await generateMockPost({ communityAddress: address, pkc });
            const startedAt = Date.now();
            let thrown: PKCError | undefined;
            try {
                await post.publish();
            } catch (e) {
                thrown = e as PKCError;
            }
            const elapsedMs = Date.now() - startedAt;
            expect(thrown, "publish must reject").to.not.equal(undefined);
            expect(elapsedMs, `publish took ${elapsedMs}ms to reject`).to.be.lessThan(FAIL_FAST_MAX_MS);
            expectUnreachableError(thrown!, providerPeerId);
            expect(post.publishingState).to.equal("failed");
            expect(post.state).to.equal("stopped");
        },
        TEST_TIMEOUT_MS
    );
});
