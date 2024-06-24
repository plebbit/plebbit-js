import signers from "../../fixtures/signers.js";

import { describeIfRpc } from "../../../dist/node/test/test-util.js";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describeIfRpc(`subplebbit.clients.plebbitRpcClients (remote sub)`, async () => {
    it(`subplebbit.clients.plebbitRpcClients[rpcUrl] is stopped by default`, async () => {
        const sub = await plebbit.createSubplebbit({ address: signers[0].address });
        const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
        expect(sub.clients.plebbitRpcClients[rpcUrl].state).to.equal("stopped");
    });

    it(`subplebbit.clients.plebbitRpcClients states are correct if fetching a sub with plebbit address`, async () => {
        const sub = await plebbit.createSubplebbit({ address: signers[0].address });
        const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
        const recordedStates = [];
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "stopped"];

        sub.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => recordedStates.push(newState));

        await sub.update();

        await new Promise((resolve) => sub.once("update", resolve));

        expect(recordedStates).to.deep.equal(expectedStates);

        await sub.stop();
    });

    it(`subplebbit.clients.plebbitRpcClients states are correct if fetching a sub with ENS address`, async () => {
        const sub = await plebbit.createSubplebbit({ address: "plebbit.eth" });
        const rpcUrl = Object.keys(plebbit.clients.plebbitRpcClients)[0];
        const recordedStates = [];
        const expectedStates = ["resolving-subplebbit-address", "fetching-ipns", "fetching-ipfs", "stopped"];

        sub.clients.plebbitRpcClients[rpcUrl].on("statechange", (newState) => recordedStates.push(newState));

        await sub.update();

        await new Promise((resolve) => sub.once("update", resolve));

        await sub.stop();
        expect(recordedStates).to.deep.equal(expectedStates);
    });
});
