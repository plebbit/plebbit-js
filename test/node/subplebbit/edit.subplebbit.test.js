const Plebbit = require("../../../dist/node");
const { publishRandomPost, mockPlebbit, loadAllPages } = require("../../../dist/node/test/test-util");
const { encode } = require("../../../dist/node/util");
const lodash = require("lodash");
const { default: waitUntil } = require("async-wait-until");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const syncInterval = 300;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe(`subplebbit.edit`, async () => {
    let plebbit, subplebbit, postToPublishAfterEdit;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
        subplebbit = await plebbit.createSubplebbit({});
        const subplebbitAddress = lodash.clone(subplebbit.address);
        plebbit.resolver.resolveSubplebbitAddressIfNeeded = (subplebbitDomain) =>
            subplebbitDomain === "testEdit.eth" ? subplebbitAddress : subplebbitDomain;
        subplebbit.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);
        subplebbit._syncIntervalMs = syncInterval;
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

    it(`Can edit a subplebbit to have ENS domain as address`, async () => {
        expect(subplebbit.posts.pages).to.not.equal({});
        await subplebbit.edit({ address: "testEdit.eth" });
        expect(subplebbit.address).to.equal("testEdit.eth");
        await new Promise((resolve) => subplebbit.once("update", resolve));
    });

    it(`Can load a subplebbit with ENS domain as address`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.address);
        expect(loadedSubplebbit.address).to.equal("testEdit.eth");
        expect(encode(loadedSubplebbit)).to.equal(encode(subplebbit));
    });

    it(`subplebbit.posts is reset after changing address`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.address);
        // subplebbit.posts should omit all comments that referenced the old subplebbit address
        // So in essence it should be empty
        expect(loadedSubplebbit.posts.pages).to.deep.equal({});
        expect(loadedSubplebbit.posts.pageCids).to.deep.equal({});
    });

    it(`Started Sub can receive publications on new ENS address`, async () => {
        postToPublishAfterEdit = await publishRandomPost(subplebbit.address, plebbit);
    });

    it(`Posts submitted to new sub address are shown in subplebbit.posts`, async () => {
        await waitUntil(() => subplebbit.posts.pages.hot.comments.some((comment) => comment.cid === postToPublishAfterEdit.cid), {
            timeout: 20000
        });
        expect(Object.values(subplebbit.posts.pageCids).length).to.be.greaterThan(1);
        for (const pageCid of Object.values(subplebbit.posts.pageCids)) {
            const pageComments = await loadAllPages(pageCid, subplebbit.posts);
            expect(pageComments.length).to.equal(1);
            expect(pageComments[0].cid).to.equal(postToPublishAfterEdit.cid);
        }
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

describe(`Concurrency with subplebbit.edit`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
    });

    it("Two local sub instances can receive each other updates with subplebbit.update", async () => {
        const subOne = await plebbit.createSubplebbit({});
        subOne._syncIntervalMs = syncInterval;
        await subOne.start();
        await new Promise((resolve) => subOne.once("update", resolve));
        // subOne is published now
        const subTwo = await plebbit.createSubplebbit({ address: subOne.address });
        subTwo._updateIntervalMs = syncInterval;
        await subTwo.update();
        const newTitle = "Test new Title" + Date.now();
        await subOne.edit({ title: newTitle });
        expect(subOne.title).to.equal(newTitle);
        await waitUntil(() => subTwo.title === newTitle);
        expect(subTwo.title).to.equal(newTitle);
        expect(subOne.title).to.equal(newTitle);
        expect(encode(subTwo.toJSON())).to.equal(encode(subOne.toJSON()));
        subOne.stop();
        subTwo.stop();
        subTwo.removeAllListeners();
    });

    it(`edit subplebbit with multiple subplebbit instances running`, async () => {
        // create subplebbit
        const subplebbitTitle = "subplebbit title";
        const subplebbit = await plebbit.createSubplebbit({ title: subplebbitTitle });

        // subplebbit is updating
        const updatingSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
        expect(updatingSubplebbit.signer).to.be.a("object");
        expect(updatingSubplebbit.title).to.equal(subplebbitTitle);
        updatingSubplebbit._updateIntervalMs = 100;
        await updatingSubplebbit.update();

        // start subplebbit
        const startedSubplebbit = await plebbit.createSubplebbit({ address: subplebbit.address });
        startedSubplebbit._syncIntervalMs = 300;
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
        await waitUntil(() => Array.isArray(updatingSubplebbit.rules), { timeout: 200000 });

        expect(updatingSubplebbit.address).to.equal(subplebbit.address);
        expect(updatingSubplebbit.title).to.equal(subplebbitTitle);
        expect(updatingSubplebbit.rules).to.deep.equal(subplebbitRules);
        expect(startedSubplebbit.address).to.equal(subplebbit.address);
        expect(startedSubplebbit.title).to.equal(subplebbitTitle);
        expect(startedSubplebbit.rules).to.deep.equal(subplebbitRules);
        expect(subplebbit.rules).to.equal(undefined);

        await startedSubplebbit.stop();
        await updatingSubplebbit.stop();
    });

    it(`A sub instance can change address, and the other started instance will use the new address`, async () => {
        const customPlebbit = await mockPlebbit();
        const signer = await plebbit.createSigner();

        const ethAddress = "address-edit.eth";
        customPlebbit.resolver.resolveSubplebbitAddressIfNeeded = async (address) => (address === ethAddress ? signer.address : address);
        const sub = await customPlebbit.createSubplebbit({ signer });

        const startedSub = await customPlebbit.createSubplebbit({ address: sub.address });
        startedSub._syncIntervalMs = 300;
        startedSub.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);

        await startedSub.start();

        const editedSub = await customPlebbit.createSubplebbit({ address: sub.address });
        await editedSub.edit({ address: ethAddress });
        expect(editedSub.address).to.equal(ethAddress);

        await waitUntil(() => startedSub.address === ethAddress, { timeout: 200000 });
        expect(startedSub.address).to.equal(ethAddress);

        await new Promise((resolve) => startedSub.once("update", resolve));

        const loadedSub = await customPlebbit.getSubplebbit(ethAddress);
        expect(loadedSub.address).to.equal(ethAddress);

        const createdSub = await customPlebbit.createSubplebbit({ address: ethAddress });
        expect(createdSub.signer).to.be.a("object");
        expect(createdSub.address).to.equal(ethAddress);

        // Test publishing a post on the new address
        await publishRandomPost(ethAddress, customPlebbit);

        await startedSub.stop();
    });
});
