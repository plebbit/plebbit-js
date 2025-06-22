// use this file to launch an ipfs node and some subplebbits
// that can be used during node and browser tests
import { path as getIpfsPath } from "kubo";
import { execSync, exec } from "child_process";
import {
    startSubplebbits,
    mockRpcServerPlebbit,
    mockGatewayPlebbit,
    mockRpcServerForTests,
    mockPlebbitNoDataPathWithOnlyKuboClient
} from "../../dist/node/test/test-util.js";
import { cleanUpBeforePublishing, signSubplebbit } from "../../dist/node/signer/signatures.js";
import { convertBase32ToBase58btc } from "../../dist/node/signer/util.js";

import PlebbitWsServer from "../../dist/node/rpc/src/index.js";
import signers from "../fixtures/signers.js";
import http from "http";
import path from "path";
import { of as calculateIpfsHash } from "typestub-ipfs-only-hash";
import tcpPortUsed from "tcp-port-used";
import url from "url";
import querystring from "querystring";

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
    daemonArgs: "--offline",
    extraCommands: ["bootstrap rm --all", "config --json Discovery.MDNS.Enabled false"]
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
    ipfsConfig["Addresses"]["Swarm"] = [`/ip4/0.0.0.0/tcp/${nodeArgs.swarmPort}/ws`];
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

    const gatewayPorts = [13415, 13416, 13417, 13418, 14000, 14002, 14003, 14004, 14005, 14006];

    for (const gatewayPort of gatewayPorts) {
        const gatewayUsed = await tcpPortUsed.check(gatewayPort);
        if (gatewayUsed) {
            throw new Error(`Gateway port ${gatewayPort} is already occupied`);
        }
    }

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
            res.setHeader("etag", sub.updateCid);
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
    const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    const fetchLatestSubplebbit = async () => {
        try {
            return await plebbit.getSubplebbit(signers[0].address);
        } catch (e) {
            console.error("Error fetching latest subplebbit", e, e.details);
            throw e;
        }
    };

    // This gateaway will wait for 11s then respond
    http.createServer(async (req, res) => {
        await new Promise((resolve) => setTimeout(resolve, 11000));
        res.setHeader("Access-Control-Allow-Origin", "*");
        const subRecord = await fetchLatestSubplebbit();
        res.setHeader("x-ipfs-roots", subRecord.updateCid);
        res.setHeader("etag", subRecord.updateCid);

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
        res.setHeader("etag", subRecord.updateCid);

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
        const updateCid = await calculateIpfsHash(JSON.stringify(subplebbitRecordThirtyMinuteOldIpfs));
        res.setHeader("x-ipfs-roots", updateCid);
        res.setHeader("etag", updateCid);

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
        const updateCid = await calculateIpfsHash(JSON.stringify(subplebbitRecordHourOldIpfs));
        res.setHeader("x-ipfs-roots", updateCid);
        res.setHeader("etag", updateCid);

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
        const updateCid = await calculateIpfsHash(JSON.stringify(subplebbitRecordTwoHoursOldIpfs));
        res.setHeader("x-ipfs-roots", updateCid);
        res.setHeader("etag", updateCid);

        res.end(JSON.stringify(subplebbitRecordTwoHoursOldIpfs));
    })
        .listen(14006, hostName)
        .on("error", (err) => {
            throw err;
        });
};

const setupMockDelegatedRouter = async () => {
    // This router will just return the offlineNodeArgs IPFS addresses whenever it's queried

    const routerPorts = [20001];
    for (const routerPort of routerPorts) {
        const routerUsed = await tcpPortUsed.check(routerPort);
        if (routerUsed) {
            throw new Error(`Router port ${routerPort} is already occupied`);
        }
    }

    let providers;
    http.createServer(async (req, res) => {
        console.log("Received a request for mock http router", req.url);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        if (!providers) {
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

            providers = providerList;
        }

        res.end(JSON.stringify(providers));
    })
        .listen(20001, hostName)
        .on("error", (err) => {
            throw err;
        });
};

