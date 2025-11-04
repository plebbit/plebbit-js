import { expect } from "chai";
import signers from "../../fixtures/signers.js";

import {
    publishRandomPost,
    publishSubplebbitRecordWithExtraProp,
    mockPlebbitToReturnSpecificSubplebbit,
    createNewIpns,
    resolveWhenConditionIsTrue,
    getAvailablePlebbitConfigsToTestAgainst
} from "../../../dist/node/test/test-util.js";

getAvailablePlebbitConfigsToTestAgainst({ includeOnlyTheseTests: ["remote-kubo-rpc", "remote-libp2pjs"] }).map((config) => {
    describe(`subplebbit.updatingState (node/browser - remote sub) - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });
        after(async () => {
            await plebbit.destroy();
        });
        it(`subplebbit.updatingState is in correct order upon updating with IPFS client and plebbit.createSubplebbit() `, async () => {
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

        it(`subplebbit.updatingState is in correct order upon updating with IPFS client and plebbit.getSubplebbit() with subplebbit address not an ENS`, async () => {
            const subplebbit = await plebbit.getSubplebbit(signers[0].address);
            const oldUpdatedAt = Number(subplebbit.updatedAt);
            const recordedStates = [];
            const expectedStates = ["fetching-ipns", "fetching-ipfs", "succeeded", "stopped"];
            subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

            await publishRandomPost(subplebbit.address, plebbit);
            await subplebbit.update();
            await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => Number(subplebbit.updatedAt) > oldUpdatedAt });
            await subplebbit.stop();
            expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
        });

        it(`subplebbit.updatingState is in correct order upon updating with IPFS client and subplebbit address is an ENS`, async () => {
            const subplebbit = await plebbit.createSubplebbit({ address: "plebbit.eth" });
            const recordedStates = [];
            const expectedStates = ["resolving-address", "fetching-ipns", "fetching-ipfs", "succeeded", "stopped"];
            subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

            const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
            await subplebbit.update();
            expect(subplebbit.state).to.equal("updating");

            await updatePromise;
            await updatePromise;
            await subplebbit.stop();
            expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
        });

        it("updating states is in correct order upon updating with ipfs p2p, if the sub doesn't publish any updates", async () => {
            const newSub = await publishSubplebbitRecordWithExtraProp({});

            const subplebbit = await plebbit.createSubplebbit({ address: newSub.subplebbitRecord.address });

            const recordedStates = [];
            subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

            const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
            await subplebbit.update();

            await updatePromise;
            await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval * 5));
            await subplebbit.stop();

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
            // Create a subplebbit with a valid address
            const subplebbit = await plebbit.createSubplebbit({ address: signers[0].address });

            // Mock the subplebbit to return an invalid record
            const invalidSubplebbitRecord = { address: subplebbit.address }; // Missing required fields will fail validation

            const recordedUpdatingStates = [];
            const errors = [];

            subplebbit.on("updatingstatechange", (newState) => recordedUpdatingStates.push(newState));
            subplebbit.on("error", (err) => errors.push(err));

            // First update should succeed with the initial valid record
            await subplebbit.update();
            await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" }); // wait until the subplebbit is updated

            const errorPromise = new Promise((resolve) => subplebbit.once("error", resolve));
            await mockPlebbitToReturnSpecificSubplebbit(plebbit, subplebbit.address, invalidSubplebbitRecord);

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
        });
    });
});

getAvailablePlebbitConfigsToTestAgainst().map((config) => {
    describe(`subplebbit.updatingState (node/browser - remote sub) - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });
        after(async () => {
            await plebbit.destroy();
        });

        it(`subplebbit.updatingState defaults to stopped after plebbit.createSubplebbit()`, async () => {
            const subplebbit = await plebbit.createSubplebbit({ address: signers[0].address });
            expect(subplebbit.updatingState).to.equal("stopped");
        });

        it(`subplebbit.updatingState defaults to stopped after plebbit.getSubplebbit()`, async () => {
            const subplebbit = await plebbit.getSubplebbit(signers[0].address);
            expect(subplebbit.updatingState).to.equal("stopped");
        });

        it(`the order of state-event-statechange is correct when we get a new update from the subplebbit`, async () => {
            const subplebbit = await plebbit.createSubplebbit({ address: signers[0].address });

            const recordedStates = [];
            subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

            const updatePromise = new Promise((resolve, reject) =>
                subplebbit.once("update", () => {
                    if (subplebbit.updatingState !== "succeeded") reject("if it emits update, updatingState should succeed");
                    if (recordedStates.length === 0) reject("if it emits update, updatingStatechange should have been emitted");
                    if (recordedStates[recordedStates.length - 1] === "succeeded")
                        reject("if it emits update, updatingStatechange not emit yet");
                    resolve();
                })
            );
            await subplebbit.update();

            await updatePromise;

            await subplebbit.stop();
        });

        it(`the order of state-event-statechange is correct when we fail to load subplebbit with critical error`, async () => {
            // Mock the subplebbit to return an invalid record

            const twoMbObject = { testString: "x".repeat(2 * 1024 * 1024) }; //2mb

            const ipnsObj = await createNewIpns();

            await ipnsObj.publishToIpns(JSON.stringify(twoMbObject));

            const recordedUpdatingStates = [];
            const errors = [];

            // when error is emitted, updatingState should be set to failed
            // but it should not emit updatingstatechange event

            const subplebbit = await plebbit.createSubplebbit({ address: ipnsObj.signer.address });
            subplebbit.on("updatingstatechange", (newState) => recordedUpdatingStates.push(newState));
            subplebbit.on("error", (err) => errors.push(err));

            // First update should succeed with the initial valid record
            await subplebbit.update();

            const errorPromise = new Promise((resolve, reject) =>
                subplebbit.once("error", (err) => {
                    if (subplebbit.updatingState !== "failed") reject("if it emits error, updatingState should be failed");
                    if (recordedUpdatingStates.length === 0) reject("if it emits error, updatingStatechange should have been emitted");
                    if (recordedUpdatingStates[recordedUpdatingStates.length - 1] === "failed")
                        reject("if it emits error, updatingStatechange not emit yet");
                    resolve();
                })
            );

            await errorPromise;

            await subplebbit.stop();
            await ipnsObj.plebbit.destroy();
        });
    });
});

