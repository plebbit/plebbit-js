import { getAvailablePlebbitConfigsToTestAgainst, setPlebbitConfigs } from "../../../test-util.js";
import { resolveHangingScenarioModule } from "../scenarios/hanging-test-util.js";
import type { HangingScenarioDefinition } from "../scenarios/hanging-test-util.js";

declare const self: any;

self.addEventListener("message", async (event: any) => {
    const data = event?.data ?? {};
    const configCode: unknown = data.configCode;
    const scenarioModuleBaseName: unknown = data.scenarioModuleBaseName;

    try {
        if (typeof configCode !== "string" || !configCode) {
            throw new Error("hanging.worker: configCode is required");
        }
        if (typeof scenarioModuleBaseName !== "string" || !scenarioModuleBaseName) {
            throw new Error("hanging.worker: scenarioModuleBaseName is required");
        }

        setPlebbitConfigs([configCode as never]);
        const configs = getAvailablePlebbitConfigsToTestAgainst();
        if (!configs.length) {
            throw new Error("hanging.worker: no plebbit configs available");
        }

        const scenarioModuleUrl = new URL(`../scenarios/${scenarioModuleBaseName}`, import.meta.url);
        const scenarioModule = await import(scenarioModuleUrl.href);
        const scenarioDefinition: HangingScenarioDefinition = resolveHangingScenarioModule(
            scenarioModule,
            scenarioModuleBaseName
        );
        await scenarioDefinition.run({ configCode });

        self.postMessage({ type: "done" });
    } catch (error: any) {
        self.postMessage({
            type: "error",
            message: error?.message ?? String(error),
            stack: error?.stack
        });
    }
});

export {};
