// this file runs the tests in test/electron*

const fs = require("fs-extra");
const path = require("path");

// same as .mocharc.js
const mochaConfig = {
    // set large value for manual debugging
    timeout: 600000
};
if (process.env.CI) {
    // set small value for timing out CI
    mochaConfig.timeout = 120000;
}

// electron browser options
let headless = false;

// use headless for manual debugging
if (process.env.HEADLESS) {
    headless = true;
}

// CI options
if (process.env.CI) {
    // non headless breaks CI
    headless = true;
}

// inject browser code before each test file
let codeToInjectBefore = "";

// inject debug env variable to be able to do `DEBUG=plebbit:* npm run test`
if (process.env.DEBUG) {
    codeToInjectBefore += `
      localStorage.debug = "${process.env.DEBUG.replaceAll(`"`, "")}";
    `;
}

// electron preload.js file
const preloadJs = `
// expose plebbit-js native functions into electron's renderer
const {contextBridge} = require('electron')
const path = require ('path')
contextBridge.exposeInMainWorld('plebbitJsNativeFunctions', require(path.join(process.cwd(), 'dist/node/runtime/node/native-functions')).default)
contextBridge.exposeInMainWorld('plebbitDataPath', path.join(process.cwd(), '.plebbit'))
console.log('electron preload.js contextBridge.exposeInMainWorld plebbitJsNativeFunctions')
`;
const preloadJsPath = path.resolve(__dirname, "..", "karma-electron-preload.js");
fs.writeFileSync(preloadJsPath, preloadJs);

module.exports = function (config) {
    config.set({
        // chai adds "expect" matchers
        // sinon adds mocking utils
        frameworks: ["mocha", "chai", "sinon"],
        client: {
            mocha: mochaConfig,

            // in electron iframes don't get `nodeIntegration` but windows do
            useIframe: false,
            runInParent: true
        },
        plugins: [
            require("karma-electron"),
            require("karma-mocha"),
            require("karma-chai"),
            require("karma-sinon"),
            require("karma-spec-reporter"),
            injectCodeBeforePlugin
        ],

        basePath: "../",
        files: [
            // the tests are first compiled from typescript to dist/node/test
            // then they are compiled to browser with webpack to dist/browser/test
            // you must run `npm run tsc:watch` and `npm run webpack:watch` to use the karma tests
            // "test-karma-webpack/test/browser/root-hook-karma.util.js", // To load root hook in karma
            "test-karma-webpack/test/server/test-server.electron.js"
        ],
        exclude: [],

        preprocessors: {
            // inject code to run before each test
            "**/*.js": ["inject-code-before"]
        },

        customLaunchers: {
            // customimze electron browser launcher
            CustomElectron: {
                base: "Electron",
                flags: ["--browserWindowOptions.show", "--auto-open-devtools-for-tabs"],

                // customimze electron create window options
                browserWindowOptions: {
                    webPreferences: {
                        // TODO: enable context isolation after plebbit-js native functions api is implemented
                        nodeIntegration: false,
                        contextIsolation: true,

                        // the electron window preload.js file
                        preload: preloadJsPath
                    },

                    // set headless to false
                    show: !headless
                }
            }
        },

        // list of browsers to run the tests in
        browsers: ["CustomElectron"],

        // don't watch, run once and exit
        singleRun: true,
        autoWatch: false,

        // how the test logs are displayed
        reporters: ["spec"],

        port: 9372,
        colors: true,
        logLevel: config.LOG_INFO,
        // logLevel: config.LOG_DEBUG,
        browserNoActivityTimeout: mochaConfig.timeout,
        browserDisconnectTimeout: mochaConfig.timeout,
        browserDisconnectTolerance: 5,
        processKillTimeout: 60000
    });
};

function injectCodeBeforeFactory() {
    return (content, file, done) => done(codeToInjectBefore + content);
}

const injectCodeBeforePlugin = {
    "preprocessor:inject-code-before": ["factory", injectCodeBeforeFactory]
};
