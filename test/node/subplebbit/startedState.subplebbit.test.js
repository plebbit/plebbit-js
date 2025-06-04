import { expect } from "chai";
import {
    mockPlebbit,
    publishRandomPost,
    createSubWithNoChallenge,
    itSkipIfRpc,
    resolveWhenConditionIsTrue
} from "../../../dist/node/test/test-util.js";

describe(`subplebbit.startedState`, async () => {
    let plebbit, subplebbit;
    before(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
    });

    after(async () => {
        await subplebbit.delete();
        await plebbit.destroy();
    });

    it(`subplebbit.startedState defaults to stopped`, async () => {
        expect(subplebbit.startedState).to.equal("stopped");
    });

    it(`subplebbit.startedState is in correct order up to publishing a new IPNS`, async () => {
        const expectedStates = ["publishing-ipns", "succeeded"];
        const recordedStates = [];
        subplebbit.on("startedstatechange", (newState) => recordedStates.push(newState));

        await subplebbit.start();

        await new Promise((resolve) => subplebbit.once("update", resolve));
        if (!subplebbit.updatedAt) await new Promise((resolve) => subplebbit.once("update", resolve));
        expect(recordedStates).to.deep.equal(expectedStates);
    });

    itSkipIfRpc(`subplebbit.startedState = failed if a failure occurs`, async () => {
        const originalFunction = subplebbit._getDbInternalState.bind(subplebbit);
        subplebbit._getDbInternalState = async () => {
            throw Error("Failed to load sub from db ");
        };
        await publishRandomPost(subplebbit.address, plebbit);
        await resolveWhenConditionIsTrue(subplebbit, () => subplebbit.startedState === "failed", "startedstatechange");
        expect(subplebbit.startedState).to.equal("failed");
        subplebbit._getDbInternalState = originalFunction;
    });
});
