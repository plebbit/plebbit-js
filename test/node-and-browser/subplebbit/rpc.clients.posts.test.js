import { describeIfRpc, mockPlebbit } from "../../../dist/node/test/test-util";

describeIfRpc(`subplebbit.posts.clients.plebbitRpcClients`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbit();
    });
    it(`subplebbit.posts.clients.plebbitRpcClients[sortType][url] is stopped by default`, async () => {
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
});