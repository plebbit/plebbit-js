const Plebbit = require("../../../dist/node");
const {
    publishRandomPost,
    mockPlebbit,
    loadAllPages,
    createSubWithNoChallenge,
    mockRemotePlebbitIpfsOnly
} = require("../../../dist/node/test/test-util");
const { timestamp } = require("../../../dist/node/util");
const lodash = require("lodash");
const { default: waitUntil } = require("async-wait-until");
const stringify = require("safe-stable-stringify");
const fs = require("fs");
const path = require("path");
const signers = require("../../fixtures/signers");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { POSTS_SORT_TYPES } = require("../../../dist/node/subplebbit/sort-handler");
const { v4 } = require("uuid");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

//prettier-ignore
if (!process.env["USE_RPC"])
describe(`subplebbit.edit`, async () => {
    let plebbit, subplebbit, postToPublishAfterEdit, ethAddress;
    before(async () => {
        plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
        subplebbit = await createSubWithNoChallenge({}, plebbit, 1000);
        ethAddress = `test-edit-${v4()}.eth`;
        const originalPlebbit = await mockPlebbit();
        const subplebbitAddress = lodash.clone(subplebbit.address);
        plebbit.resolver.resolveTxtRecord = (ensName, txtRecordName) => {
            if (ensName === ethAddress && txtRecordName) return subplebbitAddress;
            else return originalPlebbit.resolver._resolveEnsTxtRecord(ensName, txtRecordName);
        };
        await subplebbit.start();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await publishRandomPost(subplebbit.address, plebbit);
    });
    after(async () => await subplebbit.stop());

    [{ title: `Test subplebbit title edit ${Date.now()}` }, { description: `Test subplebbit description edit ${Date.now()}` }].map(
        (editArgs) =>
            it(`subplebbit.edit(${JSON.stringify(editArgs)})`, async () => {
                const [keyToEdit, newValue] = Object.entries(editArgs)[0];
                await subplebbit.edit(editArgs);
                expect(subplebbit[keyToEdit]).to.equal(newValue);
                const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.address);
                await loadedSubplebbit.update();
                await waitUntil(() => loadedSubplebbit[keyToEdit] === newValue, { timeout: 200000 });
                loadedSubplebbit.stop();
                expect(loadedSubplebbit[keyToEdit]).to.equal(newValue);
                expect(stringify(loadedSubplebbit.toJSON())).to.equal(stringify(subplebbit.toJSON()));
            })
    );

    it(`Sub is locked for start`, async () => {
        // Check for locks
        expect(await subplebbit.dbHandler.isSubStartLocked(subplebbit.signer.address)).to.be.true;
    });

    it(`Can edit a subplebbit to have ENS domain as address`, async () => {
        expect(subplebbit.posts.pages).to.not.deep.equal({});
        await subplebbit.edit({ address: ethAddress });
        expect(subplebbit.address).to.equal(ethAddress);
        await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(subplebbit.address).to.equal(ethAddress);
    });

    it(`Local subplebbit resets posts after changing address`, async () => {
        expect(subplebbit.posts.pages).to.be.undefined;
        expect(subplebbit.posts.pageCids).to.undefined;
    });

    it(`Start locks are moved to the new address`, async () => {
        // Check for locks
        expect(fs.existsSync(path.join(subplebbit.plebbit.dataPath, "subplebbits", subplebbit.signer.address))).to.be.false;
        expect(fs.existsSync(path.join(subplebbit.plebbit.dataPath, "subplebbits", ethAddress))).to.be.true;
    });

    it(`Can load a subplebbit with ENS domain as address`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(ethAddress);
        expect(loadedSubplebbit.address).to.equal(ethAddress);
        expect(stringify(loadedSubplebbit)).to.equal(stringify(subplebbit));
    });

    it(`remote subplebbit.posts is reset after changing address`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(ethAddress);
        // subplebbit.posts should omit all comments that referenced the old subplebbit address
        // So in essence it be undefined
        expect(loadedSubplebbit.posts.pages).to.be.undefined;
        expect(loadedSubplebbit.posts.pageCids).to.undefined;
    });

    it(`Started Sub can receive publications on new ENS address`, async () => {
        postToPublishAfterEdit = await publishRandomPost(ethAddress, plebbit);
    });

    it(`Posts submitted to new sub address are shown in subplebbit.posts`, async () => {
        await waitUntil(() => subplebbit.posts.pages.hot.comments.some((comment) => comment.cid === postToPublishAfterEdit.cid), {
            timeout: 200000
        });
        expect(Object.keys(subplebbit.posts.pageCids).sort()).to.deep.equal(Object.keys(POSTS_SORT_TYPES).sort());
        expect(Object.values(subplebbit.posts.pageCids)).to.deep.equal(
            new Array(Object.keys(subplebbit.posts.pageCids).length).fill(Object.values(subplebbit.posts.pageCids)[0])
        ); // All cids should be the same since it's just one post, so the sort result should be the same for all pages

        for (const pageCid of Object.values(subplebbit.posts.pageCids)) {
            const pageComments = await loadAllPages(pageCid, subplebbit.posts);
            expect(pageComments.length).to.equal(1);
            expect(pageComments[0].cid).to.equal(postToPublishAfterEdit.cid);
        }
    });
});

