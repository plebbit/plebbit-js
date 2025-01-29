import signers from "../../fixtures/signers.js";

import {
    publishRandomPost,
    describeSkipIfRpc,
    mockGatewayPlebbit,
    mockPlebbit,
    mockRemotePlebbitIpfsOnly,
    waitTillPostInSubplebbitPages
} from "../../../dist/node/test/test-util.js";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`subplebbit.clients.ipfsClients`, async () => {
    let gatewayPlebbit, plebbit, remotePlebbit;

    before(async () => {
        gatewayPlebbit = await mockGatewayPlebbit();
        plebbit = await mockPlebbit();
        remotePlebbit = await mockRemotePlebbitIpfsOnly();
    });
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

        const updatePromise = new Promise((resolve) => sub.once("update", resolve));
        await sub.update();
        await updatePromise;
        await sub.stop();

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of ipfsClients state when updating a subplebbit that was created with plebbit.getSubplebbit(address)`, async () => {
        const sub = await remotePlebbit.getSubplebbit(signers[0].address);
        const post = await publishRandomPost(sub.address, plebbit);
        await waitTillPostInSubplebbitPages(post, plebbit);
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "stopped"];

        const actualStates = [];

        const ipfsUrl = Object.keys(sub.clients.ipfsClients)[0];

        sub.clients.ipfsClients[ipfsUrl].on("statechange", (newState) => actualStates.push(newState));

        const updatePromise = new Promise((resolve) => sub.once("update", resolve));
        await sub.update();
        await updatePromise;
        await sub.stop();

        expect(actualStates.slice(0, expectedStates.length)).to.deep.equal(expectedStates);
    });

    it(`Correct order of ipfs clients state when we update a subplebbit and it's not publishing new subplebbit records`, async () => {
        const customPlebbit = await mockRemotePlebbitIpfsOnly();

        const sub = await customPlebbit.createSubplebbit({ address: signers[0].address });

        const recordedStates = [];
        const ipfsUrl = Object.keys(sub.clients.ipfsClients)[0];
        sub.clients.ipfsClients[ipfsUrl].on("statechange", (newState) => recordedStates.push(newState));

        // now plebbit._updatingSubplebbits will be defined

        const updatePromise = new Promise((resolve) => sub.once("update", resolve));
        await sub.update();
        await updatePromise;

        const updatingSubInstance = customPlebbit._updatingSubplebbits[sub.address];

        updatingSubInstance._clientsManager.resolveIpnsToCidP2P = () => sub.updateCid; // stop it from loading new IPNS

        await new Promise((resolve) => setTimeout(resolve, customPlebbit.updateInterval * 4));

        await sub.stop();

        const expectedFirstStates = ["fetching-ipns", "fetching-ipfs", "stopped"]; // for first update

        expect(recordedStates.slice(0, expectedFirstStates.length)).to.deep.equal(expectedFirstStates);

        const noNewUpdateStates = recordedStates.slice(expectedFirstStates.length, recordedStates.length); // should be just 'fetching-ipns' and 'succeeded

        // the rest should be just ["fetching-ipns", "stopped"]
        // because it can't find a new record
        for (let i = 0; i < noNewUpdateStates.length; i += 2) {
            expect(noNewUpdateStates[i]).to.equal("fetching-ipns");
            expect(noNewUpdateStates[i + 1]).to.equal("stopped");
        }
    });
});
