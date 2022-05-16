const Plebbit = require("../../dist/node");
const { expect } = require("chai");

// example of node only tests

describe("plebbit", () => {
    let plebbit;

    before(async () => {
        plebbit = await Plebbit();
    });

    it("has default plebbit options", async () => {
        expect(plebbit.ipfsGatewayUrl).to.equal("https://cloudflare-ipfs.com");
        expect(plebbit.pubsubHttpClientOptions).to.equal("https://pubsubprovider.xyz/api/v0");
        expect(plebbit.dataPath).to.match(/\.plebbit$/);
    });
});
