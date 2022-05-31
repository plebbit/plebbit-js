// use this file to launch an ipfs node and some subplebbits
// that can be used during node and browser tests
const getIpfsPath = require("go-ipfs").path;
const { execSync, exec } = require("child_process");
const ipfsPath = getIpfsPath();

// use the test server with the compiled version (dist/node)
// with plain Javascript and commonjs require (not import)
// in order to test the repo like a real user would
const Plebbit = require("../dist/node");
const signers = require("./fixtures/signers");
const path = require("path");
const http = require("http");
const { Challenge, CHALLENGE_TYPES } = require("../dist/node/challenge");
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

const clientNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-client"),
    apiPort: 5003,
    gatewayPort: 8082,
    daemonArgs: "--enable-pubsub-experiment",
    extraCommands: ["bootstrap rm --all"]
};

const startIpfsNodes = async () => {
    await Promise.all(
        [offlineNodeArgs, ipfsNodeArgs, clientNodeArgs].map(async (nodeArgs) => {
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

const syncInterval = 100;
const databaseConfig = {
    client: "better-sqlite3", // or 'better-sqlite3'
    connection: {
        filename: ":memory:"
    },
    useNullAsDefault: true
};

const startMathCliSubplebbit = async () => {
    const plebbit = await Plebbit({
        ipfsHttpClientOptions: `http://localhost:${offlineNodeArgs.apiPort}/api/v0`,
        pubsubHttpClientOptions: {
            url: `http://localhost:${ipfsNodeArgs.apiPort}/api/v0`,
            agent: new http.Agent({ keepAlive: true, maxSockets: Infinity })
        }
    });
    const signer = await plebbit.createSigner(signers[1]);
    const subplebbit = await plebbit.createSubplebbit({ signer: signer, database: databaseConfig });
    await subplebbit.setProvideCaptchaCallback((challengeRequestMessage) => {
        // Expected return is:
        // Challenge[], reason for skipping captcha (if it's skipped by nullifying Challenge[])
        return [[new Challenge({ challenge: "1+1=?", type: CHALLENGE_TYPES.TEXT })]];
    });

    subplebbit.setValidateCaptchaAnswerCallback((challengeAnswerMessage) => {
        const challengeSuccess = challengeAnswerMessage.challengeAnswers[0] === "2";
        const challengeErrors = challengeSuccess ? undefined : ["Result of math expression is incorrect"];
        return [challengeSuccess, challengeErrors];
    });
    await subplebbit.start(syncInterval);
    return subplebbit;
};

const startImageCaptchaSubplebbit = async () => {
    const plebbit = await Plebbit({
        ipfsHttpClientOptions: `http://localhost:${offlineNodeArgs.apiPort}/api/v0`,
        pubsubHttpClientOptions: {
            url: `http://localhost:${ipfsNodeArgs.apiPort}/api/v0`,
            agent: new http.Agent({ keepAlive: true, maxSockets: Infinity })
        }
    });
    const signer = await plebbit.createSigner(signers[2]);
    const subplebbit = await plebbit.createSubplebbit({ signer: signer, database: databaseConfig });

    // Image captcha are default
    await subplebbit.start(syncInterval);
    subplebbit.setValidateCaptchaAnswerCallback((challengeAnswerMessage) => {
        const challengeSuccess = challengeAnswerMessage.challengeAnswers[0] === "1234";
        const challengeErrors = challengeSuccess ? undefined : ["User answered image captcha incorrectly"];
        return [challengeSuccess, challengeErrors];
    });
    return subplebbit;
};

(async () => {
    // do more stuff here, like start some subplebbits
    await startIpfsNodes();
    const plebbit = await Plebbit({
        ipfsHttpClientOptions: `http://localhost:${offlineNodeArgs.apiPort}/api/v0`,
        pubsubHttpClientOptions: {
            url: `http://localhost:${ipfsNodeArgs.apiPort}/api/v0`,
            agent: new http.Agent({ keepAlive: true, maxSockets: Infinity })
        }
    });
    const signer = await plebbit.createSigner(signers[0]);
    const subplebbit = await plebbit.createSubplebbit({ signer: signer, database: databaseConfig });
    await subplebbit.setProvideCaptchaCallback(() => [null, null]);

    subplebbit.start(syncInterval);
    const imageSubplebbit = await startImageCaptchaSubplebbit();
    const mathSubplebbit = await startMathCliSubplebbit();

    console.log("All subplebbits and ipfs nodes have been started. You are ready to run the tests");
})();