//prettier-ignore
if (!process.env["USE_RPC"])
describe(`Concurrency with subplebbit.edit`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
    });

    it("Two unstarted local sub instances can receive each other updates with subplebbit.update and edit", async () => {
        const subOne = await createSubWithNoChallenge({}, plebbit);
        // subOne is published now
        const subTwo = await createSubWithNoChallenge({ address: subOne.address }, plebbit);
        await subTwo.update();

        const newTitle = "Test new Title" + Date.now();
        await subOne.edit({ title: newTitle });
        expect(subOne.title).to.equal(newTitle);

        await new Promise((resolve) => subTwo.once("update", resolve));

        expect(subTwo.title).to.equal(newTitle);
        expect(stringify(subTwo.toJSON())).to.equal(stringify(subOne.toJSON()));

        subOne.stop();
        subTwo.stop();
    });

    [
        { address: `address-eth-${v4()}-1.eth` },
        { rules: ["rule 1", "rule 2"] },
        { address: `address-eth-${v4()}-2.eth`, rules: ["rule 1", "rule 2"] }
    ].map((editArgs) =>
        it(`edit subplebbit with multiple subplebbit instances running (${Object.keys(editArgs)})`, async () => {
            const plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
            // create subplebbit
            const subplebbitTitle = "subplebbit title" + timestamp();
            const subplebbit = await plebbit.createSubplebbit({ title: subplebbitTitle });
            const subplebbitSignerAddress = lodash.clone(subplebbit.address);
            if (editArgs.address)
                plebbit.resolver.resolveTxtRecord = async (subAddress, txtRecordName) =>
                    subAddress === editArgs.address ? subplebbitSignerAddress : subAddress;

            // subplebbit is updating
            const updatingSubplebbit = await createSubWithNoChallenge({ address: subplebbit.address }, plebbit);
            expect(updatingSubplebbit.signer).to.be.a("object");
            expect(updatingSubplebbit.title).to.equal(subplebbitTitle);
            await updatingSubplebbit.update();

            // start subplebbit
            const startedSubplebbit = await createSubWithNoChallenge({ address: subplebbit.address }, plebbit);
            await startedSubplebbit.start();

            expect(startedSubplebbit.title).to.equal(subplebbitTitle);

            let editIsFinished;
            const updateEventPromise = new Promise((resolve) =>
                updatingSubplebbit.on("update", (updatedSubplebbit) => editIsFinished && resolve(updatedSubplebbit))
            );

            const updateStartedSubEventPromise = new Promise((resolve) =>
                startedSubplebbit.on("update", (updatedSubplebbit) => editIsFinished && resolve(updatedSubplebbit))
            );

            // edit subplebbit
            const editedSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
            await editedSubplebbit.edit(editArgs);

            editIsFinished = true;
            const updatedSubplebbit = await updateEventPromise;
            updatingSubplebbit.removeAllListeners("update");
            expect(editedSubplebbit.title).to.equal(subplebbitTitle);
            for (const [editKey, editValue] of Object.entries(editArgs)) expect(editedSubplebbit[editKey]).to.equal(editValue);

            // wait for subplebbit update
            // both started and updating subplebbit should now have the subplebbit edit

            expect(updatingSubplebbit.title).to.equal(subplebbitTitle);
            for (const [editKey, editValue] of Object.entries(editArgs))
                expect(stringify(updatingSubplebbit[editKey])).to.equal(stringify(editValue));

            expect(updatedSubplebbit.title).to.equal(subplebbitTitle);
            for (const [editKey, editValue] of Object.entries(editArgs))
                expect(stringify(updatedSubplebbit[editKey])).to.equal(stringify(editValue));

            await updatingSubplebbit.stop();

            await updateStartedSubEventPromise;

            expect(startedSubplebbit.title).to.equal(subplebbitTitle);
            for (const [editKey, editValue] of Object.entries(editArgs))
                expect(stringify(startedSubplebbit[editKey])).to.equal(stringify(editValue));

            await startedSubplebbit.stop();

            expect(subplebbit.rules).to.equal(undefined);

            const newlyCreatedSubplebbit = await plebbit.createSubplebbit({ address: startedSubplebbit.address });
            expect(newlyCreatedSubplebbit.title).to.equal(subplebbitTitle);
            for (const [editKey, editValue] of Object.entries(editArgs))
                expect(stringify(newlyCreatedSubplebbit[editKey])).to.equal(stringify(editValue));
        })
    );

    it(`Can edit a local sub address, then start it`, async () => {
        const customPlebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
        const signer = await customPlebbit.createSigner();
        const domain = `edit-before-start-${timestamp()}.eth`;

        const originalPlebbit = await mockPlebbit();

        customPlebbit.resolver.resolveTxtRecord = (ensName, txtRecordName) => {
            if (ensName === domain && txtRecordName === "subplebbit-address") return signer.address;
            else return originalPlebbit.resolver.resolveTxtRecord(ensName, txtRecordName);
        };
        const sub = await createSubWithNoChallenge({ signer }, customPlebbit);
        await sub.edit({ address: domain });
        // Check for locks
        expect(await sub.dbHandler.isSubStartLocked(sub.signer.address)).to.be.false;
        expect(await sub.dbHandler.isSubStartLocked(domain)).to.be.false;

        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));

        expect(sub.address).to.equal(domain);
        // Check for locks
        expect(await sub.dbHandler.isSubStartLocked(sub.signer.address)).to.be.false;
        expect(await sub.dbHandler.isSubStartLocked(domain)).to.be.true;

        await publishRandomPost(sub.address, customPlebbit);
        await sub.stop();
    });
});

