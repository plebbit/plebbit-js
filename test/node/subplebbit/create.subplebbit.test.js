const Plebbit = require("../../../dist/node");
const { mockPlebbit, publishRandomPost, publishRandomReply, createMockSub } = require("../../../dist/node/test/test-util");
const { timestamp } = require("../../../dist/node/util");
const path = require("path");
const { messages } = require("../../../dist/node/errors");
const fs = require("fs");
const { default: waitUntil } = require("async-wait-until");

const stringify = require("safe-stable-stringify");

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
        expect(stringify(subplebbitIpns.toJSON())).to.equal(stringify(newSubplebbit.toJSON()));
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

    it(`Can recreate a subplebbit with replies instance with plebbit.createSubplebbit`, async () => {
        const props = { title: "Test hello", description: "Hello there" };
        const sub = await createMockSub(props, plebbit);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
        const post = await publishRandomPost(sub.address, plebbit, {}, false);
        await publishRandomReply(post, plebbit, {}, true);
        expect(sub.posts).to.be.a("object");
        const clonedSub = await plebbit.createSubplebbit(sub);
        expect(clonedSub.posts).to.be.a("object");
        expect(sub.toJSON()).to.deep.equal(clonedSub.toJSON());
        await sub.stop();
    });

    it(`createSubplebbit on online IPFS node doesn't take more than 10s`, async () => {
        const onlinePlebbit = await Plebbit({
            ipfsHttpClientsOptions: "http://localhost:15003/api/v0",
            pubsubHttpClientsOptions: `http://localhost:15003/api/v0`,
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
        expect(stringify(createdSub.toJSON())).to.equal(stringify(sub.toJSON()));
        await createdSub.stop();
    });

    it(`Recreating a local sub with createSubplebbit({address, ...extraProps}) should not override local sub props`, async () => {
        const newSub = await createMockSub(
            {
                title: `Test for extra props`,
                description: "Test for description extra props"
            },
            plebbit
        );
        await newSub.start();
        await new Promise((resolve) => newSub.once("update", resolve));
        await newSub.stop();

        const createdSubplebbit = await createMockSub(
            {
                address: newSub.address,
                title: "nothing",
                description: "nothing also"
            },
            plebbit
        );
        expect(createdSubplebbit.title).to.equal(newSub.title);
        expect(createdSubplebbit.description).to.equal(newSub.description);

        await createdSubplebbit.start();
        await new Promise((resolve) => createdSubplebbit.once("update", resolve));
        expect(createdSubplebbit.title).to.equal(newSub.title);
        expect(createdSubplebbit.description).to.equal(newSub.description);
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
        await waitUntil(() => fs.existsSync(subDbLockPath), { timeout: 60000, intervalBetweenAttempts: 10 });
        await assert.isRejected(plebbit.createSubplebbit({ address: subSigner.address }), messages.ERR_SUB_CREATION_LOCKED);
    });

    it(`Can create subplebbit as soon as create lock is unlocked`, async () => {
        const subSigner = await plebbit.createSigner();
        const subDbLockPath = path.join(plebbit.dataPath, "subplebbits", `${subSigner.address}.create.lock`);
        plebbit.createSubplebbit({ signer: subSigner });
        await waitUntil(() => fs.existsSync(subDbLockPath), { timeout: 60000, intervalBetweenAttempts: 10 });
        const watcher = fs.promises.watch(subDbLockPath, {});
        let eventCount = 0;
        for await (const event of watcher) {
            eventCount++;
            if (eventCount === 2) break;
        }
        expect(fs.existsSync(subDbLockPath)).to.be.false;
        await assert.isFulfilled(plebbit.createSubplebbit({ address: subSigner.address }));
    });

    it(`createSubplebbit will throw if user attempted to create a new sub concurrently`, async () => {
        const subSigner = await plebbit.createSigner();
        await assert.isRejected(
            Promise.all([plebbit.createSubplebbit({ signer: subSigner }), plebbit.createSubplebbit({ signer: subSigner })]),
            messages.ERR_SUB_CREATION_LOCKED
        );
    });

    it(`createSubplebbit will throw if user attempts to recreate a sub concurrently`, async () => {
        const sub = await plebbit.createSubplebbit(); // Sub is created and has no lock

        await assert.isRejected(
            Promise.all([plebbit.createSubplebbit({ address: sub.address }), plebbit.createSubplebbit({ address: sub.address })]),
            messages.ERR_SUB_CREATION_LOCKED
        );
        await sub.stop();
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
});
