import { expect } from "chai";
import signers from "../../fixtures/signers.js";

import {
    publishRandomPost,
    describeSkipIfRpc,
    mockGatewayPlebbit,
    mockPlebbitToReturnSpecificSubplebbit,
    mockPlebbitNoDataPathWithOnlyKuboClient
} from "../../../dist/node/test/test-util.js";

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`subplebbit.clients.kuboRpcClients`, async () => {
    let plebbit;

    before(async () => {
        plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
    });
    it(`subplebbit.clients.kuboRpcClients is undefined for gateway plebbit`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();
        const mockSub = await gatewayPlebbit.getSubplebbit(subplebbitAddress);
        expect(mockSub.clients.kuboRpcClients).to.be.undefined;
    });

    it(`subplebbit.clients.kuboRpcClients[url] is stopped by default`, async () => {
        const mockSub = await plebbit.getSubplebbit(subplebbitAddress);
        expect(Object.keys(mockSub.clients.kuboRpcClients).length).to.equal(1);
        expect(Object.values(mockSub.clients.kuboRpcClients)[0].state).to.equal("stopped");
    });

    it(`Correct order of kuboRpcClients state when updating a sub that was created with plebbit.createSubplebbit({address})`, async () => {
        const sub = await plebbit.createSubplebbit({ address: signers[0].address });

        const expectedStates = ["fetching-ipns", "fetching-ipfs", "stopped"];

        const actualStates = [];

        const kuboRpcUrl = Object.keys(sub.clients.kuboRpcClients)[0];

        sub.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (newState) => actualStates.push(newState));

        const updatePromise = new Promise((resolve) => sub.once("update", resolve));
        await sub.update();
        await updatePromise;
        await sub.stop();

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of kuboRpcClients state when updating a subplebbit that was created with plebbit.getSubplebbit(address)`, async () => {
        const sub = await plebbit.getSubplebbit(signers[0].address);
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "stopped"];

        const actualStates = [];

        const kuboRpcUrl = Object.keys(sub.clients.kuboRpcClients)[0];

        sub.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (newState) => actualStates.push(newState));

        const updatePromise = new Promise((resolve) => sub.once("update", resolve));
        await sub.update();
        await publishRandomPost(sub.address, plebbit); // force an update
        await updatePromise;
        await sub.stop();

        expect(actualStates.slice(0, expectedStates.length)).to.deep.equal(expectedStates);
    });

    it(`Correct order of ipfs clients state when we update a subplebbit and it's not publishing new subplebbit records`, async () => {
        const customPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();

        const sub = await customPlebbit.createSubplebbit({ address: signers[0].address });

        const recordedStates = [];
        const kuboRpcUrl = Object.keys(sub.clients.kuboRpcClients)[0];
        sub.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (newState) => recordedStates.push(newState));

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

    it(`Correct order of kubo rpc client states when we attempt to update a subplebbit with invalid record`, async () => {
        const customPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();

        // Create a subplebbit with a valid address
        const sub = await customPlebbit.createSubplebbit({ address: signers[0].address });

        const recordedStates = [];
        const kuboRpcUrl = Object.keys(sub.clients.kuboRpcClients)[0];
        sub.clients.kuboRpcClients[kuboRpcUrl].on("statechange", (newState) => recordedStates.push(newState));

        // First update should succeed with the initial valid record
        const updatePromise = new Promise((resolve) => sub.once("update", resolve));
        await sub.update();
        await updatePromise;

        // Mock the subplebbit to return an invalid record
        const invalidSubplebbitRecord = { address: sub.address }; // Missing required fields will fail validation

        const errorPromise = new Promise((resolve) => sub.once("error", resolve));
        await mockPlebbitToReturnSpecificSubplebbit(customPlebbit, sub.address, invalidSubplebbitRecord);

        await errorPromise;
        await sub.stop();

        // Expected states for initial update and then the invalid update attempt, then checking if there's a new update
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "stopped", "fetching-ipns", "fetching-ipfs", "stopped"];

        expect(recordedStates).to.deep.equal(expectedStates);
    });
});
