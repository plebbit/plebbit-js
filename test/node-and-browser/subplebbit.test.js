const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { messages } = require("../../dist/node/errors");

const { mockPlebbit, publishRandomPost, mockRemotePlebbit, mockGatewayPlebbit } = require("../../dist/node/test/test-util");

const lodash = require("lodash");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const stringify = require("safe-stable-stringify");
const { verifySubplebbit } = require("../../dist/node/signer");

const subplebbitAddress = signers[0].address;

const ensSubplebbitSigner = signers[3];
const ensSubplebbitAddress = "plebbit.eth";
const subplebbitSigner = signers[0];

describe(`plebbit.createSubplebbit - Remote`, async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
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
        const remotePlebbit = await mockRemotePlebbit();
        const subJson = lodash.cloneDeep(require("../fixtures/valid_subplebbit.json"));
        const subObj = await remotePlebbit.createSubplebbit(lodash.cloneDeep(require("../fixtures/valid_subplebbit.json")));
        expect(subJson.lastPostCid).to.equal(subObj.lastPostCid);
        expect(subJson.pubsubTopic).to.equal(subObj.pubsubTopic);
        expect(subJson.address).to.equal(subObj.address);
        expect(subJson.statsCid).to.equal(subObj.statsCid);
        expect(subJson.createdAt).to.equal(subObj.createdAt);
        expect(subJson.updatedAt).to.equal(subObj.updatedAt);
        expect(subJson.encryption).to.deep.equal(subObj.encryption);
        expect(subJson.roles).to.deep.equal(subObj.roles);
        expect(subJson.signature).to.deep.equal(subObj.signature);

        expect(subJson.posts.pageCids).to.deep.equal(subObj.posts.pageCids);

        const subLoaded = await remotePlebbit.getSubplebbit(subJson.address);
        for (const pageKey of Object.keys(subJson.posts.pages)) {
            const subJsonComments = await Promise.all(
                subJson.posts.pages[pageKey].comments.map((comment) =>
                    remotePlebbit.createComment({ ...comment.comment, subplebbit: subLoaded })
                )
            );

            for (let i = 0; i < subJsonComments.length; i++)
                await subJsonComments[i]._initCommentUpdate(subJson.posts.pages[pageKey].comments[i].update);

            expect(subJsonComments.map((c) => c.toJSON())).to.deep.equal(subObj.posts.pages[pageKey].comments.map((c) => c.toJSON()));
        }
    });

    it("Remote subplebbit instance created with only address prop can call getPage", async () => {
        const remotePlebbit = await mockRemotePlebbit();
        const actualSub = await remotePlebbit.getSubplebbit(subplebbitAddress);
        expect(actualSub.createdAt).to.be.a("number");

        expect(actualSub.posts.pages.hot).to.be.a("object");
        const pageCid = actualSub.posts.pageCids.new; // get it somehow
        expect(pageCid).to.be.a("string");
        const newSubplebbit = await remotePlebbit.createSubplebbit({ address: actualSub.address });
        expect(newSubplebbit.createdAt).to.be.undefined;

        const page = await newSubplebbit.posts.getPage(pageCid);
        expect(page.comments.length).to.be.greaterThan(0);
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
        plebbit = await mockPlebbit({ dataPath: globalThis["window"]?.plebbitDataPath });
    });
    it("Can load subplebbit via IPNS address", async () => {
        const _subplebbitIpns = JSON.parse(await plebbit._clientsManager.fetchSubplebbitIpns(subplebbitSigner.address));
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
        expect(_subplebbitIpns.lastPostCid).to.be.a.string;
        expect(_subplebbitIpns.pubsubTopic).to.be.a.string;
        expect(_subplebbitIpns.address).to.be.a.string;
        expect(_subplebbitIpns.statsCid).to.be.a.string;
        expect(_subplebbitIpns.createdAt).to.be.a("number");
        expect(_subplebbitIpns.updatedAt).to.be.a("number");
        expect(_subplebbitIpns.encryption).to.be.a("object");
        expect(_subplebbitIpns.roles).to.be.a("object");
        expect(_subplebbitIpns.signature).to.be.a("object");
        expect(_subplebbitIpns.posts).to.be.a("object");
        // Remove undefined keys from json
        expect(stringify(loadedSubplebbit.toJSONIpfs())).to.equals(stringify(_subplebbitIpns));
    });

    it("Throws an error when subplebbit address is incorrect", async () => {
        const gibbreishAddress = "0xdeadbeef";
        await assert.isRejected(plebbit.getSubplebbit(gibbreishAddress), messages.ERR_FAILED_T_FETCH_IPNS);
    });

    it("can load subplebbit with ENS domain via plebbit.getSubplebbit", async () => {
        const tempPlebbit = await mockPlebbit();

        const subplebbit = await tempPlebbit.getSubplebbit(ensSubplebbitAddress);
        expect(subplebbit.address).to.equal(ensSubplebbitAddress);
        // I'd add more tests for subplebbit.title and subplebbit.description here but the ipfs node is offline, and won't be able to retrieve plebwhales.eth IPNS record
    });

    it(`A subplebbit with ENS domain for address can also be loaded from its IPNS`, async () => {
        const tempPlebbit = await mockPlebbit();

        const loadedSubplebbit = await tempPlebbit.getSubplebbit(ensSubplebbitSigner.address);
        expect(loadedSubplebbit.address).to.equal(ensSubplebbitAddress);
    });

    it(`plebbit.getSubplebbit() throws an error if fetched subplebbit has invalid signature`, async () => {
        const tempPlebbit = await mockPlebbit();

        const subJson = JSON.parse(await tempPlebbit._clientsManager.fetchSubplebbitIpns(subplebbitAddress));
        subJson.updatedAt += 1; // Should invalidate the signature
        expect(await verifySubplebbit(subJson, tempPlebbit.resolveAuthorAddresses, tempPlebbit._clientsManager)).to.deep.equal({
            valid: false,
            reason: messages.ERR_SIGNATURE_IS_INVALID
        });

        tempPlebbit._clientsManager.fetchSubplebbitIpns = () => JSON.stringify(subJson);
        await assert.isRejected(tempPlebbit.getSubplebbit(subplebbitAddress), messages.ERR_SIGNATURE_IS_INVALID);
    });
});

