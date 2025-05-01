// you can add "CHROME_BIN=/usr/bin/chromium" to .env file
// to not have to type it every time
// require("dotenv").config();

const os = require("os");

const mochaConfig = require("./.mocharc.json");
delete mochaConfig["node-option"];
delete mochaConfig["colors"];
delete mochaConfig["trace-warnings"];
delete mochaConfig["full-trace"];
delete mochaConfig["allow-uncaught"];
delete mochaConfig["stack-trace-limit"];

mochaConfig.bail = true; // Add bail to browser tests
// possible to add flags when launching the browser
const CustomChrome = {
    base: "ChromeHeadless",
    flags: ["--disable-web-security"],
    debug: true
};

// choose which browser you prefer
const [browsers, browserPlugins] = [[], []];
if (process.env["CHROME_BIN"]) browsers.push("CustomChrome") && browserPlugins.push(require("karma-chrome-launcher"));
if (process.env["FIREFOX_BIN"]) {
    browsers.push("FirefoxHeadless");
    browserPlugins.push(require("karma-firefox-launcher"));
    mochaConfig["retries"] = 2;
}

if (browsers.length === 0) throw Error("No chrome or firefox path set when calling karma.conf.js");

// inject browser code before each test file
let codeToInjectBefore = "";

// inject debug env variable to be able to do `DEBUG=plebbit:* npm run test`
if (process.env.DEBUG) {
    codeToInjectBefore += `
        localStorage.debug = "${process.env.DEBUG.replaceAll(`"`, "")}";
    `;
}

// inject plebbit configs if provided
if (process.env.PLEBBIT_CONFIGS) {
    codeToInjectBefore += `
        window.PLEBBIT_CONFIGS = "${process.env.PLEBBIT_CONFIGS.replaceAll(`"`, "")}";
    `;
}

function injectCodeBeforeFactory() {
    return (content, file, done) => done(codeToInjectBefore + content);
}

const injectCodeBeforePlugin = {
    "preprocessor:inject-code-before": ["factory", injectCodeBeforeFactory]
};

let frameworks = ["mocha", "chai", "sinon"];

const plugins = [...browserPlugins, require("karma-mocha"), require("karma-chai"), require("karma-sinon"), require("karma-spec-reporter")];

if (!process.env["CI"]) {
    frameworks = ["parallel", ...frameworks];
    plugins.push(require("karma-parallel"));
}

plugins.push(injectCodeBeforePlugin);

module.exports = function (config) {
    config.set({
        // chai adds "expect" matchers
        // sinon adds mocking utils
        // NOTE: 'parallel' must be the first framework in the list
        frameworks: frameworks,
        client: {
            mocha: mochaConfig
        },
        plugins: plugins,

        parallelOptions: {
            executors: Math.ceil(os.cpus().length / 2.0)
        },

        basePath: "../",
        files: [
            // the tests are first compiled from typescript to dist/node/test
            // then they are compiled to browser with webpack to dist/browser/test
            // you must run `npm run tsc:watch` and `npm run webpack:watch` to use the karma tests
            "test-karma-webpack/test/browser/root-hook-karma.util.js", // To load root hook in karma,
            "test-karma-webpack/test/*browser/**/*.test.js"
        ],
        exclude: [],

        preprocessors: {
            // inject code to run before each test
            "**/*.js": ["inject-code-before"]
        },

        // chrome with disabled security
        customLaunchers: { CustomChrome },

        // list of browsers to run the tests in
        browsers,

        // don't watch, run once and exit
        singleRun: true,
        autoWatch: false,

        // how the test logs are displayed
        reporters: ["spec"],

        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,

        // fix various timeout errors
        browserNoActivityTimeout: mochaConfig.timeout,
        captureTimeout: mochaConfig.timeout,
        browserDisconnectTimeout: mochaConfig.timeout
    });
};
