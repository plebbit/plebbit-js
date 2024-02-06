import Plebbit from "../../dist/node";
import signers from "../fixtures/signers";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { messages } from "../../dist/node/errors";
import { mockRemotePlebbit, loadAllPages, isRpcFlagOn } from "../../dist/node/test/test-util";
import { default as Author } from "../../dist/node/author";
import { stringify as deterministicStringify } from "safe-stable-stringify";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const fixtureSigner = signers[0];
const subplebbitSigner = signers[0];

describe("Plebbit options", async () => {
    it("Plebbit() uses correct default plebbit options", async () => {
        // RPC exception
        const defaultPlebbit = await Plebbit();
        expect(Object.keys(defaultPlebbit.clients.ipfsGateways).sort()).to.deep.equal(
            ["https://cloudflare-ipfs.com", "https://ipfs.io"].sort()
        );
        expect(Object.keys(defaultPlebbit.clients.pubsubClients)).to.deep.equal(["https://pubsubprovider.xyz/api/v0"]);
        expect(defaultPlebbit.pubsubHttpClientsOptions).to.deep.equal([{ url: "https://pubsubprovider.xyz/api/v0" }]);
        expect(defaultPlebbit.pubsubHttpClientsOptions.headers?.authorization).to.be.undefined;

        // no dataPath in browser
        if (typeof window === "undefined") {
            expect(defaultPlebbit.dataPath).to.match(/\.plebbit$/);
        } else {
            expect(defaultPlebbit.dataPath).to.equal(undefined);
        }
        JSON.stringify(defaultPlebbit); // Will throw an error if circular json
    });

    it("Plebbit Options is set up correctly when only ipfsHttpClientsOptions is provided", async () => {
        // RPC exception
        const url = "http://localhost:15001/api/v0";
        const options = { ipfsHttpClientsOptions: [url] };
        const testPlebbit = await Plebbit(options);
        expect(testPlebbit.clients.ipfsClients[url]).to.exist;
        expect(testPlebbit.clients.pubsubClients[url]).to.exist;
        expect(testPlebbit.clients.ipfsClients[url]._client).to.deep.equal(testPlebbit.clients.pubsubClients[url]._client);
        expect(Object.keys(testPlebbit.clients.ipfsGateways).sort()).to.deep.equal(["https://cloudflare-ipfs.com", "https://ipfs.io"]);
        expect(Object.keys(testPlebbit.clients.ipfsClients)).to.deep.equal([url]);

        expect(Object.keys(testPlebbit.clients.pubsubClients)).to.deep.equal([url]);
        JSON.stringify(testPlebbit); // Will throw an error if circular json
    });

    it(`Plebbit({ipfsHttpClientOptions}) uses specified node even if ipfs node is down`, async () => {
        // RPC exception
        const url = "http://localhost:12323/api/v0"; // Should be offline
        const plebbit = await Plebbit({ ipfsHttpClientsOptions: [url] });

        expect(Object.keys(plebbit.clients.ipfsGateways).sort()).to.deep.equal(["https://cloudflare-ipfs.com", "https://ipfs.io"]);
        expect(Object.keys(plebbit.clients.pubsubClients)).to.deep.equal([url]);
        expect(Object.keys(plebbit.clients.ipfsClients)).to.deep.equal([url]);

        expect(plebbit.pubsubHttpClientsOptions).to.deep.equal([{ url }]);
        expect(plebbit.ipfsHttpClientsOptions).to.deep.equal([{ url }]);
        JSON.stringify(plebbit); // Will throw an error if circular json
    });

    //prettier-ignore
    if(isRpcFlagOn())
    it(`Plebbit({plebbitRpcClientsOptions}) sets up correctly`, async () => {

        const rpcUrl = "ws://localhost:39652";
        const plebbit = await Plebbit({ plebbitRpcClientsOptions: [rpcUrl] })
        expect(plebbit.plebbitRpcClient).to.be.a("object");
        expect(plebbit.plebbitRpcClientsOptions).to.deep.equal([rpcUrl]);
        expect(plebbit.pubsubHttpClientsOptions).to.be.undefined;
        expect(plebbit.chainProviders).to.deep.equal({});
        expect(plebbit.clients.chainProviders).to.deep.equal({});
        expect(plebbit.clients.ipfsClients).to.deep.equal({});
        expect(plebbit.clients.pubsubClients).to.deep.equal({});
        expect(plebbit.clients.ipfsGateways).to.deep.equal({});        
        JSON.stringify(plebbit); // Will throw an error if circular json
});

    //prettier-ignore
    if(isRpcFlagOn())
    it("Error is thrown if RPC is down", async () => {
        const plebbit = await mockRemotePlebbit({ plebbitRpcClientsOptions: ["ws://localhost:39650"] }); // Already has RPC config
        // plebbit.listSubplebbits will take 20s to timeout and throw this error
        await assert.isRejected(plebbit.listSubplebbits(), messages["ERR_FAILED_TO_OPEN_CONNECTION_TO_RPC"]); // Use the rpc so it would detect it's not loading
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

describe("plebbit.getComment", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });
    it("post props are loaded correctly", async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
        expect(subplebbit.lastPostCid).to.be.a("string"); // Part of setting up test-server.js to publish a test post
        const expectedPostProps = JSON.parse(await plebbit.fetchCid(subplebbit.lastPostCid));
        expectedPostProps.cid = subplebbit.lastPostCid;
        expectedPostProps.author = new Author(expectedPostProps.author);
        const loadedPost = await plebbit.getComment(subplebbit.lastPostCid);
        for (const key of Object.keys(expectedPostProps)) expect(deterministicStringify(expectedPostProps[key])).to.equal(deterministicStringify(loadedPost[key]));
    });

    it("comment props are loaded correctly", async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
        const newComments = await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
        const comment = newComments.filter((comment) => comment.replyCount > 0)[0]?.replies?.pages?.topAll?.comments[0];
        expect(comment).to.exist;
        const expectedCommentProps = JSON.parse(await plebbit.fetchCid(comment.cid));
        expect(expectedCommentProps.postCid).to.be.a("string");
        expect(expectedCommentProps.postCid).to.equal(expectedCommentProps.parentCid);
        expect(expectedCommentProps.protocolVersion).to.be.a("string");
        expect(expectedCommentProps.depth).to.equal(1);
        expect(expectedCommentProps.subplebbitAddress).to.equal(subplebbit.address);
        expect(expectedCommentProps.timestamp).to.be.a("number");
        expect(expectedCommentProps.signature).to.be.a("object");
        expect(expectedCommentProps.author).to.be.a("object");
        expect(expectedCommentProps.author.address).to.be.a("string");
        expect(expectedCommentProps.protocolVersion).to.be.a("string");
        expectedCommentProps.cid = comment.cid;
        expectedCommentProps.author = new Author(expectedCommentProps.author);

        const loadedComment = await plebbit.getComment(comment.cid);
        expect(loadedComment.constructor.name).to.equal("Comment");
        if (loadedComment.author.subplebbit) delete loadedComment.author.subplebbit; // If it's running on RPC then it will fetch both CommentIpfs and CommentUpdate
        for (const key of Object.keys(expectedCommentProps))
            expect(deterministicStringify(expectedCommentProps[key])).to.equal(deterministicStringify(loadedComment[key]));
    });

    it(`plebbit.getComment is not fetching comment updates in background after fulfilling its promise`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
        const comment = await plebbit.getComment(loadedSubplebbit.posts.pages.hot.comments[0].cid);
        let updatedHasBeenCalled = false;
        comment.updateOnce = comment._setUpdatingState = async () => {
            updatedHasBeenCalled = true;
        };
        await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval + 1));
        expect(updatedHasBeenCalled).to.be.false;
    });
});

