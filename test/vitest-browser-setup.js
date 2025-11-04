// Setup file for Vitest browser tests
// Add Mocha-style aliases that some tests use
globalThis.before = globalThis.beforeAll;
globalThis.after = globalThis.afterAll;

const debugNamespaces = typeof process !== "undefined" ? process?.env?.DEBUG : undefined;
if (typeof window !== "undefined" && window.localStorage && debugNamespaces) {
    try {
        const previousDebug = window.localStorage.getItem("debug");
        window.localStorage.setItem("debug", previousDebug ? `${previousDebug},${debugNamespaces}` : debugNamespaces);
    } catch (error) {
        console.warn("Failed to set debug namespaces for browser tests", error);
    }
}

console.log("Vitest browser setup - PLEBBIT_CONFIGS:", globalThis.PLEBBIT_CONFIGS);
