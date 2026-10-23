import { afterEach, expect, it, vi } from "vitest";
import { createLibp2pJsClientOrUseExistingOne } from "../../../dist/node/helia/helia-for-pkc.js";
import { MockHttpRouter } from "../../../dist/node/runtime/node/test/mock-http-router.js";
import { pubsubTopicToDhtKeyCid } from "../../../dist/node/util.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";
import { generateKeyPair } from "@libp2p/crypto/keys";
import { peerIdFromPrivateKey } from "@libp2p/peer-id";
import type { Libp2pJsClient } from "../../../dist/node/helia/libp2pjsClient.js";

// Regression coverage for issue #439: @helia/delegated-routing-v1-http-api-client defaults to a
// 5-minute response cache in the browser's Cache API (`delegated-routing-v1-cache`). It writes every
// successful provider GET there, evicts an entry only when the same URL is looked up again, and
// deletes the cache only in stop(), which a closed tab never runs. So the cache grows forever: 5chan
// profiles reached ~10,700 records, and iOS Safari reads every record of the origin before the first
// Cache API operation of a session, which stalled 5chan's service worker (and the page load) ~4s.
//
// Node has no Cache API, so the test installs an in-memory CacheStorage on globalThis, which the
// client picks up exactly like it does in a browser.
//
// Client-side libp2p only and config-independent, so it runs once under non-RPC.

const DELEGATED_ROUTING_CACHE_NAME = "delegated-routing-v1-cache";

class FakeCacheStorage {
    readonly caches = new Map<string, Map<string, Response>>();
    readonly openedNames: string[] = [];
    readonly deletedNames: string[] = [];

    async open(name: string) {
        this.openedNames.push(name);
        let entries = this.caches.get(name);
        if (!entries) {
            entries = new Map();
            this.caches.set(name, entries);
        }
        const store = entries;
        const keyOf = (request: RequestInfo | URL) => (request instanceof Request ? request.url : String(request));
        return {
            match: async (request: RequestInfo | URL) => store.get(keyOf(request))?.clone(),
            put: async (request: RequestInfo | URL, response: Response) => {
                store.set(keyOf(request), response);
            },
            delete: async (request: RequestInfo | URL) => store.delete(keyOf(request))
        };
    }

    async delete(name: string) {
        this.deletedNames.push(name);
        return this.caches.delete(name);
    }

    async has(name: string) {
        return this.caches.has(name);
    }

    async keys() {
        return [...this.caches.keys()];
    }
}

describeSkipIfRpc("Delegated-routing response cache (issue #439)", () => {
    const startedRouters: MockHttpRouter[] = [];
    const clientsToStop: Libp2pJsClient[] = [];
    let keyCounter = 0;

    afterEach(async () => {
        let stopError: unknown;
        while (clientsToStop.length) {
            try {
                await clientsToStop.pop()!.heliaWithKuboRpcClientFunctions.stop();
            } catch (e) {
                stopError ??= e;
            }
        }
        while (startedRouters.length) {
            try {
                await startedRouters.pop()!.destroy();
            } catch {
                // already destroyed
            }
        }
        vi.unstubAllGlobals();
        if (stopError) throw stopError;
    });

    const startRouter = async () => {
        const router = new MockHttpRouter();
        await router.start();
        startedRouters.push(router);
        return router;
    };

    const createClient = async (httpRoutersOptions: string[]): Promise<Libp2pJsClient> => {
        const client = (await createLibp2pJsClientOrUseExistingOne({
            key: `delegated-routing-response-cache-${keyCounter++}`,
            httpRoutersOptions,
            libp2pOptions: {},
            heliaOptions: {}
        })) as Libp2pJsClient;
        clientsToStop.push(client);
        return client;
    };

    it("a successful provider lookup writes nothing to the Cache API", async () => {
        const cacheStorage = new FakeCacheStorage();
        vi.stubGlobal("caches", cacheStorage);

        const router = await startRouter();
        const cid = pubsubTopicToDhtKeyCid("delegated-routing-response-cache-lookup");
        const providerId = peerIdFromPrivateKey(await generateKeyPair("Ed25519")).toString();
        router.addProviderForTesting(cid.toString(), { ID: providerId, Addrs: ["/ip4/1.2.3.4/tcp/4001"] });

        const client = await createClient([router.url]);
        const found: string[] = [];
        for await (const peer of client._helia.libp2p.contentRouting.findProviders(cid, { signal: AbortSignal.timeout(30_000) })) {
            found.push(peer.id.toString());
        }

        // The lookup went to the router and returned its provider (a 200 response, which is what
        // the client caches)...
        expect(found).to.include(providerId);
        expect(router.requests.filter((r) => r.method === "GET").length).to.be.at.least(1);
        // ...and left no record behind in the origin's Cache API.
        expect(cacheStorage.openedNames).to.not.include(DELEGATED_ROUTING_CACHE_NAME);
        expect(cacheStorage.caches.get(DELEGATED_ROUTING_CACHE_NAME)?.size ?? 0).to.equal(0);
    });

    it("a cache left behind by an earlier session is deleted when the client is created", async () => {
        const cacheStorage = new FakeCacheStorage();
        // An earlier session (older pkc-js, tab closed without stop()) left records behind.
        const leftover = await cacheStorage.open(DELEGATED_ROUTING_CACHE_NAME);
        for (let i = 0; i < 50; i++) await leftover.put(`https://router.example/routing/v1/providers/${i}`, new Response("{}"));
        vi.stubGlobal("caches", cacheStorage);

        const router = await startRouter();
        await createClient([router.url]);

        // The client is still running (stop() also deletes the cache, so this must hold before it).
        await vi.waitFor(() => expect(cacheStorage.caches.has(DELEGATED_ROUTING_CACHE_NAME)).to.equal(false), { timeout: 5_000 });
    });
});
