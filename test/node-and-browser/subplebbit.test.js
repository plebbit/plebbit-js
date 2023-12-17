const Plebbit = require("../../dist/node");
const signers = require("../fixtures/signers");
const { messages } = require("../../dist/node/errors");

const { mockPlebbit, publishRandomPost, mockRemotePlebbit, mockGatewayPlebbit, isRpcFlagOn } = require("../../dist/node/test/test-util");

const lodash = require("lodash");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect, assert } = chai;
const stringify = require("safe-stable-stringify");

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
        const subJson = lodash.cloneDeep(require("../fixtures/valid_subplebbit.json"));
        const subObj = await plebbit.createSubplebbit(lodash.cloneDeep(require("../fixtures/valid_subplebbit.json")));
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

        const subLoaded = await plebbit.getSubplebbit(subJson.address);
        for (const pageKey of Object.keys(subJson.posts.pages)) {
            const subJsonComments = await Promise.all(
                subJson.posts.pages[pageKey].comments.map((comment) => plebbit.createComment({ ...comment.comment, subplebbit: subLoaded }))
            );

            for (let i = 0; i < subJsonComments.length; i++)
                await subJsonComments[i]._initCommentUpdate(subJson.posts.pages[pageKey].comments[i].update);

            expect(subJsonComments.map((c) => c.toJSON())).to.deep.equal(subObj.posts.pages[pageKey].comments.map((c) => c.toJSON()));
        }
    });

    it("Remote subplebbit instance created with only address prop can call getPage", async () => {
        const actualSub = await plebbit.getSubplebbit(subplebbitAddress);
        expect(actualSub.createdAt).to.be.a("number");

        expect(actualSub.posts.pages.hot).to.be.a("object");
        const pageCid = actualSub.posts.pageCids.new; // get it somehow
        expect(pageCid).to.be.a("string");
        const newSubplebbit = await plebbit.createSubplebbit({ address: actualSub.address });
        expect(newSubplebbit.createdAt).to.be.undefined;

        const page = await newSubplebbit.posts.getPage(pageCid);
        expect(page.comments.length).to.be.greaterThan(0);
    });

    it(`plebbit.createSubplebbit({address}) throws if address if ENS and has a capital letter`, async () => {
        await assert.isRejected(plebbit.createSubplebbit({ address: "testSub.eth" }), messages.ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER);
    });
});

