import signers from "../../fixtures/signers.js";

import { mockRemotePlebbit, describeSkipIfRpc, mockGatewayPlebbit, mockRemotePlebbitIpfsOnly } from "../../../dist/node/test/test-util.js";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`subplebbit.posts.clients.ipfsClients`, async () => {
    let gatewayPlebbit, plebbit;

    before(async () => {
        gatewayPlebbit = await mockGatewayPlebbit();
        plebbit = await mockRemotePlebbitIpfsOnly();
    });

    it(`subplebbit.posts.clients.ipfsClients is undefined for gateway plebbit`, async () => {
        const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
        expect(Object.keys(mockSub.posts.clients.ipfsClients)).to.deep.equal([
            "hot",
            "new",
            "active",
            "topHour",
            "topDay",
            "topWeek",
            "topMonth",
            "topYear",
            "topAll",
            "controversialHour",
            "controversialDay",
            "controversialWeek",
            "controversialMonth",
            "controversialYear",
            "controversialAll"
        ]);
        for (const sortType of Object.keys(mockSub.posts.clients.ipfsClients))
            expect(mockSub.posts.clients.ipfsClients[sortType]).to.deep.equal({});
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
                    subToTest.posts.clients.ipfsClients["new"][ipfsUrl].on("statechange", (newState) => actualStates.push(newState));
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
