import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { mockPKC } from "../../../dist/node/test/test-util.js";
import { listCommunitiesSync } from "../../../dist/node/runtime/node/util.js";
import type { PKC } from "../../../dist/node/pkc/pkc.js";

// Node-only: listCommunitiesSync reads the communities directory on disk, so this cannot run in the
// browser. It does not touch a community, so it runs under both the Kubo and the RPC config: the
// function only needs pkc.dataPath and pkc.communities.
//
// Issue #380: a long-running daemon leaked one fd per *directory* under <dataPath>/communities/ on
// every listCommunitiesSync call. openSync() succeeds on a directory on Linux, readSync() then throws
// EISDIR, and the closeSync() on the next line was never reached. monitorCommunitiesDirectory re-runs
// the listing on every fs.watch event, so the process eventually hit RLIMIT_NOFILE and every publish
// loop failed with EMFILE.

const SQLITE_HEADER = "SQLite format 3\0";

/** Number of open fds of this process that resolve to `target` (Linux only, via /proc/self/fd). */
function countFdsPointingAt(target: string): number {
    const resolvedTarget = fs.realpathSync(target);
    return fs.readdirSync("/proc/self/fd").filter((fd) => {
        try {
            return fs.readlinkSync(path.join("/proc/self/fd", fd)) === resolvedTarget;
        } catch {
            return false; // fd closed between readdir and readlink
        }
    }).length;
}

function writeSqliteLookalike(filePath: string) {
    // 100 bytes of header-shaped content is enough: listCommunitiesSync only inspects the first 16.
    fs.writeFileSync(filePath, Buffer.concat([Buffer.from(SQLITE_HEADER, "latin1"), Buffer.alloc(84)]));
}

describe("listCommunitiesSync with non-file entries under communities/ (issue #380)", () => {
    const dataPath = path.join(process.cwd(), ".tmp", `pkc-380-fd-leak-${uuidv4()}`);
    const communitiesPath = path.join(dataPath, "communities");
    const deletedDir = path.join(communitiesPath, "deleted");
    const backupDir = path.join(communitiesPath, ".backup_before_migration");
    const sqliteFile = `sqlite-${uuidv4()}`;
    const notSqliteFile = `not-sqlite-${uuidv4()}`;
    let pkc: PKC;

    beforeAll(async () => {
        // Everything is laid out before the PKC exists so monitorCommunitiesDirectory never sees a
        // change event during the test: every listCommunitiesSync call below is one we make ourselves.
        fs.mkdirSync(deletedDir, { recursive: true });
        fs.mkdirSync(backupDir, { recursive: true });
        writeSqliteLookalike(path.join(communitiesPath, sqliteFile));
        fs.writeFileSync(path.join(communitiesPath, notSqliteFile), "just a text file, not a community db");
        pkc = await mockPKC({ dataPath });
    });

    afterAll(async () => {
        await pkc.destroy();
        fs.rmSync(dataPath, { recursive: true, force: true });
    });

    // /proc/self/fd is Linux-specific. The leak itself is not: a directory opened with "r" leaks the
    // same way on macOS. The CI node matrix includes ubuntu, so the assertion runs there.
    it.runIf(process.platform === "linux")("does not leak an fd per directory on each call", () => {
        const calls = 50;
        const deletedBefore = countFdsPointingAt(deletedDir);
        const backupBefore = countFdsPointingAt(backupDir);

        for (let i = 0; i < calls; i++) listCommunitiesSync(pkc);

        // Before the fix this grows by exactly `calls` per directory (50 each here); in production it
        // reached 524,070 per directory after 13 days.
        expect(countFdsPointingAt(deletedDir) - deletedBefore).to.equal(0);
        expect(countFdsPointingAt(backupDir) - backupBefore).to.equal(0);
    });

    it("lists only files with a SQLite header, never directories or other files", () => {
        const listed = listCommunitiesSync(pkc);
        expect(listed).to.include(sqliteFile);
        expect(listed).to.not.include(notSqliteFile);
        expect(listed).to.not.include("deleted");
        expect(listed).to.not.include(".backup_before_migration");
    });
});
