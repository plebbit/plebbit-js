// use this file to launch an ipfs node and some subplebbits
// that can be used during node and browser tests
const getIpfsPath = require("go-ipfs").path;
const { execSync, exec } = require("child_process");
const { startSubplebbits, mockRpcServerPlebbit } = require("../../dist/node/test/test-util");
const signers = require("../fixtures/signers");
const http = require("http");

const ipfsPath = getIpfsPath();

const rpcPort = 39652;

// use the test server with the compiled version (dist/node)
// with plain Javascript and commonjs require (not import)
// in order to test the repo like a real user would

const path = require("path");
const fs = require("fs");

// allow * origin on ipfs api to bypass cors browser error
// very insecure do not do this in production
const offlineNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-offline"),
    apiPort: 15001,
    gatewayPort: 18080,
    daemonArgs: "--offline"
};
const pubsubNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-pubsub"),
    apiPort: 15002,
    gatewayPort: 18081,
    daemonArgs: "--enable-pubsub-experiment",
    extraCommands: ["bootstrap rm --all"]
};

const onlineNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-online"),
    apiPort: 15003,
    gatewayPort: 18082,
    daemonArgs: "--enable-pubsub-experiment",
    extraCommands: []
};

const anotherOfflineNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-offline2"),
    apiPort: 15004,
    gatewayPort: 18083,
    daemonArgs: "--offline"
};

const anotherPubsubNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-pubsub2"),
    apiPort: 15005,
    gatewayPort: 18084,
    daemonArgs: "--enable-pubsub-experiment",
    extraCommands: ["bootstrap rm --all"]
};

const startIpfsNodes = async () => {
    await Promise.all(
        [offlineNodeArgs, pubsubNodeArgs, onlineNodeArgs, anotherOfflineNodeArgs, anotherPubsubNodeArgs].map(async (nodeArgs) => {
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

    const dirsToDelete = [
        ".plebbit",
        ".plebbit2",
        ".plebbit-rpc-server",
        ".test-ipfs-offline",
        ".test-ipfs-offline2",
        ".test-ipfs-online",
        ".test-ipfs-pubsub",
        ".test-ipfs-pubsub2"
    ];

    await Promise.all(dirsToDelete.map((dirPath) => fs.promises.rm(path.join(process.cwd(), dirPath), { recursive: true, force: true })));

    await startIpfsNodes();

    // Create a server that mocks an ipfs gateway
    // Will return valid content for one cid and invalid content for another
    // The purpose is to test whether plebbit.fetchCid will throw if we retrieved the invalid content

    http.createServer((req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        if (req.url === "/ipfs/QmbWqTYuyfcpDyn6gawRf5eSFVtYnGDAKttjESXjjbAHbr") res.end("Hello plebs"); // Valid content
        else if (req.url === "/ipfs/QmUFu8fzuT1th3jJYgR4oRgGpw3sgRALr4nbenA4pyoCav")
            res.end("This string does not generate the CID in the URL. This should throw an error in plebbit.fetchCid");
        else res.end("Unknown CID");
    }).listen(33415);

    // Create an HTTP server that mocks an ipfs gateway, and returns 429 always to imitate cloudflare-ipfs
    http.createServer((req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.statusCode = 429;
        res.statusMessage = "Too Many Requests";
        res.end();
    }).listen(33416);

    // Create an HTTP server that takes 10s to respond
    http.createServer(async (req, res) => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end("Yes");
    }).listen(33417);

    require("./pubsub-mock-server");

    const runInMemory = process.env["CLIENT"]?.includes("browser") || process.env["CLIENT"]?.includes("remote"); // Sub should be in memory if running tests on browser
    if (runInMemory) console.log(`test-server will run in memory`);

    if (process.env["USE_RPC"] === "1") {
        // run RPC here
        delete process.env["USE_RPC"]; // So rest of code is not being ran with RPC on
        const PlebbitRpc = require("../../rpc");
        const plebbitWebSocketServer = await PlebbitRpc.PlebbitWsServer({ port: rpcPort });
        plebbitWebSocketServer.plebbit = await mockRpcServerPlebbit({ dataPath: path.join(process.cwd(), ".plebbit-rpc-server") });

        // debug raw JSON RPC messages in console (optional)
        plebbitWebSocketServer.ws.on("connection", (socket, request) => {
            console.log("connection");
            socket.on("message", (message) => console.log(message.toString()));
        });

        console.log(`test server plebbit wss listening on port ${rpcPort}`);
    }

    if (process.env["NO_SUBPLEBBITS"] !== "1")
        await startSubplebbits({
            signers: signers,
            publishInterval: 3000,
            noData: runInMemory,
            votesPerCommentToPublish: 5,
            numOfPostsToPublish: 51,
            numOfCommentsToPublish: 10
        });

    // create a test server to be able to use npm module 'wait-on'
    // to know when the test server is finished getting ready
    // and able to start the automated tests
    http.createServer((req, res) => res.end("test server ready")).listen(14952);
})();
