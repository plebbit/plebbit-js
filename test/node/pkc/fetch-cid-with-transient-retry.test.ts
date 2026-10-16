import { afterAll, afterEach, beforeAll, it, expect, vi } from "vitest";
import { addStringToIpfs, fetchCidWithTransientRetry, mockPKCNoDataPathWithOnlyKuboClient } from "../../../dist/node/test/test-util.js";
import { PKCError } from "../../../dist/node/pkc-error.js";
import { extractNetworkErrorDetails } from "../../../dist/node/util.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";
import type { PKC } from "../../../dist/node/pkc/pkc.js";

// The error _fetchCidP2P throws when the TCP connect to the local kubo RPC API does not complete
// (issue #265): ERR_FAILED_TO_FETCH_IPFS_CID_VIA_IPFS_P2P carrying the unwrapped socket detail.
const transientP2PFetchError = (cid: string): PKCError => {
    const perAddress = [
        Object.assign(new Error("connect ETIMEDOUT 127.0.0.1:15001"), { code: "ETIMEDOUT", errno: -110, syscall: "connect" }),
        Object.assign(new Error("connect ECONNREFUSED ::1:15001"), { code: "ECONNREFUSED", errno: -111, syscall: "connect" })
    ];
    const fetchFailed = Object.assign(new TypeError("fetch failed"), {
        cause: Object.assign(new AggregateError(perAddress, ""), { code: "ETIMEDOUT" })
    });
    return new PKCError("ERR_FAILED_TO_FETCH_IPFS_CID_VIA_IPFS_P2P", {
        cid,
        error: fetchFailed,
        errorMessage: fetchFailed.message,
        errorName: fetchFailed.name,
        networkErrorDetails: extractNetworkErrorDetails(fetchFailed)
    });
};

// Same code, but the resolver failed for a reason that is not a socket-level transient: no code
// anywhere in the chain. Must not be retried, or content-level failures would be masked.
const nonTransientP2PFetchError = (cid: string): PKCError => {
    const err = new Error("some non-network failure inside cat()");
    return new PKCError("ERR_FAILED_TO_FETCH_IPFS_CID_VIA_IPFS_P2P", {
        cid,
        error: err,
        errorMessage: err.message,
        errorName: err.name,
        networkErrorDetails: extractNetworkErrorDetails(err)
    });
};

// Under RPC pkc.fetchCid is served by the RPC server process and there is no _clientsManager
// on the client to stub; the retry logic is pure test-util code and is fully covered once here.
describeSkipIfRpc("fetchCidWithTransientRetry (test-util)", () => {
    let pkc: PKC;
    let cid: string;
    let content: string;

    beforeAll(async () => {
        pkc = await mockPKCNoDataPathWithOnlyKuboClient({ pkcOptions: { httpRoutersOptions: [] } });
        content = "fetchCidWithTransientRetry " + Math.random();
        cid = await addStringToIpfs(content);
    });
    afterAll(async () => {
        if (pkc) await pkc.destroy();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Fails the first `failures` calls with `makeError`, then falls through to the real P2P fetch.
    const stubP2PFetchToFailFirst = (failures: number, makeError: (cid: string) => Error) => {
        const original = pkc._clientsManager._fetchCidP2P.bind(pkc._clientsManager);
        let calls = 0;
        const spy = vi.spyOn(pkc._clientsManager, "_fetchCidP2P").mockImplementation(async (...args) => {
            calls++;
            if (calls <= failures) throw makeError(args[0]);
            return original(...args);
        });
        return spy;
    };

    it("retries a transient socket-level P2P fetch failure and returns the content", async () => {
        const spy = stubP2PFetchToFailFirst(1, transientP2PFetchError);
        const res = await fetchCidWithTransientRetry({ pkc, cid, minTimeoutMs: 10 });
        expect(res.content).to.equal(content);
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it("gives up after `attempts` and rethrows the last transient error", async () => {
        const spy = stubP2PFetchToFailFirst(Infinity, transientP2PFetchError);
        try {
            await fetchCidWithTransientRetry({ pkc, cid, attempts: 3, minTimeoutMs: 10 });
            expect.fail("should have thrown");
        } catch (e) {
            expect((e as PKCError).code).to.equal("ERR_FAILED_TO_FETCH_IPFS_CID_VIA_IPFS_P2P");
        }
        expect(spy).toHaveBeenCalledTimes(3);
    });

    it("does not retry a P2P fetch failure whose cause chain carries no transient socket code", async () => {
        const spy = stubP2PFetchToFailFirst(1, nonTransientP2PFetchError);
        try {
            await fetchCidWithTransientRetry({ pkc, cid, minTimeoutMs: 10 });
            expect.fail("should have thrown");
        } catch (e) {
            expect((e as PKCError).code).to.equal("ERR_FAILED_TO_FETCH_IPFS_CID_VIA_IPFS_P2P");
        }
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("does not retry any other error, e.g. the P2P fetch timeout", async () => {
        const spy = stubP2PFetchToFailFirst(1, (c) => new PKCError("ERR_FETCH_CID_P2P_TIMEOUT", { cid: c }));
        try {
            await fetchCidWithTransientRetry({ pkc, cid, minTimeoutMs: 10 });
            expect.fail("should have thrown");
        } catch (e) {
            expect((e as PKCError).code).to.equal("ERR_FETCH_CID_P2P_TIMEOUT");
        }
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("is a plain pass-through when the first fetch succeeds", async () => {
        const spy = stubP2PFetchToFailFirst(0, transientP2PFetchError);
        const res = await fetchCidWithTransientRetry({ pkc, cid });
        expect(res.content).to.equal(content);
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
