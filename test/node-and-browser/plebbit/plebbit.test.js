import { expect } from "chai";
import Plebbit from "../../../dist/node/index.js";
import signers from "../../fixtures/signers.js";
import {
    mockRemotePlebbit,
    itIfRpc,
    describeIfRpc,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    resolveWhenConditionIsTrue,
    mockRpcRemotePlebbit,
    mockGatewayPlebbit,
    itSkipIfRpc
} from "../../../dist/node/test/test-util.js";
const fixtureSigner = signers[0];

let defaultIpfsGatewayUrls;

describe("Plebbit options", async () => {
    before(async () => {
        const plebbit = await Plebbit({ httpRoutersOptions: [] });
        defaultIpfsGatewayUrls = plebbit.ipfsGatewayUrls;
    });
    it("Plebbit() uses correct default plebbit options", async () => {
        const defaultPlebbit = await Plebbit({ httpRoutersOptions: [] });
        expect(Object.keys(defaultPlebbit.clients.ipfsGateways).sort()).to.deep.equal(defaultIpfsGatewayUrls.sort());
        expect(Object.keys(defaultPlebbit.clients.pubsubKuboRpcClients).sort()).to.deep.equal(
            ["https://pubsubprovider.xyz/api/v0", "https://plebpubsub.xyz/api/v0"].sort()
        );
        expect(defaultPlebbit.pubsubKuboRpcClientsOptions.headers?.authorization).to.be.undefined;

        // no dataPath in browser
        if (typeof window === "undefined") {
            expect(defaultPlebbit.dataPath).to.match(/\.plebbit$/);
        } else {
            expect(defaultPlebbit.dataPath).to.equal(undefined);
        }
        JSON.stringify(defaultPlebbit); // Will throw an error if circular json
    });

    it("Plebbit Options is set up correctly when only kuboRpcClientsOptions is provided", async () => {
        // RPC exception
        const url = "http://localhost:15018/api/v0"; // offline API
        const options = { kuboRpcClientsOptions: [url], httpRoutersOptions: [], dataPath: undefined };
        const testPlebbit = await Plebbit(options);
        expect(testPlebbit.clients.kuboRpcClients[url]).to.exist;
        expect(testPlebbit.clients.pubsubKuboRpcClients[url]).to.exist;
        expect(Object.keys(testPlebbit.clients.ipfsGateways).sort()).to.deep.equal(defaultIpfsGatewayUrls.sort());
        expect(Object.keys(testPlebbit.clients.kuboRpcClients)).to.deep.equal([url]);

        expect(Object.keys(testPlebbit.clients.pubsubKuboRpcClients)).to.deep.equal([url]);
        JSON.stringify(testPlebbit); // Will throw an error if circular json
    });

    it(`Plebbit({kuboRpcClientsOptions}) uses specified node even if ipfs node is down`, async () => {
        // RPC exception
        const url = "http://localhost:12323/api/v0"; // Should be offline
        const plebbit = await Plebbit({ kuboRpcClientsOptions: [url], httpRoutersOptions: [] });

        expect(Object.keys(plebbit.clients.ipfsGateways).sort()).to.deep.equal(defaultIpfsGatewayUrls.sort());
        expect(Object.keys(plebbit.clients.pubsubKuboRpcClients)).to.deep.equal([url]);
        expect(Object.keys(plebbit.clients.kuboRpcClients)).to.deep.equal([url]);

        expect(plebbit.pubsubKuboRpcClientsOptions).to.deep.equal([{ url }]);
        expect(plebbit.kuboRpcClientsOptions).to.deep.equal([{ url }]);
        JSON.stringify(plebbit); // Will throw an error if circular json
    });

    itIfRpc(`Plebbit({plebbitRpcClientsOptions}) sets up correctly`, async () => {
        const rpcUrl = "ws://localhost:39652";
        const plebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl], httpRoutersOptions: [] });
        expect(plebbit.plebbitRpcClientsOptions).to.deep.equal([rpcUrl]);
        expect(Object.keys(plebbit.clients.plebbitRpcClients)).to.deep.equal([rpcUrl]);
        expect(plebbit.pubsubKuboRpcClientsOptions).to.be.undefined;
        expect(plebbit.chainProviders).to.deep.equal({});
        expect(plebbit.clients.chainProviders).to.deep.equal({});
        expect(plebbit.clients.kuboRpcClients).to.deep.equal({});
        expect(plebbit.clients.pubsubKuboRpcClients).to.deep.equal({});
        expect(plebbit.clients.ipfsGateways).to.deep.equal({});
        JSON.stringify(plebbit); // Will throw an error if circular json
    });

    it(`Plebbit({dataPath: undefined}) sets plebbit.dataPath to undefined`, async () => {
        const plebbit = await Plebbit({ dataPath: undefined, httpRoutersOptions: [] });
        expect(plebbit.dataPath).to.be.undefined;
    });

    itIfRpc("Error is thrown if RPC is down", async () => {
        const plebbit = await mockRpcRemotePlebbit({ plebbitRpcClientsOptions: ["ws://localhost:39650"] }); // Already has RPC config
        // plebbit.subplebbits will take 20s to timeout and throw this error
        try {
            await plebbit.fetchCid("QmYHzA8euDgUpNy3fh7JRwpPwt6jCgF35YTutYkyGGyr8f"); // random cid
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_FAILED_TO_OPEN_CONNECTION_TO_RPC"); // Use the rpc so it would detect it's not loading
        }
    });

    it(`Plebbit({ipfsGateways: undefined}) uses default gateways`, async () => {
        const plebbit = await Plebbit({ ipfsGatewayUrls: undefined, httpRoutersOptions: [] });
        expect(Object.keys(plebbit.clients.ipfsGateways).sort()).to.deep.equal(defaultIpfsGatewayUrls.sort());
        expect(plebbit.ipfsGatewayUrls.sort()).to.deep.equal(defaultIpfsGatewayUrls.sort());
        JSON.stringify(plebbit); // Will throw an error if circular json
    });

    it(`Plebbit({ipfsGateways: []}) sets plebbit instance to not use gateways`, async () => {
        const plebbit = await Plebbit({ ipfsGatewayUrls: [], httpRoutersOptions: [] });
        expect(plebbit.clients.ipfsGateways).to.deep.equal({});
        expect(plebbit.ipfsGatewayUrls).to.be.undefined;
        JSON.stringify(plebbit); // Will throw an error if circular json
    });
});

