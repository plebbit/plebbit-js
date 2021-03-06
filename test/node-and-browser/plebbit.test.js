// const Debug = require('debug')
// Debug.enable('plebbit-js:*')
const Plebbit = require("../../dist/node");
const fixtureSigner = require("../fixtures/signers")[0];
const signers = require("../fixtures/signers");
const { loadIpfsFileAsJson, loadIpnsAsJson } = require("../../dist/node/util");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const updateInterval = 100;
const subplebbitAddress = signers[0].address;

const [ensSubplebbitSigner, ensSubplebbitAddress] = [signers[3], "plebbit.eth"];
describe("plebbit (node and browser)", () => {
    let plebbit, signer, subplebbitSigner;

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
            const options = { ipfsHttpClientOptions: "http://localhost:5001/api/v0" };
            const testPlebbit = await Plebbit(options);
            expect(testPlebbit.ipfsClient).to.exist;
            expect(testPlebbit.pubsubIpfsClient).to.exist;
            expect(testPlebbit.ipfsClient).to.equal(testPlebbit.ipfsClient);
            expect(testPlebbit.ipfsGatewayUrl).to.equal("http://127.0.0.1:8080");
            expect(testPlebbit.pubsubHttpClientOptions.url).to.equal("https://pubsubprovider.xyz/api/v0");
        });
    });

    describe("plebbit.createSigner", () => {
        before(async () => {
            signer = await plebbit.createSigner();
            subplebbitSigner = await plebbit.createSigner(signers[0]);
        });

        it("without private key argument", async () => {
            expect(signer).not.to.equal(undefined);
            expect(signer.privateKey).to.match(/-----BEGIN ENCRYPTED PRIVATE KEY-----/);
            expect(signer.publicKey).to.match(/-----BEGIN PUBLIC KEY-----/);
            expect(signer.address).to.match(/^Qm/);
            expect(signer.type).to.equal("rsa");
            expect(signer.ipfsKey?.constructor.name).to.equal("Uint8Array");
        });

        it("with private key argument", async () => {
            const signer = await plebbit.createSigner({ privateKey: fixtureSigner.privateKey, type: "rsa" });
            expect(signer).not.to.equal(undefined);
            expect(signer.privateKey).to.equal(fixtureSigner.privateKey);
            expect(signer.publicKey).to.equal(fixtureSigner.publicKey);
            expect(signer.address).to.equal(fixtureSigner.address);
            expect(signer.type).to.equal("rsa");
            expect(signer.ipfsKey?.constructor.name).to.equal("Uint8Array");
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
        before(async () => {
            plebbit = await Plebbit({ ipfsHttpClientOptions: "http://localhost:5001/api/v0" });
            plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
                if (authorAddress === "plebbit.eth") return signers[6].address;
                else if (authorAddress === "testgibbreish.eth") throw new Error(`Domain (${authorAddress}) has no plebbit-author-address`);
                return authorAddress;
            };
        });
        it("loads post correctly", async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            await subplebbit.update(updateInterval);
            await subplebbit.stop();
            expect(subplebbit.latestPostCid).to.be.a("string"); // Part of setting up test-server.js to publish a test post
            const expectedPostProps = await loadIpfsFileAsJson(subplebbit.latestPostCid, plebbit);
            const expectedPost = await plebbit.createComment({
                cid: subplebbit.latestPostCid,
                postCid: subplebbit.latestPostCid,
                ...expectedPostProps
            });
            expect(expectedPost.constructor.name).to.equal("Post");
            await expectedPost.update(updateInterval);
            const loadedPost = await plebbit.getComment(subplebbit.latestPostCid);
            expect(loadedPost.constructor.name).to.equal("Post");
            await loadedPost.update(updateInterval);

            expect(JSON.stringify(loadedPost)).to.equal(JSON.stringify(expectedPost));
            await expectedPost.stop();
            await loadedPost.stop();
        });

        it("loads comment correctly", async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            await subplebbit.update(updateInterval);
            await subplebbit.stop();
            const comment = subplebbit?.posts?.pages?.hot?.comments.filter((comment) => comment.replies)[0]?.replies?.pages?.topAll
                ?.comments[0];
            expect(comment).to.exist;
            const expectedCommentProps = await loadIpfsFileAsJson(comment.cid, plebbit);
            const expectedComment = await plebbit.createComment({ cid: comment.cid, ...expectedCommentProps });
            expect(expectedComment.constructor.name).to.equal("Comment");
            await expectedComment.update(updateInterval);
            await expectedComment.stop();
            const loadedComment = await plebbit.getComment(comment.cid);
            expect(loadedComment.constructor.name).to.equal("Comment");
            await loadedComment.update(updateInterval);
            await loadedComment.stop();

            expect(JSON.stringify(loadedComment)).to.equal(JSON.stringify(expectedComment));
        });
    });

    describe("plebbit.getSubplebbit", async () => {
        it("loads subplebbit via IPNS address", async () => {
            const _subplebbitIpns = await loadIpnsAsJson(subplebbitSigner.address, plebbit);
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            expect(JSON.stringify(loadedSubplebbit)).to.equals(JSON.stringify(_subplebbitIpns));
        });

        it("Throws an error when subplebbit address is incorrect", async () => {
            const gibbreishAddress = "0xdeadbeef";
            await assert.isRejected(plebbit.getSubplebbit(gibbreishAddress), "could not resolve name");
        });

        it("can load subplebbit with ENS domain via plebbit.getSubplebbit", async () => {
            plebbit.resolver.resolveSubplebbitAddressIfNeeded = async (subplebbitAddress) => {
                if (subplebbitAddress === ensSubplebbitAddress) return ensSubplebbitSigner.address;
                return subplebbitAddress;
            };
            const subplebbit = await plebbit.getSubplebbit(ensSubplebbitAddress);
            expect(subplebbit.address).to.equal(ensSubplebbitAddress);
            // I'd add more tests for subplebbit.title and subplebbit.description here but the ipfs node is offline, and won't be able to retrieve plebwhales.eth IPNS record
        });

        it(`A subplebbit with ENS domain for address can also be loaded from its IPNS`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(ensSubplebbitSigner.address);
            expect(loadedSubplebbit.address).to.equal(ensSubplebbitAddress);
        });

        it(`subplebbit = await createSubplebbit(await getSubplebbit(address))`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const createdSubplebbit = await plebbit.createSubplebbit(loadedSubplebbit);
            expect(JSON.stringify(loadedSubplebbit)).to.equal(JSON.stringify(createdSubplebbit));
        });

        it(`subplebbit = await createSubplebbit({...await getSubplebbit()})`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const createdSubplebbit = await plebbit.createSubplebbit({ ...loadedSubplebbit });
            expect(JSON.stringify(loadedSubplebbit)).to.equal(JSON.stringify(createdSubplebbit));
        });

        it(`subplebbit = await createSubplebbit(JSON.parse(JSON.stringify(await getSubplebbit())))`, async () => {
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitAddress);
            const createdSubplebbit = await plebbit.createSubplebbit(JSON.parse(JSON.stringify(loadedSubplebbit)));
            expect(JSON.stringify(loadedSubplebbit)).to.equal(JSON.stringify(createdSubplebbit));
        });
    });
});
