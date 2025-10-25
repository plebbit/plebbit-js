import { expect } from "chai";
import {
    publishRandomPost,
    mockPlebbit,
    createSubWithNoChallenge,
    publishWithExpectedResult,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    itSkipIfRpc,
    itIfRpc,
    resolveWhenConditionIsTrue,
    waitTillPostInSubplebbitPages,
    mockPlebbitV2,
    iterateThroughPagesToFindCommentInParentPagesInstance
} from "../../../dist/node/test/test-util.js";
import path from "path";
import fs from "fs";
import signers from "../../fixtures/signers.js";
import { v4 as uuidV4 } from "uuid";

describe(`subplebbit.start`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });
    });
    after(async () => await plebbit.destroy());

    it(`Started Sub can receive publications sequentially`, async () => {
        await publishRandomPost(subplebbit.address, plebbit);
        await publishRandomPost(subplebbit.address, plebbit);
        await publishRandomPost(subplebbit.address, plebbit);
    });

    it(`Started Sub can receive publications parallelly`, async () => {
        await Promise.all(new Array(3).fill(null).map(() => publishRandomPost(subplebbit.address, plebbit)));
    });

    it(`Can start a sub after stopping it`, async () => {
        const newSub = await createSubWithNoChallenge({}, plebbit);
        await newSub.start();
        await resolveWhenConditionIsTrue({ toUpdate: newSub, predicate: () => typeof newSub.updatedAt === "number" });
        await publishRandomPost(newSub.address, plebbit);
        await newSub.stop();
        await newSub.start();
        await publishRandomPost(newSub.address, plebbit);
        await newSub.stop();
    });

    itSkipIfRpc(`Sub can receive publications after pubsub topic subscription disconnects`, async () => {
        // There are cases where ipfs node can fail and be restarted
        // When that happens, the subscription to subplebbit.pubsubTopic will not be restored
        // The restoration of subscription should happen within the sync loop of Subplebbit
        await subplebbit._plebbit._clientsManager
            .getDefaultKuboPubsubClient()
            ._client.pubsub.unsubscribe(subplebbit.pubsubTopic, subplebbit.handleChallengeExchange);
        const listedTopics = async () => await subplebbit._plebbit._clientsManager.getDefaultKuboPubsubClient()._client.pubsub.ls();
        expect(await listedTopics()).to.not.include(subplebbit.address);

        await new Promise((resolve) => setTimeout(resolve, subplebbit._plebbit.publishInterval * 2));
        expect(await listedTopics()).to.include(subplebbit.address);

        await publishRandomPost(subplebbit.address, plebbit); // Should receive publication since subscription to pubsub topic has been restored
    });

    it(`Subplebbit.start() will publish an update regardless if there's a new data`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });
        await sub.stop();

        const sub2 = await plebbit.createSubplebbit({ address: sub.address });
        expect(sub2.updatedAt).to.equal(sub.updatedAt);
        await sub2.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub2, predicate: () => sub2.updatedAt !== sub.updatedAt });
        expect(sub2.updatedAt).to.not.equal(sub.updatedAt);
        await sub2.delete();
    });

    itSkipIfRpc(`subplebbit.start() recovers if the sync loop crashes once`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });
        const originalFunc = sub._getDbInternalState.bind(sub);
        sub._getDbInternalState = async () => {
            throw Error("Mocking a failure in getting db internal state in tests");
        };
        publishRandomPost(sub.address, plebbit);
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => sub.startedState === "failed", eventName: "startedstatechange" });
        expect(sub.startedState).to.equal("failed");

        sub._getDbInternalState = originalFunc;

        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => sub.startedState !== "failed", eventName: "startedstatechange" });
        const post = await publishRandomPost(sub.address, plebbit);
        await waitTillPostInSubplebbitPages(post, plebbit);
        await sub.delete();
    });

    itSkipIfRpc(`subplebbit.start() recovers if kubo API call  fails`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });
        const ipfsClient = sub._clientsManager.getDefaultKuboRpcClient()._client;

        const originalFunc = ipfsClient.files.write;
        ipfsClient.files.write = () => {
            throw Error("Mocking a failure in copying MFS file in tests");
        };
        publishRandomPost(sub.address, plebbit);

        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => sub.startedState === "failed", eventName: "startedstatechange" });
        expect(sub.startedState).to.equal("failed");

        ipfsClient.files.write = originalFunc;

        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => sub.startedState !== "failed", eventName: "startedstatechange" });
        const post = await publishRandomPost(sub.address, plebbit);
        await waitTillPostInSubplebbitPages(post, plebbit);
        await sub.delete();
    });
});

