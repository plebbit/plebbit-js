import { beforeAll, afterAll } from "vitest";
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
    beforeAll(async () => {
        plebbit = await mockPlebbit();
        subplebbit = await createSubWithNoChallenge({}, plebbit);
    });

    afterAll(async () => {
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

        await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => subplebbit.updatedAt });
        await resolveWhenConditionIsTrue({
            toUpdate: subplebbit,
            predicate: () => recordedStates.length === 2,
            eventName: "startedstatechange"
        });
        expect(recordedStates).to.deep.equal(expectedStates);
    });

    itSkipIfRpc(`subplebbit.startedState = failed if a failure occurs`, async () => {
        const originalFunction = subplebbit._getDbInternalState.bind(subplebbit);
        subplebbit._getDbInternalState = async () => {
            throw Error("Failed to load sub from db ");
        };
        await publishRandomPost(subplebbit.address, plebbit);
        await resolveWhenConditionIsTrue({
            toUpdate: subplebbit,
            predicate: () => subplebbit.startedState === "failed",
            eventName: "startedstatechange"
        });
        expect(subplebbit.startedState).to.equal("failed");
        subplebbit._getDbInternalState = originalFunction;
    });
});
