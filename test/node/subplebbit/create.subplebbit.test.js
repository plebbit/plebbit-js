const Plebbit = require("../../../dist/node");
const { mockPlebbit } = require("../../../dist/node/test/test-util");
const { timestamp, encode } = require("../../../dist/node/util");
const path = require("path");
const { messages } = require("../../../dist/node/errors");
const fs = require("fs");
const { default: waitUntil } = require("async-wait-until");
const branchy = require("branchy");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const syncInterval = 300;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe(`plebbit.createSubplebbit`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
    });

    const _createAndValidateSubArsg = async (subArgs) => {
        const newSubplebbit = await plebbit.createSubplebbit(subArgs);
        await newSubplebbit.start();
        await new Promise((resolve) => newSubplebbit.once("update", resolve));
        await newSubplebbit.stop();

        // Sub has finished its first sync loop, should have address now
        expect(newSubplebbit.address).to.equal(newSubplebbit.signer.address);
        const subplebbitIpns = await plebbit.getSubplebbit(newSubplebbit.address);
        expect(encode(subplebbitIpns.toJSON())).to.equal(encode(newSubplebbit.toJSON()));
        return newSubplebbit;
    };

    [{}, { title: `Test title - ${Date.now()}` }].map((subArgs) =>
        it(`createSubplebbit(${JSON.stringify(subArgs)})`, async () => {
            await _createAndValidateSubArsg(subArgs);
        })
    );

    it(`createSubplebbit({signer: await plebbit.createSigner()})`, async () => {
        await _createAndValidateSubArsg({ signer: await plebbit.createSigner() });
    });

    it(`createSubplebbit({signer: {privateKey, type}})`, async () => {
        const signer = await plebbit.createSigner();
        await _createAndValidateSubArsg({ signer: { privateKey: signer.privateKey, type: signer.type } });
    });

    it(`subplebbit = await createSubplebbit(await createSubplebbit)`, async () => {
        const props = { title: "subplebbit = await createSubplebbit(await createSubplebbit)" };
        const createdSub = await plebbit.createSubplebbit(await plebbit.createSubplebbit(props));
        expect(createdSub.title).to.equal(props.title);
        expect(createdSub.signer.address).to.be.a("string");
        await createdSub.stop();
    });

    it(`createSubplebbit on online IPFS node doesn't take more than 10s`, async () => {
        const onlinePlebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:15003/api/v0",
            pubsubHttpClientOptions: `http://localhost:15003/api/v0`,
            dataPath: globalThis["window"]?.plebbitDataPath
        });
        onlinePlebbit.resolver = plebbit.resolver;
        const startTime = timestamp();
        const title = `Test online plebbit`;
        const createdSub = await onlinePlebbit.createSubplebbit({ title: title });
        const endTime = timestamp();
        await createdSub.stop();
        expect(endTime).to.be.lessThanOrEqual(startTime + 10, "createSubplebbit took more than 10s in an online ipfs node");
    });

    it(`local subplebbit retains fields upon createSubplebbit(address)`, async () => {
        const title = `Test retention ${Date.now()}`;
        const sub = await _createAndValidateSubArsg({ title });
        const createdSub = await plebbit.createSubplebbit({ address: sub.address });
        expect(createdSub.title).to.equal(title);
        expect(encode(createdSub.toJSON())).to.equal(encode(sub.toJSON()));
        await createdSub.stop();
    });

    it(`createSubplebbit({address, ...extraProps}) creates a sub with extraProps fields over cached fields`, async () => {
        const newSub = await plebbit.createSubplebbit({
            title: `Test for extra props`,
            description: "Test for description extra props"
        });
        newSub._syncIntervalMs = syncInterval;
        await newSub.start();
        await new Promise((resolve) => newSub.once("update", resolve));
        await newSub.stop();

        const createdSubplebbit = await plebbit.createSubplebbit({
            address: newSub.address,
            title: "nothing",
            description: "nothing also"
        });
        expect(createdSubplebbit.title).to.equal("nothing");
        expect(createdSubplebbit.description).to.equal("nothing also");

        createdSubplebbit._syncIntervalMs = syncInterval;
        await createdSubplebbit.start();
        await new Promise((resolve) => createdSubplebbit.once("update", resolve));
        expect(createdSubplebbit.title).to.equal("nothing");
        expect(createdSubplebbit.description).to.equal("nothing also");
        await createdSubplebbit.stop();
    });
});