describe(`subplebbit.started`, async () => {
    let plebbit, sub;
    before(async () => {
        plebbit = await mockPlebbit();
        sub = await createSubWithNoChallenge({}, plebbit);
    });

    after(async () => {
        await sub.delete();
    });

    it(`subplebbit.started is false by default`, async () => {
        expect(sub.started).to.be.false;
    });

    it(`subplebbit.started is true after start()`, async () => {
        await sub.start();
        expect(sub.started).to.be.true;
    });

    it(`subplebbit.started is true for other instances`, async () => {
        const anotherSub = await plebbit.createSubplebbit({ address: sub.address });
        expect(anotherSub.started).to.be.true;
    });

    it(`subplebbit.started is false after stopping`, async () => {
        await sub.stop();
        expect(sub.started).to.be.false;
    });

    it(`subplebbit.started is false for other instances after stopping`, async () => {
        const anotherSub = await plebbit.createSubplebbit({ address: sub.address });
        expect(anotherSub.started).to.be.false;
    });

    it(`subplebbit.started is false after deleting subplebbit`, async () => {
        const anotherSub = await createSubWithNoChallenge({}, plebbit);
        await anotherSub.start();
        expect(anotherSub.started).to.be.true;
        await resolveWhenConditionIsTrue({ toUpdate: anotherSub, predicate: () => typeof anotherSub.updatedAt === "number" });
        await anotherSub.delete();
        expect(anotherSub.started).to.be.false;
    });
});
describe(`Start lock`, async () => {
    let plebbit, dataPath;
    before(async () => {
        plebbit = await mockPlebbit();
        if (Object.keys(plebbit.clients.plebbitRpcClients).length > 0) {
            dataPath = path.join(process.env.PWD, ".plebbit-rpc-server");
        } else dataPath = plebbit.dataPath;
        expect(dataPath).to.be.a("string");
    });
    it(`subplebbit.start throws if sub is already started (same Subplebbit instance)`, async () => {
        const subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
        expect(subplebbit.state).to.equal("started");
        try {
            await subplebbit.start();
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_SUB_ALREADY_STARTED");
        }
        await subplebbit.delete();
    });

    itSkipIfRpc(`subplebbit.start throws if sub is started by another Subplebbit instance`, async () => {
        // The reason why we skip it for RPC because RPC client can instantiate multiple Subplebbit instances to retrieve events from RPC server
        const subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
        expect(subplebbit.state).to.equal("started");
        const sameSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
        expect(sameSubplebbit.state).to.equal("stopped");

        try {
            await sameSubplebbit.start();
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_SUB_ALREADY_STARTED");
        }
        await subplebbit.stop();
    });

    itSkipIfRpc(`Fail to start subplebbit if start lock is present`, async () => {
        const subSigner = await plebbit.createSigner();
        const lockPath = path.join(dataPath, "subplebbits", `${subSigner.address}.start.lock`);
        const sub = await plebbit.createSubplebbit({ signer: subSigner });
        const sameSub = await plebbit.createSubplebbit({ address: sub.address });
        sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => fs.existsSync(lockPath) });

        try {
            await sameSub.start();
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_SUB_ALREADY_STARTED");
        }
        await sub.stop();
    });

    it(`Can start subplebbit as soon as start lock is unlocked`, async () => {
        const subSigner = await plebbit.createSigner();
        const lockPath = path.join(dataPath, "subplebbits", `${subSigner.address}.start.lock`);
        expect(fs.existsSync(lockPath)).to.be.false;
        const sub = await plebbit.createSubplebbit({ signer: subSigner });
        await sub.start();
        expect(fs.existsSync(lockPath)).to.be.true;
        const lockFileRemovedPromise = new Promise((resolve) =>
            fs.watchFile(lockPath, (curr, prev) => {
                if (!fs.existsSync(lockPath)) resolve();
            })
        );
        await Promise.all([sub.stop(), lockFileRemovedPromise]);
        expect(fs.existsSync(lockPath)).to.be.false;

        await sub.start();
        await sub.delete();
    });

    itSkipIfRpc(
        `subplebbit.start will throw if user attempted to start the same sub concurrently through different instances`,
        async () => {
            const sub = await plebbit.createSubplebbit();
            const sameSub = await plebbit.createSubplebbit({ address: sub.address });

            try {
                await Promise.all([sub.start(), sameSub.start()]);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_SUB_ALREADY_STARTED");
            }
            if (sub.state === "started") await sub.stop();
            if (sameSub.state === "started") await sameSub.stop();
        }
    );

    it(`Can start subplebbit if start lock is stale (10s)`, async () => {
        // Lock is considered stale if lock has not been updated in 10000 ms (10s)
        const sub = await createSubWithNoChallenge({}, plebbit);

        const lockPath = path.join(dataPath, "subplebbits", `${sub.address}.start.lock`);
        await fs.promises.mkdir(lockPath); // Artifically create a start lock

        try {
            await sub.start();
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.be.oneOf(["ERR_SUB_ALREADY_STARTED", "ERR_CAN_NOT_LOAD_DB_IF_LOCAL_SUB_ALREADY_STARTED_IN_ANOTHER_PROCESS"]);
        }
        await new Promise((resolve) => setTimeout(resolve, 11000)); // Wait for 11s for lock to be considered stale
        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });
        const post = await publishRandomPost(sub.address, plebbit);
        await waitTillPostInSubplebbitPages(post, plebbit);
        await sub.delete();
    });

    itSkipIfRpc(`Subplebbit states are reset if subplebbit.start() throws`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);

        sub._repinCommentsIPFSIfNeeded = () => {
            throw Error("Mocking a failure in repinning comments in tests");
        };

        try {
            await sub.start();
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.message).to.equal("Mocking a failure in repinning comments in tests");
        }

        expect(sub.state).to.equal("stopped");
        expect(sub.started).to.be.false;
        expect(sub.startedState).to.equal("stopped");
    });

    itIfRpc(`rpcLocalSub.start() will throw if there is another instance that's started`, async () => {
        const sub1 = await createSubWithNoChallenge({}, plebbit);

        await sub1.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub1, predicate: () => typeof sub1.updatedAt === "number" });

        const sub2 = await plebbit.createSubplebbit({ address: sub1.address });
        try {
            await sub2.start(); // should not fail
        } catch (e) {
            expect(e.code).to.equal("ERR_SUB_ALREADY_STARTED_IN_SAME_PLEBBIT_INSTANCE");
        }
    });

    itIfRpc(`rpcLocalSub.update() will receive started updates if there is another instance that's started`, async () => {
        const sub1 = await createSubWithNoChallenge({}, plebbit);

        await sub1.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub1, predicate: () => typeof sub1.updatedAt === "number" });

        const sub2 = await plebbit.createSubplebbit({ address: sub1.address });
        await sub2.update(); // should not fail

        let receivedChallengeRequest = false;
        sub2.on("challengerequest", () => {
            receivedChallengeRequest = true;
        });

        let receivedChallengeVerification = false;

        sub2.on("challengeverification", () => {
            receivedChallengeVerification = true;
        });

        await publishRandomPost(sub1.address, plebbit, {});
        publishRandomPost(sub1.address, plebbit, {});

        await new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval * 2));

        await sub1.stop();
        // No need to stop sub2, since it will receive the stop update and unsubscribe by itself

        expect(receivedChallengeRequest).to.be.true;
        expect(receivedChallengeVerification).to.be.true;
        expect(sub1.updatedAt).to.equal(sub2.updatedAt);
    });

    itIfRpc(`rpcLocalSub.stop() will stop updating if it's an updating instance, even if there are other started instances`, async () => {
        const startedSub = await createSubWithNoChallenge({}, plebbit);

        await startedSub.start();
        await new Promise((resolve) => startedSub.once("update", resolve));
        expect(startedSub.started).to.be.true;

        const updatingSub = await plebbit.createSubplebbit({ address: startedSub.address });
        expect(updatingSub.started).to.be.true;
        await updatingSub.update();
        await resolveWhenConditionIsTrue({ toUpdate: updatingSub, predicate: () => updatingSub.updatedAt });
        await updatingSub.stop(); // This should stop sub1 and sub2

        await new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval * 2));
        expect(startedSub.started).to.be.true;
        expect(startedSub.startedState).to.not.equal("stopped");
        expect(startedSub.state).to.not.equal("stopped");

        expect(updatingSub.started).to.be.true; // the sub is still running in another instance
        expect(updatingSub.startedState).to.equal("stopped"); // the local started state got reset to stopped
        expect(updatingSub.state).to.equal("stopped");
        expect(updatingSub.updatingState).to.equal("stopped");
    });

    itIfRpc(`rpcLocalSub.delete() will delete the sub, even if rpcLocalSub wasn't the first instance to call start()`, async () => {
        const startedSub = await createSubWithNoChallenge({}, plebbit);
        await startedSub.start();
        expect(startedSub.started).to.be.true;

        await resolveWhenConditionIsTrue({ toUpdate: startedSub, predicate: () => typeof startedSub.updatedAt === "number" });

        const subToDelete = await plebbit.createSubplebbit({ address: startedSub.address });
        expect(subToDelete.started).to.be.true;

        await subToDelete.delete();

        await new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval * 2));

        const localSubs = plebbit.subplebbits;
        expect(localSubs).to.not.include(startedSub.address);

        for (const sub of [startedSub, subToDelete]) {
            expect(sub.started).to.be.false;
            expect(sub.startedState).to.equal("stopped");
            expect(sub.state).to.equal("stopped");
        }
    });

    itSkipIfRpc(`subplebbit.stop() should remove stale cids and MFS paths from kubo node`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });
        await publishRandomPost(sub.address, plebbit);
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => sub._cidsToUnPin.size > 0 });
        await sub.stop();
        const recreatedSub = await plebbit.createSubplebbit({ address: sub.address });
        expect(recreatedSub._cidsToUnPin.size).to.equal(0);
        expect(recreatedSub._mfsPathsToRemove.size).to.equal(0);
    });
});

