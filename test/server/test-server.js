// use this file to launch an ipfs node and some subplebbits
// that can be used during node and browser tests
const getIpfsPath = require("go-ipfs").path;
const { execSync, exec } = require("child_process");
const { startSubplebbits } = require("../../dist/node/test/test-util");
const signers = require("../fixtures/signers");

const ipfsPath = getIpfsPath();

// use the test server with the compiled version (dist/node)
// with plain Javascript and commonjs require (not import)
// in order to test the repo like a real user would

const path = require("path");
const fs = require("fs");

const memoryDatabaseConfig = {
    client: "sqlite3",
    connection: {
        filename: ":memory:"
    },
    useNullAsDefault: true
};

// allow * origin on ipfs api to bypass cors browser error
// very insecure do not do this in production
const offlineNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-offline"),
    apiPort: 5001,
    gatewayPort: 8080,
    daemonArgs: "--offline"
};
const ipfsNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-pubsub"),
    apiPort: 5002,
    gatewayPort: 8081,
    daemonArgs: "--enable-pubsub-experiment",
    extraCommands: ["bootstrap rm --all"]
};

const onlineNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-online"),
    apiPort: 5003,
    gatewayPort: 8082,
    daemonArgs: "--enable-pubsub-experiment",
    extraCommands: []
};

const anotherOfflineNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-offline2"),
    apiPort: 5004,
    gatewayPort: 8083,
    daemonArgs: "--offline"
};

const startIpfsNodes = async () => {
    await Promise.all(
        [offlineNodeArgs, ipfsNodeArgs, onlineNodeArgs, anotherOfflineNodeArgs].map(async (nodeArgs) => {
            try {
                execSync(`IPFS_PATH=${nodeArgs.dir} ${ipfsPath} init`, { stdio: "ignore" });
            } catch {}

            execSync(`IPFS_PATH=${nodeArgs.dir} ${ipfsPath} config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'`, {
                stdio: "inherit"
            });
            execSync(`IPFS_PATH=${nodeArgs.dir} ${ipfsPath} config  Addresses.API /ip4/127.0.0.1/tcp/${nodeArgs.apiPort}`, {
                stdio: "inherit"
            });
            execSync(`IPFS_PATH=${nodeArgs.dir} ${ipfsPath} config Addresses.Gateway /ip4/127.0.0.1/tcp/${nodeArgs.gatewayPort}`, {
                stdio: "inherit"
            });

            if (nodeArgs.extraCommands)
                for (const extraCommand of nodeArgs.extraCommands)
                    execSync(`IPFS_PATH=${nodeArgs.dir} ${ipfsPath} ${extraCommand}`, {
                        stdio: "inherit"
                    });

            const ipfsCmd = `IPFS_PATH=${nodeArgs.dir} ${ipfsPath} daemon ${nodeArgs.daemonArgs}`;
            console.log(ipfsCmd);
            const ipfsProcess = exec(ipfsCmd);
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
            return ipfsDaemonIsReady();
        })
    );
};

(async () => {
    // do more stuff here, like start some subplebbits

    await fs.promises.rm(path.join(process.cwd(), ".plebbit"), { recursive: true, force: true });
    await fs.promises.rm(path.join(process.cwd(), ".plebbit2"), { recursive: true, force: true });

    await startIpfsNodes();

    if (process.env["NO_SUBPLEBBITS"] !== "1")
        await startSubplebbits({
            signers: signers,
            syncInterval: 100,
            database: memoryDatabaseConfig,
            votesPerCommentToPublish: 10,
            numOfCommentsToPublish: 10
        });

    // create a test server to be able to use npm module 'wait-on'
    // to know when the test server is finished getting ready
    // and able to start the automated tests
    require("http")
        .createServer((req, res) => res.end("test server ready"))
        .listen(14952);
})();
