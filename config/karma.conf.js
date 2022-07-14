// you can add "CHROME_BIN=/usr/bin/chromium" to .env file
// to not have to type it every time
require("dotenv").config();

const mochaConfig = require("./.mocharc.js");

// possible to add flags when launching the browser
const CustomChrome = {
    base: "ChromeHeadless",
    flags: ["--disable-web-security"],
    debug: true
};

// choose which browser you prefer
let browsers = ["FirefoxHeadless", "CustomChrome"];

// add firefox during CI
// make sure non-headless DebugChrome is not included as it breaks the CI
if (process.env.CI) {
    browsers = ["CustomChrome", "FirefoxHeadless"];
}

// inject browser code before each test file
let codeToInjectBefore = "";

// inject debug env variable to be able to do `DEBUG=plebbit:* npm run test`
if (process.env.DEBUG) {
    codeToInjectBefore += `
        localStorage.debug = "${process.env.DEBUG.replaceAll(`"`, "")}";
    `;
}

module.exports = function (config) {
    config.set({
        // chai adds "expect" matchers
        // sinon adds mocking utils
        // NOTE: 'parallel' must be the first framework in the list
        frameworks: ["parallel", "mocha", "chai", "sinon"],
        client: {
            mocha: mochaConfig
        },
        plugins: [
            require("karma-chrome-launcher"),
            require("karma-firefox-launcher"),
            require("karma-mocha"),
            require("karma-chai"),
            require("karma-sinon"),
            require("karma-spec-reporter"),
            require("karma-parallel"),
            injectCodeBeforePlugin
        ],

        basePath: "../",
        files: [
            // the tests are first compiled from typescript to dist/node/test
            // then they are compiled to browser with webpack to dist/browser/test
            // you must run `npm run tsc:watch` and `npm run webpack:watch` to use the karma tests
            "test-karma-webpack/**/*.test.js"
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
        browserNoActivityTimeout: 210000,
        browserDisconnectTimeout: mochaConfig.timeout,
        browserDisconnectTolerance: 10
    });
};

function injectCodeBeforeFactory() {
    return (content, file, done) => done(codeToInjectBefore + content);
}

const injectCodeBeforePlugin = {
    "preprocessor:inject-code-before": ["factory", injectCodeBeforeFactory]
};
