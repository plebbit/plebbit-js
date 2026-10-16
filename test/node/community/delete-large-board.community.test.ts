import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { mockPKCV2 } from "../../../dist/node/test/test-util.js";
import { describeSkipIfRpc } from "../../helpers/conditional-tests.js";
import { seedLargeBoard } from "../../manual-e2e/large-board-seeder.js";
import type { PKC } from "../../../dist/node/pkc/pkc.js";
import type { LocalCommunity } from "../../../dist/node/runtime/node/community/local-community.js";
import type { CommunityIpfsType } from "../../../dist/node/community/types.js";
import { calculateIpfsCidV0 } from "../../../dist/node/util.js";

// Issue #389: community.delete() on a board of a million comments ran Node's default 4 GB heap out. It collected
// every comment's cid and page cids with one query into one array and one Set, then unpinned the Set. Deleting
// has to walk the board in slices, holding one slice at a time, however large the board is. The bound asserted
// here is the slice delete() works in (DELETE_UNPIN_SLICE_SIZE in lifecycle.ts); the board seeded below is
// larger than one slice, so a delete that still loads everything at once fails both assertions.
const SLICE = 5_000;

const isIterable = (value: unknown): value is Iterable<unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value) && Symbol.iterator in value;

// Wraps every method of the community's db handler so the largest result it ever hands out during delete() is
// known: an array's length directly, a generator's by the length of each array it yields.
function recordLargestDbResult(dbHandler: LocalCommunity["_dbHandler"]): { largest: () => number } {
    let largest = 0;
    const record = (value: unknown) => {
        if (Array.isArray(value)) largest = Math.max(largest, value.length);
    };
    const handler = <Record<string, unknown>>(<unknown>dbHandler);
    const prototype = <Record<string, unknown>>Object.getPrototypeOf(dbHandler);
    for (const name of Object.getOwnPropertyNames(prototype)) {
        if (name === "constructor") continue;
        const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (!descriptor || typeof descriptor.value !== "function") continue;
        const original = <(...args: unknown[]) => unknown>descriptor.value;
        handler[name] = (...args: unknown[]) => {
            const result = original.apply(dbHandler, args);
            record(result);
            if (isIterable(result)) {
                const iterable = result;
                return (function* () {
                    for (const value of iterable) {
                        record(value);
                        yield value;
                    }
                })();
            }
            return result;
        };
    }
    return { largest: () => largest };
}

// The community-side internals observed here (db handler results, the unpin queue) live in the RPC server's
// process under RPC, out of this client's reach.
describeSkipIfRpc("community.delete() of a board larger than one unpin slice (issue #389)", () => {
    let pkc: PKC;
    let community: LocalCommunity;
    let seededCids: string[] = [];
    let seededComments = 0;

    beforeAll(async () => {
        pkc = await mockPKCV2({ forceMockPubsub: true, stubStorage: false });
        community = <LocalCommunity>await pkc.createCommunity();
        await community._dbHandler.initDbIfNeeded();
        await community._dbHandler.createOrMigrateTablesIfNeeded();
        const seeded = await seedLargeBoard({ community, pkc, posts: 200, minReplies: 20, maxReplies: 40, postsPerAuthor: 25 });
        seededComments = seeded.comments;
        seededCids = (<{ cid: string }[]>community._dbHandler["_db"].prepare("SELECT cid FROM comments").all()).map((row) => row.cid);
    }, 120_000);

    afterAll(async () => {
        await pkc.destroy();
    });

    it("holds at most one slice of the board at a time while unpinning every comment", async () => {
        expect(seededComments, "the board must span more than one slice for this test to mean anything").toBeGreaterThan(SLICE);
        const dbResults = recordLargestDbResult(community._dbHandler);
        const kuboClient = community._clientsManager.getDefaultKuboRpcClient()._client;
        const unpinned = new Set<string>();
        let largestUnpinQueue = 0;
        const originalPinRm = kuboClient.pin.rm.bind(kuboClient.pin);
        vi.spyOn(kuboClient.pin, "rm").mockImplementation((cid, options) => {
            unpinned.add(String(cid));
            largestUnpinQueue = Math.max(largestUnpinQueue, community._cidsToUnPin.size);
            return originalPinRm(cid, options);
        });

        await community.delete();

        expect(dbResults.largest(), "rows handed out by one db handler call during delete()").toBeLessThanOrEqual(SLICE);
        // The queue also carries the record-level cids (posts pages, stats, update, routing blocks) on top of a slice.
        expect(largestUnpinQueue, "cids queued for unpinning at once").toBeLessThanOrEqual(SLICE + 64);
        for (const cid of seededCids) expect(unpinned.has(cid), `comment ${cid} was unpinned`).toBe(true);
        expect(community._cidsToUnPin.size).toBe(0);
        expect(fs.existsSync(path.join(pkc.dataPath!, "communities", "deleted", community.address))).toBe(true);
    }, 120_000);
});

// The second half of issue #389: before unpinning a single comment, delete() collected the previous record's page cids
// by fetching every posts page from kubo and following the nextCid chains (9.4 GB of JSON for a million-comment
// board, which ran the heap out on its own). The community already records every posts page cid it published
// (_postsAllPageCids, what the publish cycle uses to unpin superseded pages), so delete() must unpin from that and
// never fetch a page.
describeSkipIfRpc("community.delete() of a community that has published pages (issue #389)", () => {
    let pkc: PKC;
    let community: LocalCommunity;
    beforeAll(async () => {
        pkc = await mockPKCV2({ forceMockPubsub: true, stubStorage: false });
        community = <LocalCommunity>await pkc.createCommunity();
        await community._dbHandler.initDbIfNeeded();
        await community._dbHandler.createOrMigrateTablesIfNeeded();
    });
    afterAll(async () => {
        await pkc.destroy();
    });

    it("unpins every recorded posts page cid without fetching any page", async () => {
        const pageCids = await Promise.all(["hot-1", "hot-2", "hot-3", "new-1", "new-2"].map((name) => calculateIpfsCidV0(`page ${name}`)));
        const [hot1, hot2, hot3, new1, new2] = pageCids;
        community._postsAllPageCids = { hot: [hot1, hot2, hot3], new: [new1, new2] };
        // What the last published record carried: the first page of each sort, the rest reachable only by walking.
        community.raw.communityIpfs = <CommunityIpfsType>(<unknown>{ posts: { pages: {}, pageCids: { hot: hot1, new: new1 } } });
        const fetched: string[] = [];
        vi.spyOn(community._clientsManager, "_fetchCidP2P").mockImplementation(async (cid) => {
            fetched.push(String(cid));
            throw new Error("delete() must not fetch pages");
        });
        const kuboClient = community._clientsManager.getDefaultKuboRpcClient()._client;
        const unpinned = new Set<string>();
        const originalPinRm = kuboClient.pin.rm.bind(kuboClient.pin);
        vi.spyOn(kuboClient.pin, "rm").mockImplementation((cid, options) => {
            unpinned.add(String(cid));
            return originalPinRm(cid, options);
        });

        await community.delete();

        expect(fetched, "pages fetched during delete()").toEqual([]);
        for (const cid of pageCids) expect(unpinned.has(cid), `page ${cid} was unpinned`).toBe(true);
    }, 120_000);
});
