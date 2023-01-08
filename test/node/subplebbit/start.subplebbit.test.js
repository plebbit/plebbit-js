const Plebbit = require("../../../dist/node");
const { publishRandomPost, mockPlebbit } = require("../../../dist/node/test/test-util");
const { messages } = require("../../../dist/node/errors");
const path = require("path");
const fs = require("fs");
const { default: waitUntil } = require("async-wait-until");
const branchy = require("branchy");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const syncInterval = 300;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe(`subplebbit.start`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
        subplebbit = await plebbit.createSubplebbit();
        subplebbit.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);
        subplebbit._syncIntervalMs = syncInterval;
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
    });
    after(async () => subplebbit.stop());

    it(`Started Sub can receive publications sequentially`, async () => {
        await publishRandomPost(subplebbit.address, plebbit);
        await publishRandomPost(subplebbit.address, plebbit);
        await publishRandomPost(subplebbit.address, plebbit);
    });

    it(`Started Sub can receive publications parallely`, async () => {
        await Promise.all(new Array(3).fill(null).map(() => publishRandomPost(subplebbit.address, plebbit)));
    });

    it(`Can start a sub after stopping it`, async () => {
        await subplebbit.stop();
        await subplebbit.start();
        await publishRandomPost(subplebbit.address, plebbit);
    });

    it(`Sub can receive publications after pubsub topic subscription disconnects`, async () => {
        // There are cases where ipfs node can fail and be restarted
        // When that happens, the subscription to subplebbit.pubsubTopic will not be restored
        // The restoration of subscription should happen within the sync loop of Subplebbit
        await subplebbit.plebbit.pubsubIpfsClient.pubsub.unsubscribe(subplebbit.pubsubTopic);
        await waitUntil(async () => (await subplebbit.plebbit.pubsubIpfsClient.pubsub.ls()).includes(subplebbit.address), {
            timeout: 150000
        });
        await publishRandomPost(subplebbit.address, plebbit); // Should receive publication since subscription to pubsub topic has been restored
    });
});

describe(`Start lock`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
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

    it(`Can start subplebbit if create lock is stale (10s)`, async () => {
        // Lock is considered stale if lock has not been updated in 10000 ms (10s)
        const sub = await plebbit.createSubplebbit();

        const lockPath = path.join(plebbit.dataPath, "subplebbits", `${sub.address}.start.lock`);
        await fs.promises.mkdir(lockPath); // Artifically create a start lock

        await assert.isRejected(sub.start(), messages.ERR_SUB_ALREADY_STARTED);
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10s
        await assert.isFulfilled(sub.start());
        await sub.stop();
    });

    it(`Same sub can't be started in different processes`, async () => {
        const sub = await plebbit.createSubplebbit();
        await sub.start();

        // Have to import all these packages because forked process doesn't have them
        const test = branchy(async (subAddress) => {
            const { mockPlebbit } = require("../../../dist/node/test/test-util");
            const chai = require("chai");
            const chaiAsPromised = require("chai-as-promised");
            chai.use(chaiAsPromised);
            const { expect, assert } = chai;
            const { messages } = require("../../../dist/node/errors");

            const branchPlebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
            const sub = await branchPlebbit.createSubplebbit({ address: subAddress });
            await assert.isRejected(sub.start(), messages.ERR_SUB_ALREADY_STARTED);
        });

        await test(sub.address);
    });
});
