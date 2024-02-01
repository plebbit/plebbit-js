import {
    publishRandomPost,
    mockPlebbit,
    createSubWithNoChallenge,
    publishWithExpectedResult,
    mockRemotePlebbitIpfsOnly,
    isRpcFlagOn
} from "../../../dist/node/test/test-util";
import { messages } from "../../../dist/node/errors";
import path from "path";
import fs from "fs";
import signers from "../../fixtures/signers";
import { default as waitUntil } from "async-wait-until";
import { subplebbitVerificationCache } from "../../../dist/node/constants";

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
        await new Promise((resolve) => subplebbit.once("update", resolve));
        if (!subplebbit.updatedAt) await new Promise((resolve) => subplebbit.once("update", resolve));
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
        if (!newSub.updatedAt) await new Promise((resolve) => newSub.once("update", resolve));
        await publishRandomPost(newSub.address, plebbit, {}, false);
        await newSub.stop();
        await newSub.start();
        await publishRandomPost(newSub.address, plebbit, {}, false);
        await newSub.stop();
    });

    //prettier-ignore
    if(!isRpcFlagOn())
    it(`Sub can receive publications after pubsub topic subscription disconnects`, async () => {
        // There are cases where ipfs node can fail and be restarted
        // When that happens, the subscription to subplebbit.pubsubTopic will not be restored
        // The restoration of subscription should happen within the sync loop of Subplebbit
        await subplebbit.plebbit._clientsManager
            .getDefaultPubsub()
            ._client.pubsub.unsubscribe(subplebbit.pubsubTopic, subplebbit.handleChallengeExchange);
        await waitUntil.default(
            async () => (await subplebbit.plebbit._clientsManager.getDefaultPubsub()._client.pubsub.ls()).includes(subplebbit.address),
            {
                timeout: 150000
            }
        );
        await publishRandomPost(subplebbit.address, plebbit, {}, false); // Should receive publication since subscription to pubsub topic has been restored
    });
});

//prettier-ignore
if (!isRpcFlagOn())
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
        await waitUntil.default(() => fs.existsSync(lockPath));
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
        await waitUntil.default(() => !fs.existsSync(lockPath));
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
        await new Promise((resolve) => sub.once("update", resolve));

        sub.on("update", () => {
            reject("Subplebbit should not publish update needlesly");
            expect.fail("Subplebbit should not publish update needlesly");
        });

        await new Promise((resolve) => setTimeout(resolve, plebbit.publishInterval * 5));
        await sub.delete();
    });

    //prettier-ignore
    if (!isRpcFlagOn())
    it(`Subplebbit can publish a new IPNS record with one of its comments having invalid ENS author address`, async () => {

        
        const mockPost = await plebbit.createComment({
            author: { address: "plebbit.eth" },
            signer: signers[7], // Wrong signer
            title: "Test publishing with invalid ENS " + Date.now(),
            subplebbitAddress: subplebbit.address
        });

        subplebbit.on("error", (err) => {
            console.log(err);
        })
        subplebbit.plebbit.resolveAuthorAddresses = false; // So the post gets accepted

        await publishWithExpectedResult(mockPost, true); 
        subplebbit.plebbit.resolveAuthorAddresses = true; 

        expect(mockPost.author.address).to.equal("plebbit.eth");

        await publishRandomPost(subplebbit.address ,plebbit); // Stimulate an update

        for (const resolveAuthorAddresses of [true, false]) {
            subplebbitVerificationCache.clear();
            const remotePlebbit = await mockRemotePlebbitIpfsOnly({resolveAuthorAddresses});
            const loadedSub = await remotePlebbit.getSubplebbit(subplebbit.address); 
            const mockPostInPage = loadedSub.posts.pages.hot.comments.find(comment => comment.cid === mockPost.cid);
            if (resolveAuthorAddresses)
                expect(mockPostInPage.author.address).to.equal(mockPost.signer.address);
            else 
                expect(mockPostInPage.author.address).to.equal("plebbit.eth");
        }

    });
});
