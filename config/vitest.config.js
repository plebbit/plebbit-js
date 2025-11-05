import { mkdirSync } from "node:fs";
import { defineConfig, defineProject } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

const sharedTimeoutMs = Number.parseInt(process.env.VITEST_TIMEOUT ?? "60000", 10) || 60000;

const isFirefox = process.env.VITEST_BROWSER === "firefox";
const vitestReportDir = ".vitest-reports";
const vitestJsonReportPath = `${vitestReportDir}/browser-tests.json`;
const vitestHtmlReportPath = `${vitestReportDir}/browser-tests/index.html`;
const sharedReporters = [
    "default",
    "verbose",
    ["json", { outputFile: vitestJsonReportPath }],
    ["html", { outputFile: vitestHtmlReportPath }]
];

mkdirSync(vitestReportDir, { recursive: true });

const playwrightProvider = playwright(
    isFirefox
        ? {}
        : {
              launchOptions: {
                  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-web-security"]
              }
          }
);

const browserProject = defineProject({
    name: "browser",
    test: {
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
        include: ["test/*browser/**/*.test.js"],
        globals: true,
        setupFiles: ["./test/vitest-browser-setup.js"],
        env: {
            PLEBBIT_CONFIGS: process.env.PLEBBIT_CONFIGS,
            DEBUG: process.env.DEBUG,
            NO_COLOR: process.env.NO_COLOR,
            FORCE_COLOR: process.env.FORCE_COLOR,
            CI: process.env.CI
        },
        passWithNoTests: true,
        reporters: sharedReporters,
        testTimeout: sharedTimeoutMs,
        hookTimeout: sharedTimeoutMs,
        browserStartTimeout: sharedTimeoutMs,
        dangerouslyIgnoreUnhandledErrors: false,
        fileParallelism: false
    },
    define: {
        "process.env.PLEBBIT_CONFIGS": JSON.stringify(process.env.PLEBBIT_CONFIGS),
        "process.env.DEBUG": JSON.stringify(process.env.DEBUG),
        "globalThis.PLEBBIT_CONFIGS": JSON.stringify(process.env.PLEBBIT_CONFIGS),
        "window.PLEBBIT_CONFIGS": JSON.stringify(process.env.PLEBBIT_CONFIGS)
    },
    resolve: {
        alias: [
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

const nodeProject = defineProject({
    name: "node",
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./test/vitest-node-setup.js"],
        include: [
            "test/node/**/*.test.{js,ts}",
            "test/node-and-browser/**/*.test.{js,ts}",
            "test/challenges/**/*.test.{js,ts}"
        ],
        allowOnly: false,
        passWithNoTests: false,
        dangerouslyIgnoreUnhandledErrors: false,
        reporters: sharedReporters,
        fileParallelism: false
    }
});

const getTarget = () => {
    const direct = process.env.VITEST_MODE ?? process.env.VITEST_TARGET;
    return typeof direct === "string" ? direct.toLowerCase() : undefined;
};

export default defineConfig(() => {
    const target = getTarget();
    if (target === "browser") {
        return browserProject;
    }
    return nodeProject;
});