const setUpMockPubsubServer = async () => {
    const pubsubPorts = [30001];
    for (const pubsubPort of pubsubPorts) {
        const pubsubUsed = await tcpPortUsed.check(pubsubPort);
        if (pubsubUsed) {
            throw new Error(`Pubsub port ${pubsubPort} is already occupied`);
        }
    }

    // Track subscriptions and session attempts
    const subscribedTopics = new Set();
    const topicAttempts = new Map(); // topic -> attempt count
    const activeConnections = new Map(); // topic -> response object

    // Mock pubsub server that will:
    // 1. Fail on first subscribe attempt for each topic
    // 2. Succeed on subsequent attempts
    // 3. Track subscriptions properly
    http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url);
        const pathname = parsedUrl.pathname;
        const query = querystring.parse(parsedUrl.query);

        console.log("Mock pubsub server: Received request", req.url, req.method, req.query);
        // Handle CORS
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "*");
        res.setHeader("Access-Control-Allow-Headers", "*");

        if (req.method === "OPTIONS") {
            res.writeHead(200);
            res.end();
            return;
        }

        // Handle IPFS pubsub subscribe endpoint
        if (pathname === "/api/v0/pubsub/sub" && req.method === "POST") {
            const topic = query.arg;

            // Check if already subscribed to this topic
            if (subscribedTopics.has(topic)) {
                const errorMsg = `Already subscribed to ${topic} with handler`;
                console.log(`Mock pubsub server: Error - ${errorMsg}`);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end(errorMsg);
                return;
            }

            // Track attempts for this topic
            const currentAttempts = topicAttempts.get(topic) || 0;
            topicAttempts.set(topic, currentAttempts + 1);

            console.log(`Mock pubsub server: Subscribe attempt #${currentAttempts + 1} for topic: ${topic}`);

            // First attempt fails, subsequent attempts succeed
            if (currentAttempts === 0) {
                console.log(`Mock pubsub server: First attempt - will fail for topic: ${topic}`);

                // Set headers for streaming response (like real IPFS does)
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Transfer-Encoding": "chunked",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive"
                });

                // Send initial successful response to establish the subscription
                res.write(""); // Empty response to establish connection

                // Store the connection temporarily
                activeConnections.set(topic, res);

                // Track when connection is closed (this is the real "unsubscribe")
                res.on("close", () => {
                    console.log(`Mock pubsub server: Connection closed for topic: ${topic} (unsubscribed)`);
                    subscribedTopics.delete(topic);
                    activeConnections.delete(topic);
                });

                res.on("error", (err) => {
                    console.log(`Mock pubsub server: Connection error for topic: ${topic}`, err);
                    subscribedTopics.delete(topic);
                    activeConnections.delete(topic);
                });

                // After a short delay, trigger an error to test onError callback
                setTimeout(() => {
                    console.log(`Mock pubsub server: Triggering error for topic: ${topic}`);

                    // Strategy 1: Send malformed JSON that will cause parsing errors
                    res.write('{"invalid":"json"data"}');

                    // Strategy 2: After another delay, abruptly close the connection
                    setTimeout(() => {
                        console.log(`Mock pubsub server: Closing connection for topic: ${topic}`);
                        // Don't manually delete from tracking here - let the 'close' event handler do it
                        res.destroy(); // Abruptly close connection - this should trigger onError
                    }, 1000);
                }, 500); // Wait 500ms after subscription is established

                return;
            } else {
                // Subsequent attempts succeed
                console.log(`Mock pubsub server: Retry attempt succeeded for topic: ${topic}`);

                // Set headers for streaming response
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Transfer-Encoding": "chunked",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive"
                });

                // Send initial successful response
                res.write("");

                // Add to subscribed topics only when connection succeeds
                subscribedTopics.add(topic);
                activeConnections.set(topic, res);

                // Track when connection is closed (this is the real "unsubscribe")
                res.on("close", () => {
                    console.log(`Mock pubsub server: Connection closed for topic: ${topic} (unsubscribed)`);
                    subscribedTopics.delete(topic);
                    activeConnections.delete(topic);
                });

                res.on("error", (err) => {
                    console.log(`Mock pubsub server: Connection error for topic: ${topic}`, err);
                    subscribedTopics.delete(topic);
                    activeConnections.delete(topic);
                });

                console.log(`Mock pubsub server: Successfully subscribed to topic: ${topic}`);
                console.log(`Mock pubsub server: Currently subscribed topics:`, Array.from(subscribedTopics));

                // Keep the connection alive for successful subscriptions
                // Real behavior would keep this open for pubsub messages
                return;
            }
        }

        // Handle other IPFS endpoints that might be needed
        if (pathname === "/api/v0/pubsub/pub" && req.method === "POST") {
            const topic = query.arg;
            console.log(`Mock pubsub server: Publish request for topic: ${topic}`);
            // Accept publish requests but don't actually do anything
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end("{}");
            return;
        }

        if (pathname === "/api/v0/pubsub/ls" && req.method === "POST") {
            console.log(`Mock pubsub server: List subscriptions request`);
            console.log(`Mock pubsub server: Currently subscribed topics:`, Array.from(subscribedTopics));
            // Return current subscriptions list
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ Strings: Array.from(subscribedTopics) }));
            return;
        }

        // Return 404 for unhandled endpoints
        res.writeHead(404);
        res.end("Not Found");
    })
        .listen(30001, hostName)
        .on("error", (err) => {
            console.error("Mock pubsub server error:", err);
        });

    console.log(`Mock pubsub retry-behavior server listening on port 30001`);
    console.log(`Mock pubsub server: This server fails on first subscribe attempt, succeeds on retries`);
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

    await setUpMockPubsubServer();

    await import("./pubsub-mock-server.js");

    if (process.env["START_RPC_SERVER"] === "1") {
        // run RPC server here
        // This server will create subs and interact with them
        const plebbitWebSocketServer = await PlebbitWsServer.PlebbitWsServer({ port: rpcPort, authKey: rpcAuthKey });

        plebbitWebSocketServer._initPlebbit(await mockRpcServerPlebbit({ dataPath: path.join(process.cwd(), ".plebbit-rpc-server") }));
        plebbitWebSocketServer._createPlebbitInstanceFromSetSettings = async (newOptions) =>
            mockRpcServerPlebbit({ dataPath: path.join(process.cwd(), ".plebbit-rpc-server"), ...newOptions });
        mockRpcServerForTests(plebbitWebSocketServer);

        // This server will fetch subs remotely

        const remotePort = rpcPort + 1;
        const plebbitWebSocketRemoteServer = await PlebbitWsServer.PlebbitWsServer({
            port: remotePort,
            authKey: rpcAuthKey
        });
        plebbitWebSocketRemoteServer._initPlebbit(
            await mockRpcServerPlebbit({ dataPath: path.join(process.cwd(), ".plebbit-rpc-server-remote") })
        );
        plebbitWebSocketRemoteServer._createPlebbitInstanceFromSetSettings = async (newOptions) =>
            mockRpcServerPlebbit({ dataPath: path.join(process.cwd(), ".plebbit-rpc-server"), ...newOptions });

        mockRpcServerForTests(plebbitWebSocketRemoteServer);

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
