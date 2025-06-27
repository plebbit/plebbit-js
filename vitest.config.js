import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // Browser mode configuration
        browser: {
            enabled: true,
            provider: "playwright",
            headless: true,
            screenshotOnFailure: false,
            instances: [
                {
                    browser: process.env.VITEST_BROWSER === "firefox" ? "firefox" : "chromium",
                    launch: {
                        args:
                            process.env.VITEST_BROWSER === "firefox"
                                ? [] // Firefox doesn't need special security args
                                : ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-web-security"]
                        // Remove executablePath to let Playwright use its global browser installation
                    }
                }
            ]
        },

        // Test file patterns - browser-specific and cross-platform tests
        include: ["test/browser/**/*.test.js", "test/node-and-browser/**/*.test.js"],

        // Enable Vitest globals (describe, it, expect, etc.) for mocha-style tests
        globals: true,

        // Add missing Mocha globals that some tests expect
        setupFiles: ["./test/vitest-browser-setup.js"],

        // Environment variables
        env: {
            PLEBBIT_CONFIGS: process.env.PLEBBIT_CONFIGS || "",
            DEBUG: process.env.DEBUG || ""
        },

        // Aggressive failure handling
        bail: 1,
        maxConcurrency: 1,
        fileParallelism: false,
        isolate: false,

        // Timeouts
        testTimeout: 100000,
        hookTimeout: 100000,
        browserStartTimeout: 120000
    },

    // Redirect Node.js imports to browser builds (just like webpack does)
    resolve: {
        alias: {
            "../../dist/node/index.js": "../../dist/browser/index.js",
            "../../dist/node": "../../dist/browser"
        }
    }
});
