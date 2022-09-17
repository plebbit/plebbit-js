const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");
const chokidar = require("chokidar");
const WatchExternalFilesPlugin = require("webpack-watch-files-plugin").default;

const webpackIsWatchMode = process.argv.includes("watch");
const rootFolder = path.resolve(__dirname, "..");
const outputFolder = path.resolve(rootFolder, "test-karma-webpack");
const testFolder = path.resolve(rootFolder, "test");
const lockFile = path.resolve(rootFolder, "package-lock.json");

// all our test files
const testGlob = testFolder + "/{browser,node-and-browser,node}/**/*.{test,util}.js";

// find all the browser test files and assign them to their own name, don't bundle them
const testFiles = glob.sync(testGlob).sort();
const testEntries = testFiles.reduce((acc, file) => {
    acc[file.replace(rootFolder, "")] = file;
    return acc;
}, {});

// debug build paths if needed
// console.log({rootFolder, testFiles, testEntries, outputFolder, testFolder, lockFile})
console.log("karma test files:");
console.log(Object.keys(testEntries));

module.exports = {
    // each test file is its own entry
    entry: testEntries,

    output: {
        // output each test entry to its own file name
        filename: "[name]",
        path: outputFolder,

        // clean the dist folder on each rebuild
        clean: true
    },

    plugins: [
        // watch the entire test folder, not just our entries
        new WatchExternalFilesPlugin({
            files: [testGlob]
        })
    ],

    module: {
        rules: [
            // plebbit-js doesn't need babel, but we should write our tests
            // with it to make sure it doesn't break for users who use it
            // like react users for example
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        // the most common option used by peopler
                        presets: ["@babel/preset-env"],

                        // fix ReferenceError: regeneratorRuntime is not defined
                        plugins: ["@babel/plugin-transform-runtime"]
                    }
                }
            }
        ]
    }

    /* 

    DO NOT USE FALLBACKS, ALIASES OR DEFINE/POLYFILL GLOBALS
    it will break using plebbit-js in projects that import it
    instead split the files that use node only code in:
      src/runtime/node
      src/runtime/browser
    resolve: {
        DO NOT USE
        fallback: {
            buffer: false,
            crypto: false,
            dns: false,
            fs: false,
            http: false,
            https: false,
            net: false,
            path: false,
            stream: false,
            util: false
        }

        DO NOT USE
        alias: {
            process: false
        }
    }
    */
};

// reset the webpack folder
fs.removeSync(outputFolder);

if (webpackIsWatchMode) {
    // if a new test file is found, restart webpack watcher
    // this is needed because the webpack entries cannot be
    // modified dynamically while watching, a new file is a new entry
    chokidar.watch(testFolder).on("all", async (event, path) => {
        glob(testGlob, (err, files) => {
            if (JSON.stringify(files.sort()) !== JSON.stringify(testFiles)) {
                console.log("karma test files changed, restarting webpack watcher");
                process.exit();
            }
        });
    });

    // restart when a node package is installed otherwise bugs out
    chokidar.watch(lockFile).on("all", async (event, path) => {
        if (event === "change" || event === "unlink") {
            console.log("lock file changed, restarting webpack watcher");
            process.exit();
        }
    });
}