// These tests are for remote subs
describe(`subplebbit.clients (Remote)`, async () => {
    let plebbit, gatewayPlebbit, remotePlebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        gatewayPlebbit = await mockGatewayPlebbit();
        remotePlebbit = await mockRemotePlebbit();
    });
    describe(`subplebbit.clients.ipfsGateways`, async () => {
        // All tests below use Plebbit instance that doesn't have ipfsClient
        it(`subplebbit.clients.ipfsGateways[url] is stopped by default`, async () => {
            const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
            expect(Object.keys(mockSub.clients.ipfsGateways).length).to.equal(1);
            expect(Object.values(mockSub.clients.ipfsGateways)[0].state).to.equal("stopped");
        });

        it(`Correct order of ipfsGateways state when updating a subplebbit that was created with plebbit.createSubplebbit({address})`, async () => {
            const sub = await gatewayPlebbit.createSubplebbit({ address: signers[0].address });

            const expectedStates = ["fetching-ipns", "stopped"];

            const actualStates = [];

            const gatewayUrl = Object.keys(sub.clients.ipfsGateways)[0];

            sub.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

            await sub.update();
            await new Promise((resolve) => sub.once("update", resolve));
            await sub.stop();

            expect(actualStates).to.deep.equal(expectedStates);
        });

        it(`Correct order of ipfsGateways state when updating a subplebbit that was created with plebbit.getSubplebbit(address)`, async () => {
            const sub = await gatewayPlebbit.getSubplebbit(signers[0].address);
            await publishRandomPost(sub.address, plebbit, {}, false);

            const expectedStates = ["fetching-ipns", "stopped"];

            const actualStates = [];

            const gatewayUrl = Object.keys(sub.clients.ipfsGateways)[0];

            sub.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

            sub.update();
            await new Promise((resolve) => sub.once("update", resolve));
            await sub.stop();

            expect(actualStates.slice(0, 2)).to.deep.equal(expectedStates);
        });
    });

    describe(`subplebbit.clients.ipfsClients`, async () => {
        it(`subplebbit.clients.ipfsClients is undefined for gateway plebbit`, async () => {
            const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
            expect(mockSub.clients.ipfsClients).to.be.undefined;
        });

        it(`subplebbit.clients.ipfsClients[url] is stopped by default`, async () => {
            const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
            expect(Object.keys(mockSub.clients.ipfsClients).length).to.equal(1);
            expect(Object.values(mockSub.clients.ipfsClients)[0].state).to.equal("stopped");
        });

        it(`Correct order of ipfsClients state when updating a sub that was created with plebbit.createSubplebbit({address})`, async () => {
            const sub = await remotePlebbit.createSubplebbit({ address: signers[0].address });

            const expectedStates = ["fetching-ipns", "fetching-ipfs", "stopped"];

            const actualStates = [];

            const ipfsUrl = Object.keys(sub.clients.ipfsClients)[0];

            sub.clients.ipfsClients[ipfsUrl].on("statechange", (newState) => actualStates.push(newState));

            sub.update();
            await new Promise((resolve) => sub.once("update", resolve));
            await sub.stop();

            expect(actualStates).to.deep.equal(expectedStates);
        });

        it(`Correct order of ipfsClients state when updating a subplebbit that was created with plebbit.getSubplebbit(address)`, async () => {
            const sub = await remotePlebbit.getSubplebbit(signers[0].address);
            await publishRandomPost(sub.address, plebbit, {}, false);
            const expectedStates = ["fetching-ipns", "fetching-ipfs", "stopped"];

            const actualStates = [];

            const ipfsUrl = Object.keys(sub.clients.ipfsClients)[0];

            sub.clients.ipfsClients[ipfsUrl].on("statechange", (newState) => actualStates.push(newState));

            sub.update();
            await new Promise((resolve) => sub.once("update", resolve));
            await sub.stop();

            expect(actualStates.slice(0, 3)).to.deep.equal(expectedStates);
        });
    });

    describe(`subplebbit.clients.chainProviders`, async () => {
        it(`subplebbit.clients.chainProviders[url].state is stopped by default`, async () => {
            const mockSub = await plebbit.getSubplebbit(signers[0].address);
            expect(Object.keys(mockSub.clients.chainProviders).length).to.equal(3);
            expect(Object.values(mockSub.clients.chainProviders)[0].state).to.equal("stopped");
        });

        it(`Correct order of chainProviders state when updating a subplebbit that was created with plebbit.createSubplebbit({address})`, async () => {
            const sub = await remotePlebbit.createSubplebbit({ address: "plebbit.eth" });

            const expectedStates = ["resolving-subplebbit-address", "stopped"];

            const actualStates = [];

            sub.clients.chainProviders["eth"].on("statechange", (newState) => actualStates.push(newState));

            sub.update();

            await new Promise((resolve) => sub.once("update", resolve));

            await sub.stop();

            expect(actualStates.slice(0, 2)).to.deep.equal(expectedStates);
        });
    });
});
