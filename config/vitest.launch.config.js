import { defineConfig } from "vitest/config";
const defaultTimeoutMs = Number.parseInt(process.env.VITEST_LAUNCH_TIMEOUT ?? process.env.VITEST_TIMEOUT ?? "60000", 10);

// Launch-specific Vitest config: node-only + tree reporter to keep debug output readable.
export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./test/vitest-node-setup.js"],
        include: ["test/node/**/*.test.{js,ts}", "test/node-and-browser/**/*.test.{js,ts}", "test/challenges/**/*.test.{js,ts}"],
        allowOnly: false,
        passWithNoTests: false,
        bail: 1,
        reporters: ["tree"],
        fileParallelism: false,
        dangerouslyIgnoreUnhandledErrors: false,
        testTimeout: defaultTimeoutMs,
        hookTimeout: defaultTimeoutMs,
        teardownTimeout: defaultTimeoutMs
    }
});
