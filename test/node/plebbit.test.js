const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const fs = require("fs/promises");
const path = require("path");

// example of node only tests

describe("plebbit", () => {
    let plebbit;

    before(async () => {
        plebbit = await Plebbit();
    });

    it("has default plebbit options", async () => {
        expect(plebbit.ipfsGatewayUrl).to.equal("https://cloudflare-ipfs.com");
        expect(plebbit.pubsubHttpClientOptions.url).to.equal("https://pubsubprovider.xyz/api/v0");
        expect(plebbit.dataPath).to.match(/\.plebbit$/);
    });

    it(`plebbit.listSubplebbits() lists subplebbits correctly`, async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
        plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
            if (authorAddress === "plebbit.eth") return signers[6].address;
            else if (authorAddress === "testgibbreish.eth") return undefined;
            return authorAddress;
        };
        const newSubplebbit = await plebbit.createSubplebbit({ signer: await plebbit.createSigner() });
        await newSubplebbit.start();
        // A new subplebbit should be created, and its SQLite db file be listed under plebbit.dataPath/subplebbits
        const listedSubplebbits = await plebbit.listSubplebbits();
        expect(listedSubplebbits).to.include(newSubplebbit.address);
        await newSubplebbit.stopPublishing();
        await fs.rm(path.join(plebbit.dataPath, "subplebbits", newSubplebbit.address)); // Cleanup subplebbit
    });
});
