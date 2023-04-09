const Plebbit = require("../../dist/node");
const fixtureSigner = require("../fixtures/signers")[0];
const signers = require("../fixtures/signers");
const { loadIpfsFileAsJson } = require("../../dist/node/util");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { messages } = require("../../dist/node/errors");
const { mockPlebbit, loadAllPages } = require("../../dist/node/test/test-util");
const { default: Author } = require("../../dist/node/author");
const stringify = require("safe-stable-stringify");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const subplebbitSigner = signers[0];

describe("plebbit options (node and browser)", async () => {
    let plebbit;
    before(async () => {
        plebbit = await Plebbit();
    });
    describe("plebbit with default options (cloudflare and pubsubprovider)", async () => {
        it("has default plebbit options", async () => {
            expect(Object.keys(plebbit.clients.ipfsGateways).sort()).to.deep.equal(
                ["https://cloudflare-ipfs.com", "https://ipfs.io"].sort()
            );
            expect(Object.keys(plebbit.clients.pubsubClients)).to.deep.equal(["https://pubsubprovider.xyz/api/v0"]);
            expect(plebbit.pubsubHttpClientsOptions).to.deep.equal([{ url: "https://pubsubprovider.xyz/api/v0" }]);
            expect(plebbit.pubsubHttpClientsOptions.headers?.authorization).to.be.undefined;

            // no dataPath in browser
            if (typeof window === "undefined") {
                expect(plebbit.dataPath).to.match(/\.plebbit$/);
            } else {
                expect(plebbit.dataPath).to.equal(undefined);
            }
        });
    });

    describe("Plebbit options set up correctly", async () => {
        it("Only ipfsHttpClientsOptions is provided", async () => {
            const url = "http://localhost:15001/api/v0";
            const options = { ipfsHttpClientsOptions: [url] };
            const testPlebbit = await Plebbit(options);
            expect(testPlebbit.clients.ipfsClients[url]).to.exist;
            expect(testPlebbit.clients.pubsubClients[url]).to.exist;
            expect(testPlebbit.clients.ipfsClients[url]._client).to.deep.equal(testPlebbit.clients.pubsubClients[url]._client);
            expect(Object.keys(testPlebbit.clients.ipfsGateways)).to.deep.equal(["http://127.0.0.1:18080"]);
            expect(Object.keys(testPlebbit.clients.ipfsClients)).to.deep.equal([url]);

            expect(Object.keys(testPlebbit.clients.pubsubClients)).to.deep.equal([url]);
        });
    });
});

describe("plebbit.createSigner", async () => {
    let plebbit, signer;
    const isBase64 = (testString) => /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}))?$/gm.test(testString);
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
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
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
    });
    it("post props are loaded correctly", async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
        expect(subplebbit.lastPostCid).to.be.a("string"); // Part of setting up test-server.js to publish a test post
        const expectedPostProps = await loadIpfsFileAsJson(subplebbit.lastPostCid, plebbit);
        expectedPostProps.cid = subplebbit.lastPostCid;
        expectedPostProps.author = new Author(expectedPostProps.author);
        const loadedPost = await plebbit.getComment(subplebbit.lastPostCid);
        for (const key of Object.keys(expectedPostProps)) expect(stringify(expectedPostProps[key])).to.equal(stringify(loadedPost[key]));
    });

    it("comment props are loaded correctly", async () => {
        const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
        const newComments = await loadAllPages(subplebbit.posts.pageCids.new, subplebbit.posts);
        const comment = newComments.filter((comment) => comment.replyCount > 0)[0]?.replies?.pages?.topAll?.comments[0];
        expect(comment).to.exist;
        const expectedCommentProps = await loadIpfsFileAsJson(comment.cid, plebbit);
        expect(expectedCommentProps.postCid).to.be.a("string");
        expect(expectedCommentProps.postCid).to.equal(expectedCommentProps.parentCid);
        expect(expectedCommentProps.protocolVersion).to.be.a("string");
        expect(expectedCommentProps.ipnsName).to.be.a("string");
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
        for (const key of Object.keys(expectedCommentProps))
            expect(stringify(expectedCommentProps[key])).to.equal(stringify(loadedComment[key]));
    });
});

describe("plebbit.fetchCid", async () => {
    let plebbit, gatewayPlebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        gatewayPlebbit = await Plebbit({
            ipfsGatewayUrls: ["http://127.0.0.1:18080"]
        });
    });

    it(`Can fetch a cid correctly`, async () => {
        const fileString = "Hello plebs";
        const cid = (await plebbit._defaultIpfsClient()._client.add(fileString)).path;
        const contentFromFetchCid = await plebbit.fetchCid(cid);
        expect(contentFromFetchCid).to.equal(fileString);
        const contentFromGatewayFetchCid = await gatewayPlebbit.fetchCid(cid);
        expect(contentFromGatewayFetchCid).to.equal(fileString);
    });

    it(`Throws an error if malicious gateway modifies content of file`, async () => {
        const [fileString1, fileString2] = ["Hello plebs", "Hello plebs 2"];
        const cids = (await Promise.all([fileString1, fileString2].map((file) => plebbit._defaultIpfsClient()._client.add(file)))).map(
            (res) => res.path
        );

        const plebbitWithMaliciousGateway = await Plebbit({ ipfsGatewayUrls: ["http://127.0.0.1:33415"] });
        const fileString1FromGateway = await plebbitWithMaliciousGateway.fetchCid(cids[0]);
        expect(fileString1).to.equal(fileString1FromGateway);

        // The following line should throw since the malicious gateway would send a content that differs from original content
        await assert.isRejected(plebbitWithMaliciousGateway.fetchCid(cids[1]), messages.ERR_GENERATED_CID_DOES_NOT_MATCH);
    });
});

// Skip for firefox since we can't disable CORS on Firefox
if (!globalThis["navigator"]?.userAgent?.includes("Firefox"))
    describe("Authentication in ipfsHttpClientsOptions and PubsubHttpClientsOptions", async () => {
        it(`Authorization credentials are generated correctly`, async () => {
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
