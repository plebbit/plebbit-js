import { afterAll, afterEach, beforeAll, it, expect, vi } from "vitest";
import { mockPKCNoDataPathWithOnlyKuboClient } from "../../../dist/node/test/test-util.js";
import { PKCError } from "../../../dist/node/pkc-error.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";
import type { PKC } from "../../../dist/node/pkc/pkc.js";
import type { RemoteCommunity } from "../../../dist/node/community/remote-community.js";

type ErrorWithCode = Error & { code?: string; errno?: number; syscall?: string; cause?: unknown };

// Builds the exact error undici throws when the TCP connect to the kubo RPC API does not complete
// within its connect timeout (observed in CI when the daemon's accept queue is saturated, #265):
//   TypeError("fetch failed")
//     cause: ConnectTimeoutError { code: "UND_ERR_CONNECT_TIMEOUT" }
//       cause: AggregateError { code: "ETIMEDOUT", errors: [connect ETIMEDOUT ..., connect ECONNREFUSED ...] }
// Note ETIMEDOUT is TWO levels below the TypeError, not one.
const undiciConnectTimeoutError = (): TypeError => {
    const perAddress: ErrorWithCode[] = [
        Object.assign(new Error("connect ETIMEDOUT 127.0.0.1:15001"), { code: "ETIMEDOUT", errno: -60, syscall: "connect" }),
        Object.assign(new Error("connect ECONNREFUSED ::1:15001"), { code: "ECONNREFUSED", errno: -61, syscall: "connect" })
    ];
    const aggregate: ErrorWithCode = Object.assign(new AggregateError(perAddress, ""), { code: "ETIMEDOUT" });
    const connectTimeout: ErrorWithCode = Object.assign(
        new Error("Connect Timeout Error (attempted addresses: 127.0.0.1:15001, ::1:15001, timeout: 10000ms)"),
        { name: "ConnectTimeoutError", code: "UND_ERR_CONNECT_TIMEOUT", cause: aggregate }
    );
    return Object.assign(new TypeError("fetch failed"), { cause: connectTimeout });
};

// The shape the pre-existing wrapper was written for: ETIMEDOUT directly on the TypeError's cause.
const fetchFailedWithDirectEtimedout = (): TypeError =>
    Object.assign(new TypeError("fetch failed"), { cause: Object.assign(new AggregateError([], ""), { code: "ETIMEDOUT" }) });

// What undici throws when the daemon is down entirely (e.g. mid-restart): no ConnectTimeoutError
// layer, the AggregateError with the per-address ECONNREFUSED errors is the direct cause.
const fetchFailedWithEconnrefused = (): TypeError => {
    const perAddress: ErrorWithCode[] = [
        Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:15001"), { code: "ECONNREFUSED", errno: -61, syscall: "connect" }),
        Object.assign(new Error("connect ECONNREFUSED ::1:15001"), { code: "ECONNREFUSED", errno: -61, syscall: "connect" })
    ];
    return Object.assign(new TypeError("fetch failed"), {
        cause: Object.assign(new AggregateError(perAddress, ""), { code: "ECONNREFUSED" })
    });
};

// Under RPC the IPNS resolve runs inside the RPC server process; the client never calls
// resolveIpnsToCidP2P, so there is nothing to stub on this side. The classification is pure
// client-side logic and is fully covered once under the direct kubo config.
describeSkipIfRpc("resolveIpnsToCidP2P classifies transient socket-level resolver failures as retriable (#384)", () => {
    let pkc: PKC;
    let community: RemoteCommunity;

    beforeAll(async () => {
        pkc = await mockPKCNoDataPathWithOnlyKuboClient({ pkcOptions: { httpRoutersOptions: [] } });
        // createCommunity without update() gives us a CommunityClientsManager to drive directly.
        community = (await pkc.createCommunity({ address: "12D3KooWANwdyPERMQaCgiMnTT1t3Lr4XLFbK1z4ptFVhW2ozg1z" })) as RemoteCommunity;
    });
    afterAll(async () => {
        if (pkc) await pkc.destroy();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Stubs the kubo-rpc-client's name.resolve (the only resolver under this config) to fail the way
    // the HTTP layer would. It is an async iterable, so the stub is an async generator that throws
    // on first pull, which is what `all()` in performIpnsResolve sees.
    const stubKuboNameResolveToThrow = (err: Error) => {
        const kuboClientKey = Object.keys(pkc.clients.kuboRpcClients)[0];
        const kuboClient = pkc.clients.kuboRpcClients[kuboClientKey]._client;
        vi.spyOn(kuboClient.name, "resolve").mockImplementation(() =>
            (async function* () {
                throw err;
            })()
        );
    };

    const resolveAndCaptureError = async (): Promise<unknown> => {
        try {
            await community._clientsManager.resolveIpnsToCidP2P(community.address, { timeoutMs: 10000 });
        } catch (e) {
            return e;
        }
        expect.fail("resolveIpnsToCidP2P should have thrown");
    };

    const expectWrappedAsRetriableIpnsFailure = (err: unknown, original: Error) => {
        expect(err).to.be.instanceOf(PKCError);
        const pkcErr = err as PKCError;
        expect(pkcErr.code).to.equal("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS_P2P");
        expect(pkcErr.details.error).to.equal(original);
        expect(pkcErr.details.errorMessage).to.equal(original.message);
        expect(community._isRetriableErrorWhenLoading(pkcErr)).to.equal(true);
    };

    it("wraps undici's ConnectTimeoutError (UND_ERR_CONNECT_TIMEOUT over ETIMEDOUT) so the community update loop retries it", async () => {
        const original = undiciConnectTimeoutError();
        stubKuboNameResolveToThrow(original);
        const err = await resolveAndCaptureError();
        expectWrappedAsRetriableIpnsFailure(err, original);
    });

    it("wraps a daemon-down ECONNREFUSED fetch failure the same way", async () => {
        const original = fetchFailedWithEconnrefused();
        stubKuboNameResolveToThrow(original);
        const err = await resolveAndCaptureError();
        expectWrappedAsRetriableIpnsFailure(err, original);
    });

    it("still wraps the direct-ETIMEDOUT shape the wrapper was originally written for", async () => {
        const original = fetchFailedWithDirectEtimedout();
        stubKuboNameResolveToThrow(original);
        const err = await resolveAndCaptureError();
        expectWrappedAsRetriableIpnsFailure(err, original);
    });

    // Control: the wrapper is selective. A resolver failure that carries no socket-level code (e.g.
    // kubo answering that it could not resolve the name) is not a transient network problem and
    // must keep propagating as-is, so the caller's existing classification of it is unchanged.
    it("leaves a resolver failure without a socket-level code unwrapped", async () => {
        const original = new Error("could not resolve name");
        stubKuboNameResolveToThrow(original);
        const err = await resolveAndCaptureError();
        expect(err).to.equal(original);
        expect(err).to.not.be.instanceOf(PKCError);
    });
});
