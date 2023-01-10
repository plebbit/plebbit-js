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
    after(async () => subplebbit.stop());

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
