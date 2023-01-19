const { mockPlebbit, publishRandomPost } = require("../../../dist/node/test/test-util");
const path = require("path");
const fs = require("fs");
const { default: waitUntil } = require("async-wait-until");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const syncInterval = 300;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("plebbit.listSubplebbits", async () => {
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
});

describe(`subplebbit.delete`, async () => {
    let plebbit, sub;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
        sub = await plebbit.createSubplebbit();
    });

    it(`Deleted sub is not listed in listSubplebbits`, async () => {
        const subs = await plebbit.listSubplebbits();
        expect(subs).to.include(sub.address);
        const subRecreated = await plebbit.createSubplebbit({ address: sub.address });
        await subRecreated.delete();
        const subsAfterDeletion = await plebbit.listSubplebbits();
        expect(subsAfterDeletion).to.not.include(sub.address);
    });

    it(`Deleted sub ipfs keys are not listed in ipfs node`, async () => {
        const ipfsKeys = await plebbit.ipfsClient.key.list();
        const subKeyExists = ipfsKeys.some((key) => key.name === sub.ipnsKeyName);
        expect(subKeyExists).to.be.false;
    });

    it(`Deleted sub db is moved to datapath/subplebbits/deleted`, async () => {
        const expectedPath = path.join(plebbit.dataPath, "subplebbits", "deleted", sub.address);
        expect(fs.existsSync(expectedPath)).to.be.true;
    });
});

describe(`subplebbit.lastPostCid`, async () => {
    let plebbit, sub;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
        sub = await plebbit.createSubplebbit();
        sub._syncIntervalMs = syncInterval;
        sub.setProvideCaptchaCallback(async () => [[], "Challenge skipped"]);
        await sub.start();
        await new Promise((resolve) => sub.once("update", resolve));
    });

    after(async () => await sub.stop());

    it(`subplebbit.lastPostCid reflects latest post published`, async () => {
        expect(sub.lastPostCid).to.be.undefined;
        const post = await publishRandomPost(sub.address, plebbit);
        await waitUntil(() => typeof sub.lastPostCid === "string", { timeout: 200000 });
        expect(sub.lastPostCid).to.equal(post.cid);
    });
});
