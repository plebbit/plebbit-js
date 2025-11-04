// Import necessary modules
import { spawn, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

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

function parseArgs(rawArgs) {
    const options = new Map();
    const positionals = [];

    for (let index = 0; index < rawArgs.length; index += 1) {
        const token = rawArgs[index];
        if (!token.startsWith("--")) {
            positionals.push(token);
            continue;
        }

        const key = token.slice(2);
        const nextToken = rawArgs[index + 1];
        const hasValue = typeof nextToken === "string" && !nextToken.startsWith("--");

        if (!options.has(key)) {
            options.set(key, []);
        }

        if (hasValue) {
            options.get(key).push(nextToken);
            index += 1;
        } else {
            options.get(key).push(true);
        }
    }

    return { options, positionals };
}

function getLastOption(options, name) {
    const values = options.get(name);
    if (!values || values.length === 0) {
        return undefined;
    }
    return values[values.length - 1];
}

function getAllOptions(options, name) {
    const values = options.get(name);
    if (!values) {
        return [];
    }
    return values;
}

function resolveMaybePath(spec) {
    if (!spec || spec === true) {
        return undefined;
    }
    return path.isAbsolute(spec) ? spec : path.resolve(projectRoot, spec);
}

function prepareWriteStream(filePath) {
    if (!filePath) {
        return undefined;
    }
    fs.rmSync(filePath, { force: true });
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    return fs.createWriteStream(filePath, { flags: "w" });
}

const rawArgs = process.argv.slice(2);
const { options } = parseArgs(rawArgs);

const environment = getLastOption(options, "environment") ?? "node";
const normalizedEnvironment = environment.toLowerCase();
const isNodeEnvironment = normalizedEnvironment === "node";

const env = { ...process.env };

let plebbitConfigs = getLastOption(options, "plebbit-config");
if (typeof plebbitConfigs === "string") {
    plebbitConfigs = plebbitConfigs.trim();
    if (plebbitConfigs.length === 0) {
        plebbitConfigs = undefined;
    }
}

if (!plebbitConfigs) {
    const envConfigs = env.PLEBBIT_CONFIGS ? env.PLEBBIT_CONFIGS.trim() : "";
    plebbitConfigs = envConfigs.length > 0 ? envConfigs : undefined;
}

if (!plebbitConfigs && !isNodeEnvironment) {
    console.error("========================================");
    console.error("ERROR: No --plebbit-config argument provided!");
    console.error("Usage: node test/run-test-config.js --plebbit-config <config1,config2,...> --environment <node|chrome|firefox>");
    console.error("========================================");
    process.exit(1);
}

if (plebbitConfigs) {
    env.PLEBBIT_CONFIGS = plebbitConfigs;
} else {
    delete env.PLEBBIT_CONFIGS;
}

// Print the configs before running any tests
console.log("========================================");
if (plebbitConfigs) {
    console.log("PLEBBIT_CONFIGS set to:", plebbitConfigs);
    console.log("Configs array:", plebbitConfigs.split(","));
} else {
    console.log("PLEBBIT_CONFIGS not provided; continuing without overriding configs.");
}
console.log("========================================");

console.log(`Running tests in ${environment} environment`);

const logPrefix = getLastOption(options, "log-prefix");
const stdoutLogPath =
    resolveMaybePath(getLastOption(options, "stdout-log")) ?? (logPrefix ? resolveMaybePath(`${logPrefix}.stdout.log`) : undefined);
const stderrLogPath =
    resolveMaybePath(getLastOption(options, "stderr-log")) ?? (logPrefix ? resolveMaybePath(`${logPrefix}.stderr.log`) : undefined);

const mochaSpecOverrides = getAllOptions(options, "mocha-spec");
const mochaSpecPaths =
    mochaSpecOverrides.length > 0
        ? mochaSpecOverrides.map((spec) => resolveMaybePath(spec)).filter(Boolean)
        : [path.join(__dirname, "node-and-browser")];

const parseTimeoutMs = (value) => {
    if (value === undefined || value === true) {
        return undefined;
    }
    const parsed = Number.parseInt(String(value), 10);
    if (Number.isNaN(parsed) || parsed < 0) {
        return undefined;
    }
    return parsed;
};

let runTimeoutMs = parseTimeoutMs(getLastOption(options, "run-timeout-ms"));
if (runTimeoutMs === undefined) {
    runTimeoutMs = parseTimeoutMs(env.TEST_NODE_LOCAL_TIMEOUT_MS ?? env.RUN_TEST_TIMEOUT_MS ?? env.TEST_RUN_TIMEOUT_MS);
}
if (runTimeoutMs === undefined && isNodeEnvironment) {
    runTimeoutMs = 25 * 60 * 1000;
}

const pickFirstDefined = (...values) => {
    for (const value of values) {
        if (value !== undefined && value !== true && value !== "") {
            return value;
        }
    }
    return undefined;
};

let mochaTimeoutValue = getLastOption(options, "mocha-timeout");
if (mochaTimeoutValue === true) {
    mochaTimeoutValue = undefined;
}
if (mochaTimeoutValue === undefined) {
    mochaTimeoutValue = pickFirstDefined(env.MOCHA_TIMEOUT, env.TEST_NODE_LOCAL_MOCHA_TIMEOUT_MS, isNodeEnvironment ? "300000" : undefined);
}

const waitForStreamFinish = (stream) =>
    new Promise((resolve, reject) => {
        stream.once("finish", resolve);
        stream.once("error", reject);
    });

const runNodeTests = () => {
    const mochaBin = path.join(projectRoot, "node_modules", "mocha", "bin", "mocha.js");
    const mochaArgs = ["--recursive", "--exit", "--forbid-only", "--bail", "--config", path.join(projectRoot, "config", ".mocharc.json")];

    if (options.has("parallel")) {
        mochaArgs.push("--parallel");
        const jobs = getLastOption(options, "jobs");
        if (jobs !== undefined && jobs !== true) {
            mochaArgs.push("--jobs", String(jobs));
        }
    }

    if (mochaTimeoutValue !== undefined) {
        mochaArgs.push("--timeout", String(mochaTimeoutValue));
    }

    mochaArgs.push(...mochaSpecPaths);

    console.log("Mocha binary:", mochaBin);
    console.log("Mocha arguments:", mochaArgs.join(" "));
    if (runTimeoutMs !== undefined) {
        console.log(`Run timeout (wrapper): ${runTimeoutMs}ms`);
    } else {
        console.log("Run timeout (wrapper): disabled");
    }
    if (stdoutLogPath || stderrLogPath) {
        console.log("Log capture:", {
            stdout: stdoutLogPath ?? "console only",
            stderr: stderrLogPath ?? "console only"
        });
    }

    const captureStreams = Boolean(stdoutLogPath || stderrLogPath);
    const stdoutStream = stdoutLogPath ? prepareWriteStream(stdoutLogPath) : undefined;
    const stderrStream = stderrLogPath ? prepareWriteStream(stderrLogPath) : undefined;

    const mochaProcess = spawn(process.execPath, [mochaBin, ...mochaArgs], {
        cwd: projectRoot,
        env,
        stdio: captureStreams ? ["ignore", "pipe", "pipe"] : "inherit"
    });

    const forwardSignal = (signal) => {
        if (!mochaProcess.killed) {
            try {
                mochaProcess.kill(signal);
            } catch (error) {
                console.error(`Failed to forward ${signal} to Mocha:`, error);
            }
        }
    };

    ["SIGINT", "SIGTERM"].forEach((signal) => {
        process.on(signal, () => forwardSignal(signal));
    });

    if (captureStreams) {
        mochaProcess.stdout?.on("data", (chunk) => {
            stdoutStream?.write(chunk);
            process.stdout.write(chunk);
        });
        mochaProcess.stderr?.on("data", (chunk) => {
            stderrStream?.write(chunk);
            process.stderr.write(chunk);
        });
    }

    let timedOut = false;
    let exitHandled = false;
    let timeoutHandle;
    let sigtermHandle;
    let sigkillHandle;
    let absoluteTimeoutHandle;

    const isWindows = process.platform === "win32";

    const sendSignal = (signal, label) => {
        try {
            const result = signal ? mochaProcess.kill(signal) : mochaProcess.kill();
            if (!result) {
                console.error(`Attempt to send ${label ?? signal ?? "default"} to Mocha returned false.`);
            }
            return result;
        } catch (error) {
            console.error(`Failed to send ${label ?? signal ?? "default"} to Mocha:`, error);
            return false;
        }
    };

    const taskKillWindows = (stage) => {
        if (!isWindows) {
            return;
        }
        const args = ["/pid", String(mochaProcess.pid), "/t", "/f"];
        try {
            const killer = spawn("taskkill", args, {
                windowsHide: true,
                stdio: ["ignore", "ignore", "inherit"]
            });
            killer.once("error", (error) => {
                console.error(`Failed to run taskkill during ${stage}:`, error);
            });
        } catch (error) {
            console.error(`Failed to spawn taskkill during ${stage}:`, error);
        }
    };

    const attemptTerminate = (stage) => {
        console.error(`Attempting to terminate Mocha (${stage}).`);
        if (sendSignal("SIGTERM", "SIGTERM") || sendSignal("SIGINT", "SIGINT")) {
            taskKillWindows(stage);
            return;
        }
        if (!sendSignal(undefined, "default kill")) {
            console.error("Direct process.kill without signal reported failure.");
        }
        taskKillWindows(stage);
    };

    const attemptHardKill = (stage) => {
        console.error(`Attempting hard kill of Mocha (${stage}).`);
        sendSignal("SIGKILL", "SIGKILL");
        sendSignal(undefined, "default kill");
        taskKillWindows(`${stage} hard kill`);
    };

    const cleanupAndExit = async (code) => {
        if (exitHandled) {
            return;
        }
        exitHandled = true;

        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
        }
        if (sigtermHandle) {
            clearTimeout(sigtermHandle);
        }
        if (sigkillHandle) {
            clearTimeout(sigkillHandle);
        }
        if (absoluteTimeoutHandle) {
            clearTimeout(absoluteTimeoutHandle);
        }

        const closePromises = [];
        if (stdoutStream) {
            stdoutStream.end();
            closePromises.push(waitForStreamFinish(stdoutStream));
        }
        if (stderrStream) {
            stderrStream.end();
            closePromises.push(waitForStreamFinish(stderrStream));
        }
        if (closePromises.length > 0) {
            try {
                await Promise.all(closePromises);
            } catch (streamError) {
                console.error("Failed to finalise log streams:", streamError);
            }
        }

        process.exit(code);
    };

    const finalize = (code) => {
        cleanupAndExit(code).catch((cleanupError) => {
            console.error("Failed during cleanup:", cleanupError);
            process.exit(code);
        });
    };

    if (runTimeoutMs !== undefined && runTimeoutMs > 0) {
        const scheduleKill = () => {
            if (exitHandled) {
                return;
            }
            timedOut = true;
            console.error(`Mocha did not finish within ${Math.round(runTimeoutMs / 1000)} seconds. Sending SIGTERM...`);
            attemptTerminate("timeout");
            sigtermHandle = setTimeout(() => {
                if (exitHandled) {
                    return;
                }
                console.error("Mocha still running after SIGTERM. Sending SIGKILL...");
                attemptHardKill("timeout escalation");
                sigkillHandle = setTimeout(() => {
                    if (!exitHandled) {
                        console.error("Mocha did not exit after SIGKILL. Forcing wrapper process to finish.");
                        finalize(124);
                    }
                }, 2000);
            }, 5000);
        };

        timeoutHandle = setTimeout(scheduleKill, runTimeoutMs);
        absoluteTimeoutHandle = setTimeout(() => {
            if (exitHandled) {
                return;
            }
            console.error("Attempting final SIGKILL before hard exit...");
            attemptHardKill("absolute timeout");
            console.error(`Hard timeout reached (${runTimeoutMs + 7000}ms since start). Forcing wrapper exit.`);
            finalize(124);
        }, runTimeoutMs + 7000);
    }

    const settle = (code, signal, source) => {
        if (exitHandled) {
            return;
        }

        if (timedOut) {
            console.error(`Mocha run terminated after exceeding ${runTimeoutMs}ms (observed via ${source} event).`);
            finalize(124);
            return;
        }

        if (signal) {
            console.error(`Mocha exited due to signal ${signal} (${source} event).`);
            finalize(1);
            return;
        }

        finalize(typeof code === "number" ? code : 1);
    };

    mochaProcess.once("error", (error) => {
        console.error("Failed to start Mocha:", error);
        finalize(1);
    });
    mochaProcess.once("exit", (code, signal) => settle(code, signal, "exit"));
    mochaProcess.once("close", (code, signal) => settle(code, signal, "close"));
};