describe("subplebbit.update (remote)", async () => {
    let plebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
    });
    it(`subplebbit.update() works correctly with subplebbit.address as domain`, async () => {
        const subplebbit = await plebbit.getSubplebbit("plebbit.eth"); // 'plebbit.eth' is part of test-server.js
        expect(subplebbit.address).to.equal("plebbit.eth");
        const oldUpdatedAt = lodash.clone(subplebbit.updatedAt);
        await subplebbit.update();
        await publishRandomPost(subplebbit.address, plebbit, {}, false); // Invoke an update
        await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(oldUpdatedAt).to.not.equal(subplebbit.updatedAt);
        expect(subplebbit.address).to.equal("plebbit.eth");
        await subplebbit.stop();
    });

    it(`subplebbit.update() emits error if user supplied {address: ipnsName} if the actual address was ENS`, async () => {
        const loadedSubplebbit = await plebbit.createSubplebbit({ address: ensSubplebbitSigner.address });
        loadedSubplebbit.update();
        const error = await new Promise((resolve) => loadedSubplebbit.once("error", resolve));
        expect(error.code).to.equal("ERR_GATEWAY_RESPONDED_WITH_DIFFERENT_SUBPLEBBIT");
        // should not update
        expect(loadedSubplebbit.updatedAt).to.be.undefined;
        expect(loadedSubplebbit.address).to.equal(ensSubplebbitSigner.address);
        await loadedSubplebbit.stop();
    });

    //prettier-ignore
    if (!isRpcFlagOn())
    it(`subplebbit.update emits error if signature of subplebbit is invalid (ipfs P2P)`, async () => {
        const remotePlebbit = await mockRemotePlebbit();
        const tempSubplebbit = await remotePlebbit.createSubplebbit({ address: signers[0].address });
        const rawSubplebbitJson = (await remotePlebbit.getSubplebbit(signers[0].address))._rawSubplebbitType;
        rawSubplebbitJson.lastPostCid = "Corrupt the signature"; // This will corrupt the signature
        tempSubplebbit._clientsManager._fetchCidP2P = () => JSON.stringify(rawSubplebbitJson);
        tempSubplebbit.update();
        await new Promise(resolve => {
            tempSubplebbit.once("error", err =>{
                expect(err.code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");
                resolve();
            })
        });
        await tempSubplebbit.stop();
    });

    //prettier-ignore
    if (!isRpcFlagOn())
     it(`subplebbit.update emits error if signature of subplebbit is invalid (ipfs gateway)`, async () => {
         const remoteGatewayPlebbit = await mockGatewayPlebbit();
         const tempSubplebbit = await remoteGatewayPlebbit.createSubplebbit({ address: signers[0].address });
         const rawSubplebbitJson = (await remoteGatewayPlebbit.getSubplebbit(signers[0].address))._rawSubplebbitType;
         rawSubplebbitJson.lastPostCid = "Corrupt the signature"; // This will corrupt the signature
         tempSubplebbit._clientsManager._fetchWithGateway = async () => JSON.stringify(rawSubplebbitJson);
         tempSubplebbit.update();
         await new Promise(resolve => {
             tempSubplebbit.once("error", err =>{
                 expect(err.code).to.equal("ERR_SUBPLEBBIT_SIGNATURE_IS_INVALID");
                 resolve();
             })
         });
         await tempSubplebbit.stop();
     });

    it(`subplebbit.update emits error if address of ENS and has no subplebbit-address`, async () => {
        const sub = await plebbit.createSubplebbit({ address: "this-sub-does-not-exist.eth" });
        sub.update();
        // Should emit an error and keep on retrying in the next update loop
        let errorCount = 0;
        await new Promise((resolve) => {
            sub.on("error", (err) => {
                expect(err.code).to.equal("ERR_ENS_TXT_RECORD_NOT_FOUND");
                expect(sub.updatingState).to.equal("failed");
                errorCount++;
                if (errorCount === 3) resolve();
            });
        });

        await sub.stop();
        await sub.removeAllListeners("error");
    });
    it("subplebbit.update emits error if subplebbit address is incorrect", async () => {
        const invalidAddress = "0xdeadbeef";
        const sub = await plebbit.createSubplebbit({ address: invalidAddress });
        sub.update();
        // Should emit an error and keep on retrying in the next update loop
        let errorCount = 0;
        await new Promise((resolve) => {
            sub.on("error", (err) => {
                expect(err.code).to.equal("ERR_FAILED_TO_RESOLVE_IPNS_VIA_IPFS");
                expect(sub.updatingState).to.equal("failed");
                errorCount++;
                if (errorCount === 3) resolve();
            });
        });

        await sub.stop();
        await sub.removeAllListeners("error");
    });

    it(`subplebbit.stop() stops subplebbit updates`, async () => {
        const remotePlebbit = await mockRemotePlebbit();
        const subplebbit = await remotePlebbit.createSubplebbit({ address: "plebbit.eth" }); // 'plebbit.eth' is part of test-server.js
        subplebbit.update();
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();
        await new Promise((resolve) => setTimeout(resolve, remotePlebbit.updateInterval + 1));
        let updatedHasBeenCalled = false;
        subplebbit.updateOnce = subplebbit._setUpdatingState = async () => {
            updatedHasBeenCalled = true;
        };

        await new Promise((resolve) => setTimeout(resolve, remotePlebbit.updateInterval + 1));
        expect(updatedHasBeenCalled).to.be.false;
    });

    it(`subplebbit.update() is working as expected after calling subplebbit.stop()`, async () => {
        const subplebbit = await plebbit.createSubplebbit({ address: signers[0].address });

        await subplebbit.update();
        await new Promise((resolve) => subplebbit.once("update", resolve));

        await subplebbit.stop();

        await subplebbit.update();

        await publishRandomPost(subplebbit.address, plebbit, {}, false);
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();
    });
});

