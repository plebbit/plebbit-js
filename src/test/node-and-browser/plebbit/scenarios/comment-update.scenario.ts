import { createScenarioContext, defineHangingScenario } from "./hanging-test-util.js";

/**
 * Template scenario showing the shape expected by the hanging test harness.
 * Replace the placeholder steps with the flow you want to exercise before
 * checking for lingering resources. Make sure any asynchronous work is awaited
 * so the destroy call can flush everything properly.
 */
export default defineHangingScenario({
    id: "comment-update",
    description: "Template: create a comment, update it, and validate cleanup",
    run: async ({ configCode }) => {
        const { plebbit, config } = await createScenarioContext(configCode);

        try {
            // The config is provided in case you need to branch on the backend under test.
            // Remove this line once you start using the value to keep lint/TS happy.
            void config;

            // Example ingredients you can mix and match:
            // const signer = await plebbit.createSigner();
            // const comment = await plebbit.createComment({ /* ... */ });
            // await comment.update({ /* ... */ });
            // await plebbit.loadComment(comment.cid);

            // TODO: implement your scenario here.
        } finally {
            await plebbit.destroy();
        }
    }
});
