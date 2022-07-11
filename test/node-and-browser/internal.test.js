const Plebbit = require("../../dist/node");
const { loadIpfsFileAsJson, loadIpnsAsJson } = require("../../dist/node/util");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe("Test util functions", async () => {
    let plebbit;
    before(async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
    });
    describe("loadIpfsAsJson", async () => {
        it("Throws if provided with invalid cid", async () =>
            new Promise(async (resolve, reject) => {
                const gibberishCid = "12345";
                try {
                    await loadIpfsFileAsJson(gibberishCid, plebbit);
                    reject();
                } catch (e) {
                    resolve();
                }
            }));
        it("Loads an ipfs file under 1mb as JSON correctly", async () => {
            const jsonFileTest = { 123: "123" };
            const cid = (await plebbit.ipfsClient.add(JSON.stringify(jsonFileTest))).path;
            let jsonFileLoaded = await loadIpfsFileAsJson(cid, plebbit);
            expect(jsonFileLoaded).to.deep.equal(jsonFileTest);
            const gatewayPlebbit = await Plebbit({
                ipfsGatewayUrl: "http://localhost:8080"
            });
            jsonFileLoaded = await loadIpfsFileAsJson(cid, gatewayPlebbit);
            expect(jsonFileLoaded).to.deep.equal(jsonFileTest);
        });

        it("Throws an error when file to download is over 1mb for both loading via IPFS and gateway", async () => {
            const twoMbObject = { testString: "x".repeat(2 * 1024 * 1024) };

            const cid = (await plebbit.ipfsClient.add(JSON.stringify(twoMbObject))).path; // Cid of a file with over 1mb size

            await assert.isRejected(loadIpfsFileAsJson(cid, plebbit));
            await assert.isRejected(
                loadIpfsFileAsJson(
                    cid,
                    await Plebbit({
                        ipfsGatewayUrl: "http://localhost:8080"
                    })
                )
            );
        });
    });

    describe("loadIpnsAsJson", async () => {
        it("Throws if provided with invalid ipns", async () =>
            new Promise(async (resolve, reject) => {
                const gibberishIpns = "12345";
                try {
                    await loadIpnsAsJson(gibberishIpns, plebbit);
                    reject();
                } catch (e) {
                    resolve();
                }
            }));
        it("Loads an IPNS file as JSON correctly", async () => {
            const jsonFileTest = { 1234: "1234" };
            const cid = (await plebbit.ipfsClient.add(JSON.stringify(jsonFileTest))).path;
            const jsonFileAsIpns = await plebbit.ipfsClient.name.publish(cid, { allowOffline: true });
            let jsonFileLoaded = await loadIpnsAsJson(jsonFileAsIpns.name, plebbit);
            expect(jsonFileLoaded).to.deep.equal(jsonFileTest);
            const gatewayPlebbit = await Plebbit({
                ipfsGatewayUrl: "http://localhost:8080"
            });
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

            const gatewayPlebbit = await Plebbit({
                ipfsGatewayUrl: "http://localhost:8080"
            });

            await assert.isRejected(loadIpnsAsJson(ipns, gatewayPlebbit));
        });
    });
});
