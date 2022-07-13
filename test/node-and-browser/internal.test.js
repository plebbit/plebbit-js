const Plebbit = require("../../dist/node");
const { loadIpfsFileAsJson, loadIpnsAsJson } = require("../../dist/node/util");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe("Test util functions", async () => {
    let plebbit, gatewayPlebbit;
    before(async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
        gatewayPlebbit = await Plebbit({
            ipfsGatewayUrl: "http://127.0.0.1:8080"
        });
    });
    describe("loadIpfsAsJson", async () => {
        it("Throws if provided with invalid cid", async () => {
            const gibberishCid = "12345";

            await assert.isRejected(loadIpfsFileAsJson(gibberishCid, plebbit), "invalid path");
            await assert.isRejected(loadIpfsFileAsJson(gibberishCid, gatewayPlebbit), "Status code 404");
        });
        it("Loads an ipfs file under 1mb as JSON correctly", async () => {
            const jsonFileTest = { 123: "123" };
            const cid = (await plebbit.ipfsClient.add(JSON.stringify(jsonFileTest))).path;
            let jsonFileLoaded = await loadIpfsFileAsJson(cid, plebbit);
            expect(jsonFileLoaded).to.deep.equal(jsonFileTest);

            jsonFileLoaded = await loadIpfsFileAsJson(cid, gatewayPlebbit);
            expect(jsonFileLoaded).to.deep.equal(jsonFileTest);
        });

        it("Throws an error when file to download is over 1mb for both loading via IPFS and gateway", async () => {
            const twoMbObject = { testString: "x".repeat(2 * 1024 * 1024) };

            const cid = (await plebbit.ipfsClient.add(JSON.stringify(twoMbObject))).path; // Cid of a file with over 1mb size

            await assert.isRejected(loadIpfsFileAsJson(cid, plebbit), "Unexpected end of JSON input");
            await assert.isRejected(loadIpfsFileAsJson(cid, gatewayPlebbit), "content size");
        });
    });

    describe("loadIpnsAsJson", async () => {
        it("Throws if provided with invalid ipns", async () => {
            const gibberishIpns = "12345";
            await assert.isRejected(loadIpnsAsJson(gibberishIpns, plebbit), "could not resolve name");
        });
        it("Loads an IPNS file as JSON correctly", async () => {
            const jsonFileTest = { 1234: "1234" };
            const cid = (await plebbit.ipfsClient.add(JSON.stringify(jsonFileTest))).path;
            const jsonFileAsIpns = await plebbit.ipfsClient.name.publish(cid, { allowOffline: true });
            let jsonFileLoaded = await loadIpnsAsJson(jsonFileAsIpns.name, plebbit);
            expect(jsonFileLoaded).to.deep.equal(jsonFileTest);
            jsonFileLoaded = await loadIpnsAsJson(jsonFileAsIpns.name, gatewayPlebbit);
            expect(jsonFileLoaded).to.deep.equal(jsonFileTest);
        });

        it(`Throws an error when file to download is over 1mb and we're loading it via gateway`, async () => {
            const twoMbObject = { testString: "x".repeat(2 * 1024 * 1024) };

            const cid = (await plebbit.ipfsClient.add(JSON.stringify(twoMbObject))).path; // Cid of a file with over 1mb size

            const ipns = (
                await plebbit.ipfsClient.name.publish(cid, {
                    lifetime: "5m",
                    allowOffline: true
                })
            ).name;

            await assert.isRejected(loadIpnsAsJson(ipns, gatewayPlebbit), "content size");
        });
    });
});
