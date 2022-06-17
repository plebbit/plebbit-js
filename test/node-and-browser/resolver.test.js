const Plebbit = require("../../dist/node");
const { expect } = require("chai");

let plebbit;

describe("Test ENS resolving", async () => {
    before(async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
    });

    it("plebbit.eth subplebbit resolve correctly", async () => {
        const expectedSubplebbitAddress = "QmW5Zt7YXmtskSUjjenGNS3QNRbjqjUPaT35zw5RYUCtY1";
        const resolvedAddress = await plebbit.resolver.resolveSubplebbitAddressIfNeeded("plebbit.eth");
        expect(resolvedAddress).to.equal(expectedSubplebbitAddress);
    });

    it("plebbit.eth author resolves correctly", async () => {
        const expectedAuthorAddress = "QmX18Ls7iss1BLXYjZqP5faFoXih7YYSUkADdATHxiXmnu";
        const resolvedAddress = await plebbit.resolver.resolveAuthorAddressIfNeeded("plebbit.eth");
        expect(resolvedAddress).to.equal(expectedAuthorAddress);
    });

    it("Throws an error if subplebbit domain has no subplebbit-address text record", async () => {
        try {
            await plebbit.resolver.resolveSubplebbitAddressIfNeeded("gibbresh.eth");
            expect.fail("Should throw an error if domain has no subplebbit-address");
        } catch {}
    });

    it("Throws an error if author domain has no plebbit-author-address text record", async () => {
        try {
            await plebbit.resolver.resolveAuthorAddressIfNeeded("gibbresh.eth");
            expect.fail("Should throw an error if domain has no plebbit-author-address");
        } catch {}
    });

    it("can load plebwhales.eth subplebbit via plebbit.getSubplebbit", async () => {
        const subplebbit = await plebbit.getSubplebbit("plebwhales.eth");
        expect(subplebbit.address).to.equal("QmYAByLN2Dq7WRfoRmYY5CVSQtZw5pGw7b9jQW121harvh");
        // I'd add more tests for subplebbit.title and subplebbit.description here but the ipfs node is offline, and won't be able to retrieve plebwhales.eth IPNS record
    });
});