describe("plebbit.createSigner", async () => {
    let plebbit, signer;
    const isBase64 = (testString) => /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}))?$/gm.test(testString);
    before(async () => {
        plebbit = await mockRemotePlebbit();
        signer = await plebbit.createSigner();
    });

    it("without private key argument", async () => {
        expect(signer).not.to.equal(undefined);
        expect(isBase64(signer.privateKey)).to.be.true;
        expect(isBase64(signer.publicKey)).to.be.true;
        expect(signer.address).to.match(/^12D3KooW/);
        expect(signer.type).to.equal("ed25519");
    });

    it("with private key argument", async () => {
        const signer = await plebbit.createSigner({ privateKey: fixtureSigner.privateKey, type: "ed25519" });
        expect(signer).not.to.equal(undefined);
        expect(signer.privateKey).to.equal(fixtureSigner.privateKey);
        expect(signer.publicKey).to.equal(fixtureSigner.publicKey);
        expect(signer.address).to.equal(fixtureSigner.address);
        expect(signer.type).to.equal("ed25519");
    });

    it("generate same signer twice", async () => {
        const signer2 = await plebbit.createSigner({ privateKey: signer.privateKey, type: signer.type });
        expect(signer.privateKey).to.equal(signer2.privateKey);
        expect(signer.publicKey).to.equal(signer2.publicKey);
        expect(signer.address).to.equal(signer2.address);
        expect(signer.type).to.equal(signer2.type);
    });
});

