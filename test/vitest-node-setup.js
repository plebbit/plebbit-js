// Provide Mocha-style globals that existing tests expect when running under Vitest.
if (typeof globalThis.beforeAll === "function" && typeof globalThis.before !== "function") {
    globalThis.before = globalThis.beforeAll;
}
if (typeof globalThis.afterAll === "function" && typeof globalThis.after !== "function") {
    globalThis.after = globalThis.afterAll;
}
