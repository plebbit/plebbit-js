const Plebbit = require("../../dist/node");
const { expect } = require("chai");
const signers = require("../fixtures/signers");
const { rm } = require("fs");
const path = require("path");

let plebbit;
let subplebbit;

describe("subplebbit", async () => {
    before(async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
    });
    after(async () => {
        // Delete DB
        rm(path.join(plebbit.dataPath, subplebbit.address), () => console.log(`Deleted generated DB`));
    });

    it("create new subplebbit", async function () {
        const signer = await plebbit.createSigner();
        subplebbit = await plebbit.createSubplebbit({
            signer: signer,
            title: `Test subplebbit - ${Date.now() / 1000}`
        });

        await subplebbit.start();
        expect(subplebbit.address).to.be.a("string");
        // Should have address now
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.address);
        expect(subplebbit.toJSON()).to.deep.equal(loadedSubplebbit.toJSON());
    });

    it("subplebbit.edit", async () => {
        return new Promise(async (resolve) => {
            const newTitle = `New title to test subplebbit.edit - ${Date.now()}`;
            const newDescription = `New description to test subplebbit.edit - ${Date.now()}`;
            const newProps = { title: newTitle, description: newDescription };
            await subplebbit.edit(newProps);

            subplebbit.once("update", async () => {
                expect(subplebbit.title).to.equal(newTitle);
                expect(subplebbit.description, newDescription);
                resolve();
            });
            await subplebbit.update();
        });
    });

    it(`Can edit a subplebbit to have ENS domain as address`, async () => {
        const address = subplebbit.address;
        plebbit.resolver.resolveSubplebbitAddressIfNeeded = async (subplebbitAddress) => {
            if (subplebbitAddress === "plebbit.eth") return address;
            else if (subplebbitAddress === "plebbit2.eth") return signers[2];
            else if (subplebbitAddress === "testgibbreish.eth")
                throw new Error(`Domain (${subplebbitAddress}) has no plebbit-author-address`);
            return subplebbitAddress;
        };
        await subplebbit.edit({ address: "plebbit.eth" });
        expect(subplebbit.address).to.equal("plebbit.eth");
        const loadedSubplebbit = await plebbit.getSubplebbit("plebbit.eth");
        expect(JSON.stringify(loadedSubplebbit)).to.equal(JSON.stringify(subplebbit));
    });
    it(`Fails to edit subplebbit.address to a new domain if subplebbit-address record does not exist or does not match signer.address`, async () => {
        try {
            await subplebbit.edit({ address: "testgibbreish.eth" });
            expect.fail("Should throw an error if domain has no subplebbit-address record");
        } catch {
            try {
                await subplebbit.edit({ address: "plebbit2.eth" });
                expect.fail("Should throw an error if domain's subplebbit-address points to another signer's address");
            } catch {}
        }
    });
});