getAvailablePlebbitConfigsToTestAgainst({ includeOnlyTheseTests: ["remote-ipfs-gateway"] }).map((config) => {
    describe(`subplebbit.updatingState (node/browser - remote sub) - ${config.name}`, async () => {
        let plebbit;
        before(async () => {
            plebbit = await config.plebbitInstancePromise();
        });
        after(async () => {
            await plebbit.destroy();
        });
        it(`updating states is in correct order upon updating with gateway`, async () => {
            const subplebbit = await plebbit.createSubplebbit({ address: signers[0].address });

            const expectedStates = ["fetching-ipns", "succeeded", "stopped"];
            const recordedStates = [];
            subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

            const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));

            await subplebbit.update();

            await updatePromise;
            await subplebbit.stop();

            expect(recordedStates.slice(recordedStates.length - expectedStates.length)).to.deep.equal(expectedStates);
        });

        it("updating states is in correct order upon updating with gateway, if the sub doesn't publish any updates", async () => {
            const newSub = await publishSubplebbitRecordWithExtraProp({});

            const subplebbit = await plebbit.createSubplebbit({ address: newSub.subplebbitRecord.address });

            const recordedStates = [];
            subplebbit.on("updatingstatechange", (newState) => recordedStates.push(newState));

            const updatePromise = new Promise((resolve) => subplebbit.once("update", resolve));
            await subplebbit.update();

            await updatePromise;
            await new Promise((resolve) => setTimeout(resolve, plebbit.updateInterval * 5));
            await subplebbit.stop();

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

        it(`updatingState is correct when we attempt to update a subplebbit with invalid record, if we're updating with an ipfs gateways`, async () => {
            // Create a subplebbit with a valid address
            const subplebbit = await plebbit.createSubplebbit({ address: signers[0].address });

            // Mock the subplebbit to return an invalid record
            const invalidSubplebbitRecord = { address: "1234.eth" }; // This will fail validation

            const recordedUpdatingStates = [];
            const errors = [];

            subplebbit.on("updatingstatechange", (newState) => recordedUpdatingStates.push(newState));
            subplebbit.on("error", (err) => errors.push(err));

            // First update should succeed with the initial valid record
            await subplebbit.update();
            await resolveWhenConditionIsTrue({ toUpdate: subplebbit, predicate: () => typeof subplebbit.updatedAt === "number" }); // wait until the subplebbit is updated

            const errorPromise = new Promise((resolve) => subplebbit.once("error", resolve));
            await mockPlebbitToReturnSpecificSubplebbit(plebbit, subplebbit.address, invalidSubplebbitRecord);

            await errorPromise;

            await subplebbit.stop();

            expect(recordedUpdatingStates[0]).to.equal("fetching-ipns");
            expect(recordedUpdatingStates[1]).to.equal("succeeded");
            expect(recordedUpdatingStates.slice(recordedUpdatingStates.length - 2, recordedUpdatingStates.length)).to.deep.equal([
                "failed",
                "stopped"
            ]);
            expect(errors.length).to.equal(1);
            expect(errors[0].code).to.equal("ERR_FAILED_TO_FETCH_SUBPLEBBIT_FROM_GATEWAYS");
            expect(errors[0].details.gatewayToError["http://localhost:18080"].code).to.equal("ERR_INVALID_SUBPLEBBIT_IPFS_SCHEMA");
        });
    });
});
