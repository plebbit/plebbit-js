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
import { convertBase32ToBase58btc } from "../../dist/node/signer/util.js";

import PlebbitWsServer from "../../dist/node/rpc/src/index.js";
import signers from "../fixtures/signers.js";
import http from "http";
import path from "path";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import tcpPortUsed from "tcp-port-used";

import fs from "fs";

process.env["PLEBBIT_CONFIGS"] = process.env["PLEBBIT_CONFIGS"] || "local-kubo-rpc";

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
    daemonArgs: " --enable-namesys-pubsub",
    swarmPort: 4001,
    extraCommands: ["bootstrap rm --all", "config --json Discovery.MDNS.Enabled false"]
};
const pubsubNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-pubsub"),
    apiPort: 15002,
    gatewayPort: 18081,
    swarmPort: 4002,
    daemonArgs: "--enable-namesys-pubsub",
    extraCommands: ["bootstrap rm --all", "config --json Discovery.MDNS.Enabled false"]
};

const onlineNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-online"),
    apiPort: 15003,
    gatewayPort: 18082,
    swarmPort: 4003,
    daemonArgs: "--enable-pubsub-experiment",
    extraCommands: []
};

const anotherOfflineNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-offline2"),
    apiPort: 15004,
    gatewayPort: 18083,
    swarmPort: 4004,
    daemonArgs: "--offline"
};

const anotherPubsubNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-pubsub2"),
    apiPort: 15005,
    gatewayPort: 18084,
    swarmPort: 4005,
    daemonArgs: "--enable-pubsub-experiment",
    extraCommands: ["bootstrap rm --all", "config --json Discovery.MDNS.Enabled false"]
};

const httpRouterNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-http-router"),
    apiPort: 15006,
    gatewayPort: 18085,
    swarmPort: 4006,
    daemonArgs: "--enable-pubsub-experiment",
    extraCommands: ["bootstrap rm --all", "config --json Discovery.MDNS.Enabled false"]
};

const ipfsNodesToRun = [offlineNodeArgs, pubsubNodeArgs, anotherOfflineNodeArgs, anotherPubsubNodeArgs, httpRouterNodeArgs];