describe("plebbit.getSubplebbit (Remote)", async () => {
    let plebbit, gatewayPlebbit;
    before(async () => {
        plebbit = await mockRemotePlebbit();
        gatewayPlebbit = await mockGatewayPlebbit();
    });
    it("Can load subplebbit via IPNS address (ipfs P2P and gateway)", async () => {
        const loadedSubplebbitP2p = await plebbit.getSubplebbit(subplebbitSigner.address);
        const loadedSubplebbitGateway = await gatewayPlebbit.getSubplebbit(subplebbitSigner.address);
        for (const loadedSubplebbit of [loadedSubplebbitP2p, loadedSubplebbitGateway]) {
            const _subplebbitIpns = loadedSubplebbit._rawSubplebbitType;
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
        }
    });

    it("can load subplebbit with ENS domain via plebbit.getSubplebbit (ipfs P2P)", async () => {
        const subplebbit = await plebbit.getSubplebbit(ensSubplebbitAddress);
        expect(subplebbit.address).to.equal(ensSubplebbitAddress);
        expect(subplebbit.updatedAt).to.be.a("number");
    });

    it("can load subplebbit with ENS domain via plebbit.getSubplebbit (ipfs gateway)", async () => {
        const subplebbit = await gatewayPlebbit.getSubplebbit(ensSubplebbitAddress);
        expect(subplebbit.address).to.equal(ensSubplebbitAddress);
        expect(subplebbit.updatedAt).to.be.a("number");
    });

    it(`plebbit.getSubplebbit fails to fetch a sub with ENS address if it has capital letter`, async () => {
        await assert.isRejected(plebbit.getSubplebbit("testSub.eth"), messages.ERR_ENS_ADDRESS_HAS_CAPITAL_LETTER);
    });

    it(`plebbit.getSubplebbit is not fetching subplebbit updates in background after fulfilling its promise`, async () => {
        const loadedSubplebbit = await plebbit.getSubplebbit(subplebbitSigner.address);
        let updatedHasBeenCalled = false;
        loadedSubplebbit.updateOnce = loadedSubplebbit._setUpdatingState = async () => {
            updatedHasBeenCalled = true;
        };
        await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval + 1));
        expect(updatedHasBeenCalled).to.be.false;
    });
});

