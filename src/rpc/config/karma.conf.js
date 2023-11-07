// this file runs the tests in test/browser*

// you can add "CHROME_BIN=/usr/bin/chromium" to .env file
// to not have to type it every time
require('dotenv').config()

// same as .mocharc.js
const mochaConfig = {
  // set large value for manual debugging
  timeout: 600_000,
}
if (process.env.CI) {
  // set small value for timing out CI
  mochaConfig.timeout = 300_000
}

// possible to add flags when launching the browser
const CustomChrome = {
  base: 'ChromeHeadless',
  flags: ['--disable-web-security'],
  debug: true,
}

const DebugChrome = {
  base: 'Chrome',
  flags: ['--disable-web-security', '--auto-open-devtools-for-tabs', '--window-size=800,600'],
  debug: true,
}

// choose which browser you prefer
let browsers = [
  // 'FirefoxHeadless',
  // 'CustomChrome',
  'DebugChrome',
]

// use headless for manual debugging
if (process.env.HEADLESS) {
  browsers = ['CustomChrome']
}

// add firefox during CI
// make sure non-headless DebugChrome is not included as it breaks the CI
if (process.env.CI) {
  browsers = ['CustomChrome', 'FirefoxHeadless']
}

// inject browser code before each test file
let codeToInjectBefore = ''

// inject debug env variable to be able to do `DEBUG=plebbit:* npm run test`
if (process.env.DEBUG) {
  codeToInjectBefore += `
      localStorage.debug = "${process.env.DEBUG.replaceAll(`"`, '')}";
    `
}

let files = [
  // the tests are first compiled from typescript to dist/node/test
  // then they are compiled to browser with webpack to dist/browser/test
  // you must run `npm run tsc:watch` and `npm run webpack:watch` to use the karma tests
  'test-karma-webpack/test/browser/**/*.test.js',
  'test-karma-webpack/test/node-and-browser/**/*.test.js',
]

// test the plebbit-js-mock files
// launch the mock tests separately because it sometimes wrongly mocks all files
if (process.argv.includes('plebbit-js-mock') || process.argv.includes('--plebbit-js-mock')) {
  files = ['test-karma-webpack/test/browser-plebbit-js-mock/**/*.test.js']
}

// test the plebbit-js-mock-content files
// launch the mock tests separately because it sometimes wrongly mocks all files
if (process.argv.includes('plebbit-js-mock-content') || process.argv.includes('--plebbit-js-mock-content')) {
  files = ['test-karma-webpack/test/browser-plebbit-js-mock-content/**/*.test.js']
}

module.exports = function (config) {
  config.set({
    // chai adds "expect" matchers
    // sinon adds mocking utils
    frameworks: ['mocha', 'chai', 'sinon'],
    client: {
      mocha: mochaConfig,
    },
    plugins: [
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-mocha'),
      require('karma-chai'),
      require('karma-sinon'),
      require('karma-spec-reporter'),
      injectCodeBeforePlugin,
    ],

    basePath: '../',
    files,
    exclude: [],

    preprocessors: {
      // inject code to run before each test
      '**/*.js': ['inject-code-before'],
    },

    // chrome with disabled security
    customLaunchers: {CustomChrome, DebugChrome},

    // list of browsers to run the tests in
    browsers,

    // don't watch, run once and exit
    singleRun: true,
    autoWatch: false,

    // how the test logs are displayed
    reporters: ['spec'],

    port: 9371,
    colors: true,
    logLevel: config.LOG_INFO,
    // logLevel: config.LOG_DEBUG,
    browserNoActivityTimeout: mochaConfig.timeout,
    browserDisconnectTimeout: mochaConfig.timeout,
    browserDisconnectTolerance: 5,
  })
}

function injectCodeBeforeFactory() {
  return (content, file, done) => done(codeToInjectBefore + content)
}

const injectCodeBeforePlugin = {
  'preprocessor:inject-code-before': ['factory', injectCodeBeforeFactory],
}