describe("Create lock", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
    });
    it(`Fail to create subplebbit if create lock is present`, async () => {
        const subSigner = await plebbit.createSigner();
        const subDbLockPath = path.join(plebbit.dataPath, "subplebbits", `${subSigner.address}.create.lock`);
        plebbit.createSubplebbit({ signer: subSigner });
        await waitUntil(() => fs.existsSync(subDbLockPath));
        expect(await plebbit.listSubplebbits()).to.not.include(subSigner.address);
        expect(fs.existsSync(subDbLockPath)).to.be.true;
        await assert.isRejected(plebbit.createSubplebbit({ address: subSigner.address }), messages.ERR_SUB_CREATION_LOCKED);
    });

    it(`Can create subplebbit as soon as create lock is unlocked`, async () => {
        const subSigner = await plebbit.createSigner();
        const subDbLockPath = path.join(plebbit.dataPath, "subplebbits", `${subSigner.address}.create.lock`);
        plebbit.createSubplebbit({ signer: subSigner });
        await waitUntil(() => fs.existsSync(subDbLockPath));
        const watcher = fs.promises.watch(subDbLockPath, {});
        let eventCount = 0;
        for await (const event of watcher) {
            eventCount++;
            if (eventCount === 2) break;
        }
        expect(fs.existsSync(subDbLockPath)).to.be.false;
        await assert.isFulfilled(plebbit.createSubplebbit({ address: subSigner.address }));
    });

    it(`createSubplebbit will throw if user attempted to recreate the same sub concurrently`, async () => {
        const subSigner = await plebbit.createSigner();

        const firstPromise = plebbit.createSubplebbit({ signer: subSigner });
        await assert.isRejected(plebbit.createSubplebbit({ address: subSigner.address }), messages.ERR_SUB_CREATION_LOCKED);
        (await firstPromise).stop();
    });

    it(`Can create subplebbit if create lock is stale (10s)`, async () => {
        // Lock is considered stale if lock has not been updated in 10000 ms (10s)
        const sub = await plebbit.createSubplebbit();

        const lockPath = path.join(plebbit.dataPath, "subplebbits", `${sub.address}.create.lock`);
        await fs.promises.mkdir(lockPath); // Artifically create a create lock

        await assert.isRejected(plebbit.createSubplebbit({ address: sub.address }), messages.ERR_SUB_CREATION_LOCKED);
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10s
        await assert.isFulfilled(plebbit.createSubplebbit({ address: sub.address }));
        await sub.stop();
    });

    it(`Same sub can't be created in different processes`, async () => {
        // Have to import all these packages because forked process doesn't have them
        const createSubInDifferentProcess = branchy(async (subAddress) => {
            const { mockPlebbit } = require("../../../dist/node/test/test-util");
            const chai = require("chai");
            const chaiAsPromised = require("chai-as-promised");
            chai.use(chaiAsPromised);
            const { expect, assert } = chai;
            const { messages } = require("../../../dist/node/errors");
            const path = require("path");
            const fs = require("fs");
            const { default: waitUntil } = require("async-wait-until");
            const branchPlebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
            const lockPath = path.join(branchPlebbit.dataPath, "subplebbits", `${subAddress}.create.lock`);
            await waitUntil(() => fs.existsSync(lockPath), { intervalBetweenAttempts: 25 });
            await assert.isRejected(branchPlebbit.createSubplebbit({ address: subAddress }), messages.ERR_SUB_CREATION_LOCKED);
        });
        const subSigner = await plebbit.createSigner();
        const sub = await plebbit.createSubplebbit({ signer: subSigner });

        await Promise.all([createSubInDifferentProcess(subSigner.address), sub.dbHandler.lockSubCreation()]);
        await sub.dbHandler.unlockSubCreation();
        await sub.stop();
    });
});
