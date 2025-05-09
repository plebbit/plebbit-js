import { expect } from "chai";
import {
    mockPlebbit,
    publishRandomPost,
    createSubWithNoChallenge,
    itSkipIfRpc,
    itIfRpc,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";

describe(`subplebbit.updatingState from a local subplebbit`, async () => {
    let plebbit;
    beforeEach(async () => {
        plebbit = await mockPlebbit();
    });

    afterEach(async () => {
        await plebbit.destroy();
    });

    it(`subplebbit.updatingState defaults to stopped`, async () => {
        const createdSubplebbit = await plebbit.createSubplebbit();
        await createdSubplebbit.start();
        await resolveWhenConditionIsTrue(createdSubplebbit, () => typeof createdSubplebbit.updatedAt === "number");
        const subplebbit = await plebbit.getSubplebbit(createdSubplebbit.address);
        expect(subplebbit.updatingState).to.equal("stopped");
    });

    itSkipIfRpc(`subplebbit.updatingState emits 'succceeded' when a new update from local sub is retrieved`, async () => {
        const startedSubplebbit = await createSubWithNoChallenge({}, plebbit);
        await startedSubplebbit.start();
        await resolveWhenConditionIsTrue(startedSubplebbit, () => typeof startedSubplebbit.updatedAt === "number");

        const localUpdatingSub = await plebbit.createSubplebbit({ address: startedSubplebbit.address });
        const expectedStates = ["publishing-ipns", "succeeded", "stopped"];
        const recordedStates = [];

        localUpdatingSub.on("updatingstatechange", (newState) => recordedStates.push(newState));

        await localUpdatingSub.update();
        const updatePromise = new Promise((resolve) => localUpdatingSub.once("update", resolve));

        await publishRandomPost(localUpdatingSub.address, plebbit);
        await updatePromise;
        await localUpdatingSub.stop();
        await startedSubplebbit.delete();
        expect(recordedStates).to.deep.equal(expectedStates);
    });

    itIfRpc(`localSubplebbit.updatingState is copied from startedState if we're updating a local sub via rpc`, async () => {
        const startedSub = await createSubWithNoChallenge({}, plebbit);

        const updatingSub = await plebbit.createSubplebbit({ address: startedSub.address });

        const startedInstanceStartedStates = [];
        startedSub.on("startedstatechange", () => startedInstanceStartedStates.push(startedSub.startedState));

        const updatingSubUpdatingStates = [];
        updatingSub.on("updatingstatechange", () => updatingSubUpdatingStates.push(updatingSub.updatingState));

        const updates = [];
        updatingSub.on("update", () => updates.push(updates.length));
        await startedSub.start();

        await resolveWhenConditionIsTrue(startedSub, () => startedSub.updatedAt);

        await updatingSub.update();

        await publishRandomPost(startedSub.address, plebbit); // to trigger an update
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await publishRandomPost(startedSub.address, plebbit);

        await resolveWhenConditionIsTrue(updatingSub, () => updates.length >= 2);
        await startedSub.delete();

        expect(updatingSubUpdatingStates).to.deep.equal(
            startedInstanceStartedStates.splice(startedInstanceStartedStates.length - updatingSubUpdatingStates.length)
        );
    });
});
