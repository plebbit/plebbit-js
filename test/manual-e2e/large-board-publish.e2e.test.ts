import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import v8 from "node:v8";
import { mockPKC, mockRemotePKC, resolveWhenConditionIsTrue } from "../../dist/node/test/test-util.js";
import { buildSeededCommentRow, seedLargeBoard } from "./large-board-seeder.js";
import { attachCycleProfiler, type CycleProfile, type RepoGcProfile } from "./cycle-profiler.js";
import { createSigner } from "../../dist/node/signer/index.js";
import type { PKC } from "../../dist/node/pkc/pkc.js";
import type { LocalCommunity } from "../../dist/node/runtime/node/community/local-community.js";
import type { RemoteCommunity } from "../../dist/node/community/remote-community.js";
import type { PageTypeJson } from "../../dist/node/pages/types.js";

// End-to-end publish of a large board (issue #386): can a community of this many posts and comments start,
// publish its record and keep publishing on a machine with 16 GB of memory, and can a client load what it
// published? NOT part of any CI glob (CI runs test/node, test/node-and-browser, test/browser, test/challenges);
// run it manually with the test server up:
//
//   E2E_POSTS=2000 node test/run-test-config.js --pkc-config local-kubo-rpc test/manual-e2e/large-board-publish.e2e.test.ts
//
// The board is seeded straight into the community's database by large-board-seeder.ts (real signatures, real
// cids; the challenge flow is bypassed), then the community is started for real: the start-time repin walk
// re-adds every comment to kubo, the publish loop calculates every CommentUpdate, writes the postUpdates files,
// generates every page and publishes the record over IPNS. A second PKC with no data path loads the record and
// walks the posts pages. One more post is then appended and the second cycle timed.
//
// Memory: the pkc-js process keeps Node's default heap limit (about 4 GB, what a 16 GB machine gets), so a
// board that needs more fails here the way it fails in production. Peak RSS of this process and of the kubo
// daemon serving :15001 are sampled once a second and the process peak is asserted against E2E_MAX_RSS_MB.
//
// Env:
//   E2E_POSTS (2000), E2E_MIN_REPLIES (10), E2E_MAX_REPLIES (50), E2E_POSTS_PER_AUTHOR (25), E2E_SEED (1)
//   E2E_PAGES = default | single   (single: posts [active, preloaded], replies [old, preloaded], the 5chan shape)
//   E2E_DATA_PATH (.tmp/large-board-e2e)   where the community's database goes; a 1M board is GBs of SQLite
//   E2E_COMMUNITY_ADDRESS   reuse the board a previous run left under E2E_DATA_PATH instead of seeding
//   E2E_KEEP_BOARD=1   do not delete the community afterwards (so the next run can reuse it); the default deletes it
//                      and reports how long that took (`deleted` event; delete() unpins the board in slices, #389)
//   E2E_SKIP_REPIN=1   stub the start-time repin walk (every comment re-added to kubo) when only the publish
//                      cycle is under study; the default runs it and reports its time on its own
//   E2E_MAX_RSS_MB (8192)   the pkc-js process budget asserted on the first publish
//   E2E_FIRST_PUBLISH_TIMEOUT_MS (1800000)   how long the first record may take
//   E2E_PAGES_TO_WALK (3)   how many pages of the first posts sort the remote client follows
//   VITEST_TIMEOUT   the runner's per-test and per-hook timeout; seeding and publishing a 1M board take longer
//                    than its default, so set it to the E2E_FIRST_PUBLISH_TIMEOUT_MS you chose
//
// Results are printed as JSON lines and written to .tmp/large-board-e2e-<timestamp>.json. Every publish cycle is
// profiled step by step (`cycle` events, see cycle-profiler.ts): CommentUpdates, record preparation, posts pages,
// sign and publish, with a per-method kubo table, memory peaks and the kubo repo size before and after; `repo-gc`
// events report the hourly GC the cycle runs after publishing.
//
// Measured 2026-10-15 on the PR #346 branch, default env (2,000 posts / 62,298 comments, nine default sorts), real
// kubo 0.43.1, Node 22 default heap (4,144 MB limit): seeding 16 s; the start-time repin walk re-added all 62k
// comments in 118 s; first cycle 19.7 s with this process peaking at 410 MB heap / 1,662 MB RSS and the daemon at
// 210 MB RSS; the remote client walked 3 pages of `hot`; the second cycle after one appended post took 3.7 s.
// topHour is absent from the published sorts because the seeded board ends an hour before the run.
//
// Measured 2026-10-16, same branch and setup, E2E_POSTS=33000 (1,020,719 comments from 1,320 authors, nine default
// sorts, repin included, VITEST_TIMEOUT and E2E_FIRST_PUBLISH_TIMEOUT_MS raised): 3/3 passed in 68 min. Seeding 265 s;
// the repin walk re-added all 1.02M comments in 40 min; first cycle 18.9 min with this process peaking at 2,753 MB
// heap / 6,398 MB RSS and the daemon at 914 MB RSS while about 7.9 GB of pages were written (kubo repo 0.93 GB to
// 8.85 GB); published hot, new, active, topDay, topWeek, topMonth, topYear, topAll; the remote client walked 3 pages
// of `hot`; the second cycle after one appended post took 295 s. A million comments fits a 16 GB machine; the
// steady-state cost (every page re-added each cycle, the flag scan of #361) is what is left (issue #386).
//
// Where the time goes, same board profiled step by step 2026-10-16 with the repin skipped (cycle-profiler.ts):
//   first cycle 1,093 s: CommentUpdates 974 s, of which the SQL calculation (queryCalculatedCommentUpdates) 653 s,
//     reply pages 133 s (summed over concurrent slices), upserts 25 s, flag query 6 s, and 33,000 postUpdates files
//     (1,454 MB) written to MFS; record preparation 12 s; posts pages 107 s (90 adds, 9,371 MB); sign and publish
//     0.5 s. Kubo had a call in flight for 225 s of the cycle. Heap peak 2,831 MB, RSS 6,400 MB, daemon 510 MB.
//     Kubo repo 7.5 GB -> 15.5 GB, SQLite 1,940 MB. The hourly repo GC after it took 144 s and freed 1.6 GB.
//   second cycle, one post appended 20 min later, 238 s: 16,364 CommentUpdates (flag query 17 s, calculation 5 s,
//     reply pages 18 s, 6,203 postUpdates files, 296 MB), posts pages 106 s (every page regenerated and re-added,
//     9,370 MB, 3 GB of it new blocks), kubo in flight 192 s. Heap peak 3,079 MB, RSS 6,744 MB. The 16k updates
//     are the flag query's author and ancestor arms: 12 authors had one comment flagged (windowed reply sorts moving
//     with the clock is the likely seed), every other comment of theirs followed (8,504), then every ancestor of
//     those (7,860, among them 6,203 posts whose postUpdates file was rewritten).

