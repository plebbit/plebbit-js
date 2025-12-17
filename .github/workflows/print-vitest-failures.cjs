const fs = require("fs");
const path = require("path");

const reportPath = path.join(process.cwd(), ".vitest-reports", "browser-tests.json");

if (!fs.existsSync(reportPath)) {
    console.log(`Vitest report not found at ${reportPath}`);
    process.exit(0);
}

let report;
try {
    report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
} catch (error) {
    console.error(`Could not parse ${reportPath}:`, error);
    process.exit(0);
}

const failedTests = [];

for (const suite of report.testResults || []) {
    for (const assertion of suite.assertionResults || []) {
        if (assertion.status === "failed") {
            const message = (assertion.failureMessages || []).join("\n").trim() || "No failure message provided";
            failedTests.push({
                suite: suite.name,
                test: assertion.fullName || assertion.title,
                message
            });
        }
    }
}

if (failedTests.length === 0) {
    console.log("No failed tests found in vitest report.");
    process.exit(0);
}

console.log("Failed tests:");
for (const { suite, test, message } of failedTests) {
    console.log(`- ${suite}: ${test}`);
    for (const line of message.split("\n")) {
        console.log(`  ${line}`);
    }
}
