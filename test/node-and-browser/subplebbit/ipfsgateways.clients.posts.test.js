import { expect } from "chai";
import { describeSkipIfRpc, mockGatewayPlebbit, addStringToIpfs } from "../../../dist/node/test/test-util.js";

import signers from "../../fixtures/signers.js";

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`subplebbit.posts.clients.ipfsGateways`, async () => {
    let gatewayPlebbit;
    before(async () => {
        gatewayPlebbit = await mockGatewayPlebbit();
    });

    after(async () => {
        await gatewayPlebbit.destroy();
    });

    it(`subplebbit.posts.clients.ipfsGateways[sortType][url] is stopped by default`, async () => {
        const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
        const gatewayUrl = Object.keys(mockSub.clients.ipfsGateways)[0];
        // add tests here
        expect(Object.keys(mockSub.posts.clients.ipfsGateways["new"]).length).to.equal(1);
        expect(mockSub.posts.clients.ipfsGateways["new"][gatewayUrl].state).to.equal("stopped");
    });

    it(`Correct state of 'new' sort is updated after fetching from subplebbit.posts.pageCids.new`, async () => {
        const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
        const firstPageMocked = {
            comments: mockSub.posts.pages.hot.comments.slice(0, 10).map((comment) => comment.pageComment)
        };
        const firstPageMockedCid = await addStringToIpfs(JSON.stringify(firstPageMocked));
        mockSub.posts.pageCids.new = firstPageMockedCid;

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
