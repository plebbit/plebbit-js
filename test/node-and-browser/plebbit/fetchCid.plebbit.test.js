import { expect } from "chai";
import Plebbit from "../../../dist/node/index.js";
import signers from "../../fixtures/signers.js";
import {
    addStringToIpfs,
    getRemotePlebbitConfigs,
    mockGatewayPlebbit,
    itSkipIfRpc,
    isPlebbitFetchingUsingGateways
} from "../../../dist/node/test/test-util.js";
const fixtureSigner = signers[0];

// TODO this has to be ran inside getRemotePlebbitConfigs
getRemotePlebbitConfigs().map((config) => {
    describe(`plebbit.fetchCid - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });

        after(async () => {
            await plebbit.destroy();
        });

        it(`Can fetch a cid correctly`, async () => {
            const fileString = "Hello plebs";
            const cid = await addStringToIpfs(fileString);
            expect(cid).to.equal("QmbWqTYuyfcpDyn6gawRf5eSFVtYnGDAKttjESXjjbAHbr");
            const contentFromFetchCid = await plebbit.fetchCid(cid);
            expect(contentFromFetchCid).to.equal(fileString);
        });

        it(`Throws an error if malicious RPC modifies content of file in plebbit.fetchCid`);

        it("plebbit.fetchCid() throws if provided with invalid cid", async () => {
            const gibberishCid = "12345";

            try {
                await plebbit.fetchCid(gibberishCid);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_INVALID_CID_STRING_SCHEMA");
            }
        });
        it("plebbit.fetchCid() loads an ipfs file under 1mb as JSON correctly", async () => {
            const jsonFileTest = { 123: "123" };
            const cid = await addStringToIpfs(JSON.stringify(jsonFileTest));
            expect(cid).to.equal("QmaZN2117dty2gHUDx2kHM61Vz9UcVDHFCx9PQt2bP2CEo");
            expect(JSON.parse(await plebbit.fetchCid(cid))).to.deep.equal(jsonFileTest);
        });

        it("Throws an error when file to download is over 1mb", async () => {
            const twoMbObject = { testString: "x".repeat(2 * 1024 * 1024) };

            const cid = await addStringToIpfs(JSON.stringify(twoMbObject)); // Cid of a file with over 1mb size
            expect(cid).to.equal("QmQZDGmHHPetkjoMKP9sjnV5HaCVubJLnNUzQeCtzxLDX4");

            try {
                await plebbit.fetchCid(cid);
                expect.fail("should not succeed");
            } catch (e) {
                if (isPlebbitFetchingUsingGateways(plebbit)) {
                    expect(e.code).to.equal("ERR_FAILED_TO_FETCH_GENERIC_IPFS_FROM_GATEWAYS");
                    expect(e.details.gatewayToError[Object.keys(e.details.gatewayToError)[0]].code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
                } else {
                    // fetching with kubo/helia
                    expect(e.code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
                }
            }
        });
    });
});

getRemotePlebbitConfigs({ includeOnlyTheseTests: ["remote-ipfs-gateway"] }).map((config) => {
    describe("plebbit.fetchCid - " + config.name, () => {
        it(`Throws an error if malicious gateway modifies content of file`, async () => {
            // RPC exception
            const [fileString1, fileString2] = ["Hello plebs", "Hello plebs 2"];
            const cids = await Promise.all([fileString1, fileString2].map((file) => addStringToIpfs(file)));

            const plebbitWithMaliciousGateway = await mockGatewayPlebbit({
                ipfsGatewayUrls: ["http://127.0.0.1:13415"],
                httpRoutersOptions: [],
                dataPath: undefined
            });
            const fileString1FromGateway = await plebbitWithMaliciousGateway.fetchCid(cids[0]);
            expect(fileString1).to.equal(fileString1FromGateway);

            // The following line should throw since the malicious gateway would send a content that differs from original content

            try {
                await plebbitWithMaliciousGateway.fetchCid(cids[1]);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.code).to.equal("ERR_FAILED_TO_FETCH_GENERIC_IPFS_FROM_GATEWAYS");
                expect(e.details.gatewayToError[Object.keys(e.details.gatewayToError)[0]].code).to.equal(
                    "ERR_CALCULATED_CID_DOES_NOT_MATCH"
                );
            }
            await plebbitWithMaliciousGateway.destroy();
        });

        it(`plebbit.fetchCid() resolves with the first gateway response`, async () => {
            // Have two gateways, the first is a gateway that takes 10s to respond, and the second should be near instant
            // RPC exception
            const multipleGatewayPlebbit = await Plebbit({
                ipfsGatewayUrls: ["http://localhost:13417", "http://127.0.0.1:18080"],
                httpRoutersOptions: [],
                dataPath: undefined
            });

            const cid = "QmaZN2117dty2gHUDx2kHM61Vz9UcVDHFCx9PQt2bP2CEo"; // Cid from previous test

            const timeBefore = Date.now();
            const content = await multipleGatewayPlebbit.fetchCid(cid);
            expect(content).to.be.a("string");
            const timeItTookInMs = Date.now() - timeBefore;
            expect(timeItTookInMs).to.be.lessThan(9000);

            await multipleGatewayPlebbit.destroy();
        });
    });
});