const envInt = (name: string, fallback: number) => (Number(process.env[name]) > 0 ? Number(process.env[name]) : fallback);
const POSTS = envInt("E2E_POSTS", 2000);
const MIN_REPLIES = Number(process.env.E2E_MIN_REPLIES) >= 0 ? Number(process.env.E2E_MIN_REPLIES) : 10;
const MAX_REPLIES = Number(process.env.E2E_MAX_REPLIES) >= 0 ? Number(process.env.E2E_MAX_REPLIES) : 50;
const POSTS_PER_AUTHOR = envInt("E2E_POSTS_PER_AUTHOR", 25);
const SEED = envInt("E2E_SEED", 1);
const PAGES_MODE = process.env.E2E_PAGES === "single" ? "single" : "default";
const DATA_PATH = path.resolve(process.cwd(), process.env.E2E_DATA_PATH || ".tmp/large-board-e2e");
const REUSED_ADDRESS = process.env.E2E_COMMUNITY_ADDRESS;
const KEEP_BOARD = process.env.E2E_KEEP_BOARD === "1";
const SKIP_REPIN = process.env.E2E_SKIP_REPIN === "1";
const MAX_RSS_MB = envInt("E2E_MAX_RSS_MB", 8192);
const FIRST_PUBLISH_TIMEOUT_MS = envInt("E2E_FIRST_PUBLISH_TIMEOUT_MS", 30 * 60_000);
const PAGES_TO_WALK = envInt("E2E_PAGES_TO_WALK", 3);
const SEED_TIMEOUT_MS = FIRST_PUBLISH_TIMEOUT_MS;

const MB = 1024 * 1024;
const log = (event: string, fields: Record<string, unknown>) => console.log(JSON.stringify({ event, ...fields }));

// The kubo daemon the local community publishes through, found by the port mockPKC points at; its RSS is read
// from /proc so the daemon's share of the machine shows up next to ours. Best effort: Linux only.
function findKuboPid(): number | undefined {
    try {
        const line = execSync("ss -ltnp 2>/dev/null", { encoding: "utf8" })
            .split("\n")
            .find((l) => /:15001\s/.test(l));
        const match = line?.match(/pid=(\d+)/);
        return match ? Number(match[1]) : undefined;
    } catch {
        return undefined;
    }
}
function processRssMB(pid: number): number | undefined {
    try {
        const match = readFileSync(`/proc/${pid}/status`, "utf8").match(/VmRSS:\s+(\d+) kB/);
        return match ? Math.round(Number(match[1]) / 1024) : undefined;
    } catch {
        return undefined;
    }
}

