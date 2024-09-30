import Plebbit from "../../dist/node";
import { expect } from "chai";
import { mockPlebbit } from "../../dist/node/test/test-util";

// example of node only tests

describe("plebbit", () => {
    it("has default plebbit options", async () => {
        const plebbit = await Plebbit();
        expect(Object.keys(plebbit.clients.ipfsGateways).sort()).to.deep.equal(["https://dweb.link", "https://ipfs.io"].sort());
        expect(Object.keys(plebbit.clients.pubsubClients)).to.deep.equal(["https://pubsubprovider.xyz/api/v0"]);
        expect(plebbit.clients.ipfsClients).to.deep.equal({});
        expect(plebbit.ipfsHttpClientsOptions).to.be.undefined;
        expect(plebbit.pubsubHttpClientsOptions).to.deep.equal([{ url: "https://pubsubprovider.xyz/api/v0" }]);
        expect(Object.keys(plebbit.chainProviders).sort()).to.deep.equal(["avax", "eth", "matic", "sol"]);
        expect(Object.keys(plebbit.clients.chainProviders).sort()).to.deep.equal(["avax", "eth", "matic", "sol"]);

        expect(plebbit.dataPath).to.match(/\.plebbit$/);

        JSON.stringify(plebbit); // Will throw an error if circular json
    });

    it(`plebbit.subplebbits updates after creating a new sub`, async () => {
        const plebbit = await mockPlebbit();
        const newSubplebbit = await plebbit.createSubplebbit({
            signer: await plebbit.createSigner()
        });
        // A new subplebbit should be created, and its SQLite db file be listed under plebbit.dataPath/subplebbits
        expect(plebbit.subplebbits).to.include(newSubplebbit.address);

        JSON.stringify(plebbit); // Will throw an error if circular json
    });
});

describe(`Plebbit.challenges`, async () => {
    it(`Plebbit.challenges contains default challenges`, async () => {
        const challenges = Object.keys(Plebbit.challenges);
        expect(challenges).to.deep.equal(["text-math", "captcha-canvas-v3", "fail", "blacklist", "question", "evm-contract-call"]);
    });
});
