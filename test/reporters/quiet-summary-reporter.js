import { relative } from "node:path";
import pc from "picocolors";

const toRelativePath = (filepath) => (filepath ? relative(process.cwd(), filepath) : "(unknown file)");

const formatLabel = (testCase) => {
    const filepath = testCase.module?.filepath || testCase.project?.filepath || testCase.location?.file;
    return `${toRelativePath(filepath)} > ${testCase.name}`;
};

const formatError = (error) => {
    if (!error) {
        return "Unknown error";
    }
    if (typeof error === "string") {
        return error;
    }
    if (error.stack) {
        return error.stack;
    }
    if (error.message) {
        return error.message;
    }
    try {
        return JSON.stringify(error);
    } catch {
        return String(error);
    }
};

const getResult = (entity) => {
    if (!entity) {
        return undefined;
    }
    if (typeof entity.result === "function") {
        return entity.result();
    }
    return entity.result;
};

export default function quietSummaryReporter() {
    const stats = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        todo: 0
    };
    const failedTests = [];

    return {
        onTestCaseResult(testCase) {
            stats.total += 1;
            const result = getResult(testCase);
            const state = result?.state;
            switch (state) {
                case "pass":
                    stats.passed += 1;
                    break;
                case "fail":
                    stats.failed += 1;
                    failedTests.push({
                        label: formatLabel(testCase),
                        errors: result?.errors ?? []
                    });
                    break;
                case "skip":
                    stats.skipped += 1;
                    break;
                case "todo":
                    stats.todo += 1;
                    break;
                default:
                    break;
            }
        },
        async onTestRunEnd(_testModules, unhandledErrors, reason) {
            const summaryParts = [
                pc.bold("Vitest run finished"),
                `${stats.total} total`,
                pc.green(`${stats.passed} passed`),
                stats.failed > 0 ? pc.red(`${stats.failed} failed`) : `${stats.failed} failed`,
                stats.skipped > 0 ? `${stats.skipped} skipped` : undefined,
                stats.todo > 0 ? `${stats.todo} todo` : undefined,
                reason && reason !== "passed" ? `status: ${reason}` : undefined
            ].filter(Boolean);

            console.log("");
            console.log(summaryParts.join(" | "));

            if (stats.total === 0) {
                console.log(pc.yellow("No tests were executed."));
            }

            if (failedTests.length > 0) {
                console.log(pc.red("\nFailed tests:"));
                failedTests.forEach((test, index) => {
                    console.log(`${index + 1}) ${test.label}`);
                    test.errors.forEach((error) => {
                        console.log(pc.dim(formatError(error)));
                    });
                    if (test.errors.length === 0) {
                        console.log(pc.dim("No error details provided."));
                    }
                    if (index < failedTests.length - 1) {
                        console.log("");
                    }
                });
            }

            if (unhandledErrors.length > 0) {
                console.log(pc.red("\nUnhandled errors:"));
                unhandledErrors.forEach((error, index) => {
                    console.log(`${index + 1}) ${formatError(error)}`);
                    if (index < unhandledErrors.length - 1) {
                        console.log("");
                    }
                });
            }

            if (failedTests.length === 0 && unhandledErrors.length === 0 && stats.total > 0 && reason !== "failed") {
                console.log(pc.green("All tests passed."));
            } else if (failedTests.length === 0 && unhandledErrors.length === 0 && stats.total === 0 && reason === "passed") {
                console.log(pc.green("All tests passed (nothing to run)."));
            } else if (failedTests.length === 0 && unhandledErrors.length === 0 && reason === "failed") {
                console.log(pc.red("Vitest reported a failure without individual test errors. See previous logs."));
            }
        }
    };
}