class MemorySampler {
    heapPeakMB = 0;
    rssPeakMB = 0;
    kuboRssPeakMB: number | undefined;
    private _timer?: NodeJS.Timeout;
    constructor(private readonly _kuboPid?: number) {}
    start() {
        this.sample();
        this._timer = setInterval(() => this.sample(), 1000);
    }
    sample() {
        const usage = process.memoryUsage();
        this.heapPeakMB = Math.max(this.heapPeakMB, Math.round(usage.heapUsed / MB));
        this.rssPeakMB = Math.max(this.rssPeakMB, Math.round(usage.rss / MB));
        if (this._kuboPid) {
            const kubo = processRssMB(this._kuboPid);
            if (kubo !== undefined) this.kuboRssPeakMB = Math.max(this.kuboRssPeakMB ?? 0, kubo);
        }
    }
    stop() {
        if (this._timer) clearInterval(this._timer);
        this.sample();
    }
    snapshot() {
        return { heapPeakMB: this.heapPeakMB, rssPeakMB: this.rssPeakMB, kuboRssPeakMB: this.kuboRssPeakMB };
    }
}

describe(`large board publish e2e (issue #386): ${POSTS} posts, ${MIN_REPLIES}-${MAX_REPLIES} replies each, pages=${PAGES_MODE}`, () => {
    let pkc: PKC;
    let community: LocalCommunity;
    let comments = 0;
    let nextTimestamp = 0;
    let firstCycleMs = 0;
    const kuboPid = findKuboPid();
    const cycles: CycleProfile[] = [];
    const repoGcs: RepoGcProfile[] = [];
    // Cycle profiles arrive a little after the state change that ends the cycle (two repo size reads), so a test that
    // asserts on one waits for it.
    const waitForCycles = async (count: number) => {
        const deadline = Date.now() + 30_000;
        while (cycles.length < count && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 100));
        expect(cycles.length, `${count} cycle profiles captured`).toBeGreaterThanOrEqual(count);
    };
    const dbSizeMB = () => {
        try {
            return Math.round(statSync(path.join(DATA_PATH, "communities", community.address)).size / MB);
        } catch {
            return undefined;
        }
    };
    const results: Record<string, unknown> = {
        posts: POSTS,
        pagesMode: PAGES_MODE,
        heapLimitMB: Math.round(v8.getHeapStatistics().heap_size_limit / MB),
        kuboPid,
        cycles,
        repoGcs
    };

    beforeAll(async () => {
        if (!existsSync(DATA_PATH)) mkdirSync(DATA_PATH, { recursive: true });
        pkc = await mockPKC({ dataPath: DATA_PATH });
        community = <LocalCommunity>await pkc.createCommunity(REUSED_ADDRESS ? { address: REUSED_ADDRESS } : {});
        // createCommunity does not open the database until start(); the seeder writes to it before that.
        await community._dbHandler.initDbIfNeeded();
        await community._dbHandler.createOrMigrateTablesIfNeeded();
        if (PAGES_MODE === "single" && !REUSED_ADDRESS)
            await community.edit({
                settings: {
                    ...community.settings,
                    pages: { posts: [{ name: "active", preloaded: true }], replies: [{ name: "old", preloaded: true }] }
                }
            });
        if (REUSED_ADDRESS) {
            comments = (<{ cnt: number }>community._dbHandler["_db"].prepare("SELECT COUNT(1) AS cnt FROM comments").get()).cnt;
            nextTimestamp = Math.floor(Date.now() / 1000);
            log("reused", { address: community.address, comments });
        } else {
            const seeded = await seedLargeBoard({
                community,
                pkc,
                posts: POSTS,
                minReplies: MIN_REPLIES,
                maxReplies: MAX_REPLIES,
                postsPerAuthor: POSTS_PER_AUTHOR,
                seed: SEED,
                onProgress: (progress) => log("seeding", progress)
            });
            comments = seeded.comments;
            nextTimestamp = seeded.nextTimestamp;
            Object.assign(results, { comments, replies: seeded.replies, authors: seeded.authors, seedMs: seeded.seedMs });
            log("seeded", { address: community.address, ...seeded });
        }
        results.address = community.address;
    }, SEED_TIMEOUT_MS);

    afterAll(async () => {
        if (community) {
            if (community.state === "started") await community.stop();
            if (KEEP_BOARD) log("kept", { address: community.address, comments });
            else {
                // Live heap the cycles left behind, which is what delete() has to fit under (issue #389). Exact only with
                // NODE_OPTIONS=--expose-gc (the forks inherit it), a lower bound otherwise.
                const forceGc = (<{ gc?: () => void }>globalThis).gc;
                forceGc?.();
                const heapBeforeDeleteMB = Math.round(process.memoryUsage().heapUsed / MB);
                log("before-delete", { heapBeforeDeleteMB, gcForced: Boolean(forceGc), rssMB: Math.round(process.memoryUsage().rss / MB) });
                if (process.env.E2E_HEAP_SNAPSHOT_BEFORE_DELETE === "1") {
                    // What the cycles left live, for issue #389 / #386 diagnosis. A snapshot of a multi-GB heap takes minutes
                    // and about twice its size on disk under .tmp/heap.
                    if (!existsSync(".tmp/heap")) mkdirSync(".tmp/heap", { recursive: true });
                    const file = v8.writeHeapSnapshot(path.resolve(".tmp/heap", `before-delete-${Date.now()}.heapsnapshot`));
                    log("heap-snapshot", { file });
                }
                const deleteStart = performance.now();
                const progress = setInterval(() => {
                    const usage = process.memoryUsage();
                    log("delete-progress", {
                        elapsedMs: Math.round(performance.now() - deleteStart),
                        heapUsedMB: Math.round(usage.heapUsed / MB),
                        rssMB: Math.round(usage.rss / MB),
                        cidsToUnPin: community._cidsToUnPin.size
                    });
                }, 15_000);
                try {
                    await community.delete();
                } finally {
                    clearInterval(progress);
                }
                const deleteMs = Math.round(performance.now() - deleteStart);
                Object.assign(results, { deleteMs, heapBeforeDeleteMB });
                log("deleted", { deleteMs, comments, heapBeforeDeleteMB });
            }
        }
        if (pkc) await pkc.destroy();
        if (!existsSync(".tmp")) mkdirSync(".tmp");
        const file = path.resolve(".tmp", `large-board-e2e-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
        writeFileSync(file, JSON.stringify(results, null, 2));
        log("written", { file });
    }, SEED_TIMEOUT_MS);

    it(
        "starts and publishes its first record inside the memory budget",
        async () => {
            if (SKIP_REPIN) community._repinCommentsIPFSIfNeeded = async () => {};
            const sampler = new MemorySampler(kuboPid);
            sampler.start();
            const startedStates: { state: string; atMs: number }[] = [];
            const t0 = performance.now();
            community.on("startedstatechange", (state) => {
                startedStates.push({ state, atMs: Math.round(performance.now() - t0) });
                log("startedstatechange", { state, atMs: Math.round(performance.now() - t0) });
            });
            // A failing cycle is reported here and the loop retries; without this listener a hang has no cause in the log.
            community.on("error", (error) =>
                log("community-error", { message: error.message, details: (<{ details?: unknown }>error).details })
            );
            attachCycleProfiler({
                community,
                kuboPid,
                onCycle: (profile) => {
                    cycles.push(profile);
                    log("cycle", { ...profile, dbSizeMB: dbSizeMB() });
                },
                onRepoGc: (profile) => {
                    repoGcs.push(profile);
                    log("repo-gc", profile);
                }
            });
            try {
                await community.start();
                const startMs = Math.round(performance.now() - t0);
                log("started", { startMs, repin: SKIP_REPIN ? "skipped" : "ran" });
                const publishStart = performance.now();
                await resolveWhenConditionIsTrue({
                    toUpdate: community,
                    predicate: async () => typeof community.updatedAt === "number"
                });
                firstCycleMs = Math.round(performance.now() - publishStart);
            } finally {
                sampler.stop();
            }
            const memory = sampler.snapshot();
            await waitForCycles(1);
            const postSorts = Object.keys({ ...community.posts.pages, ...community.posts.pageCids });
            Object.assign(results, { firstCycleMs, startedStates, firstPublish: memory, postSorts, dbSizeMB: dbSizeMB() });
            log("published", { firstCycleMs, comments, ...memory, postSorts, startedStates, dbSizeMB: dbSizeMB() });

            expect(typeof community.updatedAt).toBe("number");
            // When every preloaded sort fits one chunk and holds the whole board, nothing else is generated (the
            // single-chunk shortcut), so a small board publishes the preloaded sorts alone; a board that spills into
            // pageCids publishes every configured sort that has comments. The windowed top sorts are left out here:
            // the seeded board ends an hour before the run, so topHour is legitimately empty and omitted.
            const preloadedPostSorts = PAGES_MODE === "single" ? ["active"] : ["hot"];
            const allPostSorts = PAGES_MODE === "single" ? ["active"] : ["hot", "new", "active", "topAll"];
            const spilledIntoPageCids = Object.keys(community.posts.pageCids ?? {}).length > 0;
            for (const sort of spilledIntoPageCids ? allPostSorts : preloadedPostSorts)
                expect(postSorts, `posts sort ${sort} published`).toContain(sort);
            Object.assign(results, { spilledIntoPageCids });
            expect(memory.rssPeakMB, `pkc-js peak RSS ${memory.rssPeakMB} MB over the ${MAX_RSS_MB} MB budget`).toBeLessThanOrEqual(
                MAX_RSS_MB
            );
        },
        FIRST_PUBLISH_TIMEOUT_MS
    );

    it(
        "a remote client loads the record and walks the first posts sort",
        async () => {
            const remotePkc = await mockRemotePKC();
            let remote: RemoteCommunity | undefined;
            try {
                remote = <RemoteCommunity>await remotePkc.createCommunity({ address: community.address });
                await remote.update();
                await resolveWhenConditionIsTrue({ toUpdate: remote, predicate: async () => typeof remote!.updatedAt === "number" });
                const sort = Object.keys(remote.posts.pages)[0] ?? Object.keys(remote.posts.pageCids)[0];
                expect(sort, "the record names at least one posts sort").toBeTruthy();
                let page: PageTypeJson | undefined = remote.posts.pages[sort];
                let nextCid: string | undefined = page ? page.nextCid : remote.posts.pageCids[sort];
                let pagesWalked = page ? 1 : 0;
                let commentsWalked = page ? page.comments.length : 0;
                while (nextCid && pagesWalked < PAGES_TO_WALK) {
                    page = await remote.posts.getPage({ cid: nextCid });
                    pagesWalked++;
                    commentsWalked += page.comments.length;
                    nextCid = page.nextCid;
                }
                Object.assign(results, { remoteLoad: { sort, pagesWalked, commentsWalked, moreAfter: Boolean(nextCid) } });
                log("remote-loaded", { sort, pagesWalked, commentsWalked, moreAfter: Boolean(nextCid) });
                expect(commentsWalked).toBeGreaterThan(0);
                for (const comment of page!.comments) {
                    expect(typeof comment.cid).toBe("string");
                    expect(typeof comment.updatedAt).toBe("number");
                }
            } finally {
                if (remote) await remote.stop();
                await remotePkc.destroy();
            }
        },
        FIRST_PUBLISH_TIMEOUT_MS
    );

    it(
        "a second cycle after one new post is cheaper than the first",
        async () => {
            const before = community.updatedAt!;
            const appended = await buildSeededCommentRow({
                pkc,
                community,
                signer: await createSigner(),
                depth: 0,
                fields: { title: "appended post", content: "appended after the first publish", timestamp: nextTimestamp }
            });
            appended.row.insertedAt = Math.floor(Date.now() / 1000);
            community._dbHandler.insertComments([appended.row]);
            const t0 = performance.now();
            await resolveWhenConditionIsTrue({
                toUpdate: community,
                predicate: async () => typeof community.updatedAt === "number" && community.updatedAt > before
            });
            // Wall time from the insert to the new record includes waiting for the loop's next pass and, once an hour,
            // the repo GC the previous cycle runs after publishing (tens of seconds on a repo of a million blocks). The
            // cycle itself is the profile of the cycle that published the post.
            const secondCycleWallMs = Math.round(performance.now() - t0);
            const cyclesBefore = cycles.length;
            await waitForCycles(cyclesBefore + 1);
            const secondCycle = cycles[cycles.length - 1];
            const firstCycle = cycles[0];
            Object.assign(results, { secondCycleWallMs, secondCycleMs: secondCycle.cycleMs, repoGcs });
            log("second-cycle", { secondCycleWallMs, secondCycleMs: secondCycle.cycleMs, firstCycleMs: firstCycle.cycleMs, repoGcs });
            // Not asserted to be exactly one: the flag query also picks up windowed reply sorts whose window moved and
            // every other comment by a flagged comment's author (author.community aggregates), so a cycle twenty minutes
            // after a full recalculation of a 1M board re-updated 16k comments for one new post. That number is part
            // of what this test measures (issue #386), not a failure.
            expect(secondCycle.commentsUpdated).toBeGreaterThanOrEqual(1);
            expect(secondCycle.cycleMs).toBeLessThan(firstCycle.cycleMs);
        },
        FIRST_PUBLISH_TIMEOUT_MS
    );
});
