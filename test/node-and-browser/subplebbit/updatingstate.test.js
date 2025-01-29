import signers from "../../fixtures/signers.js";

import {
    publishRandomPost,
    mockRemotePlebbit,
    mockGatewayPlebbit,
    itSkipIfRpc,
    mockRemotePlebbitIpfsOnly,
    publishSubplebbitRecordWithExtraProp
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

    it(`subplebbit.updatingState is in correct order upon updating with IPFS client (non-ENS) and plebbit.createSubplebbit()`, async () => {
        const plebbit = await mockRemotePlebbitIpfsOnly();
        const subplebbit = await plebbit.createSubplebbit({ address: signers[0].address });
        const recordedStates = [];
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "succeeded", "stopped"];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.update();
        await updatePromise;
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });

    it(`subplebbit.updatingState is in correct order upon updating with IPFS client (non-ENS) and plebbit.getSubplebbit()`, async () => {
        const plebbit = await mockRemotePlebbitIpfsOnly();
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        const recordedStates = [];
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "succeeded", "stopped"];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.update();

        const updatePromiseAfterPublishing = new Promise((resolve) => subplebbit.once("update", resolve));
        await publishRandomPost(subplebbit.address, plebbit); // To force trigger an update
        await updatePromiseAfterPublishing;
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

        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        await publishRandomPost(subplebbit.address, plebbit); // To force trigger an update
        await updatePromise;
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

        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        await publishRandomPost(subplebbit.address, gatewayPlebbit); // To force trigger an update
        await updatePromise;
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });

    itSkipIfRpc("updating states is in correct order upon updating with gateway, if the sub doesn't publish any updates", async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();

        const newSub = await publishSubplebbitRecordWithExtraProp({});

        const subplebbit = await gatewayPlebbit.createSubplebbit({ address: newSub.subplebbitRecord.address });

        const expectedStates = ["fetching-ipns", "succeeded", "stopped"];
        const recordedStates = [];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.update();

        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));

        await updatePromise;
        await new Promise((resolve) => setTimeout(resolve, gatewayPlebbit.updateInterval * 5));
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });
    itSkipIfRpc("updating states is in correct order upon updating with ipfs p2p, if the sub doesn't publish any updates", async () => {
        const gatewayPlebbit = await mockRemotePlebbitIpfsOnly();

        const newSub = await publishSubplebbitRecordWithExtraProp({});

        const subplebbit = await gatewayPlebbit.createSubplebbit({ address: newSub.subplebbitRecord.address });

        const expectedStates = ["fetching-ipns", "succeeded", "stopped"];
        const recordedStates = [];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.update();

        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));

        await updatePromise;
        await new Promise((resolve) => setTimeout(resolve, gatewayPlebbit.updateInterval * 5));
        await subplebbit.stop();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });
});
