import signers from "../../fixtures/signers.js";

import {
    publishRandomPost,
    mockRemotePlebbit,
    mockGatewayPlebbit,
    itSkipIfRpc,
    mockRemotePlebbitIpfsOnly,
    waitTillPostInSubplebbitPages
} from "../../../dist/node/test/test-util.js";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe(`subplebbit.updatingState (node/browser - remote sub)`, async () => {
    it(`subplebbit.updatingState defaults to stopped`, async () => {
        const plebbit = await mockRemotePlebbit();
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        expect(subplebbit.updatingState).to.equal("stopped");
    });

    it(`subplebbit.updatingState is in correct order upon updating with IPFS client (non-ENS)`, async () => {
        const plebbit = await mockRemotePlebbitIpfsOnly();
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        const recordedStates = [];
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "succeeded", "stopped"];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.update();

        publishRandomPost(subplebbit.address, plebbit, {}); // To force trigger an update
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });

    it(`subplebbit.updatingState is in correct order upon updating  with IPFS client (ENS)`, async () => {
        const plebbit = await mockRemotePlebbitIpfsOnly();
        const subplebbit = await plebbit.createSubplebbit({ address: "plebbit.eth" });
        const recordedStates = [];
        const expectedStates = ["resolving-address", "fetching-ipns", "fetching-ipfs", "succeeded", "stopped"];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.update();

        publishRandomPost(subplebbit.address, plebbit, {}); // To force trigger an update
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });

    itSkipIfRpc(`updating states is in correct order upon updating with gateway`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();

        const subplebbit = await gatewayPlebbit.getSubplebbit(signers[0].address);

        const expectedStates = ["fetching-ipns", "succeeded", "stopped"];
        const recordedStates = [];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.update();

        publishRandomPost(subplebbit.address, gatewayPlebbit, {}); // To force trigger an update
        await new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });
});