describe(`Test fetching subplebbit record from multiple gateways`, async () => {
    // these test gateways will be set in test-server.js
    const stallingGateway = "http://localhost:44000"; // This gateaway will wait for 11s then respond
    const normalGateway = `http://localhost:18080`; // from test-server.js, should fetch records with minimal latency. Will fetch the latest record
    const errorGateway = `http://localhost:33416`; // this gateway will respond with an error immedietly
    const normalWithStallingGateway = `http://localhost:44002`; // This gateway will fetch from normal gateway, await some time (less than 10s) than respond
    const errorGateway2 = `http://localhost:44003`; // this gateway will respond with an error immedietly

    // These two gateways will respond with old record
    const thirtyMinuteLateGateway = `http://localhost:44004`; // This gateway will respond immedietly with subplebbitRecordThirtyMinuteOld
    const hourLateGateway = `http://localhost:44005`; // This gateway will respond immedietly with subplebbitRecordHourOld;

    const subAddress = signers[0].address;
    let plebbit;

    const fetchLatestSubplebbitJson = async () => {
        const subRecord = (await plebbit.getSubplebbit(subAddress)).toJSONIpfs();
        return subRecord;
    };
    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`Updating a subplebbit through a single gateway that is not responding (timeout)`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [stallingGateway] });
        customPlebbit._clientsManager._getTimeoutMsForGatewaySubplebbit = () => 5 * 1000; // change timeout from 5min to 5s
        try {
            await customPlebbit.getSubplebbit(subAddress);
            assert.fails("Should not fulfill");
        } catch (e) {
            expect(e.message).to.equal(messages["ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS"]);
            expect(e.details.gatewayToError[stallingGateway].message).to.equal("Fetching from gateway has been aborted/timed out");
        }
    });
    it(`updating a subplebbit through working gateway and another gateway that is timing out`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [normalGateway, stallingGateway] });
        customPlebbit._clientsManager._getTimeoutMsForGatewaySubplebbit = () => 5 * 1000; // change timeout from 5min to 5s
        // should succeed and return the result from normalGateway
        const sub = await customPlebbit.getSubplebbit(subplebbitAddress);
        const latestSub = await fetchLatestSubplebbitJson();
        expect(sub.toJSONIpfs()).to.deep.equal(latestSub);
        expect(sub.updatedAt).to.be.a("number");
    });
    it(`updating a subplebbit through working gateway and another gateway that is throwing an error`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [normalGateway, errorGateway] });
        // should succeed and return the result from normalGateway
        const sub = await customPlebbit.getSubplebbit(subplebbitAddress);
        const latestSub = await fetchLatestSubplebbitJson();
        expect(sub.toJSONIpfs()).to.deep.equal(latestSub);
        expect(sub.updatedAt).to.be.a("number");
    });

    it(`all gateways are throwing an error`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [errorGateway, errorGateway2, stallingGateway] });
        customPlebbit._clientsManager._getTimeoutMsForGatewaySubplebbit = () => 5 * 1000; // change timeout from 5min to 5s

        // should faill
        await assert.isRejected(customPlebbit.getSubplebbit(subAddress), messages["ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS"]);
    });

    it(`Fetching algo resolves immedietly if a gateway responds with a record that has been published in the last 2 min`, async () => {
        await publishRandomPost(subAddress, plebbit, {}, true); // Force sub to publish a new update
        // normalWithStallingGateway gateway will return the latest SubplebbitIpfs

        // gateway that responds quickly with updatedAt > 2 min => thirtyMinuteLateGateway
        // gateway that respondes after taking sometime with updatedAt < 2 min => normalWithStallingGateway
        // Should go with maximum updatedAt
        const customPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [normalWithStallingGateway, thirtyMinuteLateGateway] });
        customPlebbit._clientsManager._getTimeoutMsForGatewaySubplebbit = () => 5 * 1000; // change timeout from 5min to 5s

        const sub = await customPlebbit.getSubplebbit(subplebbitAddress);
        const buffer = 2;
        const base = Math.round(Date.now() / 1000);
        expect(sub.updatedAt)
            .to.be.lessThanOrEqual(base + buffer)
            .greaterThanOrEqual(base - buffer);
    });

    it(`Fetching algo goes with the highest updatedAt of records if all of them are older than 2 min`, async () => {
        const customPlebbit = await mockGatewayPlebbit({ ipfsGatewayUrls: [thirtyMinuteLateGateway, hourLateGateway] });
        const sub = await customPlebbit.getSubplebbit(subplebbitAddress);

        // should go with the thirty minute old, not the one hour old
        const timestampThirtyMinuteAgo = Math.round(Date.now() / 1000) - 30 * 60;
        const bufferSeconds = 4;

        expect(sub.updatedAt)
            .to.greaterThanOrEqual(timestampThirtyMinuteAgo - bufferSeconds)
            .lessThanOrEqual(timestampThirtyMinuteAgo + bufferSeconds);
    });
    it(`fetching algo gets the highest updatedAt with 5 gateways`, async () => {
        await publishRandomPost(subplebbitAddress, plebbit, {}, true); // should publish a new record after
        const customPlebbit = await mockGatewayPlebbit({
            ipfsGatewayUrls: [normalGateway, normalWithStallingGateway, thirtyMinuteLateGateway, errorGateway, stallingGateway]
        });
        customPlebbit._clientsManager._getTimeoutMsForGatewaySubplebbit = () => 5 * 1000; // change timeout from 5min to 5s

        const sub = await customPlebbit.getSubplebbit(subplebbitAddress);
        const latestSub = await fetchLatestSubplebbitJson();
        expect(sub.toJSONIpfs()).to.deep.equal(latestSub);
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
    //prettier-ignore
    if (!isRpcFlagOn())
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

    //prettier-ignore
    if (!isRpcFlagOn())
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

    //prettier-ignore
    if (!isRpcFlagOn())
    describe(`subplebbit.clients.chainProviders`, async () => {
        it(`subplebbit.clients.chainProviders[url].state is stopped by default`, async () => {
            const mockSub = await plebbit.getSubplebbit(signers[0].address);
            expect(Object.keys(mockSub.clients.chainProviders).length).to.equal(3);
            for (const chain of Object.keys(mockSub.clients.chainProviders)) {
                expect(Object.keys(mockSub.clients.chainProviders[chain]).length).to.be.greaterThan(0);
                for (const chainUrl of Object.keys(mockSub.clients.chainProviders[chain]))
                    expect(mockSub.clients.chainProviders[chain][chainUrl].state).to.equal("stopped");
            }
        });

        it(`Correct order of chainProviders state when updating a subplebbit that was created with plebbit.createSubplebbit({address})`, async () => {
            const sub = await remotePlebbit.createSubplebbit({ address: "plebbit.eth" });

            const expectedStates = ["resolving-subplebbit-address", "stopped"];

            const actualStates = [];

            sub.clients.chainProviders["eth"]["viem"].on("statechange", (newState) => actualStates.push(newState));

            sub.update();

            await new Promise((resolve) => sub.once("update", resolve));

            await sub.stop();

            expect(actualStates.slice(0, 2)).to.deep.equal(expectedStates);
        });
    });

    //prettier-ignore
    if (isRpcFlagOn())
    describe(`subplebbit.clients.plebbitRpcClients (remote sub)`, async () => {

        it(`subplebbit.clients.plebbitRpcClients[rpcUrl] is stopped by default`, async () => {
            const sub = await plebbit.createSubplebbit({address: signers[0].address});
            const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
            expect(sub.clients.plebbitRpcClients[rpcUrl].state).to.equal("stopped");
        })

        it(`subplebbit.clients.plebbitRpcClients states are correct if fetching a sub with plebbit address`, async () => {
            const sub = await plebbit.createSubplebbit({address: signers[0].address});
            const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
            const recordedStates = [];
            const expectedStates = ["fetching-ipns", "fetching-ipfs", "stopped"];

            sub.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => 
                recordedStates.push(newState)
            );


            await sub.update();

            await new Promise(resolve => sub.once("update", resolve));

            expect(recordedStates).to.deep.equal(expectedStates);

            await sub.stop();

        })

        it(`subplebbit.clients.plebbitRpcClients states are correct if fetching a sub with ENS address`, async () => {

            const sub = await plebbit.createSubplebbit({address: "plebbit.eth"});
            const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
            const recordedStates = [];
            const expectedStates = ["resolving-subplebbit-address","fetching-ipns", "fetching-ipfs", "stopped"];

            sub.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => 
                recordedStates.push(newState)
            );


            await sub.update();

            await new Promise(resolve => sub.once("update", resolve));

            expect(recordedStates).to.deep.equal(expectedStates);

            await sub.stop();
        })
    })

    describe(`subplebbit.posts.clients`, async () => {
        //prettier-ignore
        if (!isRpcFlagOn())
        describe(`subplebbit.posts.clients.ipfsClients`, async () => {
            it(`subplebbit.posts.clients.ipfsClients is undefined for gateway plebbit`, async () => {
                const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
                expect(mockSub.posts.clients.ipfsClients).to.be.undefined;
            });

            it(`subplebbit.posts.clients.ipfsClients[sortType][url] is stopped by default`, async () => {
                const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
                const ipfsUrl = Object.keys(mockSub.clients.ipfsClients)[0];
                // add tests here
                expect(Object.keys(mockSub.posts.clients.ipfsClients["new"]).length).to.equal(1);
                expect(mockSub.posts.clients.ipfsClients["new"][ipfsUrl].state).to.equal("stopped");
            });

            it(`Correct state of 'new' sort is updated after fetching from subplebbit.posts.pageCids.new`, async () => {
                const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
                const ipfsUrl = Object.keys(mockSub.clients.ipfsClients)[0];

                const expectedStates = ["fetching-ipfs", "stopped"];
                const actualStates = [];
                mockSub.posts.clients.ipfsClients["new"][ipfsUrl].on("statechange", (newState) => {
                    actualStates.push(newState);
                });

                await mockSub.posts.getPage(mockSub.posts.pageCids.new);
                expect(actualStates).to.deep.equal(expectedStates);
            });

            it("Correct state of 'new' sort is updated after fetching second page of 'new' pages", async () => {
                const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
                const ipfsUrl = Object.keys(mockSub.clients.ipfsClients)[0];

                const expectedStates = ["fetching-ipfs", "stopped", "fetching-ipfs", "stopped"];
                const actualStates = [];
                mockSub.posts.clients.ipfsClients["new"][ipfsUrl].on("statechange", (newState) => {
                    actualStates.push(newState);
                });

                const newFirstPage = await mockSub.posts.getPage(mockSub.posts.pageCids.new);
                expect(newFirstPage.nextCid).to.be.a("string");
                await mockSub.posts.getPage(newFirstPage.nextCid);

                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`Correct state of 'new' sort is updated after fetching with a subplebbit created with plebbit.createSubplebbit({address, pageCids})`, async () => {
                const remotePlebbit = await mockRemotePlebbit();
                const mockSub = await remotePlebbit.getSubplebbit(subplebbitAddress);
                const fetchSub = await remotePlebbit.createSubplebbit({
                    address: subplebbitAddress,
                    posts: { pageCids: mockSub.posts.pageCids }
                });
                expect(fetchSub.updatedAt).to.be.undefined;

                const ipfsUrl = Object.keys(fetchSub.clients.ipfsClients)[0];

                const expectedStates = ["fetching-ipfs", "stopped"];
                const actualStates = [];
                fetchSub.posts.clients.ipfsClients["new"][ipfsUrl].on("statechange", (newState) => {
                    actualStates.push(newState);
                });

                await fetchSub.posts.getPage(fetchSub.posts.pageCids.new);
                expect(actualStates).to.deep.equal(expectedStates);
            });

            it(`Original subplebbit instances, as well as recreated instances receive statechange event`, async () => {
                const remotePlebbit = await mockRemotePlebbit();

                const sub = await remotePlebbit.createSubplebbit({ address: signers[0].address });
                sub.update();
                await new Promise((resolve, reject) => {
                    sub.once("update", async () => {
                        const pageCid = sub.posts.pageCids["new"];

                        const sub2 = await remotePlebbit.createSubplebbit({ address: sub.address });
                        const expectedStates = ["fetching-ipfs", "stopped"];
                        const ipfsUrl = Object.keys(sub.clients.ipfsClients)[0];

                        for (const subToTest of [sub, sub2]) {
                            const actualStates = [];
                            subToTest.posts.clients.ipfsClients["new"][ipfsUrl].on("statechange", (newState) =>
                                actualStates.push(newState)
                            );
                            await subToTest.posts.getPage(pageCid);
                            if (JSON.stringify(actualStates) !== JSON.stringify(expectedStates))
                                reject("Sub failed to update to subplebbit.posts.clients.ipfsClients");
                        }
                        resolve();
                    });
                });
                await sub.stop();
            });
        });

        //prettier-ignore
        if (!isRpcFlagOn())
        describe(`subplebbit.posts.clients.ipfsGateways`, async () => {
            it(`subplebbit.posts.clients.ipfsGateways[sortType][url] is stopped by default`, async () => {
                const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
                const gatewayUrl = Object.keys(mockSub.clients.ipfsGateways)[0];
                // add tests here
                expect(Object.keys(mockSub.posts.clients.ipfsGateways["new"]).length).to.equal(1);
                expect(mockSub.posts.clients.ipfsGateways["new"][gatewayUrl].state).to.equal("stopped");
            });

            it(`Correct state of 'new' sort is updated after fetching from subplebbit.posts.pageCids.new`, async () => {
                const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
                const gatewayUrl = Object.keys(mockSub.clients.ipfsGateways)[0];

                const expectedStates = ["fetching-ipfs", "stopped"];
                const actualStates = [];
                mockSub.posts.clients.ipfsGateways["new"][gatewayUrl].on("statechange", (newState) => {
                    actualStates.push(newState);
                });

                await mockSub.posts.getPage(mockSub.posts.pageCids.new);
                expect(actualStates).to.deep.equal(expectedStates);
            });
        });

        //prettier-ignore
        if (isRpcFlagOn())
        describe(`subplebbit.posts.clients.plebbitRpcClients`, async () => {
            it(`subplebbit.posts.clients.ipfsGateways[sortType][url] is stopped by default`, async () => {
                const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
                const rpcUrl = Object.keys(mockSub.clients.plebbitRpcClients)[0];
                // add tests here
                expect(Object.keys(mockSub.posts.clients.plebbitRpcClients["new"]).length).to.equal(1);
                expect(mockSub.posts.clients.plebbitRpcClients["new"][rpcUrl].state).to.equal("stopped");
            });

            it(`Correct state of 'new' sort is updated after fetching from subplebbit.posts.pageCids.new`, async () => {
                const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
                const rpcUrl = Object.keys(mockSub.clients.plebbitRpcClients)[0];

                const expectedStates = ["fetching-ipfs", "stopped"];
                const actualStates = [];
                mockSub.posts.clients.plebbitRpcClients["new"][rpcUrl].on("statechange", (newState) => {
                    actualStates.push(newState);
                });

                await mockSub.posts.getPage(mockSub.posts.pageCids.new);
                expect(actualStates).to.deep.equal(expectedStates);
            });
        })
    });
});
