// const Debug = require('debug')
// Debug.enable('plebbit-js:*')
const Plebbit = require("../../dist/node");
const fixtureSigner = require("../fixtures/signers")[0];
const { expect } = require("chai");
const signers = require("../fixtures/signers");
const { loadIpfsFileAsJson, loadIpnsAsJson } = require("../../dist/node/util");

describe("plebbit (node and browser)", () => {
    let plebbit, signer, subplebbitSigner;

    before(async () => {
        plebbit = await Plebbit();
    });
    describe("plebbit with default options (cloudflare and pubsubprovider)", async () => {
        it("has default plebbit options", async () => {
            expect(plebbit.ipfsGatewayUrl).to.equal("https://cloudflare-ipfs.com");
            expect(plebbit.pubsubHttpClientOptions).to.equal("https://pubsubprovider.xyz/api/v0");

            // no dataPath in browser
            if (typeof window === "undefined") {
                expect(plebbit.dataPath).to.match(/\.plebbit$/);
            } else {
                expect(plebbit.dataPath).to.equal(undefined);
            }
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
            expect(signer.ipfsKey?.constructor.name).to.equal("Buffer");
        });

        it("with private key argument", async () => {
            const signer = await plebbit.createSigner({ privateKey: fixtureSigner.privateKey, type: "rsa" });
            expect(signer).not.to.equal(undefined);
            expect(signer.privateKey).to.equal(fixtureSigner.privateKey);
            expect(signer.publicKey).to.equal(fixtureSigner.publicKey);
            expect(signer.address).to.equal(fixtureSigner.address);
            expect(signer.type).to.equal("rsa");
            expect(signer.ipfsKey?.constructor.name).to.equal("Buffer");
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
        });
        it("loads post correctly", async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            await subplebbit.update();
            expect(subplebbit).to.have.property("latestPostCid"); // Part of setting up test-server.js to publish a test post
            const expectedPostProps = await loadIpfsFileAsJson(subplebbit.latestPostCid, plebbit);
            const expectedPost = await plebbit.createComment({
                cid: subplebbit.latestPostCid,
                postCid: subplebbit.latestPostCid,
                ...expectedPostProps
            });
            expect(expectedPost.getType()).to.equal("post");
            await expectedPost.update();
            const loadedPost = await plebbit.getComment(subplebbit.latestPostCid);
            expect(loadedPost.getType()).to.equal("post");
            await loadedPost.update();

            expect(JSON.stringify(loadedPost)).to.equal(JSON.stringify(expectedPost));
        });

        it("loads comment correctly", async () => {
            const subplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            await subplebbit.update();
            const comment = subplebbit?.posts?.pages?.hot?.comments.filter((comment) => comment.replies)[0]?.replies?.pages?.topAll
                ?.comments[0];
            expect(comment).to.exist;
            const expectedCommentProps = await loadIpfsFileAsJson(comment.cid, plebbit);
            const expectedComment = await plebbit.createComment({ cid: comment.cid, ...expectedCommentProps });
            expect(expectedComment.getType()).to.equal("comment");
            await expectedComment.update();

            const loadedComment = await plebbit.getComment(comment.cid);
            expect(loadedComment.getType()).to.equal("comment");
            await loadedComment.update();

            expect(JSON.stringify(loadedComment)).to.equal(JSON.stringify(expectedComment));
        });
    });

    describe("plebbit.getSubplebbit", async () => {
        it("loads subplebbit correctly", async () => {
            const _subplebbitIpns = await loadIpnsAsJson(subplebbitSigner.address, plebbit);
            const expectedSubplebbit = await plebbit.createSubplebbit(_subplebbitIpns);
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
            expect(JSON.stringify(loadedSubplebbit)).to.equal(JSON.stringify(expectedSubplebbit));
        });

        it("Throws an error when subplebbit address is incorrect", async () => {
            return new Promise(async (resolve, reject) => {
                const address = "0xdeadbeef";
                try {
                    await plebbit.getSubplebbit(address);
                    reject();
                } catch (e) {
                    resolve();
                }
            });
        });
    });
});
