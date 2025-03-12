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
        plebbitConfigs: []
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--plebbit-config" && i + 1 < args.length) {
            // Check if the next argument is a comma-separated list
            const configValues = args[i + 1].split(",");
            options.plebbitConfigs.push(...configValues);
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

// Main function to run the tool
async function main() {
    const options = parseArgs();

    if (options.plebbitConfigs.length > 0) {
        validatePlebbitConfigs(options.plebbitConfigs);
        console.log(`Using plebbit-config(s): ${options.plebbitConfigs.join(", ")}`);

        // Set the remote plebbit configs before running tests
        setRemotePlebbitConfigs(options.plebbitConfigs);

        try {
            // Run mocha tests
            await runMochaTests(options.plebbitConfigs);
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
export { plebbitConfigTypes, environment, parseArgs, validatePlebbitConfigs, main, runMochaTests };
