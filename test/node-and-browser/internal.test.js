const Plebbit = require("../../dist/node");
const { parseJsonStrings } = require("../../dist/node/util");
const chai = require("chai");
const fetch = require("node-fetch");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const { messages } = require("../../dist/node/errors");
const { mockPlebbit } = require("../../dist/node/test/test-util");

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

// TODO rewrite this
describe("Test util functions", async () => {
    let plebbit, gatewayPlebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        gatewayPlebbit = await Plebbit({
            ipfsGatewayUrls: ["http://127.0.0.1:18080"]
        });
    });

    if (process.env.NO_INTERNET === "1")
        it(`Test environment has no access to internet`, async () => {
            await assert.isRejected(fetch("https://ifconfig.me"));
        });

    describe("loadIpnsAsJson", async () => {
        it("Throws if provided with invalid ipns", async () => {
            const gibberishIpns = "12345";
            await assert.isRejected(
                plebbit._clientsManager.fetchSubplebbitIpns(gibberishIpns),
                messages.ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS
            ); // Provide message here
            await assert.isRejected(
                gatewayPlebbit._clientsManager.fetchSubplebbitIpns(gibberishIpns),
                messages.ERR_FAILED_TO_FETCH_IPNS_VIA_GATEWAY
            ); // Provide message here
        });
        it("Loads an IPNS file as JSON correctly", async () => {
            const jsonFileTest = { 1234: "1234" };
            const cid = (await plebbit._clientsManager.getDefaultIpfs()._client.add(JSON.stringify(jsonFileTest))).path;
            const jsonFileAsIpns = await plebbit._clientsManager.getDefaultIpfs()._client.name.publish(cid, { allowOffline: true });
            let jsonFileLoaded = JSON.parse(await plebbit._clientsManager.fetchSubplebbitIpns(jsonFileAsIpns.name));
            expect(jsonFileLoaded).to.deep.equal(jsonFileTest);
            jsonFileLoaded = JSON.parse(await gatewayPlebbit._clientsManager.fetchSubplebbitIpns(jsonFileAsIpns.name));
            expect(jsonFileLoaded).to.deep.equal(jsonFileTest);
        });

        it(`Throws an error when file to download is over 1mb and we're loading it via gateway`, async () => {
            const twoMbObject = { testString: "x".repeat(2 * 1024 * 1024) };

            const cid = (await plebbit._clientsManager.getDefaultIpfs()._client.add(JSON.stringify(twoMbObject))).path; // Cid of a file with over 1mb size

            const ipns = (
                await plebbit._clientsManager.getDefaultIpfs()._client.name.publish(cid, {
                    lifetime: "5m",
                    allowOffline: true
                })
            ).name;

            await assert.isRejected(gatewayPlebbit._clientsManager.fetchSubplebbitIpns(ipns), messages.ERR_OVER_DOWNLOAD_LIMIT);
        });
    });
});

describe(`Test parsing of database queries`, async () => {
    it(`Can parse regular json object with a field that's json string`, async () => {
        const rawObj = {
            author: '{"address":"12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR","displayName":"Mock Author - 1676110849.7439198"}'
        };
        const parsed = parseJsonStrings(rawObj);
        expect(parsed).to.be.a("object");
        expect(parsed.author).to.be.a("object");
        expect(parsed.author.address).to.equal("12D3KooWN5rLmRJ8fWMwTtkDN7w2RgPPGRM4mtWTnfbjpi1Sh7zR");
        expect(parsed.author.displayName).to.equal("Mock Author - 1676110849.7439198");
    });

    it(`Can parse regular json object with a boolean field (hardcoded)`, async () => {
        const rawObj = {
            removed: 1
        };
        const parsed = parseJsonStrings(rawObj);
        expect(parsed).to.be.a("object");
        expect(parsed.removed).to.equal(true);
    });
});