const runBrowserTests = () => {
    const vitestBin = path.join(projectRoot, "node_modules", ".bin", "vitest");

    let vitestArgs = ["run"];
    const vitestConfigPath = path.join(projectRoot, "config", "vitest.config.js");

    if (environment.toLowerCase().includes("chrome")) {
        env.VITEST_BROWSER = "chromium";
        console.log("Using Playwright's Chromium browser (default)");
    } else if (environment.toLowerCase().includes("firefox")) {
        env.VITEST_BROWSER = "firefox";
        console.log("Using Playwright's Firefox browser");
    }

    vitestArgs.push("--config", vitestConfigPath);

    const reporterOverrides = getAllOptions(options, "reporter");
    if (reporterOverrides.length > 0) {
        reporterOverrides.forEach((reporter) => {
            if (typeof reporter === "string") {
                vitestArgs.push("--reporter", reporter);
            }
        });
    }

    console.log(`Running Vitest with environment: ${environment}`);
    console.log(`Vitest binary: ${vitestBin}`);
    console.log(`Vitest config: ${vitestConfigPath}`);
    console.log(`Vitest args: ${vitestArgs.join(" ")}`);
    console.log(`Environment variables: PLEBBIT_CONFIGS=${env.PLEBBIT_CONFIGS}, VITEST_BROWSER=${env.VITEST_BROWSER}`);

    const vitestProcess = spawn(vitestBin, vitestArgs, {
        stdio: "inherit",
        env,
        shell: true
    });

    vitestProcess.on("exit", (code) => {
        process.exit(code);
    });
};

if (isNodeEnvironment) {
    runNodeTests();
} else {
    runBrowserTests();
}
