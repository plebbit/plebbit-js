import { getAvailablePlebbitConfigsToTestAgainst } from "../../../dist/node/test/test-util.js";

const DESTROY_TIMEOUT_MS = 10_000;
const isNodeEnvironment = typeof process !== "undefined" && !!process.versions?.node;
const configs = getAvailablePlebbitConfigsToTestAgainst();

if (isNodeEnvironment) {
    let runDestroyInChildProcess;

    before(async () => {
        ({ runDestroyInChildProcess } = await import(
            /* @vite-ignore */ "../../../dist/node/runtime/node/test/helpers/run-destroy-node.js"
        ));
    });

    configs.map((config) => {
        describe(`plebbit.destroy() - ${config.name}`, () => {
            it("does not keep the Node process alive", async function () {
                this.timeout(DESTROY_TIMEOUT_MS + 2_000);
                await runDestroyInChildProcess({
                    configCode: config.testConfigCode,
                    timeoutMs: DESTROY_TIMEOUT_MS
                });
            });
        });
    });
} else {
    configs.map((config) => {
        describe(`plebbit.destroy() - ${config.name}`, () => {
            it("does not keep the browser worker alive", async function () {
                this.timeout(DESTROY_TIMEOUT_MS + 2_000);
                await runDestroyInWorker({
                    configCode: config.testConfigCode,
                    timeoutMs: DESTROY_TIMEOUT_MS
                });
            });
        });
    });
}

async function runDestroyInWorker({ configCode, timeoutMs }) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(
            new URL("../../../dist/node/test/node-and-browser/plebbit/helpers/destroy.worker.js", import.meta.url),
            {
                type: "module"
            }
        );

        let settled = false;

        const timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            worker.terminate();
            reject(new Error(`destroy.worker timed out after ${timeoutMs}ms for config "${configCode}"`));
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
                const error = new Error(message || `destroy.worker error for config "${configCode}"`);
                if (stack) error.stack = stack;
                reject(error);
            }
        });

        worker.addEventListener("error", (event) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            worker.terminate();
            reject(new Error(event.message || `destroy.worker error for config "${configCode}"`));
        });

        worker.postMessage({ configCode });
    });
}
