import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

// #402: a TypeScript client compiling with exactOptionalPropertyTypes must be able to pass a walked page entry's `raw`
// as a PageSortReplyEntry without remapping it
describe("PageSortReplyEntry under exactOptionalPropertyTypes", () => {
    it("accepts a page entry's raw as it is", async () => {
        const tsc = path.join(repoRoot, "node_modules", "typescript", "bin", "tsc");
        const project = path.join(repoRoot, "test", "fixtures", "types", "tsconfig.exact-optional.json");
        const result = await execFileAsync(process.execPath, [tsc, "--project", project]).then(
            ({ stdout }) => ({ code: 0, stdout }),
            (error: { code: number; stdout: string }) => ({ code: error.code, stdout: error.stdout })
        );
        expect(result.stdout).toBe("");
        expect(result.code).toBe(0);
    });
});
