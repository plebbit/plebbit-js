import { mkdirSync } from "node:fs";
import { defineConfig } from "vitest/config";

const parsedTimeoutMs = Number.parseInt(process.env.VITEST_LAUNCH_TIMEOUT ?? process.env.VITEST_TIMEOUT ?? "120000", 10);
const vitestLaunchReportDir = ".vitest.launch.reports";
const vitestLaunchJsonReportPath = `${vitestLaunchReportDir}/node-tests.json`;
const launchReporters = ["tree", ["json", { outputFile: vitestLaunchJsonReportPath }]];

mkdirSync(vitestLaunchReportDir, { recursive: true });

// Launch-specific Vitest config: node-only + tree reporter to keep debug output readable while still emitting machine-readable JSON.
export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./test/vitest-node-setup.js"],
        include: ["test/node/**/*.test.{js,ts}", "test/node-and-browser/**/*.test.{js,ts}", "test/challenges/**/*.test.{js,ts}"],
        allowOnly: true,
        passWithNoTests: true,
        bail: 1,
        reporters: launchReporters,
        fileParallelism: true,
        dangerouslyIgnoreUnhandledErrors: false,
        testTimeout: parsedTimeoutMs,
        hookTimeout: parsedTimeoutMs,
        teardownTimeout: parsedTimeoutMs,
        maxConcurrency: 10
    }
});
