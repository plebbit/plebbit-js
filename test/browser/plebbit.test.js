import Plebbit from "../../dist/node/index.js";
import { expect } from "chai";

// example of browser only tests

describe("plebbit", () => {
    it("Plebbit() has default plebbit options", async () => {
        // RPC exception
        const plebbit = await Plebbit();
        expect(Object.keys(plebbit.clients.ipfsGateways).sort()).to.deep.equal(["https://cloudflare-ipfs.com", "https://ipfs.io"].sort());
        expect(Object.keys(plebbit.clients.pubsubClients)).to.deep.equal(["https://pubsubprovider.xyz/api/v0"]);

        // no dataPath in brower
        expect(plebbit.dataPath).to.equal(undefined);
        expect(plebbit.browserLibp2pJsPublish).to.be.false;
        JSON.stringify(plebbit); // Will throw an error if circular json
    });
});

describe(`Plebbit.challenges`, async () => {
    it(`Plebbit.challenges = {} in browser environments`, async () => {
        expect(Plebbit.challenges).to.deep.equal({});
    });
});
