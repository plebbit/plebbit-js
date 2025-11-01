import { createScenarioContext, defineHangingScenario } from "./hanging-test-util.js";

/**
 * Baseline scenario that simply exercises the Plebbit lifecycle.
 * The scenario itself is responsible for destroying the instance so the test
 * harness can measure whether anything keeps the process or worker alive.
 */
export default defineHangingScenario({
    id: "destroy-only",
    description: "Baseline: instantiate a Plebbit client and destroy it",
    run: async ({ configCode }) => {
        const { plebbit } = await createScenarioContext(configCode);

        try {
            // Intentionally left blank; add steps here if you need extra setup.
        } finally {
            await plebbit.destroy();
        }
    }
});
