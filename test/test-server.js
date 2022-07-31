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

const { getDebugLevels } = require("../dist/node/util");
const { generateMockComment, generateMockVote, generateMockPost } = require("../dist/node/test-util");

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

const onlineNodeArgs = {
    dir: path.join(process.cwd(), ".test-ipfs-online"),
    apiPort: 5003,
    gatewayPort: 8082,
    daemonArgs: "--enable-pubsub-experiment",
    extraCommands: []
};

const debugs = getDebugLevels("test-server");

const numOfCommentsToPublish = 6;
const votesPerCommentToPublish = 6;

const syncInterval = 100;
const databaseConfig = {
    client: "sqlite3",
    connection: {
        filename: ":memory:"
    },
    useNullAsDefault: true
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

const mockPlebbit = async () => {
    const plebbit = await Plebbit({
        ipfsHttpClientOptions: "http://localhost:5001/api/v0",
        pubsubHttpClientOptions: `http://localhost:5002/api/v0`
    });
    plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
        if (authorAddress === "plebbit.eth") return signers[6].address;
        else if (authorAddress === "testgibbreish.eth") return undefined;
        return authorAddress;
    };
    plebbit.resolver.resolveSubplebbitAddressIfNeeded = async (subplebbitAddress) => {
        if (subplebbitAddress === "plebbit.eth") return signers[3].address;
        else if (plebbit.resolver.isDomain(subplebbitAddress)) throw new Error(`${subplebbitAddress} has no subplebbit-address`);
        return subplebbitAddress;
    };
    return plebbit;
};

const startMathCliSubplebbit = async () => {
    const plebbit = await mockPlebbit();

    const signer = await plebbit.createSigner(signers[1]);
    const subplebbit = await plebbit.createSubplebbit({ signer: signer, database: databaseConfig });
    subplebbit.setProvideCaptchaCallback((challengeRequestMessage) => {
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
    const plebbit = await mockPlebbit();

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

const startEnsSubplebbit = async () => {
    const plebbit = await mockPlebbit();
    const signer = await plebbit.createSigner(signers[3]);
    const subplebbit = await plebbit.createSubplebbit({ signer: signer, database: databaseConfig });
    await subplebbit.start(syncInterval);
    await subplebbit.edit({ address: "plebbit.eth" });
};

const publishComments = async (parentComments, subplebbit) => {
    const comments = [];
    // Publish comments for specific use in tests, whether for upvoting, downvoting or editing
    // Use comment.content as a flag
    if (!parentComments)
        await Promise.all(
            new Array(numOfCommentsToPublish).fill(null).map(async () => {
                const post = await subplebbit._addPublicationToDb(
                    await generateMockPost(subplebbit.address, subplebbit.plebbit, signers[0], true)
                );
                if (post) comments.push(post); // There are cases where posts fail to get published
            })
        );
    else
        await Promise.all(
            parentComments.map(
                async (parentComment) =>
                    await Promise.all(
                        new Array(numOfCommentsToPublish).fill(null).map(async () => {
                            const comment = await subplebbit._addPublicationToDb(
                                await generateMockComment(parentComment, subplebbit.plebbit, signers[0], true)
                            );
                            if (comment) comments.push(comment);
                        })
                    )
            )
        );
    return comments;
};

const publishVotes = async (comments, subplebbit) => {
    const votes = [];
    await Promise.all(
        comments.map(async (comment) => {
            return await Promise.all(
                new Array(votesPerCommentToPublish).fill(null).map(async (_, i) => {
                    let vote = await generateMockVote(
                        comment,
                        Math.random() > 0.5 ? 1 : -1,
                        subplebbit.plebbit,
                        signers[i % signers.length]
                    );
                    vote = await subplebbit._addPublicationToDb(vote);
                    if (vote) votes.push(vote);
                })
            );
        })
    );

    debugs.DEBUG(`${votes.length} votes for ${comments.length} ${comments[0].depth === 0 ? "posts" : "replies"} have been published`);
    return votes;
};

const populateSubplebbit = async (subplebbit) => {
    await subplebbit.edit({
        roles: { [signers[1].address]: { role: "owner" }, [signers[2].address]: { role: "admin" }, [signers[3].address]: { role: "mod" } }
    });
    posts = await publishComments(undefined, subplebbit); // If no comment[] is provided, we publish posts
    debugs.DEBUG(`Have successfully published ${posts.length} posts`);
    [replies] = await Promise.all([publishComments([posts[0]], subplebbit), publishVotes(posts, subplebbit)]);
    debugs.DEBUG(`Have sucessfully published ${replies.length} replies`);
    await publishVotes(replies, subplebbit);
};

(async () => {
    // do more stuff here, like start some subplebbits
    await startIpfsNodes();
    const plebbit = await mockPlebbit();

    const signer = await plebbit.createSigner(signers[0]);
    const subplebbit = await plebbit.createSubplebbit({ signer: signer, database: databaseConfig });
    subplebbit.setProvideCaptchaCallback(() => [null, null]);

    await subplebbit.start(syncInterval);
    console.time("populate");
    const [imageSubplebbit, mathSubplebbit] = await Promise.all([
        startImageCaptchaSubplebbit(),
        startMathCliSubplebbit(),
        startEnsSubplebbit(),
        populateSubplebbit(subplebbit)
    ]);
    console.timeEnd("populate");

    debugs.INFO("All subplebbits and ipfs nodes have been started. You are ready to run the tests");

    // create a test server to be able to use npm module 'wait-on'
    // to know when the test server is finished getting ready
    // and able to start the automated tests
    require("http")
        .createServer((req, res) => res.end("test server ready"))
        .listen(14952);
})();
