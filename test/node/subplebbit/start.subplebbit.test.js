const Plebbit = require("../../../dist/node");
const {
    publishRandomPost,
    mockPlebbit,
    createSubWithNoChallenge,
    publishWithExpectedResult
} = require("../../../dist/node/test/test-util");
const { messages } = require("../../../dist/node/errors");
const path = require("path");
const fs = require("fs");
const signers = require("../../fixtures/signers");
const { default: waitUntil } = require("async-wait-until");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe(`subplebbit.start`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
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
        await new Promise((resolve) => newSub.once("update", resolve));
        await publishRandomPost(newSub.address, plebbit, {}, false);
        await newSub.stop();
        await newSub.start();
        await publishRandomPost(subplebbit.address, plebbit, {}, false);
        await newSub.stop();
    });

    //prettier-ignore
    if(!process.env["USE_RPC"])
    it(`Sub can receive publications after pubsub topic subscription disconnects`, async () => {
        // There are cases where ipfs node can fail and be restarted
        // When that happens, the subscription to subplebbit.pubsubTopic will not be restored
        // The restoration of subscription should happen within the sync loop of Subplebbit
        await subplebbit.plebbit._clientsManager
            .getDefaultPubsub()
            ._client.pubsub.unsubscribe(subplebbit.pubsubTopic, subplebbit.handleChallengeExchange);
        await waitUntil(
            async () => (await subplebbit.plebbit._clientsManager.getDefaultPubsub()._client.pubsub.ls()).includes(subplebbit.address),
            {
                timeout: 150000
            }
        );
        await publishRandomPost(subplebbit.address, plebbit, {}, false); // Should receive publication since subscription to pubsub topic has been restored
    });
});

//prettier-ignore
if (!process.env["USE_RPC"])
describe(`Start lock`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
    });
    it(`subplebbit.start throws if sub is already started (same Subplebbit instance)`, async () => {
        const subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
        await assert.isRejected(subplebbit.start(), messages.ERR_SUB_ALREADY_STARTED);
        await subplebbit.stop();
    });

    it(`subplebbit.start throws if sub is started by another Subplebbit instance`, async () => {
        const subplebbit = await plebbit.createSubplebbit();
        await subplebbit.start();
        const sameSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
        await assert.isRejected(sameSubplebbit.start(), messages.ERR_SUB_ALREADY_STARTED);
        await subplebbit.stop();
        await sameSubplebbit.stop();
    });

    it(`Fail to start subplebbit if start lock is present`, async () => {
        const subSigner = await plebbit.createSigner();
        const lockPath = path.join(plebbit.dataPath, "subplebbits", `${subSigner.address}.start.lock`);
        const sub = await plebbit.createSubplebbit({ signer: subSigner });
        const sameSub = await plebbit.createSubplebbit({ address: sub.address });
        sub.start();
        await waitUntil(() => fs.existsSync(lockPath));
        await assert.isRejected(sameSub.start(), messages.ERR_SUB_ALREADY_STARTED);
        await sub.stop();
        await sameSub.stop();
    });

    it(`Can start subplebbit as soon as start lock is unlocked`, async () => {
        const subSigner = await plebbit.createSigner();
        const lockPath = path.join(plebbit.dataPath, "subplebbits", `${subSigner.address}.start.lock`);
        const sub = await plebbit.createSubplebbit({ signer: subSigner });
        await sub.start();
        sub.stop();
        await waitUntil(() => !fs.existsSync(lockPath));
        await assert.isFulfilled(sub.start());
        await sub.stop();
    });

    it(`subplebbit.start will throw if user attempted to start the same sub concurrently`, async () => {
        const sub = await plebbit.createSubplebbit();
        const sameSub = await plebbit.createSubplebbit({ address: sub.address });

        await assert.isRejected(Promise.all([sub.start(), sameSub.start()]), messages.ERR_SUB_ALREADY_STARTED);
        await sub.stop();
        await sameSub.stop();
    });

    it(`Can start subplebbit if start lock is stale (10s)`, async () => {
        // Lock is considered stale if lock has not been updated in 10000 ms (10s)
        const sub = await plebbit.createSubplebbit();

        const lockPath = path.join(plebbit.dataPath, "subplebbits", `${sub.address}.start.lock`);
        await fs.promises.mkdir(lockPath); // Artifically create a start lock

        await assert.isRejected(sub.start(), messages.ERR_SUB_ALREADY_STARTED);
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10s
        await assert.isFulfilled(sub.start());
        await sub.stop();
    });
});

describe(`Publish loop resiliency`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
    });

    after(async () => {
        await subplebbit.stop();
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
        const loadedSub = await plebbit.getSubplebbit(subplebbit.address); // If it can load, then it has a valid signature

        expect(loadedSub.posts.pages.hot.comments[0].cid).to.equal(mockPost.cid);
    });

    it(`Subplebbit can publish a new IPNS record with one of its comments having invalid ENS author address`);
});
