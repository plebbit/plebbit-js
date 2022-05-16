// use this file to launch an ipfs node and some subplebbits
// that can be used during node and browser tests
const getIpfsPath = require("go-ipfs").path;
const { execSync, exec } = require("child_process");
const ipfsPath = getIpfsPath();

// use the test server with the compiled version (dist/node)
// with plain Javascript and commonjs require (not import)
// in order to test the repo like a real user would
const Plebbit = require("../dist/node");

// allow * origin on ipfs api to bypass cors browser error
// very insecure do not do this in production
execSync(`${ipfsPath} config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'`, { stdio: "inherit" });

// start ipfs daemon
const ipfsProcess = exec(`${ipfsPath}  daemon --enable-pubsub-experiment`);
console.log(`${ipfsPath}  process started with pid ${ipfsProcess.pid}`);
ipfsProcess.stderr.on("data", console.error);
ipfsProcess.stdin.on("data", console.log);
ipfsProcess.stdout.on("data", console.log);
ipfsProcess.on("error", console.error);
ipfsProcess.on("exit", () => {
    console.error(`${ipfsPath}  process with pid ${ipfsProcess.pid} exited`);
    process.exit(1);
});
process.on("exit", () => {
    exec(`kill ${ipfsProcess.pid + 1}`);
});

const ipfsDaemonIsReady = () =>
    new Promise((resolve) => {
        ipfsProcess.stdout.on("data", (data) => {
            if (data.match("Daemon is ready")) {
                resolve();
            }
        });
    });

(async () => {
    await ipfsDaemonIsReady();

    // do more stuff here, like start some subplebbits

    // const plebbit = await Plebbit({
    //   ipfsHttpClientOptions: 'http://localhost:5001/api/v0',
    // })
    // const subplebbit = await plebbit.createSubplebbit({'signer': signer})
    // await subplebbit.start()
})();
