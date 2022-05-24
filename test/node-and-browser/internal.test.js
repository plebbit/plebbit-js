const Plebbit = require("../../dist/node");
const { loadIpfsFileAsJson, loadIpnsAsJson } = require("../../dist/node/util");
const { expect } = require("chai");

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
        it("Loads an ipfs file as JSON correctly", async () => {
            const jsonFileTest = { 123: "123" };
            const jsonFileAsIpfs = await plebbit.ipfsClient.add(JSON.stringify(jsonFileTest));
            const jsonFileLoaded = await loadIpfsFileAsJson(jsonFileAsIpfs.cid, plebbit);
            expect(jsonFileLoaded).to.deep.equal(jsonFileTest);
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
            const jsonFileTest = { 123: "123" };
            const jsonFileAsIpfs = await plebbit.ipfsClient.add(JSON.stringify(jsonFileTest));
            const jsonFileAsIpns = await plebbit.ipfsClient.name.publish(jsonFileAsIpfs.cid, { allowOffline: true });
            const jsonFileLoaded = await loadIpnsAsJson(jsonFileAsIpns.name, plebbit);
            expect(jsonFileLoaded).to.deep.equal(jsonFileTest);
        });
    });
});
