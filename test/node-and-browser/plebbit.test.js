// const Debug = require('debug')
// Debug.enable('plebbit-js:*')
const Plebbit = require("../../dist/node");
const fixtureSigner = require("../fixtures/signers")[0];
const { expect } = require("chai");

describe("plebbit (node and browser)", () => {
    let plebbit, signer;

    before(async () => {
        plebbit = await Plebbit();
    });

    it("has default plebbit options", async () => {
        expect(plebbit.ipfsGatewayUrl).to.equal("https://cloudflare-ipfs.com");
        expect(plebbit.pubsubHttpClientOptions).to.equal("https://pubsubprovider.xyz/api/v0");

        // no dataPath in brower
        if (typeof window === "undefined") {
            expect(plebbit.dataPath).to.match(/\.plebbit$/);
        } else {
            expect(plebbit.dataPath).to.equal(undefined);
        }
    });

    describe("plebbit.createSigner", () => {
        before(async () => {
            signer = await plebbit.createSigner();
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
});
