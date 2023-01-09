const Plebbit = require("../../../dist/node");
const { publishRandomPost, mockPlebbit } = require("../../../dist/node/test/test-util");
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
    let plebbit, subplebbit;
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
        expect(loadedSubplebbit.posts.pages).to.be.undefined;
        expect(loadedSubplebbit.posts.pageCids).to.be.undefined;
    });

    it(`Started Sub can receive publications on new ENS address`, async () => {
        await publishRandomPost(subplebbit.address, plebbit);
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
