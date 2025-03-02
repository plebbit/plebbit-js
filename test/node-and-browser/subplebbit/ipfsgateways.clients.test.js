import signers from "../../fixtures/signers.js";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import { describeSkipIfRpc, publishRandomPost, mockGatewayPlebbit, mockPlebbit } from "../../../dist/node/test/test-util.js";

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`subplebbit.clients.ipfsGateways`, async () => {
    // All tests below use Plebbit instance that doesn't have clients.kuboRpcClients
    let gatewayPlebbit, plebbit;

    before(async () => {
        gatewayPlebbit = await mockGatewayPlebbit();
        plebbit = await mockPlebbit();
    });

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
        await publishRandomPost(sub.address, plebbit);

        const expectedStates = ["fetching-ipns", "stopped"];

        const actualStates = [];

        const gatewayUrl = Object.keys(sub.clients.ipfsGateways)[0];

        sub.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => actualStates.push(newState));

        sub.update();
        await new Promise((resolve) => sub.once("update", resolve));
        await sub.stop();

        expect(actualStates.slice(0, 2)).to.deep.equal(expectedStates);
    });

    it(`Correct order of ipfs gateway state when we update a subplebbit and it's not publishing new subplebbit records`, async () => {
        const customPlebbit = await mockGatewayPlebbit();

        const sub = await customPlebbit.createSubplebbit({ address: signers[0].address });

        const recordedStates = [];
        const gatewayUrl = Object.keys(sub.clients.ipfsGateways)[0];
        sub.clients.ipfsGateways[gatewayUrl].on("statechange", (newState) => recordedStates.push(newState));

        // now plebbit._updatingSubplebbits will be defined

        const updatePromise = new Promise((resolve) => sub.once("update", resolve));
        await sub.update();
        await updatePromise;

        const updatingSubInstance = customPlebbit._updatingSubplebbits[sub.address];

        updatingSubInstance._clientsManager.resolveIpnsToCidP2P = () => sub.updateCid; // stop it from loading new IPNS

        await new Promise((resolve) => setTimeout(resolve, customPlebbit.updateInterval * 4));

        await sub.stop();

        // should be just ["fetching-ipns", "stopped"]
        // because it can't find a new record
        for (let i = 0; i < recordedStates.length; i += 2) {
            expect(recordedStates[i]).to.equal("fetching-ipns");
            expect(recordedStates[i + 1]).to.equal("stopped");
        }
    });

    it(`Correct order of ipfs gateway states when we update a subplebbit with invalid record`);
});
