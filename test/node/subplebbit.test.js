const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { rm } = require("fs");
const path = require("path");
const { generateMockPost } = require("../../dist/node/test-util");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const syncInterval = 100;
let plebbit;
let subplebbit;

describe("subplebbit", async () => {
    before(async () => {
        plebbit = await Plebbit({
            ipfsHttpClientOptions: "http://localhost:5001/api/v0",
            pubsubHttpClientOptions: `http://localhost:5002/api/v0`
        });
        plebbit.resolver.resolveAuthorAddressIfNeeded = async (authorAddress) => {
            if (authorAddress === "plebbit.eth") return signers[6].address;
            else if (authorAddress === "testgibbreish.eth") return undefined;
            return authorAddress;
        };
    });
    after(async () => {
        // Delete DB
        await subplebbit.stopPublishing();
        rm(path.join(plebbit.dataPath, "subplebbits", subplebbit.address), () => console.log(`Deleted generated DB`));
    });

    [{}, { title: `Test title - ${Date.now()}` }].map((subArgs) =>
        it(`createSubplebbit(${JSON.stringify(subArgs)})`, async () => {
            const newSubplebbit = await plebbit.createSubplebbit(subArgs);
            await newSubplebbit.start();
            expect(newSubplebbit.address).to.equal(newSubplebbit.signer.address);
            const subplebbitIpns = await plebbit.getSubplebbit(newSubplebbit.address);
            expect(subplebbitIpns.address).to.equal(newSubplebbit.signer.address);
            await newSubplebbit.stopPublishing();
            rm(path.join(plebbit.dataPath, "subplebbits", newSubplebbit.address), () =>
                console.log(`Deleted subplebbit (${newSubplebbit.address}) DB`)
            );
        })
    );

    it("create new subplebbit", async function () {
        const signer = await plebbit.createSigner();
        subplebbit = await plebbit.createSubplebbit({
            signer: signer,
            title: `Test subplebbit - ${Date.now() / 1000}`
        });

        await subplebbit.start(syncInterval);
        expect(subplebbit.address).to.be.a("string");
        // Should have address now
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.address);
        expect(subplebbit.toJSON()).to.deep.equal(loadedSubplebbit.toJSON());
    });

    it("subplebbit.edit", async () =>
        new Promise(async (resolve) => {
            const newTitle = `New title to test subplebbit.edit - ${Date.now()}`;
            const newDescription = `New description to test subplebbit.edit - ${Date.now()}`;
            const newProps = { title: newTitle, description: newDescription };
            const loadedSubplebbit = await plebbit.getSubplebbit(subplebbit.address);

            await subplebbit.edit(newProps);
            expect(subplebbit.title).to.equal(newTitle);
            expect(subplebbit.description).to.equal(newDescription);
            await loadedSubplebbit.update(syncInterval);
            if (loadedSubplebbit.description === newDescription && loadedSubplebbit.title === newTitle) resolve();
            loadedSubplebbit.once("update", (updatedSubplebbit) => {
                // if (updatedSubplebbit.description !== newDescription || updatedSubplebbit.title !== newTitle) return;
                expect(updatedSubplebbit.description).to.equal(newDescription);
                expect(updatedSubplebbit.title).to.equal(newTitle);
                loadedSubplebbit.removeAllListeners("update");
                loadedSubplebbit.stop();
                resolve();
            });
        }));

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
        subplebbit.once("update", async (updatedSubplebbit) => {
            expect(updatedSubplebbit.address).to.equal("plebbit.eth");
            expect(subplebbit.address).to.equal("plebbit.eth");
            const loadedSubplebbit = await plebbit.getSubplebbit("plebbit.eth");
            expect(JSON.stringify(loadedSubplebbit)).to.equal(JSON.stringify(subplebbit));
        });
    });
    it(`Fails to edit subplebbit.address to a new domain if subplebbit-address record does not exist or does not match signer.address`, async () => {
        await assert.isRejected(subplebbit.edit({ address: "testgibbreish.eth" }));
        await assert.isRejected(subplebbit.edit({ address: "plebbit2.eth" }));
    });

    it(`subplebbit.update() works correctly with subplebbit.address as domain`, async () =>
        new Promise(async (resolve) => {
            const loadedSubplebbit = await plebbit.getSubplebbit("plebbit.eth");
            await loadedSubplebbit.update(syncInterval);

            const post = await subplebbit._addPublicationToDb(await generateMockPost("plebbit.eth", plebbit, signers[0]));

            loadedSubplebbit.on("update", async (updatedSubplebbit) => {
                if (!updatedSubplebbit.posts) return;
                expect(updatedSubplebbit?.posts?.pages?.hot?.comments?.some((comment) => comment.content === post.content)).to.be.true;
                expect(updatedSubplebbit.latestPostCid).to.equal(post.cid);
                await loadedSubplebbit.stop();
                await loadedSubplebbit.removeAllListeners();
                resolve();
            });
        }));
});
