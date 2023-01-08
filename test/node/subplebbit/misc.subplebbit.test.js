const { mockPlebbit } = require("../../../dist/node/test/test-util");
const { encode } = require("../../../dist/node/util");
const path = require("path");
const fs = require("fs");
const { default: waitUntil } = require("async-wait-until");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const syncInterval = 300;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("subplebbit", async () => {
    let plebbit, subSigner;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
        subSigner = await plebbit.createSigner();
    });

    it(`listSubplebbits shows unlocked created subplebbits`, async () => {
        const title = "Test listSubplebbits" + Date.now();

        plebbit.createSubplebbit({ signer: subSigner, title: title });

        await waitUntil(async () => (await plebbit.listSubplebbits()).includes(subSigner.address), {
            timeout: 200000
        });

        // At this point the sub should be unlocked and ready to be recreated by another instance
        const createdSubplebbit = await plebbit.createSubplebbit({ address: subSigner.address });

        expect(createdSubplebbit.address).to.equal(subSigner.address);
        expect(createdSubplebbit.title).to.equal(title);
        await createdSubplebbit.stop();
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

    it(`Two local sub instances can receive each other confidential updates`);

    it(`Deleted sub is not listed in listSubplebbits`, async () => {
        const subs = await plebbit.listSubplebbits();
        expect(subs).to.include(subSigner.address);
        const subRecreated = await plebbit.createSubplebbit({ address: subSigner.address });
        await subRecreated.delete();
        const subsAfterDeletion = await plebbit.listSubplebbits();
        expect(subsAfterDeletion).to.not.include(subSigner.address);
    });

    it(`Deleted sub ipfs keys are not listed in ipfs node`, async () => {
        const ipfsKeys = await plebbit.ipfsClient.key.list();
        const subKeyExists = ipfsKeys.some((key) => key.name === subSigner.ipnsKeyName);
        expect(subKeyExists).to.be.false;
    });

    it(`Deleted sub db is moved to datapath/subplebbits/deleted`, async () => {
        const expectedPath = path.join(plebbit.dataPath, "subplebbits", "deleted", subSigner.address);
        expect(fs.existsSync(expectedPath)).to.be.true;
    });
});
