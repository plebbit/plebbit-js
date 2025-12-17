import { existsSync, promises as fsPromises } from "node:fs";
import { dirname, resolve } from "node:path";
import { getSuites, getTests } from "@vitest/runner/utils";

// Mirrors Vitest's built-in JSON reporter status mapping
const StatusMap = {
    pass: "passed",
    fail: "failed",
    skip: "skipped",
    todo: "todo",
    queued: "pending",
    run: "pending"
};

const getOutputFile = (config, reporter) => {
    const outputFile = config?.outputFile;
    if (!outputFile) {
        return undefined;
    }
    if (typeof outputFile === "string") {
        return outputFile;
    }
    return outputFile[reporter];
};

export default class JsonWithStderrReporter {
    constructor(options = {}) {
        this.options = options;
        this.start = 0;
        this.logsByTask = new Map();
        this.coverageMap = undefined;
        this.ctx = undefined;
    }

    onInit(ctx) {
        this.ctx = ctx;
        this.start = Date.now();
        this.coverageMap = undefined;
        this.logsByTask.clear();
    }

    onCoverage(coverageMap) {
        this.coverageMap = coverageMap;
    }

    onUserConsoleLog(log) {
        if (!log.taskId) {
            return;
        }
        const key = String(log.taskId);
        const entry = this.logsByTask.get(key) ?? { stderr: [], stdout: [] };
        if (log.type === "stderr") {
            entry.stderr.push(log);
        } else if (log.type === "stdout") {
            entry.stdout.push(log);
        }
        this.logsByTask.set(key, entry);
    }

    async onTestRunEnd(testModules) {
        const files = testModules.map((testModule) => testModule.task);
        const suites = getSuites(files);
        const numTotalTestSuites = suites.length;
        const tests = getTests(files);
        const numTotalTests = tests.length;
        const numFailedTestSuites = suites.filter((s) => s.result?.state === "fail").length;
        const numPendingTestSuites = suites.filter(
            (s) => s.result?.state === "run" || s.result?.state === "queued" || s.mode === "todo"
        ).length;
        const numPassedTestSuites = numTotalTestSuites - numFailedTestSuites - numPendingTestSuites;
        const numFailedTests = tests.filter((t) => t.result?.state === "fail").length;
        const numPassedTests = tests.filter((t) => t.result?.state === "pass").length;
        const numPendingTests = tests.filter(
            (t) => t.result?.state === "run" || t.result?.state === "queued" || t.mode === "skip" || t.result?.state === "skip"
        ).length;
        const numTodoTests = tests.filter((t) => t.mode === "todo").length;
        const testResults = [];
        const success = !!(files.length > 0 || this.ctx.config.passWithNoTests) && numFailedTestSuites === 0 && numFailedTests === 0;

        for (const file of files) {
            const fileTests = getTests([file]);
            let startTime = fileTests.reduce(
                (prev, next) => Math.min(prev, next.result?.startTime ?? Number.POSITIVE_INFINITY),
                Number.POSITIVE_INFINITY
            );
            if (startTime === Number.POSITIVE_INFINITY) {
                startTime = this.start;
            }
            const endTime = fileTests.reduce(
                (prev, next) => Math.max(prev, (next.result?.startTime ?? 0) + (next.result?.duration ?? 0)),
                startTime
            );
            const assertionResults = fileTests.map((t) => {
                const ancestorTitles = [];
                let iter = t.suite;
                while (iter) {
                    ancestorTitles.push(iter.name);
                    iter = iter.suite;
                }
                ancestorTitles.reverse();
                const taskLogs = this.logsByTask.get(String(t.id)) ?? { stderr: [], stdout: [] };
                const stderrLogs = taskLogs.stderr;
                const stdoutLogs = taskLogs.stdout;
                const includeStderr = (t.result?.state === "fail" || stderrLogs.length > 0) && stderrLogs.length > 0;
                const base = {
                    ancestorTitles,
                    fullName: t.name ? [...ancestorTitles, t.name].join(" ") : ancestorTitles.join(" "),
                    status: StatusMap[t.result?.state || t.mode] || "skipped",
                    title: t.name,
                    duration: t.result?.duration,
                    failureMessages: t.result?.errors?.map((e) => e.stack || e.message) || [],
                    location: t.location,
                    meta: t.meta
                };
                if (includeStderr) {
                    base.stderr = stderrLogs.map((log) => ({
                        message: log.content,
                        time: log.time,
                        origin: log.origin,
                        browser: log.browser
                    }));
                }
                if (stdoutLogs.length > 0) {
                    base.stdout = stdoutLogs.map((log) => ({
                        message: log.content,
                        time: log.time,
                        origin: log.origin,
                        browser: log.browser
                    }));
                }
                return base;
            });
            if (fileTests.some((t) => t.result?.state === "run" || t.result?.state === "queued")) {
                this.ctx.logger.warn(
                    "WARNING: Some tests are still running when generating the JSON report.This is likely an internal bug in Vitest.Please report it to https://github.com/vitest-dev/vitest/issues"
                );
            }
            const hasFailedTests = fileTests.some((t) => t.result?.state === "fail");
            testResults.push({
                assertionResults,
                startTime,
                endTime,
                status: file.result?.state === "fail" || hasFailedTests ? "failed" : "passed",
                message: file.result?.errors?.[0]?.message ?? "",
                name: file.filepath
            });
        }
        const result = {
            numTotalTestSuites,
            numPassedTestSuites,
            numFailedTestSuites,
            numPendingTestSuites,
            numTotalTests,
            numPassedTests,
            numFailedTests,
            numPendingTests,
            numTodoTests,
            snapshot: this.ctx.snapshot.summary,
            startTime: this.start,
            success,
            testResults,
            coverageMap: this.coverageMap
        };
        await this.writeReport(JSON.stringify(result));
    }

    async writeReport(report) {
        const outputFile = this.options.outputFile ?? getOutputFile(this.ctx.config, "json");
        if (outputFile) {
            const reportFile = resolve(this.ctx.config.root, outputFile);
            const outputDirectory = dirname(reportFile);
            if (!existsSync(outputDirectory)) {
                await fsPromises.mkdir(outputDirectory, { recursive: true });
            }
            await fsPromises.writeFile(reportFile, report, "utf-8");
            this.ctx.logger.log(`JSON report written to ${reportFile}`);
        } else {
            this.ctx.logger.log(report);
        }
    }
}
