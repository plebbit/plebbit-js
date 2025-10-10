import { inspect } from "node:util";

// Expand debug logging to print deeply nested objects while running tests.
if (!process.env.DEBUG_DEPTH) {
    process.env.DEBUG_DEPTH = "null";
}

inspect.defaultOptions.depth = null;
inspect.defaultOptions.colors = false;

export const mochaHooks = {
    afterAll: () => {}
};