describe(`plebbit.destroy`, async () => {
    it("Should succeed if we have a comment and a subplebbit already updating", async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const subplebbit = await plebbit.getSubplebbit(fixtureSigner.address);
        const commentCid = subplebbit.posts.pages.hot.comments[0].cid;

        const comment = await plebbit.createComment({ cid: commentCid });
        await comment.update();
        await resolveWhenConditionIsTrue(comment, () => typeof comment.updatedAt === "number");
        expect(plebbit._updatingComments[commentCid]).to.exist;

        await plebbit.destroy(); // should not fail
        expect(plebbit._updatingComments[commentCid]).to.not.exist;
        expect(plebbit._updatingSubplebbits[comment.subplebbitAddress]).to.not.exist;
        expect(comment.state).to.equal("stopped");
    });

    it(`plebbit.destroy() should not fail if you stop reply and immedietly destroy plebbit after`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const subplebbit = await plebbit.getSubplebbit(fixtureSigner.address);
        const replyCid = subplebbit.posts.pages.hot.comments.find((post) => post.replies).replies.pages.best.comments[0].cid;

        const reply = await plebbit.createComment({ cid: replyCid });
        await reply.update();
        await resolveWhenConditionIsTrue(reply, () => typeof reply.updatedAt === "number");
        expect(plebbit._updatingComments[replyCid]).to.exist;

        await reply.stop();
        await plebbit.destroy(); // should not fail
        expect(plebbit._updatingComments[replyCid]).to.not.exist;
    });

    it(`after destroying plebbit, nobody can use any function of plebbit`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        await plebbit.destroy();
        try {
            await plebbit.fetchCid("QmYHzA8euDgUpNy3fh7JRwpPwt6jCgF35YTutYkyGGyr8f");
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_PLEBBIT_IS_DESTROYED");
        }
    });
});

describe("plebbit.fetchCid", async () => {
    let plebbit, gatewayPlebbit, ipfsPlebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit(); // Here this should be alternated for RPC
        gatewayPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: ["http://127.0.0.1:18080"] }); // Should not be alternated
        ipfsPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    });

    it(`Can fetch a cid correctly`, async () => {
        const fileString = "Hello plebs";
        const cid = (await ipfsPlebbit._clientsManager.getDefaultIpfs()._client.add(fileString)).path;
        const contentFromFetchCid = await plebbit.fetchCid(cid);
        expect(contentFromFetchCid).to.equal(fileString);
        const contentFromGatewayFetchCid = await gatewayPlebbit.fetchCid(cid);
        expect(contentFromGatewayFetchCid).to.equal(fileString);
    });

    itSkipIfRpc(`Throws an error if malicious gateway modifies content of file`, async () => {
        // RPC exception
        const [fileString1, fileString2] = ["Hello plebs", "Hello plebs 2"];
        const cids = (
            await Promise.all([fileString1, fileString2].map((file) => ipfsPlebbit._clientsManager.getDefaultIpfs()._client.add(file)))
        ).map((res) => res.path);

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
            expect(e.details.gatewayToError[Object.keys(e.details.gatewayToError)[0]].code).to.equal("ERR_CALCULATED_CID_DOES_NOT_MATCH");
        }
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

        try {
            await gatewayPlebbit.fetchCid(gibberishCid);
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e.code).to.equal("ERR_INVALID_CID_STRING_SCHEMA");
        }
    });
    it("plebbit.fetchCid() loads an ipfs file under 1mb as JSON correctly", async () => {
        const jsonFileTest = { 123: "123" };
        const cid = (await ipfsPlebbit._clientsManager.getDefaultIpfs()._client.add(JSON.stringify(jsonFileTest))).path;
        expect(cid).to.equal("QmaZN2117dty2gHUDx2kHM61Vz9UcVDHFCx9PQt2bP2CEo");
        expect(JSON.parse(await plebbit.fetchCid(cid))).to.deep.equal(jsonFileTest);
        expect(JSON.parse(await gatewayPlebbit.fetchCid(cid))).to.deep.equal(jsonFileTest);
    });

    it("Throws an error when file to download is over 1mb for both loading via IPFS and gateway", async () => {
        const twoMbObject = { testString: "x".repeat(2 * 1024 * 1024) };

        const cid = (await ipfsPlebbit._clientsManager.getDefaultIpfs()._client.add(JSON.stringify(twoMbObject))).path; // Cid of a file with over 1mb size
        expect(cid).to.equal("QmQZDGmHHPetkjoMKP9sjnV5HaCVubJLnNUzQeCtzxLDX4");

        try {
            await plebbit.fetchCid(cid);
            expect.fail("should not succeed");
        } catch (e) {
            expect(e.code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
        }
    });

    it(`Throws an error when file to download is over 1mb via ipfs gateway`, async () => {
        const twoMbCid = "QmQZDGmHHPetkjoMKP9sjnV5HaCVubJLnNUzQeCtzxLDX4";

        const gatewayUrl = Object.keys(gatewayPlebbit.clients.ipfsGateways)[0];
        try {
            await gatewayPlebbit.fetchCid(twoMbCid);
            expect.fail("should not succeed");
        } catch (e) {
            expect(e.code).to.equal("ERR_FAILED_TO_FETCH_GENERIC_IPFS_FROM_GATEWAYS");
            expect(e.details.gatewayToError[gatewayUrl].code).to.equal("ERR_OVER_DOWNLOAD_LIMIT");
        }
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
    });
});