describe(`Publish loop resiliency`, async () => {
    let plebbit, subplebbit, remotePlebbit;
    before(async () => {
        plebbit = await mockPlebbitV2({ stubStorage: false });
        remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" });
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
        await remotePlebbit.destroy();
    });

    it(`Subplebbit can publish a new IPNS record with one of its comments having a valid ENS author address`, async () => {
        const mockPost = await plebbit.createComment({
            author: { address: "plebbit.eth" },
            signer: signers[6],
            content: `Mock post - ${Date.now()}`,
            title: "Mock post title " + Date.now(),
            subplebbitAddress: subplebbit.address
        });

        await publishWithExpectedResult(mockPost, true);

        await waitTillPostInSubplebbitPages(mockPost, remotePlebbit);

        const loadedSub = await remotePlebbit.getSubplebbit(subplebbit.address); // If it can load, then it has a valid signature

        const loadedPost = await iterateThroughPagesToFindCommentInParentPagesInstance(mockPost.cid, loadedSub.posts);

        expect(loadedPost.cid).to.equal(mockPost.cid);
    });

    it(`Subplebbit isn't publishing updates needlessly`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue({ toUpdate: sub, predicate: () => typeof sub.updatedAt === "number" });

        // there is no need to publish updates here, because we're not publishing new props or publications
        let triggerdUpdate = false;
        sub.on("update", () => {
            triggerdUpdate = true;
        });

        await new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval * 5));
        expect(triggerdUpdate).to.be.false; // Subplebbit should not publish update needlesly
        await sub.delete();
    });

    itSkipIfRpc(`Subplebbit can still publish an IPNS, even if its subplebbit-address text record resolves to null`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.edit({ address: `sub-does-not-exist-${uuidV4()}.eth` });
        sub.shouldResolveDomainForVerification = () => true;
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        await sub.delete();
    });
    itSkipIfRpc(`Subplebbit can still publish an IPNS, even if all domain resolvers throw an error`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        sub._clientsManager._resolveTextRecordSingleChainProvider = () => {
            return { error: new Error("test error") };
        };
        await sub.edit({ address: `sub-does-not-exist-${uuidV4()}.eth` });
        sub.shouldResolveDomainForVerification = () => true;
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        await sub.delete();
    });

    it(`A subplebbit doesn't resolve domain when verifying new IPNS record before publishing`);

    itSkipIfRpc(`Subplebbit can publish a new IPNS record with one of its comments having invalid ENS author address`, async () => {
        const mockPost = await plebbit.createComment({
            author: { address: "plebbit.eth" },
            signer: signers[7], // Wrong signer
            title: "Test publishing with invalid ENS " + Date.now(),
            subplebbitAddress: subplebbit.address
        });

        subplebbit.on("error", (err) => {
            console.log(err);
        });
        subplebbit._plebbit.resolveAuthorAddresses = false; // So the post gets accepted

        await publishWithExpectedResult(mockPost, true);
        subplebbit._plebbit.resolveAuthorAddresses = true;

        expect(mockPost.author.address).to.equal("plebbit.eth");

        const post = await publishRandomPost(subplebbit.address, plebbit); // Stimulate an update
        await waitTillPostInSubplebbitPages(post, plebbit);

        for (const resolveAuthorAddresses of [true, false]) {
            const remotePlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient({
                plebbitOptions: { resolveAuthorAddresses, validatePages: true }
            }); // we need to enable validatePages so subplebbit.posts can be validated and override author.address
            const loadedSub = await remotePlebbit.getSubplebbit(subplebbit.address);
            const mockPostInPage = loadedSub.posts.pages.hot.comments.find((comment) => comment.cid === mockPost.cid);
            // if we're resolving author address, plebbit-js should pick up that it's pointing to the wrong signer address
            // once it does that plebbit-js override author.address to point to signer.address
            if (resolveAuthorAddresses) expect(mockPostInPage.author.address).to.equal(mockPost.signer.address);
            else expect(mockPostInPage.author.address).to.equal("plebbit.eth");
        }
    });
});
