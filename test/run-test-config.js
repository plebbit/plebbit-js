// Import necessary modules
import { spawn, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const vitestConfigPath = path.join(projectRoot, "config", "vitest.config.js");

const DEFAULT_NODE_OPTIONS = [
    "--experimental-specifier-resolution=node",
    "--trace-warnings",
    "--unhandled-rejections=strict",
    "--trace-deprecation"
];

const sendSignalToProcessTree = (childProcess, signal) => {
    if (!childProcess || childProcess.killed) {
        return false;
    }
    if (process.platform !== "win32") {
        try {
            process.kill(-childProcess.pid, signal);
            return true;
        } catch (error) {
            if (error.code !== "ESRCH") {
                console.error(`Failed to send ${signal} to process group ${childProcess.pid}:`, error);
            }
        }
    }
    try {
        childProcess.kill(signal);
        return true;
    } catch (error) {
        if (error.code !== "ESRCH") {
            console.error(`Failed to send ${signal} to process ${childProcess.pid}:`, error);
        }
    }
    return false;
};

const terminateProcessTree = (childProcess, label) => {
    if (!childProcess || childProcess.killed) {
        return;
    }
    sendSignalToProcessTree(childProcess, "SIGTERM");
    setTimeout(() => {
        if (!childProcess.killed) {
            console.warn(`Process ${childProcess.pid} still alive after SIGTERM (${label}); sending SIGKILL.`);
            sendSignalToProcessTree(childProcess, "SIGKILL");
        }
    }, 1000);
};

const applyNodeOptionsToEnv = (targetEnv) => {
    const existing = typeof targetEnv.NODE_OPTIONS === "string" ? targetEnv.NODE_OPTIONS.trim() : "";
    const customOptions = process.env.VITEST_NODE_OPTIONS ? process.env.VITEST_NODE_OPTIONS.split(/\s+/).filter(Boolean) : [];
    const combined = [...customOptions, ...DEFAULT_NODE_OPTIONS, existing].filter(Boolean).join(" ").trim();
    if (combined.length > 0) {
        targetEnv.NODE_OPTIONS = combined;
    }
};

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
const { options, positionals } = parseArgs(rawArgs);

const normalizeBooleanFlag = (flagName) => {
    const values = options.get(flagName);
    if (!values) {
        return;
    }
    const extras = values.filter((value) => value !== true);
    if (extras.length > 0) {
        extras.forEach((extra) => {
            if (typeof extra === "string") {
                positionals.push(extra);
            }
        });
    }
    options.set(flagName, [true]);
};

["parallel"].forEach((flag) => normalizeBooleanFlag(flag));

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

if (options.has("mocha-spec")) {
    console.warn("The --mocha-spec flag is deprecated. Pass test paths as positional arguments instead.");
}

const cliSpecArgs = positionals.length > 0 ? positionals : [];
const mochaSpecPaths =
    cliSpecArgs.length > 0 ? cliSpecArgs.map((spec) => resolveMaybePath(spec)).filter(Boolean) : [path.join(__dirname, "node-and-browser")];

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

let vitestTimeoutValue = getLastOption(options, "vitest-timeout");
if (vitestTimeoutValue === undefined) {
    vitestTimeoutValue = getLastOption(options, "mocha-timeout");
}
if (vitestTimeoutValue === true) {
    vitestTimeoutValue = undefined;
}
if (vitestTimeoutValue === undefined) {
    vitestTimeoutValue = pickFirstDefined(
        env.VITEST_TIMEOUT,
        env.MOCHA_TIMEOUT,
        env.TEST_NODE_LOCAL_MOCHA_TIMEOUT_MS,
        isNodeEnvironment ? "300000" : undefined
    );
}

const npmLifecycleEvent = env.npm_lifecycle_event || env.NPM_LIFECYCLE_EVENT;
if (vitestTimeoutValue === undefined && npmLifecycleEvent === "test:node:parallel:remote") {
    vitestTimeoutValue = "600000";
}

const waitForStreamFinish = (stream) =>
    new Promise((resolve, reject) => {
        stream.once("finish", resolve);
        stream.once("error", reject);
    });

const runNodeTests = () => {
    applyNodeOptionsToEnv(env);
    env.VITEST_MODE = "node";

    const vitestCli = path.join(projectRoot, "node_modules", "vitest", "vitest.mjs");
    const vitestArgs = ["run", "--config", vitestConfigPath, "--allowOnly", "false", "--bail", "1"];

    const isParallelMode = options.has("parallel");
    if (isParallelMode) {
        vitestArgs.push("--fileParallelism");
        const jobs = getLastOption(options, "jobs");
        if (jobs !== undefined && jobs !== true) {
            vitestArgs.push("--maxWorkers", String(jobs));
        }
    }

    const reporterOverrides = getAllOptions(options, "reporter");
    if (reporterOverrides.length > 0) {
        reporterOverrides.forEach((reporter) => {
            if (typeof reporter === "string" && reporter.length > 0) {
                vitestArgs.push("--reporter", reporter);
            }
        });
    }

    if (vitestTimeoutValue !== undefined) {
        const timeoutString = String(vitestTimeoutValue);
        vitestArgs.push("--testTimeout", timeoutString, "--hookTimeout", timeoutString, "--teardownTimeout", timeoutString);
    }

    vitestArgs.push(...mochaSpecPaths);

    console.log("Vitest CLI:", vitestCli);
    console.log("Vitest arguments:", vitestArgs.join(" "));
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

    const runnerProcess = spawn(process.execPath, [vitestCli, ...vitestArgs], {
        cwd: projectRoot,
        env,
        stdio: captureStreams ? ["ignore", "pipe", "pipe"] : "inherit",
        detached: true
    });

    const forwardSignal = (signal) => {
        if (!runnerProcess.killed) {
            sendSignalToProcessTree(runnerProcess, signal);
        }
    };

    ["SIGINT", "SIGTERM"].forEach((signal) => {
        process.on(signal, () => forwardSignal(signal));
    });
    const handleProcessExit = () => terminateProcessTree(runnerProcess, "wrapper exit");
    process.once("exit", handleProcessExit);

    if (captureStreams) {
        runnerProcess.stdout?.on("data", (chunk) => {
            stdoutStream?.write(chunk);
            process.stdout.write(chunk);
        });
        runnerProcess.stderr?.on("data", (chunk) => {
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
        const result = sendSignalToProcessTree(runnerProcess, signal);
        if (!result) {
            console.error(`Attempt to send ${label ?? signal ?? "default"} to Vitest returned false.`);
        }
        return result;
    };

    const taskKillWindows = (stage) => {
        if (!isWindows) {
            return;
        }
        const args = ["/pid", String(runnerProcess.pid), "/t", "/f"];
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
        console.error(`Attempting to terminate Vitest (${stage}).`);
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
        console.error(`Attempting hard kill of Vitest (${stage}).`);
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
            console.error(`Vitest did not finish within ${Math.round(runTimeoutMs / 1000)} seconds. Sending SIGTERM...`);
            attemptTerminate("timeout");
            sigtermHandle = setTimeout(() => {
                if (exitHandled) {
                    return;
                }
                console.error("Vitest still running after SIGTERM. Sending SIGKILL...");
                attemptHardKill("timeout escalation");
                sigkillHandle = setTimeout(() => {
                    if (!exitHandled) {
                        console.error("Vitest did not exit after SIGKILL. Forcing wrapper process to finish.");
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
            console.error(`Vitest run terminated after exceeding ${runTimeoutMs}ms (observed via ${source} event).`);
            finalize(124);
            return;
        }

        if (signal) {
            console.error(`Vitest exited due to signal ${signal} (${source} event).`);
            finalize(1);
            return;
        }

        finalize(typeof code === "number" ? code : 1);
    };

    runnerProcess.once("error", (error) => {
        console.error("Failed to start Vitest:", error);
        finalize(1);
    });
    runnerProcess.once("exit", (code, signal) => {
        process.off("exit", handleProcessExit);
        settle(code, signal, "exit");
    });
    runnerProcess.once("close", (code, signal) => settle(code, signal, "close"));
};

const runBrowserTests = () => {
    const vitestBin = path.join(projectRoot, "node_modules", ".bin", "vitest");

    env.VITEST_MODE = "browser";

    let vitestArgs = ["run", "--config", vitestConfigPath];

    if (environment.toLowerCase().includes("chrome")) {
        env.VITEST_BROWSER = "chromium";
        console.log("Using Playwright's Chromium browser (default)");
    } else if (environment.toLowerCase().includes("firefox")) {
        env.VITEST_BROWSER = "firefox";
        console.log("Using Playwright's Firefox browser");
    }

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
        shell: true,
        detached: true
    });

    const terminateBrowserRunner = () => {
        terminateProcessTree(vitestProcess, "browser runner exit");
    };

    ["SIGINT", "SIGTERM"].forEach((signal) => {
        process.on(signal, () => {
            if (!vitestProcess.killed) {
                sendSignalToProcessTree(vitestProcess, signal);
            }
        });
    });
    process.on("exit", terminateBrowserRunner);

    vitestProcess.on("exit", (code) => {
        process.off("exit", terminateBrowserRunner);
        process.exit(code);
    });
};

if (isNodeEnvironment) {
    runNodeTests();
} else {
    runBrowserTests();
}