describeIfRpc(`plebbit.clients.plebbitRpcClients`, async () => {
    it(`plebbit.clients.plebbitRpcClients.state`, async () => {
        const plebbit = await mockRpcRemotePlebbit();
        const rpcClient = plebbit.clients.plebbitRpcClients[Object.keys(plebbit.clients.plebbitRpcClients)[0]];

        const rpcStates = [];

        rpcClient.on("statechange", (newState) => rpcStates.push(newState));

        if (rpcClient.state !== "connected")
            await new Promise((resolve) => rpcClient.once("statechange", (newState) => newState === "connected" && resolve()));

        expect(rpcStates).to.deep.equal(["connected"]);

        await plebbit.destroy();
    });
    it(`plebbit.clients.plebbitRpcClients.rpcCall`);
    it(`plebbit.clients.plebbitRpcClients.setSettings`, async () => {
        const plebbit = await mockRpcRemotePlebbit();
        const rpcClient = plebbit.clients.plebbitRpcClients[Object.keys(plebbit.clients.plebbitRpcClients)[0]];
        const settingsPromise = new Promise((resolve) => rpcClient.once("settingschange", resolve));
        const allSettings = [];
        rpcClient.on("settingschange", (newSettings) => allSettings.push(newSettings));

        if (!rpcClient.settings) await settingsPromise;

        // change settings here, and await for a new settingschange to be emitted
        const newSettings = {
            ...rpcClient.settings,
            plebbitOptions: { ...rpcClient.settings.plebbitOptions, userAgent: "test-agent" + Date.now() }
        };
        const editedSettingsPromise = new Promise((resolve) => rpcClient.once("settingschange", resolve));
        await rpcClient.setSettings(newSettings);
        await editedSettingsPromise;
        expect(rpcClient.settings).to.deep.equal(newSettings);
        expect(allSettings[allSettings.length - 1]).to.deep.equal(newSettings);
        await plebbit.destroy();
    });
    it(`plebbit.clients.plebbitRpcClients.settings is defined after awaiting settingschange`, async () => {
        const plebbit = await mockRpcRemotePlebbit();
        const rpcClient = plebbit.clients.plebbitRpcClients[Object.keys(plebbit.clients.plebbitRpcClients)[0]];
        if (!rpcClient.settings) await new Promise((resolve) => rpcClient.once("settingschange", resolve));
        expect(rpcClient.settings.plebbitOptions).to.be.a("object");
        expect(rpcClient.settings.challenges).to.be.a("object");
        await plebbit.destroy();
    });
});

// Skip for firefox since we can't disable CORS on Firefox
if (!globalThis["navigator"]?.userAgent?.includes("Firefox"))
    describe("Authentication in kuboRpcClientsOptions and pubsubKuboRpcClientsOptions", async () => {
        it(`Authorization credentials are generated correctly`, async () => {
            // RPC exception
            const plebbit = await Plebbit({
                kuboRpcClientsOptions: ["http://user:password@localhost:15001/api/v0"],
                pubsubKuboRpcClientsOptions: ["http://user:password@localhost:15002/api/v0"],
                httpRoutersOptions: [],
                dataPath: undefined
            });

            expect(Object.keys(plebbit.clients.kuboRpcClients)).to.deep.equal(["http://localhost:15001/api/v0"]);
            expect(Object.keys(plebbit.clients.pubsubKuboRpcClients)).to.deep.equal(["http://localhost:15002/api/v0"]);

            const expectedCred = "Basic dXNlcjpwYXNzd29yZA==";
            const ipfsCalcOptions = plebbit.clients.kuboRpcClients["http://localhost:15001/api/v0"]._clientOptions;
            const pubsubCalcOptions = plebbit.clients.pubsubKuboRpcClients["http://localhost:15002/api/v0"]._clientOptions;

            expect(ipfsCalcOptions.url).to.equal("http://localhost:15001/api/v0");
            expect(pubsubCalcOptions.url).to.equal("http://localhost:15002/api/v0");

            expect(ipfsCalcOptions.headers.authorization).to.equal(expectedCred);
            expect(pubsubCalcOptions.headers.authorization).to.equal(expectedCred);
        });
    });
