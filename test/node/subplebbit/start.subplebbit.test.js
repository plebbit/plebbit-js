import {
    publishRandomPost,
    mockPlebbit,
    createSubWithNoChallenge,
    publishWithExpectedResult,
    mockRemotePlebbitIpfsOnly,
    itSkipIfRpc,
    itIfRpc,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util";
import { messages } from "../../../dist/node/errors";
import path from "path";
import fs from "fs";
import signers from "../../fixtures/signers";
import { subplebbitVerificationCache } from "../../../dist/node/constants";
import { v4 as uuidV4 } from "uuid";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe(`subplebbit.start`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number");
    });
    after(async () => subplebbit.stop());

    it(`Started Sub can receive publications sequentially`, async () => {
        await publishRandomPost(subplebbit.address, plebbit, {}, false);
        await publishRandomPost(subplebbit.address, plebbit, {}, false);
        await publishRandomPost(subplebbit.address, plebbit, {}, false);
    });

    it(`Started Sub can receive publications parallelly`, async () => {
        await Promise.all(new Array(3).fill(null).map(() => publishRandomPost(subplebbit.address, plebbit, {}, false)));
    });

    it(`Can start a sub after stopping it`, async () => {
        const newSub = await createSubWithNoChallenge({}, plebbit);
        await newSub.start();
        await resolveWhenConditionIsTrue(newSub, () => typeof newSub.updatedAt === "number");
        await publishRandomPost(newSub.address, plebbit, {}, false);
        await newSub.stop();
        await newSub.start();
        await publishRandomPost(newSub.address, plebbit, {}, false);
        await newSub.stop();
    });

    itSkipIfRpc(`Sub can receive publications after pubsub topic subscription disconnects`, async () => {
        // There are cases where ipfs node can fail and be restarted
        // When that happens, the subscription to subplebbit.pubsubTopic will not be restored
        // The restoration of subscription should happen within the sync loop of Subplebbit
        await subplebbit.plebbit._clientsManager
            .getDefaultPubsub()
            ._client.pubsub.unsubscribe(subplebbit.pubsubTopic, subplebbit.handleChallengeExchange);
        const listedTopics = async () => await subplebbit.plebbit._clientsManager.getDefaultPubsub()._client.pubsub.ls();
        expect(await listedTopics()).to.not.include(subplebbit.address);

        await new Promise((resolve) => setTimeout(resolve, subplebbit.plebbit.publishInterval * 2));
        expect(await listedTopics()).to.include(subplebbit.address);

        await publishRandomPost(subplebbit.address, plebbit, {}, false); // Should receive publication since subscription to pubsub topic has been restored
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
        await resolveWhenConditionIsTrue(anotherSub, () => typeof anotherSub.updatedAt === "number");
        await anotherSub.delete();
        expect(anotherSub.started).to.be.false;
    });
});
describe(`Start lock`, async () => {
    let plebbit, dataPath;
    before(async () => {
        plebbit = await mockPlebbit();
        if (plebbit.plebbitRpcClient) {
            const rpcSettings = await plebbit.plebbitRpcClient.getSettings();
            dataPath = rpcSettings.plebbitOptions.dataPath;
        } else dataPath = plebbit.dataPath;
    });
    it(`subplebbit.start throws if sub is already started (same Subplebbit instance)`, async () => {
        const subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
        await assert.isRejected(subplebbit.start(), messages.ERR_SUB_ALREADY_STARTED);
        await subplebbit.stop();
    });

    itSkipIfRpc(`subplebbit.start throws if sub is started by another Subplebbit instance`, async () => {
        const subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
        expect(subplebbit.state).to.equal("started");
        const sameSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
        expect(sameSubplebbit.state).to.equal("stopped");
        await assert.isRejected(sameSubplebbit.start(), messages.ERR_SUB_ALREADY_STARTED);
        await subplebbit.stop();
    });

    itSkipIfRpc(`Fail to start subplebbit if start lock is present`, async () => {
        const subSigner = await plebbit.createSigner();
        const lockPath = path.join(dataPath, "subplebbits", `${subSigner.address}.start.lock`);
        const sub = await plebbit.createSubplebbit({ signer: subSigner });
        const sameSub = await plebbit.createSubplebbit({ address: sub.address });
        sub.start();
        await resolveWhenConditionIsTrue(sub, () => fs.existsSync(lockPath));
        await assert.isRejected(sameSub.start(), messages.ERR_SUB_ALREADY_STARTED);
        await sub.stop();
    });

    it(`Can start subplebbit as soon as start lock is unlocked`, async () => {
        const subSigner = await plebbit.createSigner();
        const lockPath = path.join(dataPath, "subplebbits", `${subSigner.address}.start.lock`);
        const sub = await plebbit.createSubplebbit({ signer: subSigner });
        await sub.start();
        sub.stop();
        await new Promise((resolve) =>
            fs.watchFile(lockPath, (curr, prev) => {
                if (!fs.existsSync(lockPath)) resolve();
            })
        );
        await assert.isFulfilled(sub.start());
        await sub.stop();
    });

    itSkipIfRpc(
        `subplebbit.start will throw if user attempted to start the same sub concurrently through different instances`,
        async () => {
            const sub = await plebbit.createSubplebbit();
            const sameSub = await plebbit.createSubplebbit({ address: sub.address });

            await assert.isRejected(Promise.all([sub.start(), sameSub.start()]), messages.ERR_SUB_ALREADY_STARTED);
            if (sub.state === "started") await sub.stop();
            if (sameSub.state === "started") await sameSub.stop();
        }
    );

    it(`Can start subplebbit if start lock is stale (10s)`, async () => {
        // Lock is considered stale if lock has not been updated in 10000 ms (10s)
        const sub = await plebbit.createSubplebbit();

        const lockPath = path.join(dataPath, "subplebbits", `${sub.address}.start.lock`);
        await fs.promises.mkdir(lockPath); // Artifically create a start lock

        await assert.isRejected(sub.start(), messages.ERR_SUB_ALREADY_STARTED);
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10s
        await assert.isFulfilled(sub.start());
        await sub.stop();
    });

    itIfRpc(`rpcLocalSub.start() will receive started updates if there is another instance that's started`, async () => {
        const sub1 = await createSubWithNoChallenge({}, plebbit);

        await sub1.start();
        await resolveWhenConditionIsTrue(sub1, () => typeof sub1.updatedAt === "number");

        const sub2 = await plebbit.createSubplebbit({ address: sub1.address });
        await sub2.start(); // should not fail

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

    itIfRpc(
        `rpcLocalSub.stop() will stop all the sub instances from running, even if rpcLocalSub wasn't the first instance to call start()`,
        async () => {
            const sub1 = await createSubWithNoChallenge({}, plebbit);

            await sub1.start();
            await new Promise((resolve) => sub1.once("update", resolve));
            expect(sub1.started).to.be.true;

            const sub2 = await plebbit.createSubplebbit({ address: sub1.address });
            expect(sub2.started).to.be.true;
            await sub2.start();
            await sub2.stop(); // This should stop sub1 and sub2

            await new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval * 2));
            for (const sub of [sub1, sub2]) {
                expect(sub.started).to.be.false;
                expect(sub.startedState).to.equal("stopped");
                expect(sub.state).to.equal("stopped");
            }
        }
    );

    itIfRpc(`rpcLocalSub.delete() will delete the sub, even if rpcLocalSub wasn't the first instance to call start()`, async () => {
        const sub1 = await createSubWithNoChallenge({}, plebbit);
        await sub1.start();
        expect(sub1.started).to.be.true;

        await resolveWhenConditionIsTrue(sub1, () => typeof sub1.updatedAt === "number");

        const sub2 = await plebbit.createSubplebbit({ address: sub1.address });
        expect(sub2.started).to.be.true;

        await sub2.delete();

        await new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval * 2));

        const localSubs = await plebbit.listSubplebbits();
        expect(localSubs).to.not.include(sub1.address);

        for (const sub of [sub1, sub2]) {
            expect(sub.started).to.be.false;
            expect(sub.startedState).to.equal("stopped");
            expect(sub.state).to.equal("stopped");
        }
    });
});

