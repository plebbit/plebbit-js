import { describeSkipIfRpc, mockGatewayPlebbit } from "../../../dist/node/test/test-util";

import signers from "../fixtures/signers.js";

import { describeSkipIfRpc } from "../../../dist/node/test/test-util.js";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`subplebbit.posts.clients.ipfsGateways`, async () => {
    let gatewayPlebbit;
    before(async () => {
        gatewayPlebbit = await mockGatewayPlebbit();
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