describe(`Edit misc`, async () => {
    it(`Can edit subplebbit.address to a new domain even if subplebbit-address text record does not exist`, async () => {
        const customPlebbit = await mockPlebbit();
        const newSub = await customPlebbit.createSubplebbit();
        // Has no subplebbit-address text record
        await newSub.edit({ address: "no-sub-address.eth" });
        expect(newSub.address).to.equal("no-sub-address.eth");
    });

    it(`Can edit subplebbit.address to a new domain even if subplebbit-address text record does not match subplebbit.signer.address`, async () => {
        const customPlebbit = await mockPlebbit();
        const newSub = await customPlebbit.createSubplebbit();

        // Should not match signer.address
        await newSub.edit({ address: "different-signer.eth" });
        expect(newSub.address).to.equal("different-signer.eth");
    });
});

//prettier-ignore
if (process.env["USE_RPC"] === "1")
describe(`subplebbit.edit (RPC)`, async () => {
    let plebbit, subplebbit;

    before(async () => {
        plebbit = await mockPlebbit();
        const signer = await plebbit.createSigner();
        subplebbit = await plebbit.createSubplebbit({signer});
        await subplebbit.start();
        await new Promise(resolve => subplebbit.once("update", resolve));
        expect(subplebbit.address).to.equal(signer.address);
    });

    after(async () => {
        await subplebbit.delete();
    });
    [
        { title: `Test subplebbit RPC title edit ${Date.now()}` },
        { description: `Test subplebbit RPC description edit ${Date.now()}` },
        { address: `rpc-edit-test.eth` }
    ].map((editArgs) =>
        it(`subplebbit.edit(${JSON.stringify(editArgs)})`, async () => {
            const [keyToEdit, newValue] = Object.entries(editArgs)[0];
            await subplebbit.edit(editArgs);
            expect(subplebbit[keyToEdit]).to.equal(newValue);
            await new Promise(resolve => subplebbit.once("update", resolve));
            const remotePlebbit = await mockRemotePlebbitIpfsOnly(); // This plebbit instance won't use RPC
            const loadedSubplebbit = await remotePlebbit.createSubplebbit({address: subplebbit.address});
            await loadedSubplebbit.update();
            await waitUntil(() => loadedSubplebbit[keyToEdit] === newValue, { timeout: 200000 });
            await loadedSubplebbit.stop();
            expect(loadedSubplebbit[keyToEdit]).to.equal(newValue);
        })
    );
});
