// Import necessary modules
import { spawn, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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

// Add this helper function after the imports
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
    // For browser environments, run Karma with the webpacked test files
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const projectRoot = path.resolve(__dirname, "..");

    // Use locally installed karma from node_modules
    const karmaBin = path.join(projectRoot, "node_modules", ".bin", "karma");
    const karmaConfigPath = path.join(projectRoot, "config", "karma.conf.cjs");

    // Set browser paths based on environment
    if (environment.toLowerCase().includes("chrome")) {
        // Check if CHROME_BIN is already set (e.g., from CI environment)
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
                console.warn("Could not find Chrome executable. Please set CHROME_BIN environment variable manually.");
                // Set a default value to avoid errors
                env.CHROME_BIN = "chrome";
                getBrowserVersion("chrome", "Chrome (default fallback)");
            }
        }

        // Unset Firefox to ensure only Chrome runs
        delete env.FIREFOX_BIN;
    } else if (environment.toLowerCase().includes("firefox")) {
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
                // Add version logging here
                getBrowserVersion(firefoxPath, "Firefox");
                break;
            }
        }

        if (!env.FIREFOX_BIN) {
            console.warn("Could not find Firefox executable. Please set FIREFOX_BIN environment variable manually.");
            // Set a default value to avoid errors
            env.FIREFOX_BIN = "firefox";
            // Try to get version of the default firefox command
            getBrowserVersion("firefox", "Firefox (default)");
        }

        // Unset Chrome to ensure only Firefox runs
        delete env.CHROME_BIN;
    }

    // Also add version checking for existing CHROME_BIN/FIREFOX_BIN env vars
    if (env.CHROME_BIN && environment.toLowerCase().includes("chrome")) {
        console.log("========================================");
        console.log("CHROME VERSION CHECK:");
        getBrowserVersion(env.CHROME_BIN, "Chrome");
        console.log("========================================");
    }

    if (env.FIREFOX_BIN && environment.toLowerCase().includes("firefox")) {
        console.log("========================================");
        console.log("FIREFOX VERSION CHECK:");
        getBrowserVersion(env.FIREFOX_BIN, "Firefox");
        console.log("========================================");
    }

    console.log(`Running karma with environment: ${environment}`);
    console.log(`Karma binary: ${karmaBin}`);
    console.log(`Karma config: ${karmaConfigPath}`);
    console.log(
        `Environment variables: PLEBBIT_CONFIGS=${env.PLEBBIT_CONFIGS}, CHROME_BIN=${env.CHROME_BIN}, FIREFOX_BIN=${env.FIREFOX_BIN}`
    );

    const karmaProcess = spawn(karmaBin, ["start", karmaConfigPath], {
        stdio: "inherit",
        env: env,
        shell: true // Use shell to handle path issues on different platforms
    });

    karmaProcess.on("exit", (code) => {
        process.exit(code);
    });
}
