import { expect } from "chai";
import signers from "../../../fixtures/signers.js";

import {
    mockRemotePlebbit,
    describeSkipIfRpc,
    mockGatewayPlebbit,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    addStringToIpfs
} from "../../../../dist/node/test/test-util.js";

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`subplebbit.posts.clients.kuboRpcClients`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    });

    after(async () => {
        await plebbit.destroy();
    });

    it(`subplebbit.posts.clients.kuboRpcClients is undefined for gateway plebbit`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();
        const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
        const sortTypes = Object.keys(mockSub.posts.clients.kuboRpcClients);
        expect(sortTypes.length).to.be.greaterThan(0);
        for (const sortType of sortTypes) expect(mockSub.posts.clients.kuboRpcClients[sortType]).to.deep.equal({});
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
        const firstPageMocked = {
            comments: mockSub.posts.pages.hot.comments.slice(0, 10).map((comment) => comment.raw)
        };

        const firstPageMockedCid = await addStringToIpfs(JSON.stringify(firstPageMocked));

        mockSub.posts.pageCids.new = firstPageMockedCid;

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

        const secondPageMocked = { comments: mockSub.posts.pages.hot.comments.slice(1, 5).map((comment) => comment.raw) }; // create a slightly different page
        const secondPageCid = await addStringToIpfs(JSON.stringify(secondPageMocked));

        const firstPageMocked = {
            comments: mockSub.posts.pages.hot.comments.slice(0, 10).map((comment) => comment.raw),
            nextCid: secondPageCid
        };

        const firstPageMockedCid = await addStringToIpfs(JSON.stringify(firstPageMocked));

        mockSub.posts.pageCids.new = firstPageMockedCid;

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

        const firstPageMocked = {
            comments: mockSub.posts.pages.hot.comments.slice(0, 10).map((comment) => comment.raw)
        };

        const firstPageMockedCid = await addStringToIpfs(JSON.stringify(firstPageMocked));

        const fetchSub = await remotePlebbit.createSubplebbit({
            address: subplebbitAddress,
            posts: { pageCids: { ...mockSub.posts.pageCids, new: firstPageMockedCid } }
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
        await remotePlebbit.destroy();
    });
});
