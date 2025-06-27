// Setup file for Vitest browser tests
// Add Mocha-style aliases that some tests use
globalThis.before = globalThis.beforeAll;
globalThis.after = globalThis.afterAll;

console.log("Vitest browser setup - PLEBBIT_CONFIGS:", globalThis.PLEBBIT_CONFIGS);
