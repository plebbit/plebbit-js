import { afterEach, it, expect, vi } from "vitest";
import { mockPKC, createSubWithNoChallenge } from "../../../dist/node/test/test-util.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";

import type { PKC } from "../../../dist/node/pkc/pkc.js";
import type { LocalCommunity } from "../../../dist/node/runtime/node/community/local-community.js";

type ErrorWithCode = Error & { code?: string; errno?: number; syscall?: string; address?: string; port?: number };

// Builds the exact error undici threw for the initial pubsub/sub request in CI (#422, windows node-local):
//   TypeError("fetch failed")
//     cause: AggregateError { code: "ETIMEDOUT", errors: [connect ETIMEDOUT ::1:15001, connect ECONNREFUSED 127.0.0.1:15001] }
// Windows resolves localhost to ::1 first. kubo's API listens on IPv4 only and Windows does not refuse
// ::1 promptly, so Node's happy-eyeballs 250ms attempt timer fires (ETIMEDOUT). The last address,
// 127.0.0.1, gets no timer and was refused by the OS while kubo was saturated by five communities
// starting at once. The AggregateError takes errors[0].code, so ETIMEDOUT masks the real refusal.
// Shape verified with real sockets (non-accepting ::1 listener, nothing on 127.0.0.1, lookup
// returning [::1, 127.0.0.1]) on node v22. There is no undici ConnectTimeoutError layer, unlike #384.
const happyEyeballsConnectTimeoutError = (): TypeError => {
    const perAddress: ErrorWithCode[] = [
        Object.assign(new Error("connect ETIMEDOUT ::1:15001"), {
            code: "ETIMEDOUT",
            errno: -4039,
            syscall: "connect",
            address: "::1",
            port: 15001
        }),
        Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:15001"), {
            code: "ECONNREFUSED",
            errno: -4078,
            syscall: "connect",
            address: "127.0.0.1",
            port: 15001
        })
    ];
    return Object.assign(new TypeError("fetch failed"), {
        cause: Object.assign(new AggregateError(perAddress, ""), { code: "ETIMEDOUT" })
    });
};

// Makes the first pubsub subscribe to `topic` reject with `makeError()` (the CI error by default), on
// whichever provider is tried first; every later call (a retry or another provider) goes through to
// the real client. Returns the list of provider URLs that were asked to subscribe to `topic`, in order.
const failFirstSubscribeToTopic = (pkc: PKC, topic: string, makeError: () => Error = happyEyeballsConnectTimeoutError): string[] => {
    const attemptedProviders: string[] = [];
    for (const providerUrl of Object.keys(pkc.clients.pubsubKuboRpcClients)) {
        const pubsub = pkc.clients.pubsubKuboRpcClients[providerUrl]._client.pubsub;
        const originalSubscribe = pubsub.subscribe.bind(pubsub);
        vi.spyOn(pubsub, "subscribe").mockImplementation(async (...args: Parameters<typeof pubsub.subscribe>) => {
            if (args[0] === topic) {
                attemptedProviders.push(providerUrl);
                if (attemptedProviders.length === 1) throw makeError();
            }
            return originalSubscribe(...args);
        });
    }
    return attemptedProviders;
};

// LocalCommunity.start() runs inside the RPC server process under RPC, so its pubsub client cannot be
// stubbed from the test process. The subscribe path is the same code either way, so the direct
// config covers it.
describeSkipIfRpc("LocalCommunity.start() survives a transient connect error on its first pubsub subscribe (#422)", () => {
    let pkc: PKC | undefined;
    let community: LocalCommunity | undefined;

    afterEach(async () => {
        vi.restoreAllMocks();
        if (community) await community.delete().catch(() => {});
        if (pkc) await pkc.destroy();
        community = undefined;
        pkc = undefined;
    });

    it("retries the subscribe on the same provider when it is the only pubsub provider", async () => {
        // forceMockPubsub swaps in the in-process mock client even though pubsub providers are configured
        pkc = await mockPKC({ pubsubKuboRpcClientsOptions: ["http://localhost:15002/api/v0"] }, true);
        community = (await createSubWithNoChallenge({}, pkc)) as LocalCommunity;
        const attemptedProviders = failFirstSubscribeToTopic(pkc, community.pubsubTopic || community.address);

        await community.start();

        expect(community.started).to.equal(true);
        expect(attemptedProviders).to.deep.equal(["http://localhost:15002/api/v0", "http://localhost:15002/api/v0"]);
    });

    it("falls back to the next pubsub provider when the first one fails to connect", async () => {
        pkc = await mockPKC(); // three mocked pubsub providers
        expect(Object.keys(pkc.clients.pubsubKuboRpcClients).length).to.be.greaterThan(1);
        community = (await createSubWithNoChallenge({}, pkc)) as LocalCommunity;
        const attemptedProviders = failFirstSubscribeToTopic(pkc, community.pubsubTopic || community.address);

        await community.start();

        expect(community.started).to.equal(true);
        expect(attemptedProviders.length).to.be.greaterThanOrEqual(2);
    });

    // Control: the retry is limited to socket-level network failures. An error without a network
    // code must still fail start() on the first attempt, without retrying the same provider.
    it("does not retry a subscribe failure that is not a transient network error", async () => {
        pkc = await mockPKC({ pubsubKuboRpcClientsOptions: ["http://localhost:15002/api/v0"] }, true);
        community = (await createSubWithNoChallenge({}, pkc)) as LocalCommunity;
        const attemptedProviders = failFirstSubscribeToTopic(
            pkc,
            community.pubsubTopic || community.address,
            () => new Error("pubsub is not enabled on this node")
        );

        await expect(community.start()).rejects.toMatchObject({ code: "ERR_PUBSUB_FAILED_TO_SUBSCRIBE" });

        expect(attemptedProviders).to.deep.equal(["http://localhost:15002/api/v0"]);
    });
});
