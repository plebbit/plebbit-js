import signers from "../fixtures/signers.js";

import { publishRandomPost, describeSkipIfRpc } from "../../../dist/node/test/test-util.js";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

const subplebbitAddress = signers[0].address;

describeSkipIfRpc(`subplebbit.clients.ipfsClients`, async () => {
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

        sub.update();
        await new Promise((resolve) => sub.once("update", resolve));
        await sub.stop();

        expect(actualStates).to.deep.equal(expectedStates);
    });

    it(`Correct order of ipfsClients state when updating a subplebbit that was created with plebbit.getSubplebbit(address)`, async () => {
        const sub = await remotePlebbit.getSubplebbit(signers[0].address);
        await publishRandomPost(sub.address, plebbit, {}, false);
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "stopped"];

        const actualStates = [];

        const ipfsUrl = Object.keys(sub.clients.ipfsClients)[0];

        sub.clients.ipfsClients[ipfsUrl].on("statechange", (newState) => actualStates.push(newState));

        sub.update();
        await new Promise((resolve) => sub.once("update", resolve));
        await sub.stop();

        expect(actualStates.slice(0, 3)).to.deep.equal(expectedStates);
    });
});
