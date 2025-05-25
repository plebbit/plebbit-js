import { expect } from "chai";
import signers from "../../fixtures/signers.js";

import {
    publishRandomPost,
    mockRemotePlebbit,
    mockGatewayPlebbit,
    itSkipIfRpc,
    mockPlebbitNoDataPathWithOnlyKuboClient,
    publishSubplebbitRecordWithExtraProp,
    mockPlebbitToReturnSpecificSubplebbit,
    resolveWhenConditionIsTrue,
    describeSkipIfRpc
} from "../../../dist/node/test/test-util.js";

describeSkipIfRpc(`subplebbit.updatingState (node/browser - remote sub)`, async () => {
    it(`subplebbit.updatingState defaults to stopped`, async () => {
        const plebbit = await mockRemotePlebbit();
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        expect(subplebbit.updatingState).to.equal("stopped");
        await plebbit.destroy();
    });

    it(`subplebbit.updatingState is in correct order upon updating with IPFS client (non-ENS) and plebbit.createSubplebbit()`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const subplebbit = await plebbit.createSubplebbit({ address: signers[0].address });
        const recordedStates = [];
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "succeeded", "stopped"];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.update();
        await updatePromise;
        await subplebbit.stop();
        await plebbit.destroy();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });

    it(`subplebbit.updatingState is in correct order upon updating with IPFS client (non-ENS) and plebbit.getSubplebbit()`, async () => {
        const plebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const subplebbit = await plebbit.getSubplebbit(signers[0].address);
        const oldUpdatedAt = Number(subplebbit.updatedAt);
        const recordedStates = [];
        const expectedStates = ["fetching-ipns", "fetching-ipfs", "succeeded", "stopped"];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await publishRandomPost(subplebbit.address, plebbit);
        await subplebbit.update();
        await resolveWhenConditionIsTrue(subplebbit, () => Number(subplebbit.updatedAt) > oldUpdatedAt);
        await subplebbit.stop();
        await plebbit.destroy();
        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });

    it(`subplebbit.updatingState is in correct order upon updating  with IPFS client (ENS)`, async () => {
        const kuboPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();
        const subplebbit = await kuboPlebbit.createSubplebbit({ address: "plebbit.eth" });
        const recordedStates = [];
        const expectedStates = ["resolving-address", "fetching-ipns", "fetching-ipfs", "succeeded", "stopped"];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.update();
        expect(subplebbit.state).to.equal("updating");

        await updatePromise;
        await updatePromise;
        await subplebbit.stop();
        await kuboPlebbit.destroy();
        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
    });

    itSkipIfRpc(`updating states is in correct order upon updating with gateway`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();

        const subplebbit = await gatewayPlebbit.createSubplebbit({ address: signers[0].address });

        const expectedStates = ["fetching-ipns", "succeeded", "stopped"];
        const recordedStates = [];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));

        await subplebbit.update();

        await updatePromise;
        await subplebbit.stop();
        await gatewayPlebbit.destroy();

        expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
        await gatewayPlebbit.destroy();
    });

    itSkipIfRpc("updating states is in correct order upon updating with gateway, if the sub doesn't publish any updates", async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();

        const newSub = await publishSubplebbitRecordWithExtraProp({});

        const subplebbit = await gatewayPlebbit.createSubplebbit({ address: newSub.subplebbitRecord.address });

        const recordedStates = [];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.update();

        await updatePromise;
        await new Promise((resolve) => setTimeout(resolve, gatewayPlebbit.updateInterval * 5));
        await subplebbit.stop();
        await gatewayPlebbit.destroy();

        const expectedFirstUpdateStates = ["fetching-ipns", "succeeded"];

        expect(recordedStates.slice(0, expectedFirstUpdateStates.length)).to.deep.equal(expectedFirstUpdateStates);

        expect(recordedStates[recordedStates.length - 1]).to.equal("stopped");
        const noNewUpdateStates = recordedStates.slice(expectedFirstUpdateStates.length, recordedStates.length - 1); // should be just 'fetching-ipns' and 'succeeded

        expect(noNewUpdateStates.length).to.be.greaterThan(0);
        // Check that every pair of states is ["fetching-ipns", "waiting-retry"]
        for (let i = 0; i < noNewUpdateStates.length; i += 2) {
            expect(noNewUpdateStates[i]).to.equal("fetching-ipns");
            expect(noNewUpdateStates[i + 1]).to.equal("waiting-retry");
        }
    });
    itSkipIfRpc("updating states is in correct order upon updating with ipfs p2p, if the sub doesn't publish any updates", async () => {
        const kuboPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();

        const newSub = await publishSubplebbitRecordWithExtraProp({});

        const subplebbit = await kuboPlebbit.createSubplebbit({ address: newSub.subplebbitRecord.address });

        const recordedStates = [];
        subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

        const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
        await subplebbit.update();

        await updatePromise;
        await new Promise((resolve) => setTimeout(resolve, kuboPlebbit.updateInterval * 5));
        await subplebbit.stop();
        await kuboPlebbit.destroy();

        const expectedFirstUpdateStates = ["fetching-ipns", "fetching-ipfs", "succeeded"];

        expect(recordedStates.slice(0, expectedFirstUpdateStates.length)).to.deep.equal(expectedFirstUpdateStates);

        expect(recordedStates[recordedStates.length - 1]).to.equal("stopped");
        const noNewUpdateStates = recordedStates.slice(expectedFirstUpdateStates.length, recordedStates.length - 1); // should be just 'fetching-ipns' and 'succeeded
        expect(noNewUpdateStates.length).to.be.greaterThan(0);

        // Check that every pair of states is ["fetching-ipns", "waiting-retry"]
        for (let i = 0; i < noNewUpdateStates.length; i += 2) {
            expect(noNewUpdateStates[i]).to.equal("fetching-ipns");
            expect(noNewUpdateStates[i + 1]).to.equal("waiting-retry");
        }
    });

    it(`updatingState is correct when we attempt to update a subplebbit with invalid record, if we're updating with an ipfs client`, async () => {
        const kuboPlebbit = await mockPlebbitNoDataPathWithOnlyKuboClient();

        // Create a subplebbit with a valid address
        const subplebbit = await kuboPlebbit.createSubplebbit({ address: signers[0].address });

        // Mock the subplebbit to return an invalid record
        const invalidSubplebbitRecord = { address: subplebbit.address }; // Missing required fields will fail validation

        const recordedUpdatingStates = [];
        const errors = [];

        subplebbit.on("updatingstatechange", (newState) => recordedUpdatingStates.push(newState));
        subplebbit.on("error", (err) => errors.push(err));

        // First update should succeed with the initial valid record
        await subplebbit.update();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number"); // wait until the subplebbit is updated

        const errorPromise = new Promise((resolve) => subplebbit.once("error", resolve));
        await mockPlebbitToReturnSpecificSubplebbit(kuboPlebbit, subplebbit.address, invalidSubplebbitRecord);

        await errorPromise;

        await subplebbit.stop();

        // Expected states for initial update and then the invalid update attempt
        const expectedUpdatingStates = [
            "fetching-ipns",
            "fetching-ipfs",
            "succeeded",
            "fetching-ipns",
            "fetching-ipfs",
            "failed",
            "stopped"
        ];

        expect(recordedUpdatingStates).to.deep.equal(expectedUpdatingStates);
        expect(errors.length).to.equal(1);
        expect(errors[0].code).to.equal("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA");
        await kuboPlebbit.destroy();
    });

    it(`updatingState is correct when we attempt to update a subplebbit with invalid record, if we're updating with an ipfs gateways`, async () => {
        const gatewayPlebbit = await mockGatewayPlebbit();

        // Create a subplebbit with a valid address
        const subplebbit = await gatewayPlebbit.createSubplebbit({ address: signers[0].address });

        // Mock the subplebbit to return an invalid record
        const invalidSubplebbitRecord = { address: "1234.eth" }; // This will fail validation

        const recordedUpdatingStates = [];
        const errors = [];

        subplebbit.on("updatingstatechange", (newState) => recordedUpdatingStates.push(newState));
        subplebbit.on("error", (err) => errors.push(err));

        // First update should succeed with the initial valid record
        await subplebbit.update();
        await resolveWhenConditionIsTrue(subplebbit, () => typeof subplebbit.updatedAt === "number"); // wait until the subplebbit is updated

        const errorPromise = new Promise((resolve) => subplebbit.once("error", resolve));
        await mockPlebbitToReturnSpecificSubplebbit(gatewayPlebbit, subplebbit.address, invalidSubplebbitRecord);

        await errorPromise;

        await subplebbit.stop();

        // Expected states for initial update and then the invalid update attempt
        const expectedUpdatingStates = ["fetching-ipns", "succeeded", "fetching-ipns", "failed", "stopped"];

        expect(recordedUpdatingStates).to.deep.equal(expectedUpdatingStates);
        expect(errors.length).to.equal(1);
        expect(errors[0].code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
        expect(errors[0].details.gatewayToError["http://localhost:18080"].code).to.equal("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA");
        await gatewayPlebbit.destroy();
    });
});
