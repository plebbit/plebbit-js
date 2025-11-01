import { getAvailablePlebbitConfigsToTestAgainst } from "../../../dist/node/test/test-util.js";
import { resolveHangingScenarioModule } from "../../../dist/node/test/node-and-browser/plebbit/scenarios/hanging-test-util.js";

const DESTROY_TIMEOUT_MS = 10_000;
const SCENARIO_MANIFEST_FILENAME = "scenario-manifest.json";
const SCENARIO_DIST_DIR_URL = new URL("../../../dist/node/test/node-and-browser/plebbit/scenarios/", import.meta.url);
const SCENARIO_MANIFEST_URL = new URL(SCENARIO_MANIFEST_FILENAME, SCENARIO_DIST_DIR_URL);
const isNodeEnvironment = typeof process !== "undefined" && !!process.versions?.node;
const configs = getAvailablePlebbitConfigsToTestAgainst();
const scenarioDefinitions = await loadScenarioDefinitions();

if (!scenarioDefinitions.length) {
    throw new Error("No hanging-test scenarios found. Add *.scenario.ts files under src/test/node-and-browser/plebbit/scenarios.");
}

// This test can not be run with debugger or else it would fail
if (isNodeEnvironment) {
    let runHangingScenarioInChildProcess;

    before(async () => {
        ({ runHangingScenarioInChildProcess } = await import(
            /* @vite-ignore */ "../../../dist/node/runtime/node/test/helpers/run-hanging-node.js"
        ));
    });

    for (const scenario of scenarioDefinitions) {
        describe(`[Scenario: ${scenario.description}]`, () => {
            for (const config of configs) {
                describe(`[Config: ${config.name}]`, () => {
                    it("does not keep the Node process alive", async function () {
                        this.timeout(DESTROY_TIMEOUT_MS + 2_000);
                        await runHangingScenarioInChildProcess({
                            configCode: config.testConfigCode,
                            timeoutMs: DESTROY_TIMEOUT_MS,
                            scenarioModuleBaseName: scenario.moduleBaseName
                        });
                    });
                });
            }
        });
    }
} else {
    for (const scenario of scenarioDefinitions) {
        describe(`[Scenario: ${scenario.description}]`, () => {
            for (const config of configs) {
                describe(`[Config: ${config.name}]`, () => {
                    it("does not keep the browser worker alive", async function () {
                        this.timeout(DESTROY_TIMEOUT_MS + 2_000);
                        await runHangingScenarioInWorker({
                            configCode: config.testConfigCode,
                            timeoutMs: DESTROY_TIMEOUT_MS,
                            scenarioModuleBaseName: scenario.moduleBaseName
                        });
                    });
                });
            }
        });
    }
}

async function runHangingScenarioInWorker({ configCode, timeoutMs, scenarioModuleBaseName }) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(
            new URL("../../../dist/node/test/node-and-browser/plebbit/helpers/hanging.worker.js", import.meta.url),
            {
                type: "module"
            }
        );

        let settled = false;

        const timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            worker.terminate();
            reject(
                new Error(
                    `hanging.worker timed out after ${timeoutMs}ms for config "${configCode}" (scenario "${scenarioModuleBaseName}")`
                )
            );
        }, timeoutMs);

        worker.addEventListener("message", (event) => {
            if (settled) return;
            const { type, message, stack } = event.data || {};
            if (type === "done") {
                settled = true;
                clearTimeout(timeoutId);
                worker.terminate();
                resolve();
            } else if (type === "error") {
                settled = true;
                clearTimeout(timeoutId);
                worker.terminate();
                const error = new Error(
                    message || `hanging.worker error for config "${configCode}" (scenario "${scenarioModuleBaseName}")`
                );
                if (stack) error.stack = stack;
                reject(error);
            }
        });

        worker.addEventListener("error", (event) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            worker.terminate();
            reject(
                new Error(
                    event.message || `hanging.worker error for config "${configCode}" (scenario "${scenarioModuleBaseName}")`
                )
            );
        });

        worker.postMessage({ configCode, scenarioModuleBaseName });
    });
}

async function loadScenarioDefinitions() {
    if (isNodeEnvironment) {
        const { readdir } = await import("node:fs/promises");
        const { fileURLToPath } = await import("node:url");

        const scenarioDistDirPath = fileURLToPath(SCENARIO_DIST_DIR_URL);
        const manifestPath = fileURLToPath(SCENARIO_MANIFEST_URL);
        const entries = await readdir(scenarioDistDirPath, { withFileTypes: true });
        const scenarioFiles = entries
            .filter((entry) => entry.isFile() && entry.name.endsWith(".scenario.js"))
            .map((entry) => entry.name)
            .sort();

        if (!scenarioFiles.length) {
            throw new Error(
                `No compiled hanging-test scenarios found in ${scenarioDistDirPath}. Did you run "npm run build:node"?`
            );
        }

        const scenarios = [];
        for (const fileName of scenarioFiles) {
            const moduleBaseName = fileName;
            const scenarioModuleUrl = new URL(moduleBaseName, SCENARIO_DIST_DIR_URL);
            const scenarioModule = await import(scenarioModuleUrl.href);
            const definition = resolveHangingScenarioModule(scenarioModule, moduleBaseName);
            scenarios.push({
                id: definition.id,
                description: definition.description,
                moduleBaseName
            });
        }

        ensureUniqueScenarioIds(scenarios);
        await writeScenarioManifest({
            manifestPath,
            distDirPath: scenarioDistDirPath,
            scenarios
        });
        return scenarios;
    }

    const response = await fetch(SCENARIO_MANIFEST_URL.href);
    if (!response.ok) {
        throw new Error(
            `Failed to load hanging-scenario manifest (${response.status} ${response.statusText}) from ${SCENARIO_MANIFEST_URL.href}`
        );
    }
    const scenarios = await response.json();
    ensureUniqueScenarioIds(scenarios);
    return scenarios;
}

function ensureUniqueScenarioIds(scenarios) {
    const seen = new Set();
    for (const scenario of scenarios) {
        if (typeof scenario.id !== "string" || !scenario.id.trim()) {
            throw new Error("Each scenario must provide a non-empty string id");
        }
        if (seen.has(scenario.id)) {
            throw new Error(`Duplicate hanging-test scenario id detected: "${scenario.id}"`);
        }
        seen.add(scenario.id);
    }
}

async function writeScenarioManifest({ manifestPath, distDirPath, scenarios }) {
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(distDirPath, { recursive: true });
    const manifestPayload = scenarios.map(({ id, description, moduleBaseName }) => ({
        id,
        description,
        moduleBaseName
    }));
    await writeFile(manifestPath, JSON.stringify(manifestPayload, null, 2), "utf-8");
}
