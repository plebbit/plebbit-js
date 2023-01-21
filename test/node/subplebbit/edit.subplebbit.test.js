const Plebbit = require("../../../dist/node");
const { publishRandomPost, mockPlebbit, loadAllPages, createMockSub } = require("../../../dist/node/test/test-util");
const { encode, timestamp } = require("../../../dist/node/util");
const lodash = require("lodash");
const { default: waitUntil } = require("async-wait-until");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { POSTS_SORT_TYPES } = require("../../../dist/node/sort-handler");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const syncInterval = 300;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe(`subplebbit.edit`, async () => {
    let plebbit, subplebbit, postToPublishAfterEdit, ethAddress;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
        subplebbit = await createMockSub({}, plebbit);
        ethAddress = `test-edit-${timestamp()}.eth`;
        const subplebbitAddress = lodash.clone(subplebbit.address);
        plebbit.resolver.resolveSubplebbitAddressIfNeeded = (subplebbitDomain) =>
            subplebbitDomain === ethAddress ? subplebbitAddress : subplebbitDomain;
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
                loadedSubplebbit._updateIntervalMs = syncInterval;
                await loadedSubplebbit.update();
                await waitUntil(() => loadedSubplebbit[keyToEdit] === newValue, { timeout: 200000 });
                loadedSubplebbit.stop();
                expect(loadedSubplebbit[keyToEdit]).to.equal(newValue);
                expect(encode(loadedSubplebbit.toJSON())).to.equal(encode(subplebbit.toJSON()));
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
    });

    it(`Start locks are moved to the new address`, async () => {
        // Check for locks
        expect(await subplebbit.dbHandler.isSubStartLocked(subplebbit.signer.address)).to.be.false;
        expect(await subplebbit.dbHandler.isSubStartLocked(ethAddress)).to.be.true;
    });

    it(`Can load a subplebbit with ENS domain as address`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.address);
        expect(loadedSubplebbit.address).to.equal(ethAddress);
        expect(encode(loadedSubplebbit)).to.equal(encode(subplebbit));
    });

    it(`subplebbit.posts is reset after changing address`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(ethAddress);
        // subplebbit.posts should omit all comments that referenced the old subplebbit address
        // So in essence it should be empty
        expect(loadedSubplebbit.posts.pages).to.deep.equal({});
        expect(loadedSubplebbit.posts.pageCids).to.deep.equal({});
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

describe(`Concurrency with subplebbit.edit`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
    });

    it("Two unstarted local sub instances can receive each other updates with subplebbit.update and edit", async () => {
        const subOne = await createMockSub({}, plebbit);
        // subOne is published now
        const subTwo = await createMockSub({ address: subOne.address }, plebbit);
        await subTwo.update();

        const newTitle = "Test new Title" + Date.now();
        await subOne.edit({ title: newTitle });
        expect(subOne.title).to.equal(newTitle);

        await new Promise((resolve) => subTwo.once("update", resolve));

        expect(subTwo.title).to.equal(newTitle);
        expect(encode(subTwo.toJSON())).to.equal(encode(subOne.toJSON()));

        subOne.stop();
        subTwo.stop();
    });

    it(`edit subplebbit with multiple subplebbit instances running`, async () => {
        // create subplebbit
        const subplebbitTitle = "subplebbit title";
        const subplebbit = await plebbit.createSubplebbit({ title: subplebbitTitle });

        // subplebbit is updating
        const updatingSubplebbit = await createMockSub({ address: subplebbit.address }, plebbit, 900);
        expect(updatingSubplebbit.signer).to.be.a("object");
        expect(updatingSubplebbit.title).to.equal(subplebbitTitle);
        await updatingSubplebbit.update();

        // start subplebbit
        const startedSubplebbit = await createMockSub({ address: subplebbit.address }, plebbit, 900);
        await startedSubplebbit.start();

        expect(startedSubplebbit.title).to.equal(subplebbitTitle);

        // edit subplebbit
        const editedSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
        const subplebbitRules = ["rule 1", "rule 2"];
        await editedSubplebbit.edit({ rules: subplebbitRules });
        expect(editedSubplebbit.address).to.equal(subplebbit.address);
        expect(editedSubplebbit.title).to.equal(subplebbitTitle);
        expect(editedSubplebbit.rules).to.deep.equal(subplebbitRules);

        // wait for subplebbit update
        // both started and updating subplebbit should now have the subplebbit edit
        await new Promise((resolve) => updatingSubplebbit.once("update", resolve));
        await updatingSubplebbit.stop();
        expect(updatingSubplebbit.address).to.equal(subplebbit.address);
        expect(updatingSubplebbit.title).to.equal(subplebbitTitle);
        expect(updatingSubplebbit.rules).to.deep.equal(subplebbitRules);

        await waitUntil(() => Array.isArray(startedSubplebbit.rules), { timeout: 200000 });

        await startedSubplebbit.stop();

        expect(startedSubplebbit.address).to.equal(subplebbit.address);
        expect(startedSubplebbit.title).to.equal(subplebbitTitle);
        expect(startedSubplebbit.rules).to.deep.equal(subplebbitRules);

        expect(subplebbit.rules).to.equal(undefined);
    });

    it(`Can edit a local sub address, while another sub instance is running`, async () => {
        const customPlebbit = await mockPlebbit();
        const signer = await plebbit.createSigner();

        const ethAddress = `address-edit-${timestamp()}.eth`;
        customPlebbit.resolver.resolveSubplebbitAddressIfNeeded = async (address) => (address === ethAddress ? signer.address : address);
        const sub = await customPlebbit.createSubplebbit({ signer });

        const startedSub = await createMockSub({ address: sub.address }, customPlebbit);

        await startedSub.start();

        const editedSub = await customPlebbit.createSubplebbit({ address: sub.address });
        await editedSub.edit({ address: ethAddress });
        expect(editedSub.address).to.equal(ethAddress);

        await new Promise((resolve) => startedSub.on("update", () => startedSub.address === ethAddress && resolve()));
        startedSub.removeAllListeners("update");
        expect(startedSub.address).to.equal(ethAddress);

        const loadedSub = await customPlebbit.getSubplebbit(ethAddress);
        expect(loadedSub.address).to.equal(ethAddress);

        const createdSub = await customPlebbit.createSubplebbit({ address: ethAddress });
        expect(createdSub.signer).to.be.a("object");
        expect(createdSub.address).to.equal(ethAddress);

        // Check for locks
        const signerLock = await createdSub.dbHandler.isSubStartLocked(createdSub.signer.address);
        const ethLock = await createdSub.dbHandler.isSubStartLocked(ethAddress);
        expect(signerLock).to.be.false;
        expect(ethLock).to.be.true;

        // Test publishing a post on the new address
        await publishRandomPost(ethAddress, customPlebbit, undefined, false);

        await startedSub.stop();
    });

    it(`Can edit a local sub address, then start it`, async () => {
        const customPlebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
        const signer = await customPlebbit.createSigner();
        const domain = `edit-before-start-${timestamp()}.eth`;
        customPlebbit.resolver.resolveSubplebbitAddressIfNeeded = async (subAddress) =>
            subAddress === domain ? signer.address : subAddress;
        const sub = await createMockSub({ signer }, customPlebbit);
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
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
    });
    it(`Can edit subplebbit.address to a new domain if subplebbit-address record does not exist or does not match signer.address`, async () => {
        const customPlebbit = await Plebbit(plebbit);
        customPlebbit.resolver.resolveSubplebbitAddressIfNeeded = (subDomain) => {
            subDomain === "no-sub-address.eth" ? undefined : subDomain === "different-signer.eth" ? signers[0].address : subDomain;
        };
        const newSub = await plebbit.createSubplebbit();
        // Has no subplebbit-address text record
        await newSub.edit({ address: "no-sub-address.eth" });
        expect(newSub.address).to.equal("no-sub-address.eth");

        // Should not match signer.address
        await newSub.edit({ address: "different-signer.eth" });
        expect(newSub.address).to.equal("different-signer.eth");
    });
});
