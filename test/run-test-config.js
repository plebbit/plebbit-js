const plebbitConfigTypes = ["remote-kubo-rpc", "remote-ipfs-gateway", "remote-plebbit-rpc"];
const environment = ["node", "firefox", "chrome"];

import { setRemotePlebbitConfigs } from "../dist/node/test/test-util.js";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        plebbitConfigs: [],
        environment: "node" // Default to node environment
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--plebbit-config" && i + 1 < args.length) {
            // Check if the next argument is a comma-separated list
            const configValues = args[i + 1].split(",");
            options.plebbitConfigs.push(...configValues);
            i++; // Skip the next argument as it's the value
        } else if (arg === "--environment" && i + 1 < args.length) {
            options.environment = args[i + 1];
            i++; // Skip the next argument as it's the value
        }
    }

    return options;
}

// Validate plebbit configs
function validatePlebbitConfigs(configs) {
    const invalidConfigs = configs.filter((config) => !plebbitConfigTypes.includes(config));
    if (invalidConfigs.length > 0) {
        console.error(`Error: Invalid plebbit-config value(s): ${invalidConfigs.join(", ")}`);
        console.error(`Valid options are: ${plebbitConfigTypes.join(", ")}`);
        process.exit(1);
    }
    return true;
}

// Validate environment
function validateEnvironment(env) {
    if (!environment.includes(env)) {
        console.error(`Error: Invalid environment value: ${env}`);
        console.error(`Valid options are: ${environment.join(", ")}`);
        process.exit(1);
    }
    return true;
}

// Run mocha tests with the specified configuration
function runMochaTests(plebbitConfigs) {
    return new Promise((resolve, reject) => {
        // Path to local mocha executable
        const mochaBin = path.resolve(__dirname, "../node_modules/.bin/mocha");

        const mochaArgs = ["--forbid-only", "--bail", "--exit", "--recursive", "--config", "config/.mocharc.json", "test/node-and-browser"];

        console.log(`Running mocha with: ${mochaBin} ${mochaArgs.join(" ")}`);

        const env = { ...process.env };
        env.PLEBBIT_CONFIGS = plebbitConfigs.join(",");

        const mochaProcess = spawn(mochaBin, mochaArgs, {
            stdio: "inherit",
            shell: true,
            env: env
        });

        mochaProcess.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Mocha exited with code ${code}`));
            }
        });

        mochaProcess.on("error", (err) => {
            reject(err);
        });
    });
}

// Run karma tests with the specified configuration and browser
function runKarmaTests(plebbitConfigs, browser) {
    return new Promise((resolve, reject) => {
        // Path to local karma executable
        const karmaBin = path.resolve(__dirname, "../node_modules/.bin/karma");

        // Pass plebbit configs as client.config to karma
        const karmaArgs = ["start", "config/karma.conf.cjs"];

        console.log(`Running karma with: ${karmaBin} ${karmaArgs.join(" ")}`);

        const env = { ...process.env };
        // Also set as environment variable for backward compatibility
        env.PLEBBIT_CONFIGS = plebbitConfigs.join(",");

        // Set browser environment variables
        if (browser === "chrome") {
            env.CHROME_BIN = process.env.CHROME_BIN || "chrome";
            env.FIREFOX_BIN = "";
        } else if (browser === "firefox") {
            env.FIREFOX_BIN = process.env.FIREFOX_BIN || "firefox";
            env.CHROME_BIN = "";
        }

        const karmaProcess = spawn(karmaBin, karmaArgs, {
            stdio: "inherit",
            shell: true,
            env: env
        });

        karmaProcess.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Karma exited with code ${code}`));
            }
        });

        karmaProcess.on("error", (err) => {
            reject(err);
        });
    });
}

// Main function to run the tool
async function main() {
    const options = parseArgs();

    if (options.plebbitConfigs.length > 0) {
        validatePlebbitConfigs(options.plebbitConfigs);
        validateEnvironment(options.environment);

        console.log(`Using plebbit-config(s): ${options.plebbitConfigs.join(", ")}`);
        console.log(`Using environment: ${options.environment}`);

        // Set the remote plebbit configs before running tests
        setRemotePlebbitConfigs(options.plebbitConfigs);

        try {
            // Run tests based on environment
            if (options.environment === "node") {
                await runMochaTests(options.plebbitConfigs);
            } else if (options.environment === "chrome" || options.environment === "firefox") {
                await runKarmaTests(options.plebbitConfigs, options.environment);
            }
            process.exit(0);
        } catch (error) {
            console.error("Error running tests:", error.message);
            process.exit(1);
        }
    } else {
        console.log(`No plebbit-config specified. Available options: ${plebbitConfigTypes.join(", ")}`);
        process.exit(1);
    }
}

// Run the main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error("Error running tests:", error);
        process.exit(1);
    });
}

// Export variables and functions
export { plebbitConfigTypes, environment, parseArgs, validatePlebbitConfigs, validateEnvironment, main, runMochaTests, runKarmaTests };
