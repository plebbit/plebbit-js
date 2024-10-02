// use this file to launch an ipfs node and some subplebbits
// that can be used during node and browser tests
import { path as getIpfsPath } from "kubo";
import { execSync, exec } from "child_process";
import {
    startSubplebbits,
    mockRpcServerPlebbit,
    mockGatewayPlebbit,
    mockRpcWsToSkipSignatureValidation
} from "../../dist/node/test/test-util.js";
import { cleanUpBeforePublishing, signSubplebbit } from "../../dist/node/signer/signatures.js";

import PlebbitWsServer from "../../rpc";
import signers from "../fixtures/signers.js";
import http from "http";
import path from "path";
import fs from "fs";
import { removeUndefinedValuesRecursively } from "../../dist/node/util.js";

const ipfsPath = getIpfsPath();

const rpcPort = 39652;

const startOnlineSub = false;

const hostName = undefined; // use default

// use the test server with the compiled version (dist/node)
// in order to test the repo like a real user would

const rpcAuthKey = "123456";

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
    const ipfsNodesToRun = [offlineNodeArgs, pubsubNodeArgs, anotherOfflineNodeArgs, anotherPubsubNodeArgs];
    if (startOnlineSub) ipfsNodesToRun.push(onlineNodeArgs);
    for (const nodeArgs of ipfsNodesToRun) {
        console.log("Initializing Node", nodeArgs.dir, "\n");
        try {
            execSync(`${ipfsPath} init`, { stdio: "ignore", env: { IPFS_PATH: nodeArgs.dir } });
        } catch {}

        const ipfsConfigPath = path.join(nodeArgs.dir, "config");
        const ipfsConfig = JSON.parse(fs.readFileSync(ipfsConfigPath));

        ipfsConfig["Addresses"]["API"] = `/ip4/127.0.0.1/tcp/${nodeArgs.apiPort}`;
        ipfsConfig["Addresses"]["Gateway"] = `/ip4/127.0.0.1/tcp/${nodeArgs.gatewayPort}`;
        ipfsConfig["API"]["HTTPHeaders"]["Access-Control-Allow-Origin"] = ["*"];

        fs.writeFileSync(ipfsConfigPath, JSON.stringify(ipfsConfig), "utf8");

        if (nodeArgs.extraCommands)
            for (const extraCommand of nodeArgs.extraCommands)
                execSync(`${ipfsPath} ${extraCommand}`, {
                    stdio: "inherit",
                    env: { IPFS_PATH: nodeArgs.dir }
                });

        const ipfsCmd = `${ipfsPath} daemon ${nodeArgs.daemonArgs}`;
        console.log(ipfsCmd);
        const ipfsProcess = exec(ipfsCmd, { env: { IPFS_PATH: nodeArgs.dir } });
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
        await ipfsDaemonIsReady();
    }
};

