import signers from "../../fixtures/signers.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import { describeSkipIfRpc, publishRandomPost } from "../../../dist/node/test/test-util.js";

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`subplebbit.clients.ipfsGateways`, async () => {
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