describe(`Publish loop resiliency`, async () => {
    let plebbit, subplebbit, remotePlebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        remotePlebbit = await mockRemotePlebbitIpfsOnly();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        if (!subplebbit.updatedAt) await new Promise((resolve) => subplebbit.once("update", resolve));
    });

    after(async () => {
        await subplebbit.delete();
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

        let updated = false;
        setTimeout(() => {
            if (!updated) assert.fail("Subplebbit failed to publish a new IPNS record with ENS author address");
        }, 60000);
        await new Promise((resolve) => subplebbit.once("update", () => (updated = true) && resolve(1)));
        const loadedSub = await remotePlebbit.getSubplebbit(subplebbit.address); // If it can load, then it has a valid signature

        expect(loadedSub.posts.pages.hot.comments[0].cid).to.equal(mockPost.cid);
    });

    it(`Subplebbit isn't publishing updates needlessly`, async () => {
        const sub = await createSubWithNoChallenge({}, plebbit);
        await sub.start();
        await resolveWhenConditionIsTrue(sub, () => typeof sub.updatedAt === "number");

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
        sub.clientsManager._resolveTextRecordSingleChainProvider = () => {
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
        subplebbit.plebbit.resolveAuthorAddresses = false; // So the post gets accepted

        await publishWithExpectedResult(mockPost, true);
        subplebbit.plebbit.resolveAuthorAddresses = true;

        expect(mockPost.author.address).to.equal("plebbit.eth");

        await publishRandomPost(subplebbit.address, plebbit); // Stimulate an update

        for (const resolveAuthorAddresses of [true, false]) {
            subplebbitVerificationCache.clear();
            const remotePlebbit = await mockRemotePlebbitIpfsOnly({ resolveAuthorAddresses });
            const loadedSub = await remotePlebbit.getSubplebbit(subplebbit.address);
            const mockPostInPage = loadedSub.posts.pages.hot.comments.find((comment) => comment.cid === mockPost.cid);
            if (resolveAuthorAddresses) expect(mockPostInPage.author.address).to.equal(mockPost.signer.address);
            else expect(mockPostInPage.author.address).to.equal("plebbit.eth");
        }
    });
});
