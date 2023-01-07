const Plebbit = require("../../../dist/node");
const { publishRandomPost, mockPlebbit } = require("../../../dist/node/test/test-util");
const { messages } = require("../../../dist/node/errors");
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
        await publishRandomPost(subplebbit.address, plebbit); // Should receive publication since subscription to pubsub topic has been restored
    });

    it(`subplebbit.start throws if sub is already started (same Subplebbit instance)`, async () => {
        await assert.isRejected(subplebbit.start(), messages.ERR_SUB_ALREADY_STARTED);
    });

    it(`subplebbit.start throws if sub is started by another Subplebbit instance`, async () => {
        const sameSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
        await assert.isRejected(sameSubplebbit.start(), messages.ERR_SUB_ALREADY_STARTED);
    });
});
