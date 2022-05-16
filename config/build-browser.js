// use this file to create the browser build
// it watches the dist/node folder which is created by tsc (typescript)
// and replaces `runtime/node` with `runtime/browser` in the imports

const path = require("path");
const chokidar = require("chokidar");
const fs = require("fs-extra");

const distFolder = path.resolve(__dirname, "..", "dist");
const inputFolder = path.resolve(__dirname, "..", "dist", "node");
const outputFolder = path.resolve(__dirname, "..", "dist", "browser");

fs.removeSync(outputFolder);

let persistent = false;
if (process.argv.includes("watch") || process.argv.includes("--watch")) {
    persistent = true;
}
let debug = false;
if (process.argv.includes("debug") || process.argv.includes("--debug")) {
    debug = true;
}

let lastTimestamp = Date.now();

// use dist folder instead of input folder because doesnt always work otherwise
chokidar.watch(distFolder, { persistent }).on("all", async (event, path) => {
    // this is not the input folder
    if (!path.startsWith(inputFolder)) {
        return;
    }

    const outputPath = path.replace(inputFolder, outputFolder);
    const time = "+" + Math.round((Date.now() - lastTimestamp) / 1000) + "s";
    lastTimestamp = Date.now();

    if (event === "add" || event === "change") {
        const file = await fs.readFile(path, "utf8");

        // sometimes the file is empty, not sure why but it causes a bug
        if (file === "") {
            if (debug) {
                console.log({ time, event, path, file });
            }
            return;
        }

        const builtFile = file.replaceAll("/runtime/node/", "/runtime/browser/");

        if (debug) {
            console.log({ time, event, path, builtFile: builtFile.substring(0, 20) });
        }

        await fs.ensureFile(outputPath);
        await fs.writeFile(outputPath, builtFile);
    } else {
        if (debug) {
            console.log({ time, event, path });
        }
    }
});