describe("plebbit.fetchCid", async () => {
    let plebbit, gatewayPlebbit, ipfsPlebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit(); // Here this should be alternated for RPC
        gatewayPlebbit = await Plebbit({ ipfsGatewayUrls: ["http://127.0.0.1:18080"] }); // Should not be alternated
        ipfsPlebbit = await Plebbit({ ipfsHttpClientsOptions: ["http://localhost:15001/api/v0"] });
    });

    it(`Can fetch a cid correctly`, async () => {
        const fileString = "Hello plebs";
        const cid = (await ipfsPlebbit._clientsManager.getDefaultIpfs()._client.add(fileString)).path;
        const contentFromFetchCid = await plebbit.fetchCid(cid);
        expect(contentFromFetchCid).to.equal(fileString);
        const contentFromGatewayFetchCid = await gatewayPlebbit.fetchCid(cid);
        expect(contentFromGatewayFetchCid).to.equal(fileString);
    });

    it(`Throws an error if malicious gateway modifies content of file`, async () => {
        // RPC exception
        const [fileString1, fileString2] = ["Hello plebs", "Hello plebs 2"];
        const cids = (
            await Promise.all([fileString1, fileString2].map((file) => ipfsPlebbit._clientsManager.getDefaultIpfs()._client.add(file)))
        ).map((res) => res.path);

        const plebbitWithMaliciousGateway = await Plebbit({ ipfsGatewayUrls: ["http://127.0.0.1:33415"] });
        const fileString1FromGateway = await plebbitWithMaliciousGateway.fetchCid(cids[0]);
        expect(fileString1).to.equal(fileString1FromGateway);

        // The following line should throw since the malicious gateway would send a content that differs from original content
        await assert.isRejected(plebbitWithMaliciousGateway.fetchCid(cids[1]), messages.ERR_GENERATED_CID_DOES_NOT_MATCH);
    });

    it(`Throws an error if malicious RPC modifies content of file in plebbit.fetchCid`);

    it("plebbit.fetchCid() throws if provided with invalid cid", async () => {
        const gibberishCid = "12345";

        await assert.isRejected(plebbit.fetchCid(gibberishCid), messages.ERR_CID_IS_INVALID);
        await assert.isRejected(gatewayPlebbit.fetchCid(gibberishCid), messages.ERR_CID_IS_INVALID);
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

        await assert.isRejected(plebbit.fetchCid(cid), messages.ERR_OVER_DOWNLOAD_LIMIT);
        await assert.isRejected(gatewayPlebbit.fetchCid(cid), messages.ERR_OVER_DOWNLOAD_LIMIT);
    });

    it(`plebbit.fetchCid() resolves with the first gateway response`, async () => {
        // Have two gateways, the first is a gateway that takes 10s to respond, and the second should be near instant
        // RPC exception
        const multipleGatewayPlebbit = await Plebbit({ ipfsGatewayUrls: ["http://localhost:33417", "http://127.0.0.1:18080"] });

        const cid = "QmaZN2117dty2gHUDx2kHM61Vz9UcVDHFCx9PQt2bP2CEo"; // Cid from previous test

        const timeBefore = Date.now();
        const content = await multipleGatewayPlebbit.fetchCid(cid);
        expect(content).to.be.a("string");
        const timeItTookInMs = Date.now() - timeBefore;
        expect(timeItTookInMs).to.be.lessThan(9000);
    });
});

