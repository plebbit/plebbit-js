// Import necessary modules
import { spawn, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Add helper function to get browser version
function getBrowserVersion(browserPath, browserName) {
    try {
        const versionOutput = execSync(`"${browserPath}" --version`, {
            encoding: "utf8",
            timeout: 5000,
            stdio: ["ignore", "pipe", "ignore"]
        });
        console.log(`${browserName} version: ${versionOutput.trim()}`);
        return versionOutput.trim();
    } catch (error) {
        console.warn(`Could not get ${browserName} version from ${browserPath}: ${error.message}`);
        return "Version check failed";
    }
}

// Get command line arguments
const args = process.argv.slice(2);
const plebbitConfigIndex = args.indexOf("--plebbit-config");
const environmentIndex = args.indexOf("--environment");

// Check if plebbit configs are provided
if (plebbitConfigIndex === -1 || plebbitConfigIndex + 1 >= args.length) {
    console.error("========================================");
    console.error("ERROR: No --plebbit-config argument provided!");
    console.error("Usage: node test/run-test-config.js --plebbit-config <config1,config2,...> --environment <node|chrome|firefox>");
    console.error("========================================");
    process.exit(1); // Exit with error code
}

// Set up environment variables
const plebbitConfigs = args[plebbitConfigIndex + 1];
if (!plebbitConfigs || plebbitConfigs.trim() === "") {
    console.error("========================================");
    console.error("ERROR: Empty plebbit configs provided!");
    console.error("Usage: node test/run-test-config.js --plebbit-config <config1,config2,...> --environment <node|chrome|firefox>");
    console.error("========================================");
    process.exit(1); // Exit with error code
}

// Set environment variable for child processes
process.env.PLEBBIT_CONFIGS = plebbitConfigs;

// Print the configs before running any tests
console.log("========================================");
console.log("PLEBBIT_CONFIGS set to:", plebbitConfigs);
console.log("Configs array:", plebbitConfigs.split(","));
console.log("========================================");

// Get environment (node or browser)
const environment = environmentIndex !== -1 && environmentIndex + 1 < args.length ? args[environmentIndex + 1] : "node";

console.log(`Running tests in ${environment} environment`);

// Create a new environment object with all current env variables
const env = { ...process.env };

// Run the appropriate test runner with the test directories
if (environment === "node") {
    // For Node.js, run Mocha with the node-and-browser test directory
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const projectRoot = path.resolve(__dirname, "..");
    const testDir = path.join(__dirname, "node-and-browser");

    // Use locally installed mocha from node_modules
    const mochaBin = path.join(projectRoot, "node_modules", ".bin", "mocha");
    const mochaArgs = ["--recursive", "--exit", "--forbid-only", "--bail", testDir];

    console.log(`Running mocha with args:`, mochaArgs.join(" "));
    console.log(`Environment variables: PLEBBIT_CONFIGS=${env.PLEBBIT_CONFIGS}`);

    const mochaProcess = spawn(mochaBin, mochaArgs, {
        stdio: "inherit",
        env: env
    });

    mochaProcess.on("exit", (code) => {
        process.exit(code);
    });
} else {
    // For browser environments, run Vitest with Playwright
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const projectRoot = path.resolve(__dirname, "..");

    // Use locally installed vitest from node_modules
    const vitestBin = path.join(projectRoot, "node_modules", ".bin", "vitest");

    let vitestArgs = ["run", "--reporter=verbose"];
    let vitestConfigPath;

    // Set browser-specific configuration and environment
    if (environment.toLowerCase().includes("chrome")) {
        // Set Chrome executable path for Playwright
        if (env.CHROME_BIN && env.CHROME_BIN.trim() !== "") {
            console.log(`Using Chrome from CHROME_BIN environment variable: ${env.CHROME_BIN}`);
            if (fs.existsSync(env.CHROME_BIN)) {
                console.log(`Verified Chrome exists at: ${env.CHROME_BIN}`);
                getBrowserVersion(env.CHROME_BIN, "Chrome (from CHROME_BIN)");
            } else {
                console.warn(`Warning: CHROME_BIN points to non-existent path: ${env.CHROME_BIN}`);
            }
        } else {
            // Try to find Chrome/Chromium executable
            const possibleChromePaths = [
                "/usr/bin/google-chrome",
                "/usr/bin/chromium",
                "/usr/bin/chromium-browser",
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
                "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
            ];

            for (const chromePath of possibleChromePaths) {
                if (fs.existsSync(chromePath)) {
                    env.CHROME_BIN = chromePath;
                    console.log(`Found Chrome at: ${chromePath}`);
                    getBrowserVersion(chromePath, "Chrome (auto-detected)");
                    break;
                }
            }

            if (!env.CHROME_BIN) {
                console.warn("Could not find Chrome executable. Using Playwright's bundled Chromium.");
                // Don't set CHROME_BIN - let Playwright use its bundled browser
            }
        }

        // Use default vitest config (which uses Chromium)
        vitestConfigPath = path.join(projectRoot, "vitest.config.js");

        // Set Playwright environment for Chromium
        env.PLAYWRIGHT_BROWSERS_PATH = env.PLAYWRIGHT_BROWSERS_PATH || "0";

        console.log("========================================");
        console.log("FINAL CHROME VERSION CHECK:");
        if (env.CHROME_BIN) {
            getBrowserVersion(env.CHROME_BIN, "Chrome (final)");
        } else {
            console.log("Using Playwright's bundled Chromium");
        }
        console.log("========================================");
    } else if (environment.toLowerCase().includes("firefox")) {
        // Create Firefox-specific config on the fly or use a separate config
        vitestConfigPath = path.join(projectRoot, "vitest.config.js");

        // Override browser type for Firefox
        env.VITEST_BROWSER = "firefox";

        // Try to find Firefox executable
        const possibleFirefoxPaths = [
            "/usr/bin/firefox",
            "/Applications/Firefox.app/Contents/MacOS/firefox",
            "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
            "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe"
        ];

        for (const firefoxPath of possibleFirefoxPaths) {
            if (fs.existsSync(firefoxPath)) {
                env.FIREFOX_BIN = firefoxPath;
                console.log(`Found Firefox at: ${firefoxPath}`);
                getBrowserVersion(firefoxPath, "Firefox");
                break;
            }
        }

        if (!env.FIREFOX_BIN) {
            console.warn("Could not find Firefox executable. Using Playwright's bundled Firefox.");
            // Don't set FIREFOX_BIN - let Playwright use its bundled browser
        }

        console.log("========================================");
        console.log("FINAL FIREFOX VERSION CHECK:");
        if (env.FIREFOX_BIN) {
            getBrowserVersion(env.FIREFOX_BIN, "Firefox (final)");
        } else {
            console.log("Using Playwright's bundled Firefox");
        }
        console.log("========================================");
    }

    // Add config argument if we have a specific config
    if (vitestConfigPath) {
        vitestArgs.push("--config", vitestConfigPath);
    }

    console.log(`Running Vitest with environment: ${environment}`);
    console.log(`Vitest binary: ${vitestBin}`);
    console.log(`Vitest config: ${vitestConfigPath}`);
    console.log(`Vitest args: ${vitestArgs.join(" ")}`);
    console.log(
        `Environment variables: PLEBBIT_CONFIGS=${env.PLEBBIT_CONFIGS}, VITEST_BROWSER=${env.VITEST_BROWSER}, CHROME_BIN=${env.CHROME_BIN}, FIREFOX_BIN=${env.FIREFOX_BIN}`
    );

    const vitestProcess = spawn(vitestBin, vitestArgs, {
        stdio: "inherit",
        env: env,
        shell: true
    });

    vitestProcess.on("exit", (code) => {
        process.exit(code);
    });
}
