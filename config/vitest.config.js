import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import mocharc from "./.mocharc.json";

const mochaTimeout = mocharc.timeout;
const isFirefox = process.env.VITEST_BROWSER === "firefox";
const playwrightProvider = playwright(
    isFirefox
        ? {}
        : {
              launchOptions: {
                  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-web-security"]
              }
          }
);

export default defineConfig({
    test: {
        // Browser mode configuration
        browser: {
            enabled: true,
            provider: playwrightProvider,
            headless: true,
            screenshotFailures: false,
            instances: [
                {
                    browser: isFirefox ? "firefox" : "chromium"
                }
            ]
        },

        // Test file patterns - browser-specific and cross-platform tests
        include: ["test/*browser/**/*.test.js"],

        // Enable Vitest globals (describe, it, expect, etc.) for mocha-style tests
        globals: true,

        // Add missing Mocha globals that some tests expect
        setupFiles: ["./test/vitest-browser-setup.js"],

        // Sequential execution configuration
        fileParallelism: false, // Run test files sequentially instead of in parallel

        // Environment variables
        env: {
            PLEBBIT_CONFIGS: process.env.PLEBBIT_CONFIGS,
            DEBUG: process.env.DEBUG,
            NO_COLOR: process.env.NO_COLOR,
            FORCE_COLOR: process.env.FORCE_COLOR,
            CI: process.env.CI
        },

        // some tests are skipped if no remote plebbit RPC configs are available
        passWithNoTests: true,

        // Timeouts
        testTimeout: mochaTimeout,
        hookTimeout: mochaTimeout,
        browserStartTimeout: mochaTimeout
    },

    // Define global constants for build-time replacement
    define: {
        "process.env.PLEBBIT_CONFIGS": JSON.stringify(process.env.PLEBBIT_CONFIGS),
        "process.env.DEBUG": JSON.stringify(process.env.DEBUG),
        // Also set window.PLEBBIT_CONFIGS for browser environment
        "globalThis.PLEBBIT_CONFIGS": JSON.stringify(process.env.PLEBBIT_CONFIGS),
        "window.PLEBBIT_CONFIGS": JSON.stringify(process.env.PLEBBIT_CONFIGS)
    },

    // Redirect Node.js imports to browser builds (just like webpack does)
    resolve: {
        alias: [
            // Handle any depth of relative paths to dist/node
            {
                find: /^((\.\.\/)+)dist\/node(\/.*)?$/,
                replacement: (match, relativePath, lastSlash, subPath) => {
                    const path = subPath || "";
                    return `${relativePath}dist/browser${path}`;
                }
            }
        ]
    }
});
