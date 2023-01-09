const Plebbit = require("../../dist/node");
const fixtureSigner = require("../fixtures/signers")[0];
const signers = require("../fixtures/signers");
const { loadIpfsFileAsJson, loadIpnsAsJson, encode } = require("../../dist/node/util");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { messages } = require("../../dist/node/errors");
const { mockPlebbit } = require("../../dist/node/test/test-util");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const updateInterval = 300;
const subplebbitAddress = signers[0].address;

if (globalThis["navigator"]?.userAgent?.includes("Electron")) Plebbit.setNativeFunctions(window.plebbitJsNativeFunctions);

const ensSubplebbitSigner = signers[3];
const ensSubplebbitAddress = "plebbit.eth";
const subplebbitSigner = signers[0];

describe("plebbit (node and browser)", async () => {
    let plebbit;
    before(async () => {
        plebbit = await Plebbit();
    });
    describe("plebbit with default options (cloudflare and pubsubprovider)", async () => {
        it("has default plebbit options", async () => {
            expect(plebbit.ipfsGatewayUrl).to.equal("https://cloudflare-ipfs.com");
            expect(plebbit.pubsubHttpClientOptions.url).to.equal("https://pubsubprovider.xyz/api/v0");
            // no dataPath in browser
            if (typeof window === "undefined") {
                expect(plebbit.dataPath).to.match(/\.plebbit$/);
            } else {
                expect(plebbit.dataPath).to.equal(undefined);
            }
        });
    });

    describe("Plebbit options set up correctly", async () => {
        it("Only ipfsHttpClientOptions is provided", async () => {
            const options = { ipfsHttpClientOptions: "http://localhost:15001/api/v0" };
            const testPlebbit = await Plebbit(options);
            expect(testPlebbit.ipfsClient).to.exist;
            expect(testPlebbit.pubsubIpfsClient).to.exist;
            expect(testPlebbit.ipfsClient).to.equal(testPlebbit.ipfsClient);
            expect(testPlebbit.ipfsGatewayUrl).to.equal("http://127.0.0.1:18080");
            expect(testPlebbit.pubsubHttpClientOptions.url).to.equal("https://pubsubprovider.xyz/api/v0");
        });
    });

    describe("plebbit.createSigner", async () => {
        let plebbit, signer;
        before(async () => {
            plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
            signer = await plebbit.createSigner();
        });

        it("without private key argument", async () => {
            expect(signer).not.to.equal(undefined);
            expect(signer.privateKey).to.match(/-----BEGIN ENCRYPTED PRIVATE KEY-----/);
            expect(signer.publicKey).to.match(/-----BEGIN PUBLIC KEY-----/);
            expect(signer.address).to.match(/^Qm/);
            expect(signer.type).to.equal("rsa");
        });

        it("with private key argument", async () => {
            const signer = await plebbit.createSigner({ privateKey: fixtureSigner.privateKey, type: "rsa" });
            expect(signer).not.to.equal(undefined);
            expect(signer.privateKey).to.equal(fixtureSigner.privateKey);
            expect(signer.publicKey).to.equal(fixtureSigner.publicKey);
            expect(signer.address).to.equal(fixtureSigner.address);
            expect(signer.type).to.equal("rsa");
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
        it("loads post correctly", async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            expect(subplebbit.lastPostCid).to.be.a("string"); // Part of setting up test-server.js to publish a test post
            const expectedPostProps = await loadIpfsFileAsJson(subplebbit.lastPostCid, plebbit);
            const expectedPost = await plebbit.createComment({
                cid: subplebbit.lastPostCid,
                postCid: subplebbit.lastPostCid,
                ...expectedPostProps
            });
            expect(expectedPost.constructor.name).to.equal("Post");
            expectedPost._updateIntervalMs = updateInterval;
            await Promise.all([new Promise((resolve) => expectedPost.once("update", resolve)), expectedPost.update()]);
            const loadedPost = await plebbit.getComment(subplebbit.lastPostCid);
            expect(loadedPost.constructor.name).to.equal("Post");
            loadedPost._updateIntervalMs = updateInterval;
            await Promise.all([new Promise((resolve) => loadedPost.once("update", resolve)), loadedPost.update()]);
            expect(loadedPost.toJSON()).to.deep.equal(expectedPost.toJSON());
            await expectedPost.stop();
            await loadedPost.stop();
        });

        it("loads comment correctly", async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            const comment = subplebbit?.posts?.pages?.hot?.comments.filter((comment) => comment.replyCount > 0)[0]?.replies?.pages?.topAll
                ?.comments[0];
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

            const expectedComment = await plebbit.createComment({ cid: comment.cid, ...expectedCommentProps });
            expect(expectedComment.constructor.name).to.equal("Comment");
            expectedComment._updateIntervalMs = updateInterval;
            await Promise.all([new Promise((resolve) => expectedComment.once("update", resolve)), expectedComment.update()]);
            await expectedComment.stop();
            const loadedComment = await plebbit.getComment(comment.cid);
            expect(loadedComment.constructor.name).to.equal("Comment");
            loadedComment._updateIntervalMs = updateInterval;
            await Promise.all([new Promise((resolve) => loadedComment.once("update", resolve)), loadedComment.update()]);
            await loadedComment.stop();

            expect(loadedComment.toJSON()).to.deep.equal(expectedComment.toJSON());
        });
    });

    describe("plebbit.getSubplebbit", async () => {
        let plebbit;
        before(async () => {
            plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
        });
        it("loads subplebbit via IPNS address", async () => {
            const _subplebbitIpns = await loadIpnsAsJson(subplebbitSigner.address, plebbit);
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            // Remove undefined keys from json
            expect(encode(loadedSubplebbit.toJSON())).to.equals(encode(_subplebbitIpns));
        });

        it("Throws an error when subplebbit address is incorrect", async () => {
            const gibbreishAddress = "0xdeadbeef";
            await assert.isRejected(plebbit.getSubplebbit(gibbreishAddress), messages.ERR_INVALID_SUBPLEBBIT_ADDRESS);
        });

        it("can load subplebbit with ENS domain via plebbit.getSubplebbit", async () => {
            const tempPlebbit = await Plebbit(plebbit);

            tempPlebbit.resolver.resolveSubplebbitAddressIfNeeded = async (address) =>
                address === ensSubplebbitAddress ? ensSubplebbitSigner.address : address;
            const subplebbit = await tempPlebbit.getSubplebbit(ensSubplebbitAddress);
            expect(subplebbit.address).to.equal(ensSubplebbitAddress);
            // I'd add more tests for subplebbit.title and subplebbit.description here but the ipfs node is offline, and won't be able to retrieve plebwhales.eth IPNS record
        });

        it(`A subplebbit with ENS domain for address can also be loaded from its IPNS`, async () => {
            const tempPlebbit = await Plebbit(plebbit);
            tempPlebbit.resolver.resolveSubplebbitAddressIfNeeded = async (address) =>
                address === ensSubplebbitAddress ? ensSubplebbitSigner.address : address;

            const loadedSubplebbit = await tempPlebbit.getSubplebbit(ensSubplebbitSigner.address);
            expect(loadedSubplebbit.address).to.equal(ensSubplebbitAddress);
        });

        it(`subplebbit = await createSubplebbit(await getSubplebbit(address))`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const createdSubplebbit = await plebbit.createSubplebbit(loadedSubplebbit);
            expect(loadedSubplebbit.toJSON()).to.deep.equal(createdSubplebbit.toJSON());
        });

        it(`subplebbit = await createSubplebbit({...await getSubplebbit()})`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const createdSubplebbit = await plebbit.createSubplebbit({ ...loadedSubplebbit });
            expect(loadedSubplebbit.toJSON()).to.deep.equal(createdSubplebbit.toJSON());
        });

        it(`subplebbit = await createSubplebbit(JSON.parse(JSON.stringify(await getSubplebbit())))`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const createdSubplebbit = await plebbit.createSubplebbit(JSON.parse(JSON.stringify(loadedSubplebbit)));
            expect(loadedSubplebbit.toJSON()).to.deep.equal(createdSubplebbit.toJSON());
        });

        it(`Sub JSON props does not change by creating a Subplebbit object via plebbit.createSubplebbit`, async () => {
            const subJson = JSON.parse(JSON.stringify(require("../fixtures/valid_subplebbit.json")));
            const subObj = await plebbit.createSubplebbit(JSON.parse(JSON.stringify(require("../fixtures/valid_subplebbit.json"))));
            expect(subJson.lastPostCid).to.equal(subObj.lastPostCid);
            expect(subJson.pubsubTopic).to.equal(subObj.pubsubTopic);
            expect(subJson.address).to.equal(subObj.address);
            expect(subJson.metricsCid).to.equal(subObj.metricsCid);
            expect(subJson.createdAt).to.equal(subObj.createdAt);
            expect(subJson.updatedAt).to.equal(subObj.updatedAt);
            expect(subJson.encryption).to.deep.equal(subObj.encryption);
            expect(subJson.roles).to.deep.equal(subObj.roles);
            expect(subJson.signature).to.deep.equal(subObj.signature);

            expect(subJson.posts).to.deep.equal(subObj.posts.toJSON());
        });
    });

    describe("plebbit.fetchCid", async () => {
        const plebbit = await mockPlebbit();
        const gatewayPlebbit = await Plebbit({
            ipfsGatewayUrl: "http://127.0.0.1:18080"
        });

        it(`Can fetch a cid correctly`, async () => {
            const fileString = "Hello plebs";
            const cid = (await plebbit.ipfsClient.add(fileString)).path;
            const contentFromFetchCid = await plebbit.fetchCid(cid);
            expect(contentFromFetchCid).to.equal(fileString);
            const contentFromGatewayFetchCid = await gatewayPlebbit.fetchCid(cid);
            expect(contentFromGatewayFetchCid).to.equal(fileString);
        });

        it(`Throws an error if malicious gateway modifies content of file`, async () => {
            const [fileString1, fileString2] = ["Hello plebs", "Hello plebs 2"];
            const cids = (await Promise.all([fileString1, fileString2].map((file) => plebbit.ipfsClient.add(file)))).map((res) => res.path);

            const plebbitWithMaliciousGateway = await Plebbit({ ipfsGatewayUrl: "http://127.0.0.1:33415" });
            const fileString1FromGateway = await plebbitWithMaliciousGateway.fetchCid(cids[0]);
            expect(fileString1).to.equal(fileString1FromGateway);

            // The following line should throw since the malicious gateway would send a content that differs from original content
            await assert.isRejected(plebbitWithMaliciousGateway.fetchCid(cids[1]), messages.ERR_GENERATED_CID_DOES_NOT_MATCH);
        });
    });
});
