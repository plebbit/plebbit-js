const Plebbit = require("../../dist/browser");
const { expect } = require("chai");

// example of browser only tests

describe("plebbit", () => {
    let plebbit;

    before(async () => {
        plebbit = await Plebbit();
    });

    it("has default plebbit options", async () => {
        expect(plebbit.ipfsGatewayUrl).to.equal("https://cloudflare-ipfs.com");
        expect(plebbit.pubsubHttpClientOptions).to.equal("https://pubsubprovider.xyz/api/v0");

        // no dataPath in brower
        expect(plebbit.dataPath).to.equal(undefined);
    });
});