const setUpMockGateways = async () => {
    // Create a server that mocks an ipfs gateway
    // Will return valid content for one cid and invalid content for another
    // The purpose is to test whether plebbit.fetchCid will throw if we retrieved the invalid content

    http.createServer(async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        if (req.url === "/ipfs/QmbWqTYuyfcpDyn6gawRf5eSFVtYnGDAKttjESXjjbAHbr")
            res.end("Hello plebs"); // Valid content
        else if (req.url === "/ipfs/QmUFu8fzuT1th3jJYgR4oRgGpw3sgRALr4nbenA4pyoCav")
            res.end("This string does not generate the CID in the URL. This should throw an error in plebbit.fetchCid");
        else if (req.url.includes("/ipns")) {
            const subAddress = req.url.split("/")[2];
            const sub = await plebbit.getSubplebbit(subAddress);
            res.setHeader("x-ipfs-roots", "QmUFu8fzuT1th3jJYgR4oRgGpw3sgRALr4nbenA4pyoCav"); // random cid
            res.end(JSON.stringify(sub.toJSONIpfs()));
        } else res.end(await plebbit.fetchCid(req.url));
    })
        .listen(13415, hostName)
        .on("error", (err) => {
            throw err;
        });

    // Create an HTTP server that mocks an ipfs gateway, and returns 429 always to imitate cloudflare-ipfs
    http.createServer((req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.statusCode = 429;
        res.statusMessage = "Too Many Requests";
        res.end();
    })
        .listen(13416, hostName)
        .on("error", (err) => {
            throw err;
        });

    // Create an HTTP server that takes 10s to respond
    http.createServer(async (req, res) => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end("Yes");
    })
        .listen(13417, hostName)
        .on("error", (err) => {
            throw err;
        });

    // Create an HTTP server that responds with html string instead of json
    http.createServer(async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end("<html><body><div class='myClass'><div id='myId'>Hello World!!</div></div></body></html>");
    })
        .listen(13418)
        .on("error", (err) => {
            throw err;
        });

    // Set up mock gateways for subplebbit gateway fetching tests
    const plebbit = await mockGatewayPlebbit();
    const fetchLatestSubplebbitJson = async () => {
        const subjsonIpfs = (await plebbit.getSubplebbit(signers[0].address)).toJSONIpfs();

        const subRecord = cleanUpBeforePublishing(subjsonIpfs);
        if (subjsonIpfs.posts) subRecord.posts = removeUndefinedValuesRecursively(subjsonIpfs.posts);
        return subRecord;
    };

    // This gateaway will wait for 11s then respond
    http.createServer(async (req, res) => {
        await new Promise((resolve) => setTimeout(resolve, 11000));
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify(await fetchLatestSubplebbitJson()));
    })
        .listen(14000, hostName)
        .on("error", (err) => {
            throw err;
        });

    // This gateway will fetch from normal gateway, await some time (3s) than respond
    http.createServer(async (req, res) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify(await fetchLatestSubplebbitJson()));
    })
        .listen(14002, hostName)
        .on("error", (err) => {
            throw err;
        });

    // this gateway will respond with an error immedietly
    http.createServer((req, res) => {
        res.statusCode = 430;
        res.statusMessage = "Error";
        res.end();
    })
        .listen(14003, hostName)
        .on("error", (err) => {
            throw err;
        });

    // This gateway will respond immedietly with subplebbit IPNS record that is 30 minutes old
    http.createServer(async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");

        const subplebbitRecordThirtyMinuteOld = await fetchLatestSubplebbitJson(); // very old Subplebbit ipns record from subplebbitAddress
        subplebbitRecordThirtyMinuteOld.updatedAt = Math.round(Date.now() / 1000) - 30 * 60; // make sure updatedAt is 30 minutes old
        subplebbitRecordThirtyMinuteOld.signature = await signSubplebbit(subplebbitRecordThirtyMinuteOld, signers[0]);
        res.setHeader("x-ipfs-roots", "QmUFu8fzuT1th3jJYgR4oRgGpw3sgRALr4nbenA4pyoCav"); // random cid

        res.end(JSON.stringify(subplebbitRecordThirtyMinuteOld));
    })
        .listen(14004, hostName)
        .on("error", (err) => {
            throw err;
        });

    // This gateway will respond immedietly with subplebbit IPNS record that is 60 minutes old
    http.createServer(async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");

        const subplebbitRecordHourOld = await fetchLatestSubplebbitJson(); // very old Subplebbit ipns record from subplebbitAddress
        subplebbitRecordHourOld.updatedAt = Math.round(Date.now() / 1000) - 60 * 60; // make sure updatedAt is 30 minutes old
        subplebbitRecordHourOld.signature = await signSubplebbit(subplebbitRecordHourOld, signers[0]);
        res.setHeader("x-ipfs-roots", "QmUFu8fzuT1th3jJYgR4oRgGpw3sgRALr4nbenA4pyoCav"); // random cid

        res.end(JSON.stringify(subplebbitRecordHourOld));
    })
        .listen(14005, hostName)
        .on("error", (err) => {
            throw err;
        });

    // This gateway will respond immedietly with subplebbit IPNS record that is 120 minutes old
    http.createServer(async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");

        const subplebbitRecordHourOld = await fetchLatestSubplebbitJson(); // very old Subplebbit ipns record from subplebbitAddress
        subplebbitRecordHourOld.updatedAt = Math.round(Date.now() / 1000) - 2 * 60 * 60; // make sure updatedAt is 30 minutes old
        subplebbitRecordHourOld.signature = await signSubplebbit(subplebbitRecordHourOld, signers[0]);
        res.setHeader("x-ipfs-roots", "QmUFu8fzuT1th3jJYgR4oRgGpw3sgRALr4nbenA4pyoCav"); // random cid

        res.end(JSON.stringify(subplebbitRecordHourOld));
    })
        .listen(14006, hostName)
        .on("error", (err) => {
            throw err;
        });
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
    for (const dir of dirsToDelete) await fs.promises.rm(path.join(process.cwd(), dir), { recursive: true, force: true });

    await startIpfsNodes();

    await setUpMockGateways();

    await import("./pubsub-mock-server");

    if (process.env["USE_RPC"] === "1") {
        // run RPC server here
        delete process.env["USE_RPC"]; // So rest of code is not being ran with RPC on
        // This server will create subs and interact with them
        const plebbitWebSocketServer = await PlebbitWsServer.PlebbitWsServer({ port: rpcPort, authKey: rpcAuthKey });
        mockRpcWsToSkipSignatureValidation(plebbitWebSocketServer);
        plebbitWebSocketServer.plebbit = await mockRpcServerPlebbit({ dataPath: path.join(process.cwd(), ".plebbit-rpc-server") });

        // This server will fetch subs remotely

        const remotePort = rpcPort + 1;
        const plebbitWebSocketRemoteServer = await PlebbitWsServer.PlebbitWsServer({ port: remotePort, authKey: rpcAuthKey });
        mockRpcWsToSkipSignatureValidation(plebbitWebSocketRemoteServer);

        plebbitWebSocketServer.plebbit = await mockRpcServerPlebbit({ dataPath: path.join(process.cwd(), ".plebbit-rpc-server" + 2) });

        console.log(`test server plebbit wss listening on port ${rpcPort} and ${remotePort}`);
    }

    if (process.env["NO_SUBPLEBBITS"] !== "1") {
        const subs = await startSubplebbits({
            signers: signers,
            publishInterval: 3000,
            votesPerCommentToPublish: 1,
            numOfPostsToPublish: 1,
            numOfCommentsToPublish: 1,
            startOnlineSub: startOnlineSub
        });

        http.createServer(async (req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify(subs));
        }).listen(14953, hostName);
    }

    // create a test server to be able to use npm module 'wait-on'
    // to know when the test server is finished getting ready
    // and able to start the automated tests
    http.createServer((req, res) => res.end("test server ready"))
        .listen(14952)
        .on("error", (err) => {
            throw err;
        });
})();