// Skip for firefox since we can't disable CORS on Firefox
if (!globalThis["navigator"]?.userAgent?.includes("Firefox"))
    describe("Authentication in ipfsHttpClientsOptions and PubsubHttpClientsOptions", async () => {
        it(`Authorization credentials are generated correctly`, async () => {
            // RPC exception
            const plebbit = await Plebbit({
                ipfsHttpClientsOptions: ["http://user:password@localhost:15001/api/v0"],
                pubsubHttpClientsOptions: ["http://user:password@localhost:15002/api/v0"]
            });

            expect(Object.keys(plebbit.clients.ipfsClients)).to.deep.equal(["http://localhost:15001/api/v0"]);
            expect(Object.keys(plebbit.clients.pubsubClients)).to.deep.equal(["http://localhost:15002/api/v0"]);

            const expectedCred = "Basic dXNlcjpwYXNzd29yZA==";
            const ipfsCalcOptions = plebbit.clients.ipfsClients["http://localhost:15001/api/v0"]._clientOptions;
            const pubsubCalcOptions = plebbit.clients.pubsubClients["http://localhost:15002/api/v0"]._clientOptions;

            expect(ipfsCalcOptions.url).to.equal("http://localhost:15001/api/v0");
            expect(pubsubCalcOptions.url).to.equal("http://localhost:15002/api/v0");

            expect(ipfsCalcOptions.headers.authorization).to.equal(expectedCred);
            expect(pubsubCalcOptions.headers.authorization).to.equal(expectedCred);
        });
    });