const startIpfsNode = async (nodeArgs) => {
    console.log("Initializing Node", nodeArgs.dir, "\n");

    // Check if ports are available before starting the node
    const apiUsed = await tcpPortUsed.check(nodeArgs.apiPort);
    if (apiUsed) {
        throw new Error(`API port ${nodeArgs.apiPort} for node ${path.basename(nodeArgs.dir)} is already occupied`);
    }

    const gatewayUsed = await tcpPortUsed.check(nodeArgs.gatewayPort);
    if (gatewayUsed) {
        throw new Error(`Gateway port ${nodeArgs.gatewayPort} for node ${path.basename(nodeArgs.dir)} is already occupied`);
    }

    const swarmUsed = await tcpPortUsed.check(nodeArgs.swarmPort);
    if (swarmUsed) {
        throw new Error(`Swarm port ${nodeArgs.swarmPort} for node ${path.basename(nodeArgs.dir)} is already occupied`);
    }

    try {
        execSync(`${ipfsPath} init`, { stdio: "ignore", env: { IPFS_PATH: nodeArgs.dir } });
    } catch {}

    if (nodeArgs.extraCommands)
        for (const extraCommand of nodeArgs.extraCommands)
            execSync(`${ipfsPath} ${extraCommand}`, {
                stdio: "inherit",
                env: { IPFS_PATH: nodeArgs.dir }
            });

    const ipfsConfigPath = path.join(nodeArgs.dir, "config");
    const ipfsConfig = JSON.parse(fs.readFileSync(ipfsConfigPath));

    ipfsConfig["Addresses"]["API"] = `/ip4/127.0.0.1/tcp/${nodeArgs.apiPort}`;
    ipfsConfig["Addresses"]["Gateway"] = `/ip4/127.0.0.1/tcp/${nodeArgs.gatewayPort}`;
    ipfsConfig["API"]["HTTPHeaders"]["Access-Control-Allow-Origin"] = ["*"];
    ipfsConfig["Gateway"]["HTTPHeaders"]["Access-Control-Allow-Headers"] = ["*"];
    ipfsConfig["Ipns"]["MaxCacheTTL"] = "10s";
    ipfsConfig.Addresses.Swarm = ipfsConfig.Addresses.Swarm.map((swarmAddr) => swarmAddr.replace("/4001", "/" + nodeArgs.swarmPort));
    fs.writeFileSync(ipfsConfigPath, JSON.stringify(ipfsConfig), "utf8");

    const ipfsCmd = `${ipfsPath} daemon ${nodeArgs.daemonArgs?.length ? nodeArgs.daemonArgs : ""}`;
    console.log(ipfsCmd);
    const ipfsProcess = exec(ipfsCmd, { env: { IPFS_PATH: nodeArgs.dir } });
    ipfsProcess.stderr.on("data", console.error);
    ipfsProcess.stdin.on("data", console.log);
    ipfsProcess.stdout.on("data", console.log);
    ipfsProcess.on("error", console.error);
    ipfsProcess.on("exit", () => {
        console.error(`${ipfsPath} process with dir ${path.basename(nodeArgs.dir)} with pid ${ipfsProcess.pid} exited`);
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

    // is this http router config node
    ipfsProcess.on("exit", async () => {
        console.log("ipfs node", nodeArgs, "has been shut down. Will attempt to restart");
        await startIpfsNode(nodeArgs);
    });
    return { ipfsProcess };
};

const startIpfsNodes = async () => {
    if (startOnlineSub) ipfsNodesToRun.push(onlineNodeArgs);
    for (const nodeArgs of ipfsNodesToRun) {
        await startIpfsNode(nodeArgs);
    }
};

const setUpMockGateways = async () => {
    // Create a server that mocks an ipfs gateway
    // Will return valid content for one cid and invalid content for another
    // The purpose is to test whether plebbit.fetchCid will throw if we retrieved the invalid content

    http.createServer(async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        if (req.url === "/ipfs/bafybeigdypsgdcm2ddvyh2y2gnltw3zi5iphzzwdlpie3jfxpmer7frknu")
            res.end("Hello plebs"); // Valid content
        else if (req.url === "/ipfs/bafybeicx52dlvj3dlxtvr2hbr4femfntkeikr4erlmsnxequm2tezud7rm")
            res.end("This string does not generate the CID in the URL. This should throw an error in plebbit.fetchCid");
        else if (req.url.includes("/ipns")) {
            const subAddress = convertBase32ToBase58btc(req.url.split("/")[2]);
            const sub = await plebbit.getSubplebbit(subAddress);
            res.setHeader("x-ipfs-roots", sub.updateCid);
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
    const fetchLatestSubplebbit = async () => {
        return await plebbit.getSubplebbit(signers[0].address);
    };

    // This gateaway will wait for 11s then respond
    http.createServer(async (req, res) => {
        await new Promise((resolve) => setTimeout(resolve, 11000));
        res.setHeader("Access-Control-Allow-Origin", "*");
        const subRecord = await fetchLatestSubplebbit();
        res.setHeader("x-ipfs-roots", subRecord.updateCid);

        res.end(JSON.stringify(subRecord.toJSONIpfs()));
    })
        .listen(14000, hostName)
        .on("error", (err) => {
            throw err;
        });

    // This gateway will fetch from normal gateway, await some time (3s) than respond
    http.createServer(async (req, res) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        res.setHeader("Access-Control-Allow-Origin", "*");
        const subRecord = await fetchLatestSubplebbit();
        res.setHeader("x-ipfs-roots", subRecord.updateCid);

        res.end(JSON.stringify(subRecord.toJSONIpfs()));
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

        const subplebbitRecordThirtyMinuteOld = await fetchLatestSubplebbit(); // very old Subplebbit ipns record from subplebbitAddress
        const subplebbitRecordThirtyMinuteOldIpfs = JSON.parse(JSON.stringify(subplebbitRecordThirtyMinuteOld.toJSONIpfs()));
        subplebbitRecordThirtyMinuteOldIpfs.updatedAt = Math.round(Date.now() / 1000) - 30 * 60; // make sure updatedAt is 30 minutes old
        subplebbitRecordThirtyMinuteOldIpfs.signature = await signSubplebbit(subplebbitRecordThirtyMinuteOldIpfs, signers[0]);
        res.setHeader("x-ipfs-roots", await calculateIpfsHash(JSON.stringify(subplebbitRecordThirtyMinuteOldIpfs)));

        res.end(JSON.stringify(subplebbitRecordThirtyMinuteOldIpfs));
    })
        .listen(14004, hostName)
        .on("error", (err) => {
            throw err;
        });

    // This gateway will respond immedietly with subplebbit IPNS record that is 60 minutes old
    http.createServer(async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");

        const latestRecord = await fetchLatestSubplebbit(); // very old Subplebbit ipns record from subplebbitAddress
        const subplebbitRecordHourOldIpfs = JSON.parse(JSON.stringify(latestRecord.toJSONIpfs()));

        subplebbitRecordHourOldIpfs.updatedAt = Math.round(Date.now() / 1000) - 60 * 60; // make sure updatedAt is 30 minutes old
        subplebbitRecordHourOldIpfs.signature = await signSubplebbit(subplebbitRecordHourOldIpfs, signers[0]);
        res.setHeader("x-ipfs-roots", await calculateIpfsHash(JSON.stringify(subplebbitRecordHourOldIpfs)));

        res.end(JSON.stringify(subplebbitRecordHourOldIpfs));
    })
        .listen(14005, hostName)
        .on("error", (err) => {
            throw err;
        });

    // This gateway will respond immedietly with subplebbit IPNS record that is 120 minutes old
    http.createServer(async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");

        const subplebbitRecordTwoHoursOld = await fetchLatestSubplebbit(); // very old Subplebbit ipns record from subplebbitAddress
        const subplebbitRecordTwoHoursOldIpfs = JSON.parse(JSON.stringify(subplebbitRecordTwoHoursOld.toJSONIpfs()));

        subplebbitRecordTwoHoursOldIpfs.updatedAt = Math.round(Date.now() / 1000) - 2 * 60 * 60; // make sure updatedAt is 30 minutes old
        subplebbitRecordTwoHoursOldIpfs.signature = await signSubplebbit(subplebbitRecordTwoHoursOldIpfs, signers[0]);
        res.setHeader("x-ipfs-roots", await calculateIpfsHash(JSON.stringify(subplebbitRecordTwoHoursOldIpfs)));

        res.end(JSON.stringify(subplebbitRecordTwoHoursOldIpfs));
    })
        .listen(14006, hostName)
        .on("error", (err) => {
            throw err;
        });
};

const setupMockDelegatedRouter = async () => {
    // This router will just return the offlineNodeArgs IPFS addresses whenever it's queried

    http.createServer(async (req, res) => {
        console.log("Received a request for mock http router", req.url);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        const providerList = { Providers: [] };
        for (const ipfsNode of [offlineNodeArgs, pubsubNodeArgs]) {
            const idRes = await fetch(`http://localhost:${ipfsNode.apiPort}/api/v0/id`, { method: "POST" }).then((res) => res.json());
            providerList.Providers.push({
                Schema: "peer",
                Addrs: idRes["Addresses"],
                ID: idRes["ID"],
                Protocols: ["transport-bitswap"]
            });
        }

        res.end(JSON.stringify(providerList));
    })
        .listen(20001, hostName)
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
        ".plebbit-rpc-server-remote",
        ...ipfsNodesToRun.map((node) => path.basename(node.dir))
    ];
    for (const dir of dirsToDelete) await fs.promises.rm(path.join(process.cwd(), dir), { recursive: true, force: true });

    await startIpfsNodes();

    await setUpMockGateways();

    await setupMockDelegatedRouter();

    await import("./pubsub-mock-server.js");

    if (process.env["START_RPC_SERVER"] === "1") {
        // run RPC server here
        // This server will create subs and interact with them
        const plebbitWebSocketServer = await PlebbitWsServer.PlebbitWsServer({ port: rpcPort, authKey: rpcAuthKey });
        plebbitWebSocketServer.plebbit = await mockRpcServerPlebbit({ dataPath: path.join(process.cwd(), ".plebbit-rpc-server") });
        plebbitWebSocketServer._createPlebbitInstanceFromSetSettings = async (newOptions) =>
            mockRpcServerPlebbit({ dataPath: path.join(process.cwd(), ".plebbit-rpc-server"), ...newOptions });
        mockRpcWsToSkipSignatureValidation(plebbitWebSocketServer);

        // This server will fetch subs remotely

        const remotePort = rpcPort + 1;
        const plebbitWebSocketRemoteServer = await PlebbitWsServer.PlebbitWsServer({
            port: remotePort,
            authKey: rpcAuthKey
        });
        plebbitWebSocketRemoteServer.plebbit = await mockRpcServerPlebbit({
            dataPath: path.join(process.cwd(), ".plebbit-rpc-server-remote")
        });
        plebbitWebSocketRemoteServer._createPlebbitInstanceFromSetSettings = async (newOptions) =>
            mockRpcServerPlebbit({ dataPath: path.join(process.cwd(), ".plebbit-rpc-server"), ...newOptions });

        mockRpcWsToSkipSignatureValidation(plebbitWebSocketRemoteServer);

        console.log(`test server plebbit wss listening on port ${rpcPort} and ${remotePort}`);
    }

    if (process.env["NO_SUBPLEBBITS"] !== "1") {
        const subs = await startSubplebbits({
            signers: signers,
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
