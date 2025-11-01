import { getAvailablePlebbitConfigsToTestAgainst, setPlebbitConfigs } from "../../../test-util.js";

declare const self: any;

self.addEventListener("message", async (event: any) => {
    const data = event?.data ?? {};
    const configCode: unknown = data.configCode;

    try {
        if (typeof configCode !== "string" || !configCode) {
            throw new Error("destroy.worker: configCode is required");
        }

        setPlebbitConfigs([configCode as never]);
        const configs = getAvailablePlebbitConfigsToTestAgainst();
        if (!configs.length) {
            throw new Error("destroy.worker: no plebbit configs available");
        }

        const { plebbitInstancePromise } = configs[0];
        const plebbit = await plebbitInstancePromise();
        await plebbit.destroy();

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
