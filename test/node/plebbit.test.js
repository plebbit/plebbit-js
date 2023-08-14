const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const { mockPlebbit } = require("../../dist/node/test/test-util");

// example of node only tests

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

describe("plebbit", () => {
    it("has default plebbit options", async () => {
        // RPC exception
        const plebbit = await Plebbit({ dataPath: globalThis["window"]?.plebbitDataPath }); 
        expect(Object.keys(plebbit.clients.ipfsGateways).sort()).to.deep.equal(["https://cloudflare-ipfs.com", "https://ipfs.io"].sort());
        expect(Object.keys(plebbit.clients.pubsubClients)).to.deep.equal(["https://pubsubprovider.xyz/api/v0"]);
        expect(plebbit.dataPath).to.match(/\.plebbit$/);
    });

    it(`plebbit.listSubplebbits() lists subplebbits correctly`, async () => {
        const plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
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
