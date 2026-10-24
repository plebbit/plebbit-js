// The delegated-routing client's Cache API response cache (https://github.com/pkcprotocol/pkc-js/issues/439,
// upstream https://github.com/ipfs/helia-delegated-routing-v1-http-api/issues/208).
//
// With its default cacheTTL the client writes every provider lookup to the `delegated-routing-v1-cache`
// Cache API cache and never sweeps it, and it awaits cache.put() before handing the response back, so no
// provider is yielded until the router has sent the whole ndjson stream. pkc-js runs the client with the
// cache off and deletes any cache an earlier version left behind.
//
// Skipped outside a browser: node has no globalThis.caches, so the client never caches there.

import { describe, it, expect, afterEach, vi } from "vitest";
import { CID } from "multiformats/cid";
import * as raw from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";
import { isRunningInBrowser, mockPKCWithHeliaConfig } from "../../../dist/node/test/test-util.js";
import signers from "../../fixtures/signers.js";
import type { PKC } from "../../../dist/node/pkc/pkc.js";

const describeSkipIfNotBrowser = isRunningInBrowser() ? describe : describe.skip;

const CACHE_NAME = "delegated-routing-v1-cache";
const FAKE_ROUTER_URL = "https://pkc-test-router.invalid";
const PROVIDER_IDS = [signers[0].address, signers[1].address, signers[2].address];

// Serves /routing/v1/providers/* from FAKE_ROUTER_URL as ndjson, one record every `gapMs`, and passes
// every other request through to the real fetch.
function stubFakeRouter({ gapMs }: { gapMs: number }) {
    const realFetch = globalThis.fetch.bind(globalThis);
    vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (!url.startsWith(`${FAKE_ROUTER_URL}/routing/v1/providers/`)) return realFetch(input, init);
        const encoder = new TextEncoder();
        const timers: ReturnType<typeof setTimeout>[] = [];
        const body = new ReadableStream<Uint8Array>({
            start(controller) {
                PROVIDER_IDS.forEach((ID, i) => {
                    timers.push(
                        setTimeout(() => {
                            const record = { Schema: "peer", ID, Addrs: ["/ip4/1.2.3.4/tcp/4001"], Protocols: ["transport-bitswap"] };
                            controller.enqueue(encoder.encode(JSON.stringify(record) + "\n"));
                            if (i === PROVIDER_IDS.length - 1) controller.close();
                        }, i * gapMs)
                    );
                });
                init?.signal?.addEventListener("abort", () => {
                    timers.forEach(clearTimeout);
                    controller.error(init.signal!.reason);
                });
            },
            cancel() {
                timers.forEach(clearTimeout);
            }
        });
        return new Response(body, { status: 200, headers: { "content-type": "application/x-ndjson" } });
    });
}

async function randomCid() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return CID.createV1(raw.code, await sha256.digest(bytes));
}

function heliaNodeOf(pkc: PKC) {
    const libp2pJsClient = pkc.clients.libp2pJsClients[Object.keys(pkc.clients.libp2pJsClients)[0]];
    return libp2pJsClient.heliaNode;
}

describeSkipIfNotBrowser("delegated-routing Cache API cache (#439)", () => {
    let pkc: PKC | undefined;

    afterEach(async () => {
        await pkc?.destroy();
        pkc = undefined;
        vi.unstubAllGlobals();
    });

    it("a provider lookup does not create the delegated-routing-v1-cache", async () => {
        await caches.delete(CACHE_NAME);
        stubFakeRouter({ gapMs: 0 });
        pkc = await mockPKCWithHeliaConfig({ pkcOptions: { httpRoutersOptions: [FAKE_ROUTER_URL] } });

        const cid = await randomCid();
        const found: string[] = [];
        for await (const provider of heliaNodeOf(pkc).libp2p.contentRouting.findProviders(cid)) found.push(provider.id.toString());
        expect(found.sort()).to.deep.equal([...PROVIDER_IDS].sort());

        // Checked before destroy(): the client's stop() deletes the cache, which would hide a cache it wrote.
        expect(await caches.has(CACHE_NAME)).to.equal(false);
    });

    it("deletes a delegated-routing-v1-cache left behind by an earlier version", async () => {
        const staleCache = await caches.open(CACHE_NAME);
        await staleCache.put(`${FAKE_ROUTER_URL}/routing/v1/providers/stale`, new Response("{}"));
        expect(await caches.has(CACHE_NAME)).to.equal(true);

        pkc = await mockPKCWithHeliaConfig({ pkcOptions: { httpRoutersOptions: [FAKE_ROUTER_URL] } });

        // The delete runs in the background so it cannot delay startup; give it a moment.
        const deadline = Date.now() + 5000;
        while ((await caches.has(CACHE_NAME)) && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 50));
        expect(await caches.has(CACHE_NAME)).to.equal(false);
    });

    it("yields the first provider before the router finishes streaming the response", async () => {
        const gapMs = 1000;
        stubFakeRouter({ gapMs });
        pkc = await mockPKCWithHeliaConfig({ pkcOptions: { httpRoutersOptions: [FAKE_ROUTER_URL] } });

        const cid = await randomCid();
        const startedAt = Date.now();
        let firstProviderAfterMs: number | undefined;
        // Drained to the end rather than stopped early: libp2p keeps reading the router's stream after a
        // break or abort, and the client's abort listener then cancel()s that still-locked ReadableStream
        // on destroy(), an unhandled rejection unrelated to what this test checks.
        for await (const _provider of heliaNodeOf(pkc).libp2p.contentRouting.findProviders(cid)) {
            firstProviderAfterMs ??= Date.now() - startedAt;
        }

        // The first record is sent immediately and the last at 2 * gapMs. With the cache on, the client
        // read the whole stream before yielding anything, so the first provider arrived after 2 * gapMs.
        expect(firstProviderAfterMs).to.be.a("number");
        expect(firstProviderAfterMs!).to.be.lessThan(gapMs);
    });
});
