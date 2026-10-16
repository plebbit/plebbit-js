// Times the update cycle's flag query, queryCommentsToBeUpdated(), on an existing community database
// (issue #355): wall time, and the heap its result holds, measured the way update-pipeline-bench measures
// what a cycle holds (gc, measure, drop, gc). Read-only; it opens the database as it is, so it can point at
// the board update-pipeline-bench left behind (BENCH_DATA_PATH/communities/<address>) or at any local
// community. NOT part of any CI glob:
//
//   npm run build && node --expose-gc --max-old-space-size=8192 test/benchmarks/flag-query-bench.mjs <path-to-db>
//
// Times queryCommentsToBeUpdated ({cid, depth} rows) and queryCidsToBeUpdatedByDepth (what the cycle uses).
// BENCH_ITERATIONS (default 2; the first one is cold) and BENCH_CID_ONLY=1 to also time a bare
// `SELECT cid, depth FROM comments` as the floor for shipping that many rows through better-sqlite3.
import { performance } from "node:perf_hooks";
import { statSync } from "node:fs";
import path from "node:path";
import { DbHandler } from "../../dist/node/runtime/node/community/db-handler.js";

const file = process.argv[2];
if (!file) throw new Error("usage: flag-query-bench.mjs <path-to-community-db>");
const ITERATIONS = Number(process.env.BENCH_ITERATIONS) > 0 ? Number(process.env.BENCH_ITERATIONS) : 2;

// The community object is only what DbHandler reads: an address for its assertions, a pkc for the default
// config it never gets to build (the config is set here so the handler opens the given file), and no page
// sorts, so the flag query is the default one without windowed arms. Opened read-write only because the flag
// query fills a per-connection temp table; nothing here writes to the community's own tables.
const fakeCommunity = { address: path.basename(file), _pkc: { noData: true } };
const dbHandler = new DbHandler(fakeCommunity);
dbHandler["_dbConfig"] = { filename: file, fileMustExist: true };
await dbHandler.initDbIfNeeded();
const db = dbHandler["_db"];
const counts = {
    comments: db.prepare("SELECT count(*) AS n FROM comments").get().n,
    commentUpdates: db.prepare("SELECT count(*) AS n FROM commentUpdates").get().n,
    dbMB: Math.round((statSync(file).size / 1024 / 1024) * 10) / 10
};
console.log(JSON.stringify({ event: "opened", file, ...counts }));

async function measure(label, run, countOf = (rows) => rows.length) {
    if (global.gc) global.gc();
    const heapBefore = process.memoryUsage().heapUsed;
    let rssPeak = process.memoryUsage().rss;
    const sampler = setInterval(() => (rssPeak = Math.max(rssPeak, process.memoryUsage().rss)), 25);
    const cpuBefore = process.cpuUsage();
    const start = performance.now();
    let rows = run();
    const ms = Math.round(performance.now() - start);
    const cpu = process.cpuUsage(cpuBefore);
    clearInterval(sampler);
    let heapHeldMB;
    if (global.gc) {
        global.gc();
        const withRows = process.memoryUsage().heapUsed;
        const count = countOf(rows);
        rows = undefined;
        global.gc();
        heapHeldMB = Math.round((withRows - process.memoryUsage().heapUsed) / 1024 / 1024);
        rows = { length: count };
    }
    const rowCount = heapHeldMB === undefined ? countOf(rows) : rows.length;
    const row = {
        event: label,
        rows: rowCount,
        ms,
        cpuUserMs: Math.round(cpu.user / 1000),
        heapHeldByRowsMB: heapHeldMB,
        bytesPerRow: heapHeldMB === undefined || rowCount === 0 ? undefined : Math.round((heapHeldMB * 1024 * 1024) / rowCount),
        rssPeakMB: Math.round(rssPeak / 1024 / 1024),
        heapBeforeMB: Math.round(heapBefore / 1024 / 1024)
    };
    console.log(JSON.stringify(row));
    return row;
}

for (let i = 0; i < ITERATIONS; i++) {
    if (process.env.BENCH_CID_ONLY === "1")
        await measure("bareCidDepthSelect", () => db.prepare("SELECT cid, depth FROM comments ORDER BY rowid").all());
    await measure("queryCommentsToBeUpdated", () => dbHandler.queryCommentsToBeUpdated());
    await measure(
        "queryCidsToBeUpdatedByDepth",
        () => dbHandler.queryCidsToBeUpdatedByDepth(),
        (byDepth) => [...byDepth.values()].reduce((sum, cids) => sum + cids.length, 0)
    );
}
await dbHandler.destoryConnection();
