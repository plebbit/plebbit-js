import { defineConfig } from "vitest/config";
import quietSummaryReporter from "../test/reporters/quiet-summary-reporter.js";

// Launch-specific Vitest config: node-only + quiet reporter so VS Code debugging stays readable.
export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./test/vitest-node-setup.js"],
        include: ["test/node/**/*.test.{js,ts}", "test/node-and-browser/**/*.test.{js,ts}", "test/challenges/**/*.test.{js,ts}"],
        allowOnly: true,
        passWithNoTests: false,
        bail: 1,
        reporters: [quietSummaryReporter()],
        fileParallelism: false,
        dangerouslyIgnoreUnhandledErrors: false
    }
});
