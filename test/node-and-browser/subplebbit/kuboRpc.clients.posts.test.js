import signers from "../../fixtures/signers.js";

import { mockRemotePlebbit, describeSkipIfRpc, mockGatewayPlebbit, mockPlebbit } from "../../../dist/node/test/test-util.js";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`subplebbit.posts.clients.kuboRpcClients`, async () => {
    let gatewayPlebbit, plebbit;

    before(async () => {
        gatewayPlebbit = await mockGatewayPlebbit();
        plebbit = await mockPlebbit();
    });

    it(`subplebbit.posts.clients.kuboRpcClients is undefined for gateway plebbit`, async () => {
        const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
        expect(Object.keys(mockSub.posts.clients.kuboRpcClients)).to.deep.equal([
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
        for (const sortType of Object.keys(mockSub.posts.clients.kuboRpcClients))
            expect(mockSub.posts.clients.kuboRpcClients[sortType]).to.deep.equal({});
    });

    it(`subplebbit.posts.clients.kuboRpcClients[sortType][url] is stopped by default`, async () => {
        const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
        const kuboUrl = Object.keys(mockSub.clients.kuboRpcClients)[0];
        // add tests here
        expect(Object.keys(mockSub.posts.clients.kuboRpcClients["new"]).length).to.equal(1);
        expect(mockSub.posts.clients.kuboRpcClients["new"][kuboUrl].state).to.equal("stopped");
    });

    it(`Correct state of 'new' sort is updated after fetching from subplebbit.posts.pageCids.new`, async () => {
        const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
        const kuboUrl = Object.keys(mockSub.clients.kuboRpcClients)[0];

        const expectedStates = ["fetching-ipfs", "stopped"];
        const actualStates = [];
        mockSub.posts.clients.kuboRpcClients["new"][kuboUrl].on("statechange", (newState) => {
            actualStates.push(newState);
        });

        await mockSub.posts.getPage(mockSub.posts.pageCids.new);
        expect(actualStates).to.deep.equal(expectedStates);
    });

    it("Correct state of 'new' sort is updated after fetching second page of 'new' pages", async () => {
        const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
        const kuboUrl = Object.keys(mockSub.clients.kuboRpcClients)[0];

        const expectedStates = ["fetching-ipfs", "stopped", "fetching-ipfs", "stopped"];
        const actualStates = [];
        mockSub.posts.clients.kuboRpcClients["new"][kuboUrl].on("statechange", (newState) => {
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

        const kuboRpcUrl = Object.keys(fetchSub.clients.kuboRpcClients)[0];

        const expectedStates = ["fetching-ipfs", "stopped"];
        const actualStates = [];
        fetchSub.posts.clients.kuboRpcClients["new"][kuboRpcUrl].on("statechange", (newState) => {
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
                const kuboRpcURl = Object.keys(sub.clients.kuboRpcClients)[0];

                for (const subToTest of [sub, sub2]) {
                    const actualStates = [];
                    subToTest.posts.clients.kuboRpcClients["new"][kuboRpcURl].on("statechange", (newState) => actualStates.push(newState));
                    await subToTest.posts.getPage(pageCid);
                    if (JSON.stringify(actualStates) !== JSON.stringify(expectedStates))
                        reject("Sub failed to update to subplebbit.posts.clients.kuboRpcClients");
                }
                resolve();
            });
        });
        await sub.stop();
    });
});
