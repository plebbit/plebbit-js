const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { mockPlebbit, publishRandomPost } = require("../../dist/node/test/test-util");
const { messages } = require("../../dist/node/errors");

const lodash = require("lodash");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadIpnsAsJson, encode } = require("../../dist/node/util");
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

const ensSubplebbitSigner = signers[3];
const ensSubplebbitAddress = "plebbit.eth";
const subplebbitSigner = signers[0];

describe(`plebbit.createSubplebbit - Remote`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
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

describe("subplebbit.update", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`subplebbit.update() works correctly with subplebbit.address as domain`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit("plebbit.eth"); // 'plebbit.eth' is part of test-server.js
        expect(loadedSubplebbit.address).to.equal("plebbit.eth");
        loadedSubplebbit._updateIntervalMs = 300;
        await loadedSubplebbit.update();
        const oldUpdatedAt = lodash.clone(loadedSubplebbit.updatedAt);
        await publishRandomPost(loadedSubplebbit.address, plebbit, {}, false); // Invoke an update
        await new Promise((resolve) => loadedSubplebbit.once("update", resolve));
        await loadedSubplebbit.stop();
        expect(oldUpdatedAt).to.not.equal(loadedSubplebbit.updatedAt);
        expect(loadedSubplebbit.address).to.equal("plebbit.eth");
    });
});

describe("plebbit.getSubplebbit", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockPlebbit(globalThis["window"]?.plebbitDataPath);
    });
    it("Can load subplebbit via IPNS address", async () => {
        const _subplebbitIpns = await loadIpnsAsJson(subplebbitSigner.address, plebbit);
        expect(_subplebbitIpns.lastPostCid).to.be.a.string;
        expect(_subplebbitIpns.pubsubTopic).to.be.a.string;
        expect(_subplebbitIpns.address).to.be.a.string;
        expect(_subplebbitIpns.metricsCid).to.be.a.string;
        expect(_subplebbitIpns.createdAt).to.be.a("number");
        expect(_subplebbitIpns.updatedAt).to.be.a("number");
        expect(_subplebbitIpns.encryption).to.be.a("object");
        expect(_subplebbitIpns.roles).to.be.a("object");
        expect(_subplebbitIpns.signature).to.be.a("object");
        expect(_subplebbitIpns.posts).to.be.a("object");
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
});
