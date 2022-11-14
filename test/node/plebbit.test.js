const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const { mockPlebbit } = require("../../dist/node/test/test-util");

// example of node only tests

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("plebbit", () => {
    let plebbit;

    before(async () => {
        plebbit = await Plebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
    });

    it("has default plebbit options", async () => {
        expect(plebbit.ipfsGatewayUrl).to.equal("https://cloudflare-ipfs.com");
        expect(plebbit.pubsubHttpClientOptions.url).to.equal("https://pubsubprovider.xyz/api/v0");
        expect(plebbit.dataPath).to.match(/\.plebbit$/);
    });

    it(`plebbit.listSubplebbits() lists subplebbits correctly`, async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
        const newSubplebbit = await plebbit.createSubplebbit({
            signer: await plebbit.createSigner()
        });
        await newSubplebbit.start();
        // A new subplebbit should be created, and its SQLite db file be listed under plebbit.dataPath/subplebbits
        const listedSubplebbits = await plebbit.listSubplebbits();
        expect(listedSubplebbits).to.include(newSubplebbit.address);
        await newSubplebbit.stop();
    });
});
