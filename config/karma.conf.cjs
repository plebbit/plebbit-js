// you can add "CHROME_BIN=/usr/bin/chromium" to .env file
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
    flags: ["--disable-web-security", "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    debug: true
};

const CustomFirefox = {
    base: "FirefoxHeadless",
    flags: ["-no-remote"],
    prefs: {
        // Disable various security features
        "security.tls.insecure_fallback_hosts": "localhost,127.0.0.1",
        "security.fileuri.strict_origin_policy": false,
        "security.mixed_content.block_active_content": false,
        "security.mixed_content.block_display_content": false,

        // Network and WebRTC settings
        "media.peerconnection.enabled": true,
        "media.peerconnection.ice.default_address_only": false,
        "media.peerconnection.ice.no_host": false,
        "media.navigator.enabled": true,

        // CORS and origin policies
        "security.fileuri.origin_policy": 3,
        "privacy.file_unique_origin": false,

        // WebSocket and networking
        "network.websocket.allowInsecureFromHTTPS": true,
        "network.websocket.timeout.ping.request": 120,
        "network.websocket.timeout.ping.response": 120,
        "network.http.connection-timeout": 120,
        "network.http.response.timeout": 120,

        // DNS and connectivity
        "network.dns.disableIPv6": true,
        "network.proxy.type": 0,

        // Disable some Firefox-specific networking features that might interfere
        "network.http.speculative-parallel-limit": 0,
        "network.http.spdy.enabled": false,
        "network.http.http2.enabled": false,

        // Disable content blocking
        "browser.contentblocking.enabled": false,
        "privacy.trackingprotection.enabled": false,
        "privacy.trackingprotection.pbmode.enabled": false,

        // Allow local file access
        "capability.policy.policynames": "localfilelinks",
        "capability.policy.localfilelinks.sites": "http://localhost:9876",
        "capability.policy.localfilelinks.checkloaduri.enabled": "allAccess",

        // Additional preferences for P2P networking
        "dom.webnotifications.enabled": false,
        "dom.push.enabled": false,
        "media.peerconnection.ice.tcp": true,
        "media.peerconnection.ice.relay_only": false,
        "dom.serviceWorkers.enabled": true,
        "dom.serviceWorkers.testing.enabled": true,

        // Disable security restrictions that might block P2P
        "security.csp.enable": false,
        "security.sandbox.content.level": 0,

        // Network optimizations for P2P
        "network.http.max-connections": 100,
        "network.http.max-connections-per-server": 20,

        // Additional preferences for P2P networking
        "dom.webnotifications.enabled": false,
        "dom.push.enabled": false,
        "media.peerconnection.ice.tcp": true,
        "media.peerconnection.ice.relay_only": false,
        "dom.serviceWorkers.enabled": true,
        "dom.serviceWorkers.testing.enabled": true,

        // Disable security restrictions that might block P2P
        "security.csp.enable": false,
        "security.sandbox.content.level": 0,

        // Network optimizations for P2P
        "network.http.max-connections": 100,
        "network.http.max-connections-per-server": 20
    }
};

// choose which browser you prefer
const [browsers, browserPlugins] = [[], []];
if (process.env["CHROME_BIN"]) browsers.push("CustomChrome") && browserPlugins.push(require("karma-chrome-launcher"));
if (process.env["FIREFOX_BIN"]) {
    browsers.push("CustomFirefox");
    browserPlugins.push(require("karma-firefox-launcher"));
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
        customLaunchers: {
            CustomChrome,
            CustomFirefox
        },

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
